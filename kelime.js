// ============================================================
// KELİME DEFTERİ (kelime.js)
//
// Öğrenilen her kelime burada birikir. İki amaç:
//   1) Kullanıcı "ne öğrendim?" diye tek yerden bakabilsin.
//   2) İleride KANJI öğrenirken bu kana kelimelerine tekrar bakılabilsin.
//      (Kanji geldiğinde, aynı kelimenin kanji yazımı yanına eklenecek.)
//
// Kayıt (localStorage):
//   sakar_kelime  { "<ja>": { ilk: "2025-01-03", son: "...", d: 4, y: 1, kaynak: "ders|okuma" } }
//     d = kaç kez doğru bilindi, y = kaç kez yanlış
//
// Kelime listesi reading.js'teki SOZLUK'ten gelir; burada sadece
// "hangi kelimeyi ne zaman gördüm" bilgisi tutulur.
// ============================================================
const KelimeDefteri = (function () {
  const ANAHTAR = 'sakar_kelime';

  function tarih(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function oku() {
    try {
      const x = JSON.parse(localStorage.getItem(ANAHTAR));
      return (x && typeof x === 'object') ? x : {};
    } catch (e) { return {}; }
  }
  function yaz(h) {
    try { localStorage.setItem(ANAHTAR, JSON.stringify(h)); } catch (e) { }
  }

  // Sözlükten kelime bul (ja ile). reading.js yüklenmemişse boş liste.
  // NOT: `typeof READING` güvenlidir; const ile tanımlı olduğu için
  // doğrudan erişim "not defined" hatası verebilir.
  function sozluk() {
    try {
      if (typeof READING !== 'undefined' && READING && READING.SOZLUK) return READING.SOZLUK;
    } catch (e) { }
    return [];
  }
  function bul(ja) {
    return sozluk().find(k => k.ja === ja) || null;
  }

  // Bir kelimeyi "görüldü" olarak kaydet (ders içinde öğretildiğinde çağrılır).
  function gor(kelime, kaynak) {
    if (!kelime || !kelime.ja) return;
    const h = oku();
    const yeniMi = !h[kelime.ja];          // ilk kez görülen kelime mi?
    const g = h[kelime.ja] || { ilk: tarih(), son: '', d: 0, y: 0 };
    g.son = tarih();
    g.kaynak = kaynak || g.kaynak || 'ders';
    h[kelime.ja] = g;
    yaz(h);
    // GÜNLÜK GÖREV: yeni kelime defterine eklendiyse sayacı besle (gorevler.js).
    // Sadece YENİ kelimeler sayılır; aynı kelimeyi tekrar görmek görevi ilerletmez.
    if (yeniMi && window.Gorevler) {
      try { Gorevler.olay('kelime', 1); } catch (e) { }
    }
  }

  // Soruya verilen cevabı kaydet.
  function cevap(kelime, dogruMu) {
    if (!kelime || !kelime.ja) return;
    const h = oku();
    const g = h[kelime.ja] || { ilk: tarih(), son: '', d: 0, y: 0, kaynak: 'ders' };
    if (dogruMu) g.d++; else g.y++;
    g.son = tarih();
    h[kelime.ja] = g;
    yaz(h);
  }

  // Öğrenilen kelimeleri sözlük bilgisiyle birlikte döndür (yeniden eskiye).
  function liste() {
    const h = oku();
    const kayitlar = Object.keys(h).map(ja => {
      const k = bul(ja);
      return {
        kayit: h[ja],
        kelime: k || { ja: ja, ro: '', tr: '(sözlükte bulunamadı)', kana: 'h' },
        ilk: h[ja].ilk, son: h[ja].son,
        dogru: h[ja].d || 0, yanlis: h[ja].y || 0,
        // Toplam görülme sayısı ve başarı oranı
        toplam: (h[ja].d || 0) + (h[ja].y || 0),
        oran: ((h[ja].d || 0) + (h[ja].y || 0)) > 0 ? (h[ja].d || 0) / ((h[ja].d || 0) + (h[ja].y || 0)) : 0
      };
    });
    kayitlar.sort((a, b) => (b.son || '').localeCompare(a.son || ''));
    return kayitlar;
  }

  function sayi() { return Object.keys(oku()).length; }

  // Belirli bir alfabeye göre süz: 'h' hiragana, 'k' katakana, 'hk' ikisi
  function alfabeyeGore(a) {
    return liste().filter(x => {
      if (a === 'h') return x.kelime.kana === 'h';
      if (a === 'k') return x.kelime.kana === 'k' || x.kelime.kana === 'hk';
      return true;
    });
  }

  // En çok zorlanılan kelimeler (tekrar çalışmak için)
  function zorlanilanlar(n) {
    return liste()
      .filter(x => x.yanlis > 0)
      .sort((a, b) => (a.oran - b.oran) || (b.yanlis - a.yanlis))
      .slice(0, n || 10);
  }

  function temizle() { try { localStorage.removeItem(ANAHTAR); } catch (e) { } }

  return {
    gor: gor, cevap: cevap, liste: liste, sayi: sayi,
    alfabeyeGore: alfabeyeGore, zorlanilanlar: zorlanilanlar,
    temizle: temizle, sozluk: sozluk, bul: bul
  };
})();

// Test ve hata ayıklama için
window.KelimeDefteri = KelimeDefteri;
