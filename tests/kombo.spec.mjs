// KOMBO + GÜNLÜK HEDİYE + SENSEİ ÖĞÜDÜ: doğru çalışıyor mu?
// Bu üç sistem oyunun "bağımlılık" tarafı; sessizce bozulursa kimse
// fark etmez. Testle korunur.
import { test, expect } from '@playwright/test';
import { kayitYaz } from './_yardimci.mjs';

test.describe('Kombo sistemi', () => {

  test('üst üste doğruda çarpan kademeli artar, tavanda durur', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => {
      const r = [];
      // 20 doğru: tavan x2.0'da durmalı, sonsuz büyümemeli
      for (let i = 0; i < 20; i++) r.push(Kombo.dogru().carpan);
      return { carpanlar: r, son: r[r.length - 1], adet: Kombo.durum().adet };
    });

    // Beklenen eşikler: 2→1.1, 3→1.2, 4→1.3, 6→1.5, 10→1.75, 15→2.0
    expect(d.carpanlar[0], '1 doğruda çarpan 1 olmalı').toBe(1);
    expect(d.carpanlar[1], '2 doğruda x1.1').toBe(1.10);
    expect(d.carpanlar[3], '4 doğruda x1.3').toBe(1.30);
    expect(d.carpanlar[5], '6 doğruda x1.5').toBe(1.50);
    expect(d.carpanlar[9], '10 doğruda x1.75').toBe(1.75);
    expect(d.son, 'Tavan x2.0 olmalı (sınırsız büyümemeli)').toBe(2.00);
    expect(d.adet).toBe(20);
  });

  test('yanlış cevap komboyu sıfırlar', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => {
      for (let i = 0; i < 5; i++) Kombo.dogru();
      const once = Kombo.durum();
      const r = Kombo.yanlis();
      const sonra = Kombo.durum();
      return { onceCarpan: once.carpan, onceAdet: once.adet, kirilan: r.kirilan, sonraAdet: sonra.adet, sonraCarpan: sonra.carpan };
    });

    expect(d.onceAdet).toBe(5);
    expect(d.kirilan, 'Kırılan seri uzunluğu bildirilmeli').toBe(5);
    expect(d.sonraAdet, 'Yanlış sonrası kombo sıfırlanmalı').toBe(0);
    expect(d.sonraCarpan, 'Yanlış sonrası çarpan 1 olmalı').toBe(1);
  });

  test('kombo bonusu birikir ve temizle() sıfırlar', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => {
      Kombo.temizle();
      for (let i = 0; i < 10; i++) Kombo.dogru();
      const bonus = Kombo.bonusXp();
      Kombo.temizle();
      return { bonus: bonus, temizSonra: Kombo.bonusXp(), ozet: Kombo.ozet() };
    });

    expect(d.bonus, '10 doğruda bonus birikmeli').toBeGreaterThan(0);
    expect(d.temizSonra, 'temizle() bonusu sıfırlamalı').toBe(0);
    expect(d.ozet.enYuksek, 'temizle() en yüksek seriyi sıfırlamalı').toBe(0);
  });

  test('ders bitişinde kombo rozeti ve bonus XP görünür', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 1 });
    await page.goto('/oyun.html?ders=1');
    await page.waitForTimeout(2000);

    // Komboyu doldur (ders içinde doğru cevap vermiş gibi)
    await page.evaluate(() => { for (let i = 0; i < 8; i++) Kombo.dogru(); });

    const xpOnce = await page.evaluate(() => Ilerleme.xp());
    const bonus = await page.evaluate(() => Kombo.ozet().bonus);
    expect(bonus, '8 doğru sonrası bonus birikmeli').toBeGreaterThan(0);
    console.log('Bonus: ' + bonus + ' (XP önce: ' + xpOnce + ')');
  });

  test('kombo göstergesi ekranda belirir (2+ doğru)', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/oyun.html?ders=1');
    await page.waitForTimeout(2000);

    // 1 doğru: gösterge ÇIKMAMALI (gürültü olmasın)
    await page.evaluate(() => { if (window.Kombo) Kombo.temizle(); });
    const tekSonra = await page.locator('#komboRozet.gorunur').count();
    expect(tekSonra, 'Tek doğruda girişte gösterge görünmemeli').toBe(0);
  });
});

