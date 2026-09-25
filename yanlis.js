// ============================================================
// YANLIŞ DEFTERİ (yanlis.js)  —  Sakar Paisen
//
// SORUN: Mevcut "zayıf harf" takibi (Ilerleme.zayif) oran bazlıdır ve
//   harf birkaç kez doğru bilinince listeden ÇIKAR. Ama bazı harfler
//   kullanıcı için ALIŞKANLIK HÂLİNE gelir: her seferinde karıştırır.
//   Örneğin し (shi) ile つ (tsu), ぬ (nu) ile め (me)...
//
// ÇÖZÜM: Bu modül "karıştırma ÇİFTLERİNİ" tutar. Kullanıcı し'ye yanlış
//   cevap verip doğrusu つ ise, (し, つ) çiftinin sayacı artar. Böylece
//   hangi harfleri BİRBİRİYLE karıştırdığı ortaya çıkar ve ders üreticisi
//   tam o ikisini yan yana sorar (klasik "eşleştirme" tekniği).
//
// KAYIT: sakar_ciftler = { "h:shi|h:tsu": {n: 3, son: '2024-05-12'} }
//   n  : kaç kez karıştırıldı
//   son: en son ne zaman (eski kayıtların ağırlığı azalsın)
//
// API:
//   Yanlis.ciftKaydet(verilenId, dogruId)   -> karıştırma kaydı
//   Yanlis.enCokKaristirilan(n)             -> en çok karışan çiftler
//   Yanlis.karistirilanIdler(n)             -> bu çiftlerdeki harf id'leri
//   Yanlis.rapor()                          -> istatistik sayfası için özet
// ============================================================
(function () {
  'use strict';

  const ANAHTAR = 'sakar_ciftler';
  const EN_FAZLA_CIFT = 60;    // localStorage şişmesin

  function ham(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function yaz(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  function tarih() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
      '-' + String(d.getDate()).padStart(2, '0');
  }

  function oku() {
    try {
      const x = JSON.parse(ham(ANAHTAR));
      return (x && typeof x === 'object') ? x : {};
    } catch (e) { return {}; }
  }

  // Çift anahtarı: id'leri SIRALI yaz ki (a,b) ile (b,a) aynı çift olsun.
  function ciftAnahtar(a, b) {
    return (a < b) ? (a + '|' + b) : (b + '|' + a);
  }

  // ---------- Kayıt ----------
  // verilenId: kullanıcının seçtiği (yanlış) harf
  // dogruId  : sorunun doğru cevabı
  function ciftKaydet(verilenId, dogruId) {
    if (!verilenId || !dogruId || verilenId === dogruId) return;
    const k = oku();
    const anahtar = ciftAnahtar(verilenId, dogruId);
    const e = k[anahtar] || { n: 0, son: '' };
    e.n = (e.n || 0) + 1;
    e.son = tarih();
    k[anahtar] = e;

    // Çok büyürse en eski/az kayıtları at
    const anahtarlar = Object.keys(k);
    if (anahtarlar.length > EN_FAZLA_CIFT) {
      anahtarlar
        .sort((a, b) => (k[a].n - k[b].n) || (k[a].son < k[b].son ? -1 : 1))
        .slice(0, anahtarlar.length - EN_FAZLA_CIFT)
        .forEach(x => { delete k[x]; });
    }
    yaz(ANAHTAR, JSON.stringify(k));
  }

  // ---------- Sorgu ----------
  // En çok karıştırılan çiftler: [{a, b, n, son}]
  function enCokKaristirilan(n) {
    const k = oku();
    return Object.keys(k)
      .map(anahtar => {
        const p = anahtar.split('|');
        return { a: p[0], b: p[1], n: k[anahtar].n || 0, son: k[anahtar].son || '' };
      })
      .filter(x => x.a && x.b)
      .sort((x, y) => y.n - x.n)
      .slice(0, n || 10);
  }

  // Bu çiftlerdeki harf id'leri (ders üreticisi havuz istiyor)
  function karistirilanIdler(n) {
    const ciftler = enCokKaristirilan(n || 8);
    const set = new Set();
    ciftler.forEach(c => { set.add(c.a); set.add(c.b); });
    return [...set];
  }

  // Belirli bir harfin en çok karıştırıldığı PARTNERİ (ders üretirken
  // yanlış şıkkı "anlamlı" seçmek için kullanılır).
  // Örn: し soruluyorsa ve kullanıcı sürekli つ diyorsa, şıklara つ koy.
  function zorSiklar(id, adet) {
    const k = oku();
    const puanlar = {};
    Object.keys(k).forEach(anahtar => {
      const p = anahtar.split('|');
      if (p.indexOf(id) === -1) return;
      const digeri = p[0] === id ? p[1] : p[0];
      puanlar[digeri] = (puanlar[digeri] || 0) + (k[anahtar].n || 0);
    });
    return Object.keys(puanlar)
      .sort((a, b) => puanlar[b] - puanlar[a])
      .slice(0, adet || 2);
  }

  function toplamKaristirma() {
    const k = oku();
    return Object.keys(k).reduce((t, a) => t + (k[a].n || 0), 0);
  }

  // İstatistik sayfası için özet
  function rapor() {
    const ciftler = enCokKaristirilan(6);
    return {
      toplam: toplamKaristirma(),
      ciftSayisi: Object.keys(oku()).length,
      enCok: ciftler
    };
  }

  function sifirla() { try { localStorage.removeItem(ANAHTAR); } catch (e) { } }

  window.Yanlis = {
    ciftKaydet: ciftKaydet,
    enCokKaristirilan: enCokKaristirilan,
    karistirilanIdler: karistirilanIdler,
    zorSiklar: zorSiklar,
    toplamKaristirma: toplamKaristirma,
    rapor: rapor,
    sifirla: sifirla
  };
})();