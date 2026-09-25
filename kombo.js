// ============================================================
// KOMBO (kombo.js)  —  Sakar Paisen
//
// AMAÇ: Ders SIRASINDA "üst üste doğru" hissi vermek. Bu, oyunların
//   en güçlü motivasyon mekaniklerinden biridir: kullanıcı seriyi
//   kırmamak için dikkatli olur ve doğru cevabı "korumak" ister.
//
// NASIL ÇALIŞIR:
//   • Ardışık her doğru cevap komboyu 1 artırır.
//   • Yanlış cevap komboyu SIFIRLAR.
//   • Çarpan kademeli büyür, ama 2.0'da DURUR:
//         2 doğru → x1.1     6 doğru → x1.5
//         3 doğru → x1.2    10 doğru → x1.75
//         4 doğru → x1.3    15 doğru → x2.0  (tavan)
//     Neden tavan? Sınırsız büyürse tek dersle binlerce XP alınır ve
//     ilerleme anlamsızlaşır. x2 hem ulaşılabilir hem de tatmin edici.
//
// ÖNEMLİ: Kombo XP'si ders SONUNDA topluca verilir. Her cevapta vermek
//   yerine sona saklamak, "bonus ekranı" etkisi yaratır ve ders bitişi
//   ekranının kutlama etkisini artırır.
//
// API (app.js kullanır):
//   Kombo.dogru()      -> komboyu artır, {adet, carpan} döndürür
//   Kombo.yanlis()     -> komboyu sıfırla
//   Kombo.durum()      -> mevcut {adet, carpan}
//   Kombo.bonusXp(xp)  -> o dersin kombo bonus XP'si
//   Kombo.temizle()    -> ders başında/bitince sıfırla
//   Kombo.etiket(adet) -> "x1.5" gibi gösterim metni
// ============================================================
(function () {
  'use strict';

  // Eşik tablosu: kaç doğru sonrası hangi çarpan.
  // Sıralı olmalı (küçükten büyüğe).
  const ESIKLER = [
    { adet: 2, carpan: 1.10 },
    { adet: 3, carpan: 1.20 },
    { adet: 4, carpan: 1.30 },
    { adet: 6, carpan: 1.50 },
    { adet: 10, carpan: 1.75 },
    { adet: 15, carpan: 2.00 }
  ];

  const TAVAN = ESIKLER[ESIKLER.length - 1].carpan;

  // Ders boyunca biriken kombo durumu (sayfa kapanınca sıfırlanır)
  let adet = 0;

  function carpanBul(n) {
    let c = 1;
    for (let i = 0; i < ESIKLER.length; i++) {
      if (n >= ESIKLER[i].adet) c = ESIKLER[i].carpan;
    }
    return c;
  }

  // ---- Ders başına kombo istatistikleri (bitiş ekranında gösterilir) ----
  let enYuksek = 0;            // bu dersteki en uzun seri
  let dogruSayisi = 0;         // bu dersteki toplam doğru
  let bonusBirikim = 0;        // bu derste biriken bonus XP

  function dogru() {
    adet++;
    dogruSayisi++;
    if (adet > enYuksek) enYuksek = adet;
    const carpan = carpanBul(adet);
    // Her doğru cevabın bonusu: taban 5 XP × (çarpan - 1)
    // Böylece kombo büyüdükçe birikim hızlanır ama kontrollü kalır.
    const ek = Math.round(5 * (carpan - 1));
    bonusBirikim += ek;
    return { adet: adet, carpan: carpan, ek: ek, yeniEsik: esikMi(adet) };
  }

  // Bu cevapla yeni bir çarpan eşiği geçildi mi? (kutlama için)
  function esikMi(n) {
    return ESIKLER.some(e => e.adet === n);
  }

  function yanlis() {
    const kirilan = adet;      // kaçlık seri kırıldı (kullanıcıya söylenebilir)
    adet = 0;
    return { kirilan: kirilan };
  }

  function durum() { return { adet: adet, carpan: carpanBul(adet) }; }

  // Ders bitiminde kombo bonusu (zaten birikimli tutuluyor)
  function bonusXp() { return bonusBirikim; }

  // Yeni ders için her şeyi sıfırla (bonus DAHİL — yeni ders yeni hesap)
  function temizle() {
    adet = 0; enYuksek = 0; dogruSayisi = 0; bonusBirikim = 0;
  }

  function ozet() {
    return {
      enYuksek: enYuksek,
      dogru: dogruSayisi,
      bonus: bonusBirikim,
      carpan: carpanBul(enYuksek)
    };
  }

  // Görünüm: "x1.2" (1.0'da boş döner, etiket gösterilmez)
  function etiket(n) {
    const c = carpanBul(n === undefined ? adet : n);
    if (c <= 1) return '';
    return 'x' + c.toFixed(1).replace('.0', '');
  }

  // Sıradaki eşiğe kaç doğru kaldı? (motivasyon: "1 doğru daha = x1.3")
  function sonrakiEsik() {
    for (let i = 0; i < ESIKLER.length; i++) {
      if (adet < ESIKLER[i].adet) {
        return { kalan: ESIKLER[i].adet - adet, carpan: ESIKLER[i].carpan };
      }
    }
    return null;   // tavanda
  }

  window.Kombo = {
    ESIKLER: ESIKLER,
    TAVAN: TAVAN,
    dogru: dogru,
    yanlis: yanlis,
    durum: durum,
    bonusXp: bonusXp,
    temizle: temizle,
    ozet: ozet,
    etiket: etiket,
    sonrakiEsik: sonrakiEsik
  };
})();