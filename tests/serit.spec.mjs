// DURUM ŞERİDİ + ÇOKLU SAYFA YERLEŞİMLERİ
// Oyun durumu (seri/XP/görev/hediye) artık sadece dojo'da değil, tüm
// sayfalarda görünüyor. Bu, sayfalar arası kopukluğu engelliyor.
import { test, expect } from '@playwright/test';
import { kayitYaz, hataToplayici, heroGec } from './_yardimci.mjs';

/** index.html'de hero aşamasını geç (BAŞLA butonu) — panel ondan sonra görünür. */
async function veriHazirlaHero(page) {
  await heroGec(page);
}

// Kayıtlı kullanıcı + test verisi hazırla
async function veriHazirla(page) {
  await kayitYaz(page, { isim: 'Test', seviye: 55, xp: 780 });
  await page.evaluate(() => {
    localStorage.setItem('sakar_tur', '1');
    localStorage.setItem('sakar_seri', JSON.stringify({ sayi: 8, en: 12, son: '', koruma: 1 }));
    localStorage.setItem('sakar_kana', JSON.stringify({
      'h:ka': { d: 2, y: 6, kutu: 0, gun: '', sonra: '2020-01-01' }
    }));
  });
}

test.describe('Durum şeridi — her sayfada oyun durumu', () => {

  for (const yol of ['/istatistik.html', '/ayarlar.html', '/kelime.html']) {
    test(`${yol} sayfasında şerit görünür ve dolu`, async ({ page }) => {
      await veriHazirla(page);
      await page.goto(yol);
      await page.waitForTimeout(2200);

      const s = page.locator('#spSerit');
      await expect(s, yol + ' sayfasında şerit yok').toBeVisible();

      // İçerik parçaları: seri, XP, rütbe, görev
      const parca = await s.locator('.ss-parca').count();
      expect(parca, 'Şeritte en az 4 parça olmalı').toBeGreaterThanOrEqual(4);

      const metin = await s.textContent();
      expect(metin, 'XP görünmeli').toMatch(/780/);
      expect(metin, 'Rütbe görünmeli').toMatch(/Usta/);
    });
  }

  test('seri bugün yapılmadıysa şeritte uyarı vurgusu çıkar', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55, xp: 500 });
    await page.evaluate(() => {
      // ÖNEMLİ: Ilerleme.seri() mantığı — `son` DÜNKÜ tarih olmalı.
      // `son` boşsa seri kırılmış sayılır ve sayi=0 döner, o zaman vurgu
      // çıkmaz (bu, ilk yazdığım testin hatasıydı).
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const dun = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
        '-' + String(d.getDate()).padStart(2, '0');
      localStorage.setItem('sakar_seri', JSON.stringify({ sayi: 8, en: 8, son: dun, koruma: 0 }));
    });
    await page.goto('/istatistik.html');
    await page.waitForTimeout(2200);

    // Doğrulama: modül seriyi "bekliyor" olarak bildiriyor mu?
    const durum = await page.evaluate(() => Ilerleme.seri());
    expect(durum.sayi, 'Seri 8 olmalı').toBe(8);
    expect(durum.bugunYapildi, 'Bugün yapılmadı olmalı').toBe(false);

    const vurgu = page.locator('#spSerit .seri-bekliyor');
    await expect(vurgu, 'Bugün çalışılmadıysa seri vurgulanmalı').toHaveCount(1);
  });

  test('görev sayacına tıklayınca dojo açılır', async ({ page }) => {
    await veriHazirla(page);
    await page.goto('/kelime.html');
    await page.waitForTimeout(2200);

    // Görev parçasını bul ve tıkla
    const gorev = page.locator('#spSerit .ss-parca', { hasText: '/' });
    await gorev.first().click();
    await page.waitForTimeout(1500);
    expect(page.url(), 'Görev sayacı dojoya götürmeli').toMatch(/dojo\.html/);
  });

  test('YENİ kullanıcıda (kayıt yokken) şerit çıkmaz', async ({ page }) => {
    await page.goto('/index.html');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/index.html');
    await page.waitForTimeout(2600);

    await expect(page.locator('#spSerit'),
      'Kayıt olmayan kullanıcıda boş şerit görünmemeli').toHaveCount(0);
  });
});

