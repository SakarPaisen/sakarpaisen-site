// Geçici QA: oyun motorunun app.js içinden kullandığı isimler window'da var mı?
import { test, expect } from '@playwright/test';

test('app.js motorunun bekledigi global isimler', async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => {
    localStorage.setItem('sakar_isim', 'QA Test');
    localStorage.setItem('sakar_seviye', '99');
    localStorage.setItem('sakar_bilgi', 'yok');
  });
  await page.goto('/oyun.html?ders=1', { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  const sonuc = await page.evaluate(() => {
    const isimler = ['KANA', 'KANA_TABLO', 'KANA_GRUPLAR', 'dersUret', 'kanaTekrarUret',
      'kanaPekistirUret', 'MUFREDAT', 'Ilerleme', 'Ses', 'Kombo', 'Ayarlar',
      'Gorevler', 'Basarimlar', 'Yanlis', 'Sinav', 'READING', 'KANJI',
      'KelimeDefteri', 'Hediye', 'SORULAR', 'Analitik', 'Reklam', 'registerDers'];
    const kapsam = {};
    for (const n of isimler) {
      kapsam[n] = {
        windowda: typeof window[n],
        kodKapsaminda: (function () { try { return typeof eval(n); } catch (e) { return 'YOK'; } })()
      };
    }
    return {
      kapsam: kapsam,
      hataListesi: (window.HataRapor && HataRapor.varmi()) ? HataRapor.liste().map(h => h.mesaj + ' @ ' + h.yer) : []
    };
  });
  console.log('KAPSAM: ' + JSON.stringify(sonuc.kapsam, null, 1));
  console.log('HATALAR: ' + JSON.stringify(sonuc.hataListesi));
  expect(true).toBe(true);
});