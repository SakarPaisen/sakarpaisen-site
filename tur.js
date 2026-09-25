// ============================================================
// TUR (tur.js) : ilk açılışta gösterilen 4 adımlık tanıtım
// ============================================================
// Dojo ilk kez açıldığında 4 kısa kart gösterilir: can, XP/hedef, harf tekrarı, ipucu.
// Bir kez gösterilir ve "sakar_tur" olarak saklanır; sağ üstteki menüden tekrar açılabilir.
//
// Kullanmak için (dojo.html):
//   Tur.gerekli()      -> ilk kez mi? (true/false)
//   Tur.baslat()       -> turu göster
//   Tur.ac()           -> kullanıcı istediğinde tekrar göster
// ============================================================
const Tur = (function () {
  const ANAHTAR = 'sakar_tur';
  const KARTLAR = [
    {
      simge: '❤️',
      baslik: 'Canlar',
      metin: 'Her ders canla başlar; yanlış cevap bir can götür.\n' +
        'Can sayısını Ayarlar → Zorluk bölümünden değiştirebilirsin (Kolay 6, Normal 4, Zorlu 3).\n' +
        'Canlar biterse üzülme: yanlışların dersin sonunda tekrar sorulur.'
    },
    {
      simge: '⭐',
      baslik: 'XP ve günlük hedef',
      metin: 'Her ders XP kazandır, hatasız bitirsen +10 bonus.\nGünlük 50 XP hedefini tutarsan serin büyür 🔥'
    },
    {
      simge: '🔁',
      baslik: 'Harfler unutulmaz',
      metin: 'Yanlış bildiğin harf tekrar listesine girer ve 1-3-7-14-30 gün\narayla karşına çıkar. Pekiştirme dersleri zayıf harflere odaklanır.'
    },
    {
      simge: '💡',
      baslik: 'Küçük ipuçları',
      metin: 'Zor harfler için ayırt etme ipucu gösterilir.\nDers sırasında 1-4 tuşları şık seçer, Enter devam eder.'
    }
  ];

  function gerekli() {
    try { return localStorage.getItem(ANAHTAR) !== '1'; } catch (e) { return false; }
  }
  function isaretle() {
    try { localStorage.setItem(ANAHTAR, '1'); } catch (e) { }
  }

  let katman = null;

  function kapat() {
    if (katman) { katman.remove(); katman = null; }
    document.removeEventListener('keydown', tusKacis);
  }
  function tusKacis(e) { if (e.key === 'Escape') kapat(); }

  function baslat() {
    if (katman) return;
    let adim = 0;

    katman = document.createElement('div');
    katman.className = 'tur-katman';

    const kutu = document.createElement('div');
    kutu.className = 'tur-kutu';

    // Üst: simge + adım sayacı
    const ust = document.createElement('div');
    ust.className = 'tur-ust';
    const simge = document.createElement('div');
    simge.className = 'tur-simge';
    const sayac = document.createElement('div');
    sayac.className = 'tur-sayac';
    ust.append(simge, sayac);

    const baslik = document.createElement('div');
    baslik.className = 'tur-baslik';
    const metin = document.createElement('div');
    metin.className = 'tur-metin';

    // Noktalar
    const noktalar = document.createElement('div');
    noktalar.className = 'tur-noktalar';

    // Alt: geri / ileri
    const alt = document.createElement('div');
    alt.className = 'tur-alt';
    const geri = document.createElement('button');
    geri.className = 'tur-btn ikincil';
    geri.textContent = 'GERİ';
    const ileri = document.createElement('button');
    ileri.className = 'tur-btn';
    const atla = document.createElement('button');
    atla.className = 'tur-atla';
    atla.textContent = 'Tanıtımı atla';

    alt.append(geri, ileri);

    kutu.append(ust, baslik, metin, noktalar, alt, atla);
    katman.append(kutu);
    document.body.append(katman);
    document.addEventListener('keydown', tusKacis);

    function ciz() {
      const k = KARTLAR[adim];
      simge.textContent = k.simge;
      sayac.textContent = (adim + 1) + ' / ' + KARTLAR.length;
      baslik.textContent = k.baslik;
      metin.textContent = k.metin;
      geri.style.visibility = adim === 0 ? 'hidden' : 'visible';
      ileri.textContent = adim === KARTLAR.length - 1 ? 'ANLADIM, BAŞLA' : 'İLERİ';
      noktalar.replaceChildren(...KARTLAR.map((_, i) => {
        const n = document.createElement('span');
        n.className = 'tur-nokta' + (i === adim ? ' aktif' : '');
        return n;
      }));
    }

    geri.onclick = () => { if (adim > 0) { adim--; ciz(); } };
    ileri.onclick = () => { if (adim < KARTLAR.length - 1) { adim++; ciz(); } else bitir(); };
    atla.onclick = bitir;
    katman.onclick = e => { if (e.target === katman) bitir(); };

    function bitir() { isaretle(); kapat(); }

    ciz();
  }

  function ac() { baslat(); }

  return { gerekli: gerekli, baslat: baslat, ac: ac, kapat: kapat, isaretle: isaretle };
})();
