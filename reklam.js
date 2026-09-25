// ============================================================
// REKLAM (reklam.js)  —  Sakar Paisen
//
// AMAÇ: Siteye reklam yerleştirmek. Kodu yazdım ama reklam AĞI
//   (AdSense vb.) onaylayana kadar alanlar GÖRÜNMEZ kalır.
//   Yani bu dosyayı yayınlasan bile site şu anki gibi kalır.
//
// NASIL ÇALIŞIR:
//   1. Google AdSense'e başvur (https://adsense.google.com). Onay 1-2 hafta sürebilir.
//   2. Onay gelince AdSense → Reklamlar → "Reklam birimi oluştur" → Görüntülü reklam.
//      Sana bir "data-ad-slot" numarası verir (10 haneli sayı).
//   3. Aşağıdaki AYARLAR bölümüne:
//        ADSENSE_ID    = 'ca-pub-1234567890123456'   (AdSense ana sayfanda yazar)
//        ADSENSE_SLOT  = '1234567890'               (reklam biriminin numarası)
//      yaz. Kaydet ve yayınla (KURULUM.md ADIM 1).
//
// YERLEŞİM: index.html ve dojo.html'de <div class="reklam-alani" data-reklam="...">
//   işaretli kutular var. Bu dosya o kutuları bulur ve reklamı içine koyar.
//   Hangi kutun hangi slotu kullanacağını istersen kutuya data-slot="..." ekleyerek
//   değiştirebilirsin; yazmazsan yukarıdaki ADSENSE_SLOT kullanılır.
//
// GÜVENLİ TASARIM (boşken sıfır risk):
//   • Hiçbir ayar yoksa: dış istek YOK, kutu GİZLİ, site normal çalışır.
//   • Bir kutuda data-reklam="kapali" yazarsa o kutu asla reklam almaz.
//   • Yerelde (localhost) reklam GÖSTERİLMEZ: AdSense sahte tıklama sayar ve
//     hesabı askıya alabilir. Bu yüzden localhost'ta da tamamen kapalı.
// ============================================================
(function () {
  'use strict';

  // ---------------- AYARLAR ----------------
  const ADSENSE_ID = '';      // ör. 'ca-pub-1234567890123456'
  const ADSENSE_SLOT = '';    // ör. '1234567890'

  const ACIK = !!(ADSENSE_ID && ADSENSE_SLOT);

  // Yerelde reklam YOK (AdSense kuralı: kendi tıklaman = hesap askıya alınır).
  const YEREL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  if (!ACIK || YEREL) {
    if (!ACIK && !YEREL) {
      console.info('[reklam] Kapalı. Açmak için reklam.js içindeki ADSENSE_ID ve ' +
        'ADSENSE_SLOT satırlarını doldur. (AdSense → Reklam birimi)');
    }
    // KAPALIYKEN DE window.Reklam tanımlı olmalı (Analitik/Bulut ile aynı desen).
    // Böylece app.js gibi çağıranlar "window.Reklam var mı" diye güvenle sorabilir;
    // fonksiyonlar sessizce hiçbir şey yapar, dış istek olmaz.
    window.Reklam = {
      acik: function () { return false; },
      kur: function () { },
      gizle: function () {
        document.querySelectorAll('.reklam-alani').forEach(k => { k.hidden = true; });
      }
    };
    return;
  }

  // ---------------- ADSENSE SCRIPT'İNİ BİR KEZ YÜKLE ----------------
  function adsenseYukle() {
    if (document.querySelector('script[src*="adsbygoogle.js"]')) return;
    const s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' +
      encodeURIComponent(ADSENSE_ID);
    document.head.appendChild(s);
  }

  // ---------------- KUTULARI DOLDUR ----------------
  function kutuDoldur(kutu) {
    // Zaten doldurulmuşsa tekrar etme (sayfa içi yönlendirmelerde çift reklam olmasın).
    if (kutu.dataset.reklamDolu === '1') return;

    // İçerik yoksa reklam da olmaz (AdSense kuralı: boş içerikli yere reklam konmaz).
    const icerikVar = document.querySelector('.kart, .liste, .dersler, .dugum, ol, main, #sahne');
    if (!icerikVar && !kutu.dataset.zorla) return;

    const slot = kutu.dataset.slot || ADSENSE_SLOT;

    const reklam = document.createElement('ins');
    reklam.className = 'adsbygoogle';
    reklam.style.display = 'block';
    reklam.setAttribute('data-ad-client', ADSENSE_ID);
    reklam.setAttribute('data-ad-slot', slot);
    reklam.setAttribute('data-ad-format', 'auto');
    reklam.setAttribute('data-full-width-responsive', 'true');

    kutu.replaceChildren(reklam);
    kutu.hidden = false;
    kutu.dataset.reklamDolu = '1';

    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { }
  }

  function kur() {
    adsenseYukle();
    document.querySelectorAll('.reklam-alani[data-reklam]:not([data-reklam="kapali"])')
      .forEach(kutuDoldur);
  }

  window.Reklam = {
    acik: function () { return true; },
    kur: kur,
    // Premium üye olunca reklamı kapatmak için: Reklam.gizle()
    gizle: function () {
      document.querySelectorAll('.reklam-alani').forEach(k => { k.hidden = true; });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', kur);
  } else {
    kur();
  }
})();
