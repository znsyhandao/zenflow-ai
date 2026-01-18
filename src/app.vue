<template>
  <div id="app" class="min-h-screen bg-gray-900 text-white">
    <!-- 主容器 -->
    <div class="container mx-auto px-4 py-6 max-w-6xl">
      <!-- 导航栏 -->
      <nav class="flex justify-between items-center mb-8 p-4 bg-gray-800 rounded-2xl">
        <div class="flex items-center space-x-2">
          <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span class="text-2xl">🧠</span>
          </div>
          <h1 class="text-xl font-bold">ZenFlow AI</h1>
        </div>
        
        <div class="flex items-center space-x-4">
          <button @click="toggleDarkMode" class="p-2 rounded-lg hover:bg-gray-700">
            <i class="fas fa-moon"></i>
          </button>
          <button @click="showSettings = true" class="p-2 rounded-lg hover:bg-gray-700">
            <i class="fas fa-cog"></i>
          </button>
        </div>
      </nav>
      
      <!-- 主要内容 -->
      <main class="mb-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      
      <!-- 底部导航 -->
      <div class="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div class="flex justify-around py-3">
          <router-link 
            v-for="tab in tabs" 
            :key="tab.path"
            :to="tab.path"
            class="flex flex-col items-center p-2 rounded-lg transition-colors"
            :class="{
              'text-indigo-400': $route.path === tab.path,
              'text-gray-400 hover:text-gray-300': $route.path !== tab.path
            }"
          >
            <i :class="tab.icon" class="text-xl mb-1"></i>
            <span class="text-xs">{{ tab.name }}</span>
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- 全局音频播放器 -->
    <audio-player v-if="isPlaying" />
    
    <!-- 设置面板 -->
    <settings-panel v-if="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AudioPlayer from './components/AudioPlayer.vue'
import SettingsPanel from './components/SettingsPanel.vue'

const route = useRoute()
const showSettings = ref(false)
const darkMode = ref(true)

const tabs = [
  { name: '冥想', path: '/', icon: 'fas fa-spa' },
  { name: '睡眠', path: '/sleep', icon: 'fas fa-moon' },
  { name: '专注', path: '/focus', icon: 'fas fa-bullseye' },
  { name: '数据', path: '/stats', icon: 'fas fa-chart-line' }
]

const isPlaying = computed(() => {
  // 这里应该连接音频状态管理
  return false
})

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  document.documentElement.classList.toggle('dark-theme', darkMode.value)
  document.documentElement.classList.toggle('light-theme', !darkMode.value)
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1e293b;
}

::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>