@echo off
REM ============================================================
REM Sakar Paisen — sistem rahatlatma (Windows)
REM
REM NEDEN VAR: Test turlari (153 test, ~12 dk, her test yeni Chromium) ve
REM 7 VS Code + 3 tarayici penceresi ayni anda acikken makine takiliyordu.
REM Bu betik guvenle silinebilecek seyleri temizler ve durumu raporlar.
REM
REM Kullanim:  rahatlat.cmd   (cift tiklamak da yeter)
REM ============================================================
setlocal
set PROJE=%~dp0
REM PATH kisitli olabildigi icin powershell'i TAM YOLDAN cagiriyoruz
set PS=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe

echo === 1) Test kalintilari temizleniyor ===
if exist "%PROJE%test-results" rmdir /s /q "%PROJE%test-results" 2>nul
if exist "%PROJE%playwright-report" rmdir /s /q "%PROJE%playwright-report" 2>nul
if exist "%PROJE%.last-run.json" del /q "%PROJE%.last-run.json" 2>nul
echo   bitti

echo.
echo === 2) Gecici dosyalar temizleniyor (C: diskinde yer acar) ===
for /d %%D in ("%LOCALAPPDATA%\Temp\*") do rmdir /s /q "%%D" 2>nul >nul
del /q "%LOCALAPPDATA%\Temp\*" 2>nul >nul
echo   Temp temizlendi
if exist "%LOCALAPPDATA%\pip\cache" rmdir /s /q "%LOCALAPPDATA%\pip\cache" 2>nul
echo   pip cache temizlendi
if exist "%LOCALAPPDATA%\CrashDumps" rmdir /s /q "%LOCALAPPDATA%\CrashDumps" 2>nul
echo   CrashDumps temizlendi

echo.
echo === 3) Disk + RAM durumu (takilmanin ana sebebi) ===
"%PS%" -NoProfile -Command "Get-PSDrive C | ForEach-Object { Write-Host ('  C: bos ' + [math]::Round($_.Free/1GB,1) + ' GB / yuzde ' + [math]::Round($_.Used/($_.Used+$_.Free)*100) + ' dolu') }; $o=Get-CimInstance Win32_OperatingSystem; $t=[math]::Round($o.TotalVisibleMemorySize/1MB,1); $f=[math]::Round($o.FreePhysicalMemory/1MB,1); Write-Host ('  RAM: bos ' + $f + ' GB / toplam ' + $t + ' GB / yuzde ' + [math]::Round(($t-$f)/$t*100))"

echo.
echo === 4) RAM yiyen pencereler ===
"%PS%" -NoProfile -Command "$toplam=0; foreach($a in @('Code','brave','chrome','msedge')){ $p=Get-Process $a -ErrorAction SilentlyContinue; if($p){ $mb=[math]::Round(($p|Measure-Object WorkingSet64 -Sum).Sum/1MB); $toplam+=$mb; Write-Host ('  ' + $a + ': ' + $p.Count + ' surec, ' + $mb + ' MB') } }; Write-Host ('  TOPLAM: ' + $toplam + ' MB')"

echo.
echo Bitti.
endlocal
