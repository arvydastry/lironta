/* Lironta demo: pradžios puslapio judesys ir parinkiklis. */
(() => {
  const { motion, fine, $, $$, esc, icon, norm, nums, DATA, imgSrc, lenis } = window.LIR;
  const H = document.documentElement;
  const mm = gsap.matchMedia();

  /* ------------------------------------------------ hero */
  const hero = $('.hero');
  const frame = $('[data-hero-frame]'), media = $('[data-hero-media]'), content = $('[data-hero-content]');
  const heroVideos = $$('[data-hero-video]');
  function heroIn(delay) {
    if (!motion) return;
    const tl = gsap.timeline({ delay });
    tl.from(heroVideos, { scale: 1.28, duration: 2.4 }, 0)
      .from('.hero__title .line > span', { yPercent: 118, duration: 1.3, stagger: .12 }, .1)
      .from('.hero__title .tape', { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.1, ease: 'expo.inOut' }, .55)
      .from('[data-hero-fade]', { y: 34, opacity: 0, duration: 1.1, stagger: .1 }, .5)
      .from('.vtoggle', { opacity: 0, scale: .6, duration: .8 }, .9);
  }
  const curtain = $('.intro-curtain');
  if (curtain && motion && !H.classList.contains('no-intro')) {
    try { sessionStorage.setItem('lir-intro', '1'); } catch (e) { /* */ }
    lenis && lenis.stop();
    window.scrollTo(0, 0);
    gsap.timeline({ onComplete: () => { curtain.remove(); lenis && lenis.start(); } })
      .from('.intro-curtain__mark', { scale: .5, rotation: -14, opacity: 0, duration: .8, ease: 'back.out(1.7)' })
      .from('.intro-curtain__word', { letterSpacing: '0.7em', opacity: 0, duration: .8 }, .15)
      .to('.intro-curtain__mark', { y: -16, duration: .35, ease: 'power2.out' }, '+=.05')
      .to(curtain, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.05, ease: 'expo.inOut' }, '>-0.15');
    heroIn(1.45);
  } else {
    curtain && curtain.remove();
    heroIn(.05);
  }
  if (motion && hero) {
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: '+=75%', pin: true, scrub: true } })
      .to(frame, { '--p': 0, ease: 'none', duration: 1 }, 0)
      .to(media, { scale: 1, ease: 'none', duration: 1 }, 0)
      .to(content, { y: -80, opacity: 0, ease: 'power1.in', duration: .55 }, .45);
  }
  const vt = $('[data-vtoggle]');
  if (vt) {
    const sync = () => { const paused = heroVideos.every(v => v.paused); vt.classList.toggle('is-paused', paused); vt.setAttribute('aria-label', paused ? 'Paleisti fono video' : 'Sustabdyti fono video'); };
    vt.addEventListener('click', () => { const paused = heroVideos.every(v => v.paused); heroVideos.forEach(v => paused ? v.play().catch(() => {}) : v.pause()); setTimeout(sync, 50); });
    if (!motion) heroVideos.forEach(v => v.pause());
    setTimeout(sync, 300);
  }

  /* ------------------------------------------------ bėganti eilutė, reaguoja į slinkimo greitį */
  const track = $('[data-marquee]');
  if (track && motion) {
    let x = 0, dir = 1, w = track.firstElementChild.offsetWidth;
    addEventListener('resize', () => { w = track.firstElementChild.offsetWidth; });
    const skewTo = gsap.quickTo(track, 'skewX', { duration: .5, ease: 'power3' });
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(track);
    gsap.ticker.add((t, dt) => {
      if (!visible) return;
      const v = lenis ? lenis.velocity : 0;
      if (Math.abs(v) > .6) dir = v > 0 ? 1 : -1;
      x -= dir * (70 + Math.min(Math.abs(v) * 34, 1100)) * dt / 1000;
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      gsap.set(track, { x });
      skewTo(gsap.utils.clamp(-9, 9, -v * .5));
    });
  }

  /* ------------------------------------------------ apie: žodžiai paryškėja slenkant */
  const words = $('[data-words]');
  if (words && motion) {
    const split = SplitText.create(words, { type: 'words', wordsClass: 'w' });
    gsap.to(split.words, { opacity: 1, stagger: .06, ease: 'none', scrollTrigger: { trigger: words, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  }

  /* ------------------------------------------------ kategorijos: horizontalus slinkimas */
  const pinEl = $('[data-hscroll]'), htrack = $('[data-hscroll-track]'), bar = $('[data-hscroll-bar]');
  if (pinEl && motion) {
    mm.add('(min-width: 761px)', () => {
      const dist = () => Math.max(0, htrack.scrollWidth - innerWidth);
      const tween = gsap.to(htrack, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: pinEl, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: self => bar && bar.parentElement.style.setProperty('--prog', self.progress.toFixed(4)) }
      });
      $$('.cpanel', htrack).forEach(p => {
        gsap.fromTo($('.cpanel__pan', p), { xPercent: -7 }, { xPercent: 7, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        gsap.fromTo($('.cpanel__tile', p), { y: 46, rotation: 4 }, { y: -30, rotation: -3, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
      return () => gsap.set(htrack, { clearProps: 'transform' });
    });
  }
  if (bar) bar.style.transform = 'scaleX(var(--prog, 0))';
  if (fine && motion) {
    $$('.cpanel').forEach(p => {
      const v = $('.cpanel__video', p);
      if (!v) return;
      p.addEventListener('mouseenter', () => { if (!v.src) v.src = v.dataset.src; v.play().then(() => p.classList.add('is-playing')).catch(() => {}); });
      p.addEventListener('mouseleave', () => { p.classList.remove('is-playing'); v.pause(); });
    });
  }

  /* ------------------------------------------------ fiksatoriaus parinkiklis */
  const PICK = ['plastmasiniai-armaturos-fiksatoriai', 'betoniniai-armaturos-fiksatoriai', 'metaliniai-armaturos-fiksatoriai'];
  const parseCover = s => {
    s = String(s || ''); const n = nums(s);
    if (!n.length) return null;
    if (/≤/.test(s)) return { min: 0, max: n[0] };
    if (n.length === 1) return { min: n[0], max: n[0] };
    if (n.length === 2) return { min: Math.min(...n), max: Math.max(...n) };
    return { list: n };
  };
  const parseRebar = s => {
    s = String(s || ''); const n = nums(s);
    if (!n.length) return null;
    if (/≤/.test(s)) return { min: 0, max: n[0], txt: '≤' + n[0] };
    if (/,/.test(s) && n.length > 1) return { list: n, txt: n.join(', ') };
    if (n.length === 1) return { list: n, txt: String(n[0]) };
    return { min: Math.min(...n), max: Math.max(...n), txt: Math.min(...n) + '-' + Math.max(...n) };
  };
  const fits = (r, v) => r.list ? r.list.includes(v) : v >= r.min && v <= r.max;
  const rows = [];
  DATA.categories.filter(c => PICK.includes(c.slug)).forEach(c => c.products.forEach(p => {
    const t = p.table; if (!t) return;
    const h = t.head.map(norm);
    const ci = h.findIndex(x => x.includes('apsauginis'));
    if (ci < 0) return;
    const ri = h.findIndex(x => x.includes('armat') && x.includes('skersm') && !x.includes('traukiam'));
    const pi = h.findIndex(x => x.includes('pakuot'));
    const unit = pi < 0 ? '' : /vnt/.test(h[pi]) ? 'vnt.' : /\bm\b|\(m\)/.test(h[pi]) ? 'm' : '';
    t.rows.forEach(r => {
      const cov = parseCover(r[ci]);
      if (!cov) return;
      rows.push({ p, variant: r[0], cov, reb: ri >= 0 ? parseRebar(r[ri]) : null, pack: pi >= 0 && r[pi] ? `${r[pi]} ${unit}`.trim() : '' });
    });
  }));
  const coverIn = $('[data-pick-cover]'), coverOut = $('[data-pick-cover-out]');
  const chips = $$('[data-pick-rebar] .chip');
  const list = $('[data-pick-list]'), countEl = $('[data-pick-count]'), sumEl = $('[data-pick-summary]');
  let showAll = false;
  function results(cov, d) {
    const seen = new Set(), out = [];
    rows.forEach(r => {
      if (seen.has(r.p.slug) || !fits(r.cov, cov)) return;
      if (r.reb && !fits(r.reb, d)) return;
      seen.add(r.p.slug); out.push(r);
    });
    return out;
  }
  function renderPick(animate) {
    if (!list) return;
    const cov = +coverIn.value, d = +(chips.find(c => c.getAttribute('aria-pressed') === 'true') || chips[2]).dataset.v;
    coverOut.textContent = cov;
    coverIn.setAttribute('aria-valuetext', cov + ' milimetrai');
    const res = results(cov, d);
    countEl.textContent = LIR.plural(res.length, 'gaminys', 'gaminiai', 'gaminių');
    sumEl.textContent = `${cov} mm, Ø${d}`;
    const shown = showAll ? res : res.slice(0, 8);
    list.innerHTML = res.length ? shown.map(r => `<article class="pres">
        <span class="pres__img"><img src="${imgSrc(r.p.images[0] ? r.p.images[0].file : '')}" alt="" loading="lazy"></span>
        <div>
          <div class="pres__code">${esc(r.variant)}</div>
          <div class="pres__name">${esc((r.p.code ? r.p.code + ' ' : '') + r.p.name)}</div>
          <div class="pres__meta">${r.reb ? `Armatūrai ${esc(r.reb.txt)} mm` : 'Bet kokiam armatūros skersmeniui'}${r.pack ? `, pakuotė ${esc(r.pack)}` : ''}</div>
          <div class="pres__actions"><button class="pres__add" type="button" data-add="${r.p.slug}" data-variant="${esc(r.variant)}">${icon('plus')}Į užklausą</button><a class="pres__link" href="produktas.html?p=${r.p.slug}&amp;v=${encodeURIComponent(r.variant)}">Plačiau</a></div>
        </div></article>`).join('') + (res.length > 8 && !showAll ? `<div class="pick__more"><button class="btn btn--ink btn--sm" type="button" data-pick-more>Rodyti visus (${res.length})</button></div>` : '')
      : `<div class="pick__empty"><b>Tokio derinio kataloge nėra</b><p>Parinksime individualiai arba pasiūlysime artimiausią sprendimą.</p><p style="margin-top:18px"><a class="btn btn--ink btn--sm" href="kontaktai.html#forma">Pateikti užklausą</a></p></div>`;
    if (animate && motion) gsap.from(list.children, { y: 24, opacity: 0, duration: .7, stagger: .045, ease: 'expo.out' });
    drawSection(cov, d);
  }
  /* skerspjūvis: armatūra ant fiksatorių, apsauginis sluoksnis */
  const svg = $('[data-pick-svg]');
  const state = { cov: 25, d: 12 };
  const K = 1.6, BASE = 150;
  function paint() {
    if (!svg) return;
    const r = state.d * K / 2, top = BASE - state.cov * K;
    $('[data-sx-rebars]', svg).innerHTML = [130, 195, 260, 325, 390].map(x => `<circle class="sx-rebar" cx="${x}" cy="${(top - r).toFixed(1)}" r="${r.toFixed(1)}"/>`).join('');
    $('[data-sx-spacers]', svg).innerHTML = [195, 325].map(x => `<polygon class="sx-spacer" points="${x - 15},${BASE} ${x + 15},${BASE} ${x + 6},${top.toFixed(1)} ${x - 6},${top.toFixed(1)}"/>`).join('');
    $('[data-sx-dim]', svg).setAttribute('y2', top.toFixed(1));
    const dt = $('[data-sx-dimtop]', svg); dt.setAttribute('y1', top.toFixed(1)); dt.setAttribute('y2', top.toFixed(1));
    const lab = $('[data-sx-label]', svg); lab.setAttribute('y', ((BASE + top) / 2 + 6).toFixed(1)); lab.textContent = Math.round(state.cov) + ' mm';
  }
  function drawSection(cov, d) {
    if (motion) gsap.to(state, { cov, d, duration: .7, ease: 'expo.out', onUpdate: paint, overwrite: true });
    else { state.cov = cov; state.d = d; paint(); }
  }
  if (coverIn) {
    coverIn.addEventListener('input', () => { showAll = false; renderPick(true); });
    chips.forEach(c => c.addEventListener('click', () => { chips.forEach(x => x.setAttribute('aria-pressed', String(x === c))); showAll = false; renderPick(true); }));
    list.addEventListener('click', e => { if (e.target.closest('[data-pick-more]')) { showAll = true; renderPick(false); } });
    paint(); renderPick(false);
  }

  /* ------------------------------------------------ raganosis */
  const rhPin = $('[data-rhino]');
  if (rhPin && motion) {
    const beast = $('[data-rhino-beast]'), svgR = $('svg', beast), bg = $('[data-rhino-bg]');
    const dl = $('.rh-dust-l', svgR), dr = $('.rh-dust-r', svgR);
    gsap.timeline({ scrollTrigger: { trigger: rhPin, start: 'top top', end: '+=150%', pin: true, scrub: 1 } })
      .fromTo(beast, { scale: .42, yPercent: 18 }, { scale: 1.32, yPercent: -10, ease: 'power1.in', duration: 1 }, 0)
      .fromTo(bg, { xPercent: 5 }, { xPercent: -38, ease: 'none', duration: 1 }, 0)
      .fromTo(dl, { scale: .2, x: 60, opacity: 0, transformOrigin: '100% 0%' }, { scale: 1.45, x: -40, opacity: 1, ease: 'power2.out', duration: .7 }, .1)
      .fromTo(dr, { scale: .2, x: -60, opacity: 0, transformOrigin: '0% 0%' }, { scale: 1.45, x: 40, opacity: 1, ease: 'power2.out', duration: .7 }, .1);
    const trot = gsap.to(svgR, { y: -9, rotation: -1.4, duration: .3, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true, transformOrigin: '50% 100%' });
    ScrollTrigger.create({ trigger: rhPin, start: 'top bottom', end: 'bottom top', onToggle: s => s.isActive ? trot.play() : trot.pause() });
  }

  /* ------------------------------------------------ vertybių kortelių krūva */
  if (motion) {
    mm.add('(min-width: 761px)', () => {
      const cards = $$('[data-vstack] .vcard');
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, { scale: .93, '--dim': .42, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 22%', scrub: true } });
      });
    });
  }

  /* ------------------------------------------------ katalogų vėduoklė */
  const stage = $('[data-kat-stage]');
  if (stage) {
    const covers = $$('.kat__cover', stage), krows = $$('.kat__row');
    let active = 0;
    const layout = a => {
      active = a;
      const sp = Math.min(70, stage.clientWidth / 9);
      covers.forEach((c, i) => {
        const d = i - a, on = d === 0;
        gsap.to(c, {
          xPercent: -50, yPercent: -50, x: on ? 0 : d * sp * .9 + Math.sign(d) * sp, y: on ? 0 : Math.abs(d) * 16,
          rotationY: on ? 0 : d * -16, rotationZ: on ? -2 : d * 5, z: on ? 120 : -Math.abs(d) * 70,
          zIndex: 20 - Math.abs(d), duration: motion ? 1 : 0, ease: 'expo.out'
        });
      });
      krows.forEach((r, i) => r.classList.toggle('is-active', i === a));
    };
    layout(0);
    krows.forEach((r, i) => { r.addEventListener('mouseenter', () => layout(i)); r.addEventListener('focusin', () => layout(i)); });
    covers.forEach((c, i) => c.addEventListener('mouseenter', () => i !== active && layout(i)));
    if (motion && fine) {
      stage.addEventListener('mousemove', e => {
        const b = stage.getBoundingClientRect(), px = (e.clientX - b.left) / b.width - .5, py = (e.clientY - b.top) / b.height - .5;
        gsap.to(covers[active], { rotationY: px * 16, rotationX: -py * 10, duration: .8, ease: 'power3.out' });
      });
      stage.addEventListener('mouseleave', () => gsap.to(covers[active], { rotationY: 0, rotationX: 0, duration: 1 }));
    }
    if (motion) {
      gsap.fromTo(stage, { y: 140, opacity: 0, rotationX: 18 }, { y: 0, opacity: 1, rotationX: 0, duration: 1.4, scrollTrigger: { trigger: stage, start: 'top 85%', once: true } });
    }
  }

  /* ------------------------------------------------ rinkos: miesto vaizdas seka pelę */
  const mk = $('[data-mk]'), fl = $('[data-mk-float]');
  if (mk && fl && fine && motion) {
    const imgs = $$('img', fl);
    const xTo = gsap.quickTo(fl, 'x', { duration: .55, ease: 'power3' }), yTo = gsap.quickTo(fl, 'y', { duration: .55, ease: 'power3' }), rTo = gsap.quickTo(fl, 'rotation', { duration: .7, ease: 'power3' });
    let lx = 0;
    gsap.set(fl, { scale: .7 });
    mk.addEventListener('mousemove', e => { xTo(e.clientX + 30); yTo(e.clientY - fl.offsetHeight / 2); rTo(gsap.utils.clamp(-10, 10, (e.clientX - lx) * .5)); lx = e.clientX; });
    $$('.mrow', mk).forEach(r => r.addEventListener('mouseenter', () => {
      imgs.forEach((im, k) => im.classList.toggle('is-on', String(k) === r.dataset.img));
      gsap.to(fl, { opacity: 1, scale: 1, duration: .45, ease: 'expo.out' });
    }));
    mk.addEventListener('mouseleave', () => gsap.to(fl, { opacity: 0, scale: .7, duration: .4 }));
  }
})();
