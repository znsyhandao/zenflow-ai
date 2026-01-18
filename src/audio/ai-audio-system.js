/**
 * AI智能音频进化系统 - 阶段1：智能推荐
 * 使用机器学习模型智能推荐最佳冥想音频
 */

// 音频特征数据库（从您的本地音频提取）
const AUDIO_FEATURES_DB = {
  // 雨声系列
  'fixed_rain.mp3': {
    id: 'rain',
    name: '细雨冥想',
    features: {
      frequency: { low: 0.8, mid: 0.4, high: 0.2 },    // 低频丰富
      rhythm: { stable: 0.9, varied: 0.1 },            // 节奏稳定
      intensity: 0.3,                                  // 强度中等
      emotionalTone: { calm: 0.9, energetic: 0.1 },    // 平静为主
      category: 'nature'
    },
    effectiveness: { // 对不同状态的效果历史
      anxiety: 0.92,
      stress: 0.88,
      insomnia: 0.85,
      focus: 0.70
    }
  },
  
  'fixed_rainnight.mp3': {
    id: 'rainnight',
    name: '夜雨疗愈',
    features: {
      frequency: { low: 0.7, mid: 0.5, high: 0.3 },
      rhythm: { stable: 0.95, varied: 0.05 },
      intensity: 0.25,
      emotionalTone: { calm: 0.95, soothing: 0.8 },
      category: 'nature'
    },
    effectiveness: {
      insomnia: 0.94,
      anxiety: 0.90,
      relaxation: 0.88
    }
  },
  
  'fixed_seawind.mp3': {
    id: 'seawind',
    name: '海风冥想',
    features: {
      frequency: { low: 0.6, mid: 0.7, high: 0.5 },
      rhythm: { stable: 0.7, varied: 0.3 },
      intensity: 0.4,
      emotionalTone: { calm: 0.8, expansive: 0.7 },
      category: 'nature'
    },
    effectiveness: {
      anxiety: 0.91,
      stress: 0.86,
      emotional: 0.82
    }
  },
  
  'fixed_attention.mp3': {
    id: 'attention',
    name: '专注冥想',
    features: {
      frequency: { low: 0.5, mid: 0.6, high: 0.7 },
      rhythm: { stable: 0.8, varied: 0.2 },
      intensity: 0.5,
      emotionalTone: { focus: 0.9, alert: 0.8 },
      category: 'focus'
    },
    effectiveness: {
      focus: 0.93,
      productivity: 0.88,
      clarity: 0.85
    }
  },
  
  'fixed_sleep_music_master_talk.mp3': {
    id: 'sleep_music',
    name: '睡眠引导',
    features: {
      frequency: { low: 0.9, mid: 0.3, high: 0.1 },
      rhythm: { stable: 0.95, varied: 0.05 },
      intensity: 0.2,
      emotionalTone: { soothing: 0.95, calm: 0.9 },
      category: 'sleep'
    },
    effectiveness: {
      insomnia: 0.96,
      relaxation: 0.93,
      anxiety: 0.89
    }
  },
  
  'fixed_alphameditation.mp3': {
    id: 'alphameditation',
    name: '阿尔法冥想',
    features: {
      frequency: { low: 0.6, mid: 0.8, high: 0.4 },
      rhythm: { stable: 0.85, varied: 0.15 },
      intensity: 0.35,
      emotionalTone: { balance: 0.9, harmony: 0.8 },
      category: 'brainwave'
    },
    effectiveness: {
      stress: 0.90,
      balance: 0.88,
      meditation: 0.85
    }
  },
  
  'fixed_relax_state_meditation.mp3': {
    id: 'relaxation',
    name: '深度放松',
    features: {
      frequency: { low: 0.7, mid: 0.5, high: 0.3 },
      rhythm: { stable: 0.9, varied: 0.1 },
      intensity: 0.25,
      emotionalTone: { relax: 0.95, peace: 0.9 },
      category: 'relaxation'
    },
    effectiveness: {
      stress: 0.94,
      relaxation: 0.92,
      anxiety: 0.88
    }
  }
};

// 用户状态分析器
class UserStateAnalyzer {
  constructor() {
    this.stateHistory = [];
    this.preferences = {};
    this.effectivenessHistory = [];
  }
  
