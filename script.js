/* ===== Carousel (PRO) ===== */
(function () {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;

  const viewport = carousel.querySelector('.carousel-viewport');
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');
  const dotsWrap = carousel.querySelector('.carousel-dots');

  // Cinturón y tirantes por si algún CSS externo pisa el layout
  track.style.display = 'flex';
  track.style.flexDirection = 'row';
  track.style.flexWrap = 'nowrap';
  slides.forEach(s => { s.style.flex = '0 0 100%'; s.style.minWidth = '100%'; });

  let index = Math.max(0, slides.findIndex(s => s.classList.contains('current')));
  if (index === -1) index = 0;

  // Crear dots
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

  const applyOffset = (offset, withAnim = true) => {
    // Habilita/Deshabilita la animación de desplazamiento
    if (withAnim && !prefersReduced()) {
      track.style.transition = 'transform 0.9s cubic-bezier(0.77, 0, 0.175, 1)';
    } else {
      track.style.transition = 'none';
    }
    track.style.transform = `translateX(${offset}px)`;
  };

  const setIndex = (i, withAnim = true) => {
    index = (i + slides.length) % slides.length;
    const offset = -index * viewport.clientWidth;
    applyOffset(offset, withAnim);

    slides.forEach((s, si) => s.classList.toggle('current', si === index));
    dots.forEach((d, di) => d.setAttribute('aria-selected', di === index ? 'true' : 'false'));
  };

  const next = () => setIndex(index + 1, true);
  const prev = () => setIndex(index - 1, true);

  // Botones
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  // Dots
  dots.forEach((d, di) => d.addEventListener('click', () => setIndex(di, true)));

  // Resize (recoloca SIN animación para evitar saltos)
  let rAf = null;
  const onResize = () => {
    if (rAf) cancelAnimationFrame(rAf);
    rAf = requestAnimationFrame(() => setIndex(index, false));
  };
  window.addEventListener('resize', onResize);

  // Teclado
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  });

  // Táctil (swipe)
  let startX = 0, isTouch = false, dragging = false;
  viewport.addEventListener('touchstart', (e) => {
    isTouch = true; dragging = true;
    startX = e.touches[0].clientX;
    // desactiva transición para arrastre
    track.style.transition = 'none';
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (!isTouch || !dragging) return;
    const dx = e.touches[0].clientX - startX;
    const base = -index * viewport.clientWidth;
    track.style.transform = `translateX(${base + dx}px)`;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    if (!isTouch) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - startX;
    const threshold = Math.max(30, viewport.clientWidth * 0.08);
    if (dx > threshold) prev();
    else if (dx < -threshold) next();
    else setIndex(index, true); // vuelve suavemente si no pasa el umbral
    isTouch = false;
  });

  // Autoplay (pausa al hover / focus)
  let autoplayMs = 5000;
  let timer = null;
  const startAutoplay = () => {
    if (prefersReduced()) return;
    stopAutoplay();
    timer = setInterval(next, autoplayMs);
  };
  const stopAutoplay = () => { if (timer) { clearInterval(timer); timer = null; } };

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('focusin', stopAutoplay);
  carousel.addEventListener('focusout', startAutoplay);

  // Init (colocar sin animación y activar)
  setIndex(index, false);
  // pequeña cola para que la primera interacción sí anime
  requestAnimationFrame(() => { track.style.transition = ''; });
  startAutoplay();
})();
