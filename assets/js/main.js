/* Lironta demo: bendri komponentai visiems puslapiams.
   GSAP + ScrollTrigger + SplitText + Lenis. Be `scroll` klausytojų: slinkimą seka ScrollTrigger / IntersectionObserver.
   ?static=1 ir prefers-reduced-motion išjungia judesį ir automatinį video. */
(() => {
  const D = document, H = D.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isStatic = H.classList.contains('is-static');
  const motion = !reduce && !isStatic;
  const $ = (s, c = D) => c.querySelector(s);
  const $$ = (s, c = D) => [...c.querySelectorAll(s)];
  const DATA = window.LIRONTA || { categories: [], catalogs: [] };
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: 'expo.out', duration: 1 });

  /* ------------------------------------------------ pagalbinės */
  const norm = s => (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = s => (s || '').toString().replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (n, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const plural = (n, one, few, many) => {
    if (n % 10 === 1 && n % 100 !== 11) return `${n} ${one}`;
    if (n % 10 >= 2 && n % 10 <= 9 && !(n % 100 >= 11 && n % 100 <= 19)) return `${n} ${few}`;
    return `${n} ${many}`;
  };
  const allProducts = [];
  DATA.categories.forEach(c => c.products.forEach(p => allProducts.push(Object.assign(p, { cat: c }))));
  const bySlug = Object.fromEntries(allProducts.map(p => [p.slug, p]));
  const imgSrc = file => `assets/img/products/${file}.webp`;

  /* specifikacijos santrauka kortelei */
  const nums = s => (String(s).match(/\d+(?:[.,]\d+)?/g) || []).map(x => parseFloat(x.replace(',', '.')));
  function summarize(p) {
    const t = p.table;
    if (!t || !t.rows.length) return p.desc && p.desc[0] ? p.desc[0].slice(0, 96) + (p.desc[0].length > 96 ? '…' : '') : 'Dėl informacijos kreipkitės į vadybininką.';
    const parts = [plural(t.rows.length, 'dydis', 'dydžiai', 'dydžių')];
    const h = t.head.map(x => norm(x));
    const unitOf = x => /mm/.test(x) ? 'mm' : /cm/.test(x) ? 'cm' : /(\(m\)|, ?m\b|\bm$)/.test(x) ? 'm' : '';
    const col = (re, label) => {
      const i = h.findIndex(x => re.test(x));
      if (i < 1) return false;
      const v = t.rows.flatMap(r => nums(r[i] || '')).filter(n => !isNaN(n));
      if (!v.length) return false;
      const a = Math.min(...v), b = Math.max(...v);
      parts.push(`${label} ${a === b ? a : a + '-' + b} ${unitOf(h[i])}`.trim());
      return true;
    };
    col(/apsauginis/, 'apsauginis sluoksnis') || col(/skersmuo|diametras/, 'skersmuo') || col(/ilgis/, 'ilgis') || col(/matmenys|dydis|storis/, 'matmenys');
    return parts.join(', ') + '.';
  }

  window.LIR = { motion, fine, $, $$, esc, icon, norm, plural, DATA, allProducts, bySlug, imgSrc, summarize, nums };

  /* ------------------------------------------------ Lenis */
  let lenis = null;
  if (motion) {
    lenis = new Lenis({ lerp: 0.105, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    D.addEventListener('click', e => {
      const a = e.target.closest('a[href*="#"]');
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash || url.hash.length < 2) return;
      const target = D.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      closeAll();
      lenis.scrollTo(target, { offset: -10, duration: 1.4 });
      history.replaceState(null, '', url.hash);
    });
  }
  LIR.lenis = lenis;
  const lockScroll = on => { if (lenis) on ? lenis.stop() : lenis.start(); D.body.style.overflow = on ? 'hidden' : ''; };

  /* ------------------------------------------------ antraštė */
  const hdr = $('#hdr');
  let hidden = false;
  const setHidden = v => { if (v === hidden) return; hidden = v; hdr.classList.toggle('is-hidden', v); D.body.classList.toggle('hdr-visible', !v); };
  D.body.classList.add('hdr-visible');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate(self) {
      const y = self.scroll();
      hdr.classList.toggle('is-solid', y > 40);
      if (hdr.classList.contains('is-open') || hdr.classList.contains('is-menu')) return;
      if (y > 420 && self.direction === 1) setHidden(true);
      else if (self.direction === -1 || y < 200) setHidden(false);
    }
  });

  /* mega meniu: pelė, klaviatūra, lietimas */
  $$('[data-mega]').forEach(item => {
    const link = $('.nav__link', item);
    let tm;
    const open = v => { item.classList.toggle('is-open', v); hdr.classList.toggle('is-open', v); link.setAttribute('aria-expanded', v); };
    if (fine) {
      item.addEventListener('mouseenter', () => { clearTimeout(tm); open(true); });
      item.addEventListener('mouseleave', () => { tm = setTimeout(() => open(false), 140); });
    }
    item.addEventListener('focusin', () => open(true));
    item.addEventListener('focusout', e => { if (!item.contains(e.relatedTarget)) open(false); });
    link.addEventListener('click', e => { if (!fine && !item.classList.contains('is-open')) { e.preventDefault(); open(true); } });
    D.addEventListener('keydown', e => { if (e.key === 'Escape' && item.classList.contains('is-open')) { open(false); link.focus(); } });
  });

  /* kalbos */
  $$('[data-lang]').forEach(l => {
    const b = $('.lang__btn', l);
    b.addEventListener('click', () => { const v = !l.classList.contains('is-open'); l.classList.toggle('is-open', v); b.setAttribute('aria-expanded', v); });
    D.addEventListener('click', e => { if (!l.contains(e.target)) { l.classList.remove('is-open'); b.setAttribute('aria-expanded', 'false'); } });
  });

  /* ------------------------------------------------ pranešimas */
  const toastEl = $('.toast');
  let toastTm;
  const toast = msg => {
    $('[data-toast-text]', toastEl).textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTm);
    toastTm = setTimeout(() => toastEl.classList.remove('is-on'), 3600);
  };
  LIR.toast = toast;
  const DEMO = {
    lang: 'Demo versija lietuvių kalba. EN, RU, ET ir FI versijos bus WordPress svetainėje (WPML arba Polylang).',
    social: 'Demo: čia bus nuorodos į Lironta socialinių tinklų paskyras.',
    privacy: 'Demo: privatumo politika bus perkelta iš dabartinės svetainės.'
  };
  D.addEventListener('click', e => {
    const d = e.target.closest('[data-demo]');
    if (!d) return;
    e.preventDefault();
    toast(DEMO[d.dataset.demo] || 'Demo funkcija.');
  });

  /* ------------------------------------------------ perdangos: paieška, užklausa, meniu, video */
  const bg = $('.overlay-bg');
  const panels = { search: $('#search'), drawer: $('#drawer'), mnav: $('#mnav'), lightbox: $('#lightbox') };
  let current = null, lastFocus = null;
  function openPanel(name) {
    const el = panels[name];
    if (!el) return;
    if (current && current !== name) closeAll(true);
    if (name === 'mnav' && current === 'mnav') return closeAll();
    current = name; lastFocus = D.activeElement;
    el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false');
    if (name === 'search' || name === 'drawer') bg.classList.add('is-on');
    if (name === 'mnav') { hdr.classList.add('is-menu'); $$('.burger').forEach(b => { b.setAttribute('aria-expanded', 'true'); b.innerHTML = icon('x'); }); setHidden(false); }
    if (name === 'lightbox') { const v = $('video', el); if (!v.src) v.src = v.dataset.src; v.currentTime = 0; v.play().catch(() => {}); }
    if (name === 'drawer') renderInq();
    lockScroll(true);
    setTimeout(() => {
      const f = name === 'search' ? $('[data-search-input]') : $('[data-close], a, button', el);
      f && f.focus({ preventScroll: true });
    }, 60);
  }
  function closeAll(silent) {
    if (!current) return;
    const el = panels[current];
    el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true');
    bg.classList.remove('is-on');
    if (current === 'mnav') { hdr.classList.remove('is-menu'); $$('.burger').forEach(b => { b.setAttribute('aria-expanded', 'false'); b.innerHTML = icon('list'); }); }
    if (current === 'lightbox') $('video', el).pause();
    current = null;
    lockScroll(false);
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  LIR.openPanel = openPanel; LIR.closeAll = closeAll;
  D.addEventListener('click', e => {
    const o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); openPanel(o.dataset.open); return; }
    if (e.target.closest('[data-close]')) { e.preventDefault(); closeAll(); return; }
    if (current === 'mnav' && e.target.closest('#mnav a[href]') && !e.target.closest('[data-demo]')) closeAll(true);
    if (current === 'lightbox' && e.target === panels.lightbox) closeAll();
  });
  D.addEventListener('keydown', e => {
    if (e.key === 'Escape' && current) closeAll();
    if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !current && !/input|textarea|select/i.test(D.activeElement.tagName)) { e.preventDefault(); openPanel('search'); }
    if (e.key === 'Tab' && current && current !== 'mnav') { /* fokuso spąstai modaliniame lange */
      const f = $$('a[href], button:not([disabled]), input, select, textarea, video[controls]', panels[current]).filter(x => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && D.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && D.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* paieška */
  const sInput = $('[data-search-input]'), sRes = $('[data-search-res]');
  const hl = (txt, q) => { if (!q) return esc(txt); const i = norm(txt).indexOf(q); return i < 0 ? esc(txt) : esc(txt.slice(0, i)) + '<mark>' + esc(txt.slice(i, i + q.length)) + '</mark>' + esc(txt.slice(i + q.length)); };
  function runSearch() {
    const q = norm(sInput.value.trim());
    if (!q) {
      const pop = ['ked-kedutes-sunkios', 'zv-zvaigzdutes', 'pku-profilis-kampams-su-uzlaida', 'bk-betoninis-kaulas', 'bhj-bentonitine-hidroizoliacine-juosta', 'rvj-armaturos-risamoji-viela'].map(s => bySlug[s]).filter(Boolean);
      sRes.innerHTML = pop.map(p => resItem(p, '')).join('');
      return;
    }
    const hits = allProducts.filter(p => norm(p.code + ' ' + p.name + ' ' + p.cat.name + ' ' + (p.table ? p.table.rows.map(r => r[0]).join(' ') : '')).includes(q)).slice(0, 18);
    sRes.innerHTML = hits.length ? hits.map(p => resItem(p, q)).join('') : `<p class="muted" style="padding:14px 4px">Nieko nerasta pagal „${esc(sInput.value)}“. Pabandykite produkto kodą, pvz. KED arba BSJ.</p>`;
  }
  const resItem = (p, q) => `<a class="sres" href="produktas.html?p=${p.slug}"><span class="sres__img"><img src="${imgSrc(p.images[0] ? p.images[0].file : '')}" alt="" loading="lazy"></span><span><b>${hl((p.code ? p.code + ' ' : '') + p.name, q)}</b><span>${esc(p.cat.short)}</span></span></a>`;
  if (sInput) { sInput.addEventListener('input', runSearch); runSearch(); }

  /* ------------------------------------------------ užklausos sąrašas (demo: localStorage) */
  const KEY = 'lir-inq';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const save = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* privatus režimas */ } };
  let inq = load();
  function updateCounts(bump) {
    const n = inq.reduce((a, b) => a + 1, 0);
    $$('[data-inq-count]').forEach(el => el.textContent = n);
    const t = $('[data-inq-total]'); if (t) t.textContent = n ? `(${n})` : '';
    if (bump) $$('.inq-btn').forEach(b => { b.classList.remove('is-bump'); void b.offsetWidth; b.classList.add('is-bump'); });
  }
  function renderInq() {
    const box = $('[data-inq-list]');
    if (!box) return;
    if (!inq.length) {
      box.innerHTML = `<div class="drawer__empty">${icon('clipboard-text')}<p><b style="color:var(--ink)">Užklausos sąrašas tuščias</b><br>Pridėkite produktus mygtuku „Į užklausą“, o vadybininkas paskaičiuos pasiūlymą.</p><p style="margin-top:18px"><a class="link-arrow" href="produkcija.html">Produkcija ${icon('arrow-right')}</a></p></div>`;
      return;
    }
    box.innerHTML = inq.map((it, i) => `<div class="ditem" data-i="${i}">
      <span class="ditem__img"><img src="${imgSrc(it.img)}" alt=""></span>
      <div><div class="ditem__code">${esc(it.variant || it.code || it.name)}</div><div class="ditem__name">${esc(it.name)}</div>
        <div class="qty"><button type="button" data-q="-1" aria-label="Mažinti kiekį">${icon('minus')}</button><input type="number" min="1" value="${it.qty}" aria-label="Kiekis" data-qv><button type="button" data-q="1" aria-label="Didinti kiekį">${icon('plus')}</button></div></div>
      <button class="icon-btn ditem__remove" type="button" data-rm aria-label="Pašalinti">${icon('trash')}</button></div>`).join('');
  }
  $('[data-inq-list]')?.addEventListener('click', e => {
    const row = e.target.closest('.ditem'); if (!row) return;
    const i = +row.dataset.i;
    if (e.target.closest('[data-rm]')) { gsap.to(row, { x: 40, opacity: 0, duration: .35, ease: 'power2.in', onComplete: () => { inq.splice(i, 1); save(inq); updateCounts(); renderInq(); } }); return; }
    const q = e.target.closest('[data-q]');
    if (q) { inq[i].qty = Math.max(1, inq[i].qty + +q.dataset.q); save(inq); $('[data-qv]', row).value = inq[i].qty; }
  });
  $('[data-inq-list]')?.addEventListener('change', e => {
    const row = e.target.closest('.ditem'); if (!row || !e.target.matches('[data-qv]')) return;
    inq[+row.dataset.i].qty = Math.max(1, parseInt(e.target.value, 10) || 1); save(inq);
  });
  function fly(fromEl, img) {
    const target = $$('.inq-btn').find(b => b.offsetParent !== null);
    if (!motion || !fromEl || !target) return;
    const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    const f = D.createElement('div'); f.className = 'flyer'; f.innerHTML = `<img src="${imgSrc(img)}" alt="">`;
    D.body.appendChild(f);
    const x0 = a.left + a.width / 2 - 40, y0 = a.top + a.height / 2 - 40, x1 = b.left + b.width / 2 - 40, y1 = b.top + b.height / 2 - 40;
    gsap.set(f, { x: x0, y: y0, scale: .4, rotate: -10, opacity: 0 });
    const tl = gsap.timeline({ onComplete: () => f.remove() });
    tl.to(f, { opacity: 1, scale: 1, duration: .25, ease: 'power2.out' })
      .to(f, { x: x1, duration: .75, ease: 'power2.inOut' }, '>-0.05')
      .to(f, { y: y1, duration: .75, ease: 'back.in(1.4)' }, '<')
      .to(f, { scale: .2, rotate: 20, opacity: 0, duration: .25, ease: 'power2.in' }, '>-0.18');
  }
  LIR.inq = {
    add(item, fromEl) {
      const key = item.variant || item.slug;
      const ex = inq.find(x => (x.variant || x.slug) === key);
      if (ex) ex.qty += item.qty || 1; else inq.push(Object.assign({ qty: 1 }, item));
      save(inq);
      fly(fromEl, item.img);
      setTimeout(() => updateCounts(true), motion ? 820 : 0);
      toast(`${item.variant || item.code || item.name} įtraukta į užklausą`);
    },
    list: () => inq.slice()
  };
  updateCounts();
  /* bet kuris [data-add] mygtukas (kortelėse, paieškoje) */
  D.addEventListener('click', e => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    e.preventDefault();
    const p = bySlug[b.dataset.add];
    if (!p) return;
    LIR.inq.add({ slug: p.slug, code: p.code, variant: b.dataset.variant || '', name: p.name, img: p.images[0] ? p.images[0].file : '' }, b.closest('.pcard, .pres') ? $('img', b.closest('.pcard, .pres')) : b);
  });

  /* ------------------------------------------------ video: tingus krovimas, grojimas tik matomame lange */
  const vids = $$('video[data-src]').filter(v => !v.closest('#lightbox') && !v.closest('.cpanel'));
  const vio = new IntersectionObserver(entries => entries.forEach(en => {
    const v = en.target;
    if (en.isIntersecting) {
      if (!v.src) { v.src = v.dataset.src; }
      if (motion && v.hasAttribute('data-autoplay')) v.play().catch(() => {});
    } else if (!v.paused) v.pause();
  }), { rootMargin: '200px 0px' });
  vids.forEach(v => vio.observe(v));
  if (!motion) $$('video[autoplay]').forEach(v => { v.removeAttribute('autoplay'); v.pause(); });

  /* ------------------------------------------------ atsiradimas */
  const rio = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); rio.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  $$('[data-reveal]').forEach(el => motion ? rio.observe(el) : el.classList.add('is-in'));

  /* antraštės eilutėmis */
  if (motion) {
    $$('[data-split]').forEach(el => {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, { yPercent: 108, duration: 1.15, stagger: .09, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        }
      });
    });
  }

  /* skaičiai */
  $$('[data-count]').forEach(el => {
    const to = parseInt(el.dataset.count, 10), from = parseInt(el.dataset.countFrom || 0, 10);
    if (!motion) return;
    const o = { v: from };
    el.textContent = from;
    gsap.to(o, { v: to, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => { el.textContent = Math.round(o.v); } });
  });

  /* paralaksas */
  if (motion) {
    $$('[data-parallax]').forEach(el => {
      const n = parseFloat(el.dataset.parallax) || 8;
      const trg = el.closest('.vcard, .about__media, .phero, .use__media') || el.parentElement;
      gsap.fromTo(el, { yPercent: -n }, { yPercent: n, ease: 'none', scrollTrigger: { trigger: trg, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-parallax-bg]').forEach(el => {
      gsap.fromTo(el, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    /* poraštės žodinis ženklas iškyla */
    const fw = $('[data-ftr-word]');
    if (fw) gsap.from(fw, { yPercent: 60, ease: 'none', scrollTrigger: { trigger: fw, start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  /* magnetiniai elementai */
  if (motion && fine) {
    $$('[data-magnet]').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: .6, ease: 'power3' }), yTo = gsap.quickTo(el, 'y', { duration: .6, ease: 'power3' });
      el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .35); yTo((e.clientY - r.top - r.height / 2) * .35); });
      el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ------------------------------------------------ produkto kortelė (bendra produkcijai, susijusiems) */
  LIR.card = (p, opts = {}) => {
    const im = p.images[0] ? p.images[0].file : '';
    const alt = p.images[1] ? p.images[1].file : '';
    return `<article class="pcard" ${opts.reveal === false ? '' : 'data-card'}>
      <div class="pcard__media">
        ${p.code ? `<span class="pcard__code">${esc(p.code)}</span>` : ''}
        <img class="pcard__main${alt ? ' has-alt' : ''}" src="${imgSrc(im)}" alt="${esc((p.code ? p.code + ' ' : '') + p.name)}" loading="lazy" decoding="async">
        ${alt ? `<img class="pcard__alt" src="${imgSrc(alt)}" alt="" loading="lazy" decoding="async">` : ''}
        <div class="pcard__quick"><button type="button" data-add="${p.slug}" aria-label="Į užklausą: ${esc(p.name)}">${icon('plus')}</button></div>
      </div>
      <div class="pcard__body">
        <h3 class="pcard__name"><a href="produktas.html?p=${p.slug}">${esc(p.name)}</a></h3>
        <p class="pcard__spec">${esc(summarize(p))}</p>
        <div class="pcard__foot"><span>${esc(p.cat.short)}</span>${icon('arrow-right')}</div>
      </div>
    </article>`;
  };

  /* lango dydžio pokyčiai */
  let rw = innerWidth;
  addEventListener('resize', () => { if (Math.abs(innerWidth - rw) > 40) { rw = innerWidth; ScrollTrigger.refresh(); } });
  addEventListener('load', () => ScrollTrigger.refresh());
})();
