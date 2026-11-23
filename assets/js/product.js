/* Lironta demo: produkto puslapis. ?p=<produktas>&v=<dydis> */
(() => {
  const { motion, fine, $, $$, esc, icon, norm, bySlug, allProducts, imgSrc, card, plural } = window.LIR;
  const params = new URLSearchParams(location.search);
  const p = bySlug[params.get('p')] || bySlug['ked-kedutes-sunkios'] || allProducts[0];
  const c = p.cat;
  document.title = `${p.code ? p.code + ' ' : ''}${p.name} | Lironta`;

  /* ------------------------------------------------ pagrindinė informacija */
  $('[data-p-crumbs]').innerHTML = `<a href="index.html">Pradžia</a>${icon('caret-right')}<a href="produkcija.html">Produkcija</a>${icon('caret-right')}<a href="produkcija.html?k=${c.slug}">${esc(c.short)}</a>${icon('caret-right')}<span>${esc(p.name)}</span>`;
  const catLink = $('[data-p-cat]');
  catLink.href = `produkcija.html?k=${c.slug}`;
  $('span', catLink).textContent = c.name;
  $('[data-p-title]').innerHTML = (p.code ? `<span class="tape">${esc(p.code)}</span>` : '') + esc(p.name);
  $('[data-p-desc]').innerHTML = (p.desc && p.desc.length ? p.desc : [c.desc]).map(t => `<p>${esc(t)}</p>`).join('');
  if (p.code) { const pc = $('[data-p-code]'); pc.textContent = p.code; pc.hidden = false; }

  /* galerija */
  const main = $('[data-gal-main]'), mimg = $('[data-gal-img]'), thumbs = $('[data-gal-thumbs]');
  const imgs = p.images.length ? p.images : [{ file: '' }];
  mimg.src = imgSrc(imgs[0].file); mimg.alt = `${p.code ? p.code + ' ' : ''}${p.name}`;
  thumbs.innerHTML = imgs.length > 1 ? imgs.map((im, i) => `<button type="button" aria-label="Nuotrauka ${i + 1}" aria-current="${i === 0}" data-i="${i}"><img src="${imgSrc(im.file)}" alt="" loading="lazy"></button>`).join('') : '';
  if (imgs.length < 2) thumbs.style.display = 'none', $('.gal').style.gridTemplateColumns = '1fr';
  thumbs.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', thumbs).forEach(x => x.setAttribute('aria-current', String(x === b)));
    main.classList.add('is-swap');
    setTimeout(() => { mimg.src = imgSrc(imgs[+b.dataset.i].file); main.classList.remove('is-swap'); }, 220);
  });
  if (fine) {
    main.addEventListener('mousemove', e => { const r = main.getBoundingClientRect(); main.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100) + '%'); main.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100) + '%'); main.classList.add('is-zoom'); });
    main.addEventListener('mouseleave', () => main.classList.remove('is-zoom'));
  } else $('.gal__hint').hidden = true;

  /* ------------------------------------------------ dydžiai ir specifikacija */
  const t = p.table;
  const unitOf = h => { const x = norm(h); return /mm/.test(x) ? 'mm' : /cm/.test(x) ? 'cm' : /vnt/.test(x) ? 'vnt.' : /kg/.test(x) ? 'kg' : /m2|m²/.test(x) ? 'm²' : /(\(m\.?\)|, ?m\.?$|\bm$)/.test(x) ? 'm' : ''; };
  const labelOf = h => h.replace(/\(.*?\)/g, '').replace(/,\s*(mm|cm|m|vnt\.?|kg|m2|t)\s*$/i, '').replace(/\s+/g, ' ').trim();
  let sel = 0;
  if (t && t.rows.length) {
    const want = params.get('v');
    const wi = want ? t.rows.findIndex(r => r[0] === want) : -1;
    sel = wi >= 0 ? wi : 0;
    $('[data-p-vcount]').textContent = plural(t.rows.length, 'dydis', 'dydžiai', 'dydžių');
    $('[data-p-variants]').innerHTML = t.rows.map((r, i) => `<button class="chip" type="button" role="radio" aria-checked="${i === sel}" aria-pressed="${i === sel}" data-v="${i}">${esc(r[0])}</button>`).join('');
    $('[data-p-spec]').innerHTML = `<table class="spec"><thead><tr>${t.head.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r, i) => `<tr data-v="${i}">${t.head.map((_, k) => `<td>${esc(r[k] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  } else {
    $('[data-p-varwrap]').hidden = true;
    $('[data-p-spec]').innerHTML = `<p class="lead">Šiam produktui dydžių lentelės kataloge nėra. Techninius duomenis ir pakuotes pateiks vadybininkas pagal užklausą.</p>`;
  }
  const vinfo = $('[data-p-vinfo]');
  function choose(i, scrollRow) {
    sel = i;
    $$('[data-p-variants] .chip').forEach(b => { const on = +b.dataset.v === i; b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-checked', String(on)); });
    $$('.spec tbody tr').forEach(tr => tr.classList.toggle('is-sel', +tr.dataset.v === i));
    const r = t.rows[i];
    const cols = t.head.map((h, k) => ({ h, k })).slice(1).filter(x => (r[x.k] || '').trim()).slice(0, 3);
    vinfo.innerHTML = cols.map(x => `<div><dt>${esc(labelOf(x.h))}</dt><dd>${esc(r[x.k])}${unitOf(x.h) && !/[a-zą-ž]/i.test(r[x.k]) ? `<small style="font-size:.5em;margin-left:4px">${unitOf(x.h)}</small>` : ''}</dd></div>`).join('');
    vinfo.style.gridTemplateColumns = `repeat(${Math.max(cols.length, 1)}, minmax(0, 1fr))`;
    if (motion) gsap.from($$('dd', vinfo), { y: 18, opacity: 0, duration: .6, stagger: .05, ease: 'expo.out' });
    $('[data-sb-variant]').textContent = r[0];
    if (scrollRow && motion) { /* nieko: lentelė skirtuke */ }
  }
  if (t && t.rows.length) {
    choose(sel);
    $('[data-p-variants]').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) choose(+b.dataset.v); });
    $('[data-p-spec]').addEventListener('click', e => { const tr = e.target.closest('tbody tr'); if (tr) choose(+tr.dataset.v); });
  }

  /* ------------------------------------------------ kiekis ir užklausa */
  const qty = $('[data-pqty]');
  $$('[data-pq]').forEach(b => b.addEventListener('click', () => { qty.value = Math.max(1, (parseInt(qty.value, 10) || 1) + +b.dataset.pq); }));
  const add = from => LIR.inq.add({ slug: p.slug, code: p.code, variant: t && t.rows.length ? t.rows[sel][0] : '', name: p.name, img: imgs[0].file, qty: Math.max(1, parseInt(qty.value, 10) || 1) }, from);
  $('[data-p-add]').addEventListener('click', () => add(mimg));
  $('[data-sb-add]').addEventListener('click', e => add(e.currentTarget));

  /* lipni juosta, kai pagrindinis mygtukas nebematomas */
  const sb = $('[data-stickybar]');
  $('[data-sb-img]').src = imgSrc(imgs[0].file);
  $('[data-sb-title]').textContent = `${p.code ? p.code + ' ' : ''}${p.name}`;
  new IntersectionObserver(([en]) => {
    const on = !en.isIntersecting && en.boundingClientRect.top < 0;
    sb.classList.toggle('is-on', on); sb.setAttribute('aria-hidden', String(!on));
    $('[data-sb-add]').tabIndex = on ? 0 : -1;
  }).observe($('[data-buy]'));

  /* ------------------------------------------------ skirtukai */
  const tabBtns = $$('[role="tab"]');
  const selectTab = b => {
    tabBtns.forEach(x => { const on = x === b; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
    const panel = $('#' + b.getAttribute('aria-controls'));
    $$('video[data-src]', panel).forEach(v => { if (!v.src) v.src = v.dataset.src; if (motion) v.play().catch(() => {}); });
    if (motion) gsap.from(panel, { y: 20, opacity: 0, duration: .6 });
  };
  tabBtns.forEach((b, i) => {
    b.addEventListener('click', () => selectTab(b));
    b.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const n = tabBtns[(i + d + tabBtns.length) % tabBtns.length]; n.focus(); selectTab(n);
    });
  });

  /* ------------------------------------------------ susiję */
  const rel = c.products.filter(x => x !== p);
  const more = allProducts.filter(x => x.cat !== c && x.images.length).slice(0, Math.max(0, 8 - rel.length));
  const track = $('[data-rail-track]');
  track.innerHTML = rel.concat(more).slice(0, 12).map(x => card(x, { reveal: false })).join('');
  $$('[data-rail]').forEach(b => b.addEventListener('click', () => {
    const w = track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width + 14 : 300;
    track.scrollBy({ left: +b.dataset.rail * w * 2, behavior: motion ? 'smooth' : 'auto' });
  }));

  /* ------------------------------------------------ įžanga */
  if (motion) {
    gsap.from('.gal__main', { y: 50, opacity: 0, duration: 1.3 });
    gsap.from('.gal__main img', { scale: 1.4, rotation: -8, duration: 1.6, delay: .3 });
    gsap.from('.gal__thumbs button', { x: -20, opacity: 0, stagger: .06, duration: .8, delay: .5 });
    gsap.from('.pinfo > *', { y: 30, opacity: 0, stagger: .07, duration: 1, delay: .2 });
  }
})();
