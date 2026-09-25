# Arka plan videoları — koyacağın yer

Bu klasöre videolarını koyduğun an site onları otomatik kullanır.
**Kod değiştirmen gerekmez.**

## Beklenen dosya adları (aynen böyle olmalı)

    videolar/yatay/arkaplan.mp4     masaüstü / geniş ekran
    videolar/dikey/arkaplan.mp4     telefon / dikey ekran

### Opsiyonel ama önerilen ekler

    videolar/yatay/kapak.jpg        videonun ilk karesi (poster)
    videolar/dikey/kapak.jpg

**Önce MP4, sonra WebM:** Tarayıcıların tamamı (Chrome, Firefox, Edge, Safari)
H.264 MP4'ü donanım hızlandırmalı çözer — WebM/VP9 yazılım çözümüne düştüğü
için zayıf makinelerde ve oyun açıkken kare atlaması (kasma) yapar.
Site önce `arkaplan.mp4` arar; yoksa (404 hata vermez, sessizce) aynı klasördeki
`arkaplan.webm`'e düşer. Yani MP4 koyarsan MP4 oynar, koymazsan WebM oynar.
**Öneri:** MP4'ü birincil kaynak yap, WebM'i hiç koyma bile — MP4 daha küçük
ve donanımla çözülür.

> **ÖNEMLİ — kodlama sırası (faststart):** MP4'ün meta verisi dosyanın
> SONUNDA olursa tarayıcı videonun tamamını indirmeden oynatmaya başlayamaz.
> Dosyayı `-movflags +faststart` ile üret ya da mevcut dosyayı bir kez
> şu komutla düzelt (kalite düşmez, sadece veri sırası değişir):
>
>     ffmpeg -i kaynak.mp4 -c copy -movflags +faststart videolar/yatay/arkaplan.mp4

**Kapak (poster) neden:** Video indirilene kadar (ilk 1-2 saniye) bu resim
görünür. Koymazsan o an boş alan olur. Videonun ilk karesini JPG olarak
kaydetmen yeterli.

## Video nasıl olmalı

| Özellik | Değer |
|---|---|
| Süre | 8–12 saniye (döngüye girecek) |
| Yatay çözünürlük | 1920×1080 |
| Dikey çözünürlük | 1080×1920 |
| Kare hızı | 24 veya 30 fps |
| Hedef dosya boyutu | 2–5 MB (üstü mobilde yavaş) |
| Ses | **Ses olmamalı** (site zaten sessiz oynatıyor) |
| Döngü | İlk ve son kare uyuşmalı, yoksa geçişte "zıplama" olur |

### Nerede görünür

| Sayfa | Videonun üstünde ne var |
|---|---|
| `index.html` (açılış) | Açılış perdesi yalnızca video yüklenene kadar durur; video oynayınca tamamen kalkar, yazılarda okunurluk için gölge kalır |
| `dojo.html`, `kanji.html`, `yazma.html`, `sozluk.html`, `alanlar.html`, `ayarlar.html`, `istatistik.html`, `kelime.html`, `dinleme.html`, `cumle.html`, `birlestirme.html`, `video.html` | Üst menü ve kartlar hafif saydam + blur; video kenarlardan görünür |
| `oyun.html` (ders ekranı) | Video DA yüklenir; ders kartı saydam olduğu için arka plan görünür kalır |

### Sıkıştırma (kaynak 1080p'yi küçültme)

Kaliteli bir 1080p videoyu siteye olduğu gibi koyma; telefonda yavaş açılır.
Hedef 2–5 MB. FFmpeg ile (H.264 — tarayıcıların donanımla çözdüğü tek format):

    ffmpeg -i kaynak.mp4 -c:v libx264 -profile:v high -pix_fmt yuv420p ^
           -crf 32 -preset slow -an -movflags +faststart ^
           videolar/yatay/arkaplan.mp4

> **Boyut hedefi 2–5 MB.** Kaynak 40–50 MB civarıysa `-crf 32` + `-preset slow`
> genelde 3–6 MB verir. Hâlâ büyükse `-crf 34` deneyin; kalite kaybı arka
> planda fark edilmez. Yatay ve dikey için komutu iki kez çalıştırın.
>
> **Mevcut WebM'i MP4'e çevirmek (yeniden kalite kaybı istemiyorsan):**
> Elindeki `arkaplan.webm`'i doğrudan MP4'e sarmalayabilirsin:
>
>     ffmpeg -i arkaplan.webm -c:v libx264 -profile:v high -pix_fmt yuv420p ^
>            -crf 30 -preset slow -an -movflags +faststart ^
>            videolar/yatay/arkaplan.mp4
>
> VP9 → H.264 dönüşümü her zaman yeniden kodlar; `-crf 30` iyi denge.
> WebM'i silmek zorunda değilsin ama MP4 varsa site MP4'ü kullanır.

**`-an`** = sesi sil (gerekmiyor). **`+faststart`** = meta veriyi dosyanın
başına taşır; video anında oynamaya başlar. Codec'i `libx264` + `yuv420p`
bırak; HEVC/H.265 veya 10-bit yüklemezsen bazı tarayıcılar açmaz.

İlk kareyi poster olarak çıkarmak için:

    ffmpeg -i videolar/yatay/arkaplan.mp4 -vframes 1 -q:v 4 videolar/yatay/kapak.jpg

## Nasıl çalışıyor

- Masaüstünde **yatay**, telefonda **dikey** video seçilir (ekran yönüne göre).
- Her ikisi için önce `arkaplan.mp4`, o yoksa `arkaplan.webm` denenir.
- Telefon döndürülünce video kaynağı otomatik değişir.
- Sekme arka plana atılınca video **durur** (pil ve veri tasarrufu).
- "Hareketi azalt" sistemi açıksa video oynamaz, sadece ilk kare görünür.
- Mobil veri tasarrufu (`saveData`) açıksa video hiç indirilmez.
- Video varsa **WebGL sahnesi otomatik kapanır** (iki hareketli katman
  üst üste binmesin diye). Video yoksa WebGL sahnesi görünür kalır.

Yani: dosya koyarsan video çıkar, koymazsan WebGL sahnesi çıkar. İkisi
birden asla aynı anda görünmez.

## Kapatmak istersen

Ayarlar sayından **3D arka plan** anahtarı ikisini birden kapatır.
Yalnızca videoyu kapatmak istersen tarayıcı konsoluna şunu yaz:

    localStorage.setItem('sakar_video_arkaplan', '0')

Geri açmak için:

    localStorage.removeItem('sakar_video_arkaplan')
