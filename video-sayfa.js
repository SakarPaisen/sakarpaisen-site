// ============================================================
// VİDEO SAYFASI MOTORU (video-sayfa.js)
//
// video.html sayfasını çalıştırır: video listesini çizer, seçilen videoyu
// oynatıcıya yükler, "yakında" listesini gösterir.
//
// TIKLA-OYNAT (önemli tasarım kararı):
//   Sayfa açılır açılmaz YouTube iframe'i GÖMÜLMEZ. Yalnızca bir kapak
//   gösterilir; video ancak kullanıcı tıklayınca yüklenir. Böylece:
//     • Sayfa ilk açılışta hiçbir dış istek yapmaz (analitik/reklam ile aynı ilke)
//     • Offline'da sayfa yine açılır, sadece video çalmaz
//     • Çerez/izleme, kullanıcı istemeden başlamaz
//   Gömme adresi youtube-nocookie.com: YouTube'un çerezsiz alan adı.
// ============================================================
(function () {
    'use strict';

    const oynatici = document.getElementById('oynatici');
    const bilgiKap = document.getElementById('bilgi');
    const listeKap = document.getElementById('liste');
    const cagriKap = document.getElementById('cagri');
    const yakindaKap = document.getElementById('yakinda');
    const yakindaListe = document.getElementById('yakindaListe');

    function el(tag, sinif, metin) {
        const e = document.createElement(tag);
        if (sinif) e.className = sinif;
        if (metin != null) e.textContent = metin;
        return e;
    }

    // Video verisi yüklü mü? Yüklenmediyse sayfa boş kalmasın.
    if (!window.VIDEO || !VIDEO.VIDEOLAR) {
        oynatici.replaceChildren(el('div', 'vd-kapak-yazi', 'Video listesi yüklenemedi.'));
        return;
    }

    const VIDEOLAR = VIDEO.VIDEOLAR;
    const BOLUMLAR = VIDEO.BOLUMLAR || [];
    const KANAL = VIDEO.KANAL || { ad: 'Kanal', url: '#' };
    let seciliKimlik = '';

    // ---------- İZLEME TAKİBİ ----------
    // Hangi videolar izlendi? localStorage'da tutulur.
    //
    // NEDEN GEREKLİ: Video izlemek de öğrenmedir ama ders motorunun dışında
    // kalıyor. Kayıt olmadan kullanıcı hangi videoyu izlediğini hatırlamıyor
    // ve aynı videoyu tekrar açıyordu.
    //
    // ÖNEMLİ: Ilerleme modülüne YAZMIYORUZ — orası harf bazlı ilerleme tutuyor
    // ve video izlemek oraya karışırsa "zayıf harf" hesabı bozulur.
    // Kendi anahtarımızı kullanıyoruz; ilerleme sıfırlansa bile video geçmişi
    // kalır (Ayarlar > sıfırla yalnızca sakar_* ilerleme anahtarlarını siler).
    const IZLEME_ANAHTAR = 'sakar_video_izlenen';

    function izlenenlerOku() {
        try {
            const ham = localStorage.getItem(IZLEME_ANAHTAR);
            if (!ham) return {};
            const nesne = JSON.parse(ham);
            return (nesne && typeof nesne === 'object') ? nesne : {};
        } catch (e) { return {}; }
    }
    function izlendiMi(video) {
        const h = izlenenlerOku();
        // Kimlik farklı biçimde kaydedilmişse de bulunsun
        return !!(h[video.id] || h[VIDEO.videoKimligi(video.id)]);
    }
    function izlendiIsaretle(video) {
        const h = izlenenlerOku();
        const anahtar = VIDEO.videoKimligi(video.id) || video.id;

        if (h[anahtar]) return false;   // zaten işaretli: XP tekrar verilmez

        h[anahtar] = { tarih: new Date().toISOString().slice(0, 10) };
        try { localStorage.setItem(IZLEME_ANAHTAR, JSON.stringify(h)); } catch (e) { }

        // Video izlemek de emek: küçük bir XP verilir (ilerleme.js üzerinden).
        // Böylece günlük hedef ve seri de beslenir.
        try { if (window.Ilerleme && Ilerleme.xpEkle) Ilerleme.xpEkle(15); } catch (e) { }
        // Günlük görev sayacı (gorevler.js varsa)
        try { if (window.Gorevler && Gorevler.videoIzle) Gorevler.videoIzle(); } catch (e) { }
        // Başarım kontrolü
        try { if (window.Basarimlar && Basarimlar.kontrol) Basarimlar.kontrol(); } catch (e) { }
        try { if (window.Ses) Ses.hedefTamam(); } catch (e) { }
        return true;
    }

    document.getElementById('geriBtn').onclick = function () {
        // Nereden gelindiğini bilmiyoruz; dojo güvenli varsayılan.
        window.location.href = 'dojo.html';
    };

    // ---------- Oynatıcıyı kur (kapak göster) ----------
    // Kapak, videonun başlığını ve büyük bir oynat düğmesi gösterir.
    function kapakGoster(video) {
        oynatici.replaceChildren();
        const kapak = el('button', 'vd-kapak');
        kapak.type = 'button';
        kapak.setAttribute('aria-label', video.baslik + ' videosunu oynat');

        kapak.append(el('span', 'vd-oynat', '▶'));
        kapak.append(el('span', 'vd-kapak-yazi', 'Videoyu oynat'));
        kapak.onclick = function () { videoOynat(video); };
        oynatici.append(kapak);
    }

    // ---------- Videoyu gerçekten yükle ----------
    // Dış istek SADECE burada, kullanıcı tıklayınca yapılır.
    function videoOynat(video) {
        const kimlik = VIDEO.videoKimligi(video.id);
        if (!kimlik) {
            oynatici.replaceChildren(el('div', 'vd-kapak-yazi', 'Bu videonun bağlantısı geçersiz.'));
            return;
        }

        const iframe = document.createElement('iframe');
        // youtube-nocookie: çerezsiz alan adı
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + kimlik +
            '?autoplay=1&rel=0&modestbranding=1';
        iframe.title = video.baslik;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        // referrerpolicy: hangi sayfadan gelindiği bilgisi sızmasın
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';

        oynatici.replaceChildren(iframe);
    }

    // ---------- Bilgi kutusu ----------
    function bilgiCiz(video) {
        bilgiKap.replaceChildren();

        bilgiKap.append(el('h2', '', video.baslik));

        if (video.aciklama) {
            bilgiKap.append(el('p', 'vd-acik', video.aciklama));
        }

        // Etiketler: bölüm, zorluk, ek etiket
        const etiketler = el('div', 'vd-etiketler');
        if (video.bolum) etiketler.append(el('span', 'vd-etiket mor', video.bolum));
        if (video.sure) etiketler.append(el('span', 'vd-etiket', '📊 ' + video.sure));
        if (video.etiket) etiketler.append(el('span', 'vd-etiket', video.etiket));
        bilgiKap.append(etiketler);

        // Eylemler: ilgili ders + YouTube'da aç
        const alt = el('div', 'vd-alt');

        if (video.ders && video.ders.url) {
            const dersBtn = el('button', 'sp-btn', '📚 ' + (video.ders.ad || 'İlgili ders'));
            dersBtn.onclick = function () { window.location.href = video.ders.url; };
            alt.append(dersBtn);
        }

        const ytBtn = el('a', 'sp-btn cizgili', '▶ YouTube\'da aç');
        ytBtn.href = 'https://youtu.be/' + VIDEO.videoKimligi(video.id);
        ytBtn.target = '_blank';
        ytBtn.rel = 'noopener';
        alt.append(ytBtn);

        bilgiKap.append(alt);

        // --- İZLEDİM ---
        // Kullanıcı videoyu bitirince işaretler. İşaretlenince küçük XP verilir
        // ve video kartında "İZLENDİ" rozeti çıkar.
        const izleSatir = el('div', 'vd-izle');
        const izlendiVar = izlendiMi(video);

        const izleBtn = el('button', 'vd-izle-btn' + (izlendiVar ? ' tamam' : ''),
            izlendiVar ? '✓ İzledim' : '✓ İzledim olarak işaretle');
        izleBtn.type = 'button';
        if (izlendiVar) {
            izleBtn.disabled = true;
        } else {
            izleBtn.onclick = function () {
                const yeni = izlendiIsaretle(video);
                if (yeni) {
                    izleBtn.textContent = '✓ İzledim';
                    izleBtn.classList.add('tamam');
                    izleBtn.disabled = true;
                    izleSatir.append(el('span', 'vd-izle-not', '+15 XP · İlerlemene eklendi'));
                    listeCiz();    // kartlardaki rozet güncellensin
                }
            };
        }
        izleSatir.append(izleBtn);

        if (!izlendiVar) {
            izleSatir.append(el('span', 'vd-izle-not',
                'İzleyip bitirdiysen işaretle: ilerlemene sayılır.'));
        }
        bilgiKap.append(izleSatir);
    }

    // ---------- Kanal çağrısı ----------
    // Kanal bağlantısı video.js'ten gelir; elle yazılmaz.
    function kanalCiz() {
        const alan = document.getElementById('kanalAlan');
        if (!alan) return;
        alan.replaceChildren();

        const ad = el('span', 'kanal-ad', '📺 ' + KANAL.ad);
        alan.append(ad);

        const git = el('a', 'sp-btn cizgili', 'Kanala git');
        git.href = KANAL.url;
        git.target = '_blank';
        git.rel = 'noopener';
        alan.append(git);

        const abone = el('a', 'vd-abone', '🔔 Abone ol');
        abone.href = KANAL.aboneUrl || KANAL.url;
        abone.target = '_blank';
        abone.rel = 'noopener';
        alan.append(abone);
    }

    // ---------- Video listesi (bölümlere göre) ----------
    function listeCiz() {
        listeKap.replaceChildren();

        if (!VIDEOLAR.length) {
            cagriKap.hidden = false;
            return;
        }
        cagriKap.hidden = false;

        // Videoları bölümlerine göre grupla. Hiç videosu olmayan bölüm GÖSTERİLMEZ
        // (boş başlık kalmasın).
        const gruplar = {};
        VIDEOLAR.forEach(function (v) {
            const b = v.bolum || 'Diğer';
            if (!gruplar[b]) gruplar[b] = [];
            gruplar[b].push(v);
        });

        // BOLUMLAR sırasına uy; listede olmayan bölüm varsa sona ekle.
        const sirali = BOLUMLAR.map(function (b) { return b.ad; })
            .filter(function (ad) { return gruplar[ad]; });
        Object.keys(gruplar).forEach(function (ad) {
            if (sirali.indexOf(ad) === -1) sirali.push(ad);
        });

        sirali.forEach(function (bolumAdi) {
            const bolum = el('div', 'vd-bolum');
            const bilgi = BOLUMLAR.find(function (b) { return b.ad === bolumAdi; });
            const h = el('h3', '', (bilgi && bilgi.simge ? bilgi.simge + ' ' : '') + bolumAdi);
            bolum.append(h);

            const liste = el('div', 'vd-liste');
            gruplar[bolumAdi].forEach(function (v) {
                liste.append(videoKarti(v));
            });
            bolum.append(liste);
            listeKap.append(bolum);
        });
    }

    function videoKarti(video) {
        const kart = el('button', 'vd-kart' + (video.id === seciliKimlik ? ' secili' : ''));
        kart.type = 'button';

        // Küçük kapak: YouTube küçük resmi YERİNE yerel bir yer tutucu kullanılıyor.
        // Neden: YouTube küçük resmi de bir dış istek; tıkla-oynat ilkesini bozar.
        const kapak = el('div', 'k-kapak', '🎬');
        if (izlendiMi(video)) kapak.append(el('span', 'k-izlendi', '✓ İZLENDİ'));
        if (video.sure) kapak.append(el('span', 'k-sure', video.sure));
        kart.append(kapak);

        const govde = el('div', 'k-govde');
        govde.append(el('span', 'k-ad', video.baslik));
        if (video.aciklama) govde.append(el('span', 'k-acik', video.aciklama));
        kart.append(govde);

        kart.onclick = function () {
            seciliKimlik = video.id;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            kapakGoster(video);
            bilgiCiz(video);
            // Seçili kartı işaretle (kartlar yeniden çizilmeden sınıf güncellenir)
            listeKap.querySelectorAll('.vd-kart').forEach(function (k) { k.classList.remove('secili'); });
            kart.classList.add('secili');
        };

        return kart;
    }

    // ---------- Yakında listesi ----------
    function yakindaCiz() {
        if (!VIDEO.YAKINDA || !VIDEO.YAKINDA.length) return;
        yakindaKap.hidden = false;
        yakindaListe.replaceChildren();

        VIDEO.YAKINDA.forEach(function (o) {
            const satir = el('div', 'vd-yakinda-satir');
            const bilgi = BOLUMLAR.find(function (b) { return b.ad === o.bolum; });
            satir.append(el('span', 'y-simge', (bilgi && bilgi.simge) || '🎬'));
            const orta = el('div');
            orta.append(el('b', '', o.baslik));
            if (o.aciklama) orta.append(el('small', '', o.aciklama));
            satir.append(orta);
            yakindaListe.append(satir);
        });
    }

    // ---------- Açılış ----------
    // İlk videoyu otomatik seç: sayfa boş bir oynatıcıyla açılmasın.
    if (VIDEOLAR.length) {
        seciliKimlik = VIDEOLAR[0].id;
        kapakGoster(VIDEOLAR[0]);
        bilgiCiz(VIDEOLAR[0]);
    }
    listeCiz();
    yakindaCiz();
    kanalCiz();
})();