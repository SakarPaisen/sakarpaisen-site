// kelime.html — kalan EMOJİ satırlarını onar (geçici araç).
// Bu satırlarda emoji kaybolmuş; bağlamdan hangi emoji olduğu biliniyor.
import { readFileSync, writeFileSync } from 'node:fs';

const ad = 'kelime.html';
let icerik = readFileSync(ad, 'utf8');

// Bulunacak bozuk parça -> olması gereken doğru metin
// Bozukluk, emojinin UTF-8 baytlarının Latin1 karakterlere dönüşmesidir.
const DEGISIMLER = [
  // Kartlarla çalış başlığı (emojili)
  [/Kartlarla .{1,4}al.{1,4}/, 'Kartlarla çalış'],
  // "Kartlarla çalış" başlığındaki bozuk emoji -> 🎴
  [/(<div class="ts-baslik" style="color: var\(--mor\);">).{1,8}(Kartlarla)/, '$1🎴 $2'],
  // Eşleşen kelime yok simgesi -> 🔍
  [/(el\('div', 'simge', ').{1,8}('\), el\('h3', '', ')E.{1,6}le.{1,6}en( kelime yok)/, "$1🔍$2Eşleşen$3"],
  // Cümle içinde başlığı -> 📝
  [/(el\('div', 'kd-bolum-baslik', ').{1,8}(C.{1,4}mle i.{1,4}inde')/, '$1📝 Cümle içinde\''],
  // Tekrar zamanı / Kelimeleri pekiştir -> 🔥 / 🎴
  [/zor\.length >= 4 \? '.{1,8}(Tekrar zaman.{1,4})' : '.{1,8}(Kelimeleri peki.{1,6}tir)'/,
    "zor.length >= 4 ? '🔥 Tekrar zamanı' : '🎴 Kelimeleri pekiştir'"],
  // ck-son-simge -> 🏆 / 🌸
  [/oran >= 80 \? '.{1,6}' : '.{1,6}'\)/, "oran >= 80 ? '🏆' : '🌸')"]
];

let sayi = 0;
for (const [kalip, yeni] of DEGISIMLER) {
  const once = icerik;
  icerik = icerik.replace(kalip, yeni);
  if (icerik !== once) { sayi++; console.log('✓ değişti: ' + kalip); }
  else console.log('✗ eşleşmedi: ' + kalip);
}

writeFileSync(ad, icerik, 'utf8');
console.log('\n' + sayi + ' değişiklik uygulandı.');

// Kalan bozuk var mı?
const kalan = (icerik.match(/ğŸ|â€|ï¸|Ã¼|Ã¶|ÅŸ|Ä±/g) || []).length;
console.log('Kalan bozuk dizi sayısı: ' + kalan);
