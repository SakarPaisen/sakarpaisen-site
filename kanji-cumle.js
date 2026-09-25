// ============================================================
// KANJİ BAĞLAM CÜMLELERİ (kanji-cumle.js)
//
// NEDEN AYRI DOSYA?
//   reading.js'teki cümleler HİRAGANA ile yazılıdır (yeni başlayan içindir).
//   Kanji öğrenen kullanıcı ise artık cümleyi KANJİ ile görmelidir; yoksa
//   kanji kana'nın yanında "süs" olarak kalır, gerçek metinde tanıyamaz.
//   Bu dosya aynı cümlelerin KANJİLİ sürümlerini ve kanji geçen yeni
//   cümleleri tutar.
//
// OKUMA (romaji) KURALI:
//   "rok" alanı boş bırakılırsa app.js kanjiyi atlayıp romaji ÜRETEMEZ
//   (tarayıcı okunuşu bilinmez). Bu yüzden HER satırda romaji elle yazılır.
//
// KAYIT BİÇİMİ:
//   { ja: '山は高いです。', ro: 'yama wa takai desu.', tr: 'Dağ yüksektir.',
//     kanjiler: ['山'], kelimeler: ['たかい'] }
//     ja       : kanjili cümle
//     ro       : romaji okunuşu
//     tr       : Türkçe anlamı
//     kanjiler : cümlede geçen kanjiler (yalnızca öğrenilmişse sorulur)
//     kelimeler: cümlede geçen sözlük kelimeleri (anlam ipucu için)
//
// ÖNEMLİ: Bir cümle yalnızca `kanjiler` listesindeki TÜM kanjiler
//   öğrenilmişse karışık derse girer. Böylece öğrenci hiç görmediği kanjiyle
//   karşılaşmaz (reading.js'teki "öğretilmemiş kelimeyi sorma" kuralının
//   kanji karşılığı).
// ============================================================

