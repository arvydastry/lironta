#!/usr/bin/env python3
"""Lironta demo: surinkimas.   Naudojimas: python3 build.py

src/pages/*.html + src/partials/*.html  ->  *.html projekto saknyje
src/data/catalog.json                    ->  assets/js/data.js (window.LIRONTA)

Sablonu zymes:
  {{> dalis}}        src/partials/dalis.html
  {{i:vardas}}       Phosphor ikona is src/partials/icons.svg
  {{rhino}}          raganosio SVG (assets/img/brand/rhino.svg) iterptas i HTML
  {{gen:vardas}}     Python generuojamas blokas (zr. GEN)
  {{kintamasis}}     reiksme is puslapio <!--meta {...}--> bloko
Tik standartine Python biblioteka.
"""
import html, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'
CAT = json.loads((SRC / 'data/catalog.json').read_text('utf-8'))
E = html.escape


def icon(name, cls='ic'):
    return f'<svg class="{cls}" aria-hidden="true" focusable="false"><use href="#i-{name}"/></svg>'


def pimg(file):
    return f'assets/img/products/{file}.webp'


TILES = {  # reprezentatyvesnė nuotrauka kategorijos plytelei
    'klojiniu-priedai-betonavimui': '2017-08-poverzle1-1',
    'betoniniai-armaturos-fiksatoriai': '2017-08-armaturos-fiksatorius-betoninis-kaulas130',
    'klojiniu-alyva-tepalai': '2017-08-tepalai1',
}


def first_img(c):
    if c['slug'] in TILES:
        return TILES[c['slug']]
    for p in c['products']:
        if p['images']:
            return p['images'][0]['file']
    g = c.get('groups') or []
    return g[0]['image']['file'] if g else ''


def plural(n, one, few, many):
    """Lietuviskos daugiskaitos formos: 1 produktas, 2 produktai, 10 produktu."""
    if n % 10 == 1 and n % 100 != 11:
        return f'{n} {one}'
    if 2 <= n % 10 <= 9 and not 11 <= n % 100 <= 19:
        return f'{n} {few}'
    return f'{n} {many}'


def count_label(c):
    if c['slug'] == 'klojiniu-alyva-tepalai':
        return plural(len(c.get('groups', [])), 'produktų grupė', 'produktų grupės', 'produktų grupių')
    return plural(len(c['products']), 'produktas', 'produktai', 'produktų')


# ---------------------------------------------------------------- generuojami blokai
def gen_mega():
    out = []
    for i, c in enumerate(CAT['categories']):
        out.append(f'''<a class="mega__item" href="produkcija.html?k={c['slug']}" style="--i:{i}">
  <span class="mega__thumb"><img src="{pimg(first_img(c))}" alt="" loading="lazy" decoding="async"></span>
  <span class="mega__txt"><span class="mega__name">{E(c['name'])}</span><span class="mega__count">{count_label(c)}</span></span>
</a>''')
    return '\n'.join(out)


def gen_mobile_cats():
    return '\n'.join(f'<li><a href="produkcija.html?k={c["slug"]}">{E(c["short"])}</a></li>' for c in CAT['categories'])


def gen_footer_cats():
    return '\n'.join(f'<li><a href="produkcija.html?k={c["slug"]}">{E(c["short"])}</a></li>' for c in CAT['categories'])


def gen_marquee():
    codes = []
    for c in CAT['categories']:
        for p in c['products']:
            if p['code'] and p['code'] not in codes and len(p['code']) <= 5:
                codes.append(p['code'])
    items = ''.join(f'<span class="mq__item{" mq__item--o" if i % 3 == 1 else ""}">{E(code)}</span><span class="mq__sep" aria-hidden="true">/</span>' for i, code in enumerate(codes[:34]))
    return f'<div class="mq__group">{items}</div><div class="mq__group" aria-hidden="true">{items}</div>'


def gen_cat_panels():
    out = []
    for c in CAT['categories']:
        img = first_img(c)
        video = f'<video class="cpanel__video" muted loop playsinline preload="none" data-src="assets/video/{c["video"]}.mp4"></video>' if c.get('video') else ''
        out.append(f'''<a class="cpanel" href="produkcija.html?k={c['slug']}">
  <div class="cpanel__media">
    <div class="cpanel__pan">
      <img class="cpanel__photo" src="assets/img/photos/{c['photo']}.webp" alt="" loading="lazy" decoding="async">
      {video}
    </div>
  </div>
  <div class="cpanel__tile"><img src="{pimg(img)}" alt="" loading="lazy" decoding="async"></div>
  <div class="cpanel__body">
    <span class="cpanel__count">{count_label(c)}</span>
    <h3 class="cpanel__title">{E(c['name'])}</h3>
    <p class="cpanel__desc">{E(c['desc'])}</p>
    <span class="cpanel__more">Peržiūrėti {icon('arrow-right')}</span>
  </div>
</a>''')
    return '\n'.join(out)


