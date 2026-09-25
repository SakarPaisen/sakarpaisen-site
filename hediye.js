// ============================================================
// GÜNLÜK HEDİYE (hediye.js)  —  Sakar Paisen
//
// AMAÇ: Kullanıcıya her gün geri gelmek için SOMUT bir sebep vermek.
//   "Bugün girmesem hediye kaçar" hissi, oyunlarda en etkili geri dönüş
//   mekaniklerinden biridir (Duolingo'nun sandığı gibi).
//
// NASIL ÇALIŞIR:
//   • Her gün BİR kez açılabilen bir sandık var.
//   • Ödül, seri uzunluğuna göre büyür: uzun seri = daha çok XP.
//   • Aynı gün ikinci kez açılmaz (kayıt tutulur).
//
// ÖDÜL KURALI (seri büyüdükçe cömertleşir):
//   1-2 gün seri  → 20 XP
//   3-6 gün       → 35 XP
//   7-29 gün      → 60 XP
//   30+ gün       → 100 XP
//   Ayrıca her 7. günde 1 SERİ KORUMA hakkı da verilir (büyük ödül).
//
// KAYIT: sakar_hediye = { son: '2024-05-12', toplam: 7 }
//   son   : sandığın en son açıldığı gün
//   toplam: toplam kaç kez açıldı (istatistik/başarım için)
// ============================================================
(function () {
  'use strict';

  const ANAHTAR = 'sakar_hediye';

  function ham(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function yaz(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  function tarih(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
      '-' + String(d.getDate()).padStart(2, '0');
  }

  function kayit() {
    let k = null;
    try { k = JSON.parse(ham(ANAHTAR)); } catch (e) { }
    if (!k || typeof k !== 'object') k = { son: '', toplam: 0 };
    if (!k.son) k.son = '';
    if (!k.toplam) k.toplam = 0;
    return k;
  }

  // Bugün açılabilir mi?
  function acilabilir() { return kayit().son !== tarih(); }

  // Seri uzunluğuna göre ödülü hesapla (henüz vermez)
  function odulHesapla(seriSayisi) {
    const s = seriSayisi || 0;
    let xp;
    if (s >= 30) xp = 100;
    else if (s >= 7) xp = 60;
    else if (s >= 3) xp = 35;
    else xp = 20;

    // Her 7 günlük seride ekstra seri koruma (büyük ödül)
    const koruma = (s > 0 && s % 7 === 0) ? 1 : 0;

    return { xp: xp, koruma: koruma };
  }

  // Sandığı aç: ödülü UYGULAR ve döndürür.
  // seriSayisi ve Ilerleme çağıran taraftan gelir (bu modül oyun bilmez).
  function ac(seriSayisi) {
    if (!acilabilir()) return null;
    const k = kayit();
    const odul = odulHesapla(seriSayisi);

    // XP ver
    try { if (window.Ilerleme) Ilerleme.xpEkle(odul.xp); } catch (e) { }

    // Seri koruma hakkı ver (varsa)
    if (odul.koruma > 0) {
      try {
        const s = JSON.parse(ham('sakar_seri') || '{}');
        s.koruma = Math.min((s.koruma || 0) + odul.koruma, 2);   // en fazla 2
        yaz('sakar_seri', JSON.stringify(s));
      } catch (e) { }
    }

    k.son = tarih();
    k.toplam = (k.toplam || 0) + 1;
    yaz(ANAHTAR, JSON.stringify(k));

    return Object.assign({}, odul, { toplam: k.toplam });
  }

  function toplam() { return kayit().toplam || 0; }

  // Kaç gün üst üste alındı? (art arda günler)
  function durum() {
    const k = kayit();
    return { acilabilir: k.son !== tarih(), son: k.son, toplam: k.toplam || 0 };
  }

  function sifirla() { try { localStorage.removeItem(ANAHTAR); } catch (e) { } }

  window.Hediye = {
    acilabilir: acilabilir,
    ac: ac,
    durum: durum,
    toplam: toplam,
    odulHesapla: odulHesapla,
    sifirla: sifirla
  };
})();// ============================================================
// GÜNLÜK HEDİYE SANDIĞI — ORTAK GÖRÜNÜM (hediye.js sonuna eklenir)
//
// Neden hediye.js içinde? Sandık hem giriş ekranında (index.html) hem
// dojoya (dojo.html) açılabiliyor. Kod iki yerde kopyalanırsa biri
// güncellenip diğeri unutulur. Tek yerden yönetiliyor.
//
// KULLANIM:  Hediye.sandikAc(seriSayisi)
//   Ödül Hediye.ac() içinde uygulanır; bu fonksiyon SADECE gösterir.
// ============================================================
(function () {
  'use strict';

  function el(tag, sinif, metin) {
    const e = document.createElement(tag);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    return e;
  }

  // Sandık ekranını açar. seriSayisi verilmezse Ilerleme'den okur.
  function sandikAc(seriSayisi) {
    if (!window.Hediye || !Hediye.acilabilir()) return;

    let seri = seriSayisi;
    if (seri === undefined) {
      try { seri = (window.Ilerleme && Ilerleme.seri) ? Ilerleme.seri().sayi : 0; }
      catch (e) { seri = 0; }
    }

    const odul = Hediye.ac(seri);
    if (!odul) return;

    const katman = el('div', 'sandik-katman');
    const kutu = el('div', 'sandik-kutu');
    const gorsel = el('div', 'sandik-gorsel', '🎁');
    kutu.append(
      el('h3', '', 'Günlük hediye!'),
      el('p', '', seri >= 7
        ? seri + ' günlük serin sayesinde büyük ödül! 👏'
        : 'Her gün gelirsen ödül büyür. Seri yapmayı dene!'),
      gorsel
    );

    // Sandığa tıklayınca açılır (merak etkisi: önce tıkla, sonra gör)
    gorsel.onclick = () => {
      if (gorsel.classList.contains('acildi')) return;
      gorsel.classList.add('acildi');
      gorsel.textContent = '✨';
      try { if (window.Ses) Ses.dogru(); } catch (e) { }
      try { if (typeof window.konfeti === 'function') window.konfeti(40); } catch (e) { }

      const satir = el('div', 'sandik-odul');
      satir.append(el('span', '', '+' + odul.xp + ' XP'));
      if (odul.koruma > 0) satir.append(el('span', 'koruma', '🛡️ +1 Seri Koruma'));
      kutu.append(satir);

      const kapat = el('button', 'sp-btn yesil', 'HARİKA!');
      kapat.style.marginTop = '16px';
      kapat.onclick = () => {
        katman.remove();
        // Hediye XP'si yeni bir başarım açmış olabilir
        if (window.Basarimlar) {
          try {
            const yeni = Basarimlar.kontrol();
            if (yeni.length) Basarimlar.kutlamaGoster(yeni, document.body);
          } catch (e) { }
        }
        // Sayaçlar (XP, şerit) tazelensin: sayfayı yenile.
        // Giriş ekranındaysak adım ekranı yeniden kurulur, kullanıcı kaybolmaz.
        setTimeout(() => location.reload(), 400);
      };
      kutu.append(kapat);
    };

    katman.append(kutu);
    // Boşluğa tıklayınca kapanır (ama sandık açılmadan kapatılırsa ödül gider
    // değil — Hediye.ac() zaten çağrıldı, kayıt tutuldu. Bu bilinçli: kazara
    // kapatma yüzünden ödül kaybı yaşanmasın.)
    katman.onclick = (e) => { if (e.target === katman) katman.remove(); };
    document.body.append(katman);
  }

  // Ortak API'ye ekle
  window.Hediye = window.Hediye || {};
  window.Hediye.sandikAc = sandikAc;
})();