// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: '智能冥想 - MindFlow AI',
        short_name: '智能冥想',
        description: 'AI智能冥想助手',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          {
            src: '/img/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/img/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  
  // 移动端优化配置
  server: {
    host: '0.0.0.0', // 允许手机访问
    port: 3000,
    open: true,
    cors: true
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 移动端优化
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue'],
          utils: ['lodash', 'dayjs']
        }
      }
    }
  },
  
  // 基础路径（重要！）
  base: './',
})