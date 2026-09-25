// YANLIŞ DEFTERİ + SINAV MODU
// Bu iki sistem kullanıcının GERÇEK zayıflığına göre çalışır. Bozulursa
// sessizce "rastgele sınav" hâline döner — kimse fark etmez. Testle korunur.
import { test, expect } from '@playwright/test';
import { kayitYaz, hataToplayici } from './_yardimci.mjs';

// Öğrenilmiş harf kaydı + karıştırma çiftleri hazırla
// ÖNEMLİ: "normal" harfler BİLİNEN ve güncel tarihli olmalı (sonra: ileri
// tarih). Aksi hâlde hepsi "tekrar zamanı gelmiş" sayılır ve ağırlık testi
// anlamsızlaşır — bu, ilk yazdığım testin hatasıydı.
async function harfVerisi(page, ciftler) {
  await kayitYaz(page, { isim: 'Test', seviye: 55, xp: 780 });
  await page.evaluate((c) => {
    const ILERI = '2030-01-01';   // tekrar zamanı GELMEMİŞ (normal harf)
    const kana = {
      'h:a': { d: 8, y: 1, kutu: 4, gun: '2020-01-01', sonra: ILERI },
      'h:i': { d: 7, y: 0, kutu: 5, gun: '2020-01-01', sonra: ILERI },
      'h:u': { d: 9, y: 0, kutu: 5, gun: '2020-01-01', sonra: ILERI },
      'h:e': { d: 6, y: 1, kutu: 3, gun: '2020-01-01', sonra: ILERI },
      'h:o': { d: 9, y: 1, kutu: 5, gun: '2020-01-01', sonra: ILERI },
      'h:ka': { d: 8, y: 1, kutu: 2, gun: '2020-01-01', sonra: ILERI },
      'h:ki': { d: 9, y: 0, kutu: 1, gun: '2020-01-01', sonra: ILERI },
      'h:ku': { d: 8, y: 1, kutu: 4, gun: '2020-01-01', sonra: ILERI },
      'h:ke': { d: 9, y: 0, kutu: 3, gun: '2020-01-01', sonra: ILERI },
      'h:ko': { d: 7, y: 1, kutu: 3, gun: '2020-01-01', sonra: ILERI },
      'h:sa': { d: 8, y: 0, kutu: 2, gun: '2020-01-01', sonra: ILERI },
      'h:su': { d: 9, y: 1, kutu: 1, gun: '2020-01-01', sonra: ILERI },
      // SADECE bu ikisi sorunlu: sürekli yanlış yapılan + karıştırılan
      'h:shi': { d: 1, y: 6, kutu: 0, gun: '', sonra: '2020-01-01' },
      'h:tsu': { d: 2, y: 7, kutu: 0, gun: '', sonra: '2020-01-01' },
      'k:ka': { d: 8, y: 1, kutu: 3, gun: '2020-01-01', sonra: ILERI },
      'k:ki': { d: 9, y: 0, kutu: 2, gun: '2020-01-01', sonra: ILERI }
    };
    localStorage.setItem('sakar_kana', JSON.stringify(kana));
    if (c) localStorage.setItem('sakar_ciftler', JSON.stringify(c));
  }, ciftler || null);
}

const ORNEK_CIFTLER = {
  'h:shi|h:tsu': { n: 6, son: '2024-05-12' },
  'h:u|h:o': { n: 2, son: '2024-05-10' },
  'h:ka|h:ki': { n: 3, son: '2024-05-11' }
};

