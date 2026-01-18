# Fix Audio and UI Issues

Write-Host "Step 1: Create basic styles..." -ForegroundColor Green
$css = @"
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #0a192f 0%, #172a45 50%, #0f3460 100%);
  color: white;
  min-height: 100vh;
  overflow-x: hidden;
}

.container {
  min-height: 100vh;
  padding: 20px;
}

.header {
  text-align: center;
  margin: 20px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
}

.title {
  font-size: 2rem;
  background: linear-gradient(135deg, #00dbde 0%, #fc00ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
"@

# Save with UTF8 encoding
[System.IO.File]::WriteAllText("$PWD/src/style.css", $css, [System.Text.Encoding]::UTF8)

Write-Host "Step 2: Update main.js..." -ForegroundColor Green
$mainjs = @"
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
"@
[System.IO.File]::WriteAllText("$PWD/src/main.js", $mainjs, [System.Text.Encoding]::UTF8)

Write-Host "Step 3: Fix audio processor..." -ForegroundColor Green
# Ensure directory exists
if (!(Test-Path "$PWD/src/audio")) {
    New-Item -ItemType Directory -Path "$PWD/src/audio" -Force
}

$audiojs = @"
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
      const audio = new Audio(\`/audio/\${filename}\`);
      audio.volume = this.volume;
      
      // Add event listeners for debugging
      audio.addEventListener('canplaythrough', () => {
        console.log(\`Audio \${filename} ready to play\`);
      });
      
      audio.addEventListener('error', (e) => {
        console.error(\`Audio \${filename} error:\`, e.target.error);
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
"@
[System.IO.File]::WriteAllText("$PWD/src/audio/audio-processor.js", $audiojs, [System.Text.Encoding]::UTF8)

Write-Host "Step 4: Create debug page..." -ForegroundColor Green
$debug = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Audio Debug</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #0a192f; color: white; }
        button { padding: 10px 20px; margin: 5px; background: #00dbde; border: none; border-radius: 5px; color: white; cursor: pointer; }
    </style>
</head>
<body>
    <h1>Audio Debug Page</h1>
    <button onclick="testAudio('fixed_rain.mp3')">Test Rain</button>
    <button onclick="testAudio('fixed_seawind.mp3')">Test Ocean</button>
    <button onclick="testAudio('fixed_attention.mp3')">Test Focus</button>
    <div id="result" style="margin-top: 20px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;"></div>
    
    <script>
        function testAudio(filename) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = \`Testing \${filename}...<br>\`;
            
            const audio = new Audio(\`/audio/\${filename}\`);
            audio.volume = 0.5;
            
            audio.oncanplaythrough = () => {
                resultDiv.innerHTML += '鉁?Audio ready<br>';
            };
            
            audio.onerror = (e) => {
                resultDiv.innerHTML += \`鉂?Error code: \${e.target.error?.code || 'unknown'}<br>\`;
            };
            
            audio.play()
                .then(() => {
                    resultDiv.innerHTML += '鈻讹笍 Playing...<br>';
                    setTimeout(() => {
                        audio.pause();
                        resultDiv.innerHTML += '鈴革笍 Stopped<br>';
                    }, 3000);
                })
                .catch(error => {
                    resultDiv.innerHTML += \`鉂?Play failed: \${error.name} - \${error.message}<br>\`;
                });
        }
    </script>
</body>
</html>
"@
[System.IO.File]::WriteAllText("$PWD/public/debug.html", $debug, [System.Text.Encoding]::UTF8)

Write-Host "Done!" -ForegroundColor Green
Write-Host "1. Test audio at: http://localhost:3000/debug.html" -ForegroundColor Yellow
Write-Host "2. Main app at: http://localhost:3000" -ForegroundColor Yellow
