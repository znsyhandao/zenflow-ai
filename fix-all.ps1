# 创建fix-all.ps1
@'
# 停止所有Vite进程
Write-Host "停止Vite进程..." -ForegroundColor Yellow
Get-Process -Name "vite" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*vite*" } | Stop-Process -Force

# 清理
Write-Host "清理文件..." -ForegroundColor Yellow
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -ErrorAction SilentlyContinue

# 创建正确的package.json
Write-Host "创建package.json..." -ForegroundColor Yellow
$json = @{
    name = "ai-meditation"
    version = "1.0.0"
    scripts = @{
        dev = "vite"
        build = "vite build"
        preview = "vite preview"
    }
    dependencies = @{
        vue = "^3.4.0"
    }
    devDependencies = @{
        "@vitejs/plugin-vue" = "^5.0.0"
        vite = "^5.0.0"
    }
}

$jsonString = ConvertTo-Json $json -Depth 3
# 使用UTF8无BOM保存
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$PWD/package.json", $jsonString, $utf8)

# 创建vite.config.js
Write-Host "创建vite.config.js..." -ForegroundColor Yellow
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
[System.IO.File]::WriteAllText("$PWD/vite.config.js", $viteConfig, $utf8)

# 创建index.html
Write-Host "创建index.html..." -ForegroundColor Yellow
$indexHtml = @'
<!DOCTYPE html>
<html lang="zh-CN">
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
            font-family: sans-serif;
        }
    </style>
</head>
<body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
</body>
</html>
'@
[System.IO.File]::WriteAllText("$PWD/index.html", $indexHtml, $utf8)

# 创建main.js
Write-Host "创建main.js..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "src" -Force -ErrorAction SilentlyContinue

$mainJs = @'
import { createApp } from "vue"

const App = {
  template: `
    <div style="
      padding: 40px;
      background: linear-gradient(135deg, #0a192f 0%, #172a45 50%, #0f3460 100%);
      color: white;
      min-height: 100vh;
      font-family: sans-serif;
    ">
      <h1 style="color: #00dbde; text-align: center;">🧠 AI冥想系统</h1>
      <p style="text-align: center; color: #a0aec0;">Vue加载成功！</p>
      <button @click="test" style="
        padding: 15px 30px;
        background: #00dbde;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        display: block;
        margin: 20px auto;
      ">
        测试音频
      </button>
      <div v-if="message" style="
        max-width: 500px;
        margin: 20px auto;
        padding: 15px;
        background: rgba(0,0,0,0.3);
        border-radius: 8px;
        text-align: center;
      ">
        {{ message }}
      </div>
    </div>
  `,
  data() {
    return {
      message: ""
    }
  },
  methods: {
    test() {
      this.message = "测试中..."
      const audio = new Audio("/audio/fixed_rain.mp3")
      audio.volume = 0.3
      audio.play()
        .then(() => this.message = "✅ 音频播放成功")
        .catch(e => this.message = "❌ 错误: " + e.message)
    }
  }
}

console.log("启动Vue应用...")
createApp(App).mount("#app")
console.log("✅ Vue应用已启动")
'@
[System.IO.File]::WriteAllText("$PWD/src/main.js", $mainJs, $utf8)

# 安装依赖
Write-Host "安装依赖..." -ForegroundColor Yellow
npm install

Write-Host "`n=== 修复完成 ===" -ForegroundColor Green
Write-Host "运行: npm run dev" -ForegroundColor Yellow
Write-Host "访问: http://localhost:3000" -ForegroundColor Cyan
'@ | Out-File -FilePath "fix-all.ps1" -Encoding UTF8

Write-Host "运行修复脚本: .\fix-all.ps1" -ForegroundColor Green