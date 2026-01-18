<template>
  <div class="app-container">
    <!-- 简约科技风背景 -->
    <div class="gradient-bg"></div>
    
    <!-- 顶部状态栏 -->
    <header class="app-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">🧘</span>
          <span class="logo-text">智能冥想</span>
          <span class="logo-sub">Powered by ModelArts & DeepSeek</span>
        </div>
      </div>
      
      <div class="header-right">
        <!-- AI服务状态 -->
        <div class="service-status">
          <div class="status-item" :class="getServiceStatus('modelarts')">
            <span class="status-icon">🤖</span>
            <span class="status-text">ModelArts</span>
          </div>
          <div class="status-item" :class="getServiceStatus('deepseek')">
            <span class="status-icon">🔍</span>
            <span class="status-text">DeepSeek</span>
          </div>
          <div class="status-item" :class="getServiceStatus('biofeedback')">
            <span class="status-icon">💓</span>
            <span class="status-text">生物反馈</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 - 三栏布局 -->
    <main class="app-main">
      <!-- 左侧：用户状态面板 -->
      <div class="left-panel">
        <!-- 用户信息卡片 -->
        <div class="card user-card">
          <div class="card-header">
            <h3 class="card-title">👤 用户状态</h3>
            <button class="refresh-btn" @click="refreshUserState">🔄</button>
          </div>
          
          <div class="user-avatar">
            <div class="avatar-circle">🧘</div>
            <div class="user-name">冥想者</div>
            <div class="user-stats">
              <span class="stat">第 {{ userData.days }} 天</span>
              <span class="stat">{{ userData.totalMinutes }} 分钟</span>
            </div>
          </div>
          
          <!-- 实时生理数据 -->
          <div class="physiological-data">
            <h4>💓 生理指标</h4>
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">心率</div>
                <div class="data-value">{{ bioData.heartRate }}</div>
                <div class="data-unit">BPM</div>
              </div>
              <div class="data-item">
                <div class="data-label">压力</div>
                <div class="data-value">{{ (bioData.stressLevel * 100).toFixed(0) }}%</div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: bioData.stressLevel * 100 + '%' }"></div>
                </div>
              </div>
              <div class="data-item">
                <div class="data-label">专注度</div>
                <div class="data-value">{{ (bioData.focusLevel * 100).toFixed(0) }}%</div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: bioData.focusLevel * 100 + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 情绪状态 -->
          <div class="emotion-state">
            <h4>😊 当前情绪</h4>
            <div class="emotion-tags">
              <span class="emotion-tag" v-for="emotion in currentEmotions" 
                    :key="emotion.name"
                    :class="emotion.name"
                    :style="{ '--confidence': emotion.confidence }">
                {{ emotion.name }} {{ emotion.confidence }}%
              </span>
            </div>
          </div>
        </div>
        
        <!-- 生物反馈控制 -->
        <div class="card bio-control">
          <h3 class="card-title">🎛️ 生物反馈控制</h3>
          <div class="control-options">
            <button class="control-btn" @click="toggleBioFeedback" 
                    :class="{ active: bioFeedbackActive }">
              {{ bioFeedbackActive ? '⏸️ 暂停监测' : '▶️ 开始监测' }}
            </button>
            <button class="control-btn" @click="calibrateSensors">
              ⚙️ 校准设备
            </button>
          </div>
          
          <div class="sensor-status">
            <div class="sensor" :class="{ connected: sensorStatus.heart }">
              <span class="sensor-icon">💓</span>
              <span class="sensor-name">心率传感器</span>
              <span class="sensor-dot"></span>
            </div>
            <div class="sensor" :class="{ connected: sensorStatus.breath }">
              <span class="sensor-icon">🌬️</span>
              <span class="sensor-name">呼吸传感器</span>
              <span class="sensor-dot"></span>
            </div>
            <div class="sensor" :class="{ connected: sensorStatus.skin }">
              <span class="sensor-icon">⚡</span>
              <span class="sensor-name">皮电传感器</span>
              <span class="sensor-dot"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间：主控制面板 -->
      <div class="center-panel">
        <!-- AI分析结果 -->
        <div class="card ai-analysis">
          <div class="card-header">
            <h3 class="card-title">🤖 AI智能分析</h3>
            <div class="ai-source">
              <span class="source-badge modelarts">ModelArts</span>
              <span class="source-badge deepseek">DeepSeek</span>
            </div>
          </div>
          
          <div class="analysis-content">
            <!-- 状态总结 -->
            <div class="state-summary">
              <div class="summary-item">
                <div class="summary-icon">🧠</div>
                <div class="summary-content">
                  <div class="summary-title">认知状态</div>
                  <div class="summary-text">{{ aiAnalysis.cognitive }}</div>
                </div>
              </div>
              <div class="summary-item">
                <div class="summary-icon">💆</div>
                <div class="summary-content">
                  <div class="summary-title">情绪状态</div>
                  <div class="summary-text">{{ aiAnalysis.emotional }}</div>
                </div>
              </div>
              <div class="summary-item">
                <div class="summary-icon">⚡</div>
                <div class="summary-content">
                  <div class="summary-title">能量水平</div>
                  <div class="summary-text">{{ aiAnalysis.energy }}</div>
                </div>
              </div>
            </div>
            
            <!-- AI建议 -->
            <div class="ai-suggestions">
              <h4>💡 AI建议</h4>
              <div class="suggestion-list">
                <div class="suggestion-item" v-for="(suggestion, index) in aiSuggestions" 
                     :key="index">
                  <div class="suggestion-icon">{{ suggestion.icon }}</div>
                  <div class="suggestion-content">
                    <div class="suggestion-title">{{ suggestion.title }}</div>
                    <div class="suggestion-desc">{{ suggestion.description }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 实时波形 -->
            <div class="wave-visualization">
              <div class="wave-header">
                <h4>📊 脑波实时监测</h4>
                <div class="wave-info">
                  <span class="wave-type">Alpha波</span>
                  <span class="wave-strength">{{ (bioData.alphaWave * 100).toFixed(0) }}%</span>
                </div>
              </div>
              <div class="wave-container">
                <canvas ref="waveCanvas" class="wave-canvas"></canvas>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 冥想控制中心 -->
        <div class="card meditation-control">
          <h3 class="card-title">🎵 冥想控制中心</h3>
          
          <div class="meditation-options">
            <div class="option-group">
              <h4>🧘 冥想类型</h4>
              <div class="option-buttons">
                <button class="option-btn" 
                        v-for="type in meditationTypes" 
                        :key="type.id"
                        :class="{ active: selectedMeditation === type.id }"
                        @click="selectMeditation(type.id)">
                  <span class="option-icon">{{ type.icon }}</span>
                  <span class="option-name">{{ type.name }}</span>
                </button>
              </div>
            </div>
            
            <div class="option-group">
              <h4>⏱️ 持续时间</h4>
              <div class="duration-slider">
                <input type="range" 
                       min="5" 
                       max="60" 
                       step="5" 
                       v-model="selectedDuration"
                       class="slider">
                <div class="slider-value">{{ selectedDuration }} 分钟</div>
              </div>
            </div>
            
            <div class="option-group">
              <h4>🔊 背景声音</h4>
              <div class="sound-options">
                <button class="sound-btn"
                        v-for="sound in backgroundSounds"
                        :key="sound.id"
                        :class="{ active: selectedSound === sound.id }"
                        @click="selectSound(sound.id)">
                  {{ sound.name }}
                </button>
              </div>
            </div>
          </div>
          
          <div class="control-actions">
            <button class="start-btn" @click="startMeditation" :disabled="meditationActive">
              {{ meditationActive ? '🔄 进行中...' : '▶️ 开始冥想' }}
            </button>
            <button class="stop-btn" @click="stopMeditation" :disabled="!meditationActive">
              ⏹️ 结束
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧：AI对话和推荐 -->
      <div class="right-panel">
        <!-- AI对话面板 -->
        <div class="card ai-chat">
          <div class="card-header">
            <h3 class="card-title">💬 AI冥想助手</h3>
            <button class="voice-btn" @click="toggleVoiceMode" 
                    :class="{ active: voiceModeActive }">
              {{ voiceModeActive ? '🎤 语音中' : '🎤 语音' }}
            </button>
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
                  <span v-else-if="message.type === 'deepseek'">🔍</span>
                  <span v-else>🤖</span>
                </div>
                <div class="message-content">
                  <div class="message-sender">{{ message.sender }}</div>
                  <div class="message-text">{{ message.text }}</div>
                  <div class="message-time">{{ message.time }}</div>
                </div>
              </div>
            </div>
            
            <!-- 输入区域 -->
            <div class="chat-input">
              <input type="text" 
                     v-model="chatInput" 
                     @keyup.enter="sendMessage"
                     placeholder="向AI助手提问..."
                     class="input-field">
              <button class="send-btn" @click="sendMessage">
                📤
              </button>
              <button class="mic-btn" @click="toggleVoiceInput" 
                      :class="{ active: voiceInputActive }">
                🎤
              </button>
            </div>
            
            <!-- 快捷指令 -->
            <div class="quick-commands">
              <button class="command-btn" 
                      v-for="cmd in quickCommands"
                      :key="cmd"
                      @click="sendQuickCommand(cmd)">
                {{ cmd }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- AI个性化推荐 -->
        <div class="card ai-recommendations">
          <h3 class="card-title">⭐ AI个性化推荐</h3>
          
          <div class="recommendation-list">
            <div class="recommendation-item"
                 v-for="recommendation in aiRecommendations"
                 :key="recommendation.id">
              <div class="rec-header">
                <div class="rec-icon">{{ recommendation.icon }}</div>
                <div class="rec-info">
                  <div class="rec-title">{{ recommendation.title }}</div>
                  <div class="rec-source">{{ recommendation.source }}</div>
                </div>
                <div class="rec-confidence">
                  {{ (recommendation.confidence * 100).toFixed(0) }}%
                </div>
              </div>
              <div class="rec-description">{{ recommendation.description }}</div>
              <div class="rec-actions">
                <button class="rec-btn" @click="tryRecommendation(recommendation)">
                  🎯 尝试
                </button>
                <button class="rec-btn info" @click="showRecommendationDetails(recommendation)">
                  ℹ️ 详情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部播放控制栏 -->
    <div class="player-bar" v-if="currentAudio">
      <div class="player-info">
        <div class="now-playing">
          <span class="playing-icon">🎵</span>
          <span class="playing-title">{{ currentAudio.title }}</span>
          <span class="playing-duration">{{ formatTime(currentAudio.currentTime) }} / {{ formatTime(currentAudio.duration) }}</span>
        </div>
        
        <div class="player-controls">
          <button class="player-btn" @click="skipBackward">⏪</button>
          <button class="player-btn play-pause" @click="togglePlayPause">
            {{ isPlaying ? '⏸️' : '▶️' }}
          </button>
          <button class="player-btn" @click="skipForward">⏩</button>
          <button class="player-btn" @click="stopAudio">⏹️</button>
        </div>
        
        <div class="player-progress">
          <input type="range" 
                 v-model="audioProgress" 
                 min="0" 
                 max="100" 
                 class="progress-slider">
        </div>
      </div>
    </div>

    <!-- 模态框：配置API密钥 -->
    <div class="modal-overlay" v-if="showConfigModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">🔧 配置AI服务</h3>
          <button class="modal-close" @click="showConfigModal = false">×</button>
        </div>
        
      <div class="modal-body">
        <!-- ModelArts配置 -->
        <div class="config-section">
          <h4>🤖 华为ModelArts配置</h4>
          <div class="input-group">
            <label>API Key (ModelArts MaaS)</label>
            <input type="password" 
                  v-model="apiConfig.modelarts.apiKey"
                  placeholder="输入ModelArts API Key">
            <p class="config-hint">从华为云ModelArts控制台获取API Key</p>
          </div>
          <!-- 更新模态框中的 API 地址字段 -->
          <div class="input-group">
            <label>API地址</label>
            <input type="text" 
                  :value="apiConfig.modelarts.endpoint"
                  @input="apiConfig.modelarts.endpoint = $event.target.value"
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
          
          <!-- DeepSeek配置 -->
          <div class="config-section">
            <h4>🔍 DeepSeek配置</h4>
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
                     placeholder="https://api.modelarts-maas.com/v1/chat/completions"
                     readonly>
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
            <button class="btn-primary" @click="saveAPIConfig">💾 保存配置</button>
            <button class="btn-secondary" @click="testAPIConnection">🔗 测试连接</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 浮动操作按钮 -->
    <div class="floating-actions">
      <button class="fab main-fab" @click="quickStartMeditation">
        🧘
      </button>
      <button class="fab" @click="showConfigModal = true">
        ⚙️
      </button>
      <button class="fab" @click="exportSessionData">
        📊
      </button>
      <button class="fab" @click="showHelp">
        ❓
      </button>
    </div>
  </div>
</template>



<script>
// 华为ModelArts服务类 - 完整修复版
class HuaweiModelArtsService {
  constructor(config) {
    this.config = config;
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || 'https://api.modelarts-maas.com/v1/chat/completions';
    this.model = config.model || 'DeepSeek-V3';
    console.log('ModelArts服务初始化:', { 
      hasApiKey: !!this.apiKey, 
      endpoint: this.endpoint 
    });
  }

  // 通用聊天方法
  async chat(messages, options = {}) {
    console.log('ModelArts chat方法被调用');
    
    if (!this.validateConfig()) {
      console.log('ModelArts配置无效，使用降级回复');
      return this.fallbackChat(messages);
    }

    try {
      console.log('发送ModelArts请求到:', this.endpoint);
      console.log('使用模型:', this.model);
      console.log('消息:', messages);

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
        signal: AbortSignal.timeout(15000) // 15秒超时
      });

      console.log('ModelArts响应状态:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('ModelArts API错误:', response.status, errorText);
        
        // 如果是认证错误
        if (response.status === 401 || response.status === 403) {
          throw new Error('API Key无效或已过期');
        }
        
        throw new Error(`API错误: ${response.status}`);
      }

      const data = await response.json();
      console.log('ModelArts响应数据:', data);
      
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

  // 格式化消息
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
    const isValid = this.apiKey && this.apiKey.length > 20;
    console.log('ModelArts配置验证:', { isValid, apiKeyLength: this.apiKey?.length });
    return isValid;
  }

  // 降级处理
  fallbackChat(messages) {
    console.log('使用降级回复');
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    const responses = {
      '压力': '我建议您尝试4-7-8呼吸法：吸气4秒 → 屏息7秒 → 呼气8秒。重复5次，能快速降低压力水平。',
      '焦虑': '试试5-4-3-2-1接地法：观察5个物体 → 触摸4个东西 → 听3种声音 → 闻2种气味 → 尝1种味道。',
      '专注': '建议尝试专注呼吸练习：设置5分钟定时器，专注于呼吸时的身体感觉，思绪飘走时温柔带回。',
      '睡眠': '可以尝试身体扫描冥想：从头顶到脚趾，逐一关注每个部位的感觉，想象紧张随之消散。',
      '冥想': '新手从5分钟呼吸冥想开始：找一个舒适姿势，专注于呼吸的自然流动，不评判任何想法。',
      '你好': '您好！我是您的冥想AI助手，我可以为您提供冥想指导、压力缓解技巧和情绪调节建议。',
      '帮助': '我可以帮助您：1. 提供冥想指导 2. 分析情绪状态 3. 建议放松技巧 4. 制定个性化冥想计划'
    };

    let response = '我理解您的感受。建议您找个安静的地方，进行5分钟的深呼吸练习，专注于当下的体验。如果您有特定问题，可以直接告诉我。';
    
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

// DeepSeek服务 - 修复版
class DeepSeekService {
  constructor(config) {
    this.config = config;
    this.endpoint = config.endpoint || 'https://api.deepseek.com/chat/completions';
    this.apiKey = config.apiKey;
    this.model = config.model || 'deepseek-chat';
  }

  async chat(messages, options = {}) {
    if (!this.validateConfig()) {
      console.log('DeepSeek配置无效，使用降级回复');
      return this.fallbackChat(messages);
    }

    try {
      console.log('发送DeepSeek请求到:', this.endpoint);
      console.log('使用模型:', this.model);

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
        const errorText = await response.text();
        console.error('DeepSeek API错误:', response.status, errorText);
        throw new Error(`DeepSeek API错误: ${response.status}`);
      }

      const data = await response.json();
      console.log('DeepSeek响应数据:', data);
      
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
      '压力': '推荐478呼吸法：吸气4秒，屏息7秒，呼气8秒。重复数次，有效缓解压力。',
      '焦虑': '尝试正念练习：关注当下，不做评判。可以从观察呼吸开始。',
      '专注': '番茄工作法结合冥想：专注25分钟，休息5分钟，期间进行简短冥想。',
      '你好': '您好！我是DeepSeek冥想助手，随时为您提供帮助。'
    };

    let response = '欢迎！我是您的冥想助手，可以提供各种冥想指导和放松技巧。';
    
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

// 独立的获取时间函数
function getCurrentTime() {
  return new Date().toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export default {
  name: 'SmartMeditation',
  data() {
    return {
      // API配置 - 简化版
      apiConfig: {
        modelarts: {
          // 测试用的API Key（可能需要替换为你的真实Key）
          apiKey: 'vZVmrfqge1mZQwZRMxOpi_pP-dOJIu8J1G7RQoatT7SxcMPC1-BX8_BjgQvNQubsgz8G6_Gs3dn4Ie7_3-nxdw',
          endpoint: 'https://api.modelarts-maas.com/v1/chat/completions',
          model: 'DeepSeek-V3'
        },
        deepseek: {
          apiKey: '', // 请在此处填写你的DeepSeek API Key
          endpoint: 'https://api.deepseek.com/chat/completions',
          model: 'deepseek-chat'
        },
        // 默认使用ModelArts
        activeAIService: 'modelarts'
      },
      
      // UI状态
      showConfigModal: false,
      
      // 用户数据
      userData: {
        days: 1,
        totalMinutes: 15
      },
      
      // 生理数据
      bioData: {
        heartRate: 72,
        stressLevel: 0.4,
        focusLevel: 0.6,
        alphaWave: 0.5
      },
      
      // 情绪数据
      currentEmotions: [
        { name: '平静', confidence: 70 },
        { name: '专注', confidence: 60 },
        { name: '放松', confidence: 50 }
      ],
      
      // 生物反馈
      bioFeedbackActive: false,
      sensorStatus: {
        heart: true,
        breath: true,
        skin: false
      },
      
      // AI分析
      aiAnalysis: {
        cognitive: '注意力集中度良好',
        emotional: '情绪相对稳定',
        energy: '能量水平中等'
      },
      
      // AI建议
      aiSuggestions: [
        { icon: '🧘', title: '5分钟正念呼吸', description: '专注于呼吸，平静思绪' },
        { icon: '🎵', title: '自然声音冥想', description: '使用雨声作为背景音乐' },
        { icon: '💆', title: '身体扫描练习', description: '放松身体各个部位' }
      ],
      
      // 冥想选项
      meditationTypes: [
        { id: 'mindfulness', name: '正念冥想', icon: '🧘' },
        { id: 'breathing', name: '呼吸练习', icon: '🌬️' },
        { id: 'bodyScan', name: '身体扫描', icon: '💆' },
        { id: 'lovingKindness', name: '慈悲观', icon: '❤️' },
        { id: 'sleep', name: '睡眠冥想', icon: '😴' },
        { id: 'stress', name: '减压冥想', icon: '🌈' }
      ],
      selectedMeditation: 'mindfulness',
      selectedDuration: 10,
      
      // 声音选项
      backgroundSounds: [
        { id: 'rain', name: '雨声' },
        { id: 'waves', name: '海浪' },
        { id: 'forest', name: '森林' },
        { id: 'white', name: '白噪音' }
      ],
      selectedSound: 'rain',
      
      // 冥想状态
      meditationActive: false,
      
      // 聊天相关
      voiceModeActive: false,
      chatInput: '',
      voiceInputActive: false,
      quickCommands: ['压力缓解', '改善睡眠', '提高专注', '情绪调节'],
      isAIThinking: false,
      
      // 聊天历史 - 修复：在data中不使用this.getCurrentTime()
      chatHistory: [],
      
      // AI推荐
      aiRecommendations: [
        { 
          id: 1, 
          icon: '🧠', 
          title: '注意力训练', 
          source: 'AI推荐',
          confidence: 0.85,
          description: '基于您的专注度数据推荐' 
        },
        { 
          id: 2, 
          icon: '😌', 
          title: '放松练习', 
          source: 'AI推荐',
          confidence: 0.78,
          description: '帮助缓解轻微压力' 
        }
      ],
      
      // 音频播放
      currentAudio: null,
      isPlaying: false,
      audioProgress: 0,
      
      // AI服务状态
      aiServiceStatus: {
        modelarts: 'disconnected',
        deepseek: 'disconnected',
        biofeedback: 'connected'
      },
      
      // 服务实例
      modelartsService: null,
      deepseekService: null
    };
  },
  
  created() {
    // 在created生命周期中初始化聊天历史
    this.initializeChatHistory();
  },
  
  methods: {
    // 初始化聊天历史
    initializeChatHistory() {
      this.chatHistory = [
        { 
          type: 'ai', 
          sender: 'AI助手', 
          text: '您好！我是您的冥想AI助手。我可以为您提供：\n1. 冥想指导和技巧\n2. 压力缓解方法\n3. 情绪调节建议\n4. 个性化冥想计划\n\n请告诉我您需要什么帮助？', 
          time: this.getCurrentTime(),
          source: 'local'
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
    
    // 初始化AI服务
    initializeAIServices() {
      console.log('初始化AI服务...');
      
      // 尝试初始化ModelArts
      if (this.apiConfig.modelarts.apiKey && this.apiConfig.modelarts.apiKey.length > 20) {
        try {
          this.modelartsService = new HuaweiModelArtsService(this.apiConfig.modelarts);
          this.aiServiceStatus.modelarts = 'connected';
          console.log('✅ ModelArts服务初始化成功');
          
          // 添加连接成功的消息
          this.addChatMessage('ai', '✅ 华为ModelArts服务已连接！我可以为您提供专业的冥想指导了。', false, 'modelarts');
        } catch (error) {
          console.error('ModelArts初始化失败:', error);
          this.aiServiceStatus.modelarts = 'error';
        }
      } else {
        console.log('⚠️ ModelArts API Key未配置或格式不正确');
        this.aiServiceStatus.modelarts = 'disconnected';
      }
      
      // 尝试初始化DeepSeek
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
      
      // 如果没有AI服务可用，使用本地模式
      if (!this.modelartsService && !this.deepseekService) {
        console.log('⚠️ 无可用AI服务，使用本地模式');
        this.addChatMessage('system', '提示：未检测到AI服务配置。您可以使用本地回复，或点击右下角齿轮⚙️配置API密钥以获得更好的体验。');
      }
    },
    
    // 发送消息
    async sendMessage() {
      if (!this.chatInput.trim()) {
        return;
      }
      
      if (this.isAIThinking) {
        console.log('AI正在思考中，请稍候...');
        return;
      }
      
      const userMessage = this.chatInput.trim();
      console.log('用户发送消息:', userMessage);
      
      // 清空输入框
      this.chatInput = '';
      
      // 添加用户消息到历史
      this.addChatMessage('user', userMessage);
      
      // 设置思考状态
      this.isAIThinking = true;
      
      try {
        // 获取AI回复
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
      console.log('获取AI回复，使用服务:', this.apiConfig.activeAIService);
      
      // 显示思考中消息
      const thinkingId = this.addChatMessage('ai', '正在思考...', true, 'thinking');
      
      try {
        let response;
        
        // 根据选择的AI服务获取回复
        if (this.apiConfig.activeAIService === 'modelarts' && this.modelartsService) {
          console.log('使用ModelArts服务');
          response = await this.getModelArtsResponse(userMessage);
        } else if (this.apiConfig.activeAIService === 'deepseek' && this.deepseekService) {
          console.log('使用DeepSeek服务');
          response = await this.getDeepSeekResponse(userMessage);
        } else {
          console.log('使用本地回复');
          response = this.getLocalResponse(userMessage);
        }
        
        console.log('AI回复:', response);
        
        // 更新消息
        this.updateChatMessage(thinkingId, response.content, this.apiConfig.activeAIService);
        
      } catch (error) {
        console.error('AI回复失败:', error);
        this.updateChatMessage(thinkingId, '抱歉，我遇到了一些技术问题。您可以尝试重新发送或切换AI服务。', 'error');
      }
    },
    
    // 获取ModelArts回复
    async getModelArtsResponse(userMessage) {
      const messages = [
        {
          role: 'system',
          content: `你是一个专业的冥想指导AI助手。请以温暖、专业、亲切的语气回答用户问题。
          
你的专长包括：
1. 冥想技巧和练习指导
2. 压力管理和情绪调节
3. 呼吸练习和放松技巧
4. 睡眠改善建议
5. 正念和注意力训练

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
          content: '你是一个专业的冥想指导师。请用中文提供冥想指导、放松技巧和压力管理建议。保持回答温暖、专业、实用。'
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
        '压力': '推荐4-7-8呼吸法：吸气4秒 → 屏息7秒 → 呼气8秒。重复5次，可有效缓解压力。您还可以尝试渐进式肌肉放松法。',
        '焦虑': '试试5-4-3-2-1接地技巧：观察5个物体 → 触摸4个东西 → 听3种声音 → 闻2种气味 → 尝1种味道。这能帮助您回到当下。',
        '专注': '建议尝试专注呼吸练习：设置5分钟定时器，专注于呼吸时鼻腔的感觉或腹部的起伏。思绪飘走时，温柔地将其带回。',
        '睡眠': '身体扫描冥想：平躺，从头顶开始，逐一关注身体各部位，想象紧张随着呼气离开身体。特别有助于入睡困难。',
        '冥想': '新手建议：每天5-10分钟，找个安静舒适的地方坐下，专注于呼吸的自然流动，不加评判。关键是坚持，而非完美。',
        '你好': '您好！我是您的冥想助手。我可以为您提供冥想指导、放松技巧和情绪调节建议。有什么可以帮助您的吗？',
        '帮助': '我可以帮助您：\n1. 学习冥想技巧\n2. 管理压力和焦虑\n3. 改善睡眠质量\n4. 提高专注力\n5. 调节情绪状态\n请告诉我您具体需要什么帮助？',
        '呼吸': '腹式呼吸练习：\n1. 舒适坐姿，一手放胸，一手放腹\n2. 用鼻子深吸气，感受腹部鼓起\n3. 用嘴缓慢呼气，感受腹部收缩\n4. 重复5-10次，每天练习'
      };
      
      let response = '感谢您的消息！我理解您可能需要冥想方面的帮助。您可以尝试：\n1. 5分钟正念呼吸练习\n2. 渐进式肌肉放松\n3. 身体扫描冥想\n\n如果您有特定问题，请直接告诉我，我会提供更针对性的建议。';
      
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
      
      // 滚动到底部
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
      if (source === 'thinking') return 'AI助手';
      return 'AI助手';
    },
    
    // 更新消息
    updateChatMessage(id, newText, source = 'local') {
      const index = this.chatHistory.findIndex(m => m.id === id);
      if (index !== -1) {
        this.chatHistory[index].text = newText;
        this.chatHistory[index].isTemporary = false;
        this.chatHistory[index].source = source;
        this.chatHistory[index].sender = this.getMessageSender('ai', source);
      }
    },
    
    // 发送快捷命令
    sendQuickCommand(cmd) {
      this.chatInput = cmd;
      this.sendMessage();
    },
    
    // 保存API配置
    async saveAPIConfig() {
      console.log('保存API配置:', this.apiConfig);
      
      // 保存到localStorage
      localStorage.setItem('meditation_ai_config', JSON.stringify(this.apiConfig));
      
      // 重新初始化服务
      this.initializeAIServices();
      
      this.showConfigModal = false;
      
      // 显示保存成功消息
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
        
        // 显示结果
        if (result.success) {
          alert(result.message);
          
          // 更新服务状态
          this.aiServiceStatus[service] = 'connected';
          
          // 添加成功消息到聊天
          this.addChatMessage('system', `✅ ${serviceName}连接测试成功！`);
          
        } else {
          alert(result.message);
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
      console.log('测试ModelArts连接...');
      
      if (!this.apiConfig.modelarts.apiKey) {
        throw new Error('请先配置ModelArts API Key');
      }
      
      console.log('API配置:', this.apiConfig.modelarts);
      
      try {
        const testService = new HuaweiModelArtsService(this.apiConfig.modelarts);
        console.log('测试服务实例:', testService);
        
        // 确保chat方法存在
        if (!testService.chat || typeof testService.chat !== 'function') {
          console.error('chat方法不存在:', testService);
          throw new Error('ModelArts服务类缺少chat方法');
        }
        
        // 测试连接 - 添加超时处理
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('请求超时')), 10000);
        });
        
        const chatPromise = testService.chat([
          { role: 'user', content: '测试连接，请回复"连接成功"' }
        ], { max_tokens: 10 });
        
        const response = await Promise.race([chatPromise, timeoutPromise]);
        
        console.log('测试连接成功，响应:', response);
        
        // 返回成功结果
        return {
          success: true,
          message: `✅ ModelArts连接成功！\n回复: ${response.content}`,
          response: response
        };
        
      } catch (error) {
        console.error('ModelArts测试连接失败:', error);
        return {
          success: false,
          message: `ModelArts连接失败: ${error.message}`,
          error: error
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
          message: `DeepSeek连接成功！` 
        };
      } catch (error) {
        return { 
          success: false, 
          message: `DeepSeek连接失败: ${error.message}` 
        };
      }
    },
    
    // 切换AI服务
    switchAIService(service) {
      if (service === 'modelarts' || service === 'deepseek') {
        this.apiConfig.activeAIService = service;
        const serviceName = service === 'modelarts' ? '华为ModelArts' : 'DeepSeek';
        this.addChatMessage('system', `已切换到${serviceName}服务`);
        
        // 测试新服务是否可用
        if (service === 'modelarts' && !this.modelartsService) {
          this.addChatMessage('system', '⚠️ ModelArts服务未配置或初始化失败，请检查API配置');
        } else if (service === 'deepseek' && !this.deepseekService) {
          this.addChatMessage('system', '⚠️ DeepSeek服务未配置或初始化失败，请检查API配置');
        }
      }
    },
    
    // 其他UI方法（保持不变）
    refreshUserState() {
      console.log('刷新用户状态');
    },
    
    toggleBioFeedback() {
      this.bioFeedbackActive = !this.bioFeedbackActive;
    },
    
    calibrateSensors() {
      this.sensorStatus.skin = true;
    },
    
    selectMeditation(id) {
      this.selectedMeditation = id;
    },
    
    selectSound(id) {
      this.selectedSound = id;
    },
    
    startMeditation() {
      this.meditationActive = true;
      console.log('开始冥想:', this.selectedMeditation, this.selectedDuration);
    },
    
    stopMeditation() {
      this.meditationActive = false;
    },
    
    toggleVoiceMode() {
      this.voiceModeActive = !this.voiceModeActive;
    },
    
    toggleVoiceInput() {
      this.voiceInputActive = !this.voiceInputActive;
    },
    
    tryRecommendation(rec) {
      console.log('尝试推荐:', rec.title);
    },
    
    showRecommendationDetails(rec) {
      console.log('显示推荐详情:', rec);
    },
    
    quickStartMeditation() {
      this.selectedMeditation = 'mindfulness';
      this.selectedDuration = 10;
      this.startMeditation();
    },
    
    exportSessionData() {
      console.log('导出会话数据');
    },
    
    showHelp() {
      alert('智能冥想系统帮助\n\n1. 配置AI服务API密钥以获得更好的对话体验\n2. 选择冥想类型和时长开始练习\n3. 与AI助手对话获取个性化建议\n4. 使用快捷命令快速获取常见问题的建议');
    }
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
    
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
      // Ctrl + / 切换AI服务
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        const newService = this.apiConfig.activeAIService === 'modelarts' ? 'deepseek' : 'modelarts';
        this.switchAIService(newService);
      }
      
      // Esc 关闭模态框
      if (e.key === 'Escape' && this.showConfigModal) {
        this.showConfigModal = false;
      }
    });
    
    // 测试连接状态
    setTimeout(() => {
      if (this.aiServiceStatus.modelarts === 'connected') {
        console.log('✅ ModelArts服务正常运行');
      }
      if (this.aiServiceStatus.deepseek === 'connected') {
        console.log('✅ DeepSeek服务正常运行');
      }
    }, 2000);
  },
  
  watch: {
    // 监听AI服务状态变化
    'apiConfig.activeAIService'(newService) {
      console.log('切换AI服务到:', newService);
    }
  }
};
</script>


<style scoped>
/* 基础样式 */
.app-container {
  min-height: 100vh;
  background: #0f172a;
  color: #f1f5f9;
  font-family: 'Inter', -apple-system, sans-serif;
}

/* 渐变背景 */
.gradient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.95) 50%,
    rgba(51, 65, 85, 0.95) 100%);
  z-index: -1;
}

/* 头部样式 */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
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
  background: linear-gradient(45deg, #00ff88, #00c8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-sub {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-left: 0.5rem;
}

/* 服务状态 */
.service-status {
  display: flex;
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-item.connected {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.status-item.disconnected {
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #94a3b8;
}

.status-icon {
  font-size: 1.1rem;
}

/* 主内容区 */
.app-main {
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 1800px;
  margin: 0 auto;
}

/* 卡片通用样式 */
.card {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

.refresh-btn, .voice-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover, .voice-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #f1f5f9;
}

.voice-btn.active {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

/* 用户卡片 */
.user-avatar {
  text-align: center;
  margin-bottom: 1.5rem;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #00ff88, #00c8ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 1rem;
}

.user-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.user-stats {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.stat {
  font-size: 0.9rem;
  color: #94a3b8;
}

/* 生理数据 */
.physiological-data h4,
.emotion-state h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #f1f5f9;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.data-item {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}

.data-label {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.data-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #00ff88;
  margin-bottom: 0.25rem;
}

.data-unit {
  font-size: 0.8rem;
  color: #94a3b8;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #00c8ff);
  border-radius: 2px;
  transition: width 0.5s ease;
}

/* 情绪标签 */
.emotion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.emotion-tag {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.emotion-tag::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.2;
}

.emotion-tag.平静::after {
  background: #00ff88;
}

.emotion-tag.专注::after {
  background: #00c8ff;
}

.emotion-tag.放松::after {
  background: #8b5cf6;
}

.emotion-tag.焦虑::after {
  background: #f59e0b;
}

/* 生物反馈控制 */
.bio-control .control-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.control-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn.active {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.4);
  color: #00ff88;
}

.sensor-status {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sensor {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 8px;
}

.sensor.connected {
  border-left: 3px solid #00ff88;
}

.sensor-icon {
  font-size: 1.2rem;
}

.sensor-name {
  flex: 1;
  font-weight: 500;
}

.sensor-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.sensor.connected .sensor-dot {
  background: #00ff88;
  box-shadow: 0 0 8px #00ff88;
}

/* AI分析卡片 */
.ai-source {
  display: flex;
  gap: 0.5rem;
}

.source-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.source-badge.modelarts {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.source-badge.deepseek {
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.state-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.summary-item {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-icon {
  font-size: 2rem;
}

.summary-content {
  flex: 1;
}

.summary-title {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.summary-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: #f1f5f9;
}

.ai-suggestions .suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggestion-item {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.suggestion-item:hover {
  background: rgba(15, 23, 42, 0.8);
  transform: translateY(-2px);
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
}

.suggestion-desc {
  font-size: 0.85rem;
  color: #94a3b8;
}

/* 波形可视化 */
.wave-visualization {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  padding: 1rem;
}

.wave-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.wave-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wave-type {
  font-size: 0.9rem;
  font-weight: 600;
  color: #00ff88;
}

.wave-strength {
  padding: 0.25rem 0.75rem;
  background: rgba(0, 255, 136, 0.2);
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #00ff88;
}

.wave-container {
  height: 120px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.wave-canvas {
  width: 100%;
  height: 100%;
}

/* 冥想控制中心 */
.meditation-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.option-group h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #f1f5f9;
}

.option-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.option-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.option-btn.active {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.4);
}

.option-icon {
  font-size: 1.5rem;
}

.option-name {
  font-size: 0.85rem;
  font-weight: 500;
}

.duration-slider {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #00ff88;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.slider-value {
  text-align: center;
  font-weight: 600;
  color: #00ff88;
}

.sound-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sound-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.sound-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sound-btn.active {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.4);
  color: #00ff88;
}

.control-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.start-btn, .stop-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.start-btn {
  background: linear-gradient(135deg, #00ff88, #00c8ff);
  color: #0f172a;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 255, 136, 0.3);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stop-btn {
  background: rgba(255, 68, 68, 0.2);
  border: 1px solid rgba(255, 68, 68, 0.4);
  color: #ff4444;
}

.stop-btn:hover:not(:disabled) {
  background: rgba(255, 68, 68, 0.3);
}

.stop-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* AI聊天面板 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  gap: 1rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.message.user .message-avatar {
  background: rgba(0, 255, 136, 0.2);
}

.message.deepseek .message-avatar {
  background: rgba(139, 92, 246, 0.2);
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message.user .message-content {
  text-align: right;
}

.message-sender {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #94a3b8;
}

.message.user .message-sender {
  color: #00ff88;
}

.message.deepseek .message-sender {
  color: #8b5cf6;
}

.message-text {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.message.user .message-text {
  background: rgba(0, 255, 136, 0.2);
  border-radius: 12px 12px 0 12px;
}

.message.deepseek .message-text {
  background: rgba(139, 92, 246, 0.2);
  border-radius: 12px 12px 12px 0;
}

.message-time {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.chat-input {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.input-field {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 0.95rem;
}

.input-field:focus {
  outline: none;
  border-color: #00ff88;
}

.send-btn, .mic-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: none;
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.send-btn:hover, .mic-btn:hover {
  background: rgba(0, 255, 136, 0.3);
  transform: translateY(-2px);
}

.mic-btn.active {
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
}

.quick-commands {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.command-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.command-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* AI推荐卡片 */
.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-item {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.recommendation-item:hover {
  border-color: rgba(0, 255, 136, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.rec-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.rec-icon {
  font-size: 1.5rem;
}

.rec-info {
  flex: 1;
}

.rec-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.rec-source {
  font-size: 0.85rem;
  color: #94a3b8;
}

.rec-confidence {
  padding: 0.25rem 0.75rem;
  background: rgba(0, 255, 136, 0.2);
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #00ff88;
}

.rec-description {
  font-size: 0.9rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.rec-actions {
  display: flex;
  gap: 0.75rem;
}

.rec-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  background: rgba(0, 255, 136, 0.2);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  color: #00ff88;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.rec-btn:hover {
  background: rgba(0, 255, 136, 0.3);
}

.rec-btn.info {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.rec-btn.info:hover {
  background: rgba(59, 130, 246, 0.3);
}

/* 播放器控制栏 */
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 2rem;
  z-index: 1000;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.now-playing {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.playing-icon {
  font-size: 1.5rem;
}

.playing-title {
  font-weight: 600;
  font-size: 1.1rem;
}

.playing-duration {
  font-size: 0.9rem;
  color: #94a3b8;
}

.player-controls {
  display: flex;
  gap: 1rem;
}

.player-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.player-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.player-btn.play-pause {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.4);
  color: #00ff88;
}

.player-btn.play-pause:hover {
  background: rgba(0, 255, 136, 0.3);
}

.player-progress {
  flex: 1;
}

.progress-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
}

.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #00ff88;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(10px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(45deg, #00ff88, #00c8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 68, 68, 0.2);
  border: none;
  color: #ff4444;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
}

.modal-close:hover {
  background: rgba(255, 68, 68, 0.3);
}

.modal-body {
  padding: 1.5rem;
}

.config-section {
  margin-bottom: 2rem;
}

.config-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #f1f5f9;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #94a3b8;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 0.95rem;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: #00ff88;
}

.config-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #00ff88, #00c8ff);
  color: #0f172a;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 255, 136, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f1f5f9;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 浮动操作按钮 */
.floating-actions {
  position: fixed;
  bottom: 100px;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 1000;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00ff88, #00c8ff);
  border: none;
  color: #0f172a;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
}

.fab:hover {
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 15px 40px rgba(0, 255, 136, 0.5);
}

.fab.main-fab {
  width: 64px;
  height: 64px;
  font-size: 2rem;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .app-main {
    grid-template-columns: 280px 1fr 280px;
  }
}

@media (max-width: 992px) {
  .app-main {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .left-panel,
  .center-panel,
  .right-panel {
    width: 100%;
  }
  
  .state-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .service-status {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .data-grid {
    grid-template-columns: 1fr;
  }
  
  .option-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .player-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .floating-actions {
    bottom: 120px;
    right: 1rem;
  }
}

@media (max-width: 480px) {
  .option-buttons {
    grid-template-columns: 1fr;
  }
  
  .fab {
    width: 48px;
    height: 48px;
    font-size: 1.2rem;
  }
  
  .fab.main-fab {
    width: 56px;
    height: 56px;
    font-size: 1.5rem;
  }
}
</style>