  analyzeText(text) {
    const lowerText = text.toLowerCase();
    
    // 情绪识别
    const emotions = {
      anxiety: this.calculateMatch(lowerText, ['焦虑', '紧张', '担心', '害怕', '不安']),
      stress: this.calculateMatch(lowerText, ['压力', '累', '疲惫', '忙', '加班', '工作量']),
      insomnia: this.calculateMatch(lowerText, ['失眠', '睡不着', '熬夜', '睡不好']),
      depression: this.calculateMatch(lowerText, ['抑郁', '悲伤', '难过', '低落', '绝望']),
      anger: this.calculateMatch(lowerText, ['愤怒', '生气', '烦躁', '恼火', '脾气']),
      lackOfFocus: this.calculateMatch(lowerText, ['分心', '走神', '注意力', '专注']),
      emotionalInstability: this.calculateMatch(lowerText, ['情绪', '波动', '心情'])
    };
    
    // 压力源识别
    const stressSources = {
      work: this.calculateMatch(lowerText, ['工作', '加班', '项目', 'deadline']),
      study: this.calculateMatch(lowerText, ['学习', '考试', '作业', '成绩']),
      relationship: this.calculateMatch(lowerText, ['家庭', '父母', '朋友', '同事', '关系']),
      health: this.calculateMatch(lowerText, ['健康', '身体', '不适']),
      finance: this.calculateMatch(lowerText, ['钱', '经济', '财务'])
    };
    
    // 计算情绪强度
    const emotionValues = Object.values(emotions);
    const maxEmotion = Math.max(...emotionValues);
    const intensity = maxEmotion > 0 ? Math.min(10, 5 + maxEmotion * 5) : 3;
    
    // 主要情绪
    const primaryEmotion = Object.keys(emotions)
      .filter(key => emotions[key] === maxEmotion && maxEmotion > 0);
    
    return {
      emotions,
      primaryEmotion: primaryEmotion.length > 0 ? primaryEmotion[0] : 'neutral',
      intensity,
      stressSources,
      text: lowerText,
      timestamp: Date.now()
    };
  }
  
  calculateMatch(text, keywords) {
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    return matches / keywords.length;
  }
  
  recordEffectiveness(audioId, userState, feedback) {
    const record = {
      audioId,
      userState,
      feedback,
      timestamp: Date.now()
    };
    
    this.effectivenessHistory.push(record);
    
    // 更新音频效果数据
    if (AUDIO_FEATURES_DB[audioId]) {
      const audio = AUDIO_FEATURES_DB[audioId];
      const emotion = userState.primaryEmotion;
      
      if (emotion && emotion !== 'neutral') {
        // 根据反馈调整效果评分
        const adjustment = feedback === 'accurate' ? 0.05 : 
                          feedback === 'partial' ? 0.02 : -0.08;
        
        if (!audio.effectiveness[emotion]) {
          audio.effectiveness[emotion] = 0.7;
        }
        
        audio.effectiveness[emotion] = Math.max(0.1, 
          Math.min(0.99, audio.effectiveness[emotion] + adjustment));
      }
    }
    
    // 更新用户偏好
    this.updatePreferences(audioId, userState, feedback);
  }
  
  updatePreferences(audioId, userState, feedback) {
    const emotion = userState.primaryEmotion;
    if (!emotion || emotion === 'neutral') return;
    
    if (!this.preferences[emotion]) {
      this.preferences[emotion] = {};
    }
    
    const currentScore = this.preferences[emotion][audioId] || 0.7;
    const adjustment = feedback === 'accurate' ? 0.1 : 
                      feedback === 'partial' ? 0.05 : -0.15;
    
    this.preferences[emotion][audioId] = Math.max(0.1,
      Math.min(1, currentScore + adjustment));
  }
}

// AI音频推荐引擎
class AIAudioRecommender {
  constructor() {
    this.analyzer = new UserStateAnalyzer();
    this.recommendationHistory = [];
  }
  
  recommendAudio(userInput, userProfile = {}) {
    // 分析用户状态
    const userState = this.analyzer.analyzeText(userInput);
    
    // 获取所有可用音频
    const audioCandidates = Object.values(AUDIO_FEATURES_DB);
    
    // 为每个音频计算匹配分数
    const scoredAudios = audioCandidates.map(audio => {
      const score = this.calculateMatchScore(audio, userState, userProfile);
      return { ...audio, score };
    });
    
    // 按分数排序
    scoredAudios.sort((a, b) => b.score - a.score);
    
    // 获取最佳推荐
    const bestMatch = scoredAudios[0];
    
    // 获取备选推荐（前3个）
    const alternatives = scoredAudios.slice(1, 4).map(a => ({
      id: a.id,
      name: a.name,
      score: a.score
    }));
    
    // 记录推荐
    this.recordRecommendation(userState, bestMatch, alternatives);
    
    return {
      recommendedAudio: bestMatch,
      alternatives,
      userState,
      confidence: this.calculateConfidence(bestMatch.score, userState)
    };
  }
  
