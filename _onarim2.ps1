# ONARIM BETIGI 2 - tek seferlik
# Turkce metinleri onarir. Japonca veri dizileri AYRI ele alinir (bkz. _onarim-rapor.txt).
#
# !!! BU BETIK BIR DAHA CALISTIRILMAMALIDIR !!!
$kok = "c:\Users\CASPER\Desktop\SakarPaisen (2)\SakarPaisen"
$dosyalar = @('kelime.html', 'ayarlar.html', 'oyun.html', 'dinleme.html', 'kanji.html', 'sozluk.html', 'yazma.html', 'cumle.html', 'istatistik.html')
$utf8 = New-Object System.Text.UTF8Encoding($false)
$B = [char]0xFFFD

# Turkce metin onarimlari. Anahtar: "bozuk dizi", deger: "dogru metin".
# Kaynak: hasarli dosyalarin satir satir incelenmesi.
$ciftler = @(
  @('cı sessizce giri' + $B + 'Y ekranına dü' + $B + 'Ye', 'cı sessizce giriş ekranına düşe'),
  @('ta' + $B + 'Yan içerik', 'taşan içerik'),
  @("'Doğrusu", "'✗ Doğrusu"),
  @($B + 'o- Doğrusu', '✗ Doğrusu'),
  @('üstünden dü' + $B + 'Yen renkli', 'üstünden düşen renkli'),
  @('kendi ba' + $B + 'Yına duran', 'kendi başına duran'),
  @('Ders biti' + $B + 'Y parçaları', 'Ders bitiş parçaları'),
  @('somutla' + $B + 'Ytır', 'somutlaştırır'),
  @('geçildi' + $B + 'Yinde', 'geçildiğinde'),
  @('i' + $B + 'Yle (tek yerden)', 'işle (tek yerden)'),
  @('yazılmı' + $B + 'Y cümleler', 'yazılmış cümleler'),
  @('genel geli' + $B + 'Yimi gör', 'genel gelişimi gör'),
  @('tekrar çalı' + $B + 'Yılacaklar', 'tekrar çalışılacaklar'),
  @("'E" + $B + 'Yle' + $B + 'Yen kelime', "'Öğrenilen kelime"),
  @('sayfası" mantı' + $B + 'Yı', 'sayfası" mantığı'),
  @('sırasında olu' + $B + 'Yan hataları', 'sırasında oluşan hataları'),
  @('ö' + $B + 'Yrenilen kelimel', 'öğrenilen kelimel'),
  @('büyük bo' + $B + 'Y alan', 'büyük boş alan'),
  @('kullanıldı' + $B + 'Yını ayırt', 'kullanıldığını ayırt'),
  @('kana peki' + $B + 'Ytirmesi', 'kana pekiştirmesi'),
  @('karı' + $B + 'Ytırdın" bölümü', 'karıştırdın" bölümü'),
  @('>Haritaya dön">' + $B + 'o-</button>', '>Haritaya dön">✗</button>'),
  @('Cevap giri' + $B + 'Yi', 'Cevap girişi'),
  @('ö' + $B + 'Yrenmeye', 'öğrenmeye'),
  @('ö' + $B + 'Yrenci', 'öğrenci'),
  @('ö' + $B + 'Yret', 'öğret'),
  @('Ö' + $B + 'Yren', 'Öğren'),
  @('de' + $B + 'Yer', 'değer'),
  @('ba' + $B + 'Yla', 'başla'),
  @('ba' + $B + 'Yarı', 'başarı'),
  @('a' + $B + 'Ya' + $B + 'ı', 'aşağı'),
  @('gerçekle' + $B + 'Y', 'gerçekleş'),
  @('' + $B + 'Yekilde', 'şekilde'),
  @('bilgi' + $B + 'Yi', 'bilgiği'),
  @('dü' + $B + 'Ymesini', 'düğmesini'),
  @('seçti' + $B + 'Yin', 'seçtiğin'),
  @('de' + $B + 'Yi' + $B + 'Yiklik', 'değişiklik'),
  @('yanlı' + $B + 'Y', 'yanlış'),
  @('bo' + $B + 'Y', 'boş'),
  @('biti' + $B + 'Y', 'bitiş'),
  @('tu' + $B + 'Yu', 'tuşu'),
  @('i' + $B + 'Yle', 'işle'),
  @('içeri' + $B + 'Yi', 'içeriği'),
  @('örne' + $B + 'Yi', 'örneği'),
  @('ö' + $B + 'Yren', 'öğren'),
  @('dü' + $B + 'Yme', 'düğme'),
  @('ö' + $B + 'Ye', 'öğe'),
  @('de' + $B + 'Yi' + $B + 'Ytir', 'değiştir'),
  @('giri' + $B + 'Ye', 'girişe'),
  @('G' + $B + '-R' + $B + 'oN' + $B + 'oM', 'GÖRÜNÜM'),
  @('G' + $B + '-NDERİLİYOR', 'GÖNDERİLİYOR'),
  @('' + $B + '-ZET', 'ÖZET'),
  @('' + $B + '-RNEK', 'ÖRNEK'),
  @('' + $B + '-NCE', 'ÖNCE'),
  @('' + $B + '-N' + $B + 'Yrenme', 'Öğrenme'),
  @('C' + $B + 'oMLE', 'CÜMLE'),
  @('G' + $B + '-REVLER', 'GÖREVLER'),
  @('G' + $B + 'oNL' + $B + 'oK', 'GÖNLÜK'),
  @('' + $B + '?ALI' + $B + 'YMA', 'ÇALIŞMA'),
  @('' + $B + '?alı' + $B + 'Yma', 'Çalışma'),
  @('' + $B + '?alı' + $B + 'Yılan', 'Çalışılan'),
  @('' + $B + '?ok büyük', 'Çok büyük'),
  @('çalı' + $B + 'Yma', 'çalışma'),
  @('çalı' + $B + 'Y', 'çalış'),
  @('çalı' + $B + 'Yır', 'çalışır'),
  @('çubu' + $B + 'Yu', 'çubuğu'),
  @('akı' + $B + 'Yı', 'akışı'),
  @('açılı' + $B + 'Y', 'açılış'),
  @('karı' + $B + 'Ytırma', 'karıştırma'),
  @('karı' + $B + 'Yık', 'karışık'),
  @('kar' + $B + 'Yılı' + $B + 'Yı', 'karşılığı'),
  @('kar' + $B + 'Yılıklarını', 'karşılıklarını'),
  @('okunu' + $B + 'Y', 'okunuş'),
  @('' + $B + 'Yıklar', 'şıklar'),
  @('Duydu' + $B + 'Yun', 'Duyduğun'),
  @('du' + $B + 'Ymeler', 'düğmeler'),
  @('dü' + $B + 'Ymeler', 'düğmeler'),
  @('dü' + $B + 'Ymesi', 'düğmesi'),
  @('dü' + $B + 'Yü', 'düğü'),
  @('büyüklü' + $B + 'Yü', 'büyüklüğü'),
  @('uzunlu' + $B + 'Yunu', 'uzunluğunu'),
  @('do' + $B + 'Yrulasın', 'doğrulasın'),
  @('do' + $B + 'Yru', 'doğru'),
  @('Do' + $B + 'Yru', 'Doğru'),
  @('' + $B + 'Yeridi', 'şeridi'),
  @('' + $B + 'Yerit', 'şerit'),
  @('yerle' + $B + 'Yir', 'yerleşir'),
  @('geçi' + $B + 'Y', 'geçiş'),
  @('olu' + $B + 'Ytu', 'oluştu'),
  @('ba' + $B + 'Ylantı', 'bağlantı'),
  @('ba' + $B + 'Yka', 'başka'),
  @('Ba' + $B + 'Yka', 'Başka'),
  @('Ba' + $B + 'Ylık', 'Başlık'),
  @('ba' + $B + 'Yına', 'başına'),
  @('' + $B + 'Yeyi', 'şeyi'),
  @('' + $B + 'Yey', 'şey'),
  @('i' + $B + 'Ylem', 'işlem'),
  @('e' + $B + 'Yitimi', 'eğitimi'),
  @('Bilmedi' + $B + 'Yin', 'Bilmediğin'),
  @('ba' + $B + 'Yken', 'boşken'),
  @('Bo' + $B + 'Y', 'Boş'),
  @('Biti' + $B + 'Y', 'Bitiş'),
  @('Kazandı' + $B + 'Yın', 'Kazandığın'),
  @('olu' + $B + 'Yursa', 'oluşursa'),
  @('' + $B + 'ost', 'Çoğu'),
  @('kimli' + $B + 'Yi:', 'kimliği:'),
  @('istatisti' + $B + 'Yi', 'istiği'),
  @('oldu' + $B + 'Yunu', 'olduğunu'),
  @('oldu' + $B + 'Yunda', 'olduğunda'),
  @('oldu' + $B + 'Yunu', 'olduğunu'),
  @('de' + $B + 'Yil;', 'değil;'),
  @('geçti' + $B + 'Yi', 'geçtiği'),
  @('' + $B + 'o-', '✗'),
  @('' + $B + 'o.', '✅'),
  @('' + $B + 'O ', '❌ '),
  @('' + $B + 'sT' + $B + '', '⚙️'),
  @('' + $B + '~' + $B + '', '🧹'),
  @('' + $B + 's' + $B + '', '⚠️'),
  @('' + $B + 'o' + $B + '', '✍️'),
  @('' + $B + 'o', '✨')
)

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
