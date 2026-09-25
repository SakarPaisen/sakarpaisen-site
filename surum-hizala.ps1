# SÜRÜM NUMARALARINI HİZALA
# Aynı dosyanın farklı sürümleri (?v=11 vs ?v=14) tarayıcıda AYRI kaynak sayılır
# ve iki kez indirilir. Bu, sayfa yüklemesini 20 saniyeye çıkarmıştı.
# Bu betik tüm HTML dosyalarındaki sürüm numaralarını tek değere sabitler.
#
# Kullanım:  powershell -ExecutionPolicy Bypass -File surum-hizala.ps1
#
# KURAL: Bir .js dosyasını değiştirdiğinde SADECE buradaki numarayı artır,
# sonra bu betiği çalıştır. Böylece dört sayfa da aynı sürümü ister.

$dosyalar = @{
  'ilerleme.js'   = 5
  'ses.js'        = 3
  'kana.js'       = 15
  'reading.js'    = 14
  'kelime.js'     = 4
  'app.js'        = 17
  'giris.js'      = 3
  'tur.js'        = 2
  'hata-rapor.js' = 3
  'dojo-yol.js'   = 3
  'pwa.js'        = 3
  'mufredat.js'   = 3
  'questions.js'  = 9
}

$kok = Split-Path -Parent $MyInvocation.MyCommand.Path
$sayfalar = @('index.html', 'dojo.html', 'oyun.html', 'kelime.html')

foreach ($sayfa in $sayfalar) {
  $yol = Join-Path $kok $sayfa
  if (-not (Test-Path $yol)) { continue }
  $icerik = [System.IO.File]::ReadAllText($yol, [System.Text.Encoding]::UTF8)

  foreach ($js in $dosyalar.Keys) {
    $v = $dosyalar[$js]
    $kacis = [regex]::Escape($js)
    # Hem sürümsüz hem sürümlü biçimi tek sürüme çevir
    $icerik = $icerik -replace ('src="' + $kacis + '(\?v=\d+)?"'), ('src="' + $js + '?v=' + $v + '"')
  }

  [System.IO.File]::WriteAllText($yol, $icerik, (New-Object System.Text.UTF8Encoding($false)))
  Write-Output "$sayfa güncellendi"
}

Write-Output ""
Write-Output "Yeni sürümler:"
foreach ($js in $dosyalar.Keys) { Write-Output ("  {0,-16} v{1}" -f $js, $dosyalar[$js]) }
