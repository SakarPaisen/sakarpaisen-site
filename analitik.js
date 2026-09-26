// ============================================================
// ANALYTICS (analitik.js)
//
// AMAÇ: Kaç kişi giriyor, hangi derste bırakıyor, nerede takılıyor?
// Şu an bunu BİLMİYORUZ. Ölçemediğin şeyi geliştiremezsin, para da kazanamazsın.
//
// NASIL ÇALIŞIR:
//   Aşağıdaki AYARLAR bölümüne bir site kimliği yazana kadar bu dosya
//   HİÇBİR ŞEY YAPMAZ (dış istek yok, çerez yok, sıfır risk).
//   ID yazdığın an ölçüm başlar.
//
// İKİ SAĞLAYICI DESTEKLİYORUZ (birini seç):
//
//   1) CLOUDFLARE WEB ANALYTICS  (önerilen: ücretsiz, çerezsiz, sınırsız)
//      - https://dash.cloudflare.com → Analytics → Web Analytics → Add a site
//      - Site adresi: https://sakarpaisen.com
//      - Sana bir TOKEN verir → aşağıdaki CLOUDFLARE_TOKEN satırına yaz.
//      - Çerez kullanmaz → KVKK/GDPR için ayrıca izin penceresi GEREKMEZ.
//
//   2) UMAMI  (kendin barındırırsan ücretsiz; Cloud sürümü ücretli)
//      - Aşağıdaki UMAMI_ADRES ve UMAMI_SITE_ID alanlarını doldur.
//
// HANGİSİNİ SEÇERSEN sadece onu doldur, diğerini boş bırak.
//
// NE ÖLÇÜLÜR (gizlilik dostu, kişisel veri yok):
//   - Sayfa görüntüleme (index/dojo/oyun/kelime)
//   - Oyuna başlama ve ders bitirme olayları
//   - HANGİ DERSTE BIRAKTIĞIN (en değerli veri: ürün nerede zorladığını gösterir)
//   - Ders id, tip (harf/okuma/kanji/karisik), alınan XP
// ============================================================
(function () {
  'use strict';

  // ---------------- AYARLAR ----------------
  // Aşağıdaki iki satırı doldurana kadar analytics TAMEN KAPALI.
  const CLOUDFLARE_TOKEN = '055829bd4d3a460da238676644490663';  // Cloudflare Web Analytics (sakarpaisen.com)
  const UMAMI_ADRES = '';        // ör. 'https://analytics.senin-siten.com'
  const UMAMI_SITE_ID = '';      // ör. 'abc123-def456'

  const ACIK = !!(CLOUDFLARE_TOKEN || (UMAMI_ADRES && UMAMI_SITE_ID));

  // Yerelde (localhost) ÖLÇME. Test trafiği gerçek istatistiği kirletmesin.
  const YEREL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  if (!ACIK || YEREL) {
    // Sessizce çık. Konsola bir kez bilgi yaz (geliştirici görsün).
    if (!ACIK && !YEREL) {
      console.info('[analitik] Kapalı. Açmak için analitik.js içindeki ' +
        'CLOUDFLARE_TOKEN satırına site token\'ını yaz. (Cloudflare > Web Analytics)');
    }
    // Ölçüm kapalıyken de olay fonksiyonları çağrılabilir: hiçbir şey yapmazlar.
    window.Analitik = {
      acik: function () { return false; },
      sayfa: function () { }, olay: function () { }
    };
    return;
  }

  // ---------------- SAĞLAYICI YÜKLE ----------------
  function cloudflareYukle() {
    const s = document.createElement('script');
    s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: CLOUDFLARE_TOKEN }));
    document.head.appendChild(s);
  }

  function umamiYukle() {
    const s = document.createElement('script');
    s.defer = true;
    s.src = UMAMI_ADRES.replace(/\/$/, '') + '/script.js';
    s.setAttribute('data-website-id', UMAMI_SITE_ID);
    document.head.appendChild(s);
  }

  if (CLOUDFLARE_TOKEN) cloudflareYukle();
  else umamiYukle();

  // ---------------- OLAY GÖNDER ----------------
  // Umami'nin kendi olay API'si var; Cloudflare olay almaz (sadece sayfa görür).
  // Bu yüzden özel olayları Umami varsa ona, yoksa sessizce atlar.
  let sayfaGonderildi = false;

  function umamiOlay(ad, veri) {
    if (!UMAMI_ADRES || !window.umami || typeof window.umami.track !== 'function') return;
    try { window.umami.track(ad, veri || {}); } catch (e) { }
  }

  window.Analitik = {
    acik: function () { return true; },

    // Sayfa görüntülemesi (her HTML sayfasının sonunda çağrılır)
    sayfa: function (ad) {
      if (sayfaGonderildi) return;   // aynı yüklemede iki kez saymasın
      sayfaGonderildi = true;
      umamiOlay('sayfa', { ad: ad || location.pathname });
    },

    // Oyun olayları: ders basladi / ders bitti / ders birakildi
    olay: function (ad, veri) { umamiOlay(ad, veri); }
  };

  // Sayfa kapanırken "ders yarıda kaldı" olayı (ürün için en değerli veri)
  let acikDers = null;
  window.addEventListener('pagehide', function () {
    if (acikDers) umamiOlay('ders_birakildi', acikDers);
  });

  // app.js ders başlarken/biterken bunu çağır
  window.Analitik.dersBasladi = function (bilgi) { acikDers = bilgi || {}; };
  window.Analitik.dersBitti = function (bilgi) { acikDers = null; };
})();
