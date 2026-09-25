// ============================================================
// YAZMA ATÖLYESİ (yazma.js)
//
// NEDEN VAR: Derslerde ve dinlemede öğrenci harfi GÖRÜP seçiyor (tanıma).
// Tanıma öğrenmenin ilk adımıdır; asıl kalıcılık HATIRLAMADA olur. Bu alan
// harfi gösterip okunuşunu KLAVYEDEN yazdır — öğrencinin kendi beyninden
// cevabı üretmesi gerekir. Ders içindeki 'yaz' adımının serbest çalışma hâli.
//
// Neden ayrı sayfa? Ders 20 soruluk bir akış ve canı var; burada can yok,
// sınırsız deneme var. Öğrenci kendi hızında istediği kadar yazar.
// ============================================================
(function () {
    'use strict';

    const TUR_SORU = 12;      // tur başına soru sayısı
    const TUR_XP = 25;        // tur bitince verilen XP
    const HATA_SINIRI = 3;    // aynı harfte bu kadar yanlıştan sonra doğru cevap gösterilir

    const kok = document.getElementById('kok');

    // ---------- Yardımcılar ----------
    function el(tag, sinif, metin) {
        const e = document.createElement(tag);
        if (sinif) e.className = sinif;
        if (metin != null) e.textContent = metin;
        return e;
    }
    // Romaji karşılaştırma: büyük/küçük harf ve fazla boşluk sorun olmasın.
    // "Shi" ile "shi" aynı sayılır; "shi " de kabul edilir.
    function normalize(s) {
        return String(s || '').toLowerCase().trim().replace(/\s+/g, '');
    }

    // Öğrencinin yazdığı romaji, başka bir harfe aitse o harfi "karıştırılan"
    // olarak kaydet. Çağrı imzası Yanlis.ciftKaydet(verilenId, dogruId) şeklindedir.
    function yanlisCiftKaydet(dogruId, yazilan) {
        if (!window.Yanlis || typeof KANA === 'undefined') return;
        const y = normalize(yazilan);
        if (!y) return;
        // Yazılan romaji hangi harfe karşılık geliyor? (hiragana öncelikli)
        let verilenId = null;
        ['h', 'k'].some(function (a) {
            const aday = kanaID(a, y);
            if (KANA[aday]) { verilenId = aday; return true; }
            return false;
        });
        if (!verilenId || verilenId === dogruId) return;
        try { Yanlis.ciftKaydet(verilenId, dogruId); } catch (e) { }
    }

    // ---------- Kayıt kontrolü ----------
    if (!window.Ilerleme || !Ilerleme.isim()) { window.location.replace('index.html'); return; }

    document.getElementById('geriBtn').onclick = () => { window.location.href = 'dojo.html'; };

    // ---------- Soru havuzu ----------
    // Havuz: öğrencinin GERÇEKTEN gördüğü harfler (ilerleme kaydından).
    // Hiç kayıt yoksa hiragana temel harflerle başlar; böylece ilk gün de çalışılabilir.
    function havuzOlustur() {
        let idler = [];
        try {
            const gorulen = Ilerleme.gorulenIdler ? Ilerleme.gorulenIdler() : [];
            if (gorulen && gorulen.length) idler = gorulen.slice();
        } catch (e) { }

        // Sadece kana olanlar (kanji/karma id'leri buraya uygun değil)
        // NOT: KANA `const` olduğu için window.KANA yoktur; typeof ile bakılır.
        idler = idler.filter(id => typeof KANA !== 'undefined' && KANA[id]);

        if (idler.length < 5) {
            // Yedek: temel hiragana harfleri
            const temel = ['a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'ke', 'ko',
                'sa', 'shi', 'su', 'se', 'so', 'ta', 'chi', 'tsu', 'te', 'to'];
            idler = temel.map(r => kanaID('h', r)).filter(id => typeof KANA !== 'undefined' && KANA[id]);
        }
        return idler;
    }

    // Zayıf harfleri öne alan ağırlıklı seçim.
    // NEDEN: Rastgele soru, öğrencinin zaten bildiği harfleri tekrar tekrar sorar.
    // Zayıf harflere öncelik verilince çalışma gerçekten işe yar.
    let zayifHarita = {};
    function zayifYukle() {
        zayifHarita = {};
        try {
            (Ilerleme.zayif(50) || []).forEach(z => { zayifHarita[z.id] = z.oran; });
        } catch (e) { }
    }
    function agirlik(id) {
        const oran = zayifHarita[id] || 0;
        return 1 + oran * 4;    // %100 hatalı harf 5 kat daha sık gelir
    }
    function agirlikliSec(havuz, adet) {
        const secilen = [], kalan = havuz.slice();
        while (secilen.length < adet && kalan.length) {
            let toplam = 0;
            kalan.forEach(id => { toplam += agirlik(id); });
            let r = Math.random() * toplam, sec = kalan[0];
            for (const id of kalan) {
                r -= agirlik(id);
                if (r <= 0) { sec = id; break; }
            }
            secilen.push(sec);
            kalan.splice(kalan.indexOf(sec), 1);
        }
        return secilen;
    }

    // ---------- Tur durumu ----------
    let sorular = [], sira = 0, dogruSayi = 0, yanlisSayi = 0, seri = 0, enIyiSeri = 0;
    let harfHatalari = {};    // id -> kaç kez yanlış yapıldı (aynı turda)
    let hataliHarfler = {};   // tur sonunda gösterilecek zayıflar

    function turBaslat() {
        zayifYukle();
        const havuz = havuzOlustur();
        sorular = agirlikliSec(havuz, Math.min(TUR_SORU, havuz.length));
        sira = 0; dogruSayi = 0; yanlisSayi = 0; seri = 0; enIyiSeri = 0;
        harfHatalari = {}; hataliHarfler = {};
        soruCiz();
    }

    function guncelleSeriRozet() {
        document.getElementById('seriRozet').textContent = '🔥 ' + seri;
    }

    // ---------- Soru ekranı ----------
    let girisEl = null, geriEl = null, kontrolBtn = null, devamBtn = null, hataSayaci = 0;

    function soruCiz() {
        if (sira >= sorular.length) { turBitir(); return; }

        const id = sorular[sira];
        const e = KANA[id];
        hataSayaci = 0;

        const bar = el('div', 'yz-ust');
        const barIc = el('div', 'yz-bar');
        const barDolgu = el('div');
        barDolgu.style.width = (sira / sorular.length * 100) + '%';
        barIc.append(barDolgu);
        bar.append(barIc, el('span', 'yz-sayac', (sira + 1) + ' / ' + sorular.length));

        const kart = el('div', 'yz-kart');
        kart.append(el('div', 'yz-soru', 'Bu harfin okunuşunu yaz'));

        const harf = el('div', 'yz-harf', e.j);
        harf.setAttribute('lang', 'ja');
        kart.append(harf);

        kart.append(el('span', 'yz-tur', e.a === 'k' ? 'Katakana' : 'Hiragana'));

        // İpucu: anımsatıcı + katakana için hiragana karşılığı.
        // NOT: KANA_ANIMSATICI `const` olduğu için window üzerinde GÖRÜNMEZ;
        // varlığı typeof ile kontrol edilir (kana.js yüklenmediyse hata çıkmasın).
        const ipMetni = (function () {
            const parcalar = [];
            try {
                if (typeof KANA_ANIMSATICI !== 'undefined') {
                    const a = KANA_ANIMSATICI[e.r];
                    if (a && a.m) parcalar.push('💡 ' + a.m);
                }
            } catch (err) { }
            if (e.a === 'k' && KANA[kanaID('h', e.r)]) {
                parcalar.push('Hiragana karşılığı: ' + KANA[kanaID('h', e.r)].j);
            }
            return parcalar.join('\n');
        })();
        const ipucu = el('div', 'yz-ipucu', ipMetni);
        if (!ipMetni) ipucu.hidden = true;
        kart.append(ipucu);

        // Cevap girişi
        const girisKap = el('div', 'yz-giris-kap');
        girisEl = el('input', 'yz-giris');
        girisEl.type = 'text';
        girisEl.autocomplete = 'off';
        girisEl.autocapitalize = 'off';
        girisEl.spellcheck = false;
        girisEl.setAttribute('aria-label', 'Romaji okunuşu');
        girisEl.setAttribute('enterkeyhint', 'done');
        girisEl.placeholder = 'ör. ka';
        girisKap.append(girisEl);

        // Telefon için romaji tuş takımı: romaji klavyesi olmayan cihazlarda
        // öğrenciyi kilitlememek için harfleri tek dokunuşla ekler.
        const tuslar = el('div', 'yz-tuslar');
        ['a', 'i', 'u', 'e', 'o', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w', 'shi', 'chi', 'tsu', 'fu']
            .forEach(t => {
                const b = el('button', 'yz-tus', t);
                b.type = 'button';
                b.onclick = () => {
                    girisEl.value += t;
                    girisEl.focus();
                };
                tuslar.append(b);
            });
        girisKap.append(tuslar);

        geriEl = el('div', 'yz-geri', '');

        const alt = el('div', 'yz-alt');
        kontrolBtn = el('button', 'sp-btn', 'KONTROL ET');
        kontrolBtn.onclick = kontrol;
        devamBtn = el('button', 'sp-btn yesil', 'DEVAM');
        devamBtn.hidden = true;
        devamBtn.onclick = sonrakiSoru;
        alt.append(kontrolBtn, devamBtn);

        kok.replaceChildren(bar, kart, girisKap, geriEl, alt);

        // Enter: kontrol et, cevap açıklandıysa devam et.
        girisEl.addEventListener('keydown', ev => {
            if (ev.key !== 'Enter') return;
            ev.preventDefault();
            if (devamBtn.hidden) kontrol(); else sonrakiSoru();
        });
        setTimeout(() => girisEl.focus(), 60);
    }

    // ---------- Cevabı kontrol et ----------
    function kontrol() {
        const id = sorular[sira];
        const e = KANA[id];
        const yazilan = girisEl.value;
        const dogruMu = normalize(yazilan) === normalize(e.r);

        if (!normalize(yazilan)) {
            geriEl.className = 'yz-geri hata';
            geriEl.textContent = 'Bir şey yaz.';
            girisEl.focus();
            return;
        }

        if (dogruMu) {
            girisEl.classList.add('dogru');
            geriEl.className = 'yz-geri iyi';
            geriEl.textContent = '✓ Doğru! ' + e.j + ' = ' + e.r;
            dogruSayi++; seri++;
            if (seri > enIyiSeri) enIyiSeri = seri;
            guncelleSeriRozet();
            try { if (window.Ses) Ses.dogru(); } catch (err) { }
            // Doğru bilinen harfi ilerlemeye yaz: aralıklı tekrar takvimi işlesin.
            try { Ilerleme.cevapKaydet(id, true, { ja: e.j, ro: e.r }); } catch (err) { }
        } else {
            hataSayaci++;
            yanlisSayi++; seri = 0;
            guncelleSeriRozet();
            harfHatalari[id] = (harfHatalari[id] || 0) + 1;
            hataliHarfler[id] = true;

            girisEl.classList.add('hata');
            geriEl.className = 'yz-geri hata';

            // Hata sınırına gelene kadar öğrenciye tekrar şans ver:
            // hemen doğru cevabı söylemek öğrenmeyi bitir.
            if (hataSayaci < HATA_SINIRI) {
                geriEl.textContent = '✗ Olmadı. Tekrar dene. (' + hataSayaci + '/' + HATA_SINIRI + ')';
                try { if (window.Ses) Ses.yanlis(); } catch (err) { }
                // Yazma sorusunda "seçilen şık" yok; öğrenci bir romaji yazdı.
                // Yazdığı metin bir harfin romajisi ise o harfle karıştırma kaydı
                // tutulur (ör. し için "si" yazmak し↔す karışmasını gösterir).
                yanlisCiftKaydet(id, yazilan);
                girisEl.focus();
                girisEl.select();
                return;
            }

            geriEl.textContent = '✗ Doğrusu: ' + e.r;
            try { if (window.Ses) Ses.yanlis(); } catch (err) { }
            try { Ilerleme.cevapKaydet(id, false, { ja: e.j, ro: e.r }); } catch (err) { }
            yanlisCiftKaydet(id, yazilan);
        }

        // Cevap kesinleşti: girişi kilitle, DEVAM'ı göster.
        girisEl.disabled = true;
        kontrolBtn.hidden = true;
        devamBtn.hidden = false;
        devamBtn.focus();
    }

    function sonrakiSoru() {
        sira++;
        soruCiz();
    }

    // ---------- Tur sonu ----------
    function turBitir() {
        const toplam = dogruSayi + yanlisSayi;
        const yuzde = toplam ? Math.round(dogruSayi / toplam * 100) : 0;
        const zayifIdler = Object.keys(hataliHarfler).filter(id => KANA[id]);

        // XP: taban + başarı bonusu (hatasız tura +10)
        let kazanilanXp = TUR_XP;
        if (yanlisSayi === 0) kazanilanXp += 10;
        try { Ilerleme.xpEkle(kazanilanXp); } catch (e) { }

        try { if (window.Ses) Ses.sensei('ders-bitti'); } catch (e) { }

        const kart = el('div', 'yz-kart yz-sonuc');

        let simge = '🌸', baslik = 'Tur tamam!';
        if (yuzde === 100) { simge = '🏆'; baslik = 'Kusursuz tur!'; }
        else if (yuzde >= 80) { simge = '🎉'; baslik = 'Çok iyi!'; }
        else if (yuzde < 50) { simge = '💪'; baslik = 'Biraz daha çalışalım'; }

        kart.append(el('div', 'buyuk', simge));
        kart.append(el('h2', '', baslik));
        kart.append(el('p', '', 'Yazma alıştırması ' + sorular.length + ' harf ile tamamlandı.'));

        const ozet = el('div', 'yz-ozet');
        [['Doğru', dogruSayi], ['Yanlış', yanlisSayi], ['En iyi seri', enIyiSeri]].forEach(([ad, deger]) => {
            const k = el('div');
            k.append(el('b', '', String(deger)), el('small', '', ad));
            ozet.append(k);
        });
        kart.append(ozet);

        // Zayıf harfleri tek göster: öğrenci neyi çalışacağını bilsin.
        if (zayifIdler.length) {
            kart.append(el('p', '', 'Tekrar çalışman gereken harfler:'));
            const kap = el('div', 'yz-zayif');
            zayifIdler.slice(0, 8).forEach(id => {
                const c = el('div', 'chip');
                c.append(el('b', '', KANA[id].j), el('small', '', KANA[id].r));
                kap.append(c);
            });
            kart.append(kap);
        }

        const alt = el('div', 'yz-alt');
        const tekrar = el('button', 'sp-btn', 'YENİ TUR');
        tekrar.onclick = turBaslat;
        const zayifBtn = el('button', 'sp-btn cizgili', 'SADECE ZAYIF HARFLER');
        zayifBtn.onclick = () => { zayifTurBaslat(zayifIdler); };
        if (!zayifIdler.length) zayifBtn.hidden = true;
        alt.append(tekrar, zayifBtn);

        const don = el('div', 'yz-alt');
        const harita = el('button', 'sp-btn cizgili', 'HARİTAYA DÖN');
        harita.onclick = () => { window.location.href = 'dojo.html'; };
        don.append(harita);

        kok.replaceChildren(kart, alt, don);
        document.getElementById('seriRozet').textContent = '+' + kazanilanXp + ' XP';
    }

    // Sadece yanlış yapılan harflerle tur: hedefli çalışma.
    function zayifTurBaslat(idler) {
        if (!idler.length) return;
        sorular = idler.slice();
        sira = 0; dogruSayi = 0; yanlisSayi = 0; seri = 0; enIyiSeri = 0;
        harfHatalari = {}; hataliHarfler = {};
        soruCiz();
    }

    turBaslat();
})();
