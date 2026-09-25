// Geliştirme doğrulaması: kanji.js + kanji-cumle.js tutarlılığı ve
// karışık ders üreticisinin gerçekten çalışıp çalışmadığı.
// Kullanım:  node _veri-kontrol.mjs
import { readFileSync } from 'node:fs';

const baglam = {};
global.window = baglam;
global.localStorage = {
  _d: {},
  getItem(k) { return this._d[k] ?? null; },
  setItem(k, v) { this._d[k] = String(v); },
  removeItem(k) { delete this._d[k]; }
};

// ÖNEMLİ: Klasik script'ler (`const X = ...`) ayrı ayrı `eval` edilince
// bildirimler birbirini GÖRMEZ (her eval kendi kapsamı). Bu yüzden tüm
// dosyaları TEK eval içinde, sırayla çalıştırıyoruz.
const read = (f) => readFileSync(f, 'utf8');
let ortak = {};
global.ortak = ortak;
(0, eval)(
  read('reading.js') + '\n' +
  read('kanji-cumle.js') + '\n' +
  read('kanji.js') + '\n' +
  'global.ortak.KANJI = window.KANJI;' +
  'global.ortak.CUMLELER = window.KANJI_CUMLELER;'
);

const C = ortak.CUMLELER || [];
const K = ortak.KANJI;

// `node _veri-kontrol.mjs kanji-listesi` -> okunuş dökümü
// Sözlükle karşılaştırmak için: https://jisho.org/search/<kanji>
if (process.argv[2] === 'kanji-listesi') {
  const liste = K.KANJILER;
  console.log('KANJİ OKUNUŞ DÖKÜMÜ (' + liste.length + ' kanji)');
  console.log('');
  liste.forEach(k => {
    console.log(
      k.k + '  ' + k.tr.padEnd(20) +
      '  kun: ' + (k.kun || '—').padEnd(12) +
      '  on: ' + (k.on || '—').padEnd(11) +
      '  [' + k.grup + ']'
    );
  });
  console.log('');
  console.log('Toplam: ' + liste.length + ' kanji, ' + C.length + ' kanjili cümle');
  process.exit(0);
}

console.log('=== VERİ ===');
console.log('Kanjili cümle:', C.length);
console.log('Kanji:', K.KANJILER.length);
console.log('Kanji veri hatası:', K.dogrula(true).length);

// Kanjili cümlelerin kanjileri gerçekten öğretilen kanjiler arasında mı?
const tumKanji = new Set(K.KANJILER.map(x => x.k));
const eksik = [];
C.forEach(c => c.kanjiler.forEach(k => { if (!tumKanji.has(k)) eksik.push(k + ' (' + c.ja + ')'); }));
console.log('Cümlede geçip sözlükte olmayan kanji:', eksik.length ? eksik : 'yok');

// === KARIŞIK DERS TESTİ ===
console.log('\n=== KARIŞIK DERS ===');
// Önce kanji öğretilmemişken: karışık ders üretmemeli (null)
let d0 = K.karisikDersi({ baslik: 'Karışık', soru: 12 });
console.log('Kanji öğrenilmeden üretilen:', d0 === null ? 'null (doğru: kana dersine düşer)' : 'ADIM:' + d0.adimlar.length);

// Birkaç kanji öğretildi varsay
['一', '二', '三', '山', '川', '日', '月'].forEach(k => K.ogretildi({ k: k }));
console.log('Öğrenilen kanji sayısı:', K.ogrenilenler().length);

// Farklı öğrenme seviyelerinde dene: az kanji -> çok kanji
const senaryolar = [
  { ad: 'Az kanji', kanjiler: ['一', '二', '三', '山', '川'] },
  { ad: 'Orta', kanjiler: ['一', '二', '三', '四', '五', '山', '川', '田', '天', '空', '日', '月', '火', '水', '木'] },
  { ad: 'Çok', kanjiler: K.KANJILER.slice(0, 45).map(k => k.k) }
];

senaryolar.forEach(s => {
  K._konusmeKir();
  s.kanjiler.forEach(k => K.ogretildi({ k: k }));
  const ogr = K.ogrenilenler().length;

  let toplamAdim = 0, kanjiliAdim = 0, cumleAdim = 0;
  for (let i = 0; i < 12; i++) {
    const d = K.karisikDersi({ baslik: 'x', soru: 12 });
    toplamAdim += d.adimlar.length;
    kanjiliAdim += d.adimlar.filter(a => a.kanji && a.tip === 'kelime').length;
    cumleAdim += d.adimlar.filter(a => a.tip === 'cumle').length;
  }
  const kanjiOran = toplamAdim ? kanjiliAdim / toplamAdim : 0;
  console.log(`\n${s.ad} (öğrenilen kanji: ${ogr}, toplam ${toplamAdim} adım)`);
  console.log(`  cümle sorusu: ${cumleAdim} (%${(cumleAdim / toplamAdim * 100).toFixed(0)}) | kanji sorusu: ${kanjiliAdim} (%${(kanjiOran * 100).toFixed(0)})`);
  console.log(`  DURUM: ${kanjiOran < 0.55 ? 'UYGUN (cümle ağırlıklı, kanji serpişiyor)' : 'ÇOK FAZLA KANJI'}`);
});

// Tek ders örneği göster
K._konusmeKir();
K.KANJILER.slice(0, 25).forEach(k => K.ogretildi({ k: k.k }));
const ornek = K.karisikDersi({ baslik: 'Örnek', soru: 12 });
console.log('\n--- Örnek karışık ders adımları ---');
ornek.adimlar.forEach((a, i) => {
  let etiket = a.tip;
  if (a.kanji) etiket += '  [KANJI ' + a.kanji + ']';
  if (a.tip === 'cumle') etiket += '  [CÜMLE: ' + a.cumle.ja + ']';
  console.log(`  ${i + 1}. ${etiket}`);
});