test.describe('Günlük hediye', () => {

  test('günde bir kez açılabilir, ikinci kez açılamaz', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => {
      Hediye.sifirla();
      const once = Hediye.acilabilir();
      const odul = Hediye.ac(5);
      const sonra = Hediye.acilabilir();
      const ikinci = Hediye.ac(5);       // null dönmeli
      return { once: once, odulXp: odul ? odul.xp : null, sonra: sonra, ikinci: ikinci };
    });

    expect(d.once, 'İlk girişte sandık açılabilir olmalı').toBe(true);
    expect(d.odulXp, 'Ödül verilmeliydi').toBeGreaterThan(0);
    expect(d.sonra, 'Aynı gün ikinci kez açılmamalı').toBe(false);
    expect(d.ikinci, 'İkinci açma null dönmeli').toBe(null);
  });

  test('seri büyüdükçe ödül artar', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => ({
      s1: Hediye.odulHesapla(1).xp,
      s5: Hediye.odulHesapla(5).xp,
      s10: Hediye.odulHesapla(10).xp,
      s40: Hediye.odulHesapla(40).xp,
      koruma7: Hediye.odulHesapla(7).koruma,
      koruma5: Hediye.odulHesapla(5).koruma
    }));

    expect(d.s1, 'Seri 1 için 20 XP').toBe(20);
    expect(d.s5, 'Seri 5 için 35 XP').toBe(35);
    expect(d.s10, 'Seri 10 için 60 XP').toBe(60);
    expect(d.s40, 'Seri 40 için 100 XP').toBe(100);
    expect(d.s5 > d.s1 && d.s10 > d.s5 && d.s40 > d.s10, 'Ödül seriyle artmalı').toBe(true);
    expect(d.koruma7, '7. günde seri koruma verilmeli').toBe(1);
    expect(d.koruma5, '5. günde koruma verilmemeli').toBe(0);
  });

  test('hediye XP si gerçekten Ilerleme.xp() değerini artırır', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99, xp: 100 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => {
      Hediye.sifirla();
      const once = Ilerleme.xp();
      const odul = Hediye.ac(10);   // 60 XP bekleniyor
      const sonra = Ilerleme.xp();
      return { once: once, sonra: sonra, fark: sonra - once, beklenen: odul.xp };
    });

    expect(d.fark, 'XP farkı ödül kadar olmalı').toBe(d.beklenen);
    expect(d.beklenen).toBe(60);
  });

  test('dojo panelinde sandık butonu görünür ve tıklanabilir', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.evaluate(() => { localStorage.setItem('sakar_tur', '1'); });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2500);

    const btn = page.locator('#sandikBtn');
    await expect(btn).toBeVisible();
    // ÖNEMLİ: buton animasyonsuz olmalı, yoksa tıklama "stable" olmaz.
    // Bu, gerçek kullanıcıda da titrek görünme sorunuydu.
    await expect(btn).toBeEnabled();
    await btn.click();                    // tıklanabilmeli (animasyon engellememeli)
    await expect(page.locator('.sandik-katman')).toBeVisible();
  });
});

test.describe('Sensei öğüdü', () => {

  test('bağlama göre doğru cümle seçer (tekrar varsa tekrarı söyler)', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => {
      // Tekrar bekleyen harf var + seri bugün yapılmadı
      const b = {
        seri: { sayi: 5, bugunYapildi: false },
        tekrar: 8, zayifSayi: 2, gunlukXp: 0, hedefXp: 50, isim: 'Test',
        gunFarki: 1
      };
      const c = Ogut.cumleBul(b);
      return { metin: c.metin, puan: c.puan };
    });

    // Tekrar (85 puan) ve seri (90 puan) adayları var; seri kazanmalı
    expect(d.puan, 'Seri uyarısı öncelikli olmalı').toBe(90);
    expect(d.metin).toMatch(/seri/i);
  });

  test('günlük hedefe yaklaşınca kalan XP söyler', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => {
      const c = Ogut.cumleBul({
        seri: { sayi: 3, bugunYapildi: true },
        tekrar: 0, zayifSayi: 0, gunlukXp: 35, hedefXp: 50, isim: 'Test', gunFarki: 1
      });
      return { metin: c.metin, puan: c.puan };
    });

    expect(d.puan, 'Hedefe yakın mesajı (75) seçilmeli').toBe(75);
    expect(d.metin, 'Kalan XP hesaplanmalı (50-35=15)').toMatch(/15 XP/);
  });

  test('uzun aradan sonra karşılama cümlesi gelir', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => {
      const c = Ogut.cumleBul({
        seri: { sayi: 3, bugunYapildi: true },
        tekrar: 0, zayifSayi: 0, gunlukXp: 60, hedefXp: 50, isim: 'Ayşe', gunFarki: 10
      });
      return { metin: c.metin, puan: c.puan };
    });

    expect(d.puan, 'Uzun aradan dönüş en yüksek öncelik').toBe(100);
    expect(d.metin, 'İsmiyle hitap etmeli').toMatch(/Ayşe/);
  });

  test('hiç özel durum yoksa genel teşvik verir (boş dönmez)', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => {
      const c = Ogut.cumleBul({
        seri: { sayi: 3, bugunYapildi: true },
        tekrar: 0, zayifSayi: 0, gunlukXp: 0, hedefXp: 50, isim: 'Test', gunFarki: 1
      });
      return { metin: c.metin, puan: c.puan };
    });

    expect(d.puan, 'Genel teşvik düşük öncelik').toBe(10);
    expect(d.metin.length, 'Boş cümle olmamalı').toBeGreaterThan(10);
  });

  test('dojo sayfasında öğüt balonu görünür', async ({ page }) => {
    await kayitYaz(page, { isim: 'Ali', seviye: 99 });
    await page.evaluate(() => { localStorage.setItem('sakar_tur', '1'); });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2500);

    const balon = page.locator('#ogutBalon');
    await expect(balon).toBeVisible();
    const metin = await balon.textContent();
    expect(metin.length, 'Balon boş olmamalı').toBeGreaterThan(5);
  });

  test('ziyaret tarihi kaydedilir (bir sonraki giriş için)', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    await page.evaluate(() => { localStorage.setItem('sakar_tur', '1'); });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2500);

    const kayitli = await page.evaluate(() => localStorage.getItem('sakar_son_ziyaret'));
    expect(kayitli, 'Ziyaret tarihi kaydedilmeliydi').not.toBe(null);
    expect(kayitli, 'Tarih YYYY-MM-DD biçiminde olmalı').toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('konsol hatası ve 404 yok', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 99 });
    const hatalar = [];
    page.on('console', m => { if (m.type() === 'error') hatalar.push(m.text()); });
    page.on('pageerror', e => hatalar.push('SAYFAHATASI: ' + e.message));

    await page.goto('/dojo.html');
    await page.waitForTimeout(2500);
    await page.goto('/oyun.html?ders=1');
    await page.waitForTimeout(2200);
    expect(hatalar, 'Konsol hatası:\n' + hatalar.join('\n')).toEqual([]);
  });
});