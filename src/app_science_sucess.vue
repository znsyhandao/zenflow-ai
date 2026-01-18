<template>
  <div class="app-container">
    <!-- 科幻风格背景 -->
    <div class="neon-grid"></div>
    <div class="holographic-lines"></div>
    
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-neon">
            <div class="neon-circle">
              <span class="logo-icon">🧠</span>
            </div>
          </div>
          <div class="logo-text">
            <h1 class="logo-title">NEURO-MEDITATION</h1>
            <p class="logo-subtitle">AI-Powered Meditation System v2.0</p>
          </div>
        </div>
        
        <div class="header-right">
          <div class="system-status">
            <div class="status-dots">
              <div class="dot" :class="{ active: true }"></div>
              <div class="dot" :class="{ active: true }"></div>
              <div class="dot" :class="{ active: true }"></div>
            </div>
            <div class="status-text">
              <span class="status-indicator"></span>
              <span class="status-label">SYSTEM ONLINE</span>
            </div>
          </div>
          
          <div class="time-display">
            <div class="time">22:47:03</div>
            <div class="date">2025-01-16</div>
          </div>
        </div>
      </div>
      
      <div class="header-divider">
        <div class="divider-line"></div>
        <div class="divider-dot"></div>
        <div class="divider-line"></div>
      </div>
    </header>

    <main class="app-main">
      <div class="main-grid">
        <!-- 左侧面板 -->
        <div class="left-panel">
          <!-- 用户信息面板 -->
          <div class="panel user-panel">
            <div class="panel-header">
              <h2 class="panel-title">
                <span class="title-icon">👤</span>
                USER PROFILE
              </h2>
              <div class="panel-badge" :class="{ 'ab-active': isABTestActive }">
                {{ isABTestActive ? 'A/B TESTING' : 'INACTIVE' }}
              </div>
            </div>
            
            <div class="user-avatar">
              <div class="avatar-ring">
                <div class="avatar-inner">
                  <span class="avatar-icon">🧘</span>
                </div>
                <div class="ring-animation"></div>
              </div>
            </div>
            
            <div class="user-info">
              <h3 class="user-name">ID: USER_047</h3>
              <p class="user-tag">NEURO-MEDITATOR</p>
              
              <div class="user-stats">
                <div class="user-stat">
                  <div class="stat-icon">⏱️</div>
                  <div class="stat-content">
                    <div class="stat-value">{{ totalMeditationTime }}min</div>
                    <div class="stat-label">TOTAL TIME</div>
                  </div>
                </div>
                
                <div class="user-stat">
                  <div class="stat-icon">📈</div>
                  <div class="stat-content">
                    <div class="stat-value">{{ meditationStreak }}d</div>
                    <div class="stat-label">STREAK</div>
                  </div>
                </div>
                
                <div class="user-stat">
                  <div class="stat-icon">🎯</div>
                  <div class="stat-content">
                    <div class="stat-value">{{ focusLevel }}%</div>
                    <div class="stat-label">FOCUS</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="neural-connection">
              <div class="connection-line"></div>
              <div class="connection-node">
                <span class="node-icon">⚡</span>
              </div>
              <div class="connection-info">
                <span class="connection-label">NEURAL LINK</span>
                <span class="connection-status active">ESTABLISHED</span>
              </div>
            </div>
          </div>

          <!-- 快速开始面板 -->
          <div class="panel quick-panel">
            <div class="panel-header">
              <h2 class="panel-title">
                <span class="title-icon">🚀</span>
                QUICK START
              </h2>
            </div>
            
            <div class="session-grid">
              <button 
                v-for="time in sessionTimes" 
                :key="time"
                class="session-card"
                @click="startMeditation(time)"
              >
                <div class="session-time">{{ time }}</div>
                <div class="session-label">MINUTES</div>
                <div class="session-glow"></div>
              </button>
            </div>
            
            <button class="custom-session" @click="showAudioSelector = true">
              <div class="custom-icon">⚙️</div>
              <div class="custom-text">CUSTOM SESSION</div>
            </button>
          </div>
        </div>

        <!-- 中间面板 -->
        <div class="center-panel">
          <!-- 脑波监测面板 -->
          <div class="panel brainwave-panel">
            <div class="panel-header">
              <h2 class="panel-title">
                <span class="title-icon">🌊</span>
                BRAINWAVE MONITORING
              </h2>
              <div class="wave-type">
                <span class="wave-name" :class="getWaveClass(dominantWave)">
                  {{ dominantWave.toUpperCase() }} WAVE
                </span>
                <span class="wave-intensity">{{ waveLevel }}</span>
              </div>
            </div>
            
            <div class="wave-visualization">
              <canvas ref="waveCanvas" class="wave-canvas"></canvas>
              <div class="wave-legend">
                <div class="legend-item">
                  <div class="legend-color alpha"></div>
                  <span>Alpha: {{ Math.round(alphaLevel) }}%</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color theta"></div>
                  <span>Theta: {{ Math.round(thetaLevel) }}%</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color beta"></div>
                  <span>Beta: {{ Math.round(betaLevel) }}%</span>
                </div>
              </div>
            </div>
            
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-header">
                  <span class="metric-icon">🎯</span>
                  <span class="metric-label">FOCUS</span>
                </div>
                <div class="metric-value">{{ focusLevel }}%</div>
                <div class="metric-bar">
                  <div class="bar-fill" :style="{ width: focusLevel + '%' }"></div>
                </div>
              </div>
              
              <div class="metric-item">
                <div class="metric-header">
                  <span class="metric-icon">😌</span>
                  <span class="metric-label">RELAX</span>
                </div>
                <div class="metric-value">{{ relaxationLevel }}%</div>
                <div class="metric-bar">
                  <div class="bar-fill" :style="{ width: relaxationLevel + '%' }"></div>
                </div>
              </div>
              
              <div class="metric-item">
                <div class="metric-header">
                  <span class="metric-icon">🌙</span>
                  <span class="metric-label">SLEEP</span>
                </div>
                <div class="metric-value">{{ sleepQuality }}%</div>
                <div class="metric-bar">
                  <div class="bar-fill" :style="{ width: sleepQuality + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 音频播放器 -->
          <div class="panel player-panel" v-if="currentAudio">
            <div class="panel-header">
              <h2 class="panel-title">
                <span class="title-icon">🎵</span>
                NOW PLAYING
              </h2>
              <div class="track-info">
                <span class="track-category">{{ currentAudio.category }}</span>
                <span class="track-id">#{{ currentAudio.id }}</span>
              </div>
            </div>
            
            <div class="player-main">
              <div class="track-display">
                <div class="track-name">{{ currentAudio.name }}</div>
                <div class="track-description">{{ currentAudio.description }}</div>
              </div>
              
              <div class="player-controls">
                <button class="control-btn skip-btn" @click="skipBackward">
                  <span class="btn-icon">⏮</span>
                </button>
                
                <button class="control-btn play-btn" @click="togglePlay">
                  <span class="btn-icon">{{ isPlaying ? '⏸' : '▶' }}</span>
                  <div class="pulse-effect" v-if="isPlaying"></div>
                </button>
                
                <button class="control-btn skip-btn" @click="skipForward">
                  <span class="btn-icon">⏭</span>
                </button>
                
                <button class="control-btn stop-btn" @click="stopAudio">
                  <span class="btn-icon">⏹</span>
                </button>
              </div>
              
              <div class="progress-section">
                <div class="time-displays">
                  <span class="time-current">{{ formatTime(currentTime) }}</span>
                  <span class="time-total">{{ formatTime(currentAudio.duration) }}</span>
                </div>
                <div class="progress-container" @click="seekAudio">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: progressPercent + '%' }"
                    ></div>
                    <div 
                      class="progress-dot" 
                      :style="{ left: progressPercent + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧面板 -->
        <div class="right-panel">
          <!-- A/B测试面板 -->
          <div class="panel ab-panel">
            <div class="panel-header">
              <h2 class="panel-title">
                <span class="title-icon">🧪</span>
                A/B TEST DASHBOARD
              </h2>
              <button 
                class="status-toggle" 
                :class="{ active: isABTestActive }"
                @click="toggleABTest"
              >
                {{ isABTestActive ? 'ACTIVE' : 'INACTIVE' }}
              </button>
            </div>
            
            <div class="algorithm-display">
              <div class="algorithm-current">
                <div class="algo-label">CURRENT ALGORITHM</div>
                <div class="algo-value">{{ getAlgorithmName(currentAlgorithm) }}</div>
                <div class="algo-code">{{ currentAlgorithm.toUpperCase() }}</div>
              </div>
              
              <div class="algorithm-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ engagementRate }}%</div>
                  <div class="stat-label">ENGAGEMENT</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ completionRate }}%</div>
                  <div class="stat-label">COMPLETION</div>
                </div>
              </div>
            </div>
            
            <div class="algorithm-comparison">
              <h3 class="comparison-title">ALGORITHM PERFORMANCE</h3>
              <div class="comparison-chart">
                <div 
                  v-for="algo in algorithms" 
                  :key="algo"
                  class="algo-bar"
                  :class="{ winner: getWinningAlgorithm() === algo }"
                >
                  <div class="bar-label">{{ getAlgorithmName(algo).toUpperCase() }}</div>
                  <div class="bar-container">
                    <div 
                      class="bar-value" 
                      :style="{ width: getAlgorithmScore(algo) + '%' }"
                    ></div>
                    <div class="bar-score">{{ Math.round(getAlgorithmScore(algo)) }}%</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="test-controls">
              <button class="control-btn" @click="showABControls = true">
                <span class="btn-icon">📊</span>
                <span class="btn-text">DETAILED STATS</span>
              </button>
              <button class="control-btn" @click="exportTestData">
                <span class="btn-icon">💾</span>
                <span class="btn-text">EXPORT DATA</span>
              </button>
            </div>
          </div>

          <!-- 智能推荐面板 -->
          <div class="panel ai-panel">
            <div class="panel-header">
              <h2 class="panel-title">
                <span class="title-icon">🤖</span>
                AI RECOMMENDATION
                <span class="ai-badge">NEURAL NET v2.1</span>
              </h2>
              <button class="refresh-btn" @click="refreshRecommendations">
                <span class="refresh-icon">🔄</span>
                REFRESH
              </button>
            </div>
            
            <div class="ai-status">
              <div class="status-item">
                <div class="status-label">MOOD DETECTION</div>
                <div class="status-value" :class="getMoodClass(currentMood)">
                  {{ currentMood.toUpperCase() }}
                </div>
              </div>
              <div class="status-item">
                <div class="status-label">MATCH CONFIDENCE</div>
                <div class="status-value">{{ recommendationScore }}%</div>
              </div>
            </div>
            
            <div class="recommendation-list">
              <div 
                v-for="item in recommendations" 
                :key="item.id"
                class="rec-item"
                @click="playAudio(item)"
              >
                <div class="rec-rank">{{ recommendations.indexOf(item) + 1 }}</div>
                <div class="rec-content">
                  <div class="rec-header">
                    <span class="rec-name">{{ item.name }}</span>
                    <span class="rec-match" :style="{ color: getMatchColor(item.matchScore) }">
                      {{ Math.round(item.matchScore) }}%
                    </span>
                  </div>
                  <div class="rec-meta">
                    <span class="rec-category">{{ item.category }}</span>
                    <span class="rec-duration">{{ formatDuration(item.duration) }}</span>
                  </div>
                </div>
                <button class="rec-play" :class="{ playing: currentAudio?.id === item.id }">
                  <span class="play-icon">{{ currentAudio?.id === item.id ? '⏸' : '▶' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部控制栏 -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="system-monitor">
          <div class="monitor-item">
            <div class="monitor-label">CPU</div>
            <div class="monitor-bar">
              <div class="monitor-fill" :style="{ width: cpuUsage + '%' }"></div>
            </div>
            <div class="monitor-value">{{ cpuUsage }}%</div>
          </div>
          
          <div class="monitor-item">
            <div class="monitor-label">MEM</div>
            <div class="monitor-bar">
              <div class="monitor-fill" :style="{ width: memoryUsage + '%' }"></div>
            </div>
            <div class="monitor-value">{{ memoryUsage }}%</div>
          </div>
          
          <div class="monitor-item">
            <div class="monitor-label">NEURAL LOAD</div>
            <div class="monitor-bar">
              <div class="monitor-fill" :style="{ width: neuralLoad + '%' }"></div>
            </div>
            <div class="monitor-value">{{ neuralLoad }}%</div>
          </div>
        </div>
        
        <div class="footer-actions">
          <button class="action-btn" @click="showAudioSelector = true">
            <span class="action-icon">🎵</span>
            AUDIO LIBRARY
          </button>
          <button class="action-btn" @click="showABControls = true">
            <span class="action-icon">📈</span>
            ANALYTICS
          </button>
          <button class="action-btn" @click="refreshAll">
            <span class="action-icon">⚡</span>
            SYSTEM RESET
          </button>
        </div>
      </div>
    </footer>

    <!-- 音频选择模态框 -->
    <div class="modal-overlay" v-if="showAudioSelector" @click.self="showAudioSelector = false">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">NEURAL AUDIO LIBRARY</h3>
          <button class="modal-close" @click="showAudioSelector = false">
            <span class="close-icon">✕</span>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="audio-categories">
            <div class="category-scroll">
              <div 
                v-for="cat in audioCategories" 
                :key="cat"
                class="category-chip"
                :class="{ active: selectedCategory === cat }"
                @click="selectedCategory = cat"
              >
                {{ cat.toUpperCase() }}
              </div>
            </div>
          </div>
          
          <div class="audio-grid">
            <div 
              v-for="audio in filteredAudios" 
              :key="audio.id"
              class="audio-card"
              :class="{ playing: currentAudio?.id === audio.id }"
              @click="selectAudio(audio)"
            >
              <div class="audio-preview">
                <div class="audio-icon">{{ getAudioIcon(audio.category) }}</div>
                <div class="audio-waves" v-if="currentAudio?.id === audio.id && isPlaying">
                  <div class="wave"></div>
                  <div class="wave"></div>
                  <div class="wave"></div>
                </div>
              </div>
              
              <div class="audio-info">
                <div class="audio-name">{{ audio.name }}</div>
                <div class="audio-meta">
                  <span class="meta-item">{{ audio.category }}</span>
                  <span class="meta-divider">•</span>
                  <span class="meta-item">{{ formatDuration(audio.duration) }}</span>
                </div>
              </div>
              
              <div class="audio-play">
                <button class="play-button">
                  {{ currentAudio?.id === audio.id && isPlaying ? '⏸' : '▶' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- A/B测试控制面板 -->
    <div class="modal-overlay" v-if="showABControls" @click.self="showABControls = false">
      <div class="modal-dialog large">
        <div class="modal-header">
          <h3 class="modal-title">A/B TEST CONTROL PANEL</h3>
          <button class="modal-close" @click="showABControls = false">
            <span class="close-icon">✕</span>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="test-settings-grid">
            <div class="settings-panel">
              <h4 class="settings-title">TEST CONFIGURATION</h4>
              
              <div class="setting-group">
                <label class="setting-label">TEST STATUS</label>
                <div class="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="testToggle" 
                    v-model="isABTestActive"
                    @change="toggleABTest"
                  >
                  <label for="testToggle" class="toggle-slider"></label>
                  <span class="toggle-label">{{ isABTestActive ? 'ACTIVE' : 'PAUSED' }}</span>
                </div>
              </div>
              
              <div class="setting-group">
                <label class="setting-label">ALGORITHM SELECTION</label>
                <div class="algorithm-selector">
                  <div 
                    v-for="algo in algorithms" 
                    :key="algo"
                    class="algo-option"
                    :class="{ selected: currentAlgorithm === algo }"
                    @click="currentAlgorithm = algo"
                  >
                    <div class="algo-name">{{ getAlgorithmName(algo) }}</div>
                    <div class="algo-score">{{ Math.round(getAlgorithmScore(algo)) }}%</div>
                  </div>
                </div>
              </div>
              
              <div class="setting-group">
                <label class="setting-label">SAMPLE SIZE</label>
                <div class="range-slider">
                  <input 
                    type="range" 
                    min="10" 
                    max="1000" 
                    v-model="sampleSize"
                    class="range-input"
                  >
                  <div class="range-value">{{ sampleSize }} USERS</div>
                </div>
              </div>
            </div>
            
            <div class="stats-panel">
              <h4 class="settings-title">REAL-TIME STATISTICS</h4>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">👥</div>
                  <div class="stat-content">
                    <div class="stat-value">{{ totalUsers }}</div>
                    <div class="stat-label">TOTAL USERS</div>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">🧘</div>
                  <div class="stat-content">
                    <div class="stat-value">{{ meditationSessions }}</div>
                    <div class="stat-label">SESSIONS</div>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">⏱️</div>
                  <div class="stat-content">
                    <div class="stat-value">{{ avgSessionTime }}min</div>
                    <div class="stat-label">AVG DURATION</div>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">📊</div>
                  <div class="stat-content">
                    <div class="stat-value">{{ engagementRate }}%</div>
                    <div class="stat-label">ENGAGEMENT</div>
                  </div>
                </div>
              </div>
              
              <div class="data-export">
                <button class="export-button" @click="exportTestData">
                  <span class="export-icon">📥</span>
                  EXPORT TEST DATA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// AB测试和推荐引擎代码（与之前相同）
class ABTest {
  constructor(config) {
    this.variants = config.variants;
    this.metric = config.metric;
    this.results = {};
    this.userAssignments = new Map();
    this.eventLog = [];
    this.startTime = Date.now();
    
    this.variants.forEach(variant => {
      this.results[variant] = {
        users: new Set(),
        sessions: 0,
        totalTime: 0,
        completions: 0,
        engagement: 0
      };
    });
  }

  assignVariant(userId) {
    if (!this.userAssignments.has(userId)) {
      const variant = this.variants[Math.floor(Math.random() * this.variants.length)];
      this.userAssignments.set(userId, variant);
      this.results[variant].users.add(userId);
      this.logEvent(userId, 'assigned', { variant });
    }
    return this.userAssignments.get(userId);
  }

  logEvent(userId, event, data) {
    const variant = this.userAssignments.get(userId);
    if (!variant) return;

    const eventData = {
      userId,
      variant,
      event,
      timestamp: Date.now(),
      ...data
    };
    
    this.eventLog.push(eventData);

    if (event === 'session_start') {
      this.results[variant].sessions++;
    } else if (event === 'session_complete') {
      this.results[variant].completions++;
      this.results[variant].totalTime += data.duration || 0;
      
      const completionRate = this.results[variant].completions / this.results[variant].sessions;
      const avgTime = this.results[variant].totalTime / this.results[variant].completions;
      this.results[variant].engagement = (completionRate * 0.7 + (avgTime / 30) * 0.3) * 100;
    }
  }

  getResults() {
    return this.results;
  }

  getWinningVariant() {
    let winner = null;
    let highestEngagement = 0;
    
    Object.entries(this.results).forEach(([variant, data]) => {
      if (data.engagement > highestEngagement) {
        highestEngagement = data.engagement;
        winner = variant;
      }
    });
    
    return winner;
  }

  exportData() {
    return {
      variants: this.variants,
      results: this.results,
      eventLog: this.eventLog,
      duration: Date.now() - this.startTime,
      totalUsers: this.userAssignments.size
    };
  }
}

class RecommendationEngine {
  constructor() {
    this.userProfile = {
      preferences: {},
      history: [],
      mood: 'calm'
    };
    this.learningRate = 0.1;
    this.models = {
      collaborative: this.collaborativeFilter,
      content: this.contentBasedFilter,
      hybrid: this.hybridFilter
    };
  }

  updateMood(mood, confidence = 0.8) {
    this.userProfile.mood = mood;
    this.userProfile.preferences[mood] = (this.userProfile.preferences[mood] || 0) + confidence;
  }

  recordInteraction(audioId, category, duration, completed = true) {
    this.userProfile.history.push({
      audioId,
      category,
      duration,
      completed,
      timestamp: Date.now()
    });

    const weight = completed ? this.learningRate : -this.learningRate * 0.5;
    this.userProfile.preferences[category] = 
      (this.userProfile.preferences[category] || 0.5) + weight;
  }

  collaborativeFilter(audios, userProfile) {
    return audios.map(audio => {
      let score = 0.5;
      
      if (userProfile.preferences[audio.category]) {
        score += userProfile.preferences[audio.category] * 0.3;
      }
      
      const avgDuration = userProfile.history.length > 0 
        ? userProfile.history.reduce((sum, h) => sum + h.duration, 0) / userProfile.history.length
        : 600;
      
      const durationDiff = Math.abs(audio.duration - avgDuration);
      score += (1 - durationDiff / avgDuration) * 0.2;
      
      if (audio.moodTags?.includes(userProfile.mood)) {
        score += 0.3;
      }
      
      return { ...audio, matchScore: Math.min(100, score * 100) };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  contentBasedFilter(audios, userProfile) {
    return audios.map(audio => {
      let score = 0.6;
      
      const similarHistory = userProfile.history.filter(h => 
        h.category === audio.category || 
        (audio.tags && h.tags?.some(tag => audio.tags.includes(tag)))
      ).length;
      
      score += (similarHistory / (userProfile.history.length + 1)) * 0.4;
      
      const recentlyPlayed = userProfile.history.some(h => 
        h.audioId === audio.id && 
        Date.now() - h.timestamp < 24 * 60 * 60 * 1000
      );
      
      if (recentlyPlayed) score *= 0.8;
      
      return { ...audio, matchScore: Math.min(100, score * 100) };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  hybridFilter(audios, userProfile) {
    const collaborative = this.collaborativeFilter(audios, userProfile);
    const content = this.contentBasedFilter(audios, userProfile);
    
    return audios.map(audio => {
      const collabScore = collaborative.find(a => a.id === audio.id)?.matchScore || 50;
      const contentScore = content.find(a => a.id === audio.id)?.matchScore || 50;
      
      const score = collabScore * 0.4 + contentScore * 0.6;
      
      return { ...audio, matchScore: Math.min(100, Math.round(score)) };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  getRecommendations(audios, algorithm = 'hybrid') {
    const filterFn = this.models[algorithm] || this.hybridFilter;
    return filterFn.call(this, audios, this.userProfile);
  }
}

export default {
  name: 'App',
  data() {
    const abTest = new ABTest({
      variants: ['collaborative', 'content', 'hybrid'],
      metric: 'user_engagement'
    });

    const recEngine = new RecommendationEngine();

    const audioDatabase = [
      { id: 1, name: 'Alpha Meditation', path: '/audio/fixed_alphameditation.mp3', duration: 1200, category: 'alpha', description: 'Guide into Alpha brainwave state', moodTags: ['calm', 'focused'] },
      { id: 2, name: 'Alpha Wave Training', path: '/audio/fixed_alphawave.mp3', duration: 1105, category: 'alpha', description: 'Standard Alpha wave training', moodTags: ['focused', 'learning'] },
      { id: 3, name: 'Alpha Bell Tone', path: '/audio/fixed_alphabellstandard.mp3', duration: 1200, category: 'alpha', description: 'Alpha wave with bell tones', moodTags: ['calm', 'peaceful'] },
      { id: 4, name: 'Theta Meditation', path: '/audio/fixed_Thetameditation.mp3', duration: 1200, category: 'theta', description: 'Deep relaxation Theta waves', moodTags: ['calm', 'sleepy'] },
      { id: 5, name: 'Theta Bell', path: '/audio/fixed_Thetabell.mp3', duration: 1200, category: 'theta', description: 'Theta wave meditation music', moodTags: ['deep relaxation'] },
      { id: 6, name: 'Focus Training', path: '/audio/fixed_attention.mp3', duration: 1057, category: 'focus', description: 'Focus enhancement training', moodTags: ['focused', 'learning'] },
      { id: 7, name: 'Standard Focus', path: '/audio/fixed_attentionstandard.mp3', duration: 1057, category: 'focus', description: 'Standard focus training', moodTags: ['focused'] },
      { id: 8, name: 'Rain Meditation', path: '/audio/fixed_rain.mp3', duration: 690, category: 'nature', description: 'Rainy meditation atmosphere', moodTags: ['calm', 'peaceful'] },
      { id: 9, name: 'Rainy Night', path: '/audio/fixed_rainnight.mp3', duration: 690, category: 'nature', description: 'Meditation on rainy night', moodTags: ['calm', 'sleepy'] },
      { id: 10, name: 'Sea Breeze', path: '/audio/fixed_seawind.mp3', duration: 690, category: 'nature', description: 'Beach meditation experience', moodTags: ['calm', 'happy'] },
      { id: 11, name: 'Spring Song', path: '/audio/fixed_springsong.mp3', duration: 690, category: 'nature', description: 'Natural spring melody', moodTags: ['happy', 'peaceful'] },
      { id: 12, name: 'Reflection', path: '/audio/fixed_reflection.mp3', duration: 690, category: 'nature', description: 'Calm water reflection', moodTags: ['contemplative', 'peaceful'] },
      { id: 13, name: 'Relaxation State', path: '/audio/fixed_relax_state_meditation.mp3', duration: 1343, category: 'relaxation', description: 'Deep relaxation guidance', moodTags: ['deep relaxation', 'sleepy'] },
      { id: 14, name: 'Stress Relief', path: '/audio/fixed_releavestate.mp3', duration: 1343, category: 'relaxation', description: 'Stress relief meditation', moodTags: ['calm', 'stress relief'] },
      { id: 15, name: 'Master Talk', path: '/audio/fixed_sleep_music_master_talk.mp3', duration: 211, category: 'sleep', description: 'Sleep guidance talk', moodTags: ['sleepy', 'calm'] },
      { id: 16, name: 'Wind Chimes Sleep', path: '/audio/fixed_sleep_music_wind_chimes.mp3', duration: 1294, category: 'sleep', description: 'Wind chimes for sleep', moodTags: ['sleepy', 'peaceful'] },
      { id: 17, name: 'Ancient Heart Melody', path: '/audio/fixed_ancient_melody_in_heart_old.mp3', duration: 1386, category: 'ancient', description: 'Ancient heart melody', moodTags: ['contemplative', 'peaceful'] },
      { id: 18, name: 'Starlight Melody', path: '/audio/fixed_ancient_melody_like_a_star.mp3', duration: 916, category: 'ancient', description: 'Ancient melody under stars', moodTags: ['contemplative', 'calm'] },
      { id: 19, name: 'Preserved Melody', path: '/audio/fixed_ancient_melody_preserved.mp3', duration: 732, category: 'ancient', description: 'Heritage ancient melody', moodTags: ['peaceful', 'contemplative'] },
      { id: 20, name: 'Sensitivity Training 2', path: '/audio/fixed_hypersensitivityepisode_2.mp3', duration: 1100, category: 'sensitivity', description: 'Perception sensitivity boost', moodTags: ['focused', 'aware'] },
      { id: 21, name: 'Sensitivity Training 3', path: '/audio/fixed_hypersensitivityepisode_3.mp3', duration: 1122, category: 'sensitivity', description: 'Advanced sensitivity training', moodTags: ['deep focus', 'aware'] },
      { id: 22, name: 'Travel Meditation', path: '/audio/fixed_mianxiaotutravel_meditation.mp3', duration: 2, category: 'travel', description: 'Short travel meditation', moodTags: ['calm', 'happy'] }
    ];

    return {
      abTest,
      recEngine,
      audioDatabase,
      
      algorithms: ['collaborative', 'content', 'hybrid'],
      currentAlgorithm: 'hybrid',
      isABTestActive: true,
      showABControls: false,
      
      meditationStreak: 7,
      totalMeditationTime: 156,
      focusLevel: 85,
      relaxationLevel: 92,
      sleepQuality: 85,
      currentMood: 'calm',
      
      currentAudio: null,
      audioElement: null,
      isPlaying: false,
      currentTime: 0,
      
      recommendations: [],
      recommendationScore: 0,
      showAudioSelector: false,
      selectedCategory: 'all',
      
      alphaLevel: 75,
      thetaLevel: 65,
      betaLevel: 45,
      dominantWave: 'alpha',
      waveLevel: 'high',
      
      sessionTimes: [5, 10, 15, 20],
      engagementRate: 78,
      testProgress: 65,
      sampleSize: 100,
      totalUsers: 142,
      meditationSessions: 89,
      avgSessionTime: 14,
      completionRate: 76,
      
      cpuUsage: 34,
      memoryUsage: 62,
      neuralLoad: 28,
      
      waveInterval: null,
      updateInterval: null
    };
  },
  computed: {
    progressPercent() {
      if (!this.currentAudio) return 0;
      return (this.currentTime / this.currentAudio.duration) * 100;
    },
    audioCategories() {
      return ['all', ...new Set(this.audioDatabase.map(a => a.category))];
    },
    filteredAudios() {
      if (this.selectedCategory === 'all') return this.audioDatabase;
      return this.audioDatabase.filter(a => a.category === this.selectedCategory);
    }
  },
  methods: {
    getAlgorithmName(algo) {
      const names = {
        collaborative: 'Collaborative',
        content: 'Content-Based', 
        hybrid: 'Hybrid AI'
      };
      return names[algo] || algo;
    },
    
    getAlgorithmScore(algo) {
      const result = this.abTest.getResults()[algo];
      if (!result) return 50;
      return Math.round(result.engagement || 50);
    },
    
    getWinningAlgorithm() {
      return this.abTest.getWinningVariant();
    },
    
    toggleABTest() {
      this.isABTestActive = !this.isABTestActive;
      if (this.isABTestActive) {
        this.currentAlgorithm = this.abTest.assignVariant('current_user');
        this.refreshRecommendations();
      }
    },
    
    refreshRecommendations() {
      this.recommendations = this.recEngine.getRecommendations(
        this.audioDatabase, 
        this.currentAlgorithm
      ).slice(0, 5);
      
      const avgScore = this.recommendations.reduce((sum, item) => sum + item.matchScore, 0) / this.recommendations.length;
      this.recommendationScore = Math.round(avgScore);
      
      if (this.isABTestActive) {
        this.abTest.logEvent('current_user', 'recommendation_shown', {
          algorithm: this.currentAlgorithm,
          recommendations: this.recommendations.map(r => r.id)
        });
      }
    },
    
    getMatchColor(score) {
      if (score >= 80) return '#00ff88';
      if (score >= 60) return '#ffaa00';
      return '#ff4444';
    },
    
    getAudioIcon(category) {
      const icons = {
        'alpha': 'α',
        'theta': 'θ', 
        'focus': '🎯',
        'nature': '🌿',
        'relaxation': '😌',
        'sleep': '🌙',
        'ancient': '🎵',
        'sensitivity': '✨',
        'travel': '🧳'
      };
      return icons[category] || '🎵';
    },
    
    getMoodClass(mood) {
      const classes = {
        'calm': 'mood-calm',
        'focused': 'mood-focused',
        'happy': 'mood-happy',
        'sleepy': 'mood-sleepy',
        'stress': 'mood-stress'
      };
      return classes[mood] || '';
    },
    
    getWaveClass(wave) {
      return `wave-${wave}`;
    },
    
    selectAudio(audio) {
      if (this.audioElement) {
        this.audioElement.pause();
      }
      
      this.currentAudio = audio;
      this.audioElement = new Audio(audio.path);
      this.audioElement.volume = 0.7;
      this.audioElement.currentTime = 0;
      
      this.audioElement.addEventListener('timeupdate', () => {
        this.currentTime = this.audioElement.currentTime;
      });
      
      this.audioElement.addEventListener('ended', () => {
        this.isPlaying = false;
        this.currentTime = 0;
        
        if (this.isABTestActive && this.currentAudio) {
          this.abTest.logEvent('current_user', 'session_complete', {
            algorithm: this.currentAlgorithm,
            audioId: this.currentAudio.id,
            duration: Math.round(this.currentAudio.duration / 60)
          });
          
          this.recEngine.recordInteraction(
            this.currentAudio.id,
            this.currentAudio.category,
            this.currentAudio.duration,
            true
          );
          
          this.meditationSessions++;
          this.totalMeditationTime += Math.round(this.currentAudio.duration / 60);
          this.avgSessionTime = Math.round(this.totalMeditationTime / this.meditationSessions);
          
          const results = this.abTest.getResults()[this.currentAlgorithm];
          if (results) {
            this.completionRate = Math.round((results.completions / results.sessions) * 100);
            this.engagementRate = Math.round(results.engagement);
          }
        }
      });
      
      this.playAudio();
    },
    
    playAudio(item = null) {
      if (item && (!this.currentAudio || this.currentAudio.id !== item.id)) {
        this.selectAudio(item);
        return;
      }
      
      if (!this.audioElement) return;
      
      if (this.isPlaying) {
        this.audioElement.pause();
        this.isPlaying = false;
      } else {
        this.audioElement.play()
          .then(() => {
            this.isPlaying = true;
            
            if (this.isABTestActive && this.currentAudio) {
              this.abTest.logEvent('current_user', 'session_start', {
                algorithm: this.currentAlgorithm,
                audioId: this.currentAudio.id
              });
            }
          })
          .catch(err => console.error('播放失败:', err));
      }
    },
    
    togglePlay() {
      this.playAudio();
    },
    
    stopAudio() {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.isPlaying = false;
        this.currentTime = 0;
      }
    },
    
    skipForward() {
      if (this.audioElement) {
        this.audioElement.currentTime = Math.min(
          this.audioElement.duration,
          this.audioElement.currentTime + 30
        );
      }
    },
    
    skipBackward() {
      if (this.audioElement) {
        this.audioElement.currentTime = Math.max(
          0,
          this.audioElement.currentTime - 30
        );
      }
    },
    
    seekAudio(event) {
      if (!this.audioElement) return;
      
      const progressBar = event.target.closest('.progress-container');
      if (!progressBar) return;
      
      const rect = progressBar.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const percentage = x / rect.width;
      
      this.audioElement.currentTime = percentage * this.audioElement.duration;
    },
    
    drawBrainWave() {
      const canvas = this.$refs.waveCanvas;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      // 创建科幻背景
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'rgba(0, 255, 136, 0.1)');
      gradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(136, 0, 255, 0.1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // 绘制网格
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
      ctx.lineWidth = 0.5;
      const gridSize = 20;
      
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // 绘制主要脑波
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let x = 0; x < width; x++) {
        const y = height / 2 + 
          Math.sin(x * 0.05 + Date.now() * 0.001) * 15 +
          Math.sin(x * 0.1 + Date.now() * 0.0005) * 10;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      // 绘制次要脑波
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      
      for (let x = 0; x < width; x++) {
        const y = height / 2 + 
          Math.cos(x * 0.03 + Date.now() * 0.0007) * 8 +
          Math.sin(x * 0.07 + Date.now() * 0.0003) * 6;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    },
    
    formatDuration(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    exportTestData() {
      const data = this.abTest.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neuro-meditation-abtest-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    
    refreshAll() {
      this.refreshRecommendations();
      
      // 更新情绪
      const moods = ['calm', 'focused', 'happy', 'sleepy', 'stress'];
      this.currentMood = moods[Math.floor(Math.random() * moods.length)];
      this.recEngine.updateMood(this.currentMood);
      
      // 更新脑波
      const waves = ['alpha', 'theta', 'beta'];
      this.dominantWave = waves[Math.floor(Math.random() * waves.length)];
      const levels = ['high', 'medium', 'low'];
      this.waveLevel = levels[Math.floor(Math.random() * levels.length)];
      
      this.focusLevel = 70 + Math.random() * 25;
      this.relaxationLevel = 75 + Math.random() * 20;
      this.sleepQuality = 80 + Math.random() * 15;
      
      this.alphaLevel = 60 + Math.random() * 30;
      this.thetaLevel = 50 + Math.random() * 30;
      this.betaLevel = 30 + Math.random() * 30;
      
      // 更新系统监控
      this.cpuUsage = 20 + Math.random() * 50;
      this.memoryUsage = 40 + Math.random() * 40;
      this.neuralLoad = 10 + Math.random() * 40;
      
      // 更新测试数据
      if (this.isABTestActive) {
        this.testProgress = Math.min(100, this.testProgress + Math.random() * 5);
        this.totalUsers += Math.floor(Math.random() * 3);
      }
    },
    
    startMeditation(minutes) {
      // 为快速开始选择最适合的音频
      const duration = minutes * 60;
      const suitableAudios = this.audioDatabase.filter(a => 
        Math.abs(a.duration - duration) < 300
      );
      
      if (suitableAudios.length > 0) {
        const audio = suitableAudios[Math.floor(Math.random() * suitableAudios.length)];
        this.selectAudio(audio);
      } else {
        // 如果没有合适时长的音频，选择第一个
        this.selectAudio(this.audioDatabase[0]);
      }
    }
  },
  mounted() {
    // 初始化
    if (this.isABTestActive) {
      this.currentAlgorithm = this.abTest.assignVariant('current_user');
    }
    
    this.refreshRecommendations();
    this.recEngine.updateMood(this.currentMood);
    
    // 脑波动画
    this.waveInterval = setInterval(() => {
      this.drawBrainWave();
      
      // 轻微波动脑波数值
      this.alphaLevel = Math.max(30, Math.min(95, this.alphaLevel + (Math.random() - 0.5) * 5));
      this.thetaLevel = Math.max(25, Math.min(90, this.thetaLevel + (Math.random() - 0.5) * 5));
      this.betaLevel = Math.max(20, Math.min(80, this.betaLevel + (Math.random() - 0.5) * 5));
    }, 50);
    
    // 更新时间显示
    setInterval(() => {
      const now = new Date();
      const timeElements = document.querySelectorAll('.time-display .time');
      if (timeElements[0]) {
        timeElements[0].textContent = now.toLocaleTimeString('en-US', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
      
      const dateElements = document.querySelectorAll('.time-display .date');
      if (dateElements[0]) {
        dateElements[0].textContent = now.toISOString().split('T')[0];
      }
    }, 1000);
    
    // 更新音频进度
    this.updateInterval = setInterval(() => {
      if (this.isPlaying && this.audioElement) {
        this.currentTime = this.audioElement.currentTime;
      }
    }, 100);
    
    // 初始绘制脑波
    this.$nextTick(() => {
      this.drawBrainWave();
    });
  },
  beforeUnmount() {
    if (this.waveInterval) clearInterval(this.waveInterval);
    if (this.updateInterval) clearInterval(this.updateInterval);
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }
};
</script>

<style scoped>
/* 科幻风格全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
  background: #0a0e17;
  color: #e0e0e0;
  font-family: 'Segoe UI', 'Roboto Mono', monospace;
  position: relative;
  overflow-x: hidden;
}

/* 科幻背景效果 */
.neon-grid {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 255, 136, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 136, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

.holographic-lines {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    0deg,
    transparent 0%,
    rgba(0, 255, 136, 0.03) 50%,
    transparent 100%
  );
  animation: scanlines 8s linear infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes scanlines {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* 头部样式 */
.app-header {
  position: relative;
  z-index: 10;
  padding: 20px 30px 10px;
  border-bottom: 1px solid rgba(0, 255, 136, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo-neon {
  position: relative;
}

.neon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 255, 136, 0.1);
  border: 2px solid rgba(0, 255, 136, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: neonPulse 2s infinite alternate;
  box-shadow: 
    0 0 20px rgba(0, 255, 136, 0.3),
    inset 0 0 20px rgba(0, 255, 136, 0.1);
}

@keyframes neonPulse {
  0% {
    box-shadow: 
      0 0 20px rgba(0, 255, 136, 0.3),
      inset 0 0 20px rgba(0, 255, 136, 0.1);
  }
  100% {
    box-shadow: 
      0 0 30px rgba(0, 255, 136, 0.5),
      inset 0 0 30px rgba(0, 255, 136, 0.2);
  }
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  text-transform: uppercase;
}

.logo-title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(90deg, #00ff88, #00c8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2px;
  margin: 0;
}

.logo-subtitle {
  font-size: 12px;
  color: rgba(0, 200, 255, 0.7);
  letter-spacing: 1px;
  margin-top: 5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.system-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.status-dots {
  display: flex;
  gap: 5px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 68, 68, 0.3);
  transition: all 0.3s ease;
}

.dot.active {
  background: #00ff88;
  box-shadow: 0 0 10px #00ff88;
}

.status-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #00ff88;
  letter-spacing: 1px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00ff88;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.time-display {
  text-align: right;
}

.time {
  font-size: 20px;
  font-weight: 700;
  color: #00c8ff;
  font-family: 'Roboto Mono', monospace;
  letter-spacing: 2px;
}

.date {
  font-size: 12px;
  color: rgba(0, 200, 255, 0.7);
  letter-spacing: 1px;
  margin-top: 2px;
}

.header-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent,
    rgba(0, 255, 136, 0.5),
    transparent
  );
}

.divider-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #00ff88;
  box-shadow: 0 0 10px #00ff88;
}

/* 主内容区域 */
.app-main {
  position: relative;
  z-index: 10;
  padding: 20px 30px;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 20px;
  max-width: 1800px;
  margin: 0 auto;
}

/* 面板通用样式 */
.panel {
  background: rgba(16, 22, 36, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent,
    rgba(0, 255, 136, 0.5),
    transparent
  );
}

.panel:hover {
  border-color: rgba(0, 255, 136, 0.4);
  box-shadow: 
    0 0 30px rgba(0, 255, 136, 0.1),
    inset 0 0 30px rgba(0, 255, 136, 0.05);
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 255, 136, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #00ff88;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.title-icon {
  font-size: 18px;
}

.panel-badge {
  padding: 4px 12px;
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  border: 1px solid rgba(255, 68, 68, 0.3);
}

.panel-badge.ab-active {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
  border-color: rgba(0, 255, 136, 0.3);
  animation: badgePulse 2s infinite alternate;
}

@keyframes badgePulse {
  0% {
    box-shadow: 0 0 5px rgba(0, 255, 136, 0.3);
  }
  100% {
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
  }
}

/* 用户面板 */
.user-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
}

.user-avatar {
  margin: 20px 0;
}

.avatar-ring {
  position: relative;
  width: 120px;
  height: 120px;
}

.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 255, 136, 0.1);
  border: 2px solid rgba(0, 255, 136, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.avatar-icon {
  font-size: 48px;
}

.ring-animation {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid rgba(0, 255, 136, 0.1);
  border-radius: 50%;
  animation: rotateRing 10s linear infinite;
}

@keyframes rotateRing {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.user-info {
  text-align: center;
  width: 100%;
  padding: 0 20px;
}

.user-name {
  font-size: 18px;
  color: #00c8ff;
  margin-bottom: 5px;
}

.user-tag {
  font-size: 12px;
  color: rgba(0, 200, 255, 0.7);
  letter-spacing: 1px;
  margin-bottom: 20px;
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.user-stat {
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.1);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.stat-icon {
  font-size: 20px;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #00ff88;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 10px;
  color: rgba(0, 255, 136, 0.7);
  letter-spacing: 1px;
}

.neural-connection {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.connection-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent,
    rgba(0, 255, 136, 0.5),
    transparent
  );
}

.connection-node {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 255, 136, 0.2);
  border: 1px solid rgba(0, 255, 136, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: nodePulse 2s infinite;
}

@keyframes nodePulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
  }
}

.connection-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.connection-label {
  font-size: 10px;
  color: rgba(0, 255, 136, 0.7);
}

.connection-status {
  font-size: 11px;
  font-weight: 600;
  color: #00ff88;
  letter-spacing: 1px;
}

/* 快速开始面板 */
.quick-panel {
  padding: 20px;
}

.session-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 20px 0;
}

.session-card {
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 10px;
  padding: 20px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.session-card:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.5);
  transform: translateY(-2px);
}

.session-card:hover .session-glow {
  opacity: 1;
}

.session-time {
  font-size: 28px;
  font-weight: 700;
  color: #00ff88;
  margin-bottom: 5px;
}

.session-label {
  font-size: 10px;
  color: rgba(0, 255, 136, 0.7);
  letter-spacing: 1px;
}

.session-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, 
    rgba(0, 255, 136, 0.3) 0%, 
    transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.custom-session {
  width: 100%;
  background: rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 10px;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #00c8ff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
}

.custom-session:hover {
  background: rgba(0, 200, 255, 0.2);
  border-color: rgba(0, 200, 255, 0.5);
  transform: translateY(-2px);
}

.custom-icon {
  font-size: 18px;
}

/* 脑波监测面板 */
.brainwave-panel {
  margin-bottom: 20px;
}

.wave-type {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wave-name {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
}

.wave-name.wave-alpha { color: #00ff88; }
.wave-name.wave-theta { color: #00c8ff; }
.wave-name.wave-beta { color: #ffaa00; }

.wave-intensity {
  padding: 4px 8px;
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.wave-visualization {
  padding: 20px;
  position: relative;
}

.wave-canvas {
  width: 100%;
  height: 200px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.wave-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(224, 224, 224, 0.8);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.alpha { background: #00ff88; }
.legend-color.theta { background: #00c8ff; }
.legend-color.beta { background: #ffaa00; }

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 0 20px 20px;
}

.metric-item {
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.1);
  border-radius: 8px;
  padding: 15px;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.metric-icon {
  font-size: 16px;
}

.metric-label {
  font-size: 12px;
  color: rgba(0, 255, 136, 0.7);
  letter-spacing: 1px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #00ff88;
  margin-bottom: 10px;
}

.metric-bar {
  height: 6px;
  background: rgba(0, 255, 136, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #00c8ff);
  border-radius: 3px;
}

/* 播放器面板 */
.player-panel {
  padding: 20px;
}

.track-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.track-category {
  padding: 4px 12px;
  background: rgba(0, 200, 255, 0.1);
  color: #00c8ff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.track-id {
  font-size: 12px;
  color: rgba(0, 200, 255, 0.7);
}

.player-main {
  padding: 20px 0;
}

.track-display {
  text-align: center;
  margin-bottom: 30px;
}

.track-name {
  font-size: 22px;
  font-weight: 700;
  color: #00c8ff;
  margin-bottom: 10px;
}

.track-description {
  font-size: 14px;
  color: rgba(224, 224, 224, 0.7);
  max-width: 80%;
  margin: 0 auto;
}

.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.control-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: scale(1.1);
}

.play-btn {
  width: 70px;
  height: 70px;
  background: rgba(0, 255, 136, 0.2);
  border: 2px solid rgba(0, 255, 136, 0.5);
  font-size: 24px;
}

.play-btn:hover {
  background: rgba(0, 255, 136, 0.3);
}

.pulse-effect {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid rgba(0, 255, 136, 0.3);
  border-radius: 50%;
  animation: pulseRing 2s infinite;
}

@keyframes pulseRing {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.skip-btn, .stop-btn {
  background: rgba(0, 200, 255, 0.1);
  color: #00c8ff;
}

.skip-btn:hover, .stop-btn:hover {
  background: rgba(0, 200, 255, 0.2);
}

.progress-section {
  margin-top: 20px;
}

.time-displays {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
  color: rgba(224, 224, 224, 0.7);
  font-family: 'Roboto Mono', monospace;
}

.progress-container {
  height: 6px;
  background: rgba(0, 255, 136, 0.1);
  border-radius: 3px;
  position: relative;
  cursor: pointer;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #00c8ff);
  border-radius: 3px;
  width: 0%;
  position: relative;
  transition: width 0.1s linear;
}

.progress-dot {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #00ff88;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px #00ff88;
}

/* A/B测试面板 */
.ab-panel {
  padding: 20px;
}

.status-toggle {
  padding: 6px 12px;
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-toggle.active {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  border-color: rgba(0, 255, 136, 0.3);
  animation: statusPulse 2s infinite alternate;
}

@keyframes statusPulse {
  0% {
    box-shadow: 0 0 5px rgba(0, 255, 136, 0.3);
  }
  100% {
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
  }
}

.algorithm-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.1);
  border-radius: 8px;
  margin: 20px 0;
}

.algorithm-current {
  text-align: left;
}

.algo-label {
  font-size: 10px;
  color: rgba(0, 255, 136, 0.7);
  letter-spacing: 1px;
  margin-bottom: 5px;
}

.algo-value {
  font-size: 18px;
  font-weight: 700;
  color: #00ff88;
  margin-bottom: 2px;
}

.algo-code {
  font-size: 11px;
  color: rgba(0, 255, 136, 0.5);
  font-family: 'Roboto Mono', monospace;
}

.algorithm-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #00ff88;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 10px;
  color: rgba(0, 255, 136, 0.7);
  letter-spacing: 1px;
}

.algorithm-comparison {
  margin: 20px 0;
}

.comparison-title {
  font-size: 14px;
  color: rgba(0, 255, 136, 0.7);
  letter-spacing: 1px;
  margin-bottom: 15px;
}

.comparison-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.algo-bar {
  display: flex;
  align-items: center;
  gap: 15px;
}

.bar-label {
  width: 120px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(224, 224, 224, 0.9);
  letter-spacing: 1px;
}

.bar-container {
  flex: 1;
  height: 24px;
  background: rgba(0, 255, 136, 0.1);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bar-value {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #00c8ff);
  border-radius: 4px;
  transition: width 1s ease;
}

.algo-bar.winner .bar-value {
  background: linear-gradient(90deg, #ffaa00, #ff4444);
}

.bar-score {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  font-weight: 700;
  color: white;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
}

.test-controls {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.test-controls .control-btn {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  background: rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(0, 200, 255, 0.3);
  color: #00c8ff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.test-controls .control-btn:hover {
  background: rgba(0, 200, 255, 0.2);
}

/* AI推荐面板 */
.ai-panel {
  padding: 20px;
  margin-top: 20px;
}

.ai-badge {
  margin-left: 10px;
  padding: 2px 8px;
  background: linear-gradient(90deg, #00ff88, #00c8ff);
  color: #0a0e17;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
}

.refresh-btn {
  padding: 6px 12px;
  background: rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 4px;
  color: #00c8ff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: rgba(0, 200, 255, 0.2);
  transform: rotate(90deg);
}

.ai-status {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 20px 0;
  padding: 15px;
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.1);
  border-radius: 8px;
}

.status-item {
  text-align: center;
}

.status-label {
  font-size: 10px;
  color: rgba(0, 255, 136, 0.7);
  letter-spacing: 1px;
  margin-bottom: 5px;
}

.status-value {
  font-size: 14px;
  font-weight: 700;
}

.status-value.mood-calm { color: #00ff88; }
.status-value.mood-focused { color: #00c8ff; }
.status-value.mood-happy { color: #ffaa00; }
.status-value.mood-sleepy { color: #8800ff; }
.status-value.mood-stress { color: #ff4444; }

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rec-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rec-item:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.3);
  transform: translateX(5px);
}

.rec-rank {
  width: 24px;
  height: 24px;
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.rec-content {
  flex: 1;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.rec-name {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
}

.rec-match {
  font-size: 12px;
  font-weight: 700;
}

.rec-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: rgba(224, 224, 224, 0.6);
}

.rec-play {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rec-play:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: scale(1.1);
}

.rec-play.playing {
  background: rgba(0, 255, 136, 0.3);
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

/* 底部控制栏 */
.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(10, 14, 23, 0.95);
  border-top: 1px solid rgba(0, 255, 136, 0.2);
  backdrop-filter: blur(10px);
  z-index: 100;
  padding: 10px 30px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1800px;
  margin: 0 auto;
}

.system-monitor {
  display: flex;
  gap: 30px;
}

.monitor-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.monitor-label {
  font-size: 12px;
  color: rgba(0, 255, 136, 0.7);
  letter-spacing: 1px;
  min-width: 60px;
}

.monitor-bar {
  width: 100px;
  height: 8px;
  background: rgba(0, 255, 136, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.monitor-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #00c8ff);
  border-radius: 4px;
  transition: width 1s ease;
}

.monitor-value {
  font-size: 12px;
  font-weight: 600;
  color: #00ff88;
  min-width: 30px;
  text-align: right;
  font-family: 'Roboto Mono', monospace;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 6px;
  color: #00ff88;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: translateY(-2px);
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-dialog {
  width: 100%;
  max-width: 800px;
  background: rgba(16, 22, 36, 0.95);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 50px rgba(0, 255, 136, 0.2),
    inset 0 0 50px rgba(0, 255, 136, 0.1);
  animation: modalAppear 0.3s ease;
}

.modal-dialog.large {
  max-width: 1000px;
}

@keyframes modalAppear {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: 20px 30px;
  border-bottom: 1px solid rgba(0, 255, 136, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #00ff88;
  letter-spacing: 1px;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
  color: #ff4444;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255, 68, 68, 0.2);
  transform: rotate(90deg);
}

.modal-content {
  padding: 30px;
  max-height: 70vh;
  overflow-y: auto;
}

/* 音频库样式 */
.audio-categories {
  margin-bottom: 30px;
}

.category-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0;
}

.category-chip {
  padding: 8px 16px;
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 20px;
  color: rgba(0, 255, 136, 0.7);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.category-chip:hover {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
}

.category-chip.active {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
  border-color: rgba(0, 255, 136, 0.5);
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
}

.audio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.audio-card {
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.audio-card:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.5);
  transform: translateY(-5px);
}

.audio-card.playing {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.8);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.audio-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.audio-icon {
  font-size: 36px;
  margin-bottom: 5px;
}

.audio-waves {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 20px;
}

.audio-waves .wave {
  width: 3px;
  background: #00ff88;
  border-radius: 1.5px;
  animation: waveHeight 1s ease-in-out infinite;
}

.audio-waves .wave:nth-child(1) {
  height: 5px;
  animation-delay: 0s;
}

.audio-waves .wave:nth-child(2) {
  height: 12px;
  animation-delay: 0.2s;
}

.audio-waves .wave:nth-child(3) {
  height: 8px;
  animation-delay: 0.4s;
}

@keyframes waveHeight {
  0%, 100% {
    height: 5px;
  }
  50% {
    height: 15px;
  }
}

.audio-info {
  text-align: center;
}

.audio-name {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 5px;
}

.audio-meta {
  font-size: 11px;
  color: rgba(224, 224, 224, 0.6);
}

.meta-divider {
  margin: 0 5px;
}

.audio-play {
  text-align: center;
}

.play-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-button:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: scale(1.1);
}

/* A/B测试控制面板样式 */
.test-settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.settings-panel, .stats-panel {
  padding: 20px;
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.1);
  border-radius: 8px;
}

.settings-title {
  font-size: 16px;
  color: #00ff88;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 255, 136, 0.2);
}

.setting-group {
  margin-bottom: 25px;
}

.setting-label {
  display: block;
  font-size: 12px;
  color: rgba(0, 255, 136, 0.7);
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 15px;
}

.toggle-switch input[type="checkbox"] {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 60px;
  height: 30px;
  background: rgba(255, 68, 68, 0.2);
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  background: #ff4444;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-switch input[type="checkbox"]:checked + .toggle-slider {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.3);
}

.toggle-switch input[type="checkbox"]:checked + .toggle-slider::before {
  left: calc(100% - 24px);
  background: #00ff88;
}

.toggle-label {
  font-size: 12px;
  font-weight: 600;
  color: #e0e0e0;
  letter-spacing: 1px;
}

.algorithm-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.algo-option {
  padding: 15px;
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.algo-option:hover {
  background: rgba(0, 255, 136, 0.1);
}

.algo-option.selected {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.5);
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
}

.algo-name {
  font-size: 14px;
  font-weight: 600;
  color: #00ff88;
}

.algo-score {
  font-size: 18px;
  font-weight: 700;
  color: #00ff88;
  font-family: 'Roboto Mono', monospace;
}

.range-slider {
  padding: 10px 0;
}

.range-input {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(0, 255, 136, 0.1);
  border-radius: 3px;
  outline: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #00ff88;
  cursor: pointer;
  box-shadow: 0 0 10px #00ff88;
}

.range-value {
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #00ff88;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  padding: 15px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #00ff88;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 11px;
  color: rgba(0, 255, 136, 0.7);
  letter-spacing: 1px;
}

.data-export {
  text-align: center;
}

.export-button {
  padding: 12px 24px;
  background: linear-gradient(90deg, #00ff88, #00c8ff);
  border: none;
  border-radius: 8px;
  color: #0a0e17;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto;
}

.export-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .main-grid {
    grid-template-columns: 1fr 1.5fr 1fr;
  }
}

@media (max-width: 1200px) {
  .main-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .center-panel {
    grid-column: 1 / -1;
    order: -1;
  }
  
  .left-panel, .right-panel {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 15px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .main-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .panel {
    padding: 15px;
  }
  
  .metrics-grid, .user-stats {
    grid-template-columns: 1fr;
  }
  
  .system-monitor {
    display: none;
  }
  
  .footer-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .test-settings-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-dialog {
    max-height: 90vh;
  }
  
  .modal-content {
    max-height: calc(90vh - 60px);
  }
}
</style>