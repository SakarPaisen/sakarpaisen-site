import { defineConfig, devices } from '@playwright/test';

// Sakar Paisen test ayarı.
// Site saf statik: derleme yok, sadece http sunucusu gerekir (sunucu.ps1).
// Farklı port: TEST_ADRES=http://localhost:3000 npm test
const ADRES = process.env.TEST_ADRES || 'http://localhost:8000';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 8000 },
  fullyParallel: false,          // aynı sunucuya yüklenmesin
  workers: 1,                    // TEK tarayıcı: makine yorulmasın (16 GB RAM, 7 VS Code açık)
  retries: 0,
  reporter: [['list']],

  // SİSTEM YÜKÜ KORUMASI
  // NEDEN: 153 testlik tam tur ~12 dakika sürüyor ve her test yeni bir
  // Chromium açıyor. Arka arkaya tur başlatılınca makine donuyordu.
  // Bu ayarlar disk/CPU/RAM kullanımını sınırlar:
  //   • maxFailures  : bu kadar hata olunca tur DURUR (boşuna 12 dk koşmaz)
  //   • outputDir    : test-results sınırsız büyümesin (tek klasör, temizlenir)
  //   • trace/screenshot kapalı: her hatada video/kare kaydı disk ve CPU yer
  maxFailures: 10,
  outputDir: 'test-results',

  // ÖNEMLİ: Sunucuyu testler KENDİ başlatır. Eskiden elle ikinci bir terminalde
  // `sunucu.ps1` çalıştırmak gerekiyordu; unutulunca 38 testin hepsi
  // "ERR_CONNECTION_REFUSED" ile başarısız görünüyordu (yanıltıcı sonuç).
  // Artık `npm test` tek başına yeterli. Dışarıdan çalışan bir sunucu varsa
  // (TEST_ADRES verilmişse) reuseExistingServer onu kullanır.
  // DİKKAT: 'node sunucu.mjs' yazmak yetmez — bu makinede Node PATH'te
  // olmadığı için (D:\nodejs\) "'node' is not recognized" hatası çıkıyordu.
  // process.execPath, testleri çalıştıran Node'un TAM yoludur: her yerde çalışır.
  webServer: process.env.TEST_ADRES ? undefined : {
    command: `"${process.execPath}" sunucu.mjs`,
    url: ADRES,
    reuseExistingServer: true,
    timeout: 30000
  },

  use: {
    baseURL: ADRES,
    headless: true,
    // HAFİF MOD: video/kare kaydı yerine sadece hata metni saklanır.
    // NEDEN: 'retain-on-failure' her hatalı testte trace.zip (birkaç MB) ve
    // PNG üretiyordu; onlarca hatada disk ve CPU yükü ciddi oluyordu.
    // Hata ayıklamak gerekirse elle açılır (TEST_TRACE=1 ile trace alınır).
    screenshot: process.env.TEST_TRACE ? 'only-on-failure' : 'off',
    trace: process.env.TEST_TRACE ? 'retain-on-failure' : 'off',
    video: 'off',
    locale: 'tr-TR'
  },

  projects: [
    {
      name: 'masaustu',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      // Dokunmatik cihaz: klavye ipucun ÇIKMAMASI gereken durum
      name: 'mobil',
      use: { ...devices['Pixel 5'] },
      testMatch: /klavye\.spec\.mjs/
    }
  ]
});
