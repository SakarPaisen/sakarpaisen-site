// Analitik/reklam/bulut scriptleri gerçekten yükleniyor mu? Playwright ile (kendi altyapımız).
import { test, expect } from '@playwright/test';

test.describe('Yeni modüller (analitik + bulut)', () => {

  test('giriş sayfasında analitik/reklam/bulut yüklenir', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(1500);
    const t = await page.evaluate(() => ({
      analitik: typeof window.Analitik,
      bulut: typeof window.Bulut,
      reklam: typeof window.Reklam
    }));
    expect(t.analitik, 'analitik.js yüklenmedi (window.Analitik yok)').toBe('object');
    expect(t.bulut, 'bulut.js yüklenmedi (window.Bulut yok)').toBe('object');
    expect(t.reklam, 'reklam.js yüklenmedi (window.Reklam yok)').toBe('object');
  });

  test('modüller durumlarını doğru bildir (acik() tutarlı)', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(1200);
    const d = await page.evaluate(() => ({
      analitikVar: typeof window.Analitik,
      bulutVar: typeof window.Bulut,
      reklamVar: typeof window.Reklam,
      // acik() HER ZAMAN boolean döndürmeli (null/undefined = kod bozuk demek)
      analitikTip: window.Analitik ? typeof window.Analitik.acik() : null,
      bulutTip: window.Bulut ? typeof window.Bulut.acik() : null,
      reklamTip: window.Reklam ? typeof window.Reklam.acik() : null
    }));
    expect(d.analitikVar).toBe('object');
    expect(d.bulutVar).toBe('object');
    expect(d.reklamVar, 'reklam.js yüklenmedi (window.Reklam yok)').toBe('object');
    expect(d.analitikTip).toBe('boolean');
    expect(d.bulutTip).toBe('boolean');
    expect(d.reklamTip).toBe('boolean');
  });

  test('reklam localhost ta KAPALI (AdSense sahte tıklama saymasın)', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(1200);
    const reklamAcik = await page.evaluate(() =>
      window.Reklam ? window.Reklam.acik() : null);
    // Yerelde reklam gösterilmez: kendi tıklaman hesabı askıya aldır.
    expect(reklamAcik, 'Yerelde reklam AÇIK olmamalı').toBe(false);
  });

  test('kapalıyken analitik/reklam dış istek yapmaz (gizlilik)', async ({ page }) => {
    const disIstek = [];
    page.on('request', r => {
      const u = r.url();
      if (u.indexOf('cloudflareinsights') > -1 || u.indexOf('umami') > -1 ||
          u.indexOf('supabase') > -1 || u.indexOf('googlesyndication') > -1 ||
          u.indexOf('adsbygoogle') > -1) {
        disIstek.push(u);
      }
    });
    await page.goto('/index.html');
    await page.waitForTimeout(2000);
    // Not: Supabase/Cloudflare ayarları DOLU olduğu için bunlar beklenen isteklerdir.
    // Bu test yalnızca REKLAM ağının kapalıyken çağrılmadığını doğrular.
    const reklamIstek = disIstek.filter(u =>
      u.indexOf('googlesyndication') > -1 || u.indexOf('adsbygoogle') > -1);
    expect(reklamIstek, 'Reklam ayarı boşken reklam ağı çağrıldı:\n' +
      reklamIstek.join('\n')).toEqual([]);
  });

  test('reklam alanı yerelde görünmez (site bozulmasın)', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(1500);
    const reklam = await page.evaluate(() => ({
      yuklendi: typeof window.Reklam,
      gorunenKutu: document.querySelectorAll('.reklam-alani:not([hidden])').length
    }));
    expect(reklam.yuklendi, 'reklam.js yüklenmedi (window.Reklam yok)').toBe('object');
    expect(reklam.gorunenKutu, 'Ayar boşken görünür reklam kutusu olmamalı').toBe(0);
  });

  test('oyun sayfasında da yüklenir', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sakar_isim', 'Test Kullanıcı');
      localStorage.setItem('sakar_seviye', '99');
      localStorage.setItem('sakar_tur', '1');
    });
    await page.goto('/oyun.html?ders=1');
    await page.waitForTimeout(1800);
    const t = await page.evaluate(() => ({
      analitik: typeof window.Analitik,
      bulut: typeof window.Bulut
    }));
    expect(t.analitik).toBe('object');
    expect(t.bulut).toBe('object');
  });
});
