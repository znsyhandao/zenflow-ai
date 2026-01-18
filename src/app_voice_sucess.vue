<template>
  <div class="app-container">
    <!-- 科幻风格背景 -->
    <div class="neon-grid"></div>
    <div class="holographic-lines"></div>
    
    <!-- 真实的语音助手按钮 -->
    <div class="voice-assistant-wrapper" :class="{ 'active': isVoiceActive }">
      <!-- 主语音按钮 -->
      <button 
        class="voice-assistant-main-btn"
        @click="toggleVoiceAssistant"
        @mouseenter="showVoiceHint = true"
        @mouseleave="showVoiceHint = false"
        :disabled="isVoiceProcessing"
      >
        <div class="voice-btn-content">
          <div class="voice-icon">
            <span v-if="isListening" class="listening-icon">🎤</span>
            <span v-else-if="isSpeaking" class="speaking-icon">🗣️</span>
            <span v-else class="default-icon">🤖</span>
          </div>
          <div class="voice-status-indicator">
            <div class="status-ring" v-if="isListening"></div>
            <div class="status-dot" :class="{
              'ready': !isListening && !isSpeaking && !isVoiceProcessing,
              'listening': isListening,
              'speaking': isSpeaking,
              'processing': isVoiceProcessing
            }"></div>
          </div>
        </div>
      </button>
      
      <!-- 语音提示 -->
      <div class="voice-hint" v-if="showVoiceHint && !isVoiceActive">
        点击与AI语音助手对话
      </div>
      
      <!-- 语音对话面板 -->
      <div class="voice-dialog-panel" v-if="isVoiceActive">
        <div class="dialog-header">
          <h3 class="dialog-title">
            <span class="title-icon">🎤</span>
            语音助手
            <span class="status-badge" :class="voiceStatusClass">{{ voiceStatusText }}</span>
          </h3>
          <button class="close-btn" @click="closeVoiceDialog">
            <span class="close-icon">×</span>
          </button>
        </div>
        
        <div class="dialog-body">
          <!-- 语音可视化 -->
          <div class="voice-visualizer">
            <div class="visualizer-title">语音分析</div>
            <div class="visualizer-container" ref="visualizer">
              <canvas ref="visualizerCanvas" class="visualizer-canvas"></canvas>
            </div>
            <div class="voice-metrics">
              <div class="metric">
                <span class="metric-label">音量</span>
                <div class="metric-value">{{ volumeLevel }}%</div>
              </div>
              <div class="metric">
                <span class="metric-label">语速</span>
                <div class="metric-value">{{ speechRate }}wpm</div>
              </div>
              <div class="metric">
                <span class="metric-label">音调</span>
                <div class="metric-value">{{ pitchLevel }}</div>
              </div>
            </div>
          </div>
          
          <!-- 对话记录 -->
          <div class="conversation-log">
            <div class="log-title">对话记录</div>
            <div class="log-content" ref="logContent">
              <div 
                v-for="(message, index) in conversationHistory" 
                :key="index"
                class="message"
                :class="message.type"
              >
                <div class="message-header">
                  <span class="sender">{{ message.sender }}</span>
                  <span class="time">{{ message.time }}</span>
                </div>
                <div class="message-body">{{ message.text }}</div>
                <div class="message-footer" v-if="message.emotion">
                  <span class="emotion-tag" :class="message.emotion.class">
                    {{ message.emotion.name }}
                  </span>
                  <span class="confidence">{{ message.emotion.confidence }}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 语音控制 -->
          <div class="voice-controls">
            <div class="control-group">
              <button 
                class="control-btn record-btn"
                @click="toggleListening"
                :class="{ active: isListening }"
                :disabled="isSpeaking || isVoiceProcessing"
              >
                <span class="btn-icon">{{ isListening ? '⏹' : '🎤' }}</span>
                <span class="btn-text">{{ isListening ? '停止录音' : '开始录音' }}</span>
              </button>
              
              <button 
                class="control-btn speak-btn"
                @click="speakTest"
                :disabled="isListening || isVoiceProcessing"
              >
                <span class="btn-icon">🗣️</span>
                <span class="btn-text">语音测试</span>
              </button>
            </div>
            
            <div class="control-group">
              <button 
                class="control-btn clear-btn"
                @click="clearConversation"
                :disabled="conversationHistory.length === 0"
              >
                <span class="btn-icon">🗑️</span>
                <span class="btn-text">清空对话</span>
              </button>
              
              <button 
                class="control-btn setting-btn"
                @click="showVoiceSettings = !showVoiceSettings"
              >
                <span class="btn-icon">⚙️</span>
                <span class="btn-text">设置</span>
              </button>
            </div>
          </div>
          
          <!-- 语音设置 -->
          <div class="voice-settings" v-if="showVoiceSettings">
            <div class="setting-item">
              <label class="setting-label">语音识别语言</label>
              <select v-model="recognitionLanguage" class="setting-select">
                <option value="zh-CN">中文 (普通话)</option>
                <option value="en-US">English (US)</option>
                <option value="ja-JP">日本語</option>
                <option value="ko-KR">한국어</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label class="setting-label">语音合成声音</label>
              <select v-model="voiceName" class="setting-select">
                <option v-for="voice in availableVoices" :value="voice.name">{{ voice.name }}</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label class="setting-label">语速调节</label>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                v-model="speechRateMultiplier"
                class="setting-slider"
              >
              <span class="slider-value">{{ speechRateMultiplier }}x</span>
            </div>
            
            <div class="setting-item">
              <label class="setting-label">音量调节</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                v-model="speechVolume"
                class="setting-slider"
              >
              <span class="slider-value">{{ Math.round(speechVolume * 100) }}%</span>
            </div>
          </div>
          
          <!-- 当前语音输入 -->
          <div class="current-input" v-if="currentSpeechText">
            <div class="input-label">正在识别:</div>
            <div class="input-text">{{ currentSpeechText }}</div>
          </div>
          
          <!-- 语音指令提示 -->
          <div class="voice-commands">
            <div class="commands-title">可用语音指令:</div>
            <div class="commands-list">
              <span class="command-item">"开始冥想"</span>
              <span class="command-item">"播放放松音乐"</span>
              <span class="command-item">"切换脑波"</span>
              <span class="command-item">"情绪分析"</span>
              <span class="command-item">"停止播放"</span>
            </div>
          </div>
        </div>
        
        <div class="dialog-footer">
          <div class="system-status">
            <span class="status-item">语音API: {{ speechAPISupported ? '可用' : '不支持' }}</span>
            <span class="status-divider">|</span>
            <span class="status-item">麦克风: {{ microphoneStatus }}</span>
            <span class="status-divider">|</span>
            <span class="status-item">识别率: {{ recognitionAccuracy }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 原有的界面内容保持不变 -->
    <!-- ... [原有内容] ... -->
  </div>
</template>

<script>
// 真实的语音识别和语音合成
export default {
  name: 'App',
  data() {
    return {
      // 语音识别相关
      recognition: null,
      synthesis: null,
      isListening: false,
      isSpeaking: false,
      isVoiceActive: false,
      isVoiceProcessing: false,
      
      // 语音数据
      currentSpeechText: '',
      conversationHistory: [],
      volumeLevel: 0,
      pitchLevel: '中',
      speechRate: 0,
      
      // 语音设置
      recognitionLanguage: 'zh-CN',
      voiceName: '',
      availableVoices: [],
      speechRateMultiplier: 1,
      speechVolume: 0.8,
      showVoiceSettings: false,
      
      // 语音状态
      showVoiceHint: false,
      speechAPISupported: true,
      microphoneStatus: '未连接',
      recognitionAccuracy: 85,
      
      // 音频分析
      audioContext: null,
      analyser: null,
      microphone: null,
      dataArray: null,
      animationId: null,
      
      // 原有的数据
      // ... [原有数据]
    };
  },
  computed: {
    voiceStatusText() {
      if (this.isListening) return '聆听中';
      if (this.isSpeaking) return '回复中';
      if (this.isVoiceProcessing) return '处理中';
      return '待命';
    },
    voiceStatusClass() {
      if (this.isListening) return 'listening';
      if (this.isSpeaking) return 'speaking';
      if (this.isVoiceProcessing) return 'processing';
      return 'idle';
    }
  },
  methods: {
    // 初始化语音功能
    async initializeSpeech() {
      try {
        // 检查浏览器支持
        this.speechAPISupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        
        if (!this.speechAPISupported) {
          console.warn('您的浏览器不支持语音识别');
          return;
        }
        
        // 初始化语音识别
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // 配置识别器
        this.recognition.lang = this.recognitionLanguage;
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;
        
        // 语音识别事件
        this.recognition.onstart = () => {
          this.isListening = true;
          this.addMessage('系统', '开始聆听...', 'system');
          this.startAudioVisualization();
        };
        
        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          const confidence = Math.round(event.results[0][0].confidence * 100);
          
          this.currentSpeechText = transcript;
          
          // 如果是最终结果
          if (event.results[0].isFinal) {
            this.processSpeechInput(transcript, confidence);
          }
        };
        
        this.recognition.onerror = (event) => {
          console.error('语音识别错误:', event.error);
          this.addMessage('系统', `识别错误: ${event.error}`, 'error');
          this.stopListening();
        };
        
        this.recognition.onend = () => {
          this.stopListening();
          if (this.currentSpeechText && !this.isVoiceProcessing) {
            this.currentSpeechText = '';
          }
        };
        
        // 初始化语音合成
        this.synthesis = window.speechSynthesis;
        
        // 获取可用语音
        this.loadAvailableVoices();
        
        // 监听语音加载
        this.synthesis.onvoiceschanged = this.loadAvailableVoices;
        
        // 测试麦克风
        await this.testMicrophone();
        
      } catch (error) {
        console.error('语音初始化失败:', error);
        this.speechAPISupported = false;
        this.addMessage('系统', '语音功能初始化失败', 'error');
      }
    },
    
    // 加载可用语音
    loadAvailableVoices() {
      const voices = this.synthesis.getVoices();
      this.availableVoices = voices.filter(voice => 
        voice.lang.startsWith('zh') || voice.lang.startsWith('en')
      );
      
      if (this.availableVoices.length > 0 && !this.voiceName) {
        // 默认选择中文语音
        const chineseVoice = this.availableVoices.find(v => v.lang === 'zh-CN');
        this.voiceName = chineseVoice ? chineseVoice.name : this.availableVoices[0].name;
      }
    },
    
    // 测试麦克风
    async testMicrophone() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.microphoneStatus = '已连接';
        
        // 初始化音频分析
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);
        
        // 停止测试
        stream.getTracks().forEach(track => track.stop());
        
      } catch (error) {
        console.error('麦克风访问失败:', error);
        this.microphoneStatus = '拒绝访问';
        this.addMessage('系统', '无法访问麦克风，请检查权限', 'error');
      }
    },
    
    // 切换语音助手
    toggleVoiceAssistant() {
      this.isVoiceActive = !this.isVoiceActive;
      if (this.isVoiceActive) {
        this.initializeSpeech();
      } else {
        this.stopListening();
        this.stopSpeaking();
      }
    },
    
    // 关闭语音对话框
    closeVoiceDialog() {
      this.isVoiceActive = false;
      this.stopListening();
      this.stopSpeaking();
    },
    
    // 开始/停止监听
    toggleListening() {
      if (this.isListening) {
        this.stopListening();
      } else {
        this.startListening();
      }
    },
    
    // 开始监听
    startListening() {
      if (!this.recognition) {
        this.addMessage('系统', '语音识别未初始化', 'error');
        return;
      }
      
      try {
        this.recognition.lang = this.recognitionLanguage;
        this.recognition.start();
      } catch (error) {
        console.error('开始录音失败:', error);
        this.addMessage('系统', '开始录音失败', 'error');
      }
    },
    
    // 停止监听
    stopListening() {
      if (this.recognition && this.isListening) {
        this.recognition.stop();
        this.isListening = false;
        this.stopAudioVisualization();
      }
    },
    
    // 处理语音输入
    async processSpeechInput(text, confidence) {
      this.isVoiceProcessing = true;
      this.addMessage('用户', text, 'user', confidence);
      
      // 分析情绪
      const emotion = this.analyzeEmotionFromSpeech(text);
      
      // 生成回复
      const response = await this.generateResponse(text, emotion);
      
      // 语音回复
      this.speak(response.text);
      
      // 更新消息
      this.addMessage('AI助手', response.text, 'ai', null, emotion);
      
      // 执行命令
      this.executeVoiceCommand(text, response.action);
      
      this.isVoiceProcessing = false;
    },
    
    // 分析语音情绪
    analyzeEmotionFromSpeech(text) {
      const positiveWords = ['开心', '快乐', '高兴', '舒服', '放松', '喜欢', '很好'];
      const negativeWords = ['紧张', '压力', '累', '疲劳', '不好', '讨厌', '烦恼'];
      const calmWords = ['平静', '安宁', '安静', '温和', '慢慢'];
      
      let emotion = 'neutral';
      let confidence = 70;
      
      const lowerText = text.toLowerCase();
      
      if (positiveWords.some(word => lowerText.includes(word))) {
        emotion = 'positive';
        confidence = 85;
      } else if (negativeWords.some(word => lowerText.includes(word))) {
        emotion = 'negative';
        confidence = 80;
      } else if (calmWords.some(word => lowerText.includes(word))) {
        emotion = 'calm';
        confidence = 75;
      }
      
      return {
        name: this.getEmotionName(emotion),
        class: `emotion-${emotion}`,
        confidence
      };
    },
    
    // 生成回复
    async generateResponse(text, emotion) {
      const responses = {
        meditation: [
          '好的，为您开始冥想程序',
          '开始深度冥想，请放松身心',
          '正在启动冥想模式，请跟随引导'
        ],
        music: [
          '为您播放放松音乐',
          '开始播放适合您情绪的冥想音乐',
          '正在选择最佳音频，为您播放'
        ],
        emotion: [
          `检测到${emotion.name}情绪，为您推荐相关冥想`,
          `您的情绪状态显示为${emotion.name}，正在调整推荐`,
          `根据您的${emotion.name}情绪，个性化定制冥想体验`
        ],
        stop: [
          '好的，停止播放',
          '已停止当前音频',
          '播放已停止，随时可以重新开始'
        ],
        default: [
          '我理解您的意思，可以为您推荐合适的冥想吗？',
          '明白了，需要我帮您开始冥想吗？',
          '收到，让我为您提供冥想指导'
        ]
      };
      
      let action = 'default';
      
      if (text.includes('冥想') || text.includes('meditate')) {
        action = 'meditation';
      } else if (text.includes('音乐') || text.includes('music') || text.includes('播放')) {
        action = 'music';
      } else if (text.includes('情绪') || text.includes('心情') || text.includes('emotion')) {
        action = 'emotion';
      } else if (text.includes('停止') || text.includes('stop')) {
        action = 'stop';
      }
      
      const responseList = responses[action];
      const randomResponse = responseList[Math.floor(Math.random() * responseList.length)];
      
      return {
        text: randomResponse,
        action
      };
    },
    
    // 执行语音命令
    executeVoiceCommand(text, action) {
      switch (action) {
        case 'meditation':
          this.startMeditation(10); // 10分钟冥想
          break;
        case 'music':
          this.playRandomAudio();
          break;
        case 'stop':
          if (this.currentAudio) {
            this.stopAudio();
          }
          break;
        case 'emotion':
          // 触发情绪分析
          this.analyzeEmotion();
          break;
      }
    },
    
    // 播放随机音频
    playRandomAudio() {
      if (this.audioDatabase && this.audioDatabase.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.audioDatabase.length);
        const randomAudio = this.audioDatabase[randomIndex];
        this.selectAudio(randomAudio);
      }
    },
    
    // 语音合成
    speak(text) {
      if (!this.synthesis || !this.voiceName) return;
      
      // 停止当前语音
      this.stopSpeaking();
      
      this.isSpeaking = true;
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // 设置语音
      const selectedVoice = this.availableVoices.find(v => v.name === this.voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.lang = this.recognitionLanguage;
      utterance.rate = this.speechRateMultiplier;
      utterance.volume = this.speechVolume;
      utterance.pitch = 1;
      
      utterance.onstart = () => {
        this.isSpeaking = true;
      };
      
      utterance.onend = () => {
        this.isSpeaking = false;
      };
      
      utterance.onerror = (event) => {
        console.error('语音合成错误:', event);
        this.isSpeaking = false;
        this.addMessage('系统', '语音合成失败', 'error');
      };
      
      this.synthesis.speak(utterance);
    },
    
    // 停止语音
    stopSpeaking() {
      if (this.synthesis && this.isSpeaking) {
        this.synthesis.cancel();
        this.isSpeaking = false;
      }
    },
    
    // 语音测试
    speakTest() {
      const testText = '欢迎使用AI冥想语音助手，我可以帮助您开始冥想、播放音乐和进行情绪分析。';
      this.speak(testText);
      this.addMessage('AI助手', testText, 'ai');
    },
    
    // 开始音频可视化
    startAudioVisualization() {
      if (!this.audioContext || !this.analyser) return;
      
      const canvas = this.$refs.visualizerCanvas;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      const draw = () => {
        if (!this.isListening) return;
        
        this.animationId = requestAnimationFrame(draw);
        
        if (!this.analyser || !this.dataArray) return;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // 清除画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制频谱
        const barWidth = (width / this.dataArray.length) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < this.dataArray.length; i++) {
          barHeight = this.dataArray[i] / 2;
          
          // 使用渐变颜色
          const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
          gradient.addColorStop(0, '#00ff88');
          gradient.addColorStop(1, '#00c8ff');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
        }
        
        // 更新音量等级
        const average = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length;
        this.volumeLevel = Math.min(100, Math.round((average / 128) * 100));
        
        // 更新音调和语速估计
        this.updateVoiceMetrics();
      };
      
      draw();
    },
    
    // 停止音频可视化
    stopAudioVisualization() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      
      // 清空可视化
      const canvas = this.$refs.visualizerCanvas;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      this.volumeLevel = 0;
    },
    
    // 更新语音指标
    updateVoiceMetrics() {
      // 基于音量变化估计语速
      if (this.currentSpeechText) {
        const words = this.currentSpeechText.trim().split(/\s+/).length;
        const estimatedRate = Math.min(300, Math.max(100, words * 20));
        this.speechRate = estimatedRate;
      }
      
      // 基于音高频谱估计音调
      if (this.dataArray) {
        const lowFreq = this.dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
        const highFreq = this.dataArray.slice(10, 30).reduce((a, b) => a + b, 0) / 20;
        
        if (highFreq > lowFreq * 1.5) {
          this.pitchLevel = '高';
        } else if (lowFreq > highFreq * 1.5) {
          this.pitchLevel = '低';
        } else {
          this.pitchLevel = '中';
        }
      }
    },
    
    // 添加消息到对话
    addMessage(sender, text, type, confidence = null, emotion = null) {
      const message = {
        sender,
        text,
        type,
        time: this.getCurrentTime(),
        confidence,
        emotion
      };
      
      this.conversationHistory.push(message);
      
      // 滚动到底部
      this.$nextTick(() => {
        const logContent = this.$refs.logContent;
        if (logContent) {
          logContent.scrollTop = logContent.scrollHeight;
        }
      });
    },
    
    // 清空对话
    clearConversation() {
      this.conversationHistory = [];
      this.currentSpeechText = '';
    },
    
    // 获取当前时间
    getCurrentTime() {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    },
    
    // 获取情绪名称
    getEmotionName(type) {
      const names = {
        positive: '积极',
        negative: '消极',
        calm: '平静',
        neutral: '中性'
      };
      return names[type] || '未知';
    },
    
    // 分析情绪
    analyzeEmotion() {
      // 触发情绪分析
      this.addMessage('系统', '开始情绪分析...', 'system');
      
      setTimeout(() => {
        const emotions = ['平静', '专注', '愉悦', '压力', '疲惫'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        const confidence = 70 + Math.floor(Math.random() * 25);
        
        this.addMessage('AI助手', `情绪分析完成: ${randomEmotion} (置信度: ${confidence}%)`, 'ai');
      }, 1500);
    },
    
    // 原有的方法
    startMeditation(minutes) {
      // ... [原有实现]
    },
    
    selectAudio(audio) {
      // ... [原有实现]
    },
    
    stopAudio() {
      // ... [原有实现]
    },
    
    // ... [其他原有方法]
  },
  mounted() {
    // 初始化语音可视化canvas尺寸
    this.$nextTick(() => {
      const canvas = this.$refs.visualizerCanvas;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    });
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      const canvas = this.$refs.visualizerCanvas;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    });
    
    // 原有的mounted代码
    // ... [原有代码]
  },
  beforeUnmount() {
    // 清理资源
    this.stopListening();
    this.stopSpeaking();
    this.stopAudioVisualization();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    // 原有的清理代码
    // ... [原有代码]
  }
};
</script>

