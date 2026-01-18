@echo off
echo === AI冥想系统迁移到Vite ===
echo.

echo 1. 备份现有文件...
if exist backup rmdir /s /q backup
mkdir backup
if exist src xcopy src backup\src /E /I /H
if exist public xcopy public backup\public /E /I /H

echo.
echo 2. 清理旧文件...
if exist node_modules rmdir /s /q node_modules
del package-lock.json 2>nul
del vue.config.js 2>nul
del babel.config.js 2>nul

echo.
echo 3. 初始化新项目...
call npm init -y

echo.
echo 4. 安装Vite和Vue...
call npm install vue
call npm install vite @vitejs/plugin-vue @vue/compiler-sfc --save-dev

echo.
echo 5. 创建新配置文件...

rem 创建package.json
echo {
echo   "name": "ai-meditation-system",
echo   "version": "1.0.0",
echo   "private": true,
echo   "scripts": {
echo     "dev": "vite",
echo     "build": "vite build",
echo     "preview": "vite preview"
echo   },
echo   "dependencies": {
echo     "vue": "^3.4.0"
echo   },
echo   "devDependencies": {
echo     "@vitejs/plugin-vue": "^5.0.0",
echo     "vite": "^5.0.0",
echo     "@vue/compiler-sfc": "^3.4.0"
echo   }
echo } > package.json

rem 创建vite.config.js
echo import { defineConfig } from 'vite' > vite.config.js
echo import vue from '@vitejs/plugin-vue' >> vite.config.js
echo. >> vite.config.js
echo export default defineConfig({ >> vite.config.js
echo   plugins: [vue()], >> vite.config.js
echo   server: { >> vite.config.js
echo     port: 3000, >> vite.config.js
echo     host: true >> vite.config.js
echo   } >> vite.config.js
echo }) >> vite.config.js

rem 创建index.html
echo ^<!DOCTYPE html^> > index.html
echo ^<html lang="zh-CN"^> >> index.html
echo   ^<head^> >> index.html
echo     ^<meta charset="UTF-8" /^> >> index.html
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^> >> index.html
echo     ^<title^>AI智能冥想疗愈系统^</title^> >> index.html
echo     ^<style^> >> index.html
echo       body { >> index.html
echo         margin: 0; >> index.html
echo         padding: 0; >> index.html
echo         background: #0a192f; >> index.html
echo         color: white; >> index.html
echo         font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; >> index.html
echo       } >> index.html
echo     ^</style^> >> index.html
echo   ^</head^> >> index.html
echo   ^<body^> >> index.html
echo     ^<div id="app"^>^</div^> >> index.html
echo     ^<script type="module" src="/src/main.js"^>^</script^> >> index.html
echo   ^</body^> >> index.html
echo ^</html^> >> index.html

echo.
echo 6. 恢复您的代码...

rem 确保目录存在
if not exist src\components mkdir src\components
if not exist src\audio mkdir src\audio
if not exist public\audio mkdir public\audio

rem 恢复BreathingField.vue
if exist backup\components\BreathingField.vue (
  copy backup\components\BreathingField.vue src\components\BreathingField.vue
  echo 已恢复BreathingField.vue
)

rem 恢复音频文件
if exist backup\public\audio\* (
  copy backup\public\audio\* public\audio\
  echo 已恢复音频文件
)

echo.
echo 7. 创建必要文件...

rem 创建main.js
echo import { createApp } from 'vue' > src\main.js
echo import App from './App.vue' >> src\main.js
echo. >> src\main.js
echo const app = createApp(App) >> src\main.js
echo app.mount('#app') >> src\main.js

rem 创建App.vue
echo ^<template^> > src\App.vue
echo   ^<div id="app"^> >> src\App.vue
echo     ^<BreathingField /^> >> src\App.vue
echo   ^</div^> >> src\App.vue
echo ^</template^> >> src\App.vue
echo. >> src\App.vue
echo ^<script^> >> src\App.vue
echo import BreathingField from './components/BreathingField.vue' >> src\App.vue
echo. >> src\App.vue
echo export default { >> src\App.vue
echo   name: 'App', >> src\App.vue
echo   components: { >> src\App.vue
echo     BreathingField >> src\App.vue
echo   } >> src\App.vue
echo } >> src\App.vue
echo ^</script^> >> src\App.vue
echo. >> src\App.vue
echo ^<style^> >> src\App.vue
echo * { >> src\App.vue
echo   margin: 0; >> src\App.vue
echo   padding: 0; >> src\App.vue
echo   box-sizing: border-box; >> src\App.vue
echo } >> src\App.vue
echo. >> src\App.vue
echo body { >> src\App.vue
echo   font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; >> src\App.vue
echo   background: #0a192f; >> src\App.vue
echo   color: white; >> src\App.vue
echo   overflow-x: hidden; >> src\App.vue
echo } >> src\App.vue
echo. >> src\App.vue
echo #app { >> src\App.vue
echo   min-height: 100vh; >> src\App.vue
echo } >> src\App.vue
echo ^</style^> >> src\App.vue

echo.
echo 8. 如果存在AI音频系统文件，恢复它们
if exist backup\src\audio\*.js (
  copy backup\src\audio\*.js src\audio\
  echo 已恢复AI音频系统文件
)

echo.
echo === 迁移完成！ ===
echo.
echo 运行以下命令：
echo npm run dev    - 启动开发服务器
echo npm run build  - 构建生产版本
echo.
echo 开发服务器地址：http://localhost:3000
pause