test.describe('Yanlış defteri (karıştırılan harfler)', () => {

  test('karıştırma kaydedilir ve tekrar okunur', async ({ page }) => {
    await harfVerisi(page);
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => {
      Yanlis.sifirla();
      Yanlis.ciftKaydet('h:shi', 'h:tsu');
      Yanlis.ciftKaydet('h:shi', 'h:tsu');
      const r = Yanlis.rapor();
      return { ciftSayisi: r.ciftSayisi, toplam: r.toplam, enCok: r.enCok[0] };
    });

    expect(d.ciftSayisi, 'Bir çift kaydedilmeliydi').toBe(1);
    expect(d.toplam, 'İki kayıt toplamı 2 olmalı').toBe(2);
    expect(d.enCok.n).toBe(2);
  });

  test('SIRALI kayıt: (a,b) ile (b,a) AYNI çift sayılır', async ({ page }) => {
    await harfVerisi(page);
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => {
      Yanlis.sifirla();
      Yanlis.ciftKaydet('h:shi', 'h:tsu');   // し verdi, doğru つ
      Yanlis.ciftKaydet('h:tsu', 'h:shi');   // ters yön: つ verdi, doğru し
      const r = Yanlis.rapor();
      return { ciftSayisi: r.ciftSayisi, toplam: r.toplam };
    });

    // Ters yön de AYNI çifti beslemeli, ayrı kayıt olmamalı
    expect(d.ciftSayisi, 'Ters yön ayrı çift oluşturmamalı').toBe(1);
    expect(d.toplam, 'İki yön toplamı 2 olmalı').toBe(2);
  });

  test('en çok karıştırılanlar doğru sıralanır', async ({ page }) => {
    await harfVerisi(page, ORNEK_CIFTLER);
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => Yanlis.enCokKaristirilan(3));
    expect(d.length).toBe(3);
    expect(d[0].n, 'En çok karıştırılan 6 kez olan çift').toBe(6);
    expect(d[1].n).toBe(3);
    expect(d[2].n).toBe(2);
  });

  test('zorSiklar: çok karıştırılan partneri döndür', async ({ page }) => {
    await harfVerisi(page, ORNEK_CIFTLER);
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => ({
      shi: Yanlis.zorSiklar('h:shi', 2),
      tsu: Yanlis.zorSiklar('h:tsu', 2),
      hic: Yanlis.zorSiklar('h:su', 2)
    }));

    expect(d.shi, 'し sorulunca つ zor şık olmalı').toContain('h:tsu');
    expect(d.tsu, 'つ sorulunca し zor şık olmalı').toContain('h:shi');
    expect(d.hic, 'Hiç karıştırılmamış harfte zor şık olmamalı').toEqual([]);
  });

  test('aynı harf kendisiyle çift oluşturmaz', async ({ page }) => {
    await harfVerisi(page);
    await page.goto('/dojo.html');
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => {
      Yanlis.sifirla();
      Yanlis.ciftKaydet('h:a', 'h:a');     // aynı harf: kaydedilmemeli
      Yanlis.ciftKaydet(null, 'h:a');      // boş: kaydedilmemeli
      return Yanlis.rapor().ciftSayisi;
    });
    expect(d, 'Geçersiz kayıtlar yok sayılmalı').toBe(0);
  });

  test('istatistik sayfasında karıştırılan harfler bölümü çizilir', async ({ page }) => {
    await harfVerisi(page, ORNEK_CIFTLER);
    await page.goto('/istatistik.html');
    await page.waitForTimeout(2400);

    await expect(page.locator('.cift-satir')).toHaveCount(3);
    const metin = await page.locator('.cift-liste').textContent();
    expect(metin, 'Japonca harfler görünmeli').toMatch(/し|つ/);
    expect(metin, 'Kaç kez karıştırıldığı yazmalı').toMatch(/6 kez/);
  });

  test('karıştırma yoksa bölüm hiç çıkmaz', async ({ page }) => {
    await harfVerisi(page);   // çift yok
    await page.goto('/istatistik.html');
    await page.waitForTimeout(2400);
    await expect(page.locator('.cift-satir')).toHaveCount(0);
  });
});

