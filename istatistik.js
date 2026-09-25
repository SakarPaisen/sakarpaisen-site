// ============================================================
// İSTATİSTİK (istatistik.js)  —  Sakar Paisen
//
// Kullanıcıya kendi gelişimini GÖSTERİR. Neden önemli?
//   • "İlerliyorum" hissi = devam etme motivasyonu (oyun kalbi)
//   • Zayıf harfleri görünce ne çalışacağını bilir
//   • 7 günlük grafik, seriyi korumak için görsel baskı yapar
//
// HİÇBİR DIŞ KÜTÜPHANE YOK: grafikler saf <canvas> ile çizilir
// (siteyi yavaşlatmasın, ek dosya indirilmesin).
//
// VERİ KAYNAKLARI (hepsi yerel, gizlilik dostu):
//   Ilerleme.gecmis()  -> günlük XP geçmişi (ayarlar/ilerleme.js)
//   Ilerleme.kayit()   -> harf başına doğru/yanlış + tekrar kutusu (Leitner)
//   Ilerleme.yildizlar() / seri() / xp() / rutbe()
//   KelimeDefteri      -> kelime defteri (kelime.js)
// ============================================================
(function () {
  'use strict';

  function el(tag, sinif, metin) {
    const e = document.createElement(tag);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    return e;
  }

  // Tema renklerini CSS değişkenlerinden oku (tema değişince grafik de uyar)
  function temaRengi(ad, yedek) {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue(ad).trim();
      return v || yedek;
    } catch (e) { return yedek; }
  }

  // ============================================================
  // 1) GRAFİK: son N günlük XP sütun grafiği
  // ============================================================
  function xpGrafigi(gecmis, gunSayisi) {
    const kap = el('div');
    const g = sonGunler(gecmis, gunSayisi);
    const enBuyuk = Math.max(1, ...g.map(x => x.xp));

    if (enBuyuk <= 1 && g.every(x => x.xp === 0)) {
      kap.append(el('div', 'grafik-bos', '🌸 Henüz veri yok. Birkaç ders yapınca burada gelişimin görünecek.'));
      return kap;
    }

    const boy = 180;
    const cv = document.createElement('canvas');
    // Yüksek çözünürlük (retina) için 2x çiz, CSS ile küçült.
    // ÖNEMLİ: kap henüz DOM'a eklenmediği için kap.clientWidth = 0 döner ve
    // grafik yanlış genişlikte çizilirdi (kenarlar kesiliyordu). Bu yüzden
    // en yakın kapsayıcıdan ölçü alınır.
    const oran = 2;
    const olcKabi = kap.closest ? (kap.closest('.kapsayici') || kap.parentElement) : null;
    const genislik = Math.max(280, (olcKabi && olcKabi.clientWidth ? olcKabi.clientWidth - 60 : 0) ||
      kap.clientWidth || 520);
    cv.width = Math.round(genislik * oran);
    cv.height = Math.round(boy * oran);
    cv.style.width = '100%';
    cv.style.height = boy + 'px';
    const c = cv.getContext('2d');
    c.scale(oran, oran);

    const bosluk = 6;
    const sutunG = (genislik - bosluk * (g.length - 1)) / g.length;
    const mor = temaRengi('--mor', '#7b5cf0');
    const cizgi = temaRengi('--cizgi-koyu', '#d8ccb4');
    const soluk = temaRengi('--yazi-soluk', '#7d7568');
    const altin = temaRengi('--altin', '#ffb703');

    // Hedef çizgisi (günlük 50 XP)
    const hedefY = boy - 22 - ((Ilerleme.HEDEF_XP / enBuyuk) * (boy - 40));
    if (hedefY > 0) {
      c.strokeStyle = altin;
      c.setLineDash([5, 4]);
      c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(0, hedefY); c.lineTo(genislik, hedefY); c.stroke();
      c.setLineDash([]);
      c.fillStyle = altin;
      c.font = 'bold 10px system-ui, sans-serif';
      c.fillText('hedef', 2, Math.max(11, hedefY - 4));
    }

    g.forEach((x, i) => {
      const h = x.xp === 0 ? 0 : Math.max(3, (x.xp / enBuyuk) * (boy - 40));
      const px = i * (sutunG + bosluk);
      const py = boy - 22 - h;

      // Sütun
      c.fillStyle = x.xp >= Ilerleme.HEDEF_XP ? mor : temaRengi('--zemin-2', '#f2ede2');
      if (h > 0) {
        c.beginPath();
        const r = Math.min(6, sutunG / 2);
        c.roundRect ? c.roundRect(px, py, sutunG, h, r) : c.rect(px, py, sutunG, h);
        c.fill();
      }
      // Zemin çizgisi
      c.strokeStyle = cizgi;
      c.lineWidth = 1;
      c.beginPath(); c.moveTo(px, boy - 21); c.lineTo(px + sutunG, boy - 21); c.stroke();

      // Gün etiketi (kalabalık olmasın: 7 günde hepsi, 30 günde her 5.)
      const etiketAralik = g.length <= 10 ? 1 : 5;
      if (i % etiketAralik === 0 || i === g.length - 1) {
        c.fillStyle = soluk;
        c.font = 'bold 10px system-ui, sans-serif';
        c.textAlign = 'center';
        c.fillText(x.kisa, px + sutunG / 2, boy - 6);
        c.textAlign = 'start';
      }
    });

    kap.append(cv);
    return kap;
  }

  // "2024-05-12" -> {xp, kisa:"12"} gün nesneleri (boş günler 0 XP)
  function sonGunler(gecmis, gunSayisi) {
    const harita = {};
    (gecmis || []).forEach(g => { harita[g.tarih] = g.xp; });
    const cikti = [];
    const bugun = new Date();
    for (let i = gunSayisi - 1; i >= 0; i--) {
      const d = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() - i);
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      cikti.push({ tarih: k, xp: harita[k] || 0, kisa: String(d.getDate()) });
    }
    return cikti;
  }

  // ============================================================
  // 2) ISI HARİTASI: son 12 hafta (84 gün) — GitHub tarzı
  // ============================================================
  function isiHaritasi(gecmis) {
    const kap = el('div');
    const harita = {};
    (gecmis || []).forEach(g => { harita[g.tarih] = g.xp; });

    const isi = el('div', 'isi');
    const renkler = ['var(--zemin-2)', '#c9e7ff', '#8ccbff', 'var(--gok)', 'var(--mor)'];
    const bugun = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() - i);
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const xp = harita[k] || 0;
      let sev = 0;
      if (xp > 0) sev = 1;
      if (xp >= 25) sev = 2;
      if (xp >= Ilerleme.HEDEF_XP) sev = 3;
      if (xp >= Ilerleme.HEDEF_XP * 2) sev = 4;

      const kutu = el('div', 'isi-kutu');
      kutu.style.background = renkler[sev];
      kutu.title = k + ' · ' + xp + ' XP';
      isi.append(kutu);
    }
    kap.append(isi);
    const alt = el('div', 'isi-alt');
    alt.append(el('span', '', '12 hafta önce'), el('span', '', 'Bugün'));
    kap.append(alt);
    return kap;
  }

  // ============================================================
  // 3) HARF DURUMU: harf başına doğruluk + tekrar kutusu
  // ============================================================
  function harfDurumu(kayit, enFazla) {
    const kap = el('div');
    const idler = Object.keys(kayit || {});
    if (!idler.length) {
      kap.append(el('div', 'grafik-bos', '📖 Henüz harf çalışmadın. İlk dersten sonra burada harf harf ilerlemen görünecek.'));
      return kap;
    }

    // En çok yanlış yapılanlar önce gelsin (çalışılması gerekenler)
    // ÖNEMLİ: kana id'leri alfabe öneki taşır ('h:ka' hiragana, 'k:ka' katakana).
    // Öneki atıp AYNI harfin iki alfabesini ayrı ayrı listeliyoruz; böylece
    // kullanıcı "hiragana ka zayıf" ile "katakana ka zayıf"ı ayırt edebilir.
    const liste = idler.map(id => {
      const e = kayit[id];
      const toplam = (e.d || 0) + (e.y || 0);
      const oran = toplam ? e.d / toplam : 0;
      const h = (typeof KANA !== 'undefined' && KANA[id]) ? KANA[id] : null;
      return {
        id: id,
        jp: h ? h.j : id,
        ro: h ? h.r : id,
        alfabe: h ? h.a : '',
        oran: oran, kutu: e.kutu || 0, toplam: toplam
      };
    });

    const sirali = liste
      .sort((a, b) => a.oran - b.oran || a.kutu - b.kutu)
      .slice(0, enFazla || 24);

    const grid = el('div', 'harf-liste');
    sirali.forEach(h => {
      const s = el('div', 'harf-kart ' + (h.oran >= 0.8 ? 'iyi' : h.oran >= 0.5 ? 'orta' : 'zayif'));
      s.append(el('div', 'h-jp', h.jp), el('div', 'h-ro', h.ro));
      // Alfabe etiketi: aynı romaji iki alfabede de olabilir (あ / ア)
      if (h.alfabe) {
        s.append(el('div', 'h-al', h.alfabe === 'k' ? 'Katakana' : 'Hiragana'));
      }
      const bar = el('div', 'h-bar'), ic = el('div', 'h-ic');
      ic.style.width = Math.round(h.oran * 100) + '%';
      ic.style.background = h.oran >= 0.8 ? 'var(--turkuaz)' : h.oran >= 0.5 ? 'var(--altin)' : 'var(--kirmizi)';
      bar.append(ic);
      s.append(bar);
      const alfabeAd = h.alfabe === 'k' ? 'Katakana' : 'Hiragana';
      s.title = h.jp + ' (' + h.ro + ', ' + alfabeAd + ') · %' + Math.round(h.oran * 100) +
        ' doğru · tekrar kutusu ' + h.kutu + '/5';
      grid.append(s);
    });
    kap.append(grid);
    return kap;
  }

  // ============================================================
  // 4) ANA ÇİZİM
  // ============================================================
  function ciz(kok) {
    if (!kok) return;
    kok.replaceChildren();

    if (!Ilerleme.isim()) {
      kok.append(el('div', 'bos-not', 'Kayıt bulunamadı. Önce giriş ekranından kaydol.'));
      return;
    }

    const gecmis = (Ilerleme.gecmis && Ilerleme.gecmis()) || [];
    const kayit = Ilerleme.kayit() || {};
    const yildizlar = Ilerleme.yildizlar() || {};
    const rutbe = Ilerleme.rutbe(Ilerleme.xp());
    const seri = Ilerleme.seri();

    // ---------- Özet rakamlar ----------
    const ozet = el('div', 'kart');
    ozet.append(el('h2', '', '📈 Genel durum'));
    ozet.append(el('p', '', 'Toplam gelişimin tek bakışta.'));
    const grid = el('div', 'buyuk-grid');
    const yildizToplam = Object.keys(yildizlar).reduce((t, k) => t + yildizlar[k], 0);
    [
      { b: Ilerleme.xp(), s: 'Toplam XP', r: 'var(--altin-koyu)' },
      { b: rutbe.ad, s: 'Rütbe (' + rutbe.no + '/5)', r: 'var(--mor)' },
      { b: seri.sayi, s: 'Günlük seri · en iyi ' + (seri.en || seri.sayi), r: 'var(--turuncu)' },
      { b: yildizToplam, s: 'Kazanılan yıldız', r: 'var(--altin-koyu)' },
      { b: Object.keys(kayit).length, s: 'Çalışılan harf', r: 'var(--turkuaz-koyu)' },
      { b: Ilerleme.tekrarSayisi(), s: 'Tekrar bekleyen', r: 'var(--gok)' }
    ].forEach(v => {
      const k = el('div', 'bg-kutu');
      const b = el('b', '', String(v.b));
      b.style.color = v.r;
      k.append(b, el('small', '', v.s));
      grid.append(k);
    });
    ozet.append(grid);
    kok.append(ozet);

    // ---------- XP grafiği (sekme: 7 / 30 gün) ----------
    const grafik = el('div', 'kart');
    grafik.append(el('h2', '', '🔥 Günlük çalışma'));
    grafik.append(el('p', '', 'Her sütun bir gün. Mor sütunlar günlük hedefi (' + Ilerleme.HEDEF_XP + ' XP) tuttuğun günler.'));

    const sekme = el('div', 'sekme');
    const grafikKap = el('div');
    let gun = 7;
    const btn7 = el('button', 'aktif', 'Son 7 gün');
    const btn30 = el('button', '', 'Son 30 gün');
    function grafikYenile() {
      grafikKap.replaceChildren(xpGrafigi(gecmis, gun));
      btn7.classList.toggle('aktif', gun === 7);
      btn30.classList.toggle('aktif', gun === 30);
    }
    btn7.onclick = () => { gun = 7; grafikYenile(); };
    btn30.onclick = () => { gun = 30; grafikYenile(); };
    sekme.append(btn7, btn30);
    grafik.append(sekme, grafikKap);
    grafikYenile();
    kok.append(grafik);

    // ---------- Isı haritası ----------
    const isi = el('div', 'kart');
    isi.append(el('h2', '', '🗓️ Son 12 hafta'));
    isi.append(el('p', '', 'Her kare bir gün. Koyu kareler çok çalıştığın günler. Boşluk bırakmamaya çalış!'));
    isi.append(isiHaritasi(gecmis));
    kok.append(isi);

    // ---------- Harf haritası ----------
    const harfler = el('div', 'kart');
    harfler.append(el('h2', '', '🎯 Harf harf durum'));
    harfler.append(el('p', '', 'En çok zorlandıkların başta. Kırmızı harfleri "Tekrar" dersinde çalış.'));
    // Harf listesinin üstüne "zayıf harflerle çalış" kısayolu
    if (Object.keys(kayit).length) {
      const git = el('button', 'sp-btn kucuk yesil', '🎯 ZAYIF HARFLERİ ÇALIŞ');
      git.onclick = () => { window.location.href = 'oyun.html?ders=pekistir'; };
      harfler.append(git);
    }
    harfler.append(harfDurumu(kayit, 24));
    kok.append(harfler);

    // ---------- BAŞARIMLAR (tam liste) ----------
    // ÖNEMLİ: görünümden ÖNCE kontrol() çağrılır. Aksi hâlde kullanıcı
    // istatistik sayfasına girdiğinde hak ettiği (ama hiçbir ders bitişinde
    // tetiklenmemiş) başarımlar kilitli görünürdü. Testte yakalandı.
    if (window.Basarimlar) {
      try { Basarimlar.kontrol(); } catch (e) { }
      const b = el('div', 'kart');
      b.id = 'basarim';
      const oz = Basarimlar.ozet();
      b.append(el('h2', '', '🏆 Başarımlar'));
      b.append(el('p', '', 'Rozet topla! Kilitli rozetlerin altında nasıl açılacağı yazar.'));

      const ozetYazi = el('div', 'basarim-ozet-yazi');
      ozetYazi.append(document.createTextNode(oz.acilan + ' / ' + oz.toplam + ' açıldı  '));
      const yuzde = el('b', '', '%' + Math.round(oz.oran * 100));
      ozetYazi.append(yuzde);
      b.append(ozetYazi);

      const bar = el('div', 'gorev-bar');
      bar.style.marginBottom = '16px';
      const ic = el('div');
      ic.style.width = Math.round(oz.oran * 100) + '%';
      bar.append(ic);
      b.append(bar);

      // Grup grup göster (Yolculuk / Disiplin / Ustalık / Koleksiyon)
      Object.keys(Basarimlar.GRUPLAR).forEach(gk => {
        const g = Basarimlar.GRUPLAR[gk];
        const grupListesi = Basarimlar.hepsi().filter(x => x.grup === gk);
        if (!grupListesi.length) return;
        const acikSayi = grupListesi.filter(x => x.acik).length;
        b.append(el('div', 'basarim-ozet-yazi',
          g.simge + ' ' + g.ad + ' — ' + acikSayi + '/' + grupListesi.length));

        const izgara = el('div', 'basarim-izgara');
        izgara.style.marginBottom = '18px';
        grupListesi.forEach(x => {
          const k = el('div', 'basarim-kutu ' + (x.acik ? 'acik' : 'kilitli'));
          k.append(
            el('span', 'bk-simge', x.acik ? x.simge : '🔒'),
            el('div', 'bk-ad', x.ad),
            el('div', 'bk-aciklama', x.aciklama)
          );
          izgara.append(k);
        });
        b.append(izgara);
      });
      kok.append(b);
    }

    // ---------- GÜNLÜK GÖREVLER ----------
    if (window.Gorevler) {
      const l = Gorevler.liste();
      if (l.length) {
        const g = el('div', 'kart');
        const oz = Gorevler.ozet();
        g.append(el('h2', '', '📋 Bugünün görevleri'));
        g.append(el('p', '', 'Her gün 3 yeni görev. Tamamlayınca fazladan XP kazanırsın.'));
        l.forEach(x => {
          const satir = el('div', 'gorev-satir' + (x.tamam ? ' tamam' : ''));
          satir.append(
            el('div', 'gorev-simge', x.tamam ? '✓' : x.simge),
            (function () {
              const orta = el('div', 'gorev-orta');
              orta.append(el('b', '', x.ad), el('small', '', x.ilerleme + ' / ' + x.hedef));
              const bar = el('div', 'gorev-bar'), ic = el('div');
              ic.style.width = Math.round(x.ilerleme / x.hedef * 100) + '%';
              bar.append(ic);
              orta.append(bar);
              return orta;
            })(),
            el('div', 'gorev-odul', '+' + x.odul)
          );
          g.append(satir);
        });
        if (oz.hepsiTamam) {
          const t = el('div', 'basarim-ozet-yazi', '🌟 Bugünkü tüm görevleri tamamladın!');
          t.style.marginTop = '12px';
          g.append(t);
        }
        kok.append(g);
      }
    }

    // ---------- KARIŞTIRDIĞIN HARFLER (yanlis.js) ----------
    // Harf harf durumdan FARKLI: burada "hangi harfi hangisiyle" karıştırdığı
    // gösterilir. Öğrenme açısından en değerli bilgi budur: kullanıcı し ile
    // つ'yu karıştırdığını bilirse bilinçli çalışır.
    if (window.Yanlis) {
      const r = Yanlis.rapor();
      if (r.ciftSayisi > 0) {
        const k = el('div', 'kart');
        k.append(el('h2', '', '🔀 Karıştırdığın harfler'));
        k.append(el('p', '', 'Bu harfleri birbiriyle karıştırıyorsun. Sınav modunda tam bunlar sorulur.'));

        const liste = el('div', 'cift-liste');
        r.enCok.forEach(c => {
          const a = (typeof KANA !== 'undefined' && KANA[c.a]) ? KANA[c.a] : null;
          const b = (typeof KANA !== 'undefined' && KANA[c.b]) ? KANA[c.b] : null;
          if (!a || !b) return;

          const satir = el('div', 'cift-satir');
          satir.append(
            el('span', 'cs-harf', a.j),
            el('span', 'cs-vs', '↔'),
            el('span', 'cs-harf', b.j),
            (function () {
              const o = el('span', 'cs-orta');
              o.append(
                el('b', '', a.r + ' / ' + b.r),
                el('small', '', c.n + ' kez karıştırdın')
              );
              return o;
            })()
          );
          liste.append(satir);
        });
        k.append(liste);

        // Doğrudan çalışma kısayolu: sınav modu bu harfleri ağırlıklı sorar
        const git = el('button', 'sp-btn kucuk yesil', '🎓 BU HARFLERLE SINAVA GİR');
        git.style.marginTop = '14px';
        git.onclick = () => { window.location.href = 'oyun.html?ders=sinav'; };
        k.append(git);
        kok.append(k);
      }
    }

    // ---------- Kelime defteri ----------
    try {
      if (typeof KelimeDefteri !== 'undefined' && KelimeDefteri.hepsi) {
        const hepsi = KelimeDefteri.hepsi();
        if (hepsi && hepsi.length) {
          const kel = el('div', 'kart');
          kel.append(el('h2', '', '📖 Kelime defteri'));
          const iyi = hepsi.filter(k => (k.d || 0) >= (k.y || 0) && (k.d || 0) > 0).length;
          kel.append(el('p', '', hepsi.length + ' kelime birikti. ' + iyi + ' tanesinde doğru sayın yanlıştan fazla.'));
          const b = el('button', 'sp-btn kucuk cizgili', 'DEFTERİ AÇ');
          b.onclick = () => { window.location.href = 'kelime.html'; };
          kel.append(b);
          kok.append(kel);
        }
      }
    } catch (e) { }

        // Ekran boyutu değişince grafik yeniden çizilsin (canvas genişliği sabittir)
    let zaman = null;
    window.addEventListener('resize', () => {
      clearTimeout(zaman);
      zaman = setTimeout(() => { grafikYenile(); }, 200);
    });
  }

  window.Istatistik = { ciz: ciz };
})();
