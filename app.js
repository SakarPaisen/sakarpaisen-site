// ============================================================
// APP.JS : ANA OYUN MOTORU (Antrenman / Ders ekranı)
//
// Bu dosya oyun.html'in <script> içindeki kodu taşır. Sadece motoru
// çalıştırır; tasarım (HTML/CSS) oyun.html'de, sorular ise ayrı
// dosyalarda durur. Bu ayrım sayesinde yüzlerce soru eklerken motoru
// bozmadan çalışabilirsin.
//
// Bu dosyadan ÖNCE yüklenmesi gerekenler (oyun.html sırayla çağırıyor):
//   mufredat.js -> MUFREDAT (haritadaki daireler)
//   ilerleme.js -> Ilerleme (XP, seri, zayıf harf, tekrar takvimi)
//   ses.js      -> Ses (efekt + Japonca okuma)
//   kana.js     -> KANA, dersUret(), kanaTekrarUret() ... (soru üretici)
//   pwa.js      -> PWA
//
// SORU / DERS NEREDEN GELİR?
//   1) Harf dersleri : mufredat.js'te daireye "harfler" yazarsan kana.js
//                      otomatik soru üretir (dersUret).
//   2) Elle yazılan   : questions.js veya dersler/dersNN.js tek tek soruları
//                      registerDers(id, {...}) ile kaydeder (kelime/kanji...).
// ------------------------------------------------------------
// YENİ ÖZELLİK NEREYE YAZILIR?
//   - Yeni bir soru TİPİ (ör. "yazma", "eşleştirme") eklemek için:
//       a) kana.js / questions.js'te o tipi üret,
//       b) aşağıdaki "ciz()" fonksiyonunda tip'e göre ekran çizimini ekle,
//       c) "cevapla()" fonksiyonunda doğru/yanlış kontrolünü ekle.
//   - Puan / XP / yıldız kuralını değiştirmek için: "bitir()" fonksiyonu.
//   - Klavye kısayolları için: en alttaki "KLAVYE" bölümü.
// ============================================================

