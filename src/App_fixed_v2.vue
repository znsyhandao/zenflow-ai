<template>
  <div class="app-container">
    <div class="gradient-bg"></div>
    
    <!-- 顶部导航 -->
    <header class="app-header glass">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🧠</span>
          <span class="logo-text">MindFlow AI</span>
        </div>
        <div class="header-actions">
          <div class="status-badge" :class="voiceRecognitionActive ? 'active' : ''">
            {{ voiceRecognitionActive ? '正在聆听...' : '语音就绪' }}
          </div>
          <button class="action-btn" @click="showConfigModal = true">⚙️</button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <!-- 左侧：生理数据与推荐 -->
      <aside class="side-panel left">
        <section class="card glass">
          <h3>实时状态</h3>
          <div class="bio-grid">
            <div class="bio-item">
              <span class="bio-label">心率</span>
              <span class="bio-value">{{ bioData.heartRate.toFixed(0) }} <small>BPM</small></span>
            </div>
            <div class="bio-item">
              <span class="bio-label">专注</span>
              <div class="bio-bar"><div class="fill" :style="{width: (bioData.focusLevel*100)+'%'}"></div></div>
            </div>
            <div class="bio-item">
              <span class="bio-label">放松</span>
              <div class="bio-bar"><div class="fill relax" :style="{width: (100-bioData.stressLevel*100)+'%'}"></div></div>
            </div>
          </div>
        </section>

        <section class="card glass">
          <h3>为您推荐</h3>
          <div class="rec-list">
            <div v-for="item in recommendedMeditations" :key="item.id" class="rec-item" @click="selectMeditation(item)">
              <span class="rec-icon">{{ item.icon }}</span>
              <div class="rec-info">
                <div class="rec-name">{{ item.title }}</div>
                <div class="rec-meta">{{ item.matchScore*100 }}% 匹配 · {{ item.duration }}min</div>
              </div>
            </div>
          </div>
        </section>
      </aside>

      <!-- 中间：播放器与 AI 对话 -->
      <section class="center-content">
        <!-- 播放器卡片 -->
        <div class="player-card glass">
          <div class="player-info">
            <div class="current-icon">{{ currentMeditation.icon }}</div>
            <div class="current-details">
              <h2>{{ currentMeditation.title }}</h2>
              <p>{{ currentMeditation.description }}</p>
            </div>
          </div>
          
          <div class="player-controls">
            <button class="play-btn" @click="togglePlayPause">
              {{ isPlaying ? '⏸️' : '▶️' }}
            </button>
            <div class="volume-ctrl">
              <span>🔈</span>
              <input type="range" v-model="volume" min="0" max="100" @input="updateVolume">
              <span>{{ volume }}%</span>
            </div>
          </div>
        </div>

        <!-- AI 对话框 -->
        <div class="chat-card glass">
          <div class="chat-header">
            <span>AI 冥想助手</span>
            <button class="clear-btn" @click="clearChat">清空</button>
          </div>
          <div class="chat-history" ref="chatScroll">
            <div v-for="(msg, i) in chatHistory" :key="i" class="message" :class="msg.type">
              <div class="msg-bubble">{{ msg.text }}</div>
            </div>
            <div v-if="isAIThinking" class="message ai thinking">
              <div class="msg-bubble">AI 正在思考...</div>
            </div>
          </div>
          <div class="chat-input-area">
            <button class="voice-btn" :class="{active: voiceRecognitionActive}" @click="toggleVoiceRecognition">
              {{ voiceRecognitionActive ? '⏹️' : '🎤' }}
            </button>
            <input type="text" v-model="chatInput" placeholder="输入您的问题或感受..." @keyup.enter="sendMessage">
            <button class="send-btn" @click="sendMessage">发送</button>
          </div>
        </div>
      </section>
    </main>

    <!-- 设置弹窗 -->
    <div v-if="showConfigModal" class="modal-overlay" @click.self="showConfigModal = false">
      <div class="modal-content glass">
        <h3>系统设置</h3>
        <div class="setting-item">
          <label>AI 服务商</label>
          <select v-model="apiConfig.activeAIService">
            <option value="deepseek">DeepSeek (推荐)</option>
            <option value="modelarts">Huawei ModelArts</option>
          </select>
        </div>
        <button class="close-btn" @click="showConfigModal = false">保存并关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
// 语音识别服务
class VoiceRecognitionService {
  constructor() {
    this.recognition = null;
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    if (this.isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'zh-CN';
      this.recognition.onresult = (e) => {
        let interim = '';
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        if (this.onTranscript) this.onTranscript(final, interim);
      };
      this.recognition.onend = () => { if (this.onEnd) this.onEnd(); };
    }
  }
  start() { if (this.isSupported) this.recognition.start(); }
  stop() { if (this.isSupported) this.recognition.stop(); }
}

