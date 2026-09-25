// ÇALIŞMA PLANI + SÖZLÜK
// Plan, kullanıcının "bugün ne çalışayım" sorusunu yanıtlar; sözlük tüm
// içeriği aranabilir yapar. İkisi de sessizce bozulabilir — testle korunur.
import { test, expect } from '@playwright/test';
import { kayitYaz, hataToplayici } from './_yardimci.mjs';

// Öğrenilmiş harf kaydı + karıştırma hazırla
async function veriHazirla(page) {
  await kayitYaz(page, { isim: 'Test', seviye: 12, xp: 340 });
  await page.evaluate(() => {
    localStorage.setItem('sakar_tur', '1');
    localStorage.setItem('sakar_kana', JSON.stringify({
      'h:a': { d: 9, y: 0, kutu: 5, gun: '2020-01-01', sonra: '2030-01-01' },
      'h:ka': { d: 2, y: 6, kutu: 0, gun: '', sonra: '2020-01-01' },
      'h:shi': { d: 1, y: 7, kutu: 0, gun: '', sonra: '2020-01-01' },
      'h:tsu': { d: 2, y: 6, kutu: 0, gun: '', sonra: '2020-01-01' },
      'h:sa': { d: 5, y: 4, kutu: 1, gun: '', sonra: '2020-01-01' },
      'h:ta': { d: 4, y: 5, kutu: 0, gun: '', sonra: '2020-01-01' }
    }));
    localStorage.setItem('sakar_ciftler', JSON.stringify({
      'h:shi|h:tsu': { n: 5, son: '2024-05-12' }
    }));
  });
}

test.describe('Çalışma planı', () => {

  test('plan en fazla 3 adım verir ve her adımın eylemi vardır', async ({ page }) => {
    await veriHazirla(page);
    await page.goto('/dojo.html');
    await page.waitForTimeout(2400);

    const d = await page.evaluate(() => {
      const p = Plan.kur(3);
      return {
        adet: p.length,
        // Her adımda simge, ad, açıklama, süre ve URL olmalı
        eksikAlan: p.filter(a => !a.simge || !a.ad || !a.aciklama || !a.sure || !a.url).length
      };
    });

    expect(d.adet, 'Plan 3 adım vermeli').toBe(3);
    expect(d.eksikAlan, 'Eksik alanlı adım var').toBe(0);
  });

  test('adımlar önem sırasına göre dizilir (en acil önce)', async ({ page }) => {
    await veriHazirla(page);
    await page.goto('/dojo.html');
    await page.waitForTimeout(2400);

    const d = await page.evaluate(() => {
      const p = Plan.kur(6);
      return { onemler: p.map(a => a.onem), idler: p.map(a => a.id) };
    });
    // onem değerleri azalan sırada olmalı (en acil önce)
    const sirali = d.onemler.every((v, i) => i === 0 || d.onemler[i - 1] >= v);
    expect(sirali, 'Plan önem sırasına göre dizilmedi: ' + JSON.stringify(d.onemler)).toBe(true);
  });

  test('karıştırılan harf varsa planda karıştırma adımı çıkar', async ({ page }) => {
    await veriHazirla(page);
    await page.goto('/dojo.html');
    await page.waitForTimeout(2400);

    const d = await page.evaluate(() => Plan.kur(6).map(a => a.id));
    expect(d, 'Karıştırma adımı planda olmalı').toContain('karistirma');
  });

  test('aynı URL iki kez gösterilmez (tekrar olmasın)', async ({ page }) => {
    await veriHazirla(page);
    await page.goto('/dojo.html');
    await page.waitForTimeout(2400);

    const d = await page.evaluate(() => Plan.kur(6).map(a => a.url));
    expect(new Set(d).size, 'Aynı URL iki kez var').toBe(d.length);
  });

  test('toplam süre doğru hesaplanır', async ({ page }) => {
    await veriHazirla(page);
    await page.goto('/dojo.html');
    await page.waitForTimeout(2400);

    const d = await page.evaluate(() => {
      const p = Plan.kur(3);
      return { toplam: Plan.toplamSure(p), adet: p.length };
    });
    expect(d.toplam, 'Toplam süre 0 olmamalı').toBeGreaterThan(0);
    expect(d.toplam, 'Süre makul olmalı (3 adım x ~5 dk)').toBeLessThan(30);
  });

  test('hiçbir şey kalmadıysa tebrik adımı çıkar (boş plan olmaz)', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 999, xp: 99999 });
    await page.evaluate(() => {
      localStorage.setItem('sakar_tur', '1');
      // Hiç zayıf/tekrar yok, tüm görevler tamam
      localStorage.setItem('sakar_kana', JSON.stringify({}));
      localStorage.setItem('sakar_ciftler', JSON.stringify({}));
      localStorage.setItem('sakar_seri', JSON.stringify({ sayi: 50, en: 50, son: '', koruma: 2 }));
    });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2400);

    const d = await page.evaluate(() => Plan.kur(3));
    expect(d.length, 'Plan asla boş dönmemeli').toBeGreaterThan(0);
    expect(d[0].simge, 'Her şey bittiyse tebrik gösterilmeli').toMatch(/🌟|🥋|📋|🎯/);
  });

  test('dojo panelinde plan kutusu çizilir', async ({ page }) => {
    await veriHazirla(page);
    await page.goto('/dojo.html');
    await page.waitForTimeout(2600);

    await expect(page.locator('#planKutu')).toBeVisible();
    const satir = await page.locator('.plan-satir').count();
    expect(satir, 'Plan satırları çizilmedi').toBeGreaterThan(0);
    // İlk adım vurgulu olmalı (kullanıcı nereden başlayacağını görsün)
    await expect(page.locator('.plan-satir.ilk')).toHaveCount(1);
    // Toplam süre rozeti dolu olmalı
    const sure = await page.locator('#planSure').textContent();
    expect(sure).toMatch(/dk/);
  });

  test('plan adımına tıklanınca doğru ders açılır', async ({ page }) => {
    await veriHazirla(page);
    await page.goto('/dojo.html');
    await page.waitForTimeout(2600);

    const url = await page.locator('.plan-satir.ilk').getAttribute('href');
    expect(url, 'Plan adımının bağlantısı yok').toBeTruthy();
    await page.locator('.plan-satir.ilk').click();
    await page.waitForTimeout(2000);
    expect(page.url(), 'Plan adımı yanlış sayfaya götürdü').toContain(url.split('?')[0]);
  });
});

