// Ders 10: Kelime Boss
registerDers(10, {
  baslik: "Kelime Boss",
  xp: 100,
  can: 3,
  adimlar: [
    { tip: 'ogret', ja: '👹', ro: 'BOSS SAVAŞI', mesaj: 'Hata yapma lüksün yok!', sessiz: true },
    { tip: 'dinle', soru: 'Boss saldırıyor: Bu hangi ay?', ses: 'しがつ', dogru: '四月', siklar: ['七月', '四月', '九月', '一月'] },
    { tip: 'soru', soru: 'Son vuruş! "Yüz On İki (112)"', dogru: '百十二', siklar: ['百一二', '百十二', '十百二', '一二百'] }
  ]
});
