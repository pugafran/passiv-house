/* ===== Carousel (PRO) – autoplay siempre ===== */
(function () {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;

  const viewport = carousel.querySelector('.carousel-viewport');
  const track    = carousel.querySelector('.carousel-track');
  const slides   = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const prevBtn  = carousel.querySelector('.carousel-btn.prev');
  const nextBtn  = carousel.querySelector('.carousel-btn.next');
  const dotsWrap = carousel.querySelector('.carousel-dots');

  // Cinturón y tirantes (por si el CSS cambia)
  track.style.display = 'flex';
  track.style.flexDirection = 'row';
  track.style.flexWrap = 'nowrap';
  slides.forEach(s => { s.style.flex = '0 0 100%'; s.style.minWidth = '100%'; });

  // Asegura que solo una slide tenga 'current'
  let index = slides.findIndex(s => s.classList.contains('current'));
  if (index < 0) index = 0;
  slides.forEach((s, i) => s.classList.toggle('current', i === index));

  // Dots
  dotsWrap.innerHTML = '';
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
    if (i === index) b.setAttribute('aria-selected', 'true');
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.querySelectorAll('button'));

  const prefersReduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const vw = () => viewport.getBoundingClientRect().width || viewport.clientWidth;

  const applyOffset = (offset, withAnim = true) => {
    track.style.transition =
      (withAnim && !prefersReduced()) ? 'transform 0.9s cubic-bezier(0.77,0,0.175,1)' : 'none';
    track.style.transform = `translateX(${offset}px)`;
  };

  const setIndex = (i, withAnim = true) => {
    index = (i + slides.length) % slides.length;
    const offset = -index * vw();
    applyOffset(offset, withAnim);
    slides.forEach((s, si) => s.classList.toggle('current', si === index));
    dots.forEach((d, di) => d.setAttribute('aria-selected', di === index ? 'true' : 'false'));
  };

  const next = () => setIndex(index + 1, true);
  const prev = () => setIndex(index - 1, true);

  // Botones
  nextBtn?.addEventListener('click', () => { next(); scheduleAutoplay(); });
  prevBtn?.addEventListener('click', () => { prev(); scheduleAutoplay(); });

  // Dots
  dots.forEach((d, di) => d.addEventListener('click', () => { setIndex(di, true); scheduleAutoplay(); }));

  // Resize sin saltos + reprograma autoplay
  let rAf = null;
  const onResize = () => {
    if (rAf) cancelAnimationFrame(rAf);
    rAf = requestAnimationFrame(() => { setIndex(index, false); scheduleAutoplay(); });
  };
  window.addEventListener('resize', onResize);

  // Teclado
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); scheduleAutoplay(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); scheduleAutoplay(); }
  });

  // Swipe táctil (pausa durante el drag para que no “pelee” con autoplay)
  let startX = 0, dragging = false;
  viewport.addEventListener('touchstart', (e) => {
    dragging = true;
    startX = e.touches[0].clientX;
    track.style.transition = 'none';
    stopAutoplay();
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - startX;
    const base = -index * vw();
    track.style.transform = `translateX(${base + dx}px)`;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - startX;
    const threshold = Math.max(30, vw() * 0.08);
    if (dx > threshold) prev();
    else if (dx < -threshold) next();
    else setIndex(index, true);
    scheduleAutoplay(); // reanuda ritmo
  });

  // ===== AUTOPLAY SIEMPRE ACTIVO =====
  const AUTOPLAY_MS = 5000;
  let autoplayId = null;

  function scheduleAutoplay() {
    clearTimeout(autoplayId);
    if (prefersReduced()) return;      // respeta accesibilidad
    autoplayId = setTimeout(() => {
      next();
      scheduleAutoplay();
    }, AUTOPLAY_MS);
  }
  function stopAutoplay()  { clearTimeout(autoplayId); autoplayId = null; }
  function startAutoplay() { scheduleAutoplay(); }

  // Pausa solo si la pestaña está oculta (evita saltos y gasta menos)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  // INIT: coloca sin animación y arranca autoplay
  setIndex(index, false);
  requestAnimationFrame(() => { track.style.transition = ''; });
  startAutoplay();

  // Si las imágenes tardan en cargar y el ancho cambia, recoloca
  const imgs = carousel.querySelectorAll('img');
  imgs.forEach(img => img.complete ? null : img.addEventListener('load', onResize, { once: true }));

  // (Opcional) robustez extra ante cambios de layout internos
  const ro = new ResizeObserver(onResize);
  ro.observe(viewport);
})();
