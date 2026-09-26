// ============================================================
// DOJO YOLU: ogrenme haritasini Duolingo tarzinda cizer.
//  - Dersler zikzak bir yolda ilerler, her bolum kendi renginde
//  - Aktif ders buyuk ve nabiz atar, tamamlananlar yesil tikin + yildiz
//  - Her daireye basinca kucuk bir onizleme paneli acilir (Duolingo "start" balonu)
//  Bu dosya sadece cizer; ilerleme/kilit karari cagiran tarafta verilir.
// ============================================================
(function () {
  'use strict';

  // Bolum renkleri sirayla uygulanir (Duolingo'daki unite renkleri gibi)
  // Kanji ve Final bölümleri eklenince bölüm sayısı 10'u geçti; palet genişletildi.
  // Renkler sırayla uygulanır, benzer tonlar yan yana gelmesin diye serpiştirildi.
  const RENKLER = ['#7b5cf0', '#18c2a6', '#ff8c42', '#3a86ff', '#ff5c72', '#ffb703',
                   '#9b5de5', '#00b4d8', '#e07a5f', '#43aa8b', '#c9184a', '#7f5539'];

  // zikzak: her 4 dairede bir asagi-yukari dalga
  function girinti(i) {
    const d = i % 8;
    if (d <= 2) return d;
    if (d <= 6) return 4 - d;
    return d - 8;
  }

  function renk(index) { return RENKLER[index % RENKLER.length]; }

  function dersIkon(ders) {
    if (ders.tip === 'test') return '🎯';
    if (ders.tip === 'boss') return ders.alfabe === 'hk' ? '👑' : '👺';
    if (ders.tip === 'pekistir') return '💪';
    if (ders.tip === 'reading') return ders.reading === 'cumle' ? '📖' : '🔤';
    if (ders.tip === 'yakinda') return '🚧';
    return '⛩️';
  }

  /**
   * @param {HTMLElement} kap        cizimin yapilacagi alan
   * @param {Object} ayar
   *   ayar.mufredat  MUFREDAT dizisi
   *   ayar.seviye    aktif daire id'si
   *   ayar.yildizlar { id: 1..3 }
   *   ayar.bolumIlerleme(bolumAdi) -> {biten, toplam}
   *   ayar.secildi(ders)           -> daire tiklaninca
   *   ayar.aktifSecildi(ders)      -> aktif dersin onizlemesindeki "BASLA"
   */
  function ciz(kap, ayar) {
    kap.replaceChildren();
    const renkSirasi = {};
    let renkIndex = 0;
    let sira = 0;
    let bolum = 0;

    ayar.mufredat.forEach(function (ders) {
      if (ders.bolum) {
        bolum++;
        renkIndex = bolum - 1;
        sira = 0;
        kap.append(bolumBasligi(ders.bolum, bolum, ayar));
      }

      const renkli = ders.tip === 'boss' || ders.tip === 'test';
      const index = sira++;
      const duz = girinti(index);
      const yerlesim = document.createElement('div');
      yerlesim.className = 'yol-satir';
      yerlesim.style.setProperty('--girinti', (duz * 26) + 'px');
      // Tamamlanan daireler yesil, kalanlar bolum renginde
      const daireRengi = ders.id < ayar.seviye ? '#18c2a6' : renk(renkIndex);
      yerlesim.append(dugme(ders, index, renkli, ayar, daireRengi));
      kap.append(yerlesim);

      renkSirasi[ders.id] = daireRengi;
    });

    // ÖNEMLİ: Sadece gerçekten görünür (kaydırılmış) bir buton ortalansın.
    // Eskiden koşulsuz çağrılıyordu ve sayfa açılışında haritayı zorla aşağı
    // kaydırıyordu; kullanıcı bir anda haritanın ortasında buluyordu kendini.
    const aktif = kap.querySelector('.dugme.aktif');
    if (aktif) {
      const k = aktif.getBoundingClientRect();
      const gorunur = k.bottom > 0 && k.top < (window.innerHeight || 0);
      if (!gorunur) setTimeout(function () { aktif.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 250);
    }
  }

  // BÖLÜM BAŞLIĞI + İLERLEME HALKASI
  // Eskiden sadece "3 / 15 ders tamamlandı" yazıyordu; sayı tek başına ilerlemeyi
  // hissettirmiyor. Artık sağ tarafta SVG bir halka var: ne kadarını bitirdiğini
  // bir bakışta gösterir (Duolingo'nun kurs ilerleme halkası gibi).
  function bolumBasligi(ad, no, ayar) {
    const el = document.createElement('div');
    el.className = 'bolum';
    const bilgi = ayar.bolumIlerleme ? ayar.bolumIlerleme(ad) : null;
    // "Bölüm 1: Hiragana" gibi adlarda basligi tekrarlamamak icin sade adi kullan
    const sadeAd = ad.replace(/^Bölüm\s*\d+\s*[:.\-]?\s*/i, '').trim() || ad;

    // Halka: yarıçap 16, çevre = 2*pi*r
    const biten = bilgi ? bilgi.biten : 0;
    const toplam = bilgi ? bilgi.toplam : 0;
    const oran = toplam > 0 ? Math.min(biten / toplam, 1) : 0;
    const YARICAP = 16;
    const CEVRE = 2 * Math.PI * YARICAP;
    const dolgu = CEVRE * oran;
    const tamam = toplam > 0 && biten >= toplam;

    el.innerHTML =
      '<div class="bolum-ust">' +
        '<span class="bolum-no">Bölüm ' + no + '</span>' +
        '<span class="bolum-ad">' + sadeAd + '</span>' +
        (toplam > 0 ?
          '<span class="bolum-halka" title="' + biten + ' / ' + toplam + ' ders">' +
            '<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">' +
              '<circle cx="20" cy="20" r="' + YARICAP + '" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="4"/>' +
              '<circle class="halka-dolu" cx="20" cy="20" r="' + YARICAP + '" fill="none" stroke="#fff" ' +
                'stroke-width="4" stroke-linecap="round" ' +
                `stroke-dasharray="${dolgu} ${CEVRE}" ` +
                'transform="rotate(-90 20 20)"/>' +
            '</svg>' +
            '<span class="bolum-halka-yazi">' + (tamam ? '✓' : biten + '/' + toplam) + '</span>' +
          '</span>'
          : '');
    el.style.setProperty('--bolum-renk', renk(no - 1));
    return el;
  }

  // Tek bir ders dairesi. Sira: dugme -> ders adi -> yildizlar -> "BASLA" balonu (en ustte)
  function dugme(ders, index, renkli, ayar, bolumRengi) {
    const aktif = ders.id === ayar.seviye;
    const bitmis = ders.id < ayar.seviye;
    // KİLİTLİ: aktif daireden SONRAKİ dersler. Kullanıcı sırayı atlamasın.
    // ÖNEMLİ: Eskiden bu durum HİÇ hesaplanmıyordu; tüm daireler açık görünüyordu
    // ve kullanıcı rastgele bir seviyeye atlayabiliyordu (kilit anlamsızdı).
    const kilitli = ders.id > ayar.seviye;
    const yildiz = (ayar.yildizlar || {})[ders.id] || 0;

    const kap = document.createElement('div');
    kap.className = 'dugme-kap';
    kap.dataset.id = ders.id;

    const bas = document.createElement('button');
    bas.type = 'button';
    bas.className = 'dugme' + (aktif ? ' aktif' : '') + (bitmis ? ' bitmis' : '') +
      (kilitli ? ' kilitli' : '') + (renkli ? ' ozel' : '');
    bas.style.setProperty('--dugme-renk', bolumRengi);
    // Kilitli dairede ekran okuyucu "kilitli" desin.
    bas.setAttribute('aria-label', ders.baslik + (kilitli ? ' (kilitli)' : ''));
    if (kilitli) bas.setAttribute('aria-disabled', 'true');
    bas.innerHTML = '<span class="dugme-ikon">' +
      (kilitli ? '🔒' : (bitmis ? '✓' : dersIkon(ders))) + '</span>';
    bas.addEventListener('click', function (e) {
      e.stopPropagation();
      ayar.secildi(ders, kap);
    });

    const ad = document.createElement('div');
    ad.className = 'dugme-ad' + (bitmis ? ' bitmis' : '') + (aktif ? ' aktif' : '') +
      (kilitli ? ' kilitli' : '');
    ad.textContent = ders.baslik;

    kap.append(bas, ad);

    if (yildiz > 0) {
      const y = document.createElement('div');
      y.className = 'dugme-yildiz';
      y.textContent = '⭐'.repeat(yildiz);
      kap.append(y);
    }

    if (aktif) {
      const et = document.createElement('span');
      et.className = 'basla-balonu';
      et.textContent = 'BAŞLA';
      kap.append(et);
    }

    return kap;
  }

  window.DojoYol = { ciz: ciz, renk: renk, dersIkon: dersIkon };
})();