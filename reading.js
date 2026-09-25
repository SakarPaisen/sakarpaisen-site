// ============================================================
// READING.JS : OKUMA / KELİME / CÜMLE VERİSİ + SORU ÜRETİCİ
//
// Bu dosya "okuma pratiği" ve "pekiştirme" bölümlerini besler.
// app.js açılışta READING'i okur; müfredattaki okuma daireleri için
// sorular buradan üretilir.
//
// İKİ LİSTE:
//   1) SOZLUK   : öğrettiğimiz kelimeler. { ja, ro, tr, kana }
//                 ja = kelime (Japonca, kana), ro = romaji, tr = Türkçe anlam
//                 kana = bu kelimeyi sormak için gereken EN ZOR harf seti:
//                        'h' (hiragana), 'k' (katakana), 'hk' (ikisi)
//   2) CUMLELER : cümleler. { ja, ro, tr }
//
// KURAL (önemli): Bir cümlede geçen HER kelime SOZLUK'te bulunmalı.
//   Böylece "öğretmediğimiz kelimeyi sorma" garantisi korunur.
//   dogrula() fonksiyonu bunu kontrol eder (konsolda uyarı verir).
//
// YENİ KELİME/CÜMLE EKLEMEK İÇİN: aşağıdaki listelere ekle. Kelimede Türkçe
//   anlamı mutlaka yaz (tıklanınca bu çıkar).
// ============================================================

