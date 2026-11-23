#!/usr/bin/env python3
"""Lironta demo: medijos paruosimas.

    python3 tools/media.py photos                      # Pexels nuotraukos -> assets/img/photos/*.webp
    python3 tools/media.py products                    # produktu nuotraukos is lironta.lt -> assets/img/products/*.webp
    python3 tools/media.py videos --raw DIR --ffmpeg F # Pexels video (1080p originalai DIR/<src>.mp4) -> assets/video/*.mp4 + plakatai
    python3 tools/media.py credits                     # docs/pexels-credits.md

Reikia: curl, Pillow; video daliai ffmpeg (pvz. is paketo imageio-ffmpeg).
Atsisiunciami failai laikomi laikiname kataloge (--tmp), i projekta rasomi tik konvertuoti rezultatai.
"""
import argparse, json, pathlib, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
MEDIA = json.loads((ROOT / 'src/data/media.json').read_text('utf-8'))
PHOTOS = ROOT / 'assets/img/photos'
PRODUCTS = ROOT / 'assets/img/products'
VIDEO = ROOT / 'assets/video'


def curl(url, dest):
    r = subprocess.run(['curl', '-sL', '--fail', '-o', str(dest), url])
    return r.returncode == 0 and dest.exists() and dest.stat().st_size > 500


def photos(tmp):
    from PIL import Image
    PHOTOS.mkdir(parents=True, exist_ok=True)
    for p in MEDIA['photos']:
        raw = tmp / f"{p['id']}.jpg"
        url = f"https://images.pexels.com/photos/{p['id']}/pexels-photo-{p['id']}.jpeg?auto=compress&cs=tinysrgb&w={p['w']}"
        if not raw.exists() and not curl(url, raw):
            print('NEPAVYKO', p['id']); continue
        im = Image.open(raw).convert('RGB')
        im.save(PHOTOS / f"{p['file']}.webp", 'WEBP', quality=74, method=6)
        sm = im.copy(); sm.thumbnail((800, 800 * 3))
        sm.save(PHOTOS / f"{p['file']}-sm.webp", 'WEBP', quality=72, method=6)
        print(f"{p['file']:28s} {im.size[0]}x{im.size[1]}")


def products(tmp):
    from PIL import Image
    PRODUCTS.mkdir(parents=True, exist_ok=True)
    cat = json.loads((ROOT / 'src/data/catalog.json').read_text('utf-8'))
    seen = {}
    for c in cat['categories']:
        for pr in c.get('products', []):
            for im in pr.get('images', []):
                seen[im['src']] = im['file']
        for g in c.get('groups', []):
            if g.get('image'): seen[g['image']['src']] = g['image']['file']
    for k in cat.get('catalogs', []):
        seen[k['cover']['src']] = k['cover']['file']
    for i, (url, name) in enumerate(seen.items()):
        out = PRODUCTS / f"{name}.webp"
        if out.exists(): continue
        raw = tmp / f"p{i}{pathlib.Path(url).suffix.lower()}"
        if not curl(url, raw):
            print('NEPAVYKO', url); continue
        img = Image.open(raw)
        img = img.convert('RGBA') if img.mode in ('RGBA', 'LA', 'P') else img.convert('RGB')
        img.save(out, 'WEBP', quality=86, method=6)
    print('produktu nuotrauku:', len(seen))


def ff(ffmpeg, *args):
    r = subprocess.run([ffmpeg, '-v', 'error', '-y', *args])
    if r.returncode: sys.exit(f'ffmpeg klaida: {args}')


def poster(ffmpeg, mp4, out_webp, at=0.2):
    from PIL import Image
    png = out_webp.with_suffix('.png')
    ff(ffmpeg, '-ss', str(at), '-i', str(mp4), '-frames:v', '1', str(png))
    Image.open(png).convert('RGB').save(out_webp, 'WEBP', quality=70, method=6)
    png.unlink()


