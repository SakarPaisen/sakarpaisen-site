// AYARLAR + İSTATİSTİK sayfaları: gerçekten çalışıyor mu, siteyi bozuyor mu?
// Yeni özellikleri (tema, zorluk, grafik) kalıcı olarak korumak için.
import { test, expect } from '@playwright/test';
import { kayitYaz, hataToplayici } from './_yardimci.mjs';

test.describe('Ayarlar sayfası', () => {

  test('kayıt varsa açılır, bölümler görünür', async ({ page }) => {
    await kayitYaz(page);
    await page.goto('/ayarlar.html');
    await page.waitForTimeout(1500);
    // Tema, zorluk ve sıfırlama bölümleri olmalı
    await expect(page.locator('.grup')).toHaveCount(4);
    await expect(page.locator('.secenekler[data-ayar="tema"] .sec')).toHaveCount(3);
    await expect(page.locator('.secenekler[data-ayar="zorluk"] .sec')).toHaveCount(3);
  });

  test('tema seçilince html[data-tema] yazılır ve kaydedilir', async ({ page }) => {
    await kayitYaz(page);
    await page.goto('/ayarlar.html');
    await page.waitForTimeout(1200);

    // "gece" temasını seç
    await page.locator('.secenekler[data-ayar="tema"] .sec[data-deger="gece"]').click();
    await page.waitForTimeout(400);

    const t = await page.evaluate(() => ({
      nitelik: document.documentElement.getAttribute('data-tema'),
      kayit: JSON.parse(localStorage.getItem('sakar_ayarlar') || '{}').tema
    }));
    expect(t.nitelik, 'data-tema uygulanmadı').toBe('gece');
    expect(t.kayit, 'tema kaydedilmedi').toBe('gece');

    // Zemin rengi gerçekten koyulaşmış olmalı (CSS değişkeni değişti mi?)
    const zemin = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor);
    // gece teması zemini #14131a -> rgb(20, 19, 26)
    expect(zemin).toBe('rgb(20, 19, 26)');
  });

  test('zorluk seçimi kaydedilir ve Canlı açıklama güncellenir', async ({ page }) => {
    await kayitYaz(page);
    await page.goto('/ayarlar.html');
    await page.waitForTimeout(1200);

    await page.locator('.secenekler[data-ayar="zorluk"] .sec[data-deger="zor"]').click();
    await page.waitForTimeout(300);

    const d = await page.evaluate(() => ({
      kayit: JSON.parse(localStorage.getItem('sakar_ayarlar') || '{}').zorluk,
      aciklama: document.getElementById('zorlukAciklama').textContent,
      rozet: document.getElementById('zorlukRozet').textContent
    }));
    expect(d.kayit).toBe('zor');
    expect(d.aciklama).toMatch(/3 can/);
    expect(d.rozet).toMatch(/Zorlu/);
  });

  test('animasyon anahtarı kapalıyken data-animasyon="0" olur', async ({ page }) => {
    await kayitYaz(page);
    await page.goto('/ayarlar.html');
    await page.waitForTimeout(1200);

    await page.locator('[data-ayar-anahtar="animasyon"]').click();
    await page.waitForTimeout(300);

    const n = await page.evaluate(() => document.documentElement.getAttribute('data-animasyon'));
    expect(n).toBe('0');
  });

  test('sadece ayarları sıfırla ilerlemeyi SİLMEZ', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test Kullanıcı', xp: 777 });
    await page.goto('/ayarlar.html');
    await page.waitForTimeout(1200);

    // Önce bir ayar değiştir
    await page.locator('.secenekler[data-ayar="tema"] .sec[data-deger="koyu"]').click();
    page.on('dialog', d => d.accept());   // onay penceresini kabul et
    await page.locator('#ayarSifirla').click();
    await page.waitForTimeout(1200);

    const k = await page.evaluate(() => ({
      xp: localStorage.getItem('sakar_xp'),
      isim: localStorage.getItem('sakar_isim'),
      ayar: localStorage.getItem('sakar_ayarlar')
    }));
    expect(k.xp, 'XP kaybolmamalı!').toBe('777');
    expect(k.isim, 'İsim kaybolmamalı!').toBe('Test Kullanıcı');
    expect(k.ayar, 'Ayarlar sıfırlanmalıydı').toBe(null);
  });

  test('kayıt yoksa giriş ekranına yönlendir', async ({ page }) => {
    await page.goto('/index.html');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/ayarlar.html');
    await page.waitForTimeout(1500);
    expect(page.url()).toMatch(/index\.html/);
  });

  test('konsol hatası ve 404 yok', async ({ page }) => {
    const t = hataToplayici(page);
    await kayitYaz(page);
    await page.goto('/ayarlar.html');
    await page.waitForTimeout(2500);
    expect(t.hatalar(), 'Ayarlar sayfasında konsol hatası:\n' + t.hatalar().join('\n')).toEqual([]);
    expect(t.istekler(), 'Ayarlar sayfasında başarısız istek:\n' + t.istekler().join('\n')).toEqual([]);
  });
});

