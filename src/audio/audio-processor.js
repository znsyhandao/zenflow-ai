export class AudioProcessor {
  constructor() {
    this.currentAudio = null;
    this.volume = 0.7;
  }

  async playAudio(audioId) {
    console.log('Play:', audioId);
    try {
      // Stop current audio
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }

      // Audio file mapping
      const audioFiles = {
        'rain': 'fixed_rain.mp3',
        'seawind': 'fixed_seawind.mp3',
        'attention': 'fixed_attention.mp3',
        'sleep_music': 'fixed_sleep_music_master_talk.mp3',
        'relaxation': 'fixed_relax_state_meditation.mp3'
      };

      const filename = audioFiles[audioId] || audioFiles.rain;
      
      // Play new audio
      const audio = new Audio(`/audio/${filename}`);
      audio.volume = this.volume;
      
      // Add event listeners for debugging
      audio.addEventListener('canplaythrough', () => {
        console.log(`Audio ${filename} ready to play`);
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`Audio ${filename} error:`, e.target.error);
      });
      
      await audio.play();
      this.currentAudio = audio;
      return true;
    } catch (error) {
      console.error('Play failed:', error);
      return false;
    }
  }

  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value / 100));
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
  }
}
