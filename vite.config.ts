import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // three.js is lazy-loaded in its own chunk; its size is expected
  build: { chunkSizeWarningLimit: 1200 },
})
