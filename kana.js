// ============================================================
// KANA: harf verisi + ders/test/tekrar üretici. Motor (oyun.html) bunu kullanır.
// Bu dosya sw.js tarafından da yüklenir: en üst seviyede document/window KULLANMA.
//
// Harf kimliği (id): 'h:ka' (Hiragana か)  ve  'k:ka' (Katakana カ)
// Resimler: alfabe/hiragana/<romaji>.webp  ve  alfabe/katakana/<romaji>.webp
// ============================================================

const KANA_RESIM_KLASORU = { h: 'alfabe/hiragana/', k: 'alfabe/katakana/' };
const KANA_RESIM_ADI = { /* dosya adın farklıysa: 'shi': 'si', 'tsu': 'tu' */ };
const KANA_ISIM = { h: 'Hiragana', k: 'Katakana' };

// [romaji, hiragana, katakana]
const KANA_TABLO = [
  ['a','あ','ア'],['i','い','イ'],['u','う','ウ'],['e','え','エ'],['o','お','オ'],
  ['ka','か','カ'],['ki','き','キ'],['ku','く','ク'],['ke','け','ケ'],['ko','こ','コ'],
  ['sa','さ','サ'],['shi','し','シ'],['su','す','ス'],['se','せ','セ'],['so','そ','ソ'],
  ['ta','た','タ'],['chi','ち','チ'],['tsu','つ','ツ'],['te','て','テ'],['to','と','ト'],
  ['na','な','ナ'],['ni','に','ニ'],['nu','ぬ','ヌ'],['ne','ね','ネ'],['no','の','ノ'],
  ['ha','は','ハ'],['hi','ひ','ヒ'],['fu','ふ','フ'],['he','へ','ヘ'],['ho','ほ','ホ'],
  ['ma','ま','マ'],['mi','み','ミ'],['mu','む','ム'],['me','め','メ'],['mo','も','モ'],
  ['ya','や','ヤ'],['yu','ゆ','ユ'],['yo','よ','ヨ'],
  ['ra','ら','ラ'],['ri','り','リ'],['ru','る','ル'],['re','れ','レ'],['ro','ろ','ロ'],
  ['wa','わ','ワ'],['wo','を','ヲ'],['n','ん','ン']
];

// ---------- TÜREV HARFLER (dakuten / handakuten / youon) ----------
// Bunlar temel 46 harften SONRA öğrenilir. Romaji anahtarları tekil ve çakışmasız
// seçildi (ör. 'ji' yerine 'ji' tek; 'zu' tek; küçük や/ゆ/よ ile birleşikler 'kya'...).
// [romaji, hiragana, katakana, grupTuru]
//   grupTuru: 'dakuten' (゛), 'handakuten' (゜), 'youon' (küçük や/ゆ/よ)
const KANA_TUREV = [
  // --- Dakuten (゛): K/S/T/H satırları ---
  ['ga','が','ガ','dakuten'], ['gi','ぎ','ギ','dakuten'], ['gu','ぐ','グ','dakuten'], ['ge','げ','ゲ','dakuten'], ['go','ご','ゴ','dakuten'],
  ['za','ざ','ザ','dakuten'], ['ji','じ','ジ','dakuten'], ['zu','ず','ズ','dakuten'], ['ze','ぜ','ゼ','dakuten'], ['zo','ぞ','ゾ','dakuten'],
  ['da','だ','ダ','dakuten'], ['ji2','ぢ','ヂ','dakuten'], ['zu2','づ','ヅ','dakuten'], ['de','で','デ','dakuten'], ['do','ど','ド','dakuten'],
  ['ba','ば','バ','dakuten'], ['bi','び','ビ','dakuten'], ['bu','ぶ','ブ','dakuten'], ['be','べ','ベ','dakuten'], ['bo','ぼ','ボ','dakuten'],

  // --- Handakuten (゜): sadece H satırı ---
  ['pa','ぱ','パ','handakuten'], ['pi','ぴ','ピ','handakuten'], ['pu','ぷ','プ','handakuten'], ['pe','ぺ','ペ','handakuten'], ['po','ぽ','ポ','handakuten'],

  // --- Youon (küçük ゃゅょ): 11 birleşik ses ---
  ['kya','きゃ','キャ','youon'], ['kyu','きゅ','キュ','youon'], ['kyo','きょ','キョ','youon'],
  ['sha','しゃ','シャ','youon'], ['shu','しゅ','シュ','youon'], ['sho','しょ','ショ','youon'],
  ['cha','ちゃ','チャ','youon'], ['chu','ちゅ','チュ','youon'], ['cho','ちょ','チョ','youon'],
  ['nya','にゃ','ニャ','youon'], ['nyu','にゅ','ニュ','youon'], ['nyo','にょ','ニョ','youon'],
  ['hya','ひゃ','ヒャ','youon'], ['hyu','ひゅ','ヒュ','youon'], ['hyo','ひょ','ヒョ','youon'],
  ['mya','みゃ','ミャ','youon'], ['myu','みゅ','ミュ','youon'], ['myo','みょ','ミョ','youon'],
  ['rya','りゃ','リャ','youon'], ['ryu','りゅ','リュ','youon'], ['ryo','りょ','リョ','youon'],
  ['gya','ぎゃ','ギャ','youon'], ['gyu','ぎゅ','ギュ','youon'], ['gyo','ぎょ','ギョ','youon'],
  ['ja','じゃ','ジャ','youon'], ['ju','じゅ','ジュ','youon'], ['jo','じょ','ジョ','youon'],
  ['bya','びゃ','ビャ','youon'], ['byu','びゅ','ビュ','youon'], ['byo','びょ','ビョ','youon'],
  ['pya','ぴゃ','ピャ','youon'], ['pyu','ぴゅ','ピュ','youon'], ['pyo','ぴょ','ピョ','youon']
];

const KANA = {};                 // 'h:ka' -> { id, r:'ka', j:'か', a:'h', turev:bool, grup:'dakuten' }
const HIRAGANA = [], KATAKANA = [];
KANA_TABLO.forEach(([r, h, k]) => {
  [['h', h], ['k', k]].forEach(([a, j]) => {
    const e = { id: a + ':' + r, r: r, j: j, a: a };
    KANA[e.id] = e;
    (a === 'h' ? HIRAGANA : KATAKANA).push(e);
  });
});
KANA_TUREV.forEach(([r, h, k, grup]) => {
  [['h', h], ['k', k]].forEach(([a, j]) => {
    const e = { id: a + ':' + r, r: r, j: j, a: a, turev: true, grup: grup };
    KANA[e.id] = e;
    (a === 'h' ? HIRAGANA : KATAKANA).push(e);
  });
});
// Türev grupları: müfredattaki 'grup' alanı buradan okunur.
// Her grup, aynı ses ailesinin harflerini sırayla öğretir (Duolingo'nun
// "aynı kuralı birlikte ver" yaklaşımı: が行, ざ行, きゃ...).
// Anahtar formatı: 'harf:ilkRomaji' -> romaji listesi. 'dakuten' / 'handakuten' /
// 'youon' anahtarları da grubun tamamını verir (eski/kısayol kullanım için).
const KANA_GRUPLAR = (function () {
  const gruplar = {};
  const ekle = (anahtar, list) => { gruplar[anahtar] = list; };
  const satir = (onEk, ilk, romajiler, tur) => {
    ekle(onEk + ':' + ilk, romajiler);
    ekle(onEk + ':' + romajiler[0], romajiler);
    ekle(onEk + ':' + romajiler[romajiler.length - 1], romajiler);
    void tur;
  };

  // Dakuten satırları
  ekle('d:ga', ['ga','gi','gu','ge','go']); ekle('g:ga', ['ga','gi','gu','ge','go']);
  ekle('d:za', ['za','ji','zu','ze','zo']); ekle('z:za', ['za','ji','zu','ze','zo']);
  ekle('d:da', ['da','ji2','zu2','de','do']); ekle('da', ['da','ji2','zu2','de','do']);
  ekle('d:ba', ['ba','bi','bu','be','bo']); ekle('b:ba', ['ba','bi','bu','be','bo']);
  // Handakuten satırı
  ekle('p:pa', ['pa','pi','pu','pe','po']); ekle('handakuten', ['pa','pi','pu','pe','po']);

  // Youon grupları
  ekle('y:kya', ['kya','kyu','kyo']);
  ekle('y:sha', ['sha','shu','sho']);
  ekle('y:cha', ['cha','chu','cho']);
  ekle('y:nya', ['nya','nyu','nyo']);
  ekle('y:hya', ['hya','hyu','hyo','mya','myu','myo']);
  ekle('y:mya', ['mya','myu','myo']);
  ekle('y:rya', ['rya','ryu','ryo']);

  // Tum gruplar
  ekle('dakuten', KANA_TUREV.filter(x => x[3] === 'dakuten').map(x => x[0]));
  ekle('youon', KANA_TUREV.filter(x => x[3] === 'youon').map(x => x[0]));
  void satir;
  return gruplar;
})();