(function () {
  'use strict';

  // Kayıt olmadan ders açılmaz (index.html'e gönderir)
  if (!Ilerleme.isim()) { window.location.replace('index.html'); return; }

  // ============ HATA TOPLAMA ============
  // Ders sırasında bir hata oluşursa kullanıcıya sessizce fark ettir ve
  // "sorun mu var?" bağlantısı çıkarır (dojo'daki geri bildirim kutusuna gider).
  HataRapor.kur();
  function hataUyarisiniKur() {
    let uyari = null;
    function guncelle() {
      if (HataRapor.varmi() && !uyari) {
        uyari = document.createElement('a');
        uyari.className = 'hata-uyari';
        uyari.href = 'dojo.html#geri';
        uyari.textContent = '⚠️ Bir sorun mu var? Sensei\'ye söyle';
        document.body.append(uyari);
      } else if (!HataRapor.varmi() && uyari) {
        uyari.remove(); uyari = null;
      }
    }
    window.addEventListener('hata-rapor-guncellendi', guncelle);
    guncelle();
  }
  hataUyarisiniKur();

  // ============ SES ============
  const ustBar = document.getElementById('ustBar');
  ustBar.insertBefore(Ses.buton(), document.getElementById('canlar'));
  Ses.hazirla();
  function sesKontrol() { document.getElementById('sesUyari').hidden = Ses.sesVarMi() || !('speechSynthesis' in window) ? true : false; }
  if ('speechSynthesis' in window) { speechSynthesis.onvoiceschanged = sesKontrol; setTimeout(sesKontrol, 1500); }
  else document.getElementById('sesUyari').hidden = false;

  // ============ DERS / SORU KAYIT DEFTERİ ============
  // Elle yazılan ders dosyaları (questions.js, dersler/dersNN.js) bu fonksiyonu çağırır.
  const DERSLER = {};
  window.registerDers = function (id, ders) { DERSLER[id] = ders; };

  // questions.js içindeki SORULAR dizisini kaydet.
  // questions.js, app.js'ten ÖNCE yüklenir; sadece veri (SORULAR) tanımlar, kayıt burada yapılır.
  // Yeni soru eklemek için questions.js'teki diziye bir nesne eklemen yeterli.
  if (Array.isArray(window.SORULAR)) {
    window.SORULAR.forEach(function (s) {
      if (s && s.id != null && s.ders) DERSLER[s.id] = s.ders;
    });
  }

  // ?ders=5          -> müfredattaki daire
  // ?ders=tekrar      -> aralıklı harf tekrarı (kana.js)
  // ?ders=tekrar-kelime -> KELİME DEFTERİ'nden gelen tekrar dersi (sessionStorage)
  // ?ders=sinav       -> RASTGELE KARIŞIK SINAV (sinav.js)
  const dersParam = new URLSearchParams(window.location.search).get('ders');
  const kelimeTekrarModu = dersParam === 'tekrar-kelime';
  const tekrarModu = dersParam === 'tekrar';
  const sinavModu = dersParam === 'sinav';
  // DİKKAT: iki tekrar modu da DERSLER[0]'a kaydedilir. Sadece 'tekrar'-ı
  // kontrol etmek hataydı: 'tekrar-kelime' sayısal olmadığı için dersID=1
  // oluyor ve DERSLER[0] ile eşleşmiyordu ("ders hazır değil" çıkıyordu).
  //
  // 'sinav' için de aynı tuzak vardı: parseInt('sinav') = NaN, NaN||1 = 1
  // olduğu için sınav isteği DERS 1'i açıyordu (ekran görüntüsünde yakalandı:
  // "İlk harfimiz!" öğretim kartı çıkıyordu). Artık dersID 'sinav' kalıyor.
  const dersID = (tekrarModu || kelimeTekrarModu) ? 0
    : (sinavModu ? 'sinav' : (parseInt(dersParam) || 1));
  // SERBEST_MOD (dojo.html'deki ile aynı): true iken tüm dersler açılır.
  // Kilit geri gelsin istersen burayı false yap (ve dojo.html'deki SERBEST_MOD'u da).
  const SERBEST_MOD = true;
  if (!SERBEST_MOD && !tekrarModu && !kelimeTekrarModu && dersID > Ilerleme.seviye()) { window.location.replace('dojo.html'); return; }   // kilitli daire

  const sahne = document.getElementById('sahne');
  const btn = document.getElementById('devamBtn');
  const bar = document.getElementById('ilerleme');
  const geri = document.getElementById('geriBildirim');
  const canlarEl = document.getElementById('canlar');

  // ============ YARDIMCILAR ============
  function el(tag, sinif, metin) {
    const e = document.createElement(tag);
    if (sinif) e.className = sinif;
    if (metin !== undefined) e.textContent = metin;
    return e;
  }
  function karistir(dizi) { return kanaKaristir(dizi); }              // şıkları karıştır (kana.js)
  function butonAyarla(yazi, renk, golge, onclick) {
    btn.textContent = yazi;
    btn.style.background = renk;
    btn.style.color = renk === 'var(--altin)' ? '#111' : 'white';
    btn.style.boxShadow = '0 5px 0 ' + golge;
    btn.onclick = onclick;
    btn.style.display = 'block';
  }
  // Harf adımıysa romajisini döndürür ('ka'): audio/kana/ka.wav varsa o çalınır
  function kanaAdi(v) { return (v.k && KANA[v.k]) ? KANA[v.k].r : null; }
  function chibiResmi(dosya, yedekEmoji) {
    const img = el('img', 'son-chibi'); img.src = dosya; img.alt = 'Sensei';
    img.onerror = () => { const e = el('div', 'buyuk', yedekEmoji); img.replaceWith(e); };
    return img;
  }

  // Cümle kartı: Japonca cümleyi kelime kelime gösterir.
  // Her kelimeye tıklayınca anlamı (Türkçe + romaji) altta bir baloncukta çıkar.
  // secenekler: { interaktif, romaji, tr }  -> hangi ipuçları/malzemeler gösterilsin
  //   romaji:false -> romaji gizlenir (romaji sorulduğunda cevabı sızdırmasın)
  //   tr:false    -> Türkçe gizlenir (anlam sorulduğunda sızdırmasın)
  function cumleKart(cumle, secenekler) {
    secenekler = secenekler || {};
    const interaktif = !!secenekler.interaktif;
    const kart = el('div', 'cumle-kart');
    const satir = el('div', 'cumle-ja');

    // reading.js'teki sözlükle cümleyi kelimelere ayır
    const parcalar = (window.READING && window.READING.SOZLUK)
      ? cumleParcalaYerel(cumle.ja, window.READING.SOZLUK)
      : [{ metin: cumle.ja, kelime: null }];

    parcalar.forEach(p => {
      const span = el('span', 'kelime-mi', p.metin);
      if (interaktif && p.kelime) {
        span.classList.add('tiklabilir');
        span.title = p.kelime.tr;
        span.onclick = (e) => {
          e.stopPropagation();
          const eski = kart.querySelector('.anlam-balon');
          if (eski) eski.remove();
          const bal = el('div', 'anlam-balon');
          bal.append(el('b', '', p.kelime.ja), el('span', '', ' — ' + p.kelime.ro + ' — ' + p.kelime.tr));
          kart.append(bal);
        };
      }
      satir.append(span);
    });

    kart.append(satir);
    if (secenekler.romaji !== false) kart.append(el('div', 'cumle-ro', cumle.ro));
    if (secenekler.tr) kart.append(el('div', 'cumle-tr', cumle.tr));
    const sesBtn = el('button', 'ses-btn ses-btn-cumle', '🔊');
    sesBtn.onclick = () => Ses.oku(cumle.ja, true);
    kart.append(sesBtn);
    return kart;
  }

  // app.js içinde basit cümle parçalayıcı (reading.js'teki ile aynı mantık)
  function cumleParcalaYerel(ja, sozluk) {
    const metin = ja.replace(/[。、！？\s]/g, '');
    const sirali = sozluk.slice().sort((a, b) => b.ja.length - a.ja.length);
    const sonuc = [];
    let i = 0;
    while (i < metin.length) {
      let bulundu = null;
      for (const k of sirali) { if (metin.startsWith(k.ja, i)) { bulundu = k; break; } }
      if (bulundu) { sonuc.push({ metin: bulundu.ja, kelime: bulundu }); i += bulundu.ja.length; }
      else { sonuc.push({ metin: metin[i], kelime: null }); i += 1; }
    }
    return sonuc;
  }

  // ============ MOTOR DURUMU ============
  let ders, kuyruk, adim, tamamlanan, toplam, can, hata, kilitli;
  // Yanlış soruların kaç tanesi dersin sonunda tekrar sorulacak?
  // Sınırsız olursa (eski davranış) yanlış yapan kullanıcı dersi bitiremiyordu.
  const TEKRAR_TAVANI = 3;
  let tekrarEklenecek = 0;
  let klavyeIpucuGosterildi = false;   // ders başına yalnızca bir kez gösterilir
  let klavyeIpucuZaman = null;

  // ---- "NE ÖĞRENDİM" ÖZETİ İÇİN TOPLAMA ----
  // Ders boyunca karşılaşılan harf id'leri ve yanlış yapılanlar.
  // Ders bitişinde öğrenilen-kutu bunları gösterir.
  let gorulenIdler = [];
  let zorlanilanlar = [];

  function gorulenIdEkle(id) {
    if (!id) return;
    if (gorulenIdler.indexOf(id) === -1) gorulenIdler.push(id);
  }
  // Hata ayıklama ve testler için dışarı açılır (üretimde zararsız).
  window.__gorulenIdler = function () { return gorulenIdler.slice(); };
  function zorlanilanEkle(id) {
    if (!id) return;
    if (zorlanilanlar.indexOf(id) === -1) zorlanilanlar.push(id);
  }

  // Özet için harf listesi: önce zorlanılanlar, sonra geri kalanı
  function ogrenilenOzet() {
    const zor = zorlanilanlar.filter(id => gorulenIdler.indexOf(id) !== -1);
    const diger = gorulenIdler.filter(id => zorlanilanlar.indexOf(id) === -1);
    // Sadece harf (KANA'da olan) id'ler gösterilir; kelime/kanji id'leri atlanır
    const suz = arr => arr.filter(id => (typeof KANA !== 'undefined') && KANA[id]);
    return suz(zor).concat(suz(diger));
  }

  // Testler için saf yardımcılar (üretimde zararsız).
  // UI üzerinden ders bitirmek Playwright'ta çok yavaş/kırılgan olduğu için
  // (bir testte 8 deneme yaptım), özet mantığını doğrudan test ediyoruz.
  window.__ozetTest = {
    sifirla: function () { gorulenIdler = []; zorlanilanlar = []; },
    gorulenEkle: function (id) { gorulenIdEkle(id); },
    zorlanilanEkle: function (id) { zorlanilanEkle(id); },
    liste: function () { return gorulenIdler.slice(); },
    zorListe: function () { return zorlanilanlar.slice(); },
    ozet: function () { return ogrenilenOzet(); }
  };

  function hazirDegil(baslik, alt) {
    sahne.innerHTML = '';
    sahne.append(el('div', 'buyuk', tekrarModu ? '🌸' : '🚧'), el('div', 'mesaj', baslik || 'Bu ders henüz hazır değil'));
    if (alt) sahne.append(el('div', 'ip', alt));
    const b = el('button', 'ikincil', 'Haritaya dön');
    b.onclick = () => window.location.href = 'dojo.html';
    sahne.append(b);
  }

  // ============ KOMBO (kombo.js) ============
  // Üst üste doğru cevap → çarpan artar. Ekranda sağ üstte rozet görünür.
  let komboEl = null, komboGizleZaman = null;

  function komboGosterge() {
    if (!komboEl) {
      komboEl = document.createElement('div');
      komboEl.className = 'kombo-rozet';
      komboEl.id = 'komboRozet';
      document.body.appendChild(komboEl);
    }
    return komboEl;
  }

  function komboCiz(k) {
    const e = komboGosterge();
    const etiket = Kombo.etiket(k.adet);
    e.innerHTML = '<span class="k-carpan">' + etiket + '</span>' +
      '<span class="k-seri">' + k.adet + ' doğru üst üste</span>';
    e.classList.remove('kirildi');
    e.classList.add('gorunur');
    // Rozet birkaç saniye sonra solsun (ekranı kaplamasın)
    clearTimeout(komboGizleZaman);
    komboGizleZaman = setTimeout(() => e.classList.remove('gorunur'), 3200);
  }

  function komboDogru() {
    if (!window.Kombo) return;
    const k = Kombo.dogru();
    if (k.adet < 2) return;              // 1 doğruda gösterge çıkmasın (gürültü)
    komboCiz(k);
    // ANİMASYON: 3'lü seriden itibaren üstte kısa süre yüzen kutlama yazısı.
    // NEDEN: Üstteki kombo sayacı gözden kaçıyor (küçük ve sabit). Yüzen yazı
    // "iyi gidiyorsun" geri bildirimini anlık ve belirgin verir.
    // Her doğruda değil, eşik geçildiğinde: yoksa sürekli yazı çıkar ve
    // etkisini kaybeder.
    if (k.yeniEsik || k.adet === 3) komboYazisi(k.adet + '’Lİ SERİ! 🔥');
    // Yeni çarpan eşiği geçildiyse küçük bir kutlama sesi
    if (k.yeniEsik) { try { Ses.dogru(); } catch (e) { } }
  }

  function komboYanlis() {
    if (!window.Kombo) return;
    const r = Kombo.yanlis();
    if (r.kirilan >= 3) {                // anlamlı bir seri kırıldıysa göster
      const e = komboGosterge();
      e.innerHTML = '<span class="k-carpan">💔</span>' +
        '<span class="k-seri">' + r.kirilan + ' doğru seri gitti</span>';
      e.classList.add('gorunur', 'kirildi');
      clearTimeout(komboGizleZaman);
      komboGizleZaman = setTimeout(() => e.classList.remove('gorunur'), 2600);
    }
  }

  function komboTemizle() {
    if (window.Kombo) Kombo.temizle();
    if (komboEl) komboEl.classList.remove('gorunur');
  }

  function basla() {
    klavyeIpucuGosterildi = false;
    komboTemizle();                        // her ders kombosu sıfırdan başlar
    gorulenIdler = [];                     // "ne öğrendim" özeti için
    zorlanilanlar = [];
    ders = DERSLER[dersID];
    if (!ders || !ders.adimlar.length) return hazirDegil();

    // ZORLUK AYARI (ayarlar.js): kullanıcı Kolay/Normal/Zorlu seçebilir.
    //  - Can sayısı: zorluktan gelir. SINAVLAR (boss) kendi canını korur —
    //    sınavın zorluğu kullanıcı ayarına göre değişmemeli.
    //  - Soru sayısı: Zorlu'da %25 uzatılır, Kolay'da %20 kısaltılır.
    // Ayarlar yüklenmemişse (window.Ayarlar yok) eski davranış aynen sürer.
    const z = (window.Ayarlar && Ayarlar.zorluk) ? Ayarlar.zorluk() : { can: 4, soruOran: 1 };
    // Sınav modu iki biçimde gelebilir:
    //   1) ?ders=sinav        -> RASTGELE SINAV (sinav.js), can ders.can'dan
    //   2) müfredattaki boss  -> sabit sınav, can mufredat.js'te
    // İkisinde de kullanıcının ZORLUK canı UYGULANMAZ: sınavın zorluğu
    // kullanıcı ayarına göre değişmemeli.
    const mufredatSinav = (MUFREDAT.find(m => m.id === dersID) || {}).tip === 'boss';
    const sinav = mufredatSinav || sinavModu;

    let adimlar = ders.adimlar;
    if (!sinav && z.soruOran && z.soruOran !== 1) {
      const hedef = Math.max(4, Math.round(adimlar.length * z.soruOran));
      if (hedef < adimlar.length) adimlar = adimlar.slice(0, hedef);
    }

    kuyruk = adimlar.slice();      // adımlar sıraya girer
    toplam = (ders.adimlar.length) ? adimlar.length : 0;
    adim = 0; tamamlanan = 0; hata = 0;
    tekrarEklenecek = 0;
    // Normal derslerde zorluk canı; sınavlar kendi canını korur (sinav.js -> 3).
    can = sinav ? (ders.can || 5) : z.can;
    canGuncelle();
    // Analitik: hangi ders başladı? (Analitik kapalıysa hiçbir şey olmaz)
    const dersItem = MUFREDAT.find(m => m.id === dersID);
    if (window.Analitik) {
      window.Analitik.dersBasladi({
        ders: dersID,
        tip: dersItem ? dersItem.tip : 'bilinmiyor',
        adimSayisi: toplam
      });
      window.Analitik.olay('ders_basladi', { ders: dersID, tip: dersItem ? dersItem.tip : '?' });
    }
    ciz();
  }

  function canGuncelle() { canlarEl.textContent = '❤️'.repeat(Math.max(can, 0)) || '💔'; }

  // ---------- EKRANI ÇİZ ----------
  // Yeni bir SORU TİPİ eklediysen buraya bir "if (v.tip === 'yeni_tip') { ... return; }" bloğu ekle.

  // ============================================================
  // ANİMASYON YARDIMCILARI
  //
  // NEDEN: Önceden sorular arası hiç geçiş yoktu; ekran bir anda değişiyordu.
  // Ders "düz" hissettiriyordu. Aşağıdaki yardımcılar hareketi TEK YERDEN
  // yönetir; böylece erişilebilirlik (hareket azaltma) ve performans
  // kararı da tek noktada verilir.
  //
  // KURAL: Animasyonlar ayarlardan kapatılabilir. `animasyonAcikMi()` her
  // çağrıda güncel durumu okur (ayar ders sırasında değişse bile doğru çalışır).
  // ============================================================
  function animasyonAcikMi() {
    try {
      if (document.documentElement.getAttribute('data-animasyon') === '0') return false;
      if (document.body && document.body.getAttribute('data-animasyon') === '0') return false;
    } catch (e) { }
    // Sistem seviyesi tercih: "hareketi azalt" açıksa hiç animasyon yapmayız.
    try { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false; } catch (e) { }
    return true;
  }

  // Bir elemana animasyon sınıfı ekler; animasyon bitince sınıfı temizler.
  // (Sınıf kalmazsa aynı animasyon ikinci kez oynatılamaz.)
  function animasyonVer(hedef, sinif, sure) {
    if (!hedef || !animasyonAcikMi()) return;
    hedef.classList.remove(sinif);
    // Tarayıcıyı yeniden hesaplamaya zorla: ardışık aynı animasyon çalışsın.
    void hedef.offsetWidth;
    hedef.classList.add(sinif);
    setTimeout(() => hedef.classList.remove(sinif), sure || 700);
  }

  // Şıkları KADEMELİ getir: hepsi aynı anda belirmesin, tek tek düşsün.
  // Kademe 55 ms: algılanabilir ama bekletmez.
  function sikKademeliGir(kap) {
    if (!animasyonAcikMi()) return;
    const siklar = kap.querySelectorAll('.secenek, .secenek-yazi');
    siklar.forEach((b, i) => {
      b.style.animationDelay = (i * 55) + 'ms';
      b.classList.add('secenek-gir');
      // Gecikme sıfırlansın ki sonraki soruda şıklar yine tek tek gelsin.
      setTimeout(() => {
        b.classList.remove('secenek-gir');
        b.style.animationDelay = '';
      }, 320 + i * 55);
    });
  }

  // Adımlar arası renk dalgası: "nefes alma" anı.
  // Çok sık kullanılmaz — yalnızca uzun derslerde, her 3 adımda bir.
  function gecisDalgasi() {
    if (!animasyonAcikMi()) return;
    if (adim === 0 || adim % 3 !== 0) return;
    const d = el('div', 'gecis-dalga');
    (document.querySelector('.ders-kap') || document.body).append(d);
    setTimeout(() => d.remove(), 520);
  }

  // Kombo yazısı: üstte kısa süre yüzen "3'LÜ SERİ!"
  function komboYazisi(metin) {
    if (!metin || !animasyonAcikMi()) return;
    const y = el('div', 'kombo-yazi', metin);
    document.body.append(y);
    setTimeout(() => y.remove(), 1100);
  }

  function ciz() {
    kilitli = false;
    geri.className = 'geri-bildirim';   // alt bar rengi sifirlansin
    document.querySelector('.alt-bar').classList.remove('durum-iyi', 'durum-hata');
    btn.style.display = 'none';
    geri.textContent = '';
    // İLERLEME ÇUBUĞU: ÖNEMLİ — adım sayısına göre hesaplanır, doğru cevap
    // sayısına göre DEĞİL. Eskiden yalnızca cevap verilince artıyordu; bu
    // yüzden ders öğretim kartlarıyla başladığında çubuk 0'da kalıyor ve
    // kullanıcı "hiç ilerlemiyorum" hissine kapılıyordu. Artık her adımda
    // (öğretim kartları dahil) çubuk gerçek konumu gösterir.
    bar.style.width = (adim / toplam * 100) + '%';
    if (adim >= kuyruk.length) return bitir();

    const v = kuyruk[adim];
    sahne.innerHTML = '';
    sahne.dataset.soruTipi = v.tip || 'bilinmiyor';   // soru tipini sahneye yaz (test/otomasyon kolayligi)

    // ANİMASYON: İçerik boşaltıldıktan SONRA sahneyi yeniden canlandır.
    // Sınıfı burada ekliyoruz çünkü sahne.innerHTML temizliği önceki
    // animasyon durumunu siliyor; sıra önemli.
    animasyonVer(sahne, 'sahne-gir', 420);
    gecisDalgasi();

    // "NE ÖĞRENDİM" özeti için: bu adımda geçen harfi topla.
    // kana derslerinde adımın 'k' alanı harf id'sidir ('h:ka' gibi).
    if (v.k) gorulenIdEkle(v.k);

    // --- Tip: 'ogret' (yeni bir şey göster) ---
    if (v.tip === 'ogret') {
      sahne.append(el('div', 'mesaj mesaj-renkli', v.mesaj || 'Yeni bir şey öğreniyoruz!'));
      const kart = el('div', 'kart');
      if (v.resim) {
        const img = el('img'); img.src = v.resim; img.alt = v.ro || '';
        img.onerror = () => img.remove();
        kart.append(img);
      }
      const ja = el('div', 'kart-ja', v.ja);
      ja.style.fontSize = v.ja.length > 4 ? '40px' : v.ja.length > 2 ? '56px' : v.resim ? '64px' : '90px';
      kart.append(ja, el('div', 'kart-ro', v.ro));
      // ANİMASYON: Kart dönerek gelir, büyük harf ayrıca "damgalanır".
      // Öğrencinin gözü önce harfe gitsin diye iki katmanlı hareket.
      animasyonVer(kart, 'kart-gir', 520);
      animasyonVer(ja, 'vurgu', 700);
      if (!v.sessiz) {
        const s = el('button', 'ses-btn', '🔊'); s.onclick = () => Ses.oku(v.ses || v.ja, true, kanaAdi(v));
        kart.append(s);
      }
      sahne.append(kart);
      // Örnek kelime kartı: harfin geçtiği gerçek bir kelime (varsa)
      if (v.ornek) {
        const ok = el('div', 'ornek-kart');
        const okJa = el('span', 'ornek-ja', v.ornek.ja);
        const okYazi = el('span', 'ornek-yazi', ' · ' + v.ornek.ro + ' · ' + v.ornek.tr);
        ok.append(el('div', 'ornek-etiket', 'Örnek kelime'), okJa, okYazi);
        ok.style.cursor = 'pointer';
        ok.title = 'Dinlemek için tıkla';
        ok.onclick = () => Ses.oku(v.ornek.ja, true);
        sahne.append(ok);
      }
      if (v.ip) sahne.append(el('div', 'ip', v.ip));
      butonAyarla('ANLADIM', '#4a4e69', '#2a2c3d', ilerle);
      if (!v.sessiz) setTimeout(() => Ses.oku(v.ses || v.ja, false, kanaAdi(v)), 300);
      return;
    }

    // --- Tip: 'yaz' (harfi göster, romajisini klavyeyle yazdır) ---
    //     Şık yoktur: cevabı app.js kendisi kontrol eder (cevaplaYazi).
    if (v.tip === 'yaz') {
      sahne.append(el('div', 'mesaj', v.soru || 'Bu harfin okunuşunu yaz'));
      const kart = el('div', 'kart');
      const ja = el('div', 'kart-ja', v.buyuk);
      ja.style.fontSize = v.buyuk.length > 2 ? '64px' : '96px';
      kart.append(ja);
      const s = el('button', 'ses-btn', '🔊');
      s.onclick = () => Ses.oku(v.buyuk, true, v.dogru);
      kart.append(s);
      sahne.append(kart);

      const kutu = el('input', 'yaz-kutu');
      kutu.type = 'text';
      kutu.autocomplete = 'off';
      kutu.autocapitalize = 'off';
      kutu.spellcheck = false;
      kutu.placeholder = 'romaji yaz (örn: ka)';
      kutu.maxLength = 6;
      kutu.setAttribute('aria-label', 'Romaji cevabı');

      // Canlı ipucu: doğru UZUNLUK ipucu verir, cevabı sızdırmaz.
      const uzunlukIp = el('div', 'yaz-ipucu', v.dogru.length + ' harfli');

      const gonder = el('button', 'yaz-gonder', 'KONTROL ET');

      function dene() {
        if (kilitli) return;
        const yazilan = kutu.value.trim().toLowerCase();
        if (!yazilan) { kutu.focus(); return; }
        kutu.disabled = true;
        cevaplaYazi(yazilan, v, kutu);
      }

      gonder.onclick = dene;
      // Enter ile gönder (kullanıcı alışkanlığı) ama sayfa yenilenmesin.
      kutu.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); dene(); }
      });

      sahne.append(kutu, uzunlukIp, gonder);
      if (v.ip) sahne.append(el('div', 'ip', v.ip));
      setTimeout(() => kutu.focus(), 250);
      return;
    }

    // --- Tip: 'dikte' (cümleyi dinle, romaji yaz) ---
    // Dinleme + yazma becerisini birleştiren en zor alıştırma.
    // Ekran: büyük ses butonu + romaji giriş kutusu + kontrol butonu.
    if (v.tip === 'dikte') {
      sahne.append(el('div', 'mesaj', v.soru || 'Dinle ve yaz'));

      const sesKutu = el('div', 'dikte-ses');
      const sesBtn = el('button', 'ses-buyuk', '🔊');
      sesBtn.title = 'Tekrar dinle';
      sesBtn.onclick = () => Ses.oku(v.ses, true);
      sesKutu.append(sesBtn, el('div', 'dikte-ip', 'Tekrar dinlemek için bas'));
      sahne.append(sesKutu);

      const kutu = el('input', 'yaz-kutu dikte-kutu');
      kutu.type = 'text';
      kutu.autocomplete = 'off';
      kutu.autocapitalize = 'off';
      kutu.spellcheck = false;
      kutu.placeholder = 'duyduğun cümleyi romaji ile yaz';
      kutu.maxLength = 80;
      kutu.setAttribute('aria-label', 'Romaji cevabı');

      const gonder = el('button', 'yaz-gonder', 'KONTROL ET');

      function dene() {
        if (kilitli) return;
        const yazilan = kutu.value.trim();
        if (!yazilan) { kutu.focus(); return; }
        kutu.disabled = true;
        cevaplaDikte(yazilan, v, kutu);
      }

      gonder.onclick = dene;
      kutu.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); dene(); }
      });

      sahne.append(kutu, gonder);
      if (v.ip) sahne.append(el('div', 'ip', v.ip));
      // Otomatik bir kez çal (kullanıcı hemen duysun)
      setTimeout(() => { Ses.oku(v.ses, false); kutu.focus(); }, 350);
      return;
    }

    // --- Tip: 'kelime-ogret' (yeni kelime kartı: kana + romaji + Türkçe) ---
    if (v.tip === 'kelime-ogret') {
      // Kelime defterine kaydet (kanji bölümü geldiğinde buradan bakılacak)
      if (v.kelime && v.kelime.ja) Ilerleme.kelimeGor(v.kelime.ja, 'ders');
      sahne.append(el('div', 'mesaj mesaj-renkli', 'Yeni kelime!'));
      const kart = el('div', 'kart');
      const ja = el('div', 'kart-ja', v.kelime.ja);
      ja.style.fontSize = v.kelime.ja.length > 3 ? '44px' : '64px';
      kart.append(ja, el('div', 'kart-ro', v.kelime.ro));
      const s = el('button', 'ses-btn', '🔊'); s.onclick = () => Ses.oku(v.kelime.ja, true);
      kart.append(s);
      sahne.append(kart, el('div', 'kelime-tr', v.kelime.tr));
      butonAyarla('ANLADIM', '#4a4e69', '#2a2c3d', ilerle);
      setTimeout(() => Ses.oku(v.kelime.ja, false), 300);
      return;
    }

    // --- Tip: 'kanji-ogret' (yeni kanji kartı: kanji + okunuş(lar) + anlam + örnek) ---
    // Kanji, Hiragana/Katakana'dan SONRA gelir (Bölüm 9). Kanji anlam taşır;
    // kun'yomi (Japonca okunuş) ve on'yomi (Çince kökenli) ayrı gösterilir.
    if (v.tip === 'kanji-ogret') {
      const k = v.kanji;
      // ÖNEMLİ: Kanjiyi "öğretildi" olarak kaydet. Karışık dersler yalnızca
      // öğretilmiş kanjilerden sorar; bu kayıt olmadan kanji havuzu boş kalır.
      if (window.KANJI && window.KANJI.ogretildi) window.KANJI.ogretildi(k);
      sahne.append(el('div', 'mesaj mesaj-renkli', 'Yeni kanji!'));
      const kart = el('div', 'kart');
      const ja = el('div', 'kart-ja', k.k);
      ja.style.fontSize = '96px';   // tek karakter: büyük ve okunaklı
      kart.append(ja);
      const s = el('button', 'ses-btn', '🔊');
      s.onclick = () => Ses.oku(k.kun || k.on || k.k, true);
      kart.append(s);
      sahne.append(kart);

      // Okunuşlar: kun'yomi hiragana, on'yomi katakana ile yazılır
      const okunuslar = [];
      if (k.kun) okunuslar.push({ et: 'Kun (Japonca)', deger: k.kun });
      if (k.on) okunuslar.push({ et: 'On (Çince)', deger: k.on });
      if (okunuslar.length) {
        const kutu = el('div', 'kanji-okunus');
        okunuslar.forEach(o => {
          const satir = el('div', 'kanji-okunus-satir');
          satir.append(el('span', 'kanji-okunus-et', o.et), el('span', 'kanji-okunus-deger', o.deger));
          kutu.append(satir);
        });
        sahne.append(kutu);
      }

      sahne.append(el('div', 'kelime-tr', k.tr));
      if (k.ornek) {
        const ok = el('div', 'ornek-kart');
        ok.append(el('div', 'ornek-etiket', 'Örnek kelime'),
          el('span', 'ornek-ja', k.ornek.ja),
          el('span', 'ornek-yazi', ' · ' + k.ornek.ro + ' · ' + k.ornek.tr));
        ok.style.cursor = 'pointer';
        ok.title = 'Dinlemek için tıkla';
        ok.onclick = () => Ses.oku(k.ornek.ja, true);
        sahne.append(ok);
      }
      butonAyarla('ANLADIM', '#4a4e69', '#2a2c3d', ilerle);
      setTimeout(() => Ses.oku(k.kun || k.on || k.k, false), 300);
      return;
    }

    // --- Tip: 'kelime' (kelimenin anlamı, romajisi veya içindeki ses sorulur) ---
    if (v.tip === 'kelime') {
      sahne.append(el('div', 'mesaj', v.soru));
      const kart = el('div', 'kart');
      const ja = el('div', 'kart-ja', v.kelime.ja);
      ja.style.fontSize = v.kelime.ja.length > 3 ? '44px' : '64px';
      kart.append(ja);
      const s = el('button', 'ses-btn', '🔊'); s.onclick = () => Ses.oku(v.kelime.ja, true);
      kart.append(s);
      sahne.append(kart);
      const izgara = el('div', 'secenekler secenekler-yazi');
      siklarYaz(izgara, v.siklar, v.dogru, v, 'secenek-metin');
      sahne.append(izgara);
      setTimeout(() => Ses.oku(v.kelime.ja, false), 300);
      return;
    }

    // --- Tip: 'cumle-ogret' (yeni cümle: kelimelere tıklayınca anlam çıkar) ---
    // İki alt kullanım var:
    //   1) Okuma bölümü dersleri  -> "Okuma zamanı!"
    //   2) Harf dersinin SONUNDA  -> "Bu harflerle yazılmış gerçek bir cümle!"
    //      (v.dersHarfleri doluysa bu alt kullanımdır; öğrenciye başarı hissi verir)
    if (v.tip === 'cumle-ogret') {
      const dersSonu = !!(v.dersHarfleri && v.dersHarfleri.length);
      if (dersSonu) {
        sahne.append(el('div', 'mesaj mesaj-renkli', '🎉 Tebrikler, okuyabiliyorsun!'));
        sahne.append(el('div', 'ip',
          'Aşağıdaki cümle SADECE öğrendiğin harflerle yazıldı. Kelimelere dokunarak anlamlarını görebilirsin.'));
      } else {
        sahne.append(el('div', 'mesaj mesaj-renkli', 'Okuma zamanı!'));
      }
      sahne.append(cumleKart(v.cumle, { interaktif: true, romaji: true, tr: true }));
      butonAyarla(dersSonu ? 'HARİKA!' : 'ANLADIM', '#4a4e69', '#2a2c3d', ilerle);
      setTimeout(() => Ses.oku(v.cumle.ja, false), 300);
      return;
    }

    // --- Tip: 'cumle' (cümlenin Türkçe anlamı veya romajisi sorulur) ---
    if (v.tip === 'cumle') {
      sahne.append(el('div', 'mesaj', v.soru));
      // Soru romaji ise romajiyi gizle; Türkçe anlamı her zaman gizle (cevabı sızdırmasın)
      const romajiSoruluyor = (v.soru || '').toLowerCase().indexOf('romaji') !== -1;
      sahne.append(cumleKart(v.cumle, { interaktif: true, romaji: !romajiSoruluyor, tr: false }));
      const izgara = el('div', 'secenekler secenekler-yazi');
      siklarYaz(izgara, v.siklar, v.dogru, v, 'secenek-metin');
      sahne.append(izgara);
      return;
    }

    // --- Tip: 'dinle-cumle' (cümleyi dinlet, doğru Japonca cümleyi seçtir) ---
    if (v.tip === 'dinle-cumle') {
      sahne.append(el('div', 'mesaj', v.soru || 'Ne dedi?'));
      const s = el('button', 'ses-buyuk', '🔊'); s.onclick = () => Ses.oku(v.ses, true);
      sahne.append(s);
      const izgara = el('div', 'secenekler secenekler-yazi');
      siklarYaz(izgara, v.siklar, v.dogru, v, 'secenek-metin');
      sahne.append(izgara);
      setTimeout(() => Ses.oku(v.ses, false), 300);
      return;
    }

    // --- Tip: 'soru' ve 'dinle' (çoktan seçmeli harf soruları) ---
    sahne.append(el('div', 'mesaj', v.soru || 'Duyduğun ses hangisi?'));
    if (v.buyuk) sahne.insertBefore(el('div', 'buyuk', v.buyuk), sahne.firstChild);
    if (v.tip === 'dinle') {
      const s = el('button', 'ses-buyuk', '🔊'); s.onclick = () => Ses.oku(v.ses, true, kanaAdi(v));
      sahne.append(s);
      setTimeout(() => Ses.oku(v.ses, false, kanaAdi(v)), 300);
    }
    const izgara = el('div', 'secenekler');
    siklarYaz(izgara, v.siklar, v.dogru, v, '');
    sahne.append(izgara);
    // Karıştırılan çift sorusunda ayırt etme ipucu (varsa) en altta gösterilir.
    if (v.ip) sahne.append(el('div', 'ip', v.ip));
    // Dersin ilk sorusunda klavye kısayollarını bir kez hatırlat (yalnızca klavyeli cihazda).
    if (!klavyeIpucuGosterildi && klavyeVar()) {
      // İpucu artık daha fazla kısayolu gösterir (r = tekrar dinle).
      // Bu, klavyeyi keşfetmeyi teşvik eder.
      klavyeIpucuGosterildi = true;
      const ip = klavyeIpucu();
      sahne.append(ip);
      // Kısa süre sonra sessizce kaybolsun; yer kaplamaya devam etmesin.
      klavyeIpucuZaman = setTimeout(() => { if (ip.parentNode) ip.remove(); }, 7000);
    }
  }

  // Şıkları sahneye yazan ortak yardımcı: doğru şık .veri-dogru ile işaretlenir.
  // Klavye/ekran okuyucu ve otomatik testler tek kaynaktan doğruyu öğrenir.
  // Her şıkkın solunda klavye numarası (1, 2, 3, 4) rozet olarak gösterilir.
  function siklarYaz(kap, siklar, dogru, v, ekSinif) {
    karistir(siklar).forEach((sik, i) => {
      const b = el('button', ('secenek ' + (ekSinif || '')).trim(), sik);
      if (sik === dogru) b.dataset.dogru = '1';
      // Numara rozeti: klavye kısayolun görünür karşılığı
      b.dataset.sira = String(i + 1);
      b.append(el('span', 'sik-no', String(i + 1)));
      b.onclick = () => cevapla(b, sik, v);
      kap.append(b);
    });
    // ANİMASYON: Şıklar tek tek düşsün (hepsi birden belirmesin).
    sikKademeliGir(kap);
  }

  // Klavye kısayolları hiç fark edilmiyordu; dersin ilk sorusunda bir kez hatırlatılır.
  function klavyeIpucu() {
    const ip = el('div', 'klavye-ipucu');
    const parca = (tus, yazi) => {
      if (ip.childNodes.length) ip.append(el('span', 'kk-ayrac', '·'));
      ip.append(el('span', 'kk-tus', tus), el('span', 'kk-yazi', yazi));
    };
    parca('1-4', 'şık seç');
    parca('Enter', 'devam');
    parca('R', 'tekrar dinle');
    parca('Esc', 'harita');
    setTimeout(() => ip.classList.add('soluyor'), 7000);
    return ip;
  }

  // Dokunmatik cihazda klavye yok; o yüzden yalnızca gerçek klavye varsa göster.
  function klavyeVar() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  // ---------- CEVABI DEĞERLENDİR ----------
  // PUAN / HATA / CAN mantığı burada. Yeni soru tipi eklediysen doğru kontrolünü buraya yaz.
  // Alt barı Duolingo gibi renklendir: yeşil = doğru, kırmızı = yanlış
  function altBarDurum(durum) {
    const ab = document.querySelector('.alt-bar');
    ab.classList.remove('durum-iyi', 'durum-hata');
    if (durum) ab.classList.add(durum === 'iyi' ? 'durum-iyi' : 'durum-hata');
  }

  // Sensei'nin ders içi tepkisi (Duolingo'nun "Nicely done!"sü gibi)
  const OVGULER = ['Harika!', 'Aynen öyle!', 'Tam isabet!', 'Bravo!', 'Süpersin!'];

  // "DEVAM ET" butonu neden bazen altta kalıyor gibi görünüyor?
  // Eski akışta kullanıcı şıkka basınca buton sahnenin altına (görüş alanının dışına)
  // çiziliyordu ve kendisi fark etmiyordu. Artık:
  //   1) Alt bar butonu hemen gösterilir,
  //   2) Görünür alana kaydırılır (scrollIntoView),
  //   3) Kısa bir "dikkat çekme" animasyonu oynar.
  function devamButonuGoster() {
    btn.style.display = 'block';
    // Sahne kaydırılabilir olduğu için butonun görünür kalmasını garantile
    requestAnimationFrame(() => {
      const kutu = btn.getBoundingClientRect();
      const barKutu = document.querySelector('.alt-bar').getBoundingClientRect();
      const sahneKutu = sahne.getBoundingClientRect();
      if (kutu.top < sahneKutu.top || kutu.top > sahneKutu.bottom) {
        btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      // Görsel olarak "buraya bas" hissi: kısa parlama
      btn.classList.remove('dikkat'); void btn.offsetWidth; btn.classList.add('dikkat');
      setTimeout(() => btn.classList.remove('dikkat'), 700);
    });
  }

  // ============ YANLIŞ DEFTERİ (yanlis.js) ============
  // Kullanıcı yanlış cevap verdiğinde "hangi harfi hangisiyle karıştırdı"
  // bilgisini kaydeder. Bu veri, sınav modunun (sinav.js) yanlış şıklarını
  // ANLAMLI seçmesini sağlar: kullanıcı し ile つ'yu karıştırıyorsa,
  // sınavda し sorulduğunda şıklara つ konur. Rastgele dolgu yerine
  // gerçekten zorlayan bir sınav çıkar.
  function yanlisliIdBul(metin, alfabe) {
    if (!metin || typeof KANA === 'undefined') return null;
    for (const id in KANA) {
      const e = KANA[id];
      if (alfabe && e.a !== alfabe) continue;
      if (e.j === metin || e.r === metin) return id;
    }
    return null;
  }

  function yanlisKaydet(secilen, v) {
    // Zorlanma işareti HER durumda konur (özet için gerekli)
    if (v && v.sesId) zorlanilanEkle(v.sesId);
    // Çift kaydı ise yalnızca harf sorularında anlamlı
    if (!window.Yanlis || !v || !v.sesId) return;
    const dogruId = v.sesId;
    const alfabe = (typeof KANA !== 'undefined' && KANA[dogruId]) ? KANA[dogruId].a : null;
    const verilenId = yanlisliIdBul(secilen, alfabe);
    if (verilenId && verilenId !== dogruId) Yanlis.ciftKaydet(verilenId, dogruId);
  }

  function cevapla(buton, secilen, v) {
    if (kilitli) return;
    kilitli = true;
    const dogruMu = secilen === v.dogru;
    if (v.k) Ilerleme.cevapKaydet(v.k, dogruMu);          // zayıf harf takibi + tekrar takvimi
    // Kelime sorusuysa kelime defterine işle (kanji bölümü için birikiyor)
    if (v.kelime && v.kelime.ja) Ilerleme.kelimeCevap(v.kelime.ja, dogruMu);
    // Kanji sorusuysa kanji takibine işle (aralıklı tekrar + serpiştirme ağırlığı)
    if (v.kanji && window.KANJI && window.KANJI.cevap) window.KANJI.cevap({ k: v.kanji }, dogruMu);
    // Seçilen şık üzerinde ANINDA geri bildirim: renk + küçük zıplama
    buton.classList.add(dogruMu ? 'dogru-btn' : 'yanlis-btn');
    buton.classList.add('sik-animasyon');
    setTimeout(() => buton.classList.remove('sik-animasyon'), 320);

    if (dogruMu) {
      Ses.dogru(); Ses.tepki(true);
      tamamlanan++;
      // ANİMASYON: Doğru cevabın etrafında yeşil HALKA dalgası yayılır.
      // Renk değişimi tek başına zayıf bir işaret; halka gözü "buraya" çeker.
      animasyonVer(buton, 'kutlama', 700);
      // GÜNLÜK GÖREV: doğru cevap sayacını besle (gorevler.js)
      if (window.Gorevler) { try { Gorevler.olay('dogru_cevap', 1); } catch (e) { } }
      komboDogru();
      // İlerleme çubuğu ciz() içinde adıma göre ayarlanır (tek yerden yönetilir).
      geri.textContent = '✓ ' + OVGULER[Math.floor(Math.random() * OVGULER.length)];
      geri.className = 'geri-bildirim iyi';
      altBarDurum('iyi');
      butonAyarla('DEVAM ET', 'var(--turkuaz)', 'var(--turkuaz-koyu)', ilerle);
    } else {
      Ses.yanlis(); Ses.tepki(false);
      komboYanlis();
      document.querySelectorAll('.secenek').forEach(b => {
        if (b.textContent === v.dogru) {
          b.classList.add('dogru-btn');
          b.classList.add('sik-animasyon');
          setTimeout(() => b.classList.remove('sik-animasyon'), 320);
          animasyonVer(b, 'kutlama', 700);
        }
      });
      hata++;
      // ANİMASYON: Yanlış seçilen şık yatay sallanır ("hayır" işareti).
      animasyonVer(buton, 'sallan', 500);
      // ANİMASYON: Can azalınca kalp göstergesi sarsılır.
      // Yalnızca gerçekten can gidince oynatılır; bedava ilk hatada sarsılmasın.
      if (hata > 1) animasyonVer(document.querySelector('.canlar'), 'sarsinti', 620);
      if (hata > 1) can--;
      canGuncelle();
      geri.textContent = '✕ Doğru cevap: ' + v.dogru;
      geri.className = 'geri-bildirim hata';
      altBarDurum('hata');
      if (can <= 0) { butonAyarla('DEVAM', 'var(--kirmizi)', 'var(--kirmizi-koyu)', basarisiz); devamButonuGoster(); return; }

      // YANLIŞ SORUYU TEKRAR SORMAK — KURALLI OLARAK:
      // Eskiden her yanlış soru kuyruğa ekleniyordu (kuyruk.push). Bu iki soruna
      // yol açıyordu:
      //   1) Sürekli yanlış yapan kullanıcı dersi HİÇ BİTİREMİYORDU (kuyruk büyüyordu)
      //   2) `yaz` tipi sorularda kilitleniyordu: aynı soru hep geri geliyordu
      // Yeni kural:
      //   • Bir soru EN FAZLA 1 kez tekrar sorulur (sonsuz döngü olmaz)
      //   • `yaz` tipi hiç tekrar sorulmaz (klavye sorusu tekrarı anlamsız)
      //   • Ders uzamasın: kuyruğa eklenecek en fazla 3 soru (kuyrukTavani)
      if (!v._tekrarlandi && v.tip !== 'yaz' && tekrarEklenecek < TEKRAR_TAVANI) {
        v._tekrarlandi = true;
        kuyruk.push(v);
        tekrarEklenecek++;
      }
      butonAyarla('DEVAM ET', 'var(--kirmizi)', 'var(--kirmizi-koyu)', ilerle);
    }
    devamButonuGoster();
  }

  // ---------- YAZMA MODU CEVAP KONTROLÜ ----------
  // Yazarken küçük hatalar affedilir; önemli olan harfi HATIRLAMAK.
  // Kabul edilen biçimler:  'ka', 'KA', ' ka ', 'kaa'(?) değil; 'si' = 'shi' = 'si'
  function yaziyiNormallestir(s) {
    return String(s || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')      // iç boşlukları at
      .replace(/-/g, '')        // 'shi-n' gibi tireleri at
      .replace(/ō/g, 'ou').replace(/ū/g, 'uu')   // uzatma işaretleri
      .replace(/ā/g, 'aa').replace(/ē/g, 'ee');
  }

  // Romaji varyantları: し = shi/si, ち = chi/ti, つ = tsu/tu, ふ = fu/hu, じ = ji/zi, を = wo/o
  const ROMAJI_ES = {
    shi: ['si'], ji: ['zi'], chi: ['ti'], tsu: ['tu'], fu: ['hu'], wo: ['o'],
    sha: ['sya'], shu: ['syu'], sho: ['syo'],
    cha: ['tya', 'cya'], chu: ['tyu', 'cyu'], cho: ['tyo', 'cyo'],
    ja: ['zya', 'jya'], ju: ['zyu', 'jyu'], jo: ['zyo', 'jyo'],
    ja2: [], n: ['nn', 'n\''],
    kya: ['kya'], gya: ['gya']
  };
  function romajiVaryantlari(dogru) {
    const temel = yaziyiNormallestir(dogru);
    const ek = ROMAJI_ES[temel] || [];
    return [temel].concat(ek.map(yaziyiNormallestir));
  }

  function cevaplaYazi(yazilan, v, kutu) {
    if (kilitli) return;
    kilitli = true;
    const ham = yaziyiNormallestir(yazilan);
    const kabul = romajiVaryantlari(v.dogru);
    const dogruMu = kabul.indexOf(ham) !== -1;

    if (v.k) Ilerleme.cevapKaydet(v.k, dogruMu);

    if (dogruMu) {
      Ses.dogru(); Ses.tepki(true);
      tamamlanan++;
      // GÜNLÜK GÖREV: doğru cevap sayacını besle (gorevler.js)
      if (window.Gorevler) { try { Gorevler.olay('dogru_cevap', 1); } catch (e) { } }
      komboDogru();
      // İlerleme çubuğu ciz() içinde adıma göre ayarlanır (tek yerden yönetilir).
      geri.textContent = '✓ ' + OVGULER[Math.floor(Math.random() * OVGULER.length)];
      geri.className = 'geri-bildirim iyi';
      altBarDurum('iyi');
      kutu.classList.add('dogru-btn');
      butonAyarla('DEVAM ET', 'var(--turkuaz)', 'var(--turkuaz-koyu)', ilerle);
    } else {
      Ses.yanlis(); Ses.tepki(false);
      komboYanlis();
      yanlisKaydet(secilen, v);      // hangi harfi hangisiyle karıştırdı
      hata++; can--; canGuncelle();
      geri.textContent = '✕ Doğru cevap: ' + v.dogru;
      geri.className = 'geri-bildirim hata';
      altBarDurum('hata');
      kutu.classList.add('yanlis-btn');
      // Yanlış defteri: yazılan/verilen metni gerçek harfle eşleştirip kaydet
      yanlisKaydet((secilen || yazilan || ''), v);
      // İLK YANLIŞ CAN GÖTÜRMESİN (kısa soru tipiyle aynı kural)
      if (hata > 1) can--;
      canGuncelle();

      // Doğru cevabı ekranda göster (kullanıcı görsün)
      const goster = document.querySelector('.yaz-dogru');
      if (goster) goster.remove();
      const d = el('div', 'yaz-dogru', 'Doğru okunuş: ' + v.buyuk + ' = ' + v.dogru);
      sahne.append(d);
      if (can <= 0) { butonAyarla('DEVAM', 'var(--kirmizi)', 'var(--kirmizi-koyu)', basarisiz); devamButonuGoster(); return; }

      // YAZMA SORUSU TEKRAR SORULMAZ.
      // Eskiden koşulsuz `kuyruk.push(v)` vardı: yanlış yazınca aynı soru dersin
      // sonuna ekleniyor, yine yanlış yazılıyor ve DERS HİÇ BİTMİYORDU.
      // (Canlar da bitmediği için kilitleniyordu.) Yazma becerisi kısa sorularla
      // ayrıca çalışıldığı için burada tekrar gereksiz.
      butonAyarla('DEVAM ET', 'var(--kirmizi)', 'var(--kirmizi-koyu)', ilerle);
    }
    devamButonuGoster();
  }

  // ---------- DİKTE CEVAP KONTROLÜ ----------
  // Dikte zor bir alıştırma: küçük yazım farkları yüzünden "yanlış" saymak
  // öğrenciyi yıldır. Bu yüzden normalleştirme geniş tutulur:
  //   • Büyük/küçük harf farkı yok           (Konnichiwa = konnichiwa)
  //   • Noktalama ve boşluk yok sayılır      ("watashi wa. gakusei desu" = "watashiwagakuseidesu")
  //   • Uzatma işaretleri ve uzun ünlüler eş tutulur (koohii = kōhī = kohii)
  //   • Romaji varyantları                    (shi/si, tsu/tu, chi/ti, fu/hu, ji/zi, wo/o)
  // Yarı yarıya doğruysa (harflerin çoğu tutuyorsa) da kabul: "yaklaşık doğru" sayılır.
  function dikteNormallestir(s) {
    return String(s || '')
      .trim()
      .toLowerCase()
      // Noktalama ve tüm boşluk kaldırılır
      .replace(/[.,!?;:'"\-\u3000\s]+/g, '')
      // Uzatma işaretleri tek ünlüye indirilir:  koohii -> kohi,  kōhī -> kohi
      .replace(/oo/g, 'o').replace(/uu/g, 'u').replace(/aa/g, 'a').replace(/ee/g, 'e').replace(/ii/g, 'i')
      .replace(/ō/g, 'o').replace(/ū/g, 'u').replace(/ā/g, 'a').replace(/ē/g, 'e').replace(/ī/g, 'i')
      // Romaji varyantları
      .replace(/shi/g, 'si').replace(/chi/g, 'ti').replace(/tsu/g, 'tu')
      .replace(/ja/g, 'zya').replace(/ju/g, 'zyu').replace(/jo/g, 'zyo')
      .replace(/fu/g, 'hu').replace(/wo/g, 'o');
  }

  // İki metin arasındaki benzerlik oranı (0-1). Levenshtein tabanlı basit ölçü.
  function benzerlik(a, b) {
    if (a === b) return 1;
    if (!a.length || !b.length) return 0;
    const m = a.length, n = b.length;
    // Tek satırlı Levenshtein (bellek tasarrufu)
    let onceki = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const simdiki = [i];
      for (let j = 1; j <= n; j++) {
        const maliyet = a[i - 1] === b[j - 1] ? 0 : 1;
        simdiki[j] = Math.min(onceki[j] + 1, simdiki[j - 1] + 1, onceki[j - 1] + maliyet);
      }
      onceki = simdiki;
    }
    const mesafe = onceki[n];
    return 1 - (mesafe / Math.max(m, n));
  }

  function cevaplaDikte(yazilan, v, kutu) {
    if (kilitli) return;
    kilitli = true;
    const ham = dikteNormallestir(yazilan);
    const dogruNorm = dikteNormallestir(v.dogru);
    const ayni = ham === dogruNorm;
    // %80 benzerlik "yaklaşık doğru" sayılır (bir harf hatası affedilir)
    const benzer = ayni ? 1 : benzerlik(ham, dogruNorm);
    const dogruMu = ayni || benzer >= 0.8;

    if (v.k) Ilerleme.cevapKaydet(v.k, dogruMu);
    if (v.cumle && v.cumle.ja) Ilerleme.kelimeCevap(v.cumle.ja, dogruMu);
    // Kanjili cümle ise içindeki kanjilerin tekrar takvimini güncelle
    if (v.kanjiliCumle && v.kanjiliCumle.length && window.KANJI && window.KANJI.cevap) {
      v.kanjiliCumle.forEach(k => window.KANJI.cevap({ k: k }, dogruMu));
    }

    if (dogruMu) {
      Ses.dogru(); Ses.tepki(true);
      tamamlanan++;
      // GÜNLÜK GÖREV: doğru cevap sayacını besle (gorevler.js)
      if (window.Gorevler) { try { Gorevler.olay('dogru_cevap', 1); } catch (e) { } }
      komboDogru();
      // İlerleme çubuğu ciz() içinde adıma göre ayarlanır (tek yerden yönetilir).
      // Yaklaşık doğruysa doğru cevabı da gösster (öğrenci tam biçimi görsün)
      if (!ayni) {
        geri.textContent = '✓ Neredeyse! Doğrusu: ' + v.dogru;
      } else {
        geri.textContent = '✓ ' + OVGULER[Math.floor(Math.random() * OVGULER.length)];
      }
      geri.className = 'geri-bildirim iyi';
      altBarDurum('iyi');
      kutu.classList.add('dogru-btn');
      butonAyarla('DEVAM ET', 'var(--turkuaz)', 'var(--turkuaz-koyu)', ilerle);
    } else {
      Ses.yanlis(); Ses.tepki(false);
      hata++;
      if (hata > 1) can--;
      canGuncelle();
      geri.textContent = '✕ Doğrusu: ' + v.dogru;
      geri.className = 'geri-bildirim hata';
      altBarDurum('hata');
      kutu.classList.add('yanlis-btn');
      // Yanlış defteri: yazılan/verilen metni gerçek harfle eşleştirip kaydet
      yanlisKaydet((secilen || yazilan || ''), v);
      const goster = el('div', 'yaz-dogru', v.cumle.ja + '  →  ' + v.dogru + '\n' + v.cumle.tr);
      sahne.append(goster);
      if (can <= 0) { butonAyarla('DEVAM', 'var(--kirmizi)', 'var(--kirmizi-koyu)', basarisiz); devamButonuGoster(); return; }
      butonAyarla('DEVAM ET', 'var(--kirmizi)', 'var(--kirmizi-koyu)', ilerle);
    }
    devamButonuGoster();
  }

  function ilerle() { adim++; ciz(); }

  function basarisiz() {
    btn.style.display = 'none'; geri.textContent = '';
    sahne.innerHTML = '';
    sahne.append(chibiResmi('images/hata.webp', '💔'), el('div', 'mesaj', 'Canların bitti'),
      el('div', 'ip', 'Sorun değil, tekrar denersen yanlış yaptıkların aklında kalır.'));
    const t = el('button', 'ikincil', 'Tekrar dene'); t.onclick = () => location.reload();
    const h = el('button', 'ikincil', 'Haritaya dön'); h.onclick = () => window.location.href = 'dojo.html';
    const geriSoyle = el('a', 'ikincil geri-soyle', '💬 Bir sorun mu var? Sensei\'ye söyle');
    geriSoyle.href = 'dojo.html#geri';
    sahne.append(t, h, geriSoyle);
    setTimeout(() => Ses.sensei('can-bitti'), 500);
  }

  // ---------- KONFETİ (ders bitiş kutlaması) ----------
  // Ekranın üstünden renkli parçacıklar düşer. Canvas kullanılmaz:
  // basit DOM elemanları + CSS animasyonu (daha hafif, daha az kod).
  // Erişilebilirlik: hareket azaltma tercihine saygı duyulur.
  function konfeti(adet) {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const renkler = ['#7b5cf0', '#18c2a6', '#ffb703', '#ff5c72', '#3a86ff', '#ff8c42'];
      const kap = document.createElement('div');
      kap.className = 'konfeti-kap';
      kap.setAttribute('aria-hidden', 'true');
      document.body.append(kap);

      for (let i = 0; i < (adet || 30); i++) {
        const p = document.createElement('span');
        p.className = 'konfeti';
        p.style.left = (Math.random() * 100) + '%';
        p.style.background = renkler[Math.floor(Math.random() * renkler.length)];
        // Farklı boyut, gecikme ve süre: doğal görünüm
        const boy = 6 + Math.random() * 8;
        p.style.width = boy + 'px';
        p.style.height = (boy * 0.6) + 'px';
        p.style.animationDelay = (Math.random() * 0.5) + 's';
        p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
        // Bazı parçacıklar dönsün
        if (Math.random() > 0.5) p.style.borderRadius = '50%';
        kap.append(p);
      }

      // Animasyon bitince temizle (DOM şişmesin)
      setTimeout(() => kap.remove(), 3600);
    } catch (e) { /* konfeti olmasa da ders biter */ }
  }

  // Bu ders bir sınav mı? (boss tipi) Zorluk ayarı sınavları etkilemez.
  function sinavMi() {
    const it = MUFREDAT.find(m => m.id === dersID);
    return !!(it && it.tip === 'boss');
  }

  // ---------- DERSİ BİTİR ----------
  // XP / YILDIZ / SERİ / SONUÇ EKRANI burada. Puan kuralını değiştirmek için burayı düzenle.
  function bitir() {
    bar.style.width = '100%';
    const item = MUFREDAT.find(m => m.id === dersID);
    const svy = Ilerleme.seviye();
    const ilkKez = !tekrarModu && svy === dersID;

    // Analitik: ders tamamlandı (bırakma olayı artık tetiklenmesin)
    if (window.Analitik) {
      window.Analitik.dersBitti();
      window.Analitik.olay('ders_bitti', { ders: dersID, tip: item ? item.tip : '?', hata: hata });
    }

    let xpKazan = tekrarModu ? (ders.xp || 20) : ilkKez ? (ders.xp || 50) : 10;   // eski dersi tekrar: 10 XP
    const bonus = hata === 0 ? 10 : 0;                                          // hatasız bonus
    // ZORLUK BONUSU (ayarlar.js): Zorlu seçeneyi %25 fazla XP alır.
    // Gerekçe: daha az can + daha uzun ders = daha riskli → ödülü de yüksek olmalı.
    // Sınavlarda uygulanmaz (sınavın kendi XP'si mufredat.js'te sabit).
    const zorlukEk = (window.Ayarlar && Ayarlar.zorluk && !sinavMi()) ? Ayarlar.zorluk().ekXp : 0;
    // KOMBO BONUSU (kombo.js): ders boyunca üst üste doğru cevaplardan birikti.
    // Sadece YENİ derslerde (tekrar modunda değil) ve sınav dışında uygulanır;
    // yoksa tekrar dersleri sonsuz XP çiftliğine dönüşürdü.
    const komboOzet = (window.Kombo && !tekrarModu && !sinavMi())
      ? Kombo.ozet()
      : { bonus: 0, enYuksek: 0, carpan: 1, dogru: 0 };
    const komboBonus = komboOzet.bonus || 0;

    // TOPLAM: taban XP + zorluk çarpanı + kombo bonusu + görev ödülü
    // Kombo bonusu ÇARPANA DAHİL EDİLMEZ; ayrı eklenir. Böylece XP dökümü
    // kullanıcıya açıkça gösterilebilir ("kombo +45 XP" gibi).
    const xpToplam = Math.round((xpKazan + bonus) * (1 + zorlukEk)) + komboBonus;

    const oncekiGunluk = Ilerleme.gunlukXp();
    Ilerleme.xpEkle(xpToplam);
    const hedefTamam = oncekiGunluk < Ilerleme.HEDEF_XP && Ilerleme.gunlukXp() >= Ilerleme.HEDEF_XP;

    // ---------- HATASIZ DERS SAYACI ----------
    // Hatasız biten ders sayısı başarımlar için tutulur (basarimlar.js okur).
    if (hata === 0) {
      try {
        const n = parseInt(localStorage.getItem('sakar_hatasiz') || '0', 10) || 0;
        localStorage.setItem('sakar_hatasiz', String(n + 1));
      } catch (e) { }
    }

    // ---------- SINAV GEÇİLDİ (başarımlar için) ----------
    // Sınav başarıyla bitirildiyse adını kaydet (basarimlar.js okur).
    if (item && item.tip === 'boss') {
      try {
        const liste = JSON.parse(localStorage.getItem('sakar_sinavlar') || '[]');
        const anahtar = String(item.baslik || dersID).toLowerCase();
        const ad = anahtar.indexOf('hiragana') > -1 ? 'hiragana'
          : anahtar.indexOf('katakana') > -1 ? 'katakana'
            : anahtar.indexOf('kanji') > -1 ? 'kanji' : String(dersID);
        if (liste.indexOf(ad) === -1) {
          liste.push(ad);
          localStorage.setItem('sakar_sinavlar', JSON.stringify(liste));
        }
      } catch (e) { }
    }

    // ---------- GÜNLÜK GÖREVLER ----------
    // Ders bitti olayını bildir. Tekrar dersiyse ayrıca 'tekrar_ders'.
    // Tamamlanan görevlerin XP ödülü BURADA eklenir (tek yerden).
    let gorevOdul = 0;
    if (window.Gorevler) {
      try {
        let tamamlanan = [];
        tamamlanan = tamamlanan.concat(Gorevler.olay('ders_bitti', 1) || []);
        if (tekrarModu) tamamlanan = tamamlanan.concat(Gorevler.olay('tekrar_ders', 1) || []);
        if (hata === 0) tamamlanan = tamamlanan.concat(Gorevler.olay('hatasiz_ders', 1) || []);
        tamamlanan = tamamlanan.concat(Gorevler.olay('xp', xpToplam) || []);
        // Ödül DOĞRUDAN dönen diziden hesaplanır. sonOdul() kullanmıyoruz:
        // araya başka bir olay çağrısı girerse o değer sıfırlanabiliyordu.
        gorevOdul = Gorevler.odulHesapla ? Gorevler.odulHesapla(tamamlanan) : 0;
        if (gorevOdul > 0) Ilerleme.xpEkle(gorevOdul);
      } catch (e) { }
    }

    if (ilkKez) {
      // "Hiragana ve Katakana biliyorum" diyenler Hiragana sınavından sonra Katakana sınavına atlar
      const atla = (item && item.ikisiAtla && Ilerleme.bilgi() === 'ikisi') ? item.ikisiAtla : dersID + 1;
      Ilerleme.seviyeYaz(atla);
    }
    const yildiz = hata === 0 ? 3 : hata <= 2 ? 2 : 1;
    // SINAV MODU: yıldız KAYDEDİLMEZ ("sinav" müfredatta bir daire değil).
    // Aksi hâlde sakar_yildiz['sinav'] gibi anlamsız bir kayıt oluşurdu.
    if (!tekrarModu && !sinavModu) Ilerleme.yildizYaz(dersID, yildiz);
    // Korumalı seri işleme: bir gün atlandıysa ve koruma hakkı varsa seri kırılmaz.
    const seriSonuc = Ilerleme.seriIsleKorumali();
    const seri = seriSonuc.sayi;

    sahne.innerHTML = '';

    // KONFETİ: ders bitişi kutlama anıdır. Kusursuz bitirdiyse daha çok.
    konfeti(hata === 0 ? 46 : 26);

    // ---------- "NE ÖĞRENDİM" ÖZETİ ----------
    // Ders bitişinde o derste geçen HARFLERİ listelemek, öğrenmenin en
    // kritik parçasıdır: kullanıcı "bugün ne öğrendim" sorusunun cevabını
    // görür. Aksi hâlde ders "geçti gitti" hissi verir ve kalıcı olmaz.
    // app.js ders boyunca görülen id'leri toplar (bkz. gorulenIdEkle).
    const ogrenilenler = ogrenilenOzet();
    if (ogrenilenler.length) {
      const kutu = el('div', 'ogrenilen-kutu son-gir');
      kutu.style.animationDelay = '0.42s';
      kutu.append(el('div', 'ok-baslik', '📚 Bu derste geçen harfler'));
      const chipKap = el('div', 'ogrenilen-chip');
      ogrenilenler.slice(0, 12).forEach(id => {
        const k = KANA[id];
        if (!k) return;
        const c = el('span', 'og-chip');
        c.append(
          el('b', '', k.j),
          el('small', '', k.r)
        );
        // Zayıf olanlar işaretlenir: kullanıcı neye odaklanacağını bilir
        if (zorlanilanlar.indexOf(id) !== -1) c.classList.add('zor');
        c.title = k.j + ' = ' + k.r + (zorlanilanlar.indexOf(id) !== -1 ? ' (bu derste zorlandın)' : '');
        chipKap.append(c);
      });
      kutu.append(chipKap);
      if (zorlanilanlar.length) {
        kutu.append(el('div', 'ok-not',
          '🔁 Kırmızı harfler bu derste yanlış yaptıkların — tekrar dersinde öne çıkar.'));
      }
      sahne.append(kutu);
    }

    const rozetler = el('div', 'ozet');
    // Kazanılan XP rozeti: zorluk bonusu ve görev ödülü DAHİL gerçek toplam.
    rozetler.append(el('div', 'rozet xp', '+' + (xpToplam + gorevOdul) + ' XP'));
    // Görev ödülü ayrıca belirtilsin (kullanıcı neden fazla XP aldığını bilsin)
    if (gorevOdul > 0) rozetler.append(el('div', 'rozet hedef', '🎯 Görev +' + gorevOdul + ' XP'));
    // KOMBO rozetiatı: seri ve çarpanı göster (yeni derslerde)
    if (komboBonus > 0) {
      rozetler.append(el('div', 'rozet kombo',
        '⚡ Kombo x' + String(komboOzet.carpan).replace('.0', '') + ' (+' + komboBonus + ' XP)'));
    }
    if (komboOzet.enYuksek >= 5) {
      rozetler.append(el('div', 'rozet', '🔥 ' + komboOzet.enYuksek + ' doğru üst üste'));
    }
    rozetler.append(el('div', 'rozet xp', '+' + xpToplam + ' XP'));
    if (zorlukEk > 0) rozetler.append(el('div', 'rozet', '🎯 ' + Ayarlar.zorlukAdi()));
    if (!tekrarModu) rozetler.append(el('div', 'rozet', '⭐'.repeat(yildiz) + '☆'.repeat(3 - yildiz)));
    rozetler.append(el('div', 'rozet seri', '🔥 ' + seri + ' günlük seri'));
    // Günlük hedef ilerlemesi rozet olarak gösterilir (motivasyon)
    const gunlukSimdi = Ilerleme.gunlukXp();
    rozetler.append(el('div', 'rozet hedef', '🎯 ' + Math.min(gunlukSimdi, Ilerleme.HEDEF_XP) + '/' + Ilerleme.HEDEF_XP + ' XP'));

    // Kademeli giriş animasyonu: her parça sırayla belir (kutlama hissi)
    const parcalar = [
      chibiResmi('images/basari.webp', '🏆'),
      el('div', 'mesaj', tekrarModu ? 'Tekrar tamam!' : 'Ders tamamlandı!'),
      rozetler
    ];
    parcalar.forEach((p, i) => {
      p.classList.add('son-gir');
      p.style.animationDelay = (i * 0.12) + 's';
      sahne.append(p);
    });

    const notlar = [];
    if (hata === 0) notlar.push('Hiç hata yapmadın, +10 XP bonus!');
    else notlar.push(hata + ' hata yaptın, hepsini tekrar edip düzelttin.');
    if (hedefTamam) notlar.push('🎯 Günlük hedefi tamamladın!');
    // Seri koruma kullanıldıysa kullanıcı bunu bilsin (sessiz kurtarma kafa karıştır)
    if (seriSonuc.korumaKullanildi) notlar.push('🛡️ Bir gün ara vermiştin, seri koruman devreye girdi — serin devam ediyor!');
    if (seriSonuc.sayi > 0 && seriSonuc.sayi % 7 === 0 && seriSonuc.kalan > 0) {
      notlar.push('🛡️ ' + seriSonuc.sayi + ' günlük seri! 1 seri koruma kazandın (toplam ' + seriSonuc.kalan + ').');
    }
    const not = el('div', 'ip son-gir', notlar.join('\n'));
    not.style.animationDelay = '0.4s';
    sahne.append(not);

    // SONRAKİ DERS önerisi: kullanıcı ne yapacağını bilmek ister
    const sonraki = MUFREDAT.find(m => m.id === Ilerleme.seviye());
    if (sonraki && !tekrarModu) {
      const oneri = el('div', 'sonraki-oneri son-gir');
      oneri.style.animationDelay = '0.5s';
      oneri.append(
        el('div', 'so-etiket', 'Sıradaki ders'),
        el('div', 'so-ad', '→ ' + sonraki.baslik)
      );
      sahne.append(oneri);
    }
    // Ders bitişinde destek bağlantısı (duygusal zirve: kullanıcı emek verdi)
    const destek = el('a', 'bitis-destek', "☕ Sensei'ye bir çay ısmarla");
    destek.href = 'https://kreosus.com/sakarpaisen';
    destek.target = '_blank';
    destek.rel = 'noopener';
    sahne.append(destek);

    // ---------- GÜNLÜK GÖREV ÖZETİ ----------
    // Ders bitince görevlerin durumu gösterilir ("2/3 tamam" gibi).
    // Kullanıcı bir adım daha atmak için sebep görür.
    if (window.Gorevler) {
      try {
        const giz = Gorevler.ozet();
        const kutu = el('div', 'sonraki-oneri son-gir');
        kutu.style.animationDelay = '0.55s';
        kutu.append(
          el('div', 'so-etiket', giz.hepsiTamam ? 'Tüm görevler bitti!' : 'Günlük görevler'),
          el('div', 'so-ad', giz.hepsiTamam ? '🌟 Yarın yenileri gelir' : giz.tamam + ' / ' + giz.toplam + ' tamam')
        );
        sahne.append(kutu);
      } catch (e) { }
    }

    // ---------- BAŞARIM KONTROLÜ ----------
    // Yeni başarım açıldıysa kutlama bandı çıkar (basarimlar.js).
    // DİKKAT: başarım kontrolü TÜM kayıtlar güncellendikten SONRA yapılmalı,
    // yoksa "seviye > 1" gibi testler eski değere bakıp yanlış sonuç verir.
    if (window.Basarimlar) {
      try {
        const yeni = Basarimlar.kontrol();
        if (yeni.length) Basarimlar.kutlamaGoster(yeni, document.body);
      } catch (e) { }
    }

    // REKLAM: SADECE ders bitiş ekranında, en altta. Ders SIRASINDA reklam yok —
    // kullanıcı "DEVAM ET"e tıklamak isterken reklama basmasın (AdSense kuralı:
    // yanıltıcı yerleşim hesabı askıya aldır). reklam.js ayarı boşken gizli kalır.
    if (window.Reklam) {
      const reklamKutu = el('div', 'reklam-alani');
      reklamKutu.setAttribute('data-reklam', '1');
      reklamKutu.hidden = true;
      sahne.append(reklamKutu);
      window.Reklam.kur();   // kutu sayfaya girdikten sonra doldur
    }

    Ses.dogru();
    setTimeout(() => Ses.sensei(hedefTamam ? 'hedef-tamam' : tekrarModu ? 'tekrar-bitti' : 'ders-bitti'), 600);
    butonAyarla('HARİTAYA DÖN', 'var(--altin)', '#cda344', () => window.location.href = 'dojo.html');
  }

  // ============ KLAVYE ============
  // 1-9: şık seç, Enter: devam. Yeni kısayol istersen buraya ekle.
  // ============ KLAVYE ============
  // 1-9  : şık seç (numara rozetleriyle görünür)
  // Enter: devam / kontrol et
  // r    : sesi tekrar çal (dinleme ve dikte sorularında)
  // Esc  : haritaya dön (kullanıcı dersi bırakmak isterse)
  // Tab  : tarayıcının kendi gezinmesi (şık butonları odaklanabilir)
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // Yazma sorusunda kullanıcı klavyeyle YAZIYOR: kısayollar devreye girmesin.
    // (Aksi hâlde '1' yazınca şık seçmeye çalışır, cevap yazılamaz.)
    const etkin = document.activeElement;
    const yaziyorMu = etkin && (etkin.tagName === 'INPUT' || etkin.tagName === 'TEXTAREA');

    // ERİŞİLEBİLİRLİK: Esc her durumda haritaya döner (panik çıkışı)
    if (e.key === 'Escape') { window.location.href = 'dojo.html'; return; }

    if (yaziyorMu) return;

    // 'r' ile sesi tekrar çal (dinleme/dikte sorularında çok işe yar)
    if (e.key === 'r' || e.key === 'R') {
      const sesBtn = document.querySelector('.ses-buyuk, .ses-btn, .kd-ses');
      if (sesBtn) { e.preventDefault(); sesBtn.click(); }
      return;
    }

    if (e.key === 'Enter') {
      if (btn.style.display === 'block' && etkin !== btn) { e.preventDefault(); btn.click(); }
      return;
    }
    if (/^[1-9]$/.test(e.key)) {
      const secenek = document.querySelectorAll('.secenek')[parseInt(e.key) - 1];
      if (secenek) secenek.click();
    }
  });

  // ============ DERSİ SEÇ ============
  // Soruların nereden geleceğine karar verilir:
  //   - tekrar modu   -> kana.js: kanaTekrarUret (aralıklı tekrar)
  //   - tip 'pekistir' -> kana.js: kanaPekistirUret (zayıf harfler)
  //   - tip 'reading'  -> reading.js: READING.dersUret (kelime/cümle okuma)
  //   - harfler/kapsam -> kana.js: dersUret (otomatik harf sorusu)
  //   - değilse        -> questions.js veya dersler/dersNN.js dosyası yüklenir
  (function () {
    // SINAV MODU: rastgele karışık sınav (sinav.js).
    // Müfredattaki sınavlardan farkı: sorular SABİT DEĞİL, her seferinde
    // yeniden üretilir ve yanlış yapılan harfler ağırlıklı sorulur.
    if (dersID === 'sinav') {
      const d = (window.Sinav && Sinav.uret) ? Sinav.uret() : null;
      if (!d) return hazirDegil('Sınav için harf yok', 'Önce birkaç harf dersi yap, sonra sınava gir.');
      DERSLER[dersID] = d;
      return basla();
    }

    // Kelime defterinden gelen tekrar dersi: sorular sessionStorage'da hazır durur
    if (kelimeTekrarModu) {
      let ders = null;
      try {
        const ham = sessionStorage.getItem('sakar_tekrar_ders');
        if (ham) ders = JSON.parse(ham);
      } catch (e) { }
      // Görev tamamlandı: bir daha gösterilmesin
      try { sessionStorage.removeItem('sakar_tekrar_ders'); } catch (e) { }
      if (!ders || !ders.adimlar || !ders.adimlar.length) {
        return hazirDegil('Tekrar edilecek kelime bulunamadı', 'Kelime defterine dönüp tekrar dersini yeniden başlat.');
      }
      DERSLER[0] = ders;
      return basla();
    }

    if (tekrarModu) {
      DERSLER[0] = kanaTekrarUret(10);
      if (!DERSLER[0]) return hazirDegil('Şimdilik tekrar edilecek harf yok', 'Yeni dersler yaptıkça tekrar zamanı gelen harfler burada birikir.');
      return basla();
    }
    const item = MUFREDAT.find(m => m.id === dersID);
    if (!item || item.tip === 'yakinda') return hazirDegil();

    // Pekiştirme (zayıf harfler)
    if (item.tip === 'pekistir') {
      const d = kanaPekistirUret(item);
      if (!d) return hazirDegil('Pekiştirilecek harf yok', 'Önce birkaç harf dersi yap, sonra buraya dön.');
      DERSLER[dersID] = d;
      return basla();
    }

    // Okuma pratiği (kelime / cümle) - reading.js'ten üretilir
    if (item.tip === 'reading') {
      const d = (window.READING && window.READING.dersUret) ? window.READING.dersUret(item) : null;
      if (!d) return hazirDegil('Okuma içeriği bulunamadı', 'reading.js yüklenmemiş ya da bu bölüm için veri yok.');
      DERSLER[dersID] = d;
      return basla();
    }

    // Kanji dersi - kanji.js'ten üretilir (Bölüm 9). reading.js ile aynı sözleşme.
    //   tip:'kanji'   -> yeni kanji öğretir (öğret + anlam + okunuş + ters yön)
    //   tip:'karisik' -> cümle ağırlıklı ders; öğrenilmiş kanjiler AĞIRLIKLI
    //                    RASTGELE serpişir (her adımda değil).
    if (item.tip === 'kanji' || item.tip === 'karisik') {
      const d = (window.KANJI && window.KANJI.dersUret) ? window.KANJI.dersUret(item) : null;
      if (!d) {
        return hazirDegil(
          item.tip === 'karisik' ? 'Karışık ders için kanji yok' : 'Kanji verisi bulunamadı',
          item.tip === 'karisik'
            ? 'Bu ders, öğrendiğin kanjileri karıştır. Önce bir kanji dersi yap.'
            : 'kanji.js yüklenmemiş ya da bu grup için kanji yok.'
        );
      }
      DERSLER[dersID] = d;
      return basla();
    }

    // Otomatik harf sorusu (harfler/kapsam varsa)
    if (item.harfler || item.kapsam) {
      DERSLER[dersID] = dersUret(item);
      return basla();
    }
    // Elle yazılan ders: NN = ders id'si (iki haneli).
    // Dosyalar `dersler/` klasöründe tutulur: dersler/dersNN.js (ör. dersler/ders33.js).
    const sc = document.createElement('script');
    sc.src = 'dersler/ders' + String(dersID).padStart(2, '0') + '.js';
    sc.onload = () => (DERSLER[dersID] ? basla() : hazirDegil());
    sc.onerror = () => hazirDegil();
    document.head.appendChild(sc);
  })();

})();
