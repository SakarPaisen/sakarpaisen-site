// ============================================================
// SÜRÜM GÜNCELLEME BİLDİRİMİ (guncelleme.js)
//
// NEDEN VAR — düzeltilen gerçek bir hata:
//   pwa.js ve sw.js, service worker yeni sürümü devreye girdiğinde
//   `sw-guncellendi` olayını GÖNDERİYORDU; ama bu olayı DİNLEYEN hiçbir kod
//   yoktu. Sonuç: kullanıcı eski önbelleği çalıştırmaya devam ediyor,
//   yeni eklenen sayfalar/alanlar hiç görünmüyordu ve sebebi anlaşılmıyordu
//   ("yeni alanlar nerede?").
//
// ÇÖZÜM: Olayı dinle, kullanıcıya görünür ve tıklanabilir bir bildirim çıkar.
// Kararı kullanıcı verir: sayfayı kendisi yeniler. (Otomatik reload, giriş
// akışını bozuyordu; pwa.js'teki nota bak.)
// ============================================================
(function () {
  'use strict';

  // Zaten gösterildiyse tekrar gösterme (sayfa başına bir kez)
  let gosterildi = false;

  function bildirimGoster() {
    if (gosterildi) return;

    // ÖNEMLİ: Açılış (hero) ekranında GÖSTERME.
    // Neden: o ekran sadece logo + tek buton olsun diye tasarlandı; üstte
    // beliren "yeni sürüm hazır" kutusu videoyu ve başlığı örtüyordu.
    // Kullanıcı BAŞLA'ya basıp akışa girince uygun yerde gösterilir.
    if (document.body && document.body.classList.contains('hero-asamasi')) {
      document.addEventListener('basla-sonrasi', bildirimGoster, { once: true });
      return;
    }

    gosterildi = true;

    // Aynı bildirim zaten duruyorsa çiftlemeyelim
    if (document.getElementById('sp-guncelleme')) return;

    const kutu = document.createElement('div');
    kutu.id = 'sp-guncelleme';
    // Durum şeridinin üstünü örtmesin; görev sayacı tıklanabilir kalmalı.
    const serit = document.getElementById('spSerit');
    const ust = serit ? Math.max(18, Math.ceil(serit.getBoundingClientRect().bottom + 10)) : 18;
    // Satır içi stil: yeni bir CSS dosyası eklemeye gerek kalmasın
    kutu.style.cssText = [
      // ÜSTTE: alttaki DEVAM ET / şık butonlarının üstünü KAPATMASIN
      'position:fixed', 'left:50%', 'top:' + ust + 'px', 'transform:translateX(-50%)',
      'z-index:200', 'display:flex', 'align-items:center', 'gap:12px',
      'max-width:calc(100vw - 28px)', 'padding:12px 14px',
      'background:var(--kart, #fff)', 'color:var(--yazi, #33302b)',
      'border:2px solid var(--mor, #7b5cf0)', 'border-radius:16px',
      'box-shadow:0 6px 0 var(--cizgi, #e6ddcc)',
      'font-family:inherit', 'font-size:13.5px', 'font-weight:700'
    ].join(';');

    const yazi = document.createElement('span');
    yazi.textContent = '🔄 Yeni sürüm hazır. Görmek için yenile.';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'YENİLE';
    btn.style.cssText = [
      'background:var(--mor, #7b5cf0)', 'color:#fff', 'border:none',
      'border-radius:11px', 'padding:9px 16px', 'font-family:inherit',
      'font-size:13px', 'font-weight:800', 'letter-spacing:.4px', 'cursor:pointer',
      'box-shadow:0 3px 0 var(--mor-golge, #4f34bd)', 'flex:none'
    ].join(';');
    btn.onclick = function () { window.location.reload(); };

    const kapat = document.createElement('button');
    kapat.type = 'button';
    kapat.textContent = '✕';
    kapat.setAttribute('aria-label', 'Bildirimi kapat');
    kapat.style.cssText = [
      'background:none', 'border:none', 'color:var(--yazi-soluk, #7d7568)',
      'font-size:15px', 'cursor:pointer', 'padding:4px', 'flex:none'
    ].join(';');
    kapat.onclick = function () { kutu.remove(); };

    kutu.append(yazi, btn, kapat);
    document.body.append(kutu);

    // Erişilebilirlik: ekran okuyucular değişikliği duyurur
    kutu.setAttribute('role', 'status');
    kutu.setAttribute('aria-live', 'polite');
  }

  // 1) pwa.js controllerchange ile haber verir
  document.addEventListener('sw-guncellendi', bildirimGoster);

  // 2) sw.js, window istemcilerine mesaj gönderir (activate sırasında)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function (e) {
      const veri = e && e.data;
      if (veri && veri.tip === 'sw-guncellendi') bildirimGoster();
    });
  }

  // 3) SW kaydı sayfa açıldıktan sonra güncellenir; updatefound olayını da izle.
  //    Böylece mesaj kanalı gecikse bile bildirim kaçmaz.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function (kayit) {
      if (kayit.waiting) bildirimGoster();      // bekleyen sürüm varsa hemen söyle
      kayit.addEventListener('updatefound', function () {
        const yeni = kayit.installing;
        if (yeni) yeni.addEventListener('statechange', function () {
          if (yeni.state === 'installed' && navigator.serviceWorker.controller) bildirimGoster();
        });
      });
    }).catch(function () { });
  }
})();
