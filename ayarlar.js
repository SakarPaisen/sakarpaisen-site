// ============================================================
// AYARLAR (ayarlar.js)  —  Sakar Paisen
//
// Kullanıcının oyunu kendine göre ayarladığı yer. Ayarlar sayfası
// (ayarlar.html) bu dosyayı kullanır AMA asıl önemlisi: her sayfa bu
// dosyayı yükler, böylece seçilen tema/ses/zorluk sitede anında geçerli olur.
//
// AYARLAR (localStorage'da saklanır, buluta da yedeklenir):
//   sakar_tema      'açık' | 'koyu' | 'gece'      → renk teması
//   sakar_ses       '0' | '1'                     → (ses.js zaten kullanıyor)
//   sakar_zorluk    'kolay' | 'normal' | 'zor'    → can sayısı + soru sayısı
//   sakar_animasyon '0' | '1'                     → konfeti/animasyonlar
//   sakar_yazi_boy  '1' | '1.15' | '1.3'          → yazı büyüklüğü (erişilebilirlik)
//   sakar_okunus    'hep' | 'kun' | 'on'          → kanji dersinde hangi okunuş sorulsun
//
// TASARIM KURALI: Bu dosya HİÇBİR ŞEYİ bozmaz. localStorage boşsa
// varsayılanlar kullanılır ve site şimdiki gibi görünür.
// ============================================================
(function () {
  'use strict';

  const ANAHTAR = 'sakar_ayarlar';

  const VARSAYILAN = {
    tema: 'acik',
    zorluk: 'normal',
    animasyon: '1',
    yaziBoy: '1',
    okunus: 'hep'
  };

  // Zorluk seviyeleri: can ve soru sayısını nasıl değiştirdiği.
  // app.js ders başlarken buradan okur (bkz. app.js ZORLUK).
  const ZORLUKLAR = {
    kolay: { ad: 'Kolay', can: 6, soruOran: 0.8, ekXp: 0, aciklama: '6 can, daha kısa dersler' },
    normal: { ad: 'Normal', can: 4, soruOran: 1, ekXp: 0, aciklama: '4 can, standart ders' },
    zor: { ad: 'Zorlu', can: 3, soruOran: 1.25, ekXp: 0.25, aciklama: '3 can, daha uzun dersler, %25 fazla XP' }
  };

  const TEMALAR = {
    acik: { ad: 'Gündüz' },
    koyu: { ad: 'Alacakaranlık' },
    gece: { ad: 'Gece' }
  };

  function ham(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function yaz(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  function tumu() {
    let kayitli = {};
    try { kayitli = JSON.parse(ham(ANAHTAR)) || {}; } catch (e) { }
    return Object.assign({}, VARSAYILAN, kayitli);
  }

  function al(ad) { return tumu()[ad]; }

  function ayarla(ad, deger) {
    const t = tumu();
    t[ad] = deger;
    yaz(ANAHTAR, JSON.stringify(t));
    uygula();
    return t[ad];
  }

  // ---------- Tema ----------
  // Tema CSS'te :root[data-tema="koyu"] ile tanımlı (uygulama.css).
  function temaUygula(tema) {
    const kok = document.documentElement;
    if (!tema || tema === 'acik') kok.removeAttribute('data-tema');
    else kok.setAttribute('data-tema', tema);
    // Tarayıcı adres çubuğu rengi de temaya uysun (telefonda görünür)
    const renk = tema === 'gece' ? '#14131a' : (tema === 'koyu' ? '#20222b' : '#fbf8f2');
    let m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', renk);
  }

  // ---------- Yazı boyu (erişilebilirlik) ----------
  function yaziBoyUygula(oran) {
    document.documentElement.style.fontSize = (16 * parseFloat(oran || 1)) + 'px';
    // Not: site px ile ölçülendirilmiş; body'ye zoom uygulamak yerine
    // kök font-size + transform ölçek kullanmıyoruz (yerleşimi bozardı).
    // Bunun yerine .sp içeriğine zoom veriyoruz:
    document.body.style.zoom = oran === '1' ? '' : String(oran);
  }

  // ---------- Animasyon ----------
  function animasyonUygula(acik) {
    document.documentElement.setAttribute('data-animasyon', acik === '1' ? '1' : '0');
  }

  function uygula() {
    const t = tumu();
    temaUygula(t.tema);
    animasyonUygula(t.animasyon);
    yaziBoyUygula(t.yaziBoy);
  }

  // ---------- Ders motoruna yardımcılar ----------
  // app.js ders kurarken bunları çağır.
  function zorluk() { return ZORLUKLAR[tumu().zorluk] || ZORLUKLAR.normal; }
  function zorlukAdi() { const t = tumu().zorluk; return (ZORLUKLAR[t] || ZORLUKLAR.normal).ad; }

  // Kullanıcı ayarı sıfırla (tema dahil)
  function sifirla() {
    try { localStorage.removeItem(ANAHTAR); } catch (e) { }
    document.documentElement.removeAttribute('data-tema');
    document.documentElement.removeAttribute('data-animasyon');
    document.body.style.zoom = '';
  }

  // ---------- ÖNBELLEĞİ TEMİZLE (destek aracı) ----------
  // NEDEN GEREKLİ: Service worker bazen ESKİ sürümü servis etmeye devam eder
  // (özellikle yeni sayfa eklendiğinde "yeni alanlar nere de?" sorunu bu yüzden
  // çıkıyor). "Yenile" tek başına yetmez çünkü önbellek diskte kalır.
  // Bu fonksiyon: tüm önbellekleri siler, service worker'ı kaldırır ve
  // sayfayı yeniler. Kullanıcı ayarları ve ilerleme ETKİLENMEZ (localStorage).
  function onbellekTemizle() {
    const isler = [];
    try {
      if (window.caches) {
        isler.push(caches.keys().then(function (adlar) {
          return Promise.all(adlar.map(function (a) { return caches.delete(a); }));
        }).catch(function () { }));
      }
    } catch (e) { }
    try {
      if (navigator.serviceWorker) {
        isler.push(navigator.serviceWorker.getRegistrations().then(function (kayitlar) {
          return Promise.all(kayitlar.map(function (k) { return k.unregister(); }));
        }).catch(function () { }));
      }
    } catch (e) { }
    return Promise.all(isler).then(function () {
      // Yenilenirken önbellekten değil ağdan gelsin
      window.location.reload();
    });
  }

  // Bu sürümün numarası (hata raporunda ve ayarlar sayfasında görünür)
  const SURUM = 'v51';

  // Ayarları buluta yedeklemek için (bulut.js ANAHTARLAR listesine eklendi)
  function disaAktar() { return tumu(); }
  function iceAktar(nesne) {
    if (!nesne || typeof nesne !== 'object') return;
    yaz(ANAHTAR, JSON.stringify(Object.assign({}, VARSAYILAN, nesne)));
    uygula();
  }

  // Sayfa açılır açılmaz uygula (tema "yanıp sönme" olmasın diye hemen).
  uygula();

  window.Ayarlar = {
    VARSAYILAN: VARSAYILAN,
    ZORLUKLAR: ZORLUKLAR,
    TEMALAR: TEMALAR,
    al: al,
    tumu: tumu,
    ayarla: ayarla,
    uygula: uygula,
    zorluk: zorluk,
    zorlukAdi: zorlukAdi,
    sifirla: sifirla,
    onbellekTemizle: onbellekTemizle,
    surum: SURUM,
    disaAktar: disaAktar,
    iceAktar: iceAktar
  };
})();
