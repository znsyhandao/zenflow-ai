using namespace System.IO
using namespace System.Text

$files = @('alpha_wavemp3.mp3', 'alphabell.mp3', 'breath_in.wav')

foreach ($file in $files) {
    if (Test-Path $file) {
        $stream = [File]::OpenRead($file)
        $bytes = New-Object byte[] 20
        $stream.Read($bytes, 0, 20) > $null
        $stream.Close()
        
        $hex = ($bytes | ForEach-Object { $_.ToString('X2') }) -join ' '
        $ascii = [Encoding]::ASCII.GetString($bytes).Replace("`0", ".")
        
        Write-Host "`n文件: $file"
        Write-Host "大小: $([math]::Round((Get-Item $file).Length/1KB, 2)) KB"
        Write-Host "前20字节 (HEX): $hex"
        Write-Host "前20字节 (ASCII): $ascii"
        
        # 常见音频文件头
        if ($hex -match '^49 44 33') { Write-Host "类型: MP3 (ID3 tag)" -ForegroundColor Green }
        elseif ($hex -match '^FF F[3-9B-F]') { Write-Host "类型: MP3 (MPEG frame)" -ForegroundColor Green }
        elseif ($hex -match '^52 49 46 46') { Write-Host "类型: WAV (RIFF)" -ForegroundColor Green }
        elseif ($hex -match '^4F 67 67 53') { Write-Host "类型: OGG" -ForegroundColor Yellow }
        else { Write-Host "类型: 未知" -ForegroundColor Red }
    } else {
        Write-Host "`n文件不存在: $file" -ForegroundColor Red
    }
}