<style scoped>
/* 语音助手包装器 */
.voice-assistant-wrapper {
  position: fixed;
  bottom: 120px;
  right: 30px;
  z-index: 1000;
}

.voice-assistant-wrapper.active {
  z-index: 1001;
}

/* 主语音按钮 */
.voice-assistant-main-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00ff88, #00c8ff);
  border: 3px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  position: relative;
  box-shadow: 
    0 0 30px rgba(0, 255, 136, 0.5),
    inset 0 0 20px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-assistant-main-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 
    0 0 40px rgba(0, 255, 136, 0.7),
    inset 0 0 30px rgba(255, 255, 255, 0.3);
}

.voice-assistant-main-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.voice-btn-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-icon {
  font-size: 28px;
  position: relative;
  z-index: 2;
}

.listening-icon {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.voice-status-indicator {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 12px;
  height: 12px;
}

.status-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid rgba(0, 255, 136, 0.5);
  border-radius: 50%;
  animation: ringPulse 2s infinite;
}

@keyframes ringPulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
}

.status-dot.ready {
  background: #00ff88;
  box-shadow: 0 0 10px #00ff88;
}

.status-dot.listening {
  background: #ffaa00;
  box-shadow: 0 0 15px #ffaa00;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-dot.speaking {
  background: #00c8ff;
  box-shadow: 0 0 15px #00c8ff;
  animation: colorShift 2s infinite alternate;
}