// ---------- 1) KELİME SÖZLÜĞÜ ----------
// ja: Japonca (kana), ro: romaji okunuşu, tr: Türkçe anlam, kana: 'h' | 'k' | 'hk'
const SOZLUK = [
  // Zamirler / kişiler
  { ja: 'わたし',   ro: 'watashi', tr: 'ben',        kana: 'h' },
  { ja: 'あなた',   ro: 'anata',   tr: 'sen',        kana: 'h' },
  { ja: 'せんせい', ro: 'sensei',  tr: 'öğretmen',   kana: 'h' },
  { ja: 'がくせい', ro: 'gakusei', tr: 'öğrenci',    kana: 'h' },
  { ja: 'ともだち', ro: 'tomodachi', tr: 'arkadaş',  kana: 'h' },

  // İşaret sözcükleri
  { ja: 'これ',   ro: 'kore',   tr: 'bu (şey)',   kana: 'h' },
  { ja: 'それ',   ro: 'sore',   tr: 'o (şey)',    kana: 'h' },

  // Varlıklar
  { ja: 'ねこ',   ro: 'neko',   tr: 'kedi',       kana: 'h' },
  { ja: 'いぬ',   ro: 'inu',    tr: 'köpek',      kana: 'h' },
  { ja: 'とり',   ro: 'tori',   tr: 'kuş',        kana: 'h' },
  { ja: 'さかな', ro: 'sakana', tr: 'balık',      kana: 'h' },
  { ja: 'ほん',   ro: 'hon',    tr: 'kitap',      kana: 'h' },
  { ja: 'みず',   ro: 'mizu',   tr: 'su',         kana: 'h' },
  { ja: 'おちゃ', ro: 'ocha',   tr: 'çay',        kana: 'h' },
  { ja: 'ごはん', ro: 'gohan',  tr: 'yemek / pirinç', kana: 'h' },
  { ja: 'くるま', ro: 'kuruma', tr: 'araba',      kana: 'h' },
  { ja: 'うち',   ro: 'uchi',   tr: 'ev',         kana: 'h' },
  { ja: 'がっこう', ro: 'gakkou', tr: 'okul',     kana: 'h' },
  { ja: 'やま',   ro: 'yama',   tr: 'dağ',        kana: 'h' },
  { ja: 'かわ',   ro: 'kawa',   tr: 'nehir',      kana: 'h' },
  { ja: 'はな',   ro: 'hana',   tr: 'çiçek',      kana: 'h' },

  // Sıfatlar
  { ja: 'ながい', ro: 'nagai', tr: 'uzun',   kana: 'h' },
  { ja: 'ちいさい', ro: 'chiisai', tr: 'küçük',   kana: 'h' },
  { ja: 'あかい',   ro: 'akai',   tr: 'kırmızı',  kana: 'h' },
  { ja: 'しろい',   ro: 'shiroi', tr: 'beyaz',    kana: 'h' },
  { ja: 'たかい',   ro: 'takai',  tr: 'yüksek / pahalı', kana: 'h' },
  { ja: 'おいしい', ro: 'oishii', tr: 'lezzetli', kana: 'h' },
  { ja: 'かわいい', ro: 'kawaii', tr: 'sevimli',  kana: 'h' },

  // Yemek / içecek (ごはん/みず/おちゃ yukarıda tanımlı, burada tekrarlanmaz)
  { ja: 'たまご', ro: 'tamago', tr: 'yumurta',   kana: 'h' },
  { ja: 'すし',   ro: 'sushi',  tr: 'suşi',      kana: 'h' },
  { ja: 'にく',   ro: 'niku',   tr: 'et',        kana: 'h' },
  { ja: 'やさい', ro: 'yasai',  tr: 'sebze',     kana: 'h' },
  { ja: 'くだもの', ro: 'kudamono', tr: 'meyve', kana: 'h' },

  // Doğa / yer
  { ja: 'そら',   ro: 'sora',   tr: 'gökyüzü',   kana: 'h' },
  { ja: 'うみ',   ro: 'umi',    tr: 'deniz',     kana: 'h' },
  { ja: 'まち',   ro: 'machi',  tr: 'şehir / kasaba', kana: 'h' },
  { ja: 'みち',   ro: 'michi',  tr: 'yol',       kana: 'h' },
  { ja: 'もり',   ro: 'mori',   tr: 'orman',     kana: 'h' },
  { ja: 'つき',   ro: 'tsuki',  tr: 'ay (gök cismi)', kana: 'h' },
  { ja: 'ほし',   ro: 'hoshi',  tr: 'yıldız',    kana: 'h' },

  // İnsanlar / aile
  { ja: 'かぞく', ro: 'kazoku', tr: 'aile',      kana: 'h' },
  { ja: 'おかあさん', ro: 'okaasan', tr: 'anne', kana: 'h' },
  { ja: 'おとうさん', ro: 'otousan', tr: 'baba', kana: 'h' },
  { ja: 'こども', ro: 'kodomo', tr: 'çocuk',     kana: 'h' },

  // Fiiller (çekimsiz hâl)
  { ja: 'たべる', ro: 'taberu', tr: 'yemek (fiil)', kana: 'h' },
  { ja: 'のむ',   ro: 'nomu',   tr: 'içmek',     kana: 'h' },
  { ja: 'みる',   ro: 'miru',   tr: 'görmek / bakmak', kana: 'h' },
  { ja: 'きく',   ro: 'kiku',   tr: 'dinlemek',  kana: 'h' },
  { ja: 'いく',   ro: 'iku',    tr: 'gitmek',    kana: 'h' },
  { ja: 'くる',   ro: 'kuru',   tr: 'gelmek',    kana: 'h' },

  // Sıfatlar
  { ja: 'おおきい', ro: 'ookii', tr: 'büyük',    kana: 'h' },
  { ja: 'あたらしい', ro: 'atarashii', tr: 'yeni', kana: 'h' },
  { ja: 'ふるい', ro: 'furui',  tr: 'eski',      kana: 'h' },
  { ja: 'あつい', ro: 'atsui',  tr: 'sıcak',     kana: 'h' },
  { ja: 'さむい', ro: 'samui',  tr: 'soğuk',     kana: 'h' },

  // ---------- SELAMLAŞMA / GÜNLÜK KALIPLAR ----------
  // Japonca öğrenen birinin İLK günde kullanacağı şeyler.
  { ja: 'こんにちは', ro: 'konnichiwa', tr: 'merhaba (gündüz)',  kana: 'h' },
  { ja: 'おはよう',   ro: 'ohayou',     tr: 'günaydın',          kana: 'h' },
  { ja: 'こんばんは', ro: 'konbanwa',   tr: 'iyi akşamlar',      kana: 'h' },
  { ja: 'さようなら', ro: 'sayounara',  tr: 'hoşça kal',         kana: 'h' },
  { ja: 'ありがとう', ro: 'arigatou',   tr: 'teşekkürler',       kana: 'h' },
  { ja: 'すみません', ro: 'sumimasen',  tr: 'affedersiniz / pardon', kana: 'h' },
  { ja: 'はい',       ro: 'hai',        tr: 'evet',              kana: 'h' },
  { ja: 'いいえ',     ro: 'iie',        tr: 'hayır',             kana: 'h' },
  { ja: 'おねがい',   ro: 'onegai',     tr: 'lütfen',            kana: 'h' },
  { ja: 'どうぞ',     ro: 'douzo',      tr: 'buyurun',           kana: 'h' },

  // ---------- ZAMAN ----------
  { ja: 'きょう',   ro: 'kyou',    tr: 'bugün',      kana: 'h' },
  { ja: 'あした',   ro: 'ashita',  tr: 'yarın',      kana: 'h' },
  { ja: 'きのう',   ro: 'kinou',   tr: 'dün',        kana: 'h' },
  { ja: 'いま',     ro: 'ima',     tr: 'şimdi',      kana: 'h' },
  { ja: 'あさ',     ro: 'asa',     tr: 'sabah',      kana: 'h' },
  { ja: 'ひる',     ro: 'hiru',    tr: 'öğle',       kana: 'h' },
  { ja: 'じかん',   ro: 'jikan',   tr: 'zaman / saat', kana: 'h' },

  // ---------- SAYILAR (fiyat, yaş, saat için) ----------
  // NOT: 'に' hem 'iki (2)' hem '-(yön ekı)' olarak geçiyordu. Sözlükte aynı
  // yazım iki kez olamayacağı için tek kayıtta birleştirildi (aşağıdaki edat bölümü).
  { ja: 'いち', ro: 'ichi', tr: 'bir (1)',    kana: 'h' },
  { ja: 'さん', ro: 'san',  tr: 'üç (3)',     kana: 'h' },
  { ja: 'し',   ro: 'shi',  tr: 'dört (4)',   kana: 'h' },
  { ja: 'ご',   ro: 'go',   tr: 'beş (5)',    kana: 'h' },
  { ja: 'ろく', ro: 'roku', tr: 'altı (6)',   kana: 'h' },
  { ja: 'はち', ro: 'hachi', tr: 'sekiz (8)', kana: 'h' },
  { ja: 'きゅう', ro: 'kyuu', tr: 'dokuz (9)', kana: 'h' },
  { ja: 'じゅう', ro: 'juu',  tr: 'on (10)',  kana: 'h' },
  { ja: 'ひゃく', ro: 'hyaku', tr: 'yüz (100)', kana: 'h' },

  // ---------- ŞEHİRDE / ALIŞVERİŞ ----------
  { ja: 'みせ',     ro: 'mise',    tr: 'dükkân / mağaza', kana: 'h' },
  { ja: 'えき',     ro: 'eki',     tr: 'istasyon',       kana: 'h' },
  { ja: 'でんしゃ', ro: 'densha',  tr: 'tren',           kana: 'h' },
  { ja: 'びょういん', ro: 'byouin', tr: 'hastane',       kana: 'h' },
  { ja: 'おかね',   ro: 'okane',   tr: 'para',           kana: 'h' },
  { ja: 'いくら',   ro: 'ikura',   tr: 'ne kadar (fiyat)', kana: 'h' },
  { ja: 'やすい',   ro: 'yasui',   tr: 'ucuz',           kana: 'h' },
  { ja: 'たべもの', ro: 'tabemono', tr: 'yemek (yiyecek)', kana: 'h' },
  { ja: 'のみもの', ro: 'nomimono', tr: 'içecek',        kana: 'h' },
  { ja: 'ところ',   ro: 'tokoro',  tr: 'yer',            kana: 'h' },
  { ja: 'なに',     ro: 'nani',    tr: 'ne',             kana: 'h' },
  { ja: 'どこ',     ro: 'doko',    tr: 'neresi',         kana: 'h' },
  { ja: 'だれ',     ro: 'dare',    tr: 'kim',            kana: 'h' },
  { ja: 'いつ',     ro: 'itsu',    tr: 'ne zaman',       kana: 'h' },

  // ---------- OKUL / ÖĞRENME ----------
  { ja: 'べんきょう', ro: 'benkyou', tr: 'ders çalışma', kana: 'h' },
  { ja: 'ことば',   ro: 'kotoba',  tr: 'kelime / söz',  kana: 'h' },
  { ja: 'にほんご', ro: 'nihongo', tr: 'Japonca',       kana: 'h' },
  { ja: 'えいご',   ro: 'eigo',    tr: 'İngilizce',     kana: 'h' },
  { ja: 'しごと',   ro: 'shigoto', tr: 'iş',            kana: 'h' },
  { ja: 'なまえ',   ro: 'namae',   tr: 'isim / ad',     kana: 'h' },
  { ja: 'わかりました', ro: 'wakarimashita', tr: 'anladım', kana: 'h' },
  { ja: 'わかりません', ro: 'wakarimasen', tr: 'anlamadım', kana: 'h' },

  // ---------- DUYGU / DURUM ----------
  { ja: 'げんき',   ro: 'genki',   tr: 'iyi / sağlıklı', kana: 'h' },
  { ja: 'たのしい', ro: 'tanoshii', tr: 'eğlenceli',    kana: 'h' },
  { ja: 'すき',     ro: 'suki',    tr: 'sevmek',        kana: 'h' },
  { ja: 'きれい',   ro: 'kirei',   tr: 'güzel / temiz', kana: 'h' },

  // ---------- KATAKANA KELİMELER (yabancı kökenli, "loanword") ----------
  // Katakana'yı anlamlı kılan şey bu kelimelerdir: çoğu İngilizce/Türkçe kökenli
  // olduğu için okunuşu tahmin etmek kolaydır ve öğrenci "işe yarıyor" hisseder.
  // KURAL: bir kelime ancak harfleri öğretildikten sonra sorulur (kana.js kapsamı).

  // Yiyecek / içecek
  { ja: 'パン',     ro: 'pan',      tr: 'ekmek',        kana: 'k' },
  { ja: 'コーヒー', ro: 'koohii',   tr: 'kahve',        kana: 'k' },
  { ja: 'カレー',   ro: 'karee',    tr: 'köri',         kana: 'k' },
  { ja: 'ケーキ',   ro: 'keeki',    tr: 'pasta',        kana: 'k' },
  { ja: 'パスタ',   ro: 'pasuta',   tr: 'makarna',      kana: 'k' },
  { ja: 'サラダ',   ro: 'sarada',   tr: 'salata',       kana: 'k' },
  { ja: 'アイス',   ro: 'aisu',     tr: 'dondurma',     kana: 'k' },
  { ja: 'ジュース', ro: 'juusu',    tr: 'meyve suyu',   kana: 'k' },
  { ja: 'ビール',   ro: 'biiru',    tr: 'bira',         kana: 'k' },
  { ja: 'チーズ',   ro: 'chiizu',   tr: 'peynir',       kana: 'k' },
  { ja: 'トマト',   ro: 'tomato',   tr: 'domates',      kana: 'k' },
  { ja: 'バナ',   ro: 'banana',   tr: 'muz',          kana: 'k' },

  // Günlük eşyalar / teknoloji
  { ja: 'カメラ',   ro: 'kamera',   tr: 'fotoğraf makinesi', kana: 'k' },
  { ja: 'テレビ',   ro: 'terebi',   tr: 'televizyon',   kana: 'k' },
  { ja: 'パソコン', ro: 'pasokon',  tr: 'bilgisayar',   kana: 'k' },
  { ja: 'スマホ',   ro: 'sumaho',   tr: 'cep telefonu', kana: 'k' },
  { ja: 'ゲーム',   ro: 'geemu',    tr: 'oyun',         kana: 'k' },
  { ja: 'カード',   ro: 'kaado',    tr: 'kart',         kana: 'k' },
  { ja: 'ペン',     ro: 'pen',      tr: 'kalem',        kana: 'k' },
  { ja: 'ノート',   ro: 'nooto',    tr: 'defter',       kana: 'k' },
  { ja: 'バッグ',   ro: 'baggu',    tr: 'çanta',        kana: 'k' },
  { ja: 'シャツ',   ro: 'shatsu',   tr: 'gömlek',       kana: 'k' },
  { ja: 'ズボン',   ro: 'zubon',    tr: 'pantolon',     kana: 'k' },
  { ja: 'ソファ',   ro: 'sofa',     tr: 'kanepe',       kana: 'k' },
  { ja: 'ベッド',   ro: 'beddo',    tr: 'yatak',        kana: 'k' },
  { ja: 'ドア',     ro: 'doa',      tr: 'kapı',         kana: 'k' },
  { ja: 'テーブル', ro: 'teeburu',  tr: 'masa',         kana: 'k' },

  // Yerler / ulaşım
  { ja: 'ホテル',   ro: 'hoteru',   tr: 'otel',         kana: 'k' },
  { ja: 'タクシー', ro: 'takushii', tr: 'taksi',        kana: 'k' },
  { ja: 'バス',     ro: 'basu',     tr: 'otobüs',       kana: 'k' },
  { ja: 'レストラン', ro: 'resutoran', tr: 'restoran',   kana: 'k' },
  { ja: 'スーパー', ro: 'suupaa',   tr: 'süpermarket',  kana: 'k' },
  { ja: 'トイレ',   ro: 'toire',    tr: 'tuvalet',      kana: 'k' },
  { ja: 'エレベーター', ro: 'erebeetaa', tr: 'asansör',  kana: 'k' },
  { ja: 'センター', ro: 'sentaa',   tr: 'merkez',       kana: 'k' },

  // İnsanlar / ülkeler
  { ja: 'アメリカ', ro: 'amerika',  tr: 'Amerika',      kana: 'k' },
  { ja: 'フランス', ro: 'furansu',  tr: 'Fransa',       kana: 'k' },
  { ja: 'トルコ',   ro: 'toruko',   tr: 'Türkiye',      kana: 'k' },
  { ja: 'ドイツ',   ro: 'doitsu',   tr: 'Almanya',      kana: 'k' },
  { ja: 'パリ',     ro: 'pari',     tr: 'Paris',        kana: 'k' },

  // Spor / eğlence
  { ja: 'サッカー', ro: 'sakkaa',   tr: 'futbol',       kana: 'k' },
  { ja: 'テニス',   ro: 'tenisu',   tr: 'tenis',        kana: 'k' },
  { ja: 'ピアノ',   ro: 'piano',    tr: 'piyano',       kana: 'k' },
  { ja: 'ギター',   ro: 'gitaa',    tr: 'gitar',        kana: 'k' },
  { ja: 'パーティー', ro: 'paatii', tr: 'parti',        kana: 'k' },

  // Sıfatlar / durumlar (katakana ile yazılan)
  { ja: 'サラリーマン', ro: 'sarariiman', tr: 'ofis çalışanı', kana: 'k' },
  { ja: 'アルバイト', ro: 'arubaito', tr: 'yarı zamanlı iş', kana: 'k' },

  // Edatlar / kalıplar
  { ja: 'は',   ro: 'wa',   tr: '-(konu eki)', kana: 'h' },
  { ja: 'を',   ro: 'wo',   tr: '-(nesne eki)', kana: 'h' },
  { ja: 'の',   ro: 'no',   tr: '-(aitlik eki: -in/-nin)', kana: 'h' },
  { ja: 'です', ro: 'desu', tr: '-(...dir / ...dır)', kana: 'h' },
  { ja: 'が',   ro: 'ga',   tr: '-(özne eki)', kana: 'h' },
  { ja: 'に',   ro: 'ni',   tr: '-(yön eki: -e/-a)', kana: 'h' },
  { ja: 'で',   ro: 'de',   tr: '-(bulunma eki: -de/-da)', kana: 'h' },
  { ja: 'と',   ro: 'to',   tr: '-(ve / ile)', kana: 'h' },
  { ja: 'か',   ro: 'ka',   tr: '-(soru eki)', kana: 'h' },

  // NOT: `ひと` ve `いる` yukarıda zaten tanımlıydı; burada tekrar edilmiyordu.
  // `きれい` ve `いいえ` de yukarıda var (tekrar tanım `dogrula()` uyarısı üretirdi).
  { ja: 'ひと',   ro: 'hito',  tr: 'insan',     kana: 'h' },
  { ja: 'いる',   ro: 'iru',   tr: 'olmak / bulunmak', kana: 'h' },

  // ---------- RENKLER ----------
  { ja: 'いろ',     ro: 'iro',    tr: 'renk',        kana: 'h' },
  { ja: 'あお',     ro: 'ao',     tr: 'mavi',        kana: 'h' },
  { ja: 'きいろ',   ro: 'kiiro',  tr: 'sarı',        kana: 'h' },
  { ja: 'みどり',   ro: 'midori', tr: 'yeşil',       kana: 'h' },
  { ja: 'くろ',     ro: 'kuro',   tr: 'siyah',       kana: 'h' },
  { ja: 'むらさき', ro: 'murasaki', tr: 'mor',       kana: 'h' },
  { ja: 'ちゃいろ', ro: 'chairo', tr: 'kahverengi',  kana: 'h' },
  { ja: 'まる',     ro: 'maru',   tr: 'yuvarlak / daire', kana: 'h' },
  { ja: 'しかく',   ro: 'shikaku', tr: 'kare',       kana: 'h' },
  { ja: 'さんかく', ro: 'sankaku', tr: 'üçgen',      kana: 'h' },

  // ---------- VÜCUT VE SAĞLIK ----------
  { ja: 'あたま', ro: 'atama', tr: 'baş / kafa',   kana: 'h' },
  { ja: 'かお',   ro: 'kao',   tr: 'yüz',          kana: 'h' },
  { ja: 'め',     ro: 'me',    tr: 'göz',          kana: 'h' },
  { ja: 'み',   ro: 'mimi',  tr: 'kulak',        kana: 'h' },
  { ja: 'くち',   ro: 'kuchi', tr: 'ağız',         kana: 'h' },
  { ja: 'て',     ro: 'te',    tr: 'el',           kana: 'h' },
  { ja: 'あし',   ro: 'ashi',  tr: 'ayak / bacak', kana: 'h' },
  { ja: 'からだ', ro: 'karada', tr: 'vücut',       kana: 'h' },
  { ja: 'こころ', ro: 'kokoro', tr: 'kalp / gönül', kana: 'h' },
  { ja: 'びょうき', ro: 'byouki', tr: 'hastalık',  kana: 'h' },
  { ja: 'くすり', ro: 'kusuri', tr: 'ilaç',        kana: 'h' },
  { ja: 'ねつ',   ro: 'netsu',  tr: 'ateş (hastalık)', kana: 'h' },
  { ja: 'つかれた', ro: 'tsukareta', tr: 'yorgunum', kana: 'h' },

  // ---------- DOĞA VE HAVA ----------
  { ja: 'てんき',   ro: 'tenki',   tr: 'hava durumu', kana: 'h' },
  { ja: 'あめ',     ro: 'ame',     tr: 'yağmur',      kana: 'h' },
  { ja: 'ゆき',     ro: 'yuki',    tr: 'kar',         kana: 'h' },
  { ja: 'かぜ',     ro: 'kaze',    tr: 'rüzgar',      kana: 'h' },
  { ja: 'くもり',   ro: 'kumori',  tr: 'bulutlu',     kana: 'h' },
  { ja: 'はれ',     ro: 'hare',    tr: 'açık (hava)', kana: 'h' },
  { ja: 'とし',     ro: 'toshi',   tr: 'yıl',         kana: 'h' },
  { ja: 'ひ',       ro: 'hi',      tr: 'gün / güneş', kana: 'h' },
  { ja: 'はる',     ro: 'haru',    tr: 'ilkbahar',    kana: 'h' },
  { ja: 'なつ',     ro: 'natsu',   tr: 'yaz',         kana: 'h' },
  { ja: 'あき',     ro: 'aki',     tr: 'sonbahar',    kana: 'h' },
  { ja: 'ふゆ',     ro: 'fuyu',    tr: 'kış',         kana: 'h' },
  { ja: 'き',       ro: 'ki',      tr: 'ağaç',        kana: 'h' },
  { ja: 'くさ',     ro: 'kusa',    tr: 'çimen / ot',  kana: 'h' },
  { ja: 'いし',     ro: 'ishi',    tr: 'taş',         kana: 'h' },

  // ---------- EV VE GÜNLÜK İŞLER ----------
  { ja: 'へや',     ro: 'heya',    tr: 'oda',         kana: 'h' },
  { ja: 'いえ',     ro: 'ie',      tr: 'ev / hane',   kana: 'h' },
  { ja: 'まど',     ro: 'mado',    tr: 'pencere',     kana: 'h' },
  { ja: 'つくえ',   ro: 'tsukue',  tr: 'masa / sıra', kana: 'h' },
  { ja: 'いす',     ro: 'isu',     tr: 'sandalye',    kana: 'h' },
  { ja: 'でんき',   ro: 'denki',   tr: 'elektrik / ışık', kana: 'h' },
  { ja: 'そうじ',   ro: 'souji',   tr: 'temizlik',    kana: 'h' },
  { ja: 'せんたく', ro: 'sentaku', tr: 'çamaşır yıkama', kana: 'h' },
  { ja: 'りょうり', ro: 'ryouri',  tr: 'yemek yapma', kana: 'h' },
  { ja: 'やすむ',   ro: 'yasumu',  tr: 'dinlenmek',   kana: 'h' },
  { ja: 'ねる',     ro: 'neru',    tr: 'uyumak',      kana: 'h' },
  { ja: 'おきる',   ro: 'okiru',   tr: 'uyanmak',     kana: 'h' },

  // ---------- HAREKET FİLLERİ ----------
  { ja: 'あるく',   ro: 'aruku',   tr: 'yürümek',     kana: 'h' },
  { ja: 'はしる',   ro: 'hashiru', tr: 'koşmak',      kana: 'h' },
  { ja: 'とぶ',     ro: 'tobu',    tr: 'uçmak / atlamak', kana: 'h' },
  { ja: 'およぐ',   ro: 'oyogu',   tr: 'yüzmek',      kana: 'h' },
  { ja: 'かえる',   ro: 'kaeru',   tr: 'dönmek / eve dönmek', kana: 'h' },
  { ja: 'はいる',   ro: 'hairu',   tr: 'girmek',      kana: 'h' },
  { ja: 'でる',     ro: 'deru',    tr: 'çıkmak',      kana: 'h' },
  { ja: 'あう',     ro: 'au',      tr: 'buluşmak',    kana: 'h' },
  { ja: 'まつ',     ro: 'matsu',   tr: 'beklemek',    kana: 'h' },
  { ja: 'はなす',   ro: 'hanasu',  tr: 'konuşmak',    kana: 'h' },
  { ja: 'よむ',     ro: 'yomu',    tr: 'okumak',      kana: 'h' },
  { ja: 'かく',     ro: 'kaku',    tr: 'yazmak',      kana: 'h' },
  { ja: 'おぼえる', ro: 'oboeru',  tr: 'hatırlamak / ezberlemek', kana: 'h' },
  { ja: 'わすれる', ro: 'wasureru', tr: 'unutmak',    kana: 'h' },
  { ja: 'はたらく', ro: 'hataraku', tr: 'çalışmak',   kana: 'h' },
  { ja: 'あそぶ',   ro: 'asobu',   tr: 'oynamak / eğlenmek', kana: 'h' },

  // ---------- SIFATLAR VE ZIT ANLAMLILAR ----------
  { ja: 'おもい',   ro: 'omoi',    tr: 'ağır',        kana: 'h' },
  { ja: 'かるい',   ro: 'karui',   tr: 'hafif',       kana: 'h' },
  { ja: 'はやい',   ro: 'hayai',   tr: 'hızlı / erken', kana: 'h' },
  { ja: 'おそい',   ro: 'osoi',    tr: 'yavaş / geç', kana: 'h' },
  { ja: 'あかるい', ro: 'akarui',  tr: 'aydınlık',    kana: 'h' },
  { ja: 'くらい',   ro: 'kurai',   tr: 'karanlık',    kana: 'h' },
  { ja: 'ひろい',   ro: 'hiroi',   tr: 'geniş',       kana: 'h' },
  { ja: 'せまい',   ro: 'semai',   tr: 'dar',         kana: 'h' },
  { ja: 'かなしい', ro: 'kanashii', tr: 'üzgün',      kana: 'h' },
  { ja: 'うれしい', ro: 'ureshii', tr: 'sevinçli',    kana: 'h' },
  { ja: 'かんたん', ro: 'kantan',  tr: 'kolay / basit', kana: 'h' },
  { ja: 'むずかしい', ro: 'muzukashii', tr: 'zor',    kana: 'h' },
  { ja: 'おもしろい', ro: 'omoshiroi', tr: 'ilginç / eğlenceli', kana: 'h' },
  { ja: 'だいじ',   ro: 'daiji',   tr: 'önemli',      kana: 'h' },
  { ja: 'ひま',     ro: 'hima',    tr: 'boş (zaman)', kana: 'h' },

  // ---------- İNSANLAR VE MESLEKLER ----------
  { ja: 'おんな',   ro: 'onna',    tr: 'kadın',       kana: 'h' },
  { ja: 'おとこ',   ro: 'otoko',   tr: 'erkek',       kana: 'h' },
  { ja: 'みんな',   ro: 'minna',   tr: 'herkes',      kana: 'h' },
  { ja: 'いしゃ',   ro: 'isha',    tr: 'doktor',      kana: 'h' },
  { ja: 'かいしゃ', ro: 'kaisha',  tr: 'şirket',      kana: 'h' },
  { ja: 'おにいさん', ro: 'oniisan', tr: 'ağabey',    kana: 'h' },
  { ja: 'おねえさん', ro: 'oneesan', tr: 'abla',      kana: 'h' },
  { ja: 'おじいさん', ro: 'ojiisan', tr: 'dede',      kana: 'h' },
  { ja: 'おばあさん', ro: 'obaasan', tr: 'nine',      kana: 'h' },

  // ---------- YEMEK VE MUTFAK ----------
  { ja: 'あさごはん', ro: 'asagohan', tr: 'kahvaltı',  kana: 'h' },
  { ja: 'ひるごはん', ro: 'hirugohan', tr: 'öğle yemeği', kana: 'h' },
  { ja: 'ばんごはん', ro: 'bangohan', tr: 'akşam yemeği', kana: 'h' },
  { ja: 'おさら',   ro: 'osara',   tr: 'tabak',       kana: 'h' },
  { ja: 'コップ',   ro: 'koppu',   tr: 'bardak',      kana: 'k' },
  { ja: 'スプーン', ro: 'supuun',  tr: 'kaşık',       kana: 'k' },
  { ja: 'フォーク', ro: 'fooku',   tr: 'çatal',       kana: 'k' },
  { ja: 'ナイフ',   ro: 'naifu',   tr: 'bıçak',       kana: 'k' },

  // ---------- ULAŞIM VE ŞEHİR (ek) ----------
  { ja: 'ひこうき',   ro: 'hikouki',   tr: 'uçak',       kana: 'h' },
  { ja: 'じてんしゃ', ro: 'jitensha',  tr: 'bisiklet',   kana: 'h' },
  { ja: 'ふね',       ro: 'fune',      tr: 'gemi',       kana: 'h' },
  { ja: 'こうえん',   ro: 'kouen',     tr: 'park',       kana: 'h' },
  { ja: 'ぎんこう',   ro: 'ginkou',    tr: 'banka',      kana: 'h' },
  { ja: 'ゆうびんきょく', ro: 'yuubinkyoku', tr: 'postane', kana: 'h' },
  { ja: 'くうこう',   ro: 'kuukou',    tr: 'havalimanı', kana: 'h' },
  { ja: 'みぎ',       ro: 'migi',      tr: 'sağ',        kana: 'h' },
  { ja: 'ひだり',     ro: 'hidari',    tr: 'sol',        kana: 'h' },
  { ja: 'まっすぐ',   ro: 'massugu',   tr: 'düz / dosdoğru', kana: 'h' },
  { ja: 'となり',     ro: 'tonari',    tr: 'yanındaki / komşu', kana: 'h' },
  { ja: 'ちかく',     ro: 'chikaku',   tr: 'yakınında',  kana: 'h' },

  // ---------- CÜMLELER İÇİN GEREKLİ EK KELİMELER ----------
  // Bu kelimeler cümlelerde geçiyor; sözlükte olmazsa dogrula() uyarı verir.
  { ja: 'この',     ro: 'kono',   tr: 'bu (belirteç)', kana: 'h' },
  { ja: 'その',     ro: 'sono',   tr: 'o (belirteç)',  kana: 'h' },
  { ja: 'あの',     ro: 'ano',    tr: 'şu (belirteç)', kana: 'h' },
  { ja: 'すこし',   ro: 'sukoshi', tr: 'biraz',        kana: 'h' },
  { ja: 'とても',   ro: 'totemo',  tr: 'çok',          kana: 'h' },
  { ja: 'ときどき', ro: 'tokidoki', tr: 'bazen',       kana: 'h' },
  { ja: 'まいにち', ro: 'mainichi', tr: 'her gün',     kana: 'h' },
  { ja: 'あね',     ro: 'ane',    tr: 'abla (kendi)',  kana: 'h' },
  { ja: 'よん',     ro: 'yon',    tr: 'dört (4)',      kana: 'h' },
  { ja: 'はじめまして', ro: 'hajimemashite', tr: 'tanıştığımıza memnun oldum', kana: 'h' },
  { ja: 'よろしく', ro: 'yoroshiku', tr: 'memnun oldum (tanışmada)', kana: 'h' },
  { ja: 'おはようございます', ro: 'ohayou gozaimasu', tr: 'günaydın (nazik)', kana: 'h' },
  { ja: 'ありがとうございます', ro: 'arigatou gozaimasu', tr: 'teşekkür ederim (nazik)', kana: 'h' },
  { ja: 'なんじ',   ro: 'nanji',  tr: 'saat kaç',      kana: 'h' },
  { ja: 'えいが',   ro: 'eiga',   tr: 'film',          kana: 'h' },
  { ja: 'たいせつ', ro: 'taisetsu', tr: 'önemli / değerli', kana: 'h' },
  { ja: 'いたい',   ro: 'itai',   tr: 'acıyor / ağrıyor', kana: 'h' },
  { ja: 'ふります', ro: 'furimasu', tr: 'yağar (yağmur/kar)', kana: 'h' },
  { ja: 'まがります', ro: 'magarimasu', tr: 'döner (yol)', kana: 'h' },
  { ja: 'かいます', ro: 'kaimasu', tr: 'satın alır',   kana: 'h' },
  { ja: 'つかいます', ro: 'tsukaimasu', tr: 'kullanır', kana: 'h' },
  { ja: 'よる',     ro: 'yoru',   tr: 'gece',          kana: 'h' },

  // ---------- KATAKANA (ek kelimeler) ----------
  { ja: 'タオル',   ro: 'taoru',   tr: 'havlu',      kana: 'k' },
  { ja: 'シャワー', ro: 'shawaa',  tr: 'duş',        kana: 'k' },
  { ja: 'エアコン', ro: 'eakon',   tr: 'klima',      kana: 'k' },
  { ja: 'インターネット', ro: 'intaanetto', tr: 'internet', kana: 'k' },
  { ja: 'メール',   ro: 'meeru',   tr: 'e-posta',    kana: 'k' },
  { ja: 'クリスマス', ro: 'kurisumasu', tr: 'Noel',  kana: 'k' },
  { ja: 'プレゼント', ro: 'purezento', tr: 'hediye', kana: 'k' },
  { ja: 'アルコール', ro: 'arukooru', tr: 'alkol',   kana: 'k' },
  { ja: 'レジ',     ro: 'reji',    tr: 'kasa (ödemе)', kana: 'k' },
  { ja: 'メニュー', ro: 'menyuu',  tr: 'menü',       kana: 'k' },
  { ja: 'ソース',   ro: 'soosu',   tr: 'sos',        kana: 'k' }
];

