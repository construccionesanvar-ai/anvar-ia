/* ==========================================================================
   ANVAR IA — páginas de servicio
   Versión liviana de app.js: solo lo que estas páginas necesitan.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var WSP = '56926333760';

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  // Vercel Web Analytics. Si no está habilitado, no hace nada.
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  function medir(nombre, datos) {
    try { window.va('event', { name: nombre, data: datos || {} }); } catch (e) { /* da igual */ }
  }

  // El servicio de esta página, para que el mensaje llegue con contexto.
  var SERVICIO = (document.body.getAttribute('data-servicio') || '').trim();
  var FRASE = (document.body.getAttribute('data-frase') || '').trim();

  $$('[data-wsp]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      medir('whatsapp', { origen: a.getAttribute('data-wsp') || 'servicio', servicio: SERVICIO });
      var t = 'Hola Andrés. Vengo de la página de ' + SERVICIO + ' en anvar ia.\n\n' +
        (FRASE || 'Quiero saber más.');
      window.open('https://wa.me/' + WSP + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
    });
  });

  // Acordeón de preguntas
  var faq = $('#faq');
  if (faq) {
    $$('.fq', faq).forEach(function (it) {
      var btn = $('button', it);
      btn.addEventListener('click', function () {
        var abierto = it.getAttribute('data-open') === 'true';
        $$('.fq', faq).forEach(function (o) {
          o.setAttribute('data-open', 'false');
          $('button', o).setAttribute('aria-expanded', 'false');
        });
        it.setAttribute('data-open', String(!abierto));
        btn.setAttribute('aria-expanded', String(!abierto));
      });
    });
  }

  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    $$('.rv').forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
    setTimeout(function () { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }, 1800);
  } else {
    $$('.rv').forEach(function (el) { el.classList.add('in'); });
  }
})();