test.describe('İstatistik sayfası', () => {

  test('kayıt varsa açılır ve özet kartları çizilir', async ({ page }) => {
    await kayitYaz(page);
    await page.goto('/istatistik.html');
    await page.waitForTimeout(1600);
    // 6 büyük rakam kutusu (XP, rütbe, seri, yıldız, harf, tekrar)
    await expect(page.locator('.bg-kutu')).toHaveCount(6);
    await expect(page.locator('.bg-kutu').first()).toBeVisible();
  });

  test('XP geçmişi olmadan da çöker değil (boş durum mesajı)', async ({ page }) => {
    await kayitYaz(page);   // gecmis anahtarı yazılmaz
    await page.goto('/istatistik.html');
    await page.waitForTimeout(1600);
    // Grafik kartı yine de görünmeli; içinde ya canvas ya boş mesaj olur
    const grafik = page.locator('.kart').nth(1);
    await expect(grafik).toBeVisible();
    const icerik = await page.evaluate(() => {
      const k = document.querySelectorAll('.kart')[1];
      return k ? (k.querySelector('canvas') ? 'canvas' : 'yok') : 'kart-yok';
    });
    expect(['canvas', 'yok']).toContain(icerik);
  });

  test('XP kazanınca geçmiş kaydı oluşur ve grafik çizilir', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test Kullanıcı', xp: 120 });
    // Geçmişi elle yaz (xpEkle normalde ders bitince doldur)
    await page.evaluate(() => {
      const bugun = new Date();
      const g = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() - i);
        const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        g.push({ tarih: k, xp: (i + 1) * 20 });
      }
      localStorage.setItem('sakar_gecmis', JSON.stringify(g));
    });

    await page.goto('/istatistik.html');
    await page.waitForTimeout(1800);

    // Grafik canvas'ı gerçekten çizilmeli
    const cizildi = await page.evaluate(() => {
      const cv = document.querySelector('canvas');
      if (!cv) return false;
      return cv.width > 0 && cv.height > 0;
    });
    expect(cizildi, 'Grafik canvas çizilmedi').toBe(true);

    // Isı haritası 84 kare olmalı (12 hafta)
    await expect(page.locator('.isi-kutu')).toHaveCount(84);
  });

  test('7/30 gün sekmesi çalışır', async ({ page }) => {
    await kayitYaz(page);
    await page.goto('/istatistik.html');
    await page.waitForTimeout(1600);

    const sekmeler = page.locator('.sekme button');
    await expect(sekmeler).toHaveCount(2);
    await sekmeler.nth(1).click();          // "Son 30 gün"
    await page.waitForTimeout(400);
    await expect(sekmeler.nth(1)).toHaveClass(/aktif/);
    await sekmeler.nth(0).click();
    await page.waitForTimeout(300);
    await expect(sekmeler.nth(0)).toHaveClass(/aktif/);
  });

  test('harf kaydı varsa harf kartları listelenir', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test Kullanıcı', seviye: 99 });
    await page.evaluate(() => {
      // Birkaç harf kaydı yaz (kana id'leri kana.js'ten)
      // Gerçek kana id'leri alfabe önekli: 'h:a' / 'k:a'
      localStorage.setItem('sakar_kana', JSON.stringify({
        'h:a': { d: 8, y: 1, kutu: 5, gun: '2020-01-01', sonra: '2030-01-01' },
        'h:ka': { d: 2, y: 5, kutu: 0, gun: '', sonra: '2020-01-01' },
        'h:sa': { d: 4, y: 3, kutu: 2, gun: '2020-01-01', sonra: '2020-02-01' }
      }));
    });
    await page.goto('/istatistik.html');
    await page.waitForTimeout(1800);
    await expect(page.locator('.harf-kart')).toHaveCount(3);
    // En zayıf harf ('h:ka': %28 doğru) ilk sırada olmalı ve JAPONCA harf görünmeli
    const ilk = await page.locator('.harf-kart').first().textContent();
    expect(ilk, 'Harf görünmüyor ("?" çıkıyor olabilir)').toMatch(/か/);
    expect(ilk).toMatch(/ka/);   // romaji de yazılmalı
  });

  test('konsol hatası ve 404 yok', async ({ page }) => {
    const t = hataToplayici(page);
    await kayitYaz(page);
    await page.goto('/istatistik.html');
    await page.waitForTimeout(2500);
    expect(t.hatalar(), 'İstatistik sayfasında konsol hatası:\n' + t.hatalar().join('\n')).toEqual([]);
    expect(t.istekler(), 'İstatistik sayfasında başarısız istek:\n' + t.istekler().join('\n')).toEqual([]);
  });
});

