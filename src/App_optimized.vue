<template>
  <div class="app-container">
    <!-- 极简背景 -->
    <div class="gradient-bg"></div>
    
    <!-- 顶部导航栏 - 极简设计 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🧠</span>
          <span class="logo-text">MindFlow</span>
        </div>
        
        <div class="header-actions">
          <button class="icon-btn" @click="toggleVoiceRecognition" :title="voiceRecognitionActive ? '停止' : '语音'" :disabled="!voiceRecognitionSupported">
            <span>{{ voiceRecognitionActive ? '⏺️' : '🎤' }}</span>
          </button>
          <button class="icon-btn" @click="showSettings = true" title="设置">
            <span>⚙️</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 - 单栏布局 -->
    <main class="app-main">
      <!-- 冥想播放器 - 核心区域 -->
      <section class="meditation-section">
        <div class="player-card">
          <!-- 当前冥想信息 -->
          <div class="meditation-info">
            <div class="meditation-icon">{{ currentMeditation.icon }}</div>
            <div class="meditation-details">
              <h2>{{ currentMeditation.title }}</h2>
              <p>{{ currentMeditation.description }}</p>
              <div class="meditation-meta">
                <span>{{ currentMeditation.duration }} 分钟</span>
                <span>{{ currentMeditation.type }}</span>
              </div>
            </div>
          </div>

          <!-- 实时生理数据 - 简化显示 -->
          <div class="bio-stats">
            <div class="stat">
              <div class="stat-value">{{ bioData.heartRate }}</div>
              <div class="stat-label">心率</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ (bioData.focusLevel * 100).toFixed(0) }}%</div>
              <div class="stat-label">专注</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ (100 - bioData.stressLevel * 100).toFixed(0) }}%</div>
              <div class="stat-label">放松</div>
            </div>
          </div>

          <!-- 播放控制 -->
          <div class="player-controls">
            <button class="control-btn" @click="previousTrack" title="上一个">⏮️</button>
            <button class="control-btn play-btn" @click="togglePlayPause" :title="isPlaying ? '暂停' : '播放'">
              {{ isPlaying ? '⏸️' : '▶️' }}
            </button>
            <button class="control-btn" @click="nextTrack" title="下一个">⏭️</button>
          </div>

          <!-- 音量控制 -->
          <div class="volume-control">
            <span>🔊</span>
            <input type="range" v-model="volume" min="0" max="100" @input="updateVolume">
            <span>{{ volume }}%</span>
          </div>
        </div>
      </section>

      <!-- 推荐冥想 - 次要区域 -->
      <section class="recommendations-section" v-if="!voiceRecognitionActive">
        <h3>推荐冥想</h3>
        <div class="recommendations-grid">
          <div class="rec-item" v-for="item in recommendedMeditations" :key="item.id" @click="selectRecommendedMeditation(item)">
            <div class="rec-icon">{{ item.icon }}</div>
            <div class="rec-title">{{ item.title }}</div>
            <div class="rec-match">{{ (item.matchScore * 100).toFixed(0) }}%</div>
          </div>
        </div>
      </section>

      <!-- 语音识别面板 - 条件显示 -->
      <section class="voice-section" v-if="voiceRecognitionActive">
        <div class="voice-card">
          <div class="recording-indicator">
            <div class="pulse"></div>
            <span>语音识别中...</span>
          </div>
          <div class="transcript-display" v-if="realtimeTranscript">
            {{ realtimeTranscript }}
          </div>
          <button class="stop-btn" @click="stopVoiceRecognition">停止</button>
        </div>
      </section>

      <!-- AI 分析 - 可折叠 -->
      <section class="analysis-section" v-if="voiceTranscript">
        <h3>AI 分析</h3>
        <div class="analysis-card">
          <div class="emotion-badge" :class="sentimentAnalysis.emotion">
            {{ sentimentAnalysis.emotion }}
          </div>
          <div class="keywords">
            <span v-for="keyword in extractedKeywords" :key="keyword" class="keyword">
              {{ keyword }}
            </span>
          </div>
        </div>
      </section>

      <!-- 用户统计 - 页脚 -->
      <section class="stats-section">
        <div class="stat-item">
          <span class="stat-icon">📅</span>
          <span>第 {{ userData.days }} 天</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">⏱️</span>
          <span>{{ userData.totalMinutes }} 分钟</span>
        </div>
      </section>
    </main>

    <!-- 设置模态框 -->
    <div class="modal" v-if="showSettings" @click.self="showSettings = false">
      <div class="modal-content">
        <h3>设置</h3>
        <div class="settings-group">
          <label>AI 服务</label>
          <div class="radio-group">
            <label>
              <input type="radio" v-model="apiConfig.activeAIService" value="modelarts">
              ModelArts
            </label>
            <label>
              <input type="radio" v-model="apiConfig.activeAIService" value="deepseek">
              DeepSeek
            </label>
          </div>
        </div>
        <button class="close-btn" @click="showSettings = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      // 播放器状态
      isPlaying: false,
      volume: 70,
      currentAudio: null,
      audioPlayer: null,

      // 冥想数据
      currentMeditation: {
        icon: '🧘',
        title: '深度冥想',
        description: '放松身心，进入深层冥想状态',
        duration: 20,
        type: '放松'
      },
      recommendedMeditations: [],

      // 生理数据
      bioData: {
        heartRate: 68,
        focusLevel: 0.5,
        stressLevel: 0.3
      },

      // 用户数据
      userData: {
        days: 1,
        totalMinutes: 0
      },

      // 语音识别
      voiceRecognitionSupported: false,
      voiceRecognitionActive: false,
      voiceRecognitionService: null,
      realtimeTranscript: '',
      voiceTranscript: '',
      recognitionConfidence: 0,
      recognitionTime: 0,

      // AI 分析
      sentimentAnalysis: {
        emotion: '中性',
        confidence: 60
      },
      extractedKeywords: [],

      // UI 状态
      showSettings: false,

      // API 配置
      apiConfig: {
        activeAIService: 'deepseek'
      }
    };
  },

  mounted() {
    this.checkVoiceRecognitionSupport();
    this.initializeAudioPlayer();
    this.startBioDataSimulation();
    this.loadRecommendations();
  },

  beforeUnmount() {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
    }
    if (this.mediaEventListener) {
      clearInterval(this.mediaEventListener);
    }
  },

  methods: {
    checkVoiceRecognitionSupport() {
      this.voiceRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    },

    toggleVoiceRecognition() {
      if (this.voiceRecognitionActive) {
        this.stopVoiceRecognition();
      } else {
        this.startVoiceRecognition();
      }
    },

    startVoiceRecognition() {
      this.voiceRecognitionActive = true;
      this.realtimeTranscript = '';
    },

    stopVoiceRecognition() {
      this.voiceRecognitionActive = false;
    },

    analyzeTranscript(transcript) {
      const lower = transcript.toLowerCase();
      if (lower.includes('压力') || lower.includes('紧张')) {
        this.sentimentAnalysis.emotion = '压力';
      } else if (lower.includes('睡眠') || lower.includes('失眠')) {
        this.sentimentAnalysis.emotion = '睡眠';
      } else if (lower.includes('焦虑')) {
        this.sentimentAnalysis.emotion = '焦虑';
      } else if (lower.includes('放松')) {
        this.sentimentAnalysis.emotion = '放松';
      }
      this.extractKeywords(transcript);
    },

    extractKeywords(text) {
      const keywords = ['冥想', '放松', '睡眠', '专注', '压力', '焦虑'];
      this.extractedKeywords = keywords.filter(k => text.includes(k));
    },

    initializeAudioPlayer() {
      this.audioPlayer = new Audio();
    },

    togglePlayPause() {
      this.isPlaying = !this.isPlaying;
    },

    updateVolume() {
      if (this.audioPlayer) {
        this.audioPlayer.volume = this.volume / 100;
      }
    },

    previousTrack() {
      // 实现上一曲逻辑
    },

    nextTrack() {
      // 实现下一曲逻辑
    },

    startBioDataSimulation() {
      setInterval(() => {
        if (this.isPlaying) {
          this.bioData.heartRate = Math.max(60, 65 + Math.sin(Date.now() / 5000) * 5);
          this.bioData.focusLevel = Math.min(1, 0.7 + Math.random() * 0.2);
          this.bioData.stressLevel = Math.max(0, 0.3 - Math.random() * 0.1);
        } else {
          this.bioData.heartRate = 68 + Math.floor(Math.random() * 8 - 4);
          this.bioData.focusLevel = 0.5 + Math.random() * 0.3;
          this.bioData.stressLevel = 0.2 + Math.random() * 0.2;
        }
      }, 5000);
    },

    loadRecommendations() {
      this.recommendedMeditations = [
        { id: 1, icon: '😴', title: '深度睡眠', matchScore: 0.95 },
        { id: 2, icon: '🧘', title: '身心放松', matchScore: 0.88 },
        { id: 3, icon: '🎯', title: '专注冥想', matchScore: 0.82 }
      ];
    },

    selectRecommendedMeditation(item) {
      this.currentMeditation.icon = item.icon;
      this.currentMeditation.title = item.title;
    }
  }
};
</script>

