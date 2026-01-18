/**
 * 音频处理器 - 负责音频加载、播放和增强
 */

export class AudioProcessor {
  constructor() {
    this.audioElements = new Map();
    this.currentAudio = null;
    this.audioContext = null;
    this.volume = 0.7;
  }
  
  // 加载本地音频
  async loadAudio(audioId) {
    const audioMap = {
      rain: '/audio/fixed_rain.mp3',
      rainnight: '/audio/fixed_rainnight.mp3',
      seawind: '/audio/fixed_seawind.mp3',
      attention: '/audio/fixed_attention.mp3',
      sleep_music: '/audio/fixed_sleep_music_master_talk.mp3',
      alphameditation: '/audio/fixed_alphameditation.mp3',
      relaxation: '/audio/fixed_relax_state_meditation.mp3',
      alphabell: '/audio/fixed_alphabellstandard.mp3',
      alphawave: '/audio/fixed_alphawave.mp3',
      thetabell: '/audio/fixed_Thetabell.mp3',
      themeditation: '/audio/fixed_Thetameditation.mp3',
      ancient_star: '/audio/fixed_ancient_melody_like_a_star.mp3',
      ancient_heart: '/audio/fixed_ancient_melody_in_heart_old.mp3',
      ancient_preserved: '/audio/fixed_ancient_melody_preserved.mp3',
      attention_standard: '/audio/fixed_attentionstandard.mp3',
      releave_state: '/audio/fixed_releavestate.mp3',
      sleep_wind_chimes: '/audio/fixed_sleep_music_wind_chimes.mp3',
      spring_song: '/audio/fixed_springsong.mp3',
      reflection: '/audio/fixed_reflection.mp3',
      hypersensitivity_2: '/audio/fixed_hypersensitivityepisode_2.mp3',
      hypersensitivity_3: '/audio/fixed_hypersensitivityepisode_3.mp3',
      travel_meditation: '/audio/fixed_mianxiaotutravel_meditation.mp3'
    };
    
    const url = audioMap[audioId];
    if (!url) {
      throw new Error(`音频 ${audioId} 不存在`);
    }
    
    // 如果已加载，直接返回
    if (this.audioElements.has(audioId)) {
      return this.audioElements.get(audioId);
    }
    
    // 创建并加载新音频
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.volume = this.volume;
    
    await new Promise((resolve, reject) => {
      audio.oncanplaythrough = () => {
        console.log(`音频加载完成: ${audioId}`);
        resolve();
      };
      
      audio.onerror = (error) => {
        console.error(`音频加载失败: ${audioId}`, error);
        reject(new Error(`音频加载失败: ${audioId}`));
      };
      
      // 开始加载
      audio.load();
    });
    
    this.audioElements.set(audioId, audio);
    return audio;
  }
  
  // 播放音频
  async playAudio(audioId, userState = null) {
    try {
      // 停止当前音频
      this.stopCurrentAudio();
      
      // 加载音频
      const audio = await this.loadAudio(audioId);
      
      // 如果用户状态存在，尝试增强
      if (userState && window.AudioContext) {
        await this.enhanceAudio(audio, userState);
      }
      
      // 播放
      await audio.play();
      
      this.currentAudio = {
        element: audio,
        id: audioId,
        startTime: Date.now(),
        userState
      };
      
      return true;
      
    } catch (error) {
      console.error('播放失败:', error);
      return false;
    }
  }
  
  // 增强音频（基于用户状态）
  async enhanceAudio(audioElement, userState) {
    if (!window.AudioContext) return;
    
    try {
      this.audioContext = this.audioContext || new (window.AudioContext || window.webkitAudioContext)();
      
      // 创建处理链
      const source = this.audioContext.createMediaElementSource(audioElement);
      const eqNode = this.createEQForState(userState);
      const gainNode = this.audioContext.createGain();
      
      // 连接节点
      source.connect(eqNode);
      eqNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 设置优化参数
      gainNode.gain.value = this.calculateVolume(userState);
      
      // 记录增强信息
      console.log('音频已增强:', {
        emotion: userState.primaryEmotion,
        intensity: userState.intensity,
        eqApplied: true
      });
      
    } catch (error) {
      console.warn('音频增强失败:', error);
    }
  }
  
  createEQForState(userState) {
    const biquadFilter = this.audioContext.createBiquadFilter();
    
    // 根据不同情绪状态设置EQ
    switch(userState.primaryEmotion) {
      case 'anxiety':
        biquadFilter.type = 'lowshelf';
        biquadFilter.frequency.value = 250;
        biquadFilter.gain.value = 3.0; // 增强低频安抚
        break;
        
      case 'insomnia':
        biquadFilter.type = 'lowshelf';
        biquadFilter.frequency.value = 150;
        biquadFilter.gain.value = 4.0; // 增强助眠低频
        break;
        
      case 'focus':
        biquadFilter.type = 'highshelf';
        biquadFilter.frequency.value = 3000;
        biquadFilter.gain.value = 2.0; // 增强高频清晰度
        break;
        
      default:
        biquadFilter.type = 'peaking';
        biquadFilter.frequency.value = 1000;
        biquadFilter.gain.value = 0; // 中性设置
    }
    
    return biquadFilter;
  }
  
  calculateVolume(userState) {
    let baseVolume = this.volume;
    
    // 根据情绪强度调整音量
    if (userState.intensity >= 8) {
      baseVolume *= 0.8; // 高强度时降低音量
    } else if (userState.intensity <= 4) {
      baseVolume *= 1.1; // 低强度时稍微提高
    }
    
    return Math.min(1, Math.max(0.1, baseVolume));
  }
  
  // 停止当前音频
  stopCurrentAudio() {
    if (this.currentAudio?.element) {
      this.currentAudio.element.pause();
      this.currentAudio.element.currentTime = 0;
    }
    this.currentAudio = null;
  }
  
  // 暂停/继续
  togglePlay() {
    if (!this.currentAudio) return false;
    
    const audio = this.currentAudio.element;
    if (audio.paused) {
      audio.play();
      return true;
    } else {
      audio.pause();
      return false;
    }
  }
  
  // 设置音量
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value / 100));
    if (this.currentAudio?.element) {
      this.currentAudio.element.volume = this.volume;
    }
  }
  
  // 获取当前播放信息
  getCurrentAudioInfo() {
    if (!this.currentAudio) return null;
    
    const audio = this.currentAudio.element;
    return {
      id: this.currentAudio.id,
      currentTime: audio.currentTime,
      duration: audio.duration || 0,
      paused: audio.paused,
      volume: audio.volume * 100
    };
  }
}