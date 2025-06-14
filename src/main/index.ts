import { app, shell, BrowserWindow, session, ipcMain, protocol } from 'electron';
import { join, extname } from 'path';
import { existsSync, createReadStream, readFileSync, writeFileSync } from 'fs';
import { electronApp, is } from '@electron-toolkit/utils';
import { DEFAULT_CONFIG } from '@carplay/node';

import { Socket } from './Socket';
import { ExtraConfig, KeyBindings } from './Globals';
import { USBService } from './usb/USBService';
import { CarplayService } from './carplay/CarplayService';

const mimeTypeFromExt = (ext: string): string =>
  ({
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.png': 'image/png',  '.jpg': 'image/jpeg',      '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml', '.json': 'application/json',
    '.wasm': 'application/wasm', '.map': 'application/json'
  }[ext.toLowerCase()] ?? 'application/octet-stream');

const MIN_WIDTH = 400;

function applyAspectRatio(win: BrowserWindow, width: number, height: number): void {
  if (!win) return;

  const ratio = width && height ? width / height : 0;

  const [winW, winH]         = win.getSize();
  const [contentW, contentH] = win.getContentSize();
  const extraWidth  = Math.max(0, winW - contentW);
  const extraHeight = Math.max(0, winH - contentH);

  win.setAspectRatio(ratio, { width: extraWidth, height: extraHeight });

  if (ratio > 0) {
    const minH = Math.round(MIN_WIDTH / ratio);
    win.setMinimumSize(MIN_WIDTH + extraWidth, minH + extraHeight);
  } else {
    win.setMinimumSize(0, 0);
  }
}

// Globals
let mainWindow: BrowserWindow | null;
let socket: Socket;
let config: ExtraConfig;
let usbService: USBService;
let isQuitting = false;

const carplayService = new CarplayService();
(global as any).carplayService = carplayService;

// macOS
if (process.platform === 'darwin') {
  app.on('before-quit', async (e) => {
    if (isQuitting) return;
    isQuitting = true;
    e.preventDefault();
    try {
      await carplayService.stop().catch(console.warn);
      usbService?.stop();
      await new Promise(r => setTimeout(r, 100));
    } finally {
      app.exit(0);
    }
  });
}

app.on('will-quit', () => usbService?.stop());

// Protocol & Config
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, corsEnabled: true, supportFetchAPI: true, stream: true } }
]);

const appPath   = app.getPath('userData');
const configPath = join(appPath, 'config.json');

const DEFAULT_BINDINGS: KeyBindings = {
  left: 'ArrowLeft', right: 'ArrowRight', selectDown: 'Space', back: 'Backspace',
  down: 'ArrowDown', home: 'KeyH', play: 'KeyP', pause: 'KeyO', next: 'KeyM', prev: 'KeyN'
};

const EXTRA_CONFIG: ExtraConfig = {
  ...DEFAULT_CONFIG,
  kiosk: true, camera: '', microphone: '', nightMode: true,
  audioVolume: 1.0, navVolume: 0.5, bindings: DEFAULT_BINDINGS
};

if (!existsSync(configPath)) writeFileSync(configPath, JSON.stringify(EXTRA_CONFIG, null, 2));
config = JSON.parse(readFileSync(configPath, 'utf8')) as ExtraConfig;
if (Object.keys(config).sort().join(',') !== Object.keys(EXTRA_CONFIG).sort().join(',')) {
  config = { ...EXTRA_CONFIG, ...config };
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// Window
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.height,
    frame: !config.kiosk,
    useContentSize: true,
    kiosk: false,
    autoHideMenuBar: true,
    backgroundColor: '#000',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  const ses = mainWindow.webContents.session;
  ses.setPermissionCheckHandler((_w,p) => ['usb','hid','media','display-capture'].includes(p));
  ses.setPermissionRequestHandler((_w,p,cb) => cb(['usb','hid','media','display-capture'].includes(p)));
  ses.setUSBProtectedClassesHandler(({protectedClasses}) => protectedClasses.filter(c => ['audio','video','vendor-specific'].includes(c)));

  session.defaultSession.webRequest.onHeadersReceived({ urls: ['*://*/*', 'file://*/*'] }, (d,cb) => cb({
    responseHeaders: {
      ...d.responseHeaders,
      'Cross-Origin-Opener-Policy': ['same-origin'],
      'Cross-Origin-Embedder-Policy': ['require-corp'],
      'Cross-Origin-Resource-Policy': ['same-site']
    }
  }));

  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) return;
    mainWindow.show();

    if (config.kiosk) {
      mainWindow.setKiosk(true);
      applyAspectRatio(mainWindow, 0, 0);
    } else {
      mainWindow.setContentSize(config.width, config.height, false);
      applyAspectRatio(mainWindow, config.width, config.height);
    }

    if (is.dev) mainWindow.webContents.openDevTools({ mode: 'detach' });
    carplayService.attachRenderer(mainWindow.webContents);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  else mainWindow.loadURL('app://index.html');

  // macOS hide
  mainWindow.on('close', (e) => { if (process.platform==='darwin'&&!isQuitting){ e.preventDefault(); mainWindow?.hide(); }});
}

// App‑Lifecycle
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron.carplay');

  protocol.registerStreamProtocol('app', (request, cb) => {
    try {
      const u = new URL(request.url);
      let path = decodeURIComponent(u.pathname);
      if (path==='/'||path==='') path = '/index.html';
      const file = join(__dirname, '../renderer', path);
      if (!existsSync(file)) return cb({ statusCode: 404 });
      cb({
        statusCode: 200,
        headers: {
          'Content-Type': mimeTypeFromExt(extname(file)),
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp',
          'Cross-Origin-Resource-Policy': 'same-site'
        },
        data: createReadStream(file)
      });
    } catch (e) {
      console.error('[app-protocol] error', e);
      cb({ statusCode: 500 });
    }
  });

  usbService = new USBService(carplayService);
  socket      = new Socket(config, saveSettings);

  ipcMain.handle('quit', () => process.platform==='darwin' ? mainWindow?.hide() : app.quit());

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length===0 && !mainWindow) createWindow();
    else mainWindow?.show();
  });
});

app.on('window-all-closed', () => { if (process.platform!=='darwin') app.quit(); });

// Settings IPC
function saveSettings(settings: ExtraConfig) {
  writeFileSync(configPath, JSON.stringify({
    ...settings,
    width:        +settings.width,
    height:       +settings.height,
    fps:          +settings.fps,
    dpi:          +settings.dpi,
    format:       +settings.format,
    iBoxVersion:  +settings.iBoxVersion,
    phoneWorkMode:+settings.phoneWorkMode,
    packetMax:    +settings.packetMax,
    mediaDelay:   +settings.mediaDelay
  }, null, 2));

  socket.config = settings;
  socket.sendSettings();

  if (!mainWindow) return;

  if (settings.kiosk) {
    mainWindow.setKiosk(true);
    applyAspectRatio(mainWindow, 0, 0);
  } else {
    mainWindow.setKiosk(false);
    mainWindow.setContentSize(settings.width, settings.height, false);
    applyAspectRatio(mainWindow, settings.width, settings.height);
  }
}
