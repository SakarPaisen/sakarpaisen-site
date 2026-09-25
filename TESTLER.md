# Sakar Paisen — otomatik testler

Bu testler siteyi **gerçek bir tarayıcıda** açar, tıklar ve sonucu doğrular.
Kod değiştirdikten sonra çalıştır: kırılan bir şey varsa söyler.

## Kurulum (bilgisayarında bir kez)

Node.js gerekir. Bu makinede zaten var (v24).

    cd "SakarPaisen"
    npm install

(Tarayıcı motoru Playwright ile gelir; ilk kurulumda indirilir.)

## Çalıştırma
Sunucuyu **elle başlatmana gerek yok** — Playwright testleri başlatırken
`sunucu.mjs`'i kendisi açar, testler bitince kapatır. Tek komut yeter:

       npm test
Tek bir testi çalıştırmak için:

    npx playwright test tests/ders.spec.mjs
(Dışarıdan zaten bir sunucu çalışıyorsa onu kullanır; `TEST_ADRES` verilmişse
hiç sunucu başlatmaz.)

Sunucuyu elle açmak istersen (siteye tarayıcıdan bakmak için):

    npm run sunucu            # http://localhost:8000
    node sunucu.mjs 3000      # farklı port

Hata ayıklamak için (tarayıcıyı görünür açar, adım adım):

    npm run test:izle

Ekran görüntülü rapor:

    npm run test:rapor

## Test dosyaları

| Dosya | Neyi kontrol eder |
|---|---|
| `tests/giris.spec.mjs` | Giriş akışı, Google butonu, kayıt, yönlendirme |
| `tests/dojo.spec.mjs` | Dojo haritası, tanıtım turu, istatistikler |
| `tests/ders.spec.mjs` | Ders akışı, şık seçimi, DEVAM ET butonu, canlar |
| `tests/klavye.spec.mjs` | 1-4 ve Enter kısayolları, mobilde gizli olması |
| `tests/yayin.spec.mjs` | Konsol hatası yok, 404 istek yok (her sayfa için) |

## Notlar
- Testler varsayılan olarak `http://localhost:8000` adresini kullanır.
- Farklı port: `TEST_ADRES=http://localhost:3000 npm test`
- Testler kendi tarayıcı profillerini kullanır, kendi localStorage'larını kurar.
  Senin gerçek oyun verilerine dokunmaz.

## Neden iki sunucu var?

| Dosya | Ne zaman |
|---|---|
| `sunucu.mjs` | **Varsayılan.** Node ile yazıldı, eşzamanlı istekleri sorunsuz karşılar. Testler bunu kullanır |
| `sunucu.ps1` | Yedek (Node kurulu değilse). PowerShell `HttpListener` tek iş parçacıklıdır |

Eskiden testler `sunucu.ps1`'e bağlıydı ve tek iş parçacıklı listener hızlı
isteklerde kilitlenip düşüyordu; sonuç olarak 38 testin 37'si
"ERR_CONNECTION_REFUSED" ile **yanıltıcı biçimde** başarısız görünüyordu.
`sunucu.mjs` + Playwright `webServer` ayarı bu sorunu kalıcı olarak çözer.
