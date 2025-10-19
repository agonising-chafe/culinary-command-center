import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

// Place at: client/vite.config.js
export default {
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5174,
    open: true
    // proxy: {
    //   '/api': 'http://localhost:3000' // adjust if your server runs elsewhere
    // }
  }
}
