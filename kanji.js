// ============================================================
// KANJİ.JS : KANJİ VERİSİ + SORU ÜRETİCİ (N5 seviyesi)
//
// Bu dosya "Kanji (N5)" bölümünü (müfredat Bölüm 9) besler.
// reading.js'in kardeşidir: veri + soru üreticisi, arayüzü app.js çizer.
//
// KANJİ NEDİR, NEDEN SONRA GELİR?
//   Hiragana/Katakana sesleri gösterir, KANJİ ise ANLAMI. Bir kanjinin
//   birden çok okunuşu olabilir (kun'yomi = Japonca okunuş, on'yomi =
//   Çince kökenli okunuş). Bu yüzden kanji, alfabeler ve okuma oturduktan
//   SONRA öğretilir; aksi hâlde öğrenci üç sistemi birden taşıyamaz.
//
// KAYIT BİÇİMİ (KANJILER):
//   { k: '山', tr: 'dağ', kun: 'やま', on: 'サン', grup: 'doga' }
//     k    : kanji karakteri
//     tr   : Türkçe anlamı (tek ve net olmalı; şık çeldiricisi olarak kullanılır)
//     kun  : kun'yomi (Japonca okunuş, genelde hiragana ile) — '' olabilir
//     on   : on'yomi (Çince kökenli okunuş, genelde katakana ile) — '' olabilir
//     grup : ders gruplaması (müfredattaki kanjiGrup alanıyla eşleşir)
//     ornek: (isteğe bağlı) { ja, ro, tr } bu kanjinin geçtiği örnek kelime
//
// SORU TİPLERİ (reading.js ile aynı sözleşmeyi kullanır):
//   - 'kanji-ogret' : yeni kanji kartı (kanji + okunuş + anlam) — ANLADIM
//   - 'kelime'      : mevcut app.js tipi; kanji kartı + şıklı soru
//     Böylece app.js'e HİÇ dokunmadan kanji soruları çizilebiliyor.
// ============================================================

