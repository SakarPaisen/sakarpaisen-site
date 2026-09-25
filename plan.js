// ============================================================
// ÇALIŞMA PLANI (plan.js)  —  Sakar Paisen
//
// SORUN: Kullanıcı dojo'ya giriyor ve onlarca daire görüyor. Hangisine
//   tıklayacağını bilemiyor → karar yorgunluğu → oyunu kapatıyor.
//   Bu, öğrenme uygulamalarında en büyük kayıp sebebidir.
//
// ÇÖZÜM: \"Bugün ne çalışayım?\" düğmesi. Kullanıcının GERÇEK durumuna
//   bakıp en doğru 3 adımı sıralı bir plan hâlinde sunar.
//
// PLAN NASIL KURULUR (öncelik sırası):
//   1) Tekrar zamanı gelmiş harfler  (unutmak üzere → en acil)
//   2) Çok karıştırılan harf çiftleri (yanlis.js → alışkanlık hâline gelmiş)
//   3) Zayıf harfler                 (oran bazlı)
//   4) Günlük görevler               (dışsal hedef)
//   5) Yeni ders                     (ilerleme)
//
// Her adım bir EYLEM içerir: başlık, açıklama, kaç dakika sürer ve
// tıklanınca nereye gidileceği. Kullanıcı sadece ilk adımı yapar; plan
// her ders sonrası tazelenir.
// ============================================================
(function () {
  'use strict';

  const ANAHTAR = 'sakar_plan';   // son plan gösterimi (aynı gün tekrar sormasın)

  function ham(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function yaz(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  // ---------- Yardımcı: harf id -> görünen ad ----------------------------
  function harfAdi(id) {
    try {
      if (typeof KANA !== 'undefined' && KANA[id]) {
        return KANA[id].j + ' (' + KANA[id].r + ')';
      }
    } catch (e) { }
    return id;
  }

  // ---------- PLAN ADIMLARI --------------------------------------------
  // Her adım: { id, simge, ad, aciklama, sure, url, onem, veri }
  // onem: büyük olan önce gelir

  function tekrarAdimi() {
    try {
      if (!window.Ilerleme || !Ilerleme.tekrarSayisi) return null;
      const n = Ilerleme.tekrarSayisi();
      if (n < 3) return null;               // 1-2 harf için ayrı adım açmaya değmez
      return {
        id: 'tekrar', simge: '🔁', ad: n + ' harfin tekrar zamanı geldi',
        aciklama: 'Unutmadan önce bak. Aralıklı tekrar, kalıcı öğrenmenin temeli.',
        sure: '~4 dk', url: 'oyun.html?ders=tekrar', onem: 100, veri: n
      };
    } catch (e) { return null; }
  }

  function karistirmaAdimi() {
    try {
      if (!window.Yanlis) return null;
      const c = Yanlis.enCokKaristirilan(1)[0];
      if (!c || c.n < 2) return null;
      const a = harfAdi(c.a), b = harfAdi(c.b);
      return {
        id: 'karistirma', simge: '🔀',
        ad: a + ' ile ' + b + ' karışıyor',
        aciklama: c.n + ' kez karıştırdın. Sınav modu tam bu ikisini yan yana sorar.',
        sure: '~3 dk', url: 'oyun.html?ders=sinav', onem: 95, veri: c.n
      };
    } catch (e) { return null; }
  }

  function zayifAdimi() {
    try {
      if (!window.Ilerleme || !Ilerleme.zayif) return null;
      const z = Ilerleme.zayif(6);
      if (z.length < 2) return null;
      const ornek = z.slice(0, 3).map(x => harfAdi(x.id)).join(', ');
      return {
        id: 'zayif', simge: '💪', ad: 'Zorlandığın ' + z.length + ' harf var',
        aciklama: ornek + ' — pekiştirme dersi bunları özellikle sorar.',
        sure: '~5 dk', url: 'oyun.html?ders=pekistir', onem: 85, veri: z.length
      };
    } catch (e) { return null; }
  }

  function gorevAdimi() {
    try {
      if (!window.Gorevler) return null;
      const o = Gorevler.ozet();
      if (o.hepsiTamam || o.toplam === 0) return null;
      const kalan = o.toplam - o.tamam;
      return {
        id: 'gorev', simge: '📋', ad: 'Günlük ' + kalan + ' görev kaldı',
        aciklama: 'Tamamlayınca fazladan XP kazanırsın.',
        sure: '~5 dk', url: 'dojo.html', onem: 70, veri: kalan
      };
    } catch (e) { return null; }
  }

  // YAZMA ADIMI: "harfleri tanıyorum ama hatırlayamıyorum" durumunu çözer.
  // NEDEN PLANDA: Öğrenci zayıf harfleri tanıma dersinde tekrar tekrar doğru
  // bilip yine unutuyor. Yazma, cevabı kendi beyninden üretmeyi gerektirdiği
  // için kalıcılığı artır; bu yüzden pekiştirmeden ÖNCE önerilir.
  function yazmaAdimi() {
    try {
      if (!window.Ilerleme) return null;
      const gorulen = Ilerleme.gorulenIdler ? Ilerleme.gorulenIdler() : [];
      const kanaSayi = gorulen.filter(function (id) { return window.KANA && KANA[id]; }).length;
      if (kanaSayi < 5) return null;
      return {
        id: 'yazma', simge: '✍️', ad: 'Yazma atölyesi',
        aciklama: 'Harfi gör, okunuşunu yaz. Can yok, sınırsız deneme var.',
        sure: '~4 dk', url: 'yazma.html', onem: 80, veri: kanaSayi
      };
    } catch (e) { return null; }
  }

  // HARF BİRLEŞTİRME ADIMI: "harfleri biliyorum ama kelime okuyamıyorum"
  // duvarını yıkar. Öğrendiği harflerle gerçek kelime kurar.
  function birlestirmeAdimi() {
    try {
      if (!window.Ilerleme || !window.READING || !READING.SOZLUK) return null;
      const gorulen = Ilerleme.gorulenIdler ? Ilerleme.gorulenIdler() : [];
      const harfler = {};
      gorulen.forEach(function (id) { if (window.KANA && KANA[id]) harfler[KANA[id].j] = true; });
      const uygun = READING.SOZLUK.filter(function (k) {
        const ja = k.ja || '';
        if (!ja || ja.length < 2 || ja.length > 6) return false;
        for (const ch of ja) { if (!harfler[ch]) return false; }
        return true;
      });
      if (uygun.length < 4) return null;
      return {
        id: 'birlestirme', simge: '🧩', ad: 'Harf birleştirme',
        aciklama: 'Öğrendiğin harflerle ' + uygun.length + ' kelime kurabilirsin.',
        sure: '~5 dk', url: 'birlestirme.html', onem: 78, veri: uygun.length
      };
    } catch (e) { return null; }
  }

  function yeniDersAdimi() {
    try {
      if (!window.Ilerleme || typeof MUFREDAT === 'undefined') return null;
      const svy = Ilerleme.seviye();
      const ders = MUFREDAT.find(m => m.id === svy);
      if (!ders || ders.tip === 'yakinda') return null;
      return {
        id: 'yeni', simge: '🥋', ad: 'Sıradaki ders: ' + ders.baslik,
        aciklama: 'Yolunda ilerle. Her ders 5 yeni şey öğretir.',
        sure: '~6 dk', url: 'oyun.html?ders=' + svy, onem: 60, veri: svy
      };
    } catch (e) { return null; }
  }

  function gunlukAdimi() {
    try {
      if (!window.Ilerleme) return null;
      const gunluk = Ilerleme.gunlukXp();
      const hedef = Ilerleme.HEDEF_XP;
      if (gunluk >= hedef) return null;
      const kalan = hedef - gunluk;
      return {
        id: 'gunluk', simge: '🎯', ad: 'Günlük hedefe ' + kalan + ' XP kaldı',
        aciklama: 'Bir ders yeterli olabilir. Seriyi de korur.',
        sure: '~5 dk', url: 'dojo.html', onem: 75, veri: kalan
      };
    } catch (e) { return null; }
  }

  // ---------- PLANI KUR ----------
  // adet: kaç adım gösterilsin (varsayılan 3)
  function kur(adet) {
    const n = adet || 3;
    const adaylar = [
      tekrarAdimi(), karistirmaAdimi(), zayifAdimi(),
      gunlukAdimi(), gorevAdimi(), yeniDersAdimi(),
      yazmaAdimi(), birlestirmeAdimi()
    ].filter(Boolean);

    // Öneme göre sırala, en önemli n tanesini al
    adaylar.sort((a, b) => b.onem - a.onem);

    // Aynı URL'ye giden adımlar varsa tekrar olmasın (ör. iki adım dojo'ya)
    const gorulen = new Set();
    const plan = adaylar.filter(a => {
      if (gorulen.has(a.url)) return false;
      gorulen.add(a.url);
      return true;
    }).slice(0, n);

    // Hiç adım çıkmazsa: her şey bitmiş, tebrik et
    if (!plan.length) {
      plan.push({
        id: 'tamam', simge: '🌟', ad: 'Bugün yapılacak her şey tamam!',
        aciklama: 'Yarın yeni görevler ve tekrarlar gelir. İstersen sınava girip kendini dene.',
        sure: '~3 dk', url: 'oyun.html?ders=sinav', onem: 0
      });
    }
    return plan;
  }

  // Toplam tahmini süre (kullanıcı \"kaç dakika sürer\" bilsin)
  function toplamSure(plan) {
    return (plan || []).reduce((t, a) => {
      const m = parseInt(String(a.sure).replace(/\D/g, ''), 10);
      return t + (isNaN(m) ? 0 : m);
    }, 0);
  }

  // ---------- \"Plan gösterildi\" kaydı ----------
  // Aktif kullanıcıyla (Google ID) karışmasın diye kullanıcı anahtarı ekliyoruz.
  function kullaniciAnahtari() {
    try { return ham('sakar_kullanici') || 'yerel'; } catch (e) { return 'yerel'; }
  }
  function bugun() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
      '-' + String(d.getDate()).padStart(2, '0');
  }
  function bugunGosterildi() {
    try {
      const k = JSON.parse(ham(ANAHTAR));
      return k && k.tarih === bugun() && k.kullanici === kullaniciAnahtari();
    } catch (e) { return false; }
  }
  function gosterildiIsaretle() {
    yaz(ANAHTAR, JSON.stringify({ tarih: bugun(), kullanici: kullaniciAnahtari() }));
  }
  function sifirla() { try { localStorage.removeItem(ANAHTAR); } catch (e) { } }

  window.Plan = {
    kur: kur,
    toplamSure: toplamSure,
    bugunGosterildi: bugunGosterildi,
    gosterildiIsaretle: gosterildiIsaretle,
    sifirla: sifirla,
    parcalar: {
      tekrar: tekrarAdimi, karistirma: karistirmaAdimi, zayif: zayifAdimi,
      gorev: gorevAdimi, yeniDers: yeniDersAdimi, gunluk: gunlukAdimi
    }
  };
})();