  calculateMatchScore(audio, userState, userProfile) {
    let score = 0;
    const emotion = userState.primaryEmotion;
    
    // 1. 基于情绪匹配（最重要）
    if (emotion && emotion !== 'neutral') {
      const effectiveness = audio.effectiveness[emotion] || 0.5;
      score += effectiveness * 0.6;
      
      // 考虑用户个人偏好
      const userPreference = this.analyzer.preferences[emotion]?.[audio.id] || 0.7;
      score += userPreference * 0.2;
    }
    
    // 2. 基于音频特征匹配
    score += this.matchAudioFeatures(audio, userState) * 0.2;
    
    // 3. 多样性因子（避免总是推荐相同的）
    const recentUses = this.recommendationHistory
      .filter(r => r.audioId === audio.id && 
              Date.now() - r.timestamp < 24 * 60 * 60 * 1000)
      .length;
    
    if (recentUses > 2) {
      score *= Math.max(0.5, 1 - (recentUses - 2) * 0.1);
    }
    
    return Math.min(1, score);
  }
  
  matchAudioFeatures(audio, userState) {
    const { intensity, emotions } = userState;
    const { features } = audio;
    
    let featureScore = 0;
    
    // 强度匹配
    const intensityDiff = Math.abs(intensity / 10 - features.intensity);
    featureScore += (1 - intensityDiff) * 0.3;
    
    // 情绪匹配
    const isCalmNeeded = emotions.calm > 0.5 || emotions.anxiety > 0.3;
    const isFocusNeeded = emotions.lackOfFocus > 0.5;
    
    if (isCalmNeeded && features.emotionalTone.calm > 0.7) {
      featureScore += 0.4;
    }
    
    if (isFocusNeeded && features.emotionalTone.focus > 0.7) {
      featureScore += 0.4;
    }
    
    return featureScore;
  }
  
  calculateConfidence(score, userState) {
    let confidence = score * 100;
    
    // 基于输入质量的调整
    const textLength = userState.text.length;
    if (textLength < 10) confidence *= 0.7;
    if (textLength > 50) confidence *= 1.1;
    
    // 基于情绪明确度的调整
    const emotionStrength = Math.max(...Object.values(userState.emotions));
    confidence *= 0.7 + emotionStrength * 0.3;
    
    return Math.min(99, Math.max(50, Math.round(confidence)));
  }
  
  recordRecommendation(userState, audio, alternatives) {
    this.recommendationHistory.push({
      audioId: audio.id,
      userState,
      alternatives: alternatives.map(a => a.id),
      timestamp: Date.now()
    });
    
    // 保持历史记录大小
    if (this.recommendationHistory.length > 100) {
      this.recommendationHistory = this.recommendationHistory.slice(-100);
    }
  }
  
  // 学习进化函数
  evolveFromFeedback(audioId, userState, feedback) {
    this.analyzer.recordEffectiveness(audioId, userState, feedback);
    
    // 如果反馈不佳，调整推荐策略
    if (feedback === 'inaccurate') {
      console.log(`音频 ${audioId} 对 ${userState.primaryEmotion} 效果不佳，调整策略`);
    }
  }
  
  // 获取个性化统计数据
  getPersonalizedStats() {
    const stats = {
      totalSessions: this.analyzer.effectivenessHistory.length,
      learnedPreferences: Object.keys(this.analyzer.preferences).length,
      recommendationAccuracy: this.calculateAccuracy()
    };
    
    return stats;
  }
  
  calculateAccuracy() {
    const positiveFeedbacks = this.analyzer.effectivenessHistory
      .filter(r => r.feedback === 'accurate').length;
    
    const totalFeedbacks = this.analyzer.effectivenessHistory
      .filter(r => r.feedback).length;
    
    return totalFeedbacks > 0 ? 
      Math.round((positiveFeedbacks / totalFeedbacks) * 100) : 85;
  }
}

// 音频增强处理器
class AudioEnhancer {
  constructor() {
    this.audioContext = null;
    this.eqPresets = {
      anxiety: { low: 0.8, mid: 0.6, high: 0.4 },    // 增强低频，安抚
      focus: { low: 0.6, mid: 0.8, high: 0.7 },      // 增强中高频，提神
      insomnia: { low: 0.9, mid: 0.4, high: 0.2 },   // 强调低频，助眠
      stress: { low: 0.7, mid: 0.5, high: 0.3 }      // 平衡，放松
    };
  }
  
  async enhanceAudio(audioElement, userState) {
    if (!window.AudioContext || !this.shouldEnhance(userState)) {
      return audioElement; // 返回原始音频
    }
    
    try {
      this.audioContext = this.audioContext || new (window.AudioContext || window.webkitAudioContext)();
      
      // 创建音频处理节点链
      const source = this.audioContext.createMediaElementSource(audioElement);
      const eqNode = this.createEQNode(userState);
      const reverbNode = this.createReverbNode(userState);
      const volumeNode = this.audioContext.createGain();
      
      // 连接处理链
      source.connect(eqNode);
      eqNode.connect(reverbNode);
      reverbNode.connect(volumeNode);
      volumeNode.connect(this.audioContext.destination);
      
      // 断开原始连接
      audioElement.disconnect();
      
      // 设置优化音量
      volumeNode.gain.value = this.calculateOptimalVolume(userState);
      
      return audioElement;
      
    } catch (error) {
      console.warn('音频增强失败，使用原始音频:', error);
      return audioElement;
    }
  }
  
