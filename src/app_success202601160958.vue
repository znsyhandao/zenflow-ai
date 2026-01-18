<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <h1 class="logo">
          <span class="logo-icon">🧠</span>
          眠小兔AI冥想系统
        </h1>
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span class="status-text">在线</span>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="dashboard">
        <!-- 用户信息 -->
        <div class="user-card card">
          <div class="avatar">🧘</div>
          <div class="user-info">
            <h3>冥想者</h3>
            <p>第 7 天连续冥想</p>
            <div class="stats">
              <div class="stat-item">
                <span class="stat-value">15</span>
                <span class="stat-label">分钟</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">85%</span>
                <span class="stat-label">专注度</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速开始 -->
        <div class="quick-start card">
          <h2>快速开始冥想</h2>
          <div class="session-options">
            <button 
              v-for="time in sessionTimes" 
              :key="time"
              class="session-btn"
              @click="startMeditation(time)"
            >
              {{ time }}分钟
            </button>
          </div>
          <button class="custom-btn" @click="showCustomModal = true">
            ⚙️ 自定义设置
          </button>
        </div>

        <!-- 推荐内容 -->
        <div class="recommendations card">
          <h2>今日推荐</h2>
          <div class="recommendation-list">
            <div 
              v-for="item in recommendations" 
              :key="item.id"
              class="recommendation-item"
              @click="playRecommendation(item)"
            >
              <div class="rec-icon">{{ item.icon }}</div>
              <div class="rec-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
                <div class="rec-meta">
                  <span>{{ item.duration }}分钟</span>
                  <span>·</span>
                  <span>{{ item.difficulty }}</span>
                </div>
              </div>
              <button class="play-btn" @click="playRecommendation(item)">
                {{ isPlaying && currentTrack.id === item.id ? '⏸' : '▶' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 脑波监测 -->
        <div class="brainwave-card card">
          <h2>脑波实时监测</h2>
          <div class="wave-visualization">
            <div class="wave-container">
              <div class="wave-line"></div>
              <div class="wave-line"></div>
              <div class="wave-line"></div>
            </div>
            <div class="wave-info">
              <div class="wave-type">
                <span class="wave-name">Alpha波</span>
                <span class="wave-level">高</span>
              </div>
              <div class="wave-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: alphaLevel + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="wave-stats">
            <div class="wave-stat">
              <span class="stat-label">专注度</span>
              <span class="stat-value">78%</span>
            </div>
            <div class="wave-stat">
              <span class="stat-label">放松度</span>
              <span class="stat-value">92%</span>
            </div>
            <div class="wave-stat">
              <span class="stat-label">睡眠质量</span>
              <span class="stat-value">85%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部播放控制 -->
      <div class="player-controls" v-if="isPlaying">
        <div class="player-info">
          <div class="track-name">{{ currentTrack.title }}</div>
          <div class="track-progress">
            <div class="progress-time">{{ formatTime(currentTime) }}</div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: (currentTime / currentTrack.duration) * 100 + '%' }"
              ></div>
            </div>
            <div class="progress-time">{{ formatTime(currentTrack.duration) }}</div>
          </div>
        </div>
        <div class="player-actions">
          <button class="player-btn" @click="skipBack">⏮</button>
          <button class="player-btn play-btn" @click="togglePlay">
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
          <button class="player-btn" @click="skipForward">⏭</button>
          <button class="player-btn volume-btn" @click="toggleMute">
            {{ isMuted ? '🔇' : '🔊' }}
          </button>
          <input 
            type="range" 
            min="0" 
            max="100" 
            v-model="volume"
            class="volume-slider"
            @input="changeVolume"
          />
        </div>
      </div>

      <!-- 自定义设置模态框 -->
      <div v-if="showCustomModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>自定义冥想设置</h3>
            <button class="close-btn" @click="showCustomModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="setting-group">
              <label>冥想时长（分钟）</label>
              <input 
                type="number" 
                min="1" 
                max="60" 
                v-model="customDuration"
                class="custom-input"
              />
            </div>
            <div class="setting-group">
              <label>背景音乐</label>
              <select v-model="selectedAudio" class="audio-select">
                <option value="">选择背景音乐</option>
                <option 
                  v-for="audio in availableAudios" 
                  :key="audio.path"
                  :value="audio"
                >
                  {{ audio.name }}
                </option>
              </select>
            </div>
            <div class="setting-group">
              <label>引导语音</label>
              <select v-model="selectedGuide" class="guide-select">
                <option value="none">无引导语音</option>
                <option value="gentle">轻柔引导</option>
                <option value="focused">专注引导</option>
                <option value="sleep">助眠引导</option>
              </select>
            </div>
            <div class="setting-group">
              <label>音量</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                v-model="customVolume"
                class="volume-slider"
              />
              <span class="volume-value">{{ customVolume }}%</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click="showCustomModal = false">取消</button>
            <button class="confirm-btn" @click="startCustomMeditation">开始冥想</button>
          </div>
        </div>
      </div>

      <!-- 音频播放器 -->
      <audio 
        ref="audioPlayer"
        :src="currentAudioSrc"
        @timeupdate="updateTime"
        @ended="onAudioEnded"
      ></audio>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      sessionTimes: [5, 10, 15, 20],
      recommendations: [
        {
          id: 1,
          icon: '🌊',
          title: '海洋冥想',
          description: '让海浪声带你进入深度放松',
          duration: 10,
          difficulty: '初级',
          audioFile: '/audio/mixkit-ocean-of-love-1113.mp3'
        },
        {
          id: 2,
          icon: '🌲',
          title: '森林漫步',
          description: '在大自然的怀抱中找到平静',
          duration: 15,
          difficulty: '中级',
          audioFile: '/audio/mixkit-forest-walk-607.mp3'
        },
        {
          id: 3,
          icon: '🕉️',
          title: '正念呼吸',
          description: '专注于呼吸，平静心灵',
          duration: 5,
          difficulty: '初级',
          audioFile: '/audio/mixkit-meditation-441.mp3'
        },
        {
          id: 4,
          icon: '🌙',
          title: '深度睡眠',
          description: '帮助快速入睡的引导音乐',
          duration: 20,
          difficulty: '初级',
          audioFile: '/audio/fixed_sleep_music_wind_chimes.mp3'
        },
        {
          id: 5,
          icon: '🧘‍♀️',
          title: '瑜伽冥想',
          description: '配合瑜伽练习的冥想音乐',
          duration: 30,
          difficulty: '高级',
          audioFile: '/audio/mixkit-yoga-music-04-386.mp3'
        }
      ],
      availableAudios: [
        { name: '海洋之声', path: '/audio/mixkit-ocean-of-love-1113.mp3' },
        { name: '森林漫步', path: '/audio/mixkit-forest-walk-607.mp3' },
        { name: '冥想音乐', path: '/audio/mixkit-meditation-441.mp3' },
        { name: '自然冥想', path: '/audio/mixkit-nature-meditation-345.mp3' },
        { name: '瑜伽音乐', path: '/audio/mixkit-yoga-music-04-386.mp3' },
        { name: '风铃助眠', path: '/audio/fixed_sleep_music_wind_chimes.mp3' },
        { name: 'Alpha波', path: '/audio/fixed_alphameditation.mp3' },
        { name: 'Theta波', path: '/audio/fixed_Thetameditation.mp3' },
        { name: '雨声', path: '/audio/fixed_rain.mp3' },
        { name: '海浪风', path: '/audio/fixed_seawind.mp3' },
        { name: '春雨', path: '/audio/fixed_springsong.mp3' },
        { name: '放松状态', path: '/audio/fixed_relax_state_meditation.mp3' }
      ],
      alphaLevel: 75,
      isPlaying: false,
      isMuted: false,
      volume: 80,
      currentTrack: {
        id: 0,
        title: '海洋冥想',
        duration: 600, // 10分钟，单位秒
        audioFile: '/audio/mixkit-ocean-of-love-1113.mp3'
      },
      currentTime: 0,
      showCustomModal: false,
      customDuration: 15,
      selectedAudio: null,
      selectedGuide: 'gentle',
      customVolume: 80,
      audioInterval: null
    }
  },
  computed: {
    currentAudioSrc() {
      return this.currentTrack.audioFile || ''
    }
  },
  methods: {
    startMeditation(minutes) {
      console.log(`开始 ${minutes} 分钟冥想`)
      
      // 选择一个合适的音频文件
      const audioIndex = minutes % this.availableAudios.length
      const selectedAudio = this.availableAudios[audioIndex]
      
      this.currentTrack = {
        id: 0,
        title: `${minutes}分钟冥想 - ${selectedAudio.name}`,
        duration: minutes * 60,
        audioFile: selectedAudio.path
      }
      
      this.isPlaying = true
      this.currentTime = 0
      
      // 确保音频播放器加载并播放
      this.$nextTick(() => {
        const audioPlayer = this.$refs.audioPlayer
        if (audioPlayer) {
          audioPlayer.volume = this.volume / 100
          audioPlayer.play().catch(error => {
            console.error('播放失败:', error)
          })
        }
      })
    },
    
    playRecommendation(item) {
      console.log('播放推荐:', item.title)
      
      // 如果正在播放同一个音频，则暂停/播放切换
      if (this.isPlaying && this.currentTrack.id === item.id) {
        this.togglePlay()
        return
      }
      
      this.currentTrack = {
        id: item.id,
        title: item.title,
        duration: item.duration * 60,
        audioFile: item.audioFile
      }
      
      this.isPlaying = true
      this.currentTime = 0
      
      this.$nextTick(() => {
        const audioPlayer = this.$refs.audioPlayer
        if (audioPlayer) {
          audioPlayer.volume = this.volume / 100
          audioPlayer.play().catch(error => {
            console.error('播放失败:', error)
          })
        }
      })
    },
    
    togglePlay() {
      const audioPlayer = this.$refs.audioPlayer
      if (!audioPlayer) return
      
      if (this.isPlaying) {
        audioPlayer.pause()
      } else {
        audioPlayer.play().catch(error => {
          console.error('播放失败:', error)
        })
      }
      this.isPlaying = !this.isPlaying
    },
    
    toggleMute() {
      const audioPlayer = this.$refs.audioPlayer
      if (!audioPlayer) return
      
      this.isMuted = !this.isMuted
      audioPlayer.muted = this.isMuted
    },
    
    changeVolume() {
      const audioPlayer = this.$refs.audioPlayer
      if (audioPlayer) {
        audioPlayer.volume = this.volume / 100
      }
    },
    
    skipBack() {
      const audioPlayer = this.$refs.audioPlayer
      if (!audioPlayer) return
      
      audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 30)
      this.currentTime = audioPlayer.currentTime
    },
    
    skipForward() {
      const audioPlayer = this.$refs.audioPlayer
      if (!audioPlayer) return
      
      audioPlayer.currentTime = Math.min(
        audioPlayer.duration || this.currentTrack.duration, 
        audioPlayer.currentTime + 30
      )
      this.currentTime = audioPlayer.currentTime
    },
    
    updateTime() {
      const audioPlayer = this.$refs.audioPlayer
      if (audioPlayer) {
        this.currentTime = audioPlayer.currentTime
      }
    },
    
    onAudioEnded() {
      this.isPlaying = false
      this.currentTime = 0
      console.log('音频播放结束')
    },
    
    formatTime(seconds) {
      if (!seconds) return '00:00'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },
    
    startCustomMeditation() {
      const audio = this.selectedAudio || this.availableAudios[0]
      
      this.currentTrack = {
        id: 999,
        title: `自定义冥想 - ${audio.name}`,
        duration: this.customDuration * 60,
        audioFile: audio.path
      }
      
      this.volume = this.customVolume
      this.isPlaying = true
      this.currentTime = 0
      this.showCustomModal = false
      
      this.$nextTick(() => {
        const audioPlayer = this.$refs.audioPlayer
        if (audioPlayer) {
          audioPlayer.volume = this.volume / 100
          audioPlayer.play().catch(error => {
            console.error('播放失败:', error)
          })
        }
      })
    }
  },
  mounted() {
    // 模拟脑波变化
    setInterval(() => {
      this.alphaLevel = 70 + Math.random() * 20
    }, 2000)
    
    // 初始化默认选择的音频
    this.selectedAudio = this.availableAudios[0]
  },
  beforeUnmount() {
    if (this.audioInterval) {
      clearInterval(this.audioInterval)
    }
  }
}
</script>

