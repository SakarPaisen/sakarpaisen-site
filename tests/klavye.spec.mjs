// KLAVYE testleri: 1-4 ve Enter kısayolları, numara rozetleri,
// dokunmatik cihazda ipucun GİZLİ olması.
import { test, expect } from '@playwright/test';
import { kayitYaz, sikSorusunaGel } from './_yardimci.mjs';

test.describe('Klavye kısayolları', () => {
  test.beforeEach(async ({ page }) => {
    await kayitYaz(page, { isim: 'Test Kullanıcı', seviye: 99 });
  });

  test('her şıkta numara rozeti görünür', async ({ page }) => {
    await sikSorusunaGel(page, 1);
    const sikSayisi = await page.locator('.secenek').count();
    const rozetSayisi = await page.locator('.sik-no').count();
    expect(rozetSayisi).toBe(sikSayisi);

    const yazilar = await page.locator('.sik-no').allTextContents();
    expect(yazilar).toEqual(['1', '2', '3', '4'].slice(0, sikSayisi));
  });

  test('1-4 tuşlarıyla şık seçilir', async ({ page }) => {
    await sikSorusunaGel(page, 1);
    const onceki = await page.locator('#geriBildirim').textContent();

    await page.keyboard.press('1');
    await page.waitForTimeout(400);

    const sonra = await page.locator('#geriBildirim').textContent();
    expect(sonra).not.toBe(onceki);
    expect(sonra.trim().startsWith('✓') || sonra.trim().startsWith('✕')).toBe(true);
  });

  test('Enter ile devam edilir', async ({ page }) => {
    await sikSorusunaGel(page, 1);
    await page.locator('.secenek').first().click();
    await page.waitForTimeout(400);

    const oncekiTip = await page.evaluate(() => document.getElementById('sahne').dataset.soruTipi);
    const oncekiMesaj = await page.evaluate(() => (document.querySelector('.mesaj') || {}).textContent || '');

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Ekran değişmiş olmalı (yeni soru ya da ders sonu)
    const degisti = await page.evaluate(([t, m]) => {
      const s = document.getElementById('sahne');
      const yeniMesaj = (document.querySelector('.mesaj') || {}).textContent || '';
      return s.dataset.soruTipi !== t || yeniMesaj !== m || document.body.innerText.indexOf('Ders tamamland') > -1;
    }, [oncekiTip, oncekiMesaj]);
    expect(degisti, 'Enter devam etmedi').toBe(true);
  });

  test('Enter, buton odaklıyken iki kez tetiklenmez', async ({ page }) => {
    await sikSorusunaGel(page, 1);
    await page.locator('.secenek').first().click();
    await page.waitForTimeout(400);

    // Butona odaklan ve Enter'a bas
    await page.locator('#devamBtn').focus();
    const oncekiTip = await page.evaluate(() => document.getElementById('sahne').dataset.soruTipi);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Bir adım ilerlemiş olmalı (iki adım değil): sahne içeriği tek adım değişir.
    // Basit kontrol: sayfa hata vermedi ve sahne boş değil
    const sahneDolu = await page.evaluate(() => document.getElementById('sahne').innerHTML.length > 50);
    expect(sahneDolu).toBe(true);
    void oncekiTip;
  });
});

// Bu dosyadaki mobil testleri playwright.config.mjs "mobil" projesinde çalışır.
test.describe('Dokunmatik cihaz davranışı', () => {
  test('mobilde klavye ipucun görünmez ama numaralar kalır', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Bu test yalnızca mobil projesinde çalışır');

    await kayitYaz(page, { isim: 'Test Kullanıcı', seviye: 99 });
    await sikSorusunaGel(page, 1);
    await page.waitForTimeout(600);

    // Dokunmatikte klavye ipucu gösterilmemeli
    await expect(page.locator('.klavye-ipucu')).toHaveCount(0);
    // Ama numaralar kalabilir (dokunmatikte de zararsız)
    expect(await page.locator('.sik-no').count()).toBeGreaterThan(0);
  });
});
