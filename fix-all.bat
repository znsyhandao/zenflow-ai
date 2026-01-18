@echo off
echo 修复音频和界面问题...
echo.

cd /d "D:\smartmeditation"

echo 1. 创建基础样式...
echo * { > src\style.css
echo   margin: 0; >> src\style.css
echo   padding: 0; >> src\style.css
echo   box-sizing: border-box; >> src\style.css
echo } >> src\style.css
echo body { >> src\style.css
echo   font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; >> src\style.css
echo   background: linear-gradient(135deg, #0a192f 0%%, #172a45 50%%, #0f3460 100%%); >> src\style.css
echo   color: white; >> src\style.css
echo   min-height: 100vh; >> src\style.css
echo } >> src\style.css

echo 2. 更新 main.js...
echo import { createApp } from 'vue' > src\main.js
echo import App from './App.vue' >> src\main.js
echo import './style.css' >> src\main.js
echo createApp(App).mount('#app') >> src\main.js

echo 3. 简化 audio-processor.js...
echo export class AudioProcessor { > src\audio\audio-processor.js
echo   constructor() { >> src\audio\audio-processor.js
echo     this.audioElements = new Map(); >> src\audio\audio-processor.js
echo     this.currentAudio = null; >> src\audio\audio-processor.js
echo   } >> src\audio\audio-processor.js
echo   async playAudio(audioId) { >> src\audio\audio-processor.js
echo     console.log('播放:', audioId); >> src\audio\audio-processor.js
echo     try { >> src\audio\audio-processor.js
echo       const audio = new Audio(\`/audio/\${audioId}.mp3\`); >> src\audio\audio-processor.js
echo       await audio.play(); >> src\audio\audio-processor.js
echo       this.currentAudio = audio; >> src\audio\audio-processor.js
echo       return true; >> src\audio\audio-processor.js
echo     } catch (error) { >> src\audio\audio-processor.js
echo       console.error('播放失败:', error); >> src\audio\audio-processor.js
echo       return false; >> src\audio\audio-processor.js
echo     } >> src\audio\audio-processor.js
echo   } >> src\audio\audio-processor.js
echo } >> src\audio\audio-processor.js

echo 4. 创建调试页面...
echo ^<!DOCTYPE html^> > public\debug.html
echo ^<html^> >> public\debug.html
echo ^<body^> >> public\debug.html
echo   ^<h1^>调试页面^</h1^> >> public\debug.html
echo   ^<button onclick="testAudio()"^>测试音频^</button^> >> public\debug.html
echo   ^<script^> >> public\debug.html
echo     function testAudio() { >> public\debug.html
echo       const audio = new Audio('/audio/fixed_rain.mp3'); >> public\debug.html
echo       audio.play().then(() => alert('音频正常')).catch(e => alert('错误: ' + e.message)); >> public\debug.html
echo     } >> public\debug.html
echo   ^</script^> >> public\debug.html
echo ^</body^> >> public\debug.html
echo ^</html^> >> public\debug.html

echo.
echo 修复完成！
echo 访问 http://localhost:3000/debug.html 测试音频
echo 然后访问 http://localhost:3000 查看主界面
pause