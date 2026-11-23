/* Lironta demo: kontaktų puslapis. Forma tikrina laukus, bet duomenų niekur nesiunčia. */
(() => {
  const { motion, $, $$, esc } = window.LIR;
  const form = $('[data-form]');

  /* žemėlapis kraunamas tik priartėjus */
  const map = $('[data-map-src]');
  if (map) new IntersectionObserver((en, io) => { if (en[0].isIntersecting) { map.src = map.dataset.mapSrc; io.disconnect(); } }, { rootMargin: '300px' }).observe(map);

  /* užklausos sąrašas formoje */
  const box = $('[data-form-inq]');
  const list = LIR.inq.list();
  box.innerHTML = list.length
    ? `<b>Užklausoje ${list.length} ${list.length === 1 ? 'produktas' : 'produktai'}:</b> ${list.map(x => esc(`${x.variant || x.code || x.name} × ${x.qty}`)).join(', ')}. <button type="button" data-open="drawer" style="text-decoration:underline;font-weight:700">Redaguoti</button>`
    : `<b>Užklausos sąrašas tuščias.</b> Produktus galite pridėti <a href="produkcija.html" style="text-decoration:underline;font-weight:700">produkcijos</a> puslapyje arba aprašyti žinutėje.`;

  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const check = fld => {
    const i = $('input, textarea', fld);
    if (!i || !i.required) return true;
    const ok = i.type === 'email' ? emailOk(i.value.trim()) : i.value.trim().length > 1;
    fld.classList.toggle('is-err', !ok);
    i.setAttribute('aria-invalid', String(!ok));
    return ok;
  };
  $$('.fld', form).forEach(f => { const i = $('input, textarea', f); i && i.addEventListener('blur', () => f.classList.contains('is-err') && check(f)); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = $$('.fld', form).filter(f => !check(f));
    const consent = $('[data-consent]', form);
    if (!consent.checked) { bad.push(consent); consent.closest('.check').style.color = '#A3261B'; } else consent.closest('.check').style.color = '';
    if (bad.length) { (bad[0].querySelector ? $('input, textarea', bad[0]) || bad[0] : bad[0]).focus(); return; }
    form.classList.add('is-sent');
    const ok = $('.form__ok', form);
    if (motion) gsap.from(ok, { y: 20, opacity: 0, duration: .8 });
    LIR.toast('Užklausa paruošta (demo, niekur nesiunčiama)');
  });
})();
