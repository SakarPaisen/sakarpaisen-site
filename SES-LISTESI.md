# SES DOSYALARI — ÜRETİLECEK LİSTE

Bu dosya, oyuna eklenecek **tüm ses kayıtlarını** madde madde listeler.
Sen kayıtları üretip klasörlere koyduğunda oyun onları otomatik çalar
(tarayıcı sesi yerine). `ses.js` her harfte önce kaydı arar, yoksa tarayıcı sesine düşer.

---

## NASIL ÇALIŞIR (özet)

| Klasör | Ne konur | Dosya adı |
|---|---|---|
| `audio/kana/` | Harf okunuşları | `<romaji>.wav` — ör. `ka.wav`, `shi.wav` |
| `audio/sensei/` | Sensei'nin Türkçe replikleri | `<ad>.wav` — ör. `dogru-1.wav` |

Her klasöre bir **`index.json`** koymak gerekir: o klasörde hangi dosyalar varsa
adlarını listeleyen bir dizi. Örnek `audio/kana/index.json`:

```json
["a", "i", "u", "e", "o", "ka", "ki"]
```

Sadece ürettiğin dosyaları yaz. Olmayan harf için oyun tarayıcı sesini kullanır.

> **Kolay yol:** `python ses-uret/uret.py --indeks` komutu `audio/` altındaki
> dosyaları tarar ve `index.json`'ları **senin için** yazar. Yani JSON'u elle
> yazman gerekmez — dosyaları koy, bu komutu çalıştır.

---

## 1) HARF SESLERİ — `audio/kana/` (104 dosya)

Her dosya **tek bir hecenin** okunuşu. Hiragana ve Katakana **aynı sesi** kullanır,
o yüzden her hece için tek dosya yeterli (ör. `a.wav` hem あ hem ア için çalınır).

### 1a. Temel heceler (46 dosya)

| Dosya | Hece | Yazılış (H / K) |
|---|---|---|
| `a.wav` | a | あ / ア |
| `i.wav` | i | い / イ |
| `u.wav` | u | う / ウ |
| `e.wav` | e | え / エ |
| `o.wav` | o | お / オ |
| `ka.wav` | ka | か / カ |
| `ki.wav` | ki | き / キ |
| `ku.wav` | ku | く / ク |
| `ke.wav` | ke | け / ケ |
| `ko.wav` | ko | こ / コ |
| `sa.wav` | sa | さ / サ |
| `shi.wav` | shi | し / シ |
| `su.wav` | su | す / ス |
| `se.wav` | se | せ / セ |
| `so.wav` | so | そ / ソ |
| `ta.wav` | ta | た / タ |
| `chi.wav` | chi | ち / チ |
| `tsu.wav` | tsu | つ / ツ |
| `te.wav` | te | て / テ |
| `to.wav` | to | と / ト |
| `na.wav` | na | な / ナ |
| `ni.wav` | ni | に / ニ |
| `nu.wav` | nu | ぬ / ヌ |
| `ne.wav` | ne | ね / ネ |
| `no.wav` | no | の / ノ |
| `ha.wav` | ha | は / ハ |
| `hi.wav` | hi | ひ / ヒ |
| `fu.wav` | fu | ふ / フ |
| `he.wav` | he | へ / ヘ |
| `ho.wav` | ho | ほ / ホ |
| `ma.wav` | ma | ま / マ |
| `mi.wav` | mi | み / ミ |
| `mu.wav` | mu | む / ム |
| `me.wav` | me | め / メ |
| `mo.wav` | mo | も / モ |
| `ya.wav` | ya | や / ヤ |
| `yu.wav` | yu | ゆ / ユ |
| `yo.wav` | yo | よ / ヨ |
| `ra.wav` | ra | ら / ラ |
| `ri.wav` | ri | り / リ |
| `ru.wav` | ru | る / ル |
| `re.wav` | re | れ / レ |
| `ro.wav` | ro | ろ / ロ |
| `wa.wav` | wa | わ / ワ |
| `wo.wav` | wo | を / ヲ |
| `n.wav` | n | ん / ン |

