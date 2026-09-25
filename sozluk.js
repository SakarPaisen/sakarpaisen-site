// ============================================================
// SÖZLÜK (sozluk.js)  —  Sakar Paisen
//
// AMAÇ: Sitedeki tüm öğrenme içeriğini TEK YERDEN aranabilir yapmak.
//   Kullanıcı \"tsu\" yazınca hem harfi hem kelimeyi hem kanjiyi bulmalı.
//
// NEDEN GEREKLİ: Şu ana kadar içerik sayfalara dağılmıştı —
//   harfler oyunda, kelimeler kelime.html'de, kanjiler istatistikte.
//   Kullanıcı \"bu harf neydi\" diye sormak istediğinde arama yoktu.
//
// ARAMA KAYNAKLARI (hepsi mevcut modüllerden, yeni veri eklenmez):
//   KANA          -> harfler (hiragana + katakana)
//   READING.SOZLUK-> okuma kelimeleri
//   KANJI         -> kanji listesi
//   KelimeDefteri -> kullanıcının kendi defteri (öğrendikleri)
//
// ARAMA: romaji, Türkçe anlam, Japonca yazım, kanji ve anlam üzerinden.
//   Türkçe küçük/büyük harf ve aksan toleranslı.
// ============================================================
(function () {
  'use strict';

  // ---------- Türkçe uyumlu normalleştirme ----------
  // \"İ\" ile \"i\", \"ı\" ile \"i\" eşleşsin; aksanlar yok sayılsın.
  function normalize(s) {
    let t = String(s || '');
    // ⚠️ KRİTİK SIRA: Türkçe harfler toLowerCase'DEN ÖNCE çevrilmeli.
    // JavaScript'te 'İ'.toLowerCase() -> 'i' + U+0307 (birleşen nokta),
    // yani İKİ kod noktası döner ve 'istanbul' yerine 'i̇stanbul' çıkar.
    // İlk yazdığımda sıra yanlıştı, "İstanbul" araması başarısız oluyordu.
    t = t.replace(/İ/g, 'i').replace(/I/g, 'i');
    t = t.toLowerCase();
    t = t.replace(/ı/g, 'i')
      .replace(/ş/g, 's').replace(/ğ/g, 'g')
      .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');
    // Birleşen işaretleri (aksan/nokta) temizle: güvenlik ağı
    try { t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) { }
    return t.replace(/\s+/g, ' ').trim();
  }

  // ---------- Kaynakları topla ----------
  function harfleriTopla() {
    const cikti = [];
    try {
      if (typeof KANA === 'undefined') return cikti;
      Object.keys(KANA).forEach(id => {
        const e = KANA[id];
        cikti.push({
          tur: 'harf', id: id,
          ja: e.j, ro: e.r, tr: (e.a === 'k' ? 'Katakana' : 'Hiragana'),
          arama: normalize([e.j, e.r, e.a === 'k' ? 'katakana' : 'hiragana'].join(' ')),
          url: 'oyun.html?ders=' + (e.a === 'k' ? 'katakana' : 'hiragana')
        });
      });
    } catch (e) { }
    return cikti;
  }

  function kelimeleriTopla() {
    const cikti = [];
    try {
      if (!window.READING || !READING.SOZLUK) return cikti;
      const s = READING.SOZLUK;
      // SOZLUK bir dizi veya nesne olabilir; esnek davran
      const girdiler = Array.isArray(s) ? s : Object.keys(s).map(k => Object.assign({ ja: k }, s[k]));
      girdiler.forEach(k => {
        const ja = k.ja || k.jp || k.kelime;
        if (!ja) return;
        const ro = k.ro || k.romaji || '';
        const tr = k.tr || k.anlam || k.anlami || '';
        cikti.push({
          tur: 'kelime', ja: ja, ro: ro, tr: tr,
          arama: normalize([ja, ro, tr].join(' ')),
          url: 'kelime.html'
        });
      });
    } catch (e) { }
    return cikti;
  }

  function kanjileriTopla() {
    const cikti = [];
    try {
      // GERÇEK ALAN ADI: kanji.js -> window.KANJI.KANJILER
      // (ilk yazdığımda LISTE/liste arıyordum, bu yüzden sözlükte
      //  kanji sonucu HİÇ çıkmıyordu - ekran görüntüsünde yakalandı)
      const kaynak = (window.KANJI && (KANJI.KANJILER || KANJI.LISTE || KANJI.liste)) || null;
      if (!kaynak) return cikti;
      const girdiler = Array.isArray(kaynak) ? kaynak : Object.keys(kaynak).map(k => kaynak[k]);
      girdiler.forEach(k => {
        if (!k || typeof k !== 'object') return;
        const ja = k.k || k.ja || k.kanji;
        if (!ja) return;
        const tr = k.tr || k.anlam || '';
        const kun = k.kun || k.kunyomi || '';
        const on = k.on || k.onyomi || '';
        cikti.push({
          tur: 'kanji', ja: ja, tr: tr,
          ro: [kun, on].filter(Boolean).join(' · '),
          arama: normalize([ja, tr, kun, on, k.grup || ''].join(' ')),
          url: 'oyun.html?ders=kanji'
        });
      });
    } catch (e) { }
    return cikti;
  }

  function defterTopla() {
    const cikti = [];
    try {
      if (!window.KelimeDefteri || !KelimeDefteri.hepsi) return cikti;
      KelimeDefteri.hepsi().forEach(k => {
        const ja = k.ja || k.kelime;
        if (!ja) return;
        cikti.push({
          tur: 'defter', ja: ja, ro: k.ro || k.romaji || '', tr: k.tr || k.anlam || '',
          arama: normalize([ja, k.ro, k.tr].join(' ')),
          url: 'kelime.html'
        });
      });
    } catch (e) { }
    return cikti;
  }

  // Tüm aranabilir içerik (her aramada yeniden toplanmasın diye önbellek)
  let onbellek = null;
  function icerik() {
    if (onbellek) return onbellek;
    onbellek = [].concat(harfleriTopla(), kanjileriTopla(), kelimeleriTopla(), defterTopla());
    return onbellek;
  }
  function onbellekSifirla() { onbellek = null; }

  // ---------- ARAMA ----------
  // q: kullanıcının yazdığı metin. tur: 'hepsi'|'harf'|'kelime'|'kanji'|'defter'
  function ara(q, tur) {
    const a = normalize(q);
    if (!a) return [];
    const hepsi = icerik();
    const filtre = (tur && tur !== 'hepsi') ? hepsi.filter(x => x.tur === tur) : hepsi;

    const eslesen = filtre.filter(x => x.arama.indexOf(a) !== -1);

    // SIRALAMA: tam eşleşme en üstte, sonra başlaşan, sonra içeren.
    eslesen.sort((x, y) => {
      const px = puan(x, a), py = puan(y, a);
      return py - px;
    });
    return eslesen.slice(0, 60);   // liste şişmesin
  }

  function puan(x, a) {
    const ja = normalize(x.ja), ro = normalize(x.ro), tr = normalize(x.tr);
    if (ja === a) return 100;
    if (ro === a) return 95;
    if (tr === a) return 90;
    if (ja.indexOf(a) === 0) return 70;
    if (ro.indexOf(a) === 0) return 65;
    if (tr.indexOf(a) === 0) return 60;
    if (ja.indexOf(a) !== -1) return 40;
    if (ro.indexOf(a) !== -1) return 35;
    if (tr.indexOf(a) !== -1) return 30;
    return 10;
  }

  function sayilar() {
    const h = icerik();
    return {
      harf: h.filter(x => x.tur === 'harf').length,
      kanji: h.filter(x => x.tur === 'kanji').length,
      kelime: h.filter(x => x.tur === 'kelime').length,
      defter: h.filter(x => x.tur === 'defter').length,
      toplam: h.length
    };
  }

  window.Sozluk = {
    ara: ara,
    sayilar: sayilar,
    icerik: icerik,
    onbellekSifirla: onbellekSifirla,
    normalize: normalize
  };
})();