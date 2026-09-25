# ONARIM BETIGI 5 — SON TEMIZLIK.
# Kalan tum bozuk diziler Turkce metin ve emoji. Hepsi baglamdan biliniyor.
#
# !!! TEK SEFERLIK — BIR DAHA CALISTIRILMAMALIDIR !!!
$kok = "c:\Users\CASPER\Desktop\SakarPaisen (2)\SakarPaisen"
$dosyalar = @('kelime.html', 'oyun.html', 'dinleme.html', 'kanji.html', 'sozluk.html', 'yazma.html', 'cumle.html')
$utf8 = New-Object System.Text.UTF8Encoding($false)
function U([string]$k) { return [regex]::Unescape($k) }
$B = [regex]::Unescape('\uFFFD')

$ham = @(
  # --- Emoji yer tutuculari (once; icerikte gecen dizi cakismasin) ---
  @("'gY{B}?'", "'\u2705'"),
  @("'gYO{B}'", "'\ud83c\udfc6'"),
  @("'gY'{B}'", "'\ud83c\udf89'"),
  @("gY{B}'", "'\u2728'"),
  @('gY{B}<', '\u2190'),
  @('gY{B}', '\u2728'),
  @('gY{B}', '\ud83d\udd25'),
  @('| gY{B}?', '| \u2705'),
  @('\u2018gY{B}?\u2019', "\u2705"),
  # --- Simgeler ---
  @('{B}?ALI\u015e</button>', '\u00c7ALI\u015e</button>'),
  @('TEKRAR {B}?ALI\u015e', 'TEKRAR \u00c7ALI\u015e'),
  @('SES {B}?AL', 'SES \u00c7AL'),
  @('A{B}?ILIR B\u0130LG\u0130', 'A\u00c7ILIR B\u0130LG\u0130'),
  @('SONU{B}? KARNES\u0130', 'SONU\u00c7 KARNES\u0130'),
  @('KARTLARLA {B}?ALI\u015e', 'KARTLARLA \u00c7ALI\u015e'),
  @('C\u00dcMLE AT{B}-LYES\u0130', 'C\u00dcMLE AT\u00d6LYES\u0130'),
  @('S{B}-ZL{B}K', 'S\u00d6ZL\u00dcK'),
  # --- Turkce metinler ---
  @('{B}-zet kutular\u0131', '\u00d6zet kutular\u0131'),
  @('SAYFA ta{B}Ymaz.', 'SAYFA ta\u015Fmaz.'),
  @('{B}-n y\u00fcz: Japonca', '\u00d6n y\u00fcz: Japonca'),
  @('ekran geni{B}Yli{B}Yinde', 'ekran geni\u015Fli\u011Finde'),
  @('\u00f6\u011frenildi{B}Yinde', '\u00f6\u011frenildi\u011Finde'),
  @('L\u0130STEY\u0130 G{B}-R', 'L\u0130STEY\u0130 G\u00d6R'),
  @('\u00f6\u011fretti{B}Yin kelimeler', '\u00f6\u011fretti\u011Fin kelimeler'),
  @('di{B}yer sayfalarla', 'di\u011Fer sayfalarla'),
  @('zorland\u0131{B}Y\u0131n kelime', 'zorland\u0131\u011F\u0131n kelime'),
  @('A{B}Ya{B}Y\u0131daki e{B}Yleme', 'A\u015Fa\u011F\u0131daki e\u015Fleme'),
  @('kana s\u00f6zl\u00fc{B}Y\u00fcn', 'kana s\u00f6zl\u00fc\u011F\u00fcn'),
  @('bozmamay\u0131 sa{B}Ylar', 'bozmamay\u0131 sa\u011Flar'),
  @('yaz\u0131ld\u0131{B}Y\u0131n\u0131 g\u00f6rebilirsin', 'yaz\u0131ld\u0131\u011F\u0131n\u0131 g\u00f6rebilirsin'),
  @('E{B}Yle{B}Yen kelime yok', 'E\u015Fle\u015Fen kelime yok'),
  @('ayr\u0131l\u0131{B}Y (kanji', 'ayr\u0131l\u0131\u015F (kanji'),
  @("'A{B}Yu'", "'A\u011Fu'"),
  @('ay\u0131r: {B}?み', 'ay\u0131r: \u8AADみ'),
  @('anla{B}Y\u0131l\u0131r', 'anla\u015F\u0131l\u0131r'),
  @('{B}-rnek c\u00fcmle', '\u00d6rnek c\u00fcmle'),
  @('{B}-rnek kelime', '\u00d6rnek kelime'),
  @('{B}?s Harfleri', '\u6F22 Harfleri'),
  @('Romanize edilmi{B}Y', 'Romanize edilmi\u015F'),
  @("['Ba{B}Yar\u0131'", "['Ba\u015Far\u0131'"),
  @('ta{B}Y\u0131n\u0131r;', 'ta\u015F\u0131n\u0131r;'),
  @('zorland\u0131{B}Y\u0131n \u00f6nce', 'zorland\u0131\u011F\u0131n \u00f6nce'),
  @('{B}?ALI\u015e \u015feridi', '\u00c7ALI\u015e \u015feridi'),
  @('peki{B}Ytir', 'peki\u015Ftir'),
  @('zorlanm\u0131{B}Ys\u0131n', 'zorlanm\u0131\u015Fs\u0131n'),
  @('ta{B}Yarsa kayd\u0131r\u0131l\u0131r.', 'ta\u015Farsa kayd\u0131r\u0131l\u0131r.'),
  @('ta{B}Yan i\u00e7erik', 'ta\u015Fan i\u00e7erik'),
  @('{B}-{B}Yrenci hangi', '\u00d6\u011frenci hangi'),
  @('1-4 tu{B}Ylar\u0131yla', '1-4 tu\u015Flar\u0131yla'),
  @('belirdi{B}Yinde', 'belirdi\u011Finde'),
  @('ekledi{B}Yi "Powered', 'ekledi\u011Fi "Powered'),
  @('sa{B}Y altta', 'sa\u011F altta'),
  @('\u00e7a{B}Y\u0131r)', '\u00e7a\u011F\u0131r)'),
  @('\u00e7a{B}Y\u0131r\u0131r)', '\u00e7a\u011F\u0131r\u0131r)'),
  @('kalm\u0131{B}Ysa', 'kalm\u0131\u015Fsa'),
  @('Okuma prati{B}Yi verisi', 'Okuma prati\u011Fi verisi'),
  @('\u00f6nbelle{B}Yi k\u0131rar', '\u00f6nbelle\u011Fi k\u0131rar'),
  @('s\u00f6zle{B}Yme.', 's\u00f6zle\u015Fme.'),
  @('Al\u0131{B}Yt\u0131rmas\u0131', 'Al\u0131\u015Ft\u0131rmas\u0131'),
  @('al\u0131{B}Yt\u0131rmas\u0131nda', 'al\u0131\u015Ft\u0131rmas\u0131nda'),
  @('{B}-nce \u00e7ok y\u00fcksekti', '\u00d6nce \u00e7ok y\u00fcksekti'),
  @('1-4 {B}Y\u0131k', '1-4 \u015F\u0131k'),
  @('Ba{B}Yar\u0131ma', 'Ba\u015Far\u0131ma'),
  @('Fena de{B}Yil.', 'Fena de\u011Fil.'),
  @('olu{B}Ysun.', 'olu\u015Fsun.'),
  @('istedi{B}Yin kanjiye', 'istedi\u011Fin kanjiye'),
  @('tek bak\u0131{B}Yta', 'tek bak\u0131\u015Fta'),
  @('\u00f6\u011frenilmi{B}Y /', '\u00f6\u011frenilmi\u015F /'),
  @('sa{B}Yda temizle', 'sa\u011Fda temizle'),
  @('\u0130{B}?\u0130NDE durur', '\u0130\u00c7\u0130NDE durur'),
  @('Japonca ({B}<)', 'Japonca (\u3042)'),
  @('A\u00e7\u0131l\u0131{B}Y ekran\u0131', 'A\u00e7\u0131l\u0131\u015F ekran\u0131'),
  @('hat\u0131rlanaca{B}Y\u0131n\u0131', 'hat\u0131rlanaca\u011F\u0131n\u0131'),
  @('Yumu{B}Yak klavye', 'Yumu\u015Fak klavye'),
  @('\u00f6zel tu{B}Ylar', '\u00f6zel tu\u015Flar'),
  @('zorlanm\u0131{B}Ys\u0131n', 'zorlanm\u0131\u015Fs\u0131n'),
  @('yetmi{B}Y', 'yetmi\u015F'),
  @('sa{B}Ylar', 'sa\u011Flar'),
  @('ta{B}Y\u0131r', 'ta\u015F\u0131r'),
  @('a{B}Ya', 'a\u015Fa'),
  @('e{B}Ye', 'e\u015Fe'),
  @('{B}?evir', '\u00c7evir'),
  @('{B}?eviriyor', '\u00c7eviriyor'),
  @('{B}?ok iyi', '\u00c7ok iyi'),
  @('{B}?oktan', '\u00c7oktan'),
  @('{B}?al\u0131{B}Y', '\u00c7al\u0131\u015F'),
  @('{B}< Haritaya', '\u2190 Haritaya')
)

