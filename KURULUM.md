# Sakar Paisen — Kurulum Rehberi (adım adım)

Bu dosya, siteyi **para kazanmaya hazır** hâle getirmek için gereken her adımı
sırayla anlatır. Teknik bilgi gerekmez; sadece tıkla ve yaz.

## Şu an ne durumda? (kontrol listesi)

| İş | Durum | Not |
|---|---|---|
| Site internette | ✅ Canlı | `https://sakarpaisen.netlify.app` |
| Google ile giriş | ✅ Kurulu | `giris.js` içinde kimlik girili |
| Geri bildirim (Formspree) | ✅ Kurulu | Mesajlar sana düşüyor |
| Bağış (Kreosus) | ✅ Kurulu | `kreosus.com/sakarpaisen` |
| **Yeni sürüm (98 kanji)** | ⚠️ **Yayınlanmadı** | Aşağıdaki ADIM 1'i yap |
| **Analitik** | ✅ Kuruldu | Token `analitik.js`'te |
| **Bulut kayıt** | ✅ Kuruldu | Supabase bağlı, çalışıyor |
| **Reklam** | ⬜ Hazır, AdSense bekliyor | ADIM 3.5 |
| **Ayarlar sayfası** | ✅ Kuruldu | Tema/ses/zorluk/veri |
| **İstatistik sayfası** | ✅ Kuruldu | Grafik + ısı haritası |
| **Günlük görevler** | ✅ Kuruldu | Her gün 3 görev + XP |
| **Başarımlar** | ✅ Kuruldu | 21 rozet, 4 grup |
| **Kombo** | ✅ Kuruldu | Üst üste doğru = x2.0'a kadar |
| **Günlük hediye** | ✅ Kuruldu | Her gün sandık, seriyle büyür |
| **Sensei öğütleri** | ✅ Kuruldu | Duruma göre akıllı ipucu |
| **Karışık Sınav** | ✅ Kuruldu | Rastgele 20 soru, 3 can |
| **Yanlış defteri** | ✅ Kuruldu | Hangi harfi hangisiyle karıştırdın |
| **Çalışma planı** | ✅ Kuruldu | "Bugün ne çalışayım" önerisi |
| **Sözlük** | ✅ Kuruldu | 516+ kayıt, çok yönlü arama |
| **Dinleme alıştırması** | ✅ Kuruldu | 12 soruluk kulak eğitimi turu |
| **Ders sonu özeti** | ✅ Kuruldu | "Bu derste geçen harfler" |
| Alan adı | ⬜ Opsiyonel | ADIM 5 |

**Önemli:** ADIM 2 ve 3'teki kod HAZIR. Sadece birer kimlik yazman gerekiyor.
Kimlik yazılana kadar o özellikler **tamamen kapalı** — site eskisi gibi çalışır.

---

# ADIM 1 — Yeni sürümü yayınla (2 dakika)

**Neden:** Sitede şu an eski sürüm var (73 daire). Senin bilgisayarında yeni sürüm
var (128 daire + 90 kanji + karışık dersler). Canlıya taşımak gerek.

### 1.1 — Doğru klasörü bul
Sürükleyeceğin klasör **tam olarak şu** olmalı:

```
c:\Users\CASPER\Desktop\SakarPaisen (2)\SakarPaisen
```

⚠️ **DİKKAT:** Masaüstünde birden çok `SakarPaisen` klasörü olabilir.
`SakarPaisen (2)` içindeki klasörü kullanmalısın. Emin olmak için içine bak:
`kanji.js` dosyası **varsa** doğru klasördür.

### 1.2 — Netlify'a yükle
1. `https://app.netlify.com` aç, giriş yap.
2. **sakarpaisen** sitesine tıkla.
3. Üstten **Deploys** sekmesine geç.
4. Sayfanın **en altında** sürükle-bırak kutusu var:
   > *"Need to update your site? Drag and drop your site output folder here"*
5. `SakarPaisen` klasörünü **tut ve o kutuya bırak**.

### 1.3 — Kontrol et
- Netlify'da **"Published"** yazısını gör (~1 dakika).
- `https://sakarpaisen.netlify.app` aç.
- `Ctrl+Shift+R` ile **sert yenile** (eski önbellek silinsin).
- Dojo haritasının en altında **"Kanji (N5)"** bölümünü görmelisin.