<style scoped>
/* 基本样式 */
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
}

.app-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  color: white;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 2rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 主内容区域 */
.app-main {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* 用户信息卡片 */
.user-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  font-size: 3rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-info h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.user-info p {
  margin: 0.5rem 0;
  color: #666;
}

.stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

/* 快速开始 */
.quick-start h2 {
  margin-top: 0;
  color: #333;
}

.session-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
  margin: 1.5rem 0;
}

.session-btn {
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.session-btn:hover {
  background: #764ba2;
  transform: translateY(-2px);
}

.custom-btn {
  width: 100%;
  padding: 0.8rem;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.custom-btn:hover {
  background: #667eea;
  color: white;
}

/* 推荐内容 */
.recommendation-list {
  margin-top: 1rem;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 0.8rem;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recommendation-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.rec-icon {
  font-size: 2rem;
}

.rec-content {
  flex: 1;
}

.rec-content h4 {
  margin: 0;
  color: #333;
}

.rec-content p {
  margin: 0.3rem 0;
  color: #666;
  font-size: 0.9rem;
}

.rec-meta {
  display: flex;
  gap: 0.5rem;
  color: #888;
  font-size: 0.8rem;
}

.recommendation-item .play-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #667eea;
  cursor: pointer;
  padding: 0.5rem;
}

/* 脑波监测 */
.wave-visualization {
  display: flex;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.wave-container {
  flex: 1;
  height: 80px;
  position: relative;
  overflow: hidden;
}

.wave-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: #667eea;
  opacity: 0.6;
  animation: wave 3s infinite ease-in-out;
}

.wave-line:nth-child(2) {
  top: 25px;
  animation-delay: 0.5s;
}

.wave-line:nth-child(3) {
  top: 50px;
  animation-delay: 1s;
}

@keyframes wave {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(20px); }
}

.wave-info {
  flex: 1;
}

.wave-type {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.wave-name {
  font-weight: bold;
  color: #333;
}

.wave-level {
  color: #4ade80;
  font-weight: bold;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 1s ease;
}

.wave-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}

.wave-stat {
  text-align: center;
}

.wave-stat .stat-label {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.wave-stat .stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

/* 播放控制 */
.player-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.player-info {
  flex: 1;
}

.track-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.track-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-time {
  font-size: 0.9rem;
  color: #666;
  min-width: 45px;
}

.player-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.player-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #667eea;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.3s ease;
}

.player-btn:hover {
  color: #764ba2;
  transform: scale(1.1);
}

.volume-slider {
  width: 100px;
  margin-left: 0.5rem;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: bold;
}

.custom-input, .audio-select, .guide-select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.volume-value {
  margin-left: 1rem;
  color: #666;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-btn, .confirm-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
}

.confirm-btn {
  background: #667eea;
  color: white;
}

.confirm-btn:hover {
  background: #764ba2;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  
  .session-options {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .wave-stats {
    grid-template-columns: 1fr;
  }
  
  .player-controls {
    flex-direction: column;
    gap: 1rem;
  }
  
  .player-info {
    width: 100%;
  }
  
  .player-actions {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .session-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .modal-content {
    width: 95%;
  }
}
</style>