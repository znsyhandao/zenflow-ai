<template>
  <div class="app-container">
    <!-- 简约科技风背景 -->
    <div class="gradient-bg"></div>
    
    <!-- 顶部状态栏 -->
    <header class="app-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">🧠</span>
          <span class="logo-text">智能冥想</span>
          <span class="logo-sub">MindFlow AI</span>
        </div>
      </div>
      
      <div class="header-right">
        <!-- AI服务状态 -->
        <div class="service-status">
          <div class="status-item" :class="getServiceStatus('modelarts')">
            <span class="status-icon">⚡</span>
            <span class="status-text">ModelArts</span>
          </div>
          <div class="status-item" :class="getServiceStatus('deepseek')">
            <span class="status-icon">🔮</span>
            <span class="status-text">DeepSeek</span>
          </div>
          <div class="status-item" :class="getVoiceRecognitionStatus()">
            <span class="status-icon">🎤</span>
            <span class="status-text">语音识别</span>
          </div>
        </div>
        
        <!-- 用户快捷操作 -->
        <div class="user-actions">
          <button class="action-btn" @click="toggleVoiceRecognition" :class="{ 
            'voice-active': voiceRecognitionSupported,
            'recording': voiceRecognitionActive
          }" 
          title="语音输入"
          :disabled="!voiceRecognitionSupported">
            <span class="action-icon">{{ voiceRecognitionActive ? '⏺️' : voiceRecognitionSupported ? '🎤' : '🎤❌' }}</span>
          </button>
          <button class="action-btn" @click="showConfigModal = true" title="设置">
            <span class="action-icon">⚙️</span>
          </button>
          <button class="action-btn" @click="showHelp" title="帮助">
            <span class="action-icon">❓</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 - 三栏布局 -->
    <main class="app-main">
      <!-- 左侧：用户状态面板 -->
      <div class="left-panel">
        <!-- 用户信息卡片 -->
        <div class="card user-card glass">
          <div class="card-header">
            <div class="user-profile">
              <div class="user-avatar">🧘</div>
              <div class="user-info">
                <h3 class="user-name">冥想者</h3>
                <div class="user-stats">
                  <span class="stat-item">
                    <span class="stat-icon">📅</span>
                    <span class="stat-text">第 {{ userData.days }} 天</span>
                  </span>
                  <span class="stat-item">
                    <span class="stat-icon">⏱️</span>
                    <span class="stat-text">{{ userData.totalMinutes }} 分钟</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 实时生理数据 -->
          <div class="physiological-data">
            <h4>💓 生理指标</h4>
            <div class="data-grid">
              <div class="data-item">
                <div class="data-icon">❤️</div>
                <div class="data-details">
                  <div class="data-label">心率</div>
                  <div class="data-value">{{ bioData.heartRate }} <span class="data-unit">BPM</span></div>
                </div>
                <div class="data-status" :class="getHeartRateStatus()">{{ getHeartRateStatusText() }}</div>
              </div>
              <div class="data-item">
                <div class="data-icon">🧠</div>
                <div class="data-details">
                  <div class="data-label">专注度</div>
                  <div class="data-value">{{ (bioData.focusLevel * 100).toFixed(0) }}%</div>
                </div>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: bioData.focusLevel * 100 + '%' }"></div>
                  </div>
                </div>
              </div>
              <div class="data-item">
                <div class="data-icon">⚡</div>
                <div class="data-details">
                  <div class="data-label">放松度</div>
                  <div class="data-value">{{ (100 - bioData.stressLevel * 100).toFixed(0) }}%</div>
                </div>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: (100 - bioData.stressLevel * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 语音识别状态 -->
          <div class="recording-status" v-if="voiceRecognitionActive">
            <div class="recording-indicator">
              <div class="pulse-animation"></div>
              <div class="recording-text">
                <span>语音识别中... {{ recognitionTime }}秒</span>
              </div>
            </div>
            
            <!-- 实时语音转文字显示 -->
            <div class="realtime-transcript" v-if="realtimeTranscript">
              <div class="transcript-header">
                <span class="transcript-label">实时识别:</span>
                <span class="transcript-confidence">置信度: {{ recognitionConfidence }}%</span>
              </div>
              <div class="transcript-content">
                {{ realtimeTranscript }}
              </div>
            </div>
            
            <div class="recording-controls">
              <button class="stop-recording-btn" @click="stopVoiceRecognition">
                ⏹️ 停止识别
              </button>
              <button class="transcript-action-btn" @click="confirmTranscript" v-if="realtimeTranscript">
                ✅ 使用此文本
              </button>
            </div>
          </div>
          
          <!-- 语音识别提示 -->
          <div class="voice-recognition-info" v-if="!voiceRecognitionSupported && !voiceRecognitionActive">
            <div class="info-icon">ℹ️</div>
            <div class="info-content">
              <div class="info-title">语音识别不可用</div>
              <div class="info-text">您的浏览器不支持Web Speech API，建议使用Chrome浏览器</div>
            </div>
          </div>
          
          <!-- 推荐冥想系统 -->
          <div class="recommendation-panel" v-if="!voiceRecognitionActive">
            <h4>🎯 AI推荐冥想</h4>
            <div class="recommendation-list">
              <div class="recommendation-item" 
                   v-for="item in recommendedMeditations" 
                   :key="item.id"
                   @click="selectRecommendedMeditation(item)">
                <div class="recommendation-icon">{{ item.icon }}</div>
                <div class="recommendation-content">
                  <div class="recommendation-title">{{ item.title }}</div>
                  <div class="recommendation-desc">{{ item.description }}</div>
                  <div class="recommendation-match">
                    匹配度：{{ (item.matchScore * 100).toFixed(0) }}%
                  </div>
                </div>
                <button class="recommendation-play-btn" @click.stop="playRecommendedMeditation(item)">
                  ▶️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间：主控制面板 -->
      <div class="center-panel">
        <!-- AI分析结果 -->
        <div class="card ai-analysis glass">
          <div class="card-header">
            <h3 class="card-title">🤖 AI智能分析</h3>
            <div class="ai-source">
              <span class="source-tag" :class="{ active: apiConfig.activeAIService === 'modelarts' }"
                    @click="switchAIService('modelarts')">ModelArts</span>
              <span class="source-tag" :class="{ active: apiConfig.activeAIService === 'deepseek' }"
                    @click="switchAIService('deepseek')">DeepSeek</span>
            </div>
          </div>
          
          <div class="analysis-content">
            <!-- 语音解析结果 -->
            <div class="voice-analysis" v-if="voiceTranscript">
              <div class="analysis-header">
                <h4>🎤 语音解析结果</h4>
                <div class="analysis-stats">
                  <span class="stat-badge">识别时间: {{ recognitionTime }}秒</span>
                  <span class="stat-badge">置信度: {{ recognitionConfidence }}%</span>
                </div>
              </div>
              <div class="transcript-box">
                <div class="transcript-text">{{ voiceTranscript }}</div>
                <div class="transcript-analysis">
                  <div class="analysis-result">
                    <div class="result-label">情感分析:</div>
                    <div class="result-value" :class="getEmotionClass(sentimentAnalysis.emotion)">
                      {{ sentimentAnalysis.emotion }} ({{ sentimentAnalysis.confidence }}%)
                    </div>
                  </div>
                  <div class="analysis-result">
                    <div class="result-label">关键词提取:</div>
                    <div class="result-keywords">
                      <span class="keyword-tag" v-for="keyword in extractedKeywords" :key="keyword">
                        {{ keyword }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="transcript-actions">
                  <button class="action-btn small" @click="useTranscript">
                    💬 使用此文本
                  </button>
                  <button class="action-btn small secondary" @click="analyzeTranscript">
                    🔍 深度分析
                  </button>
                  <button class="action-btn small danger" @click="clearTranscript">
                    🗑️ 清除
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 状态总结 -->
            <div class="state-summary">
              <div class="summary-card">
                <div class="summary-header">
                  <div class="summary-icon">🧠</div>
                  <div class="summary-title">认知状态</div>
                </div>
                <div class="summary-text">{{ aiAnalysis.cognitive }}</div>
                <div class="summary-confidence">
                  <div class="confidence-bar" :style="{ width: aiAnalysis.cognitiveConfidence + '%' }"></div>
                  <span class="confidence-text">{{ aiAnalysis.cognitiveConfidence }}%</span>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-header">
                  <div class="summary-icon">💆</div>
                  <div class="summary-title">情绪状态</div>
                </div>
                <div class="summary-text">{{ aiAnalysis.emotional }}</div>
                <div class="summary-confidence">
                  <div class="confidence-bar" :style="{ width: aiAnalysis.emotionalConfidence + '%' }"></div>
                  <span class="confidence-text">{{ aiAnalysis.emotionalConfidence }}%</span>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-header">
                  <div class="summary-icon">⚡</div>
                  <div class="summary-title">能量水平</div>
                </div>
                <div class="summary-text">{{ aiAnalysis.energy }}</div>
                <div class="summary-confidence">
                  <div class="confidence-bar" :style="{ width: aiAnalysis.energyConfidence + '%' }"></div>
                  <span class="confidence-text">{{ aiAnalysis.energyConfidence }}%</span>
                </div>
              </div>
            </div>
            
            <!-- AI建议 -->
            <div class="ai-suggestions">
              <h4>💡 AI个性化建议</h4>
              <div class="suggestion-list">
                <div class="suggestion-item" v-for="(suggestion, index) in aiSuggestions" 
                     :key="index"
                     @click="applySuggestion(suggestion)">
                  <div class="suggestion-icon">{{ suggestion.icon }}</div>
                  <div class="suggestion-content">
                    <div class="suggestion-title">{{ suggestion.title }}</div>
                    <div class="suggestion-desc">{{ suggestion.description }}</div>
                    <div class="suggestion-reason">根据您的{{ suggestion.basedOn }}推荐</div>
                  </div>
                  <button class="suggestion-action">→</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 冥想控制中心 -->
        <div class="card meditation-control glass">
          <h3 class="card-title">🎵 冥想控制中心</h3>
          
          <div class="meditation-display">
            <div class="meditation-info">
              <div class="current-meditation">
                <div class="meditation-icon">{{ currentMeditation.icon }}</div>
                <div class="meditation-details">
                  <h4 class="meditation-title">{{ currentMeditation.title }}</h4>
                  <p class="meditation-description">{{ currentMeditation.description }}</p>
                  <div class="meditation-meta">
                    <span class="meta-item">⏱️ {{ currentMeditation.duration }}分钟</span>
                    <span class="meta-item">🎵 {{ currentMeditation.type }}</span>
                    <span class="meta-item">⭐ {{ currentMeditation.rating }}/5</span>
                  </div>
                </div>
              </div>
              
              <div class="wave-visualization" v-if="isPlaying">
                <div class="wave-container">
                  <canvas ref="waveCanvas" class="wave-canvas"></canvas>
                </div>
                <div class="wave-info">
                  <span class="wave-type">{{ currentMeditation.waveType }}</span>
                  <span class="wave-strength">{{ waveStrength }}%</span>
                </div>
              </div>
            </div>
            
            <div class="meditation-controls">
              <div class="control-group">
                <h4>🎵 选择冥想音频</h4>
                <div class="audio-library">
                  <div class="audio-category" v-for="category in audioCategories" :key="category.id">
                    <h5>{{ category.name }}</h5>
                    <div class="audio-list">
                      <button class="audio-item" 
                              v-for="audio in getAudiosByCategory(category.id)" 
                              :key="audio.id"
                              :class="{ active: currentAudio && currentAudio.id === audio.id }"
                              @click="selectAudio(audio)">
                        <span class="audio-icon">{{ audio.icon }}</span>
                        <span class="audio-name">{{ audio.name }}</span>
                        <span class="audio-duration">{{ audio.duration }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="control-group">
                <h4>⚙️ 播放设置</h4>
                <div class="playback-settings">
                  <div class="setting-item">
                    <label>音量</label>
                    <input type="range" 
                           v-model="volume" 
                           min="0" 
                           max="100" 
                           class="volume-slider"
                           @input="updateVolume">
                    <span class="setting-value">{{ volume }}%</span>
                  </div>
                  <div class="setting-item">
                    <label>播放时长</label>
                    <div class="duration-selector">
                      <button class="duration-btn" 
                              v-for="duration in [5, 10, 15, 20, 30]" 
                              :key="duration"
                              :class="{ active: playbackDuration === duration }"
                              @click="setPlaybackDuration(duration)">
                        {{ duration }}分钟
                      </button>
                    </div>
                  </div>
                  <div class="setting-item">
                    <label>循环播放</label>
                    <label class="switch">
                      <input type="checkbox" v-model="loopPlayback">
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div class="control-actions">
                <button class="control-btn large primary" @click="togglePlayPause" :disabled="!currentAudio || isLoadingAudio">
                  {{ isPlaying ? '⏸️ 暂停' : '▶️ 播放' }}
                  <span v-if="isLoadingAudio" class="loading-spinner"></span>
                </button>
                <button class="control-btn large" @click="skipBackward" :disabled="!currentAudio || !isPlaying">
                  ⏮️
                </button>
                <button class="control-btn large" @click="skipForward" :disabled="!currentAudio || !isPlaying">
                  ⏭️
                </button>
                <button class="control-btn large danger" @click="stopAudio" :disabled="!currentAudio || !isPlaying">
                  ⏹️ 停止
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：AI对话和推荐 -->
      <div class="right-panel">
        <!-- AI对话面板 -->
        <div class="card ai-chat glass">
          <div class="card-header">
            <h3 class="card-title">💬 AI冥想助手</h3>
            <div class="chat-controls">
              <button class="voice-btn" @click="toggleVoiceRecognition" 
                      :class="{ 
                        active: voiceRecognitionActive,
                        disabled: !voiceRecognitionSupported 
                      }"
                      title="语音识别"
                      :disabled="!voiceRecognitionSupported">
                {{ voiceRecognitionActive ? '🎤 识别中' : '🎤 语音' }}
              </button>
              <button class="clear-btn" @click="clearChat" title="清空对话">
                🗑️
              </button>
            </div>
          </div>
          
          <div class="chat-container">
            <!-- 对话记录 -->
            <div class="chat-history" ref="chatHistory">
              <div v-for="(message, index) in chatHistory" 
                   :key="index"
                   class="message"
                   :class="message.type">
                <div class="message-avatar">
                  <span v-if="message.type === 'user'">👤</span>
                  <span v-else-if="message.type === 'deepseek'">🔮</span>
                  <span v-else>🤖</span>
                </div>
                <div class="message-content">
                  <div class="message-header">
                    <span class="message-sender">{{ message.sender }}</span>
                    <span class="message-time">{{ message.time }}</span>
                  </div>
                  <div class="message-text">{{ message.text }}</div>
                  <div class="message-actions" v-if="message.type === 'ai'">
                    <button class="message-action" @click="copyToClipboard(message.text)">
                      📋 复制
                    </button>
                    <button class="message-action" @click="applyAISuggestion(message.text)">
                      🎯 应用建议
                    </button>
                  </div>
                </div>
              </div>
              <div class="typing-indicator" v-if="isAIThinking">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span class="typing-text">AI正在思考...</span>
              </div>
            </div>
            
            <!-- 语音识别状态 -->
            <div class="voice-recognition-status" v-if="voiceRecognitionActive">
              <div class="recognition-indicator">
                <div class="recognition-dots">
                  <div class="dot" v-for="n in 5" :key="n" :style="getDotStyle(n)"></div>
                </div>
                <span class="recognition-text">请说话...</span>
                <span class="recognition-hint">说"结束"以完成识别</span>
              </div>
              <div class="recognition-result" v-if="realtimeTranscript">
                <div class="result-text">{{ realtimeTranscript }}</div>
              </div>
            </div>
            
            <!-- 输入区域 -->
            <div class="chat-input">
              <textarea 
                v-model="chatInput" 
                @keydown.enter.prevent="sendMessage"
                placeholder="向AI助手提问或输入您的心情..."
                class="input-field"
                rows="2"></textarea>
              <div class="input-actions">
                <button class="send-btn" @click="sendMessage" :disabled="!chatInput.trim()">
                  📤 发送
                </button>
                <button class="voice-input-btn" @click="toggleVoiceRecognition" 
                        :class="{ 
                          active: voiceRecognitionActive,
                          disabled: !voiceRecognitionSupported 
                        }"
                        :disabled="!voiceRecognitionSupported">
                  🎤 语音输入
                </button>
              </div>
            </div>
            
            <!-- 快捷指令 -->
            <div class="quick-commands">
              <h5>💡 快捷指令</h5>
              <div class="command-list">
                <button class="command-btn" 
                        v-for="cmd in quickCommands"
                        :key="cmd.text"
                        @click="sendQuickCommand(cmd)">
                  {{ cmd.text }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 冥想历史记录 -->
        <div class="card meditation-history glass">
          <h3 class="card-title">📊 冥想记录</h3>
          
          <div class="history-content">
            <div class="history-stats">
              <div class="stat-card">
                <div class="stat-icon">📅</div>
                <div class="stat-info">
                  <div class="stat-value">{{ meditationHistory.length }}</div>
                  <div class="stat-label">冥想次数</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-info">
                  <div class="stat-value">{{ totalMeditationTime }}</div>
                  <div class="stat-label">总时长(分)</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-info">
                  <div class="stat-value">{{ averageRating }}</div>
                  <div class="stat-label">平均评分</div>
                </div>
              </div>
            </div>
            
            <div class="history-list">
              <h5>最近冥想记录</h5>
              <div class="history-items">
                <div class="history-item" v-for="record in recentHistory" :key="record.id">
                  <div class="history-icon">{{ record.icon }}</div>
                  <div class="history-details">
                    <div class="history-title">{{ record.title }}</div>
                    <div class="history-meta">
                      <span>{{ record.date }}</span>
                      <span>⏱️ {{ record.duration }}分钟</span>
                      <span>⭐ {{ record.rating }}/5</span>
                    </div>
                  </div>
                  <button class="history-action" @click="replayMeditation(record)">
                    🔄
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 音频播放控制 -->
    <div class="audio-player" v-if="currentAudio">
      <div class="player-container">
        <div class="track-info">
          <div class="track-icon">{{ currentAudio.icon }}</div>
          <div class="track-details">
            <div class="track-title">{{ currentAudio.name }}</div>
            <div class="track-artist">{{ currentAudio.category }}</div>
          </div>
          <div class="track-progress">
            <span class="current-time">{{ formatTime(currentTime) }}</span>
            <span class="duration">{{ formatTime(currentAudio.durationSeconds) }}</span>
          </div>
        </div>
        
        <div class="player-controls">
          <button class="player-btn" @click="skipBackward" title="后退10秒" :disabled="!isPlaying">
            ⏪
          </button>
          <button class="player-btn play-pause" @click="togglePlayPause" title="播放/暂停" :disabled="isLoadingAudio">
            {{ isPlaying ? '⏸️' : '▶️' }}
            <span v-if="isLoadingAudio" class="loading-spinner"></span>
          </button>
          <button class="player-btn" @click="skipForward" title="前进10秒" :disabled="!isPlaying">
            ⏩
          </button>
          <button class="player-btn" @click="stopAudio" title="停止" :disabled="!isPlaying">
            ⏹️
          </button>
        </div>
        
        <div class="progress-container">
          <input type="range" 
                 v-model="audioProgress" 
                 min="0" 
                 max="100" 
                 class="progress-slider"
                 @input="seekAudio"
                 @change="seekAudio">
        </div>
        
        <div class="volume-control">
          <button class="volume-btn" @click="toggleMute" :title="isMuted ? '取消静音' : '静音'">
            {{ isMuted ? '🔇' : volume > 50 ? '🔊' : '🔉' }}
          </button>
          <input type="range" 
                 v-model="volume" 
                 min="0" 
                 max="100" 
                 class="volume-slider"
                 @input="updateVolume">
          <span class="volume-value">{{ volume }}%</span>
        </div>
      </div>
    </div>

    <!-- 模态框：配置API密钥 -->
    <div class="modal-overlay" v-if="showConfigModal">
      <div class="modal-content glass">
        <div class="modal-header">
          <h3 class="modal-title">⚙️ AI服务配置</h3>
          <button class="modal-close" @click="showConfigModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <div class="config-section">
            <h4>🤖 华为ModelArts配置</h4>
            <div class="input-group">
              <label>API Key</label>
              <input type="password" 
                    v-model="apiConfig.modelarts.apiKey"
                    placeholder="输入ModelArts API Key">
            </div>
            <div class="input-group">
              <label>API地址</label>
              <input type="text" 
                    v-model="apiConfig.modelarts.endpoint"
                    placeholder="https://api.modelarts-maas.com/v1/chat/completions">
            </div>
            <div class="input-group">
              <label>模型</label>
              <select v-model="apiConfig.modelarts.model">
                <option value="DeepSeek-V3">DeepSeek-V3</option>
                <option value="DeepSeek-Chat">DeepSeek-Chat</option>
              </select>
            </div>
          </div>
            
          <div class="config-section">
            <h4>🔮 DeepSeek配置</h4>
            <div class="input-group">
              <label>API密钥</label>
              <input type="password" 
                     v-model="apiConfig.deepseek.apiKey"
                     placeholder="输入DeepSeek API密钥">
            </div>
            <div class="input-group">
              <label>API地址</label>
              <input type="text" 
                     v-model="apiConfig.deepseek.endpoint"
                     placeholder="https://api.deepseek.com/chat/completions">
            </div>
            <div class="input-group">
              <label>模型</label>
              <select v-model="apiConfig.deepseek.model">
                <option value="deepseek-chat">DeepSeek-Chat</option>
                <option value="deepseek-coder">DeepSeek-Coder</option>
              </select>
            </div>
          </div>
          
          <div class="config-actions">
            <button class="btn-primary" @click="saveAPIConfig">
              💾 保存配置
            </button>
            <button class="btn-secondary" @click="testAPIConnection">
              🔗 测试连接
            </button>
            <button class="btn-outline" @click="showConfigModal = false">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速开始按钮 -->
    <button class="quick-start-btn" @click="quickStartMeditation">
      🧘 快速冥想
    </button>
  </div>
</template>

<script>
// 华为ModelArts服务类
class HuaweiModelArtsService {
  constructor(config) {
    this.config = config;
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || 'https://api.modelarts-maas.com/v1/chat/completions';
    this.model = config.model || 'DeepSeek-V3';
  }

  async chat(messages, options = {}) {
    if (!this.validateConfig()) {
      return this.fallbackChat(messages);
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: this.formatMessages(messages),
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 500,
          stream: false
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API错误: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        return {
          content: data.choices[0].message.content,
          usage: data.usage || {},
          finish_reason: data.choices[0].finish_reason
        };
      }
      
      throw new Error('响应格式错误');
      
    } catch (error) {
      console.error('ModelArts聊天失败:', error.message);
      return this.fallbackChat(messages);
    }
  }

  formatMessages(messages) {
    return messages.map(msg => ({
      role: this.getRole(msg.role),
      content: msg.content
    }));
  }

  getRole(role) {
    const roleMap = {
      'system': 'system',
      'user': 'user',
      'assistant': 'assistant',
      'ai': 'assistant',
      'modelarts': 'assistant'
    };
    return roleMap[role] || 'user';
  }

  validateConfig() {
    return this.apiKey && this.apiKey.length > 20;
  }

  fallbackChat(messages) {
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    const responses = {
      '压力': '我建议您尝试Alpha脑波音乐《fixed_alphawave.mp3》，它能有效缓解压力，帮助您放松身心。',
      '焦虑': '推荐您听Theta脑波音乐《fixed_Thetameditation.mp3》，有助于减轻焦虑，平静心情。',
      '专注': 'Alpha专注音乐《fixed_attention.mp3》非常适合提高注意力，建议您尝试。',
      '睡眠': '睡眠引导音乐《fixed_sleep_music_master_talk.mp3》能帮助您改善睡眠质量。',
      '放松': '放松状态音乐《fixed_relax_state_meditation.mp3》是专门为放松设计的。',
      '你好': '您好！我是您的冥想AI助手，可以为您推荐合适的冥想音乐并提供指导。',
      '推荐': '根据您的状态，我推荐：1. Alpha脑波音乐 2. 自然雨声 3. 放松状态引导'
    };

    let response = '我理解您的需求。根据您的状态，我推荐您听一些放松的冥想音乐。您可以尝试：\n\n1. Alpha脑波音乐（提高专注）\n2. Theta脑波音乐（减轻焦虑）\n3. 自然声音（放松身心）';
    
    for (const [keyword, reply] of Object.entries(responses)) {
      if (lastMessage.toLowerCase().includes(keyword.toLowerCase())) {
        response = reply;
        break;
      }
    }

    return {
      content: response,
      usage: { total_tokens: 100 },
      finish_reason: 'stop'
    };
  }
}

// DeepSeek服务
class DeepSeekService {
  constructor(config) {
    this.config = config;
    this.endpoint = config.endpoint || 'https://api.deepseek.com/chat/completions';
    this.apiKey = config.apiKey;
    this.model = config.model || 'deepseek-chat';
  }

  async chat(messages, options = {}) {
    if (!this.validateConfig()) {
      return this.fallbackChat(messages);
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: this.formatMessages(messages),
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 500,
          stream: false
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API错误: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        return {
          content: data.choices[0].message.content,
          usage: data.usage || {},
          finish_reason: data.choices[0].finish_reason
        };
      }
      
      throw new Error('响应格式错误');
      
    } catch (error) {
      console.warn('DeepSeek聊天失败:', error.message);
      return this.fallbackChat(messages);
    }
  }

  formatMessages(messages) {
    return messages.map(msg => ({
      role: this.getRole(msg.role),
      content: msg.content
    }));
  }

  getRole(role) {
    const roleMap = {
      'system': 'system',
      'user': 'user',
      'assistant': 'assistant'
    };
    return roleMap[role] || 'user';
  }

  validateConfig() {
    return this.apiKey && this.apiKey.startsWith('sk-');
  }

  fallbackChat(messages) {
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    const responses = {
      '压力': '推荐听Alpha脑波音乐，配合深呼吸练习。',
      '焦虑': 'Theta脑波音乐能帮助减轻焦虑，建议每天听15分钟。',
      '专注': '专注力训练音乐适合工作学习时听。',
      '你好': '您好！我是DeepSeek冥想助手，很高兴为您服务。'
    };

    let response = '欢迎使用冥想助手！我可以为您推荐合适的冥想音乐并提供使用建议。';
    
    for (const [keyword, reply] of Object.entries(responses)) {
      if (lastMessage.toLowerCase().includes(keyword.toLowerCase())) {
        response = reply;
        break;
      }
    }

    return {
      content: response,
      usage: { total_tokens: 100 },
      finish_reason: 'stop'
    };
  }
}

