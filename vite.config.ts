import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { tmpdir } from 'os'

// Enhanced config for WSL environment
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    fs: {
      strict: false
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      cache: false
    }
  },
  cacheDir: resolve(tmpdir(), 'vite'),
  optimizeDeps: {
    force: true
  },
  esbuild: {
    target: 'node14'
  }
})