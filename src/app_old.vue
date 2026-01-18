<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <nav class="navbar">
      <div class="nav-brand">
        <div class="brand-logo">🧘‍♂️</div>
        <div class="brand-text">
          <h1>ZenFlow AI</h1>
          <p>智能冥想系统</p>
        </div>
      </div>
      
      <div class="nav-actions">
        <button class="nav-btn" @click="toggleDarkMode">
          {{ darkMode ? '☀️' : '🌙' }}
        </button>
        <button class="nav-btn" @click="showSettings = true">⚙️</button>
        <div class="user-avatar" @click="toggleUserMenu">
          <span class="avatar-icon">🧠</span>
        </div>
      </div>
    </nav>

    <!-- 主要内容区 -->
    <main class="main-content">
      <!-- 左侧控制面板 -->
      <aside class="control-panel">
        <div class="panel-card">
          <h3 class="panel-title">🎯 今日目标</h3>
          <div class="goal-progress">
            <div class="goal-info">
              <span class="goal-label">冥想时长</span>
              <span class="goal-value">15/20 分钟</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: '75%' }"></div>
            </div>
          </div>
          <div class="goal-stats">
            <div class="stat-item">
              <div class="stat-icon">🔥</div>
              <div class="stat-content">
                <div class="stat-value">7 天</div>
                <div class="stat-label">连续记录</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <div class="stat-value">85%</div>
                <div class="stat-label">专注度</div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-card">
          <h3 class="panel-title">🎵 音频控制</h3>
          <div class="audio-controls">
            <div class="volume-control">
              <label>音量</label>
              <input 
                type="range" 
                v-model="volume" 
                min="0" 
                max="100" 
                class="volume-slider"
                @input="adjustVolume"
              >
              <span class="volume-value">{{ volume }}%</span>
            </div>
            <div class="audio-presets">
              <button 
                v-for="preset in audioPresets" 
                :key="preset.id"
                :class="['preset-btn', { active: currentPreset === preset.id }]"
                @click="setAudioPreset(preset)"
              >
                {{ preset.icon }} {{ preset.name }}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- 中央冥想区 -->
      <section class="meditation-center">
        <!-- 当前冥想会话 -->
        <div class="session-card">
          <div class="session-header">
            <div class="session-info">
              <div class="session-icon">{{ currentSession.icon }}</div>
              <div>
                <h2>{{ currentSession.title }}</h2>
                <p class="session-desc">{{ currentSession.description }}</p>
              </div>
            </div>
            <div class="session-stats">
              <div class="stat-badge">
                <span class="stat-icon">⏱️</span>
                <span>{{ currentSession.duration }}分钟</span>
              </div>
              <div class="stat-badge">
                <span class="stat-icon">📊</span>
                <span>{{ currentSession.difficulty }}</span>
              </div>
            </div>
          </div>

          <!-- 大型播放控制 -->
          <div class="main-player">
            <div class="player-visualization">
              <div class="visualization-canvas" ref="visualizationCanvas"></div>
            </div>
            
            <div class="player-controls-large">
              <div class="time-display">
                <span class="current-time">{{ formatTime(currentTime) }}</span>
                <div class="progress-container">
                  <input 
                    type="range" 
                    v-model="currentTime" 
                    :max="currentSession.duration * 60" 
                    class="progress-slider"
                    @input="seekAudio"
                  >
                </div>
                <span class="total-time">{{ formatTime(currentSession.duration * 60) }}</span>
              </div>
              
              <div class="control-buttons">
                <button class="control-btn large" @click="previousSession">
                  ⏮
                </button>
                <button class="control-btn large play-btn" @click="togglePlay">
                  {{ isPlaying ? '⏸' : '▶' }}
                </button>
                <button class="control-btn large" @click="nextSession">
                  ⏭
                </button>
              </div>
              
              <div class="player-actions">
                <button class="action-btn" @click="loop = !loop" :class="{ active: loop }">
                  🔁 {{ loop ? '开' : '关' }}
                </button>
                <button class="action-btn" @click="toggleMute">
                  {{ isMuted ? '🔇' : '🔊' }}
                </button>
                <button class="action-btn" @click="showPlaylist = true">
                  📋 播放列表
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 推荐冥想 -->
        <div class="recommendations-section">
          <div class="section-header">
            <h3>🎯 为您推荐</h3>
            <button class="see-all" @click="showAllRecommendations">查看全部 →</button>
          </div>
          <div class="recommendations-grid">
            <div 
              v-for="session in recommendedSessions" 
              :key="session.id"
              :class="['recommendation-card', { playing: currentSession.id === session.id }]"
              @click="playSession(session)"
            >
              <div class="rec-icon">{{ session.icon }}</div>
              <div class="rec-content">
                <h4>{{ session.title }}</h4>
                <p>{{ session.description }}</p>
                <div class="rec-meta">
                  <span>⏱️ {{ session.duration }}分钟</span>
                  <span>🎯 {{ session.difficulty }}</span>
                </div>
              </div>
              <button class="play-indicator">
                {{ currentSession.id === session.id && isPlaying ? '⏸' : '▶' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧统计面板 -->
      <aside class="stats-panel">
        <div class="panel-card">
          <h3 class="panel-title">📈 实时数据</h3>
          <div class="real-time-stats">
            <div class="wave-chart">
              <div class="chart-header">
                <span>脑波监测</span>
                <span class="wave-status">Alpha波: {{ alphaLevel }}%</span>
              </div>
              <div class="chart-container" ref="waveChart"></div>
            </div>
            
            <div class="stats-grid">
              <div class="metric-card">
                <div class="metric-icon">🧠</div>
                <div class="metric-info">
                  <div class="metric-value">{{ focusLevel }}%</div>
                  <div class="metric-label">专注度</div>
                </div>
                <div class="metric-trend" :class="focusTrend">
                  {{ focusTrend === 'up' ? '↗' : '↘' }}
                </div>
              </div>
              
              <div class="metric-card">
                <div class="metric-icon">😌</div>
                <div class="metric-info">
                  <div class="metric-value">{{ relaxLevel }}%</div>
                  <div class="metric-label">放松度</div>
                </div>
                <div class="metric-trend" :class="relaxTrend">
                  {{ relaxTrend === 'up' ? '↗' : '↘' }}
                </div>
              </div>
              
              <div class="metric-card">
                <div class="metric-icon">💤</div>
                <div class="metric-info">
                  <div class="metric-value">{{ sleepQuality }}%</div>
                  <div class="metric-label">睡眠质量</div>
                </div>
                <div class="metric-trend" :class="sleepTrend">
                  {{ sleepTrend === 'up' ? '↗' : '↘' }}
                </div>
              </div>
              
              <div class="metric-card">
                <div class="metric-icon">⏱️</div>
                <div class="metric-info">
                  <div class="metric-value">{{ totalTime }}小时</div>
                  <div class="metric-label">累计冥想</div>
                </div>
                <div class="metric-trend up">↗</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <!-- 全局播放器 -->
    <div class="global-player" :class="{ minimized: !isPlaying }">
      <div class="now-playing">
        <div class="track-info">
          <span class="track-icon">{{ currentSession.icon }}</span>
          <div>
            <div class="track-title">{{ currentSession.title }}</div>
            <div class="track-artist">ZenFlow AI · {{ currentSession.duration }}分钟</div>
          </div>
        </div>
        
        <div class="mini-controls">
          <button class="mini-btn" @click="previousSession">⏮</button>
          <button class="mini-btn" @click="togglePlay">
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
          <button class="mini-btn" @click="nextSession">⏭</button>
        </div>
        
        <div class="mini-progress">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 音频元素 -->
    <audio 
      ref="audioPlayer"
      :src="currentSession.audioUrl"
      @timeupdate="updateTime"
      @ended="onAudioEnded"
      @loadedmetadata="onAudioLoaded"
    ></audio>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      // 音频状态
      isPlaying: false,
      isMuted: false,
      volume: 70,
      currentTime: 0,
      loop: false,
      
      // 当前会话
      currentSession: {
        id: 1,
        icon: '🌊',
        title: '海洋冥想',
        description: '让海浪声带您进入深度放松状态',
        duration: 10,
        difficulty: '初级',
        audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3'
      },
      
      // 推荐会话
      recommendedSessions: [
        {
          id: 1,
          icon: '🌊',
          title: '海洋冥想',
          description: '让海浪声带您进入深度放松状态',
          duration: 10,
          difficulty: '初级',
          audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3'
        },
        {
          id: 2,
          icon: '🌲',
          title: '森林漫步',
          description: '在大自然的怀抱中找到平静',
          duration: 15,
          difficulty: '中级',
          audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3'
        },
        {
          id: 3,
          icon: '🕉️',
          title: '正念呼吸',
          description: '专注于呼吸，平静心灵',
          duration: 5,
          difficulty: '初级',
          audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3'
        },
        {
          id: 4,
          icon: '🌙',
          title: '深度睡眠',
          description: '引导您进入深度睡眠状态',
          duration: 20,
          difficulty: '高级',
          audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-mysterious-space-740.mp3'
        }
      ],
      
      // 音频预设
      audioPresets: [
        { id: 1, icon: '😌', name: '放松', eq: 'relax' },
        { id: 2, icon: '🎯', name: '专注', eq: 'focus' },
        { id: 3, icon: '💤', name: '睡眠', eq: 'sleep' },
        { id: 4, icon: '🧘', name: '冥想', eq: 'meditation' }
      ],
      currentPreset: 1,
      
      // 统计数据
      alphaLevel: 75,
      focusLevel: 78,
      relaxLevel: 92,
      sleepQuality: 85,
      totalTime: 42,
      focusTrend: 'up',
      relaxTrend: 'up',
      sleepTrend: 'up',
      
      // UI状态
      darkMode: false,
      showSettings: false,
      showPlaylist: false
    }
  },
  
  computed: {
    progressPercentage() {
      return (this.currentTime / (this.currentSession.duration * 60)) * 100
    }
  },
  
  methods: {
    // 音频控制方法
    togglePlay() {
      const audio = this.$refs.audioPlayer
      if (!audio) return
      
      if (this.isPlaying) {
        audio.pause()
      } else {
        audio.play().catch(e => {
          console.error('播放失败:', e)
          // 如果在线音频失败，使用备用方案
          this.useFallbackAudio()
        })
      }
      this.isPlaying = !this.isPlaying
    },
    
    toggleMute() {
      const audio = this.$refs.audioPlayer
      if (!audio) return
      
      this.isMuted = !this.isMuted
      audio.muted = this.isMuted
    },
    
    adjustVolume() {
      const audio = this.$refs.audioPlayer
      if (!audio) return
      
      audio.volume = this.volume / 100
    },
    
    seekAudio() {
      const audio = this.$refs.audioPlayer
      if (!audio) return
      
      audio.currentTime = this.currentTime
    },
    
    updateTime() {
      const audio = this.$refs.audioPlayer
      if (!audio) return
      
      this.currentTime = Math.floor(audio.currentTime)
    },
    
    onAudioEnded() {
      if (this.loop) {
        this.currentTime = 0
        this.$refs.audioPlayer.play()
      } else {
        this.nextSession()
      }
    },
    
    onAudioLoaded() {
      console.log('音频加载完成')
    },
    
    // 会话控制
    playSession(session) {
      this.currentSession = session
      this.currentTime = 0
      
      // 短暂延迟确保audio元素更新
      this.$nextTick(() => {
        if (this.isPlaying) {
          this.$refs.audioPlayer.play().catch(e => {
            console.error('播放失败:', e)
            this.useFallbackAudio()
          })
        }
      })
    },
    
    previousSession() {
      const currentIndex = this.recommendedSessions.findIndex(
        s => s.id === this.currentSession.id
      )
      const prevIndex = (currentIndex - 1 + this.recommendedSessions.length) % this.recommendedSessions.length
      this.playSession(this.recommendedSessions[prevIndex])
    },
    
    nextSession() {
      const currentIndex = this.recommendedSessions.findIndex(
        s => s.id === this.currentSession.id
      )
      const nextIndex = (currentIndex + 1) % this.recommendedSessions.length
      this.playSession(this.recommendedSessions[nextIndex])
    },
    
    // 音频预设
    setAudioPreset(preset) {
      this.currentPreset = preset.id
      // 这里可以添加EQ调整逻辑
      console.log('切换到预设:', preset.name)
    },
    
    // 备用音频方案
    useFallbackAudio() {
      console.log('使用备用音频方案')
      // 可以在这里添加本地音频文件或使用其他音频源
    },
    
    // 工具方法
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },
    
    // UI方法
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      document.body.classList.toggle('dark-mode', this.darkMode)
    },
    
    toggleUserMenu() {
      // 用户菜单逻辑
    },
    
    showAllRecommendations() {
      this.showPlaylist = true
    }
  },
  
  mounted() {
    // 初始化音频
    this.adjustVolume()
    
    // 模拟数据更新
    setInterval(() => {
      this.alphaLevel = 70 + Math.random() * 20
      this.focusLevel = 75 + Math.random() * 15
      this.relaxLevel = 85 + Math.random() * 10
      
      // 更新趋势
      this.focusTrend = Math.random() > 0.3 ? 'up' : 'down'
      this.relaxTrend = Math.random() > 0.2 ? 'up' : 'down'
    }, 2000)
    
    // 初始化可视化
    this.initVisualization()
  },
  
  methods: {
    initVisualization() {
      // 这里可以添加音频可视化逻辑
      console.log('初始化音频可视化')
    }
  }
}
</script>

<style scoped>
/* 专业UI样式 - 将在main.css中实现 */
</style>