// 获取当前时间
function getCurrentTime() {
  return new Date().toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// 音频数据 - 使用public/audio文件夹中的文件
const audioLibrary = {
  // 脑波音乐
  brainwave: [
    { 
      id: 'alphawave', 
      name: 'Alpha脑波', 
      icon: '🧠', 
      category: '脑波音乐',
      path: '/audio/fixed_alphawave.mp3',
      duration: '30:44',
      durationSeconds: 1842,
      waveType: 'Alpha波',
      description: '提高专注力，适合学习和工作',
      rating: 4.5,
      tags: ['专注', '学习', '工作']
    },
    { 
      id: 'alphameditation', 
      name: 'Alpha冥想', 
      icon: '😌', 
      category: '脑波音乐',
      path: '/audio/fixed_alphameditation.mp3',
      duration: '32:00',
      durationSeconds: 1920,
      waveType: 'Alpha波',
      description: '深度放松，缓解压力',
      rating: 4.7,
      tags: ['放松', '压力', '冥想']
    },
    { 
      id: 'thetameditation', 
      name: 'Theta冥想', 
      icon: '🌙', 
      category: '脑波音乐',
      path: '/audio/fixed_Thetameditation.mp3',
      duration: '32:00',
      durationSeconds: 1920,
      waveType: 'Theta波',
      description: '促进深度冥想，适合睡前',
      rating: 4.8,
      tags: ['睡眠', '深度冥想', '放松']
    },
    { 
      id: 'attention', 
      name: '专注训练', 
      icon: '🎯', 
      category: '脑波音乐',
      path: '/audio/fixed_attention.mp3',
      duration: '26:24',
      durationSeconds: 1584,
      waveType: 'Alpha波',
      description: '提高注意力和集中力',
      rating: 4.6,
      tags: ['专注', '注意力', '训练']
    }
  ],
  
  // 自然声音
  nature: [
    { 
      id: 'rain', 
      name: '雨声', 
      icon: '🌧️', 
      category: '自然声音',
      path: '/audio/fixed_rain.mp3',
      duration: '17:14',
      durationSeconds: 1034,
      waveType: '白噪音',
      description: '舒缓的雨声，帮助放松',
      rating: 4.9,
      tags: ['放松', '睡眠', '自然']
    },
    { 
      id: 'rainnight', 
      name: '夜雨', 
      icon: '🌃', 
      category: '自然声音',
      path: '/audio/fixed_rainnight.mp3',
      duration: '17:15',
      durationSeconds: 1035,
      waveType: '白噪音',
      description: '夜晚的雨声，助眠效果好',
      rating: 4.8,
      tags: ['睡眠', '夜晚', '放松']
    },
    { 
      id: 'seawind', 
      name: '海风', 
      icon: '🌊', 
      category: '自然声音',
      path: '/audio/fixed_seawind.mp3',
      duration: '17:14',
      durationSeconds: 1034,
      waveType: '自然声音',
      description: '海浪和海风的声音',
      rating: 4.7,
      tags: ['海洋', '放松', '度假']
    },
    { 
      id: 'forest', 
      name: '森林', 
      icon: '🌲', 
      category: '自然声音',
      path: '/audio/mixkit-forest-treasure-138.mp3',
      duration: '03:32',
      durationSeconds: 212,
      waveType: '自然声音',
      description: '森林中的自然声音',
      rating: 4.6,
      tags: ['自然', '森林', '放松']
    }
  ],
  
  // 引导冥想
  guided: [
    { 
      id: 'relax_state', 
      name: '放松状态', 
      icon: '😌', 
      category: '引导冥想',
      path: '/audio/fixed_relax_state_meditation.mp3',
      duration: '33:35',
      durationSeconds: 2015,
      waveType: '引导音',
      description: '引导进入深度放松状态',
      rating: 4.8,
      tags: ['引导', '放松', '深度']
    },
    { 
      id: 'sleep_master', 
      name: '睡眠引导', 
      icon: '😴', 
      category: '引导冥想',
      path: '/audio/fixed_sleep_music_master_talk.mp3',
      duration: '05:16',
      durationSeconds: 316,
      waveType: '引导音',
      description: '专家指导的睡眠引导',
      rating: 4.9,
      tags: ['睡眠', '引导', '专家']
    },
    { 
      id: 'meditation_guide', 
      name: '冥想引导', 
      icon: '🧘', 
      category: '引导冥想',
      path: '/audio/mixkit-meditation-441.mp3',
      duration: '06:18',
      durationSeconds: 378,
      waveType: '引导音',
      description: '专业的冥想引导',
      rating: 4.7,
      tags: ['冥想', '引导', '专业']
    }
  ],
  
  // 音乐冥想
  music: [
    { 
      id: 'ancient_melody', 
      name: '古旋律', 
      icon: '🎵', 
      category: '音乐冥想',
      path: '/audio/fixed_ancient_melody_in_heart_old.mp3',
      duration: '34:40',
      durationSeconds: 2080,
      waveType: '音乐',
      description: '古老的冥想音乐',
      rating: 4.8,
      tags: ['古风', '音乐', '冥想']
    },
    { 
      id: 'spring_song', 
      name: '春之歌', 
      icon: '🌸', 
      category: '音乐冥想',
      path: '/audio/fixed_springsong.mp3',
      duration: '17:15',
      durationSeconds: 1035,
      waveType: '音乐',
      description: '春天般的清新音乐',
      rating: 4.6,
      tags: ['春天', '清新', '音乐']
    },
    { 
      id: 'yoga_music', 
      name: '瑜伽音乐', 
      icon: '🧘', 
      category: '音乐冥想',
      path: '/audio/mixkit-yoga-music-04-386.mp3',
      duration: '05:54',
      durationSeconds: 354,
      waveType: '音乐',
      description: '适合瑜伽练习的音乐',
      rating: 4.7,
      tags: ['瑜伽', '音乐', '练习']
    }
  ]
};

// 语音识别服务 - 使用Web Speech API
class VoiceRecognitionService {
  constructor() {
    this.recognition = null;
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    this.isListening = false;
    this.transcript = '';
    this.interimTranscript = '';
    this.confidence = 0;
    this.startTime = null;
    
    if (this.isSupported) {
      this.initRecognition();
    }
  }
  
  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // 配置识别器
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'zh-CN';
    this.recognition.maxAlternatives = 1;
    
    // 设置事件处理器
    this.recognition.onstart = () => {
      this.isListening = true;
      this.startTime = Date.now();
      console.log('语音识别开始');
    };
    
    this.recognition.onresult = (event) => {
      this.interimTranscript = '';
      this.transcript = '';
      this.confidence = 0;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          this.transcript += transcript;
          this.confidence = Math.max(this.confidence, confidence);
        } else {
          this.interimTranscript += transcript;
        }
      }
      
      // 触发回调
      if (this.onTranscript) {
        this.onTranscript(this.transcript, this.interimTranscript, this.confidence);
      }
    };
    
    this.recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      this.isListening = false;
      
      if (this.onError) {
        this.onError(event.error);
      }
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      console.log('语音识别结束');
      
      if (this.onEnd) {
        this.onEnd(this.transcript, this.confidence);
      }
    };
  }
  
  start() {
    if (!this.isSupported) {
      console.error('浏览器不支持语音识别');
      return false;
    }
    
    try {
      this.transcript = '';
      this.interimTranscript = '';
      this.confidence = 0;
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('启动语音识别失败:', error);
      return false;
    }
  }
  
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
  
  setLanguage(lang) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }
  
  setContinuous(continuous) {
    if (this.recognition) {
      this.recognition.continuous = continuous;
    }
  }
  
  setInterimResults(interim) {
    if (this.recognition) {
      this.recognition.interimResults = interim;
    }
  }
}

