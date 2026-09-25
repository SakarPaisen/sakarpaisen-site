// GİRİŞ akışı testleri.
// Not: Google girişi gerçek pencere açar; burada kimliğin KURULU olduğunu ve
// butonun çıktığını doğrularız (Google'a gerçek hesap girişi yapılmaz).
import { test, expect } from '@playwright/test';
import { kayitTemizle, heroGec } from './_yardimci.mjs';

/** Kayıt temizle + hero aşamasını geç (BAŞLA butonuna bas). */
async function temizleVeHeroGec(page) {
  await kayitTemizle(page);
  await page.reload();
  await heroGec(page);
}

test.describe('Giriş ekranı', () => {
  test('temiz profilde adını yazma ekranı veya Google butonu çıkar', async ({ page }) => {
    await temizleVeHeroGec(page);
    await page.waitForTimeout(1200);

    const isimKutusu = page.locator('.giris');
    const googleButonu = page.locator('.g-btn');
    const buton = page.locator('.panel button').first();

    // İkisinden biri mutlaka olmalı: kimlik girilmişse Google, girilmemişse isim kutusu
    const biri = (await isimKutusu.count()) > 0 || (await googleButonu.count()) > 0;
    expect(biri, 'Ne isim kutusu ne Google butonu var').toBe(true);
    await expect(buton).toBeVisible();
  });

  test('ad girilince kayıt oluşur ve dojo butonu çıkar', async ({ page }) => {
    await temizleVeHeroGec(page);
    await page.waitForSelector('.giris, .g-btn', { timeout: 15000 });

    // Google modundaysa bu testi atla (isim kutusu yok)
    if ((await page.locator('.giris').count()) === 0) {
      test.skip(true, 'Google girişi açık: isim kutusu yok');
      return;
    }

    await page.fill('.giris', 'Test Kullanıcı');
    await page.locator('.panel .buyuk-btn').first().click();
    await page.waitForTimeout(900);

    const kayit = await page.evaluate(() => ({
      isim: localStorage.getItem('sakar_isim'),
      seviye: localStorage.getItem('sakar_seviye'),
      bilgi: localStorage.getItem('sakar_bilgi')
    }));
    expect(kayit.isim).toBe('Test Kullanıcı');
    expect(kayit.seviye).toBe('1');
    expect(kayit.bilgi).toBe('yok');
  });

  test('boş ad kabul edilmez', async ({ page }) => {
    await temizleVeHeroGec(page);
    await page.waitForSelector('.giris, .g-btn', { timeout: 15000 });
    if ((await page.locator('.giris').count()) === 0) { test.skip(true, 'Google modu'); return; }

    await page.locator('.panel .buyuk-btn').first().click();
    await page.waitForTimeout(400);

    await expect(page.locator('.hata')).toHaveText('Önce adını yaz.');
    expect(await page.evaluate(() => localStorage.getItem('sakar_isim'))).toBeNull();
  });

  test('kayıt varsa dojo.html açılır', async ({ page }) => {
    await page.goto('/index.html');
    await page.evaluate(() => {
      localStorage.setItem('sakar_isim', 'Test Kullanıcı');
      localStorage.setItem('sakar_seviye', '1');
    });
    await page.goto('/dojo.html');
    await page.waitForSelector('.ust-menu', { timeout: 20000 });
    expect(new URL(page.url()).pathname).toBe('/dojo.html');
  });

  test('kayıt yoksa dojo girişe yönlendir', async ({ page }) => {
    await kayitTemizle(page);
    await page.goto('/dojo.html');
    await page.waitForTimeout(1500);
    expect(new URL(page.url()).pathname).toBe('/index.html');
  });

  test('kimlik girilmişse Google butonu görünür', async ({ page }) => {
    await temizleVeHeroGec(page);
    await page.waitForTimeout(2000);

    const kod = await page.evaluate(async () => (await fetch('giris.js', { cache: 'no-store' })).text());
    const kimlikVar = /const GOOGLE_CLIENT_ID = '[^']+'/.test(kod);
    if (!kimlikVar) { test.skip(true, 'GOOGLE_CLIENT_ID henüz girilmemiş'); return; }

    await expect(page.locator('.g-btn')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.g-btn')).toContainText('Google');
  });
});