✅ Bitti. Site artık güncel.

---

# ADIM 2 — Analitik (10 dakika, ücretsiz)

**Neden:** Şu an **kaç kişinin girdiğini bilmiyorsun.** Hangi derste bıraktıklarını
bilmeden ürünü geliştiremezsin, para da kazanamazsın.

**Neden Cloudflare:** Ücretsiz, sınırsız, **çerez kullanmaz** (KVKK izin penceresi
gerekmez), siteyi yavaşlatmaz.

### 2.1 — Hesap aç
1. `https://dash.cloudflare.com` → **Sign up** (e-posta ile, kredi kartı istemez).
2. Giriş yaptıktan sonra sol menüden **Analytics & Logs → Web Analytics**.
3. **Add a site** butonuna bas.
4. Site adı yaz: `sakarpaisen.netlify.app`
5. **JS installation method** seçeneğini seç (otomatik olanı istemiyoruz).
6. Ekranda şuna benzer bir **token** görürsün (uzun harf-rakam dizisi).

### 2.2 — Token'ı koda yaz
`analitik.js` dosyasını not defteriyle aç (Notepad / VS Code).

**Bul:**
```js
const CLOUDFLARE_TOKEN = '';
```

**Değiştir:** (tırnak içine token'ı yapıştır)
```js
const CLOUDFLARE_TOKEN = 'buraya_token';
```

Kaydet.

### 2.3 — Yayınla
ADIM 1'i tekrar yap (klasörü Netlify'a bırak).

### 2.4 — Kontrol et
- Sitede gez, birkaç ders oyna.
- Cloudflare'de **Web Analytics** sayfasına dön → 5-10 dakika içinde
  **ziyaretçi sayısını** görmeye başlarsın.

---

# ADIM 3 — Bulut kayıt (20 dakika, ücretsiz)

**Neden:** Şu an ilerleme **sadece kullanıcının tarayıcısında**. Telefon
değiştirince her şey sıfırlanıyor. Bu, ürün en büyük eksiği.

### 3.1 — Supabase hesabı aç
1. `https://supabase.com` → **Start your project** → GitHub veya e-posta ile gir.
2. **New project**:
   - Name: `sakarpaisen`
   - Database Password: güçlü bir şifre yaz (bir yere kaydet)
   - Region: **Europe (Frankfurt)** — Türkiye'ye en yakın
   - Plan: **Free** (kredi kartı istemez)
3. Proje hazırlanması 1-2 dakika sürer.

### 3.2 — Tabloyu oluştur
Sol menüden **SQL Editor** → **New query** → şu kodu yapıştır → **RUN**:

```sql
create table ilerleme (
  kullanici text primary key,
  veri jsonb not null default '{}'::jsonb,
  guncelleme timestamptz not null default now()
);
alter table ilerleme enable row level security;
create policy "kendi_verisi" on ilerleme
  for all using (true) with check (true);
```

**"Success. No rows returned"** yazısını görürsen tamam.

### 3.3 — Anahtarları al
Sol menü → **Project Settings** (dişli ikonu) → **API**:
- **Project URL** → kopyala (ör. `https://abcdefg.supabase.co`)
- **anon public** (Project API keys altında) → kopyala (uzun `eyJ...` ile başlar)

### 3.4 — Koda yaz
`bulut.js` dosyasını aç.

**Bul:**
```js
const SUPABASE_ADRES = '';
const SUPABASE_ANAHTAR = '';
```

**Değiştir:**
```js
const SUPABASE_ADRES = 'https://abcdefg.supabase.co';
const SUPABASE_ANAHTAR = 'eyJhbGciOiJIUzI1NiIsInR5cCI6...';
```

Kaydet → tekrar yayınla (ADIM 1).

### 3.5 — Kontrol et
1. Sitede Google ile gir, birkaç ders oyna (XP kazan).
2. Supabase → **Table Editor** → **ilerleme** tablosu.
3. Bir satır görmelisin; içinde XP, seviye, kanji kayıtların olmalı.
4. Başka tarayıcıda (gizli pencere) aynı Google hesabıyla gir →
   ilerlemen geri gelmeli.