export default {
  name: 'SmartMeditation',
  data() {
    return {
      // API配置
      apiConfig: {
        modelarts: {
          apiKey: 'vZVmrfqge1mZQwZRMxOpi_pP-dOJIu8J1G7RQoatT7SxcMPC1-BX8_BjgQvNQubsgz8G6_Gs3dn4Ie7_3-nxdw',
          endpoint: 'https://api.modelarts-maas.com/v1/chat/completions',
          model: 'DeepSeek-V3'
        },
        deepseek: {
          apiKey: '',
          endpoint: 'https://api.deepseek.com/chat/completions',
          model: 'deepseek-chat'
        },
        activeAIService: 'modelarts'
      },
      
      // UI状态
      showConfigModal: false,
      
      // 用户数据
      userData: {
        days: 7,
        totalMinutes: 145,
        mood: '平静',
        energy: 80
      },
      
      // 生理数据
      bioData: {
        heartRate: 68,
        stressLevel: 0.3,
        focusLevel: 0.7,
        alphaWave: 0.6
      },
      
      // 语音识别相关
      voiceRecognitionSupported: false,
      voiceRecognitionActive: false,
      voiceRecognitionService: null,
      realtimeTranscript: '',
      recognitionConfidence: 0,
      recognitionTime: 0,
      
      // 语音分析结果
      voiceTranscript: '',
      sentimentAnalysis: {
        emotion: '中性',
        confidence: 0,
        keywords: []
      },
      extractedKeywords: [],
      
      // 推荐冥想
      recommendedMeditations: [
        {
          id: 1,
          icon: '🧠',
          title: 'Alpha专注训练',
          description: '根据您的专注度推荐',
          matchScore: 0.85,
          audioId: 'attention',
          duration: 15,
          reason: '您的专注度较高，适合强化训练'
        },
        {
          id: 2,
          icon: '😌',
          title: '深度放松',
          description: '适合当前压力水平',
          matchScore: 0.78,
          audioId: 'relax_state',
          duration: 20,
          reason: '压力水平适中，需要适度放松'
        },
        {
          id: 3,
          icon: '🌙',
          title: '睡眠引导',
          description: '改善睡眠质量',
          matchScore: 0.72,
          audioId: 'sleep_master',
          duration: 10,
          reason: '适合晚间放松和入睡'
        }
      ],
      
      // AI分析
      aiAnalysis: {
        cognitive: '注意力集中度良好，适合深度思考',
        cognitiveConfidence: 85,
        emotional: '情绪稳定，心态平和',
        emotionalConfidence: 90,
        energy: '能量充沛，状态良好',
        energyConfidence: 80
      },
      
      // AI建议
      aiSuggestions: [
        { 
          icon: '🧠', 
          title: 'Alpha脑波训练', 
          description: '15分钟专注力提升',
          basedOn: '高专注度',
          audioId: 'alphawave',
          duration: 15
        },
        { 
          icon: '😌', 
          title: '深度放松冥想', 
          description: '20分钟压力释放',
          basedOn: '中等压力',
          audioId: 'relax_state',
          duration: 20
        },
        { 
          icon: '🌧️', 
          title: '雨声冥想', 
          description: '10分钟快速放松',
          basedOn: '自然偏好',
          audioId: 'rain',
          duration: 10
        }
      ],
      
      // 音频分类
      audioCategories: [
        { id: 'brainwave', name: '脑波音乐', icon: '🧠' },
        { id: 'nature', name: '自然声音', icon: '🌿' },
        { id: 'guided', name: '引导冥想', icon: '🎤' },
        { id: 'music', name: '音乐冥想', icon: '🎵' }
      ],
      
      // 当前冥想
      currentMeditation: {
        icon: '🧠',
        title: 'Alpha脑波训练',
        description: '提高专注力，适合学习和工作',
        duration: 15,
        type: '脑波音乐',
        rating: 4.5,
        waveType: 'Alpha波'
      },
      
      // 当前音频
      currentAudio: null,
      audioPlayer: null,
      isPlaying: false,
      isLoadingAudio: false,
      isMuted: false,
      volume: 80,
      audioProgress: 0,
      currentTime: 0,
      playbackDuration: 15,
      loopPlayback: true,
      waveStrength: 65,
      
      // 冥想历史
      meditationHistory: [
        {
          id: 1,
          icon: '🧠',
          title: 'Alpha专注训练',
          date: '今天 14:30',
          duration: 15,
          rating: 4.5,
          audioId: 'attention'
        },
        {
          id: 2,
          icon: '😌',
          title: '深度放松',
          date: '昨天 21:15',
          duration: 20,
          rating: 4.8,
          audioId: 'relax_state'
        },
        {
          id: 3,
          icon: '🌧️',
          title: '雨声冥想',
          date: '昨天 10:45',
          duration: 10,
          rating: 4.9,
          audioId: 'rain'
        }
      ],
      
      // 聊天相关
      chatInput: '',
      quickCommands: [
        { text: '压力太大', command: '我现在压力很大，有什么冥想推荐？' },
        { text: '无法专注', command: '我很难集中注意力，有什么好方法？' },
        { text: '睡眠不好', command: '我最近睡眠质量很差，有什么冥想可以帮助？' },
        { text: '焦虑不安', command: '我感到很焦虑，应该听什么音乐？' },
        { text: '情绪低落', command: '我心情不好，有什么冥想可以调节情绪？' },
        { text: '推荐音乐', command: '根据我的状态推荐一些冥想音乐' }
      ],
      isAIThinking: false,
      
      // 聊天历史
      chatHistory: [],
      
      // AI服务状态
      aiServiceStatus: {
        modelarts: 'connected',
        deepseek: 'disconnected'
      },
      
      // 服务实例
      modelartsService: null,
      deepseekService: null,
      
      // 事件监听器引用
      keyboardEventListener: null,
      mediaEventListener: null,
      timeUpdateListener: null,
      endedListener: null,
      errorListener: null
    };
  },
  
  computed: {
    // 获取按分类的音频
    getAudiosByCategory() {
      return (categoryId) => {
        return audioLibrary[categoryId] || [];
      };
    },
    
    // 计算总冥想时间
    totalMeditationTime() {
      return this.meditationHistory.reduce((total, record) => total + record.duration, 0);
    },
    
    // 计算平均评分
    averageRating() {
      if (this.meditationHistory.length === 0) return 0;
      const total = this.meditationHistory.reduce((sum, record) => sum + record.rating, 0);
      return (total / this.meditationHistory.length).toFixed(1);
    },
    
    // 最近历史记录
    recentHistory() {
      return this.meditationHistory.slice(0, 3);
    }
  },
  
  created() {
    this.initializeChatHistory();
    this.checkVoiceRecognitionSupport();
  },
  
  mounted() {
    console.log('组件挂载，初始化服务...');
    
    // 从localStorage加载配置
    const savedConfig = localStorage.getItem('meditation_ai_config');
    if (savedConfig) {
      try {
        Object.assign(this.apiConfig, JSON.parse(savedConfig));
        console.log('已加载保存的配置');
      } catch (error) {
        console.error('加载保存的配置失败:', error);
      }
    }
    
    // 初始化AI服务
    this.initializeAIServices();
    
    // 设置默认音频
    const defaultAudio = audioLibrary.brainwave[0];
    if (defaultAudio) {
      this.currentAudio = defaultAudio;
      this.currentMeditation = {
        icon: defaultAudio.icon,
        title: defaultAudio.name,
        description: defaultAudio.description,
        duration: Math.floor(defaultAudio.durationSeconds / 60),
        type: defaultAudio.category,
        rating: defaultAudio.rating,
        waveType: defaultAudio.waveType
      };
    }
    
    // 监听音量变化
    this.$watch('volume', this.updateVolume);
    this.$watch('loopPlayback', (newVal) => {
      if (this.audioPlayer) {
        this.audioPlayer.loop = newVal;
      }
    });
    
    // 添加键盘快捷键
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
      
      // Ctrl + / 切换AI服务
      if (e.ctrlKey && e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        const newService = this.apiConfig.activeAIService === 'modelarts' ? 'deepseek' : 'modelarts';
        this.switchAIService(newService);
      }
    };
    
    document.addEventListener('keydown', this.keyboardEventListener);
    
    // 模拟生理数据更新
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
  
  methods: {
    // 检查语音识别支持
    checkVoiceRecognitionSupport() {
      this.voiceRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      
      if (this.voiceRecognitionSupported) {
        console.log('✅ 浏览器支持语音识别');
        this.initializeVoiceRecognition();
      } else {
        console.warn('❌ 浏览器不支持语音识别，请使用Chrome浏览器');
        this.addChatMessage('system', '提示：您的浏览器不支持语音识别功能。建议使用Chrome浏览器以获得完整体验。');
      }
    },
    
    // 初始化语音识别
    initializeVoiceRecognition() {
      try {
        this.voiceRecognitionService = new VoiceRecognitionService();
        
        if (this.voiceRecognitionService.isSupported) {
          this.voiceRecognitionService.onTranscript = (finalTranscript, interimTranscript, confidence) => {
            this.realtimeTranscript = finalTranscript || interimTranscript;
            this.recognitionConfidence = Math.round(confidence * 100);
            
            if (finalTranscript) {
              this.analyzeVoiceContent(finalTranscript);
              
              // 如果检测到结束词，自动停止识别
              if (finalTranscript.includes('结束') || finalTranscript.includes('停止') || 
                  finalTranscript.includes('完成') || finalTranscript.includes('好了')) {
                setTimeout(() => {
                  this.stopVoiceRecognition();
                  this.confirmTranscript();
                }, 500);
              }
            }
          };
          
          this.voiceRecognitionService.onError = (error) => {
            console.error('语音识别错误:', error);
            this.addChatMessage('system', `语音识别失败：${error}`);
            this.voiceRecognitionActive = false;
          };
          
          this.voiceRecognitionService.onEnd = (finalTranscript, confidence) => {
            this.voiceRecognitionActive = false;
            this.recognitionTime = Math.round((Date.now() - (this.voiceRecognitionService.startTime || Date.now())) / 1000);
            
            if (finalTranscript) {
              this.voiceTranscript = finalTranscript;
              this.recognitionConfidence = Math.round(confidence * 100);
              
              this.analyzeTranscript(finalTranscript);
              
              this.addChatMessage('system', `✅ 语音识别完成！识别时间：${this.recognitionTime}秒，置信度：${this.recognitionConfidence}%`);
            }
          };
          
          console.log('✅ 语音识别服务初始化成功');
        }
      } catch (error) {
        console.error('语音识别初始化失败:', error);
        this.voiceRecognitionSupported = false;
      }
    },
    
    // 获取语音识别状态
    getVoiceRecognitionStatus() {
      if (!this.voiceRecognitionSupported) return 'disconnected';
      if (this.voiceRecognitionActive) return 'connected';
      return 'disconnected';
    },
    
    // 切换语音识别
    toggleVoiceRecognition() {
      if (!this.voiceRecognitionSupported) {
        this.addChatMessage('system', '您的浏览器不支持语音识别功能。请使用Chrome浏览器。');
        return;
      }
      
      if (this.voiceRecognitionActive) {
        this.stopVoiceRecognition();
      } else {
        this.startVoiceRecognition();
      }
    },
    
    // 开始语音识别
    startVoiceRecognition() {
      if (!this.voiceRecognitionService) {
        this.addChatMessage('system', '语音识别服务未初始化，请刷新页面重试。');
        return;
      }
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          const success = this.voiceRecognitionService.start();
          
          if (success) {
            this.voiceRecognitionActive = true;
            this.realtimeTranscript = '';
            this.voiceTranscript = '';
            this.recognitionTime = 0;
            
            this.addChatMessage('system', '🎤 语音识别已开始，请说话...（说"结束"以完成识别）');
          } else {
            this.addChatMessage('system', '启动语音识别失败，请检查麦克风权限。');
          }
        })
        .catch(error => {
          console.error('获取麦克风权限失败:', error);
          this.addChatMessage('system', '无法访问麦克风，请检查权限设置。');
        });
    },
    
    // 停止语音识别
    stopVoiceRecognition() {
      if (this.voiceRecognitionService && this.voiceRecognitionActive) {
        this.voiceRecognitionService.stop();
        this.voiceRecognitionActive = false;
        
        if (this.realtimeTranscript) {
          this.voiceTranscript = this.realtimeTranscript;
          this.analyzeTranscript(this.realtimeTranscript);
        }
      }
    },
    
    // 确认转录文本
    confirmTranscript() {
      if (this.realtimeTranscript) {
        this.voiceTranscript = this.realtimeTranscript;
        this.analyzeTranscript(this.realtimeTranscript);
        this.realtimeTranscript = '';
        
        this.addChatMessage('system', '已保存语音识别文本，您可以使用此文本进行对话。');
      }
    },
    
    // 分析语音内容
    analyzeVoiceContent(transcript) {
      // 类型检查
      if (!transcript || typeof transcript !== 'string') {
        console.warn('无效的转录文本:', transcript);
        return;
      }
      
      const lowerTranscript = transcript.toLowerCase();
      
      // 情感分析
      if (lowerTranscript.includes('压力') || lowerTranscript.includes('紧张') || 
          lowerTranscript.includes('累') || lowerTranscript.includes('疲惫')) {
        this.sentimentAnalysis.emotion = '压力';
        this.sentimentAnalysis.confidence = 85;
        this.updateRecommendedMeditations('stress');
      } else if (lowerTranscript.includes('睡眠') || lowerTranscript.includes('睡不着') || 
                 lowerTranscript.includes('失眠') || lowerTranscript.includes('熬夜')) {
        this.sentimentAnalysis.emotion = '睡眠问题';
        this.sentimentAnalysis.confidence = 90;
        this.updateRecommendedMeditations('sleep');
      } else if (lowerTranscript.includes('专注') || lowerTranscript.includes('注意力') || 
                 lowerTranscript.includes('分心') || lowerTranscript.includes('走神')) {
        this.sentimentAnalysis.emotion = '注意力问题';
        this.sentimentAnalysis.confidence = 75;
        this.updateRecommendedMeditations('focus');
      } else if (lowerTranscript.includes('焦虑') || lowerTranscript.includes('烦躁') || 
                 lowerTranscript.includes('不安') || lowerTranscript.includes('担心')) {
        this.sentimentAnalysis.emotion = '焦虑';
        this.sentimentAnalysis.confidence = 90;
        this.updateRecommendedMeditations('anxiety');
      } else if (lowerTranscript.includes('放松') || lowerTranscript.includes('休息') || 
                 lowerTranscript.includes('平静') || lowerTranscript.includes('安宁')) {
        this.sentimentAnalysis.emotion = '放松';
        this.sentimentAnalysis.confidence = 70;
        this.updateRecommendedMeditations('relax');
      } else {
        this.sentimentAnalysis.emotion = '中性';
        this.sentimentAnalysis.confidence = 60;
      }
      
      // 提取关键词
      this.extractKeywords(transcript);
    },
    
    // 深度分析转录文本
    analyzeTranscript(transcript = this.voiceTranscript) {
      // 类型检查
      if (!transcript || typeof transcript !== 'string') {
        console.warn('无效的转录文本:', transcript);
        return;
      }
      
      this.analyzeVoiceContent(transcript);
      
      const emotion = this.sentimentAnalysis.emotion;
      const confidence = this.sentimentAnalysis.confidence;
      
      if (emotion === '压力' || emotion === '焦虑') {
        this.aiAnalysis.emotional = `检测到${emotion}情绪，需要放松调节`;
        this.aiAnalysis.emotionalConfidence = confidence;
      } else if (emotion === '睡眠问题') {
        this.aiAnalysis.cognitive = '睡眠质量需要改善';
        this.aiAnalysis.cognitiveConfidence = confidence;
      } else if (emotion === '注意力问题') {
        this.aiAnalysis.cognitive = '需要提高注意力集中度';
        this.aiAnalysis.cognitiveConfidence = confidence;
      } else if (emotion === '放松') {
        this.aiAnalysis.energy = '身体需要放松和恢复';
        this.aiAnalysis.energyConfidence = confidence;
      }
      
      this.updateRecommendedMeditations(emotion.toLowerCase());
      
      this.addChatMessage('system', `语音分析完成：\n情感：${emotion} (${confidence}%)\n关键词：${this.extractedKeywords.join(', ')}`);
    },
    
    // 提取关键词
    extractKeywords(text) {
      // 类型检查
      if (!text || typeof text !== 'string') {
        console.warn('无效的关键词提取文本:', text);
        this.extractedKeywords = [];
        return;
      }
      
      const keywords = [];
      const lowerText = text.toLowerCase();
      
      const meditationKeywords = [
        '压力', '焦虑', '紧张', '放松', '睡眠', '失眠', 
        '专注', '注意力', '分心', '情绪', '心情', '平静',
        '冥想', '呼吸', '瑜伽', '音乐', '自然', '雨声',
        '海浪', '森林', '脑波', 'alpha', 'theta', '引导'
      ];
      
      for (const keyword of meditationKeywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          keywords.push(keyword);
        }
      }
      
      this.extractedKeywords = keywords.slice(0, 5);
    },
    
    // 获取情感类CSS
    getEmotionClass(emotion) {
      const emotionMap = {
        '压力': 'emotion-stress',
        '焦虑': 'emotion-anxiety',
        '睡眠问题': 'emotion-sleep',
        '注意力问题': 'emotion-focus',
        '放松': 'emotion-relax',
        '中性': 'emotion-neutral'
      };
      return emotionMap[emotion] || 'emotion-neutral';
    },
    
    // 使用语音转录文本
    useTranscript() {
      if (this.voiceTranscript) {
        this.chatInput = this.voiceTranscript;
        this.addChatMessage('system', '已将语音文本填入输入框，您可以编辑后发送。');
      }
    },
    
    clearTranscript() {
      this.voiceTranscript = '';
      this.realtimeTranscript = '';
      this.sentimentAnalysis = {
        emotion: '中性',
        confidence: 0,
        keywords: []
      };
      this.extractedKeywords = [];
    },
    
    // 初始化聊天历史
    initializeChatHistory() {
      this.chatHistory = [
        { 
          type: 'ai', 
          sender: 'AI冥想助手', 
          text: '您好！我是您的冥想AI助手。我可以为您：\n\n🎵 推荐合适的冥想音乐\n🧘 提供冥想指导和建议\n💓 分析您的状态并提供个性化方案\n🎤 支持语音输入和解析\n\n请告诉我您当前的状态或需求，我会为您推荐最适合的冥想方式！', 
          time: this.getCurrentTime()
        }
      ];
    },
    
    // 获取服务状态
    getServiceStatus(service) {
      return this.aiServiceStatus[service] || 'disconnected';
    },
    
    // 获取当前时间
    getCurrentTime() {
      return getCurrentTime();
    },
    
    // 心率状态
    getHeartRateStatus() {
      const hr = this.bioData.heartRate;
      if (hr < 60) return 'low';
      if (hr > 100) return 'high';
      return 'normal';
    },
    
    getHeartRateStatusText() {
      const status = this.getHeartRateStatus();
      switch(status) {
        case 'low': return '偏低';
        case 'high': return '偏高';
        default: return '正常';
      }
    },
    
    // 获取语音识别点样式
    getDotStyle(index) {
      const offset = (Date.now() / 200 + index * 100) % 1000;
      const height = 10 + Math.sin(offset * Math.PI / 500) * 10;
      const opacity = 0.5 + Math.sin(offset * Math.PI / 500) * 0.5;
      
      return {
        height: `${height}px`,
        opacity: opacity.toString()
      };
    },
    
    // 初始化AI服务
    initializeAIServices() {
      console.log('初始化AI服务...');
      
      if (this.apiConfig.modelarts.apiKey && this.apiConfig.modelarts.apiKey.length > 20) {
        try {
          this.modelartsService = new HuaweiModelArtsService(this.apiConfig.modelarts);
          this.aiServiceStatus.modelarts = 'connected';
          console.log('✅ ModelArts服务初始化成功');
          
          this.addChatMessage('ai', '✅ 华为ModelArts服务已连接！我可以为您提供专业的冥想指导了。', false, 'modelarts');
        } catch (error) {
          console.error('ModelArts初始化失败:', error);
          this.aiServiceStatus.modelarts = 'error';
        }
      } else {
        console.log('⚠️ ModelArts API Key未配置或格式不正确');
        this.aiServiceStatus.modelarts = 'disconnected';
      }
      
      if (this.apiConfig.deepseek.apiKey && this.apiConfig.deepseek.apiKey.startsWith('sk-')) {
        try {
          this.deepseekService = new DeepSeekService(this.apiConfig.deepseek);
          this.aiServiceStatus.deepseek = 'connected';
          console.log('✅ DeepSeek服务初始化成功');
        } catch (error) {
          console.error('DeepSeek初始化失败:', error);
          this.aiServiceStatus.deepseek = 'error';
        }
      } else {
        console.log('⚠️ DeepSeek API Key未配置');
        this.aiServiceStatus.deepseek = 'disconnected';
      }
      
      if (!this.modelartsService && !this.deepseekService) {
        console.log('⚠️ 无可用AI服务，使用本地模式');
        this.addChatMessage('system', '提示：未检测到AI服务配置。您可以使用本地回复，或配置API密钥以获得更好的体验。');
      }
    },
    
    // 更新推荐冥想
    updateRecommendedMeditations(type) {
      let recommendations = [];
      
      if (type.includes('stress') || type.includes('压力') || type.includes('焦虑')) {
        recommendations = [
          {
            id: 1,
            icon: '😌',
            title: '深度放松冥想',
            description: '专门缓解压力',
            matchScore: 0.92,
            audioId: 'relax_state',
            duration: 20
          },
          {
            id: 2,
            icon: '🌧️',
            title: '雨声冥想',
            description: '自然声音放松',
            matchScore: 0.88,
            audioId: 'rain',
            duration: 15
          }
        ];
      } else if (type.includes('sleep') || type.includes('睡眠')) {
        recommendations = [
          {
            id: 1,
            icon: '🌙',
            title: '睡眠引导',
            description: '专家指导入睡',
            matchScore: 0.95,
            audioId: 'sleep_master',
            duration: 10
          },
          {
            id: 2,
            icon: '🎵',
            title: 'Theta脑波',
            description: '促进深度睡眠',
            matchScore: 0.85,
            audioId: 'thetameditation',
            duration: 20
          }
        ];
      } else if (type.includes('focus') || type.includes('专注') || type.includes('注意力')) {
        recommendations = [
          {
            id: 1,
            icon: '🧠',
            title: 'Alpha专注训练',
            description: '提高注意力',
            matchScore: 0.90,
            audioId: 'attention',
            duration: 15
          },
          {
            id: 2,
            icon: '🎯',
            title: '脑波训练',
            description: '强化专注力',
            matchScore: 0.82,
            audioId: 'alphawave',
            duration: 15
          }
        ];
      } else {
        recommendations = this.recommendedMeditations;
      }
      
      this.recommendedMeditations = recommendations;
    },
    
    // 选择推荐冥想
    selectRecommendedMeditation(item) {
      const audio = this.findAudioById(item.audioId);
      if (audio) {
        this.currentAudio = audio;
        this.currentMeditation = {
          icon: audio.icon,
          title: item.title,
          description: audio.description,
          duration: item.duration,
          type: audio.category,
          rating: audio.rating,
          waveType: audio.waveType
        };
        
        this.addChatMessage('ai', `已选择：${item.title}\n\n描述：${audio.description}\n时长：${item.duration}分钟\n\n点击播放按钮开始冥想。`);
      }
    },
    
    // 播放推荐冥想
    playRecommendedMeditation(item) {
      const audio = this.findAudioById(item.audioId);
      if (audio) {
        this.currentAudio = audio;
        this.playAudio();
        
        this.addChatMessage('system', `开始播放：${item.title}`);
      }
    },
    
    // 根据ID查找音频
    findAudioById(audioId) {
      for (const category in audioLibrary) {
        const audio = audioLibrary[category].find(a => a.id === audioId);
        if (audio) return audio;
      }
      return null;
    },
    
    // 选择音频
    selectAudio(audio) {
      this.currentAudio = audio;
      this.currentMeditation = {
        icon: audio.icon,
        title: audio.name,
        description: audio.description,
        duration: Math.floor(audio.durationSeconds / 60),
        type: audio.category,
        rating: audio.rating,
        waveType: audio.waveType
      };
      
      if (this.isPlaying && this.audioPlayer) {
        this.stopAudio();
        setTimeout(() => {
          this.playAudio();
        }, 100);
      }
    },
    
    // 播放音频
    async playAudio() {
      if (!this.currentAudio) {
        this.addChatMessage('system', '请先选择要播放的音频');
        return;
      }
      
      // 防止重复点击
      if (this.isLoadingAudio) {
        console.log('音频正在加载中，请稍候...');
        return;
      }
      
      // 清理旧的音频播放器
      this.cleanupAudioPlayer();
      
      this.isLoadingAudio = true;
      
      try {
        this.audioPlayer = new Audio();
        
        // 检查音频文件是否存在
        try {
          const response = await fetch(this.currentAudio.path, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`音频文件不存在: ${this.currentAudio.path}`);
          }
        } catch (error) {
          console.warn('音频文件检查失败，尝试备用方案:', error.message);
          // 使用备用音频
          const backupAudio = audioLibrary.brainwave[0];
          if (backupAudio && backupAudio.path !== this.currentAudio.path) {
            this.currentAudio = backupAudio;
            this.addChatMessage('system', `音频文件无法访问，已切换到备用音频: ${backupAudio.name}`);
          } else {
            throw new Error(`无法访问音频文件: ${this.currentAudio.path}`);
          }
        }
        
        this.audioPlayer.src = this.currentAudio.path;
        this.audioPlayer.volume = this.volume / 100;
        this.audioPlayer.loop = this.loopPlayback;
        
        // 安全的事件监听器
        this.timeUpdateListener = () => {
          if (this.audioPlayer) {
            this.currentTime = this.audioPlayer.currentTime;
            this.audioProgress = (this.currentTime / this.audioPlayer.duration) * 100 || 0;
            this.waveStrength = 50 + Math.sin(Date.now() / 1000) * 30;
          }
        };
        
        this.endedListener = () => {
          this.isPlaying = false;
          this.isLoadingAudio = false;
          
          if (this.currentAudio && this.playbackDuration > 0) {
            this.addMeditationHistory();
          }
        };
        
        this.errorListener = (error) => {
          console.error('音频播放错误:', error);
          this.isPlaying = false;
          this.isLoadingAudio = false;
          this.addChatMessage('system', `音频播放失败：${this.currentAudio.name}，请检查文件路径或网络连接。`);
        };
        
        // 添加事件监听器
        this.audioPlayer.addEventListener('timeupdate', this.timeUpdateListener);
        this.audioPlayer.addEventListener('ended', this.endedListener);
        this.audioPlayer.addEventListener('error', this.errorListener);
        
        // 播放音频
        await this.audioPlayer.play();
        
        this.isPlaying = true;
        console.log('开始播放音频:', this.currentAudio.name);
        
        // 设置播放时长限制
        if (this.playbackDuration > 0) {
          setTimeout(() => {
            if (this.isPlaying && this.audioPlayer) {
              this.stopAudio();
            }
          }, this.playbackDuration * 60 * 1000);
        }
        
      } catch (error) {
        console.error('播放失败:', error);
        this.isPlaying = false;
        this.addChatMessage('system', `播放失败，请检查音频文件：${this.currentAudio.path}，错误: ${error.message}`);
      } finally {
        this.isLoadingAudio = false;
      }
    },
    
    // 清理音频播放器
    cleanupAudioPlayer() {
      if (this.audioPlayer) {
        // 移除所有事件监听器
        if (this.timeUpdateListener) {
          this.audioPlayer.removeEventListener('timeupdate', this.timeUpdateListener);
        }
        if (this.endedListener) {
          this.audioPlayer.removeEventListener('ended', this.endedListener);
        }
        if (this.errorListener) {
          this.audioPlayer.removeEventListener('error', this.errorListener);
        }
        
        // 停止并清理音频
        this.audioPlayer.pause();
        this.audioPlayer.src = '';
        this.audioPlayer = null;
      }
      
      this.isPlaying = false;
      this.audioProgress = 0;
      this.currentTime = 0;
    },
    
    // 播放/暂停音频
    togglePlayPause() {
      if (!this.currentAudio) {
        const defaultAudio = audioLibrary.brainwave[0];
        if (defaultAudio) {
          this.selectAudio(defaultAudio);
          setTimeout(() => {
            this.playAudio();
          }, 100);
        }
        return;
      }
      
      if (!this.audioPlayer) {
        this.playAudio();
        return;
      }
      
      if (this.isPlaying) {
        this.audioPlayer.pause();
        this.isPlaying = false;
      } else {
        this.playAudio();
      }
    },
    
    // 停止音频
    stopAudio() {
      this.cleanupAudioPlayer();
    },
    
    // 快进
    skipForward() {
      if (this.audioPlayer && this.isPlaying) {
        this.audioPlayer.currentTime = Math.min(
          this.audioPlayer.currentTime + 10,
          this.audioPlayer.duration
        );
      }
    },
    
    // 快退
    skipBackward() {
      if (this.audioPlayer && this.isPlaying) {
        this.audioPlayer.currentTime = Math.max(
          this.audioPlayer.currentTime - 10,
          0
        );
      }
    },
    
    // 静音/取消静音
    toggleMute() {
      if (this.audioPlayer) {
        this.isMuted = !this.isMuted;
        this.audioPlayer.muted = this.isMuted;
      }
    },
    
    // 调整音量
    updateVolume() {
      if (this.audioPlayer) {
        this.audioPlayer.volume = this.volume / 100;
        this.isMuted = this.volume === 0;
      }
    },
    
    // 音频跳转
    seekAudio() {
      if (this.audioPlayer && this.audioPlayer.duration) {
        const seekTime = (this.audioProgress / 100) * this.audioPlayer.duration;
        this.audioPlayer.currentTime = seekTime;
      }
    },
    
    // 设置播放时长
    setPlaybackDuration(duration) {
      this.playbackDuration = duration;
    },
    
    // 格式化时间
    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // 添加冥想历史
    addMeditationHistory() {
      if (!this.currentAudio) return;
      
      const newRecord = {
        id: Date.now(),
        icon: this.currentAudio.icon,
        title: this.currentAudio.name,
        date: new Date().toLocaleDateString('zh-CN') + ' ' + this.getCurrentTime(),
        duration: this.playbackDuration || Math.floor(this.currentAudio.durationSeconds / 60),
        rating: this.currentAudio.rating,
        audioId: this.currentAudio.id
      };
      
      this.meditationHistory.unshift(newRecord);
      
      this.userData.totalMinutes += newRecord.duration;
      this.userData.days = Math.max(1, Math.floor(this.userData.totalMinutes / 20));
    },
    
    // 重新播放冥想
    replayMeditation(record) {
      const audio = this.findAudioById(record.audioId);
      if (audio) {
        this.selectAudio(audio);
        this.playbackDuration = record.duration;
        setTimeout(() => {
          this.playAudio();
        }, 300);
        
        this.addChatMessage('system', `重新播放：${record.title}`);
      }
    },
    
    // 发送消息
    async sendMessage() {
      if (!this.chatInput.trim() || this.isAIThinking) {
        return;
      }
      
      const userMessage = this.chatInput.trim();
      console.log('用户发送消息:', userMessage);
      
      this.chatInput = '';
      this.addChatMessage('user', userMessage);
      this.isAIThinking = true;
      
      try {
        await this.getAIResponse(userMessage);
      } catch (error) {
        console.error('获取AI回复失败:', error);
        this.addChatMessage('ai', '抱歉，我暂时无法处理您的请求。请稍后再试或检查网络连接。', false, 'error');
      } finally {
        this.isAIThinking = false;
      }
    },
    
    // 获取AI回复
    async getAIResponse(userMessage) {
      try {
        let response;
        
        if (this.apiConfig.activeAIService === 'modelarts' && this.modelartsService) {
          response = await this.getModelArtsResponse(userMessage);
        } else if (this.apiConfig.activeAIService === 'deepseek' && this.deepseekService) {
          response = await this.getDeepSeekResponse(userMessage);
        } else {
          response = this.getLocalResponse(userMessage);
        }
        
        this.addChatMessage('ai', response.content, false, this.apiConfig.activeAIService);
        
      } catch (error) {
        console.error('AI回复失败:', error);
        this.addChatMessage('ai', '抱歉，我遇到了一些技术问题。您可以尝试重新发送或切换AI服务。', 'error');
      }
    },
    
    // 获取ModelArts回复
    async getModelArtsResponse(userMessage) {
      const messages = [
        {
          role: 'system',
          content: `你是一个专业的冥想指导AI助手。请以温暖、专业、亲切的语气回答用户问题，重点推荐合适的冥想音乐。
          
请根据用户的描述推荐public/audio文件夹中的冥想音乐：
1. 压力大/紧张 -> 推荐：fixed_relax_state_meditation.mp3, fixed_rain.mp3
2. 睡眠不好 -> 推荐：fixed_sleep_music_master_talk.mp3, fixed_Thetameditation.mp3
3. 专注力差 -> 推荐：fixed_attention.mp3, fixed_alphawave.mp3
4. 焦虑不安 -> 推荐：fixed_alphameditation.mp3, mixkit-meditation-441.mp3
5. 情绪低落 -> 推荐：fixed_springsong.mp3, mixkit-yoga-music-04-386.mp3
6. 需要放松 -> 推荐：fixed_rain.mp3, fixed_seawind.mp3

请用中文回答，保持回答简洁实用。如果用户的问题超出冥想范畴，请礼貌地引导回冥想主题。`
        },
        { role: 'user', content: userMessage }
      ];
      
      try {
        const response = await this.modelartsService.chat(messages, {
          temperature: 0.7,
          max_tokens: 800
        });
        
        return response;
      } catch (error) {
        console.error('ModelArts回复失败:', error);
        return this.getLocalResponse(userMessage);
      }
    },
    
    // 获取DeepSeek回复
    async getDeepSeekResponse(userMessage) {
      const messages = [
        {
          role: 'system',
          content: '你是一个专业的冥想指导师。请用中文提供冥想指导、推荐冥想音乐和放松技巧。保持回答温暖、专业、实用。'
        },
        { role: 'user', content: userMessage }
      ];
      
      try {
        const response = await this.deepseekService.chat(messages, {
          temperature: 0.7,
          max_tokens: 800
        });
        
        return response;
      } catch (error) {
        console.error('DeepSeek回复失败:', error);
        return this.getLocalResponse(userMessage);
      }
    },
    
    // 获取本地回复
    getLocalResponse(userMessage) {
      const lowerMsg = userMessage.toLowerCase();
      
      const responses = {
        '压力': '推荐您听《fixed_relax_state_meditation.mp3》或《fixed_rain.mp3》，这些音频能有效缓解压力。建议每天听15-20分钟。',
        '睡眠': '《fixed_sleep_music_master_talk.mp3》是专门的睡眠引导音频，《fixed_Thetameditation.mp3》也有助于改善睡眠。',
        '专注': '《fixed_attention.mp3》和《fixed_alphawave.mp3》是专门提高专注力的Alpha脑波音乐。',
        '焦虑': '《fixed_alphameditation.mp3》和《mixkit-meditation-441.mp3》能有效减轻焦虑情绪。',
        '推荐': '根据您的状态，我推荐：\n1. 压力大 -> fixed_relax_state_meditation.mp3\n2. 睡眠差 -> fixed_sleep_music_master_talk.mp3\n3. 专注差 -> fixed_attention.mp3\n4. 焦虑 -> fixed_alphameditation.mp3',
        '音乐': '我们的音频库包含：\n🧠 脑波音乐（Alpha/Theta波）\n🌿 自然声音（雨声、海风）\n🎤 引导冥想\n🎵 音乐冥想',
        '你好': '您好！我是您的冥想助手。我可以为您推荐冥想音乐、提供冥想指导和分析您的状态。',
        '帮助': '我可以帮助您：\n1. 推荐合适的冥想音乐\n2. 提供冥想技巧指导\n3. 分析您的状态并提供建议\n4. 支持语音输入解析\n\n请告诉我您的需求！'
      };
      
      let response = '感谢您的咨询！根据我们的音频库，我为您推荐：\n\n🧠 脑波音乐：提高专注/放松\n🌿 自然声音：快速放松\n🎤 引导冥想：专业指导\n🎵 音乐冥想：享受音乐\n\n请告诉我您的具体需求，我会为您推荐最合适的音频。';
      
      for (const [keyword, reply] of Object.entries(responses)) {
        if (lowerMsg.includes(keyword.toLowerCase())) {
          response = reply;
          break;
        }
      }
      
      return {
        content: response,
        usage: { total_tokens: 100 },
        finish_reason: 'stop'
      };
    },
    
    // 添加聊天消息
    addChatMessage(type, text, isTemporary = false, source = 'local') {
      const message = {
        id: Date.now() + Math.random(),
        type,
        sender: this.getMessageSender(type, source),
        text,
        time: this.getCurrentTime(),
        isTemporary,
        source
      };
      
      this.chatHistory.push(message);
      
      this.$nextTick(() => {
        const container = this.$refs.chatHistory;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
      
      return message.id;
    },
    
    // 获取消息发送者
    getMessageSender(type, source) {
      if (type === 'user') return '您';
      if (source === 'modelarts') return 'ModelArts';
      if (source === 'deepseek') return 'DeepSeek';
      if (source === 'error') return '系统';
      return 'AI助手';
    },
    
    // 应用AI建议
    applyAISuggestion(text) {
      const lowerText = text.toLowerCase();
      
      const audioMap = {
        'alphawave': 'fixed_alphawave.mp3',
        'attention': 'fixed_attention.mp3',
        'relax': 'fixed_relax_state_meditation.mp3',
        'rain': 'fixed_rain.mp3',
        'sleep': 'fixed_sleep_music_master_talk.mp3',
        'theta': 'fixed_Thetameditation.mp3',
        'alpha冥想': 'fixed_alphameditation.mp3'
      };
      
      for (const [key, filename] of Object.entries(audioMap)) {
        if (lowerText.includes(key)) {
          for (const category in audioLibrary) {
            const audio = audioLibrary[category].find(a => a.path.includes(filename));
            if (audio) {
              this.selectAudio(audio);
              this.addChatMessage('system', `已根据AI建议选择：${audio.name}`);
              return;
            }
          }
        }
      }
      
      this.addChatMessage('system', '正在分析AI建议...');
    },
    
    // 复制到剪贴板
    copyToClipboard(text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          this.addChatMessage('system', '已复制到剪贴板！');
        })
        .catch(err => {
          console.error('复制失败:', err);
        });
    },
    
    // 清空聊天
    clearChat() {
      this.chatHistory = [];
      this.initializeChatHistory();
    },
    
    // 发送快捷命令
    sendQuickCommand(cmd) {
      this.chatInput = cmd.command;
      this.sendMessage();
    },
    
    // 应用建议
    applySuggestion(suggestion) {
      const audio = this.findAudioById(suggestion.audioId);
      if (audio) {
        this.selectAudio(audio);
        this.playbackDuration = suggestion.duration;
        
        this.addChatMessage('ai', `已应用建议：${suggestion.title}\n\n将播放：${audio.name}\n时长：${suggestion.duration}分钟\n\n点击播放按钮开始。`);
      }
    },
    
    // 切换AI服务
    switchAIService(service) {
      if (service === 'modelarts' || service === 'deepseek') {
        this.apiConfig.activeAIService = service;
        const serviceName = service === 'modelarts' ? '华为ModelArts' : 'DeepSeek';
        this.addChatMessage('system', `已切换到${serviceName}服务`);
      }
    },
    
    // 保存API配置
    async saveAPIConfig() {
      console.log('保存API配置:', this.apiConfig);
      
      localStorage.setItem('meditation_ai_config', JSON.stringify(this.apiConfig));
      
      this.initializeAIServices();
      this.showConfigModal = false;
      
      this.addChatMessage('system', '✅ API配置已保存！正在重新初始化AI服务...');
    },
    
    // 测试API连接
    async testAPIConnection() {
      const service = this.apiConfig.activeAIService;
      const serviceName = service === 'modelarts' ? '华为ModelArts' : 'DeepSeek';
      
      this.isAIThinking = true;
      
      try {
        let result;
        
        if (service === 'modelarts') {
          result = await this.testModelArtsConnection();
        } else {
          result = await this.testDeepSeekConnection();
        }
        
        if (result.success) {
          alert(`✅ ${serviceName}连接成功！\n${result.message}`);
          this.aiServiceStatus[service] = 'connected';
        } else {
          alert(`❌ ${serviceName}连接失败：${result.message}`);
          this.aiServiceStatus[service] = 'error';
        }
        
      } catch (error) {
        console.error('测试连接失败:', error);
        alert(`连接测试失败: ${error.message}`);
        this.aiServiceStatus[service] = 'error';
      } finally {
        this.isAIThinking = false;
      }
    },
    
    async testModelArtsConnection() {
      if (!this.apiConfig.modelarts.apiKey) {
        throw new Error('请先配置ModelArts API Key');
      }
      
      try {
        const testService = new HuaweiModelArtsService(this.apiConfig.modelarts);
        
        const response = await testService.chat([
          { role: 'user', content: '测试连接，请回复"连接成功"' }
        ], { max_tokens: 10 });
        
        return {
          success: true,
          message: `回复: ${response.content}`
        };
        
      } catch (error) {
        return {
          success: false,
          message: error.message
        };
      }
    },
    
    async testDeepSeekConnection() {
      if (!this.apiConfig.deepseek.apiKey) {
        return { success: false, message: '请先配置DeepSeek API Key' };
      }
      
      try {
        const testService = new DeepSeekService(this.apiConfig.deepseek);
        const response = await testService.chat([
          { role: 'user', content: '测试连接' }
        ], { max_tokens: 10 });
        
        return { 
          success: true, 
          message: `回复: ${response.content}` 
        };
      } catch (error) {
        return { 
          success: false, 
          message: error.message 
        };
      }
    },
    
    // 快速开始冥想
    quickStartMeditation() {
      const defaultAudio = audioLibrary.brainwave[0];
      if (defaultAudio) {
        this.selectAudio(defaultAudio);
        this.playbackDuration = 10;
        
        setTimeout(() => {
          this.playAudio();
        }, 300);
        
        this.addChatMessage('system', '快速冥想已开始！播放10分钟Alpha脑波音乐。');
      }
    },
    
    // 显示帮助
    showHelp() {
      this.addChatMessage('ai', `
🎯 智能冥想系统使用指南：

1. **音频播放**
   - 选择左侧的推荐冥想或中间的音频库
   - 点击播放按钮开始冥想
   - 使用底部播放器控制播放

2. **语音识别（真实功能）**
   - ✅ 点击顶部麦克风按钮开始语音识别
   - ✅ 使用Web Speech API进行实时语音转文字
   - ✅ 支持中文语音识别
   - ✅ 实时显示识别结果和置信度
   - ✅ 说"结束"自动完成识别
   - ✅ 自动分析语音情感和关键词

3. **AI助手**
   - 在聊天框输入您的问题或状态
   - AI会推荐合适的冥想音乐
   - 支持切换AI服务(ModelArts/DeepSeek)

4. **推荐系统**
   - 根据您的状态推荐冥想
   - 显示匹配度和推荐理由
   - 一键开始推荐冥想

5. **冥想记录**
   - 自动记录冥想历史
   - 查看统计数据和评分
   - 支持重新播放历史记录

6. **音频库**
   - 🧠 脑波音乐：提高专注/放松
   - 🌿 自然声音：雨声、海风、森林
   - 🎤 引导冥想：专业指导
   - 🎵 音乐冥想：享受音乐

**语音识别要求：**
- 使用Chrome浏览器（最佳支持）
- 允许麦克风访问权限
- 在安静环境中使用效果更好

有任何问题都可以随时问我！`);
    }
  },
  
  beforeDestroy() {
    // 清理音频播放器
    this.cleanupAudioPlayer();
    
    // 停止语音识别
    if (this.voiceRecognitionService && this.voiceRecognitionActive) {
      this.stopVoiceRecognition();
    }
    
    // 移除键盘事件监听器
    if (this.keyboardEventListener) {
      document.removeEventListener('keydown', this.keyboardEventListener);
    }
    
    // 清理定时器
    if (this.mediaEventListener) {
      clearInterval(this.mediaEventListener);
    }
  }
};
</script>

