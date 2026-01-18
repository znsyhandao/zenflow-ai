import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/main.css'

// 创建Vue应用
const app = createApp(App)

// 挂载到DOM
app.mount('#app')

console.log('🎵 眠小兔AI冥想系统已启动 - 音频功能已启用')