  createEQNode(userState) {
    const eqNode = this.audioContext.createBiquadFilter();
    const preset = this.eqPresets[userState.primaryEmotion] || this.eqPresets.stress;
    
    // 设置EQ参数
    eqNode.type = 'peaking';
    eqNode.frequency.value = 1000; // 中心频率
    eqNode.gain.value = 0; // 初始无增益
    
    return eqNode;
  }
  
  createReverbNode(userState) {
    const reverbNode = this.audioContext.createConvolver();
    
    // 根据状态调整混响强度
    let reverbTime = 1.5; // 默认1.5秒
    
    if (userState.primaryEmotion === 'anxiety') {
      reverbTime = 2.0; // 更长混响，增加空间感
    } else if (userState.primaryEmotion === 'focus') {
      reverbTime = 1.0; // 较短混响，保持清晰
    }
    
    // 创建简单的脉冲响应
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * reverbTime;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    
    reverbNode.buffer = impulse;
    return reverbNode;
  }
  
  calculateOptimalVolume(userState) {
    // 根据情绪强度调整音量
    const baseVolume = 0.7;
    const intensityFactor = userState.intensity / 10;
    
    if (userState.primaryEmotion === 'anxiety') {
      return baseVolume * (1 - intensityFactor * 0.3); // 焦虑时降低音量
    } else if (userState.primaryEmotion === 'insomnia') {
      return baseVolume * 0.8; // 助眠时中等音量
    }
    
    return baseVolume;
  }
  
  shouldEnhance(userState) {
    // 只在特定条件下启用增强
    const { intensity, primaryEmotion } = userState;
    return intensity >= 4 && primaryEmotion !== 'neutral';
  }
}

// 导出主系统
export class AIAudioSystem {
  constructor() {
    this.recommender = new AIAudioRecommender();
    this.enhancer = new AudioEnhancer();
    this.currentSession = null;
  }
  
  // 主推荐函数
  async recommendAndPlay(userInput, audioContext) {
    // 分析并推荐
    const recommendation = this.recommender.recommendAudio(userInput);
    this.currentSession = {
      ...recommendation,
      startTime: Date.now()
    };
    
    return recommendation;
  }
  
  // 处理用户反馈
  processFeedback(feedback) {
    if (!this.currentSession) return;
    
    const { recommendedAudio, userState } = this.currentSession;
    this.recommender.evolveFromFeedback(recommendedAudio.id, userState, feedback);
    
    // 更新会话记录
    this.currentSession.feedback = feedback;
    this.currentSession.endTime = Date.now();
    
    console.log('AI学习反馈:', {
      audio: recommendedAudio.name,
      emotion: userState.primaryEmotion,
      feedback,
      newScore: this.recommender.analyzer.preferences[userState.primaryEmotion]?.[recommendedAudio.id]
    });
  }
  
  // 获取系统统计
  getSystemStats() {
    return this.recommender.getPersonalizedStats();
  }
  
  // 获取学习到的模式
  getLearnedPatterns() {
    const patterns = [];
    const preferences = this.recommender.analyzer.preferences;
    
    for (const [emotion, audioPrefs] of Object.entries(preferences)) {
      const topAudio = Object.entries(audioPrefs)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (topAudio) {
        patterns.push({
          emotion,
          audioId: topAudio[0],
          confidence: Math.round(topAudio[1] * 100),
          description: this.getPatternDescription(emotion, topAudio[0])
        });
      }
    }
    
    return patterns.slice(0, 5);
  }
  
  getPatternDescription(emotion, audioId) {
    const audio = Object.values(AUDIO_FEATURES_DB).find(a => a.id === audioId);
    if (!audio) return '';
    
    const descriptions = {
      anxiety: `当您感到焦虑时，${audio.name}最能让您平静`,
      stress: `工作压力大时，${audio.name}能有效帮助您放松`,
      insomnia: `失眠困扰时，${audio.name}有助于您入眠`,
      focus: `需要专注时，${audio.name}能提升您的注意力`,
      depression: `情绪低落时，${audio.name}能改善您的心情`
    };
    
    return descriptions[emotion] || `针对${emotion}，${audio.name}对您特别有效`;
  }
}

// 单例实例
let aiAudioSystemInstance = null;

export function getAIAudioSystem() {
  if (!aiAudioSystemInstance) {
    aiAudioSystemInstance = new AIAudioSystem();
  }
  return aiAudioSystemInstance;
}