<style scoped>
/* 基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
  background: #0a0a0f;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.gradient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
  z-index: -1;
}

/* 玻璃态效果 */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* 顶部导航栏 */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(90deg, #00ff88, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-sub {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-left: 0.5rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.service-status {
  display: flex;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.status-item.connected {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.status-item.disconnected {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff3b30;
}

.status-item.error {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.action-btn.voice-active {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.action-btn.recording {
  animation: pulse 2s infinite;
}

/* 主内容区 */
.app-main {
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 1920px;
  margin: 0 auto;
}

.left-panel, .center-panel, .right-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  border-radius: 20px;
  padding: 1.5rem;
}

.card-header {
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #f1f5f9;
}

/* 用户卡片 */
.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00ff88, #00ccff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.user-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #94a3b8;
}

.physiological-data h4 {
  margin-bottom: 1rem;
  color: #f1f5f9;
}

.data-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.data-icon {
  font-size: 1.5rem;
}

.data-details {
  flex: 1;
}

.data-label {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.data-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
}

.data-unit {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-left: 0.25rem;
}

.data-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.data-status.normal {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
}

.data-status.low, .data-status.high {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.progress-container {
  width: 100px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #00ccff);
  border-radius: 3px;
  transition: width 0.5s ease;
}

/* 语音识别状态 */
.recording-status {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 12px;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.pulse-animation {
  width: 12px;
  height: 12px;
  background: #00ff88;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.recording-text {
  color: #00ff88;
  font-weight: 500;
}

/* 实时语音转录显示 */
.realtime-transcript {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 0.75rem 0;
}

.transcript-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.transcript-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #00ff88;
}

.transcript-confidence {
  font-size: 0.8rem;
  color: #94a3b8;
}

.transcript-content {
  font-size: 0.95rem;
  color: #f1f5f9;
  line-height: 1.4;
  min-height: 20px;
}

.recording-controls {
  display: flex;
  gap: 0.5rem;
}

.stop-recording-btn, .transcript-action-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stop-recording-btn {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.4);
  color: #ff3b30;
}

.stop-recording-btn:hover {
  background: rgba(255, 59, 48, 0.2);
}

.transcript-action-btn {
  background: rgba(0, 255, 136, 0.2);
  border: 1px solid rgba(0, 255, 136, 0.4);
  color: #00ff88;
}

.transcript-action-btn:hover {
  background: rgba(0, 255, 136, 0.3);
}

/* 语音识别信息提示 */
.voice-recognition-info {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-icon {
  font-size: 1.5rem;
}

.info-content {
  flex: 1;
}

.info-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #3b82f6;
}

.info-text {
  font-size: 0.85rem;
  color: #94a3b8;
}

/* 推荐面板 */
.recommendation-panel h4 {
  margin-bottom: 1rem;
  color: #f1f5f9;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recommendation-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(4px);
}

.recommendation-icon {
  font-size: 1.5rem;
}

.recommendation-content {
  flex: 1;
}

.recommendation-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #f1f5f9;
}

.recommendation-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.recommendation-match {
  font-size: 0.8rem;
  color: #00ff88;
}

.recommendation-play-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recommendation-play-btn:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: scale(1.1);
}

