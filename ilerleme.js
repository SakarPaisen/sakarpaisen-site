// ============================================================
// İLERLEME: tüm kayıtlar (localStorage) burada. Sayfalar sadece bunu kullanır.
//
//  sakar_isim / sakar_bilgi / sakar_seviye / sakar_xp   -> eski anahtarlar (uyumlu)
//  sakar_seri    {sayi, en, son}       günlük seri
//  sakar_gunluk  {tarih, xp}           bugünkü XP
//  sakar_yildiz  {dersId: 1..3}        dairelerin yıldızları
//  sakar_kana    {harfId: {d,y,kutu,gun,sonra}}   harf başına doğru/yanlış + tekrar takvimi
//
// Aralıklı tekrar (Leitner): kutu 0..5 -> 0, 1, 3, 7, 14, 30 gün sonra tekrar.
// Doğru bilince kutu +1 (günde en fazla 1 kez), yanlış bilince kutu 0'a düşer.
// ============================================================
const Ilerleme = (function () {
  const HEDEF_XP = 50;
  const ARALIK = [0, 1, 3, 7, 14, 30];
  const RUTBELER = [
    { min: 0,    ad: 'Çırak' },
    { min: 100,  ad: 'Öğrenci' },
    { min: 250,  ad: 'Samuray' },
    { min: 500,  ad: 'Usta' },
    { min: 1000, ad: 'Sensei' }
  ];

  function ham(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function yaz(k, v) { try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) {} }
  function json(k, yedek) { try { const x = JSON.parse(ham(k)); return x == null ? yedek : x; } catch (e) { return yedek; } }
  function sayi(k, yedek) { const n = parseInt(ham(k), 10); return isNaN(n) ? yedek : n; }

  function tarih(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function gunEkle(gun, n) { const p = gun.split('-').map(Number); return tarih(new Date(p[0], p[1] - 1, p[2] + n)); }

  // ---------- Temel ----------
  const isim = () => ham('sakar_isim');
  const bilgi = () => ham('sakar_bilgi');
  const seviye = () => sayi('sakar_seviye', 1);
  const seviyeYaz = n => yaz('sakar_seviye', String(n));
  const xp = () => sayi('sakar_xp', 0);

  function gunlukXp() {
    const g = json('sakar_gunluk', { tarih: '', xp: 0 });
    return g.tarih === tarih() ? g.xp : 0;
  }

  // ---------- Günlük XP GEÇMİŞİ ----------
  // istatistik.html grafikleri buradan beslenir. Yalnızca son 120 gün tutulur
  // (localStorage şişmesin; 120 gün ~ 4 ay grafik için fazlasıyla yeterli).
  const GECMIS_TAVANI = 120;
  function gecmis() {
    const g = json('sakar_gecmis', []);
    return Array.isArray(g) ? g : [];
  }
  function gecmiseYaz(tarih_, xp) {
    const g = gecmis();
    const mevcut = g.find(x => x.tarih === tarih_);
    if (mevcut) mevcut.xp = xp;
    else g.push({ tarih: tarih_, xp: xp });
    g.sort((a, b) => a.tarih < b.tarih ? -1 : 1);
    yaz('sakar_gecmis', g.slice(-GECMIS_TAVANI));
  }

  function xpEkle(n) {
    yaz('sakar_xp', String(xp() + n));
    const yeni = gunlukXp() + n;
    yaz('sakar_gunluk', { tarih: tarih(), xp: yeni });
    gecmiseYaz(tarih(), yeni);   // grafik için geçmişe işle
  }

  function rutbe(toplamXp) {
    let i = 0;
    RUTBELER.forEach((r, j) => { if (toplamXp >= r.min) i = j; });
    const simdiki = RUTBELER[i], sonraki = RUTBELER[i + 1] || null;
    return {
      no: i + 1, ad: simdiki.ad, sonraki: sonraki,
      oran: sonraki ? (toplamXp - simdiki.min) / (sonraki.min - simdiki.min) : 1
    };
  }

  // ---------- Seri ----------
  function seri() {
    const s = json('sakar_seri', { sayi: 0, en: 0, son: '' });
    const bugun = tarih();
    if (s.son === bugun) return { sayi: s.sayi, en: s.en, bugunYapildi: true };
    if (s.son === gunEkle(bugun, -1)) return { sayi: s.sayi, en: s.en, bugunYapildi: false };
    return { sayi: 0, en: s.en, bugunYapildi: false };
  }
  function seriIsle() {              // bir ders bitince çağrılır, güncel seriyi döndürür
    const s = json('sakar_seri', { sayi: 0, en: 0, son: '' });
    const bugun = tarih();
    if (s.son !== bugun) {
      s.sayi = (s.son === gunEkle(bugun, -1)) ? s.sayi + 1 : 1;
      s.son = bugun;
      s.en = Math.max(s.en || 0, s.sayi);
      yaz('sakar_seri', s);
    }
    return s.sayi;
  }

  // ---------- SERİ KORUMA (streak freeze) ----------
  // Sorun: Kullanıcı bir gün kaçırınca serisi SIFIRLANIYORDU. Bir günlük aksama
  // (hastalık, seyahat, yoğun gün) tüm emeği silmesi motivasyonu kırıyor.
  //
  // Çözüm: Her 7 günlük seride 1 "koruma" kazanılır (en fazla 2 birikir).
  // Seri kırılacaksa otomatik olarak 1 koruma harcanır ve seri DEVAM EDER.
  //
  // Saklanan: sakar_seri = { sayi, en, son, koruma }
  //   koruma: kaç koruma hakkı kaldı (0-2)
  //   son: son çalışılan gün (koruma kullanıldıysa yine güncellenir)
  function seriKoruma() {
    const s = json('sakar_seri', { sayi: 0, en: 0, son: '', koruma: 0 });
    return { kalan: s.koruma || 0, sayi: s.sayi || 0 };
  }

  // Seriyi işlerken koruma kullanıldı mı diye bakan sürüm.
  // seriIsle()'den farkı: sadece 1 gün atlandıysa ve koruma varsa seriyi bozmaz.
  function seriIsleKorumali() {
    const s = json('sakar_seri', { sayi: 0, en: 0, son: '', koruma: 0 });
    const bugun = tarih();
    if (s.son === bugun) return { sayi: s.sayi, korumaKullanildi: false, kalan: s.koruma || 0 };

    const dun = gunEkle(bugun, -1);
    const evvelsi = gunEkle(bugun, -2);
    let korumaKullanildi = false;

    if (s.son === dun) {
      // Normal durum: dün çalışılmış
      s.sayi = s.sayi + 1;
    } else if (s.son === evvelsi && (s.koruma || 0) > 0) {
      // Bir gün atlanmış ama koruma var: seriyi KURTAR
      s.koruma = s.koruma - 1;
      s.sayi = s.sayi + 1;
      korumaKullanildi = true;
    } else {
      // Seri kırıldı
      s.sayi = 1;
    }
    s.son = bugun;
    s.en = Math.max(s.en || 0, s.sayi);

    // Her 7 günde 1 koruma kazan (en fazla 2 birikir)
    if (s.sayi > 0 && s.sayi % 7 === 0 && (s.koruma || 0) < 2) {
      s.koruma = (s.koruma || 0) + 1;
    }
    yaz('sakar_seri', s);
    return { sayi: s.sayi, korumaKullanildi, kalan: s.koruma || 0 };
  }

  // Kullanıcı elle koruma harcayabilir ("bugün çalışamayacağım" derse)
  function korumaHarca() {
    const s = json('sakar_seri', { sayi: 0, en: 0, son: '', koruma: 0 });
    if ((s.koruma || 0) <= 0) return false;
    s.koruma = s.koruma - 1;
    // Seriyi bugüne taşı: yarın çalışmasa bile kırılmasın
    s.son = tarih();
    yaz('sakar_seri', s);
    return true;
  }

  // ---------- Yıldızlar ----------
  const yildizlar = () => json('sakar_yildiz', {});
  function yildizYaz(id, n) {
    const y = yildizlar();
    if ((y[id] || 0) < n) { y[id] = n; yaz('sakar_yildiz', y); }
  }

  // ---------- Harf takibi ----------
  const kayit = () => json('sakar_kana', {});

  function cevapKaydet(id, dogruMu) {
    if (!id) return;
    const k = kayit(), bugun = tarih();
    const e = k[id] || { d: 0, y: 0, kutu: 0, gun: '', sonra: bugun };
    if (dogruMu) {
      e.d++;
      if (e.gun !== bugun) { e.kutu = Math.min(e.kutu + 1, ARALIK.length - 1); e.gun = bugun; }
    } else {
      e.y++; e.kutu = 0; e.gun = '';
    }
    e.sonra = gunEkle(bugun, ARALIK[e.kutu]);
    k[id] = e;
    yaz('sakar_kana', k);
  }

  const gorulenIdler = () => Object.keys(kayit());

  function oran(e) { return e.y / Math.max(e.d + e.y, 1); }

  function zayif(n) {                // sık yanlış yapılan harfler
    const k = kayit();
    return Object.keys(k)
      .map(id => ({ id: id, d: k[id].d, y: k[id].y, kutu: k[id].kutu, oran: oran(k[id]) }))
      .filter(x => x.d + x.y >= 2 && x.y > 0 && x.oran >= 0.2 && x.kutu <= 3)
      .sort((a, b) => b.oran - a.oran || b.y - a.y)
      .slice(0, n || 6);
  }

  function tekrarListesi() {         // zamanı gelen harflerin hepsi (en zayıf önce)
    const k = kayit(), bugun = tarih();
    return Object.keys(k)
      .filter(id => k[id].sonra <= bugun)
      .sort((a, b) => k[a].kutu - k[b].kutu || oran(k[b]) - oran(k[a]));
  }
  const tekrarSayisi = () => tekrarListesi().length;
  const tekrarIdleri = n => tekrarListesi().slice(0, n || 10);

  function sifirla() {
    // ÖNEMLİ: localStorage.clear() yerine SADECE oyun anahtarları silinir.
    // clear() kullanıcının tema/ses gibi tercihlerini ve başka sitelerin
    // verilerini de silebilir; hedefli silme daha güvenli.
    const SILINECEK = [
      'sakar_isim', 'sakar_bilgi', 'sakar_seviye', 'sakar_xp', 'sakar_seri',
      'sakar_gunluk', 'sakar_gecmis', 'sakar_yildiz', 'sakar_kana', 'sakar_kanji',
      'sakar_kelime', 'sakar_tur', 'sakar_avatar', 'sakar_hatasiz', 'sakar_sinavlar',
      'sakar_basarim', 'sakar_gorevler', 'sakar_kullanici',
      'sakar_hediye', 'sakar_son_ziyaret'
    ];
    try {
      SILINECEK.forEach(k => localStorage.removeItem(k));
    } catch (e) { }
    // Başarım/görev modüllerinin iç önbellekleri de temizlensin
    try { if (window.Basarimlar) Basarimlar.sifirla(); } catch (e) { }
    try { if (window.Gorevler) Gorevler.gunSifirla(); } catch (e) { }
    try { if (window.Hediye) Hediye.sifirla(); } catch (e) { }
    try { if (window.Ogut) Ogut.sifirla(); } catch (e) { }
  }

  // Yeni kullanıcı kaydı (giriş ekranı - giris.js - çağır): ad, seviye, bilgi + sıfır XP.
  function baslat(ad, bilgi, seviye) {
    yaz('sakar_isim', String(ad || '').trim().slice(0, 22));
    yaz('sakar_bilgi', bilgi || 'yok');
    yaz('sakar_seviye', String(seviye || 1));
    yaz('sakar_xp', '0');
    yaz('sakar_gunluk', { tarih: tarih(), xp: 0 });
  }

  // ---------- Kelime defteri ile bağlantı ----------
  // Bir kelime görüldüğünde/cevaplandığında kelime.js'e haber ver.
  // (kelime.js yüklenmemişse sessizce atlanır.)
  function kelimeGor(ja, kaynak) {
    try { if (typeof KelimeDefteri !== 'undefined') KelimeDefteri.gor({ ja: ja }, kaynak); } catch (e) { }
  }
  function kelimeCevap(ja, dogruMu) {
    try { if (typeof KelimeDefteri !== 'undefined') KelimeDefteri.cevap({ ja: ja }, dogruMu); } catch (e) { }
  }

  return {
    HEDEF_XP: HEDEF_XP,
    baslat: baslat,
    seriKoruma: seriKoruma, seriIsleKorumali: seriIsleKorumali, korumaHarca: korumaHarca,
    kelimeGor: kelimeGor, kelimeCevap: kelimeCevap,
    isim: isim, bilgi: bilgi, seviye: seviye, seviyeYaz: seviyeYaz, xp: xp,
    gunlukXp: gunlukXp, xpEkle: xpEkle, rutbe: rutbe, gecmis: gecmis,
    seri: seri, seriIsle: seriIsle,
    yildizlar: yildizlar, yildizYaz: yildizYaz,
    kayit: kayit, cevapKaydet: cevapKaydet, gorulenIdler: gorulenIdler,
    zayif: zayif, tekrarSayisi: tekrarSayisi, tekrarIdleri: tekrarIdleri,
    sifirla: sifirla
  };
})();

// Konsoldan ve otomatik testlerden erişilebilsin.
// NOT: `const Ilerleme = ...` biçiminde tanımlı olduğu için `window.Ilerleme`
// olarak GÖRÜNMEZ; bu satır olmadan testler ve hata ayıklama erişemez.
// Uygulama kodu const Ilerleme'yi kullanmaya devam eder.
window.Ilerleme = Ilerleme;