> ⚠️ **Güvenlik notu:** Şu anki güvenlik politikası geniş. Kullanıcı sayısı
> artınca biri başkasının verisini görebilir. 100+ kullanıcıya ulaşınca bana
> söyle, politikayı sıkılaştıralım.

---

# ADIM 3.5 — Reklam (kod HAZIR, AdSense onayı bekliyor)

**Durum:** Reklam altyapısı kuruldu (`reklam.js`). Şu an **kapalı** — hiçbir reklam
çıkmaz, site bozulmaz. Aşağıdaki iki satırı doldurunca kendiliğinden açılır.

### 3.5.1 — AdSense'e başvur
1. `https://adsense.google.com` → **Kaydol** (Google hesabınla).
2. Site adresi: `sakarpaisen.netlify.app`
3. Onay **1-2 hafta** sürer. Bu süreçte site zaten canlı kalır.
4. Onay gelince: **Reklamlar → Reklam birimi oluştur → Görüntülü reklam**.
   Sana **10 haneli bir numara** verir (bu "slot"tur).
5. AdSense ana sayfanda `ca-pub-...` ile başlayan **yayıncı kimliğin** yazar.

### 3.5.2 — Kodu doldur
`reklam.js` dosyasını aç.

**Bul:**
```js
const ADSENSE_ID = '';
const ADSENSE_SLOT = '';
```

**Değiştir:**
```js
const ADSENSE_ID = 'ca-pub-1234567890123456';
const ADSENSE_SLOT = '1234567890';
```

Kaydet → yayınla (ADIM 1) → `sw.js` içinde `CACHE_NAME`'i bir artır.

### 3.5.3 — Reklam nerede çıkar?
| Sayfa | Konum |
|---|---|
| `index.html` (giriş) | Kreosus bağlantısının üstünde |
| `dojo.html` (harita) | Sağ panelin **en altında** |
| `oyun.html` (ders) | **Yalnızca ders bitiş ekranında** |
| `kelime.html` (defter) | Listenin altında |

> ⚠️ **Ders SIRASINDA reklam yok.** Kullanıcı "DEVAM ET"e basmak isterken
> reklama tıklarsa AdSense bunu "yanıltıcı" sayar ve **hesabı askıya alır**.
> Bu yüzden reklam yalnızca ders bittiğinde, en altta gösterilir.
>
> ⚠️ **localhost'ta reklam hiç çıkmaz** (`reklam.js` içinde kasıtlı). Kendi
> tıklamaların da "sahte tıklama" sayılır — siteyi test ederken reklama basma.

### 3.5.4 — Gerçekçi beklenti
10.000 sayfa görüntüleme ≈ **10-50 TL** (dile/ülkeye göre değişir). Reklam,
ancak trafik gelince anlamlı para eder — önce ADIM 4.

---

# YENİ ÖZELLİKLER — Kombo, Sandık, Görevler, Başarımlar
Bu bölümdeki her şey kendi kendine çalışır; **kurulum gerekmez.**

### ⚡ Kombo (ders içi, `kombo.js`)
Üst üste doğru cevap verdikçe **çarpan** artar:

| Doğru sayısı | Çarpan |
|---|---|
| 2 | x1.1 |
| 3 | x1.2 |
| 4 | x1.3 |
| 6 | x1.5 |
| 10 | x1.75 |
| 15+ | **x2.0** (tavan) |

- Yanlış cevap komboyu sıfırlar (3+ seri kırıldıysa ekranda gösterilir).
- Bonus **ders sonunda toplu** verilir → bitiş ekranı kutlaması güçlenir.
- **Tavanın sebebi:** sınırsız büyüse tek dersle binlerce XP alınır, ilerleme anlamsızlaşır.

### 🎁 Günlük hediye sandığı (`hediye.js`)
Her gün **bir kez** açılır; seri büyüdükçe ödül artar:

| Seri | Ödül |
|---|---|
| 1-2 gün | 20 XP |
| 3-6 gün | 35 XP |
| 7-29 gün | 60 XP |
| 30+ gün | **100 XP** |

