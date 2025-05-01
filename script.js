// Validación básica del formulario de contacto
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Gracias por contactarnos. Nos pondremos en contacto contigo pronto.');
    this.reset();
  });
  