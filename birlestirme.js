// ============================================================
// HARF BİRLEŞTİRME (birlestirme.js)
//
// NEDEN VAR: Öğrenci harfleri tek tek öğreniyor ama "öğrendim" hissi gelmiyor.
// Bu alan öğrenilen harflerden GERÇEK bir kelimeyi kendisine KURDURUR:
//   ね こ  -> ねこ (neko) = kedi
// Böylece harfler soyut şekil olmaktan çıkıp işe yarar bir bütün oluşturur.
// Ders içindeki kelime sorularından farkı: burada cevap seçilmez, KURULUR.
//
// Kural: kelimedeki HER harf öğrenilmiş olmalı. Aksi hâlde kelime atlanır;
// öğrenciye bilmediği harf gösterilmez (ders mantığıyla aynı ilke).
// ============================================================
(function () {
    'use strict';

    const TUR_KELIME = 8;      // tur başına kelime
    const TUR_XP = 30;

    const kok = document.getElementById('kok');

    function el(tag, sinif, metin) {
        const e = document.createElement(tag);
        if (sinif) e.className = sinif;
        if (metin != null) e.textContent = metin;
        return e;
    }
    function karistir(dizi) {
        const a = dizi.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    if (!window.Ilerleme || !Ilerleme.isim()) { window.location.replace('index.html'); return; }
    document.getElementById('geriBtn').onclick = () => { window.location.href = 'dojo.html'; };

    // ---------- Öğrenilen harfler ----------
    // İlerleme kaydından harf id'lerini al. Kana id'leri "h:a", "k:ka" biçimindedir.
    // NOT: KANA `const` olduğu için window.KANA YOKTUR; typeof ile kontrol edilir.
    function kanaVarMi(id) {
        return typeof KANA !== 'undefined' && !!KANA[id];
    }
    function ogrenilenHarfler() {
        const kume = {};
        try {
            const gorulen = Ilerleme.gorulenIdler ? Ilerleme.gorulenIdler() : [];
            gorulen.forEach(id => { if (kanaVarMi(id)) kume[KANA[id].j] = true; });
        } catch (e) { }
        return kume;
    }

    // Kelimedeki tüm karakterler öğrenilmiş mi? (kana uzunluk işaretleri ve
    // küçük ya/yu/yo dahil: hepsi KANA tablosunda tek karakter olarak var)
    function kelimeUygunMu(kelime, harfler) {
        const ja = kelime.ja || '';
        if (!ja) return false;
        // Sadece kana kelimeler: kanji içerenleri atla (bu alan harf birleştirme)
        for (const ch of ja) {
            if (!harfler[ch]) return false;
        }
        // Çok uzun kelime taşma yapar, çok kısa (1 harf) birleştirme öğretmez
        return ja.length >= 2 && ja.length <= 6;
    }

    function havuzOlustur() {
        if (!window.READING || !READING.SOZLUK) return [];
        const harfler = ogrenilenHarfler();
        const uygun = READING.SOZLUK.filter(k => kelimeUygunMu(k, harfler));

        // Yeterli kelime yoksa: temel hiragana harflerini varsayıp yine de bir şey sun.
        // (Öğrenci henüz 5 harf biliyorsa ねこ gibi kelimeler zaten uygun olur.)
        if (uygun.length < 4) {
            const temel = {};
            ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ',
                'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ']
                .forEach(c => { temel[c] = true; });
            return READING.SOZLUK.filter(k => kelimeUygunMu(k, temel));
        }
        return uygun;
    }

    // ---------- Tur durumu ----------
    let turKelimeler = [], sira = 0, dogruSayi = 0, yanlisSayi = 0;
    let kurulanlar = [];    // turda başarıyla kurulan kelimeler

    function turBaslat() {
        const havuz = havuzOlustur();
        turKelimeler = karistir(havuz).slice(0, TUR_KELIME);
        sira = 0; dogruSayi = 0; yanlisSayi = 0; kurulanlar = [];
        if (!turKelimeler.length) { bosEkran(); return; }
        kelimeCiz();
    }

    function bosEkran() {
        const kart = el('div', 'br-kelime');
        kart.append(el('div', 'kanji', '🌸'));
        kart.append(el('div', 'tr', 'Birleştirecek kelime bulunamadı.'));
        const p = el('p', '', 'Birkaç ders yapıp harf öğrendikten sonra buraya dön. Şimdilik en az 5 harf gerekiyor.');
        p.style.cssText = 'color:var(--yazi-soluk);font-weight:700;margin-top:12px;';
        const alt = el('div', 'br-alt');
        const btn = el('button', 'sp-btn', 'HARİTAYA DÖN');
        btn.onclick = () => { window.location.href = 'dojo.html'; };
        alt.append(btn);
        kok.replaceChildren(kart, p, alt);
    }

    // ---------- Kelime ekranı ----------
    let secilenler = [], havuzTaslari = [], cevapEl = null, geriEl = null;

    function kelimeCiz() {
        if (sira >= turKelimeler.length) { turBitir(); return; }

        const kelime = turKelimeler[sira];
        secilenler = [];

        // --- İlerleme şeridi ---
        const ust = el('div', 'br-ust');
        const bar = el('div', 'br-bar');
        const dolgu = el('div');
        dolgu.style.width = (sira / turKelimeler.length * 100) + '%';
        bar.append(dolgu);
        ust.append(bar, el('span', 'br-sayac', (sira + 1) + ' / ' + turKelimeler.length));

        // --- Sorulan kelimenin anlamı (Japoncası GİZLİ: öğrenci kuracak) ---
        const bilgi = el('div', 'br-kelime');
        const soruKap = el('div', 'br-soru');
        soruKap.append(el('h2', '', 'Bu kelimeyi kur'));
        soruKap.append(el('p', '', 'Aşağıdaki harfleri doğru sıraya diz.'));

        // Türkçe anlam + romaji ipucu (romaji, sesi hatırlatır ama dizilişi söylemez)
        bilgi.append(el('div', 'tr', kelime.tr));
        bilgi.append(el('div', 'ro', '"' + kelime.ro + '" diye okunur'));
        bilgi.append(el('div', 'kanji', kelime.ja.length + ' harf'));

        // --- Cevap şeridi ---
        cevapEl = el('div', 'br-cevap');
        cevapEl.setAttribute('aria-label', 'Kurduğun kelime');
        for (let i = 0; i < kelime.ja.length; i++) {
            cevapEl.append(el('div', 'br-yer'));
        }
        cevapEl.append(el('span', 'br-ipucu-yazi', 'Harflere dokunarak kelimeyi oluştur'));

        // --- Harf taşları ---
        // Doğru harflerin yanına çeldirici eklenir; çeldiriciler öğrenilen
        // harflerden seçilir (bilinmeyen harf sorulmaz).
        const harfler = ogrenilenHarfler();
        const dogruHarfler = kelime.ja.split('');
        const adaylar = Object.keys(harfler).filter(h => dogruHarfler.indexOf(h) === -1);
        const celdiriciSayi = Math.min(3, adaylar.length);
        const celdiriciler = karistir(adaylar).slice(0, celdiriciSayi);
        havuzTaslari = karistir(dogruHarfler.concat(celdiriciler));

        const havuzKap = el('div', 'br-havuz');
        havuzTaslari.forEach(h => {
            const b = el('button', 'br-tas', h);
            b.type = 'button';
            b.setAttribute('lang', 'ja');
            b.onclick = () => tasSec(b, h);
            havuzKap.append(b);
        });

        geriEl = el('div', 'br-geri', '');

        const alt = el('div', 'br-alt');
        const silBtn = el('button', 'sp-btn cizgili', 'GERİ AL');
        silBtn.onclick = () => { sonTasiGeriAl(); };
        const atlaBtn = el('button', 'sp-btn cizgili', 'GEÇ');
        atlaBtn.onclick = () => { yanlisSayi++; sonrakiKelime(); };
        alt.append(silBtn, atlaBtn);

        kok.replaceChildren(ust, soruKap, bilgi, cevapEl, havuzKap, geriEl, alt);
    }

    function tasSec(dugme, harf) {
        if (dugme.classList.contains('kullanildi')) return;
        dugme.classList.add('kullanildi', 'secili');

        // Cevap şeridindeki ilk boş yere harfi yaz
        const yerler = cevapEl.querySelectorAll('.br-yer');
        const bosIndex = secilenler.length;
        if (bosIndex >= yerler.length) return;
        const yer = yerler[bosIndex];
        yer.textContent = harf;
        yer.style.cssText = 'width:46px;height:54px;display:inline-flex;align-items:center;' +
            'justify-content:center;font-size:30px;font-weight:700;border-bottom:3px solid var(--mor);';
        secilenler.push({ harf: harf, dugme: dugme });

        cevapEl.classList.add('dolu');
        const ipucu = cevapEl.querySelector('.br-ipucu-yazi');
        if (ipucu) ipucu.remove();

        // Tüm yerler dolduysa kontrol et
        if (secilenler.length === yerler.length) kontrol(kelime);
    }

    function sonTasiGeriAl() {
        const son = secilenler.pop();
        if (!son) return;
        son.dugme.classList.remove('kullanildi', 'secili');

        const yerler = cevapEl.querySelectorAll('.br-yer');
        const yer = yerler[secilenler.length];
        if (yer) { yer.textContent = ''; yer.style.cssText = ''; }

        cevapEl.classList.remove('dolu', 'dogru', 'hata');
        geriEl.textContent = '';
        geriEl.className = 'br-geri';
        if (!secilenler.length && !cevapEl.querySelector('.br-ipucu-yazi')) {
            cevapEl.append(el('span', 'br-ipucu-yazi', 'Harflere dokunarak kelimeyi oluştur'));
        }
    }

    function kontrol(kelime) {
        const kurulan = secilenler.map(s => s.harf).join('');
        const dogruMu = kurulan === kelime.ja;

        if (dogruMu) {
            cevapEl.classList.remove('dolu');
            cevapEl.classList.add('dogru');
            geriEl.className = 'br-geri iyi';
            geriEl.textContent = '✓ ' + kelime.ja + ' — ' + kelime.tr;
            dogruSayi++;
            kurulanlar.push(kelime);
            try { if (window.Ses) Ses.dogru(); } catch (e) { }
            try { if (window.Ses && Ses.oku) Ses.oku(kelime.ja); } catch (e) { }
            // Kelime defterine ekle: bu kelime gerçekten öğrenildi.
            try {
                if (window.KelimeDefteri) {
                    KelimeDefteri.gor({ ja: kelime.ja, ro: kelime.ro, tr: kelime.tr });
                    KelimeDefteri.cevap({ ja: kelime.ja }, true);
                }
            } catch (e) { }
            setTimeout(sonrakiKelime, 1100);
        } else {
            cevapEl.classList.remove('dolu');
            cevapEl.classList.add('hata');
            geriEl.className = 'br-geri hata';
            geriEl.textContent = '✗ Oldu: ' + kurulan + ' — Tekrar dene';
            yanlisSayi++;
            try { if (window.Ses) Ses.yanlis(); } catch (e) { }
            // Kısa bir bekleme sonra taşları sıfırla, aynı kelimeyi yeniden kursun
            setTimeout(() => {
                if (sira >= turKelimeler.length) return;
                sifirlaTaslar();
            }, 900);
        }
    }

    function sifirlaTaslar() {
        secilenler = [];
        cevapEl.classList.remove('dolu', 'dogru', 'hata');
        const yerler = cevapEl.querySelectorAll('.br-yer');
        yerler.forEach(y => { y.textContent = ''; y.style.cssText = ''; });
        document.querySelectorAll('.br-tas').forEach(b => b.classList.remove('kullanildi', 'secili'));
        if (!cevapEl.querySelector('.br-ipucu-yazi')) {
            cevapEl.append(el('span', 'br-ipucu-yazi', 'Harflere dokunarak kelimeyi oluştur'));
        }
        geriEl.textContent = '';
        geriEl.className = 'br-geri';
    }

    function sonrakiKelime() {
        sira++;
        kelimeCiz();
    }
    // ---------- Tur sonu ----------
    function turBitir() {
        const toplam = dogruSayi + yanlisSayi;
        const yuzde = toplam ? Math.round(dogruSayi / toplam * 100) : 0;
        let kp = TUR_XP;
        if (yanlisSayi === 0) kp += 10;
        try { Ilerleme.xpEkle(kp); } catch (e) { }
        try { if (window.Ses) Ses.sensei('tekrar-bitti'); } catch (e) { }

        const kart = el('div', 'br-kelime br-sonuc');
        let simge = '🌸', baslik = 'Tur tamam!';
        if (yuzde === 100) { simge = '🏆'; baslik = 'Hepsini kurdun!'; }
        else if (yuzde >= 75) { simge = '🎉'; baslik = 'Çok iyi!'; }
        else if (yuzde < 50) { simge = '💪'; baslik = 'Biraz daha çalışalım'; }

        kart.append(el('div', 'buyuk', simge));
        kart.append(el('h2', '', baslik));

        const ozet = el('div', 'br-ozet');
        [['Kurulan', dogruSayi + '/' + turKelimeler.length], ['Kazanılan XP', '+' + kp]].forEach(([ad, d]) => {
            const k = el('div');
            k.append(el('b', '', d), el('small', '', ad));
            ozet.append(k);
        });
        kart.append(ozet);

        // Kurulan kelimeleri listele: turdan sonra tekrar okunacak bir liste kalır.
        if (kurulanlar.length) {
            const bas = el('p', '', 'Kurduğun kelimeler');
            bas.style.cssText = 'font-weight:800;margin:0 0 8px;text-align:left;';
            kart.append(bas);
            const liste = el('div', 'br-liste');
            kurulanlar.forEach(k => {
                const satir = el('div', 'br-satir');
                const orta = el('div');
                orta.append(el('b', '', k.ja), el('small', '', ' (' + k.ro + ') — ' + k.tr));
                satir.append(orta);
                liste.append(satir);
            });
            kart.append(liste);
        }

        const alt = el('div', 'br-alt');
        const tekrar = el('button', 'sp-btn', 'YENİ TUR');
        tekrar.onclick = turBaslat;
        const don = el('button', 'sp-btn cizgili', 'HARİTAYA DÖN');
        don.onclick = () => { window.location.href = 'dojo.html'; };
        alt.append(tekrar, don);

        kok.replaceChildren(kart, alt);
        document.getElementById('xpRozet').textContent = '+' + kp + ' XP';
    }

    turBaslat();
})();