$ciftler = @()
foreach ($h in $ham) {
  $ciftler += , @((U $h[0]).Replace('{B}', $B), (U $h[1]))
}

$toplam = 0
foreach ($f in $dosyalar) {
  $y = Join-Path $kok $f
  if (!(Test-Path $y)) { continue }
  $m = [System.IO.File]::ReadAllText($y, $utf8)
  $once = ([regex]::Matches($m, [string]$B)).Count
  foreach ($c in $ciftler) { if ($m.Contains($c[0])) { $m = $m.Replace($c[0], $c[1]) } }
  $sonra = ([regex]::Matches($m, [string]$B)).Count
  [System.IO.File]::WriteAllText($y, $m, $utf8)
  $d = $once - $sonra
  $toplam += $d
  if ($once -gt 0) { Write-Output ($f.PadRight(20) + " once=" + $once.ToString().PadLeft(4) + " sonra=" + $sonra.ToString().PadLeft(4) + " duzeltilen=" + $d) }
}
Write-Output ("`nTOPLAM duzeltilen: " + $toplam)

# Tum projede kalan bozuk karakter var mi?
$tum = Get-ChildItem $kok -Filter *.html | ForEach-Object { [System.IO.File]::ReadAllText($_.FullName, $utf8) }
$kalan = ($tum -join '').ToCharArray() | Where-Object { [int]$_ -eq 0xFFFD }
Write-Output ("Projede kalan bozuk karakter: " + ($kalan | Measure-Object).Count)