const KANJI_CUMLELER = [
  // ---------- SAYILAR ----------
  { ja: '一と二はみっつです。', ro: 'ichi to ni wa mittsu desu.', tr: 'Bir ve iki üç eder.', kanjiler: ['一', '二'], kelimeler: [] },
  { ja: '三時に会いましょう。', ro: 'sanji ni aimashou.', tr: 'Saat üçte buluşalım.', kanjiler: ['三', '時'], kelimeler: ['あう'] },
  { ja: '四月はあたかいです。', ro: 'shigatsu wa atatakai desu.', tr: 'Nisan ayı ılıktır.', kanjiler: ['四', '月'], kelimeler: [] },
  { ja: '五人の学生がいます。', ro: 'gonin no gakusei ga imasu.', tr: 'Beş öğrenci var.', kanjiler: ['五', '人', '学', '生'], kelimeler: ['いる'] },
  { ja: '十円ください。', ro: 'juuen kudasai.', tr: 'On yen lütfen.', kanjiler: ['十'], kelimeler: ['ください'] },
  { ja: 'これは百円です。', ro: 'kore wa hyakuen desu.', tr: 'Bu yüz yen.', kanjiler: ['百'], kelimeler: ['これ'] },

  // ---------- GÜNLER VE ZAMAN ----------
  { ja: '今日は月曜日です。', ro: 'kyou wa getsuyoubi desu.', tr: 'Bugün pazartesi.', kanjiler: ['今', '日', '月'], kelimeler: ['きょう'] },
  { ja: '明日は火曜日です。', ro: 'ashita wa kayoubi desu.', tr: 'Yarın salı.', kanjiler: ['明', '日', '火'], kelimeler: ['あした'] },
  { ja: '水曜日に学校へ行きます。', ro: 'suiyoubi ni gakkou e ikimasu.', tr: 'Çarşamba günü okula gidiyorum.', kanjiler: ['水', '日', '学', '校', '行'], kelimeler: ['いく'] },
  { ja: '木曜日は休みです。', ro: 'mokuyoubi wa yasumi desu.', tr: 'Perşembe günü tatil.', kanjiler: ['木', '日'], kelimeler: ['やすむ'] },
  { ja: '今は何時ですか。', ro: 'ima wa nanji desu ka.', tr: 'Şimdi saat kaç?', kanjiler: ['今', '時'], kelimeler: ['いま', 'なんじ'] },
  { ja: '今年は寒いです。', ro: 'kotoshi wa samui desu.', tr: 'Bu yıl soğuk.', kanjiler: ['今', '年'], kelimeler: ['さむい'] },
  { ja: '五分待ってください。', ro: 'gofun matte kudasai.', tr: 'Beş dakika bekleyin.', kanjiler: ['五', '分'], kelimeler: ['まつ', 'ください'] },

  // ---------- İNSAN VE AİLE ----------
  { ja: 'あの人は先生です。', ro: 'ano hito wa sensei desu.', tr: 'Şu kişi öğretmen.', kanjiler: ['人', '先', '生'], kelimeler: ['あの', 'ひと', 'せんせい'] },
  { ja: '父と母は元気です。', ro: 'chichi to haha wa genki desu.', tr: 'Babam ve annem iyi.', kanjiler: ['父', '母'], kelimeler: ['げんき'] },
  { ja: '友だちと話します。', ro: 'tomodachi to hanashimasu.', tr: 'Arkadaşımla konuşuyorum.', kanjiler: ['友'], kelimeler: ['ともだち', 'はなす'] },
  { ja: '私の名前はケンです。', ro: 'watashi no namae wa Ken desu.', tr: 'Benim adım Ken.', kanjiler: ['私', '名'], kelimeler: ['わたし', 'なまえ'] },
  { ja: '女の子が歌います。', ro: 'onna no ko ga utaimasu.', tr: 'Kız çocuk şarkı söylüyor.', kanjiler: ['女', '子'], kelimeler: [] },
  { ja: '男の人が来ました。', ro: 'otoko no hito ga kimashita.', tr: 'Bir erkek geldi.', kanjiler: ['男', '人', '来'], kelimeler: ['くる'] },

  // ---------- DOĞA ----------
  { ja: '山は高いです。', ro: 'yama wa takai desu.', tr: 'Dağ yüksektir.', kanjiler: ['山'], kelimeler: ['やま', 'たかい'] },
  { ja: '川の水はきれいです。', ro: 'kawa no mizu wa kirei desu.', tr: 'Nehrin suyu temiz.', kanjiler: ['川', '水'], kelimeler: ['かわ', 'みず', 'きれい'] },
  { ja: '空は青いです。', ro: 'sora wa aoi desu.', tr: 'Gökyüzü mavi.', kanjiler: ['空'], kelimeler: ['そら', 'あお'] },
  { ja: '今日は雨です。', ro: 'kyou wa ame desu.', tr: 'Bugün yağmurlu.', kanjiler: ['今', '日', '雨'], kelimeler: ['きょう', 'あめ'] },
  { ja: '花がきれいですね。', ro: 'hana ga kirei desu ne.', tr: 'Çiçekler güzel, değil mi?', kanjiler: ['花'], kelimeler: ['はな', 'きれい'] },
  { ja: '海は広いです。', ro: 'umi wa hiroi desu.', tr: 'Deniz geniş.', kanjiler: ['海'], kelimeler: ['うみ', 'ひろい'] },
  { ja: '犬と山を歩きます。', ro: 'inu to yama wo arukimasu.', tr: 'Köpekle dağda yürüyorum.', kanjiler: ['犬', '山'], kelimeler: ['いぬ', 'やま', 'あるく'] },
  { ja: 'これは石です。', ro: 'kore wa ishi desu.', tr: 'Bu bir taş.', kanjiler: ['石'], kelimeler: ['これ', 'いし'] },
  { ja: '天気がいいです。', ro: 'tenki ga ii desu.', tr: 'Hava güzel.', kanjiler: ['天'], kelimeler: ['てんき'] },

  // ---------- YÖN VE YER ----------
  { ja: '机の上に本があります。', ro: 'tsukue no ue ni hon ga arimasu.', tr: 'Masanın üstünde kitap var.', kanjiler: ['上', '本'], kelimeler: ['つくえ', 'ほん', 'ある'] },
  { ja: 'いすの下に猫がいます。', ro: 'isu no shita ni neko ga imasu.', tr: 'Sandalyenin altında kedi var.', kanjiler: ['下'], kelimeler: ['いす', 'ねこ', 'いる'] },
  { ja: '家の中は静かです。', ro: 'ie no naka wa shizuka desu.', tr: 'Evin içi sessiz.', kanjiler: ['中'], kelimeler: ['いえ'] },
  { ja: '学校の前に花があります。', ro: 'gakkou no mae ni hana ga arimasu.', tr: 'Okulun önünde çiçek var.', kanjiler: ['学', '校', '前', '花'], kelimeler: ['がっこう', 'はな', 'ある'] },
  { ja: '右手を見てください。', ro: 'migite wo mite kudasai.', tr: 'Sağ elinize bakın.', kanjiler: ['右', '手'], kelimeler: ['みる', 'ください'] },
  { ja: '左に山が見えます。', ro: 'hidari ni yama ga miemasu.', tr: 'Solda dağ görünüyor.', kanjiler: ['左', '山', '見'], kelimeler: ['やま', 'みる'] },
  { ja: '東の空が明るいです。', ro: 'higashi no sora ga akarui desu.', tr: 'Doğuda gökyüzü aydınlık.', kanjiler: ['東', '空'], kelimeler: ['そら', 'あかるい'] },
  { ja: '西の海は静かです。', ro: 'nishi no umi wa shizuka desu.', tr: 'Batıdaki deniz sakin.', kanjiler: ['西', '海'], kelimeler: ['うみ'] },

  // ---------- OKUL VE ÖĞRENME ----------
  { ja: '学校で日本語を勉強します。', ro: 'gakkou de nihongo wo benkyou shimasu.', tr: 'Okulda Japonca çalışıyorum.', kanjiler: ['学', '校', '日', '本', '語'], kelimeler: ['がっこう', 'にほんご', 'べんきょう'] },
  { ja: 'この本は面白いです。', ro: 'kono hon wa omoshiroi desu.', tr: 'Bu kitap ilginç.', kanjiler: ['本'], kelimeler: ['この', 'ほん', 'おもしろい'] },
  { ja: '学生は本を読みます。', ro: 'gakusei wa hon wo yomimasu.', tr: 'Öğrenci kitap okuyor.', kanjiler: ['学', '生', '本'], kelimeler: ['がくせい', 'ほん', 'よむ'] },
  { ja: '外国の言葉は難しいです。', ro: 'gaikoku no kotoba wa muzukashii desu.', tr: 'Yabancı dil zor.', kanjiler: ['外', '国', '言'], kelimeler: ['ことば', 'むずかしい'] },
  { ja: '先生に聞きます。', ro: 'sensei ni kikimasu.', tr: 'Öğretmene soruyorum.', kanjiler: ['先', '生', '聞'], kelimeler: ['せんせい', 'きく'] },

  // ---------- YEMEK VE VÜCUT ----------
  { ja: '水を飲みます。', ro: 'mizu wo nomimasu.', tr: 'Su içiyorum.', kanjiler: ['水', '飲'], kelimeler: ['みず', 'のむ'] },
  { ja: 'ごはんを食べます。', ro: 'gohan wo tabemasu.', tr: 'Yemek yiyorum.', kanjiler: ['食'], kelimeler: ['ごはん', 'たべる'] },
  { ja: '目と口が痛いです。', ro: 'me to kuchi ga itai desu.', tr: 'Gözüm ve ağzım acıyor.', kanjiler: ['目', '口'], kelimeler: ['め', 'くち', 'いたい'] },

  // ---------- BÜYÜKLÜK VE MİKTAR ----------
  { ja: '大きい山ですね。', ro: 'ookii yama desu ne.', tr: 'Büyük bir dağ, değil mi?', kanjiler: ['大', '山'], kelimeler: ['おきい', 'やま'] },
  { ja: '小さい犬がいます。', ro: 'chiisai inu ga imasu.', tr: 'Küçük bir köpek var.', kanjiler: ['小', '犬'], kelimeler: ['ちいさい', 'いぬ', 'いる'] },
  { ja: '本が多くあります。', ro: 'hon ga ooku arimasu.', tr: 'Çok kitap var.', kanjiler: ['多', '本'], kelimeler: ['ほん', 'ある'] },
  { ja: '少しだけ食べました。', ro: 'sukoshi dake tabemashita.', tr: 'Sadece biraz yedim.', kanjiler: ['少', '食'], kelimeler: ['すこし', 'たべる'] },
  { ja: '百円の本を買います。', ro: 'hyakuen no hon wo kaimasu.', tr: 'Yüz yenlik kitap alıyorum.', kanjiler: ['百', '本'], kelimeler: ['ほん', 'かう'] },

  // ---------- EYLEMLER ----------
  { ja: '日本へ行きたいです。', ro: 'nihon e ikitai desu.', tr: 'Japonya\'ya gitmek istiyorum.', kanjiler: ['日', '本', '行'], kelimeler: ['にほん', 'いく'] },
  { ja: '明日来てください。', ro: 'ashita kite kudasai.', tr: 'Yarın gelin lütfen.', kanjiler: ['明', '日', '来'], kelimeler: ['あした', 'くる', 'ください'] },
  { ja: 'テレビを見ます。', ro: 'terebi wo mimasu.', tr: 'Televizyon izliyorum.', kanjiler: ['見'], kelimeler: ['てれび', 'みる'] }
];

