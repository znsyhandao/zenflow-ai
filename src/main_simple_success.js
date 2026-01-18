import { createApp, h } from 'vue'

console.log('🚀 Vue应用正在启动...');

const App = {
  data() {
    return {
      title: '🧠 AI冥想系统',
      status: '已就绪',
      features: [
        '智能冥想引导',
        '脑波监测',
        '个性化推荐',
        '进度跟踪'
      ]
    }
  },
  
  mounted() {
    console.log('✅ Vue应用挂载成功！');
    console.log('应用容器:', this.$el);
  },
  
  methods: {
    getCurrentTime() {
      return new Date().toLocaleTimeString('zh-CN');
    }
  },
  
  render() {
    // 创建一个带有明确样式的div
    return h('div', {
      style: {
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        margin: '0 auto',
        color: '#333',
        fontFamily: "'Microsoft YaHei', Arial, sans-serif"
      }
    }, [
      // 标题
      h('h1', {
        style: {
          color: '#4F46E5',
          fontSize: '2.5em',
          marginBottom: '20px',
          textAlign: 'center'
        }
      }, this.title),
      
      // 状态
      h('div', {
        style: {
          padding: '10px 20px',
          backgroundColor: '#D1FAE5',
          color: '#065F46',
          borderRadius: '10px',
          marginBottom: '30px',
          display: 'inline-block'
        }
      }, `系统状态: ${this.status}`),
      
      // 特性列表
      h('h2', {
        style: {
          color: '#555',
          marginBottom: '15px'
        }
      }, '主要功能:'),
      
      h('ul', this.features.map(feature => 
        h('li', {
          style: {
            margin: '10px 0',
            padding: '10px',
            backgroundColor: '#F3F4F6',
            borderRadius: '8px',
            listStyle: 'none'
          }
        }, `✨ ${feature}`)
      )),
      
      // 当前时间
      h('div', {
        style: {
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '2px solid #EEE',
          color: '#666'
        }
      }, `当前时间: ${this.getCurrentTime()}`),
      
      // 调试信息
      h('div', {
        style: {
          marginTop: '20px',
          fontSize: '0.9em',
          color: '#999'
        }
      }, 'Vue 3.5.26 | 渲染正常')
    ]);
  }
}

// 创建并挂载应用
try {
  const app = createApp(App);
  app.mount('#app');
  console.log('🎉 应用创建完成');
} catch (error) {
  console.error('❌ 应用创建失败:', error);
}