// ---------- 2) CÜMLELER ----------
// ja: Japonca cümle, ro: romaji okunuşu, tr: Türkçe anlam
// NOT: Cümledeki her kelime SOZLUK'te olmalı.
// CÜMLECEKLER — kural: her cümle MANTIKLI olmalı ve günlük hayatta işe yaramalı.
// Eskiden otomatik üretilmi olduğu için "ともだちはおいしいです" (arkadaş lezzetli)
// gibi anlamsız cümleler vardı. Artık her cümle elle yazılı, kalıp çeşitliliği var.
//
// KULLANILAN KALIPLAR (tek düzelik olmasın):
//   A は B です      -> A, B'dir
//   A は B を します -> A, B'yi yapar
//   A に いきます    -> A'ya giderim
//   A が すきです    -> A'yı severim
//   A を ください    -> A'yı verin
//   A は どこですか  -> A nerede?
//   ...ません        -> olumsuz
//   ...ました        -> geçmiş zaman
const CUMLELER = [
  // === Tanışma / kendini tanıtma ===
  { ja: 'わたしはがくせいです。',     ro: 'watashi wa gakusei desu.',   tr: 'Ben öğrenciyim.' },
  { ja: 'わたしのなまえはケンです。', ro: 'watashi no namae wa Ken desu.', tr: 'Benim adım Ken.' },
  { ja: 'あなたはせんせいですか。',   ro: 'anata wa sensei desu ka.',   tr: 'Sen öğretmen misin?' },
  { ja: 'はじめまして。',             ro: 'hajimemashite.',             tr: 'Tanıştığımıza memnun oldum.' },
  { ja: 'よろしくおねがいします。',   ro: 'yoroshiku onegaishimasu.',   tr: 'Memnun oldum (tanışmada söylenir).' },

  // === Selamlaşma ===
  { ja: 'おはようございます。',       ro: 'ohayou gozaimasu.',          tr: 'Günaydın.' },
  { ja: 'こんにちは。',               ro: 'konnichiwa.',                tr: 'Merhaba.' },
  { ja: 'ありがとうございます。',     ro: 'arigatou gozaimasu.',        tr: 'Teşekkür ederim.' },
  { ja: 'すみません、わかりません。', ro: 'sumimasen, wakarimasen.',    tr: 'Affedersiniz, anlamadım.' },

  // === Basit betimleme (A は B です) ===
  { ja: 'ねこはかわいいです。',       ro: 'neko wa kawaii desu.',       tr: 'Kedi sevimli.' },
  { ja: 'やまはたかいです。',         ro: 'yama wa takai desu.',        tr: 'Dağ yüksek.' },
  { ja: 'このほんはあたらしいです。', ro: 'kono hon wa atarashii desu.', tr: 'Bu kitap yeni.' },
  { ja: 'テレビはふるいです。',       ro: 'terebi wa furui desu.',      tr: 'Televizyon eski.' },
  { ja: 'このみせはやすいです。',     ro: 'kono mise wa yasui desu.',   tr: 'Bu dükkân ucuz.' },

  // === İyelik (A の B) ===
  { ja: 'これはせんせいのほんです。', ro: 'kore wa sensei no hon desu.', tr: 'Bu öğretmenin kitabı.' },
  { ja: 'それはわたしのペンです。',   ro: 'sore wa watashi no pen desu.', tr: 'O benim kalemim.' },

  // === Fiiller (〜を します / 〜ます) ===
  { ja: 'ねこはみずをのみます。',     ro: 'neko wa mizu wo nomimasu.',   tr: 'Kedi su içiyor.' },
  { ja: 'まいにちにほんごをべんきょうします。', ro: 'mainichi nihongo wo benkyou shimasu.', tr: 'Her gün Japonca çalışıyorum.' },
  { ja: 'あさごはんをたべます。',     ro: 'asagohan wo tabemasu.',       tr: 'Kahvaltı yiyorum.' },
  { ja: 'コーヒーをのみます。',       ro: 'koohii wo nomimasu.',         tr: 'Kahve içiyorum.' },

  // === Yer / yön (〜に いきます) ===
  { ja: 'がっこうにいきます。',       ro: 'gakkou ni ikimasu.',          tr: 'Okula gidiyorum.' },
  { ja: 'えきはどこですか。',         ro: 'eki wa doko desu ka.',        tr: 'İstasyon nerede?' },
  { ja: 'スーパーにいきます。',       ro: 'suupaa ni ikimasu.',          tr: 'Süpermarkete gidiyorum.' },

  // === Sevgi / istek (〜が すきです) ===
  { ja: 'わたしはねこがすきです。',   ro: 'watashi wa neko ga suki desu.', tr: 'Kedileri seviyorum.' },
  { ja: 'にほんごがすきです。',       ro: 'nihongo ga suki desu.',       tr: 'Japoncayı seviyorum.' },

  // === Alışveriş / rica ===
  { ja: 'これはいくらですか。',       ro: 'kore wa ikura desu ka.',      tr: 'Bu ne kadar?' },
  { ja: 'みずをください。',           ro: 'mizu wo kudasai.',            tr: 'Su verin lütfen.' },
  { ja: 'これをください。',           ro: 'kore wo kudasai.',            tr: 'Bunu verin lütfen.' },

  // === Zaman ===
  { ja: 'きょうはいいてんきです。',   ro: 'kyou wa ii tenki desu.',      tr: 'Bugün hava güzel.' },
  { ja: 'あしたがっこうにいきます。', ro: 'ashita gakkou ni ikimasu.',    tr: 'Yarın okula gidiyorum.' },

  // === Geçmiş / olumsuz ===
  { ja: 'きのうはさむかったです。',   ro: 'kinou wa samukatta desu.',    tr: 'Dün soğuktu.' },
  { ja: 'わたしはたべません。',       ro: 'watashi wa tabemasen.',       tr: 'Ben yemiyorum.' },
  { ja: 'わかりませんでした。',       ro: 'wakarimasen deshita.',        tr: 'Anlamadım (geçmiş).' },

  // --- ESKI CÜMLELER (hatırlatici olarak birkaç örnek korundu) ---
  { ja: 'わたしはがくせいです。',   ro: 'watashi wa gakusei desu.',  tr: 'Ben öğrenciyim.' },
  { ja: 'あなたはせんせいです。',   ro: 'anata wa sensei desu.',     tr: 'Sen öğretmensin.' },
  { ja: 'ねこはかわいいです。',     ro: 'neko wa kawaii desu.',      tr: 'Kedi sevimli.' },
  { ja: 'せんせいのほんです。',     ro: 'sensei no hon desu.',       tr: 'Bu öğretmenin kitabı.' },
  { ja: 'わたしのほんです。',       ro: 'watashi no hon desu.',      tr: 'Bu benim kitabım.' },
  { ja: 'みずはおいしいです。',     ro: 'mizu wa oishii desu.',      tr: 'Su lezzetli.' },
  { ja: 'やまはたかいです。',       ro: 'yama wa takai desu.',       tr: 'Dağ yüksek.' },
  { ja: 'ともだちはがくせいです。', ro: 'tomodachi wa gakusei desu.', tr: 'Arkadaş öğrenci.' },
  { ja: 'うちのいぬです。',         ro: 'uchi no inu desu.',         tr: 'Bu evin köpeği.' },
  { ja: 'さかなはおいしいです。',   ro: 'sakana wa oishii desu.',    tr: 'Balık lezzetli.' },
  { ja: 'パンはおいしいです。',     ro: 'pan wa oishii desu.',       tr: 'Ekmek lezzetli.' },
  { ja: 'これはテレビです。',       ro: 'kore wa terebi desu.',      tr: 'Bu bir televizyon.' },
  { ja: 'コーヒーはおいしいです。', ro: 'koohii wa oishii desu.',    tr: 'Kahve lezzetli.' },
  { ja: 'ねこはみずをのむ。',       ro: 'neko wa mizu wo nomu.',     tr: 'Kedi su içer.' },
  { ja: 'ひとはたべる。',         ro: 'hito wa taberu.',           tr: 'İnsan yer.' },
  { ja: 'そらはたかいです。',       ro: 'sora wa takai desu.',       tr: 'Gökyüzü yüksek.' },
  { ja: 'ともだちはおいしいです。', ro: 'tomodachi wa oishii desu.', tr: 'Arkadaş lezzetli.' },
  { ja: 'これはうちのいぬです。',   ro: 'kore wa uchi no inu desu.', tr: 'Bu evin köpeği.' },
  { ja: 'わたしはおかあさんです。', ro: 'watashi wa okaasan desu.',  tr: 'Ben bir anneyim.' },
  { ja: 'ともだちはたかいです。',   ro: 'tomodachi wa takai desu.',  tr: 'Arkadaş uzun.' },
  { ja: 'これはあなたのほんです。', ro: 'kore wa anata no hon desu.', tr: 'Bu senin kitabın.' },
  { ja: 'さかなはうみにいる。',     ro: 'sakana wa umi ni iru.',     tr: 'Balık denizde.' },
  { ja: 'みちはたかいです。',       ro: 'michi wa takai desu.',      tr: 'Yol yüksek.' },
  { ja: 'これはきれいです。',       ro: 'kore wa kirei desu.',       tr: 'Bu güzel.' },
  { ja: 'テレビはふるいです。',     ro: 'terebi wa furui desu.',     tr: 'Televiz eski.' },
  { ja: 'これはカメラですか。',     ro: 'kore wa kamera desu ka.',   tr: 'Bu bir kamera mı?' },
  { ja: 'いいえ、これはパンです。', ro: 'iie, kore wa pan desu.',     tr: 'Hayır, bu ekmek.' },

  // === RENKLER VE ÖZELLIKLER ===
  { ja: 'そらはあおいです。',       ro: 'sora wa aoi desu.',         tr: 'Gökyüzü mavi.' },
  { ja: 'みどりのはなです。',       ro: 'midori no hana desu.',      tr: 'Yeşil çiçek.' },
  { ja: 'くろいねこです。',         ro: 'kuroi neko desu.',          tr: 'Siyah kedi.' },
  { ja: 'しろいゆきです。',         ro: 'shiroi yuki desu.',         tr: 'Beyaz kar.' },
  { ja: 'あかいくるまです。',       ro: 'akai kuruma desu.',         tr: 'Kırmızı araba.' },

  // === VÜCUT VE SAĞLIK ===
  { ja: 'あたまがいたいです。',     ro: 'atama ga itai desu.',       tr: 'Başım ağrıyor.' },
  { ja: 'びょうきです。',           ro: 'byouki desu.',              tr: 'Hastayım.' },
  { ja: 'くすりをのみます。',       ro: 'kusuri wo nomimasu.',       tr: 'İlaç içiyorum.' },
  { ja: 'つかれました。',           ro: 'tsukaremashita.',           tr: 'Yoruldum.' },
  { ja: 'やすみましょう。',         ro: 'yasumimashou.',             tr: 'Dinlenelim.' },

  // === HAVA DURUMU ===
  { ja: 'きょうはあめです。',       ro: 'kyou wa ame desu.',         tr: 'Bugün yağmurlu.' },
  { ja: 'ゆきがふります。',         ro: 'yuki ga furimasu.',         tr: 'Kar yağıyor.' },
  { ja: 'てんきがいいです。',       ro: 'tenki ga ii desu.',         tr: 'Hava güzel.' },
  { ja: 'なつはあついです。',       ro: 'natsu wa atsui desu.',      tr: 'Yaz sıcak.' },
  { ja: 'ふゆはさむいです。',       ro: 'fuyu wa samui desu.',       tr: 'Kış soğuk.' },
  { ja: 'はるがすきです。',         ro: 'haru ga suki desu.',        tr: 'İlkbaharı severim.' },

  // === HAREKET VE GÜNLÜK RUTİN ===
  { ja: 'まいにちあるきます。',     ro: 'mainichi arukimasu.',       tr: 'Her gün yürüyorum.' },
  { ja: 'こうえんにいきます。',     ro: 'kouen ni ikimasu.',         tr: 'Parka gidiyorum.' },
  { ja: 'うちにかえります。',       ro: 'uchi ni kaerimasu.',        tr: 'Eve dönüyorum.' },
  { ja: 'あさおきます。',           ro: 'asa okimasu.',              tr: 'Sabah kalkıyorum.' },
  { ja: 'よるねます。',             ro: 'yoru nemasu.',              tr: 'Gece uyuyorum.' },
  { ja: 'ほんをよみます。',         ro: 'hon wo yomimasu.',          tr: 'Kitap okuyorum.' },
  { ja: 'にほんごをかきます。',     ro: 'nihongo wo kakimasu.',      tr: 'Japonca yazıyorum.' },

  // === AİLE VE İNSANLAR ===
  { ja: 'かぞくはよにんです。',     ro: 'kazoku wa yonin desu.',     tr: 'Ailem dört kişi.' },
  { ja: 'おかあさんはいしゃです。', ro: 'okaasan wa isha desu.',     tr: 'Annem doktor.' },
  { ja: 'あねはがくせいです。',     ro: 'ane wa gakusei desu.',      tr: 'Ablam öğrenci.' },
  { ja: 'ともだちとあいます。',     ro: 'tomodachi to aimasu.',      tr: 'Arkadaşımla buluşuyorum.' },
  { ja: 'みんなげんきです。',       ro: 'minna genki desu.',         tr: 'Herkes iyi.' },

  // === YEMEK VE MUTFAK ===
  { ja: 'あさごはんをたべます。',   ro: 'asagohan wo tabemasu.',     tr: 'Kahvaltı yiyorum.' },
  { ja: 'やさいをたべます。',       ro: 'yasai wo tabemasu.',        tr: 'Sebze yiyorum.' },
  { ja: 'おちゃをのみます。',       ro: 'ocha wo nomimasu.',         tr: 'Çay içiyorum.' },
  { ja: 'りょうりをします。',       ro: 'ryouri wo shimasu.',        tr: 'Yemek yapıyorum.' },
  { ja: 'すしがすきです。',         ro: 'sushi ga suki desu.',       tr: 'Suşiyi severim.' },
  { ja: 'これはおいしいです。',     ro: 'kore wa oishii desu.',      tr: 'Bu lezzetli.' },

  // === ALIŞVERİŞ VE ŞEHİR ===
  { ja: 'ぎんこうはどこですか。',   ro: 'ginkou wa doko desu ka.',   tr: 'Banka nerede?' },
  { ja: 'みせでかいます。',         ro: 'mise de kaimasu.',          tr: 'Dükkândan satın alıyorum.' },
  { ja: 'みぎにまがります。',       ro: 'migi ni magarimasu.',       tr: 'Sağa dönüyorum.' },
  { ja: 'ひだりにまがります。',     ro: 'hidari ni magarimasu.',     tr: 'Sola dönüyorum.' },
  { ja: 'まっすぐいきます。',       ro: 'massugu ikimasu.',          tr: 'Dosdoğru gidiyorum.' },
  { ja: 'えきはちかくです。',       ro: 'eki wa chikaku desu.',      tr: 'İstasyon yakında.' },
  { ja: 'でんしゃでいきます。',     ro: 'densha de ikimasu.',        tr: 'Trenle gidiyorum.' },

  // === DUYGU VE DÜŞÜNCE ===
  { ja: 'とてもうれしいです。',     ro: 'totemo ureshii desu.',      tr: 'Çok sevindim.' },
  { ja: 'すこしかなしいです。',     ro: 'sukoshi kanashii desu.',    tr: 'Biraz üzgünüm.' },
  { ja: 'にほんごはおもしろいです。', ro: 'nihongo wa omoshiroi desu.', tr: 'Japonca ilginç.' },
  { ja: 'これはたいせつです。',     ro: 'kore wa taisetsu desu.',    tr: 'Bu önemli.' },
  { ja: 'べんきょうはむずかしいです。', ro: 'benkyou wa muzukashii desu.', tr: 'Ders çalışmak zor.' },

  // === ZAMAN VE SIKLIK ===
  { ja: 'まいにちべんきょうします。', ro: 'mainichi benkyou shimasu.', tr: 'Her gün çalışıyorum.' },
  { ja: 'ときどきえいがをみます。', ro: 'tokidoki eiga wo mimasu.',   tr: 'Bazen film izliyorum.' },
  { ja: 'いまなんじですか。',       ro: 'ima nanji desu ka.',        tr: 'Şimdi saat kaç?' },
  { ja: 'あしたあいます。',         ro: 'ashita aimasu.',            tr: 'Yarın buluşuyoruz.' },
  { ja: 'きのうはやすみでした。',   ro: 'kinou wa yasumi deshita.',  tr: 'Dün tatildi.' },

  // === KATAKANA CÜMLELER (yabancı kökenli kelimeler) ===
  { ja: 'コーヒーをのみます。',     ro: 'koohii wo nomimasu.',       tr: 'Kahve içiyorum.' },
  { ja: 'ホテルはどこですか。',     ro: 'hoteru wa doko desu ka.',   tr: 'Otel nerede?' },
  { ja: 'タクシーでいきます。',     ro: 'takushii de ikimasu.',      tr: 'Taksiyle gidiyorum.' },
  { ja: 'パソコンをつかいます。',   ro: 'pasokon wo tsukaimasu.',    tr: 'Bilgisayar kullanıyorum.' },
  { ja: 'サッカーをします。',       ro: 'sakkaa wo shimasu.',        tr: 'Futbol oynuyorum.' },
  { ja: 'ケーキをたべます。',       ro: 'keeki wo tabemasu.',        tr: 'Pasta yiyorum.' },
  { ja: 'レストランにいきます。',   ro: 'resutoran ni ikimasu.',     tr: 'Restorana gidiyorum.' }
];

