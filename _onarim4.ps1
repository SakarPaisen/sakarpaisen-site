# ONARIM BETIGI 4 — SON TUR.
# Turkce metinler + emoji yer tutuculari + kelime.html'deki KANJI VERISI.
#
# Kanji verisi neden guvenle onarilabilir: satirlarda 'ro' (romaji) alani
# BOZULMAMIS durumda. Hangi kelimenin hangi kanjiyle yazildigi romaji'den
# kesin biliniyor (watashi -> 私, neko -> 猫, gakkou -> 学校 ...).
#
# !!! TEK SEFERLIK — BIR DAHA CALISTIRILMAMALIDIR !!!
$kok = "c:\Users\CASPER\Desktop\SakarPaisen (2)\SakarPaisen"
$dosyalar = @('kelime.html', 'oyun.html', 'dinleme.html', 'kanji.html', 'sozluk.html', 'yazma.html', 'cumle.html')
$utf8 = New-Object System.Text.UTF8Encoding($false)
function U([string]$k) { return [regex]::Unescape($k) }
$B = [regex]::Unescape('\uFFFD')

$ham = @(
  # ===== KANJI VERISI (kelime.html) — 'ro' alani saglam, kanji kesin =====
  @('{B}?s{s}{B}?s', '私'),
  @('{B}{B}?s{B}?{B}', '貴方'),
  @('{B}{B}{B}?s{B}o{B}{B}{B}', '先生'),
  @('{B}{B}?{B}{B}{B}{B}', '学生'),
  @('{B}{B}{B}?s{B}?s{B}', '友達'),
  @('{B}{B}{B}?o', '猫'),
  @('{B}{B}{B}?s', '鳥'),
  @('{B}{B}{B}?s{B}?o', '本'),
  @('{B}{B}{B}?s{B}{B}', 'お茶'),
  @('{B}{B}{B}{B}?s{B}?o', 'ご飯'),
  @('{B}{B}?s{B}{B}{B}', '車'),
  @('{B}{B}?s{B}{B}', '学校'),
  @('{B}{B}?s{B}{B}', '山'),
  @('{B}{B}?s', '川'),
  @('{B}{B}?s{B}', '空'),
  @('{B}{B}{B}', '道'),
  @('{B}?s{B}?s{B}?s', '森'),
  @('{B}{B}{B}', '月'),
  @('{B}{B}{B}?s{B}{B}{B}?s{B}?o', 'お母さん'),
  @('{B}{B}{B}{B}{B}{B}{B}?s{B}?o', 'お父さん'),
  @('{B}?o{B}{B}?s{B}?s', '子供'),
  @('{B}{B}{B}?s{B}', '食べる'),
  @('{B}{B}?s{B}{B}', '飲む'),
  @('{B}{B}?s{B}', '見る'),
  @('{B}{B}', '行く'),
  @('{B}{B}?s{B}', '来る'),
  @('{B}?s{B}{B}?s{B}{B}{B}', '新しい'),
  @('{B}{B}?s{B}{B}', '古い'),
  @('{B}?s{B}{B}{B}', '暑い'),
  @('{B}{B}?s{B}{B}{B}', '寒い'),
  @('{B}{B}{B}{B}{B}{B}', '美味しい'),
  @('{B}?s{B}{B}{B}{B}{B}', '安い'),
  @('{B}{B}?{B}{B}', '長い'),
  @('{B}?s{B}{B}{B}', '赤い'),
  @('{B}{B}?s{B}{B}{B}', '白い'),
  @('{B}{B}?s{B}{B}{B}', '可愛い'),
  @('{B}{B}{B}', 'お金'),
  @('{B}?{B}', '駅'),
  @('{B}{B}?s{B}?o{B}{B}?s{B}{B}', '電車'),
  @('{B}?s{B}{B}{B}{B}{B}?s{B}?o', '病院'),
  @('{B}{B}{B}?s{B}?s{B}{B}', '食べ物'),
  @('{B}{B}{B}?s{B}?s{B}{B}', '飲み物'),
  @('{B}B{B}{B}?s{B}?o', '時間'),
  @('{B}{B}?s{B}{B}{B}', '今日'),
  @('{B}?s{B}{B}{B}', '明日'),
  @('{B}?s{B}{B}', '朝'),
  @('{B}?s{B}?s{B}?s{B}', '夜'),
  @('{B}{B}{B}?', '名前'),
  @('{B}{B}{B}?s{B}?o{B}{B}', '日本語'),
  @('{B}?{B}{B}{B}', '英語'),
  @('{B}?o{B}{B}{B}', '言葉'),
  @('{B}{B}?s{B}?o{B}{B}{B}{B}{B}', '勉強'),
  @('{B}{B}{B}', '好き'),
  @('{B}?T{B}?s{B}?o{B}{B}', '元気'),
  @('{B}{B}?s{B}{B}', '綺麗'),
  @('{B}{B}{B}?s{B}', '所'),
  # ===== TURKCE METINLER =====
  @('{B}-zet kutular\u0131', '\u00d6zet kutular\u0131'),
  @('SAYFA ta{B}Ymaz.', 'SAYFA ta\u015Fmaz.'),
  @('{B}-n y\u00fcz: Japonca kelime', '\u00d6n y\u00fcz: Japonca kelime'),
  @('ekran geni{B}Yli{B}Yinde kals\u0131n', 'ekran geni\u015Fli\u011Finde kals\u0131n'),
  @('\u00f6\u011frenildi{B}Yinde g\u00f6r\u00fcn\u00fcr', '\u00f6\u011frenildi\u011Finde g\u00f6r\u00fcn\u00fcr'),
  @('L\u0130STEY\u0130 G{B}-R', 'L\u0130STEY\u0130 G\u00d6R'),
  @('TEKRAR {B}?ALI\u015e', 'TEKRAR \u00c7ALI\u015e'),
  @('{B}?ALI\u015e</button>', '\u00c7ALI\u015e</button>'),
  @('\u00f6\u011fretti{B}Yin kelimeler', '\u00f6\u011fretti\u011Fin kelimeler'),
  @('{B}< Haritaya d\u00f6n', '\u2190 Haritaya d\u00f6n'),
  @('di{B}yer sayfalarla', 'di\u011Fer sayfalarla'),
  @('A{B}?ILIR B\u0130LG\u0130 KARTI', 'A\u00c7ILIR B\u0130LG\u0130 KARTI'),
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
  @('{B}?s Harfleri', '\u6F22 Harfleri'),
  @('Romanize edilmi{B}Y par\u00e7ay\u0131', 'Romanize edilmi\u015F par\u00e7ay\u0131'),
  @("['Ba{B}Yar\u0131'", "['Ba\u015Far\u0131'"),
  @('ta{B}Y\u0131n\u0131r;', 'ta\u015F\u0131n\u0131r;'),
  @('zorland\u0131{B}Y\u0131n \u00f6nce', 'zorland\u0131\u011F\u0131n \u00f6nce'),
  @('{B}?ALI\u015e \u015feridi', '\u00c7ALI\u015e \u015feridi'),
  @('sa{B}Ylar.)', 'sa\u011Flar.)'),
  @('peki{B}Ytir', 'peki\u015Ftir'),
  @('zorlanm\u0131{B}Ys\u0131n', 'zorlanm\u0131\u015Fs\u0131n'),
  @('ta{B}Yarsa kayd\u0131r\u0131l\u0131r.', 'ta\u015Farsa kayd\u0131r\u0131l\u0131r.'),
  @('{B}-{B}Yrenci hangi', '\u00d6\u011frenci hangi'),
  @('1-4 tu{B}Ylar\u0131yla', '1-4 tu\u015Flar\u0131yla'),
  @('belirdi{B}Yinde', 'belirdi\u011Finde'),
  @('ekledi{B}Yi "Powered', 'ekledi\u011Fi "Powered'),
  @('sa{B}Y altta', 'sa\u011F altta'),
  @('\u00e7a{B}Y\u0131r)', '\u00e7a\u011F\u0131r)'),
  @('kalm\u0131{B}Ysa', 'kalm\u0131\u015Fsa'),
  @('Okuma prati{B}Yi verisi', 'Okuma prati\u011Fi verisi'),
  @('\u00f6nbelle{B}Yi k\u0131rar', '\u00f6nbelle\u011Fi k\u0131rar'),
  @('s\u00f6zle{B}Yme.', 's\u00f6zle\u015Fme.'),
  @('Dinleme Al\u0131{B}Yt\u0131rmas\u0131', 'Dinleme Al\u0131\u015Ft\u0131rmas\u0131'),
  @('{B}-nce \u00e7ok y\u00fcksekti', '\u00d6nce \u00e7ok y\u00fcksekti'),
  @('al\u0131{B}Yt\u0131rmas\u0131nda', 'al\u0131\u015Ft\u0131rmas\u0131nda'),
  @('\u00e7a{B}Y\u0131r\u0131r)', '\u00e7a\u011F\u0131r\u0131r)'),
  @('SES {B}?AL', 'SES \u00c7AL'),
  @('1-4 {B}Y\u0131k', '1-4 \u015F\u0131k'),
  @('SONU{B}? KARNES\u0130', 'SONU\u00c7 KARNES\u0130'),
  @('Ba{B}Yar\u0131ma', 'Ba\u015Far\u0131ma'),
  @('Fena de{B}Yil.', 'Fena de\u011Fil.'),
  @('olu{B}Ysun.', 'olu\u015Fsun.'),
  @('istedi{B}Yin kanjiye', 'istedi\u011Fin kanjiye'),
  @('tek bak\u0131{B}Yta', 'tek bak\u0131\u015Fta'),
  @('\u00f6\u011frenilmi{B}Y /', '\u00f6\u011frenilmi\u015F /'),
  @('{B}-rnek kelime: kanjinin', '\u00d6rnek kelime: kanjinin'),
  @('sa{B}Yda temizle', 'sa\u011Fda temizle'),
  @('\u0130{B}?\u0130NDE durur', '\u0130\u00c7\u0130NDE durur'),
  @('S{B}-ZL{B}K', 'S\u00d6ZL\u00dcK'),
  @('Japonca ({B}<)', 'Japonca (\u3042)'),
  @('A\u00e7\u0131l\u0131{B}Y ekran\u0131', 'A\u00e7\u0131l\u0131\u015F ekran\u0131'),
  @('hat\u0131rlanaca{B}Y\u0131n\u0131', 'hat\u0131rlanaca\u011F\u0131n\u0131'),
  @('Yumu{B}Yak klavye', 'Yumu\u015Fak klavye'),
  @('\u00f6zel tu{B}Ylar', '\u00f6zel tu\u015Flar'),
  @('C\u00dcMLE AT{B}-LYES\u0130', 'C\u00dcMLE AT\u00d6LYES\u0130'),
  # ===== EMOJI YER TUTUCULARI =====
  @("'gY{B}?'", "'\u2705'"),
  @("'gYO{B}'", "'\ud83c\udfc6'"),
  @("'gY'{B}'", "'\ud83c\udf89'"),
  @("'gY{B}'", "'\u2728'"),
  @('gY{B}<', '\u2190'),
  @('{B}o{B}renci', '\ud83c\udf38'),
  @('{B}Ÿ{B}', '\ud83c\udf89'),
  @('{B}✨{B}', '\ud83d\udd25'),
  @('{B}{B}', '\ud83d\udd0d')
)

$ciftler = @()
foreach ($h in $ham) {
  $sol = (U $h[0]).Replace('{B}', $B).Replace('{s}', [char]0xFFFD).Replace('{B}o', $B + 'o').Replace('{B}?', $B + '?').Replace('B{', 'B{')
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