// Her harf için öğretim içeriği: anımsatıcı (mnemonic) + örnek kelime.
//   m  : kısa anımsatıcı cümle (İLK öğretimde "nasıl hatırlarım")
//   kj : örnek kelime (Japonca kana), kr : romaji, kt : Türkçe anlam
// Romaji anahtarı hiragana ve katakana için ORTAK (aynı ses).
const KANA_ANIMSATICI = {
  a:   { m: 'Ağız kocaman açık: "AAA!" diye bağırıyor.',          kj: 'あめ', kr: 'ame', kt: 'şeker / yağmur' },
  i:   { m: 'İki çubuk yan yana: "i" harfinin iki noktası gibi.', kj: 'いぬ', kr: 'inu', kt: 'köpek' },
  u:   { m: 'Küçük bir "u" şekli, ağzından "uu" çıkıyor.',        kj: 'うみ', kr: 'umi', kt: 'deniz' },
  e:   { m: 'Bir "e" kancası gibi kıvrılıyor: "eee".',            kj: 'えき', kr: 'eki', kt: 'istasyon' },
  o:   { m: 'Yuvarlak bir "o" gibi: ağız yuvarlak "OO".',        kj: 'おと', kr: 'oto', kt: 'ses' },
  ka:  { m: 'Üstü çatı, altta kıvrım: "ka"tı katı bir harf.',     kj: 'かさ', kr: 'kasa', kt: 'şemsiye' },
  ki:  { m: 'İki çizgi yukarıdan, bir kanca: "ki"t. anahtarı.',   kj: 'きく', kr: 'kiku', kt: 'dinlemek' },
  ku:  { m: 'Sivri bir "ku"rşun ucu gibi.',                       kj: 'くも', kr: 'kumo', kt: 'bulut' },
  ke:  { m: 'Bir çatal gibi, üstteki çizgi "ke"ndinden.',         kj: 'けさ', kr: 'kesa', kt: 'bu sabah' },
  ko:  { m: 'İki yatay çizgi, "ko"rku korkuluk gibi.',            kj: 'ここ', kr: 'koko', kt: 'burası' },
  sa:  { m: 'Bir çapraz + kanca: "sa"lıncak ipi.',               kj: 'さかな', kr: 'sakana', kt: 'balık' },
  shi: { m: 'Tek bir yumuşak kıvrım, "shi" diye akıyor.',        kj: 'しお', kr: 'shio', kt: 'tuz' },
  su:  { m: 'Bir kanca ve döngü: "su" damlası.',                 kj: 'すし', kr: 'sushi', kt: 'suşi' },
  se:  { m: 'Kalın gövdeli, iki çizgi: "se"rmaye.',              kj: 'せかい', kr: 'sekai', kt: 'dünya' },
  so:  { m: 'Zikzak bir şekil, aşağı doğru iniyor: "so"luk.',    kj: 'そら', kr: 'sora', kt: 'gökyüzü' },
  ta:  { m: 'Çapraz çizgi + kanca: "ta"s gibi dökülür.',         kj: 'たまご', kr: 'tamago', kt: 'yumurta' },
  chi: { m: 'Küçük bir "chi"çek gibi eğri.',                     kj: 'ちず', kr: 'chizu', kt: 'harita' },
  tsu: { m: 'Akıntı gibi dalgalı: "tsu"nami dalgası.',           kj: 'つき', kr: 'tsuki', kt: 'ay' },
  te:  { m: 'Bir el gibi, "te" (Japonca: el = て).',             kj: 'て', kr: 'te', kt: 'el' },
  to:  { m: 'Kancalı bir "to"rba ağzı.',                         kj: 'とり', kr: 'tori', kt: 'kuş' },
  na:  { m: 'Çizgi + kanca: "na"sıl bir düğüm.',                 kj: 'なつ', kr: 'natsu', kt: 'yaz' },
  ni:  { m: 'İki kısa çizgi: "ni"ki (ikisi) nokta.',             kj: 'にほん', kr: 'nihon', kt: 'Japonya' },
  nu:  { m: 'Döngü + kanca: "nu"maradan sızan.',                 kj: 'ぬの', kr: 'nuno', kt: 'kumaş' },
  ne:  { m: 'Bir "ne"fes gibi kıvrılıyor.',                      kj: 'ねこ', kr: 'neko', kt: 'kedi' },
  no:  { m: 'Tek yaygın döngü: "no"ta gibi.',                    kj: 'の', kr: 'no', kt: 'aitlik eki (-in/-nin)' },
  ha:  { m: 'Çapraz çizgi: "ha"rmoni bir denge.',                kj: 'はな', kr: 'hana', kt: 'çiçek' },
  hi:  { m: 'Uzun kanca: "hi"ç düştü.',                          kj: 'ひと', kr: 'hito', kt: 'insan' },
  fu:  { m: 'Biraz "fu"syalar gibi eğri bir çizgi.',             kj: 'ふゆ', kr: 'fuyu', kt: 'kış' },
  he:  { m: 'Bir çatı gibi, "he"r yerde aynı.',                  kj: 'へや', kr: 'heya', kt: 'oda' },
  ho:  { m: 'İki çizgi: "ho"p atlayan bir form.',                kj: 'ほん', kr: 'hon', kt: 'kitap' },
  ma:  { m: 'Çapraz iki çizgi: "ma"nga paneli.',                 kj: 'やま', kr: 'yama', kt: 'dağ' },
  mi:  { m: 'Üç kısa çizgi: "mi"si gibi.',                       kj: 'みず', kr: 'mizu', kt: 'su' },
  mu:  { m: 'Bir döngü + kanca: "mu"zik notası.',                kj: 'むし', kr: 'mushi', kt: 'böcek' },
  me:  { m: 'Bir "me"meye benzeyen döngü.',                      kj: 'め', kr: 'me', kt: 'göz' },
  mo:  { m: 'Bir kanca: "mo"tif gibi açılıyor.',                 kj: 'もり', kr: 'mori', kt: 'orman' },
  ya:  { m: 'Bir "ya"y gibi gerilmiş.',                          kj: 'やま', kr: 'yama', kt: 'dağ' },
  yu:  { m: 'Bir "yu"murta döngüsü.',                            kj: 'ゆき', kr: 'yuki', kt: 'kar' },
  yo:  { m: 'Bir "yo"l gibi uzanıyor.',                          kj: 'よる', kr: 'yoru', kt: 'gece' },
  ra:  { m: 'Çapraz + kanca: "ra"kı gibi kıvrık.',               kj: 'らくだ', kr: 'rakuda', kt: 'deve' },
  ri:  { m: 'İki dikey çizgi: "ri"jinal.',                       kj: 'りんご', kr: 'ringo', kt: 'elma' },
  ru:  { m: 'Bir döngü + kanca: "ru"let gibi dönüyor.',          kj: 'るす', kr: 'rusu', kt: 'evde yokluk' },
  re:  { m: 'Bir kanca: "re"sim fırçası darbesi.',               kj: 'れきし', kr: 'rekishi', kt: 'tarih' },
  ro:  { m: 'Bir kare döngü: "ro"bot gövdesi.',                  kj: 'ろく', kr: 'roku', kt: 'altı' },
  wa:  { m: 'Bir döngü + kanca: "wa"ku waku heyecan.',           kj: 'わたし', kr: 'watashi', kt: 'ben' },
  wo:  { m: 'Bir "wo"rkout çubuğu gibi, sadece nesne eki.',      kj: 'を', kr: 'wo', kt: 'nesne eki' },
  n:   { m: 'Tek başına duran "n": hecesiz, tek ses.',           kj: 'ほん', kr: 'hon', kt: 'kitap' }
};

