// DOJO (harita) testleri: istatistikler, tanıtım turu, geri bildirim kutusu.
import { test, expect } from '@playwright/test';
import { kayitYaz, dojoAc } from './_yardimci.mjs';

test.describe('Dojo haritası', () => {
  test.beforeEach(async ({ page }) => {
    await kayitYaz(page, { isim: 'Test Kullanıcı', seviye: 1 });
  });

  test('harita açılır ve ders daireleri çizilir', async ({ page }) => {
    await dojoAc(page);
    await expect(page.locator('.ust-menu')).toBeVisible();
    // Haritada bir şeyler çizilmiş olmalı
    const icerikUzunluk = await page.evaluate(() => document.getElementById('dinamikHarita').innerHTML.length);
    expect(icerikUzunluk).toBeGreaterThan(500);
  });

  test('istatistikler görünür: seri, rütbe, XP', async ({ page }) => {
    await dojoAc(page);
    await expect(page.locator('#seriGosterge')).toBeVisible();
    await expect(page.locator('#rutbeKutu')).toBeVisible();
    await expect(page.locator('#xpGosterge')).toBeVisible();
    await expect(page.locator('#rutbeKutu')).toContainText('Çırak');
  });

  test('XP değeri doğru gösterilir', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test Kullanıcı', seviye: 1, xp: 250 });
    await dojoAc(page);
    await expect(page.locator('#xpGosterge')).toHaveText('250');
    await expect(page.locator('#rutbeKutu')).toContainText('Samuray');
  });

  test('günlük hedef çubuğu görünür', async ({ page }) => {
    await dojoAc(page);
    // DİKKAT: #gunlukBar, çubuğun İÇİNDEKİ dolgu elemanıdır. XP 0 iken
    // genişliği %0 olur ve Playwright onu "görünmez" sayar (yanlış negatif).
    // Görünür olması gereken dış çubuktur; #gunlukBar'ın ise var olması yeter.
    await expect(page.locator('.bar.altin').first()).toBeVisible();
    await expect(page.locator('#gunlukBar')).toHaveCount(1);
    await expect(page.locator('#gunlukYazi')).toContainText('XP');
  });

  test.describe('Tanıtım turu', () => {
    test('ilk açılışta kendiliğinden çıkar', async ({ page }) => {
      // Turu sıfırla: ilk kez geliyormuş gibi
      await page.goto('/index.html');
      await page.evaluate(() => localStorage.removeItem('sakar_tur'));
      await dojoAc(page);
      await page.waitForTimeout(1500);

      await expect(page.locator('.tur-katman')).toBeVisible();
      await expect(page.locator('.tur-sayac')).toHaveText('1 / 4');
      await expect(page.locator('.tur-baslik')).not.toBeEmpty();
      expect(await page.locator('.tur-nokta').count()).toBe(4);
    });

    test('4 kart gezilir, sonuncuda buton "ANLADIM" olur', async ({ page }) => {
      await page.goto('/index.html');
      await page.evaluate(() => localStorage.removeItem('sakar_tur'));
      await dojoAc(page);
      await page.waitForSelector('.tur-katman', { timeout: 15000 });

      const ileri = page.locator('.tur-alt .tur-btn:not(.ikincil)');
      for (let i = 0; i < 3; i++) {
        await expect(page.locator('.tur-sayac')).toHaveText((i + 1) + ' / 4');
        await ileri.click();
        await page.waitForTimeout(250);
      }
      await expect(page.locator('.tur-sayac')).toHaveText('4 / 4');
      await expect(ileri).toContainText('ANLADIM');
    });

    test('kapatınca bir daha çıkmaz, ❓ ile tekrar açılır', async ({ page }) => {
      await page.goto('/index.html');
      await page.evaluate(() => localStorage.removeItem('sakar_tur'));
      await dojoAc(page);
      await page.waitForSelector('.tur-katman', { timeout: 15000 });

      await page.locator('.tur-atla').click();
      await page.waitForTimeout(300);
      await expect(page.locator('.tur-katman')).toHaveCount(0);
      expect(await page.evaluate(() => localStorage.getItem('sakar_tur'))).toBe('1');

      // Tekrar açılışta kendiliğinden çıkmamalı
      await dojoAc(page);
      await page.waitForTimeout(1200);
      await expect(page.locator('.tur-katman')).toHaveCount(0);

      // ❓ ile açılmalı
      await page.locator('#yardim').click();
      await page.waitForTimeout(400);
      await expect(page.locator('.tur-katman')).toBeVisible();

      // Escape ile kapanmalı
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      await expect(page.locator('.tur-katman')).toHaveCount(0);
    });
  });

  test('geri bildirim kutusu ve destek linki var', async ({ page }) => {
    await dojoAc(page);
    await expect(page.locator('#geriMetin')).toBeVisible();
    await expect(page.locator('#geriGonder')).toBeVisible();
    await expect(page.locator('.destek-btn')).toHaveAttribute('href', /kreosus\.com/);
  });
});
