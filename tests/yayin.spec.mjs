// YAYIN sağlığı: her sayfada konsol hatası ve 404 istek olmamalı.
// Bu test, geçmişte yaşanan iki sorunu kalıcı olarak yakalar:
//   - audio/*/index.json 404 kirliliği
//   - sessiz JavaScript hatasının sayfayı yarıda kesmesi
import { test, expect } from '@playwright/test';
import { kayitYaz, hataToplayici } from './_yardimci.mjs';

const SAYFALAR = [
  { ad: 'Giriş', yol: '/index.html', kayitGerekmez: true },
  { ad: 'Dojo', yol: '/dojo.html' },
  { ad: 'Ders (harf)', yol: '/oyun.html?ders=1' },
  { ad: 'Ders (test)', yol: '/oyun.html?ders=5' }
];

test.describe('Yayın sağlığı', () => {
  for (const sayfa of SAYFALAR) {
    test(`${sayfa.ad}: konsol hatası ve 404 yok`, async ({ page }) => {
      const toplayici = hataToplayici(page);

      // Kayıt kur (giriş sayfası hariç hepsi kayıt ister)
      await page.goto('/index.html');
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('sakar_isim', 'Test Kullanıcı');
        localStorage.setItem('sakar_seviye', '99');
        localStorage.setItem('sakar_xp', '0');
        localStorage.setItem('sakar_bilgi', 'yok');
      });

      await page.goto(sayfa.yol);
      await page.waitForTimeout(3000);

      const hatalar = toplayici.hatalar();
      const istekler = toplayici.istekler();

      expect(hatalar, `${sayfa.ad} sayfasında konsol hatası var:\n` + hatalar.join('\n')).toEqual([]);
      expect(istekler, `${sayfa.ad} sayfasında başarısız istek var:\n` + istekler.join('\n')).toEqual([]);
    });
  }

  test('tanıtım turu kapalıyken dojo temiz açılır', async ({ page }) => {
    const toplayici = hataToplayici(page);
    await page.goto('/index.html');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('sakar_isim', 'Test Kullanıcı');
      localStorage.setItem('sakar_seviye', '99');
      localStorage.setItem('sakar_tur', '1');   // tur gösterilmesin
    });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2500);

    await expect(page.locator('.tur-katman')).toHaveCount(0);
    expect(toplayici.hatalar()).toEqual([]);
    expect(toplayici.istekler()).toEqual([]);
  });

  test('service worker kaydı hata vermez', async ({ page }) => {
    const toplayici = hataToplayici(page);
    await page.goto('/index.html');
    await page.waitForTimeout(2000);

    const swDurumu = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return 'desteklenmiyor';
      const kayitlar = await navigator.serviceWorker.getRegistrations();
      return kayitlar.length > 0 ? 'kayitli' : 'kayitsiz';
    });

    // localhost http olduğu için SW kaydedilmeyebilir; sorun değil.
    // Önemli olan hata olmaması.
    expect(['kayitli', 'kayitsiz', 'desteklenmiyor']).toContain(swDurumu);
    expect(toplayici.hatalar()).toEqual([]);
  });
});