// Can emojisi (❤️) tek bir "karakter" ama JS'te 2 kod birimi kapsar.
// Bu yüzden .length ile saymak yanıltıcıdır (6 kalp -> 12).
// Emoji dizilerini doğru sayan yardımcı:
function kalpSayisi(page) {
  return page.evaluate(() => {
    const t = document.getElementById('canlar').textContent;
    return Array.from(t.trim()).filter(c => c === '❤').length;
  });
}

test.describe('Zorluk ayarı ders motorunu etkiler', () => {

  test('Kolay seçilince 6 can, Zorlu seçilince 3 can gösterilir', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test Kullanıcı', seviye: 99 });
    await page.evaluate(() => {
      localStorage.setItem('sakar_ayarlar', JSON.stringify({ zorluk: 'kolay' }));
    });
    await page.goto('/oyun.html?ders=1');
    await page.waitForTimeout(1800);
    expect(await kalpSayisi(page), 'Kolay: 6 can bekleniyordu').toBe(6);

    await page.evaluate(() => {
      localStorage.setItem('sakar_ayarlar', JSON.stringify({ zorluk: 'zor' }));
    });
    await page.goto('/oyun.html?ders=1');
    await page.waitForTimeout(1800);
    expect(await kalpSayisi(page), 'Zorlu: 3 can bekleniyordu').toBe(3);
  });

  test('sınav (boss) canı zorluk ayarından ETKİLENMEZ', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test Kullanıcı', seviye: 99 });
    await page.evaluate(() => {
      localStorage.setItem('sakar_ayarlar', JSON.stringify({ zorluk: 'zor' }));
    });
    // ders 13 = "Hiragana Sınavı" (boss, can: 5)
    await page.goto('/oyun.html?ders=13');
    await page.waitForTimeout(2200);
    expect(await kalpSayisi(page), 'Sınav 5 can olmalı (zorluk 3 yapmamalı)').toBe(5);
  });

  test('ayar yoksa eski davranış: 4 can', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test Kullanıcı', seviye: 99 });
    await page.evaluate(() => localStorage.removeItem('sakar_ayarlar'));
    await page.goto('/oyun.html?ders=1');
    await page.waitForTimeout(1800);
    expect(await kalpSayisi(page), 'Ayar yoksa 4 can bekleniyordu').toBe(4);
  });
});

test.describe('Tema tüm sayfalarda geçerli', () => {

  for (const yol of ['/dojo.html', '/kelime.html', '/oyun.html?ders=1']) {
    test(`${yol} koyu temayı uygular`, async ({ page }) => {
      await kayitYaz(page, { isim: 'Test Kullanıcı', seviye: 99 });
      await page.evaluate(() => {
        localStorage.setItem('sakar_ayarlar', JSON.stringify({ tema: 'gece' }));
      });
      await page.goto(yol);
      await page.waitForTimeout(1800);
      const n = await page.evaluate(() => document.documentElement.getAttribute('data-tema'));
      expect(n, yol + ' gece temasını uygulamadı').toBe('gece');
    });
  }
});
