/**
 * 智能推荐器 - 独立的推荐逻辑
 */

// 音频元数据（简化版）
const AUDIO_METADATA = [
  {
    id: 'rain',
    name: '细雨冥想',
    category: 'nature',
    tags: ['calm', 'relax', 'focus'],
    bestFor: ['anxiety', 'stress', 'meditation']
  },
  {
    id: 'rainnight',
    name: '夜雨疗愈',
    category: 'nature',
    tags: ['sleep', 'calm', 'night'],
    bestFor: ['insomnia', 'anxiety']
  },
  {
    id: 'seawind',
    name: '海风冥想',
    category: 'nature',
    tags: ['ocean', 'calm', 'expansive'],
    bestFor: ['anxiety', 'stress', 'emotional']
  },
  {
    id: 'attention',
    name: '专注冥想',
    category: 'focus',
    tags: ['concentration', 'alert', 'productivity'],
    bestFor: ['focus', 'productivity', 'clarity']
  },
  {
    id: 'sleep_music',
    name: '睡眠引导',
    category: 'sleep',
    tags: ['sleep', 'deep', 'guide'],
    bestFor: ['insomnia', 'relaxation']
  },
  {
    id: 'alphameditation',
    name: '阿尔法冥想',
    category: 'brainwave',
    tags: ['alpha', 'balance', 'harmony'],
    bestFor: ['stress', 'balance', 'meditation']
  },
  {
    id: 'relaxation',
    name: '深度放松',
    category: 'relaxation',
    tags: ['deep', 'relax', 'peace'],
    bestFor: ['stress', 'relaxation']
  },
  {
    id: 'spring_song',
    name: '春之歌',
    category: 'seasonal',
    tags: ['uplifting', 'joy', 'renewal'],
    bestFor: ['depression', 'emotional']
  }
];

// 关键词到情绪的映射
const KEYWORD_TO_EMOTION = {
  // 焦虑相关
  '焦虑': 'anxiety',
  '紧张': 'anxiety',
  '担心': 'anxiety',
  '害怕': 'anxiety',
  '不安': 'anxiety',
  
  // 压力相关
  '压力': 'stress',
  '累': 'stress',
  '疲惫': 'stress',
  '忙': 'stress',
  '加班': 'stress',
  
  // 睡眠相关
  '失眠': 'insomnia',
  '睡不着': 'insomnia',
  '熬夜': 'insomnia',
  '睡不好': 'insomnia',
  
  // 专注相关
  '分心': 'focus',
  '走神': 'focus',
  '注意力': 'focus',
  '专注': 'focus',
  '效率': 'focus',
  
  // 情绪相关
  '抑郁': 'depression',
  '悲伤': 'depression',
  '难过': 'depression',
  '低落': 'depression',
  '情绪': 'emotional',
  '心情': 'emotional'
};

export class SmartAudioRecommender {
  constructor() {
    this.userHistory = [];
    this.preferenceWeights = {};
    this.sessionCount = 0;
  }
  
  // 快速推荐（基于关键词）
  quickRecommend(userInput) {
    const emotions = this.extractEmotions(userInput);
    
    if (emotions.length === 0) {
      // 默认推荐
      return {
        primary: 'rain',
        alternatives: ['seawind', 'relaxation'],
        reason: '检测到一般放松需求'
      };
    }
    
    // 针对主要情绪推荐
    const primaryEmotion = emotions[0];
    const recommendation = this.recommendForEmotion(primaryEmotion);
    
    return {
      ...recommendation,
      detectedEmotions: emotions,
      confidence: this.calculateConfidence(userInput)
    };
  }
  
  // 提取情绪关键词
  extractEmotions(text) {
    const lowerText = text.toLowerCase();
    const emotions = new Set();
    
    for (const [keyword, emotion] of Object.entries(KEYWORD_TO_EMOTION)) {
      if (lowerText.includes(keyword.toLowerCase())) {
        emotions.add(emotion);
      }
    }
    
    return Array.from(emotions);
  }
  
