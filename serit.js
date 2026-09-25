// ============================================================
// DURUM ŞERİDİ (serit.js)  —  Sakar Paisen
//
// SORUN: Oyun durumu (seri, XP, görev) yalnızca dojo'da görünüyordu.
//   Kullanıcı ayarlar/istatistik/kelime sayfasına geçince "nerede
//   kaldım, bugün ne yaptım" bilgisi kayboluyordu. Bu, bağlam kaybı
//   yaratır ve kullanıcı sayfalar arasında kopar.
//
// ÇÖZÜM: Her sayfanın üstüne (veya belirtilen kaba) tek satırlık
//   şerit koyan ortak modül. İçeriği otomatik doldurur.
//
// KULLANIM (sayfa tarafında tek satır):
//     Serit.kur();                    // sayfanın en üstüne ekler
//     Serit.kur('#birYer');           // belirtilen kabın içine ekler
//
// NE GÖSTERİR:
//   🔥 8    günlük seri (bugün yapılmadıysa soluk + uyarı başlığı)
//   ⭐ 780  toplam XP
//   🥋 Usta rütbe
//   📋 1/3  günlük görev durumu
//   🎁     hediye açılmadıysa tıklanabilir uyarı
//
// Şerit TIKLANABİLİR: görev sayacına tıklayınca dojo'ya, hediyeye
// tıklayınca doğrudan sandığı açar.
// ============================================================
(function () {
  'use strict';

  function el(tag, sinif, metin) {
    const e = document.createElement(tag);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    return e;
  }

  // ---------- CSS'i bir kez enjekte et ----------
  // Neden ayrı dosya değil? Bu şerit 4 farklı HTML'de kullanılıyor;
  // stilleri uygulama.css'e koymak her yerde yüklenmesini gerektirirdi.
  // Modül kendi stilini getirdiği için sayfaya tek satır eklemek yeter.
  function stilEkle() {
    if (document.getElementById('seritStil')) return;
    const s = document.createElement('style');
    s.id = 'seritStil';
    s.textContent = `
      .sp-serit {
        display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        width: 100%; box-sizing: border-box;
        padding: 9px max(14px, env(safe-area-inset-left)) 9px max(14px, env(safe-area-inset-right));
        background: var(--zemin-2); border-bottom: 2px solid var(--cizgi);
        font-size: 13.5px; font-weight: 800; color: var(--yazi-soluk);
        position: relative; z-index: 55;
      }
      .sp-serit.sp-serit-yuzen {
        position: sticky; top: 0;
      }
      .sp-serit .ss-parca {
        display: inline-flex; align-items: center; gap: 5px;
        background: var(--kart); border: 2px solid var(--cizgi);
        border-radius: 999px; padding: 4px 11px; white-space: nowrap;
      }
      .sp-serit .ss-parca.tikla { cursor: pointer; transition: border-color .15s, transform .1s; }
      .sp-serit .ss-parca.tikla:hover { border-color: var(--mor); }
      .sp-serit .ss-parca.tikla:active { transform: scale(.96); }
      /* Seri bugün yapılmadıysa: göz oraya gitsin diye turuncu çerçeve */
      .sp-serit .ss-parca.seri-bekliyor {
        border-color: var(--turuncu); background: #fff4ec; color: #b4551f;
        animation: ssNabiz 2.2s ease-in-out infinite;
      }
      @keyframes ssNabiz {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.045); }
      }
      .sp-serit .ss-parca.hediye {
        border-color: var(--altin); background: #fff8e8; color: #8a6100;
      }
      .sp-serit .ss-parca.gorev-tamam { border-color: #b9ece2; background: #e6f8f4; color: var(--turkuaz-koyu); }
      .sp-serit .ss-bosluk { flex: 1; }
      .sp-serit .ss-link { text-decoration: none; }

      /* Koyu/gece temada pastel kutular aşırı parlamasın */
      :root[data-tema] .sp-serit { background: var(--zemin-2); }
      :root[data-tema] .sp-serit .ss-parca.seri-bekliyor { background: #3a2414; color: #ffb877; }
      :root[data-tema] .sp-serit .ss-parca.hediye { background: #2e2814; color: #ffd98a; }
      :root[data-tema] .sp-serit .ss-parca.gorev-tamam { background: #16332e; color: #7ee6d0; }
    `;
    document.head.appendChild(s);
  }

  let serit = null;
  let ayarlar = {};        // kur() seçenekleri burada tutulur

  // ---------- İçeriği tazele ----------
  function guncelle() {
    if (!serit) return;
    serit.replaceChildren();

    // --- Seri ---
    try {
      const s = (window.Ilerleme && Ilerleme.seri) ? Ilerleme.seri() : null;
      if (s) {
        const p = el('span', 'ss-parca seri' + (!s.bugunYapildi && s.sayi > 0 ? ' seri-bekliyor' : ''));
        p.append(document.createTextNode('🔥 ' + s.sayi));
        p.title = s.bugunYapildi
          ? 'Bugün çalıştın, serin güvende!'
          : (s.sayi > 0 ? 'Serin devam ediyor ama bugün henüz çalışmadın!' : 'Bugün yeni bir seri başlat');
        // Seriye tıklayınca dojo'ya git (ders seçmek için)
        p.classList.add('tikla');
        p.onclick = () => { window.location.href = 'dojo.html'; };
        serit.append(p);
      }
    } catch (e) { }

    // --- XP ---
    try {
      if (window.Ilerleme && Ilerleme.xp) {
        const p = el('span', 'ss-parca');
        p.append(document.createTextNode('⭐ ' + Ilerleme.xp()));
        serit.append(p);
      }
    } catch (e) { }

    // --- Rütbe ---
    try {
      if (window.Ilerleme && Ilerleme.rutbe) {
        const r = Ilerleme.rutbe(Ilerleme.xp());
        const p = el('span', 'ss-parca', '🥋 ' + r.ad);
        p.title = r.sonraki
          ? 'Sonraki rütbe: ' + r.sonraki.ad + ' (' + r.sonraki.min + ' XP)'
          : 'En yüksek rütbe!';
        serit.append(p);
      }
    } catch (e) { }

    serit.append(el('span', 'ss-bosluk'));

    // --- Günlük görevler ---
    try {
      if (window.Gorevler && Gorevler.ozet) {
        const o = Gorevler.ozet();
        if (o.toplam > 0) {
          const p = el('span', 'ss-parca tikla' + (o.hepsiTamam ? ' gorev-tamam' : ''),
            (o.hepsiTamam ? '🌟 ' : '📋 ') + o.tamam + '/' + o.toplam);
          p.title = o.hepsiTamam ? 'Bugünkü tüm görevleri tamamladın!' : 'Günlük görevler';
          p.onclick = () => { window.location.href = 'dojo.html'; };
          serit.append(p);
        }
      }
    } catch (e) { }

    // --- Hediye (açılmadıysa göster) ---
    // Bazı sayfalarda hediye zaten büyük buton olarak var (giriş ekranı);
    // orada rozet tekrar olur, bu yüzden kapatılabiliyor.
    try {
      if (!ayarlar.hediyeGizle && window.Hediye && Hediye.acilabilir && Hediye.acilabilir()) {
        const p = el('span', 'ss-parca tikla hediye', '🎁 Hediye');
        p.title = 'Günlük hediyen seni bekliyor!';
        // Dojo'daysak doğrudan sandığı aç; başka sayfadaysak dojo'ya git.
        p.onclick = () => {
          if (typeof window.sandikAc === 'function') window.sandikAc();
          else window.location.href = 'dojo.html';
        };
        serit.append(p);
      }
    } catch (e) { }
  }

  // ---------- Kurulum ----------
  // hedef: CSS seçici (varsayılan: body'nin en başı)
  function kur(hedef, secenekler) {
    ayarlar = secenekler || {};
    stilEkle();

    serit = el('div', 'sp-serit' + (ayarlar.yuzen !== false ? ' sp-serit-yuzen' : ''));
    serit.id = 'spSerit';
    serit.setAttribute('role', 'status');
    serit.setAttribute('aria-label', 'Oyun durumu');

    if (hedef) {
      const kap = (typeof hedef === 'string') ? document.querySelector(hedef) : hedef;
      if (kap) { kap.prepend(serit); }
      else { document.body.prepend(serit); }    // kap bulunamazsa en üste koy
    } else {
      document.body.prepend(serit);
    }

    guncelle();
    return serit;
  }

  window.Serit = {
    kur: kur,
    guncelle: guncelle,
    // Diğer modüller XP/görev değişince haberdar edebilsin
    yenile: guncelle
  };
})();