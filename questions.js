// ============================================================
// QUESTIONS.JS : ELLE YAZILAN SORULAR / DERSLER (SAF VERİ)
//
// Burası sadece bir VERİ dosyasıdır. Kod (ekrana çizme, puanlama)
// app.js'tedir; bu dosya sadece "hangi sorular sorulacak" onu tutar.
// Bu sayede motoru bozmadan buraya yüzlerce soru ekleyebilirsin.
//
// NASIL ÇALIŞIR?
//   app.js açılışta window.SORULAR dizisini okur ve her kaydı
//   registerDers(id, ders) ile motora tanıtır.
//   - id    : mufredat.js'teki daire numarası (o derse basılınca bu sorular çıkar)
//   - ders  : { baslik, xp, can, adimlar: [ ... ] }
//
// ÖNEMLİ: mufredat.js'te ilgili daireye "harfler" veya "kapsam" YAZMASAN
//   otomatik üretici (kana.js) devreye girmez; motor doğrudan bu dosyadaki
//   soruları kullanır. (harfler/kapsam varsa otomatik üretim önceliklidir.)
//
// ADIM (soru) TİPLERİ  (app.js "ciz()" ve "cevapla()" bunları anlar)
//   { tip:'ogret',  mesaj:'...', ja:'あ', ro:'a', resim:'yol.webp', ip:'ipucu', sessiz:true }
//   { tip:'soru',   soru:'Hangisi "a"?', dogru:'あ', siklar:['あ','い','う'], buyuk:'あ' }
//   { tip:'dinle',  soru:'Ne dedi?', ses:'あ', dogru:'あ', siklar:['あ','い','う'] }
//   Not: kana harfi soruyorsan "k:'h:ka'" eklersen zayıf-harf takibi de çalışır.
//
// YENİ SORU/DERS EKLEMEK İÇİN: aşağıdaki diziye bir nesne ekle. Örnek:
//   { id: 28, ders: { baslik:'Selamlaşma', xp:50, can:3, adimlar:[ ... ] } },
//
// Bu dosya şu an BOŞ (dizi boş). mufredat.js'teki harf dersleri zaten
// kana.js tarafından otomatik üretildiği için site aynen çalışmaya devam eder.
// ============================================================

// mufredat.js yüklenmeden önce tanımlanabilir; veri olduğu için sırası önemsiz.
window.SORULAR = [

  // ---- ÖRNEK (kullanmak için başındaki // işaretlerini kaldır) ----
  // { id: 99, ders: {
  //     baslik: "Merhaba Demek", xp: 50, can: 3,
  //     adimlar: [
  //       { tip: 'ogret', ja: 'こんにちは', ro: 'Konnichiwa', mesaj: 'Merhaba!' },
  //       { tip: 'soru', soru: '"Merhaba" hangisi?', dogru: 'こんにちは', siklar: ['こんにちは','ありがとう','さようなら','おはよう'] },
  //       { tip: 'dinle', soru: 'Ne dedi?', ses: 'ありがとう', dogru: 'ありがとう', siklar: ['こんにちは','ありがとう','はい','いいえ'] }
  //     ]
  //   } },

];