test.describe('Sınav modu', () => {

  test('?ders=sinav gerçekten sınav açar (ders 1 DEĞİL)', async ({ page }) => {
    await harfVerisi(page, ORNEK_CIFTLER);
    await page.goto('/oyun.html?ders=sinav');
    await page.waitForTimeout(2600);

    // ÖNEMLİ: parseInt('sinav')=NaN, NaN||1=1 olduğu için sınav isteği
    // DERS 1'i açıyordu (\"İlk harfimiz!\" öğretim kartı çıkıyordu).
    // Bu test o hatanın geri gelmesini engeller.
    const sahne = await page.locator('#sahne').textContent();
    expect(sahne, 'Sınav açılmalı, ders 1 değil').not.toMatch(/İlk harfimiz/i);

    // Şıklı soru gelmeli
    const secenekVar = await page.locator('.secenek').count();
    expect(secenekVar, 'Sınavda şıklı soru olmalı').toBeGreaterThan(0);
  });

  test('sınavda 3 can olur (normal derste 4)', async ({ page }) => {
    await harfVerisi(page, ORNEK_CIFTLER);
    await page.goto('/oyun.html?ders=sinav');
    await page.waitForTimeout(2600);

    const canMetni = await page.locator('#canlar').textContent();
    // Kalp emojisi (❤️) tek karakter ama 2 kod birimi; doğru sayalım
    const sayi = Array.from(canMetni.trim()).filter(c => c === '❤').length;
    expect(sayi, 'Sınavda 3 can bekleniyordu').toBe(3);
  });

  test('uret(): her soruda doğru cevap şıklarda VAR', async ({ page }) => {
    await harfVerisi(page, ORNEK_CIFTLER);
    await page.goto('/oyun.html?ders=sinav');
    await page.waitForTimeout(2600);

    const d = await page.evaluate(() => {
      const s = Sinav.uret();
      if (!s) return { hata: 'uret() null döndü' };
      return {
        adimSayisi: s.adimlar.length,
        // Çözülemez soru olmamalı: doğru cevap şıklarda bulunmalı
        dogruSiktaYok: s.adimlar.filter(a => a.siklar.indexOf(a.dogru) === -1).length,
        // Her soruda 4 şık olmalı
        eksikSik: s.adimlar.filter(a => a.siklar.length !== 4).length,
        // Şıklar içinde tekrar olmamalı
        tekrarSik: s.adimlar.filter(a => new Set(a.siklar).size !== a.siklar.length).length,
        tipler: [...new Set(s.adimlar.map(a => a.tip))]
      };
    });

    expect(d.adimSayisi, 'Sınav soru üretmeliydi').toBeGreaterThan(0);
    expect(d.dogruSiktaYok, 'Doğru cevabı olmayan soru var (çözülemez!)').toBe(0);
    expect(d.eksikSik, 'Şık sayısı 4 olmayan soru var').toBe(0);
    expect(d.tekrarSik, 'Aynı şık iki kez var').toBe(0);
    expect(d.tipler.length, 'Soru tipleri çeşitli olmalı').toBeGreaterThan(1);
  });

  test('uret() şema doğru: motorun beklediği alanlar', async ({ page }) => {
    await harfVerisi(page, ORNEK_CIFTLER);
    await page.goto('/oyun.html?ders=sinav');
    await page.waitForTimeout(2600);

    const d = await page.evaluate(() => {
      const s = Sinav.uret();
      return s.adimlar.map(a => ({
        tip: a.tip,
        kVar: !!a.k,                    // harf id
        siklarVar: Array.isArray(a.siklar),
        dogruVar: !!a.dogru,
        // 'soru' tipinde buyuk (gösterilen harf) olmalı
        soruTipiDogru: a.tip === 'soru' ? !!a.buyuk : true,
        // 'dinle' tipinde ses olmalı
        dinleTipiDogru: a.tip === 'dinle' ? !!a.ses : true
      }));
    });

    expect(d.filter(a => !a.kVar).length, 'k (harf id) eksik adım var').toBe(0);
    expect(d.filter(a => !a.siklarVar).length, 'siklar dizisi eksik').toBe(0);
    expect(d.filter(a => !a.dogruVar).length, 'dogru eksik').toBe(0);
    expect(d.filter(a => !a.soruTipiDogru).length, '"soru" tipinde buyuk eksik').toBe(0);
    expect(d.filter(a => !a.dinleTipiDogru).length, '"dinle" tipinde ses eksik').toBe(0);
  });

  test('karıştırılan harfler sınavda AĞIRLIKLI sorulur', async ({ page }) => {
    await harfVerisi(page, ORNEK_CIFTLER);
    await page.goto('/oyun.html?ders=sinav');
    await page.waitForTimeout(2600);

    // ÖNEMLİ — HAVUZ SORU SAYISINDAN BÜYÜK OLMALI:
    // Ağırlıklandırma ancak havuzda seçilemeyecek harf kalıyorsa anlam taşır.
    // 20 soru / 12 harflik havuzda HER harf zaten seçilmek zorunda kalır ve
    // dağılım eşitlenir (ölçüm: sorunlu 300, sağlam 300). Bu, ilk testimin
    // neden yanıltıcı olduğunu açıklıyor. Gerçek kullanımda 46+ harf vardır.
    // Bu yüzden havuzu genişletip öyle ölçüyoruz.
    const d = await page.evaluate(() => {
      // KANA'dan geniş bir havuz al (gerçek kullanım gibi)
      const tumHiragana = Object.keys(KANA).filter(id => KANA[id].a === 'h');
      const sorunlu = ['h:shi', 'h:tsu'].filter(id => tumHiragana.indexOf(id) !== -1);
      const saglam = tumHiragana.filter(id => sorunlu.indexOf(id) === -1);

      const sayac = {};
      for (let i = 0; i < 300; i++) {
        // Havuzun TAMAMI geçilir ama 20 soru istenir (gerçek durum)
        Sinav.agirlikliSec(tumHiragana, 20).forEach(id => {
          sayac[id] = (sayac[id] || 0) + 1;
        });
      }

      const sorunluOrt = sorunlu.reduce((t, id) => t + (sayac[id] || 0), 0) /
        Math.max(sorunlu.length, 1);
      const saglamOrt = saglam.reduce((t, id) => t + (sayac[id] || 0), 0) /
        Math.max(saglam.length, 1);

      return {
        havuzSayisi: tumHiragana.length,
        sorunluOrt: Math.round(sorunluOrt),
        saglamOrt: Math.round(saglamOrt),
        kat: sorunluOrt / Math.max(saglamOrt, 1)
      };
    });

    expect(d.havuzSayisi, 'Havuz yeterince geniş değil').toBeGreaterThan(20);
    expect(d.kat, 'Karıştırılan harfler ağırlıklı gelmiyor (' +
      'sorunlu ort. ' + d.sorunluOrt + ', sağlam ort. ' + d.saglamOrt +
      ', havuz ' + d.havuzSayisi + ')').toBeGreaterThan(1.8);
  });

  test('dojo panelinde sınav kısayolu var ve çalışıyor', async ({ page }) => {
    await harfVerisi(page, ORNEK_CIFTLER);
    await page.evaluate(() => { localStorage.setItem('sakar_tur', '1'); });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2500);

    const link = page.locator('a[href="oyun.html?ders=sinav"]').first();
    await expect(link, 'Dojo panelinde sınav kısayolu yok').toBeVisible();
    await link.click();
    await page.waitForTimeout(2500);
    expect(page.url()).toMatch(/ders=sinav/);
  });

  test('sınavda yıldız KAYDEDİLMEZ (müfredat dairesi değil)', async ({ page }) => {
    await harfVerisi(page, ORNEK_CIFTLER);
    await page.goto('/oyun.html?ders=sinav');
    await page.waitForTimeout(2600);

    const d = await page.evaluate(() => {
      const y = JSON.parse(localStorage.getItem('sakar_yildiz') || '{}');
      return { sinavAnahtari: y['sinav'], anahtarlar: Object.keys(y) };
    });
    expect(d.sinavAnahtari, "sakar_yildiz['sinav'] yazılmamalı").toBe(undefined);
  });

  test('konsol hatası ve 404 yok', async ({ page }) => {
    const t = hataToplayici(page);
    await harfVerisi(page, ORNEK_CIFTLER);
    await page.goto('/oyun.html?ders=sinav');
    await page.waitForTimeout(3000);
    expect(t.hatalar(), 'Sınav konsol hatası:\n' + t.hatalar().join('\n')).toEqual([]);
    expect(t.istekler(), 'Sınav başarısız istek:\n' + t.istekler().join('\n')).toEqual([]);
  });
});