// Açılışta tutarlılık kontrolü (geliştirme kolaylığı; oyunu etkilemez).
(function () {
  if (typeof console === 'undefined') return;
  const hatalar = [];
  const gorulen = new Set();
  KANJI_CUMLELER.forEach(c => {
    if (!c.ja || !c.ro || !c.tr) hatalar.push('Eksik alanlı cümle: ' + JSON.stringify(c));
    if (!c.kanjiler || !c.kanjiler.length) hatalar.push('Kanji içermeyen cümle: ' + c.ja);
    // cümlede geçtiği iddia edilen her kanji gerçekten cümlede mi?
    (c.kanjiler || []).forEach(k => {
      if (c.ja.indexOf(k) === -1) hatalar.push('"' + k + '" cümlede yok ama listelenmiş: ' + c.ja);
    });
    if (gorulen.has(c.ja)) hatalar.push('Tekrarlanan cümle: ' + c.ja);
    gorulen.add(c.ja);
  });
  if (hatalar.length) {
    console.warn('[kanji-cumle.js] ' + hatalar.length + ' veri uyarısı:');
    hatalar.forEach(h => console.warn('  • ' + h));
  } else {
    console.info('[kanji-cumle.js] ' + KANJI_CUMLELER.length + ' kanjili cümle tutarlı.');
  }
})();

// app.js / kanji.js bu listeyi kullanır.
window.KANJI_CUMLELER = KANJI_CUMLELER;
