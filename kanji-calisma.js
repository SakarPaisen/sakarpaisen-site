// ============================================================
// KANJI ÇALIŞMA (kanji-calisma.js)
//
// NE BURASI: Ders akışından BAĞIMSIZ kanji kütüphanesi. Dojo haritasında
// ilerlemek zorunda değilsin; burada tüm kanjileri tek bakışta görür,
// istediğine tıklayıp anlam + okunuş + örnek kelimeyi incelersin.
//
// NEDEN AYRI ALAN: Dersler kanjiyi "sırayla öğret + hemen sına" ritmiyle verir.
// Bu da öğrencinin tekrar bakmak istediği bir kanjiyi bulmasını zorlaştırır
// (hangi dersteydi?). Burada arama var, süzgeç var, kart çalışması var.
//
// İki çalışma modu:
//   1) KÜTÜPHANE : ızgaradan kanji seç -> detay paneli (serbest inceleme)
//   2) KART ÇALIŞ : bilinmeyen/zayıf kanjilerle hızlı soru-cevap turu
//   DİKKAT: Kural 1, SAYFA SCRIPT'LERİNİN EN BAŞINDA çalışmalı. Aksi hâlde
//   önce ağır script'ler (kana.js, reading.js, kanji.js...) indirilir ve
//   kullanıcı boş bir kütüphane ekranına bakar; üstelik sayfa her açılışta
//   birkaç yüz KB boşuna indirir. Bu yüzden kontrol "erken" sürümü olarak
//   tüm script'lerden ÖNCE kurulur; alttaki asıl kontrol yedek olarak kalır.
// ============================================================
(function () {
    'use strict';

    const kok = document.getElementById('izgara');
    const gruplarKap = document.getElementById('gruplar');

    // Erken yönlendirme: çağrısı index.html'de script'lerden ÖNCE kurulur
    // (bkz. dosya başındaki not). Ilerleme henüz yüklenmediyse hiçbir şey
    // yapmaz; ama yüklüyse sayfa ağır script'leri indirmeden geri döner.
    window.__kanjiErkenYonlendir = function () {
        try {
            if (window.Ilerleme && Ilerleme.isim()) return;
        } catch (e) { return; }
        window.location.replace('index.html');
    };
    const aramaKutu = document.getElementById('arama');
    const sayacEl = document.getElementById('sayac');
    const perde = document.getElementById('perde');
    const detay = document.getElementById('detay');

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
    if (!window.KANJI || typeof KANJILER === 'undefined') { window.location.replace('dojo.html'); return; }

    document.getElementById('geriBtn').onclick = () => { window.location.href = 'dojo.html'; };

    // ---------- Grup adları (müfredattaki kanjiGrup anahtarları) ----------
    // DİKKAT: kanji.js grupları numaralı varyantlar hâlinde tutuyor
    // (sayilar + sayilar2, gunler + gunler2 ...). Hepsi burada etiketlenir;
    // yeni bir grup eklenirse etiket uydurulur, alan bozulmaz.
    const GRUP_ADLARI = {
        sayilar: '🔢 Sayılar 1-5',
        sayilar2: '🔢 Sayılar 6-10',
        gunler: '📅 Günler ve Zaman 1',
        gunler2: '📅 Günler ve Zaman 2',
        insan: '👤 İnsan ve Aile 1',
        insan2: '👤 İnsan ve Aile 2',
        doga: '🌿 Doğa 1',
        doga2: '🌿 Doğa 2',
        yon: '🧭 Yön ve Konum 1',
        yon2: '🧭 Yön ve Konum 2',
        okul: '🏫 Okul ve Öğrenme',
        okul2: '🏫 Okul ve Öğrenme 2',
        yemek: '🍚 Yemek ve İçmek',
        yemek2: '🍚 Yemek ve İçmek 2',
        miktar: '📏 Miktar ve Ölçü',
        miktar2: '📏 Miktar ve Ölçü 2',
        eylem: '🏃 Eylemler',
        eylem2: '🏃 Eylemler 2',
        hepsi: '🌐 Tümü'
    };

    // Grup anahtarını okunabilir etikete çevir.
    // "sayilar2" gibi bilinmeyen bir anahtar gelirse başlık büyütülüp gösterilir;
    // alan yeni grup eklendiğinde de çalışmaya devam eder.
    function grupEtiketi(g) {
        if (GRUP_ADLARI[g]) return GRUP_ADLARI[g];
        const temel = String(g).replace(/[0-9]+$/, '');
        const ek = String(g).match(/([0-9]+)$/);
        const ad = GRUP_ADLARI[temel] || temel;
        return ek ? ad + ' ' + ek[1] : ad;
    }

    // Kanjilerde geçen grup anahtarlarını topla (hepsi hariç: o zaten süzgeçsiz)
    function grupListesi() {
        const kume = [];
        KANJILER.forEach(k => {
            if (k.grup && kume.indexOf(k.grup) === -1) kume.push(k.grup);
        });
        return kume;
    }

    // ---------- Durum okuma ----------
    // kanji.js ilerlemeyi localStorage'da tutar; window.KANJI.durumlar() ile
    // öğrenilen kanjilerin kutu/doğru/yanlış bilgisi alınır.
    function durumHaritasi() {
        const harita = {};
        try {
            (KANJI.durumlar() || []).forEach(d => { harita[d.kanji.k] = d; });
        } catch (e) { }
        return harita;
    }

    // Bir kanjinin görünecek durumunu belirle: yeni / öğrenildi / tekrar / zor.
    // "Tekrar zamanı" hesabı kanji.js'teki aralıklı tekrar kutusuna dayanır.
    function durumBul(k, durum) {
        if (!durum) return { sinif: 'yeni', yazi: 'YENİ' };
        const toplam = (durum.d || 0) + (durum.y || 0);
        if (toplam > 0 && durum.oran < 0.6) return { sinif: 'zor', yazi: 'ZOR' };
        if (durum.kutu >= 3) return { sinif: 'ogrenildi', yazi: 'ÖĞRENİLDİ' };
        if (durum.kutu >= 1) return { sinif: 'tekrar', yazi: 'TEKRAR' };
        return { sinif: 'yeni', yazi: 'YENİ' };
    }

    // ---------- Süzgeç durumu ----------
    let aktifGrup = 'hepsi';
    let aramaMetni = '';

    function suzulmus() {
        const d = durumHaritasi();
        const aranan = aramaMetni.trim().toLowerCase();
        return KANJILER.filter(k => {
            if (aktifGrup !== 'hepsi' && k.grup !== aktifGrup) return false;
            if (!aranan) return true;
            // Kanji, anlam, kun okunuşu veya on okunuşu içinde ara
            return (k.k || '').indexOf(aranan) > -1
                || (k.tr || '').toLowerCase().indexOf(aranan) > -1
                || (k.kun || '').indexOf(aranan) > -1
                || (k.on || '').toLowerCase().indexOf(aranan) > -1;
        }).map(k => ({ kanji: k, durum: d[k.k] || null }));
    }

    // ---------- Grup düğmeleri ----------
    function gruplariCiz() {
        gruplarKap.replaceChildren();
        const hepsiBtn = el('button', 'kj-grup' + (aktifGrup === 'hepsi' ? ' aktif' : ''), GRUP_ADLARI.hepsi);
        hepsiBtn.type = 'button';
        hepsiBtn.onclick = () => { aktifGrup = 'hepsi'; gruplariCiz(); izgaraCiz(); };
        gruplarKap.append(hepsiBtn);

        grupListesi().forEach(g => {
            const b = el('button', 'kj-grup' + (aktifGrup === g ? ' aktif' : ''), grupEtiketi(g));
            b.type = 'button';
            b.setAttribute('role', 'tab');
            b.setAttribute('aria-selected', aktifGrup === g ? 'true' : 'false');
            b.onclick = () => { aktifGrup = g; gruplariCiz(); izgaraCiz(); };
            gruplarKap.append(b);
        });
    }

    // ---------- Izgara ----------
    function izgaraCiz() {
        const liste = suzulmus();
        kok.replaceChildren();

        if (!liste.length) {
            const bos = el('div', 'kj-bos');
            bos.append(el('div', 'buyuk', '🔍'));
            bos.append(el('h2', '', 'Sonuç yok'));
            bos.append(el('p', '', 'Bu süzgeçte kanji bulunamadı. Aramayı temizleyip tekrar dene.'));
            kok.append(bos);
            sayacEl.textContent = '';
            return;
        }

        const durum = durumHaritasi();
        const ogrenilen = Object.keys(durum).length;
        sayacEl.textContent = liste.length + ' kanji gösteriliyor · ' + ogrenilen + ' tanesi öğrenildi';

        liste.forEach(({ kanji, durum: d }) => {
            const kart = el('button', 'kj-kart');
            kart.type = 'button';
            kart.setAttribute('aria-label', kanji.k + ' — ' + kanji.tr);
            kart.append(el('div', 'harf', kanji.k));
            kart.append(el('div', 'anlam', kanji.tr));
            // Okunuş kısaltması: kun varsa kun, yoksa on
            const oku = kanji.kun || kanji.on || '';
            kart.append(el('div', 'oku', oku));
            const db = durumBul(kanji, d);
            kart.append(el('span', 'durum ' + db.sinif, db.yazi));
            kart.onclick = () => detayAc(kanji, d);
            kok.append(kart);
        });
    }

    aramaKutu.addEventListener('input', () => {
        aramaMetni = aramaKutu.value;
        izgaraCiz();
    });

    // ---------- Detay paneli ----------
    function detayAc(kanji, d) {
        detay.replaceChildren();

        const kapat = el('button', 'kj-kapat', '✕');
        kapat.type = 'button';
        kapat.setAttribute('aria-label', 'Kapat');
        kapat.onclick = () => { perde.hidden = true; };
        detay.append(kapat);

        detay.append(el('div', 'harf-buyuk', kanji.k));
        detay.append(el('div', 'anlam-buyuk', kanji.tr));

        // Okunuşlar: kun (Japonca) ve on (Çince kökenli) ayrı satırlarda.
        // NEDEN AYRI: Aynı kanji okunuşa göre farklı söylenir; birleştirmek
        // öğrenciye "iki farklı okunuş var" bilgisini kaybettirir.
        if (kanji.kun) {
            const s = el('div', 'kj-satir');
            s.append(el('span', 'etiket', 'Kun’yomi'), el('span', 'deger', kanji.kun));
            detay.append(s);
        }
        if (kanji.on) {
            const s = el('div', 'kj-satir');
            s.append(el('span', 'etiket', 'On’yomi'), el('span', 'deger', kanji.on));
            detay.append(s);
        }

        // Örnek kelime: kanjinin gerçekten kullanıldığı yer.
        if (kanji.ornek && kanji.ornek.ja) {
            const o = el('div', 'kj-ornek');
            o.append(el('div', 'ja', kanji.ornek.ja));
            if (kanji.ornek.ro) o.append(el('div', 'ro', kanji.ornek.ro));
            if (kanji.ornek.tr) o.append(el('div', 'tr', kanji.ornek.tr));
            // Örnek kelimeyi dinle: harf harf değil, kelime olarak okunur.
            const sesBtn = el('button', 'sp-btn kucuk cizgili', '🔊 Dinle');
            sesBtn.type = 'button';
            sesBtn.style.marginTop = '10px';
            sesBtn.onclick = () => {
                try { if (window.Ses && Ses.oku) Ses.oku(kanji.ornek.ja); } catch (e) { }
            };
            o.append(sesBtn);
            detay.append(o);
        }

        // İlerleme durumu: kaç kez doğru/yanlış, hangi tekrar kutusunda.
        const ist = el('div', 'kj-istat');
        const dogru = d ? (d.d || 0) : 0;
        const yanlis = d ? (d.y || 0) : 0;
        const kutu = d ? (d.kutu || 0) : 0;
        [['Doğru', dogru], ['Yanlış', yanlis], ['Tekrar kutusu', kutu]].forEach(([ad, deger]) => {
            const k = el('div');
            k.append(el('b', '', String(deger)), el('small', '', ad));
            ist.append(k);
        });
        detay.append(ist);

        // Eylemler: sadece bu kanjiyi soran tek soruluk kart çalışması
        const alt = el('div', 'kj-alt');
        const tekCal = el('button', 'sp-btn', 'BU KANJİYİ ÇALIŞ');
        tekCal.onclick = () => { perde.hidden = true; kartTurBaslat([kanji], 3); };
        const kapatBtn = el('button', 'sp-btn cizgili', 'KAPAT');
        kapatBtn.onclick = () => { perde.hidden = true; };
        alt.append(tekCal, kapatBtn);
        detay.append(alt);

        perde.hidden = false;
        kapat.focus();
    }

    // Perdeye tıklayınca (panel dışı) kapat
    perde.addEventListener('click', e => { if (e.target === perde) perde.hidden = true; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') perde.hidden = true; });

    // ---------- KART ÇALIŞMASI ----------
    // Kütüphaneden bağımsız hızlı soru-cevap turu. Amaç: kanjiyi görmek değil,
    // anlamını/okunuşunu HATIRLAMAK. Karışık soru tipi kullanılır:
    //   1) kanji -> Türkçe anlam
    //   2) kanji -> okunuş
    //   3) Türkçe anlam -> kanji
    let turSorular = [], turSira = 0, turDogru = 0, turYanlis = 0;

    function soruUret(kanji, tip) {
        const dogru = tip === 'anlam' ? kanji.tr : (tip === 'okunus' ? (kanji.kun || kanji.on || '—') : kanji.k);
        let yanlislar = [];

        if (tip === 'anlam') {
            yanlislar = karistir(KANJILER.filter(k => k.tr !== kanji.tr)).slice(0, 3).map(k => k.tr);
        } else if (tip === 'okunus') {
            // Yanlış okunuşlar: aynı okunuşu tekrar verme
            const havuz = karistir(KANJILER.filter(k => k.k !== kanji.k))
                .map(k => k.kun || k.on)
                .filter(Boolean);
            const gorulen = { [dogru]: true };
            for (const o of havuz) {
                if (yanlislar.length >= 3) break;
                if (gorulen[o]) continue;
                gorulen[o] = true;
                yanlislar.push(o);
            }
        } else {
            yanlislar = karistir(KANJILER.filter(k => k.k !== kanji.k)).slice(0, 3).map(k => k.k);
        }

        if (yanlislar.length < 2) return null;
        return { kanji, tip, dogru, siklar: karistir([dogru].concat(yanlislar)) };
    }

    function kartTurBaslat(kanjiler, soruPerKanji) {
        const tipSira = ['anlam', 'okunus', 'ters'];
        turSorular = [];
        kanjiler.forEach(k => {
            const adet = soruPerKanji || 3;
            for (let i = 0; i < adet; i++) {
                const s = soruUret(k, tipSira[i % tipSira.length]);
                if (s) turSorular.push(s);
            }
        });
        turSorular = karistir(turSorular);
        if (!turSorular.length) return;
        turSira = 0; turDogru = 0; turYanlis = 0;
        kartSoruCiz();
    }

    function kartSoruCiz() {
        if (turSira >= turSorular.length) { kartTurBitir(); return; }

        const s = turSorular[turSira];
        perde.hidden = false;
        detay.replaceChildren();

        // Üst: kaçıncı soru
        const ust = el('div', 'kj-sayac');
        ust.style.cssText = 'text-align:center;margin-bottom:12px;';
        ust.textContent = 'Kart ' + (turSira + 1) + ' / ' + turSorular.length;
        detay.append(ust);

        // Soru metni
        if (s.tip === 'anlam') {
            detay.append(el('div', 'harf-buyuk', s.kanji.k));
            detay.append(el('div', 'anlam-buyuk', 'Bu kanjinin anlamı ne?'));
        } else if (s.tip === 'okunus') {
            detay.append(el('div', 'harf-buyuk', s.kanji.k));
            detay.append(el('div', 'anlam-buyuk', 'Okunuşu hangisi?'));
        } else {
            detay.append(el('div', 'anlam-buyuk', s.kanji.tr));
            detay.append(el('div', 'anlam-buyuk', 'Bu anlamın kanjisi hangisi?'));
            detay.append(el('div', 'harf-buyuk', '？'));
        }

        // Şıklar
        const sikKap = el('div');
        sikKap.style.cssText = 'display:flex;flex-direction:column;gap:9px;margin-top:18px;';
        s.siklar.forEach(sik => {
            const b = el('button', 'sp-btn cizgili');
            b.type = 'button';
            b.style.textTransform = 'none';
            b.style.fontSize = (s.tip === 'ters') ? '26px' : '16px';
            b.textContent = sik;
            b.onclick = () => kartCevap(s, sik, b, sikKap);
            sikKap.append(b);
        });
        detay.append(sikKap);

        // Turdan çıkma
        const cik = el('button', 'sp-btn kucuk cizgili', 'Turdan çık');
        cik.type = 'button';
        cik.style.cssText = 'display:block;margin:18px auto 0;';
        cik.onclick = () => { perde.hidden = true; };
        detay.append(cik);
    }

    function kartCevap(s, verilen, dugme, sikKap) {
        const dogruMu = verilen === s.dogru;
        // Şıkları kilitle (çift cevap olmasın)
        sikKap.querySelectorAll('button').forEach(b => { b.disabled = true; });

        if (dogruMu) {
            turDogru++;
            dugme.className = 'sp-btn yesil';
            try { if (window.Ses) Ses.dogru(); } catch (e) { }
        } else {
            turYanlis++;
            dugme.className = 'sp-btn kirmizi';
            // Doğru şıkkı yeşil göster
            sikKap.querySelectorAll('button').forEach(b => {
                if (b.textContent === s.dogru) b.className = 'sp-btn yesil';
            });
            try { if (window.Ses) Ses.yanlis(); } catch (e) { }
        }

        // Kanji ilerlemesine yaz: aralıklı tekrar takvimi işlesin.
        // NEDEN: Bu alan dersin dışında ama öğrenme aynı havuza sayılmalı;
        // yoksa burada çalışılan kanji derste "hiç görülmemiş" sayılırdı.
        try { KANJI.ogretildi(s.kanji); } catch (e) { }
        try { KANJI.cevap(s.kanji, dogruMu); } catch (e) { }

        // Kısa bir gecikme sonra sonraki soru (öğrenci doğru cevabı görsün)
        setTimeout(() => {
            turSira++;
            kartSoruCiz();
        }, dogruMu ? 600 : 1300);
    }

    function kartTurBitir() {
        const toplam = turDogru + turYanlis;
        const yuzde = toplam ? Math.round(turDogru / toplam * 100) : 0;

        // XP: tur başına 20; hatasız turda +10 bonus
        let kp = 20;
        if (turYanlis === 0) kp += 10;
        try { Ilerleme.xpEkle(kp); } catch (e) { }
        try { if (window.Ses) Ses.sensei('tekrar-bitti'); } catch (e) { }

        perde.hidden = false;
        detay.replaceChildren();

        const sonuc = el('div', '', '');
        sonuc.style.textAlign = 'center';
        let simge = '🌸', baslik = 'Kart turu bitti!';
        if (yuzde === 100) { simge = '🏆'; baslik = 'Kusursuz!'; }
        else if (yuzde >= 70) { simge = '🎉'; baslik = 'İyi gidiyorsun!'; }
        else if (yuzde < 40) { simge = '💪'; baslik = 'Biraz daha çalışalım'; }

        const buyuk = el('div', '', simge);
        buyuk.style.cssText = 'font-size:60px;line-height:1;';
        sonuc.append(buyuk);
        const h = el('h2', '', baslik);
        h.style.margin = '12px 0 6px';
        sonuc.append(h);

        const ist = el('div', 'kj-istat');
        [['Doğru', turDogru], ['Yanlış', turYanlis], ['XP', '+' + kp]].forEach(([ad, deger]) => {
            const k = el('div');
            k.append(el('b', '', String(deger)), el('small', '', ad));
            ist.append(k);
        });
        sonuc.append(ist);

        const alt = el('div', 'kj-alt');
        const tekrar = el('button', 'sp-btn', 'TEKRAR ÇALIŞ');
        tekrar.onclick = () => { kartTurBaslat(turSorular.map(s => s.kanji), 3); };
        const kapatBtn = el('button', 'sp-btn cizgili', 'KÜTÜPHANEYE DÖN');
        kapatBtn.onclick = () => { perde.hidden = true; izgaraCiz(); };
        alt.append(tekrar, kapatBtn);

        detay.append(sonuc, alt);
        izgaraCiz();   // durum rozetleri güncellensin
    }

    // "Kart çalış" düğmesi: henüz öğrenilmemiş veya zayıf kanjilerle tur.
    // NEDEN BÖYLE: Bilinen kanjileri tekrar sormak zaman kaybı; önce eksikler.
    document.getElementById('falBtn').onclick = () => {
        const d = durumHaritasi();
        const eksik = KANJILER.filter(k => !d[k.k]);
        const zayif = KANJILER.filter(k => d[k.k] && ((d[k.k].d + d[k.k].y) > 0) && (d[k.k].oran < 0.6));

        let secilecek = zayif.concat(eksik);
        if (!secilecek.length) secilecek = KANJILER.slice();   // her şey öğrenildiyse hepsi

        kartTurBaslat(karistir(secilecek).slice(0, 6), 3);
    };

    // ---------- Açılış ----------
    gruplariCiz();
    izgaraCiz();

    // Üst rozet: kaç kanji öğrenildi / toplam
    try {
        const ogrenilen = (KANJI.durumlar() || []).length;
        document.getElementById('ogrenilenRozet').textContent = ogrenilen + ' / ' + KANJILER.length;
    } catch (e) { }
})();
