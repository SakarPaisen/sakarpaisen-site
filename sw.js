// Service worker: uygulamayı offline çalıştırır.
//  - Kod (html/js/json): önce ağ, olmazsa önbellek  -> güncellemeler hemen gelir
//  - Resim / ikon: önce önbellek                    -> hızlı ve offline
// Kod değiştirince CACHE_NAME'i arttırman şart değil (kod ağdan alınır), ama yeni dosya
// eklersen ya da eskileri temizlemek istersen arttır.
const CACHE_NAME = 'sakar-paisen-v56';

// HARF RESİMLERİ
// ÖNEMLİ: Eskiden `importScripts('kana.js')` ile harf listesi alınıyordu.
// Bu, service worker'ı KİLİTLİYORDU: kana.js artık `READING` (sözlük) ve
// `Ilerleme` gibi sayfa global'lerine erişiyor; service worker bağlamında
// bunlar YOK → importScripts hata veriyor → SW kurulumu tamamlanmıyor →
// sayfa yüklemesi 26 saniyeye çıkıyor ve dojo haritası hiç çizilmiyordu.
//
// ÇÖZÜM: Resim yollarını burada, kana.js'e bağımlı olmadan üret.
// Romaji listesi harf tablosuyla aynıdır (Hiragana ve Katakana aynı romaji).
const ROMAJILER = [
  'a','i','u','e','o',
  'ka','ki','ku','ke','ko', 'sa','shi','su','se','so',
  'ta','chi','tsu','te','to', 'na','ni','nu','ne','no',
  'ha','hi','fu','he','ho', 'ma','mi','mu','me','mo',
  'ya','yu','yo', 'ra','ri','ru','re','ro', 'wa','wo','n',
  // dakuten / handakuten
  'ga','gi','gu','ge','go', 'za','ji','zu','ze','zo',
  'da','de','do', 'ba','bi','bu','be','bo', 'pa','pi','pu','pe','po',
  // youon
  'kya','kyu','kyo', 'sha','shu','sho', 'cha','chu','cho',
  'nya','nyu','nyo', 'hya','hyu','hyo', 'mya','myu','myo',
  'rya','ryu','ryo', 'gya','gyu','gyo', 'ja','ju','jo',
  'bya','byu','byo', 'pya','pyu','pyo'
];
const RESIMLER = [];
ROMAJILER.forEach(function (r) {
  RESIMLER.push('alfabe/hiragana/' + r + '.webp');
  RESIMLER.push('alfabe/katakana/' + r + '.webp');
});

