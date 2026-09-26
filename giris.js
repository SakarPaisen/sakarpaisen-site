// ============================================================
// GİRİŞ (giris.js) : index.html'in giriş ekranı motoru
//
// Akış iki modda çalışır:
//   1) NORMAL MOD (canlı site) : "Google ile devam et" -> gerçek Google girişi.
//   2) TEST MODU              : giriş ekranı gösterilmez, doğrudan dojo açılır.
//
// Google Client ID girildiği an normal mod kendiliğinden devreye girer,
// index.html'de başka hiçbir şeyi değiştirmen gerekmez.
// ------------------------------------------------------------
// GOOGLE GİRİŞİNİ AÇMA (tek seferlik, 5 dakika):
//   1. https://console.cloud.google.com/apis/credentials adresine git.
//   2. "Kimlik bilgileri oluştur" -> "OAuth istemci kimliği" -> Web uygulaması.
//   3. "Yetkili JavaScript kaynakları"na şu adresleri ekle:
//        https://sakarpaisen.com
//        https://www.sakarpaisen.com
//        http://localhost:8000          (yerelde denemek için)
//   4. Sana verilen istemci kimliğini (xxxx.apps.googleusercontent.com)
//      aşağıdaki GOOGLE_CLIENT_ID satırına yapıştır. Bitti.
// ------------------------------------------------------------
// Kullanıcı adı/e-postası yine localStorage'da "sakar_isim" olarak tutulur,
// böylece dojo.html, oyun.html ve ilerleme.js hiç değişmeden çalışır.
// ============================================================
(function () {
    'use strict';

    // ---------- AYARLAR ----------
    // Google istemci kimliğini buraya yaz. Kod değiştirmen gerekmez; doldurduğun an
    // giriş ekranı "Google ile devam et" moduna geçer.
    // Örnek: '1234567890-abcdefg.apps.googleusercontent.com'
    const GOOGLE_CLIENT_ID = '919231297764-b42ipapn40a8v16201gtqt1eoljm6s4l.apps.googleusercontent.com';
    // Google Cloud Console'da bu origini birebir yetkilendir:
    // https://sakarpaisen.com ve https://www.sakarpaisen.com
    // Yerel test: kullandığın port hangisiyse (örn. http://localhost:5500) onu da ekle.
    const TEST_MODU = false;              // test için true: giriş istenmez, dojo açılır
    const GOOGLE_ILE_GIRIS = !!GOOGLE_CLIENT_ID && !TEST_MODU;
    const DOJO_ADRESI = 'dojo.html';

    const TEST_ISIM = 'Test Kullanıcı';
    const CHIBI = { normal: 'images/mutlu.webp' };

    const balon = document.getElementById('balon');
    const panel = document.getElementById('panel');
    const chibiKap = document.getElementById('chibiKap');
    let chibiEl = null, yaziZamanlayici = null;

    // ---------- Chibi ----------
    function chibiKur() {
        const img = document.createElement('img');
        img.className = 'chibi'; img.alt = 'Sensei'; img.src = CHIBI.normal;
        img.onerror = () => {
            const e = document.createElement('div');
            e.className = 'chibi-emoji'; e.textContent = '👺';
            e.onclick = chibiTikla; chibiKap.innerHTML = ''; chibiKap.append(e); chibiEl = e;
        };
        img.onclick = chibiTikla;
        chibiKap.append(img); chibiEl = img;
    }
    function chibiTikla() { zipla(); Ses.hosgeldin(); }   // sensei'ye dokunca selam verir
    function zipla() {
        if (!chibiEl) return;
        chibiEl.classList.remove('zipla'); void chibiEl.offsetWidth;
        chibiEl.classList.add('zipla');
        chibiEl.addEventListener('animationend', () => chibiEl.classList.remove('zipla'), { once: true });
    }

    // ---------- Daktilo efektiyle konuşma ----------
    function konus(metin, bitince) {
        // Akış balonu ile hero konuşması AYRI ögelerdir (#balon / #heroKonusma);
        // hero metni ekranda kalır, akış balonu ayrıca yazılır. Yine de hero'nun
        // daktilo efekti hâlâ dönüyorsa durdurulur (aşağıdaki konusAnimasyonDurdur).
        konusAnimasyonDurdur();
        balon.textContent = '';
        balon.classList.remove('konusuyor');
        let i = 0;
        yaziZamanlayici = setInterval(() => {
            balon.textContent = metin.slice(0, ++i);
            if (i >= metin.length) { clearInterval(yaziZamanlayici); if (bitince) bitince(); }
        }, 28);
    }
    // Hero konuşması ile akış balonu AYRI ögeler (#heroKonusma / #balon), ama
    // hero kapanırken daktilo efekti hâlâ dönüyor olabilir; boşa çalışmasın diye
    // durdurulur. heroKonus kaydettiği durdurucuyu bırakır, burada çağrılır.
    let heroYaziDurdur = null;
    function konusAnimasyonDurdur() {
        if (heroYaziDurdur) { heroYaziDurdur(); heroYaziDurdur = null; }
    }
    function panelGoster(...elemanlar) {
        panel.hidden = false;
        document.body.classList.add('giris-akisi');
        panel.replaceChildren(...elemanlar);
    }
    function el(tag, sinif, metin) { const e = document.createElement(tag); if (sinif) e.className = sinif; if (metin) e.textContent = metin; return e; }

    // ---------- Ortak: kaydı yaz ve dojo'ya geç ----------
    // Ilerleme.baslat varsa onu kullanır (ilerleme.js), yoksa eski anahtarlara yazar.
    function kayitYaz(isim) {
        // Google'a yeniden girişte mevcut ilerlemeyi asla sıfırlama.
        // Gizli sekme/depolama engeli giriş akışını kırmamalı; Ilerleme yazıcısı
        // da ayrıca try/catch kullandığı için burada yerel yedek güvenli tutulur.
        try {
            const mevcutIsim = localStorage.getItem('sakar_isim');
            if (mevcutIsim) {
                localStorage.setItem('sakar_isim', mevcutIsim);
                return;
            }
            const baslat = (window.Ilerleme && Ilerleme.baslat) ? Ilerleme.baslat : null;
            if (baslat) return baslat(isim, 'yok', 1);
            localStorage.setItem('sakar_isim', isim);
            localStorage.setItem('sakar_bilgi', 'yok');
            localStorage.setItem('sakar_seviye', 1);
            localStorage.setItem('sakar_xp', 0);
        } catch (e) {
            // Depolama kullanılamasa da kullanıcıyı sessizce kilitleme.
            // İsim yalnızca bu sessiyon için tutulur; bulut girişinden sonra
            // kalıcı yedek yeniden denenebilir.
            try { window._sakarGeciciIsim = String(isim || '').trim().slice(0, 22); } catch (y) { }
        }
    }

    function oturumAc(isim, kucukResim) {
        kayitYaz(isim);
        if (kucukResim) { try { localStorage.setItem('sakar_avatar', kucukResim); } catch (e) {} }
        zipla();
        Ses.hosgeldin();
        konus('Hoş geldin ' + isim + '! Dojo\'ya gidiyoruz, sensei seni bekliyor 🥋');
        const btn = el('button', 'buyuk-btn', 'DOJO\'YA GİR 🥋');
        btn.onclick = () => window.location.href = DOJO_ADRESI;
        panelGoster(btn);
    }

    function avatarGuncelle(kucukResim) {
        if (!kucukResim || !chibiEl || chibiEl.tagName !== 'IMG') return;
        chibiEl.src = kucukResim;
        chibiEl.onerror = () => {};   // Google resmi gelmezse sensei resmi kalsın
    }

    // ---------- TEST MODU: giriş istenmez, doğrudan dojo ----------
    if (TEST_MODU) {
        if (!localStorage.getItem('sakar_isim')) kayitYaz(TEST_ISIM);
        window.location.replace(DOJO_ADRESI);
        return;
    }

    // ---------- Google ile giriş ----------
    function yukleniyorMetni(kutu, metin, alt) {
        kutu.replaceChildren(el('span', 'cizgi-yukleniyor'), el('span', '', metin), alt ? el('span', 'giris-alt', alt) : '');
    }

    // Diğer Google sekmeleri/pencereleri açıkken Google penceresi kapanabilir; kullanıcı
    // sayfaya dönünce butonun kilitli kalmaması için 1 sn'de bir kontrol edilir.
    let kilitAcici = null;

    // butonKur(kutu): butonu çizer.
    //   kutu verilirse  -> hazır oauth2 istemcisi (tıklama anında token ister)
    //   kutu null ise   -> kütüphane HENÜZ yok; tıklanınca indirilir, sonra istenir
    function butonKur(kutu) {
        const bas = document.createElement('button');
        bas.className = 'g-btn'; bas.type = 'button';
        bas.append(el('span', 'g-logo', 'G'), el('span', '', 'Google ile devam et'));

        bas.onclick = () => {
            if (kilitAcici) { clearInterval(kilitAcici); kilitAcici = null; }
            kilitAcici = setInterval(() => {
                if (document.hidden || !document.body.contains(bas)) {
                    bas.disabled = false; clearInterval(kilitAcici); kilitAcici = null;
                }
            }, 1000);
            bas.disabled = true;

            // Kütüphane hazırsa doğrudan token isteyelim (en hızlı yol)
            if (kutu) {
                yukleniyorMetni(bas, 'Google bekleniyor…', 'Açılan pencereden hesabını seç');
                try { kutu.requestAccessToken(); }
                catch (e) { console.error('[giriş] Google isteği başlatılamadı:', e); butonKur(kutu); }
                return;
            }

            // Kütüphane henüz yüklenmedi: ŞİMDİ indir (kullanıcı beklesin, sayfa değil)
            yukleniyorMetni(bas, 'Google hazırlanıyor…', 'Bir saniye sürer');
            gsiYukle()
                .then(() => {
                    if (window.google && google.accounts && google.accounts.oauth2) {
                        const yeni = google.accounts.oauth2.initTokenClient({
                            client_id: GOOGLE_CLIENT_ID,
                            scope: 'openid email profile',
                            callback: (yanit) => {
                                if (yanit && yanit.access_token) kullaniciyiAl(yanit.access_token);
                                else if (yanit && (yanit.error || yanit.error_type)) {
                                    console.error('[giriş] Google hata döndürdü:', yanit);
                                    konus(adresHatasi(yanit));
                                    butonKur(yeni);
                                }
                            },
                            error_callback: (hata) => {
                                console.error('[giriş] Google penceresi açılamadı:', hata);
                                konus(adresHatasi(hata));
                                butonKur(yeni);
                            }
                        });
                        yukleniyorMetni(bas, 'Google bekleniyor…', 'Açılan pencereden hesabını seç');
                        try { yeni.requestAccessToken(); }
                        catch (e) { console.error('[giriş] İstek başlatılamadı:', e); butonKur(yeni); }
                    } else {
                        adimIsim();
                    }
                })
                .catch((hata) => {
                    // Kütüphaneye ulaşılamadı: adını yazarak devam etsin.
                    console.warn('[giriş] Google kütüphanesine ulaşılamadı (' +
                        ((hata && hata.message) || 'bilinmeyen') + '). Adını yazma ekranına geçiliyor.');
                    konus('Google\'a şu an ulaşamıyorum. Adını yazarak devam edebilirsin.');
                    adimIsim();
                });
        };
        panelGoster(bas, kullanimNotu());
    }

    function kullanimNotu() {
        const not = el('div', 'giris-not', 'Giriş yapınca ilerlemen ve serin bu cihazda saklanır. İstediğin zaman sağ üstteki menüden baştan başlayabilirsin.');
        return not;
    }

    // Google Identity Services kütüphanesini sayfaya SADECE giriş açıkken ekler.
    // Böylece kimlik yokken (şimdiki hâl) dışarıdan hiçbir istek yapılmaz ve
    // "Google yüklenemedi" uyarısı asla çıkmaz.
    let gsiSozu = null;
    const GSI_ZAMAN_ASIMI = 6000;   // 6 saniye: yavaş ağda giriş ekranını kilitlemeyelim
    function gsiYukle() {
        if (gsiSozu) return gsiSozu;
        gsiSozu = new Promise((coz, reddet) => {
            let bitti = false;
            // ZAMAN AŞIMI ŞART: eskiden zaman aşımı yoktu. Google kütüphanesi
            // yavaş yüklenirse (ya da engelleyici yüzünden yüklenemezse) giriş
            // ekranı SONSUZA KADAR "Google hazırlanıyor…" gösteriyordu.
            // Gerçek ölçüm: bu makinede sayfa yüklenmesi 20 saniyeye çıkıyordu.
            const zaman = setTimeout(() => {
                if (bitti) return;
                bitti = true;
                reddet(new Error('zaman asimi'));
            }, GSI_ZAMAN_ASIMI);

            const s = document.createElement('script');
            s.src = 'https://accounts.google.com/gsi/client';
            s.async = true; s.defer = true;
            s.onload = () => { if (bitti) return; bitti = true; clearTimeout(zaman); coz(); };
            s.onerror = () => { if (bitti) return; bitti = true; clearTimeout(zaman); reddet(new Error('kutuphane yuklenemedi')); };
            document.head.appendChild(s);
        });
        return gsiSozu;
    }

    // GOOGLE KÜTÜPHANESİ TEMBEL YÜKLENİR (lazy load).
    //
    // NEDEN: Eskiden sayfa açılırken kütüphane hemen indirilmeye başlanıyordu ve
    // yavaş/engelli ağda sayfa yüklemesi 26 saniyeye çıkıyordu; giriş ekranı
    // "Google hazırlanıyor…" yazısında kilitleniyordu (zaman aşımı bile
    // `load` olayını engellediği için fayda etmiyordu).
    //
    // YENİ DAVRANIŞ: Buton ANINDA hazır görünür. Kütüphane ancak kullanıcı
    // butona bastığında indirilir. Böylece kötü ağda bile giriş ekranı 100 ms'de
    // kullanılabilir olur; tıklanınca en fazla 6 sn beklenir.
    function googleGetir() {
        if (!GOOGLE_ILE_GIRIS) return false;
        konus('Konnichiwa! Ben Sakar Paisen, senin Japonca sensein. Devam etmek için Google ile giriş yap.');
        // Butonu ŞİMDİ kur (kütüphane henüz yüklenmemiş olsa bile)
        butonKur(null);
        return true;
    }

    function kur() {
        const kutu = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'openid email profile',
            callback: (yanit) => {
                if (yanit && yanit.access_token) {
                    kullaniciyiAl(yanit.access_token);
                } else if (yanit && (yanit.error || yanit.error_type)) {
                    console.error('[giriş] Google hata döndürdü:', yanit);
                    konus(adresHatasi(yanit));
                    butonKur(kutu);
                }
            },
            error_callback: (hata) => {
                console.error('[giriş] Google penceresi açılamadı:', hata);
                konus(adresHatasi(hata) === 'Giriş tamamlanmadı. Başka bir hesapla tekrar dener misin?'
                    ? 'Google penceresi kapanmış görünüyor. Hazır olduğunda tekrar bas.'
                    : adresHatasi(hata));
                butonKur(kutu);
            }
        });
        butonKur(kutu);
    }

    function kullaniciyiAl(jeton) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + jeton } })
            .then(r => r.ok ? r.json() : null)
            .then(veri => {
                const ad = (veri && (veri.given_name || veri.name)) || 'Sensei';
                oturumAc(ad, veri && veri.picture);

                // BULUT KAYIT: Google'ın "sub" alanı kullanıcının BENZERSİZ kimliğidir
                // (e-posta değişse bile sabit kalır). Bu kimliği bulut kaydına bağlarız;
                // böylece kullanıcı başka cihazdan girince ilerlemesi geri gelir.
                // bulut.js ayarı boşsa bu çağrı hiçbir şey yapmaz.
                if (veri && veri.sub && window.Bulut && window.Bulut.acik && window.Bulut.acik()) {
                    window.Bulut.kimlikBagla('g-' + veri.sub)
                        .then(function () { konusDogrula(ad); })
                        .catch(function () { });
                }
            })
            .catch(() => oturumAc('Sensei', null));
    }

    // Buluttan ilerleme alındıysa kullanıcıya kısaca haber ver.
    function konusDogrula(ad) {
        try {
            const seviye = Ilerleme.seviye();
            const xp = Ilerleme.xp();
            if (seviye > 1 || xp > 0) {
                konus('Hoş geldin ' + ad + '! İlerlemen buluttan geri geldi: ' +
                    seviye + '. ders, ' + xp + ' XP 🥋');
            }
        } catch (e) { }
    }


    document.documentElement.setAttribute('data-giris-js', '2');

    // ---------- Kimlik doğrulama (yayına almadan önce bir kez bak) ----------
    // Google, yetkili JavaScript kaynağı listesinde olmayan adreslerden gelen istekleri
    // sessizce reddeder. En sık yapılan hata bu yüzden "butona bastım, hiçbir şey olmadı"
    // olur. Aşağıdaki iki kontrol sayfa açılışında konsola yazar; yayına almadan önce
    // konsolu açıp "[giriş]" satırlarına bakman yeterli.
    //   1) Adres (origin) hatalı  -> Cloud Console'da "Yetkili JavaScript kaynakları"na ekle
    //   2) Kimlik hatalı/eksik    -> o satırı düzelt
    // Regex yerine basit metin kontrolü: dosyanın her ortamda bozulmadan taşınması için.
    function kimlikBicimiDogruMu(kimlik) {
        if (!kimlik || kimlik.length < 20) return false;
        if (kimlik.indexOf('.apps.googleusercontent.com') === -1) return false;
        const ilkParca = kimlik.split('-')[0];
        if (!ilkParca || ilkParca.length < 6) return false;
        for (let i = 0; i < ilkParca.length; i++) {
            const k = ilkParca.charAt(i);
            if (k < '0' || k > '9') return false;
        }
        return true;
    }

    function adresYerelMi(adres) {
        return adres.indexOf('localhost') > -1 || adres.indexOf('127.0.0.1') > -1;
    }

    function kimlikKontrol() {
        if (TEST_MODU) { console.info('[giriş] TEST_MODU açık: giriş ekranı atlanır, dojo açılır.'); return; }
        const origin = location.origin;
        const yerel = adresYerelMi(origin);
        if (!GOOGLE_CLIENT_ID) {
            console.warn('[giriş] GOOGLE_CLIENT_ID boş. Şu an adını yazma ekranı çalışıyor.' +
                '\n         Google girişine geçmek için giris.js içindeki GOOGLE_CLIENT_ID satırına' +
                '\n         istemci kimliğini yaz.');
        } else if (!kimlikBicimiDogruMu(GOOGLE_CLIENT_ID)) {
            console.error('[giriş] GOOGLE_CLIENT_ID biçimi hatalı görünüyor: "' + GOOGLE_CLIENT_ID + '"' +
                '\n         Doğru biçim: 1234567890-abcdefg.apps.googleusercontent.com');
        } else {
            console.info('[giriş] Google girişi açık. İstemci kimliği: ' + GOOGLE_CLIENT_ID);
        }
        console.info('[giriş] Yetkili JavaScript kaynağı olarak şu adresleri eklemiş olmalısın:' +
            '\n         https://sakarpaisen.com' +
            '\n         https://www.sakarpaisen.com' +
            (yerel ? '\n         ' + origin + '   (yerelde denemek için)' : ''));
    }

    // Test kolaylığı: kimlik kontrolünü dışarıdan çağırabilmek için
    // (sadece console çıktısı üretir, hiçbir şeyi değiştirmez)
    window.__kimlikTesti = function (testKimligi) {
        const gercek = GOOGLE_CLIENT_ID;
        // const olduğu için değeri geçici olarak değiştiremeyiz: kontrolü ayrıca yazdık
        const kimlik = testKimligi;
        if (!kimlik) {
            console.warn('[giriş] GOOGLE_CLIENT_ID boş. Şu an adını yazma ekranı çalışıyor.');
        } else if (!kimlikBicimiDogruMu(kimlik)) {
            console.error('[giriş] GOOGLE_CLIENT_ID biçimi hatalı görünüyor: "' + kimlik + '"');
        } else {
            console.info('[giriş] Google girişi açık. İstemci kimliği: ' + kimlik);
        }
        console.info('[giriş] Yetkili JavaScript kaynağı olarak şu adresleri eklemiş olmalısın:' +
            '\n         https://sakarpaisen.com' +
            '\n         https://www.sakarpaisen.com' +
            (adresYerelMi(location.origin) ? '\n         ' + location.origin + '   (yerelde denemek için)' : ''));
        return gercek;
    };

    function adresHatasi(yanit) {
        const kod = String((yanit && (yanit.error || yanit.error_type || yanit.code || yanit.message)) || '').toLowerCase();
        if (kod.indexOf('access_denied') > -1) {
            return 'Google giriş izni verilmedi. Açılan pencerede hesabını seçip "İzin ver"e bas.';
        }
        if (kod.indexOf('origin_mismatch') > -1 || kod.indexOf('origin mismatch') > -1) {
            return 'Google bu adresi izinli kaynak olarak tanımıyor: ' + location.origin + '. Google Cloud Console → OAuth istemci kimliği → Yetkili JavaScript kaynakları kısmına bu origini eksiksiz ekle.';
        }
        if (kod.indexOf('popup_closed_by_user') > -1 || kod.indexOf('user_cancelled') > -1) {
            return 'Google penceresi kapatıldı. Hazır olduğunda tekrar dene.';
        }
        if (kod.indexOf('invalid_client') > -1 || kod.indexOf('idpiframe_initialization_failed') > -1 || kod.indexOf('origin_mismatch') > -1) {
            return 'Google giriş yetkisi eksik. Bu site adresi: ' + location.origin +
                ' → Google Cloud Console → OAuth istemci kimliği → Yetkili JavaScript kaynakları' +
                ' listesine eklenmeli.';
        }
        return 'Giriş tamamlanmadı. Google ayarlarında bu adresin izinli olduğundan emin ol: ' + location.origin;
    }

    // ---------- Adım: geri dönen kullanıcı ----------
    function adimDonus(isim) {
        zipla();
        const seri = Ilerleme.seri().sayi;
        const rutbe = Ilerleme.rutbe(Ilerleme.xp());
        konus('Tekrar hoş geldin, ' + isim + '! ' + (seri > 1 ? seri + ' günlük serin devam ediyor 🔥 ' : '') + 'Kaldığın yerden devam edelim mi?');

        const devam = el('button', 'buyuk-btn', 'DOJO\'YA GİR 🥋');
        devam.onclick = () => window.location.href = DOJO_ADRESI;
        const yeni = el('button', 'metin-btn', 'Ben ' + isim + ' değilim / baştan başla');
        yeni.onclick = () => {
            if (confirm('Kayıt ve ilerleme silinecek. Emin misin?')) {
                Ilerleme.sifirla();   // hedefli silme: ayarlar korunur (tema/ses)
                location.reload();
            }
        };

        // ÖNEMLİ — SIRALAMA: panelGoster() panelin içeriğini replaceChildren ile
        // TAMAMEN DEĞİŞTİRİR. Bu yüzden ek bilgi kutuları (görev özeti, hediye
        // butonu) panelGoster'den SONRA eklenmeli; önce eklenirse silinir.
        // (Bu hata ekran görüntüsü doğrulamasında yakalandı: hediye butonu
        //  görünmüyordu çünkü panelGoster onu eziyordu.)
        panelGoster(devam, yeni);
        ekBilgileriEkle(rutbe, seri, isim);
        // Çıkış seçeneği: "baştan başla" ilerlemeyi SİLER, çıkış SİLMEZ.
        // İkisi farklı işler; kullanıcı hangisini istediğini seçebilmeli.
        panel.appendChild(cikisButonu('akis-cikis'));
    }

    // Giriş ekranındaki ek bilgi kutuları: günlük görev özeti + hediye butonu.
    // panelGoster'den SONRA çağrılır (yoksa silinir).
    function ekBilgileriEkle(rutbe, seri, isim) {
        // --- GÜNLÜK GÖREV ÖZETİ ---
        if (window.Gorevler) {
            try {
                const oz = Gorevler.ozet();
                if (oz.toplam > 0) {
                    const gosterge = el('div', 'giris-not');
                    gosterge.style.cssText =
                        'display:flex;gap:10px;align-items:center;justify-content:center;' +
                        'background:var(--zemin-2);border-radius:14px;padding:10px 14px;' +
                        'font-size:13.5px;font-weight:800;color:var(--yazi-soluk);';
                    gosterge.textContent = oz.hepsiTamam
                        ? '🌟 Bugünün tüm görevleri tamam!'
                        : '📋 Bugün ' + oz.tamam + '/' + oz.toplam + ' görev yapıldı · Rütbe: ' + rutbe.ad;
                    panel.appendChild(gosterge);
                }
            } catch (e) { }
        }

        // --- GÜNLÜK HEDİYE BUTONU ---
        // Neden girişte? Kullanıcı siteye adım attığı anda "bugün girmesem
        // kaçar" etkisi en güçlüdür. Dojo'ya gitmesini beklemek fırsat kaybı.
        if (window.Hediye && Hediye.acilabilir()) {
            try {
                const od = Hediye.odulHesapla(seri);
                const hBtn = el('button', 'buyuk-btn');
                hBtn.style.background = 'var(--altin)';
                hBtn.style.boxShadow = '0 5px 0 var(--altin-koyu)';
                hBtn.textContent = '🎁 GÜNLÜK HEDİYENİ AL (+' + od.xp + ' XP)';
                hBtn.onclick = () => {
                    if (window.Hediye && Hediye.sandikAc) Hediye.sandikAc(seri);
                };
                panel.appendChild(hBtn);
            } catch (e) { }
        }
    }

    // ---------- Adım: ilk giriş (bilgi sorusu yok, sıfırdan başlar) ----------
    function adimYeni(isim) {
        kayitYaz(isim);
        zipla();
        konus('Memnun oldum, ' + isim + '! Sıfırdan başlıyoruz: her derste 5 harf öğreneceksin. Yolun hazır 🥋');
        const btn = el('button', 'buyuk-btn', 'DOJO\'YA GİR 🥋');
        btn.onclick = () => window.location.href = DOJO_ADRESI;
        const sifirla = el('button', 'metin-btn', 'Baştan başla');
        sifirla.onclick = () => {
            if (confirm('Kayıt ve tüm ilerleme silinecek. Emin misin?')) {
                try { localStorage.clear(); } catch (e) {}
                location.reload();
            }
        };
        panelGoster(btn, sifirla);
    }

    // ---------- Başlat ----------
    // DİKKAT: localStorage'da anahtar '' olarak da durabilir; boş kayıt = kayıt yok sayılır.
    function kayitliAd() {
        let ad = (window.Ilerleme && Ilerleme.isim) ? Ilerleme.isim() : null;
        if (!ad) { try { ad = localStorage.getItem('sakar_isim'); } catch (e) { ad = null; } }
        ad = (ad || '').trim();
        return ad || '';
    }

    // ============================================================
    // HERO AŞAMASI
    //
    // NEDEN: İlk ekranda her şey aynı anda görünüyordu (logo, maskot, balon,
    // 3 tanıtım kartı, süreç çubuğu, 9 öğrenme kartı). Ekran kalabalıktı ve
    // arka plan videosu görünmüyordu. Kullanıcı geri bildirimi: "biraz garip
    // geldi gözüme".
    //
    // ÇÖZÜM: İki aşama.
    //   1) HERO : sadece video + logo + tek GİRİŞ butonu.
    //   2) AKIŞ : butona basınca karşılama/giriş akışı açılır, tanıtım
    //             blokları görünür olur.
    //
    // ÖNEMLİ: Hero aşamasında giriş MANTIĞI kurulmaz (Google kütüphanesi
    // indirilmez, kullanıcı hesapları sorgulanmaz). Butona basılınca kurulur.
    // Böylece ilk ekran çok hızlı açılır ve hiçbir dış istek yapılmaz.
    // ============================================================
    const heroEl = document.getElementById('hero');
    const heroBtn = document.getElementById('heroBtn');
    const heroDevam = document.getElementById('heroDevam');
    const heroNot = document.getElementById('heroNot');
    let akisiKuruldu = false;   // akışın iki kez kurulmasını engeller (TDZ olmasın: önce tanım)

    // Hero altındaki küçük bilgi: kayıtlı kullanıcıya durumunu söyle.
    // (Ekran görüntüsündeki "Test" gibi isimler burada, tek satırda görünür.)
    function heroNotYaz() {
        if (!heroNot) return;
        const ad = kayitliAd();
        if (ad) {
            let xp = 0, seri = 0;
            try { xp = Ilerleme.xp(); } catch (e) { }
            try { seri = Ilerleme.seri().sayi; } catch (e) { }
            heroNot.innerHTML = '';
            heroNot.append(document.createTextNode('Tekrar hoş geldin, '));
            const b = document.createElement('b');
            b.textContent = ad;
            heroNot.append(b);
            heroNot.append(document.createTextNode(
                seri > 0 ? ' · 🔥 ' + seri + ' gün · ' + xp + ' XP' : ' · ' + xp + ' XP'));
        } else {
            heroNot.textContent = 'Maceraya başlamak için tek dokunuş yeter.';
        }
    }

    // ---------- ÇIKIŞ (hesaptan çık) ----------
    // NEDEN GEREKLİ: Kayıtlı kullanıcı için "çıkış" hiçbir yerde yoktu; cihazı
    // paylaşan biri hesabı kapatamıyordu. Sadece "baştan başla" vardı ve o
    // TÜM ilerlemeyi siliyordu — çıkış değil, sıfırlama.
    //
    // ÖNEMLİ AYRIM:
    //   Çıkış   -> yalnızca OTURUMU kapatır. İlerleme, XP, harfler KALIR;
    //              tekrar girince kaldığı yerden devam eder.
    //   Sıfırla -> ilerlemeyi siler (Ayarlar sayfasında, ayrı ve uyarılı).
    //
    // Silinenler: ad, avatar, e-posta, oturum bayrağı.
    // Korunanlar: sakar_kana, sakar_xp, sakar_seviye, sakar_seri,
    //             sakar_video_izlenen, tema/ses ayarları.
    function cikisYap() {
        try { if (window.Bulut && Bulut.cikis) Bulut.cikis(); } catch (e) { }
        try {
            localStorage.removeItem('sakar_isim');
            localStorage.removeItem('sakar_avatar');
            localStorage.removeItem('sakar_email');
            localStorage.removeItem('sakar_oturum');
        } catch (e) { }
        location.reload();
    }
    // Diğer modüller (dojo menüsü, ayarlar) çağırabilsin
    window.sakarCikis = cikisYap;

    // Çıkış düğmesi üretir (onaylı).
    function cikisButonu(ekSinif) {
        const b = el('button', 'metin-btn' + (ekSinif ? ' ' + ekSinif : ''), 'Çıkış yap');
        b.type = 'button';
        b.onclick = () => {
            if (confirm('Çıkış yapılsın mı? İlerlemen silinmez; tekrar girince kaldığın yerden devam edersin.')) {
                cikisYap();
            }
        };
        return b;
    }

    // Hero'yu kapat ve normal akışı başlat.
    function heroKapat() {
        if (document.body.classList.contains('secim-asamasi')) return;
        document.body.classList.add('hero-gecis');
        // Hero'nun daktilo efekti hâlâ dönüyorsa hemen durdur; akış balonu
        // birazdan aynı ögeye yazacak (bkz. heroYaziDurdur).
        konusAnimasyonDurdur();
        // Kısa sahne çıkışı; seçim ekranı hemen açılır, arka plan kapak görünmeye devam eder.
        window.setTimeout(function () {
            document.body.classList.remove('hero-asamasi', 'hero-gecis');
            document.body.classList.add('secim-asamasi');
            if (heroEl) heroEl.setAttribute('hidden', '');
            akisiKur();
            // Güncelleme bildirimi gibi ertelemeler, açılış ekranı kapandıktan
            // SONRA gösterilsin diye haber ver (bkz. guncelleme.js).
            try { document.dispatchEvent(new Event('basla-sonrasi')); } catch (e) { }
            try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { }
        }, 220);
    }

    // Açılış ekranının karşılaması: sensei hero metninin altında konuşur
    // (#heroKonusma). Yazı efekti bitince çağrıya geçer. Düğme metnine DOKUNMAZ:
    // düğme her zaman "BAŞLA" der (bkz. index.html).
    function heroKonus() {
        var heroBalon = document.getElementById('heroKonusma');
        if (!heroBalon) return;
        var metin = 'Konnichiwa! Ben Sakar Paisen. Hiragana, katakana ve kanjiyi ' +
            'oyun oynayarak öğreteceğim.';
        var yazZamanlayici = null;
        function temizle() {
            if (yazZamanlayici) { clearInterval(yazZamanlayici); yazZamanlayici = null; }
        }
        function yaz(hedef, sonra) {
            temizle();
            heroBalon.classList.remove('konusuyor');
            heroBalon.textContent = '';
            var i = 0;
            yazZamanlayici = setInterval(function () {
                heroBalon.textContent = hedef.slice(0, ++i);
                if (i >= hedef.length) { temizle(); if (sonra) window.setTimeout(sonra, 1600); }
            }, 42);
        }
        // Gecikme: sayfa açılışındaki diğer işler (video, SW kaydı) önce bitsin.
        // Kullanıcı konuşma sırasında akışı açarsa (secim-asamasi) sözü kesilir;
        // konus() zaten zamanlayıcıyı durdurur (bkz. heroYaziDurdur aşağıda).
        heroYaziDurdur = temizle;
        window.setTimeout(function () {
            if (!heroBalon.isConnected) return;
            if (document.body.classList.contains('secim-asamasi')) return;
            yaz(metin, function () {
                if (!heroBalon.isConnected) return;
                if (document.body.classList.contains('secim-asamasi')) return;
                heroBalon.classList.add('konusuyor');
                heroBalon.textContent = 'Hazırsan BAŞLA\'ya bas! ↓';
                window.setTimeout(function () { heroBalon.classList.remove('konusuyor'); }, 2600);
            });
        }, 500);
    }

    // Akışı kur (hero'dan sonra çağrılır; eski "Başlat" bölümünün karşılığı)
    function akisiKur() {
        if (akisiKuruldu) return;
        akisiKuruldu = true;
        chibiKur();
        let avatar = '';
        try { avatar = (localStorage.getItem('sakar_avatar') || '').trim(); } catch (e) { }
        if (avatar) avatarGuncelle(avatar);

        const kayitliIsim = kayitliAd();
        if (kayitliIsim) {
            adimDonus(kayitliIsim);
        } else if (!googleGetir()) {
            // Google girişi kurulu değilse: adını yaz akışı
            adimIsim();
        }
    }

    kimlikKontrol();

    // Hero'yu kur. Test modunda hero atlanır (doğrudan dojo açılır).
    if (TEST_MODU) {
        // Test modu zaten yukarıda yönlendirip return etti; buraya gelinmez.
    }

    heroNotYaz();
    // Açılış ekranındaki karşılama: kullanıcı "BAŞLAT"a basmadan önce ne olacağını
    // bilsin. Otomatik başlar; düğmeye basınca akış açılır (girilen ad vb.).
    // NOT: Bu metinler arama motorlarını ilgilendirmez; index.html'deki doğrulama
    // meta etiketi ham HTML'de durur (bkz. index.html <head>).
    heroKonus();
    // Kayıt varsa "kaldığın yerden devam" ikinci yolu görünür olur.
    // (CSS: body:not(.kayit-var) .hero-ikincil { display:none })
    const kayitli = kayitliAd();
    try { if (kayitli) document.body.classList.add('kayit-var'); } catch (e) { }

    // Seçim ekranının başlığını kullanıcıya göre kişiselleştir: yeni gelen
    // "nereden başlamak istersin", kalan kullanıcı "kaldığın yerden devam".
    // ÖNEMLİ: Burada "Tekrar hoş geldin" YAZILMAZ. Aynı selamlama zaten üstteki
    // sohbet balonunda (konus) söyleniyor; başlıkta da tekrarlanınca mesaj
    // ekranda iki kez görünüyordu. Başlık yalnızca bölümün sorusunu sorar.
    if (kayitli) {
        try {
            const baslik = document.getElementById('obBaslik');
            const alt = document.getElementById('obAlt');
            if (baslik) baslik.textContent = 'Nereden devam etmek istersin?';
            if (alt) alt.textContent = 'Kaldığın yerden devam edebilir veya başka bir çalışma biçimi seçebilirsin.';
        } catch (e) { }
    }
    if (heroBtn) {
        heroBtn.onclick = function () {
            // Butona basınca akış açılır; Google kütüphanesi ANCAK burada
            // gerekirse indirilir (ilk ekran hızlı kalsın).
            heroKapat();
        };
    }
    // İkinci yol: akışı atlayıp doğrudan dojo'ya git.
    if (heroDevam) {
        heroDevam.onclick = function () { window.location.href = DOJO_ADRESI; };
    }

    // Kayıtlı kullanıcıya hero'da çıkış seçeneği ver.
    // Yeni kullanıcıda gereksiz: kapatılacak bir oturum yok.
    if (kayitliAd() && heroNot) {
        heroNot.insertAdjacentElement('afterend', cikisButonu('hero-cikis'));
    }

    // ---------- Seçim ekranından açılış ekranına dön ----------
    // ÖNEMLİ: Bu düğme HTML'de vardı ama hiçbir koda bağlı DEĞİLDİ —
    // tıklanınca hiçbir şey olmuyordu. Artık hero aşamasına geri döndürür:
    // seçim ekranı kapanır, video ekranı yeniden görünür.
    const secimGeri = document.getElementById('secimGeri');
    if (secimGeri) {
        secimGeri.onclick = function () {
            document.body.classList.remove('secim-asamasi');
            document.body.classList.add('hero-asamasi');
            if (heroEl) heroEl.removeAttribute('hidden');
            // Panel/balon içeriğini temizle ki dönüşte artık görünmesin.
            try { if (panel) { panel.hidden = true; panel.replaceChildren(); } } catch (e) { }
            try { if (balon) balon.textContent = ''; } catch (e) { }
            try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { }
        };
    }

    // Eski başlatma: hero'a tıklanmadan da akış gerekebilir (ör. doğrudan
    // "#basla" bağlantısıyla gelinmişse).
    if (window.location.hash === '#basla') {
        heroKapat();
    }

    // ---------- Adım 1: İsim (Google yapılandırılmamışken) ----------
    function adimIsim() {
        konus('Konnichiwa! Ben Sakar Paisen, senin Japonca sensein. Adın ne?');
        const kutu = el('input', 'giris');
        kutu.type = 'text'; kutu.placeholder = 'Adın'; kutu.maxLength = 16; kutu.autocomplete = 'nickname';
        kutu.setAttribute('aria-label', 'Adın'); kutu.setAttribute('enterkeyhint', 'done');
        const hata = el('div', 'hata'); hata.setAttribute('role', 'alert');
        const btn = el('button', 'buyuk-btn', 'DEVAM');
        const gonder = () => {
            const isim = kutu.value.trim();
            if (!isim) { hata.textContent = 'Önce adını yaz.'; kutu.focus(); return; }
            adimYeni(isim);
        };
        btn.onclick = gonder;
        kutu.addEventListener('keydown', e => { if (e.key === 'Enter') gonder(); });
        panelGoster(kutu, hata, btn);
        setTimeout(() => kutu.focus(), 400);
    }
})();
