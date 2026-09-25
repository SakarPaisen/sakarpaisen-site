# Basit yerel sunucu - Sakar Paisen test icin
# Kullanim:  powershell -ExecutionPolicy Bypass -File bu-dosya.ps1
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8000
$lis = New-Object System.Net.HttpListener
$lis.Prefixes.Add("http://localhost:$port/")
$lis.Start()
Write-Output "Sunucu calisiyor: http://localhost:$port/"
Write-Output "Durdurmak icin bu pencereyi kapatin veya Ctrl+C."
$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.css'  = 'text/css'
  '.json' = 'application/json'
  '.png'  = 'image/png'
  '.webp' = 'image/webp'
  '.mp3'  = 'audio/mpeg'
  '.wav'  = 'audio/wav'
  '.ico'  = 'image/x-icon'
}
while ($lis.IsListening) {
  try {
    $ctx = $lis.GetContext()
    # URL çözümlemesi: sorgu dizesini (?ders=1) at, yolu dosya yoluna çevir.
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.LocalPath).TrimStart('/')
    if ([string]::IsNullOrEmpty($rel)) { $rel = 'index.html' }
    $rel = $rel -replace '/', '\'
    $path = Join-Path $root $rel
    # ÖNEMLİ: "her isteğe index.html ver" fallback'i YOK.
    # Böyle bir fallback, oyun.html istendiğinde giriş ekranının
    # servis edilmesine ve dersin hiç açılmamasına yol açıyordu.
    if (Test-Path $path -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $ext = [System.IO.Path]::GetExtension($path).ToLower()
      if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $govde = [System.Text.Encoding]::UTF8.GetBytes('Bulunamadi: ' + $rel)
      $ctx.Response.StatusCode = 404
      $ctx.Response.ContentLength64 = $govde.Length
      $ctx.Response.OutputStream.Write($govde, 0, $govde.Length)
    }
    # Yanıtı düzgün kapat: Close() çağrılmazsa keep-alive bağlantılarında
    # yanıtlar karışabiliyor (adres oyun.html ama içerik giriş sayfası gibi).
    $ctx.Response.OutputStream.Flush()
    $ctx.Response.Close()
  } catch { break }
}
