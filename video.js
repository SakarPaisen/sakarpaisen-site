// ============================================================
// VIDEO DERSLERİ (video.js)
//
// NE BURASI: Sakar Paisen'in kendi YouTube videolarının listesi.
// Yazılı dersleri videoyla destekler: bazı öğrenciler okumak yerine
// izleyip dinleyerek daha iyi öğrenir. Aynı içerik, farklı öğrenme biçimi.
//
// YENİ VİDEO EKLEMEK:
//   1) Aşağıdaki VIDEOLAR dizisine yeni bir kayıt ekle.
//   2) "id" alanına YouTube linkindeki kodu yaz:
//      https://youtu.be/Xv8jWQ2IeH0        -> id: 'Xv8jWQ2IeH0'
//      https://www.youtube.com/watch?v=ABC -> id: 'ABC'
//   3) "bolum" alanı hangi başlık altında görüneceğini belirler.
//      Yeni bölüm eklemek istersen BOLUMLAR dizisine de ekle.
//
// GÜVENLİK NOTU: Video gömme (iframe) yalnızca youtube-nocookie.com
// üzerinden yapılır ve video oynatılmadan önce hiçbir YouTube isteği
// gönderilmez (tıkla-oynat). Böylece sayfa ilk açılışta hiçbir dış
// istek yapmaz; çerez/izleme de olmaz.
// ============================================================

const VIDEOLAR = [
  {
    id: 'Xv8jWQ2IeH0',
    baslik: 'Temel Hiragana',
    aciklama: 'Hiragana\'nın tamamı: 46 harfin okunuşu ve yazımı. Sıfırdan başlayanlar için ilk video.',
    bolum: 'Alfabeler',
    sure: 'Temel',
    etiket: 'İlk adım',
    // Ders bağlantısı: videoyu izledikten sonra ilgili dersle pekiştir
    ders: { ad: 'Hiragana dersleri', url: 'dojo.html' }
  },
  {
    id: 'K5NbatfImx4',
    baslik: 'Temel Katakana',
    aciklama: 'Katakana\'nın tamamı: 46 harf. Yabancı kelimeleri yazmak için kullanılır.',
    bolum: 'Alfabeler',
    sure: 'Temel',
    etiket: 'Katakana',
    ders: { ad: 'Katakana dersleri', url: 'dojo.html' }
  }
];

// Kanal adresi: video sayfasındaki "Kanala git" düğmesi buraya bağlanır.
// Yeni video yayınlandığında burayı değiştirmen gerekmez; kanal listesi canlıdır.
const KANAL = {
  ad: 'SakarPaisen',
  url: 'https://www.youtube.com/@SakarPaisen',
  aboneUrl: 'https://www.youtube.com/@SakarPaisen?sub_confirmation=1'
};

// Bölüm sırası: videolar bu başlıklar altında gruplanır.
// VIDEOLAR içinde geçmeyen bir bölüm burada olsa bile gösterilmez (boş kalmasın).
const BOLUMLAR = [
  { ad: 'Alfabeler', simge: '🔤' },
  { ad: 'Kanji', simge: '🈶' },
  { ad: 'Dil Bilgisi', simge: '📐' },
  { ad: 'Günlük Konuşma', simge: '🗣️' },
  { ad: 'Kültür', simge: '🏯' }
];

// İleride çekilebilecek videolar için öneri listesi.
// Boş kalmaması için sayfada "hazırlanıyor" olarak gösterilir; okuyucuya
// "yakında ne var" bilgisi verir ve kanalın yönünü de belli eder.
const YAKINDA = [
  { baslik: 'Dakuten ve Handakuten', aciklama: 'が, ざ, だ, ば, ぱ — sesli harflerin türevleri', bolum: 'Alfabeler' },
  { baslik: 'Youon (küçük ya/yu/yo)', aciklama: 'きゃ, しゃ, ちゃ — birleşik sesler', bolum: 'Alfabeler' },
  { baslik: 'Japonca Cümle Kurma', aciklama: 'Yüklem sonda: わたし は がくせい です', bolum: 'Dil Bilgisi' },
  { baslik: 'İlk 50 Kanji', aciklama: 'N5 kanjilerine giriş: sayılar, günler, doğa', bolum: 'Kanji' },
  { baslik: 'Selamlaşma ve Günlük Kalıplar', aciklama: 'こんにちは, ありがとう, すみません', bolum: 'Günlük Konuşma' },
  { baslik: 'Japonca Sayılar ve Sayma', aciklama: 'いち, に, さん — ve sayaçlar', bolum: 'Dil Bilgisi' }
];

// YouTube video kimliğini linkten çıkar (kullanıcı link yapıştırırsa da çalışsın)
function videoKimligi(girdi) {
  if (!girdi) return '';
  const metin = String(girdi).trim();
  // Zaten yalnızca kimlik verilmişse
  if (/^[A-Za-z0-9_-]{11}$/.test(metin)) return metin;
  const kaliplar = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/
  ];
  for (const k of kaliplar) {
    const m = metin.match(k);
    if (m) return m[1];
  }
  return '';
}

// Veriyi kontrol et: eksik/geçersiz kimlik varsa konsola uyarı düşsün.
// (kanji.js ve reading.js'teki dogrula() ile aynı yaklaşım.)
function dogrula() {
  const gorulen = {};
  VIDEOLAR.forEach(v => {
    if (!videoKimligi(v.id)) {
      console.warn('[video] Geçersiz YouTube kimliği:', v.baslik, '->', v.id);
    }
    if (!v.baslik) console.warn('[video] Başlıksız video kaydı:', v);
    if (gorulen[v.id]) console.warn('[video] Aynı video iki kez eklenmiş:', v.baslik);
    gorulen[v.id] = true;
    const bolumVar = BOLUMLAR.some(b => b.ad === v.bolum);
    if (!bolumVar) console.warn('[video] Bilinmeyen bölüm (BOLUMLAR\'a ekle):', v.bolum);
  });
}

if (typeof window !== 'undefined') {
  window.VIDEO = {
    VIDEOLAR: VIDEOLAR,
    BOLUMLAR: BOLUMLAR,
    YAKINDA: YAKINDA,
    KANAL: KANAL,
    videoKimligi: videoKimligi,
    dogrula: dogrula
  };
}

try { dogrula(); } catch (e) { }