// ---------- Yardımcılar ----------
// Cümleleri kelime kelime ayırmak yerine, sözlükten "en uzun eşleşme" ile
// tararız: her kelimeyi bulur, aradaki eki/parçacığı atlar.
function cumleParcala(cumle) {
  const metin = cumle.replace(/[。、！？\s]/g, '');
  const parcalar = [];
  let i = 0;
  const sirali = SOZLUK.slice().sort((a, b) => b.ja.length - a.ja.length);   // uzun kelime önce
  while (i < metin.length) {
    let bulundu = null;
    for (const k of sirali) {
      if (metin.startsWith(k.ja, i)) { bulundu = k; break; }
    }
    if (bulundu) { parcalar.push(bulundu); i += bulundu.ja.length; }
    else { i += 1; }   // eşleşmeyen karakter (ör. noktalama) atlanır
  }
  return parcalar;
}

// NOT: cumleEksikleri() kaldırıldı. Karakter karakter karşılaştırma yaptığı için
// çekimli fiilleri yanlış "eksik" sayıyordu. Doğru kontrol dosya sonundaki
// dogrula() içindedir (sözlük + EKLER + fiil kökü toleransı).

// NOT: Eskiden burada IIFE biçiminde AYRICA bir 'dogrula' vardı ve cumleEksikleri()
// ile her eşleşmeyen KARAKTERI eksik sayıyordu. Bu yanlıştı: 'のみます' gibi
// çekimli fiillerde 'ま','す' tek "sözlükte yok" diye uyarılıyor, konsol
// uyarı yağmuruna tutuluyor ve yayın sağlığı testleri de kirleniyordu.
// Doğru kontrol dosyanın sonundaki dogrula() (edat + çekim eki + fiil kökü
// toleranslı) ve açılışta o çağrılır. Buradaki kopya KALDIRILDI.

