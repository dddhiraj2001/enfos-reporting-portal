import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The override lets the root launcher use isolated ports while keeping local defaults simple.
const apiProxy = {
  '/api': process.env.API_PROXY_TARGET ?? 'http://localhost:8080',
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:5173/',
      },
    },
    setupFiles: './src/test/setupTests.js',
  },
})