const KANJILER = [
  // ---------- SAYILAR ----------
  { k: '一', tr: 'bir (1)',    kun: 'ひと', on: 'イチ', grup: 'sayilar', ornek: { ja: '一つ', ro: 'hitotsu', tr: 'bir tane' } },
  { k: '二', tr: 'iki (2)',    kun: 'ふた', on: 'ニ',   grup: 'sayilar' },
  { k: '三', tr: 'üç (3)',     kun: 'み',   on: 'サン', grup: 'sayilar', ornek: { ja: '三月', ro: 'sangatsu', tr: 'mart' } },
  { k: '四', tr: 'dört (4)',   kun: 'よ',   on: 'シ',   grup: 'sayilar' },
  { k: '五', tr: 'beş (5)',    kun: 'いつ', on: 'ゴ',   grup: 'sayilar' },
  { k: '六', tr: 'altı (6)',   kun: 'む',   on: 'ロク', grup: 'sayilar2' },
  { k: '七', tr: 'yedi (7)',   kun: 'な', on: 'シチ', grup: 'sayilar2' },
  { k: '八', tr: 'sekiz (8)',  kun: 'や',   on: 'ハチ', grup: 'sayilar2' },
  { k: '九', tr: 'dokuz (9)',  kun: 'ここの', on: 'キュウ', grup: 'sayilar2' },
  { k: '十', tr: 'on (10)',    kun: 'とお', on: 'ジュウ', grup: 'sayilar2', ornek: { ja: '十月', ro: 'juugatsu', tr: 'ekim' } },

  // ---------- GÜNLER VE ZAMAN ----------
  { k: '日', tr: 'gün / güneş', kun: 'ひ',   on: 'ニチ', grup: 'gunler', ornek: { ja: '日曜日', ro: 'nichiyoubi', tr: 'pazar' } },
  { k: '月', tr: 'ay / takvim', kun: 'つき', on: 'ゲツ', grup: 'gunler', ornek: { ja: '月曜日', ro: 'getsuyoubi', tr: 'pazartesi' } },
  { k: '火', tr: 'ateş / salı', kun: 'ひ',   on: 'カ',   grup: 'gunler' },
  { k: '水', tr: 'su / çarşamba', kun: 'みず', on: 'スイ', grup: 'gunler' },
  { k: '木', tr: 'ağaç / perşembe', kun: 'き', on: 'モク', grup: 'gunler' },
  { k: '金', tr: 'altın / para / cuma', kun: 'かね', on: 'キン', grup: 'gunler2' },
  { k: '土', tr: 'toprak / cumartesi', kun: 'つち', on: 'ド', grup: 'gunler2' },
  { k: '年', tr: 'yıl',      kun: 'とし', on: 'ネン', grup: 'gunler2', ornek: { ja: '今年', ro: 'kotoshi', tr: 'bu yıl' } },
  { k: '時', tr: 'saat',     kun: 'とき', on: 'ジ',   grup: 'gunler2', ornek: { ja: '三時', ro: 'sanji', tr: 'saat üç' } },
  // DÜZELTİLDİ: kun 'わ' DEĞİL. 'わかる/わける' = bölmek/anlamak demektir.
  // 'dakika' anlamı on okunuşla gelir (フン / ブン).
  { k: '分', tr: 'dakika',   kun: 'ワかる', on: 'フン', grup: 'gunler2' },

  // ---------- İNSAN VE AİLE ----------
  { k: '人', tr: 'insan',    kun: 'ひと', on: 'ジン', grup: 'insan', ornek: { ja: '日本人', ro: 'nihonjin', tr: 'Japon' } },
  { k: '男', tr: 'erkek',    kun: 'おとこ', on: 'ダン', grup: 'insan' },
  { k: '女', tr: 'kadın',    kun: 'おんな', on: 'ジョ', grup: 'insan' },
  { k: '子', tr: 'çocuk',    kun: 'こ',   on: 'シ',   grup: 'insan' },
  // NOT: kun okunuşlarını TAM yazıyoruz. Kırpılmış okunuş (父:ち yerine ち)
  // öğrenciyi yanıltır; sözlükte de bu biçimle geçmez.
  // DÜZELTİLDİ: ち → ち (baba),  は → は (anne). Tek hece yanıltıcıydı.
  { k: '父', tr: 'baba',     kun: 'ち', on: 'フ',   grup: 'insan' },
  { k: '母', tr: 'anne',     kun: 'は', on: 'ボ',   grup: 'insan2' },
  { k: '友', tr: 'arkadaş',  kun: 'とも', on: 'ユウ', grup: 'insan2' },
  { k: '名', tr: 'isim',     kun: 'な',   on: 'メイ', grup: 'insan2' },
  { k: '先', tr: 'önce / ileri', kun: 'さき', on: 'セン', grup: 'insan2', ornek: { ja: '先生', ro: 'sensei', tr: 'öğretmen' } },
  { k: '生', tr: 'hayat / doğmak', kun: 'い', on: 'セイ', grup: 'insan2', ornek: { ja: '学生', ro: 'gakusei', tr: 'öğrenci' } },

  // ---------- DOĞA ----------
  { k: '山', tr: 'dağ',      kun: 'やま', on: 'サン', grup: 'doga', ornek: { ja: '富士山', ro: 'fujisan', tr: 'Fuji Dağı' } },
  { k: '川', tr: 'nehir',    kun: 'かわ', on: 'セン', grup: 'doga' },
  { k: '田', tr: 'pirinç tarlası', kun: 'た', on: 'デン', grup: 'doga' },
  { k: '天', tr: 'gökyüzü / cennet', kun: 'あま', on: 'テン', grup: 'doga' },
  { k: '空', tr: 'gökyüzü / boş', kun: 'そら', on: 'クウ', grup: 'doga' },
  { k: '雨', tr: 'yağmur',   kun: 'あめ', on: 'ウ',   grup: 'doga2' },
  { k: '花', tr: 'çiçek',    kun: 'はな', on: 'カ',   grup: 'doga2' },
  { k: '海', tr: 'deniz',    kun: 'うみ', on: 'カイ', grup: 'doga2' },
  { k: '石', tr: 'taş',      kun: 'いし', on: 'セキ', grup: 'doga2' },
  { k: '犬', tr: 'köpek',    kun: 'いぬ', on: 'ケン', grup: 'doga2' },

  // ---------- YÖN VE YER ----------
  { k: '上', tr: 'üst / yukarı', kun: 'うえ', on: 'ジョウ', grup: 'yon' },
  { k: '下', tr: 'alt / aşağı',  kun: 'した', on: 'カ',   grup: 'yon' },
  { k: '中', tr: 'iç / orta',    kun: 'なか', on: 'チュウ', grup: 'yon' },
  { k: '外', tr: 'dış / dışarı', kun: 'そと', on: 'ガイ', grup: 'yon' },
  { k: '前', tr: 'ön / önce',    kun: 'まえ', on: 'ゼン', grup: 'yon' },
  { k: '後', tr: 'arka / sonra', kun: 'うし', on: 'ゴ',   grup: 'yon2' },
  { k: '右', tr: 'sağ',          kun: 'みぎ', on: 'ウ',   grup: 'yon2' },
  { k: '左', tr: 'sol',          kun: 'ひだり', on: 'サ', grup: 'yon2' },
  { k: '東', tr: 'doğu',         kun: 'ひがし', on: 'トウ', grup: 'yon2' },
  { k: '西', tr: 'batı',         kun: 'にし', on: 'セイ', grup: 'yon2' },

  // ---------- OKUL VE ÖĞRENME ----------
  { k: '学', tr: 'öğrenmek', kun: 'まな', on: 'ガク', grup: 'okul', ornek: { ja: '大学', ro: 'daigaku', tr: 'üniversite' } },
  { k: '校', tr: 'okul',     kun: '',    on: 'コウ', grup: 'okul', ornek: { ja: '学校', ro: 'gakkou', tr: 'okul' } },
  { k: '本', tr: 'kitap / asıl', kun: 'もと', on: 'ホン', grup: 'okul', ornek: { ja: '日本語', ro: 'nihongo', tr: 'Japonca' } },
  // DÜZELTİLDİ: kun okunuşu かた.る = 'anlatmak'; 'dil' anlamı on ゴ ile gelir.
  { k: '語', tr: 'dil / söz', kun: 'かたる', on: 'ゴ',   grup: 'okul' },
  { k: '国', tr: 'ülke',     kun: 'くに', on: 'コク', grup: 'okul' },

  // ---------- YEMEK VE VÜCUT ----------
  { k: '食', tr: 'yemek / yemek yemek', kun: 'た', on: 'ショク', grup: 'yemek' },
  { k: '飲', tr: 'içmek',   kun: 'の',   on: 'イン', grup: 'yemek' },
  // NOT: 水 gunler grubunda tanımlı (su / çarşamba); burada tekrarlanmaz.
  { k: '口', tr: 'ağız',    kun: 'くち', on: 'コウ', grup: 'yemek' },
  { k: '目', tr: 'göz',     kun: 'め',   on: 'モク', grup: 'yemek' },

  // ---------- BÜYÜKLÜK VE MİKTAR ----------
  { k: '大', tr: 'büyük',  kun: 'おきい', on: 'ダイ', grup: 'miktar', ornek: { ja: '大学', ro: 'daigaku', tr: 'üniversite' } },
  { k: '小', tr: 'küçük',  kun: 'ちいさい', on: 'ショウ', grup: 'miktar' },
  { k: '多', tr: 'çok',    kun: 'おい', on: 'タ',   grup: 'miktar' },
  { k: '少', tr: 'az',     kun: 'すこし', on: 'ショウ', grup: 'miktar' },
  { k: '百', tr: 'yüz (100)', kun: '', on: 'ヒャク', grup: 'miktar' },

  // ---------- EYLEMLER ----------
  // NOT: 食/飲/水 yemek grubunda zaten var; burada tekrarlanmaz.
  { k: '見', tr: 'görmek', kun: 'み', on: 'ケン', grup: 'eylem' },
  { k: '行', tr: 'gitmek', kun: 'い', on: 'コウ', grup: 'eylem' },
  { k: '来', tr: 'gelmek', kun: 'く', on: 'ライ', grup: 'eylem' },
  { k: '言', tr: 'söylemek', kun: 'い', on: 'ゲン', grup: 'eylem' },
  { k: '聞', tr: 'dinlemek / sormak', kun: 'き', on: 'ブン', grup: 'eylem' },

  // ---------- ZAMAN VE KİŞİ (cümleler için gerekli) ----------
  // Bu kanjiler kanji-cumle.js'teki cümlelerde geçiyor;
  // listede olmazlarsa o cümleler karışık derse HİÇ giremez.
  { k: '今', tr: 'şimdi', kun: 'いま', on: 'コン', grup: 'zaman' },
  // DÜZELTİLDİ: あか DEĞİL, 明るい = あか.るい (aydınlık). 'yarın' あした/メイ.
  { k: '明', tr: 'aydınlık / yarın', kun: 'あかるい', on: 'メイ', grup: 'zaman' },
  { k: '私', tr: 'ben', kun: 'わたし', on: 'シ', grup: 'insan' },
  { k: '手', tr: 'el', kun: 'て', on: 'シュ', grup: 'yemek' },
  { k: '何', tr: 'ne', kun: 'なに', on: 'カ', grup: 'zaman' },
  { k: '休', tr: 'dinlenmek / tatil', kun: 'やす', on: 'キュウ', grup: 'eylem' },
  { k: '広', tr: 'geniş', kun: 'ひろ', on: 'コウ', grup: 'miktar' },
  { k: '青', tr: 'mavi', kun: 'あお', on: 'セイ', grup: 'miktar' },
  { k: '高', tr: 'yüksek / pahalı', kun: 'たか', on: 'コウ', grup: 'miktar' },
  { k: '読', tr: 'okumak', kun: 'よ', on: 'ドク', grup: 'eylem' },
  { k: '買', tr: 'satın almak', kun: 'か', on: 'バイ', grup: 'eylem' },
  { k: '会', tr: 'buluşmak', kun: 'あ', on: 'カイ', grup: 'eylem' },
  { k: '待', tr: 'beklemek', kun: 'ま', on: 'タイ', grup: 'eylem' },
  { k: '話', tr: 'konuşmak', kun: 'はな', on: 'ワ', grup: 'eylem' },
  { k: '歌', tr: 'şarkı söylemek', kun: 'うた', on: 'カ', grup: 'eylem' },
  { k: '元', tr: 'kök / asıl', kun: 'もと', on: 'ゲン', grup: 'miktar' },
  { k: '気', tr: 'ruh / hava', kun: 'き', on: 'キ', grup: 'miktar' },
  { k: '静', tr: 'sessiz', kun: 'しず', on: 'セイ', grup: 'miktar' },
  { k: '歩', tr: 'yürümek', kun: 'ある', on: 'ホ', grup: 'eylem' },
  // DÜZELTİLDİ: kun はた (はたおり) çok nadir ve yanıltıcı; kun boş bırakıldı.
  { k: '機', tr: 'makine', kun: '', on: 'キ', grup: 'okul' },
  { k: '円', tr: 'yen / yuvarlak', kun: 'まる', on: 'エン', grup: 'miktar', ornek: { ja: '百円', ro: 'hyakuen', tr: 'yüz yen' } }
];