// Türev harflerin ipuçları (dakuten/handakuten/youon kuralı)
// Türev harfin temel harfi: [romaji, hiragana, katakana]
const KANA_TUREV_TEMEL = {
  ga:['ka','か','カ'], gi:['ki','き','キ'], gu:['ku','く','ク'], ge:['ke','け','ケ'], go:['ko','こ','コ'],
  za:['sa','さ','サ'], ji:['shi','し','シ'], zu:['su','す','ス'], ze:['se','せ','セ'], zo:['so','そ','ソ'],
  da:['ta','た','タ'], ji2:['chi','ち','チ'], zu2:['tsu','つ','ツ'], de:['te','て','テ'], do:['to','と','ト'],
  ba:['ha','は','ハ'], bi:['hi','ひ','ヒ'], bu:['fu','ふ','フ'], be:['he','へ','ヘ'], bo:['ho','ほ','ホ'],
  pa:['ha','は','ハ'], pi:['hi','ひ','ヒ'], pu:['fu','ふ','フ'], pe:['he','へ','ヘ'], po:['ho','ほ','ホ'],
  kya:['ki','き','キ'], kyu:['ki','き','キ'], kyo:['ki','き','キ'],
  sha:['shi','し','シ'], shu:['shi','し','シ'], sho:['shi','し','シ'],
  cha:['chi','ち','チ'], chu:['chi','ち','チ'], cho:['chi','ち','チ'],
  nya:['ni','に','ニ'], nyu:['ni','に','ニ'], nyo:['ni','に','ニ'],
  hya:['hi','ひ','ヒ'], hyu:['hi','ひ','ヒ'], hyo:['hi','ひ','ヒ'],
  mya:['mi','み','ミ'], myu:['mi','み','ミ'], myo:['mi','み','ミ'],
  rya:['ri','り','リ'], ryu:['ri','り','リ'], ryo:['ri','り','リ'],
  gya:['gi','ぎ','ギ'], gyu:['gi','ぎ','ギ'], gyo:['gi','ぎ','ギ'],
  ja:['ji','じ','ジ'],  ju:['ji','じ','ジ'],  jo:['ji','じ','ジ'],
  bya:['bi','び','ビ'], byu:['bi','び','ビ'], byo:['bi','び','ビ'],
  pya:['pi','ぴ','ピ'], pyu:['pi','ぴ','ピ'], pyo:['pi','ぴ','ピ']
};

const KANA_TUREV_IPUCU = {
  dakuten: '゛ (dakuten) işareti sesi yumuşatır: k→g, s→z, t→d, h→b.',
  handakuten: '゜ (handakuten) sadece h satırında kullanılır: h→p.',
  youon: 'Küçük や/ゆ/よ ile birleşince tek hece olur: ki+ya = kya.'
};

// Türev harflerin romaji karşılıkları (anlamlandırma ve örnek kelimeler)
const KANA_TUREV_ANIM = {
  ga:  { m: 'か (ka) + ゛ = が. Ses yumuşadı: \'ga\'.',      kj: 'がくせい', kr: 'gakusei', kt: 'öğrenci' },
  gi:  { m: 'き (ki) + ゛ = ぎ.',                            kj: 'ぎん', kr: 'gin', kt: 'gümüş' },
  gu:  { m: 'く (ku) + ゛ = ぐ.',                            kj: 'ぐん', kr: 'gun', kt: 'ordu' },
  ge:  { m: 'け (ke) + ゛ = げ.',                            kj: 'げんき', kr: 'genki', kt: 'sağlıklı / enerjik' },
  go:  { m: 'こ (ko) + ゛ = ご.',                            kj: 'ごはん', kr: 'gohan', kt: 'yemek' },
  za:  { m: 'さ (sa) + ゛ = ざ.',                            kj: 'ざっし', kr: 'zasshi', kt: 'dergi' },
  ji:  { m: 'し (shi) + ゛ = じ. Dikkat: \'zi\' değil \'ji\' okunur.', kj: 'じかん', kr: 'jikan', kt: 'zaman' },
  zu:  { m: 'す (su) + ゛ = ず. \'zu\' okunur.',             kj: 'みず', kr: 'mizu', kt: 'su' },
  ze:  { m: 'せ (se) + ゛ = ぜ.',                            kj: 'ぜんぶ', kr: 'zenbu', kt: 'hepsi' },
  zo:  { m: 'そ (so) + ゛ = ぞ.',                            kj: 'ぞう', kr: 'zou', kt: 'fil' },
  da:  { m: 'た (ta) + ゛ = だ.',                            kj: 'だいがく', kr: 'daigaku', kt: 'üniversite' },
  ji2: { m: 'ち (chi) + ゛ = ぢ. Nadir kullanılır, \'ji\' okunur.', kj: 'はなぢ', kr: 'hanaji', kt: 'burun kanaması' },
  zu2: { m: 'つ (tsu) + ゛ = づ. Nadir, \'zu\' okunur.',     kj: 'みかづき', kr: 'mikazuki', kt: 'hilal' },
  de:  { m: 'て (te) + ゛ = で.',                            kj: 'でんわ', kr: 'denwa', kt: 'telefon' },
  do:  { m: 'と (to) + ゛ = ど.',                            kj: 'どこ', kr: 'doko', kt: 'neresi' },
  ba:  { m: 'は (ha) + ゛ = ば.',                            kj: 'ばんごう', kr: 'bangou', kt: 'numara' },
  bi:  { m: 'ひ (hi) + ゛ = び.',                            kj: 'びょういん', kr: 'byouin', kt: 'hastane' },
  bu:  { m: 'ふ (fu) + ゛ = ぶ.',                            kj: 'ぶた', kr: 'buta', kt: 'domuz' },
  be:  { m: 'へ (he) + ゛ = べ.',                            kj: 'べんきょう', kr: 'benkyou', kt: 'ders çalışma' },
  bo:  { m: 'ほ (ho) + ゛ = ぼ.',                            kj: 'ぼうし', kr: 'boushi', kt: 'şapka' },
  pa:  { m: 'は (ha) + ゜ = ぱ. Yuvarlak işaret sesi keskinleştir.', kj: 'パン', kr: 'pan', kt: 'ekmek' },
  pi:  { m: 'ひ (hi) + ゜ = ぴ.',                            kj: 'ピザ', kr: 'piza', kt: 'pizza' },
  pu:  { m: 'ふ (fu) + ゜ = ぷ.',                            kj: 'プール', kr: 'puuru', kt: 'havuz' },
  pe:  { m: 'へ (he) + ゜ = ぺ.',                            kj: 'ペン', kr: 'pen', kt: 'kalem' },
  po:  { m: 'ほ (ho) + ゜ = ぽ.',                            kj: 'ポスト', kr: 'posuto', kt: 'posta kutusu' },
  kya: { m: 'き (ki) + küçük ゃ = きゃ, tek hece \'kya\'.',  kj: 'きょう', kr: 'kyou', kt: 'bugün' },
  kyu: { m: 'き + küçük ゅ = きゅ.',                          kj: 'きゅう', kr: 'kyuu', kt: 'dokuz' },
  kyo: { m: 'き + küçük ょ = きょ.',                          kj: 'きょうしつ', kr: 'kyoushitsu', kt: 'sınıf' },
  sha: { m: 'し + küçük ゃ = しゃ.',                          kj: 'しゃしん', kr: 'shashin', kt: 'fotoğraf' },
  shu: { m: 'し + küçük ゅ = しゅ.',                          kj: 'しゅくだい', kr: 'shukudai', kt: 'ödev' },
  sho: { m: 'し + küçük ょ = しょ.',                          kj: 'しょうがっこう', kr: 'shougakkou', kt: 'ilkokul' },
  cha: { m: 'ち + küçük ゃ = ちゃ.',                          kj: 'おちゃ', kr: 'ocha', kt: 'çay' },
  chu: { m: 'ち + küçük ゅ = ちゅ.',                          kj: 'ちゅうごく', kr: 'chuugoku', kt: 'Çin' },
  cho: { m: 'ち + küçük ょ = ちょ.',                          kj: 'ちょっと', kr: 'chotto', kt: 'biraz' },
  nya: { m: 'に + küçük ゃ = にゃ.',                          kj: 'にゃんこ', kr: 'nyanko', kt: 'kedi (sevimli)' },
  nyu: { m: 'に + küçük ゅ = にゅ.',                          kj: 'にゅうがく', kr: 'nyuugaku', kt: 'okula giriş' },
  nyo: { m: 'に + küçük ょ = にょ.',                          kj: 'にょろにょろ', kr: 'nyoronyoro', kt: 'kıvrıla kıvrıla' },
  hya: { m: 'ひ + küçük ゃ = ひゃ.',                          kj: 'ひゃく', kr: 'hyaku', kt: 'yüz' },
  hyu: { m: 'ひ + küçük ゅ = ひゅ.',                          kj: 'ひゅうひゅう', kr: 'hyuuhyuu', kt: 'rüzgar sesi' },
  hyo: { m: 'ひ + küçük ょ = ひょ.',                          kj: 'ひょう', kr: 'hyou', kt: 'tablo' },
  mya: { m: 'み + küçük ゃ = みゃ.',                          kj: 'みゃく', kr: 'myaku', kt: 'nabız' },
  myu: { m: 'み + küçük ゅ = みゅ.',                          kj: 'ミュージック', kr: 'myuujikku', kt: 'müzik' },
  myo: { m: 'み + küçük ょ = みょ.',                          kj: 'みょうじ', kr: 'myouji', kt: 'soyadı' },
  rya: { m: 'り + küçük ゃ = りゃ.',                          kj: 'りゃく', kr: 'ryaku', kt: 'kısaltma' },
  ryu: { m: 'り + küçük ゅ = りゅ.',                          kj: 'りゅう', kr: 'ryuu', kt: 'ejderha' },
  ryo: { m: 'り + küçük ょ = りょ.',                          kj: 'りょうり', kr: 'ryouri', kt: 'yemek pişirme' },
  gya: { m: 'ぎ + küçük ゃ = ぎゃ.',                          kj: 'ぎゃく', kr: 'gyaku', kt: 'ters' },
  gyu: { m: 'ぎ + küçük ゅ = ぎゅ.',                          kj: 'ぎゅうにく', kr: 'gyuuniku', kt: 'sığır eti' },
  gyo: { m: 'ぎ + küçük ょ = ぎょ.',                          kj: 'ぎょうざ', kr: 'gyouza', kt: 'gyoza (mantı)' },
  ja:  { m: 'じ + küçük ゃ = じゃ.',                          kj: 'じゃあ', kr: 'jaa', kt: 'öyleyse' },
  ju:  { m: 'じ + küçük ゅ = じゅ.',                          kj: 'じゅう', kr: 'juu', kt: 'on' },
  jo:  { m: 'じ + küçük ょ = じょ.',                          kj: 'じょうず', kr: 'jouzu', kt: 'becerikli' },
  bya: { m: 'び + küçük ゃ = びゃ.',                          kj: 'さんびゃく', kr: 'sanbyaku', kt: 'üç yüz' },
  byu: { m: 'び + küçük ゅ = びゅ.',                          kj: 'びゅうびゅう', kr: 'byuubyuu', kt: 'rüzgar uğultusu' },
  byo: { m: 'び + küçük ょ = びょ.',                          kj: 'びょうき', kr: 'byouki', kt: 'hastalık' },
  pya: { m: 'ぴ + küçük ゃ = ぴゃ.',                          kj: 'さんぴゃく', kr: 'sanpyaku', kt: 'üç yüz (p)' },
  pyu: { m: 'ぴ + küçük ゅ = ぴゅ.',                          kj: 'ぴゅう', kr: 'pyuu', kt: 'ıslık sesi' },
  pyo: { m: 'ぴ + küçük ょ = ぴょ.',                          kj: 'ぴょんぴょん', kr: 'pyonpyon', kt: 'zıp zıp' }
};

