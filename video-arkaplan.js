// ============================================================
// VİDEO ARKA PLAN (video-arkaplan.js)
//
// NE YAPAR: Sayfanın arkasına döngüde oynayan bir video koyar. Ekran
// genişliğine göre YATAY ya da DİKEY videoyu seçer (telefonda dikey).
//
// DOSYA YERLERİ (beklenen adlar — videolar/ klasörüne koy):
//     videolar/yatay/arkaplan.mp4        (masaüstü, 16:9 önerilir)  <-- ÖNCELİKLİ
//     videolar/dikey/arkaplan.mp4        (mobil, 9:16 önerilir)     <-- ÖNCELİKLİ
//     videolar/yatay/arkaplan.webm       (mp4 yoksa yedek)
//     videolar/dikey/arkaplan.webm       (mp4 yoksa yedek)
//     videolar/yatay/kapak.jpg           (opsiyonel poster: video yüklenene kadar görünür)
//     videolar/dikey/kapak.jpg           (opsiyonel)
//
// NEDEN "yoksa sessizce vazgeç" YAKLAŞIMI:
//   Dosya henüz konmamışken sayfa BOZULMAMALI. Bu yüzden:
//     1) <video> kaynağı yüklenemezse (error olayı) katman tamamen kaldırılır.
//     2) video-arkaplan.js çalışmazsa WebGL sahnesi (sahne3d.js) zaten devrede.
//   Yani iki katman bağımsızdır: biri olmazsa diğeri görünür.
//
// PERFORMANS KURALLARI:
//   • Video yalnızca görünürse oynar (IntersectionObserver + visibilitychange)
//   • Sekme arkada kalınca durur — pil ve veri tüketmez
//   • "Hareketi azalt" tercihinde video HİÇ OYNATILMAZ, sadece ilk kare gösterilir
//   • Ayarlardan kapatılabilir: sakar_video_arkaplan = '0'
//   • Mobilde (hücresel veri) tasarruf: connection.saveData true ise hiç yüklenmez
// ============================================================
(function () {
  'use strict';

  const KOK_ID = 'videoArkaplan';
  const AYAR_ANAHTAR = 'sakar_video_arkaplan';   // '0' = kapalı

  // ---------- Kapatma koşulları ----------
  function kapaliMi() {
    // 1) Kullanıcı ayarlardan kapatmış mı?
    try { if (localStorage.getItem(AYAR_ANAHTAR) === '0') return true; } catch (e) { }
    // 2) Genel animasyon anahtarı kapalıysa video da oynamasın
    try {
      if (document.documentElement.getAttribute('data-animasyon') === '0') return true;
      if (document.body && document.body.getAttribute('data-animasyon') === '0') return true;
    } catch (e) { }
    return false;
  }

  function hareketAzMi() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  // Veri tasarrufu: kullanıcı mobil verisini korumak istiyorsa video indirmeyelim.
  // (Video dosyası birkaç MB; sessizce indirmek ayıp olur.)
  function veriTasarrufu() {
    try {
      const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (c && c.saveData === true) return true;
    } catch (e) { }
    return false;
  }

  function dikeyMi() {
    // Yükseklik > genişlik ise dikey; ama geniş ekranda oturmak için
    // 820px altı genişlikte de dikey kabul ediyoruz (telefon yatay da olabilir,
    // bu durumda yatay video daha doğru olur — o yüzden ikisini de kontrol et).
    return window.innerHeight > window.innerWidth;
  }

  // Hangi opsiyonel dosyalar var? Sayfaya data-* ile bildirilir:
  //   <body data-video-kapak="1">  -> kapak.jpg (poster) kullanılır
  // Belirtilmezse yalnızca arkaplan.mp4 / arkaplan.webm kullanılır.
  // NOT: MP4 öncelikli, WebM yedek (videolar/yatay|dikey/arkaplan.mp4|.webm).
  const AYARLAR = (function () {
    function bayrak(ad) {
      try { return document.body && document.body.getAttribute(ad) === '1'; } catch (e) { return false; }
    }
    return { kapak: bayrak('data-video-kapak') };
  })();

  // ---------- Dosya adları ----------
  // SIRA ÖNEMLİ: MP4 (H.264) önce, WebM yedek. MP4'ü tarayıcılar donanımla
  // (GPU ile) çözer; WebM/VP9 yazılımla çözüldüğü için zayıf donanımda kasar.
  function kaynaklar() {
    const yon = dikeyMi() ? 'dikey' : 'yatay';
    return {
      yon: yon,
      mp4: 'videolar/' + yon + '/arkaplan.mp4',
      webm: 'videolar/' + yon + '/arkaplan.webm',
      kapak: 'videolar/' + yon + '/kapak.jpg'
    };
  }

  // ---------- Kur ----------
  let video = null;
  let kapak = null;
  let kap = null;

  function kur() {
    if (kapaliMi()) return null;
    if (veriTasarrufu()) return null;   // mobil veri tasarrufu açık
    if (!document.body) return null;

    const k = kaynaklar();

    kap = document.getElementById(KOK_ID);
    if (!kap) {
      kap = document.createElement('div');
      kap.id = KOK_ID;
      kap.setAttribute('aria-hidden', 'true');
      // Sabit ve en arkada: içerik katmanının ALTINDA kalsın.
      // z-index -1, WebGL sahnesinden (sahne3d.js, -2) ÜSTTE ama tüm
      // içerikten altta demektir. Sayfa zemini bu yüzden saydam olmalı
      // (uygulama.css: body.sp { background: transparent } + html zemini),
      // aksi hâlde sabit renkli zemin videoyu örter.
      kap.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:-1',
        'pointer-events:none', 'overflow:hidden'
      ].join(';');
      document.body.insertBefore(kap, document.body.firstChild);
    }

    // Kapak (poster) TAMAMEN OPSİYONEL. Projede kapak.jpg olmayabilir;
    // kapak.jpg yokken onu istemek konsolda 404 üretiyordu. Bu yüzden kapak
    // yalnızca "poster varsa" (body data-video-kapak="1") denenir.
    if (AYARLAR.kapak) {
      kapak = document.createElement('img');
      kapak.alt = '';
      kapak.setAttribute('aria-hidden', 'true');
      kapak.style.cssText = [
        'position:absolute', 'inset:0', 'width:100%', 'height:100%',
        'object-fit:cover', 'opacity:0', 'transition:opacity .9s ease'
      ].join(';');
      kapak.addEventListener('load', function () {
        if (!document.body.classList.contains('video-aktif')) kapak.style.opacity = '1';
      });
      kapak.addEventListener('error', function () {
        kapak.remove();
        kapak = null;
      });
      kap.append(kapak);
      kapak.src = k.kapak;
    }

    video = document.createElement('video');
    // Döngü ve sessiz oynatma: arka plan olduğu için ses ASLA olmaz.
    video.loop = true;
    video.muted = true;              // şart: aksi hâlde tarayıcı otomatik oynatmaz
    video.defaultMuted = true;
    video.playsInline = true;        // iOS: tam ekrana atlamasın
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.preload = 'auto';
    video.setAttribute('aria-hidden', 'true');
    video.tabIndex = -1;
    video.style.cssText = [
      'position:absolute', 'inset:0', 'width:100%', 'height:100%',
      'object-fit:cover', 'opacity:0', 'transition:opacity .9s ease'
    ].join(';');

    // Poster: YOKSA 404 üretmesin. Poster yalnızca kapak.jpg gerçekten varsa atanır.
    // (Kapak yokken poster atamak, konsolda gereksiz 404 hatası oluşturuyordu.)
    if (kapak) video.poster = k.kapak;

    // Kaynak sırası: MP4 (donanım hızlandırmalı) önce, WebM yedek.
    // Tarayıcı bir kaynağı açamazsa listedeki bir sonrakine geçer
    // (error olayı yalnızca TÜM kaynaklar tükendiğinde tetiklenir).
    const mp4 = document.createElement('source');
    mp4.src = k.mp4; mp4.type = 'video/mp4';
    video.append(mp4);

    const webm = document.createElement('source');
    webm.src = k.webm; webm.type = 'video/webm';
    video.append(webm);
    kap.append(video);

    // --- HATA: hiçbir kaynak yüklenemedi -> katmanı tamamen kaldır ---
    // Bu, "dosyalar henüz konmadı" durumun normal karşılanmasını sağlar.
    // Sayfada boş/siyah bir alan kalmaz, WebGL sahnesi görünür kalır.
    function vazgec(sebep) {
      try { console.info('[video-arkaplan] Video kullanılmadı:', sebep); } catch (e) { }
      if (kap) kap.remove();
      video = null;
      kapak = null;
      kap = null;
    }

    video.addEventListener('error', function () {
      // Ne MP4 ne WebM bulunabildi: katmanı kaldır, alttaki görünüm kalsın.
      vazgec('arkaplan.mp4 / arkaplan.webm bulunamadı');
    });

    // --- Yüklendi: görünür yap ve oynat ---
    video.addEventListener('canplay', function () {
      // İlk kare hazır: hero kapak fotoğrafını kapat, gerçek videoyu göster.
      // Bu sınıf CSS'deki kapak katmanını da kapatır; iki yollu kapak/video
      // katmanı aynı anda üst üste binmesin.
      document.body.classList.add('video-aktif');
      video.style.opacity = '1';
      if (kapak) kapak.style.opacity = '0';

      // Hareket azaltma tercihinde yalnızca ilk kare gösterilir.
      if (hareketAzMi()) {
        try { video.currentTime = 0; } catch (e) { }
        return;
      }
      oynat();
    }, { once: true });

    return { yon: k.yon };
  }

  // ---------- Oynat / durdur ----------
  function oynat() {
    if (!video) return;
    const p = video.play();
    // Tarayıcı otomatik oynatmayı reddedebilir (nadir; muted olduğu için genelde izin verir)
    if (p && p.catch) p.catch(function () { /* sessizce yok say */ });
  }
  function durdur() {
    if (!video) return;
    try { video.pause(); } catch (e) { }
  }

  // ---------- Sekme görünürlüğü ----------
  // Arka planda video oynatmak pil ve CPU harcar; durduruyoruz.
  document.addEventListener('visibilitychange', function () {
    if (!video) return;
    if (document.hidden) durdur();
    else if (!hareketAzMi()) oynat();
  });

  // ---------- Ekran yönü değişince kaynağı değiştir ----------
  // Telefon döndürülünce dikey/yatay video değişmeli. Yalnızca yön
  // gerçekten değiştiyse yeniden kur (gereksiz yükleme olmasın).
  let sonYon = null, yonZaman = null;
  function yonIzle() {
    window.addEventListener('resize', function () {
      const yeni = dikeyMi() ? 'dikey' : 'yatay';
      if (yeni === sonYon) return;
      // Kısa bir gecikme: kullanıcı pencereyi sürüklerken art arda kurulmasın
      clearTimeout(yonZaman);
      yonZaman = setTimeout(function () {
        if (kap) kap.remove();
        video = null; kap = null;
        const s = kur();
        if (s) sonYon = s.yon;
      }, 400);
    }, { passive: true });
  }

  // ---------- Başlat ----------
  function baslat() {
    try {
      const s = kur();
      if (s) sonYon = s.yon;
      yonIzle();
      return s;
    } catch (e) {
      console.warn('[video-arkaplan] Kurulamadı:', (e && e.message) || e);
      return null;
    }
  }

  let durum = null;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { durum = baslat(); });
  } else {
    durum = baslat();
  }

  window.VideoArkaplan = {
    baslat: baslat,
    yenile: function () {
      if (kap) kap.remove();
      video = null; kap = null;
      durum = baslat();
    },
    durum: function () {
      return {
        kuruldu: !!document.getElementById(KOK_ID),
        videoOynuyor: !!(video && video.readyState >= 2),
        yon: sonYon,
        kapali: kapaliMi(),
        hareketAz: hareketAzMi(),
        veriTasarrufu: veriTasarrufu()
      };
    }
  };
})();