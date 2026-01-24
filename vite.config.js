import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/markets': {
        target: 'https://gamma-api.polymarket.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => '/markets?closed=false&limit=50&order=volume24hr&ascending=false'
      },
      '/api/commodities': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/stocks': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/weather': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
