// ============================================================
// GÜNLÜK GÖREVLER (gorevler.js)  —  Sakar Paisen
//
// AMAÇ: Kullanıcı "bugün ne yapacağım?" diye düşünmesin. Her gün
//   3 küçük görev verilir; tamamlayınca ekstra XP + rozet hissi.
//   Bu, günlük geri dönüş oranını (retention) en çok artıran mekaniktir.
//
// NASIL ÇALIŞIR:
//   • Görevler GÜNE göre üretilir (deterministik): aynı gün hep aynı görevler.
//     Bu önemli: rastgele üretip kaydetmek yerine tarihten türetiyoruz,
//     böylece sayfa yenilense de görev değişmez.
//   • İlerleme localStorage'a yazılır: sakar_gorevler = {tarih, ilerleme:{}, tamam:[]}
//   • Gün değişince otomatik sıfırlanır.
//
// API (app.js kullanır):
//   Gorevler.olay('ders_bitti')      -> ilgili görevlerin ilerlemesini artır
//   Gorevler.olay('hatasiz_ders')    -> hatasız biten ders
//   Gorevler.olay('dogru_cevap', 3)  -> 3 doğru cevap
//   Gorevler.liste()                 -> [{id, ad, simge, hedef, ilerleme, tamam}]
//   Gorevler.tamamlananYeni()        -> bu olayda TAMAMLANAN görevler (kutlama)
// ============================================================
(function () {
  'use strict';

  const ANAHTAR = 'sakar_gorevler';

  // ------------------------------------------------------------
  // GÖREV HAVUZU
  //   id       : kalıcı anahtar
  //   ad       : görev metni (kullanıcı görür)
  //   simge    : emoji
  //   hedef    : kaç birim gerekiyor
  //   olay     : hangi olay ilerletir
  //   odul     : tamamlanınca verilen XP
  // ------------------------------------------------------------
  const HAVUZ = [
    { id: 'ders-2', ad: '2 ders tamamla', simge: '🥋', hedef: 2, olay: 'ders_bitti', odul: 25 },
    { id: 'ders-3', ad: '3 ders tamamla', simge: '🥋', hedef: 3, olay: 'ders_bitti', odul: 40 },
    { id: 'ders-1', ad: '1 ders tamamla', simge: '🥋', hedef: 1, olay: 'ders_bitti', odul: 15 },
    { id: 'hatasiz-1', ad: 'Bir dersi hatasız bitir', simge: '✨', hedef: 1, olay: 'hatasiz_ders', odul: 30 },
    { id: 'dogru-25', ad: '25 doğru cevap ver', simge: '✅', hedef: 25, olay: 'dogru_cevap', odul: 25 },
    { id: 'dogru-40', ad: '40 doğru cevap ver', simge: '✅', hedef: 40, olay: 'dogru_cevap', odul: 35 },
    { id: 'xp-60', ad: '60 XP kazan', simge: '⭐', hedef: 60, olay: 'xp', odul: 30 },
    { id: 'xp-120', ad: '120 XP kazan', simge: '🌟', hedef: 120, olay: 'xp', odul: 50 },
    { id: 'teknik-1', ad: 'Tekrar dersini bitir', simge: '🔁', hedef: 1, olay: 'tekrar_ders', odul: 30 },
    { id: 'kelime-1', ad: 'Kelime defterine 5 kelime ekle', simge: '📖', hedef: 5, olay: 'kelime', odul: 25 },
    // VİDEO GÖREVLERİ: kanaldaki anlatımları izlemek de öğrenmedir.
    // Kimya: video izlemek metin okumaktan kolay gelir; bu görevler
    // öğrenciyi "bugün hiçbir şey yapmadım" hissinden çıkarır.
    { id: 'video-1', ad: '1 video ders izle', simge: '🎬', hedef: 1, olay: 'video_izlendi', odul: 20 },
    { id: 'video-2', ad: '2 video ders izle', simge: '🎬', hedef: 2, olay: 'video_izlendi', odul: 35 }
  ];

  function ham(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function yaz(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  // Modül durumu: son olayda tamamlanan görevler
  let sonTamamlanan = [];

  function tarih(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
      '-' + String(d.getDate()).padStart(2, '0');
  }

  // Tarihten türetilen TUTARLI sözde-rastgele sayı (aynı gün = aynı sayı)
  function gunTohumu() {
    const t = tarih();
    let h = 0;
    for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
    return h;
  }

  // Kayıt: { tarih, ilerleme: {gorevId: sayi}, tamam: [gorevId] }
  function kayit() {
    let k = null;
    try { k = JSON.parse(ham(ANAHTAR)); } catch (e) { }
    if (!k || k.tarih !== tarih()) {
      // Yeni gün: sıfırdan başla
      k = { tarih: tarih(), ilerleme: {}, tamam: [] };
      yaz(ANAHTAR, JSON.stringify(k));
    }
    if (!k.ilerleme) k.ilerleme = {};
    if (!k.tamam) k.tamam = [];
    return k;
  }

  function kaydet(k) { yaz(ANAHTAR, JSON.stringify(k)); }

  // ---------- Bugünün 3 görevi (tarihten türetilir, sabit) ----------
  let onbellek = null, onbellekGun = null;
  function bugununGorevleri() {
    const gun = tarih();
    if (onbellek && onbellekGun === gun) return onbellek;

    // Farklı "olay" tiplerinden dengeli seç: hepsi aynı tip olmasın.
    const tohum = gunTohumu();
    const secilen = [];
    const kullanilanOlay = {};

    // 1) Her zaman bir "ders" görevi olsun (ana döngü bu)
    const dersler = HAVUZ.filter(g => g.olay === 'ders_bitti');
    secilen.push(dersler[tohum % dersler.length]);
    kullanilanOlay.ders_bitti = true;

    // 2) Diğerlerinden 2 tane, farklı olay tiplerinden
    const digerleri = HAVUZ.filter(g => g.olay !== 'ders_bitti');
    for (let i = 0; i < digerleri.length && secilen.length < 3; i++) {
      const g = digerleri[(tohum + i * 7) % digerleri.length];
      if (secilen.some(s => s.id === g.id)) continue;
      if (kullanilanOlay[g.olay]) continue;
      secilen.push(g);
      kullanilanOlay[g.olay] = true;
    }
    // Yeterli çeşit yoksa kalanla doldur
    for (let i = 0; secilen.length < 3 && i < digerleri.length; i++) {
      const g = digerleri[(tohum + i * 3) % digerleri.length];
      if (!secilen.some(s => s.id === g.id)) secilen.push(g);
    }

    onbellek = secilen;
    onbellekGun = gun;
    return secilen;
  }

  // ---------- Görünüm için liste ----------
  function liste() {
    const k = kayit();
    return bugununGorevleri().map(g => {
      const ilerleme = Math.min(k.ilerleme[g.id] || 0, g.hedef);
      return {
        id: g.id, ad: g.ad, simge: g.simge, hedef: g.hedef, odul: g.odul,
        ilerleme: ilerleme,
        tamam: k.tamam.indexOf(g.id) !== -1
      };
    });
  }

  function ozet() {
    const l = liste();
    const t = l.filter(g => g.tamam).length;
    return { tamam: t, toplam: l.length, hepsiTamam: t === l.length && l.length > 0 };
  }

  // ---------- OLAY: ilerleme artır ----------
  // Dönen değer: BU ÇAĞRIDA TAMAMLANAN görevler (kutlama + ödül için).
  // ÖNEMLİ: sonOdul() çağrıya bağlıdır; app.js dönen diziden hesaplamalı.
  // Aksi hâlde olaylar arasında başka bir çağrı durumu sıfırlar ve ödül
  // 0 görünür (testte yakalandı).
  function olay(ad, miktar) {
    const n = (miktar === undefined) ? 1 : miktar;
    const k = kayit();
    const tamamlananlar = [];
    let degisti = false;

    bugununGorevleri().forEach(g => {
      if (g.olay !== ad) return;

      const onceki = k.ilerleme[g.id] || 0;
      if (onceki >= g.hedef) return;                     // zaten tamam
      const yeni = Math.min(onceki + n, g.hedef);
      k.ilerleme[g.id] = yeni;
      degisti = true;

      if (yeni >= g.hedef && k.tamam.indexOf(g.id) === -1) {
        k.tamam.push(g.id);
        tamamlananlar.push(g);
      }
    });

    if (degisti) kaydet(k);
    sonTamamlanan = tamamlananlar;
    return tamamlananlar;
  }

  // Verilen tamamlanan görev listesinin toplam ödülü.
  // app.js'in kullanması gereken sürüm: Gorevler.odulHesapla(dizi)
  function odulHesapla(dizi) {
    if (!dizi || !dizi.length) return 0;
    return dizi.reduce((t, g) => t + (g.odul || 0), 0);
  }

  // Son olayda tamamlananların ödülü (kısayol).
  function sonOdul() { return odulHesapla(sonTamamlanan); }

  function tamamlananYeni() { return sonTamamlanan.slice(); }

  // ---------- VİDEO İZLEME (kısayol) ----------
  // video-sayfa.js "izledim" düğmesine basıldığında çağırır.
  // NEDEN AYRI FONKSİYON: çağıran tarafın olay adını bilmesi gerekmesin
  // ('video_izlendi' dizesi tek yerde kalsın, yazım hatası riski olmasın).
  function videoIzle() { return olay('video_izlendi', 1); }

  // ---------- Buton/harita için: tamamlanınca işaretle ----------
  function gunSifirla() { try { localStorage.removeItem(ANAHTAR); } catch (e) { } onbellek = null; }

  window.Gorevler = {
    HAVUZ: HAVUZ,
    liste: liste,
    ozet: ozet,
    olay: olay,
    videoIzle: videoIzle,
    sonOdul: sonOdul,
    odulHesapla: odulHesapla,
    tamamlananYeni: tamamlananYeni,
    bugununGorevleri: bugununGorevleri,
    gunSifirla: gunSifirla
  };
})();