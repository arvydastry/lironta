/* Lironta demo: produkcijos (kategorijos) puslapis. ?k=<kategorija> */
(() => {
  const { motion, $, $$, esc, icon, norm, DATA, plural, card } = window.LIR;
  const params = new URLSearchParams(location.search);
  const cat = DATA.categories.find(c => c.slug === params.get('k')) || null;
  const grid = $('[data-grid]');
  const GROUP_ICONS = ['shield-check', 'drop', 'cube', 'stack', 'lightbulb', 'wrench', 'package'];
  const GROUP_TEXT = [
    'Aplinkai ir žmogui saugūs produktai klojinių paviršiams prižiūrėti.',
    'Tepalai ir alyvos, kurie palengvina klojinių atskyrimą nuo betono.',
    'Priemonės gelžbetonio gaminių gamybai ir formoms.',
    'Produktai, saugantys betono paviršių.',
    'Priedai betono savybėms gerinti.',
    'Priemonės betono paviršiui tvarkyti.',
    'Pagalbiniai produktai ir priedai darbui su tepalais.'
  ];

  /* ------------------------------------------------ viršus */
  const total = DATA.categories.reduce((a, c) => a + c.products.length, 0);
  if (cat) {
    document.title = `${cat.name} | Lironta`;
    $('[data-cat-title]').textContent = cat.name;
    $('[data-cat-desc]').textContent = cat.desc;
    $('[data-cat-crumb]').innerHTML = `${icon('caret-right')}${esc(cat.short)}`;
    $('[data-cat-photo]').src = `assets/img/photos/${cat.photo}.webp`;
    const n = cat.groups ? cat.groups.length : cat.products.length;
    $('[data-cat-count]').textContent = n;
    $('[data-cat-count-l]').textContent = cat.groups ? plural(n, 'produktų grupė', 'produktų grupės', 'produktų grupių').replace(/^\d+ /, '') : plural(n, 'produktas', 'produktai', 'produktų').replace(/^\d+ /, '');
    if (cat.video && motion) {
      const v = $('[data-cat-video]');
      v.src = `assets/video/${cat.video}.mp4`; v.hidden = false; v.play().catch(() => {});
    }
  } else {
    $('[data-cat-count]').textContent = total;
  }
  if (motion) {
    gsap.from('.phero__title, .phero__desc, .crumbs, .phero__count', { y: 40, opacity: 0, duration: 1.2, stagger: .08, delay: .1 });
    gsap.from('.phero__media', { scale: 1.15, duration: 2.2 });
  }

  /* skirtukai */
  const tabs = $$('.ctabs__tab');
  tabs.forEach(t => t.classList.toggle('is-active', t.dataset.slug === (cat ? cat.slug : '')));
  const act = tabs.find(t => t.classList.contains('is-active'));
  if (act) { const sc = $('[data-ctabs]'); sc.scrollLeft = act.offsetLeft - sc.clientWidth / 2 + act.offsetWidth / 2; act.setAttribute('aria-current', 'page'); }

  /* ------------------------------------------------ tinklelis */
  let view = 'grid', sort = 'cat', q = '';
  try { view = localStorage.getItem('lir-view') || 'grid'; } catch (e) { /* */ }
  const sorter = {
    cat: () => 0,
    az: (a, b) => a.name.localeCompare(b.name, 'lt'),
    code: (a, b) => (a.code || 'ZZZ').localeCompare(b.code || 'ZZZ', 'lt', { numeric: true })
  };
  function groupCards(c) {
    return c.groups.map((g, i) => `<article class="gcard gcard--txt" data-card>
      <span class="vcard__icon">${icon(GROUP_ICONS[i] || 'drop')}</span>
      <div class="gcard__body"><b>${esc(g.name)}</b><p>${esc(GROUP_TEXT[i] || '')}</p>
      <a class="link-arrow" href="https://lironta.lt/wp-content/uploads/Tepalu%20katalogas.pdf" target="_blank" rel="noopener">Tepalų katalogas ${icon('download-simple')}</a></div></article>`).join('');
  }
  function render(animate) {
    const cats = cat ? [cat] : DATA.categories;
    let shown = 0, html = '';
    cats.forEach(c => {
      if (c.groups && !q) { html += (cat ? '' : `<h2 class="pgrid__head">${esc(c.name)}<span>${plural(c.groups.length, 'grupė', 'grupės', 'grupių')}</span></h2>`) + groupCards(c); if (cat) shown += c.groups.length; return; }
      let list = c.products.filter(p => !q || norm(`${p.code} ${p.name} ${p.table ? p.table.rows.map(r => r[0]).join(' ') : ''}`).includes(q));
      if (sort !== 'cat') list = list.slice().sort(sorter[sort]);
      if (!list.length) return;
      shown += list.length;
      if (!cat) html += `<h2 class="pgrid__head">${esc(c.name)}<span>${plural(list.length, 'produktas', 'produktai', 'produktų')}</span></h2>`;
      html += list.map(p => card(p)).join('');
    });
    grid.innerHTML = shown ? html : `<div class="pgrid__empty"><b>Nieko nerasta</b>Pabandykite kitą kodą arba pavadinimą, pvz. KED, BSJ ar PKU.</div>`;
    grid.classList.toggle('is-list', view === 'list');
    const word = cat && cat.groups && !q ? plural(shown, 'produktų grupė', 'produktų grupės', 'produktų grupių') : plural(shown, 'produktas', 'produktai', 'produktų');
    $('[data-count-line]').innerHTML = `Rodoma <b>${shown}</b> ${word.replace(/^\d+ /, '')}`;
    $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    if (motion) {
      const cards = $$('[data-card]', grid);
      gsap.set(cards, { opacity: 0, y: animate ? 24 : 50 });
      ScrollTrigger.batch(cards, { start: 'top 95%', once: true, onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: .9, stagger: .06, ease: 'expo.out', overwrite: true }) });
      ScrollTrigger.refresh();
    }
  }
  let tm;
  $('[data-filter]').addEventListener('input', e => { clearTimeout(tm); tm = setTimeout(() => { q = norm(e.target.value.trim()); render(true); }, 120); });
  $('[data-sort]').addEventListener('change', e => { sort = e.target.value; render(true); });
  $$('[data-view]').forEach(b => b.addEventListener('click', () => { view = b.dataset.view; try { localStorage.setItem('lir-view', view); } catch (e) { /* */ } render(true); }));
  render(false);
})();