test.describe('Giriş ekranı — günlük hediye', () => {

  test('girişte büyük hediye butonu çıkar ve sandığı açar', async ({ page }) => {
    await veriHazirla(page);
    await page.evaluate(() => { localStorage.removeItem('sakar_hediye'); });
    await page.goto('/index.html');
    await page.waitForTimeout(2200);
    await veriHazirlaHero(page);
    await page.waitForTimeout(1200);

    // "GÜNLÜK HEDİYENİ AL" butonu olmalı
    const hBtn = page.locator('.buyuk-btn', { hasText: 'HEDİYENİ AL' });
    await expect(hBtn, 'Giriş ekranında hediye butonu yok').toBeVisible();

    // Tıklayınca sandık katmanı açılmalı
    await hBtn.click();
    await page.waitForTimeout(900);
    await expect(page.locator('.sandik-katman')).toBeVisible();
  });

  test('hediye alındıktan sonra buton bir daha çıkmaz (aynı gün)', async ({ page }) => {
    await veriHazirla(page);
    await page.evaluate(() => { localStorage.removeItem('sakar_hediye'); });
    await page.goto('/index.html');
    await page.waitForTimeout(2200);
    await veriHazirlaHero(page);
    await page.waitForTimeout(1200);

    await page.locator('.buyuk-btn', { hasText: 'HEDİYENİ AL' }).click();
    await page.waitForTimeout(900);
    await page.locator('.sandik-gorsel').click();     // sandığı aç
    await page.waitForTimeout(900);
    await page.locator('.sp-btn.yesil', { hasText: 'HARİKA' }).click();
    await page.waitForTimeout(1800);                  // sayfa yenilenir

    const hBtn = page.locator('.buyuk-btn', { hasText: 'HEDİYENİ AL' });
    await expect(hBtn, 'Hediye alındıktan sonra buton gizlenmeli').toHaveCount(0);
  });

  test('giriş ekranında görev özeti görünür', async ({ page }) => {
    await veriHazirla(page);
    await page.goto('/index.html');
    await page.waitForTimeout(2200);
    await veriHazirlaHero(page);
    await page.waitForTimeout(1200);

    const ozet = page.locator('.giris-not');
    await expect(ozet, 'Giriş ekranında görev özeti yok').toBeVisible();
    const metin = await ozet.textContent();
    expect(metin).toMatch(/görev/i);
  });

  test('girişte şeritteki hediye rozeti TEKRARLANMAZ', async ({ page }) => {
    await veriHazirla(page);
    await page.evaluate(() => { localStorage.removeItem('sakar_hediye'); });
    await page.goto('/index.html');
    await page.waitForTimeout(2200);
    await veriHazirlaHero(page);
    await page.waitForTimeout(1200);

    // Büyük buton var, şeritteki rozet OLMAMALI (tekrar olurdu)
    await expect(page.locator('.buyuk-btn', { hasText: 'HEDİYENİ AL' })).toBeVisible();
    await expect(page.locator('#spSerit .ss-parca.hediye'),
      'Girişte şeritte hediye rozeti tekrar çıkmamalı').toHaveCount(0);
  });
});

test.describe('Kelime defteri — görev paneli', () => {

  test('görev paneli görünür ve satırlar çizilir', async ({ page }) => {
    await veriHazirla(page);
    await page.goto('/kelime.html');
    await page.waitForTimeout(2200);

    await expect(page.locator('#kelimeGorev')).toBeVisible();
    const satir = await page.locator('#kelimeGorevListe .gorev-satir').count();
    expect(satir, '3 görev satırı olmalı').toBe(3);
  });

  test('görevler defterdekiyle aynı (tutarlı)', async ({ page }) => {
    await veriHazirla(page);
    await page.goto('/kelime.html');
    await page.waitForTimeout(2200);

    const d = await page.evaluate(() => ({
      domSatir: document.querySelectorAll('#kelimeGorevListe .gorev-satir').length,
      modul: Gorevler.liste().length
    }));
    expect(d.domSatir, 'Panel ile modül aynı sayıda görev göstermeli').toBe(d.modul);
  });
});

test.describe('Yerleşim sağlığı', () => {

  for (const yol of ['/index.html', '/istatistik.html', '/ayarlar.html', '/kelime.html']) {
    test(`${yol}: konsol hatası ve 404 yok`, async ({ page }) => {
      const t = hataToplayici(page);
      await veriHazirla(page);
      await page.goto(yol);
      await page.waitForTimeout(2800);
      expect(t.hatalar(), yol + ' konsol hatası:\n' + t.hatalar().join('\n')).toEqual([]);
      expect(t.istekler(), yol + ' başarısız istek:\n' + t.istekler().join('\n')).toEqual([]);
    });
  }
});