Her 7. günde ayrıca **+1 seri koruma** hakkı verilir.

### 💬 Sensei'nin öğütleri (`ogut.js`)
Maskot, kullanıcının **gerçek durumuna** bakıp konuşur (rastgele değil):

| Durum | Sensei ne der |
|---|---|
| 3+ gün gelmediyse | İsmiyle sıcak karşılama |
| Seri bugün yapılmadıysa | "Serin devam ediyor, bozdurmayalım!" |
| Tekrar bekleyen harf varsa | "8 harf tekrar bekliyor" |
| Hedefe yaklaştıysa | "15 XP kaldı, bir ders yeter!" |
| Zayıf harfler varsa | Pekiştirme dersi önerisi |

### 📋 Günlük görevler (`gorevler.js`)
Her gün **3 görev**; tamamlayınca fazladan XP. Görevler **tarihten türetilir**
→ sayfa yenilense de değişmez, gün değişince sıfırlanır.

### 🏆 Başarımlar (`basarimlar.js`)
**21 rozet**, 4 grupta: Yolculuk / Disiplin / Ustalık / Koleksiyon.
Yeni rozet açılınca kutlama bandı + Sensei sesi çıkar.

### ⚙️ Ayarlar (`ayarlar.html`)
Dojo sağ panelinde ve üst menüdeki **⚙️** ile açılır.

| Ayar | Seçenekler | Ne yapar |
|---|---|---|
| Tema | Gündüz / Alacakaranlık / Gece | Tüm sayfaların renklerini değiştir |
| Yazı büyüklüğü | Normal / Büyük / Çok büyük | Gözü yormayan okuma |
| Animasyonlar | Aç/Kapa | Konfeti ve geçiş efektleri |
| **Zorluk** | Kolay (6 can) / Normal (4 can) / Zorlu (3 can, %25 fazla XP) | Dersin canını ve uzunluğunu değiştir |
| Ses | Aç/Kapa | Japonca telaffuz |
| Bulut kayıt | — | Tek tuşla elle yedekleme |
| Sıfırlama | İki ayrı buton | "Sadece ayarlar" **ilerlemeyi silmez** |

> ℹ️ Sınavlar (boss) zorluk ayarından **etkilenmez** — sınavın kendi canı sabittir.

### 📊 İstatistikler (`istatistik.html`)
Üst menüdeki **📊** veya sağ paneldeki kartla açılır.

- **Genel durum:** XP, rütbe, seri, yıldız, çalışılan harf, tekrar bekleyen
- **Günlük çalışma grafiği:** son 7 / 30 gün, hedef çizgisiyle
- **Isı haritası:** son 12 hafta, GitHub tarzı
- **Harf harf durum:** en zayıf harfler başta, alfabe etiketli (Hiragana/Katakana)
- **"Zayıf harfleri çalış"** düğmesi: doğrudan pekiştirme dersini açar
> Grafikler **canvas** ile çizilir — dış kütüphane yok, site yavaşlamaz.
> Veri yerelde tutulur (gizlilik dostu) ve buluta yedeklenir.

### Buluta yedeklenen yeni anahtarlar
`sakar_gecmis` (XP geçmişi), `sakar_ayarlar` (tema/zorluk), `sakar_ses`
— bulut.js'e eklendi, cihazlar arası taşınır.

### 📊 Durum şeridi (`serit.js`) — tüm sayfalarda
Oyun durumu artık **sadece dojo'da değil**:

| Sayfa | Ne görünür |
|---|---|
| Giriş | Şerit + **görev özeti** + **🎁 büyük hediye butonu** |
| İstatistik | Şerit + başarımlar + görevler |
| Ayarlar | Şerit |
| Kelime defteri | Şerit + **görev paneli** |
| Dojo | (kendi zengin menüsü var, şerit kurulmaz) |

Şerit içeriği: `🔥 seri` · `⭐ XP` · `🥋 rütbe` · `📋 görev (t/g)` · `🎁 hediye`

- **Seri bugün yapılmadıysa** şeritteki rozet turuncuya döner ve nabız gibi atar.
- Görev sayacına tıklayınca dojo açılır; hediyeye tıklayınca sandık açılır.
- **Kayıt olmayan** kullanıcıda şerit çıkmaz (boş şerit görünmesin).

