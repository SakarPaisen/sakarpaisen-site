// GEÇİCİ: sürüm artır + kodlama doğrula (Node, BOM eklemez)
import { readFileSync, writeFileSync } from 'node:fs';

const DOSYALAR = ['index.html', 'kelime.html', 'dojo.html', 'oyun.html',
  'ayarlar.html', 'istatistik.html', 'sozluk.html', 'dinleme.html'];

const DEGISIM = [
  [/uygulama\.css\?v=10/g, 'uygulama.css?v=11'],
  [/app\.js\?v=23/g, 'app.js?v=24']
];

console.log('SÜRÜM ARTIRMA + KODLAMA DOĞRULAMASI');
console.log('='.repeat(68));

for (const ad of DOSYALAR) {
  let c;
  try { c = readFileSync(ad, 'utf8'); } catch (e) { continue; }
  let y = c;
  for (const [k, v] of DEGISIM) y = y.replace(k, v);
  const degisti = y !== c;
  if (degisti) writeFileSync(ad, y, 'utf8');

  const bayt = readFileSync(ad);
  const bom = bayt[0] === 0xEF && bayt[1] === 0xBB && bayt[2] === 0xBF;
  const son = readFileSync(ad, 'utf8');
  const bozuk = (son.match(/Ã|Ä±|ÅŸ|â€|ğŸ/g) || []).length;
  const turkce = (son.match(/[ğüşıöçĞÜŞİÖÇ]/g) || []).length;
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(son);

  console.log(
    ad.padEnd(17) + (degisti ? ' guncellendi' : ' degisiklik yok') +
    ' | BOM=' + bom + ' | bozuk=' + bozuk +
    ' | turkce=' + turkce + ' | emoji=' + emoji +
    ' | ' + ((bom || bozuk > 0) ? 'SORUN!' : 'temiz')
  );
}
console.log('='.repeat(68));