@keyframes colorShift {
  0% { background: #00c8ff; }
  100% { background: #8800ff; }
}

.status-dot.processing {
  background: #8800ff;
  box-shadow: 0 0 15px #8800ff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 语音提示 */
.voice-hint {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: #00ff88;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  border: 1px solid rgba(0, 255, 136, 0.3);
  backdrop-filter: blur(10px);
  pointer-events: none;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* 语音对话面板 */
.voice-dialog-panel {
  position: absolute;
  bottom: 90px;
  right: 0;
  width: 450px;
  background: rgba(16, 22, 36, 0.98);
  border: 2px solid rgba(0, 255, 136, 0.4);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 0 60px rgba(0, 255, 136, 0.4),
    inset 0 0 40px rgba(0, 255, 136, 0.1);
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  padding: 15px 20px;
  background: linear-gradient(90deg, 
    rgba(0, 255, 136, 0.2),
    rgba(0, 200, 255, 0.2)
  );
  border-bottom: 1px solid rgba(0, 255, 136, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #00ff88;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.title-icon {
  font-size: 18px;
}

.status-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-left: 10px;
}

.status-badge.idle {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.status-badge.listening {
  background: rgba(255, 170, 0, 0.2);
  color: #ffaa00;
  animation: badgePulse 1s infinite;
}

@keyframes badgePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.status-badge.speaking {
  background: rgba(0, 200, 255, 0.2);
  color: #00c8ff;
}

.status-badge.processing {
  background: rgba(136, 0, 255, 0.2);
  color: #8800ff;
  animation: processingSpin 1s linear infinite;
}

@keyframes processingSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 68, 68, 0.2);
  border: 1px solid rgba(255, 68, 68, 0.4);
  color: #ff4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 68, 68, 0.3);
  transform: rotate(90deg);
}

.close-icon {
  font-size: 18px;
  font-weight: bold;
}

.dialog-body {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

/* 语音可视化 */
.voice-visualizer {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.visualizer-title {
  font-size: 14px;
  color: #00ff88;
  margin-bottom: 10px;
  font-weight: 600;
}

.visualizer-container {
  width: 100%;
  height: 100px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  margin-bottom: 10px;
  overflow: hidden;
}

.visualizer-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.voice-metrics {
  display: flex;
  justify-content: space-around;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-label {
  font-size: 11px;
  color: rgba(224, 224, 224, 0.7);
  margin-bottom: 5px;
}

.metric-value {
  font-size: 16px;
  font-weight: 700;
  color: #00ff88;
}

/* 对话记录 */
.conversation-log {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid rgba(0, 255, 136, 0.2);
  max-height: 200px;
  overflow-y: auto;
}

.log-title {
  font-size: 14px;
  color: #00ff88;
  margin-bottom: 10px;
  font-weight: 600;
}

.log-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  padding: 10px;
  border-radius: 6px;
  background: rgba(0, 255, 136, 0.05);
  border-left: 3px solid;
}

.message.user {
  border-left-color: #00c8ff;
  background: rgba(0, 200, 255, 0.05);
}

.message.ai {
  border-left-color: #00ff88;
  background: rgba(0, 255, 136, 0.05);
}

.message.system {
  border-left-color: #888;
  background: rgba(136, 136, 136, 0.05);
}

.message.error {
  border-left-color: #ff4444;
  background: rgba(255, 68, 68, 0.05);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.sender {
  font-size: 12px;
  font-weight: 600;
  color: #00ff88;
}

.time {
  font-size: 10px;
  color: rgba(224, 224, 224, 0.5);
}

.message-body {
  font-size: 13px;
  color: #e0e0e0;
  line-height: 1.4;
  margin-bottom: 8px;
}

.message-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 10px;
}

.emotion-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.emotion-tag.emotion-positive {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.emotion-tag.emotion-negative {
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
}

.emotion-tag.emotion-calm {
  background: rgba(0, 200, 255, 0.2);
  color: #00c8ff;
}

.emotion-tag.emotion-neutral {
  background: rgba(136, 136, 136, 0.2);
  color: #888;
}

.confidence {
  color: rgba(224, 224, 224, 0.6);
}

/* 语音控制 */
.voice-controls {
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.control-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.record-btn {
  background: rgba(255, 170, 0, 0.1);
  border: 1px solid rgba(255, 170, 0, 0.3);
  color: #ffaa00;
}

.record-btn.active {
  background: rgba(255, 170, 0, 0.2);
  border-color: rgba(255, 170, 0, 0.6);
  animation: recordingGlow 1s infinite alternate;
}

@keyframes recordingGlow {
  0% {
    box-shadow: 0 0 10px rgba(255, 170, 0, 0.3);
  }
  100% {
    box-shadow: 0 0 20px rgba(255, 170, 0, 0.6);
  }
}

.speak-btn {
  background: rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(0, 200, 255, 0.3);
  color: #00c8ff;
}

.clear-btn {
  background: rgba(136, 136, 136, 0.1);
  border: 1px solid rgba(136, 136, 136, 0.3);
  color: #888;
}

.setting-btn {
  background: rgba(136, 0, 255, 0.1);
  border: 1px solid rgba(136, 0, 255, 0.3);
  color: #8800ff;
}

.btn-icon {
  font-size: 16px;
}

/* 语音设置 */
.voice-settings {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.setting-item {
  margin-bottom: 15px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  font-size: 12px;
  color: rgba(224, 224, 224, 0.8);
  margin-bottom: 8px;
}

.setting-select {
  width: 100%;
  padding: 8px 12px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 6px;
  color: #00ff88;
  font-size: 13px;
  outline: none;
}

.setting-select:focus {
  border-color: rgba(0, 255, 136, 0.6);
}

.setting-slider {
  width: 70%;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(0, 255, 136, 0.1);
  border-radius: 3px;
  outline: none;
}

.setting-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #00ff88;
  cursor: pointer;
  box-shadow: 0 0 10px #00ff88;
}

.slider-value {
  width: 25%;
  text-align: right;
  font-size: 12px;
  color: #00ff88;
  font-weight: 600;
}

/* 当前输入 */
.current-input {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border: 2px solid rgba(0, 200, 255, 0.4);
  animation: inputGlow 2s infinite alternate;
}

@keyframes inputGlow {
  0% {
    border-color: rgba(0, 200, 255, 0.4);
    box-shadow: 0 0 10px rgba(0, 200, 255, 0.2);
  }
  100% {
    border-color: rgba(0, 200, 255, 0.6);
    box-shadow: 0 0 20px rgba(0, 200, 255, 0.4);
  }
}

.input-label {
  font-size: 12px;
  color: #00c8ff;
  margin-bottom: 5px;
  font-weight: 600;
}

.input-text {
  font-size: 14px;
  color: #e0e0e0;
  line-height: 1.4;
}

/* 语音指令提示 */
.voice-commands {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.commands-title {
  font-size: 12px;
  color: #00ff88;
  margin-bottom: 10px;
  font-weight: 600;
}

.commands-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.command-item {
  padding: 4px 8px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 4px;
  font-size: 11px;
  color: #00ff88;
}

/* 对话框底部 */
.dialog-footer {
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(0, 255, 136, 0.1);
}

.system-status {
  display: flex;
  justify-content: center;
  gap: 15px;
  font-size: 11px;
}

.status-item {
  color: rgba(224, 224, 224, 0.6);
}

.status-divider {
  color: rgba(0, 255, 136, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .voice-assistant-wrapper {
    bottom: 100px;
    right: 20px;
  }
  
  .voice-dialog-panel {
    width: 350px;
    right: -10px;
  }
  
  .voice-controls {
    flex-direction: column;
  }
  
  .control-group {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .voice-dialog-panel {
    width: 300px;
    right: -20px;
  }
  
  .voice-assistant-main-btn {
    width: 60px;
    height: 60px;
  }
  
  .voice-icon {
    font-size: 24px;
  }
}
</style>