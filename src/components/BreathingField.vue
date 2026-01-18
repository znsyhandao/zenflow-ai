<template>
  <div class="container" @click="handleUserInteraction">
    <!-- 音频激活提示 -->
    <div v-if="showAudioActivationPrompt" class="audio-activation-overlay" @click="activateAudioSystem">
      <div class="activation-modal">
        <div class="activation-icon">🎵</div>
        <h3 class="activation-title">AI音频系统激活</h3>
        <p class="activation-text">
          为了获得最佳的个性化冥想体验，<br>
          请允许音频播放并激活AI学习系统。
        </p>
        <button class="activation-btn" @click.stop="activateAudioSystem">
          🧠 激活AI音频系统
        </button>
      </div>
    </div>
    
    <div class="main-content">
      <!-- 头部 -->
      <div class="header">
        <h1 class="title">🧠 AI智能音频进化系统</h1>
        <p class="subtitle">越用越懂你 · 越用越智能</p>
        
        <!-- AI系统状态 -->
        <div class="system-status">
          <div class="status-item" :class="{ active: audioReady }">
            <span class="status-icon">🔊</span>
            <span class="status-text">音频系统：{{ audioStatus }}</span>
          </div>
          <div class="status-item" :class="{ active: aiSystemReady }">
            <span class="status-icon">🤖</span>
            <span class="status-text">AI学习：{{ aiLearningStatus }}</span>
          </div>
          <div class="status-item" :class="{ active: true }">
            <span class="status-icon">📈</span>
            <span class="status-text">进化阶段：阶段1</span>
          </div>
        </div>
      </div>
      
      <!-- AI智能分析核心 -->
      <div class="ai-core-section">
        <h2 class="section-title">🎯 AI智能音频推荐</h2>
        
        <!-- 输入区域 -->
        <div class="input-section">
          <textarea v-model="userInput" 
                   placeholder="请描述您现在的状态...