### 1b. Dakuten — yumuşak sesler (25 dosya)

゛ işaretiyle ses yumuşar: k→g, s→z, t→d, h→b

| Dosya | Hece | Yazılış (H / K) |
|---|---|---|
| `ga.wav` | ga | が / ガ |
| `gi.wav` | gi | ぎ / ギ |
| `gu.wav` | gu | ぐ / グ |
| `ge.wav` | ge | げ / ゲ |
| `go.wav` | go | ご / ゴ |
| `za.wav` | za | ざ / ザ |
| `ji.wav` | ji | じ / ジ |
| `zu.wav` | zu | ず / ズ |
| `ze.wav` | ze | ぜ / ゼ |
| `zo.wav` | zo | ぞ / ゾ |
| `da.wav` | da | だ / ダ |
| `ji2.wav` | ji (ぢ) | ぢ / ヂ |
| `zu2.wav` | zu (づ) | づ / ヅ |
| `de.wav` | de | で / デ |
| `do.wav` | do | ど / ド |
| `ba.wav` | ba | ば / バ |
| `bi.wav` | bi | び / ビ |
| `bu.wav` | bu | ぶ / ブ |
| `be.wav` | be | べ / ベ |
| `bo.wav` | bo | ぼ / ボ |
| `pa.wav` | pa | ぱ / パ |
| `pi.wav` | pi | ぴ / ピ |
| `pu.wav` | pu | ぷ / プ |
| `pe.wav` | pe | ぺ / ペ |
| `po.wav` | po | ぽ / ポ |

> **Not:** `ji2.wav` ve `zu2.wav` (ぢ / づ) çok nadir kullanılır ve `ji.wav`/`zu.wav`
> ile **aynı** okunur. İstersen bunları atla — oyun o durumda `ji.wav`/`zu.wav`
> sesini kullanır (aynı ses olduğu için fark edilmez).

### 1c. Youon — birleşik sesler (33 dosya)

Küçük ゃ/ゅ/ょ ile birleşince **tek hece** olur.

| Dosya | Hece | Yazılış (H / K) |
|---|---|---|
| `kya.wav` | kya | きゃ / キャ |
| `kyu.wav` | kyu | きゅ / キュ |
| `kyo.wav` | kyo | きょ / キョ |
| `sha.wav` | sha | しゃ / シャ |
| `shu.wav` | shu | しゅ / シュ |
| `sho.wav` | sho | しょ / ショ |
| `cha.wav` | cha | ちゃ / チャ |
| `chu.wav` | chu | ちゅ / チュ |
| `cho.wav` | cho | ちょ / チョ |
| `nya.wav` | nya | にゃ / ニャ |
| `nyu.wav` | nyu | にゅ / ニュ |
| `nyo.wav` | nyo | にょ / ニョ |
| `hya.wav` | hya | ひゃ / ヒャ |
| `hyu.wav` | hyu | ひゅ / ヒュ |
| `hyo.wav` | hyo | ひょ / ヒョ |
| `mya.wav` | mya | みゃ / ミャ |
| `myu.wav` | myu | みゅ / ミュ |
| `myo.wav` | myo | みょ / ミョ |
| `rya.wav` | rya | りゃ / リャ |
| `ryu.wav` | ryu | りゅ / リュ |
| `ryo.wav` | ryo | りょ / リョ |
| `gya.wav` | gya | ぎゃ / ギャ |
| `gyu.wav` | gyu | ぎゅ / ギュ |
| `gyo.wav` | gyo | ぎょ / ギョ |
| `ja.wav` | ja | じゃ / ジャ |
| `ju.wav` | ju | じゅ / ジュ |
| `jo.wav` | jo | じょ / ジョ |
| `bya.wav` | bya | びゃ / ビャ |
| `byu.wav` | byu | びゅ / ビュ |
| `byo.wav` | byo | びょ / ビョ |
| `pya.wav` | pya | ぴゃ / ピャ |
| `pyu.wav` | pyu | ぴゅ / ピュ |
| `pyo.wav` | pyo | ぴょ / ピョ |

