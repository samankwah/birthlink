import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simplified config for development due to disk space constraints
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  }
})