// Birbirine benzeyen harfler: yanlış şıklarda öncelikle bunlar çıkar (sınav daha keskin olur)
const KANA_BENZER = {
  h: { nu:['me','ne'], me:['nu','ne'], ne:['re','wa','nu'], re:['ne','wa'], wa:['re','ne'], ha:['ho'], ho:['ha'],
       ru:['ro'], ro:['ru','ra'], ra:['ro'], sa:['chi','ki'], chi:['sa','ra'], ki:['sa'], i:['ri'], ri:['i'],
       ko:['ni'], ni:['ko'], ma:['mo','yo'], mo:['ma'], yo:['ma'], a:['o'], o:['a'] },
  k: { shi:['tsu','n'], tsu:['shi','so'], so:['n','tsu'], n:['so','shi'], ku:['wa','ta'], wa:['ku','u','fu'], u:['wa'],
       nu:['su','me'], su:['nu'], ko:['yu'], yu:['ko'], ru:['re'], re:['ru'], no:['me'], me:['no','nu'],
       chi:['te'], te:['chi'], na:['me'], ma:['mu'], mu:['ma'], fu:['wa'], ta:['ku'] }
};

// Karıştırılan harf çiftleri için ders sırasında gösterilen ipuçları.
// Hem Hiragana hem Katakana zor çiftlerini kapsar: KANA_BENZER ile aynı çiftler.
const KANA_IPUCU = {
  // --- Katakana: en çok karıştırılan çiftler ---
  'k:shi': 'Karıştırma: シ (shi) iki noktası YAN YANA, uzun çizgi aşağıdan yukarı kalkar. ツ (tsu) ile karışır!',
  'k:tsu': 'Karıştırma: ツ (tsu) iki noktası YUKARIDAN AŞAĞI düşer. シ (shi) ile karışır!',
  'k:so':  'Karıştırma: ソ (so) uzun çizgisi yukarıdan aşağı iner. ン (n) ile karışır!',
  'k:n':   'Karıştırma: ン (n) daha yatık, çizgi aşağıdan yukarı çıkar. ソ (so) ile karışır!',
  'k:ku':  'Karıştırma: ク (ku) ile ワ (wa) çok benzer. ワ üstte düz bir çatıya sahiptir.',
  'k:wa':  'Karıştırma: ワ (wa) ile ク (ku) ve ウ (u) benzer. ワ üstünde nokta yok.',
  'k:nu':  'Karıştırma: ヌ (nu) sağdan sola inen bir çapraz + kanca. ス (su) ve メ (me) ile karışır.',
  'k:su':  'Karıştırma: ス (su) yatık bir çizgi + dikey kanca. ヌ (nu) ile karışır.',
  'k:me':  'Karıştırma: メ (me) iki çapraz çizgi (X gibi). ヌ (nu) ile karışır.',
  'k:ru':  'Karıştırma: ル (ru) sağda bir döngü + kanca. レ (re) ile karışır.',
  'k:re':  'Karıştırma: レ (re) tek bir kanca, döngüsü yok. ル (ru) ile karışır.',
  'k:ra':  'Karıştırma: ラ (ra) üstte yatık çizgi + alt çerçeve. ロ (ro) ile karışır.',
  'k:ro':  'Karıştırma: ロ (ro) kare bir kutu. ラ (ra) veya 口 ile karışır.',
  'k:na':  'Karıştırma: ナ (na) yatay çizgi + sola kıvrık dikey. メ (me) ile karışır.',
  'k:ma':  'Karıştırma: マ (ma) üstte kısa çizgi, altta kıvrım. ム (mu) ile karışır.',
  'k:mu':  'Karıştırma: ム (mu) bir üçgen gibi, ucu sağa bakar. マ (ma) ile karışır.',

  'k:yu':  'Karıştırma: ユ (yu) iki yatay çizgi + dikey. ヨ (yo) ile karışır.',
  'k:yo':  'Karıştırma: ヨ (yo) ÜÇ yatay çizgi. ユ (yu) iki çizgidir.',
  'k:ko':  'Karıştırma: コ (ko) iki yatay çizgi + sol dikey. ユ (yu) ile karışır.',
  'k:u':   'Karıştırma: ウ (u) üstte küçük çizgi + gövde. ワ (wa) ile karışır.',
  'k:fu':  'Karıştırma: フ (fu) tek bir kanca. ワ (wa) ile karışır.',
  'k:chi': 'Karıştırma: チ (chi) üstte yatık çizgi + dikey. テ (te) ile karışır.',
  'k:te':  'Karıştırma: テ (te) üç çizgili, ortada uzun yatay. チ (chi) ile karışır.',
  'k:i':   'Karıştırma: イ (i) soldan sağa inen iki çizgi. リ (ri) ile karışır.',
  'k:ri':  'Karıştırma: リ (ri) iki DİKEY çizgi. イ (i) çaprazdır.',

  // --- Hiragana: en çok karıştırılan çiftler ---
  'h:nu':  'Karıştırma: ぬ (nu) sonunda bir DÖNGÜ ile biter. め (me) döngüsüzdür.',
  'h:me':  'Karıştırma: め (me) tek bir çapraz kıvrım, döngüsü yok. ぬ (nu) ile karışır.',
  'h:ne':  'Karıştırma: ね (ne) solda dikey + sağda döngü. れ (re) ve わ (wa) ile karışır.',
  'h:re':  'Karıştırma: れ (re) sağa doğru açılan kanca. ね (ne) döngülüdür.',
  'h:wa':  'Karıştırma: わ (wa) içi boş yuvarlak gövde. れ (re) ve ね (ne) ile karışır.',
  'h:ha':  'Karıştırma: は (ha) solda dikey + sağda iki kıvrım. ほ (ho) iki yataydır.',
  'h:ho':  'Karıştırma: ほ (ho) İKİ yatay çizgi. は (ha) tek çizgi.',
  'h:ru':  'Karıştırma: る (ru) sonunda DÖNGÜ var. ろ (ro) döngüsüzdür.',
  'h:ro':  'Karıştırma: ろ (ro) döngüsüz tek kıvrım. る (ru) ile karışır.',
  'h:ra':  'Karıştırma: ら (ra) üstte kısa nokta + kanca. ろ (ro) ile karışır.',
  'h:sa':  'Karıştırma: さ (sa) altta tek kanca. き (ki) iki çizgilidir.',
  'h:ki':  'Karıştırma: き (ki) İKİ yatay çizgi + kanca. さ (sa) tek kancadır.',
  'h:chi': 'Karıştırma: ち (chi) üstte çapraz + altta kanca. さ (sa) ile karışır.',
  'h:i':   'Karıştırma: い (i) iki DİKEY çubuk. り (ri) sağa kıvrılır.',
  'h:ri':  'Karıştırma: り (ri) sağdaki çizgi aşağı kıvrılır. い (i) düzdür.',
  'h:ko':  'Karıştırma: こ (ko) İKİ yatay çizgi. に (ni) dikeylidir.',
  'h:ni':  'Karıştırma: に (ni) solda dikey + sağda iki kısa yatay. こ (ko) ile karışır.',
  'h:ma':  'Karıştırma: ま (ma) üstte iki yatay + altta döngü. も (mo) ile karışır.',
  'h:mo':  'Karıştırma: も (mo) üstte kanca + iki yatay. ま (ma) ile karışır.',
  'h:yo':  'Karıştırma: よ (yo) içinde küçük bir döngü var. ま (ma) ile karışır.',
  'h:a':   'Karıştırma: あ (a) sağda bir çapraz + kanca, お (o) sağda döngülüdür.',
  'h:o':   'Karıştırma: お (o) sağ üstte küçük bir nokta taşır. あ (a) taşımaz.',
  'h:su':  'Karıştırma: す (su) sağda dikey + altta döngü. む (mu) ile karışır.',
  'h:mu':  'Karıştırma: む (mu) sağ üstte kanca + döngü. す (su) ile karışır.',
  'h:ta':  'Karıştırma: た (ta) sol üstte çapraz + iki yatay. な (na) ile karışır.',
  'h:na':  'Karıştırma: な (na) sol üstte çapraz + altta döngü. た (ta) ile karışır.',
  'h:fu':  'Karıştırma: ふ (fu) tek bir dikey + yanında iki nokta. う (u) ile karışır.',

  'h:so':  'Karıştırma: そ (so) üstte zikzak, altta tek kıvrım. ん (n) ile karışır.',
  'h:n':   'Karıştırma: ん (n) tek bir kıvrım, zikzak yok. そ (so) ile karışır.',
  'h:shi': 'Karıştırma: し (shi) tek bir düzgün kanca. つ (tsu) yatay açılır.',
  'h:tsu': 'Karıştırma: つ (tsu) yatay bir açıklık. し (shi) dikeydir.'
};