// ÖNBELLEEK LİSTESİ — SADECE offline için gerçekten gerekli olanlar.
// ÖNEMLİ: Bu liste uzadıkça service worker kurulumu yavaşlar ve sayfa açılışı
// gecikir. (Eskiden 23 dosya vardı; yükleme 18 saniyeye çıkıyordu.)
// Kural: HTML iskeleti + CSS burada; JS dosyaları ağdan gelir ve
// ziyaret edildikçe önbelleğe girer (network-first zaten).
const KABUK = [
  './', 'index.html', 'dojo.html', 'oyun.html', 'kelime.html',
  'ayarlar.html', 'istatistik.html', 'sozluk.html', 'dinleme.html',
  'yazma.html', 'birlestirme.html', 'kanji.html', 'cumle.html', 'alanlar.html', 'video.html',
  'uygulama.css', 'dojo.css',
  'kombo.js', 'hediye.js', 'gorevler.js', 'basarimlar.js', 'ogut.js', 'serit.js',
  'yanlis.js', 'sinav.js', 'plan.js', 'sozluk.js', 'dinleme.js',
  'yazma.js', 'birlestirme.js', 'kanji-calisma.js', 'cumle.js', 'alanlar.js', 'video.js', 'video-sayfa.js',
  // guncelleme.js: "yeni sürüm hazır" bildirimi. Offline'da da gereksiz ama
  // çekirdek davranış olduğu için kabukta tutuluyor.
  'guncelleme.js',
  // sahne3d.js: 3D arka plan. DEKORATIF ama offline'da da görünsün;
  // ayrıca her sayfa bunu yüklediği için ilk açılışta bir 404 gecikmesi olmasın.
  'sahne3d.js',
  // video-arkaplan.js: arka planda videoyu oynatır, yoksa sessizce vazgeçer.
  // Giriş ekranı (index) DIŞINDAKİ sayfalar da artık bunu yükler (dojo,
  // kanji, yazma, sözlük...), böylece "ders dışı" ekranlarda da video
  // arka plan görünür. NOT: Video dosyalarının KENDİSİ bu listeye eklenmedi — birkaç MB'lık
  // medya; ön belleğe almak kurulumu yavaşlatır. Video ağdan gelir, çevrimdışı
  // olduğunda zaten WebGL sahnesi görünür kalır (o listede).
  'video-arkaplan.js',
  // Not: analitik.js ve bulut.js kasıtlı olarak listede DEĞİL.
  // İkisi de "network-first" yoluyla normal şekilde önbelleğe girer;
  // kurulumu uzatmamak için KABUK listesini kısa tutuyoruz.
  'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    // Yeni sürüm BEKLEMEDEN devreye girsin.
    // ÖNEMLİ: skipWaiting olmadan eski SW, tüm sekmeler kapanana kadar aktif
    // kalır; bu projede eski SW yüzünden sayfa 26 saniyede açılıyordu.
    self.skipWaiting();
    const cache = await caches.open(CACHE_NAME);
    // ÖNEMLİ: cache.addAll tek bir dosya 404 verirse TÜM kurulumu iptal eder ve
    // service worker hiç kurulmaz. Bu yüzden dosyaları tek, hata affederek ekle.
    // İskelet hemen kurulsun; harf resimleri arka planda eklensin (kurulumu beklemesin).
    await Promise.allSettled(KABUK.map(u => cache.add(u)));
    self.skipWaiting();
    // Resimleri arka planda, kurulumu engellemeden önbelleğe al
    Promise.allSettled(RESIMLER.map(u => cache.add(u)));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const isimler = await caches.keys();
    await Promise.all(isimler.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)));
    await self.clients.claim();

    // Yeni sürüm devreye girdiğinde açık sayfaları haberdar et.
    // (pwa.js bunu görünce "yeni sürüm hazır" diyebilir veya yeniler.)
    const istemciler = await self.clients.matchAll({ type: 'window' });
    istemciler.forEach(c => c.postMessage({ tip: 'sw-guncellendi', surum: CACHE_NAME }));

    // Yeni sürümde önbelleğe alınan HTML güncellensin diye açık sayfaları yenile.
    // Başka bir sekmede kalınan site, yeni sürümden sonra ağdan güncel HTML'i
    // almadığı için eski <meta name="google-site-verification"> etiketiyle
    // kalabiliyordu. Sekme yenilenince HTML ağdan gelir ve etiket güncellenir.
    // Yalnızca zaten açık olan sekmeler yenilenir (yeni ziyaretçi etkilenmez).
    istemciler.forEach(c => { try { c.navigate(c.url); } catch (e) {} });
  })());
});

// Sayfadan gelen istekler: güncellemeyi zorla, önbelleği temizle vb.
self.addEventListener('message', event => {
  const veri = event.data || {};
  if (veri.tip === 'guncelle') {
    // Bekleyen yeni sürümü hemen devreye al
    self.skipWaiting();
  } else if (veri.tip === 'temizle') {
    event.waitUntil((async () => {
      const isimler = await caches.keys();
      await Promise.all(isimler.map(n => caches.delete(n)));
    })());
  } else if (veri.tip === 'surum') {
    // Sayfa sürümü sordu: cevapla (hata raporunda görünsün)
    if (event.source) event.source.postMessage({ tip: 'surum-cevap', surum: CACHE_NAME });
  }
});

const VARLIK = /\/(alfabe|images|icons)\//;

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (VARLIK.test(url.pathname)) {   // cache-first (sadece resimler/ikonlar)
    event.respondWith((async () => {
      // Sürüm sorgusunu (?v=2) yok say: aynı dosyanın farklı sürümleri
      // önbellekte ayrı kayıt olmasın.
      const c = await caches.match(url.pathname);
      if (c) return c;
      const r = await fetch(req);
      if (r.ok) { const cache = await caches.open(CACHE_NAME); cache.put(url.pathname, r.clone()); }
      return r;
    })());
    return;
  }

  event.respondWith((async () => {                // network-first
    try {
      const r = await fetch(req);
      if (r.ok) { const cache = await caches.open(CACHE_NAME); cache.put(req, r.clone()); }
      return r;
    } catch (e) {
      const c = await caches.match(req, { ignoreSearch: true });
      if (c) return c;
      // ÖNEMLİ: Buraya "navigasyon ise index.html ver" fallback'i KOYMA.
      // Eskiden konuyordu ve şuna yol açıyordu: kullanıcı oyun.html/dojo.html
      // isterken ağ başarısız olunca index.html (giriş ekranı) dönüyordu.
      // Sonuç: ders hiç açılmıyor, adres oyun.html ama içerik giriş sayfası.
      // Bunun yerine: offline'da o sayfanın kendi önbelleği yoksa
      // tarayıcının normal hata sayfasına bırak (yanlış sayfa gösterme).
      throw e;
    }
  })());
});
