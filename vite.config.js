import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to production Vercel deployment in dev mode
      // This allows Polymarket API to work locally
      '/api': {
        target: 'https://autopilot-alpha.vercel.app',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
