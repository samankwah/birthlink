import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Optimized Vite config for Windows development
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: false,
    open: false,
    fs: {
      strict: false,
      allow: ['..']
    },
    watch: {
      usePolling: true,
      interval: 1000
    },
    hmr: {
      port: undefined,
      host: 'localhost'
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
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      target: 'es2020'
    }
  },
  esbuild: {
    target: 'es2020'
  },
  clearScreen: false
})