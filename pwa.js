// PWA: service worker kaydı + otomatik güncelleme + "uygulamayı yükle" düğmesi.
// Not: service worker sadece https:// veya http://localhost üzerinde çalışır (file:// üzerinde çalışmaz).
(function () {
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    // SERVICE WORKER KAYDI — SAYFA YÜKLEMESİNİ BLOKE ETMEZ.
    // Eskiden `window.addEventListener('load', ...)` içinde kaydediliyordu ve
    // eski bir SW kayıtlıysa yükleme 26 saniyeye çıkıyordu.
    // Artık: sayfa tamamen hazır olduktan SONRA, boşta kalan anda kaydedilir.
    function swKaydet() {
      navigator.serviceWorker.register('sw.js').then(function (kayit) {
        // Yeni sürüm indirildiğinde beklemeden devreye al.
        // ÖNEMLİ: Aksi hâlde kullanıcı, sw.js'i yenileyene kadar ESKİ kodu çalıştırmaya
        // devam eder. Bu projede bu yüzden oyun.html yerine giriş ekranı açılıyordu.
        kayit.addEventListener('updatefound', function () {
          const yeni = kayit.installing;
          if (!yeni) return;
          yeni.addEventListener('statechange', function () {
            if (yeni.state === 'installed' && navigator.serviceWorker.controller) {
              // Bekleyen sürümü hemen devreye al
              yeni.postMessage({ tip: 'guncelle' });
            }
          });
        });
        // Açılışta güncelleme var mı diye sor (tarayıcı 24 saat bekleyebilir)
        kayit.update().catch(function () {});
      }).catch(function () {});

      // DİKKAT: Yeni sürüm devreye girince sayfayı OTOMATİK YENİLEME.
      // Eskiden location.reload() çağrılıyordu ve şu soruna yol açıyordu:
      // sayfa açılırken SW güncelleniyor, sayfa yenileniyor ve o anda
      // kayıt henüz okunmamışsa kullanıcı kendini giriş ekranında buluyordu.
      // (Ayrıca sayfa yüklemesi 18 saniyeye çıkıyordu.)
      // Bunun yerine: yeni sürüm hazır olduğunu bildir, kararı kullanıcıya bırak.
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        document.dispatchEvent(new Event('sw-guncellendi'));
      });
    }

    // Boşta kalınca kaydet; desteklenmiyorsa load'dan sonra dene.
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(function () { swKaydet(); }, { timeout: 3000 });
    } else {
      window.addEventListener('load', function () { setTimeout(swKaydet, 200); });
    }
  }
  let bekleyen = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); bekleyen = e;
    document.dispatchEvent(new Event('pwa-hazir'));
  });
  window.addEventListener('appinstalled', function () {
    bekleyen = null; document.dispatchEvent(new Event('pwa-kuruldu'));
  });
  window.PWA = {
    kurulabilir: function () { return !!bekleyen; },
    kur: function () {
      if (!bekleyen) return Promise.resolve();
      bekleyen.prompt();
      return bekleyen.userChoice.then(function () { bekleyen = null; });
    }
  };
})();
