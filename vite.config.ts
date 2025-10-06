import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ fastRefresh: false })], // برای مشکل CSP هم خوبه
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8086', // آدرس API واقعی
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api/, ''),
        headers: {
          // اگر لازم داری هدر Origin خاصی ست بشه:
          // 'Origin': 'http://localhost:5173'
        }
      }
    }
  }
})