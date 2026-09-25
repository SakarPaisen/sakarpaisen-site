// GÜNLÜK GÖREVLER + BAŞARIMLAR: doğru çalışıyor mu?
// Bu iki sistem oyunu bağımlılık yapan taraf; bozulursa sessizce
// "hiç görev gelmiyor" der ve kimse fark etmez. Testle korunur.
import { test, expect } from '@playwright/test';
import { kayitYaz, sikSorusunaGel } from './_yardimci.mjs';

test.describe('Günlük görevler', () => {

  test('her gün 3 görev üretilir ve sayfa yenilenince DEĞİŞMEZ', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const ilk = await page.evaluate(() => Gorevler.liste().map(g => g.id));
    expect(ilk.length, '3 görev bekleniyordu').toBe(3);

    // Sayfayı yenile: aynı gün aynı görevler gelmeli (tarihten türetiliyor)
    await page.reload();
    await page.waitForTimeout(2000);
    const ikinci = await page.evaluate(() => Gorevler.liste().map(g => g.id));
    expect(ikinci, 'Görevler yenilemede değişti (tutarlı olmalı)').toEqual(ilk);
  });

  test('görevler panelde görünür ve ilerleme çubuğu var', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2200);

    await expect(page.locator('#gorevKutu')).toBeVisible();
    await expect(page.locator('#gorevListe .gorev-satir')).toHaveCount(3);
    await expect(page.locator('#gorevListe .gorev-bar')).toHaveCount(3);
  });

  test('ders bitince ders görevinin ilerlemesi artar', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    // "ders_bitti" tipindeki görevi bul
    const onceki = await page.evaluate(() => {
      const g = Gorevler.liste().find(x => x.id === 'ders-1' || x.id === 'ders-2' || x.id === 'ders-3');
      return g ? { id: g.id, ilerleme: g.ilerleme } : null;
    });
    expect(onceki, 'Ders görevi bulunamadı').not.toBe(null);

    // Bir ders tamamla: şıkları doğru cevaplayarak ilerle
    await sikSorusunaGel(page, 1);
    // Ders görevini doğrudan tetikle (ders bitirmek uzun sürer; olay zinciri test edilir)
    await page.evaluate(() => {
      window.Gorevler.olay('ders_bitti', 1);
    });

    const sonraki = await page.evaluate((id) => {
      const g = Gorevler.liste().find(x => x.id === id);
      return g ? g.ilerleme : null;
    }, onceki.id);

    expect(sonraki, 'Ders görevi ilerlemedi').toBeGreaterThan(onceki.ilerleme);
  });

  test('hedefe ulaşınca görev tamamlanır ve ödül bildirilir', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const sonuc = await page.evaluate(() => {
      // 3 ders olayı gönder: 'ders-N' görevlerinin hedefi en fazla 3
      for (let i = 0; i < 3; i++) Gorevler.olay('ders_bitti', 1);
      const l = Gorevler.liste();
      const ders = l.find(x => x.id.indexOf('ders-') === 0);
      return { tamam: ders.tamam, ilerleme: ders.ilerleme, hedef: ders.hedef, ozet: Gorevler.ozet() };
    });

    expect(sonuc.tamam, '3 ders sonrası görev tamamlanmalıydı').toBe(true);
    expect(sonuc.ilerleme).toBe(sonuc.hedef);
    expect(sonuc.ozet.tamam).toBeGreaterThan(0);
  });

  test('tamamlanan görev XP ödülü verir (odulHesapla > 0)', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const odul = await page.evaluate(() => {
      let t = [];
      for (let i = 0; i < 3; i++) t = t.concat(Gorevler.olay('ders_bitti', 1) || []);
      // Ödül DÖNEN diziden hesaplanır (app.js de böyle yapar)
      return { odul: Gorevler.odulHesapla(t), tamamlananSayisi: t.length };
    });
    expect(odul.tamamlananSayisi, 'Görev tamamlanmadı').toBeGreaterThan(0);
    expect(odul.odul, 'Görev ödülü hesaplanmadı').toBeGreaterThan(0);
  });

  test('gün değişince görevler sıfırlanır', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const durum = await page.evaluate(() => {
      // İlerleme kaydet
      Gorevler.olay('ders_bitti', 2);
      const dolu = Gorevler.liste().some(g => g.ilerleme > 0);
      // Eski tarihli kayıt yaz (dün yapılmış gibi)
      const k = JSON.parse(localStorage.getItem('sakar_gorevler'));
      k.tarih = '2020-01-01';
      localStorage.setItem('sakar_gorevler', JSON.stringify(k));
      // liste() günü kontrol edip sıfırlamalı
      const temiz = Gorevler.liste().every(g => g.ilerleme === 0 && !g.tamam);
      return { dolu, temiz };
    });

    expect(durum.dolu, 'Görev ilerlemesi kaydedilmedi').toBe(true);
    expect(durum.temiz, 'Gün değişince görevler sıfırlanmadı').toBe(true);
  });
});

