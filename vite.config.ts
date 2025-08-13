import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Force all Vite operations to Linux filesystem to avoid Windows disk space issues
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    fs: {
      strict: false,
      allow: ['..']
    },
    watch: {
      usePolling: true,
      interval: 1000
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
  }
})