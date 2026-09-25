#!/usr/bin/env python3
"""
Sakar Paisen ses üreticisi (Gemini TTS, ses: Sulafat)

Kurulum (bir kere):
    pip install google-genai
    export GEMINI_API_KEY="..."        # anahtar: https://aistudio.google.com/apikey
                                        # Windows PowerShell:  $env:GEMINI_API_KEY="..."

Kullanım (proje klasöründen):
    python ses-uret/uret.py --deneme            # API'ye gitmeden ne üreteceğini gösterir
    python ses-uret/uret.py                     # eksik olan tüm sesleri üretir
    python ses-uret/uret.py --grup kana         # sadece harf sesleri
    python ses-uret/uret.py --sadece ka,shi,tsu # sadece bu dosyalar
    python ses-uret/uret.py --yeniden --sadece n   # var olanı silip baştan üret
    python ses-uret/uret.py --mp3               # ffmpeg varsa mp3 yap (daha küçük)
    python ses-uret/uret.py --indeks            # API'siz: audio/ altındaki dosyaları oyuna tanıt (elle indirdiklerin için)

Ortak Scene / Director's Notes / Sample Context sesler.json içinde. Hepsi aynı ayarla üretilir.
Her ses için dosya adı ve metin de sesler.json'da (gruplar -> ogeler).
Çıktı: audio/kana/<romaji>.wav, audio/sensei/<ad>.wav ve her klasörde index.json (oyun bunu okur).
Var olan dosyalar atlanır, yani yarıda kesilirse tekrar çalıştırman yeterli.
"""
import argparse, json, os, shutil, subprocess, sys, time, wave
from array import array
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
AYAR = Path(__file__).resolve().parent / "sesler.json"
HIZ = 24000  # Gemini TTS çıktısı: 24 kHz, 16 bit, mono PCM


def prompt_olustur(cfg, metin):
    """Ortak Scene/Notes/Context + o sesin metni. Başındaki uyarı, modelin yönergeleri sesli okumasını engeller."""
    return (
        "Synthesize speech (TTS). Speak ONLY the text under \"TRANSCRIPT\". "
        "Never read the profile, scene, director's notes or sample context aloud.\n\n"
        f"# AUDIO PROFILE: {cfg['profil']['ad']}\n"
        f"## \"{cfg['profil']['rol']}\"\n\n"
        f"## THE SCENE: {cfg['sahne_baslik']}\n{cfg['sahne']}\n\n"
        f"### DIRECTOR'S NOTES\n{cfg['yonerge']}\n\n"
        f"### SAMPLE CONTEXT\n{cfg['ornek_baglam']}\n\n"
        f"#### TRANSCRIPT\n{metin}"
    )


def pcm_al(client, cfg, metin):
    """Gemini'den ham PCM ister. Sadece bu fonksiyon API'ye dokunur."""
    from google.genai import types
    yanit = client.models.generate_content(
        model=cfg["model"],
        contents=prompt_olustur(cfg, metin),
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=cfg["ses"])
                )
            ),
        ),
    )
    veri = yanit.candidates[0].content.parts[0].inline_data.data
    if not veri:
        raise RuntimeError("Yanıtta ses verisi yok")
    return veri


def kirp_ve_esitle(pcm, esik=400, pay_ms=60, hedef_tepe=0.8):
    """Baştaki/sondaki sessizliği kırpar (oyunda ses anında başlasın) ve tüm dosyaları benzer seviyeye getirir."""
    pcm = pcm[: len(pcm) // 2 * 2]
    a = array("h"); a.frombytes(pcm)
    if sys.byteorder == "big": a.byteswap()
    n = len(a)
    bas = 0
    while bas < n and abs(a[bas]) < esik: bas += 1
    if bas >= n: return pcm                       # tamamen sessiz, dokunma
    son = n - 1
    while son > bas and abs(a[son]) < esik: son -= 1
    pay = int(HIZ * pay_ms / 1000)
    kes = a[max(0, bas - pay): min(n, son + pay + 1)]
    tepe = max(abs(x) for x in kes)
    if tepe > 500:
        k = hedef_tepe * 32767 / tepe
        kes = array("h", (max(-32768, min(32767, int(x * k))) for x in kes))
    if sys.byteorder == "big": kes.byteswap()
    return kes.tobytes()


def wav_yaz(yol, pcm):
    with wave.open(str(yol), "wb") as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(HIZ)
        wf.writeframes(pcm)


def mp3_yap(wav_yol):
    mp3 = wav_yol.with_suffix(".mp3")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_yol), "-codec:a", "libmp3lame", "-qscale:a", "4", str(mp3)], check=True)
    wav_yol.unlink()
    return mp3


def indeks_yaz(klasor):
    """klasördeki sesleri {ad: dosya} olarak index.json'a yazar; oyun sadece burada listelenenleri çalar."""
    if not klasor.exists(): return
    liste = {}
    for f in sorted(klasor.iterdir()):
        if f.suffix in (".wav", ".mp3") and (f.stem not in liste or f.suffix == ".mp3"):
            liste[f.stem] = f.name
    (klasor / "index.json").write_text(json.dumps(liste, ensure_ascii=False, indent=1), encoding="utf-8")


