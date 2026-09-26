// Geçici: oyun.html gerçekten hangi HTML'i alıyor? (Playwright ile, temiz profil)
import { test, expect } from '@playwright/test';

test('hangi HTML sayfalari NAVIGASYONDA dogru geliyor', async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => {
    localStorage.setItem('sakar_isim', 'QA Test');
    localStorage.setItem('sakar_seviye', '1');
    localStorage.setItem('sakar_bilgi', 'yok');
  });
  for (const yol of ['/oyun.html?ders=1', '/dojo.html', '/kelime.html', '/ayarlar.html', '/index.html']) {
    await page.goto(yol, { waitUntil: 'load' });
    await page.waitForTimeout(700);
    const b = await page.evaluate(() => ({
      sp: (document.querySelector('meta[name="sp-sayfa"]') || {}).content || 'YOK',
      baslik: document.title
    }));
    console.log('NAV ' + yol + ' -> sp-sayfa=' + b.sp + ' | ' + b.baslik);
  }
  const son = await page.evaluate(() => (document.querySelector('meta[name="sp-sayfa"]') || {}).content || 'YOK');
  expect(son).toBe('ayarlar');
});