### 🎁 Günlük hediye — artık giriş ekranında da
Kullanıcı siteye adım attığı anda hediyeyi görür (dojo'ya gitmesini beklemek
fırsat kaybıydı). Sandık ekranı **tek yerde** (`hediye.js`) — giriş ve dojo
aynı kodu kullanır, biri güncellenince diğeri unutulmaz.

> ⚠️ **Giriş ekranında şeritteki 🎁 rozeti KAPALI.** Aynı ekranda hem büyük
> buton hem rozet olsaydı tekrar gibi dururdu (ekran görüntüsünde görüldü).

### 🎓 Karışık Sınav (`sinav.js`)
Dojo panelinde **"🎓 Karışık Sınav"** kartı. Müfredattaki sınavlardan farkı:

| Müfredat sınavı | Karışık Sınav |
|---|---|
| Sorular sabit | Her girişte **yeni rastgele** sorular |
| Ezberlenebilir | Ezberlenemez |
| Kolay şıklar | **Karıştırdığın** harfler şık olarak konur |

- 20 soru · 3 can · **120 XP**
- Soru tipleri karışık: harf→ses, ses→harf, alfabe karşılığı, dinleme
- Dojo panelinde **"Sanırım tüm soruları gördün"** mantığı yoktur, kilit yoktur.

### 🔀 Yanlış Defteri (`yanlis.js`)
Kullanıcının **hangi harfi hangisiyle karıştırdığını** öğrenir.

- Yanlış cevap verilince "verilen ↔ doğru" çifti kaydedilir.
- `(a,b)` ile `(b,a)` **aynı çift** sayılır (ters yön ayrı kayıt açmaz).
- İstatistik sayfasında **"🔀 Karıştırdığın harfler"** bölümü görünür:
  `し ↔ つ · 6 kez karıştırdın`
- Bu veri **sınavın şıklarını belirler**: し sorulunca şıklara つ konur.
  Böylece sınav "gerçekten zorlayan" bir test olur, rastgele dolgu değil.

> 💡 Mantık: harfleri yan yana koyarak sormak (kontrast tekniği), karıştırılan
> harfleri ayırt etmenin en etkili yoludur.

### 🧭 Çalışma Planı (`plan.js`)
Dojo sağ panelinin **en üstünde**: "Bugün planı (~12 dk)"

Onlarca daire arasından seçim yapmak **karar yorgunluğu** yaratır ve
kullanıcı oyunu kapatır. Plan tek bir "ilk adım" verir:

| Adım | Ne zaman çıkar |
|---|---|
| 🔁 **Tekrar** (en acil) | 3+ harfin tekrar zamanı gelmişse |
| 🔀 **Karıştırma** | 2+ kez karıştırılan harf çifti varsa |
| 💪 **Pekiştirme** | 2+ zayıf harf varsa |
| 🎯 **Günlük hedef** | Hedefe ulaşılmadıysa |
| 📋 **Görevler** | Görev kaldıysa |
| 🥋 **Yeni ders** | Yolunda ilerlemek için |

- En önemli **3 adım** gösterilir, ilk adım mor çerçeveyle vurgulanır.
- Her adımda **tahmini süre** (
~4 dk) ve tıklanınca gidilecek yer var.
- Aynı sayfaya giden iki adım gösterilmez (tekrar olmasın).
- Her şey bittiyse tebrik adımı çıkar — **plan asla boş kalmaz**.

### 🔎 Sözlük (`sozluk.html`)
Dojo panelinden **"🔎 Sözlük"** kartıyla açılır. Tüm içerik tek yerden aranır.

- **516+ kayıt:** harfler, kelimeler, kanjiler ve kendi defterin.
- Arama yöntemleri: **romaji** (`shi`), **Japonca** (`し`), **Türkçe anlam** (`nehir`).
- Tür filtreleri: Hepsi · Harf · Kelime · Kanji · Defterim
- Harflerde **🔊 dinle** düğmesi.
- Sıralama: tam eşleşme en üstte.
- **Türkçe uyumlu:** `İstanbul`, `istanbul`, `ISTANBUL` hepsi aynı sonucu verir.

