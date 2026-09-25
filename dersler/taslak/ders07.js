// Ders 7: Saatler
registerDers(7, {
  baslik: "Japonca Saatler",
  adimlar: [
    { tip: 'ogret', ja: '時', ro: 'ji (saat)', mesaj: 'Saat eki!' },
    { tip: 'ogret', ja: '四時', ro: 'yo-ji (Saat 4)', mesaj: '⚠️ İSTİSNA! (yon-ji denmez)', ses: 'よじ' },
    { tip: 'dinle', soru: 'Sensei hangi saati söyledi?', ses: 'よじ', dogru: '四時', siklar: ['一時', '四時', '三時', '二時'] }
  ]
});
