// ============================================================
// MÜFREDAT: haritadaki tüm daireler burada. dojo.html ve oyun.html bunu okur.
//
// tip 'ders'    -> harfler: [...]  harfleri öğretir, sorar, yanlışları tekrar eder
// tip 'test'    -> kapsam:'hepsi'  bu daireye kadar öğrenilen harflerden sorar
// tip 'boss'    -> test gibi, daha zor ve daha çok XP
// tip 'yakinda' -> henüz hazır değil
//
// alfabe: 'h' = Hiragana (varsayılan), 'k' = Katakana, 'hk' = ikisi karışık (sadece test/boss)
//   Test/boss sadece kendi alfabesindeki önceki harflerden sorar.
//
// ikisiAtla: "Hiragana ve Katakana biliyorum" diyen kullanıcı bu daireyi geçince
//   bir sonraki yerine bu id'ye atlar.
//
// Elle yazılmış özel bir ders (kelime, kanji vb.) istersen 'harfler' ve 'kapsam' verme,
// dersler/dersNN.js dosyası yaz (NN = id, iki haneli). Örnek en altta.
// ÖNEMLİ: Dosyalar `dersler/` klasöründe olmalı (dersler/ders33.js gibi), kökte değil.
// Eski taslaklar: dersler/taslak/ (sayılar, saatler, günler, selamlaşma) - burada durur, otomatik yüklenmez.
//
// NOT: id'ler sırayla gider, ilerleme "kaçıncı dairedeyim" olarak saklanır.
// Araya yeni daire eklersen sonrakilerin id'lerini kaydır.
// ============================================================
const MUFREDAT = [
  // ============================================================
  // BÖLÜM 1: HİRAGANA TEMEL (46 harf, 4'lü-5'li satırlar)
  // Duolingo mantığı: her satır öğret -> hemen sına, 3 satırda bir test.
  // ============================================================
  { id: 1,bolum: "Hiragana Temel", baslik: "A satırı", tip: "ders", harfler: ['a','i','u','e','o'] },
  { id: 2,baslik: "K satırı", tip: "ders", harfler: ['ka','ki','ku','ke','ko'] },
  { id: 3,baslik: "S satırı", tip: "ders", harfler: ['sa','shi','su','se','so'] },
  { id: 4,baslik: "T satırı", tip: "ders", harfler: ['ta','chi','tsu','te','to'] },
  { id: 5,baslik: "N satırı", tip: "ders", harfler: ['na','ni','nu','ne','no'] },
  { id: 6,baslik: "Test: A-K-S-T-N", tip: "test", kapsam: 'hepsi', soru: 12, can: 4, xp: 75 },

  { id: 7,baslik: "H satırı", tip: "ders", harfler: ['ha','hi','fu','he','ho'] },
  { id: 8,baslik: "M satırı", tip: "ders", harfler: ['ma','mi','mu','me','mo'] },
  { id: 9,baslik: "Y satırı", tip: "ders", harfler: ['ya','yu','yo'] },
  { id: 10,baslik: "R satırı", tip: "ders", harfler: ['ra','ri','ru','re','ro'] },
  { id: 11,baslik: "W ve N", tip: "ders", harfler: ['wa','wo','n'] },
  { id: 12,baslik: "Test: H-M-Y-R-W", tip: "test", kapsam: 'hepsi', soru: 14, can: 4, xp: 75 },
  { id: 13,baslik: "🔥 Hiragana Sınavı", tip: "boss", kapsam: 'hepsi', soru: 24, can: 5, xp: 150 },

  // ============================================================
  // BÖLÜM 2: HİRAGANA TÜREVLERİ (dakuten, handakuten, youon)
  // Yeni bir tip: 'grup' -> kana.js KANA_GRUPLAR'tan üretir
  // ============================================================
  { id: 14,bolum: "Hiragana Türevleri", baslik: "G sesleri (が行)", tip: "ders", grup: 'g:ga', harfler: ['ga','gi','gu','ge','go'] },
  { id: 15,baslik: "Z sesleri (ざ行)", tip: "ders", grup: 'z:za', harfler: ['za','ji','zu','ze','zo'] },
  { id: 16,baslik: "D sesleri (だ行)", tip: "ders", grup: 'd:da', harfler: ['da','ji2','zu2','de','do'] },
  { id: 17,baslik: "B sesleri (ば行)", tip: "ders", grup: 'b:ba', harfler: ['ba','bi','bu','be','bo'] },
  { id: 18,baslik: "P sesleri (ぱ行)", tip: "ders", grup: 'p:pa', harfler: ['pa','pi','pu','pe','po'] },
  { id: 19,baslik: "Test: Türevler 1", tip: "test", kapsam: 'hepsi', soru: 14, can: 4, xp: 75 },

  { id: 20,baslik: "Bileşik: K sesleri", tip: "ders", grup: 'y:kya', harfler: ['kya','kyu','kyo'] },
  { id: 21,baslik: "Bileşik: Ş sesleri", tip: "ders", grup: 'y:sha', harfler: ['sha','shu','sho'] },
  { id: 22,baslik: "Bileşik: Ç sesleri", tip: "ders", grup: 'y:cha', harfler: ['cha','chu','cho'] },
  { id: 23,baslik: "Bileşik: N sesleri", tip: "ders", grup: 'y:nya', harfler: ['nya','nyu','nyo'] },
  { id: 24,baslik: "Bileşik: H ve M", tip: "ders", grup: 'y:hya', harfler: ['hya','hyu','hyo','mya','myu','myo'] },
  { id: 25,baslik: "Bileşik: R sesleri", tip: "ders", grup: 'y:rya', harfler: ['rya','ryu','ryo'] },
  { id: 26,baslik: "Test: Bileşik sesler", tip: "test", kapsam: 'hepsi', soru: 16, can: 4, xp: 80 },
  { id: 27,baslik: "👺 Hiragana Ustası", tip: "boss", kapsam: 'hepsi', soru: 24, can: 5, xp: 160 },

  // ============================================================
  // BÖLÜM 3: KATAKANA TEMEL
  // ============================================================
  { id: 28,bolum: "Katakana Temel", alfabe: 'k', baslik: "A satırı", tip: "ders", harfler: ['a','i','u','e','o'] },
  { id: 29,alfabe: 'k', baslik: "K satırı", tip: "ders", harfler: ['ka','ki','ku','ke','ko'] },
  { id: 30,alfabe: 'k', baslik: "S satırı", tip: "ders", harfler: ['sa','shi','su','se','so'] },
  { id: 31,alfabe: 'k', baslik: "T satırı", tip: "ders", harfler: ['ta','chi','tsu','te','to'] },
  { id: 32,alfabe: 'k', baslik: "N satırı", tip: "ders", harfler: ['na','ni','nu','ne','no'] },
  { id: 33,alfabe: 'k', baslik: "Test: A-K-S-T-N", tip: "test", kapsam: 'hepsi', soru: 12, can: 4, xp: 75 },

  { id: 34,alfabe: 'k', baslik: "H satırı", tip: "ders", harfler: ['ha','hi','fu','he','ho'] },
  { id: 35,alfabe: 'k', baslik: "M satırı", tip: "ders", harfler: ['ma','mi','mu','me','mo'] },
  { id: 36,alfabe: 'k', baslik: "Y satırı", tip: "ders", harfler: ['ya','yu','yo'] },
  { id: 37,alfabe: 'k', baslik: "R satırı", tip: "ders", harfler: ['ra','ri','ru','re','ro'] },
  { id: 38,alfabe: 'k', baslik: "W ve N", tip: "ders", harfler: ['wa','wo','n'] },
  { id: 39,alfabe: 'k', baslik: "Test: H-M-Y-R-W", tip: "test", kapsam: 'hepsi', soru: 14, can: 4, xp: 75 },
  { id: 40,alfabe: 'k', baslik: "🔥 Katakana Sınavı", tip: "boss", kapsam: 'hepsi', soru: 24, can: 5, xp: 150 },

  // ============================================================
  // BÖLÜM 4: KATAKANA TÜREVLERİ
  // ============================================================
  { id: 41,bolum: "Katakana Türevleri", alfabe: 'k', baslik: "G sesleri (ガ行)", tip: "ders", grup: 'g:ga', harfler: ['ga','gi','gu','ge','go'] },
  { id: 42,alfabe: 'k', baslik: "Z sesleri (ザ行)", tip: "ders", grup: 'z:za', harfler: ['za','ji','zu','ze','zo'] },
  { id: 43,alfabe: 'k', baslik: "D sesleri (ダ行)", tip: "ders", grup: 'd:da', harfler: ['da','ji2','zu2','de','do'] },
  { id: 44,alfabe: 'k', baslik: "B sesleri (バ行)", tip: "ders", grup: 'b:ba', harfler: ['ba','bi','bu','be','bo'] },
  { id: 45,alfabe: 'k', baslik: "P sesleri (パ行)", tip: "ders", grup: 'p:pa', harfler: ['pa','pi','pu','pe','po'] },
  { id: 46,alfabe: 'k', baslik: "Test: Katakana Türev 1", tip: "test", kapsam: 'hepsi', soru: 14, can: 4, xp: 75 },
  { id: 47,alfabe: 'k', baslik: "Bileşik: K ve Ş", tip: "ders", grup: 'y:kya', harfler: ['kya','kyu','kyo'] },
  { id: 48,alfabe: 'k', baslik: "Bileşik: Ş sesleri", tip: "ders", grup: 'y:sha', harfler: ['sha','shu','sho'] },
  { id: 49,alfabe: 'k', baslik: "Bileşik: Ç ve N", tip: "ders", grup: 'y:cha', harfler: ['cha','chu','cho'] },
  { id: 50,alfabe: 'k', baslik: "Bileşik: N sesleri", tip: "ders", grup: 'y:nya', harfler: ['nya','nyu','nyo'] },
  { id: 51,alfabe: 'k', baslik: "Bileşik: H M R", tip: "ders", grup: 'y:hya', harfler: ['hya','hyu','hyo','mya','myu','myo','rya','ryu','ryo'] },
  { id: 52,alfabe: 'k', baslik: "Test: Katakana Türev", tip: "test", kapsam: 'hepsi', soru: 16, can: 4, xp: 80 },
  { id: 53,alfabe: 'k', baslik: "👺 Katakana Ustası", tip: "boss", kapsam: 'hepsi', soru: 24, can: 5, xp: 170 },

  // ============================================================
  // BÖLÜM 5: HİRAGANA ↔ KATAKANA (eşleştirme)
  // Öğrendiğin iki alfabeyi birbirine bağlar - en hızlı kalıcı öğrenme.
  // ============================================================
  { id: 54,bolum: "İki Alfabe", alfabe: 'hk', baslik: "Karşılıkları 1", tip: "pekistir", soru: 12, can: 4, xp: 80 },
  { id: 55,alfabe: 'hk', baslik: "Karşılıkları 2", tip: "pekistir", soru: 16, can: 4, xp: 90 },
  { id: 56,alfabe: 'hk', baslik: "👑 Büyük Sınav", tip: "boss", kapsam: 'hepsi', soru: 30, can: 5, xp: 250 },

  // ============================================================
  // BÖLÜM 6: OKUMA PRATİĞİ (kelime + cümle, gerçek kullanım)
  // ============================================================
  { id: 57,bolum: "Okuma Pratiği", baslik: "İlk Kelimeler", tip: "reading", reading: 'kelime', soru: 8, can: 3, xp: 60 },
  { id: 58,baslik: "İnsanlar ve Aile", tip: "reading", reading: 'kelime', soru: 8, can: 3, xp: 60 },
  { id: 59,baslik: "Yiyecek ve İçecek", tip: "reading", reading: 'kelime', soru: 8, can: 3, xp: 65 },
  { id: 60,baslik: "Yerler ve Nesneler", tip: "reading", reading: 'kelime', soru: 8, can: 3, xp: 65 },
  { id: 61,baslik: "Basit Cümleler", tip: "reading", reading: 'cumle', soru: 6, can: 4, xp: 80 },
  { id: 62,baslik: "Cümle Kalıpları", tip: "reading", reading: 'cumle', soru: 8, can: 4, xp: 90 },

  // --- YENİ KELİME GRUPLARI (sözlük büyüdükçe eklendi) ---
  { id: 63,baslik: "Renkler ve Şekiller", tip: "reading", reading: 'kelime', soru: 8, can: 3, xp: 65 },
  { id: 64,baslik: "Vücut ve Sağlık", tip: "reading", reading: 'kelime', soru: 8, can: 3, xp: 65 },
  { id: 65,baslik: "Doğa ve Hava", tip: "reading", reading: 'kelime', soru: 8, can: 3, xp: 70 },
  { id: 66,baslik: "Ev ve Günlük İşler", tip: "reading", reading: 'kelime', soru: 8, can: 3, xp: 70 },
  { id: 67,baslik: "Hareket Fiilleri", tip: "reading", reading: 'kelime', soru: 8, can: 3, xp: 75 },
  { id: 68,baslik: "Sıfatlar ve Zıtlıklar", tip: "reading", reading: 'kelime', soru: 8, can: 3, xp: 75 },
  { id: 69,baslik: "Zıt Anlamlılar", tip: "reading", reading: 'kelime', soru: 8, can: 3, xp: 75 },
  { id: 70,baslik: "Katakana Dünyası", tip: "reading", reading: 'kelime', soru: 10, can: 3, xp: 80 },

  // --- SESLİ DİKTE ---
  // Cümleyi dinle, romaji yaz. Dinleme + yazma becerisini birleştir.
  // Küçük yazım farkları affedilir (bkz. app.js -> cevaplaDikte).
  { id: 71,baslik: "Sesli Dikte 1", tip: "reading", reading: 'dikte', soru: 4, can: 5, xp: 90 },
  { id: 72,baslik: "Sesli Dikte 2", tip: "reading", reading: 'dikte', soru: 5, can: 5, xp: 100 },
  { id: 73,baslik: "📖 Okuma Sınavı", tip: "reading", reading: 'cumle', soru: 10, can: 4, xp: 110 },

  // ============================================================
  // BÖLÜM 7: PEKİŞTİRME VE USTALIK (bitiş yok, hep çalışır)
  // ============================================================
  { id: 74,bolum: "Pekiştirme ve Ustalık", baslik: "Zayıf Harfler", tip: "pekistir", soru: 10, can: 4, xp: 60 },
  { id: 75,alfabe: 'k', baslik: "Zayıf Katakana", tip: "pekistir", soru: 12, can: 4, xp: 70 },
  { id: 76,alfabe: 'hk', baslik: "Kana Karışık", tip: "pekistir", soru: 14, can: 4, xp: 80 },
  { id: 77,baslik: "Hız Turu", tip: "pekistir", soru: 16, can: 3, xp: 90 },
  { id: 78,alfabe: 'hk', baslik: "💪 Ustalık Sınavı", tip: "boss", kapsam: 'hepsi', soru: 32, can: 6, xp: 300 },
  { id: 79,alfabe: 'hk', baslik: "🤺 Samuray Sınavı", tip: "boss", kapsam: 'hepsi', soru: 40, can: 5, xp: 400 },

  // ============================================================
  // BÖLÜM 8: İLERİ OKUMA (uzun cümleler, dinleme)
  // ============================================================
  { id: 80,bolum: "İleri Okuma", baslik: "Uzun Cümleler", tip: "reading", reading: 'cumle', soru: 10, can: 4, xp: 120 },
  { id: 81,baslik: "Dinleme Turu", tip: "reading", reading: 'cumle', soru: 10, can: 4, xp: 120 },
  { id: 82,baslik: "Karma Okuma", tip: "reading", reading: 'cumle', soru: 12, can: 4, xp: 130 },
  { id: 83,baslik: "Uzun Paragraflar", tip: "reading", reading: 'cumle', soru: 12, can: 4, xp: 140 },

  // ============================================================
  // BÖLÜM 9: KANJİ (N5 seviyesi) — İLERİ SEVİYE
  //
  // RİTİM (kullanıcı isteği): "1 ÖĞRET + 3 KARIŞIK"
  //   84  öğret  -> yeni kanjiler
  //   85-87 karışık -> cümle çevirisi ağırlıklı; öğrenilen kanjiler serpişir
  //   88  öğret  -> yeni kanjiler
  //   89-91 karışık
  //   ... böyle devam eder, arada sınav.
  //
  // NEDEN: Öğret-sor-öğret-sor döngüsü kanjiyi ezbere iter ve öğrenciyi yorar;
  // aralarda karışık ders olunca kanji hem pekişir hem gerçek cümle içinde görünür.
  //
  // tip: 'kanji'   -> yeni kanji öğretir (kart + anlam + okunuş + ters yön)
  // tip: 'karisik' -> cümle/kelime çevirisi; öğrenilmiş kanjiler ağırlıklı rastgele serpişir
  //
  // `soru` alanı: kanji dersinde her kanji 4 adım tutar (soru:20 -> 5 kanji).
  // Karışık derslerde doğrudan adım sayısıdır.
  // ============================================================
  { id: 84,bolum: "Kanji (N5)", baslik: "İlk Kanjiler: Sayılar", tip: "kanji", kanjiGrup: 'sayilar', sadeceKanji: ['一','二','三','四','五'], soru: 20, can: 4, xp: 100 },
  { id: 85,baslik: "Sayılarla Cümleler", tip: "karisik", soru: 12, can: 4, xp: 80 },
  { id: 86,baslik: "Sayı Pekiştirme", tip: "karisik", soru: 12, can: 4, xp: 80 },
  { id: 87,baslik: "Sayılar Karışık", tip: "karisik", soru: 14, can: 4, xp: 85 },

  { id: 88,baslik: "Sayılar 2 (6-10)", tip: "kanji", kanjiGrup: 'sayilar2', sadeceKanji: ['六','七','八','九','十'], soru: 20, can: 4, xp: 100 },
  { id: 89,baslik: "Sayılarla Cümleler 2", tip: "karisik", soru: 12, can: 4, xp: 80 },
  { id: 90,baslik: "Günlük Sayılar", tip: "karisik", soru: 14, can: 4, xp: 85 },
  { id: 91,baslik: "Sayı Karışık 2", tip: "karisik", soru: 14, can: 4, xp: 85 },

  { id: 92,baslik: "Günler ve Zaman", tip: "kanji", kanjiGrup: 'gunler', sadeceKanji: ['日','月','火','水','木'], soru: 20, can: 4, xp: 110 },
  { id: 93,baslik: "Gün Cümlelerı", tip: "karisik", soru: 12, can: 4, xp: 85 },
  { id: 94,baslik: "Hafta Günleri", tip: "karisik", soru: 14, can: 4, xp: 90 },
  { id: 95,baslik: "Zaman Cümleleri", tip: "karisik", soru: 14, can: 4, xp: 90 },

  { id: 96,baslik: "Günler 2 ve Saat", tip: "kanji", kanjiGrup: 'gunler2', sadeceKanji: ['金','土','年','時','分'], soru: 20, can: 4, xp: 110 },
  { id: 97,baslik: "Saat ve Dakika", tip: "karisik", soru: 12, can: 4, xp: 85 },
  { id: 98,baslik: "Günlük Rutin", tip: "karisik", soru: 14, can: 4, xp: 90 },
  { id: 99,baslik: "💮 Kanji Sınavı 1", tip: "kanji", kanjiGrup: 'sinav1', soru: 16, can: 5, xp: 180 },

  { id: 100,baslik: "İnsan ve Aile", tip: "kanji", kanjiGrup: 'insan', sadeceKanji: ['人','男','女','子','父'], soru: 20, can: 4, xp: 115 },
  { id: 101,baslik: "Aile Cümleleri", tip: "karisik", soru: 12, can: 4, xp: 85 },
  { id: 102,baslik: "İnsanlar Hakkında", tip: "karisik", soru: 14, can: 4, xp: 90 },
  { id: 103,baslik: "Tanışma Cümleleri", tip: "karisik", soru: 14, can: 4, xp: 90 },

  { id: 104,baslik: "İnsan ve Aile 2", tip: "kanji", kanjiGrup: 'insan2', sadeceKanji: ['母','友','名','先','生'], soru: 20, can: 4, xp: 115 },
  { id: 105,baslik: "Arkadaş ve Öğretmen", tip: "karisik", soru: 12, can: 4, xp: 85 },
  { id: 106,baslik: "Kişiler Karışık", tip: "karisik", soru: 14, can: 4, xp: 90 },
  { id: 107,baslik: "İsimler ve Konuşma", tip: "karisik", soru: 14, can: 4, xp: 90 },

  { id: 108,baslik: "Doğa", tip: "kanji", kanjiGrup: 'doga', sadeceKanji: ['山','川','田','天','空'], soru: 20, can: 4, xp: 120 },
  { id: 109,baslik: "Doğa Cümleleri", tip: "karisik", soru: 12, can: 4, xp: 90 },
  { id: 110,baslik: "Hava Durumu", tip: "karisik", soru: 14, can: 4, xp: 95 },
  { id: 111,baslik: "Doğa 2", tip: "kanji", kanjiGrup: 'doga2', sadeceKanji: ['雨','花','海','石','犬'], soru: 20, can: 4, xp: 120 },
  { id: 112,baslik: "Mevsimler ve Hayvanlar", tip: "karisik", soru: 14, can: 4, xp: 95 },

  { id: 113,baslik: "Yön ve Yer", tip: "kanji", kanjiGrup: 'yon', sadeceKanji: ['上','下','中','外','前'], soru: 20, can: 4, xp: 130 },
  { id: 114,baslik: "Nerede? Cümleleri", tip: "karisik", soru: 14, can: 4, xp: 95 },
  { id: 115,baslik: "Yön ve Yer 2", tip: "kanji", kanjiGrup: 'yon2', sadeceKanji: ['後','右','左','東','西'], soru: 20, can: 4, xp: 130 },
  { id: 116,baslik: "Yol Tarifi", tip: "karisik", soru: 14, can: 4, xp: 95 },

  { id: 117,baslik: "Okul ve Öğrenme", tip: "kanji", kanjiGrup: 'okul', sadeceKanji: ['学','校','本','語','国'], soru: 20, can: 4, xp: 135 },
  { id: 118,baslik: "Okul Cümleleri", tip: "karisik", soru: 14, can: 4, xp: 95 },
  { id: 119,baslik: "Dil ve Ülke", tip: "karisik", soru: 14, can: 4, xp: 100 },
  // NOT: 水 gunler grubunda olduğu için burada tekrarlanmaz (dogrula() uyarı verirdi).
  { id: 120,baslik: "Yemek ve Vücut", tip: "kanji", kanjiGrup: 'yemek', sadeceKanji: ['食','飲','口','目'], soru: 16, can: 4, xp: 135 },
  { id: 121,baslik: "Yemek Cümleleri", tip: "karisik", soru: 14, can: 4, xp: 100 },

  { id: 122,baslik: "Büyüklük ve Miktar", tip: "kanji", kanjiGrup: 'miktar', sadeceKanji: ['大','小','多','少','百'], soru: 20, can: 4, xp: 140 },
  { id: 123,baslik: "Alışveriş", tip: "karisik", soru: 14, can: 4, xp: 100 },
  // NOT: 食/飲 yemek grubundadır; eylem grubunda 見/行/来/言/聞 kullanılır.
  { id: 124,baslik: "Eylemler", tip: "kanji", kanjiGrup: 'eylem', soru: 20, can: 4, xp: 145 },
  { id: 125,baslik: "Eylem Cümleleri", tip: "karisik", soru: 16, can: 4, xp: 105 },
  { id: 126,baslik: "Günlük Hayat", tip: "karisik", soru: 16, can: 4, xp: 110 },
  { id: 127,baslik: "👑 Kanji Ustası", tip: "kanji", kanjiGrup: 'hepsi', soru: 32, can: 6, xp: 350 },

  // ============================================================
  // BÖLÜM 10: FİNAL (her şey karışık)
  // ============================================================
  { id: 128,bolum: "Final", alfabe: 'hk', baslik: "🌸 Sensei'nin Sınavı", tip: "boss", kapsam: 'hepsi', soru: 40, can: 6, xp: 450 }
];

