@echo off
echo 启动AI冥想系统...
echo.

cd /d "D:\smartmeditation"

echo 1. 清理node_modules...
if exist node_modules rmdir /s /q node_modules
del package-lock.json 2>nul

echo.
echo 2. 创建package.json...
echo { > package.json
echo   "name": "ai-meditation", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "scripts": { >> package.json
echo     "dev": "vite", >> package.json
echo     "build": "vite build" >> package.json
echo   }, >> package.json
echo   "dependencies": { >> package.json
echo     "vue": "^3.4.0" >> package.json
echo   }, >> package.json
echo   "devDependencies": { >> package.json
echo     "@vitejs/plugin-vue": "^5.0.0", >> package.json
echo     "vite": "^5.0.0" >> package.json
echo   } >> package.json
echo } >> package.json

echo.
echo 3. 创建vite.config.js...
echo import { defineConfig } from "vite" > vite.config.js
echo import vue from "@vitejs/plugin-vue" >> vite.config.js
echo. >> vite.config.js
echo export default defineConfig({ >> vite.config.js
echo   plugins: [vue()], >> vite.config.js
echo   server: { >> vite.config.js
echo     port: 3000 >> vite.config.js
echo   } >> vite.config.js
echo }) >> vite.config.js

echo.
echo 4. 创建index.html...
echo ^<!DOCTYPE html^> > index.html
echo ^<html^> >> index.html
echo ^<body^> >> index.html
echo   ^<div id="app"^>^</div^> >> index.html
echo   ^<script type="module" src="/src/main.js"^>^</script^> >> index.html
echo ^</body^> >> index.html
echo ^</html^> >> index.html

echo.
echo 5. 创建main.js...
mkdir src 2>nul
echo import { createApp } from "vue" > src\main.js
echo. >> src\main.js
echo const App = { >> src\main.js
echo   template: \` >> src\main.js
echo     \`^<div style="padding:40px;"^> >> src\main.js
echo       \`^<h1^>🧠 AI冥想系统^</h1^> >> src\main.js
echo       \`^<p^>✅ Vue工作正常^</p^> >> src\main.js
echo       \`^<button onclick="test()"^>测试音频^</button^> >> src\main.js
echo     \`^</div^> >> src\main.js
echo   \` >> src\main.js
echo } >> src\main.js
echo. >> src\main.js
echo createApp(App).mount("#app") >> src\main.js
echo console.log("Vue应用启动成功") >> src\main.js
echo. >> src\main.js
echo function test() { >> src\main.js
echo   const audio = new Audio("/audio/fixed_rain.mp3") >> src\main.js
echo   audio.volume = 0.3 >> src\main.js
echo   audio.play().catch(e => console.log("错误:", e)) >> src\main.js
echo } >> src\main.js

echo.
echo 6. 安装依赖...
call npm install

echo.
echo 7. 启动服务器...
echo 访问: http://localhost:3000
echo.
call npm run dev

pause