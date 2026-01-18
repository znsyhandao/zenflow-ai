# 创建修复脚本
$repairScript = @'
Write-Host "=== AI冥想系统修复脚本 ===" -ForegroundColor Cyan

# 1. 停止所有相关进程
Write-Host "停止相关进程..." -ForegroundColor Yellow
taskkill /f /im node.exe 2>$null
Start-Sleep -Seconds 2

# 2. 清理
Write-Host "清理文件..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force
    Write-Host "✅ 删除 node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force
    Write-Host "✅ 删除 package-lock.json" -ForegroundColor Green
}

# 3. 创建package.json
Write-Host "创建 package.json..." -ForegroundColor Yellow
$packageJson = @'
{
  "name": "ai-meditation-system",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0"
  }
}
'@
[System.IO.File]::WriteAllText("$PWD/package.json", $packageJson, [System.Text.Encoding]::UTF8)
Write-Host "✅ 创建 package.json" -ForegroundColor Green

# 4. 创建vite.config.js
Write-Host "创建 vite.config.js..." -ForegroundColor Yellow
$viteConfig = @'
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    host: true
  }
})
'@
[System.IO.File]::WriteAllText("$PWD/vite.config.js", $viteConfig, [System.Text.Encoding]::UTF8)
Write-Host "✅ 创建 vite.config.js" -ForegroundColor Green

# 5. 创建index.html
Write-Host "创建 index.html..." -ForegroundColor Yellow
$indexHtml = @'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI冥想系统</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #0a192f;
            color: white;
            font-family: Arial, sans-serif;
        }
        #app {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .loading {
            font-size: 1.2rem;
            color: #00dbde;
        }
    </style>
</head>
<body>
    <div id="app">
        <div class="loading">加载AI冥想系统...</div>
    </div>
    <script type="module" src="/src/main.js"></script>
</body>
</html>
'@
[System.IO.File]::WriteAllText("$PWD/index.html", $indexHtml, [System.Text.Encoding]::UTF8)
Write-Host "✅ 创建 index.html" -ForegroundColor Green

# 6. 创建main.js
Write-Host "创建 main.js..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "src" -Force -ErrorAction SilentlyContinue

$mainJs = @'
console.log("=== 开始加载Vue应用 ===")

// 导入Vue
import { createApp } from "vue"

// 创建最简单的应用
const App = {
  template: `
    <div style="
      padding: 40px;
      background: linear-gradient(135deg, #0a192f 0%, #172a45 50%, #0f3460 100%);
      color: white;
      min-height: 100vh;
      font-family: Arial, sans-serif;
    ">
      <h1 style="color: #00dbde; text-align: center;">🧠 AI冥想系统</h1>
      <p style="text-align: center; color: #a0aec0;">Vue 3应用已成功加载</p>
      
      <div style="max-width: 600px; margin: 30px auto; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
        <h3>功能测试</h3>
        <button @click="testAudio" style="
          padding: 12px 24px;
          background: #00dbde;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          margin: 10px;
        ">
          测试音频播放
        </button>
        
        <div v-if="message" style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px;">
          {{ message }}
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      message: ""
    }
  },
  methods: {
    testAudio() {
      this.message = "正在播放音频..."
      const audio = new Audio("/audio/fixed_rain.mp3")
      audio.volume = 0.3
      audio.play()
        .then(() => {
          this.message = "✅ 音频播放成功！"
          setTimeout(() => {
            audio.pause()
            this.message = "⏸️ 播放完成"
          }, 2000)
        })
        .catch(error => {
          this.message = "❌ 播放失败: " + error.message
        })
    }
  }
}

// 挂载应用
try {
  const app = createApp(App)
  app.mount("#app")
  console.log("✅ Vue应用挂载成功")
} catch (error) {
  console.error("❌ Vue应用挂载失败:", error)
  document.getElementById("app").innerHTML = `
    <div style="padding: 40px; text-align: center;">
      <h2 style="color: #ff6b6b;">加载失败</h2>
      <p>${error.message}</p>
    </div>
  `
}
'@
[System.IO.File]::WriteAllText("$PWD/src/main.js", $mainJs, [System.Text.Encoding]::UTF8)
Write-Host "✅ 创建 main.js" -ForegroundColor Green

# 7. 安装依赖
Write-Host "安装依赖..." -ForegroundColor Yellow
npm install

Write-Host "`n=== 修复完成 ===" -ForegroundColor Green
Write-Host "运行以下命令启动：" -ForegroundColor Cyan
Write-Host "npm run dev" -ForegroundColor Yellow
Write-Host "然后访问: http://localhost:3000" -ForegroundColor Cyan
'@

# 保存修复脚本
[System.IO.File]::WriteAllText("$PWD/repair.ps1", $repairScript, [System.Text.Encoding]::UTF8)

Write-Host "修复脚本已创建: repair.ps1" -ForegroundColor Green
Write-Host "运行: .\repair.ps1" -ForegroundColor Yellow