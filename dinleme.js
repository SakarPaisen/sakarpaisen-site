// ============================================================
// DİNLEME ALIŞTIRMASI (dinleme.js)  —  Sakar Paisen
//
// SORUN: Sitede dinleme sorusu var ama sadece derste karışık çıkıyor.
//   Kulak eğitimi ayrı bir beceridir ve tekrar tekrar dinlemek gerekir.
//   \"Şu harfi 20 kere dinleyip tanıyayım\" diyebileceğin bir yer yoktu.
//
// ÇÖZÜM: Ayrı bir dinleme sayfası. Ekran sade, tek iş yapar: ses çalınır,
//   kullanıcı harfi seçer. Yanlışsa doğru gösterilir ve o harf tekrar sorulur.
//
// NASIL ÇALIŞIR:
//   • Havuz: öğrenilmiş harfler (yoksa hiragana ile başlar)
//   • Yanlış yapılan harf kuyruğun SONUNA değil, 3 soru sonrasına eklenir
//     (hemen tekrar sorulursa kısa süreli hafızadan doğru cevap verir;
//      araya soru koymak gerçek öğrenmeyi zorlar)
//   • Tur sayısı ve doğruluk yüzdesi tutulur, sonunda karne gösterilir
//
// API (dinleme.html kullanır):
//   Dinleme.baslat()      -> yeni tur başlat
//   Dinleme.sor()         -> { harf, siklar } mevcut soru
//   Dinleme.cevapla(x)    -> { dogruMu, dogruHarf, bitti }
//   Dinleme.durum()       -> { soruNo, toplam, dogru, yanlis }
// ============================================================
(function () {
  'use strict';

  const TUR_SORU = 12;      // bir turda kaç soru

  let kuyruk = [];          // sorulacak harf id'leri (sıralı)
  let toplam = 0;
  let soruNo = 0;
  let dogruSayi = 0;
  let yanlisSayi = 0;
  let mevcut = null;        // { id, harf, siklar }
  let havuz = [];

  function karistir(a) {
    const d = a.slice();
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  }

  // ---------- Havuz ----------
  function havuzKur() {
    if (typeof KANA === 'undefined') return [];
    let g = [];
    try {
      if (window.Ilerleme && Ilerleme.gorulenIdler) {
        // DİKKAT: benzersizleştir. gorulenIdler() teorik olarak tekrar
        // edebilir; tekrarlı havuzda aynı şık iki kez çıkar (test yakaladı).
        g = [...new Set(Ilerleme.gorulenIdler().filter(id => KANA[id]))];
      }
    } catch (e) { }
    if (!g.length) g = Object.keys(KANA).filter(id => KANA[id].a === 'h');
    return g;
  }

  // ---------- Şıklar ----------
  // YANLIŞ ŞIK SEÇİMİ: rastgele değil. Önce kullanıcının KARIŞTIRDIĞI
  // harfler (yanlis.js), sonra AYNI ALFABEDEN benzer harfler.
  // Böylece dinleme alıştırması gerçekten ayırt etmeyi öğretir.
  function sikUret(dogruId) {
    const dogru = KANA[dogruId];
    const set = new Set([dogruId]);

    try {
      if (window.Yanlis && Yanlis.zorSiklar) {
        Yanlis.zorSiklar(dogruId, 2).forEach(id => {
          if (KANA[id] && id !== dogruId) set.add(id);
        });
      }
    } catch (e) { }

    const ayniAlfabe = havuz.filter(id => KANA[id] && KANA[id].a === dogru.a && id !== dogruId);
    for (const id of karistir(ayniAlfabe)) {
      if (set.size >= 4) break;
      set.add(id);
    }
    // Havuz darsa tüm KANA'dan tamamla
    if (set.size < 4) {
      for (const id of karistir(Object.keys(KANA))) {
        if (set.size >= 4) break;
        if (KANA[id] && KANA[id].a === dogru.a) set.add(id);
      }
    }
    const idler = [...set].slice(0, 4);
    return { idler: karistir(idler), siklar: karistir(idler.map(id => KANA[id].j)) };
  }

  // ---------- Tur başlat ----------
  function baslat() {
    havuz = havuzKur();
    if (havuz.length < 4) return false;   // 4 şık için en az 4 harf gerekir

    // Soru sırası: ZAYIF ve KARIŞTIRILAN harfler öne (öncelikli çalışma)
    let oncelik = [];
    try {
      if (window.Ilerleme && Ilerleme.zayif) {
        oncelik = oncelik.concat(Ilerleme.zayif(99).map(x => x.id));
      }
    } catch (e) { }
    try {
      if (window.Yanlis && Yanlis.karistirilanIdler) {
        oncelik = oncelik.concat(Yanlis.karistirilanIdler(8));
      }
    } catch (e) { }
    oncelik = [...new Set(oncelik)].filter(id => KANA[id]);

    const geriKalan = havuz.filter(id => oncelik.indexOf(id) === -1);
    kuyruk = oncelik.concat(karistir(geriKalan));

    // Turun tamamı: 12 soru (havuzdan azsa havuz kadar)
    toplam = Math.min(TUR_SORU, kuyruk.length);
    if (kuyruk.length < toplam) {
      // Havuz küçükse tekrar doldur (aynı harf iki kez gelebilir)
      while (kuyruk.length < toplam) kuyruk = kuyruk.concat(karistir(havuz));
    }
    kuyruk = kuyruk.slice(0, toplam);

    soruNo = 0; dogruSayi = 0; yanlisSayi = 0;
    mevcut = null;
    return true;
  }

  // ---------- Sıradaki soru ----------
  function sor() {
    if (soruNo >= kuyruk.length) return null;
    const id = kuyruk[soruNo];
    const s = sikUret(id);
    mevcut = {
      id: id,
      harf: KANA[id].j,
      romaji: KANA[id].r,
      siklar: s.siklar,
      idler: s.idler
    };
    soruNo++;
    return mevcut;
  }

  // ---------- Cevap ----------
  // secilen: kullanıcının seçtiği METİN (harf gösterimi)
  function cevapla(secilen) {
    if (!mevcut) return { bitti: true };

    const dogruMu = (secilen === mevcut.harf);
    if (dogruMu) dogruSayi++;
    else {
      yanlisSayi++;
      // Yanlış defterine kaydet (hangi harfi hangisiyle karıştırdı)
      try {
        if (window.Yanlis) {
          const verilenId = mevcut.idler[mevcut.siklar.indexOf(secilen)];
          if (verilenId && verilenId !== mevcut.id) Yanlis.ciftKaydet(verilenId, mevcut.id);
        }
      } catch (e) { }

      // YANLIŞ YAPILAN HARF: hemen değil, 3 soru SONRA tekrar sorulur.
      // Neden? Hemen tekrar sorulursa kullanıcı kısa süreli hafızadan
      // doğru cevabı hatırlar ve gerçek öğrenme olmaz. Araya soru koymak
      // hatırlamayı zorlar (\"spacing\" etkisi).
      const eklenecek = mevcut.id;
      const hedef = Math.min(kuyruk.length, soruNo + 3);
      kuyruk.splice(hedef, 0, eklenecek);
      toplam = kuyruk.length;
    }

    const bitti = soruNo >= kuyruk.length;
    return {
      dogruMu: dogruMu,
      dogruHarf: mevcut.harf,
      dogruRomaji: mevcut.romaji,
      bitti: bitti
    };
  }

  function durum() {
    return { soruNo: soruNo, toplam: toplam, dogru: dogruSayi, yanlis: yanlisSayi };
  }

  function ozet() {
    const toplamCevap = dogruSayi + yanlisSayi;
    return {
      dogru: dogruSayi,
      yanlis: yanlisSayi,
      toplam: toplamCevap,
      oran: toplamCevap ? Math.round(dogruSayi / toplamCevap * 100) : 0,
      puan: dogruSayi * 10          // basit puan (10 XP/doğru)
    };
  }

  window.Dinleme = {
    TUR_SORU: TUR_SORU,
    baslat: baslat,
    sor: sor,
    cevapla: cevapla,
    durum: durum,
    ozet: ozet,
    havuzKur: havuzKur
  };
})();