  // 为特定情绪推荐音频
  recommendForEmotion(emotion) {
    const emotionMap = {
      anxiety: {
        primary: 'seawind',
        alternatives: ['rain', 'alphameditation'],
        reason: '海风和雨声能有效缓解焦虑'
      },
      stress: {
        primary: 'relaxation',
        alternatives: ['rain', 'seawind'],
        reason: '深度放松音乐适合缓解压力'
      },
      insomnia: {
        primary: 'sleep_music',
        alternatives: ['rainnight', 'sleep_wind_chimes'],
        reason: '睡眠引导音乐有助于改善睡眠'
      },
      focus: {
        primary: 'attention',
        alternatives: ['alphameditation', 'spring_song'],
        reason: '专注音乐能提升注意力'
      },
      depression: {
        primary: 'spring_song',
        alternatives: ['seawind', 'relaxation'],
        reason: '积极的音乐能改善情绪'
      },
      emotional: {
        primary: 'rain',
        alternatives: ['seawind', 'spring_song'],
        reason: '自然声音有助于情绪平衡'
      }
    };
    
    return emotionMap[emotion] || emotionMap.stress;
  }
  
  calculateConfidence(text) {
    const emotions = this.extractEmotions(text);
    
    if (emotions.length >= 2) {
      return 85; // 多种情绪，置信度较高
    } else if (emotions.length === 1) {
      return 90; // 单一明确情绪，置信度高
    } else {
      return 70; // 没有明确情绪，置信度较低
    }
  }
  
  // 记录用户选择
  recordUserChoice(audioId, emotions, wasHelpful = true) {
    this.sessionCount++;
    
    emotions.forEach(emotion => {
      if (!this.preferenceWeights[emotion]) {
        this.preferenceWeights[emotion] = {};
      }
      
      const currentWeight = this.preferenceWeights[emotion][audioId] || 0.5;
      const adjustment = wasHelpful ? 0.1 : -0.15;
      
      this.preferenceWeights[emotion][audioId] = Math.max(0.1,
        Math.min(1, currentWeight + adjustment));
    });
    
    this.userHistory.push({
      audioId,
      emotions,
      helpful: wasHelpful,
      timestamp: Date.now()
    });
    
    // 保持历史记录大小
    if (this.userHistory.length > 50) {
      this.userHistory = this.userHistory.slice(-50);
    }
  }
  
  // 获取个性化统计数据
  getStats() {
    const totalSessions = this.sessionCount;
    const helpfulSessions = this.userHistory.filter(h => h.helpful).length;
    const accuracy = totalSessions > 0 ? 
      Math.round((helpfulSessions / totalSessions) * 100) : 85;
    
    // 计算最有效的音频
    const audioEffectiveness = {};
    this.userHistory.forEach(record => {
      if (!audioEffectiveness[record.audioId]) {
        audioEffectiveness[record.audioId] = { helpful: 0, total: 0 };
      }
      audioEffectiveness[record.audioId].total++;
      if (record.helpful) audioEffectiveness[record.audioId].helpful++;
    });
    
    const topAudios = Object.entries(audioEffectiveness)
      .map(([id, stats]) => ({
        id,
        effectiveness: Math.round((stats.helpful / stats.total) * 100),
        uses: stats.total
      }))
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 3);
    
    return {
      totalSessions,
      accuracy,
      topAudios,
      learnedEmotions: Object.keys(this.preferenceWeights).length
    };
  }
  
  // 获取学习到的模式
  getLearnedPatterns() {
    const patterns = [];
    
    for (const [emotion, audioWeights] of Object.entries(this.preferenceWeights)) {
      const topAudio = Object.entries(audioWeights)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (topAudio && topAudio[1] > 0.7) {
        const audioName = AUDIO_METADATA.find(a => a.id === topAudio[0])?.name || topAudio[0];
        patterns.push({
          emotion,
          audioId: topAudio[0],
          audioName,
          confidence: Math.round(topAudio[1] * 100),
          uses: this.userHistory.filter(h => 
            h.emotions.includes(emotion) && h.audioId === topAudio[0]
          ).length
        });
      }
    }
    
    return patterns.sort((a, b) => b.confidence - a.confidence).slice(0, 4);
  }
}