export default {
  data() {
    return {
      isPlaying: false,
      volume: 70,
      audioPlayer: null,
      currentMeditation: { icon: '🧘', title: '深度冥想', description: '放松身心，进入深层冥想状态', duration: 20, audioId: 'relaxation' },
      recommendedMeditations: [
        { id: 1, icon: '😴', title: '深度睡眠', matchScore: 0.95, duration: 15, audioId: 'sleep_music' },
        { id: 2, icon: '🎯', title: '专注训练', matchScore: 0.88, duration: 10, audioId: 'attention' },
        { id: 3, icon: '🌧️', title: '雨声冥想', matchScore: 0.82, duration: 20, audioId: 'rain' }
      ],
      bioData: { heartRate: 68, focusLevel: 0.5, stressLevel: 0.3 },
      chatInput: '',
      chatHistory: [{ type: 'ai', text: '您好！我是您的冥想AI助手。今天感觉如何？您可以直接跟我聊天，或者点击麦克风通过语音告诉我。' }],
      isAIThinking: false,
      voiceRecognitionActive: false,
      voiceService: null,
      showConfigModal: false,
      apiConfig: { activeAIService: 'deepseek' }
    };
  },
  mounted() {
    this.audioPlayer = new Audio();
    this.voiceService = new VoiceRecognitionService();
    this.voiceService.onTranscript = (final, interim) => {
      if (final) {
        this.chatInput = final;
        this.sendMessage();
      } else {
        this.chatInput = interim;
      }
    };
    this.voiceService.onEnd = () => { this.voiceRecognitionActive = false; };
    this.startBioSimulation();
  },
  methods: {
    togglePlayPause() {
      if (this.isPlaying) {
        this.audioPlayer.pause();
      } else {
        // 修复音频路径：在 Vite 中，public 目录下的文件直接通过 / 访问
        const filenameMap = {
          'relaxation': 'fixed_relax_state_meditation.mp3',
          'sleep_music': 'fixed_sleep_music_master_talk.mp3',
          'attention': 'fixed_attention.mp3',
          'rain': 'fixed_rain.mp3'
        };
        const filename = filenameMap[this.currentMeditation.audioId] || 'fixed_rain.mp3';
        this.audioPlayer.src = `/audio/${filename}`;
        this.audioPlayer.volume = this.volume / 100;
        this.audioPlayer.play().catch(err => {
          console.error('播放失败:', err);
          this.addChatMessage('system', '音频加载失败，请检查网络或资源。');
        });
      }
      this.isPlaying = !this.isPlaying;
    },
    updateVolume() {
      if (this.audioPlayer) this.audioPlayer.volume = this.volume / 100;
    },
    sendMessage() {
      if (!this.chatInput.trim()) return;
      const text = this.chatInput;
      this.addChatMessage('user', text);
      this.chatInput = '';
      this.isAIThinking = true;
      
      // 模拟 AI 回复
      setTimeout(() => {
        this.isAIThinking = false;
        let reply = "我听到了。根据您的描述，我建议您尝试一下我们的“深度放松”冥想，它可以有效缓解您的情绪。";
        if (text.includes('累') || text.includes('压力')) reply = "听起来您今天很辛苦。深呼吸，让我们开始一段10分钟的放松之旅吧。";
        if (text.includes('睡')) reply = "好的，我为您准备了助眠音乐，希望能帮您进入梦乡。";
        this.addChatMessage('ai', reply);
      }, 1000);
    },
    addChatMessage(type, text) {
      this.chatHistory.push({ type, text });
      this.$nextTick(() => {
        const el = this.$refs.chatScroll;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    clearChat() {
      this.chatHistory = [this.chatHistory[0]];
    },
    toggleVoiceRecognition() {
      if (this.voiceRecognitionActive) {
        this.voiceService.stop();
        this.voiceRecognitionActive = false;
      } else {
        this.voiceService.start();
        this.voiceRecognitionActive = true;
      }
    },
    selectMeditation(item) {
      this.currentMeditation = { ...item };
      if (this.isPlaying) {
        this.isPlaying = false;
        this.togglePlayPause();
      }
    },
    startBioSimulation() {
      setInterval(() => {
        if (this.isPlaying) {
          this.bioData.heartRate = 62 + Math.random() * 5;
          this.bioData.focusLevel = Math.min(1, this.bioData.focusLevel + 0.01);
          this.bioData.stressLevel = Math.max(0, this.bioData.stressLevel - 0.01);
        } else {
          this.bioData.heartRate = 70 + Math.random() * 10;
        }
      }, 2000);
    }
  }
};
</script>

<style scoped>
.app-container { min-height: 100vh; color: #e2e8f0; font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; overflow: hidden; }
.gradient-bg { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at top right, #1e293b, #0f172a); z-index: -1; }
.glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; }

.app-header { padding: 1rem 2rem; display: flex; justify-content: center; border-radius: 0; border-top: none; border-left: none; border-right: none; }
.header-content { width: 100%; max-width: 1200px; display: flex; justify-content: space-between; align-items: center; }
.logo { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1.25rem; color: #10b981; }
.status-badge { font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 99px; background: rgba(255,255,255,0.05); color: #94a3b8; }
.status-badge.active { background: rgba(16, 185, 129, 0.2); color: #10b981; }

.app-main { flex: 1; display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; padding: 1.5rem; max-width: 1200px; margin: 0 auto; width: 100%; overflow: hidden; }
.side-panel { display: flex; flex-direction: column; gap: 1.5rem; }
.card { padding: 1.25rem; }
.card h3 { font-size: 0.9rem; color: #94a3b8; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }

.bio-grid { display: flex; flex-direction: column; gap: 1rem; }
.bio-item { display: flex; flex-direction: column; gap: 0.4rem; }
.bio-label { font-size: 0.8rem; color: #64748b; }
.bio-value { font-size: 1.25rem; font-weight: 600; color: #10b981; }
.bio-bar { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
.fill { height: 100%; background: #3b82f6; transition: width 0.5s; }
.fill.relax { background: #10b981; }

.rec-list { display: flex; flex-direction: column; gap: 0.75rem; }
.rec-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 12px; cursor: pointer; transition: background 0.2s; }
.rec-item:hover { background: rgba(255,255,255,0.05); }
.rec-icon { font-size: 1.5rem; }
.rec-name { font-size: 0.9rem; font-weight: 500; }
.rec-meta { font-size: 0.75rem; color: #64748b; }

.center-content { display: flex; flex-direction: column; gap: 1.5rem; overflow: hidden; }
.player-card { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
.player-info { display: flex; align-items: center; gap: 1.5rem; }
.current-icon { font-size: 4rem; }
.current-details h2 { font-size: 1.5rem; margin-bottom: 0.25rem; }
.current-details p { color: #94a3b8; font-size: 0.9rem; }

.player-controls { display: flex; align-items: center; gap: 2rem; }
.play-btn { width: 64px; height: 64px; border-radius: 50%; border: none; background: #10b981; color: white; font-size: 1.5rem; cursor: pointer; transition: transform 0.2s; }
.play-btn:hover { transform: scale(1.05); }
.volume-ctrl { display: flex; align-items: center; gap: 0.75rem; flex: 1; color: #64748b; font-size: 0.8rem; }
.volume-ctrl input { flex: 1; accent-color: #10b981; }

.chat-card { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.chat-header { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; color: #94a3b8; }
.clear-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.8rem; }
.chat-history { flex: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
.message { display: flex; }
.message.user { justify-content: flex-end; }
.msg-bubble { max-width: 80%; padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.9rem; line-height: 1.5; }
.message.ai .msg-bubble { background: rgba(255,255,255,0.05); color: #e2e8f0; }
.message.user .msg-bubble { background: #10b981; color: white; }
.message.thinking .msg-bubble { color: #64748b; font-style: italic; }

.chat-input-area { padding: 1rem; display: flex; gap: 0.75rem; background: rgba(0,0,0,0.2); }
.chat-input-area input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.6rem 1rem; color: white; outline: none; }
.voice-btn, .send-btn { padding: 0.6rem 1rem; border-radius: 8px; border: none; cursor: pointer; transition: background 0.2s; }
.voice-btn { background: rgba(255,255,255,0.05); color: #94a3b8; }
.voice-btn.active { background: #ef4444; color: white; }
.send-btn { background: #3b82f6; color: white; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { width: 400px; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
.setting-item { display: flex; flex-direction: column; gap: 0.5rem; }
.setting-item select { background: #1e293b; color: white; border: 1px solid rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 4px; }
.close-btn { background: #10b981; color: white; border: none; padding: 0.75rem; border-radius: 8px; cursor: pointer; }

@media (max-width: 900px) {
  .app-main { grid-template-columns: 1fr; overflow-y: auto; }
  .side-panel { order: 2; }
  .center-content { order: 1; }
}
</style>