test.describe('Başarımlar', () => {

  test('liste yüklenir ve kilitli/açık durumu doğru', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99, xp: 800 });
    await page.goto('/istatistik.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => ({
      toplam: Basarimlar.LISTE.length,
      ozet: Basarimlar.ozet(),
      ilkAdim: Basarimlar.acikMi('ilk-adim'),
      seri100: Basarimlar.acikMi('seri-100')
    }));
    expect(d.toplam).toBeGreaterThan(15);
    // seviye 99 + 800 XP: 'ilk-adim' açık, 'seri-100' (100 gün) kapalı olmalı
    expect(d.ilkAdim, '"İlk Adım" açılmalıydı (seviye 99)').toBe(true);
    expect(d.seri100, '"Yüz Gün" açılmamalı (seri 100 değil)').toBe(false);
    expect(d.ozet.acilan).toBeGreaterThan(0);
    expect(d.ozet.acilan).toBeLessThan(d.toplam);
  });

  test('kontrol() yeni açılanları döndürür, ikinci kez döndürmez', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => {
      // Temiz başla
      Basarimlar.sifirla();
      const birinci = Basarimlar.kontrol().map(b => b.id);
      const ikinci = Basarimlar.kontrol().map(b => b.id);   // artık yeni olmamalı
      return { birinci: birinci.length, ikinci: ikinci.length };
    });
    expect(d.birinci, 'İlk kontrolde başarım açılmalıydı').toBeGreaterThan(0);
    expect(d.ikinci, 'Aynı başarım iki kez açıldı (kutlama tekrar çıkar)').toBe(0);
  });

  test('dojo panelinde başarım kutusu ve ilerleme çubuğu var', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99, xp: 600 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2200);

    await expect(page.locator('#basarimKutu')).toBeVisible();
    const kutuSayisi = await page.locator('#basarimMini .basarim-kutu').count();
    expect(kutuSayisi, 'Başarım kutuları çizilmedi').toBeGreaterThan(0);

    const yazi = await page.locator('#basarimYazi').textContent();
    expect(yazi).toMatch(/başarım/);
  });

  test('başarım bandı ekranda belirir ve kaybolur', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    // Sayfa açılışında zaten başarım bantları çıkmış olabilir (hak edilenler).
    // Hepsini temizle ve kutlamanın durmasını bekle, sonra TEK bant ekle.
    await page.evaluate(() => {
      document.querySelectorAll('.basarim-bant').forEach(x => x.remove());
      window.__testBantEklendi = false;
    });

    await page.evaluate(() => {
      Basarimlar.kutlamaGoster(
        [{ id: 'test', ad: 'Test Başarım', simge: '🎖️', aciklama: '' }],
        document.body
      );
      window.__testBantEklendi = true;
    });

    // Bant 700ms gecikmeyle gelir (kutlamaGoster setTimeout)
    await page.waitForTimeout(1500);
    // İçinde 'Test Başarım' yazan bant olmalı
    await expect(page.locator('.basarim-bant', { hasText: 'Test Başarım' })).toHaveCount(1);

    // 3.2 sn gösterim + 0.4 sn çıkış animasyonu → kaybolmalı
    await page.waitForTimeout(4800);
    await expect(page.locator('.basarim-bant', { hasText: 'Test Başarım' })).toHaveCount(0);
  });

  test('istatistik sayfasında TÜM başarımlar listelenir', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99, xp: 600 });
    await page.goto('/istatistik.html');
    await page.waitForTimeout(2200);

    const toplam = await page.evaluate(() => Basarimlar.LISTE.length);
    await expect(page.locator('.basarim-kutu')).toHaveCount(toplam);
    // Grup başlıkları görünmeli (Yolculuk/Disiplin/Ustalık/Koleksiyon)
    const metin = await page.locator('#basarim').textContent();
    ['Yolculuk', 'Disiplin', 'Ustalık', 'Koleksiyon'].forEach(g => {
      expect(metin, g + ' grubu eksik').toContain(g);
    });
  });

  test('konsol hatası ve 404 yok', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    const hatalar = [];
    page.on('console', m => { if (m.type() === 'error') hatalar.push(m.text()); });
    page.on('pageerror', e => hatalar.push('SAYFAHATASI: ' + e.message));

    await page.goto('/dojo.html');
    await page.waitForTimeout(2500);
    await page.goto('/istatistik.html');
    await page.waitForTimeout(2200);
    expect(hatalar, 'Konsol hatası:\n' + hatalar.join('\n')).toEqual([]);
  });
});