// ---------- Yardımcılar ----------

/** Grup adına göre kanjileri süz. 'hepsi' özel: tüm kayıtlar. */
function grupKanjileri(grup) {
  if (!grup || grup === 'hepsi') return KANJILER.slice();
  if (grup === 'sinav1') return KANJILER.slice();   // ilk sınav: tüm öğrenilenler
  return KANJILER.filter(k => k.grup === grup);
}

/** Bir kanjinin okunuşlarını okunabilir metne çevir (kart ve ipucu için). */
function okunusMetni(kanji) {
  const p = [];
  if (kanji.kun) p.push(kanji.kun + ' (kun)');
  if (kanji.on) p.push(kanji.on + ' (on)');
  return p.join(' · ') || '—';
}

/** Şıkları üret: doğru Türkçe anlam + rastgele çeldiriciler. */
function kanjiSiklar(dogruAnlam, n) {
  const digerleri = KANJILER.filter(k => k.tr !== dogruAnlam).map(k => k.tr);
  const secilen = [];
  const gorulen = new Set([dogruAnlam]);
  while (secilen.length < (n || 3) && digerleri.length) {
    const i = Math.floor(Math.random() * digerleri.length);
    const a = digerleri.splice(i, 1)[0];
    if (!gorulen.has(a)) { gorulen.add(a); secilen.push(a); }
  }
  return [dogruAnlam].concat(secilen);
}