例如：最近工作压力很大，晚上睡不着，感觉很焦虑...
或者：需要专注工作，但总是分心走神..." 
                   rows="4"></textarea>
          
          <div class="input-actions">
            <button @click="analyzeWithAI" class="analyze-btn" :disabled="!aiSystemReady">
              <span class="btn-icon">🔍</span>
              AI智能分析
            </button>
            
            <div class="quick-suggestions">
              <span class="suggestion-label">快速选择：</span>
              <button @click="quickInput('工作压力')" class="quick-tag">💼 工作压力</button>
              <button @click="quickInput('焦虑紧张')" class="quick-tag">😰 焦虑不安</button>
              <button @click="quickInput('失眠困扰')" class="quick-tag">😴 睡眠问题</button>
              <button @click="quickInput('注意力不集中')" class="quick-tag">🎯 专注力</button>
            </div>
          </div>
        </div>
        
        <!-- AI分析结果 -->
        <div v-if="aiRecommendation" class="ai-result-panel">
          <div class="result-header">
            <h3>
              <span class="ai-icon">🧠</span>
              AI个性化推荐
              <span class="ai-badge" v-if="aiRecommendation.confidence">
                置信度 {{ aiRecommendation.confidence }}%
              </span>
            </h3>
            <div class="evolution-badge">进化阶段1</div>
          </div>
          
          <!-- 情绪分析 -->
          <div class="result-section">
            <h4><span class="section-icon">😔</span> 情绪状态识别</h4>
            <div class="emotion-analysis">
              <div class="emotion-tags">
                <span v-for="emotion in aiRecommendation.userState?.primaryEmotion" 
                      :key="emotion" class="emotion-tag">
                  {{ getEmotionName(emotion) }}
                </span>
              </div>
              <div class="intensity-display">
                强度：{{ aiRecommendation.userState?.intensity || 5 }}/10
                <div class="intensity-bar">
                  <div class="intensity-fill" :style="{
                    width: ((aiRecommendation.userState?.intensity || 5) * 10) + '%'
                  }"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 推荐音频 -->
          <div class="result-section highlight">
            <h4><span class="section-icon">💡</span> AI推荐音频</h4>
            <div class="recommendation-card">
              <div class="recommended-audio">
                <div class="audio-info">
                  <div class="audio-icon">{{ getAudioIcon(aiRecommendation.recommendedAudio.id) }}</div>
                  <div class="audio-details">
                    <div class="audio-name">{{ aiRecommendation.recommendedAudio.name }}</div>
                    <div class="audio-match">
                      🎯 匹配度 {{ Math.round(aiRecommendation.recommendedAudio.score * 100) }}%
                      <span class="audio-category">{{ getAudioCategory(aiRecommendation.recommendedAudio.id) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="audio-description">
                  {{ getRecommendationReason(aiRecommendation.recommendedAudio.id, aiRecommendation.userState?.primaryEmotion) }}
                </div>
                
                <div class="audio-actions">
                  <button @click="playRecommendedAudio" class="play-btn">
                    <span class="btn-icon">▶️</span> 立即体验
                  </button>
                  <button @click="showAlternatives = !showAlternatives" class="alt-btn">
                    <span class="btn-icon">📋</span> 备选方案
                  </button>
                </div>
              </div>
              
              <!-- 备选音频 -->
              <div v-if="showAlternatives && aiRecommendation.alternatives" class="alternatives-section">
                <div class="alternatives-title">其他推荐：</div>
                <div class="alternatives-grid">
                  <div v-for="alt in aiRecommendation.alternatives" :key="alt.id" 
                       class="alternative-card" @click="playAlternative(alt.id)">
                    <div class="alt-icon">{{ getAudioIcon(alt.id) }}</div>
                    <div class="alt-name">{{ alt.name }}</div>
                    <div class="alt-score">{{ Math.round(alt.score * 100) }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- AI增强信息 -->
          <div v-if="audioEnhancement.active" class="result-section">
            <h4><span class="section-icon">⚡</span> AI音频增强</h4>
            <div class="enhancement-info">
              <div class="enhancement-item">
                <span class="enhancement-icon">🎛️</span>
                <span class="enhancement-text">EQ调整：已优化{{ getEnhancementDescription() }}</span>
              </div>
              <div class="enhancement-item">
                <span class="enhancement-icon">🔊</span>
                <span class="enhancement-text">音量优化：适应您当前的情绪状态</span>
              </div>
            </div>
          </div>
          
          <!-- 用户反馈 -->
          <div class="feedback-section">
            <div class="feedback-title">这个推荐适合您吗？</div>
            <div class="feedback-buttons">
              <button @click="submitFeedback('accurate')" class="feedback-btn accurate">
                <span class="feedback-icon">👍</span> 很准确
              </button>
              <button @click="submitFeedback('partial')" class="feedback-btn partial">
                <span class="feedback-icon">👌</span> 部分准确
              </button>
              <button @click="submitFeedback('inaccurate')" class="feedback-btn inaccurate">
                <span class="feedback-icon">👎</span> 不准确
              </button>
            </div>
            <div class="feedback-hint">
              您的反馈将帮助AI学习进化，提供更好的推荐
            </div>
          </div>
        </div>
        
        <!-- AI学习档案 -->
        <div v-if="aiSystemReady" class="learning-profile">
          <div class="profile-header">
            <h3><span class="section-icon">📚</span> AI学习档案</h3>
            <div class="profile-stats">
              <div class="stat-item">
                <div class="stat-value">{{ aiStats.totalSessions || 0 }}</div>
                <div class="stat-label">分析次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ aiStats.accuracy || 85 }}%</div>
                <div class="stat-label">推荐准确率</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ aiStats.learnedPreferences || 0 }}</div>
                <div class="stat-label">学习到的偏好</div>
              </div>
            </div>
          </div>
          
          <!-- 学习到的模式 -->
          <div v-if="learnedPatterns.length > 0" class="learned-patterns">
            <h4>🎯 AI学习到的规律</h4>
            <div class="patterns-grid">
              <div v-for="pattern in learnedPatterns" :key="pattern.emotion" class="pattern-card">
                <div class="pattern-icon">{{ getEmotionIcon(pattern.emotion) }}</div>
                <div class="pattern-content">
                  <div class="pattern-emotion">{{ getEmotionName(pattern.emotion) }}</div>
                  <div class="pattern-audio">
                    {{ getAudioIcon(pattern.audioId) }} {{ pattern.audioName || pattern.audioId }}
                  </div>
                  <div class="pattern-confidence">
                    置信度 {{ pattern.confidence }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 音频播放器 -->
      <div v-if="currentAudio" class="audio-player-simple">
        <div class="player-header">
          <div class="now-playing">
            <span class="playing-icon">{{ getAudioIcon(currentAudio.id) }}</span>
            <span class="playing-name">{{ currentAudio.name }}</span>
            <span v-if="audioEnhancement.active" class="enhancement-badge">AI增强</span>
          </div>
          <div class="player-time">{{ formatTime(currentTime) }} / {{ formatTime(totalTime) }}</div>
        </div>
        
        <div class="player-controls">
          <div class="control-buttons">
            <button @click="togglePlay" class="control-btn play-btn">
              {{ isPlaying ? '⏸️ 暂停' : '▶️ 播放' }}
            </button>
            <button @click="stopAudio" class="control-btn stop-btn">⏹️ 停止</button>
            <button @click="skipToNext" class="control-btn skip-btn">⏭️ 下一个</button>
          </div>
          
          <div class="volume-control">
            <span class="volume-icon">🔊</span>
            <input type="range" min="0" max="100" v-model="volume" class="volume-slider" />
            <span class="volume-value">{{ volume }}%</span>
          </div>
        </div>
      </div>
      
      <!-- 系统状态提示 -->
      <div v-if="statusMessage" class="status-toast" :class="statusType">
        <div class="toast-content">
          <span class="toast-icon">{{ getStatusIcon(statusType) }}</span>
          <span class="toast-text">{{ statusMessage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getAIAudioSystem } from '../audio/ai-audio-system.js'
import { AudioProcessor } from '../audio/audio-processor.js'
import { SmartAudioRecommender } from '../audio/audio-recommender.js'

// ===================== 核心状态 =====================
const audioReady = ref(false)
const audioStatus = ref('初始化中...')
const aiSystemReady = ref(false)
const aiLearningStatus = ref('学习中...')
const isPlaying = ref(false)
const volume = ref(70)
const currentTime = ref(0)
const totalTime = ref(0)

// 用户输入和分析
const userInput = ref('')
const aiRecommendation = ref(null)
const showAlternatives = ref(false)

// 音频相关
const currentAudio = ref(null)
const audioProcessor = new AudioProcessor()

// AI系统实例
const aiAudioSystem = getAIAudioSystem()
const smartRecommender = new SmartAudioRecommender()

// 状态提示
const statusMessage = ref('')
const statusType = ref('info')
const showAudioActivationPrompt = ref(false)

// AI数据
const aiStats = ref({})
const learnedPatterns = ref([])

// 音频增强状态
const audioEnhancement = ref({
  active: false,
  type: null,
  description: ''
})

// 计时器
let playbackTimer = null

// ===================== 初始化 =====================
onMounted(async () => {
  showStatus('🧠 AI音频进化系统启动中...', 'loading')
  
  // 初始化音频系统
  setTimeout(async () => {
    await initAudioSystem()
    initAISystem()
    showWelcomeMessage()
  }, 1000)
})

onUnmounted(() => {
  stopAudio()
  if (playbackTimer) clearInterval(playbackTimer)
})

// ===================== 音频系统 =====================
const initAudioSystem = async () => {
  try {
    // 测试音频权限
    const testAudio = new Audio()
    testAudio.volume = 0
    await testAudio.play().then(() => testAudio.pause())
    
    audioReady.value = true
    audioStatus.value = '已激活'
    
    // 预加载常用音频
    preloadImportantAudios()
    
    return true
  } catch (error) {
    console.log('需要用户交互激活音频')
    showAudioActivationPrompt.value = true
    return false
  }
}

const activateAudioSystem = async () => {
  showStatus('正在激活音频系统...', 'loading')
  
  try {
    const testAudio = new Audio()
    await testAudio.play().then(() => testAudio.pause())
    
    audioReady.value = true
    audioStatus.value = '已激活'
    showAudioActivationPrompt.value = false
    
    showStatus('✅ 音频系统激活成功！', 'success')
    return true
  } catch (error) {
    showStatus('❌ 音频权限被拒绝，请手动允许', 'error')
    return false
  }
}

const preloadImportantAudios = () => {
  const importantAudios = ['rain', 'seawind', 'attention', 'sleep_music']
  importantAudios.forEach(async (id) => {
    try {
      await audioProcessor.loadAudio(id)
    } catch (error) {
      // 静默失败
    }
  })
}

// ===================== AI系统 =====================
const initAISystem = () => {
  aiSystemReady.value = true
  aiLearningStatus.value = '就绪'
  
  // 初始统计数据
  updateAIStats()
  
  showStatus('🤖 AI智能音频系统已就绪', 'success')
}

const updateAIStats = () => {
  // 从AI系统获取统计数据
  aiStats.value = aiAudioSystem.getSystemStats() || {}
  learnedPatterns.value = aiAudioSystem.getLearnedPatterns() || []
}

// ===================== 用户输入处理 =====================
const quickInput = (text) => {
  userInput.value = text
  analyzeWithAI()
}

const analyzeWithAI = async () => {
  if (!userInput.value.trim()) {
    showStatus('请输入您的状态描述', 'warning')
    return
  }
  
  if (!aiSystemReady.value) {
    showStatus('AI系统正在初始化，请稍候...', 'warning')
    return
  }
  
  showStatus('AI正在分析您的状态并推荐最佳音频...', 'loading')
  
  try {
    // 使用AI系统推荐
    const recommendation = await aiAudioSystem.recommendAndPlay(userInput.value)
    aiRecommendation.value = recommendation
    
    // 也记录到简单推荐器
    const emotions = extractEmotions(userInput.value)
    smartRecommender.recordUserChoice(
      recommendation.recommendedAudio.id, 
      emotions, 
      true // 假设初始推荐都是合适的
    )
    
    showStatus(`✅ AI推荐: ${recommendation.recommendedAudio.name}`, 'success')
    
    // 更新统计数据
    updateAIStats()
    
  } catch (error) {
    console.error('AI分析失败:', error)
    
    // 降级到简单推荐
    const quickRec = smartRecommender.quickRecommend(userInput.value)
    aiRecommendation.value = {
      recommendedAudio: { 
        id: quickRec.primary,
        name: getAudioName(quickRec.primary),
        score: 0.85 
      },
      alternatives: quickRec.alternatives.map(id => ({
        id,
        name: getAudioName(id),
        score: 0.75
      })),
      confidence: quickRec.confidence,
      userState: {
        primaryEmotion: quickRec.detectedEmotions[0] || 'stress',
        intensity: 6
      }
    }
    
    showStatus('使用快速推荐引擎', 'info')
  }
}

const extractEmotions = (text) => {
  const emotions = []
  const keywordMap = {
    '焦虑': 'anxiety',
    '压力': 'stress', 
    '失眠': 'insomnia',
    '专注': 'focus',
    '情绪': 'emotional'
  }
  
  Object.keys(keywordMap).forEach(keyword => {
    if (text.includes(keyword)) {
      emotions.push(keywordMap[keyword])
    }
  })
  
  return emotions
}

// ===================== 音频播放控制 =====================
const playRecommendedAudio = async () => {
  if (!aiRecommendation.value) return
  
  const audioId = aiRecommendation.value.recommendedAudio.id
  const userState = aiRecommendation.value.userState
  
  await playAudio(audioId, userState)
}

const playAlternative = async (audioId) => {
  const userState = aiRecommendation.value?.userState
  await playAudio(audioId, userState)
}

const playAudio = async (audioId, userState = null) => {
  if (!audioReady.value) {
    showAudioActivationPrompt.value = true
    return false
  }
  
  showStatus(`正在播放 ${getAudioName(audioId)}...`, 'loading')
  
  try {
    // 检查是否应该应用增强
    const shouldEnhance = userState && userState.intensity >= 5
    
    const success = await audioProcessor.playAudio(audioId, shouldEnhance ? userState : null)
    
    if (success) {
      const audioInfo = audioProcessor.getCurrentAudioInfo()
      currentAudio.value = {
        id: audioId,
        name: getAudioName(audioId),
        ...audioInfo
      }
      
      isPlaying.value = true
      startPlaybackTimer()
      
      // 设置音频增强状态
      audioEnhancement.value = {
        active: shouldEnhance,
        type: userState?.primaryEmotion,
        description: getEnhancementDescription(userState?.primaryEmotion)
      }
      
      showStatus(`▶️ 正在播放: ${getAudioName(audioId)}`, 'success')
      return true
    }
  } catch (error) {
    console.error('播放失败:', error)
    showStatus('❌ 播放失败，请检查音频文件', 'error')
  }
  
  return false
}

const togglePlay = () => {
  if (!currentAudio.value) return
  
  const wasPlaying = audioProcessor.togglePlay()
  isPlaying.value = wasPlaying
  
  if (wasPlaying) {
    showStatus('▶️ 继续播放', 'success')
  } else {
    showStatus('⏸️ 已暂停', 'info')
  }
}

const stopAudio = () => {
  audioProcessor.stopCurrentAudio()
  currentAudio.value = null
  isPlaying.value = false
  
  if (playbackTimer) {
    clearInterval(playbackTimer)
    playbackTimer = null
  }
  
  currentTime.value = 0
  showStatus('⏹️ 播放停止', 'info')
}

const skipToNext = () => {
  if (!aiRecommendation.value?.alternatives) {
    // 如果没有备选，随机选择一个
    const allAudios = ['rain', 'seawind', 'attention', 'sleep_music', 'relaxation']
    const randomAudio = allAudios[Math.floor(Math.random() * allAudios.length)]
    playAudio(randomAudio)
    return
  }
  
  // 选择第一个备选
  const nextAudio = aiRecommendation.value.alternatives[0]
  playAudio(nextAudio.id)
}

const startPlaybackTimer = () => {
  if (playbackTimer) clearInterval(playbackTimer)
  
  currentTime.value = 0
  totalTime.value = 600 // 假设10分钟
  
  playbackTimer = setInterval(() => {
    if (!isPlaying.value || !currentAudio.value) return
    
    currentTime.value++
    
    // 更新音频信息
    const audioInfo = audioProcessor.getCurrentAudioInfo()
    if (audioInfo) {
      currentTime.value = Math.floor(audioInfo.currentTime)
      totalTime.value = Math.floor(audioInfo.duration) || 600
    }
    
    // 检查是否播放结束
    if (currentTime.value >= totalTime.value) {
      clearInterval(playbackTimer)
      showStatus('🎉 冥想完成！', 'success')
      stopAudio()
      
      // 记录完成会话
      recordSessionCompletion()
    }
  }, 1000)
}

const recordSessionCompletion = () => {
  if (aiRecommendation.value && currentAudio.value) {
    // 这里可以记录完整的会话数据
    console.log('会话完成:', {
      audio: currentAudio.value.id,
      duration: currentTime.value,
      recommendation: aiRecommendation.value.recommendedAudio.id
    })
  }
}

// ===================== 用户反馈和学习 =====================
const submitFeedback = (type) => {
  if (!aiRecommendation.value) return
  
  const audioId = aiRecommendation.value.recommendedAudio.id
  const userState = aiRecommendation.value.userState
  
  // 更新AI系统
  aiAudioSystem.processFeedback(type)
  
  // 更新简单推荐器
  const emotions = userState ? [userState.primaryEmotion] : extractEmotions(userInput.value)
  const isHelpful = type === 'accurate' || type === 'partial'
  smartRecommender.recordUserChoice(audioId, emotions, isHelpful)
  
  // 显示反馈信息
  const messages = {
    accurate: '感谢反馈！AI已记录您的偏好',
    partial: '感谢反馈！AI将优化推荐策略',
    inaccurate: '感谢反馈！AI需要更多学习'
  }
  
  showStatus(messages[type] || '感谢反馈！', 'success')
  
  // 更新统计数据
  updateAIStats()
}

// ===================== 工具函数 =====================
const getAudioInfo = (audioId) => {
  const audioMap = {
    rain: { name: '细雨冥想', icon: '🌧️', category: '自然声音' },
    rainnight: { name: '夜雨疗愈', icon: '🌙', category: '自然声音' },
    seawind: { name: '海风冥想', icon: '🌊', category: '自然声音' },
    attention: { name: '专注冥想', icon: '🎯', category: '专注力' },
    sleep_music: { name: '睡眠引导', icon: '😴', category: '睡眠' },
    alphameditation: { name: '阿尔法冥想', icon: '🌀', category: '脑波音乐' },
    relaxation: { name: '深度放松', icon: '😌', category: '放松' },
    alphabell: { name: '阿尔法脑波（钟声）', icon: '🔔', category: '脑波音乐' },
    alphawave: { name: '阿尔法波音乐', icon: '🌊', category: '脑波音乐' },
    thetabell: { name: '西塔脑波（钟声）', icon: '🛎️', category: '脑波音乐' },
    themeditation: { name: '西塔冥想', icon: '🧘', category: '脑波音乐' },
    ancient_star: { name: '古旋律·星', icon: '⭐', category: '传统冥想' },
    ancient_heart: { name: '古旋律·心', icon: '💖', category: '传统冥想' },
    ancient_preserved: { name: '古旋律·藏', icon: '📜', category: '传统冥想' },
    attention_standard: { name: '标准专注', icon: '📊', category: '专注力' },
    releave_state: { name: '释压状态', icon: '🕊️', category: '放松' },
    sleep_wind_chimes: { name: '风铃助眠', icon: '🎐', category: '睡眠' },
    spring_song: { name: '春之歌', icon: '🌸', category: '季节音乐' },
    reflection: { name: '自我反思', icon: '🪞', category: '内省' },
    hypersensitivity_2: { name: '高敏感训练2', icon: '🎯', category: '感官训练' },
    hypersensitivity_3: { name: '高敏感训练3', icon: '🎯', category: '感官训练' },
    travel_meditation: { name: '冥想旅行', icon: '✈️', category: '体验式冥想' }
  }
  
  return audioMap[audioId] || { name: audioId, icon: '🎵', category: '其他' }
}

const getAudioName = (audioId) => getAudioInfo(audioId).name
const getAudioIcon = (audioId) => getAudioInfo(audioId).icon
const getAudioCategory = (audioId) => getAudioInfo(audioId).category

const getEmotionName = (emotion) => {
  const map = {
    anxiety: '焦虑不安',
    stress: '压力过大',
    insomnia: '睡眠困扰',
    focus: '注意力问题',
    depression: '情绪低落',
    emotional: '情绪波动'
  }
  return map[emotion] || emotion
}

const getEmotionIcon = (emotion) => {
  const map = {
    anxiety: '😰',
    stress: '💼',
    insomnia: '😴',
    focus: '🎯',
    depression: '😔',
    emotional: '🎭'
  }
  return map[emotion] || '😐'
}

const getRecommendationReason = (audioId, emotion) => {
  const reasons = {
    rain: '雨声能有效平静心灵，特别适合焦虑和压力状态',
    seawind: '海风声音能带来宽广感，缓解紧张情绪',
    attention: '专注音乐能提升注意力，改善工作效率',
    sleep_music: '睡眠引导音频有助于放松身心，促进睡眠',
    relaxation: '深度放松音乐能有效释放压力',
    alphameditation: '阿尔法脑波音乐有助于平衡身心状态'
  }
  
  const emotionReasons = {
    anxiety: '这种声音能有效安抚您的焦虑情绪',
    stress: '这个音频专门设计用于压力释放',
    insomnia: '这个音频能帮助您放松入睡',
    focus: '这个音频经过优化，能提升您的专注力'
  }
  
  const baseReason = reasons[audioId] || '这个音频适合您当前的状态'
  const emotionReason = emotion ? emotionReasons[emotion] || '' : ''
  
  return `${baseReason}${emotionReason ? '，' + emotionReason : ''}`
}

const getEnhancementDescription = (emotion) => {
  const descriptions = {
    anxiety: '低频增强，安抚焦虑',
    stress: '平衡EQ，放松压力',
    insomnia: '强调低频，促进睡眠',
    focus: '增强中高频，提升注意力'
  }
  return descriptions[emotion] || '个性化音效优化'
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const getStatusIcon = (type) => {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    loading: '⏳'
  }
  return icons[type] || 'ℹ️'
}

const showStatus = (message, type = 'info') => {
  statusMessage.value = message
  statusType.value = type
  
  setTimeout(() => {
    if (statusMessage.value === message) {
      statusMessage.value = ''
    }
  }, 3000)
}

const showWelcomeMessage = () => {
  setTimeout(() => {
    if (aiSystemReady.value) {
      showStatus('🎯 请描述您的状态，AI将为您推荐个性化冥想音频', 'info')
    }
  }, 1500)
}

// ===================== 用户交互处理 =====================
const handleUserInteraction = () => {
  if (!audioReady.value) {
    activateAudioSystem()
  }
}
</script>

<style scoped>
/* 样式保持原有，主要更新交互元素 */
.ai-badge {
  background: linear-gradient(135deg, #00dbde, #fc00ff);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  margin-left: 10px;
  font-weight: 600;
}

.evolution-badge {
  background: rgba(0, 184, 148, 0.2);
  color: #00b894;
  padding: 6px 15px;
  border-radius: 15px;
  border: 1px solid rgba(0, 184, 148, 0.3);
  font-size: 0.9rem;
  font-weight: 600;
}

.enhancement-badge {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-left: 10px;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.input-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

.quick-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.suggestion-label {
  color: #a0aec0;
  font-size: 0.9rem;
}

.quick-tag {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  color: #a0aec0;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-tag:hover {
  background: rgba(0, 219, 222, 0.1);
  border-color: #00dbde;
  color: white;
  transform: translateY(-2px);
}

.ai-icon {
  margin-right: 8px;
}

.emotion-analysis {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.intensity-display {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #a0aec0;
}

.intensity-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.intensity-fill {
  height: 100%;
  background: linear-gradient(90deg, #00dbde, #fc00ff);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.recommendation-card {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(0, 219, 222, 0.2);
}

.recommended-audio {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.audio-icon {
  font-size: 2rem;
}

.audio-details {
  flex: 1;
}

.audio-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
}

.audio-match {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #a0aec0;
  font-size: 0.9rem;
  margin-top: 5px;
}

.audio-category {
  background: rgba(255, 255, 255, 0.05);
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
}

.audio-description {
  color: #a0aec0;
  line-height: 1.5;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border-left: 3px solid #00dbde;
}

.audio-actions {
  display: flex;
  gap: 10px;
}

.play-btn, .alt-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.play-btn {
  background: linear-gradient(135deg, #00dbde, #fc00ff);
  color: white;
  flex: 2;
}

.alt-btn {
  background: rgba(255, 255, 255, 0.05);
  color: #a0aec0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex: 1;
}

.play-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 219, 222, 0.4);
}

.alt-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateY(-2px);
}

.alternatives-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.alternatives-title {
  color: #a0aec0;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.alternatives-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.alternative-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.alternative-card:hover {
  background: rgba(0, 219, 222, 0.1);
  border-color: #00dbde;
  transform: translateY(-3px);
}

.alt-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.alt-name {
  font-size: 0.9rem;
  color: white;
  margin-bottom: 5px;
}

.alt-score {
  font-size: 0.8rem;
  color: #00dbde;
  font-weight: 600;
}

.enhancement-info {
  background: rgba(255, 193, 7, 0.05);
  border: 1px solid rgba(255, 193, 7, 0.1);
  border-radius: 10px;
  padding: 15px;
}

.enhancement-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.enhancement-item:last-child {
  margin-bottom: 0;
}

.enhancement-icon {
  font-size: 1.2rem;
}

.enhancement-text {
  color: #a0aec0;
  font-size: 0.9rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.pattern-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.pattern-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-3px);
}

.pattern-icon {
  font-size: 1.8rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.pattern-content {
  flex: 1;
}

.pattern-emotion {
  font-weight: 600;
  color: white;
  margin-bottom: 5px;
}

.pattern-audio {
  font-size: 0.85rem;
  color: #a0aec0;
  margin-bottom: 5px;
}

.pattern-confidence {
  font-size: 0.8rem;
  color: #00b894;
  background: rgba(0, 184, 148, 0.1);
  padding: 3px 8px;
  border-radius: 10px;
  display: inline-block;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .alternatives-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .patterns-grid {
    grid-template-columns: 1fr;
  }
  
  .audio-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .alternatives-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-suggestions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .quick-tag {
    text-align: center;
  }
}
</style>