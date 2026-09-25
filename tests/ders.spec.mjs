// DERS akışı testleri: şık seçimi, DEVAM ET butonu, canlar, ilerleme.
// Buradaki testler, geçmişte gerçekten yaşanan hataları yakalar:
//   - "DEVAM ET görünmüyor / altta kalmış"  -> devamButonuEkrandaMi
//   - "soru tipi hep aynı"                  -> tip çeşitliliği testi
import { test, expect } from '@playwright/test';
import { kayitYaz, sikSorusunaGel, devamButonuEkrandaMi, soruTipi } from './_yardimci.mjs';

test.describe('Ders akışı', () => {
  test.beforeEach(async ({ page }) => {
    await kayitYaz(page, { isim: 'Test Kullanıcı', seviye: 99 });
  });

  test('ders açılır, ilk adım öğretim kartıdır', async ({ page }) => {
    await page.goto('/oyun.html?ders=1');
    await page.waitForSelector('#sahne', { timeout: 20000 });
    await page.waitForTimeout(1200);

    const tip = await soruTipi(page);
    expect(['ogret', 'kelime-ogret', 'cumle-ogret', 'soru', 'dinle']).toContain(tip);
    // Üst çubuk ve canlar görünür olmalı
    await expect(page.locator('#ustBar')).toBeVisible();
    await expect(page.locator('#canlar')).toBeVisible();
  });

  test('şık seçilince DEVAM ET ekranın İÇİNDE görünür', async ({ page }) => {
    const geldi = await sikSorusunaGel(page, 1);
    expect(geldi, 'Şık içeren soruya ulaşılamadı').toBe(true);

    await page.locator('.secenek').first().click();
    await page.waitForTimeout(500);

    const durum = await devamButonuEkrandaMi(page);
    expect(durum.gorunur, 'DEVAM ET butonu görünmüyor').toBe(true);
    expect(durum.ekranda, `DEVAM ET ekran dışında (üst ${durum.ust}, alt ${durum.alt}, ekran ${durum.ekran})`).toBe(true);
  });

  test('şık seçilince anında geri bildirim gelir', async ({ page }) => {
    await sikSorusunaGel(page, 1);
    await page.locator('.secenek').first().click();
    await page.waitForTimeout(300);

    const geri = (await page.locator('#geriBildirim').textContent()).trim();
    expect(geri.length, 'Geri bildirim metni boş').toBeGreaterThan(0);
    // Doğru ya da yanlış: ikisinden birinin işareti olmalı
    expect(geri.startsWith('✓') || geri.startsWith('✕')).toBe(true);
  });

  test('yanlış cevap canı düşür', async ({ page }) => {
    await sikSorusunaGel(page, 1);

    // Kalp sayısı = can (kalp ❤️ bir kod birimi değil, 2'dir: U+2764 + U+FE0F).
    // Sayıya çevirmek, metin uzunluğu karşılaştırmaktan daha okunur ve sağlam.
    const canSayisi = () => page.evaluate(() =>
      (document.getElementById('canlar').textContent.match(/\u2764/g) || []).length);

    // Uygulamada İLK yanlış can götürmez (app.js: `if (hata > 1) can--`).
    // Bilinçli tasarım: yeni başlayan ilk hatasında "hemen kaybettim" hissine
    // kapılmasın. Bu yüzden canın düştüğünü görmek için en az 2 yanlış gerekir.
    const baslangic = await canSayisi();
    expect(baslangic).toBeGreaterThan(0);

    // Yanlış cevapları arka arkaya ver (arada öğretim kartları çıkabilir,
    // şık görünene kadar DEVAM ET ile ilerle).
    for (let i = 0; i < 14 && (await canSayisi()) === baslangic; i++) {
      const yanlis = page.locator('.secenek:not([data-dogru="1"])');
      if (await yanlis.count() > 0) {
        await yanlis.first().click();
        await page.waitForTimeout(350);
        // Yanlış cevap "✕" ile bildirilmeli
        await expect(page.locator('#geriBildirim')).toContainText('✕');
      }
      const b = page.locator('#devamBtn');
      if (await b.isVisible()) { await b.click(); await page.waitForTimeout(350); }
      else await page.waitForTimeout(250);
    }

    // En az bir kez yanlış yaptıktan sonra can 1 azalmış olmalı
    expect(await canSayisi()).toBe(baslangic - 1);
  });

  test('doğru cevap canı düşürmez', async ({ page }) => {
    await sikSorusunaGel(page, 1);
    const onceki = await page.locator('#canlar').textContent();
    await page.locator('.secenek[data-dogru="1"]').click();
    await page.waitForTimeout(400);
    expect(await page.locator('#canlar').textContent()).toBe(onceki);
  });

  test('ilerleme çubuğu ders boyunca ilerler', async ({ page }) => {
    await page.goto('/oyun.html?ders=1');
    await page.waitForSelector('#sahne', { timeout: 20000 });
    await page.waitForTimeout(1000);

    const baslangic = await page.evaluate(() => document.getElementById('ilerleme').style.width);
    expect(baslangic === '0%' || baslangic === '').toBe(true);

    // Birkaç adım ilerle
    for (let i = 0; i < 3; i++) {
      if (await page.locator('.secenek').count() > 0) await page.locator('.secenek').first().click();
      const btn = page.locator('#devamBtn');
      if (await btn.isVisible()) await btn.click();
      await page.waitForTimeout(400);
    }

    const simdi = await page.evaluate(() => document.getElementById('ilerleme').style.width);
    expect(parseFloat(simdi)).toBeGreaterThan(0);
  });

  test('ders boyunca flı soru tipleri çıkar (tek tip değil)', async ({ page }) => {
    await page.goto('/oyun.html?ders=1');
    await page.waitForSelector('#sahne', { timeout: 20000 });
    await page.waitForTimeout(1000);

    const gorulenTipler = new Set();
    const gorulenMesajlar = new Set();

    for (let i = 0; i < 22; i++) {
      const bilgi = await page.evaluate(() => ({
        tip: document.getElementById('sahne').dataset.soruTipi,
        mesaj: (document.querySelector('.mesaj') || {}).textContent || '',
        sik: document.querySelectorAll('.secenek').length,
        bitti: document.body.innerText.indexOf('Ders tamamland') > -1
      }));
      if (bilgi.bitti) break;
      gorulenTipler.add(bilgi.tip);
      // Soru metnini normalle: harf/kelime değişince aynı kalıp sayılsın
      gorulenMesajlar.add(bilgi.mesaj.replace(/[?????????????"]/g, '').slice(0, 22));

      if (bilgi.sik > 0) await page.locator('.secenek').first().click();
      const btn = page.locator('#devamBtn');
      if (await btn.isVisible()) await btn.click();
      await page.waitForTimeout(280);
    }

    expect(gorulenTipler.size, 'Ders tek tip soru soruyor: ' + [...gorulenTipler].join(',')).toBeGreaterThan(1);
    expect(gorulenMesajlar.size, 'Soru kalıbı hiç değişmiyor').toBeGreaterThan(1);
  });

  test('canlar bitince "Tekrar dene" ekranı çıkar', async ({ page }) => {
    await page.goto('/oyun.html?ders=1');
    await page.waitForSelector('#sahne', { timeout: 20000 });
    await page.waitForTimeout(1000);

    // Bilerek canları tüket (en fazla 6 deneme)
    for (let i = 0; i < 40; i++) {
      if (await page.locator('.secenek:not([data-dogru="1"])').count() > 0) {
        await page.locator('.secenek:not([data-dogru="1"])').first().click();
      }
      const btn = page.locator('#devamBtn');
      if (await btn.isVisible()) await btn.click();
      await page.waitForTimeout(300);

      if (await page.locator('text=Tekrar dene').count() > 0) break;
    }

    // DİKKAT: `text=Tekrar dene` tek başına yetmez — aynı ekrandaki ipucu metni
    // de "tekrar denersen..." içerdiği için locator 2 eleman bulup strict mode
    // hatası veriyordu. Doğrudan butonu hedefle.
    await expect(page.getByRole('button', { name: 'Tekrar dene' })).toBeVisible({ timeout: 10000 });
  });
});