def encode(ffmpeg, src, out, w, ss, t, crf):
    ff(ffmpeg, '-ss', str(ss), '-t', str(t), '-i', str(src),
       '-vf', f'scale={w}:-2:flags=lanczos,fps=25,format=yuv420p',
       '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-profile:v', 'high',
       '-an', '-movflags', '+faststart', str(out))


def videos(raw, ffmpeg, tmp):
    VIDEO.mkdir(parents=True, exist_ok=True)
    for v in MEDIA['videos']:
        out = VIDEO / f"{v['out']}.mp4"
        encode(ffmpeg, raw / f"{v['src']}.mp4", out, v['w'], v['ss'], v['t'], v['crf'])
        poster(ffmpeg, out, VIDEO / f"{v['out']}.webp")
        print(f"{out.name:22s} {out.stat().st_size / 1e6:.2f} MB")
    r = MEDIA['reel']
    parts = []
    for i, (src, ss, t) in enumerate(r['parts']):
        part = tmp / f'reel{i}.mp4'
        encode(ffmpeg, raw / f'{src}.mp4', part, r['w'], ss, t, 20)
        parts.append(part)
    lst = tmp / 'reel.txt'
    lst.write_text(''.join(f"file '{p}'\n" for p in parts))
    joined = tmp / 'reel-joined.mp4'
    ff(ffmpeg, '-f', 'concat', '-safe', '0', '-i', str(lst), '-c', 'copy', str(joined))
    out = VIDEO / f"{r['out']}.mp4"
    ff(ffmpeg, '-i', str(joined), '-c:v', 'libx264', '-preset', 'slow', '-crf', str(r['crf']),
       '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', str(out))
    poster(ffmpeg, out, VIDEO / f"{r['out']}.webp", 1.0)
    print(f"{out.name:22s} {out.stat().st_size / 1e6:.2f} MB")


def credits():
    lines = ['# Pexels medija', '',
             'Visos nuotraukos ir video is [Pexels](https://www.pexels.com) (Pexels licencija: nemokamas naudojimas, autoriaus nurodyti nebutina, bet pageidautina). '
             'Nuotraukos konvertuotos i WebP (pilnas dydis ir `-sm` 800 px). Video apkarpyti, be garso, H.264 (CRF 26-28, 25 kadrai/s, `faststart`), plakatai `*.webp` yra pirmasis kadras.', '',
             '## Video', '', '| Failas | Kur naudojama | Pexels ID | Autorius |', '|---|---|---|---|']
    for v in MEDIA['videos']:
        lines.append(f"| `assets/video/{v['out']}.mp4` | {v['use']} | [{v['id']}](https://www.pexels.com/video/{v['id']}/) | {v['author']} |")
    r = MEDIA['reel']
    lines.append(f"| `assets/video/{r['out']}.mp4` | {r['use']} (montazas is auksciau nurodytu ir 39235907) | keli | {r['author']} |")
    lines += ['', '## Nuotraukos', '', '| Failas | Kur naudojama | Pexels ID | Autorius |', '|---|---|---|---|']
    for p in MEDIA['photos']:
        lines.append(f"| `assets/img/photos/{p['file']}.webp` | {p['use']} | [{p['id']}](https://www.pexels.com/photo/{p['id']}/) | {p['author']} |")
    lines += ['', 'Produktu nuotraukos, logotipas ir katalogu virseliai yra is dabartines lironta.lt svetaines.', '']
    (ROOT / 'docs/pexels-credits.md').write_text('\n'.join(lines), 'utf-8')
    print('docs/pexels-credits.md')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('what', choices=['photos', 'products', 'videos', 'credits'])
    ap.add_argument('--raw', type=pathlib.Path)
    ap.add_argument('--ffmpeg', default='ffmpeg')
    ap.add_argument('--tmp', type=pathlib.Path)
    a = ap.parse_args()
    tmp = a.tmp or pathlib.Path(tempfile.mkdtemp(prefix='lironta-media-'))
    tmp.mkdir(parents=True, exist_ok=True)
    if a.what == 'photos': photos(tmp)
    elif a.what == 'products': products(tmp)
    elif a.what == 'videos': videos(a.raw, a.ffmpeg, tmp)
    else: credits()
