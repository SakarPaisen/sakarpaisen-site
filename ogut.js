// ============================================================
// SENSEİ'NİN ÖĞÜTLERİ (ogut.js)  —  Sakar Paisen
//
// AMAÇ: Dojo'daki maskot (Sensei) cansız durmasın. Kullanıcının
//   GERÇEK durumuna bakıp ona uygun bir cümle söylesin. Rastgele
//   motivasyon cümlesi değil; "gerçekten beni anlıyor" hissi veren
//   bağlamsal ipuçları.
//
// NEDEN ÖNEMLİ: Boş bir ekranda ne yapacağını bilemeyen kullanıcı
//   oyunu bırakır. Sensei ona "şunu yap" derse kalır.
//
// ÖRNEK BAĞLAM KURALLARI (öncelik sırasıyla):
//   • Tekrar bekleyen harf varsa    → "Tekrar zamanı gelmiş"
//   • Seri bugün yapılmadıysa       → "Bugünkü seriyi kurtaralım"
//   • Günlük hedef yarıdaysa        → "Az kaldı!"
//   • Zayıf harf varsa              → "Şu harflere bakalım"
//   • Uzun süre girilmediyse        → karşılama
//   • Hiçbiri yoksa                 → genel teşvik
// ============================================================
(function () {
  'use strict';

  function ham(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function yaz(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  const ANAHTAR = 'sakar_son_ziyaret';

  // Bir gün önceki/birkaç gün önceki tarihle karşılaştırma için
  function gunFarki(onceki) {
    if (!onceki) return null;
    const p = String(onceki).split('-').map(Number);
    if (p.length !== 3 || p.some(isNaN)) return null;
    const a = new Date(p[0], p[1] - 1, p[2]);
    const b = new Date();
    const bugun = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((bugun - a) / 86400000);
  }

  // ---------- BAĞLAM: kullanıcının şu anki durumu ----------
  function baglam() {
    const b = {};
    try {
      b.seri = (window.Ilerleme && Ilerleme.seri) ? Ilerleme.seri() : { sayi: 0, bugunYapildi: true };
      b.tekrar = (window.Ilerleme && Ilerleme.tekrarSayisi) ? Ilerleme.tekrarSayisi() : 0;
      b.zayifSayi = (window.Ilerleme && Ilerleme.zayif) ? Ilerleme.zayif(6).length : 0;
      b.gunlukXp = (window.Ilerleme && Ilerleme.gunlukXp) ? Ilerleme.gunlukXp() : 0;
      b.hedefXp = (window.Ilerleme && Ilerleme.HEDEF_XP) ? Ilerleme.HEDEF_XP : 50;
      b.isim = (window.Ilerleme && Ilerleme.isim) ? Ilerleme.isim() : '';
    } catch (e) { }
    b.gunFarki = gunFarki(ham(ANAHTAR));
    return b;
  }

  // ---------- Yüksek skorlu cümle seç ----------
  // Her kuralın "puan"ı var; en yüksek puanlı (en güncel/önemli) söylenir.
  function cumleBul(b) {
    const adaylar = [];
    const ekle = (puan, metin, simge) => adaylar.push({ puan, metin, simge });

    // Uzun aradan sonra dönüş: en sıcak karşılama
    if (b.gunFarki === null || b.gunFarki >= 3) {
      ekle(100, 'Uzun zaman oldu' + (b.isim ? ', ' + b.isim : '') + '! 🌸 Seni özledim. Küçük bir dersle başlayalım mı?', '👋');
    } else if (b.gunFarki === 2) {
      ekle(80, 'Dün gelemedin ama sorun değil. Bugün devam edelim!', '💪');
    }

    // Seri bugün yapılmadıysa: en güçlü dürtü
    if (b.seri && !b.seri.bugunYapildi && b.seri.sayi > 0) {
      ekle(90, b.seri.sayi + ' günlük serin devam ediyor 🔥 Bugün bir ders yapıp bozdurmayalım!', '🔥');
    }
    if (b.seri && !b.seri.bugunYapildi && b.seri.sayi === 0) {
      ekle(70, 'Bugün yeni bir seri başlatalım! İlk günü atlamak en kolayı. 🌱', '🌱');
    }

    // Tekrar zamanı gelen harfler (aralıklı tekrar = unutmayı engeller)
    if (b.tekrar >= 5) {
      ekle(85, b.tekrar + ' harf tekrar bekliyor 🔁 Unutmadan bir bakalım.', '🔁');
    } else if (b.tekrar > 0) {
      ekle(60, b.tekrar + ' harfin tekrar zamanı gelmiş. Kısacık bir tekrar?', '🔁');
    }

    // Günlük hedefe yaklaşmışsa: bitirme dürtüsü
    if (b.gunlukXp >= b.hedefXp) {
      ekle(65, 'Bugünkü hedefini tutturduğun için tebrikler! 🎯 Yarın da beklerim.', '🎯');
    } else if (b.gunlukXp >= b.hedefXp * 0.6) {
      const kalan = Math.ceil(b.hedefXp - b.gunlukXp);
      ekle(75, 'Günlük hedefine ' + kalan + ' XP kaldı! Bir ders yeterli olabilir. 💪', '🎯');
    }

    // Zayıf harfler: kişiye özel çalışma önerisi
    if (b.zayifSayi >= 3) {
      ekle(55, 'Şu ' + b.zayifSayi + ' harfte zorlanıyorsun. Pekiştirme dersine ne dersin?', '💡');
    }

    // Hiçbiri yoksa: sıcak, genel teşvik
    if (!adaylar.length) {
      const genel = [
        'Bugün hangi dersi çalışalım' + (b.isim ? ', ' + b.isim : '') + '? 🥋',
        'Her gün 5 dakika, bir yılda akıcılık demek. 🌸',
        'Hazır olduğunda aşağıdaki haritadan bir daire seç! 🗺️',
        'Yanlış yapmak öğrenmenin parçası. Korkma, devam et! 🙂'
      ];
      const i = Math.floor(Math.random() * genel.length);
      ekle(10, genel[i], '💬');
    }

    adaylar.sort((a, c) => c.puan - a.puan);
    return adaylar[0];
  }

  // Söylenecek cümleyi döndür (aynı oturumda tekrar etmesin diye son tutulur)
  let sonMetin = '';
  function soyle() {
    const b = baglam();
    let secim = cumleBul(b);
    // Aynı cümle üst üste gelmesin (ilk 3 denemede farklı ara)
    if (secim && secim.metin === sonMetin) {
      for (let i = 0; i < 3; i++) {
        const yeni = cumleBul(b);
        if (yeni && yeni.metin !== sonMetin) { secim = yeni; break; }
      }
    }
    if (secim) sonMetin = secim.metin;
    return secim || { metin: 'Hoş geldin! 🥋', simge: '👋' };
  }

  // Ziyaret tarihini kaydet (dojo açıldığında çağrılır).
  // ÖNEMLİ: bir SONRAKİ açılışta "ne zaman gelmişti" hesaplanabilsin diye
  // çağıran taraf bu fonksiyonu dojo YÜKLENİRKEN değil, cümle gösterildikten
  // SONRA çağırır. Aksi hâlde aradaki fark hep 0 çıkar.
  function ziyaretKaydet() {
    yaz(ANAHTAR, (function () {
      const d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
        '-' + String(d.getDate()).padStart(2, '0');
    })());
  }

  function sifirla() { try { localStorage.removeItem(ANAHTAR); } catch (e) { } }

  window.Ogut = {
    soyle: soyle,
    baglam: baglam,
    cumleBul: cumleBul,
    ziyaretKaydet: ziyaretKaydet,
    sifirla: sifirla
  };
})();