// ============================================================
// SES: sensei'nin gerçek sesi (Gemini TTS kayıtları) + dosyasız yedekler.
//
// Her ses için sırayla denenir:
//   1) audio/<grup>/index.json içinde dosya varsa onu çalar (üretilmiş gerçek ses)
//   2) yoksa tarayıcının Japonca konuşmasına düşer (harf/cümle okuma)
//   3) o da yoksa sessiz kalır; doğru/yanlış için kısa bip çalar
//
// Ses kayıtları HİÇ olmasa bile her şey çalışır. Üretmek için:
//   python ses-uret/uret.py          (ayrıntı: NOTLAR.md)
// ============================================================
const Ses = (function () {
  let ctx = null;
  let acik = true;
  try { acik = localStorage.getItem('sakar_ses') !== '0'; } catch (e) { }

  // ---------- Dosyasız efekt sesleri (Web Audio) ----------
  function bip(freq, tip, sure) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = tip; o.frequency.value = freq;
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + sure);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + sure);
    } catch (e) { }
  }

  // ---------- Kayıtlı ses dosyaları ----------
  // audio/kana/index.json -> ["a","ka",...]  (uret.py --indeks bunları yazar)
  const MEVCUT = { kana: {}, sensei: {} };
  let indeksHazir = false;

  // ÖNEMLİ: Ses kayıtları henüz üretilmemişse audio/ klasörü YOKTUR.
  // Var olmayan bir dosyayı istemek tarayıcı konsoluna 404 hatası yazar ve
  // bu "site bozuk" gibi görünür. Bunu tamamen önlemek için:
  //   - Ses dosyaları ÜRETİLDİĞİNDE aşağıdaki SES_KAYDI_VAR değerini true yap.
  //   - O ana kadar hiçbir istek yapılmaz, tarayıcı sesi kullanılır.
  //
  // (ses-uret/uret.py çalıştırdıktan sonra burayı true yapmayı unutma.)
  const SES_KAYDI_VAR = false;

  function indeksYukle() {
    if (indeksHazir) return;
    indeksHazir = true;
    if (!SES_KAYDI_VAR) return;   // kayıt yok: hiç istek yapma, 404 çıkmasın
    ['kana', 'sensei'].forEach(grup => {
      fetch('audio/' + grup + '/index.json')
        .then(r => (r.ok ? r.json() : null))
        .then(liste => {
          if (!Array.isArray(liste)) return;
          liste.forEach(ad => { MEVCUT[grup][ad] = true; });
        })
        .catch(() => { /* index bozuk: tarayıcı sesine düşer */ });
    });
  }

  let aktif = null;   // çalan Audio (üst üste binmesin)
  function dosyaCal(grup, ad) {
    if (!acik || !ad || !MEVCUT[grup][ad]) return false;
    try {
      if (aktif) { aktif.pause(); aktif = null; }
      const a = new Audio('audio/' + grup + '/' + ad + '.wav');
      a.volume = 0.9;
      aktif = a;
      const p = a.play();
      if (p && p.catch) p.catch(() => { /* tarayıcı izni yoksa sessiz geç */ });
      return true;
    } catch (e) { return false; }
  }

  // ---------- Tarayıcının Japonca sesi (yedek) ----------
  function hiraganaYap(t) { return String(t).replace(/[\u30A1-\u30F6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)); }
  function japonSes() {
    if (!('speechSynthesis' in window)) return null;
    return speechSynthesis.getVoices().find(v => v.lang.replace('_', '-').toLowerCase().startsWith('ja')) || null;
  }
  // Harf okuma: sesi uzatma denemesi geri alındı (gırtlaktan çıkıyordu).
  // Asıl çözüm: her harf için GERÇEK KAYIT (audio/kana/<romaji>.wav).
  // Kayıtlar eklenince dosyaCal() onları çalar; kayıt yoksa tarayıcı sesi kullanılır.
  function konus(txt) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(hiraganaYap(txt));
    u.lang = 'ja-JP';
    u.rate = 0.85;
    const v = japonSes(); if (v) u.voice = v;
    speechSynthesis.speak(u);
  }

  function hazirla() { indeksYukle(); }

  // Harf/cümle okuma. kanaAdi ('ka' gibi) verilirse önce üretilmiş dosya denenir.
  function oku(txt, zorla, kanaAdi) {
    if (!zorla && !acik) return;
    if (kanaAdi && dosyaCal('kana', kanaAdi)) return;
    konus(txt);
  }

  // Sensei'nin Türkçe repliği (ders bitti, can bitti, hedef tamam, övgü...).
  // Kayıt yoksa kısa bir bildirim bibi çalınır (sessiz kalmaktan iyi).
  // Bir melodi çalar: [frekans, gecikmeMs, sureSn].
  // Dosya sesi (audio/sensei) yokken ders bitiş/başarı anlarını
  // daha "ödüllendirici" yapar; tek kısa bip yerine küçük bir arpej.
  function melodi(notalar) {
    notalar.forEach(([f, gecikme, sure], i) => {
      setTimeout(() => {
        bip(f, i === notalar.length - 1 ? 'sine' : 'triangle', sure);
      }, gecikme);
    });
  }

  function sensei(ad) {
    if (dosyaCal('sensei', ad)) return;
    // Kayıt yoksa: duruma uygun kısa melodi (sessiz kalmaktan çok daha iyi)
    if (ad === 'can-bitti') {
      // Düşen ton: "üzülme, tekrar dene" hissi
      melodi([[392, 0, 0.3], [330, 240, 0.3], [262, 500, 0.45]]);
    } else if (ad === 'ders-bitti') {
      // Yükselen arpej: kutlama
      melodi([[523, 0, 0.16], [659, 140, 0.16], [784, 280, 0.16], [1047, 440, 0.4]]);
    } else if (ad === 'hedef-tamam') {
      // Günlük hedef: daha parlak, uzun kutlama
      melodi([[523, 0, 0.14], [659, 110, 0.14], [784, 220, 0.14], [1047, 330, 0.3], [1319, 560, 0.5]]);
    } else if (ad === 'tekrar-bitti') {
      melodi([[587, 0, 0.18], [784, 200, 0.35]]);
    }
  }

  // Ders içi doğru/yanlış tepkisi (övgü metni ekranda zaten yazılı)
  const OVGULER = ['dogru-1', 'dogru-2', 'dogru-3', 'dogru-4'];
  const YANLISLAR = ['yanlis-1', 'yanlis-2'];
  function tepki(dogruMu, olasilik) {
    const o = (olasilik === undefined) ? 1 : olasilik;
    if (Math.random() > o) return;
    sensei(dogruMu ? OVGULER[Math.floor(Math.random() * OVGULER.length)]
                   : YANLISLAR[Math.floor(Math.random() * YANLISLAR.length)]);
  }

  function sesVarMi() { return !!japonSes() || SES_KAYDI_VAR; }

  // Dışarıdan sorulabilsin: kayıtlar açık mı?
  function kayitAcikMi() { return SES_KAYDI_VAR; }

  function butonYaz(b) { b.textContent = acik ? '🔊' : '🔇'; b.title = acik ? 'Sesi kapat' : 'Sesi aç'; }
  function buton() {                 // her sayfa bunu üst çubuğa ekler
    const b = document.createElement('button');
    b.className = 'ses-anahtar'; b.setAttribute('aria-label', 'Ses aç/kapat');
    b.style.cssText = 'background:none;border:none;font-size:22px;cursor:pointer;color:inherit;padding:4px 6px;';
    butonYaz(b);
    b.onclick = () => {
      acik = !acik;
      try { localStorage.setItem('sakar_ses', acik ? '1' : '0'); } catch (e) { }
      butonYaz(b);
      if (acik) { bip(800, 'sine', 0.2); }
      else if (aktif) { aktif.pause(); aktif = null; }
    };
    return b;
  }

  return {
    hazirla: hazirla, oku: oku, sensei: sensei, tepki: tepki, sesVarMi: sesVarMi, buton: buton,
    dogru: () => bip(800, 'sine', 0.35), yanlis: () => bip(150, 'triangle', 0.3),
    hosgeldin: () => sensei('dogru-1'),
    acikMi: () => acik
  };
})();

// Test ve hata ayıklama için: konsoldan Ses.sensei('ders-bitti') gibi çağırabilmek adına
// window'a da bağlıyoruz. Uygulama kodu const Ses'i kullanmaya devam eder.
window.Ses = Ses;
