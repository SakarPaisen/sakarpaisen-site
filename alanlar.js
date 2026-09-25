// ============================================================
// ÇALIŞMA ALANLARI (alanlar.js)
//
// NE BURASI: alanlar.html sayfasının motoru. Sayfa durağan; buradan yalnızca
// üç şey yapılır:
//   1) Üst çubuktaki XP / seri rozetlerini gerçek verilerle doldur
//   2) "Bugün için öneri" kutusunu plan.js'ten besle
//   3) Kanji alanı için ön koşul kontrolü (kanji bilmek harf bilmekten sonra gelir)
//
// NEDEN AYRI DOSYA: HTML içine gömülü script, ileride test edilemez ve
// hata raporunda satır numarası anlamsız çıkar. Ayrı dosya test edilebilir.
// ============================================================
(function () {
    'use strict';

    if (!window.Ilerleme) return;

    function el(tag, sinif, metin) {
        const e = document.createElement(tag);
        if (sinif) e.className = sinif;
        if (metin != null) e.textContent = metin;
        return e;
    }

    // ---------- Üst rozetler ----------
    function rozetleriDoldur() {
        try {
            const xp = Ilerleme.xp ? Ilerleme.xp() : 0;
            const xpEl = document.getElementById('xpRozet');
            if (xpEl) xpEl.textContent = xp;
        } catch (e) { }
        try {
            const s = Ilerleme.seri ? Ilerleme.seri() : null;
            const seriEl = document.getElementById('seriRozet');
            if (seriEl && s) seriEl.textContent = s.sayi;
        } catch (e) { }
    }

    // ---------- Öğrenci durumu ----------
    // Kana (harf) bilgisi: kanji alanı için ön koşul. Kanjiyi harfler oturmadan
    // açmak, öğrenciye üç sistemi birden yükler (NOTLAR.md'deki aynı gerekçe).
    function kanaSayisi() {
        try {
            const gorulen = Ilerleme.gorulenIdler ? Ilerleme.gorulenIdler() : [];
            return gorulen.filter(function (id) {
                return typeof KANA !== 'undefined' && !!KANA[id];
            }).length;
        } catch (e) { return 0; }
    }

    function kanjiAlaniAyarla() {
        const alan = document.getElementById('kanjiAlan');
        const not = document.getElementById('kanjiNot');
        if (!alan) return;

        const sayi = kanaSayisi();
        const ESIK = 15;    // en az 15 harf bilinmeden kanji karmaşık gelir

        if (sayi >= ESIK) {
            if (not) not.textContent = 'Kütüphane · kart çalışması';
            return;
        }

        // Kilitli: tıklamayı engelle ama NEDEN kilitli olduğunu söyle.
        alan.classList.add('kilitli');
        alan.removeAttribute('href');
        alan.setAttribute('aria-disabled', 'true');
        if (not) {
            not.textContent = '🔒 ' + ESIK + ' harf bilince açılır (' + sayi + '/' + ESIK + ')';
        }
        alan.title = 'Kanji okunuşları kana ile yazılır. Önce harfleri oturtmak gerekir. ' +
            'Şu an ' + sayi + ' harf biliyorsun, ' + ESIK + ' olunca bu alan açılır.';
    }

    // ---------- Bugün için öneri (plan.js) ----------
    function oneriCiz() {
        if (!window.Plan) return;
        const kutu = document.getElementById('oneri');
        const liste = document.getElementById('oneriListe');
        if (!kutu || !liste) return;

        let plan = [];
        try { plan = Plan.kur(3) || []; } catch (e) { return; }
        if (!plan.length) return;

        kutu.hidden = false;
        liste.replaceChildren();
        plan.forEach(function (a, i) {
            const satir = el('a', 'oneri-satir' + (i === 0 ? ' ilk' : ''));
            satir.href = a.url;
            satir.append(
                el('span', 'simge', a.simge || '📌'),
                (function () {
                    const o = el('div');
                    o.append(el('div', 'ad', a.ad), el('div', 'acik', a.aciklama));
                    return o;
                })(),
                el('span', 'sure', a.sure || '')
            );
            satir.title = a.ad + ' — ' + a.aciklama;
            liste.append(satir);
        });
    }

    // ---------- Açılış ----------
    rozetleriDoldur();
    oneriCiz();
    kanjiAlaniAyarla();
})();