/* AI分析面板 */
.ai-source {
  display: flex;
  gap: 0.5rem;
}

.source-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
}

.source-tag.active {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
}

.source-tag:hover {
  background: rgba(255, 255, 255, 0.1);
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 语音分析 */
.voice-analysis h4 {
  margin-bottom: 0.75rem;
  color: #f1f5f9;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.analysis-stats {
  display: flex;
  gap: 0.5rem;
}

.stat-badge {
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  font-size: 0.8rem;
  color: #94a3b8;
}

.transcript-box {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
}

.transcript-text {
  margin-bottom: 1rem;
  line-height: 1.6;
}

/* 语音分析结果 */
.transcript-analysis {
  margin: 1rem 0;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.analysis-result {
  margin-bottom: 0.5rem;
}

.analysis-result:last-child {
  margin-bottom: 0;
}

.result-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.result-value {
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  display: inline-block;
}

/* 情感样式 */
.emotion-stress {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  border: 1px solid rgba(255, 59, 48, 0.3);
}

.emotion-anxiety {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.emotion-sleep {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.emotion-focus {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.emotion-relax {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.emotion-neutral {
  background: rgba(255, 255, 255, 0.05);
  color: #f1f5f9;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.result-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keyword-tag {
  padding: 0.25rem 0.75rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 12px;
  font-size: 0.8rem;
  color: #00ff88;
}

.transcript-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.action-btn.small {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn.small {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.action-btn.small.secondary {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.action-btn.small.danger {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff3b30;
}

.action-btn.small:hover {
  transform: translateY(-2px);
}

.action-btn.small:active {
  transform: translateY(0);
}

/* 状态总结 */
.state-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.summary-card {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.summary-icon {
  font-size: 1.5rem;
}

.summary-title {
  font-weight: 600;
  color: #f1f5f9;
}

.summary-text {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.summary-confidence {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.confidence-bar {
  flex: 1;
  height: 4px;
  background: linear-gradient(90deg, #00ff88, #00ccff);
  border-radius: 2px;
}

.confidence-text {
  font-size: 0.8rem;
  color: #94a3b8;
}

/* AI建议 */
.ai-suggestions h4 {
  margin-bottom: 1rem;
  color: #f1f5f9;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(4px);
}

.suggestion-icon {
  font-size: 1.5rem;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #f1f5f9;
}

.suggestion-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.suggestion-reason {
  font-size: 0.8rem;
  color: #00ff88;
}

.suggestion-action {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.suggestion-action:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: scale(1.1);
}

/* 冥想控制中心 */
.meditation-display {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.meditation-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.current-meditation {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.meditation-icon {
  font-size: 2rem;
}

.meditation-details {
  flex: 1;
}

.meditation-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #f1f5f9;
}

.meditation-description {
  color: #94a3b8;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.meditation-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #94a3b8;
}

.wave-visualization {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
}

.wave-container {
  height: 80px;
  margin-bottom: 0.5rem;
}

.wave-canvas {
  width: 100%;
  height: 100%;
}

.wave-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #94a3b8;
}

.meditation-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.control-group h4 {
  margin-bottom: 0.75rem;
  color: #f1f5f9;
}

.audio-library {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.audio-category h5 {
  margin-bottom: 0.5rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.audio-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.audio-item {
  flex: 1;
  min-width: 120px;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #f1f5f9;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.audio-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.audio-item.active {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.audio-icon {
  font-size: 1.5rem;
}

.audio-name {
  font-size: 0.85rem;
  font-weight: 500;
}

.audio-duration {
  font-size: 0.75rem;
  color: #94a3b8;
}

.playback-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-item label {
  font-size: 0.9rem;
  color: #94a3b8;
  min-width: 80px;
}

.volume-slider {
  flex: 1;
  margin: 0 1rem;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #00ff88;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #00ff88;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.setting-value {
  font-size: 0.85rem;
  color: #94a3b8;
  min-width: 40px;
  text-align: right;
}

.duration-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.duration-btn {
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #f1f5f9;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
}

.duration-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.duration-btn.active {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

/* 开关 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #00ff88;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #00ff88;
  animation: spin 1s ease-in-out infinite;
  margin-left: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.control-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
}

.control-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.control-btn.large {
  padding: 0.75rem;
  font-size: 0.9rem;
}

.control-btn.primary {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.control-btn.primary:hover:not(:disabled) {
  background: rgba(0, 255, 136, 0.2);
  transform: translateY(-2px);
}

.control-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.control-btn.danger {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff3b30;
}

.control-btn.danger:hover:not(:disabled) {
  background: rgba(255, 59, 48, 0.2);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* 聊天面板 */
.chat-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 600px;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-history::-webkit-scrollbar {
  width: 6px;
}

.chat-history::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.chat-history::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 136, 0.3);
  border-radius: 3px;
}

.message {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  animation: fadeIn 0.3s ease;
}

.message.user {
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.1);
  margin-left: 2rem;
}

.message.ai {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  margin-right: 2rem;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.message-sender {
  font-weight: 600;
  font-size: 0.9rem;
  color: #f1f5f9;
}

.message-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.message-text {
  line-height: 1.5;
  color: #e2e8f0;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.message-action {
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 0.8rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s ease;
}

.message-action:hover {
  background: rgba(255, 255, 255, 0.1);
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: #00ff88;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

.typing-text {
  color: #94a3b8;
  font-size: 0.9rem;
}

/* 语音识别状态 */
.voice-recognition-status {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 12px;
  padding: 1rem;
  animation: pulse 2s infinite;
}

.recognition-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.recognition-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 30px;
}

.recognition-dots .dot {
  width: 4px;
  background: #00ff88;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.recognition-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #00ff88;
}

.recognition-hint {
  font-size: 0.8rem;
  color: #94a3b8;
  text-align: center;
}

.recognition-result {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.result-text {
  font-size: 0.95rem;
  color: #f1f5f9;
  line-height: 1.4;
}

/* 聊天输入 */
.chat-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #f1f5f9;
  font-family: inherit;
  font-size: 0.9rem;
  resize: none;
  outline: none;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: rgba(0, 255, 136, 0.3);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.1);
}

.input-actions {
  display: flex;
  gap: 0.5rem;
}

.send-btn, .voice-input-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.send-btn {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.send-btn:hover:not(:disabled) {
  background: rgba(0, 255, 136, 0.2);
  transform: translateY(-2px);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.voice-input-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

.voice-input-btn.active {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.voice-input-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-input-btn:not(.disabled):hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* 快捷指令 */
.quick-commands h5 {
  margin-bottom: 0.5rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.command-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.command-btn {
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 0.85rem;
  color: #f1f5f9;
  cursor: pointer;
  transition: all 0.3s ease;
}

.command-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

/* 冥想历史 */
.history-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.history-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #94a3b8;
}

.history-list h5 {
  margin-bottom: 0.75rem;
  color: #f1f5f9;
  font-size: 1rem;
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.history-icon {
  font-size: 1.5rem;
}

.history-details {
  flex: 1;
}

.history-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #f1f5f9;
}

.history-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.history-action {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-action:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: scale(1.1);
}

/* 音频播放器 */
.audio-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 2rem;
  z-index: 1000;
}

.player-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  max-width: 1920px;
  margin: 0 auto;
}

.track-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
}

.track-icon {
  font-size: 2rem;
}

.track-details {
  flex: 1;
}

.track-title {
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 0.25rem;
}

.track-artist {
  font-size: 0.85rem;
  color: #94a3b8;
}

.track-progress {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #94a3b8;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.player-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.player-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.player-btn.play-pause {
  width: 50px;
  height: 50px;
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.progress-container {
  flex: 1;
  max-width: 400px;
}

.progress-slider {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #00ff88;
  border-radius: 50%;
  cursor: pointer;
}

.progress-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #00ff88;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 150px;
}

.volume-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.volume-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.volume-value {
  font-size: 0.85rem;
  color: #94a3b8;
  min-width: 40px;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.modal-content {
  width: 100%;
  max-width: 600px;
  border-radius: 20px;
  animation: modalSlideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.5rem;
}

.config-section {
  margin-bottom: 2rem;
}

.config-section h4 {
  margin-bottom: 1rem;
  color: #f1f5f9;
  font-size: 1.1rem;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #f1f5f9;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
}

.input-group input:focus,
.input-group select:focus {
  border-color: rgba(0, 255, 136, 0.3);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.1);
}

.config-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary, .btn-secondary, .btn-outline {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.btn-primary:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.btn-secondary:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

/* 快速开始按钮 */
.quick-start-btn {
  position: fixed;
  right: 2rem;
  bottom: 6rem;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 50px;
  color: #00ff88;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1001;
  box-shadow: 
    0 8px 32px rgba(0, 255, 136, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.3);
}

.quick-start-btn:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 12px 48px rgba(0, 255, 136, 0.3),
    0 6px 24px rgba(0, 0, 0, 0.4);
}

/* 禁用状态样式 */
.voice-btn.disabled,
.voice-input-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-btn.disabled:hover,
.voice-input-btn.disabled:hover {
  background: rgba(255, 255, 255, 0.05) !important;
  transform: none !important;
}

/* 动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes typing {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .app-main {
    grid-template-columns: 280px 1fr 280px;
  }
}

@media (max-width: 1200px) {
  .app-main {
    grid-template-columns: 1fr;
  }
  
  .left-panel, .center-panel, .right-panel {
    width: 100%;
  }
  
  .player-container {
    flex-wrap: wrap;
  }
  
  .track-info, .player-controls, .progress-container, .volume-control {
    flex: 1;
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .app-main {
    padding: 1rem;
  }
  
  .card {
    padding: 1rem;
  }
  
  .state-summary {
    grid-template-columns: 1fr;
  }
  
  .history-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .audio-player {
    padding: 1rem;
  }
  
  .player-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .track-info, .player-controls, .progress-container, .volume-control {
    width: 100%;
  }
  
  .control-actions {
    flex-wrap: wrap;
  }
  
  .analysis-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .analysis-stats {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .logo-text {
    font-size: 1.25rem;
  }
  
  .logo-sub {
    display: none;
  }
  
  .history-stats {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    justify-content: center;
  }
  
  .quick-start-btn {
    right: 1rem;
    bottom: 5rem;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

/* 为移动端优化的额外样式 */
@media (max-width: 768px) {
  /* 确保所有可点击元素有足够大的触控区域 (至少44x44px) */
  .action-btn, .control-btn, .audio-item, .command-btn,
  .send-btn, .voice-input-btn, .duration-btn,
  .message-action, .history-action, .suggestion-action,
  .recommendation-play-btn {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* 防止手机浏览器默认的文本缩放 */
  input, textarea, select {
    font-size: 16px !important;
  }
  
  /* 改善滚动体验 */
  .app-main, .chat-history, .audio-library {
    -webkit-overflow-scrolling: touch;
  }
  
  /* 调整三栏布局为单栏或更紧凑的布局 */
  .app-main {
    grid-template-columns: 1fr !important;
    gap: 1rem;
    padding: 1rem;
  }
  
  /* 调整卡片内边距，为小屏幕节省空间 */
  .card {
    padding: 1rem;
  }
  
  /* 语音识别状态区域在小屏幕上调整 */
  .recording-status {
    margin: 0.75rem 0;
    padding: 0.75rem;
  }
  
  /* 音频播放器在手机底部需要更紧凑 */
  .audio-player {
    padding: 0.75rem 1rem;
  }
  
  .player-container {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .track-info, .player-controls, .progress-container, .volume-control {
    width: 100%;
  }
  
  /* 快速开始按钮在手机上调整位置 */
  .quick-start-btn {
    right: 1rem;
    bottom: 5rem;
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }
}



</style>