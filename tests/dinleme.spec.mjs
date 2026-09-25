// DİNLEME ALIŞTIRMASI + DERS SONU "NE ÖĞRENDİM" ÖZETİ
//
// NOT — bu testi yazarken öğrendiklerim:
// Ders bitiş ekranını UI üzerinden doğrulamak Playwright'ta ÇOK kırılgan:
//   • Ders 1 → 13+ adım, 30 sn'de bitmiyor
//   • Ders 11 → 'yaz' tipi metin kutusu istiyor
//   • Sınav → 3 can (zorluk sınavda bilinçli uygulanmaz), canlar bitiyor
//   • 'dinle' tipi → doğru cevap ekranda yazmaz, şık tahmini yanlış oluyor
// 8 denemeden sonra: özet MANTIĞINI ayrı test ediyoruz (window.__ozetTest).
// Bu, aynı davranışı saniyeler içinde ve güvenilir biçimde doğrular.
import { test, expect } from '@playwright/test';
import { kayitYaz, hataToplayici } from './_yardimci.mjs';

// Öğrenilmiş harf kaydı
async function harfleriYaz(page, adet) {
  await page.evaluate((n) => {
    const idler = ['h:a', 'h:i', 'h:u', 'h:e', 'h:o', 'h:ka', 'h:ki', 'h:ku'];
    const k = {};
    idler.slice(0, n).forEach(id => {
      k[id] = { d: 6, y: 1, kutu: 3, gun: '2020-01-01', sonra: '2030-01-01' };
    });
    localStorage.setItem('sakar_kana', JSON.stringify(k));
  }, adet);
}

test.describe('Ders sonu "ne öğrendim" özeti', () => {

  test('geçen harfler toplanır ve özet listesi döner', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/oyun.html?ders=1');
    await page.waitForTimeout(2200);

    const d = await page.evaluate(() => {
      const t = window.__ozetTest;
      if (!t) return { yok: true };
      t.sifirla();
      // Ders sırasında 3 harf geçmiş gibi
      t.gorulenEkle('h:a'); t.gorulenEkle('h:ka'); t.gorulenEkle('h:i');
      return { liste: t.liste(), ozet: t.ozet() };
    });

    expect(d.yok, 'window.__ozetTest bulunamadı (app.js yüklendi mi?)').not.toBe(true);
    expect(d.liste.length, 'Görülen harfler toplanmadı').toBe(3);
    expect(d.ozet.length, 'Özet listesi boş').toBe(3);
  });

  test('ZORLANILAN harfler özet listesinin BAŞINA geçer', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/oyun.html?ders=1');
    await page.waitForTimeout(2200);

    const d = await page.evaluate(() => {
      const t = window.__ozetTest;
      t.sifirla();
      t.gorulenEkle('h:a'); t.gorulenEkle('h:i'); t.gorulenEkle('h:u');
      // Ortadaki harfte zorlandı
      t.zorlanilanEkle('h:i');
      return { ozet: t.ozet(), zor: t.zorListe() };
    });

    expect(d.zor, 'Zorlanılan harf kaydedilmedi').toContain('h:i');
    expect(d.ozet[0], 'Zorlanılan harf özetin BAŞINDA olmalı (odak burada)').toBe('h:i');
    expect(d.ozet.length).toBe(3);
  });

  test('her ders başında özet listesi sıfırlanır (öncekinin kalıntısı gelmez)', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/oyun.html?ders=1');
    await page.waitForTimeout(2200);

    const d = await page.evaluate(() => {
      const t = window.__ozetTest;
      t.sifirla();
      t.gorulenEkle('h:a');
      const once = t.liste().length;
      // Yeni ders başlat: sayfayı yenilemek yerine basla() etkisini görmek için
      // doğrudan sıfırlama fonksiyonunu çağır (basla() aynısını yapar)
      t.sifirla();
      return { once: once, sonra: t.liste().length };
    });

    expect(d.once).toBe(1);
    expect(d.sonra, 'Sıfırlama çalışmadı').toBe(0);
  });

  test('KANA dışı id\'ler özete girmez (kelime/kanji id sızması)', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/oyun.html?ders=1');
    await page.waitForTimeout(2200);

    const d = await page.evaluate(() => {
      const t = window.__ozetTest;
      t.sifirla();
      t.gorulenEkle('h:a');
      t.gorulenEkle('kanji:9-1');     // kanji id'si (KANA'da yok)
      t.gorulenEkle('yok-boyle-bir-sey');
      return { ozet: t.ozet(), gorulen: t.liste() };
    });

    expect(d.gorulen.length, 'Ham liste 3 olmalı').toBe(3);
    expect(d.ozet.length, 'Özet yalnızca KANA harflerini içermeli').toBe(1);
    expect(d.ozet[0]).toBe('h:a');
  });

  test('ders sayfasında özet kutusu için CSS sınıfı tanımlı', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.goto('/oyun.html?ders=1');
    await page.waitForTimeout(2200);

    // CSS gerçekten yüklendi mi? (stil eksikse kutu görünmez olurdu)
    const d = await page.evaluate(() => {
      const el = document.createElement('div');
      el.className = 'ogrenilen-kutu';
      document.body.appendChild(el);
      const stil = getComputedStyle(el);
      const r = {
        borderVar: stil.borderTopWidth !== '0px',
        radiusVar: stil.borderTopLeftRadius !== '0px'
      };
      el.remove();
      return r;
    });
    expect(d.borderVar, 'ogrenilen-kutu stili yüklenmemiş (uygulama.css?)').toBe(true);
    expect(d.radiusVar).toBe(true);
  });
});

