// ============================================================
// HATA BİLDİRİMİ (hata-rapor.js)
//
// Yakalanan JavaScript hatalarını toplar ve kullanıcı geri bildirim
// gönderdiğinde bunları rapora ekler. Böylece "bozuk" mesajı geldiğinde
// tahmin etmek yerine gerçek hata satırını görürsün.
//
// Kullanım (dojo.html / oyun.html):
//   HataRapor.kur()          -> hata dinleyicilerini başlat
//   HataRapor.ozet()         -> gönderime eklenecek teknik metin
//   HataRapor.varmi()        -> bu oturumda hata oldu mu
//   HataRapor.temizle()      -> listeyi boşalt
// ============================================================
const HataRapor = (function () {
  const EN_FAZLA = 8;          // ekranda/raporda en fazla bu kadar hata
  const kayitlar = [];
  let kuruldu = false;

  function ekle(tur, mesaj, yer, yigin) {
    // Aynı hatayı tekrar tekrar eklemeyelim
    if (kayitlar.some(k => k.mesaj === mesaj && k.yer === yer)) return;
    kayitlar.push({
      tur: tur,
      mesaj: String(mesaj || '').slice(0, 180),
      yer: String(yer || '').slice(0, 160),
      yigin: String(yigin || '').split('\n').slice(0, 3).join(' | ').slice(0, 240),
      saat: new Date().toISOString().slice(11, 19)
    });
    if (kayitlar.length > EN_FAZLA) kayitlar.shift();
    window.dispatchEvent(new Event('hata-rapor-guncellendi'));
  }

  function kur() {
    if (kuruldu) return;
    kuruldu = true;

    window.addEventListener('error', e => {
      // Resim/script yükleme hatası: yerine dosya adını yaz
      if (e.target && e.target !== window && (e.target.src || e.target.href)) {
        ekle('kaynak', (e.target.tagName || '?') + ' yüklenemedi', e.target.src || e.target.href, '');
        return;
      }
      ekle('hata', e.message, e.filename ? e.filename.split('/').pop() + ':' + e.lineno + ':' + e.colno : '', e.error && e.error.stack);
    }, true);

    window.addEventListener('unhandledrejection', e => {
      const s = e.reason;
      ekle('söz', (s && s.message) || String(s), 'promise', s && s.stack);
    });
  }

  // Kullanıcının gönderdiği rapora eklenecek teknik özet
  function ozet() {
    const parcalar = [];
    parcalar.push('--- teknik ---');
    parcalar.push('adres: ' + location.pathname + location.search);
    parcalar.push('tarayici: ' + navigator.userAgent.slice(0, 140));
    parcalar.push('ekran: ' + window.innerWidth + 'x' + window.innerHeight + ' dpr' + (window.devicePixelRatio || 1));
    parcalar.push('tema: ' + (window.matchMedia('(hover: hover) and (pointer: fine)').matches ? 'klavyeli' : 'dokunmatik'));
    try {
      parcalar.push('ilerleme: ' + (Ilerleme.isim() || '?') + ' | ' + Ilerleme.seviye() + '. daire | ' +
        Ilerleme.xp() + ' XP | seri ' + Ilerleme.seri().sayi + ' | zayif harf ' + Ilerleme.zayif(50).length);
      parcalar.push('ses: ' + (Ses.acikMi() ? 'acik' : 'kapali'));
    } catch (e) { parcalar.push('ilerleme: okunamadi'); }
    try {
      if (typeof MUFREDAT !== 'undefined') {
        parcalar.push('toplam daire: ' + MUFREDAT.length);
      }
    } catch (e) { }
    parcalar.push('onbellek: ' + (window.__swSurum || 'bilinmiyor'));

    if (kayitlar.length) {
      parcalar.push('--- yakalanan hatalar (' + kayitlar.length + ') ---');
      kayitlar.forEach((k, i) => {
        parcalar.push((i + 1) + ') [' + k.saat + '] ' + k.tur + ': ' + k.mesaj +
          (k.yer ? ' @ ' + k.yer : '') + (k.yigin ? '\n   ' + k.yigin : ''));
      });
    } else {
      parcalar.push('--- yakalanan hata yok ---');
    }
    return parcalar.join('\n');
  }

  function varmi() { return kayitlar.length > 0; }
  function temizle() { kayitlar.length = 0; }
  function liste() { return kayitlar.slice(); }

  return { kur: kur, ozet: ozet, varmi: varmi, temizle: temizle, liste: liste };
})();

// Konsoldan/testlerden erişilebilsin. Uygulama kodu const HataRapor'u kullanır.
window.HataRapor = HataRapor;
