import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

const alias = {
  '@renderer': resolve(__dirname, 'src/renderer/src'),
  '@carplay/web': resolve(__dirname, 'src/renderer/components/web/CarplayWeb.ts'),
  '@carplay/messages': resolve(__dirname, 'src/main/carplay/messages'),
  '@carplay': resolve(__dirname, 'src/main/carplay'),
  stream: 'stream-browserify',
  Buffer: 'buffer'
};

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias
    }
  },
  renderer: {
    publicDir: 'src/renderer/public',
    resolve: {
      alias
    },
    optimizeDeps: {
      exclude: ['audio.worklet.js'],
      esbuildOptions: {
        define: { global: 'globalThis' },
        plugins: [
          NodeGlobalsPolyfillPlugin({ process: true, buffer: true })
        ]
      }
    },
    plugins: [react()],
    server: {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-site'
      }
    },
    worker: {
      format: 'es',
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]'
        }
      }
    }
  }
});