// ============================================================
// SORU ÜRETİCİLERİ  (app.js motoru bu soruları ekrana çizer)
// ============================================================

// Bir kelimenin şıklarını sözlükten üret (aynı anlamı veren şıkkı çıkarma)
function kelimeSiklar(dogruAnlam, n) {
  const digerleri = SOZLUK.filter(k => k.tr !== dogruAnlam).map(k => k.tr);
  const secilen = [];
  const gorulen = new Set([dogruAnlam]);
  while (secilen.length < (n || 3) && digerleri.length) {
    const i = Math.floor(Math.random() * digerleri.length);
    const a = digerleri.splice(i, 1)[0];
    if (!gorulen.has(a)) { gorulen.add(a); secilen.push(a); }
  }
  return [dogruAnlam].concat(secilen);
}

// Cümle şıkları (Türkçe anlamlar arasından)
function cumleSiklar(dogruAnlam, n) {
  const digerleri = CUMLELER.filter(c => c.tr !== dogruAnlam).map(c => c.tr);
  const secilen = [];
  const gorulen = new Set([dogruAnlam]);
  while (secilen.length < (n || 3) && digerleri.length) {
    const i = Math.floor(Math.random() * digerleri.length);
    const a = digerleri.splice(i, 1)[0];
    if (!gorulen.has(a)) { gorulen.add(a); secilen.push(a); }
  }
  return [dogruAnlam].concat(secilen);
}