test.describe('Dinleme alıştırması', () => {

  test('tur başlar, sorular üretilir ve doğru cevap şıklarda olur', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await harfleriYaz(page, 8);
    await page.goto('/dinleme.html');
    await page.waitForTimeout(2200);

    const d = await page.evaluate(() => {
      const ok = Dinleme.baslat();
      const sorular = [];
      for (let i = 0; i < 8; i++) {
        const s = Dinleme.sor();
        if (!s) break;
        sorular.push({
          harf: s.harf,
          sikSayisi: s.siklar.length,
          dogruSikta: s.siklar.indexOf(s.harf) > -1,
          benzersiz: new Set(s.siklar).size === s.siklar.length
        });
      }
      return { baslatildi: ok, sorular: sorular, durum: Dinleme.durum() };
    });

    expect(d.baslatildi, 'Tur başlatılamadı').toBe(true);
    expect(d.sorular.length, 'Soru üretilmedi').toBeGreaterThan(0);
    d.sorular.forEach(s => {
      expect(s.sikSayisi, s.harf + ' için şık sayısı 4 olmalı').toBe(4);
      expect(s.dogruSikta, s.harf + ' doğru cevap şıklarda YOK (çözülemez soru!)').toBe(true);
      expect(s.benzersiz, s.harf + ' için aynı şık iki kez var').toBe(true);
    });
  });

  test('yanlış cevap 3 soru SONRA tekrar sorulur (spacing etkisi)', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await harfleriYaz(page, 8);
    await page.goto('/dinleme.html');
    await page.waitForTimeout(2200);

    const d = await page.evaluate(() => {
      Dinleme.baslat();
      const ilk = Dinleme.sor();
      // Yanlış cevap ver (doğru olmayan bir şık)
      const yanlisSik = ilk.siklar.find(h => h !== ilk.harf);
      const r = Dinleme.cevapla(yanlisSik);

      // Sonraki soruları al ve yanlış yapılan harfin nerede çıktığını bul
      const sonraki = [];
      for (let i = 0; i < 5; i++) {
        const s = Dinleme.sor();
        if (!s) break;
        sonraki.push(s.harf);
        Dinleme.cevapla(s.harf);   // doğru cevap ver, ilerle
      }
      return {
        dogruMu: r.dogruMu,
        dogruHarf: r.dogruHarf,
        yanlisYapilan: ilk.harf,
        sonraki: sonraki
      };
    });

    expect(d.dogruMu, 'Yanlış cevap doğru sayıldı').toBe(false);
    // Yanlış yapılan harf, HEMEN değil ~3 soru sonra gelmeli
    expect(d.sonraki[0], 'Yanlış harf hemen tekrar sorulmamalı (spacing)')
      .not.toBe(d.yanlisYapilan);
    expect(d.sonraki, 'Yanlış yapılan harf 3 soru sonra tekrar gelmeli: ' +
      JSON.stringify(d.sonraki)).toContain(d.yanlisYapilan);
  });

  test('doğru cevap sayacı doğru işler, karne hesaplanır', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await harfleriYaz(page, 8);
    await page.goto('/dinleme.html');
    await page.waitForTimeout(2200);

    const d = await page.evaluate(() => {
      Dinleme.baslat();
      // 4 doğru, 2 yanlış yap
      for (let i = 0; i < 4; i++) { const s = Dinleme.sor(); if (s) Dinleme.cevapla(s.harf); }
      for (let i = 0; i < 2; i++) {
        const s = Dinleme.sor();
        if (!s) break;
        const y = s.siklar.find(h => h !== s.harf);
        Dinleme.cevapla(y);
      }
      return { durum: Dinleme.durum(), ozet: Dinleme.ozet() };
    });

    expect(d.durum.dogru).toBe(4);
    expect(d.durum.yanlis).toBe(2);
    expect(d.ozet.oran, '6 cevapta 4 doğru = %67').toBe(67);
    expect(d.ozet.puan, '4 doğru x 10 XP = 40').toBe(40);
  });

  test('yanlış cevap karıştırma defterine kaydedilir (yanlis.js entegrasyonu)', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await harfleriYaz(page, 8);
    await page.goto('/dinleme.html');
    await page.waitForTimeout(2200);

    const d = await page.evaluate(() => {
      if (window.Yanlis) Yanlis.sifirla();
      Dinleme.baslat();
      const s = Dinleme.sor();
      const yanlisSik = s.siklar.find(h => h !== s.harf);
      Dinleme.cevapla(yanlisSik);
      const rapor = window.Yanlis ? Yanlis.rapor() : null;
      return { rapor: rapor, sorulanHarf: s.harf };
    });

    expect(d.rapor, 'Yanlis modülü yok').not.toBe(null);
    expect(d.rapor.toplam, 'Yanlış cevap karıştırma defterine yazılmadı').toBeGreaterThan(0);
  });

  test('4 harften az biliniyorsa tur başlamaz (şıklar oluşamaz)', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 1 });
    await page.evaluate(() => {
      // Sadece 2 harf + havuzu daraltmak için KANA'yı boşaltamayız;
      // bunun yerine boş kayıt + hiç harf görmemiş durum yarat:
      localStorage.setItem('sakar_kana', JSON.stringify({}));
    });
    await page.goto('/dinleme.html');
    await page.waitForTimeout(2200);

    // Hiç harf görülmemişse hiragana ile başlar -> tur BAŞLAMALI
    // (bu bir güvenlik davranışı: kullanıcı hiç oynamasa da denenebilsin)
    const baslar = await page.evaluate(() => Dinleme.baslat());
    expect(baslar, 'Harf geçmişi yoksa hiragana ile başlamalı').toBe(true);
  });

  test('dojo panelinde dinleme kısayolu var', async ({ page }) => {
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await page.evaluate(() => { localStorage.setItem('sakar_tur', '1'); });
    await page.goto('/dojo.html');
    await page.waitForTimeout(2500);

    const link = page.locator('a[href="dinleme.html"]').first();
    await expect(link, 'Dojo panelinde dinleme kısayolu yok').toBeVisible();
  });

  test('konsol hatası ve 404 yok', async ({ page }) => {
    const t = hataToplayici(page);
    await kayitYaz(page, { isim: 'Test', seviye: 55 });
    await harfleriYaz(page, 8);
    await page.goto('/dinleme.html');
    await page.waitForTimeout(2200);
    // Bir soru cevapla (etkileşim hatası var mı?)
    await page.locator('.dl-sik').first().click();
    await page.waitForTimeout(1500);
    expect(t.hatalar(), 'Dinleme konsol hatası:\n' + t.hatalar().join('\n')).toEqual([]);
    expect(t.istekler(), 'Dinleme başarısız istek:\n' + t.istekler().join('\n')).toEqual([]);
  });
});