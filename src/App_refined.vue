<template>
  <div class="app-container">
    <!-- 简约科技风背景 -->
    <div class="gradient-bg"></div>
    
    <!-- 顶部状态栏 - 精简版 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🧠</span>
          <span class="logo-text">MindFlow AI</span>
        </div>
        
        <div class="header-actions">
          <button class="action-btn" @click="toggleVoiceRecognition" 
                  :class="{ 'voice-active': voiceRecognitionSupported, 'recording': voiceRecognitionActive }" 
                  title="语音输入 (Ctrl+R)"
                  :disabled="!voiceRecognitionSupported">
            <span class="action-icon">{{ voiceRecognitionActive ? '⏺️' : voiceRecognitionSupported ? '🎤' : '🎤❌' }}</span>
          </button>
          <button class="action-btn" @click="showConfigModal = true" title="设置">
            <span class="action-icon">⚙️</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 - 优化布局 -->
    <main class="app-main">
      <!-- 核心功能区：冥想播放器 -->
      <section class="core-section">
        <!-- 当前冥想信息 -->
        <div class="meditation-card">
          <div class="meditation-header">
            <div class="meditation-icon">{{ currentMeditation.icon }}</div>
            <div class="meditation-info">
              <h2>{{ currentMeditation.title }}</h2>
              <p>{{ currentMeditation.description }}</p>
            </div>
          </div>

          <!-- 生理数据 - 三指标简化显示 -->
          <div class="bio-indicators">
            <div class="indicator">
              <span class="label">心率</span>
              <span class="value">{{ bioData.heartRate }}</span>
              <span class="unit">BPM</span>
            </div>
            <div class="indicator">
              <span class="label">专注</span>
              <span class="value">{{ (bioData.focusLevel * 100).toFixed(0) }}%</span>
            </div>
            <div class="indicator">
              <span class="label">放松</span>
              <span class="value">{{ (100 - bioData.stressLevel * 100).toFixed(0) }}%</span>
            </div>
          </div>

          <!-- 播放控制 -->
          <div class="player-controls">
            <button class="control-btn" @click="togglePlayPause" :title="isPlaying ? '暂停' : '播放'">
              {{ isPlaying ? '⏸️' : '▶️' }}
            </button>
            <div class="progress-info">
              <span>{{ currentMeditation.duration }} 分钟</span>
            </div>
          </div>

          <!-- 音量控制 -->
          <div class="volume-section">
            <label>音量</label>
            <input type="range" v-model="volume" min="0" max="100" @input="updateVolume" class="volume-slider">
            <span>{{ volume }}%</span>
          </div>
        </div>
      </section>

      <!-- 推荐冥想区 -->
      <section class="recommendations-section" v-if="!voiceRecognitionActive">
        <h3>推荐冥想</h3>
        <div class="recommendations-list">
          <div class="rec-card" v-for="item in recommendedMeditations.slice(0, 3)" :key="item.id" 
               @click="selectRecommendedMeditation(item)">
            <div class="rec-icon">{{ item.icon }}</div>
            <div class="rec-info">
              <div class="rec-title">{{ item.title }}</div>
              <div class="rec-match">{{ (item.matchScore * 100).toFixed(0) }}% 匹配</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 语音识别区 - 条件显示 -->
      <section class="voice-section" v-if="voiceRecognitionActive">
        <div class="voice-card">
          <div class="recording-indicator">
            <div class="pulse"></div>
            <span>语音识别中...</span>
          </div>
          <div class="transcript-box" v-if="realtimeTranscript">
            <div class="transcript-text">{{ realtimeTranscript }}</div>
            <div class="confidence-badge">置信度: {{ recognitionConfidence }}%</div>
          </div>
          <div class="voice-actions">
            <button class="stop-btn" @click="stopVoiceRecognition">停止识别</button>
          </div>
        </div>
      </section>

      <!-- AI 分析区 - 条件显示 -->
      <section class="analysis-section" v-if="voiceTranscript">
        <h3>AI 分析</h3>
        <div class="analysis-card">
          <div class="emotion-info">
            <span class="emotion-badge" :class="sentimentAnalysis.emotion">
              {{ sentimentAnalysis.emotion }}
            </span>
            <span class="confidence">{{ sentimentAnalysis.confidence }}% 置信度</span>
          </div>
          <div class="keywords-section" v-if="extractedKeywords.length">
            <span class="label">关键词:</span>
            <div class="keywords">
              <span v-for="keyword in extractedKeywords" :key="keyword" class="keyword-tag">
                {{ keyword }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 用户统计 -->
      <section class="stats-section">
        <div class="stat">
          <span class="stat-icon">📅</span>
          <span>第 {{ userData.days }} 天</span>
        </div>
        <div class="stat">
          <span class="stat-icon">⏱️</span>
          <span>{{ userData.totalMinutes }} 分钟</span>
        </div>
      </section>
    </main>

    <!-- 设置模态框 -->
    <div class="modal" v-if="showConfigModal" @click.self="showConfigModal = false">
      <div class="modal-content">
        <h3>设置</h3>
        <div class="settings-group">
          <label>AI 服务</label>
          <div class="radio-options">
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
        <button class="close-btn" @click="showConfigModal = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
import { VoiceRecognitionService } from './audio/ai-audio-system.js';
import { audioLibrary } from './components/BreathingField.vue';

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
      showConfigModal: false,

      // API 配置
      apiConfig: {
        activeAIService: 'deepseek'
      },

      // 事件监听器
      keyboardEventListener: null,
      mediaEventListener: null
    };
  },

  mounted() {
    this.checkVoiceRecognitionSupport();
    this.initializeAudioPlayer();
    this.startBioDataSimulation();
    this.loadRecommendations();
    this.setupKeyboardShortcuts();
  },

  beforeUnmount() {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
    }
    if (this.mediaEventListener) {
      clearInterval(this.mediaEventListener);
    }
    if (this.keyboardEventListener) {
      document.removeEventListener('keydown', this.keyboardEventListener);
    }
  },

  methods: {
    checkVoiceRecognitionSupport() {
      this.voiceRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      if (this.voiceRecognitionSupported) {
        this.initializeVoiceRecognition();
      }
    },

    initializeVoiceRecognition() {
      try {
        this.voiceRecognitionService = new VoiceRecognitionService();
        if (this.voiceRecognitionService.isSupported) {
          this.voiceRecognitionService.onTranscript = (finalTranscript, interimTranscript, confidence) => {
            this.realtimeTranscript = finalTranscript || interimTranscript;
            this.recognitionConfidence = Math.round(confidence * 100);
            if (finalTranscript) {
              this.analyzeVoiceContent(finalTranscript);
            }
          };
          this.voiceRecognitionService.onEnd = (finalTranscript, confidence) => {
            this.voiceRecognitionActive = false;
            if (finalTranscript) {
              this.voiceTranscript = finalTranscript;
              this.recognitionConfidence = Math.round(confidence * 100);
              this.analyzeTranscript(finalTranscript);
            }
          };
        }
      } catch (error) {
        console.error('语音识别初始化失败:', error);
        this.voiceRecognitionSupported = false;
      }
    },

    toggleVoiceRecognition() {
      if (this.voiceRecognitionActive) {
        this.stopVoiceRecognition();
      } else {
        this.startVoiceRecognition();
      }
    },

    startVoiceRecognition() {
      if (!this.voiceRecognitionService) return;
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          this.voiceRecognitionService.start();
          this.voiceRecognitionActive = true;
          this.realtimeTranscript = '';
        })
        .catch(error => {
          console.error('麦克风错误:', error);
          this.voiceRecognitionSupported = false;
        });
    },

    stopVoiceRecognition() {
      if (this.voiceRecognitionService) {
        this.voiceRecognitionService.stop();
        this.voiceRecognitionActive = false;
      }
    },

    analyzeVoiceContent(transcript) {
      if (!transcript || typeof transcript !== 'string') return;
      const lower = transcript.toLowerCase();
      if (lower.includes('压力') || lower.includes('紧张')) {
        this.sentimentAnalysis.emotion = '压力';
        this.sentimentAnalysis.confidence = 85;
      } else if (lower.includes('睡眠') || lower.includes('失眠')) {
        this.sentimentAnalysis.emotion = '睡眠';
        this.sentimentAnalysis.confidence = 90;
      } else if (lower.includes('焦虑')) {
        this.sentimentAnalysis.emotion = '焦虑';
        this.sentimentAnalysis.confidence = 90;
      } else if (lower.includes('放松')) {
        this.sentimentAnalysis.emotion = '放松';
        this.sentimentAnalysis.confidence = 70;
      }
      this.extractKeywords(transcript);
    },

    analyzeTranscript(transcript) {
      this.analyzeVoiceContent(transcript);
    },

    extractKeywords(text) {
      const keywords = ['冥想', '放松', '睡眠', '专注', '压力', '焦虑', '呼吸', '冷静'];
      this.extractedKeywords = keywords.filter(k => text.includes(k));
    },

    initializeAudioPlayer() {
      this.audioPlayer = new Audio();
      if (this.currentAudio) {
        this.audioPlayer.src = this.currentAudio.url;
      }
    },

    togglePlayPause() {
      if (this.isPlaying) {
        this.audioPlayer.pause();
      } else {
        this.audioPlayer.play();
      }
      this.isPlaying = !this.isPlaying;
    },

    updateVolume() {
      if (this.audioPlayer) {
        this.audioPlayer.volume = this.volume / 100;
      }
    },

    startBioDataSimulation() {
      this.mediaEventListener = setInterval(() => {
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
        { id: 1, icon: '😴', title: '深度睡眠', matchScore: 0.95, description: '帮助深度睡眠' },
        { id: 2, icon: '🧘', title: '身心放松', matchScore: 0.88, description: '全身放松冥想' },
        { id: 3, icon: '🎯', title: '专注冥想', matchScore: 0.82, description: '提升专注力' }
      ];
    },

    selectRecommendedMeditation(item) {
      this.currentMeditation.icon = item.icon;
      this.currentMeditation.title = item.title;
      this.currentMeditation.description = item.description;
    },

    setupKeyboardShortcuts() {
      this.keyboardEventListener = (e) => {
        // 空格键 播放/暂停
        if (e.code === 'Space' && !e.target.matches('input, textarea, button')) {
          e.preventDefault();
          this.togglePlayPause();
        }
        // Ctrl + R 开始语音识别
        if (e.ctrlKey && e.key === 'r' && !e.target.matches('input, textarea')) {
          e.preventDefault();
          this.toggleVoiceRecognition();
        }
      };
      document.addEventListener('keydown', this.keyboardEventListener);
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

.action-btn {
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

.action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.action-btn.recording {
  background: rgba(255, 59, 48, 0.1);
  border-color: rgba(255, 59, 48, 0.3);
  color: #ff3b30;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 主内容区 */
.app-main {
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 核心功能区 */
.core-section {
  width: 100%;
}

.meditation-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.meditation-header {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.meditation-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.meditation-info h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.meditation-info p {
  color: #94a3b8;
  line-height: 1.5;
}

/* 生理指标 */
.bio-indicators {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.indicator {
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.indicator .label {
  font-size: 0.85rem;
  color: #94a3b8;
}

.indicator .value {
  font-size: 1.75rem;
  font-weight: 600;
  color: #00ff88;
}

.indicator .unit {
  font-size: 0.75rem;
  color: #64748b;
}

/* 播放控制 */
.player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.control-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  font-size: 1.5rem;
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

.progress-info {
  color: #94a3b8;
  font-size: 0.95rem;
}

/* 音量控制 */
.volume-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}

.volume-section label {
  color: #94a3b8;
  font-size: 0.9rem;
  min-width: 40px;
}

.volume-slider {
  width: 150px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  -webkit-appearance: none;
}

.volume-slider::-webkit-slider-thumb {
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

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rec-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rec-card:hover {
  background: rgba(0, 255, 136, 0.08);
  border-color: rgba(0, 255, 136, 0.3);
}

.rec-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.rec-info {
  flex: 1;
}

.rec-title {
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
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
  animation: pulse-anim 1.5s infinite;
}

@keyframes pulse-anim {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.transcript-box {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.transcript-text {
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.confidence-badge {
  font-size: 0.8rem;
  color: #00ff88;
}

.voice-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
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

.emotion-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.emotion-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  font-size: 0.9rem;
}

.confidence {
  font-size: 0.85rem;
  color: #94a3b8;
}

.keywords-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.keywords-section .label {
  font-size: 0.9rem;
  color: #94a3b8;
  flex-shrink: 0;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keyword-tag {
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

.stat {
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

.radio-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0;
  cursor: pointer;
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
@media (max-width: 768px) {
  .app-main {
    padding: 1rem;
    gap: 1.5rem;
  }

  .meditation-card {
    padding: 1.5rem;
  }

  .meditation-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .meditation-icon {
    font-size: 2.5rem;
  }

  .bio-indicators {
    grid-template-columns: 1fr;
  }

  .player-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .stats-section {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