def var_mi(klasor, ad):
    return any((klasor / (ad + ext)).exists() for ext in (".wav", ".mp3"))


def uret(client, cfg, metin, deneme_sayisi=5):
    """Geçici hatalarda (500, kota, ses yerine metin dönmesi) üstel bekleme ile tekrar dener."""
    for d in range(1, deneme_sayisi + 1):
        try:
            return pcm_al(client, cfg, metin)
        except Exception as e:
            kota = "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e)
            bekle = min(60, (20 if kota else 3) * 2 ** (d - 1))
            print(f"    ! deneme {d}/{deneme_sayisi} başarısız: {str(e)[:120]}")
            if d == deneme_sayisi: raise
            print(f"      {bekle} sn bekleniyor...")
            time.sleep(bekle)


def main(argv=None):
    p = argparse.ArgumentParser(description="Sakar Paisen ses üreticisi")
    p.add_argument("--grup", help="sadece bu grup (kana, sensei)")
    p.add_argument("--sadece", help="virgülle dosya adları (ör: ka,shi,dogru-1)")
    p.add_argument("--yeniden", action="store_true", help="var olan dosyaların üstüne yaz")
    p.add_argument("--deneme", action="store_true", help="API'ye gitme, sadece planı ve örnek prompt'u göster")
    p.add_argument("--mp3", action="store_true", help="ffmpeg ile mp3'e çevir")
    p.add_argument("--indeks", action="store_true", help="API'ye gitme, sadece index.json dosyalarını yenile")
    p.add_argument("--bekle", type=float, default=2.0, help="istekler arası saniye (kota için)")
    a = p.parse_args(argv)

    cfg = json.loads(AYAR.read_text(encoding="utf-8"))
    if a.indeks:
        for g in cfg["gruplar"]:
            indeks_yaz(KOK / g["klasor"])
            n = len(json.loads((KOK / g["klasor"] / "index.json").read_text(encoding="utf-8"))) if (KOK / g["klasor"] / "index.json").exists() else 0
            print(f"{g['klasor']}: {n}/{len(g['ogeler'])} ses oyuna tanıtıldı")
        return
    sadece = set(a.sadece.split(",")) if a.sadece else None
    if a.mp3 and not shutil.which("ffmpeg"):
        sys.exit("--mp3 için ffmpeg gerekli (kurulu değil). Onsuz WAV üretebilirsin.")

    plan = []
    for g in cfg["gruplar"]:
        if a.grup and g["ad"] != a.grup: continue
        klasor = KOK / g["klasor"]
        for o in g["ogeler"]:
            if sadece and o["dosya"] not in sadece: continue
            if not a.yeniden and var_mi(klasor, o["dosya"]): continue
            plan.append((klasor, o))

    print(f"Ses: {cfg['ses']} | Model: {cfg['model']} | Üretilecek: {len(plan)} dosya")
    if not plan:
        for g in cfg["gruplar"]: indeks_yaz(KOK / g["klasor"])
        return print("Yapılacak bir şey yok (hepsi zaten var).")

    if a.deneme:
        for klasor, o in plan: print(f"  {klasor.relative_to(KOK)}/{o['dosya']}   <-  {o['metin']}")
        print("\n--- örnek prompt (ilk ses) ---\n" + prompt_olustur(cfg, plan[0][1]["metin"]))
        return

    try:
        from google import genai
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"))
    except ImportError:
        sys.exit("google-genai kurulu değil:  pip install google-genai")
    if not (os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")):
        sys.exit("GEMINI_API_KEY tanımlı değil. Anahtar: https://aistudio.google.com/apikey")

    hatalar = []
    for i, (klasor, o) in enumerate(plan, 1):
        ad = o["dosya"]
        print(f"[{i}/{len(plan)}] {klasor.name}/{ad}  <-  {o['metin']}")
        try:
            pcm = kirp_ve_esitle(uret(client, cfg, o["metin"]))
            klasor.mkdir(parents=True, exist_ok=True)
            for ext in (".wav", ".mp3"):                       # eski sürümü temizle
                (klasor / (ad + ext)).unlink(missing_ok=True)
            yol = klasor / (ad + ".wav")
            wav_yaz(yol, pcm)
            if a.mp3: yol = mp3_yap(yol)
            print(f"    ok  {yol.name}  ({len(pcm) / 2 / HIZ:.2f} sn)")
            indeks_yaz(klasor)                                   # yarıda kesilse bile indeks güncel
        except Exception as e:
            print(f"    HATA: {e}")
            hatalar.append(ad)
        time.sleep(a.bekle)

    for g in cfg["gruplar"]: indeks_yaz(KOK / g["klasor"])
    print(f"\nBitti. Başarılı: {len(plan) - len(hatalar)}, hatalı: {len(hatalar)}")
    if hatalar:
        print("Tekrar dene:  python ses-uret/uret.py --sadece " + ",".join(hatalar))
        sys.exit(1)
    print("Not: Offline için sw.js içindeki CACHE_NAME'i bir arttır.")


if __name__ == "__main__":
    main()