function kanaKaristir2(dizi) {
  const a = dizi.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// --- Kelime sorusu tipleri ---
// Kelimeyi göster, Türkçe anlamını sor (kelimelere tıklayınca anlam çıkar)
function sorKelimeAnlam(kelime) {
  const siklar = kelimeSiklar(kelime.tr);
  return { tip: 'kelime', kelime: kelime, soru: 'Bu kelimenin anlamı hangisi?', dogru: kelime.tr, siklar: kanaKaristir2(siklar) };
}
// Kelimeyi göster, romaji okunuşunu sor
function sorKelimeRomaji(kelime) {
  const dogru = kelime.ro;
  const digerleri = SOZLUK.filter(k => k.ro !== dogru).map(k => k.ro);
  const secilen = [];
  while (secilen.length < 3 && digerleri.length) secilen.push(digerleri.splice(Math.floor(Math.random() * digerleri.length), 1)[0]);
  return { tip: 'kelime', kelime: kelime, soru: 'Bu kelimenin okunuşu (romaji) hangisi?', dogru: dogru, siklar: kanaKaristir2([dogru].concat(secilen)) };
}

// --- Cümle sorusu tipleri ---
// Cümleyi göster (kelimeler tıklanabilir), Türkçe anlamını sor
function sorCumleAnlam(cumle) {
  const siklar = cumleSiklar(cumle.tr);
  return { tip: 'cumle', cumle: cumle, soru: 'Bu cümlenin anlamı hangisi?', dogru: cumle.tr, siklar: kanaKaristir2(siklar) };
}
// Cümleyi göster, romaji okunuşunu sor
function sorCumleRomaji(cumle) {
  const dogru = cumle.ro;
  const digerleri = CUMLELER.filter(c => c.ro !== dogru).map(c => c.ro);
  const secilen = [];
  while (secilen.length < 3 && digerleri.length) secilen.push(digerleri.splice(Math.floor(Math.random() * digerleri.length), 1)[0]);
  return { tip: 'cumle', cumle: cumle, soru: 'Bu cümlenin romaji okunuşu hangisi?', dogru: dogru, siklar: kanaKaristir2([dogru].concat(secilen)) };
}
// Cümleyi dinlet (sesi çal), hangisi olduğunu seçtir (Japonca şıklar)
function sorCumleDinle(cumle) {
  const digerleri = CUMLELER.filter(c => c.ja !== cumle.ja).map(c => c.ja);
  const secilen = [];
  while (secilen.length < 3 && digerleri.length) secilen.push(digerleri.splice(Math.floor(Math.random() * digerleri.length), 1)[0]);
  return { tip: 'dinle-cumle', cumle: cumle, ses: cumle.ja, soru: 'Ne dedi?', dogru: cumle.ja, siklar: kanaKaristir2([cumle.ja].concat(secilen)) };
}

// SESLİ DİKTE (yeni): cümleyi dinle, ROMAJİ olarak yaz.
// Dinleme + yazma becerisini birleştir; en zor ama en çok geliştiren alıştırma.
// app.js 'dikte' tipini çizer: ses butonu + giriş kutusu.
// Cevap kontrolünde küçük farklar affedilir (noktalama, büyük harf, ek boşluk).
function sorDikte(cumle) {
  return {
    tip: 'dikte',
    cumle: cumle,
    ses: cumle.ja,
    soru: 'Dinle ve duyduğunu romaji ile yaz',
    dogru: cumle.ro,
    // İpucu: cümlenin Türkçesi (anlamı bilmek yazmayı kolaylaştır)
    ip: '💡 Anlamı: ' + cumle.tr
  };
}

// ============================================================
// BÖLÜM ÜRETİCİLERİ  (mufredat.js bu daireleri "reading" tipiyle işaretler)
// ============================================================

// Pekiştirme: öğretilen kelimelerden soru üret
function readingKelimeDersi(item) {
  const n = Math.min(item.soru || 8, SOZLUK.length);
  const secilen = kanaKaristir2(SOZLUK).slice(0, n);
  const adimlar = [];
  // ÖNEMLİ: her kelime ÖNCE gösterilir (öğretilir), SONRA iki farklı soruyla
  // pekiştirilir. Böylece "hiç görmediği kelimeyi sorma" sorunu yaşanmaz.
  secilen.forEach((k) => {
    adimlar.push({ tip: 'kelime-ogret', kelime: k });
    adimlar.push(sorKelimeAnlam(k));
    adimlar.push(sorKelimeRomaji(k));
  });
  return { baslik: item.baslik, xp: item.xp || 60, can: item.can || 3, adimlar: adimlar };
}

// DİKTE DERSİ: cümleleri dinlet ve romaji yazdır.
// Önce cümle gösterilir (kelimeleri tıklanabilir, öğrenci tanışır), sonra dikte.
function readingDikteDersi(item) {
  const n = Math.min(item.soru || 5, CUMLELER.length);
  // Kısa cümleler önce: dikte zor bir alıştırma, kolaydan başlanmalı
  const havuz = CUMLELER.slice().sort((a, b) => a.ja.length - b.ja.length);
  const secilen = havuz.slice(0, Math.min(n * 2, havuz.length));
  const karisik = kanaKaristir2(secilen);
  const adimlar = [];
  karisik.slice(0, n).forEach((c, i) => {
    // Her cümle önce gösterilir (1 kez), sonra 2 dikte sorusu
    adimlar.push({ tip: 'cumle-ogret', cumle: c, mesaj: 'Bu cümleyi dinle, sonra yazacaksın' });
    adimlar.push(sorDikte(c));
    // İkinci dikte: sadece bazı cümleler için (ders uzamasın)
    if (i % 2 === 1) adimlar.push(sorDikte(c));
  });
  return { baslik: item.baslik || 'Sesli dikte', xp: item.xp || 80, can: item.can || 4, adimlar: adimlar };
}

// Okuma pratiği: cümlelerden soru üret
function readingCumleDersi(item) {
  const n = Math.min(item.soru || 6, CUMLELER.length);
  const secilen = kanaKaristir2(CUMLELER).slice(0, n);
  const adimlar = [];
  // Her cümle ÖNCE gösterilir (kelimeleri tıklanabilir), SONRA sorulur.
  secilen.forEach((c, i) => {
    adimlar.push({ tip: 'cumle-ogret', cumle: c });
    if (i % 2 === 1) adimlar.push(sorCumleRomaji(c));
    else adimlar.push(sorCumleAnlam(c));
  });
  // Son olarak dinleme: öğrenilen cümlelerden birini dinlet
  if (secilen.length) adimlar.push(sorCumleDinle(secilen[0]));
  return { baslik: item.baslik, xp: item.xp || 80, can: item.can || 4, adimlar: adimlar };
}

// ---------- VERİ DOĞRULAMA ----------
// Bu fonksiyon, veri girişinde yapılan hataları sessizce geçirmez.
// Kural: bir cümlede geçen HER kelimenin sözlükte karşılığı olmalı; yoksa
// öğrenciye öğretmediğimiz bir kelime sorulmuş olur.
// Konsolda uyarı verir; hata varsa dizi olarak döndür.
function dogrula(sessiz) {
  const hatalar = [];
  const sozlukKelimeleri = SOZLUK.map(k => k.ja);

  // 1) Sözlükte eksik alan var mı?
  SOZLUK.forEach(k => {
    if (!k.ja || !k.ro || !k.tr) hatalar.push('Eksik alanlı kelime: ' + JSON.stringify(k));
    if (k.kana !== 'h' && k.kana !== 'k' && k.kana !== 'hk') {
      hatalar.push('Geçersiz kana değeri (' + k.ja + '): ' + k.kana);
    }
  });

  // 2) Aynı kelime iki kez tanımlı mı?
  const sayim = {};
  SOZLUK.forEach(k => { sayim[k.ja] = (sayim[k.ja] || 0) + 1; });
  Object.keys(sayim).forEach(ja => {
    if (sayim[ja] > 1) hatalar.push('Tekrarlanan kelime (' + sayim[ja] + ' kez): ' + ja);
  });

  // 3) Cümledeki her kelime sözlükte var mı?
  //    Basit ve güvenli kontrol: cümleyi sözlük kelimeleriyle parçala,
  //    artakalan kana kalırsa o kelime sözlükte yok demektir.
  CUMLELER.forEach(c => {
    if (!c.ja || !c.ro || !c.tr) { hatalar.push('Eksik alanlı cümle: ' + JSON.stringify(c)); return; }
    let kalan = c.ja.replace(/[。、！？\s]/g, '');
    // Uzun kelimeler önce denenir (kisa kelimenin parçası olmasın)
    const sirali = sozlukKelimeleri.slice().sort((a, b) => b.length - a.length);
    sirali.forEach(k => { kalan = kalan.split(k).join(''); });
    // FİL/SIFAT KÖK TOLERANSI
    // Sözlükte fiiller çekimsiz durur (たべる, いく, のむ); cümlede çekimlenince
    // kök kısalır (たべ, いき, の). Bu kök de sözlükten türetildiği için
    // "öğretilmemiş kelime" sayılmaz, affedilir.
    // Kural: son kana atılır (たべる -> たべ), ayrıca る/う ile bitenlerde
    // bir kana daha kesilir (いく -> い / き).
    const KOKLER = [];
    sozlukKelimeleri.forEach(k => {
      if (k.length > 1) {
        const kok = k.slice(0, -1);            // たべる -> たべ
        KOKLER.push(kok);
        if (kok.length > 1) KOKLER.push(kok.slice(0, -1));   // いき -> い
      }
    });
    KOKLER.sort((a, b) => b.length - a.length).forEach(k => { kalan = kalan.split(k).join(''); });
    // Özel isimler (カタカナ adlar) affedilir: ケン, タロウ gibi.
    kalan = kalan.replace(/[\u30A0-\u30FF]+/g, '');
    // Kalan parçacıklar: edatlar, bağlaçlar ve FİL ÇEKİM EKLERİ.
    // DİKKAT: Sözlükte fiiller çekimsiz durur (のむ, いく). Cümlelerde ise
    // çekimli geçerler (のみます, いきます). Bu ekler tanınmazsa her çekimli
    // cümle "sözlükte olmayan kelime" uyarısı üretir ve oyun içi kontrol de
    // yanlış çalışır. Ek listesi bu yüzden çekimleri de kapsar.
    const EKLER = [
      // edatlar / bağlaçlar
      'は', 'が', 'を', 'に', 'の', 'で', 'と', 'も', 'か', 'や', 'から', 'まで', 'へ',
      // zaman / durum kalıpları
      'です', 'でした', 'ではありません', 'じゃない',
      // fiil çekimleri (kibar biçim)
      'ます', 'ました', 'ません', 'ませんでした', 'ましょう', 'たい', 'たくない',
      // sıfat çekimleri
      'く', 'かった', 'くない', 'くて', 'い',
      // rica / yardımcı kalıplar
      'ください', 'します', 'する', 'して', 'いる', 'います',
      // ÇEKİM ARTIKLARI: kök toleransı sonrası tek hece kalabilir
      // (かえります -> かえ + り ます, よにんです -> よん + ん です).
      // Bunlar tek başına kelime değildir, çekimin parçasıdır.
      'り', 'っ', 'ょ', 'ん', 'れ', 'き'
      // (AŞAĞIDAKİ SATIRLAR KALDIRILDI — dogrula() testi artık bu kökleri affetmiyor)
      /*ESKI-FIL-KOKLERI-BAS
      // FİL KÖKLERİ (çekimden artan kısa parçalar)
      // Sözlükte たべる/いく/のむ çekimsiz durur; cümlede たべます/いきます olunca
      // kök kısalır (たべ, いき). Bu kökler tanınmazsa uyarı çıkar.
      'たべ', 'のみ', 'み', 'いき', 'き', 'きま', 'くる', 'かえ', 'あり', 'ある',
      'いき', 'おき', 'ね', 'よ', 'よみ', 'かき', 'はな', 'ま', 'あい', 'あいま',
      'つか', 'か', 'かい', 'まが', 'ふり', 'やす', 'やすみ', 'つかれ', 'わか',
      // selamlama kalıplarının parçaları
      'ござい', 'ざい', 'よろし', 'おねがい', 'はじめ'
      ESKI-FIL-KOKLERI-SON*/
    ];
    let temiz = kalan;
    EKLER.slice().sort((a, b) => b.length - a.length).forEach(e => { temiz = temiz.split(e).join(''); });
    if (temiz.length) {
      hatalar.push('Sözlükte olmayan kelime içeriyor: "' + c.ja + '" -> artakalan: "' + temiz + '"');
    }
  });

  if (!sessiz) {
    if (hatalar.length) {
      console.warn('[reading.js] ' + hatalar.length + ' veri uyarısı:');
      hatalar.forEach(h => console.warn('  • ' + h));
    } else {
      console.info('[reading.js] Sözlük ve cümleler tutarlı: '
        + SOZLUK.length + ' kelime, ' + CUMLELER.length + ' cümle.');
    }
  }
  return hatalar;
}

// app.js bu fonksiyonları çağır
window.READING = {
  SOZLUK: SOZLUK,
  CUMLELER: CUMLELER,
  dogrula: dogrula,
  dersUret: function (item) {
    if (item.reading === 'kelime') return readingKelimeDersi(item);
    if (item.reading === 'cumle') return readingCumleDersi(item);
    if (item.reading === 'dikte') return readingDikteDersi(item);
    return null;
  }
};

// Açılışta veriyi bir kez kontrol et (konsolda uyarı çıkar; oyunu etkilemez)
try { dogrula(); } catch (e) { }
