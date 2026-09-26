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
// ÜÇ SAĞLAYICI DESTEKLENİYOR (birlikte çalışabilirler):
//
//   1) GOOGLE ANALYTICS 4 (GA4)  → GA_ID = 'G-J7C95QFFW5'   [AKTİF]
//      - ÇEREZ KULLANIR ve kişisel veri toplar.
//      - Bu yüzden YALNIZCA kullanıcı çerez izni verdikten SONRA yüklenir.
//      - İzin verilmezse GA hiç indirilmez → hiçbir veri Google'a gitmez.
//      - İzin durumu: alttaki çerez şeridi (seritKur) ile sorulur.
//
//   2) CLOUDFLARE WEB ANALYTICS  → CLOUDFLARE_TOKEN   [AKTİF]
//      - Çerezsiz ve anonimdir; KVKK/GDPR için izin GEREKTİRMEZ.
//      - Bu yüzden izin beklemeden, her zaman çalışır.
//
//   3) UMAMI  (kendin barındırırsan ücretsiz; Cloud sürümü ücretli)
//      - Aşağıdaki UMAMI_ADRES ve UMAMI_SITE_ID alanlarını doldur. İzin gerektirir.
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
  // Aşağıdaki satırları doldurana kadar analytics TAMEN KAPALI.
  const GA_ID = 'G-J7C95QFFW5';  // Google Analytics 4 Measurement ID
  const CLOUDFLARE_TOKEN = '055829bd4d3a460da238676644490663';  // Cloudflare Web Analytics (sakarpaisen.com)
  const UMAMI_ADRES = '';        // ör. 'https://analytics.senin-siten.com'
  const UMAMI_SITE_ID = '';      // ör. 'abc123-def456'

  // İzin gerektiren sağlayıcı var mı? (GA ve Umami çerez kullanır)
  const IZIN_GEREKLI = !!(GA_ID || (UMAMI_ADRES && UMAMI_SITE_ID));
  // Çerezsiz sağlayıcı var mı? (Cloudflare)
  const CEREZISZ = !!CLOUDFLARE_TOKEN;

  const ACIK = IZIN_GEREKLI || CEREZISZ;

  const IZIN_ANAHTAR = 'sakar_cerez_izni';   // 'kabul' | 'red' | (yok)

  function izinOku() {
    try { return localStorage.getItem(IZIN_ANAHTAR); } catch (e) { return null; }
  }
  function izinYaz(deger) {
    try { localStorage.setItem(IZIN_ANAHTAR, deger); } catch (e) { }
  }

  // Yerelde (localhost) ÖLÇME. Test trafiği gerçek istatistiği kirletmesin.
  // İSTİSNA: adrese ?analitik=test eklenirse yerel koruma atlanır. Böylece
  // canlıya çıkmadan izin şeridini ve GA olaylarını test edebiliriz.
  const YEREL_TEST = /[?&]analitik=test\b/.test(location.search);
  const YEREL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && !YEREL_TEST;

  if (!ACIK || YEREL) {
    // Sessizce çık. Konsola bir kez bilgi yaz (geliştirici görsün).
    if (!ACIK && !YEREL) {
      console.info('[analitik] Kapalı. Açmak için analitik.js içindeki GA_ID ' +
        'veya CLOUDFLARE_TOKEN satırını doldur.');
    }
    // Ölçüm kapalıyken de olay fonksiyonları çağrılabilir: hiçbir şey yapmazlar.
    window.Analitik = {
      acik: function () { return false; },
      sayfa: function () { }, olay: function () { },
      dersBasladi: function () { }, dersBitti: function () { },
      izin: function () { return null; }, izinSifirla: function () { }
    };
    return;
  }

  // ---------------- SAĞLAYICI YÜKLEYİCİLER ----------------
  let gaYuklendi = false;

  // GA4: yalnızca izin verildiğinde çağrılır.
  function gaYukle() {
    if (gaYuklendi || !GA_ID) return;
    gaYuklendi = true;

    // Google'ın resmî yükleme kodunun sadeleştirilmiş hâli.
    // gtag çağrıları kuyruğa alınır; script gelince işlenir.
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    // send_page_view: false → sayfa görüntülemesini BİZ gönderiyoruz
    // (sayfa() çağrısı), böylece çift sayım olmaz.
    window.gtag('config', GA_ID, { send_page_view: false });

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  function umamiYukle() {
    if (!UMAMI_ADRES || !UMAMI_SITE_ID) return;
    const s = document.createElement('script');
    s.defer = true;
    s.src = UMAMI_ADRES.replace(/\/$/, '') + '/script.js';
    s.setAttribute('data-website-id', UMAMI_SITE_ID);
    document.head.appendChild(s);
  }

  // Çerezsiz sağlayıcı: izin beklemez, hemen yüklenir.
  function cloudflareYukle() {
    if (!CLOUDFLARE_TOKEN) return;
    const s = document.createElement('script');
    s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: CLOUDFLARE_TOKEN }));
    document.head.appendChild(s);
  }

  if (CEREZISZ) cloudflareYukle();

  // ---------------- ÇEREZ İZNİ ŞERİDİ ----------------
  // NEDEN GEREKLİ: GA çerez kullanır ve kişisel veri toplar. KVKK/GDPR,
  // izin alınmadan bu çerezlerin yazılmasını yasaklar. Bu yüzden GA,
  // kullanıcı "Kabul et" diyene kadar HİÇ yüklenmez.
  //
  // TASARIM: Alt tarafta ince bir şerit. İki düğme: "Kabul et" / "Reddet".
  // Reddederse de site tam çalışır (yalnızca GA kapalı kalır).
  function seritKur() {
    if (document.querySelector('.cerez-serit')) return;   // iki kez eklenmesin

    const stil = document.createElement('style');
    stil.textContent = [
      '.cerez-serit{position:fixed;left:0;right:0;bottom:0;z-index:400;',
      'display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;',
      'padding:12px 16px;background:var(--kart,#fff);border-top:2px solid var(--cizgi,#e5e0d5);',
      'box-shadow:0 -4px 20px rgba(0,0,0,.12);font-family:inherit;',
      'animation:cerezGir .3s ease-out}',
      '@keyframes cerezGir{from{transform:translateY(100%)}to{transform:translateY(0)}}',
      '.cerez-serit p{margin:0;font-size:12.5px;font-weight:700;color:var(--yazi,#333);',
      'max-width:520px;line-height:1.45}',
      '.cerez-serit a{color:var(--mor,#7b5cf0);font-weight:800}',
      '.cerez-btn{border:none;border-radius:10px;padding:9px 18px;font-family:inherit;',
      'font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap}',
      '.cerez-btn.kabul{background:var(--mor,#7b5cf0);color:#fff;box-shadow:0 3px 0 var(--mor-golge,#5a3fc0)}',
      '.cerez-btn.red{background:none;color:var(--yazi-soluk,#777);text-decoration:underline}',
      '.cerez-btn:active{transform:translateY(2px)}'
    ].join('');
    document.head.appendChild(stil);

    const serit = document.createElement('div');
    serit.className = 'cerez-serit';
    serit.setAttribute('role', 'region');
    serit.setAttribute('aria-label', 'Çerez izni');

    const metin = document.createElement('p');
    metin.innerHTML = '🍪 Deneyimi geliştirmek için çerez kullanıyoruz. ' +
      'Kabul edersen Google Analytics ile anonim kullanım verisi toplanır.';

    const kabul = document.createElement('button');
    kabul.className = 'cerez-btn kabul';
    kabul.type = 'button';
    kabul.textContent = 'Kabul et';

    const red = document.createElement('button');
    red.className = 'cerez-btn red';
    red.type = 'button';
    red.textContent = 'Reddet';

    function kapat(deger) {
      izinYaz(deger);
      serit.remove();
      if (deger === 'kabul') { gaYukle(); umamiYukle(); }
    }
    kabul.onclick = function () { kapat('kabul'); };
    red.onclick = function () { kapat('red'); };

    serit.append(metin, kabul, red);
    document.body.appendChild(serit);
  }

  // ---------------- İZİN DURUMUNA GÖRE BAŞLAT ----------------
  const izin = izinOku();
  if (izin === 'kabul') {
    // Daha önce kabul etmiş: hemen yükle, şeridi gösterme.
    gaYukle();
    umamiYukle();
  } else if (izin === 'red') {
    // Daha önce reddetmiş: bir daha sorma, GA'yı hiç yükleme.
  } else if (IZIN_GEREKLI) {
    // Henüz karar vermemiş: şeridi göster (DOM hazır olunca).
    if (document.body) seritKur();
    else document.addEventListener('DOMContentLoaded', seritKur);
  }

  // ---------------- OLAY GÖNDER ----------------
  // Hem GA4 (gtag) hem Umami'ye gönderilir; hangisi yoksa sessizce atlanır.
  // Cloudflare özel olay almaz (yalnızca sayfa görüntülemesi).
  let sayfaGonderildi = false;

  function olayGonder(ad, veri) {
    // GA4
    if (gaYuklendi && typeof window.gtag === 'function') {
      try { window.gtag('event', ad, veri || {}); } catch (e) { }
    }
    // Umami
    if (UMAMI_ADRES && window.umami && typeof window.umami.track === 'function') {
      try { window.umami.track(ad, veri || {}); } catch (e) { }
    }
  }

  window.Analitik = {
    acik: function () { return gaYuklendi || CEREZISZ; },

    // Sayfa görüntülemesi (her HTML sayfasının sonunda çağrılır)
    sayfa: function (ad) {
      if (sayfaGonderildi) return;   // aynı yüklemede iki kez saymasın
      sayfaGonderildi = true;
      const yol = ad || location.pathname;
      // GA4'te sayfa görüntülemesi ayrı bir "page_view" olayıdır.
      if (gaYuklendi && typeof window.gtag === 'function') {
        try {
          window.gtag('event', 'page_view', {
            page_title: yol,
            page_location: location.href,
            page_path: location.pathname
          });
        } catch (e) { }
      }
      olayGonder('sayfa', { ad: yol });
    },

    // Oyun olayları: ders basladi / ders bitti / ders birakildi
    olay: function (ad, veri) { olayGonder(ad, veri); },

    // Çerez izni durumu (Ayarlar sayfası vb. için)
    izin: function () { return izinOku(); },
    izinSifirla: function () {
      try { localStorage.removeItem(IZIN_ANAHTAR); } catch (e) { }
    }
  };

  // Sayfa kapanırken "ders yarıda kaldı" olayı (ürün için en değerli veri)
  let acikDers = null;
  window.addEventListener('pagehide', function () {
    if (acikDers) olayGonder('ders_birakildi', acikDers);
  });

  // app.js ders başlarken/biterken bunu çağır
  window.Analitik.dersBasladi = function (bilgi) { acikDers = bilgi || {}; };
  window.Analitik.dersBitti = function (bilgi) { acikDers = null; };
})();