// ------------------------------------------------------------------
// MÜFREDAT NASIL ÇALIŞIR (Duolingo mantığı, hızlı öğretim):
//   - Her satır bir daire: 4-10 harf öğretir, ilk harften sonra hemen sınar.
//   - 5-6 dairede bir 'test': o ana kadarki HER ŞEYİ karıştır (~%30'u zayıf harflerden).
//   - Her bölüm sonunda 'boss' (daha zor, daha çok XP, 5-6 can).
//   - Türev harfler (dakuten/handakuten/youon) 'grup' alanıyla öğretilir.
//   - 'pekistir' = zayıf + tekrar zamanı gelenler; 'reading' = kelime/cümle.
//   - SERBEST_MOD = true olduğu için hepsi denenebilir; kilit istersen false yap.
//
// YENİ DAİRE EKLEMEK: listeye ekle, id'leri SIRAYLA tut (ilerleme "kaçıncı
// dairedeyim" olarak saklanır, araya ekleme sonrakileri kaydır).
// ------------------------------------------------------------------

/* Elle yazılan ders örneği (dersler/ders28.js):
registerDers(28, {
  baslik: "Selamlaşma", xp: 50, can: 3,
  adimlar: [
    { tip: 'ogret', ja: 'こんにちは', ro: 'Konnichiwa', mesaj: 'Merhaba!' },
    { tip: 'dinle', soru: 'Ne dedi?', ses: 'こんにちは', dogru: 'こんにちは', siklar: ['こんにちは','ありがとう'] }
  ]
});
*/
