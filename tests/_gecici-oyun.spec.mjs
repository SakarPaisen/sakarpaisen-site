// Geçici QA: oyunu uçtan uca oyna — aynı sayfa içinde değil, her adımda temiz navigasyon.
import { test, expect } from '@playwright/test';

test('ders gercekten oynanabiliyor', async ({ page }) => {
  // 1) Kayıt aç (giriş ekranını taklit)
  await page.goto('/index.html');
  await page.evaluate(() => {
    localStorage.setItem('sakar_isim', 'QA Test');
    localStorage.setItem('sakar_seviye', '99');
    localStorage.setItem('sakar_xp', '0');
    localStorage.setItem('sakar_bilgi', 'yok');
  });

  // 2) Dersi aç
  await page.goto('/oyun.html?ders=1', { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  const ilk = await page.evaluate(() => ({
    sp: (document.querySelector('meta[name="sp-sayfa"]') || {}).content || 'YOK',
    baslik: document.title,
    tip: document.getElementById('sahne').dataset.soruTipi || 'YOK',
    adimMetni: (document.querySelector('.mesaj') || {}).textContent || '',
    canlar: document.getElementById('canlar').textContent.trim(),
    hataListesi: (window.HataRapor && HataRapor.varmi()) ? HataRapor.liste() : 'hata yok',
    hataUyariVar: !!document.querySelector('.hata-uyari'),
    sahneIcerik: document.getElementById('sahne').innerHTML.slice(0, 300)
  }));
  console.log('ILK EKRAN: ' + JSON.stringify(ilk));
  expect(ilk.sp).toBe('oyun');
  expect(ilk.canlar.length).toBeGreaterThan(0);

  // 3) Öğretim kartlarını geçip şıklı soruya gel
  let sikGeldi = false;
  for (let i = 0; i < 15; i++) {
    if (await page.locator('.secenek').count() > 0) { sikGeldi = true; break; }
    const b = page.locator('#devamBtn');
    if (await b.isVisible()) { await b.click(); await page.waitForTimeout(400); }
    else await page.waitForTimeout(300);
  }
  expect(sikGeldi, 'Şıklı soruya ulaşılamadı').toBe(true);

  // 4) Şık seç → geri bildirim + DEVAM ET
  await page.locator('.secenek').first().click();
  await page.waitForTimeout(600);
  const geri = await page.evaluate(() => ({
    bildirim: document.getElementById('geriBildirim').textContent.trim(),
    devamGorunur: getComputedStyle(document.getElementById('devamBtn')).display !== 'none',
    ilerleme: document.getElementById('ilerleme').style.width
  }));
  console.log('CEVAP SONRASI: ' + JSON.stringify(geri));
  expect(geri.bildirim.length).toBeGreaterThan(0);

  // 5) DEVAM ET ile ilerle
  if (geri.devamGorunur) {
    await page.locator('#devamBtn').click();
    await page.waitForTimeout(800);
  }
  const sonraki = await page.evaluate(() => ({
    tip: document.getElementById('sahne').dataset.soruTipi || 'YOK',
    ilerleme: document.getElementById('ilerleme').style.width
  }));
  console.log('SONRAKI ADIM: ' + JSON.stringify(sonraki));
  expect(parseFloat(sonraki.ilerleme) || 0).toBeGreaterThan(0);
});