function kanaBul(id) { return KANA[id]; }
function kanaID(alfabe, romaji) { return alfabe + ':' + romaji; }
function kanaResim(id) {
  const e = KANA[id];
  return KANA_RESIM_KLASORU[e.a] + (KANA_RESIM_ADI[e.r] || e.r) + '.webp';
}
function kanaKaristir(dizi) {
  const a = dizi.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function kanaBenzerler(id) {
  const e = KANA[id];
  return (KANA_BENZER[e.a][e.r] || []).map(r => kanaID(e.a, r));
}

// item'dan önce öğretilen harfler (sırayla). Sadece item'ın alfabesindekiler.
function kanaOncekiler(item) {
  const alfabe = item.alfabe || 'h';
  const liste = [];
  const ekle = (a, r) => { const id = kanaID(a, r); if (KANA[id] && !liste.includes(id)) liste.push(id); };
  MUFREDAT.forEach(m => {
    if (m.id >= item.id) return;
    const a = m.alfabe || 'h';
    if (alfabe.indexOf(a) === -1) return;
    if (m.grup) { (KANA_GRUPLAR[m.grup] || []).forEach(r => ekle(a, r)); return; }   // türev harf dersi
    if (!m.harfler) return;
    m.harfler.forEach(r => ekle(a, r));
  });
  return liste;
}

function kanaZayifIdler() {
  return (typeof Ilerleme !== 'undefined') ? Ilerleme.zayif(8).map(x => x.id) : [];
}

// ---------- Şık üretimi ----------
// Şıklar sadece havuzdan (öğrenilmiş harflerden) gelir. Aynı sesi veren harf (あ/ア) yanlış şık olmaz.
function kanaSiklar(id, havuz, alan) {
  const dogru = KANA[id];
  const goster = e => alan === 'r' ? e.r : e.j;
  const adaylar = kanaKaristir(havuz.filter(x => x !== id && KANA[x].r !== dogru.r));
  const benzer = kanaBenzerler(id).find(x => adaylar.includes(x));
  const secilen = [];
  const gorulen = new Set([goster(dogru)]);
  const ekle = x => { const g = goster(KANA[x]); if (!gorulen.has(g)) { gorulen.add(g); secilen.push(x); } };
  if (benzer) ekle(benzer);
  adaylar.forEach(x => { if (secilen.length < 3) ekle(x); });
  if (secilen.length < 1) return null;
  return [id].concat(secilen).map(x => goster(KANA[x]));
}

function sorHarfSes(id, havuz) {          // harfi göster, sesini sor
  const s = kanaSiklar(id, havuz, 'r'); if (!s) return null;
  return { tip: 'soru', k: id, buyuk: KANA[id].j, soru: 'Bu harf hangi sesi veriyor?', dogru: KANA[id].r, siklar: s };
}
function sorSesHarf(id, havuz) {          // sesi yaz, harfi seçtir
  const s = kanaSiklar(id, havuz, 'j'); if (!s) return null;
  return { tip: 'soru', k: id, soru: 'Hangisi "' + KANA[id].r + '" sesidir?', dogru: KANA[id].j, siklar: s };
}
function sorDinle(id, havuz) {            // sesi dinlet, harfi seçtir
  const s = kanaSiklar(id, havuz, 'j'); if (!s) return null;
  return { tip: 'dinle', k: id, ses: KANA[id].j, dogru: KANA[id].j, siklar: s };
}

// ---------- YENİ SORU TİPLERİ (4. iyileştirme) ----------
// Aynı harfi farklı açılardan sorunca gerçekten öğreniliyor. Aşağıdaki üç tip,
// "hep aynı iki soruyu soruyor" hissini kırıyor.

// (A) KARIŞTIRILAN ÇİFT: zor harfleri yan yana gösterip ayırt etmeyi öğretir.
//     Kaynak: KANA_BENZER (zor harf çiftleri) ve KANA_IPUCU (ayırt etme ipucu).
function sorKaristirilanCift(id) {
  const e = KANA[id];
  const benzerler = kanaBenzerler(id).filter(x => KANA[x]);
  if (!benzerler.length) return null;
  const es = KANA[benzerler[0]];
  // Ayırt etme ipucu: önce bu harfin, yoksa eş harfin ipucu (ikisinde de yoksa ipucu yok)
  const ip = KANA_IPUCU[id] || KANA_IPUCU[es.a + ':' + es.r] || null;
  return {
    tip: 'soru', k: id, buyuk: e.j,
    soru: 'Bu hangisi? (karıştırılan çift)',
    dogru: e.r, siklar: [e.r, es.r], ip: ip
  };
}

// (B) KELİMEDEN HARF: öğrenilen harf gerçek bir kelimenin içinde gösterilir.
function sorKelimeHarfi(id, havuz) {
  const e = KANA[id];
  const a = KANA_ANIMSATICI[e.r];
  if (!a || !a.kj) return null;
  const diger = kanaKaristir(havuz.filter(x => x !== id && KANA[x].r !== e.r)).slice(0, 3).map(x => KANA[x].r);
  if (diger.length < 2) return null;
  return {
    tip: 'kelime', k: id,
    soru: '“' + a.kj + '” (' + a.kt + ') kelimesinde aşağıdaki seslerden hangisi var?',
    kelime: { ja: a.kj, ro: a.kr, tr: a.kt },
    dogru: e.r, siklar: [e.r].concat(diger)
  };
}

// (C) TERS OKUMA: harfi değil, harfin geçtiği kelimeyi sorar -> okuma becerisi.
function sorKelimeOkuma(id, havuz) {
  const e = KANA[id];
  const a = KANA_ANIMSATICI[e.r];
  if (!a || !a.kj) return null;
  const digerKelimeler = [];
  havuz.forEach(x => {
    if (x === id) return;
    const t = KANA_ANIMSATICI[KANA[x].r];
    if (!t || !t.kj || t.kj === a.kj) return;
    if (!digerKelimeler.some(k => k.ja === t.kj)) digerKelimeler.push({ ja: t.kj, ro: t.kr, tr: t.kt });
  });
  if (digerKelimeler.length < 3) return null;
  const yanlislar = kanaKaristir(digerKelimeler).slice(0, 3);
  return {
    tip: 'kelime', k: id,
    soru: 'Hangisi “' + a.kr + '” diye okunur?  (' + a.kt + ')',
    kelime: { ja: a.kj, ro: a.kr, tr: a.kt },
    dogru: a.kj, siklar: [a.kj].concat(yanlislar.map(k => k.ja))
  };
}
function sorKarsilik(id, havuz) {         // Hiragana <-> Katakana eşleştir
  const e = KANA[id];
  const diger = e.a === 'h' ? 'k' : 'h';
  const romajiler = kanaKaristir([...new Set(havuz.map(x => KANA[x].r))].filter(r => r !== e.r));
  const benzer = (KANA_BENZER[diger][e.r] || []).find(r => romajiler.includes(r));
  const secilen = benzer ? [benzer] : [];
  romajiler.forEach(r => { if (secilen.length < 3 && !secilen.includes(r)) secilen.push(r); });
  if (!secilen.length) return null;
  const siklar = [e.r].concat(secilen).map(r => KANA[kanaID(diger, r)].j);
  return { tip: 'soru', k: id, buyuk: e.j, soru: 'Bunun ' + KANA_ISIM[diger] + ' karşılığı hangisi?', dogru: KANA[kanaID(diger, e.r)].j, siklar: siklar };
}

// (D) YAZMA MODU: harfi göster, romajisini klavyeyle yazdır.
//     Tanıma değil HATIRLAMA gerektir; öğrenmenin en güçlü adımı.
//     'siklar' YOK: app.js bu tipte giriş kutusu çizer ve cevabı kendisi kontrol eder.
function sorYaz(id) {
  const e = KANA[id];
  return {
    tip: 'yaz', k: id, buyuk: e.j,
    soru: 'Bu harfin okunuşunu yaz',
    dogru: e.r,
    ip: e.a === 'k' ? 'Hiragana karşılığı: ' + KANA[kanaID('h', e.r)].j : undefined
  };
}

// ÖĞRETİM MESAJLARI: eskiden tek liste vardı ve her derste aynı 5 cümle
// tekrarlanıyordu ("İlk harfimiz! Sıradaki harf! ...") — bir süre sonra
// boş geliyor. Artık harfin KENDİSİ hakkında konuşan mesajlar var:
// harfin satırı (a/ka/sa...), önceki harfle benzerliği ve ders içindeki yeri.
const KANA_MESAJLAR = ['İlk harfimiz!', 'Sıradaki harf!', 'Bir tane daha!', 'Az kaldı!', 'Son harf!'];

// Harfin satırına göre anlamlı bir giriş cümlesi üretir.
// Örn: 'ka' -> "K sesleri başlıyor: ağzın önde, kısa bir 'k'."
const KANA_SATIR_IPUCU = {
  a: 'A sesleri: ağzın açık, ses berrak.',
  i: 'İ sesleri: ince ve kısa.',
  u: 'U sesleri: dudak düz, 'u' derken gülümser gibi.',
  e: 'E sesleri: Türkçedeki e gibi açık.',
  o: 'O sesleri: yuvarlak dudak.',
  ka: 'K sesleri: Türkçedeki k gibi net.',
  ki: 'K sesleri: ince ünlüyle yumuşar.',
  ku: 'K sesleri: dudak düz kalır.',
  ke: 'K sesleri: açık e ile.',
  ko: 'K sesleri: yuvarlak o ile.',
  sa: 'S sesleri: ıslık gibi ince s.',
  shi: 'Ş sesi: 's' değil, 'ş' gibi okunur — en çok karıştırılan harf!',
  su: 'S sesleri: dudak düz.',
  se: 'S sesleri: açık e.',
  so: 'S sesleri: yuvarlak o.',
  ta: 'T sesleri: net ve kısa t.',
  chi: 'Ç sesi: 't' değil, 'ç' gibi okunur.',
  tsu: 'TS sesi: t ve s'i tek nefeste söyle (tsunami).',
  te: 'T sesleri: açık e.',
  to: 'T sesleri: yuvarlak o.',
  na: 'N sesleri: burnundan hafif.',
  ni: 'N sesleri: ince i ile yumuşar.',
  nu: 'N sesleri: dudak düz.',
  ne: 'N sesleri: açık e.',
  no: 'N sesleri: yuvarlak o.',
  ha: 'H sesleri: nefes gibi yumuşak h.',
  hi: 'H sesleri: ince i.',
  fu: 'F sesi: 'f' değil 'h' ile 'f' arası — üfler gibi.',
  he: 'H sesleri: açık e.',
  ho: 'H sesleri: yuvarlak o.',
  ma: 'M sesleri: dudaklar kapalı.',
  mi: 'M sesleri: ince i.',
  mu: 'M sesleri: dudak düz, kısa.',
  me: 'M sesleri: açık e.',
  mo: 'M sesleri: yuvarlak o.',
  ya: 'Y sesleri: Türkçedeki y gibi.',
  yu: 'Y sesleri: dudak düz.',
  yo: 'Y sesleri: yuvarlak o.',
  ra: 'R sesi: Japon r\'si Türkçedeki r\'den YUMUŞAK — dil tek kere vurur.',
  ri: 'R sesi: yumuşak ve tek vuruşlu.',
  ru: 'R sesi: dudak düz.',
  re: 'R sesi: açık e.',
  ro: 'R sesi: yuvarlak o.',
  wa: 'W sesi: dudaklar yuvarlak, 'v' değil.',
  wo: 'WO: yalnızca nesne eki olarak kullanılır (を).',
  n: 'Tek başına hece! Kendi sesi var: 'n'.'
};

function dersUret(item) {
  if (item.grup) return kanaTurevDersUret(item);   // dakuten / handakuten / youon
  if (item.harfler) return kanaDersUret(item);
  if (item.kapsam) return kanaTestUret(item);
  return null;
}

// ---------- TÜREV HARF DERSİ (dakuten / handakuten / youon) ----------
// Bir grubun harflerini öğretir, sonra hemen sınar. "Hızlı öğretim" için
// aynı grupta 3-4 harf birlikte verilir ve her biri iki kez sorulur.
function kanaTurevDersUret(item) {
  const alfabe = item.alfabe || 'h';
  let romajiler = KANA_GRUPLAR[item.grup] || [];
  // Güvenlik: bir ders en fazla 6 harf öğretsin. Grup anahtarı yanlış verilirse
  // (ör. tüm dakuteni işaret ediyorsa) ders ezici olmasın.
  if (romajiler.length > 6) romajiler = romajiler.slice(0, 6);
  const yeni = romajiler.map(r => kanaID(alfabe, r)).filter(id => KANA[id]);
  if (!yeni.length) return null;

  const onceki = kanaOncekiler(item);
  const gorulen = onceki.slice();
  const adimlar = [];
  const ipucu = KANA_TUREV_IPUCU[item.grup];

  // 1) Her harfi öğret (anımsatıcı + örnek kelime), ikinciden itibaren hemen sına
  yeni.forEach((id, i) => {
    gorulen.push(id);
    const e = KANA[id];
    const temel = KANA_TEMEL_KARSILIK[id];   // か ↔ が eşleşmesi (ipucu olarak gösterilir)
    const anim = (KANA_TUREV_ANIM[e.r] || {});
    const parcalar = [];
    if (ipucu) parcalar.push('💡 ' + ipucu);
    if (temel) parcalar.push('Temel harf: ' + temel.j + ' (' + temel.r + ')');
    if (anim.m) parcalar.push('💡 ' + anim.m);
    adimlar.push({
      tip: 'ogret', k: id, ja: e.j, ro: e.r,
      mesaj: KANA_TUREV_MESAJ[Math.min(i, KANA_TUREV_MESAJ.length - 1)],
      ip: parcalar.join('\n'),
      ornek: anim.kj ? { ja: anim.kj, ro: anim.kr, tr: anim.kt } : null
    });
    if (i > 0) adimlar.push((i % 2 ? sorSesHarf : sorHarfSes)(id, gorulen));
  });

  // 2) Gruptaki her harf bir kez daha sorulur (tanıma + dinleme karışık)
  kanaKaristir(yeni).forEach((id, i) => {
    adimlar.push((i % 2 ? sorDinle : sorHarfSes)(id, gorulen));
  });

  // 3) YAZMA: gruptaki harflerden en fazla 2 tanesi yazdırılır (tanıma sonrası hatırlama).
  kanaKaristir(yeni).slice(0, 2).forEach(id => {
    adimlar.push(sorYaz(id));
  });

  return { baslik: item.baslik, xp: item.xp || 60, can: item.can || 3, adimlar: adimlar.filter(Boolean) };
}

// Türev harfin temel harf karşılığı (ipucu için): が -> か, じゃ -> じ -> し
const KANA_TEMEL_KARSILIK = (function () {
  const harita = {};
  KANA_TUREV.forEach(([r, h, k]) => {
    const temel = KANA_TUREV_TEMEL[r];
    if (!temel) return;
    harita['h:' + r] = { j: temel[1], r: temel[0] };
    harita['k:' + r] = { j: temel[2], r: temel[0] };
  });
  return harita;
})();

const KANA_TUREV_MESAJ = ['Yeni bir ses!', 'Bun kuralı şu:', 'Bir tane daha!', 'Az kaldı!', 'Son harf!'];

function kanaIpucu(id) {
  const e = KANA[id], parcalar = [];
  if (KANA_ANIMSATICI[e.r] && KANA_ANIMSATICI[e.r].m) parcalar.push('💡 ' + KANA_ANIMSATICI[e.r].m);
  if (e.a === 'k') parcalar.push('Hiragana karşılığı: ' + KANA[kanaID('h', e.r)].j);
  if (KANA_IPUCU[id]) parcalar.push(KANA_IPUCU[id]);
  return parcalar.join('\n') || undefined;
}

// Harfin örnek kelimesini (varsa) { ja, ro, tr } olarak döndür; ders içinde gösterilir.
function kanaOrnekKelime(id) {
  const e = KANA[id], a = KANA_ANIMSATICI[e.r];
  if (!a || !a.kj) return null;
  return { ja: a.kj, ro: a.kr, tr: a.kt };
}

// Bir kelimenin Türkçe anlamını sorar (şıklar sözlükten rastgele gelir).
// app.js 'kelime' tipini çizer; 'kelime' alanı olan sorularda kelime defteri de besler.
function sorKelimeAnlam(kelime) {
  if (typeof READING === 'undefined' || !READING.SOZLUK) return null;
  // Yanlış şıklar: farklı anlamlar, tercihen aynı alfabeden
  const adaylar = READING.SOZLUK.filter(k => k.tr && k.tr !== kelime.tr && k.kana === kelime.kana);
  const yedek = READING.SOZLUK.filter(k => k.tr && k.tr !== kelime.tr && k.kana !== kelime.kana);
  const hepsi = adaylar.concat(yedek);
  const yanlislar = [];
  const gorulen = { [kelime.tr]: true };
  for (const k of kanaKaristir(hepsi)) {
    if (gorulen[k.tr]) continue;
    gorulen[k.tr] = true;
    yanlislar.push(k.tr);
    if (yanlislar.length >= 3) break;
  }
  if (yanlislar.length < 2) return null;
  return {
    tip: 'kelime',
    kelime: kelime,
    soru: 'Bu kelimenin anlamı ne?',
    dogru: kelime.tr,
    siklar: [kelime.tr].concat(yanlislar)
  };
}

// ---------- GERÇEK SÖZLÜKTEN KELİME ----------
// reading.js'teki SOZLUK'ten, o harfin geçtiği gerçek kelimeleri bulur.
// Katakana öğretirken bu çok değerli: harf soyut bir şekil olmaktan çıkıp
// "kahve", "taksi", "pasta" gibi işe yar bir şeye dönüşür.
function sozluktenKelimeler(harf, alfabe, enFazla) {
  if (typeof READING === 'undefined' || !READING.SOZLUK) return [];
  const istenen = (alfabe === 'k') ? ['k', 'hk'] : ['h', 'hk'];
  const uygun = READING.SOZLUK.filter(k => {
    if (istenen.indexOf(k.kana) === -1) return false;
    return k.ja.indexOf(harf) > -1;         // bu harf kelimenin içinde geçiyor mu?
  });
  // En kısa kelime önce: öğrenci için daha kolay
  uygun.sort((a, b) => a.ja.length - b.ja.length);
  return uygun.slice(0, enFazla || 1).map(k => ({ ja: k.ja, ro: k.ro, tr: k.tr }));
}

// Bu derste öğretilen harflerden en az birini içeren kelimeler.
// Ders sonunda "bu harflerle yazılan gerçek kelimeler" bölümü için kullanılır.
function dersteKelimeler(harfListesi, alfabe, enFazla) {
  if (typeof READING === 'undefined' || !READING.SOZLUK) return [];
  const istenen = (alfabe === 'k') ? ['k', 'hk'] : ['h', 'hk'];
  const uygun = READING.SOZLUK.filter(k => {
    if (istenen.indexOf(k.kana) === -1) return false;
    return harfListesi.some(h => k.ja.indexOf(h) > -1);
  });
  // Kısa kelimeler önce, ama aynı harfi tekrar tekrar verme
  uygun.sort((a, b) => a.ja.length - b.ja.length);
  const secilen = [], kullanilan = {};
  for (const k of uygun) {
    const anahtar = k.ja.slice(0, 2);
    if (kullanilan[anahtar]) continue;
    kullanilan[anahtar] = true;
    secilen.push({ ja: k.ja, ro: k.ro, tr: k.tr });
    if (secilen.length >= (enFazla || 3)) break;
  }
  return secilen;
}

// ---------- OKUMA CÜMLESİ ADIMI (yeni) ----------
// Öğrenilen harflerle yazılabilen GERÇEK bir cümle gösterilir:
//   Japonca (kana) + romaji okunuşu + Türkçe çevirisi + ses
// Amaç: harfler henüz ezberken bile "ben bir şey OKUDUM" hissi vermek.
// Cümle seçimi: dersin harfleriyle SINIRLI tutulur (bilmediği harf çıkmasın).
function okumaCumlesiBul(harfler, enFazlaUzunluk) {
  if (typeof READING === 'undefined' || !READING.CUMLELER) return null;
  const uygun = READING.CUMLELER.filter(c => {
    // Cümledeki kananın TAMAMI bu derste bilinen harflerden mi oluşuyor?
    const temiz = c.ja.replace(/[。、！？\s]/g, '');
    // Bilinen harf dizisini en uzundan kısaya birleştir
    let kalan = temiz;
    const harflerSirali = harfler.slice().sort((a, b) => b.length - a.length);
    harflerSirali.forEach(h => { kalan = kalan.split(h).join(''); });
    // Kalan parçacık: sadece ekler (は/が/を/に/の/です/ます) olabilir
    const EKLER = ['です', 'ます', 'ません', 'ました', 'でした', 'ください', 'します', 'して',
      'は', 'が', 'を', 'に', 'の', 'で', 'と', 'も', 'か'];
    EKLER.forEach(e => { kalan = kalan.split(e).join(''); });
    return kalan.length === 0 && c.ja.length <= (enFazlaUzunluk || 14);
  });
  if (!uygun.length) return null;
  // En KISA cümle en kolay okunur
  uygun.sort((a, b) => a.ja.length - b.ja.length);
  return uygun[0];
}

function okumaAdimi(cumle, dersHarfleri) {
  return {
    tip: 'cumle-ogret',
    cumle: cumle,
    mesaj: 'Bu harflerle yazılmış gerçek bir cümle!',
    dersHarfleri: dersHarfleri,
    // app.js cumle-ogret tipini zaten çizer: kelimelere tıklayınca anlam çıkar
    tr: cumle.tr, ro: cumle.ro
  };
}

function kanaDersUret(item) {
  const alfabe = item.alfabe || 'h';
  const onceki = kanaOncekiler(item);
  const yeni = item.harfler.map(r => kanaID(alfabe, r));
  const gorulen = onceki.slice();
  const adimlar = [];

  // 1) Öğret: her harfi göster (anımsatıcı + örnek kelime).
  //    DERS KISALTMA: eskiden "ikinci harften itibaren hemen sına" vardı ve her
  //    harften sonra bir soru geliyordu. Bu, 5 harfli bir derste 4 ekstra adım
  //    demekti. Artık SADECE 2. ve 4. harften sonra sınanıyor (ders akmıyor,
  //    öğrenci de yeterince tekrar görüyor).
  const sinamaNoktalari = [1, 3];   // 0 tabanlı: 2. ve 4. harf
  yeni.forEach((id, i) => {
    gorulen.push(id);
    // Örnek kelime: önce GERÇEK sözlükten (varsa), yoksa anımsatıcıdaki kelime.
    const sozlukten = sozluktenKelimeler(KANA[id].j, alfabe, 1);
    const ornek = sozlukten.length ? sozlukten[0] : kanaOrnekKelime(id);
    adimlar.push({
      tip: 'ogret', k: id, ja: KANA[id].j, ro: KANA[id].r,
      mesaj: KANA_MESAJLAR[Math.min(i, 4)], resim: kanaResim(id), ip: kanaIpucu(id),
      ornek: ornek
    });
    if (sinamaNoktalari.indexOf(i) > -1) {
      adimlar.push((i % 2 ? sorSesHarf : sorHarfSes)(id, gorulen));
    }
  });

  // 2) Karıştırılan harfler: bu derste yeni öğrenilenlerden benzer olanları özellikle pekiştir
  //    (ör. shi/tsu, wa/ku/wo) - zayıf harf takibine de doğrudan girer.
  const karisik = yeni.filter(id => kanaBenzerler(id).some(x => yeni.includes(x)));
  kanaKaristir(karisik).slice(0, 2).forEach(id => {
    adimlar.push(sorSesHarf(id, gorulen));
  });

  // 2) PEKİŞTİR — KISA TUTULUR.
  //    DERS UZUNLUK KURALI (hedef ~14 adım):
  //      • Her yeni harf için 1 öğretim kartı      -> 5 adım (5 harfli ders)
  //      • Öğretim sırasında 2 hızlı sınama        -> 2 adım
  //      • Her yeni harfe 1 pekiştirme sorusu      -> 5 adım
  //      • 1 yazma + 1 kelime + 1 cümle            -> 3 adım
  //    Toplam ~15 adım. Eskiden 30+ idi ve sıkıyordu.
  //    ÖNEMLİ: öğretim sırasında soru SADECE 2 kez sorulur (eskiden her harfte).

  // 2a) Yeni harflerin hepsine BİR pekiştirme sorusu (tip harften harfe değişir)
  const soruTipleri = [
    (id, h) => sorHarfSes(id, h),
    (id, h) => sorKaristirilanCift(id) || sorSesHarf(id, h),
    (id, h) => sorDinle(id, h),
    (id, h) => sorKelimeHarfi(id, h) || sorSesHarf(id, h),
    (id, h) => sorKelimeOkuma(id, h) || sorDinle(id, h)
  ];
  kanaKaristir(yeni).forEach((id, i) => {
    adimlar.push(soruTipleri[i % soruTipleri.length](id, gorulen));
  });

  // 2b) ÖNCEKİ derslerden sadece 2 harf (zayıf olanlar öncelikli) — tekrar payı
  const zayifOnceki = kanaZayifIdler().filter(x => onceki.includes(x));
  const ekstra = zayifOnceki.concat(kanaKaristir(onceki.filter(x => !zayifOnceki.includes(x)))).slice(0, 2);
  kanaKaristir(ekstra).forEach((id, i) => {
    adimlar.push((i % 2 ? sorHarfSes : sorSesHarf)(id, gorulen));
  });

  // 3) YAZMA: dersten EN FAZLA 1 harf yazdırılır (ders kısalsın).
  const yazHedefi = kanaKaristir(yeni)[0];
  if (yazHedefi) adimlar.push(sorYaz(yazHedefi));

  // 4) GERÇEK KELİME: en fazla 1 kelime (öğret + anlam sorusu = 2 adım).
  //    Kelime defterine kaydedilir; kanji bölümünde tekrar bakılır.
  const dersHarfleri = yeni.map(id => KANA[id].j);
  const gercekKelimeler = dersteKelimeler(dersHarfleri, alfabe, 1);
  gercekKelimeler.forEach(kelime => {
    adimlar.push({ tip: 'kelime-ogret', kelime: kelime, mesaj: 'Bu harflerle yazılan gerçek bir kelime' });
    const anlam = sorKelimeAnlam(kelime);
    if (anlam) adimlar.push(anlam);
  });

  // 5) OKUMA: öğrenilen harflerle yazılmış gerçek bir cümle (romaji + çeviri + ses).
  //    Dersin EN SONUNDA: harfler artık biliniyor, cümle "ödül" gibi gelir.
  //    Sadece gerekli harfler öğrenilmişse eklenir (bilmediği harf çıkmasın).
  const okumaIcinHarfler = dersHarfleri.concat(
    onceki.map(id => KANA[id] ? KANA[id].j : '')
  ).filter(Boolean);
  const cumle = okumaCumlesiBul(okumaIcinHarfler, 12);
  if (cumle) adimlar.push(okumaAdimi(cumle, dersHarfleri));

  return { baslik: item.baslik, xp: item.xp || 50, can: item.can || 3, adimlar: adimlar.filter(Boolean) };
}

function kanaTestUret(item) {
  // Test, önceki derslerin öğrettiği TÜM harflerden sorar (temel + türev).
  const havuz = kanaOncekiler(item).filter(id => KANA[id]);
  const n = Math.min(item.soru || 10, havuz.length);
  // Sorunun ~%30'u zayıf harflerden
  const zayif = kanaZayifIdler().filter(x => havuz.includes(x)).slice(0, Math.ceil(n * 0.3));
  const digerleri = kanaKaristir(havuz.filter(x => !zayif.includes(x))).slice(0, n - zayif.length);
  const sorular = kanaKaristir(zayif.concat(digerleri));
  const karma = (item.alfabe || 'h').length > 1;
  // Test, derslerde öğretilen tiplerin hepsini yoklar (harf-ses, ses-harf, dinleme,
  // karşılık, karıştırılan çift, kelime içinde harf, ters okuma).
  const turler = (karma
    ? [sorHarfSes, sorSesHarf, sorKarsilik, sorDinle, sorKaristirilanCift, sorKelimeHarfi, sorKelimeOkuma]
    : [sorHarfSes, sorSesHarf, sorDinle, sorKaristirilanCift, sorKelimeHarfi, sorKelimeOkuma]
  ).map(f => (id, h) => f(id, h));
  const adimlar = sorular.map((id, i) => turler[i % turler.length](id, havuz) || sorHarfSes(id, havuz));
  return { baslik: item.baslik, xp: item.xp || 75, can: item.can || 4, adimlar: adimlar.filter(Boolean) };
}

// Pekiştirme dersi: zayıf harflere ve tekrar zamanı gelenlere odaklanır.
// Havuz = o ana kadar görülen tüm harfler (varsa alfabe filtresiyle).
function kanaPekistirUret(item) {
  if (typeof Ilerleme === 'undefined') return null;
  const alfabe = item.alfabe || 'h';                       // 'h' | 'k' | 'hk'
  let gorulen = Ilerleme.gorulenIdler().filter(id => alfabe.indexOf((KANA[id] || {}).a || '') !== -1);
  // Hiç harf görülmemişse (test/ilk kullanım): söz konusu alfabenin TÜM harflerini kullan,
  // böylece bu bölüm her zaman denenebilir olur.
  if (!gorulen.length) {
    gorulen = Object.keys(KANA).filter(id => alfabe.indexOf(KANA[id].a) !== -1);
  }
  if (!gorulen.length) return null;
  const n = Math.min(item.soru || 10, gorulen.length);
  // Zayıf harfler önce, kalanı rastgele
  const zayif = kanaZayifIdler().filter(x => gorulen.includes(x));
  const digerleri = kanaKaristir(gorulen.filter(x => !zayif.includes(x)));
  const secilen = zayif.concat(digerleri).slice(0, n);
  const karma = alfabe.length > 1;
  const turler = karma ? [sorHarfSes, sorSesHarf, sorKarsilik, sorDinle] : [sorHarfSes, sorSesHarf, sorDinle];
  const adimlar = kanaKaristir(secilen).map((id, i) => turler[i % turler.length](id, gorulen));
  return { baslik: item.baslik, xp: item.xp || 60, can: item.can || 4, adimlar: adimlar.filter(Boolean) };
}

// Tekrar dersi: aralıklı tekrar (Ilerleme) zamanı gelen / zayıf harfler
function kanaTekrarUret(adet) {
  if (typeof Ilerleme === 'undefined') return null;
  const idler = Ilerleme.tekrarIdleri(adet || 10);
  if (!idler.length) return null;
  const havuz = [...new Set(Ilerleme.gorulenIdler().concat(idler))];
  const turler = [sorHarfSes, sorDinle, sorSesHarf];
  const adimlar = kanaKaristir(idler).map((id, i) => turler[i % 3](id, havuz));
  return { baslik: 'Tekrar Zamanı', xp: 20, can: 5, tekrar: true, adimlar: adimlar.filter(Boolean) };
}