<style scoped>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
  background: #0a0e27;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
}

/* 背景 */
.gradient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1729 100%);
  z-index: -1;
}

/* 顶部导航 */
.app-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem 2rem;
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.logo-icon {
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.icon-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 主内容区 */
.app-main {
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 冥想播放器 */
.meditation-section {
  width: 100%;
}

.player-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.meditation-info {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.meditation-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.meditation-details h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.meditation-details p {
  color: #94a3b8;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.meditation-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #64748b;
}

/* 生理数据 */
.bio-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat {
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 600;
  color: #00ff88;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #94a3b8;
}

/* 播放控制 */
.player-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.control-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: scale(1.1);
}

.play-btn {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
}

/* 音量控制 */
.volume-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}

.volume-control input {
  width: 200px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  -webkit-appearance: none;
}

.volume-control input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #00ff88;
  cursor: pointer;
}

/* 推荐冥想 */
.recommendations-section h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #cbd5e1;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.rec-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rec-item:hover {
  background: rgba(0, 255, 136, 0.08);
  border-color: rgba(0, 255, 136, 0.3);
}

.rec-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.rec-title {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.rec-match {
  font-size: 0.8rem;
  color: #00ff88;
}

/* 语音识别 */
.voice-section {
  width: 100%;
}

.voice-card {
  background: rgba(0, 255, 136, 0.08);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
}

.recording-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.pulse {
  width: 12px;
  height: 12px;
  background: #00ff88;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.transcript-display {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.stop-btn {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff3b30;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stop-btn:hover {
  background: rgba(255, 59, 48, 0.2);
}

/* AI 分析 */
.analysis-section h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #cbd5e1;
}

.analysis-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
}

.emotion-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.keyword {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #94a3b8;
}

/* 统计 */
.stats-section {
  display: flex;
  gap: 2rem;
  justify-content: center;
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
}

.stat-icon {
  font-size: 1.25rem;
}

/* 模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1f3a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin-bottom: 1.5rem;
}

.settings-group {
  margin-bottom: 1.5rem;
}

.settings-group label {
  display: block;
  margin-bottom: 0.75rem;
  color: #cbd5e1;
  font-size: 0.9rem;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0;
}

.close-btn {
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(0, 255, 136, 0.2);
}

/* 响应式 */
@media (max-width: 640px) {
  .app-main {
    padding: 1rem;
    gap: 1.5rem;
  }

  .player-card {
    padding: 1.5rem;
  }

  .meditation-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .meditation-icon {
    font-size: 2.5rem;
  }

  .bio-stats {
    grid-template-columns: 1fr;
  }

  .recommendations-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-section {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