def gen_catalog_rows():
    out = []
    for i, k in enumerate(CAT['catalogs']):
        out.append(f'''<li class="kat__row" data-i="{i}">
  <a href="{E(k['pdf'])}" target="_blank" rel="noopener">
    <span class="kat__name">{E(k['name'])}</span>
    <span class="kat__meta">PDF {icon('download-simple')}</span>
  </a>
</li>''')
    return '\n'.join(out)


def gen_catalog_covers():
    return '\n'.join(
        f'<figure class="kat__cover" data-i="{i}"><img src="{pimg(k["cover"]["file"])}" alt="{E(k["name"])}, viršelis" loading="lazy" decoding="async"></figure>'
        for i, k in enumerate(CAT['catalogs']))


def gen_cat_tabs():
    return '\n'.join(
        f'<a class="ctabs__tab" href="produkcija.html?k={c["slug"]}" data-slug="{c["slug"]}"><img src="{pimg(first_img(c))}" alt="" loading="lazy"><span>{E(c["short"])}</span></a>'
        for c in CAT['categories'])


def gen_stats_products():
    return str(sum(len(c['products']) for c in CAT['categories']))


GEN = {
    'mega': gen_mega, 'mobile_cats': gen_mobile_cats, 'footer_cats': gen_footer_cats, 'marquee': gen_marquee,
    'cat_panels': gen_cat_panels, 'catalog_rows': gen_catalog_rows, 'catalog_covers': gen_catalog_covers,
    'cat_tabs': gen_cat_tabs, 'products_total': gen_stats_products,
}


# ---------------------------------------------------------------- surinkimas
def render(text, meta, depth=0):
    if depth > 6:
        raise RuntimeError('per gilus iterpimas')
    text = re.sub(r'\{\{>\s*([\w-]+)\s*\}\}', lambda m: render((SRC / 'partials' / f'{m.group(1)}.html').read_text('utf-8'), meta, depth + 1), text)
    text = re.sub(r'\{\{i:([\w-]+)\}\}', lambda m: icon(m.group(1)), text)
    text = re.sub(r'\{\{gen:([\w_]+)\}\}', lambda m: GEN[m.group(1)](), text)
    text = text.replace('{{icons}}', (SRC / 'partials/icons.svg').read_text('utf-8'))
    text = text.replace('{{rhino}}', re.sub(r'<\?xml[^>]*>', '', (ROOT / 'assets/img/brand/rhino.svg').read_text('utf-8')).replace('<svg ', '<svg class="rhino" ', 1))
    text = re.sub(r'\{\{(\w+)\}\}', lambda m: str(meta.get(m.group(1), m.group(0))), text)
    return text


def build():
    data = json.dumps(CAT, ensure_ascii=False, separators=(',', ':'))
    (ROOT / 'assets/js/data.js').write_text(f'/* sugeneruota build.py is src/data/catalog.json */\nwindow.LIRONTA={data};\n', 'utf-8')
    pages = sorted((SRC / 'pages').glob('*.html'))
    for p in pages:
        raw = p.read_text('utf-8')
        m = re.match(r'\s*<!--meta\s*(\{.*?\})\s*-->', raw, re.S)
        meta = json.loads(m.group(1)) if m else {}
        body = raw[m.end():] if m else raw
        meta.setdefault('page', p.stem)
        for k in ('hdrclass', 'scripts', 'nav_prod', 'nav_kont'):
            meta.setdefault(k, '')
        out = render((SRC / 'partials/layout.html').read_text('utf-8').replace('{{content}}', body), meta)
        left = re.findall(r'\{\{[^}]+\}\}', out)
        if left:
            raise SystemExit(f'{p.name}: neisspresta {sorted(set(left))[:5]}')
        (ROOT / p.name).write_text(out, 'utf-8')
        print(f'{p.name:18s} {len(out) / 1024:.0f} KB')


if __name__ == '__main__':
    build()
