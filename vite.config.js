// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',  // Netlify 不需要子路径
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'audio': ['howler'],
          'charts': ['chart.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