test.describe('Sözlük', () => {

  test('içerik toplanır: harf, kelime ve kanji bulunur', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/sozluk.html');
    await page.waitForTimeout(2400);

    const s = await page.evaluate(() => Sozluk.sayilar());
    expect(s.harf, 'Harfler toplanmadı').toBeGreaterThan(50);
    expect(s.kelime, 'Kelimeler toplanmadı').toBeGreaterThan(0);
    // Kanji: gerçek alan adı KANJI.KANJILER (ilk yazdığımda LISTE arıyordum
    // ve sözlükte kanji sonucu hiç çıkmıyordu — bu test onu korur)
    expect(s.kanji, 'Kanjiler toplanmadı (KANJI.KANJILER okunuyor mu?)').toBeGreaterThan(0);
  });

  test('romaji ile harf bulunur', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/sozluk.html');
    await page.waitForTimeout(2400);

    const d = await page.evaluate(() =>
      Sozluk.ara('shi', 'harf').map(x => x.ja + '=' + x.ro));
    expect(d.length, '"shi" için sonuç yok').toBeGreaterThan(0);
    expect(d.some(x => x.indexOf('し') > -1), 'し bulunamadı').toBe(true);
  });

  test('JAPONCA karakterle arama çalışır', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/sozluk.html');
    await page.waitForTimeout(2400);

    const d = await page.evaluate(() => Sozluk.ara('し', 'harf').map(x => x.ja + '=' + x.ro));
    expect(d.length, 'Japonca karakterle sonuç yok').toBeGreaterThan(0);
    expect(d[0], 'En üstte tam eşleşme olmalı').toBe('し=shi');
  });

  test('aynı sesin iki alfabesi de bulunur (あ ve ア)', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/sozluk.html');
    await page.waitForTimeout(2400);

    const d = await page.evaluate(() => Sozluk.ara('a', 'harf').map(x => x.ja));
    expect(d, 'Hiragana a bulunamadı').toContain('あ');
    expect(d, 'Katakana a bulunamadı').toContain('ア');
  });

  test('Türkçe karakterli arama toleranslı çalışır (ç/ş/ğ/ı)', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/sozluk.html');
    await page.waitForTimeout(2400);

    const d = await page.evaluate(() => ({
      // "kahvalti" yazınca "kahvaltı" bulunmalı (ı/i toleransı)
      duz: Sozluk.normalize('kahvaltı'),
      yazilan: Sozluk.normalize('kahvalti'),
      buyuk: Sozluk.normalize('İstanbul'),
      // 'I' ve 'ı' ve 'i' hepsi aynı olmalı
      iBuyuk: Sozluk.normalize('I'),
      inokta: Sozluk.normalize('ı'),
      iKucuk: Sozluk.normalize('i')
    }));
    expect(d.duz, 'ı ve i birbirine çevrilmeli').toBe(d.yazilan);
    expect(d.buyuk).toBe('istanbul');
    expect(d.iBuyuk).toBe(d.inokta);
    expect(d.inokta).toBe(d.iKucuk);
  });

  test('tür filtresi yalnızca o türü getirir', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/sozluk.html');
    await page.waitForTimeout(2400);

    const d = await page.evaluate(() => ({
      hepsi: Sozluk.ara('a', 'hepsi').map(x => x.tur),
      sadeceHarf: Sozluk.ara('a', 'harf').map(x => x.tur),
      sadeceKanji: Sozluk.ara('a', 'kanji').map(x => x.tur)
    }));
    expect(new Set(d.sadeceHarf).size, 'Harf filtresi başka tür döndürüyor').toBeLessThanOrEqual(1);
    expect(d.sadeceHarf.every(t => t === 'harf')).toBe(true);
    expect(d.sadeceKanji.every(t => t === 'kanji')).toBe(true);
  });

  test('tam eşleşme listenin EN ÜSTÜNDE olur', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/sozluk.html');
    await page.waitForTimeout(2400);

    const d = await page.evaluate(() => {
      const r = Sozluk.ara('ka', 'harf');
      return r.length ? { ilk: r[0].ja + '=' + r[0].ro } : null;
    });
    expect(d, '"ka" için sonuç yok').not.toBe(null);
    expect(d.ilk, 'Tam eşleşme en üstte olmalı').toBe('か=ka');
  });

  test('olmayan arama boş döner (hata vermez)', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/sozluk.html');
    await page.waitForTimeout(2400);

    const d = await page.evaluate(() => ({
      bos: Sozluk.ara('zzzzz', 'hepsi').length,
      bosluk: Sozluk.ara('   ', 'hepsi').length,
      bosArama: Sozluk.ara('', 'hepsi').length
    }));
    expect(d.bos).toBe(0);
    expect(d.bosluk, 'Boşluk araması sonuç döndürmemeli').toBe(0);
    expect(d.bosArama).toBe(0);
  });

  test('arayüz: yazınca sonuç listesi çizilir ve tür etiketleri görünür', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/sozluk.html');
    await page.waitForTimeout(2400);

    // Açılış ekranı
    await expect(page.locator('.bos')).toBeVisible();
    const sayiRozet = await page.locator('#sayiRozet').textContent();
    expect(sayiRozet, 'Kayıt sayısı gösterilmeli').toMatch(/kayıt/);

    // Arama yap
    await page.locator('#araKutu').fill('ka');
    await page.waitForTimeout(700);
    const satir = await page.locator('.s-satir').count();
    expect(satir, 'Sonuç listesi çizilmedi').toBeGreaterThan(0);
    await expect(page.locator('.s-tur').first()).toBeVisible();

    // Temizle
    await page.locator('#temizleBtn').click();
    await page.waitForTimeout(500);
    await expect(page.locator('.bos'), 'Temizleyince açılış ekranı gelmeli').toBeVisible();
  });

  test('tür filtresi düğmeleri çalışır', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/sozluk.html');
    await page.waitForTimeout(2400);

    await page.locator('#araKutu').fill('ka');
    await page.waitForTimeout(600);
    const hepsi = await page.locator('.s-satir').count();

    // Sadece harf
    await page.locator('#turSec button[data-tur="harf"]').click();
    await page.waitForTimeout(500);
    const sadeceHarf = await page.locator('.s-satir').count();
    expect(sadeceHarf, 'Harf filtresi sonucu daraltmadı').toBeLessThanOrEqual(hepsi);
    await expect(page.locator('#turSec button[data-tur="harf"]')).toHaveClass(/aktif/);
  });

  test('konsol hatası ve 404 yok', async ({ page }) => {
    const t = hataToplayici(page);
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/sozluk.html');
    await page.waitForTimeout(2500);
    await page.locator('#araKutu').fill('ka');
    await page.waitForTimeout(800);
    expect(t.hatalar(), 'Sözlük konsol hatası:\n' + t.hatalar().join('\n')).toEqual([]);
    expect(t.istekler(), 'Sözlük başarısız istek:\n' + t.istekler().join('\n')).toEqual([]);
  });
});