---

## 2) SENSEI REPLİKLERİ — `audio/sensei/` (10 dosya)

Sensei'nin **Türkçe** sesli tepkileri. Ses tonu: sıcak, destekleyici bir öğretmen.

| Dosya | Ne zaman çalar | Önerilen metin |
|---|---|---|
| `dogru-1.wav` | Doğru cevap (rastgele 4'ten biri) | "Harika!" |
| `dogru-2.wav` | Doğru cevap | "Aynen öyle!" |
| `dogru-3.wav` | Doğru cevap | "Tam isabet!" |
| `dogru-4.wav` | Doğru cevap | "Süpersin!" |
| `yanlis-1.wav` | Yanlış cevap (rastgele 2'den biri) | "Olsun, bir daha bakalım." |
| `yanlis-2.wav` | Yanlış cevap | "Neredeyse buldun!" |
| `ders-bitti.wav` | Ders tamamlandığında | "Ders tamam! Çok iyi gidiyorsun." |
| `tekrar-bitti.wav` | Tekrar dersi bittiğinde | "Tekrar tamam, harfler iyice yerleşti." |
| `hedef-tamam.wav` | Günlük XP hedefi tutulduğunda | "Günlük hedefini tamamladın, bravo!" |
| `can-bitti.wav` | Canlar tükendiğinde | "Canların bitti ama sorun değil. Tekrar denersen aklında kalır." |

---

## 3) TEKNİK ŞARTLAR

| Özellik | Değer |
|---|---|
| Biçim | **WAV** (16-bit PCM, mono) — oyun bu biçimi bekler |
| Örnekleme | 24 kHz (Gemini TTS'in çıktısı) veya 44.1 kHz |
| Süre | **0.6 – 1.5 saniye** (harf sesleri kısa olmalı) |
| Ses düzeyi | Tüm dosyalar **aynı** seviyede olsun (normalize) |
| Baş/son sessizlik | Kırpılmış (başta uzun boşluk olmasın) |

İsimlendirme **küçük harf ve tam bu listedeki gibi** olmalı. Boşluk, büyük harf,
Türkçe karakter **kullanma**.

---

## 4) KLASÖR YAPISI (son hâli)

```
SakarPaisen/
  audio/
    kana/
      index.json      <- python ses-uret/uret.py --indeks yazar
      a.wav
      i.wav
      ka.wav
      ...
    sensei/
      index.json
      dogru-1.wav
      ders-bitti.wav
      ...
```

---

## 5) EKLENDİKTEN SONRA YAPILACAK (2 adım)

1. **`index.json`'ları üret** (dosya adlarını oyuna tanıtır):
   ```
   python ses-uret/uret.py --indeks
   ```

2. **`ses.js` içinde kayıtları AÇ.** Şu satırı bul ve `true` yap:
   ```javascript
   const SES_KAYDI_VAR = false;   //  ->  true
   ```
   Bunu yapmazsan oyun kayıtları hiç aramaz, tarayıcı sesiyle devam eder.

3. **`sw.js` içindeki `CACHE_NAME`'i bir artır** (ör. `v14` → `v15`).
   Böylece offline önbelleği yenilenir ve yeni sesler cihazlara iner.

---

## 6) KONTROL LİSTESİ

- [ ] 46 temel harf sesi (`a` … `n`)
- [ ] 25 dakuten sesi (`ga` … `po`) — `ji2`/`zu2` isteğe bağlı
- [ ] 33 youon sesi (`kya` … `pyo`)
- [ ] 10 sensei repliği
- [ ] Tüm dosyalar `audio/kana/` ve `audio/sensei/` altında
- [ ] Dosya adları tam listedeki gibi (küçük harf, boşluksuz)
- [ ] `python ses-uret/uret.py --indeks` çalıştırıldı
- [ ] `ses.js` → `SES_KAYDI_VAR = true`
- [ ] `sw.js` → `CACHE_NAME` artırıldı
