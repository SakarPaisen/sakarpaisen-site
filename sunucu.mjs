// Basit yerel statik sunucu (Node.js) — Sakar Paisen testleri için.
//
// NEDEN VAR: `sunucu.ps1` (System.Net.HttpListener) tek iş parçacıklı çalışır ve
// Playwright arka arkaya hızlı istek atınca kilitlenip düşüyordu; sonuç olarak
// 38 testin 37'si "ERR_CONNECTION_REFUSED" ile başarısız görünüyordu.
// Node sunucusu olay döngüsü (event loop) ile eşzamanlı istekleri sorunsuz karşılar.
//
// Kullanım:
//     node sunucu.mjs              # port 8000
//     node sunucu.mjs 3000         # farklı port
//
// Not: `sunucu.ps1` yedek olarak duruyor; Node kuruluysa bunu kullan.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = resolve(fileURLToPath(new URL('.', import.meta.url)));
const PORT = Number(process.argv[2] || process.env.PORT || 8000);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8'
};

const sunucu = createServer(async (req, res) => {
  // Sorgu dizesini at, yolu dosya yoluna çevir.
  let rel;
  try {
    const istekYolu = decodeURIComponent((req.url || '/').split('?')[0]);
    rel = istekYolu.replace(/^\/+/, '');
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Gecersiz URL');
    return;
  }
  if (rel === '') rel = 'index.html';

  // DİKKAT: Kök dışına çıkan yolları (../../) engelle.
  // Ayraç eklemek, kök adıyla başlayan kardeş klasörleri de dışarıda bırakır.
  const tam = resolve(KOK, normalize(rel));
  const kokSiniri = KOK.endsWith('\\') ? KOK : KOK + '\\';
  if (tam !== KOK && !tam.startsWith(kokSiniri)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Yasak yol: ' + rel);
    return;
  }

  // ÖNEMLİ: GELİŞTİRME SUNUCUSUNDA SERVICE WORKER TAMAMEN KAPALI.
  //
  // NEDEN: Bu sunucu yerel geliştirme/test için kullanılıyor. Testler ve QA
  // tarayıcı oturumları aynı kalıcı profili (ör. ~/.codegpt/ab-sessions/...)
  // paylaştığı için sw.js'in önbelleği ORTAMLAR ARASINDA TAŞINIYOR.
  // Gerçek olay: diskte
  //   Service Worker/CacheStorage/.../<kayit>  ->  http://localhost:8000/oyun.html
  // kaydı bulundu; profil başka bir portta (8321) çalışırken tarayıcı bu
  // önbelleği o port için de kullandı ve oyun.html isteğine sıfırlanmış
  // giriş sayfası döndü. Sonuç: app.js çalışıyor, ama beklediği #sahne
  // bulunmadığı için sessizce duruyordu ve ders hiç açılmıyordu.
  // 'no-store' başlığı bunu ENGELLEMEZ: service worker önbelleği ayrı bir
  // katmandır ve fetch'i başlıklardan önce karşılar.
  //
  // ÇÖZÜM: sw.js'i hiç servis etme (404). Kayıtlı bir SW olsa bile güncelleme
  // isteği başarısız olur; SW'nin fetch yolu tarayıcıya değil önbelleğe baktığı
  // için sayfa BOZULMAZ, sadece önbellek devreden çıkar. Canlı sitede
  // (gerçek alan adı) service worker etkilenmez, orada sw.js normal servis edilir.
  const swIstegi = rel === 'sw.js';

  try {
    if (swIstegi) throw new Error('service worker gelistirmede kapali');
    const bilgi = await stat(tam);
    if (!bilgi.isFile()) throw new Error('dosya degil');
    const govde = await readFile(tam);
    const tur = MIME[extname(tam).toLowerCase()] || 'application/octet-stream';
    // Önbellekleme kapalı. 'no-store' service worker önbelleğini kapsamaz;
    // asıl koruma yukarıdaki 'sw.js hiç servis edilmez' kuralıdır.
    res.writeHead(200, {
      'Content-Type': tur,
      'Content-Length': govde.length,
      'Cache-Control': 'no-store'
    });
    res.end(govde);
  } catch {
    // ÖNEMLİ: "her isteğe index.html ver" fallback'i YOK.
    // Böyle bir fallback, oyun.html istendiğinde giriş ekranının servis
    // edilmesine ve dersin hiç açılmamasına yol açıyordu.
    const govde = Buffer.from(swIstegi
      ? 'sw.js gelistirme sunucusunda bilerek devre disi (bkz. sunucu.mjs)'
      : 'Bulunamadi: ' + rel, 'utf8');
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': govde.length });
    res.end(govde);
  }
});

sunucu.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} kullanimda. Baska port dene:  node sunucu.mjs 3001`);
  } else {
    console.error('Sunucu hatasi:', e.message);
  }
  process.exit(1);
});

sunucu.listen(PORT, () => {
  console.log(`Sunucu calisiyor: http://localhost:${PORT}/`);
  console.log('Durdurmak icin Ctrl+C.');
});
