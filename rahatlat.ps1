# Sakar Paisen — sistem rahatlatma betiği
#
# NEDEN VAR: Test turları (153 test, ~12 dk, her test yeni Chromium) ve
# 7 VS Code + 3 tarayıcı penceresi aynı anda açıkken makine takılıyordu.
# Bu betik, güvenle silinebilecek şeyleri temizler ve durumu raporlar.
#
# Kullanım:  powershell -ExecutionPolicy Bypass -File rahatlat.ps1

$hata = $ErrorActionPreference
$ErrorActionPreference = 'SilentlyContinue'
$proje = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Output "=== 1) Test kalintilari temizleniyor ==="
foreach ($yol in @("$proje\test-results", "$proje\playwright-report", "$proje\.last-run.json")) {
    if (Test-Path $yol) { Remove-Item $yol -Recurse -Force; Write-Output "  silindi: $yol" }
}

Write-Output ""
Write-Output "=== 2) Askida kalan test surecleri kapatiliyor ==="
$kapandi = 0
Get-Process node, chrome, chromium, playwright -ErrorAction SilentlyContinue | ForEach-Object {
    # Sadece 8000 portunu tutan sunucu veya basibos test tarayicilari
    if ($_.ProcessName -eq 'node' -or $_.ProcessName -match 'chrom') {
        Write-Output ("  kapatiliyor: " + $_.ProcessName + " (PID " + $_.Id + ")")
        Stop-Process -Id $_.Id -Force
        $kapandi++
    }
}
if ($kapandi -eq 0) { Write-Output "  kapatilacak surec yok" }

Write-Output ""
Write-Output "=== 3) RAM durumu ==="
$os = Get-CimInstance Win32_OperatingSystem
$tot = [math]::Round($os.TotalVisibleMemorySize / 1MB, 1)
$free = [math]::Round($os.FreePhysicalMemory / 1MB, 1)
Write-Output ("  toplam " + $tot + " GB | bos " + $free + " GB | kullanim %" + [math]::Round(($tot - $free) / $tot * 100))

Write-Output ""
Write-Output "=== 4) Disk durumu (takilmanin ana sebebi) ==="
Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Used -ne $null } | ForEach-Object {
    $oran = [math]::Round($_.Used / ($_.Used + $_.Free) * 100)
    $uyari = if ($oran -ge 85) { "  <-- DOLU! Yer acilmali" } else { "" }
    Write-Output ("  " + $_.Name + ": bos " + [math]::Round($_.Free / 1GB, 1) + " GB / %" + $oran + " dolu" + $uyari)
}

Write-Output ""
Write-Output "=== 5) Acik pencere sayisi (RAM yiyen) ==="
foreach ($ad in @('Code', 'brave', 'chrome', 'msedge')) {
    $p = Get-Process $ad -ErrorAction SilentlyContinue
    if ($p) {
        $mb = [math]::Round(($p | Measure-Object -Property WorkingSet64 -Sum).Sum / 1MB)
        Write-Output ("  " + $ad + ": " + $p.Count + " pencere, " + $mb + " MB")
    }
}
Write-Output ""
Write-Output "Bitti. Cok takiliyorsa: gereksiz VS Code/tarayici pencerelerini kapat ve"
Write-Output "C: diskinde yer ac (Disk Temizleme / Temp klasoru)."

$ErrorActionPreference = $hata
