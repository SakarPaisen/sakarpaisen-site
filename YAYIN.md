# Yayına alma (Netlify) — adım adım

Site saf statik dosyalardan oluşur, derleme gerekmez. Netlify'a sürükle-bırak ile
yayınlanır. **HTTPS otomatik gelir** — bu sayede PWA (telefona uygulama olarak
yükleme) ilk kez gerçekten çalışır.

## 1) Geri bildirim kutusunu bağla (bir kez yapılır)

1. https://formspree.io adresine e-posta ile kaydol (ücretsiz).
2. **New Form** → form adı: `Sakar Paisen Geri Bildirim` → e-posta adresini yaz.
3. Sana `https://formspree.io/f/xxxxxxxx` gibi bir adres verir.
4. `dojo.html` dosyasını aç, şu satırı bul ve `xxxxxxxx` kısmını yapıştır:

       const FORMSPREE = 'https://formspree.io/f/BURAYA_FORM_ID';

   → örnek: `const FORMSPREE = 'https://formspree.io/f/xabcdefg';`

Bu satır değiştirilmezse kutu yine çalışır: kullanıcının kendi e-posta
uygulamasını açar (mailto). Ama Formspree bağlanınca mesajlar doğrudan sana düşer.

## 2) Netlify'a yükle (2 dakika)

**En kolay yol (sürükle-bırak):**
1. https://app.netlify.com/drop adresini aç.
2. `SakarPaisen` klasörünü olduğu gibi sürükleyip bırak.
3. Netlify sana `https://rastgele-isim.netlify.app` gibi bir adres verir.
4. Site yayında. **Site settings → Change site name** ile adı
   `sakarpaisen` yap → `https://sakarpaisen.netlify.app` olur.

**Git ile (her değişiklikte otomatik yayın):**
1. Projeyi GitHub'a yükle.
2. Netlify → **Add new site → Import an existing project** → GitHub'ı seç.
3. Build command: boş bırak. Publish directory: `.` yaz.
   (`netlify.toml` zaten bu ayarları taşıyor.)
4. Artık her `git push` siteyi günceller.

## 3) Yayından sonra kontrol et

- Site açılıyor mu, ders oynanıyor mu
- Tarayıcı konsolunda hata var mı
- Sağ panelde **"☕ Sensei'ye bir çay ısmarla"** Kreosus'a gidiyor mu
- Geri bildirim kutusuna yazıp gönder → mailinize düşüyor mu
- Telefonda: menüden **"Ana ekrana ekle"** çıkıyor mu (PWA kurulumu)

## 4) Kendi alan adın (isteğe bağlı, sonra)

- `.com` ≈ 12$/yıl (Cloudflare Registrar veya Namecheap)
- Netlify → **Domain settings → Add custom domain** → aldığın adı yaz
- Netlify'ın verdiği DNS kayıtlarını domain sağlayıcına gir
- HTTPS sertifikası Netlify tarafından otomatik ve ücretsiz kurulur

**Ücretsiz domain (.tk / .ml / .ga) KULLANMA:** sağlayıcı fiilen kapandı,
tarayıcılar güvenlik uyarısı gösteriyor, YouTube'dan gelen kullanıcıyı kaçır.
Ücretsiz alt alan adı yeterli: `sakarpaisen.netlify.app`.

## 5) Her güncellemede
Kod değiştirdikten sonra `sw.js` içindeki `CACHE_NAME` değerini bir arttır
(ör. `sakar-paisen-v10` → `v11`). Böylece kullanıcılar eski önbelleği değil
yeni sürümü görür.

## 6) Giriş ekranı (Google) ve test modu
- **Şimdi (test):** `giris.js` içinde `TEST_MODU = true` → giriş istenmez, doğrudan dojo açılır.
- **Canlıya geçerken:** Google Cloud'da OAuth istemci kimliği al (Yetkili JavaScript kaynağı:
  `https://sakarpaisen.netlify.app`), `giris.js` başındaki `GOOGLE_CLIENT_ID` satırına yaz ve
  `TEST_MODU`'yu `false` yap. Ayrıntı: `NOTLAR.md` → "Giriş (index.html)".
- **"Powered by Netlify" şeridi:** Drop ile yüklenen sitelerde Netlify kendi şeridini ekler.
  `oyun.html` bu şeride yer bırakacak şekilde ayarlandı (buton artık altında kalmıyor).
