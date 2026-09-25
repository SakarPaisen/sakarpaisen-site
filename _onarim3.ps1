# ONARIM BETIGI 3 — Turkce metin onarimi (PowerShell surumu).
# Dizeler \u kacislariyla yazildi; terminal kodlamasindan etkilenmez.
#
# !!! TEK SEFERLIK — BIR DAHA CALISTIRILMAMALIDIR !!!
$kok = "c:\Users\CASPER\Desktop\SakarPaisen (2)\SakarPaisen"
$dosyalar = @('kelime.html', 'ayarlar.html', 'oyun.html', 'dinleme.html', 'kanji.html', 'sozluk.html', 'yazma.html', 'cumle.html', 'istatistik.html')
$utf8 = New-Object System.Text.UTF8Encoding($false)

function U([string]$k) { return [regex]::Unescape($k) }
$B = [regex]::Unescape('\uFFFD')

$ham = @(
  @('\u0063\u0131 sessizce giri{B}Y ekran\u0131na d\u00fc{B}Ye', '\u0063\u0131 sessizce giri\u015F ekran\u0131na d\u00fc\u015Fe'),
  @('ta{B}Yan i\u00e7erik', 'ta\u015Fan i\u00e7erik'),
  @('{B}o-  Do\u011frusu', '\u2717 Do\u011frusu'),
  @('\u00fcst\u00fcnden d\u00fc{B}Yen renkli', '\u00fcst\u00fcnden d\u00fc\u015Fen renkli'),
  @('kendi ba{B}Y\u0131na duran', 'kendi ba\u015F\u0131na duran'),
  @('Ders biti{B}Y par\u00e7alar\u0131', 'Ders biti\u015F par\u00e7alar\u0131'),
  @('somutla{B}Yt\u0131r', 'somutla\u015Ft\u0131r\u0131r'),
  @('ge\u00e7ildi{B}Yinde', 'ge\u00e7ildi\u011Finde'),
  @('i{B}Yle (tek yerden)', 'i\u015Fle (tek yerden)'),
  @('yaz\u0131lm\u0131{B}Y c\u00fcmleler', 'yaz\u0131lm\u0131\u015F c\u00fcmleler'),
  @('genel geli{B}Yimi g\u00f6r', 'genel geli\u015Fimi g\u00f6r'),
  @('tekrar \u00e7al\u0131{B}Y\u0131lacaklar', 'tekrar \u00e7al\u0131\u015F\u0131lacaklar'),
  @('sayfas\u0131" mant\u0131{B}Y\u0131', 'sayfas\u0131" mant\u0131\u011F\u0131'),
  @('s\u0131ras\u0131nda olu{B}Yan hatalar\u0131', 's\u0131ras\u0131nda olu\u015Fan hatalar\u0131'),
  @('b\u00fcy\u00fck bo{B}Y alan', 'b\u00fcy\u00fck bo\u015F alan'),
  @('kullan\u0131ld\u0131{B}Y\u0131n\u0131 ay\u0131rt', 'kullan\u0131ld\u0131\u011F\u0131n\u0131 ay\u0131rt'),
  @('kana peki{B}Ytirmesi', 'kana peki\u015Ftirmesi'),
  @('kar\u0131{B}Yt\u0131rd\u0131n" b\u00f6l\u00fcm\u00fc', 'kar\u0131\u015Ft\u0131rd\u0131n" b\u00f6l\u00fcm\u00fc'),
  @('Cevap giri{B}Yi', 'Cevap giri\u015Fi'),
  @('G{B}-R{B}oN{B}oM', 'G\u00d6R\u00dcN\u00dcM'),
  @('G{B}-NDER\u0130L\u0130YOR', 'G\u00d6NDER\u0130L\u0130YOR'),
  @('\u00d6{B}Yren', '\u00d6\u011Fren'),
  @('\u00e7al\u0131{B}Yma', '\u00e7al\u0131\u015Fma'),
  @('\u00e7al\u0131{B}Y', '\u00e7al\u0131\u015F'),
  @('\u00f6{B}Yren', '\u00f6\u011Fren'),
  @('ba{B}Yar\u0131', 'ba\u015Far\u0131'),
  @('ba{B}Yla', 'ba\u015Fla'),
  @('ba{B}Yka', 'ba\u015Fka'),
  @('Ba{B}Yka', 'Ba\u015Fka'),
  @('Ba{B}Yl\u0131k', 'Ba\u015Fl\u0131k'),
  @('ba{B}Y\u0131na', 'ba\u015F\u0131na'),
  @('ba{B}Ylant\u0131', 'ba\u011Flant\u0131'),
  @('ba{B}Yken', 'bo\u015Fken'),
  @('de{B}Yi{B}Ytir', 'de\u011Fi\u015Ftir'),
  @('de{B}Yi{B}Yiklik', 'de\u011Fi\u015Fiklik'),
  @('de{B}Yil;', 'de\u011Fil;'),
  @('d\u00fc{B}Ymesi', 'd\u00fc\u011Fmesi'),
  @('d\u00fc{B}Ymeler', 'd\u00fc\u011Fmeler'),
  @('d\u00fc{B}Yme', 'd\u00fc\u011Fme'),
  @('d\u00fc{B}Y\u00fc', 'd\u00fc\u011F\u00fc'),
  @('do{B}Yru', 'do\u011Fru'),
  @('Do{B}Yru', 'Do\u011Fru'),
  @('do{B}Yrulas\u0131n', 'do\u011Frulas\u0131n'),
  @('\u00f6{B}Ye', '\u00f6\u011Fe'),
  @('i{B}Ylem', 'i\u015Flem'),
  @('i{B}Yle', 'i\u015Fle'),
  @('e{B}Yitimi', 'e\u011Fitimi'),
  @('Bilmedi{B}Yin', 'Bilmedi\u011Fin'),
  @('Kazand\u0131{B}Y\u0131n', 'Kazand\u0131\u011F\u0131n'),
  @('olu{B}Yursa', 'olu\u015Fursa'),
  @('olu{B}Ytu', 'olu\u015Ftu'),
  @('oldu{B}Yunu', 'oldu\u011Funu'),
  @('oldu{B}Yunda', 'oldu\u011Funda'),
  @('okunu{B}Y', 'okunu\u015F'),
  @('kar\u0131{B}Yt\u0131rma', 'kar\u0131\u015Ft\u0131rma'),
  @('kar\u0131{B}Y\u0131k', 'kar\u0131\u015F\u0131k'),
  @('kar{B}Y\u0131l\u0131{B}Y\u0131', 'kar\u015F\u0131l\u0131\u011F\u0131'),
  @('kar{B}Y\u0131l\u0131klar\u0131n\u0131', 'kar\u015F\u0131l\u0131klar\u0131n\u0131'),
  @('ak\u0131{B}Y\u0131', 'ak\u0131\u015F\u0131'),
  @('a\u00e7\u0131l\u0131{B}Y', 'a\u00e7\u0131l\u0131\u015F'),
  @('giri{B}Ye', 'giri\u015Fe'),
  @('ge\u00e7i{B}Y', 'ge\u00e7i\u015F'),
  @('ge\u00e7ti{B}Yi', 'ge\u00e7ti\u011Fi'),
  @('yerle{B}Yir', 'yerle\u015Fir'),
  @('ger\u00e7ekle{B}Y', 'ger\u00e7ekle\u015F'),
  @('a{B}Ya{B}\u0131', 'a\u015Fa\u011F\u0131'),
  @('\u00e7ubu{B}Yu', '\u00e7ubu\u011Funu'),
  @('b\u00fcy\u00fckl\u00fc{B}Y\u00fc', 'b\u00fcy\u00fckl\u00fc\u011F\u00fc'),
  @('uzunlu{B}Yunu', 'uzunlu\u011Funu'),
  @('istatisti{B}Yi', 'isti\u011Fi'),
  @('kimli{B}Yi:', 'kimli\u011Fi:'),
  @('bilgi{B}Yi', 'bilgi\u011Fi'),
  @('se\u00e7ti{B}Yin', 'se\u00e7ti\u011Fin'),
  @('\u00f6rne{B}Yi', '\u00f6rne\u011Fi'),
  @('i\u00e7eri{B}Yi', 'i\u00e7eri\u011Fi'),
  @('Duydu{B}Yun', 'Duydu\u011Fun'),
  @('du{B}Ymeler', 'd\u00fc\u011Fmeler'),
  @('{B}Yeridi', '\u015Feridi'),
  @('{B}Yerit', '\u015Ferit'),
  @('{B}Yeyi', '\u015Feyi'),
  @('{B}Yey', '\u015Fey'),
  @('{B}Yekilde', '\u015Fekilde'),
  @('{B}Y\u0131klar', '\u015F\u0131klar'),
  @('yanl\u0131{B}Y', 'yanl\u0131\u015F'),
  @('bo{B}Y', 'bo\u015F'),
  @('Bo{B}Y', 'Bo\u015F'),
  @('biti{B}Y', 'biti\u015F'),
  @('Biti{B}Y', 'Biti\u015F'),
  @('tu{B}Yu', 'tu\u015Fu'),
  @('{B}ost', '\u00c7o\u011Fu'),
  @('C{B}oMLE', 'C\u00dcMLE'),
  @('G{B}-REVLER', 'G\u00d6REVLER'),
  @('G{B}oNL{B}oK', 'G\u00d6NL\u00dcK'),
  @('{B}-ZET', '\u00d6ZET'),
  @('{B}-RNEK', '\u00d6RNEK'),
  @('{B}-NCE', '\u00d6NCE'),
  @('{B}?al\u0131{B}Yma', '\u00c7al\u0131\u015Fma'),
  @('{B}?al\u0131{B}Y\u0131lan', '\u00c7al\u0131\u015F\u0131lan'),
  @('{B}?ALI{B}YMA', '\u00c7ALI\u015eMA'),
  @('{B}?ok b\u00fcy\u00fck', '\u00c7ok b\u00fcy\u00fck'),
  @('{B}sT{B}', '\u2699\ufe0f'),
  @('{B}~{B}', '\ud83e\uddf9'),
  @('{B}s{B}', '\u26a0\ufe0f'),
  @('{B}o{B}', '\u270d\ufe0f'),
  @('{B}o.', '\u2705'),
  @('{B}o', '\u2728')
)

# Kacislari gercek karaktere cevir, {B} yerine bozuk karakteri koy
$ciftler = @()
foreach ($h in $ham) {
  $sol = (U $h[0]).Replace('{B}', $B)
  $sag = U $h[1]
  $ciftler += , @($sol, $sag)
}

$toplam = 0
foreach ($f in $dosyalar) {
  $y = Join-Path $kok $f
  if (!(Test-Path $y)) { continue }
  $m = [System.IO.File]::ReadAllText($y, $utf8)
  $once = ([regex]::Matches($m, [string]$B)).Count
  foreach ($c in $ciftler) {
    if ($m.Contains($c[0])) { $m = $m.Replace($c[0], $c[1]) }
  }
  $sonra = ([regex]::Matches($m, [string]$B)).Count
  [System.IO.File]::WriteAllText($y, $m, $utf8)
  $d = $once - $sonra
  $toplam += $d
  Write-Output ($f.PadRight(20) + " once=" + $once.ToString().PadLeft(4) + " sonra=" + $sonra.ToString().PadLeft(4) + " duzeltilen=" + $d)
}
Write-Output ("`nTOPLAM duzeltilen: " + $toplam)
