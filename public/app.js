/* ==========================================================================
   ANVAR TECH · IA & Automatización — interacción común a todas las páginas
   Medición, atribución, WhatsApp, UF del día, menú móvil y formulario.
   Las herramientas (autodiagnóstico, calculadora de ROI, punto de pedido)
   viven en herramientas.js y solo se cargan en las páginas que las tienen.
   Sin dependencias.

   Configuración: <script type="application/json" id="config">, que genera el
   build desde src/ (mensajes, WhatsApp, agenda, UF de referencia y, solo donde
   hace falta, los datos de las herramientas).

   Eventos (Vercel Web Analytics; page_view lo registra Vercel solo). Un clic
   genera UN evento. Lista completa y definición en README.md › Analítica.
     Visita:     organic_landing_view · resource_view · case_view
     Portada:    home_roi_tool_click · home_diagnostic_tool_click
     Contenido:  hero_cta_click · content_cta_click · case_cta_click · service_click
                 template_download · email_click
     Leads:      whatsapp_lead · express_lead · data_lead · diagnostic_lead
                 case_lead · service_lead (envío del formulario)
     Formulario: form_open (abrió el formulario plegado) · form_start · form_error
     Herramientas (herramientas.js): calculator_view · calculator_start ·
                 calculator_complete · diagnostic_view · diagnostic_start ·
                 diagnostic_complete
   Todos llevan `pagina` y `fuente`; los leads, además, `landing`, `canal` y
   `campana` de la visita. Nunca datos personales ni textos escritos.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var CFG = {};
  try { CFG = JSON.parse(($('#config') || {}).textContent || '{}'); } catch (e) { CFG = {}; }
  var CLP = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });
  var pesos = function (n) { return '$' + CLP.format(Math.round(n)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pagina = location.pathname.replace(/\.html$/, '') || '/';
  var fuente = (document.body && document.body.getAttribute('data-fuente')) || 'web';

  /* ------------------------------------------------------------ medición */
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  var enviados = {};
  /**
   * Envía un evento. Solo acepta textos cortos y números: nada personal.
   * `unaVez` evita duplicados del mismo evento en la misma visita.
   */
  function medir(nombre, datos, unaVez) {
    if (unaVez) { if (enviados[nombre]) return; enviados[nombre] = true; }
    try {
      var d = { pagina: pagina, fuente: fuente };
      for (var k in datos) {
        if (!Object.prototype.hasOwnProperty.call(datos, k)) continue;
        var v = datos[k];
        d[k] = typeof v === 'number' ? v : String(v).slice(0, 60);
      }
      window.va('event', { name: nombre, data: d });
    } catch (e) { /* la medición nunca rompe la página */ }
  }

  /* ---------------------------------------------------------- atribución */
  // Primera página de la visita: de dónde llegó (UTM o referente) y dónde
  // aterrizó. Se guarda en sessionStorage (se borra al cerrar la pestaña) y
  // viaja solo con los eventos de lead. Nunca la URL completa del referente.
  var ATR = 'anvar-atr';
  function canalDeReferente(ref) {
    var h;
    try { h = ref ? new URL(ref).hostname.replace(/^www\./, '') : ''; } catch (e) { h = ''; }
    if (!h) return 'directo';
    if (h === location.hostname) return 'interno';
    if (/(^|\.)google\./.test(h)) return 'google/organic';
    if (/(^|\.)bing\.com$/.test(h)) return 'bing/organic';
    if (/(^|\.)duckduckgo\.com$/.test(h)) return 'duckduckgo/organic';
    if (/(^|\.)(yahoo|ecosia|brave)\./.test(h)) return h.split('.').slice(-2, -1)[0] + '/organic';
    if (/(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)$/.test(h)) return h + '/ai';
    if (/(^|\.)(linkedin\.com|lnkd\.in)$/.test(h)) return 'linkedin/social';
    if (/(^|\.)(facebook\.com|instagram\.com|t\.co|x\.com|youtube\.com|tiktok\.com)$/.test(h)) return h + '/social';
    return h.slice(0, 40) + '/referral';
  }
  var atribucion = (function () {
    try {
      var guardada = sessionStorage.getItem(ATR);
      if (guardada) return JSON.parse(guardada);
    } catch (e) { /* sin sessionStorage: se calcula igual para esta página */ }
    var q = new URLSearchParams(location.search);
    var limpio = function (v) { return (v || '').toLowerCase().replace(/[^a-z0-9._/-]/g, '-').slice(0, 40); };
    var src = limpio(q.get('utm_source')), med = limpio(q.get('utm_medium'));
    var a = {
      landing: pagina,
      canal: src ? src + '/' + (med || 'sin-medio') : canalDeReferente(document.referrer),
      campana: limpio(q.get('utm_campaign')) || 'sin-campana',
      nueva: true
    };
    try { sessionStorage.setItem(ATR, JSON.stringify({ landing: a.landing, canal: a.canal, campana: a.campana })); } catch (e) { /* nada */ }
    return a;
  })();
  var conAtribucion = function (d) {
    d.landing = atribucion.landing; d.canal = atribucion.canal; d.campana = atribucion.campana;
    return d;
  };
  if (atribucion.nueva) medir('organic_landing_view', { landing: atribucion.landing, canal: atribucion.canal, campana: atribucion.campana });

  // Un clic en WhatsApp es un lead, con el nombre de lo que la persona está
  // pidiendo. Es el ÚNICO evento de ese clic (no se suma un data-track).
  var LEAD = { express: 'express_lead', datos: 'data_lead', intelligence: 'data_lead', 'diagnostico-resultado': 'diagnostic_lead', caso: 'case_lead' };
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-track],[data-wsp]') : null;
    if (!t) return;
    var etiqueta = t.getAttribute('data-track-label') || 'sin-etiqueta';
    if (t.hasAttribute('data-wsp')) {
      var ctx = t.getAttribute('data-wsp');
      medir(LEAD[ctx] || 'whatsapp_lead', conAtribucion({ via: 'whatsapp', contexto: ctx, etiqueta: etiqueta }));
    } else medir(t.getAttribute('data-track'), { etiqueta: etiqueta });
  });

  // Vistas de contenido, una vez por página.
  if (/^\/recursos(\/|$)/.test(pagina)) medir('resource_view', { tipo: pagina === '/recursos' ? 'indice' : 'recurso' }, true);
  if (/^\/casos\//.test(pagina)) medir('case_view', { lugar: 'caso-largo' }, true);

  /* ------------------------------------------------------------ WhatsApp */
  // Misma regla que src/datos/whatsapp.mjs: texto + "(ref: fuente)".
  function conRef(texto, f) { return f ? texto + '\n\n(ref: ' + f + ')' : texto; }
  function enlaceWsp(texto) {
    return 'https://wa.me/' + (CFG.wsp || '') + (texto ? '?text=' + encodeURIComponent(texto) : '');
  }

  /* ------------------------------------------------------------------ UF */
  // El HTML trae los precios en UF sin pesos (una cifra fija envejece). Aquí
  // se pide la UF del día a /api/uf (cacheada en la CDN) y se muestra la
  // equivalencia con su fecha. Si no llega, se dice que no está disponible.
  // La página nunca espera esta llamada.
  var ufDia = null; // { valor, fecha } de /api/uf
  var ufListeners = [];
  var fechaCorta = function (iso) { var p = String(iso).slice(0, 10).split('-'); return p[2] + '/' + p[1] + '/' + p[0]; };
  var textoIva = function (iva) { return iva === 'incluido' ? 'IVA incluido' : '+ IVA'; };
  function pintarUf() {
    $$('[data-uf]').forEach(function (el) {
      var uf = +el.getAttribute('data-uf'), iva = el.getAttribute('data-iva');
      el.textContent = ufDia ? '≈ ' + pesos(uf * ufDia.valor) + ' ' + textoIva(iva) : textoIva(iva);
    });
    $$('[data-uf-nota]').forEach(function (el) {
      el.textContent = ufDia
        ? 'Equivalencia en pesos con la UF del ' + fechaCorta(ufDia.fecha) + ' (' + pesos(ufDia.valor) + '). Los precios en UF se facturan con la UF del día de la factura.'
        : 'Equivalencia en pesos no disponible temporalmente. Los precios en UF se facturan con la UF del día de la factura.';
    });
    ufListeners.forEach(function (fn) { fn(ufDia); });
  }
  function traerUf() {
    if (!$('[data-uf],[data-uf-nota],[data-necesita-uf]')) return;
    if (!window.fetch) { pintarUf(); return; }
    var ctrl = window.AbortController ? new AbortController() : null;
    var corte = setTimeout(function () { if (ctrl) ctrl.abort(); }, 5000);
    fetch('/api/uf', { signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) {
        clearTimeout(corte);
        if (!j || !(j.valor > 20000 && j.valor < 100000) || !/^\d{4}-\d{2}-\d{2}/.test(j.fecha || '')) throw 0;
        ufDia = { valor: j.valor, fecha: j.fecha };
        pintarUf();
      })
      .catch(function () { clearTimeout(corte); ufDia = null; pintarUf(); });
  }
  if ('requestIdleCallback' in window) window.requestIdleCallback(traerUf, { timeout: 1500 });
  else setTimeout(traerUf, 600);

  /* ---------------------------------------------------------- menú móvil */
  var menuBtn = $('.menu-btn'), menu = $('#menu');
  if (menuBtn && menu) {
    var etiquetaBtn = $('.sr', menuBtn);
    var abierto = function () { return menu.classList.contains('abierto'); };
    var cerrar = function (devolverFoco) {
      menu.classList.remove('abierto');
      menuBtn.setAttribute('aria-expanded', 'false');
      if (etiquetaBtn) etiquetaBtn.textContent = 'Abrir menú';
      if (devolverFoco) menuBtn.focus();
    };
    menuBtn.addEventListener('click', function () {
      var ab = menu.classList.toggle('abierto');
      menuBtn.setAttribute('aria-expanded', String(ab));
      if (etiquetaBtn) etiquetaBtn.textContent = ab ? 'Cerrar menú' : 'Abrir menú';
      if (ab) { var primero = $('a', menu); if (primero) primero.focus(); }
    });
    menu.addEventListener('click', function (ev) { if (ev.target.closest('a')) cerrar(false); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && abierto()) cerrar(true); });
    document.addEventListener('click', function (ev) {
      if (abierto() && !menu.contains(ev.target) && !menuBtn.contains(ev.target)) cerrar(false);
    });
    // Al salir del menú con Tab, se cierra (no queda un panel abierto tapando la página).
    menu.addEventListener('focusout', function (ev) {
      if (abierto() && ev.relatedTarget && !menu.contains(ev.relatedTarget) && ev.relatedTarget !== menuBtn) cerrar(false);
    });
    window.matchMedia('(min-width: 1121px)').addEventListener('change', function (m) { if (m.matches) cerrar(false); });
  }

  /* ---------------------------------------------------- vista de casos */
  // En páginas que muestran casos (portada, /casos): una vez, al verse la sección.
  var casos = $('#casos') || $('.detalle');
  if (casos && !/^\/casos\//.test(pagina) && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (en.some(function (x) { return x.isIntersecting; })) { medir('case_view', { lugar: pagina === '/casos' ? 'casos' : 'seccion' }, true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(casos);
  }

  /* ------------------------------------------------ videos de los casos */
  // Miniatura → reproducir: el video se crea recién al hacer clic, así la
  // página no descarga megas que nadie pidió. Sin JavaScript, el enlace abre el MP4.
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest ? ev.target.closest('a[data-video]') : null;
    if (!a) return;
    var d; try { d = JSON.parse(a.getAttribute('data-video')); } catch (e) { return; }
    ev.preventDefault();
    var v = document.createElement('video');
    v.controls = true; v.playsInline = true; v.preload = 'auto'; v.autoplay = true;
    if (d.ancho) v.width = d.ancho;
    if (d.alto) v.height = d.alto;
    var img = $('img', a); if (img) v.poster = img.currentSrc || img.src;
    if (d.alt) v.setAttribute('aria-label', d.alt);
    (d.fuentes || []).forEach(function (f) { var s = document.createElement('source'); s.src = f.src; s.type = f.tipo; v.appendChild(s); });
    if (d.subtitulos) { var t = document.createElement('track'); t.kind = 'captions'; t.src = d.subtitulos; t.srclang = 'es'; t.label = 'Español'; t.default = true; v.appendChild(t); }
    a.parentNode.replaceChild(v, a);
    v.focus();
    medir('case_cta_click', { etiqueta: 'video-' + pagina.split('/').pop() });
  });

  /* ------------------------------------------ para herramientas.js */
  window.ANVAR = {
    $: $, $$: $$, cfg: CFG, esc: esc, pesos: pesos, medir: medir, pagina: pagina, fuente: fuente,
    conRef: conRef, enlaceWsp: enlaceWsp, fechaCorta: fechaCorta,
    ufDia: function () { return ufDia; },
    alCambiarUf: function (fn) { ufListeners.push(fn); }
  };

  /* ---------------------------------------------------------- formulario */
  var form = $('#form-contacto');
  if (form) {
    var msg = $('#form-msg'), btn = $('#form-enviar');
    var btnTxt = btn ? $('span', btn) : null;
    if (form.elements.t) form.elements.t.value = String(Date.now());
    var iniciar = function () { medir('form_start', {}, true); };
    // Formulario plegado (páginas editoriales y herramientas): cuántos lo abren.
    var plegado = form.closest('details');
    if (plegado) plegado.addEventListener('toggle', function () { if (plegado.open) medir('form_open', {}, true); });
    form.addEventListener('focusin', iniciar);
    form.addEventListener('input', iniciar);

    var esCorreo = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
    var esFono = function (v) { return /^[+\d\s().-]+$/.test(v) && v.replace(/\D/g, '').length >= 8; };
    var marcar = function (nombre, malo) {
      var el = form.elements[nombre], err = $('#f-' + nombre + '-err');
      el.setAttribute('aria-invalid', String(malo));
      if (err) err.hidden = !malo;
      return malo;
    };
    var campo = function (n) { return (form.elements[n] && form.elements[n].value || '').trim(); };
    var malo = {
      nombre: function () { return campo('nombre').length < 2; },
      contacto: function () { var c = campo('contacto'); return !(esCorreo(c) || esFono(c)); }
    };
    // Un campo ya marcado con error se revisa mientras se escribe: el aviso se va al
    // corregirlo, antes del clic en "Enviar". Si se fuera recién al salir del campo,
    // el botón se movería bajo el cursor y el clic se perdería.
    ['nombre', 'contacto'].forEach(function (n) {
      var revisar = function () { if (form.elements[n].getAttribute('aria-invalid') === 'true') marcar(n, malo[n]()); };
      form.elements[n].addEventListener('input', revisar);
      form.elements[n].addEventListener('blur', revisar);
    });
    var validar = function () {
      var malos = [];
      if (marcar('nombre', malo.nombre())) malos.push(form.elements.nombre);
      if (marcar('contacto', malo.contacto())) malos.push(form.elements.contacto);
      return malos;
    };
    var ocupado = function (si) {
      btn.disabled = si;
      form.setAttribute('aria-busy', String(si));
      if (btnTxt) btnTxt.textContent = si ? 'Enviando…' : 'Enviar';
    };

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      // Un envío a la vez: ni el doble clic ni Enter repetido mandan dos veces.
      if (form.getAttribute('aria-busy') === 'true') return;
      var malos = validar();
      if (malos.length) {
        msg.className = 'form-msg err';
        msg.textContent = 'Revisa los campos marcados.';
        malos[0].focus();
        return;
      }
      var d = {
        nombre: campo('nombre'), empresa: campo('empresa'), contacto: campo('contacto'), tipo: campo('tipo'),
        mensaje: campo('mensaje'), web: campo('web'), t: campo('t'), fuente: campo('fuente') || fuente, origen: pagina
      };
      msg.className = 'form-msg'; msg.textContent = 'Enviando…';
      ocupado(true);
      var alternativa = function (motivo, texto) {
        medir('form_error', { motivo: motivo });
        var tipoTxt = form.elements.tipo.selectedOptions[0] ? form.elements.tipo.selectedOptions[0].text : d.tipo;
        var txt = conRef('Hola ANVAR TECH, les escribo desde su sitio.\n\nNombre: ' + d.nombre + (d.empresa ? '\nEmpresa: ' + d.empresa : '') +
          '\nNecesito: ' + tipoTxt + (d.mensaje ? '\n\n' + d.mensaje : ''), d.fuente);
        msg.className = 'form-msg err';
        msg.innerHTML = esc(texto || 'No pudimos enviar el formulario.') + ' <a href="' + esc(enlaceWsp(txt)) + '" target="_blank" rel="noopener" data-wsp="formulario" data-track-label="formulario-alternativa">Envíalo por WhatsApp</a> con el mensaje ya escrito, o escríbenos a <a href="mailto:contacto@anvartech.cl">contacto@anvartech.cl</a>.';
        ocupado(false);
      };
      var ctrl = window.AbortController ? new AbortController() : null;
      var corte = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
      fetch('/api/contacto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d), signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) {
          clearTimeout(corte);
          return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, j: j }; });
        })
        .then(function (res) {
          if (!res.ok) {
            var texto = res.status === 400 && res.j && res.j.error ? res.j.error
              : res.status === 429 ? 'Recibimos varios envíos seguidos desde tu conexión.'
              : null;
            return alternativa('http-' + res.status, texto);
          }
          medir('service_lead', conAtribucion({ tipo: d.tipo }));
          msg.className = 'form-msg ok';
          msg.textContent = 'Listo, nos llegó. Te respondemos antes de 24 horas hábiles.';
          form.reset();
          $$('[aria-invalid]', form).forEach(function (el) { el.setAttribute('aria-invalid', 'false'); });
          if (form.elements.t) form.elements.t.value = String(Date.now());
          ocupado(false);
        })
        .catch(function () { clearTimeout(corte); alternativa('red'); });
    });
  }

  /* ------------------------------------------------------------- detalles */
  $$('[data-anio]').forEach(function (e) { e.textContent = String(new Date().getFullYear()); });
})();
