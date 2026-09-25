// ============================================================
// CÜMLE ATÖLYESİ (cumle.js)
//
// NE BURASI: Dojo haritasından BAĞIMSIZ cümle kurma alanı. Türkçesi verilir,
// öğrenci Japonca kelime parçalarını doğru sıraya dizer.
//
// NEDEN GEREKLİ: Japonca cümlede sıra Türkçeden FARKLIDIR:
//     Türkçe : "Ben öğrenciyim"        -> özne + yüklem
//     Japonca: わたし は がくせい です   -> özne + は + yüklem + です
// Kelimeleri tek tek bilen öğrenci yine de cümle kuramıyor. Bu alan tam
// olarak o boşluğu doldurur; parçacıklar (は, を, に) yerleşik gelir ki
// öğrenci "hangi kelime nereye" sorusunu çözsün.
//
// Parçalama kuralı: cümledeki her kelime SOZLUK'te var (reading.js garantisi).
// En UZUN eşleşme önce denenir; böylece がくせい, がく + せい diye bölünmez.
// ============================================================
(function () {
    'use strict';

    const TUR_CUMLE = 6;      // tur başına cümle
    const TUR_XP = 35;

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

    // ---------- Cümleyi parçalara ayır ----------
    // Gramer parçacıkları: cümlede tek başına duran ekler. Bunlar sözlükte
    // kelime olarak yoktur ama cümlenin iskeletidir; ayrı parça olarak verilir.
    const PARCACIKLAR = ['は', 'が', 'を', 'に', 'で', 'と', 'も', 'の', 'へ', 'や', 'から', 'まで', 'です', 'ます', 'でした', 'ました', 'か', 'ね', 'よ'];

    // Sözlükteki kelimeleri uzunluğa göre sıralı tut: en uzun eşleşme önce.
    function sozlukUzunlukSirali() {
        if (!window.READING || !READING.SOZLUK) return [];
        return READING.SOZLUK
            .map(k => k.ja)
            .filter(Boolean)
            .sort((a, b) => b.length - a.length);
    }

    // Cümleyi parçalara böl. Döner: [{ ja, anlam }]
    // anlam: parçacık için boş, kelime için Türkçe karşılığı.
    function parcala(cumle, kelimelerSirali, anlamHaritasi) {
        const parcalar = [];
        let i = 0;
        const ja = cumle.ja;

        while (i < ja.length) {
            let eslesti = false;

            // 1) En uzun sözlük kelimesini dene
            for (const kelime of kelimelerSirali) {
                if (ja.startsWith(kelime, i)) {
                    parcalar.push({ ja: kelime, anlam: anlamHaritasi[kelime] || '' });
                    i += kelime.length;
                    eslesti = true;
                    break;
                }
            }
            if (eslesti) continue;

            // 2) Gramer parçacığı mı? (en uzunu önce: でした > です)
            const parca = PARCACIKLAR.find(p => ja.startsWith(p, i));
            if (parca) {
                parcalar.push({ ja: parca, anlam: '' });
                i += parca.length;
                continue;
            }

            // 3) İkisi de değil: tek karakterlik parça (kalanı bozmasın)
            parcalar.push({ ja: ja.charAt(i), anlam: '' });
            i += 1;
        }

        return parcalar;
    }

    // Cümle uygun mu? Çok kısa parçalı cümle birleştirme öğretmez;
    // çok uzun cümle ekrana sığmaz.
    function cumleUygunMu(parcalar) {
        return parcalar.length >= 3 && parcalar.length <= 7;
    }

    function havuzOlustur() {
        if (!window.READING || !READING.CUMLELER) return [];

        const kelimelerSirali = sozlukUzunlukSirali();
        const anlamHaritasi = {};
        READING.SOZLUK.forEach(k => { anlamHaritasi[k.ja] = k.tr; });

        const uygun = [];
        READING.CUMLELER.forEach(c => {
            if (!c.ja || !c.tr) return;
            const parcalar = parcala(c, kelimelerSirali, anlamHaritasi);
            if (cumleUygunMu(parcalar)) uygun.push({ cumle: c, parcalar: parcalar });
        });
        return uygun;
    }

    // ---------- Tur durumu ----------
    let turCumleler = [], sira = 0, dogruSayi = 0, yanlisSayi = 0;
    let kurulanlar = [];

    function turBaslat() {
        const havuz = havuzOlustur();
        turCumleler = karistir(havuz).slice(0, TUR_CUMLE);
        sira = 0; dogruSayi = 0; yanlisSayi = 0; kurulanlar = [];
        if (!turCumleler.length) { bosEkran(); return; }
        cumleCiz();
    }

    function bosEkran() {
        const kart = el('div', 'cm-sonuc');
        kart.append(el('div', 'buyuk', '🧱'));
        kart.append(el('h2', '', 'Cümle bulunamadı'));
        const p = el('p', '', 'Okuma derslerinde cümlelerle karşılaştıkça burada birikecek. Şimdilik birkaç okuma dersi yap.');
        kart.append(p);
        const alt = el('div', 'cm-alt');
        const btn = el('button', 'sp-btn', 'HARİTAYA DÖN');
        btn.onclick = () => { window.location.href = 'dojo.html'; };
        alt.append(btn);
        kok.replaceChildren(kart, alt);
    }

    // ---------- Cümle ekranı ----------
    let secilenler = [], cevapEl = null, geriEl = null, kontrolBtn = null, devamBtn = null;

    function cumleCiz() {
        if (sira >= turCumleler.length) { turBitir(); return; }

        const veri = turCumleler[sira];
        secilenler = [];

        // --- İlerleme ---
        const ust = el('div', 'cm-ust');
        const bar = el('div', 'cm-bar');
        const dolgu = el('div');
        dolgu.style.width = (sira / turCumleler.length * 100) + '%';
        bar.append(dolgu);
        ust.append(bar, el('span', 'cm-sayac', (sira + 1) + ' / ' + turCumleler.length));

        // --- Türkçe cümle (kurulacak hedef) ---
        const soruKap = el('div', 'cm-soru');
        soruKap.append(el('div', 'etiket', 'Bu cümleyi Japonca kur'));
        soruKap.append(el('div', 'tr', veri.cumle.tr));

        // Oluşturulmuş Japonca cümleyi dinle: kulak aşinalığı sağlar.
        const dinleBtn = el('button', 'sp-btn kucuk cizgili dinle', '🔊 Doğrusunu dinle');
        dinleBtn.type = 'button';
        dinleBtn.onclick = () => {
            try { if (window.Ses && Ses.oku) Ses.oku(veri.cumle.ja); } catch (e) { }
        };
        soruKap.append(dinleBtn);

        // --- Cevap şeridi ---
        cevapEl = el('div', 'cm-cevap');
        cevapEl.setAttribute('aria-label', 'Kurduğun cümle');
        cevapEl.append(el('span', 'cm-ipucu', 'Aşağıdaki parçalara sırayla dokunarak cümleyi kur'));

        // --- Kelime parçaları (karışık) ---
        const havuzKap = el('div', 'cm-havuz');
        karistir(veri.parcalar).forEach((p, idx) => {
            const b = el('button', 'cm-parca');
            b.type = 'button';
            b.setAttribute('lang', 'ja');
            const ust = el('span', '', p.ja);
            b.append(ust);
            // Türkçe ipucu: parçacıklarda yok (gramer eki), kelimelerde var.
            if (p.anlam) b.append(el('small', '', p.anlam));
            b.dataset.parca = p.ja;
            b.dataset.sira = String(idx);
            b.onclick = () => parcaSec(b, p, veri);
            havuzKap.append(b);
        });

        geriEl = el('div', 'cm-geri', '');

        const alt = el('div', 'cm-alt');
        const geriAlBtn = el('button', 'sp-btn cizgili', 'GERİ AL');
        geriAlBtn.onclick = () => { sonParcayiGeriAl(); };
        kontrolBtn = el('button', 'sp-btn', 'KONTROL ET');
        kontrolBtn.onclick = () => kontrol(veri);
        devamBtn = el('button', 'sp-btn yesil', 'DEVAM');
        devamBtn.hidden = true;
        devamBtn.onclick = () => { sira++; cumleCiz(); };
        alt.append(geriAlBtn, kontrolBtn, devamBtn);

        kok.replaceChildren(ust, soruKap, cevapEl, havuzKap, geriEl, alt);
    }

    function parcaSec(dugme, parca, veri) {
        if (dugme.classList.contains('kullanildi')) return;
        dugme.classList.add('kullanildi');
        secilenler.push({ parca: parca, dugme: dugme });

        cevapEl.classList.add('dolu');
        const ipucu = cevapEl.querySelector('.cm-ipucu');
        if (ipucu) ipucu.remove();

        // Cevap şeridine aynı görünümle ekle
        const kopya = el('span', 'cm-parca', parca.ja);
        kopya.setAttribute('lang', 'ja');
        cevapEl.append(kopya);

        void veri;
    }

    function sonParcayiGeriAl() {
        const son = secilenler.pop();
        if (!son) return;
        son.dugme.classList.remove('kullanildi');
        const cevapParcalari = cevapEl.querySelectorAll('.cm-parca');
        if (cevapParcalari.length) cevapParcalari[cevapParcalari.length - 1].remove();
        cevapEl.classList.remove('dolu', 'dogru', 'hata');
        geriEl.textContent = '';
        geriEl.className = 'cm-geri';
        if (!secilenler.length && !cevapEl.querySelector('.cm-ipucu')) {
            cevapEl.append(el('span', 'cm-ipucu', 'Aşağıdaki parçalara sırayla dokunarak cümleyi kur'));
        }
    }

    function kontrol(veri) {
        if (!secilenler.length) {
            geriEl.className = 'cm-geri hata';
            geriEl.textContent = 'Önce parçalara dokun.';
            return;
        }

        const kurulan = secilenler.map(s => s.parca.ja).join('');
        const dogruMu = kurulan === veri.cumle.ja;

        if (dogruMu) {
            cevapEl.classList.remove('dolu');
            cevapEl.classList.add('dogru');
            geriEl.className = 'cm-geri iyi';
            geriEl.textContent = '✓ ' + veri.cumle.ja + '  (' + veri.cumle.ro + ')';
            dogruSayi++;
            kurulanlar.push(veri.cumle);
            try { if (window.Ses) Ses.dogru(); } catch (e) { }
            // Okunan cümleyi dinlet: öğrenme anında ses eşleşmesi kurulsun.
            setTimeout(() => {
                try { if (window.Ses && Ses.oku) Ses.oku(veri.cumle.ja); } catch (e) { }
            }, 350);

            // Cümledeki kelimeleri deftere ekle: gerçekten okundu.
            try {
                if (window.KelimeDefteri && window.READING) {
                    veri.parcalar.forEach(p => {
                        if (!p.anlam) return;
                        const kayit = READING.SOZLUK.find(k => k.ja === p.ja);
                        if (!kayit) return;
                        KelimeDefteri.gor(kayit);
                        KelimeDefteri.cevap(kayit, true);
                    });
                }
            } catch (e) { }
        } else {
            cevapEl.classList.remove('dolu');
            cevapEl.classList.add('hata');
            geriEl.className = 'cm-geri hata';
            yanlisSayi++;
            // Japonca'da sıra farklıdır; hatanın SEBEBİNİ göster.
            geriEl.textContent = '✗ Sıralama farklı. Doğrusu: ' + veri.cumle.ja;
            try { if (window.Ses) Ses.yanlis(); } catch (e) { }
        }

        // Cevap kesinleşti: parçaları kilitle, DEVAM'ı göster.
        document.querySelectorAll('.cm-parca').forEach(b => { b.style.pointerEvents = 'none'; });
        kontrolBtn.hidden = true;
        devamBtn.hidden = false;
        devamBtn.focus();
    }

    // ---------- Tur sonu ----------
    function turBitir() {
        const toplam = dogruSayi + yanlisSayi;
        const yuzde = toplam ? Math.round(dogruSayi / toplam * 100) : 0;

        let kp = TUR_XP;
        if (yanlisSayi === 0) kp += 10;
        try { Ilerleme.xpEkle(kp); } catch (e) { }
        try { if (window.Ses) Ses.sensei('ders-bitti'); } catch (e) { }

        const kart = el('div', 'cm-sonuc');
        let simge = '🌸', baslik = 'Tur tamam!';
        if (yuzde === 100) { simge = '🏆'; baslik = 'Hepsini doğru kurdun!'; }
        else if (yuzde >= 70) { simge = '🎉'; baslik = 'Çok iyi!'; }
        else if (yuzde < 50) { simge = '💪'; baslik = 'Sıralamaya biraz daha çalışalım'; }

        kart.append(el('div', 'buyuk', simge));
        kart.append(el('h2', '', baslik));
        kart.append(el('p', '', 'Japonca cümlede yüklem sonda, ekler ortada olur.'));

        const ozet = el('div', 'cm-ozet');
        [['Doğru', dogruSayi], ['Yanlış', yanlisSayi], ['XP', '+' + kp]].forEach(([ad, d]) => {
            const k = el('div');
            k.append(el('b', '', String(d)), el('small', '', ad));
            ozet.append(k);
        });
        kart.append(ozet);

        // Kurulan cümleleri listele: turdan sonra okunacak bir liste kalır.
        if (kurulanlar.length) {
            const bas = el('p', '', 'Kurduğun cümleler');
            bas.style.cssText = 'font-weight:800;margin:0 0 10px;text-align:left;';
            kart.append(bas);
            const liste = el('div', 'cm-liste');
            kurulanlar.forEach(c => {
                const satir = el('div', 'cm-satir');
                const orta = el('div');
                orta.append(el('div', 'ja', c.ja));
                orta.append(el('div', 'alt', c.ro + ' — ' + c.tr));
                const ses = el('button', 'sp-btn kucuk cizgili', '🔊');
                ses.type = 'button';
                ses.setAttribute('aria-label', 'Cümleyi dinle');
                ses.onclick = () => {
                    try { if (window.Ses && Ses.oku) Ses.oku(c.ja); } catch (e) { }
                };
                satir.append(orta, ses);
                liste.append(satir);
            });
            kart.append(liste);
        }

        const alt = el('div', 'cm-alt');
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