function karistir(dizi) {
  const a = dizi.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- SORU ÜRETİCİLERİ ----------

// Kart: yeni kanjiyi öğretir. app.js 'kanji-ogret' tipini çizer (aşağıda ekli).
function kanjiOgret(k) {
  return { tip: 'kanji-ogret', kanji: k };
}

// Kanjiyi göster, Türkçe anlamını sor. (app.js'in mevcut 'kelime' tipini kullanır,
// böylece ayrı bir çizim kodu gerekmez: kelime={ja:k, ro:okunus, tr:anlam}.)
// NOT: `kelime` alanı verildiği için app.js bu soruyu kelime defterine de işler;
// böylece kanji aralıklı tekrara (hafıza takvimi) girer.
function sorKanjiAnlam(k) {
  return {
    tip: 'kelime',
    kanji: k.k,                       // app.js cevabı kanji takibine işlesin
    kelime: { ja: k.k, ro: okunusMetni(k), tr: k.tr },
    soru: 'Bu kanjinin anlamı hangisi?',
    dogru: k.tr,
    siklar: karistir(kanjiSiklar(k.tr))
  };
}

// Kanjiyi göster, okunuşunu sor (kun/on bilgisiyle).
function sorKanjiOkunus(k) {
  const dogru = okunusMetni(k);
  const digerleri = KANJILER.filter(x => okunusMetni(x) !== dogru).map(x => okunusMetni(x));
  const secilen = [];
  const gorulen = new Set([dogru]);
  while (secilen.length < 3 && digerleri.length) {
    const i = Math.floor(Math.random() * digerleri.length);
    const a = digerleri.splice(i, 1)[0];
    if (!gorulen.has(a)) { gorulen.add(a); secilen.push(a); }
  }
  return {
    tip: 'kelime',
    kanji: k.k,                       // app.js cevabı kanji takibine işlesin
    kelime: { ja: k.k, ro: okunusMetni(k), tr: k.tr },
    soru: 'Bu kanjinin okunuşu hangisi?',
    dogru: dogru,
    siklar: karistir([dogru].concat(secilen))
  };
}

// Anlamı Türkçe olarak ver, doğru KANJIYI seçtir (ters yön: üretim becerisi).
function sorKanjiEsles(k, havuz) {
  const kaynak = (havuz && havuz.length >= 4) ? havuz : KANJILER;
  const digerleri = kaynak.filter(x => x.k !== k.k).map(x => x.k);
  const secilen = [];
  const gorulen = new Set([k.k]);
  while (secilen.length < 3 && digerleri.length) {
    const i = Math.floor(Math.random() * digerleri.length);
    const a = digerleri.splice(i, 1)[0];
    if (!gorulen.has(a)) { gorulen.add(a); secilen.push(a); }
  }
  return {
    tip: 'kelime',
    kanji: k.k,                       // app.js cevabı kanji takibine işlesin
    kelime: { ja: k.tr, ro: '', tr: 'Anlamı: ' + k.tr },
    soru: 'Hangisi "' + k.tr + '" anlamına gelir?',
    dogru: k.k,
    siklar: karistir([k.k].concat(secilen))
  };
}

// ---------- DERS ÜRETİCİ ----------

/**
 * Müfredattaki tip:'kanji' dairesi için ders üretir.
 *   1) Kanji öğretilir (kart)        -> ANLADIM
 *   2) Anlamı sorulur                -> şıklı
 *   3) Okunuşu sorulur               -> şıklı
 *   4) Kanji seçtirilir (ters yön)   -> şıklı
 * Her adımda önce öğretim olduğu için öğrenci hiç görmediği kanjiyi sormaz.
 */
function kanjiDersi(item) {
  const grup = item.kanjiGrup || 'hepsi';
  let havuz = grupKanjileri(grup);

  // Müfredat belirli kanjileri işaretlediyse (sadeceKanji) onları kullan.
  if (item.sadeceKanji && item.sadeceKanji.length) {
    const istenen = new Set(item.sadeceKanji);
    const suzulmus = KANJILER.filter(k => istenen.has(k.k));
    if (suzulmus.length) havuz = suzulmus;
  }

  if (!havuz.length) return null;

  // Her kanji için 4 adım üretilir: öğret + anlam + okunuş + kanji seç.
  // Müfredattaki `soru` alanı "kaç SORU" demek istiyor; 4'e bölerek kaç KANJİ
  // işleneceğini buluruz. En az 2 kanji alınır ki ders boş kalmasın.
  // (Önceden 3'e bölünüyordu; 'soru: 8' 3 kanji = 12 adım çıkarıyordu.)
  const ADIM_BASI = 4;
  const istenen = item.soru ? Math.ceil(item.soru / ADIM_BASI) : havuz.length;
  const n = Math.max(2, Math.min(istenen, havuz.length));
  const secilen = karistir(havuz).slice(0, n);

  const adimlar = [];
  secilen.forEach(k => {
    adimlar.push(kanjiOgret(k));
    adimlar.push(sorKanjiAnlam(k));
    adimlar.push(sorKanjiOkunus(k));
    adimlar.push(sorKanjiEsles(k, havuz));
  });

  return {
    baslik: item.baslik,
    xp: item.xp || 100,
    can: item.can || 4,
    adimlar: adimlar
  };
}

// ============================================================
// KANJİ İLERLEME TAKİBİ  (kümülatif havuz için)
//
// NEDEN GEREKLİ: `tip:'karisik'` dersleri "o ana kadar öğrenilen TÜM
// kanjiler"den soru üretir. Bunu bilmek için hangi kanjinin ne zaman
// öğretildiğini ve ne durumda olduğunu saklamak gerekir.
//
// Kayıt (localStorage):
//   sakar_kanji  { "山": { ogretildi: true, ilk: '2025-01-03', d: 4, y: 1,
//                          sonSoru: '2025-01-05', kutu: 2 } }
//     ogretildi : kart gösterildi mi (yalnızca true olanlar sorulabilir)
//     d / y     : kaç kez doğru / yanlış cevap verildi
//     kutu      : Leitner kutusu 0..5 (aralıklı tekrar için; kanji daha yavaş ilerler)
//     sonSoru   : en son ne zaman soruldu (serpiştirme ağırlığında kullanılır)
// ============================================================
const KANJI_ANAHTAR = 'sakar_kanji';
const KANJI_ARALIK = [0, 1, 3, 7, 14, 30];   // kutu -> kaç gün sonra tekrar
function kanjiTarih(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function kanjiGunEkle(gun, n) {
  const p = gun.split('-').map(Number);
  return kanjiTarih(new Date(p[0], p[1] - 1, p[2] + n));
}

function kanjiOku() {
  try {
    const x = JSON.parse(localStorage.getItem(KANJI_ANAHTAR));
    return (x && typeof x === 'object') ? x : {};
  } catch (e) { return {}; }
}
function kanjiYaz(h) {
  try { localStorage.setItem(KANJI_ANAHTAR, JSON.stringify(h)); } catch (e) { }
}

/** Bir kanjiyi "öğretildi" olarak işaretle (kart gösterildiğinde çağrılır). */
function kanjiOgretildi(k) {
  if (!k || !k.k) return;
  const h = kanjiOku();
  const g = h[k.k] || { ogretildi: true, ilk: kanjiTarih(), d: 0, y: 0, kutu: 0, sonSoru: '' };
  g.ogretildi = true;
  h[k.k] = g;
  kanjiYaz(h);
}

/** Soruya verilen cevabı kaydet (aralıklı tekrar takvimi güncellenir). */
function kanjiCevap(k, dogruMu) {
  if (!k || !k.k) return;
  const h = kanjiOku();
  const bugun = kanjiTarih();
  const g = h[k.k] || { ogretildi: true, ilk: bugun, d: 0, y: 0, kutu: 0, sonSoru: '' };
  const ayniGun = g.sonSoru === bugun;
  if (dogruMu) {
    g.d++;
    // Günde en fazla bir kutu ilerlesin (aynı gün seri doğru cevap kutuyu şişirmesin)
    if (!ayniGun) g.kutu = Math.min((g.kutu || 0) + 1, KANJI_ARALIK.length - 1);
  } else {
    g.y++;
    g.kutu = 0;
  }
  g.sonSoru = bugun;
  h[k.k] = g;
  kanjiYaz(h);
}

/** Öğretilmiş kanjilerin listesi (kümülatif havuz). */
function ogrenilenKanjiler() {
  const h = kanjiOku();
  return KANJILER.filter(k => h[k.k] && h[k.k].ogretildi);
}

/** Öğretilmiş kanji kayıtlarını döndür (ağırlık hesabı için). */
function kanjiDurumlari() {
  const h = kanjiOku();
  return ogrenilenKanjiler().map(k => {
    const g = h[k.k];
    return {
      kanji: k,
      kutu: g.kutu || 0,
      d: g.d || 0,
      y: g.y || 0,
      sonSoru: g.sonSoru || '',
      oran: (g.d || 0) + (g.y || 0) > 0 ? (g.d || 0) / ((g.d || 0) + (g.y || 0)) : 0
    };
  });
}

// ============================================================
// KARIŞIK DERS (tip:'karisik') — KANJİ SERPİŞTİRME MOTORU
//
// TASARIM (kullanıcı isteği):
//   • "öğret-sor-öğret-sor" gitme. Yeni kanji SEYREK gelir: 1 öğretim dersi,
//     ardından 3 karışık ders, sonra yeni kanji. (Müfredat bu ritmi kurar.)
//   • Karışık dersler ÇOKLUKLA cümle/kelime çevirisi sorar (Duolingo tarzı).
//   • Araya ÖĞRENİLMİŞ kanjiler serpişir — ama HER adımda değil (~%35).
//   • Yeni öğrenilen kanji daha sık, eskiler seyrekleşir, tekrarı gelen öne çıkar.
//
// NEDEN "ağırlıklı rastgele"?
//   İllâ her cümlede kanji soksak ders test gibi olur, öğrenci bıkar.
//   Hiç sokmasak kanji unutulur. Ağırlıklı rastgelelik ikisinin dengesini kurar
//   ve aralıklı tekrar (Leitner) ile birleşince kalıcılığı artır.
// ============================================================

// Kanjili cümleler (kanji-cumle.js). Yoksa boş liste.
function kanjiCumleleri() {
  try {
    if (typeof KANJI_CUMLELER !== 'undefined' && KANJI_CUMLELER.length) return KANJI_CUMLELER;
  } catch (e) { }
  return [];
}

/**
 * Serpiştirme ağırlığı hesapla.
 * Yüksek ağırlık = sık sorulur. Kurallar:
 *   - Yeni öğrenilen (kutu 0, az sorulmuş)  -> yüksek
 *   - Tekrar zamanı gelmiş (bugün <= sonra) -> yüksek
 *   - Çok yanlış yapılan                    -> yüksek
 *   - İyi bilinen eski kanji                -> düşük
 */
function serpistirmeAgirligi(durum) {
  let agirlik = 1;
  // Yeni öğrenilen: hiç sorulmamış veya kutusu düşük
  if (durum.sonSoru === '') agirlik += 3;         // daha hiç sorulmadı -> öne çıksın
  if (durum.kutu <= 1) agirlik += 2;              // yeni / zayıf
  // Tekrar zamanı gelmiş mi?
  if (durum.sonSoru) {
    const sonra = kanjiGunEkle(durum.sonSoru, KANJI_ARALIK[Math.min(durum.kutu, KANJI_ARALIK.length - 1)]);
    if (sonra <= kanjiTarih()) agirlik += 3;      // günü gelmiş -> mutlaka sor
  }
  // Çok yanlış yapılan kanji daha çok sorulsun
  if (durum.oran > 0 && durum.oran < 0.6 && durum.y >= 1) agirlik += 2;
  // İyi bilinen (kutu yüksek) -> seyrekleşsin
  if (durum.kutu >= 4) agirlik = Math.max(1, agirlik - 2);
  return Math.max(agirlik, 1);
}

/**
 * Ağırlıklı rastgele tek kanji seç.
 * havuz: kanjiDurumlari() çıktısı (durum listesi)
 * haric: bu turda zaten sorulmuş kanji karakterleri (aynı ders içinde tekrar olmasın)
 */
function agirlikliKanjiSec(havuz, haric) {
  const uygun = havuz.filter(d => !haric.has(d.kanji.k));
  if (!uygun.length) return null;
  const toplam = uygun.reduce((t, d) => t + serpistirmeAgirligi(d), 0);
  let r = Math.random() * toplam;
  for (const d of uygun) {
    r -= serpistirmeAgirligi(d);
    if (r <= 0) return d.kanji;
  }
  return uygun[uygun.length - 1].kanji;
}

/**
 * Ağırlıklı rastgele bir KANJİLİ CÜMLE seç.
 *
 * KURAL: Cümlenin TÜM kanjileri öğrenilmiş olmalı.
 * Bu özellikle korunuyor: öğrenci henüz öğretilmemiş bir karakteri cümle içinde
 * görüp tahmin etmek zorunda kalmamalı. Cümlede uygun kanji yoksa üretici
 * kana cümlesine düşer; ders yine cümle ağırlıklı kalır.
 */
function agirlikliCumleSec(ogrenilenler, kullanilan) {
  const set = new Set(ogrenilenler.map(k => k.k));
  const ESIK = 1; // bilinmeyen kanji cümleye giremez

  const uygun = kanjiCumleleri().filter(c => {
    if (kullanilan.has(c.ja)) return false;
    const bilinen = c.kanjiler.filter(k => set.has(k)).length;
    return bilinen / c.kanjiler.length >= ESIK;
  });
  if (!uygun.length) return null;
  // Daha çok kanjisi bilinen cümle öne çıksın (kolaydan zora).
  uygun.sort((a, b) => {
    const oa = a.kanjiler.filter(k => set.has(k)).length / a.kanjiler.length;
    const ob = b.kanjiler.filter(k => set.has(k)).length / b.kanjiler.length;
    return ob - oa;
  });
  // En iyi %40'lık dilimden rastgele seç (hep aynı kolay cümle gelmesin).
  const dilim = uygun.slice(0, Math.max(1, Math.ceil(uygun.length * 0.4)));
  return dilim[Math.floor(Math.random() * dilim.length)];
}

/**
 * KARIŞIK DERS ÜRETİCİ.
 * Adım dağılımı (yaklaşık):
 *   • %50-60 cümle/keli·me çevirisi (kanjili cümle varsa ondan, yoksa kana cümlesinden)
 *   • %35 kanji sorusu (ağırlıklı rastgele serpiştirme; anlam/okunuş/ters yön karışık)
 *   • %10 kanji öğretim kartı (öğrenilenlerden hatırlatma)
 * "Her adımda kanji yok" kuralı: aşağıdaki ihtimaller rastgele tutar.
 */
/**
 * İki listeyi SERPİŞTİR: kanji adımlarını cümle adımlarının arasına DAĞIT.
 *
 * NEDEN AYRI FONKSİYON: "hepsini birleştirip karıştır" da yetersiz — rastgele
 * karıştırma bazen başta 4 kanji üst üste getir. Bunun yerine kanji adımlarını
 * ders boyunca EŞİT ARALIKLARLA yerleştiriz, aralarına rastgele sapma ekleriz.
 * Sonuç: kanji "her yerde" değil ama "her yere dağılmış" olur.
 *
 * Örnek (3 kanji, 9 cümle):
 *   c K c K c K c     <- eşit aralık + sapma
 */
function serpistir(cumleler, kanjiler) {
  const toplam = cumleler.length + kanjiler.length;
  if (!kanjiler.length) return karistir(cumleler);
  if (!cumleler.length) return karistir(kanjiler);

  const yerlesim = new Array(toplam).fill(null);

  // Kanji için hedef konumlar: ders boyunca eşit dağıt
  const adim = toplam / kanjiler.length;
  kanjiler.forEach((k, i) => {
    // Hedef orta nokta + küçük rastgele sapma (blok oluşmasın)
    let yer = Math.round(i * adim + adim / 2 - 0.5 + (Math.random() * 1.2 - 0.6));
    yer = Math.max(0, Math.min(toplam - 1, yer));
    // Doluysa en yakın boş yeri bul
    let kaydir = 0;
    while (yerlesim[yer] !== null && kaydir < toplam) {
      kaydir++;
      yer = (yer + 1) % toplam;
      if (yerlesim[yer] === null) break;
    }
    yerlesim[yer] = k;
  });

  // Kalan boşlukları karıştırılmış cümlelerle doldur
  const kalanCumle = karistir(cumleler);
  for (let i = 0; i < toplam; i++) {
    if (yerlesim[i] === null) yerlesim[i] = kalanCumle.pop() || null;
  }
  return yerlesim.filter(x => x !== null);
}

function karisikDersi(item) {
  const durumlar = kanjiDurumlari();
  const ogrenilenler = durumlar.map(d => d.kanji);
  const soruSayisi = item.soru || 12;

  // Hiç kanji öğrenilmemişse karışık ders anlamsız: null dön (müfredat kana dersine düşer).
  if (!ogrenilenler.length) return null;

  // === HEDEF ORAN ===
  // Ders "cümle/kelime çevirisi ağırlıklı" olmalı, kanji ARAYA serpişmeli.
  // %35 kanji hedefi: her adımda değil, ama düzenli aralıklarla denk gelir.
  const kanjiHedef = Math.max(1, Math.round(soruSayisi * 0.35));
  const cumleHedef = soruSayisi - kanjiHedef;

  const kullanilanCumle = new Set();
  const kullanilanKanji = new Set();

  // --- 1) Cümle adımlarını üret ---
  const cumleAdimlari = [];
  let deneme = 0;
  while (cumleAdimlari.length < cumleHedef && deneme < cumleHedef * 6) {
    deneme++;
    // Önce kanjili cümle (gerçek okuma pratiği), yoksa kana cümlesi.
    const kc = agirlikliCumleSec(ogrenilenler, kullanilanCumle);
    if (kc) {
      kullanilanCumle.add(kc.ja);
      cumleAdimlari.push(kanjiliCumleSorusu(kc));
      continue;
    }
    const kana = kanaCumleSorusu(kullanilanCumle);
    if (kana) { cumleAdimlari.push(kana); continue; }
    break;
  }

  // --- 2) Kanji adımlarını üret (ağırlıklı rastgele) ---
  const kanjiAdimlari = [];
  deneme = 0;
  while (kanjiAdimlari.length < kanjiHedef && deneme < kanjiHedef * 6) {
    deneme++;
    const k = agirlikliKanjiSec(durumlar, kullanilanKanji);
    if (!k) break;
    kullanilanKanji.add(k.k);
    const tip = Math.random();
    if (tip < 0.45) kanjiAdimlari.push(sorKanjiAnlam(k));
    else if (tip < 0.75) kanjiAdimlari.push(sorKanjiOkunus(k));
    else kanjiAdimlari.push(sorKanjiEsles(k, ogrenilenler));
  }

  // --- 3) SERPİŞTİR ---
  // ÖNEMLİ: Adımlar ayrı ayrı üretilip sonra KARIŞTIRILIR. Eskiden döngü
  // içinde sırayla ekleniyordu; sonuç "6 cümle + 6 kanji" gibi BLOK oluyordu,
  // serpiştirme değil. Karıştırınca kanji gerçekten araya dağılır.
  const adimlar = serpistir(cumleAdimlari, kanjiAdimlari);

  if (!adimlar.length) return null;

  return {
    baslik: item.baslik,
    xp: item.xp || 80,
    can: item.can || 4,
    adimlar: adimlar
  };
}

/**
 * KANA CÜMLESİNDEN SORU (reading.js). Kanjili cümle tükendiğinde kullanılır.
 * Böylece karışık ders "cümle/kelime çevirisi ağırlıklı" kalır ve her adımda
 * kanji sorusu çıkmaz.
 * READING her zaman yüklü olmayabilir; yoksa null döner.
 */
function kanaCumleSorusu(kullanilan) {
  let havuz = [];
  try {
    // reading.js API'si window.READING olarak dışa açılıyor. `const READING`
    // gibi dosya kapsamındaki ada güvenme; klasik script/test bağlamında görünmeyebilir.
    if (window.READING && window.READING.CUMLELER) havuz = window.READING.CUMLELER;
  } catch (e) { }
  if (!havuz.length) return null;
  const uygun = havuz.filter(c => !kullanilan.has(c.ja));
  if (!uygun.length) return null;
  const c = uygun[Math.floor(Math.random() * uygun.length)];
  kullanilan.add(c.ja);

  // Şıklar diğer cümlelerin Türkçelerinden
  const digerleri = havuz.filter(x => x.tr !== c.tr).map(x => x.tr);
  const secilen = [];
  const gorulen = new Set([c.tr]);
  while (secilen.length < 3 && digerleri.length) {
    const i = Math.floor(Math.random() * digerleri.length);
    const a = digerleri.splice(i, 1)[0];
    if (!gorulen.has(a)) { gorulen.add(a); secilen.push(a); }
  }
  return {
    tip: 'cumle',
    cumle: { ja: c.ja, ro: c.ro, tr: c.tr },
    soru: 'Bu cümlenin anlamı hangisi?',
    dogru: c.tr,
    siklar: karistir([c.tr].concat(secilen))
  };
}

/** Kanjili cümleden soru üret.
 *  app.js 'kelime' tipini çizer; ama cümle kartı göstermek için 'cumle' tipini
 *  kullanıyoruz: cumle={ja,ro,tr}. Böylece kelimelere tıklanabilir kart çıkar. */
function kanjiliCumleSorusu(c) {
  // Şıklar diğer kanjili cümlelerin Türkçelerinden
  const digerleri = kanjiCumleleri().filter(x => x.tr !== c.tr).map(x => x.tr);
  const secilen = [];
  const gorulen = new Set([c.tr]);
  while (secilen.length < 3 && digerleri.length) {
    const i = Math.floor(Math.random() * digerleri.length);
    const a = digerleri.splice(i, 1)[0];
    if (!gorulen.has(a)) { gorulen.add(a); secilen.push(a); }
  }
  return {
    tip: 'cumle',
    kanjiliCumle: c.kanjiler,          // cevap verildiğinde bu kanjiler kaydedilir
    cumle: { ja: c.ja, ro: c.ro, tr: c.tr },
    soru: 'Bu cümlenin anlamı hangisi?',
    dogru: c.tr,
    siklar: karistir([c.tr].concat(secilen))
  };
}

// ---------- VERİ DOĞRULAMA ----------
// reading.js'teki dogrula() ile aynı mantık: hatalı veri sessizce geçmesin.
function dogrula(sessiz) {
  const hatalar = [];

  KANJILER.forEach(k => {
    if (!k.k || !k.tr) hatalar.push('Eksik alanlı kanji: ' + JSON.stringify(k));
    if (k.k && k.k.length !== 1) hatalar.push('Kanji tek karakter olmalı: "' + k.k + '"');
    if (!k.grup) hatalar.push('Grubu olmayan kanji: ' + k.k);
    if (!k.kun && !k.on) hatalar.push('Hiç okunuşu olmayan kanji: ' + k.k);
  });

  // Aynı kanji iki kez mi?
  const sayim = {};
  KANJILER.forEach(k => { sayim[k.k] = (sayim[k.k] || 0) + 1; });
  Object.keys(sayim).forEach(k => {
    if (sayim[k] > 1) hatalar.push('Tekrarlanan kanji (' + sayim[k] + ' kez): ' + k);
  });

  // Anlamlar tek anlamlı mı? (şıklarda çakışma olmasın)
  const anlamSayim = {};
  KANJILER.forEach(k => { anlamSayim[k.tr] = (anlamSayim[k.tr] || 0) + 1; });
  Object.keys(anlamSayim).forEach(a => {
    if (anlamSayim[a] > 1) hatalar.push('Aynı Türkçe anlam birden çok kanjide (' + anlamSayim[a] + ' kez): ' + a);
  });

  // Müfredatta olmayan grup adı var mı?
  const gruplar = new Set(KANJILER.map(k => k.grup));
  gruplar.forEach(g => { if (!g) hatalar.push('Boş grup adı var'); });

  if (!sessiz) {
    if (hatalar.length) {
      console.warn('[kanji.js] ' + hatalar.length + ' veri uyarısı:');
      hatalar.forEach(h => console.warn('  • ' + h));
    } else {
      console.info('[kanji.js] Kanji verisi tutarlı: ' + KANJILER.length + ' kanji, '
        + gruplar.size + ' grup.');
    }
  }
  return hatalar;
}

// app.js bu API'yi kullanır (reading.js ile aynı sözleşme).
// dersUret: müfredattaki daireye göre doğru üreticiyi seçer.
//   tip 'kanji'   -> kanjiDersi   (öğret + anlam + okunuş + ters yön)
//   tip 'karisik' -> karisikDersi (cümle ağırlıklı + ağırlıklı kanji serpiştirme)
window.KANJI = {
  KANJILER: KANJILER,
  dogrula: dogrula,
  grupKanjileri: grupKanjileri,
  okunusMetni: okunusMetni,
  kanjiDersi: kanjiDersi,
  karisikDersi: karisikDersi,
  dersUret: function (item) {
    if (item.tip === 'karisik') return karisikDersi(item);
    return kanjiDersi(item);
  },
  // İlerleme takibi (app.js cevap verildiğinde çağır)
  ogretildi: kanjiOgretildi,
  cevap: kanjiCevap,
  ogrenilenler: ogrenilenKanjiler,
  durumlar: kanjiDurumlari,
  // Geliştirme / test kolaylığı
  _konusmeKir: function () { try { localStorage.removeItem(KANJI_ANAHTAR); } catch (e) { } }
};

// Açılışta veriyi bir kez kontrol et (konsolda uyarı çıkar; oyunu etkilemez).
try { dogrula(); } catch (e) { }
