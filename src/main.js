import { createApp } from 'vue'
import App from './App.vue'

// 创建Vue应用
const app = createApp(App)

// 挂载到DOM
app.mount('#app')

// 通知页面Vue已挂载
window.dispatchEvent(new Event('vue-mounted'))
console.log('🎯 ZenFlow AI 智能冥想系统已启动 - 音频功能已启用')
