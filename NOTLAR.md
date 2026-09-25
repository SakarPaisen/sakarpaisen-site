# Sakar Paisen – notlar

## Çalıştırma
Çift tıklayıp açınca site çalışır ama **offline/PWA özellikleri sadece http(s) üzerinde** çalışır:

    cd SakarPaisen
    python3 -m http.server 8000     # sonra tarayıcıda http://localhost:8000

Yayınlamak için GitHub Pages / Netlify / Cloudflare Pages gibi herhangi bir statik hosting yeterli.

## Tasarım (Duolingo referansı)
Arayüz açık tema (krem zemin, mor vurgu) ve Duolingo'nun öğrenme akışını izler:

| Dosya | Ne yapar |
|---|---|
| `uygulama.css` | Ortak tema: renkler, butonlar, kartlar, ilerleme çubukları |
| `dojo.css` | Dojo haritasının kendine özel stilleri (ders yolu, önizleme paneli) |
| `dojo-yol.js` | Haritayı çizen motor: zikzak ders yolu, bölüm renkleri, aktif ders balonu |

- Dersler sırayla açılır; kalanına tıklayınca önizleme panelinde kilitli olduğu yazar.
- Aktif ders büyük ve nabız atar, üstünde "BAŞLA" balonu çıkar; tamamlananlar yeşil ✓ + ⭐ olur.
- Her daireye tıklayınca önizleme paneli açılır: içerik özeti, XP, can ve yıldız bilgisi.
- Derste cevap sonrası alt bar yeşil/kırmızı dolan ve sensei kısa bir övgü yazar (Duolingo'daki gibi).
- Harita kilidi şu an **kapalı** (`SERBEST_MOD = true`): tüm dersler denenebilir.
  Sırayla kilit istersen `dojo.html` **ve** `app.js` içindeki `SERBEST_MOD`'u `false` yap.

## Yeni harf türü eklemek (dakuten / youon)
1. `kana.js` içindeki `KANA_TUREV` dizisine `[romaji, hiragana, katakana, tür]` ekle.
2. `KANA_TUREV_TEMEL`e temel harfini yaz (ipuçları ve anımsatıcı için).
3. `KANA_GRUPLAR`a grubu ekle, sonra `mufredat.js`'te `grup: 'g:ga'` gibi daire aç.

## Müfredat (100 daire, 10 bölüm)
Duolingo mantığı, ama daha hızlı öğretir:

| # | Bölüm | Ne öğretir |
|---|---|---|
| 1 | Hiragana Temel | 46 harf, satır satır (her daire 5 harf) + 2 ara test + sınav |
| 2 | Hiragana Türevleri | dakuten (が/ざ/だ/ば), handakuten (ぱ), youon (きゃ...) |
| 3 | Katakana Temel | Aynı düzen, Katakana ile |
| 4 | Katakana Türevleri | Katakana dakuten + youon |
| 5 | İki Alfabe | Hiragana ↔ Katakana eşleştirme (kalıcı öğrenme için) |
| 6 | Okuma Pratiği | 14 kelime dersi (renk, vücut, doğa, fiil, sıfat...) + cümle + dikte |
| 7 | Pekiştirme ve Ustalık | Zayıf harfler, hız turu, ustalık sınavları |
| 8 | İleri Okuma | Uzun cümleler, dinleme, karma okuma |
| **9** | **Kanji (N5)** | **70 kanji: sayılar, günler, insan, doğa, yön, okul, yemek, miktar, eylem** |
| 10 | Final | Her şey karışık |

**ÖNEMLİ — id'ler sırayla ve BENZERSİZ olmalı.** İlerleme "kaçıncı dairedeyim"
olarak (`sakar_seviye`) saklanır. Eskiden `id:63` ve `id:64` ikişer kez tanımlıydı;
bu yüzden haritada daire sayısı ile müfredat uyuşmuyor ve ilerleme kayıyordu.
Araya daire eklersen sonrakilerin id'lerini kaydırmayı unutma.

**Hızlı öğretim kuralları:** her satırdan sonra hemen sınama, 5 dairede bir ara test
(~%30'u zayıf harflerden), bölüm sonu sınavlar 5-6 can ve 2-4 kat XP.

## Dosyalar
| Dosya | Ne yapar |
|---|---|
| `giris.js` | `index.html`'in giriş ekranı: Google ile giriş, test modu, kayıt (localStorage) |
| `mufredat.js` | Haritadaki tüm daireler (Hiragana, Katakana, Büyük Sınav, ...) |
| `app.js` | Ana oyun motoru (oyun.html'in motoru). Soruları çizer, puanı ve ilerleme çubuğunu yönetir |
| `questions.js` | Elle yazılan sorular/dersler (saf veri, `window.SORULAR`). Yeni soru eklemek için buraya yaz |
| `reading.js` | Okuma/kelime/cümle verisi + soru üretici (`window.READING`). Sözlük (kelimeler) ve cümleler burada |
| `kana.js` | Harf verisi (Hiragana + Katakana) ve ders/test/tekrar üretici |
| `kanji.js` | Kanji verisi (90 N5 kanjisi) + öğretim ve **karışık** ders üreticisi + kanji ilerleme takibi (`window.KANJI`) |
| `kanji-cumle.js` | Kanji ile yazılmış cümleler (karışık derslerin cümle havuzu) (`window.KANJI_CUMLELER`) |
| `ilerleme.js` | XP, seri, rütbe, yıldız, harf takibi, aralıklı tekrar (localStorage) |
| `ses.js` | Efekt sesleri (`audio/`), Japonca okuma, sessize alma |
| `pwa.js`, `sw.js`, `manifest.json` | Kurulabilir uygulama + offline |
| `netlify.toml`, `.netlifyignore` | Yayın ayarları (önbellek, güvenlik başlıkları) |
| `YAYIN.md` | Netlify'a yayınlama + Formspree bağlama adımları |
| `ses-uret/` | Gemini TTS (Sulafat) ile harf ve sensei seslerini üreten script + ortak Scene/Context ayarı |
| `dersler/dersNN.js` | Elle yazılan dersler (NN = mufredat id'si, iki haneli). Dosyalar `dersler/` klasöründe olmalı |
| `dersler/taslak/` | Eski elle yazılmış dersler (sayı, saat, gün, selamlaşma). Otomatik yüklenmez, kelimeler bölümü için hazır bekliyor |

## Yeni ders eklemek
1. `mufredat.js`'e yeni daire ekle (id'ler sırayla gitmeli).
2. Harf dersi değilse `dersler/dersNN.js` yaz; dosya adındaki NN = daire id'si (ör. id 33 -> `dersler/ders33.js`).
   Dosya `registerDers(id, {...})` çağır; motor bunu o daireye basılınca yükler.
3. Yeni resim/dosya eklersen `sw.js`'te `CACHE_NAME`'i arttır.

## Kanji bölümü (kanji.js + kanji-cumle.js)
Kanji, alfabeler ve okuma oturduktan SONRA gelir (Bölüm 9). Sebep: Hiragana/Katakana
**sesi** gösterir, kanji ise **anlamı** taşır; bir kanjinin birden çok okunuşu olur
(kun'yomi = Japonca okunuş, on'yomi = Çince kökenli). Üç sistemi birden yüklememek için
kanji en sona kondu.

### Öğretim ritmi: "1 öğret + 3 karışık"
Öğret-sor-öğret-sor döngüsü kanjiyi ezbere iter ve öğrenciyi yorar. Bunun yerine:

    84  ÖĞRET (yeni kanjiler)  85-87  KARIŞIK  88  ÖĞRET  89-91  KARIŞIK ...

- **Öğretim dersi** (`tip:'kanji'`): kart + anlam + okunuş + ters yön (her kanji 4 adım).
- **Karışık ders** (`tip:'karisik'`): cümle/kelime çevirisi ağırlıklı; öğrenilmiş
  kanjiler **ağırlıklı rastgele serpişir** (~%35). "Her adımda kanji" DEĞİL —
  dağıtılmış gelir, ders blok blok kanji sorusu olmaz.

### Serpiştirme nasıl çalışır (kanji.js)
1. Cümle adımları ve kanji adımları **ayrı ayrı** üretilir.
2. `serpistir()` bunları eşit aralıklarla + küçük rastgele sapmayla dağıtır.
   (Basit "karıştır" yetmez: başta 4 kanji üst üste gelebilir.)
3. Kanji seçimi **ağırlıklı**: yeni öğrenilen ×3, tekrar zamanı gelen ×3,
   çok yanlış yapılan ×2, iyi bilinen seyrekleşir. `serpistirmeAgirligi()` bak.
4. Cümlede **bilinmeyen kanji gösterilmez**: cümlenin tüm kanjileri öğrenilmiş
   olmalı; yoksa kana cümlesine (reading.js) düşer.

### Kanji ilerleme takibi (`sakar_kanji`)
İlerleme **kümülatif**: karışık dersler "o ana kadar öğrenilen TÜM kanjiler"den
soru üretir. Kayıt: `{ "山": { ogretildi, ilk, d, y, kutu, sonSoru }`.
`ogretildi` yalnızca kart gösterilince true olur; önce öğretilmeyen kanji sorulmaz.

### Kanji bağlam cümleleri (kanji-cumle.js)
`reading.js` cümleleri **hiragana**dır (yeni başlayan için). Kanji öğrenen kullanıcı
cümleyi **kanji ile** görmeli; yoksa kanji "süs" olarak kalır.
`kanji-cumle.js` kanjili cümleleri tutar: `{ ja, ro, tr, kanjiler, kelimeler }`.
Doğrulama: cümlede gerçekten geçmeyen bir kanji listelenmişse konsola uyarı düşer.

**Yeni kanji eklemek:** `kanji.js` içindeki `KANJILER` dizisine ekle:

    { k: '山', tr: 'dağ', kun: 'やま', on: 'サン', grup: 'doga', ornek: { ja: '富士山', ro: 'fujisan', tr: 'Fuji Dağı' } }

| Alan | Zorunlu | Ne işe yar |
|---|---|---|
| `k` | evet | Kanji karakteri (tek karakter olmalı) |
| `tr` | evet | Türkçe anlamı (şıklarda çeldirici olur, **benzersiz olmalı**) |
| `kun` / `on` | en az biri | Okunuşlar; kartta ayrı satırlarda gösterilir |
| `grup` | evet | Ders gruplaması (müfredattaki `kanjiGrup` ile eşleşir) |
| `ornek` | isteğe bağlı | Kanjinin geçtiği gerçek kelime (kartta tıklanabilir çıkar) |

Sonra `mufredat.js`'te `tip: 'kanji'` ile bir daire aç:

    { id: 100, bolum: "Kanji (N5)", baslik: "Yeni Grup", tip: "kanji", kanjiGrup: 'yeniGrup', soru: 12, can: 4, xp: 120 }

- `kanjiGrup: 'hepsi'` -> tüm kanjiler (sınavlar için).
- `sadeceKanji: ['一','二']` -> grup yerine tam listeyi kullan.
- `soru: 12` -> her kanji 4 adım (öğret + anlam + okunuş + kanji seç) -> 3 kanji işlenir.

Her ders aynı dört adımı izler: kanji önce **öğretilir**, sonra anlamı, okunuşu
ve ters yönden (anlamdan kanjiye) sorulur. Öğretilmemiş kanji hiç sorulmaz.

Doğrulama: `kanji.js` açılışta `dogrula()` çağır; tekrarlanan kanji, eksik alan veya
aynı Türkçe anlamı iki kez kullanan kayıt varsa konsola uyarı yazar.

## Yeni okuma/kelime eklemek (reading.js)
- Kelimeleri `SOZLUK` dizisine ekle: `{ ja, ro, tr, kana }` (ja=Japonca, ro=romaji, tr=Türkçe).
- Cümleleri `CUMLELER` dizisine ekle: `{ ja, ro, tr }`. **Cümledeki her kelime SOZLUK'te olmalı**;
  eksik kelime varsa konsola uyarı düşer. Böylece öğretilmemiş kelime sorulmaz.
- Yeni bir okuma dersi istersen `mufredat.js`'e `tip: 'reading'` ile daire ekle
  (`reading: 'kelime'` veya `reading: 'cumle'`).

## Ses
Ses dosyaları (audio/kana, audio/sensei) **şimdilik kaldırıldı**. Harf/cümleler artık
sadece tarayıcının Japonca sesiyle okunur; doğru/yanlış geri bildirimi kısa bip ile verilir.
Dosya sesini geri getirmek istersen: `audio/` klasörünü ve `ses-uret/` ile üretilen dosyaları
ekle, `ses.js`'in eski (dosya çalan) sürümünü geri koy.

## Öğrenme sistemi nasıl çalışıyor
- Her cevap harf bazında kaydedilir. Yanlış bilinen harf "kutu 0"a düşer ve tekrar listesine girer.
- Doğru bilince kutu +1 (günde en fazla 1 kez): 1 → 3 → 7 → 14 → 30 gün sonra tekrar sorulur.
- Testler soruların ~%30'unu zayıf harflerden seçer, derslerin pekiştirme kısmı da zayıf harflere öncelik verir.
- Ders bitince: ilk kez = ders XP'si, eski ders tekrarı = 10 XP, tekrar dersi = 20 XP, hatasız = +10 bonus.
- Günlük hedef 50 XP (`Ilerleme.HEDEF_XP`).

## Giriş (index.html)
Giriş akışı artık `giris.js` içinde. İki mod var, ikisi de aynı dosyadan yönetilir:

| Mod | Ne zaman | Ne yapar |
|---|---|---|
| **Test modu** | `giris.js` içinde `TEST_MODU = true` | Giriş ekranı atlanır, doğrudan `dojo.html` açılır (isim: "Test Kullanıcı") |
| **Normal mod** | `GOOGLE_CLIENT_ID` dolu ve `TEST_MODU = false` | "Google ile devam et" butonu çıkar, Google hesabıyla giriş yapılır |

**Google girişini açma (5 dakika):**
1. https://console.cloud.google.com/apis/credentials → **Kimlik bilgileri oluştur → OAuth istemci kimliği → Web uygulaması**
2. **Yetkili JavaScript kaynakları**: `https://sakarpaisen.netlify.app` ve (yerel deneme için) `http://localhost:8000`
3. Verilen kimliği `giris.js` başındaki `GOOGLE_CLIENT_ID = ''` satırına yapıştır.

- Giriş yapan kullanıcının adı (ve varsa Google fotoğrafı) `sakar_isim` / `sakar_avatar`
  olarak saklanır; `dojo.html`, `oyun.html` ve `ilerleme.js` bu yüzden hiç değişmedi.
- Eski kaydı olan kullanıcı Google'a hiç gönderilmez: "Tekrar hoş geldin" ekranı çıkar.
- "Hiç bilmiyorum / Hiragana biliyorum" seçim ekranı kaldırıldı, herkes sıfırdan (seviye 1) başlar.

## Netlify şeridi (Powered by Netlify)
Netlify, **Drop ile yüklenen** sitelerin sol altına kendi şeridini ekler (`#netlify-badge`).
`oyun.html` buna göre ayarlandı: `.alt-bar` yükseltilir ve `body`'ye alt boşluk verilir,
böylece şerit **DEVAM ET** butonuna binmez. Şerit tamamen kalksın istersen:
yayını Git ile yapmak ya da "Netlify Drop" şeridini site ayarlarından kapatmak yeterli —
kod tarafında bir şey yapmak gerekmez (kural yalnızca şerit varsa uygulanır).
`index.html`'de ise şeritle çakışmasın diye **mobilde gizlenen** kendi "⚡ Powered by Netlify"
etiketimiz var; istemezsen o satırı sil.

## Geri bildirim ve destek
- **Geri bildirim kutusu:** Dojo sağ panelinde ("💬 Sensei'ye söyle"). Mesajlar
  Formspree'ye gider. Bağlamak için `dojo.html`'de şu satıra kendi form ID'ni yaz:
  `const FORMSPREE = 'https://formspree.io/f/BURAYA_FORM_ID';`
  ID girilmezse kutu, kullanıcının e-posta uygulamasını açar (mailto) — yine çalışır.
- **Destek linki (Kreosus):** Giriş ekranında, dojo sağ panelinde ve ders bitiş
  ekranında. Adres: `https://kreosus.com/sakarpaisen`
- `dojo.html#geri` bağlantısı doğrudan geri bildirim kutusuna kaydır.

## Kısayollar
Ders sırasında **1-4** tuşları şık seçer, **Enter** devam eder.

## Test / otomasyon
Dersteki doğru şık `.secenek[data-dogru="1"]` ile işaretlenir ve sahneye
`data-soru-tipi` yazılır. Böylece otomatik testler doğru cevabı motordan okuyabilir.

Testler artık **tek komutla** çalışır (`npm test`): sunucuyu Playwright kendisi
başlatır (`sunucu.mjs`). Ayrıntı: `TESTLER.md`.

### İlerleme çubuğu adıma göre çalışır
Önceden çubuk yalnızca **doğru cevap** verildiğinde artıyordu. Dersler öğretim
kartıyla başladığı için çubuk uzun süre boş kalıyor, kullanıcı "hiç ilerlemiyorum"
hissine kapılıyordu. Artık `ciz()` çubuğu `adim / toplam` oranıyla ayarlar:
öğretim kartları da ilerlemeden sayılır.

### Can kuralı: ilk yanlış bedava
`app.js` içinde `if (hata > 1) can--` yazar. Yani **ilk yanlış cevap can
götürmez**; yeni başlayan ilk hatasında oyunu kaybetmez. Test yazarken bunu
unutma: canın düştüğünü görmek için iki yanlış cevap gerekir.

## Ses üretme (Gemini TTS, ses: Sulafat)
Harf sesleri ve sensei'nin Türkçe tepkileri `ses-uret/uret.py` ile üretilir. Ortak **Scene, Director's Notes ve Sample Context**
`ses-uret/sesler.json` içinde, hepsi aynı ayarla üretilir. Sadece metin ve dosya adı değişir.

    pip install google-genai
    export GEMINI_API_KEY="..."                 # https://aistudio.google.com/apikey
    python ses-uret/uret.py --deneme            # neyi üreteceğini göster (API'siz)
    python ses-uret/uret.py                     # eksik olan her şeyi üret (56 dosya)

Dosya adları: harfler `audio/kana/<romaji>.wav` (a, ka, shi, tsu, wo, n ...; Hiragana ve Katakana aynı dosyayı kullanır),
sensei `audio/sensei/<ad>.wav` (dogru-1..4, yanlis-1..2, ders-bitti, tekrar-bitti, hedef-tamam, can-bitti).
Oyun `index.json`'da listelenen dosyaları çalar, olmayan harf için tarayıcının Japonca sesine döner.

- Tek ses beğenilmediyse: `python ses-uret/uret.py --yeniden --sadece ka`  (metni `sesler.json`'dan değiştirebilirsin)
- Elle indirdiysen (AI Studio playground): dosyayı adıyla `audio/kana/` içine koy, sonra `python ses-uret/uret.py --indeks`
- Ses ekledikten sonra offline için `sw.js` içinde `CACHE_NAME`'i bir arttır.
