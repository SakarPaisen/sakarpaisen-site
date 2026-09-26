// Geçici QA: kana.js tarayıcıda hangi durumda? (yükleniyor mu, hata mı veriyor)
import { test, expect } from '@playwright/test';

test('kana.js durumu', async ({ page }) => {
  const olaylar = [];
  page.on('console', m => olaylar.push('KONSOL[' + m.type() + ']: ' + m.text().slice(0, 200)));
  page.on('pageerror', e => olaylar.push('SAYFAHATASI: ' + e.message));
  page.on('response', r => {
    if (r.url().includes('kana.js') || r.url().includes('app.js')) {
      olaylar.push('YANIT ' + r.status() + ' ' + r.url().split('/').pop());
    }
  });

  await page.goto('/index.html');
  await page.evaluate(() => {
    localStorage.setItem('sakar_isim', 'QA Test');
    localStorage.setItem('sakar_seviye', '99');
  });
  await page.goto('/oyun.html?ders=1', { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  const durum = await page.evaluate(() => {
    const betikler = [...document.querySelectorAll('script[src]')].map(s => s.getAttribute('src'));
    return {
      kanaBetigi: betikler.filter(s => s.includes('kana')),
      appBetigi: betikler.filter(s => s.includes('app.js')),
      kanaGlobalVar: typeof window.KANA,
      dersUretVar: typeof window.dersUret,
      kanaYuklendiMi: typeof KANA_ISIM !== 'undefined'
    };
  });
  console.log('DURUM: ' + JSON.stringify(durum, null, 1));
  console.log('OLAYLAR: ' + JSON.stringify(olaylar, null, 1));
  expect(true).toBe(true);
});