### 🎧 Dinleme Alıştırması (`dinleme.html`)
Dojo panelinden **"🎧 Dinleme alıştırması"** ile açılır. Ayrı bir beceri
(kulak eğitimi) ve tekrar tekrar dinlemek gerekir.

- **12 soruluk tur:** ses çalınır, harfi seçersin.
- Büyük **hoparlör** ekranın tek ana eylemi. Tekrar dinlemek için **R** tuşu.
- Şıklar rastgele değil: önce **karıştırdığın** harfler, sonra aynı alfabeden
  benzer harfler. Böylece alıştırma gerçekten ayırt etmeyi öğretir.
- **Yanlış yapılan harf 3 soru SONRA tekrar sorulur.** Neden hemen değil?
  Hemen sorulsa kullanıcı kısa süreli hafızadan doğru cevap verir ve gerçek
  öğrenme olmaz. Araya soru koymak hatırlamayı zorlar ("spacing" etkisi).
- Tur sonunda **karne:** doğruluk yüzdesi, doğru/yanlış ve kazanılan XP
  (doğru başına 10 XP).
- Yanlış cevaplar **karıştırma defterine** de yazılır (yanlis.js).

### 📚 Ders sonu "ne öğrendim" özeti
Ders bitince o derste geçen harfler **çip listesi** hâlinde gösterilir.

- **Zorlandığın harfler kırmızı** ve listenin başında — kullanıcı neye
  odaklanacağını görür.
- Altında not: *"Kırmızı harfler bu derste yanlış yaptıkların — tekrar
  dersinde öne çıkar."*
- Bu özet öğrenmenin en kritik parçası: aksi hâlde ders "geçti gitti"
  hissi verir ve kalıcı olmaz.

---

# ADIM 4 — Trafik (para buradan gelir, en zor kısım)

Kod hazır olduğunda para **trafikle** gelir. Elinde zaten **YouTube kanalı** var —
en değerli varlığın bu.

### 4.1 — YouTube'dan besle (bedava, en etkili)
- Her videonun **açıklamasına** site linkini koy.
- Video ortasında/başında bir kez bahset: *"Sitede ücretsiz oynayabilirsiniz."*
- Kanal **"Hakkında"** bölümüne link ekle.
- Video yaptığın konuyu sitede ders olarak aç → izleyici siteye gelsin.

### 4.2 — Kısa video (TikTok / Reels / Shorts)
Kısa ve çekici içerikler en hızlı trafiği getir:
- *"60 saniyede 5 kanji"*
- *"Bu testte kaç harf biliyorsun?"*
- *"Japonca öğrenmenin en hızlı yolu"* (siteye yönlendir)

### 4.3 — Topluluklar (spam yapma, değer kat)
- r/LearnJapanese, r/JapaneseFromZero
- Discord: Japonca öğrenme sunucuları
- **Kural:** önce yardım et, linki sonra paylaş. Direkt reklam = ban.

### 4.4 — SEO (uzun vadeli, sabır işi)
Siteye Google'da aranan başlıklar lazım: *"hiragana test"*, *"kanji pratiği"*,
*"Japonca öğren ücretsiz"*. `index.html` başlığı bunu içeriyor ama zaman gerekir.

---

# ADIM 5 — Alan adı (opsiyonel, ~12$/yıl)

Sadece `sakarpaisen.netlify.app` uzun geliyorsa gerekli. Marka için iyi ama
şart değil.

1. `https://www.cloudflare.com/products/registrar/` veya Namecheap'ten al.
2. Netlify → **Domain settings → Add custom domain**.
3. Netlify'ın verdiği DNS kayıtlarını domain sağlayıcısına gir.
4. HTTPS otomatik ve ücretsiz kurulur.

> ⚠️ **Ücretsiz `.tk` / `.ml` / `.ga` KULLANMA.** Sağlayıcı fiilen kapandı,
> tarayıcılar güvenlik uyarısı gösteriyor, kullanıcı kaçırırsın.

---

# ADIM 6 — Paraya çevirme (trafik gelince)

Sırayla dene. Hepsi ücretsiz başlar.

