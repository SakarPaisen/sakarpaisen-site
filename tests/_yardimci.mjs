// Testlerin ortak yardımcıları.
//
// ÖNEMLİ: Projede kütüphaneler `const Ses = (...)()` biçiminde tanımlı.
// Klasik script'te const ile tanımlı bir global `window.X` olarak GÖRÜNMEZ.
// Bu yüzden testlerde `window.Ilerleme` diye bakmak YANILTICIDIR:
// değer orada olsa bile undefined görünür. Bunun yerine:
//   - Sayfadaki GÖRÜNEN davranışa bak (metin, buton, sınıf)
//   - localStorage'ı oku (kalıcı veriler orada)
//   - Gerekiyorsa evaluateEval() ile dosya kapsamındaki isme eriş

/** Kayıt yaz (dojo/oyun sayfaları kayıt olmadan index.html'e atar). */
export async function kayitYaz(page, { isim = 'Test Kullanıcı', seviye = 1, xp = 0, bilgi = 'yok' } = {}) {
  await page.goto('/index.html');
  await page.evaluate(([i, s, x, b]) => {
    localStorage.setItem('sakar_isim', i);
    localStorage.setItem('sakar_seviye', String(s));
    localStorage.setItem('sakar_xp', String(x));
    localStorage.setItem('sakar_bilgi', b);
  }, [isim, seviye, xp, bilgi]);
}

/** localStorage'daki tüm oyun kaydını temizle. */
export async function kayitTemizle(page) {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
}

/**
 * Hero aşamasını geç: index.html artık tek BAŞLA butonuyla açılıyor
 * (body.hero-asamasi). Giriş paneli ancak #heroBtn'e basınca görünür.
 * Hero yoksa (kayıtlı kullanıcı) hiçbir şey yapmaz.
 */
export async function heroGec(page) {
  const btn = page.locator('#heroBtn');
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(300);
  }
}

/** Dojo haritasını aç (kayıt gerektir). */
export async function dojoAc(page) {
  await page.goto('/dojo.html');
  await page.waitForSelector('.ust-menu', { timeout: 20000 });
}

/** Dersi aç ve şık içeren bir soruya kadar ilerle. */
export async function sikSorusunaGel(page, dersID = 1, enFazlaAdim = 14) {
  await page.goto('/oyun.html?ders=' + dersID);
  await page.waitForSelector('#sahne', { timeout: 20000 });
  for (let i = 0; i < enFazlaAdim; i++) {
    if (await page.locator('.secenek').count() > 0) return true;
    const btn = page.locator('#devamBtn');
    if (await btn.isVisible()) { await btn.click(); await page.waitForTimeout(350); }
    else await page.waitForTimeout(300);
  }
  return await page.locator('.secenek').count() > 0;
}

/** Sahnedeki soru tipi (app.js data-soru-tipi yazar). */
export function soruTipi(page) {
  return page.evaluate(() => document.getElementById('sahne').dataset.soruTipi);
}

/** DEVAM ET butonun görünür ve ekranın İÇİNDE olduğunu doğrula. */
export async function devamButonuEkrandaMi(page) {
  return page.evaluate(() => {
    const b = document.getElementById('devamBtn');
    if (getComputedStyle(b).display === 'none') return { gorunur: false, ekranda: false };
    const r = b.getBoundingClientRect();
    return {
      gorunur: true,
      ekranda: r.top >= 0 && r.bottom <= window.innerHeight && r.height > 0,
      ust: Math.round(r.top), alt: Math.round(r.bottom), ekran: window.innerHeight
    };
  });
}

/**
 * Sayfadaki tüm script'leri yükle: konsol hatası ve başarısız istek topla.
 * yayin.spec.mjs bunu her sayfa için kullanır.
 */
export function hataToplayici(page) {
  const hatalar = [];
  const istekHatalari = [];
  page.on('console', m => {
    if (m.type() === 'error') hatalar.push(m.text().slice(0, 180));
  });
  page.on('pageerror', e => hatalar.push('SAYFAHATASI: ' + e.message));
  page.on('requestfailed', r => istekHatalari.push('BAŞARISIZ: ' + r.url()));
  page.on('response', r => {
    const kod = r.status();
    if (kod >= 400) istekHatalari.push(`${kod} ${r.url()}`);
  });
  // Bilinen ve zararsız olanlar:
  //  - Google'ın popup mekanizması uyarıları
  //  - Supabase: bulut kayıt KASITLI dış istektir; yerel testte (localhost)
  //    ağ kısıtı / offline olması sayfa hatası değildir. bulut.js zaten
  //    .catch() ile sessizce yutar ve oyun çalışmaya devam eder.
  //  - Reklam ağı: AdSense yerelde kasıtlı kapalı (bkz. reklam.js).
  const zararsiz = [/Cross-Origin-Opener-Policy/i, /accounts\.google\.com/i];
  const zararsizIstek = [
    /accounts\.google\.com/,
    /supabase\.co/,
    /cloudflareinsights\.com/,
    /googlesyndication\.com/,
    /doubleclick\.net/
  ];
  return {
    hatalar: () => hatalar.filter(h => !zararsiz.some(z => z.test(h))),
    istekler: () => istekHatalari.filter(h => !zararsizIstek.some(z => z.test(h))),
    tumu: () => ({ hatalar: hatalar.slice(), istekler: istekHatalari.slice() })
  };
}
