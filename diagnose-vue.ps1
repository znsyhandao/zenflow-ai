Write-Host "=== Vue鍔犺浇闂璇婃柇 ===" -ForegroundColor Cyan

# 1. 妫€鏌ュ叧閿枃浠?
Write-Host "`n1. 妫€鏌ュ叧閿枃浠?" -ForegroundColor Yellow
$files = @(
    "index.html",
    "vite.config.js",
    "src/main.js",
    "package.json",
    "node_modules/vue/package.json"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  鉁?$file" -ForegroundColor Green
    } else {
        Write-Host "  鉂?$file 缂哄け" -ForegroundColor Red
    }
}

# 2. 妫€鏌ackage.json渚濊禆
Write-Host "`n2. 妫€鏌ヤ緷璧?" -ForegroundColor Yellow
if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
    $hasVue = $pkg.dependencies.vue -or $pkg.devDependencies.vue
    $hasVite = $pkg.devDependencies.vite
    
    if ($hasVue) {
        Write-Host "  鉁?Vue渚濊禆宸插畨瑁? -ForegroundColor Green
    } else {
        Write-Host "  鉂?Vue渚濊禆缂哄け" -ForegroundColor Red
    }
    
    if ($hasVite) {
        Write-Host "  鉁?Vite渚濊禆宸插畨瑁? -ForegroundColor Green
    } else {
        Write-Host "  鉂?Vite渚濊禆缂哄け" -ForegroundColor Red
    }
}

# 3. 妫€鏌ite鐗堟湰
Write-Host "`n3. 妫€鏌ite鐗堟湰:" -ForegroundColor Yellow
try {
    $viteVersion = npm list vite --depth=0 2>$null
    if ($viteVersion -like "*vite*") {
        Write-Host "  鉁?Vite宸插畨瑁? -ForegroundColor Green
    } else {
        Write-Host "  鉂?Vite鏈畨瑁? -ForegroundColor Red
    }
} catch {
    Write-Host "  鉂?妫€鏌ite澶辫触" -ForegroundColor Red
}

# 4. 寤鸿鎿嶄綔
Write-Host "`n4. 淇姝ラ:" -ForegroundColor Cyan
Write-Host "  a) 娓呯悊骞堕噸鏂板畨瑁?" -ForegroundColor Yellow
Write-Host "     rm -rf node_modules package-lock.json" -ForegroundColor Gray
Write-Host "     npm install" -ForegroundColor Gray

Write-Host "  b) 浣跨敤CDN娴嬭瘯Vue:" -ForegroundColor Yellow
Write-Host "     鍒涘缓 test-cdn.html 浣跨敤CDN鐗堟湰鐨刅ue" -ForegroundColor Gray

Write-Host "  c) 妫€鏌ユ帶鍒跺彴閿欒:" -ForegroundColor Yellow
Write-Host "     鎸塅12鏌ョ湅鍏蜂綋閿欒淇℃伅" -ForegroundColor Gray

Write-Host "`n5. 鍒涘缓CDN娴嬭瘯椤?" -ForegroundColor Cyan
$cdnTest = @"
<!DOCTYPE html>
<html>
<head>
    <title>CDN Vue娴嬭瘯</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <style>
        body { padding: 40px; font-family: sans-serif; }
        #app { max-width: 600px; margin: 0 auto; }
    </style>
</head>
<body>
    <div id="app">{{ message }}</div>
    
    <script>
        const { createApp } = Vue
        
        const App = {
            data() {
                return {
                    message: "鉁?CDN Vue鍔犺浇鎴愬姛锛?
                }
            }
        }
        
        createApp(App).mount("#app")
        console.log("CDN Vue鐗堟湰:", Vue.version)
    </script>
</body>
</html>
"@

Set-Content -Path "test-cdn.html" -Value $cdnTest -Encoding UTF8
Write-Host "  鉁?宸插垱寤?test-cdn.html" -ForegroundColor Green
Write-Host "     璁块棶: http://localhost:3000/test-cdn.html" -ForegroundColor Yellow

# 5. 褰撳墠杩愯鐘舵€?
Write-Host "`n6. 褰撳墠鏈嶅姟鍣ㄧ姸鎬?" -ForegroundColor Cyan
$port = 3000
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  鉁?鏈嶅姟鍣ㄦ鍦ㄨ繍琛?(绔彛 $port)" -ForegroundColor Green
} catch {
    Write-Host "  鉂?鏈嶅姟鍣ㄦ湭杩愯鎴栫鍙?$port 琚崰鐢? -ForegroundColor Red
    Write-Host "     杩愯: npm run dev" -ForegroundColor Yellow
}