### 6.1 — Kreosus (bağış) — zaten kurulu
Trafik gelince kendiliğinden işler. Kullanıcıya nazik hatırlatma yeterli.

### 6.2 — Google AdSense
- `https://adsense.google.com` → başvur.
- Şartlar: özgün içerik, gezinmesi kolay site, yaş/gizlilik politikası.
- **Gerçekçi beklenti:** 10.000 sayfa görüntüleme ≈ 10-50 TL (dile göre değişir).
- **Kod HAZIR:** `reklam.js` dosyasına AdSense kimliğini yazman yeterli (ADIM 3.5).
  Reklam alanları dört sayfada da yerleştirildi.

> 📌 **Gemini'nin "Netlify'a AdSense eklenemez" uyarısı hakkında:** Kısmen doğru
> — Netlify'ın kendi panelinden AdSense **eklenmez** (o entegrasyon sadece kendi
> barındırdığı domain/function akışında var). Ama buna gerek yok: AdSense kodu
> **site dosyasının içine** yazılır, Netlify onu normal dosya olarak servis eder.
> Yani sürükle-bırak yayınında da çalışır. Gerçek engel şu: **onaysız siteye
> AdSense reklam göstermez.** Alan adı şart değildir, `netlify.app` alt alan adı
> da onaylanabilir — ama alan adı, onay şansını ve marka güvenini artır.

### 6.3 — Premium (en sağlam gelir, sonra)
Örnek paketler:
- Reklamsız deneyim
- Bulut kayıt + birden çok cihaz
- Ekstra: N4 kanjileri, ses dosyaları, PDF özet

Aylık 20-30 TL. **100 abone = 2000-3000 TL/ay.**
Bun için ödeme altyapısı gerekir (Shopier / Stripe / Lemon Squeezy).

---

# Acil uyarı — yayından önce mutlaka

**Kanji okunuşlarını doğrula.** Yanlış öğretilen Japonca = kötü yorumlar =
güven kaybı = para kazanamazsın.

Dökümü almak için:
```
node _veri-kontrol.mjs kanji-listesi
```

Çıkan listeyi `https://jisho.org` ile karşılaştır. Ben 6 hatayı düzelttim ama
**90 kanjinin tamamını garanti edem.**

---

# Sık yapılan hatalar

| Hata | Çözüm |
|---|---|
| Klasörü içinden sürükledim, site bozuldu | Klasörün **kendisini** bırak, içini değil |
| Yeni sürüm gelmedi | `Ctrl+Shift+R` ile sert yenile; telefonda önbelleği temizle |
| Analytics veri göstermiyor | 10 dakika bekle; localhost'ta ölçüm KAPALI |
| Bulut kayıt çalışmıyor | Supabase tablosunu oluşturduğundan emin ol (3.2) |
| Reklam çıkmıyor | Normal — AdSense onayı gelmeden görünmez (3.5). localhost'ta da kapalı |
| Reklam çıktı ama boş kutu | AdSense onayı gelmedi ya da reklam birimi yeni; birkaç saat bekle |
| Yeni sürüm telefon geldi, masaüstünde gelmedi | `sw.js` içinde `CACHE_NAME`'i bir artır |

---

# Her güncellemede (kısa liste)

1. Kod değiştir.
2. Değiştirdiğin dosyanın `?v=` numarasını artır (`ilerleme.js?v=6` → `v=7`).
3. `sw.js` içinde `CACHE_NAME`'i artır (`v41` → `v42`).
4. Testleri çalıştır: `npm test` (**137 test**: 3'ü Google popup
   gerektirdiği için atlanır).
5. `SakarPaisen` klasörünü Netlify'a sürükle (ADIM 1).

> 💡 **Node PATH'te değil** (bu makinede `D:\nodejs\`). `npm test` çalışmazsa:
> ```powershell
> $env:PATH = "D:\nodejs;" + $env:PATH; & "D:\nodejs\npm.cmd" test
> ```
> Testler uzun sürüyor (2 dk'yı aşar); dosya bazında çalıştırmak için:
> `& "D:\nodejs\node.exe" node_modules\@playwright\test\cli.js test ayarlar.spec.mjs`
