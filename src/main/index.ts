
import usb from 'usb'
import { app, shell, BrowserWindow, session, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, is } from '@electron-toolkit/utils'
import { DEFAULT_CONFIG } from '@carplay/node'
import { Socket } from './Socket'
import * as fs from 'fs'
import { ExtraConfig, KeyBindings } from './Globals'

let mainWindow: BrowserWindow
const appPath = app.getPath('userData')
const configPath = `${appPath}/config.json`
let config: ExtraConfig
//let socket: Socket

// Default bindings and config
const DEFAULT_BINDINGS: KeyBindings = {
  left: 'ArrowLeft', right: 'ArrowRight', selectDown: 'Space', back: 'Backspace',
  down: 'ArrowDown', home: 'KeyH', play: 'KeyP', pause: 'KeyO', next: 'KeyM', prev: 'KeyN'
}
const EXTRA_CONFIG: ExtraConfig = {
  ...DEFAULT_CONFIG,
  kiosk: true,
  camera: '',
  microphone: '',
  nightMode: true,
  bindings: DEFAULT_BINDINGS
}

// Initialize config
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(EXTRA_CONFIG, null, 2))
}
config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
if (Object.keys(config).sort().join(',') !== Object.keys(EXTRA_CONFIG).sort().join(',')) {
  config = { ...EXTRA_CONFIG, ...config }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}
new Socket(config, saveSettings)

// USB reset
async function forceUsbReset(): Promise<boolean> {
  const devices = usb.getDeviceList()
  const dongle = devices.find(d =>
    d.deviceDescriptor.idVendor  === 0x1314 &&
    [0x1520, 0x1521].includes(d.deviceDescriptor.idProduct)
  )
  if (!dongle) return false
  try {
    dongle.open()
    await new Promise<void>((res, rej) =>
      dongle.reset(err => err ? rej(err) : res())
    )
    dongle.close()
    return true
  } catch {
    return false
  }
}

// Create main window
function createWindow(): void {
  mainWindow = new BrowserWindow({
  width: config.width,
  height: config.height,
  kiosk: false,
  useContentSize: true,
  frame: false,
  autoHideMenuBar: true,
  backgroundColor: '#000000',
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
    sandbox: false,
    nodeIntegration: true,
    nodeIntegrationInWorker: true,
    contextIsolation: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
  },
});

const ses = mainWindow.webContents.session;

// DEV: COEP/COOP/CRP headers
if (is.dev) {
  ses.webRequest.onHeadersReceived(
    { urls: ['<all_urls>'] },
    (details, callback) => {
      if (details.url.includes('/audio.worklet.js')) {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            'Cross-Origin-Embedder-Policy': ['require-corp'],
            'Cross-Origin-Opener-Policy': ['same-origin'],
            'Cross-Origin-Resource-Policy': ['same-site'],
          },
        });
      } else {
        callback({ responseHeaders: details.responseHeaders });
      }
    }
  );
}

// Permission handlers
  ses.setPermissionCheckHandler((_webContents, permission) => ['usb', 'hid', 'media', 'display-capture'].includes(permission))
  ses.setPermissionRequestHandler((_webContents, permission, cb) => cb(['usb', 'hid', 'media', 'display-capture'].includes(permission)))
  ses.setDevicePermissionHandler(details => details.device.vendorId === 4884)
  ses.on('select-usb-device', (ev, details, cb) => {
    ev.preventDefault()
    const sel = details.deviceList.find(d => d.vendorId === 4884 && [5408, 5409].includes(d.productId))
    cb(sel?.deviceId)
  })
  ses.setUSBProtectedClassesHandler(({ protectedClasses }) =>
    protectedClasses.filter(c => ['audio', 'video', 'vendor-specific'].includes(c))
  )

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    if (config?.kiosk) mainWindow.setKiosk(true)
    if (is.dev) mainWindow.webContents.openDevTools({ mode: 'detach' })
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Load renderer
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}


// App lifecycle
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron.carplay')

  // Global Security Headers (fallback for all sessions)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Cross-Origin-Opener-Policy':   ['same-origin'],
        'Cross-Origin-Embedder-Policy': ['require-corp'],
        'Cross-Origin-Resource-Policy': ['same-site'],
      }
    })
  })

  // IPC handlers
  ipcMain.handle('usb-force-reset', () => forceUsbReset())
  ipcMain.handle('quit', () => quit())

  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })

// Save settings
function saveSettings(settings: ExtraConfig) {
  fs.writeFileSync(configPath,
    JSON.stringify({
      ...settings,
      width: +settings.width,
      height: +settings.height,
      fps: +settings.fps,
      dpi: +settings.dpi,
      format: +settings.format,
      iBoxVersion: +settings.iBoxVersion,
      phoneWorkMode: +settings.phoneWorkMode,
      packetMax: +settings.packetMax,
      mediaDelay: +settings.mediaDelay,
    }, null, 2)
  )
}

// Quit
function quit() {
  app.quit()
}
