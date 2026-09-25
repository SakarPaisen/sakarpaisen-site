// ============================================================
// 3D ARKA PLAN SAHNESİ (sahne3d.js)
//
// NE YAPAR: Sayfanın arkasına gerçek bir 3D sahne çizer — yüzen Japonca
// karakterler (あ カ 山), derinlikli sis ve hafif kamera hareketi. Fareyle
// veya parmakla sahne hafifçe döner (parallax).
//
// NEDEN KENDİ WebGL, NEDEN THREE.JS DEĞİL:
//   1) Site tamamen statik ve offline çalışıyor (service worker). Three.js
//      ~600 KB'lık bir dış dosya; indirilmesi ve önbelleğe alınması gerekir.
//   2) Bu sahne için gereken şey basit: noktalar + doku + sis. WebGL bunu
//      ~200 satırda yapıyor ve tek dosya.
//   3) Dış bağımlılık olmadığı için site güncellemesi bozulmaz.
//
// PERFORMANS VE ERİŞİLEBİLİRLİK KURALLARI:
//   • WebGL yoksa/başarısız olursa sessizce hiçbir şey yapılmaz — sayfa bozulmaz.
//   • Ayarlar > animasyon kapalıysa sahne hiç kurulmaz (data-animasyon="0").
//   • Kullanıcı "hareketi azalt" demişse yalnızca durağan tek kare çizilir.
//   • Sekme arkada kalınca (visibilitychange) döngü DURUR — pil tüketmez.
//   • Sayfa gizliyken/dururken kare çizilmez; idle'da 30 FPS'e düşer.
// ============================================================
(function () {
  'use strict';

  const KOK_ID = 'sahne3d';
  const DURUM_ONEK = 'sakar_sahne3d';   // localStorage: sahne tercihi

  // ---------- Ne zaman kapanmalı? ----------
  function animasyonKapaliMi() {
    // 1) Ayarlar sayfasındaki genel animasyon anahtarı
    try {
      if (document.documentElement.getAttribute('data-animasyon') === '0') return true;
      if (document.body && document.body.getAttribute('data-animasyon') === '0') return true;
    } catch (e) { }
    // 2) Kullanıcı bu sahneyi özellikle kapatmış mı?
    try { if (localStorage.getItem(DURUM_ONEK) === '0') return true; } catch (e) { }
    return false;
  }

  function hareketAzMi() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  // ---------- Karakter seti ----------
  // Sahnedeki yüzen karakterler. Hiragana, Katakana ve Kanji karışık:
  // amaç okutmak değil, atmosfer. Yanlış okunacak bir şey göstermiyoruz
  // (tek başına duran karakterler, kelime değil).
  const KARAKTERLER = [
    'あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ', 'な', 'に', 'ぬ', 'ね', 'の',
    'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ',
    '山', '川', '空', '月', '日', '木', '火', '水', '金', '土',
    '大', '小', '上', '下', '中', '人', '学', '生', '本', '語'
  ];

  // ---------- Shader kaynakları ----------
  // Karakterleri tek bir canvas dokusuna çizip "atlas" yapıyoruz: 50 ayrı
  // doku yerine 1 doku. Böylece WebGL çağrı sayısı düşük kalıyor.
  const DOKU_HUCRE = 128;      // atlas içindeki her hücre 128x128
  const ATLAS_SUTUN = 8;

  const VS = `
    attribute vec3 aPozisyon;
    attribute vec2 aDoku;
    attribute vec2 aHucreBoyut;
    attribute float aOlcek;
    attribute float aHiz;
    attribute float aFaz;

    uniform float uZaman;
    uniform float uDunyaYuksekligi;
    uniform vec2  uFare;
    uniform float uDonus;

    varying vec2 vDoku;
    varying float vSis;
    varying float vParlaklik;

    void main() {
      // Karakterler yukarı doğru yüzüyor; tepeye ulaşınca alta döner.
      float y = aPozisyon.y + uZaman * aHiz;
      y = mod(y + uDunyaYuksekligi * 0.5, uDunyaYuksekligi) - uDunyaYuksekligi * 0.5;

      // Yatay salınım: her karakter kendi fazında sağa sola süzülür.
      float suzulme = sin(uZaman * 0.5 + aFaz) * 0.35;

      vec3 konum = vec3(aPozisyon.x + suzulme, y, aPozisyon.z);

      // Fareyle hafif parallax: yakın olan çok, uzak olan az kayar.
      float derinlik = (konum.z + 6.0) / 12.0;
      konum.x += uFare.x * derinlik * 0.9;
      konum.y += uFare.y * derinlik * 0.5;

      // Sahnenin tamamı çok yavaş döner: "canlı" hissi verir.
      float c = cos(uDonus), s = sin(uDonus);
      konum.xz = mat2(c, -s, s, c) * konum.xz;

      vec4 mv = modelViewMatrix * vec4(konum, 1.0);
      gl_Position = projectionMatrix * mv;

      // Nokta boyutu: mesafeyle küçülür (perspektif).
      gl_PointSize = aOlcek * (300.0 / -mv.z);

      // ÖNEMLİ — DOKU HÜCRESİ:
      // gl_PointCoord 0..1 arası gelir ve NOKTA karesinin tamamını kapsar.
      // Atlasın tamamını örneklemek yerine, bu karakterin hücresine
      // daraltmamız gerekir; yoksa her nokta tüm atlası gösterir.
      vDoku = aDoku + gl_PointCoord * aHucreBoyut;

      // Sis: uzaktaki karakterler kaybolsun, derinlik hissi artsın.
      vSis = smoothstep(0.0, 1.0, (-mv.z - 3.0) / 14.0);
      vParlaklik = 0.55 + 0.45 * sin(uZaman * 1.4 + aFaz);
    }
  `;

  const FS = `
    precision mediump float;

    uniform sampler2D uAtlas;
    uniform vec3 uRenkYakin;
    uniform vec3 uRenkUzak;
    uniform vec3 uZemin;

    varying vec2 vDoku;
    varying float vSis;
    varying float vParlaklik;

    void main() {
      vec4 d = texture2D(uAtlas, vDoku);
      // Doku harfi beyaz üstüne siyah çiziyor; alfasını kullanıyoruz.
      if (d.a < 0.02) discard;

      vec3 renk = mix(uRenkYakin, uRenkUzak, vSis);
      renk = mix(renk, uZemin, vSis * 0.85);

      gl_FragColor = vec4(renk * vParlaklik, d.a * (1.0 - vSis) * 0.62);
    }
  `;

  // ---------- Yardımcılar ----------
  function shaderYap(gl, tur, kaynak) {
    const s = gl.createShader(tur);
    gl.shaderSource(s, kaynak);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[sahne3d] Shader derlenemedi:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  // Atlas dokusu: tüm karakterleri tek bir canvas'a çiz.
  function atlasYap() {
    const hucreSayi = KARAKTERLER.length;
    const satir = Math.ceil(hucreSayi / ATLAS_SUTUN);
    const canvas = document.createElement('canvas');
    canvas.width = ATLAS_SUTUN * DOKU_HUCRE;
    canvas.height = satir * DOKU_HUCRE;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    KARAKTERLER.forEach(function (k, i) {
      const sut = i % ATLAS_SUTUN;
      const sr = Math.floor(i / ATLAS_SUTUN);
      ctx.font = 'bold ' + Math.round(DOKU_HUCRE * 0.74) + 'px "Yu Gothic", "MS Gothic", "Hiragino Sans", sans-serif';
      ctx.fillText(k, sut * DOKU_HUCRE + DOKU_HUCRE / 2, sr * DOKU_HUCRE + DOKU_HUCRE / 2);
    });
    return { canvas: canvas, satir: satir, hucreSayi: hucreSayi };
  }

  // Karakterin atlas içindeki doku koordinatları (sol-üst köşe + boyut).
  // ÖNEMLİ: küçük bir iç boşluk (pay) bırakılıyor; kenar yumuşatma
  // komşu hücreden piksel sızdırıyor ve harflerin kenarında iz kalıyordu.
  function dokuKordinati(i, satir) {
    const pay = 0.6;
    const sut = i % ATLAS_SUTUN;
    const sr = Math.floor(i / ATLAS_SUTUN);
    const gw = 1 / ATLAS_SUTUN;
    const gh = 1 / satir;
    return {
      x: sut * gw + (gw * (pay / DOKU_HUCRE)),
      y: 1 - (sr + 1) * gh + (gh * (pay / DOKU_HUCRE)),
      w: gw - (gw * (pay * 2 / DOKU_HUCRE)),
      h: gh - (gh * (pay * 2 / DOKU_HUCRE))
    };
  }

  // ---------- Sahneyi kur ----------
  function kur() {
    // Kök elemanı sayfa yoksa ekle (dosya her sayfadan yüklenebilir).
    let kok = document.getElementById(KOK_ID);
    if (!kok) {
      kok = document.createElement('div');
      kok.id = KOK_ID;
      kok.setAttribute('aria-hidden', 'true');
      // Sabit, en arkada, tıklamayı engellemez.
      // z-index -2: video arka plan (-1) bunun ÜSTÜNDE kalır.
      // Video yoksa bu katman tek başına görünür (bkz. index.html'deki geri çekme kodu).
      kok.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:-2', 'pointer-events:none',
        'overflow:hidden', 'transition:opacity .9s ease'
      ].join(';');
      document.body.insertBefore(kok, document.body.firstChild);
    }

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    kok.append(canvas);

    let gl = null;
    try {
      gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' })
        || canvas.getContext('experimental-webgl', { alpha: true });
    } catch (e) { }
    if (!gl) { canvas.remove(); return null; }   // WebGL yok: sessizce vazgeç

    const vs = shaderYap(gl, gl.VERTEX_SHADER, VS);
    const fs = shaderYap(gl, gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { canvas.remove(); return null; }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('[sahne3d] Program bağlanamadı:', gl.getProgramInfoLog(program));
      canvas.remove();
      return null;
    }
    gl.useProgram(program);

    // ---------- Atlas dokusu ----------
    const atlas = atlasYap();
    const doku = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, doku);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // ---------- Parçacık verisi ----------
    // ADET: ekrana göre ayarlanır. Telefonda 60, masaüstünde 150.
    // Neden: mobil GPU'da 150 büyük nokta çizmek ısınmaya yol açıyor.
    const genis = Math.max(window.innerWidth, window.innerHeight);
    const mobil = /Mobi|Android/i.test(navigator.userAgent) || genis < 820;
    const ADET = mobil ? 60 : 150;

    const dunyaY = 16;      // sahnenin dikey yüksekliği (shader ile aynı olmalı)
    const pozisyon = new Float32Array(ADET * 3);
    const dokuKoor = new Float32Array(ADET * 2);
    const hucreBoyut = new Float32Array(ADET * 2);
    const olcek = new Float32Array(ADET);
    const hiz = new Float32Array(ADET);
    const faz = new Float32Array(ADET);

    for (let i = 0; i < ADET; i++) {
      // Dağılım: küp içinde ama z ekseninde dar bir bant (kamera hep karşıdan bakıyor)
      pozisyon[i * 3 + 0] = (Math.random() - 0.5) * 22;      // x
      pozisyon[i * 3 + 1] = (Math.random() - 0.5) * dunyaY;  // y
      pozisyon[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;  // z

      const hucre = Math.floor(Math.random() * atlas.hucreSayi);
      const k = dokuKordinati(hucre, atlas.satir);
      dokuKoor[i * 2 + 0] = k.x;
      dokuKoor[i * 2 + 1] = k.y;
      // Hücrenin atlas içindeki boyutu (shader gl_PointCoord ile çarpar)
      hucreBoyut[i * 2 + 0] = k.w;
      hucreBoyut[i * 2 + 1] = k.h;

      // Ölçek: birkaç karakter büyük ve öne çıksın (çeşitlilik)
      olcek[i] = 22 + Math.random() * 40;
      hiz[i] = (0.12 + Math.random() * 0.3) * (ADET > 100 ? 1 : 1.2);
      faz[i] = Math.random() * Math.PI * 2;
    }

    const bufPoz = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPoz);
    gl.bufferData(gl.ARRAY_BUFFER, pozisyon, gl.STATIC_DRAW);

    const bufDoku = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufDoku);
    gl.bufferData(gl.ARRAY_BUFFER, dokuKoor, gl.STATIC_DRAW);

    const bufHucre = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufHucre);
    gl.bufferData(gl.ARRAY_BUFFER, hucreBoyut, gl.STATIC_DRAW);

    const bufOlcek = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufOlcek);
    gl.bufferData(gl.ARRAY_BUFFER, olcek, gl.STATIC_DRAW);

    const bufHiz = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufHiz);
    gl.bufferData(gl.ARRAY_BUFFER, hiz, gl.STATIC_DRAW);

    const bufFaz = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufFaz);
    gl.bufferData(gl.ARRAY_BUFFER, faz, gl.STATIC_DRAW);

    // ---------- Öznitelikler ----------
    function bagla(isim, buf, boyut) {
      const yer = gl.getAttribLocation(program, isim);
      if (yer < 0) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(yer);
      gl.vertexAttribPointer(yer, boyut, gl.FLOAT, false, 0, 0);
    }
    bagla('aPozisyon', bufPoz, 3);
    bagla('aDoku', bufDoku, 2);
    bagla('aHucreBoyut', bufHucre, 2);
    bagla('aOlcek', bufOlcek, 1);
    bagla('aHiz', bufHiz, 1);
    bagla('aFaz', bufFaz, 1);

    // ---------- Uniform'lar ----------
    const U = {};
    ['uZaman', 'uDunyaYuksekligi', 'uFare', 'uDonus', 'uAtlas',
      'uRenkYakin', 'uRenkUzak', 'uZemin'].forEach(function (ad) {
        U[ad] = gl.getUniformLocation(program, ad);
      });
    gl.uniform1f(U.uDunyaYuksekligi, dunyaY);
    gl.uniform1i(U.uAtlas, 0);

    // ---------- Renkler: temadan okunur ----------
    // ÖNEMLİ: Renkleri CSS değişkenlerinden alıyoruz. Böylece tema
    // değiştiğinde (gündüz/alacakaranlık/gece) sahne de uyum sağlıyor.
    function hexRgb(hex) {
      const h = String(hex || '').trim().replace('#', '');
      if (h.length !== 6) return [0.5, 0.4, 0.9];
      return [
        parseInt(h.slice(0, 2), 16) / 255,
        parseInt(h.slice(2, 4), 16) / 255,
        parseInt(h.slice(4, 6), 16) / 255
      ];
    }
    function renkleriGuncelle() {
      const stil = getComputedStyle(document.documentElement);
      const mor = hexRgb(stil.getPropertyValue('--mor'));
      const soluk = hexRgb(stil.getPropertyValue('--yazi-soluk'));
      const zemin = hexRgb(stil.getPropertyValue('--zemin'));
      // Yakın karakterler tema renginde, uzaktakiler soluk renkte ve sisle karışık
      gl.uniform3fv(U.uRenkYakin, mor);
      gl.uniform3fv(U.uRenkUzak, soluk);
      gl.uniform3fv(U.uZemin, zemin);
    }
    renkleriGuncelle();

    // Tema değişirse renkleri tazele (ayarlar.js data-tema'yı değiştirir)
    try {
      new MutationObserver(renkleriGuncelle).observe(document.documentElement, {
        attributes: true, attributeFilter: ['data-tema']
      });
    } catch (e) { }

    // ---------- Boyutlandırma ----------
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    function boyutla() {
      const g = window.innerWidth, y = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(g * dpr), h = Math.round(y * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    boyutla();
    window.addEventListener('resize', boyutla, { passive: true });

    // ---------- Fare / dokunma: parallax ----------
    const fare = { x: 0, y: 0, hx: 0, hy: 0 };
    function isaretle(cx, cy) {
      fare.hx = (cx / window.innerWidth) * 2 - 1;
      fare.hy = -((cy / window.innerHeight) * 2 - 1);
    }
    window.addEventListener('pointermove', function (e) {
      isaretle(e.clientX, e.clientY);
    }, { passive: true });
    // Cihazın eğimi (mobil): hafif parallax. Desteklenmezse sorun değil.
    window.addEventListener('deviceorientation', function (e) {
      if (e.gamma == null || e.beta == null) return;
      fare.hx = Math.max(-1, Math.min(1, e.gamma / 35));
      fare.hy = Math.max(-1, Math.min(1, (e.beta - 45) / 40));
    }, { passive: true });

    // ---------- Çizim döngüsü ----------
    const AZ_HAREKET = hareketAzMi();
    let durus = false, sonKare = 0, baslangic = performance.now();

    function ciz(zaman) {
      const t = (zaman - baslangic) / 1000;

      // Yumuşak takip: fare hedefi yavaşça yakalanır (ani zıplama olmasın)
      fare.x += (fare.hx - fare.x) * 0.045;
      fare.y += (fare.hy - fare.y) * 0.045;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.disable(gl.DEPTH_TEST);

      gl.uniform1f(U.uZaman, t);
      gl.uniform2f(U.uFare, fare.x, fare.y);
      gl.uniform1f(U.uDonus, t * 0.018);

      gl.drawArrays(gl.POINTS, 0, ADET);
    }

    // Hareket azaltma tercihi: SAHNENİN VARLIĞI korunur ama tek kare çizilir.
    // Neden tamamen kaldırmıyoruz: kullanıcı görsel olarak sahneden hoşlanıyor
    // ama hareket istemiyor olabilir. Durağan sahne ikisini de karşılar.
    if (AZ_HAREKET) {
      ciz(performance.now());
      return { durdur: function () { }, ciz: ciz };
    }

    function dongu(zaman) {
      if (durus) return;
      // 30 FPS hedefi: dekoratif bir katman için 60 FPS gereksiz,
      // pil/CPU tasarrufu sağlıyor.
      if (zaman - sonKare >= 32) {
        sonKare = zaman;
        ciz(zaman);
      }
      requestAnimationFrame(dongu);
    }
    requestAnimationFrame(dongu);

    // ---------- Sekme arka planda: durdur ----------
    function gorunurluk() {
      durus = document.hidden;
      if (!durus) {
        baslangic = performance.now() - (sonKare || 0);
        sonKare = 0;
        requestAnimationFrame(dongu);
      }
    }
    document.addEventListener('visibilitychange', gorunurluk);

    return {
      durdur: function () { durus = true; },
      ciz: ciz
    };
  }

  // ---------- Başlat ----------
  function baslat() {
    if (animasyonKapaliMi()) return null;
    if (!document.body) return null;
    try {
      return kur();
    } catch (e) {
      console.warn('[sahne3d] Sahne kurulamadı:', (e && e.message) || e);
      return null;
    }
  }

  // body hazır olunca kur (script head'de de çağrılabilir)
  let sahne = null;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { sahne = baslat(); });
  } else {
    sahne = baslat();
  }

  window.Sahne3D = {
    baslat: baslat,
    // Ayar değişince sahneyi aç/kapat (ayarlar sayfası çağırabilir)
    yenile: function () {
      const kok = document.getElementById(KOK_ID);
      if (kok) kok.remove();
      if (sahne && sahne.durdur) sahne.durdur();
      sahne = baslat();
    },
    // Test/geliştirme kolaylığı
    durum: function () {
      return {
        kuruldu: !!document.getElementById(KOK_ID),
        kapali: animasyonKapaliMi(),
        hareketAz: hareketAzMi()
      };
    }
  };
})();