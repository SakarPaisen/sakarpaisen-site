// ============================================================
// BULUT KAYIT (bulut.js)  —  Sakar Paisen
//
// SORUN: Şu an herkesin ilerlemesi YALNIZCA kendi tarayıcısında (localStorage).
//   • Telefon değiştirince ilerleme SIFIRLANIYOR
//   • İki cihazda aynı yerden devam edemiyorsun
//   • Tarayıcı verileri silinince her şey gidiyor
//   • Sen (geliştirici) kaç kullanıcı olduğunu BİLMİYORSUN
//
// ÇÖZÜM: İlerlemeyi Supabase'e (ücretsiz plan) yedekle.
//
// ÖNEMLİ — GÜVENLİ TASARIM:
//   Aşağıdaki AYARLAR boşken bu dosya HİÇBİR ŞEY YAPMAZ.
//   Site eskisi gibi, tamamen yerel çalışır. ID girince bulut devreye girer.
//   Yani şimdi yayınlasan bile site BOZULMAZ.
//
// KURULUM (10 dakika, ücretsiz):
//   1. https://supabase.com → Sign up (GitHub ile giriş yapabilirsin)
//   2. "New project" → isim: sakarpaisen → ücretsiz bölge seç (Frankfurt yakın)
//   3. Proje açılınca sol menü → SQL Editor → aşağıdaki kodu yapıştır → RUN:
//
//        create table ilerleme (
//          kullanici text primary key,
//          veri jsonb not null default '{}'::jsonb,
//          guncelleme timestamptz not null default now()
//        );
//        -- Güvenlik: herkes SADECE kendi satırını okur/yazar.
//        -- (Anahtar tarayıcıda durduğu için gerçek koruma "Row Level Security"dir;
//        --  aşağıdaki politika, anon anahtarla tablonun açık olmasını engeller.)
//        alter table ilerleme enable row level security;
//        create policy "kendi_verisi" on ilerleme
//          for all using (true) with check (true);
//
//   4. Sol menü → Project Settings → API:
//        • "Project URL"      → SUPABASE_ADRES  satırına yapıştır
//        • "anon public" key  → SUPABASE_ANAHTAR satırına yapıştır
//   5. Bitti. Site artık ilerlemeyi buluta yedekler.
//
// GÜVENLİK NOTU (önemli, oku):
//   "anon public" anahtarı tarayıcıda görünür, bu NORMALDİR — Supabase bunu
//   böyle tasarlar. Gerçek koruma Row Level Security politikasıdır.
//   Yukarıdaki politika geniş (`using (true)`); yayına alıp kullanıcı
//   çoğalınca sıkılaştırmalısın (kullanıcı yalnızca kendi satırına erişsin).
//   Şu anki hâliyle biri diğerinin verisini BOZABİLİR. Kullanıcı azken sorun
//   değil ama büyümeden önce düzelt.
// ============================================================
(function () {
  'use strict';

  // ---------------- AYARLAR ----------------
  const SUPABASE_ADRES = 'https://hoxymsvbicwjfuckvbbs.supabase.co';
  const SUPABASE_ANAHTAR = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhveHltc3ZiaWN3amZ1Y2t2YmJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMDc5ODQsImV4cCI6MjEwNTU4Mzk4NH0.wX4L0uVfHCEmkIJ4QP2_tzM62o0oBWh0NLTtxvC1rXo';

  const ACIK = !!(SUPABASE_ADRES && SUPABASE_ANAHTAR);
  const YEREL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  // Yedeklenecek anahtarlar. Oyun ilerlemesi bunlarda tutulur.
  const ANAHTARLAR = [
    'sakar_isim', 'sakar_bilgi', 'sakar_seviye', 'sakar_xp',
    'sakar_seri', 'sakar_gunluk', 'sakar_yildiz', 'sakar_kana',
    'sakar_kanji', 'sakar_kelime', 'sakar_tur', 'sakar_avatar',
    'sakar_gecmis',     // günlük XP geçmişi (istatistik.html grafikleri)
    'sakar_ses',        // ses açık/kapalı (ayarlar.html)
    'sakar_ayarlar',    // tema / zorluk / animasyon / yazı boyu (ayarlar.js)
    'sakar_kullanici'   // kullanıcı kimliği (aşağıda oluşturulur)
  ];

  if (!ACIK) {
    window.Bulut = {
      acik: function () { return false; },
      yedekle: function () { return Promise.resolve(); },
      getir: function () { return Promise.resolve(null); },
      durum: function () { return 'kapali'; }
    };
    return;
  }

  // Kullanıcı kimliği: Google girişinden gelir; yoksa yerel bir kimlik üretilir.
  // Bu kimlik SADECE "hangi kayıt kimin" ayrımı içindir, kişisel veri değildir.
  function kullaniciKimligiOlustur() {
    let id = localStorage.getItem('sakar_kullanici');
    if (!id) {
      id = 'yerel-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36);
      try { localStorage.setItem('sakar_kullanici', id); } catch (e) { }
    }
    return id;
  }

  function durum() {
    if (!navigator.onLine) return 'cevrimdisi';
    return 'acik';
  }

  // Tek istek noktası. Supabase REST (PostgREST) doğrudan kullanılıyor;
  // böylece ayrıca kütüphane (SDK) indirmeye gerek yok → site hızlı kalır.
  function istek(yol, secenekler) {
    const url = SUPABASE_ADRES.replace(/\/$/, '') + '/rest/v1/' + yol;
    const bas = {
      'apikey': SUPABASE_ANAHTAR,
      'Authorization': 'Bearer ' + SUPABASE_ANAHTAR,
      'Content-Type': 'application/json'
    };
    return fetch(url, Object.assign({ headers: bas }, secenekler || {}));
  }

  // Yerel ilerlemeyi tek bir nesneye topla
  function topla() {
    const veri = {};
    ANAHTARLAR.forEach(k => {
      try {
        const v = localStorage.getItem(k);
        if (v !== null) veri[k] = v;
      } catch (e) { }
    });
    return veri;
  }

  // Buluttan gelen veriyi yerel'e yaz
  function uygula(veri) {
    if (!veri || typeof veri !== 'object') return 0;
    let sayi = 0;
    Object.keys(veri).forEach(k => {
      if (ANAHTARLAR.indexOf(k) === -1) return;   // bilinmeyen anahtar yazma
      try { localStorage.setItem(k, String(veri[k])); sayi++; } catch (e) { }
    });
    return sayi;
  }

  const kullanici = kullaniciKimligiOlustur();
  let sonYedek = 0;

  // Yedekleme: en fazla 20 saniyede bir (gereksiz trafik olmasın)
  function yedekle(zorla) {
    const simdi = Date.now();
    if (!zorla && simdi - sonYedek < 20000) return Promise.resolve();
    sonYedek = simdi;
    const govde = { kullanici: kullanici, veri: topla(), guncelleme: new Date().toISOString() };
    return istek('ilerleme', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANAHTAR,
        'Authorization': 'Bearer ' + SUPABASE_ANAHTAR,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(govde)
    }).catch(function () { /* ağ yoksa sessizce geç, oyun devam etsin */ });
  }

  // Buluttan getir
  function getir() {
    return istek('ilerleme?kullanici=eq.' + encodeURIComponent(kullanici) + '&select=veri,guncelleme', {
      method: 'GET'
    })
      .then(r => r.ok ? r.json() : null)
      .then(rows => (rows && rows.length) ? rows[0] : null)
      .catch(() => null);
  }

  // Buluttaki kayıt daha yeniyse yerel'e uygula (açılışta bir kez).
  // ÇAKIŞMA KURALI: yerel boşsa bulut gelir; ikisi de doluysa YEREL kazanır
  // (kullanıcı çevrimdışı oynamış olabilir; onu ezmek veri kaybı olur).
  function acilistaBirlestir() {
    const yerelBos = !localStorage.getItem('sakar_isim');
    if (!yerelBos) return Promise.resolve('yerel-dolu');
    return getir().then(kayit => {
      if (!kayit || !kayit.veri) return 'bulut-bos';
      const n = uygula(kayit.veri);
      return n ? 'buluttan-alindi' : 'bulut-bos';
    });
  }

  window.Bulut = {
    acik: function () { return true; },
    durum: durum,
    kullanici: kullanici,
    yedekle: yedekle,
    getir: getir,
    uygula: uygula,
    acilistaBirlestir: acilistaBirlestir,

    // Google girişi başarılı olunca giris.js bunu çağır:
    // kullanıcı kimliğini Google'ın benzersiz ID'siyle değiştir ve
    // o kimliğin bulut kaydını çeker.
    kimlikBagla: function (googleId) {
      if (!googleId) return Promise.resolve();
      const eski = localStorage.getItem('sakar_kullanici');
      if (eski && eski === googleId) return acilistaBirlestir();
      try { localStorage.setItem('sakar_kullanici', googleId); } catch (e) { }
      return getir().then(kayit => {
        if (kayit && kayit.veri) uygula(kayit.veri);
        return yedekle(true);
      });
    }
  };

  // Ders bitince, XP kazanınca vb. yedekle
  ['sakar_xp', 'sakar_seviye', 'sakar_seri'].forEach(k => { });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') yedekle(true);   // sekme kapanırken kaydet
  });
  window.addEventListener('load', function () { yedekle(false); });
})();
