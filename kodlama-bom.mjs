// BOM TEMİZLİĞİ (geçici): dosya başındaki U+FEFF'i kaldır.
// Set-Content -Encoding UTF8 BOM eklemiş; BOM <meta charset="UTF-8"> ile
// çelişince tarayıcı sayfa başında bozuk karakter gösterebilir.
import { readFileSync, writeFileSync } from 'node:fs';

const dosyalar = ['kana.js', 'reading.js', 'kelime.html',
  'index.html', 'ayarlar.html', 'istatistik.html'];

for (const ad of dosyalar) {
  let icerik;
  try { icerik = readFileSync(ad, 'utf8'); } catch (e) { continue; }
  if (icerik.charCodeAt(0) === 0xFEFF) {
    writeFileSync(ad, icerik.slice(1), 'utf8');
    console.log('✅ BOM kaldırıldı: ' + ad);
  } else {
    console.log('   BOM yok: ' + ad);
  }
}
