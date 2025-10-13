// Validación básica del formulario de contacto
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Gracias por contactarnos. Nos pondremos en contacto contigo pronto.');
    this.reset();
  });
}

// Carrusel de proyectos
const carouselTrack = document.querySelector('.carousel-track');
const slides = carouselTrack ? Array.from(carouselTrack.children) : [];
const nextButton = document.querySelector('.carousel-control.next');
const prevButton = document.querySelector('.carousel-control.prev');
const carousel = document.querySelector('.carousel');

if (carouselTrack && slides.length > 1) {
  let currentIndex = 0;
  let autoplayId;

  const goToSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    carouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
  };

  const nextSlide = () => goToSlide(currentIndex + 1);
  const prevSlide = () => goToSlide(currentIndex - 1);

  const startAutoplay = () => {
    stopAutoplay();
    autoplayId = setInterval(nextSlide, 6000);
  };

  const stopAutoplay = () => {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  };

  nextButton?.addEventListener('click', () => {
    nextSlide();
    startAutoplay();
  });

  prevButton?.addEventListener('click', () => {
    prevSlide();
    startAutoplay();
  });

  carousel?.addEventListener('mouseenter', stopAutoplay);
  carousel?.addEventListener('mouseleave', startAutoplay);

  goToSlide(0);
  startAutoplay();
}