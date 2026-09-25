// ============================================================
// SINAV MODU (sinav.js)  —  Sakar Paisen
//
// AMAÇ: Müfredattaki sınavlar SABİT ve tekrar oynanabilir; kullanıcı
//   hangi soruların geleceğini ezberleyebiliyor. Ayrıca çalışmak için
//   "kendini test et" modu yoktu. Bu modül RASTGELE, KARIŞIK ve
//   süreli bir sınav üretir — gerçek bir sınav deneyimi.
//
// NASIL ÇALIŞIR:
//   • Havuz: o ana kadar öğrenilen TÜM harfler (hiragana + katakana).
//   • Soru tipleri karışık: harf→ses, ses→harf, eşleştirme, dinleme.
//   • Yanlış yaptığı harfler AĞIRLIKLI sorulur (yanlis.js + zayif harfler).
//   • Süre tutulur; bitince sonuç karnesi (doğruluk %, süre, en zayıf harf).
//
// DERS AKIŞI: Müfredattaki derslerle aynı "adım" biçimini kullanır,
//   böylece app.js motoru hiç değişmeden çalıştırır.
//
// KULLANIM: Sinav.uret(20)  -> ders nesnesi ({baslik, xp, can, adimlar})
// ============================================================
(function () {
  'use strict';

  // Sınav ayarları: kaç soru, kaç can, XP
  const SORU_SAYISI = 20;
  const CAN = 3;            // sınav zorlu olsun
  const XP = 120;           // yüksek ödül (riskli ama kazançlı)

  function karistir(a) {
    const d = a.slice();
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  }

  // Sınav havuzunu kur: öğrenilmiş harfler + (varsa) zayıf/karişan harfler
  function havuzKur() {
    if (typeof KANA === 'undefined' || typeof Ilerleme === 'undefined') return [];

    let gorulen = Ilerleme.gorulenIdler().filter(id => KANA[id]);
    // Hiç harf görülmemişse tüm hiragana ile başla (sınav hep denenebilsin)
    if (!gorulen.length) {
      gorulen = Object.keys(KANA).filter(id => KANA[id].a === 'h');
    }
    return gorulen;
  }

  // Ağırlıklı seçim: zayıf ve karıştırılan harfler daha sık gelsin.
  function agirlikliSec(havuz, adet) {
    const puan = {};
    havuz.forEach(id => { puan[id] = 1; });   // taban ağırlık

    // Zayıf harflere +3
    try {
      if (window.Ilerleme && Ilerleme.zayif) {
        Ilerleme.zayif(999).forEach(x => {
          if (puan[x.id] !== undefined) puan[x.id] += 3;
        });
      }
    } catch (e) { }

    // Çok karıştırılan harflere +4 (en güçlü sinyal: alışkanlık hâline gelmiş)
    // ÖNEMLİ: KANA id'leri alfabe önekli ('h:ka'). yanlis.js da aynı id'leri
    // kullanir (app.js KANA üzerinden bulur), bu yüzden eşleşme doğrudur.
    try {
      if (window.Yanlis && Yanlis.enCokKaristirilan) {
        Yanlis.enCokKaristirilan(20).forEach(c => {
          if (puan[c.a] !== undefined) puan[c.a] += 4 * Math.min(c.n, 3);
          if (puan[c.b] !== undefined) puan[c.b] += 4 * Math.min(c.n, 3);
        });
      }
    } catch (e) { }

    // Tekrar zamanı gelenlere +2 (unutmak üzere olanlar)
    try {
      if (window.Ilerleme && Ilerleme.tekrarIdleri) {
        Ilerleme.tekrarIdleri(999).forEach(id => {
          if (puan[id] !== undefined) puan[id] += 2;
        });
      }
    } catch (e) { }

    // Ağırlıklı rastgele seçim.
    //
    // ÖNEMLİ TASARIM KARARI — "ağırlık neden fark yaratmıyordu":
    // İlk sürümde her turda kalanlar arasından ağırlıklı seçim yapılıyordu.
    // Ama kalanlar azaldıkça (20/20 soru) HER harf zaten seçilmek zorunda
    // kalıyordu; bu yüzden dağılım eşitleniyordu (ölçüm: 300 vs 300).
    //
    // Doğru yaklaşım: AĞIRLIKLI seçimi SADECE SORU SAYISI HAVUZDAN KÜÇÜKSE
    // uygula (ki bu asıl durumdur: 20 soru / 46+ harf). Havuzun tamamı
    // seçilecekse zaten ağırlığın anlamı yok.
    const secilecekAdet = Math.min(adet, havuz.length);
    const secilen = [];

    if (secilecekAdet >= havuz.length) {
      // Tüm havuz seçilecek: sırayı karıştır (ağırlık anlamsız)
      const kopya = havuz.slice();
      for (let i = kopya.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
      }
      return kopya.slice(0, secilecekAdet);
    }

    // Ağırlıklı seçim: her turda TOPLAM ağırlığa göre rastgele, seçileni çıkar
    const kalan = havuz.slice();
    while (secilen.length < secilecekAdet && kalan.length) {
      let toplam = 0;
      for (let i = 0; i < kalan.length; i++) toplam += puan[kalan[i]];
      let hedef = Math.random() * toplam;
      let secim = kalan[kalan.length - 1];
      for (let i = 0; i < kalan.length; i++) {
        hedef -= puan[kalan[i]];
        if (hedef <= 0) { secim = kalan[i]; break; }
      }
      secilen.push(secim);
      kalan.splice(kalan.indexOf(secim), 1);
    }
    return secilen;
  }

  // ---------- Soru üreticileri ----------
  // ÖNEMLİ — ADIM ŞEMASI (kana.js ile BİREBİR aynı olmalı):
  //   { tip: 'soru',  k: id, buyuk: 'あ', soru: '...', dogru: 'a', siklar: [...] }
  //   { tip: 'dinle', k: id, ses: 'あ', dogru: 'あ', siklar: [...] }
  //   { tip: 'yaz',   k: id, buyuk: 'あ', soru: '...', dogru: 'a' }
  //
  // İLK YAZDIĞIMDA `secenekler` ve `tip:'harf-ses'` kullanmıştım; bu,
  // motorun (app.js) beklediğinden FARKLI bir şemaydı ve "Cannot read
  // properties of undefined (reading 'slice')" hatası veriyordu.
  // Alan adları ve tip isimleri artık kana.js ile aynı.
  //
  // Şıklar MÜMKÜNSE kullanıcının karıştırdığı harflerden seçilir (yanlis.js)
  // — böylece sınav anlamlı olur, rastgele dolgu değil.

  // Şık listesi üret. mod: 'j' (Japonca harf) | 'r' (romaji)
  function sikUret(dogruId, havuz, mod) {
    const dogru = KANA[dogruId];
    const set = new Set([dogruId]);

    // 1) Önce kullanıcının karıştırdığı harfler (en değerli şıklar)
    try {
      if (window.Yanlis && Yanlis.zorSiklar) {
        Yanlis.zorSiklar(dogruId, 2).forEach(id => {
          if (KANA[id] && id !== dogruId) set.add(id);
        });
      }
    } catch (e) { }

    // 2) Aynı alfabeden benzer harflerle doldur
    const ayniAlfabe = havuz.filter(id => KANA[id] && KANA[id].a === dogru.a && id !== dogruId);
    for (const id of karistir(ayniAlfabe)) {
      if (set.size >= 4) break;
      set.add(id);
    }
    // 3) Hâlâ eksikse tüm KANA'dan ekle
    if (set.size < 4) {
      for (const id of karistir(Object.keys(KANA))) {
        if (set.size >= 4) break;
        if (KANA[id] && KANA[id].a === dogru.a) set.add(id);
      }
    }

    const idler = [...set].slice(0, 4);
    // Şıklar KARIŞTIRILIR (doğru cevap hep ilk olmasın)
    return karistir(idler).map(id => KANA[id][mod || 'j']);
  }

  // harf → ses  (あ görüyorsun, "a" şıkkını seçiyorsun)
  function sorHarfSes(id, havuz) {
    const e = KANA[id];
    if (!e) return null;
    return {
      tip: 'soru', k: id, buyuk: e.j,
      soru: 'Bu harf hangi sesi veriyor?',
      dogru: e.r,
      siklar: sikUret(id, havuz, 'r')
    };
  }

  // ses → harf  ("a" sesini görüyorsun, あ'yı seçiyorsun)
  function sorSesHarf(id, havuz) {
    const e = KANA[id];
    if (!e) return null;
    return {
      tip: 'soru', k: id, buyuk: e.r,   // büyük gösterim: romaji (soru bu)
      soru: 'Hangisi "' + e.r + '" sesidir?',
      dogru: e.j,
      siklar: sikUret(id, havuz, 'j')
    };
  }

  // Karşılık: hangi alfabede yazılıyor?
  function sorKarsilik(id, havuz) {
    const e = KANA[id];
    if (!e) return null;
    const diger = e.a === 'h' ? 'k' : 'h';

    // ÖNEMLİ: Bu soru tipi "diğer alfabedeki aynı sesi" sorar. Ama o
    // alfabeden yeterli harf YOKSA şık listesi 4'e tamamlanamaz ve
    // motor 3 şıklı soru gösterir (testte yakalandı: eksikSik=1).
    // Bu yüzden önce TÜM KANA'dan (her iki alfabe) yeterli aday var mı
    // diye bakıyoruz; yoksa güvenli tipe (sorSesHarf) düşüyoruz.
    const digerTum = Object.keys(KANA).filter(x => KANA[x].a === diger);
    if (digerTum.length < 4) return sorSesHarf(id, havuz);

    const hedefId = digerTum.find(x => KANA[x].r === e.r);
    if (!hedefId) return sorSesHarf(id, havuz);

    const siklar = [hedefId]
      .concat(karistir(digerTum.filter(x => x !== hedefId)))
      .slice(0, 4)
      .map(x => KANA[x].j);

    // Son güvenlik: şık sayısı 4 değilse (tekrar eden Japonca vs.) normal sor
    if (siklar.length < 4 || new Set(siklar).size < 4) return sorSesHarf(id, havuz);

    return {
      tip: 'soru', k: id, buyuk: e.j,
      soru: 'Bun ' + (diger === 'k' ? 'Katakana' : 'Hiragana') + ' karşılığı hangisi?',
      dogru: KANA[hedefId].j,
      siklar: karistir(siklar)
    };
  }

  // Dinleme: ses çalınır, harfi seçersin (en zor tip)
  function sorDinle(id, havuz) {
    const e = KANA[id];
    if (!e) return null;
    return {
      tip: 'dinle', k: id, ses: e.j,
      dogru: e.j,
      siklar: sikUret(id, havuz, 'j')
    };
  }

  // ---------- SINAV ÜRET ----------
  function uret(soruSayisi) {
    const n = soruSayisi || SORU_SAYISI;
    const havuz = havuzKur();
    if (!havuz.length) return null;

    const secilen = agirlikliSec(havuz, Math.min(n, havuz.length));
    // Tip dağılımı: ağırlıklı olarak harf→ses (en temel), azınlık dinleme
    const turler = [sorHarfSes, sorSesHarf, sorKarsilik, sorDinle, sorHarfSes, sorSesHarf];

    const adimlar = karistir(secilen).map((id, i) => {
      const f = turler[i % turler.length];
      return f(id, havuz);
    }).filter(Boolean);

    if (!adimlar.length) return null;

    return {
      baslik: '🎓 Karışık Sınav',
      xp: XP,
      can: CAN,
      adimlar: adimlar
    };
  }

  window.Sinav = {
    SORU_SAYISI: SORU_SAYISI,
    CAN: CAN,
    XP: XP,
    uret: uret,
    havuzKur: havuzKur,
    agirlikliSec: agirlikliSec
  };
})();