// ============================================================
// BAŞARIMLAR (basarimlar.js)  —  Sakar Paisen
//
// AMAÇ: Oyuncuya "hedef" ve "koleksiyon" hissi vermek. Rozet toplamak,
//   oyunu bırakma oranını düşürür ve geri dönme sebebi yaratır.
//
// NASIL ÇALIŞIR:
//   • Her başarımın bir "test" fonksiyonu vardır; mevcut kayıtla uyuyor mu?
//   • Yeni açılan başarım localStorage'a yazılır (bir daha kutlama çıkmaz).
//   • Yeni başarım açıldığında ekranda kutlama bandı + Sensei sesi çıkar.
//
// KAYIT: sakar_basarim = ["ilk-adim", "seri-7", ...]  (açılmış id listesi)
// ============================================================
(function () {
  'use strict';

  const ANAHTAR = 'sakar_basarim';

  // ------------------------------------------------------------
  // BAŞARIM LİSTESİ
  //   id      : kalıcı anahtar (değiştirme, kayıt bozulur)
  //   ad      : başlık
  //   aciklama: nasıl kazanılır
  //   simge   : emoji
  //   grup    : 'yol' | 'seri' | 'ustalik' | 'koleksiyon'
  //   test    : (veri) => true/false
  // ------------------------------------------------------------
  const LISTE = [
    // ---------- YOL (dersler) ----------
    { id: 'ilk-adim', ad: 'İlk Adım', simge: '👣', grup: 'yol',
      aciklama: 'İlk dersini tamamla', test: v => v.seviye > 1 },
    { id: 'bes-ders', ad: 'Isınma Turu', simge: '🌱', grup: 'yol',
      aciklama: '5 ders tamamla', test: v => v.seviye > 5 },
    { id: 'on-ders', ad: 'Tempoyu Buldun', simge: '🚶', grup: 'yol',
      aciklama: '10 ders tamamla', test: v => v.seviye > 10 },
    { id: 'otuz-ders', ad: 'Yolun Yarısı', simge: '🏃', grup: 'yol',
      aciklama: '30 ders tamamla', test: v => v.seviye > 30 },
    { id: 'hirgana-bitti', ad: 'Hiragana Bitti!', simge: 'あ', grup: 'yol',
      aciklama: 'Hiragana bölümünü bitir', test: v => v.seviye > 13 },
    { id: 'katakana-bitti', ad: 'Katakana Bitti!', simge: 'ア', grup: 'yol',
      aciklama: 'Katakana bölümünü bitir', test: v => v.seviye > 26 },
    { id: 'kanji-basladi', ad: 'Kanji Yolculuğu', simge: '漢', grup: 'yol',
      aciklama: 'İlk kanji dersini tamamla', test: v => v.seviye > 40 },

    // ---------- SERİ (düzenli çalışma) ----------
    { id: 'seri-3', ad: 'Üç Gün Üst Üste', simge: '🔥', grup: 'seri',
      aciklama: '3 günlük seri yap', test: v => v.seriEn >= 3 },
    { id: 'seri-7', ad: 'Bir Hafta!', simge: '🗓️', grup: 'seri',
      aciklama: '7 günlük seri yap', test: v => v.seriEn >= 7 },
    { id: 'seri-30', ad: 'Bir Ay Disiplin', simge: '💪', grup: 'seri',
      aciklama: '30 günlük seri yap', test: v => v.seriEn >= 30 },
    { id: 'seri-100', ad: 'Yüz Gün', simge: '🏔️', grup: 'seri',
      aciklama: '100 günlük seri yap', test: v => v.seriEn >= 100 },

    // ---------- USTALIK (doğruluk) ----------
    { id: 'hatasiz-ilk', ad: 'Hatasız Ders', simge: '✨', grup: 'ustalik',
      aciklama: 'Bir dersi hiç hata yapmadan bitir', test: v => v.hatasizDers >= 1 },
    { id: 'hatasiz-10', ad: 'Kusursuz On', simge: '💎', grup: 'ustalik',
      aciklama: '10 dersi hatasız bitir', test: v => v.hatasizDers >= 10 },
    { id: 'sinav-hiragana', ad: 'Hiragana Sınavı Geçildi', simge: '🎓', grup: 'ustalik',
      aciklama: 'Hiragana sınavını geç', test: v => v.sinavlar.includes('hiragana') },

    // ---------- KOLEKSİYON (biriktirme) ----------
    { id: 'harf-10', ad: 'Tanışıyoruz', simge: '📗', grup: 'koleksiyon',
      aciklama: '10 farklı harf öğren', test: v => v.harfSayisi >= 10 },
    { id: 'harf-46', ad: 'Hiragana Ustası', simge: '📘', grup: 'koleksiyon',
      aciklama: '46 hiraganayı da öğren', test: v => v.harfSayisi >= 46 },
    { id: 'yildiz-10', ad: 'Yıldız Avcısı', simge: '⭐', grup: 'koleksiyon',
      aciklama: '10 yıldız kazan', test: v => v.yildiz >= 10 },
    { id: 'yildiz-50', ad: 'Gökyüzü Sensin', simge: '🌟', grup: 'koleksiyon',
      aciklama: '50 yıldız kazan', test: v => v.yildiz >= 50 },
    { id: 'xp-500', ad: '500 XP', simge: '🥉', grup: 'koleksiyon',
      aciklama: 'Toplam 500 XP kazan', test: v => v.xp >= 500 },
    { id: 'xp-2000', ad: '2000 XP', simge: '🥈', grup: 'koleksiyon',
      aciklama: 'Toplam 2000 XP kazan', test: v => v.xp >= 2000 },
    { id: 'zac-route', ad: 'Zengin Koleksiyon', simge: '🏅', grup: 'koleksiyon',
      aciklama: 'Toplam 5 başarım aç', test: v => v.acilanSayisi >= 5 },

    // ---------- VİDEO (izleyerek öğrenme) ----------
    // Kanaldaki anlatımları izlemek de öğrenme biçimidir; ayrı grup olarak
    // ödüllendirilir. Öğrenci "hiçbir şey yapmadım" hissine kapılmasın.
    { id: 'video-ilk', ad: 'İzleyici', simge: '🎬', grup: 'video',
      aciklama: 'İlk video dersini izle', test: v => v.videoSayisi >= 1 },
    { id: 'video-3', ad: 'Meraklı Gözler', simge: '🍿', grup: 'video',
      aciklama: '3 video ders izle', test: v => v.videoSayisi >= 3 },
    { id: 'video-5', ad: 'Sinema Salonu', simge: '📽️', grup: 'video',
      aciklama: '5 video ders izle', test: v => v.videoSayisi >= 5 }
  ];

  const GRUPLAR = {
    yol: { ad: 'Yolculuk', simge: '🗺️' },
    seri: { ad: 'Disiplin', simge: '🔥' },
    ustalik: { ad: 'Ustalık', simge: '🎯' },
    koleksiyon: { ad: 'Koleksiyon', simge: '⭐' },
    // VİDEO grubu eklendi: LISTE'de grup:'video' olan 3 başarım vardı ama
    // grup tanımı yoktu; istatistik sayfası grup anahtarlarına göre çizdiği
    // için bu üçü hiç görünmüyor (24 yerine 21 kutu) — test bunu yakaladı.
    video: { ad: 'İzleyerek Öğren', simge: '🎬' }
  };

  function ham(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function yaz(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  function acilanlar() {
    try {
      const x = JSON.parse(ham(ANAHTAR));
      return Array.isArray(x) ? x : [];
    } catch (e) { return []; }
  }

  // Açılmış başarım sayısını testlerde kullanmak için (döngüsel referans olmasın)
  function acilanSayisi() { return acilanlar().length; }

  // ---------- Mevcut oyuncu durumunu topla ----------
  // Başarımlar bu "veri" nesnesine bakarak karar verir.
  function durumTopla() {
    const acilan = acilanlar();
    let seriEn = 0, hatasizDers = 0, sinavlar = [];
    try {
      const s = JSON.parse(ham('sakar_seri') || '{}');
      seriEn = s.en || s.sayi || 0;
    } catch (e) { }
    try { hatasizDers = parseInt(ham('sakar_hatasiz') || '0', 10) || 0; } catch (e) { }
    try { sinavlar = JSON.parse(ham('sakar_sinavlar') || '[]'); } catch (e) { }
    const yildizlar = (() => {
      try { return JSON.parse(ham('sakar_yildiz') || '{}'); } catch (e) { return {}; }
    })();
    const yildiz = Object.keys(yildizlar).reduce((t, k) => t + (yildizlar[k] || 0), 0);

    // İzlenen video sayısı: video-sayfa.js'in kendi anahtarı (sakar_video_izlenen).
    // NEDEN AYRI ANAHTAR: ders motoru harf bazlı ilerleme tutuyor; video izlemek
    // oraya yazılırsa "zayıf harf" hesabı bozulur.
    let videoSayisi = 0;
    try { videoSayisi = Object.keys(JSON.parse(ham('sakar_video_izlenen') || '{}')).length; } catch (e) { }

    return {
      seviye: (() => { try { return parseInt(ham('sakar_seviye') || '1', 10) || 1; } catch (e) { return 1; } })(),
      xp: (() => { try { return parseInt(ham('sakar_xp') || '0', 10) || 0; } catch (e) { return 0; } })(),
      seriEn, hatasizDers, sinavlar, yildiz, videoSayisi,
      harfSayisi: (() => {
        try { return Object.keys(JSON.parse(ham('sakar_kana') || '{}')).length; } catch (e) { return 0; }
      })(),
      acilanSayisi: acilan.length
    };
  }

  // ---------- KONTROL ----------
  // Yeni açılan başarımları döndürür (kutlama için).
  //
  // ÖNEMLİ — KADEMELİ TETİKLEME:
  // 'zengin-koleksiyon' başarımı "5 başarım aç"a bakar. Tek turda 5 başarım
  // açılınca sayaç 5'e çıkar; eğer veri güncellenmezse AYNI çağrıda bu da
  // açılır ve aslında hak edilmemiş olabilir. Bu yüzden:
  //   • Veri (acilanSayisi) HER açılıştan sonra güncellenir,
  //   • Böylece "5 başarım" şartı ancak gerçekten 5 tanesi açıldığında doğar,
  //   • Ve gereksiz kutlama tekrarı olmaz (testte yakalandı).
  function kontrol() {
    const veri = durumTopla();
    const acilan = acilanlar();
    const yeni = [];

    LISTE.forEach(b => {
      if (acilan.indexOf(b.id) !== -1) return;      // zaten açılmış
      let oldu = false;
      try { oldu = !!b.test(veri); } catch (e) { }
      if (oldu) {
        acilan.push(b.id);
        yeni.push(b);
        // Sayaç başarımları (örn. 'zengin-koleksiyon') doğru değerlendirilsin:
        veri.acilanSayisi = acilan.length;
      }
    });

    if (yeni.length) yaz(ANAHTAR, JSON.stringify(acilan));
    return yeni;
  }

  function acikMi(id) { return acilanlar().indexOf(id) !== -1; }

  // Liste + açık/kapalı durumu (görünüm için)
  function hepsi() {
    const acilan = acilanlar();
    return LISTE.map(b => Object.assign({}, b, { acik: acilan.indexOf(b.id) !== -1 }));
  }

  function ozet() {
    const acilan = acilanlar().length;
    return { acilan: acilan, toplam: LISTE.length, oran: LISTE.length ? acilan / LISTE.length : 0 };
  }

  // ---------- KUTLAMA BANDI ----------
  // app.js ders bitince çağırır; açılan başarım varsa ekranda bant çıkar.
  function kutlamaGoster(yeni, kap) {
    if (!yeni || !yeni.length || !kap) return;
    yeni.forEach((b, i) => {
      setTimeout(() => {
        const bant = document.createElement('div');
        bant.className = 'basarim-bant';
        bant.innerHTML = '<span class="bb-simge">' + b.simge + '</span>' +
          '<span class="bb-yazi"><b>Başarım açıldı!</b>' + b.ad + '</span>';
        kap.append(bant);
        // Kısa bir süre sonra kaybol (DOM şişmesin)
        setTimeout(() => {
          bant.classList.add('bb-cikis');
          setTimeout(() => bant.remove(), 400);
        }, 3200);
      }, i * 700);   // sırayla gelsin
    });
    try { if (window.Ses) Ses.sensei('dogru-1'); } catch (e) { }
  }

  function sifirla() { try { localStorage.removeItem(ANAHTAR); } catch (e) { } }

  window.Basarimlar = {
    LISTE: LISTE,
    GRUPLAR: GRUPLAR,
    kontrol: kontrol,
    acikMi: acikMi,
    hepsi: hepsi,
    ozet: ozet,
    kutlamaGoster: kutlamaGoster,
    durumTopla: durumTopla,
    sifirla: sifirla
  };
})();