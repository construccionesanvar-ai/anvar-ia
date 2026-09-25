/* ==========================================================================
   ANVAR TECH · IA & Automatización — interacción del sitio
   Un solo archivo para todas las páginas; cada módulo revisa si su HTML
   existe antes de actuar. Sin dependencias.

   Configuración: viene de <script type="application/json" id="config">,
   que genera el build desde src/ (precios, mensajes, WhatsApp, agenda, UF).

   Embudo medido (Vercel Web Analytics; page_view lo registra Vercel solo):
     organic_landing_view (primera página de cada visita, con su canal)
     hero_cta_click · content_cta_click · case_cta_click · cases_view · service_click
     calculator_start · calculator_complete (herramienta: roi | punto-pedido)
     diagnostic_start · diagnostic_complete · diagnostic_whatsapp_click
     template_download · calendar_click · email_click
     whatsapp_lead · form_start · service_lead · form_error
   Cada evento lleva `pagina` y `fuente` (origen del lead). Los de lead llevan
   además la atribución de la visita (landing, canal, campaña). No se envían
   datos personales: ni nombres, ni correos, ni teléfonos, ni textos escritos.
   La lista completa está en README.md › Medición.
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

  document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-track],[data-wsp]') : null;
    if (!t) return;
    var etiqueta = t.getAttribute('data-track-label') || 'sin-etiqueta';
    if (t.hasAttribute('data-track')) medir(t.getAttribute('data-track'), { etiqueta: etiqueta });
    if (t.hasAttribute('data-wsp')) medir('whatsapp_lead', conAtribucion({ contexto: t.getAttribute('data-wsp'), etiqueta: etiqueta }));
  });

  /* ------------------------------------------------------------ WhatsApp */
  // Misma regla que src/datos/whatsapp.mjs: texto + "(ref: fuente)".
  function conRef(texto, f) { return f ? texto + '\n\n(ref: ' + f + ')' : texto; }
  function enlaceWsp(texto) {
    return 'https://wa.me/' + (CFG.wsp || '') + (texto ? '?text=' + encodeURIComponent(texto) : '');
  }

  /* ------------------------------------------------------------------ UF */
  // El HTML trae la UF de referencia (con fecha). Si /api/uf responde, se
  // reemplaza por la del día. Si no, y la de referencia está vieja, se deja
  // solo el precio en UF. La carga de la página nunca espera esta llamada.
  var UF = CFG.uf || null;
  var ufValor = UF ? UF.valor : 0;
  var ufListeners = [];
  var fechaCorta = function (iso) { var p = String(iso).slice(0, 10).split('-'); return p[2] + '/' + p[1] + '/' + p[0]; };
  var textoIva = function (iva) { return iva === 'incluido' ? 'IVA incluido' : '+ IVA'; };
  function pintarUf(valor, fecha, deHoy) {
    $$('[data-uf]').forEach(function (el) {
      var uf = +el.getAttribute('data-uf'), iva = el.getAttribute('data-iva');
      el.textContent = valor ? '≈ ' + pesos(uf * valor) + ' ' + textoIva(iva) : textoIva(iva);
    });
    $$('[data-uf-nota]').forEach(function (el) {
      el.textContent = valor
        ? 'Equivalencia en pesos referencial, con UF de ' + pesos(valor) + (deHoy ? ' (valor del ' : ' al ') + fechaCorta(fecha) + (deHoy ? ').' : '.')
        : 'Precios en UF. El valor en pesos se calcula con la UF del día de la factura.';
    });
    if (valor) { ufValor = valor; ufListeners.forEach(function (fn) { fn(); }); }
  }
  function ufReferenciaVieja() {
    if (!UF || !UF.fecha) return true;
    var dias = (Date.now() - new Date(UF.fecha + 'T12:00:00-03:00').getTime()) / 86400000;
    return dias > (UF.vigenciaDias || 45);
  }
  function traerUf() {
    if (!window.fetch || !$('[data-uf],[data-uf-nota]') && !$('#c-personas')) return;
    var ctrl = window.AbortController ? new AbortController() : null;
    var corte = setTimeout(function () { if (ctrl) ctrl.abort(); }, 5000);
    fetch('/api/uf', { signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) {
        clearTimeout(corte);
        if (!j || !(j.valor > 20000 && j.valor < 100000) || !j.fecha) throw 0;
        pintarUf(j.valor, j.fecha, true);
      })
      .catch(function () {
        clearTimeout(corte);
        if (ufReferenciaVieja()) pintarUf(0, '', false);
      });
  }
  if ('requestIdleCallback' in window) window.requestIdleCallback(traerUf, { timeout: 3000 });
  else setTimeout(traerUf, 1200);

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
  var casos = $('#casos') || $('.detalle');
  if (casos && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (en.some(function (x) { return x.isIntersecting; })) { medir('cases_view', {}, true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(casos);
  }

  /* ----------------------------------------------------- autodiagnóstico */
  var D = CFG.diagnostico;
  var dCuerpo = $('#diag-cuerpo');
  if (D && dCuerpo) {
    var TOTAL = D.preguntas.length + 1;
    var cat = null, resp = D.preguntas.map(function () { return null; });
    var paso = 0;
    var dPaso = $('#diag-paso'), dProg = $$('#diag-progreso i'), dVolver = $('#diag-volver'), dReiniciar = $('#diag-reiniciar');

    var ejes = function () {
      var e = { potencial: [], base: [], traccion: [] };
      D.preguntas.forEach(function (p, i) {
        if (resp[i] === null) return;
        e[p.eje].push(p.invertir ? 3 - resp[i] : resp[i]);
      });
      var pct = function (a) { return a.length ? Math.round(a.reduce(function (x, y) { return x + y; }, 0) / (a.length * 3) * 100) : 0; };
      return { potencial: pct(e.potencial), base: pct(e.base), traccion: pct(e.traccion) };
    };
    var indice = function (e) { return Math.round((e.potencial + e.base + e.traccion) / 3); };
    var etapa = function (n) { return n < 30 ? 'Inicial' : n < 55 ? 'En exploración' : n < 78 ? 'En adopción' : 'Listo para escalar'; };

    var recomendar = function (e, c) {
      if (c && c.id === 'datos') return e.base >= 50 ? 'intelligence' : 'diagnostico';
      // El piloto es el paso más grande: solo con datos ordenados y capacidad de decidir claras (2 de 3 o más).
      if (e.potencial >= 60 && e.base >= 67 && e.traccion >= 67) return 'piloto';
      if (e.potencial >= 60) return 'diagnostico';
      if (e.potencial >= 40) return 'express';
      return 'capacitacion';
    };

    var lectura = function (e, recId) {
      if (recId === 'intelligence') return 'Tus datos están razonablemente ordenados: el siguiente paso es leerlos a tiempo. Un tablero con alertas de stock, márgenes y anomalías se puede partir con lo que ya tienes, sin un proyecto grande.';
      if (recId === 'diagnostico' && e.base < 50) return 'Hay bastante que ganar, pero la información está repartida o no está medida. Automatizar encima de ese desorden solo lo hace más rápido: conviene medir y ordenar primero. Es exactamente lo que resuelve una semana de diagnóstico.';
      if (recId === 'diagnostico') return 'La oportunidad es clara, pero hace falta un caso con números para decidir o para convencer internamente. Un diagnóstico deja por escrito cuánto cuesta hoy el proceso y cuánto se ahorraría.';
      if (recId === 'piloto') return 'Estás en el mejor escenario: hay mucho que ganar, la información está ordenada y pueden decidir. No hace falta estudiar más: conviene un piloto sobre el proceso más costoso, medido antes y después.';
      if (recId === 'express') return 'Hay tiempo que recuperar, pero no lo suficiente para un proyecto grande. Lo razonable es resolver un proceso puntual con una Automatización Express y ver el resultado antes de ir por más.';
      return 'No vemos todavía un proceso caro que justifique un proyecto, y es bueno saberlo. Lo que más rinde en tu caso es que el equipo use mejor las herramientas que ya tiene.';
    };

    /** Mensaje de WhatsApp con el resultado: solo respuestas del cuestionario, nada personal. */
    // Oportunidades concretas, leídas de las respuestas (no del puntaje).
    // Cada una dice qué hacer y adónde ir; se muestran hasta tres.
    var ENLACE_CAT = {
      documental: ['/automatizacion-documental', 'Cómo se automatizan documentos'],
      comercial: ['/automatizar-cotizaciones', 'Cómo se automatizan cotizaciones'],
      datos: ['/herramientas/punto-de-pedido', 'Calcular el punto de pedido'],
      operacional: ['/automatizar-excel', 'Cómo se automatiza Excel']
    };
    var oportunidades = function (c) {
      var o = [];
      var r = function (i) { return resp[i]; };
      if (r(0) >= 2) o.push(['Hay tiempo suficiente en tareas repetidas para que automatizar se note: ' + D.preguntas[0].o[r(0)].toLowerCase() + '.', ENLACE_CAT[c.id]]);
      if (r(1) >= 2) o.push(['El proceso depende de una persona. Documentarlo es el primer paso y baja el riesgo aunque no se automatice.', ['/recursos/como-detectar-proceso-automatizable', 'Checklist antes de automatizar']]);
      if (r(2) === 0) o.push(['La información está en papel o en la cabeza de alguien: antes de automatizar hay que pasarla a digital.', ['/recursos/procesos-que-no-deberias-automatizar', 'Qué ordenar antes']]);
      else if (r(2) === 1) o.push(['Los archivos están sueltos. Juntarlos en un lugar común abarata cualquier automatización.', null]);
      else if (r(2) === 3) o.push(['Ya tienen un sistema: lo normal es conectarse a él, no reemplazarlo.', ['/recursos/ia-vs-automatizacion-tradicional', 'Reglas, RPA o IA']]);
      if (r(3) !== null && r(3) <= 1) o.push(['No tienen medido cuánto cuesta el proceso. Con cuatro datos se estima en un minuto.', ['/calculadora-roi-automatizacion', 'Calcular el costo y el retorno']]);
      if (r(5) !== null && r(5) <= 1) o.push(['Para avanzar hará falta un caso con números para quien decide.', ['/recursos/plantilla-roi-automatizacion', 'Plantilla Excel de ROI']]);
      else if (r(5) >= 2) o.push(['Hay capacidad de decisión: un proceso pequeño con precio fijo se puede partir sin un proyecto grande.', null]);
      if (o.length < 3 && ENLACE_CAT[c.id] && r(0) < 2) o.push(['Tu foco está en ' + c.frase + '.', ENLACE_CAT[c.id]]);
      return o.slice(0, 3);
    };
    var htmlOportunidades = function (c) {
      var o = oportunidades(c);
      if (!o.length) return '';
      return '<div class="oportunidades"><h4>Lo que sale de tus respuestas</h4><ul>' + o.map(function (x) {
        return '<li>' + esc(x[0]) + (x[1] ? ' <a href="' + esc(x[1][0]) + '" data-track="content_cta_click" data-track-label="diagnostico-' + esc(x[1][0].split('/').pop()) + '">' + esc(x[1][1]) + ' →</a>' : '') + '</li>';
      }).join('') + '</ul></div>';
    };

    var mensajeResultado = function (n, e, c, rec) {
      var lineas = [
        'Hola ANVAR TECH. Hice el autodiagnóstico de automatización en su sitio.',
        '',
        'Resultado: ' + n + '/100 (' + etapa(n) + ')',
        'Principal oportunidad: ' + c.frase,
        'Potencial de automatización: ' + e.potencial + '%'
      ];
      D.preguntas.forEach(function (p, i) {
        if (p.wsp && resp[i] !== null) lineas.push(p.wsp + ': ' + p.o[resp[i]]);
      });
      lineas.push('Primer paso sugerido: ' + rec.nombre, '', 'Quiero conversar si esto se puede automatizar.');
      return conRef(lineas.join('\n'), 'diagnostic');
    };

    var pintarIndicador = function () {
      var e = ejes(), n = indice(e);
      var hay = resp.some(function (r) { return r !== null; });
      var arco = $('#medidor-arco');
      if (arco) arco.style.strokeDashoffset = String(276 - 276 * (hay ? n : 0) / 100);
      $('#medidor-v').innerHTML = (hay ? n : '—') + ' <small>/ 100</small>';
      $('#medidor-e').textContent = hay ? etapa(n) : 'Sin responder';
      ['potencial', 'base', 'traccion'].forEach(function (k) {
        $('#eje-' + k).style.width = (hay ? e[k] : 0) + '%';
        $('#eje-' + k + '-v').textContent = hay ? e[k] + '%' : '—';
      });
      dProg.forEach(function (i, k) { i.classList.toggle('on', k < paso || (k === 0 && cat !== null)); });
    };

    var pintarPregunta = function () {
      var esCat = paso === 0;
      var titulo = esCat ? '¿Qué te gustaría resolver primero?' : D.preguntas[paso - 1].t;
      var opciones = esCat ? D.categorias.map(function (c) { return c.opcion; }) : D.preguntas[paso - 1].o;
      var elegida = esCat ? cat : resp[paso - 1];
      dPaso.textContent = 'Pregunta ' + (paso + 1) + ' de ' + TOTAL;
      dCuerpo.innerHTML = '<fieldset class="diag-pregunta"><legend id="diag-texto"></legend><div class="opciones"></div></fieldset>';
      $('#diag-texto', dCuerpo).textContent = titulo;
      var cont = $('.opciones', dCuerpo);
      opciones.forEach(function (txt, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'opcion';
        b.setAttribute('aria-pressed', String(elegida === i));
        b.innerHTML = '<span class="opcion-k" aria-hidden="true">' + 'ABCD'[i] + '</span><span></span>';
        b.lastChild.textContent = txt;
        b.addEventListener('click', function () { responder(i); });
        cont.appendChild(b);
      });
      dVolver.hidden = paso === 0;
      pintarIndicador();
    };

    var responder = function (i) {
      medir('diagnostic_start', {}, true);
      if (paso === 0) cat = i; else resp[paso - 1] = i;
      if (paso < TOTAL - 1) { paso++; pintarPregunta(); var b = $('.opcion', dCuerpo); if (b) b.focus({ preventScroll: true }); }
      else resultado();
    };

    var resultado = function () {
      var e = ejes(), n = indice(e), c = D.categorias[cat], recId = recomendar(e, c), rec = D.servicios[recId];
      paso = TOTAL; pintarIndicador();
      dPaso.textContent = 'Tu resultado';
      medir('diagnostic_complete', { indice: n, recomendacion: recId, categoria: c.id }, true);

      var segunda = CFG.agenda
        ? '<a class="btn btn--secundario" href="' + esc(CFG.agenda) + '" target="_blank" rel="noopener" data-track="calendar_click" data-track-label="diagnostico">Agendar evaluación de 20 min</a>'
        : '<a class="btn btn--secundario" href="#evaluar" data-track="hero_cta_click" data-track-label="diagnostico">Coordinar una evaluación de 20 min</a>';

      dCuerpo.innerHTML =
        '<div class="resultado-diag" tabindex="-1" id="diag-resultado">' +
        '<h3>Tu resultado: ' + n + ' de 100 · ' + esc(etapa(n)) + '</h3>' +
        '<dl class="resultado-datos">' +
          '<div><dt>Nivel de preparación</dt><dd>' + esc(etapa(n)) + '<small>' + n + ' / 100</small></dd></div>' +
          '<div><dt>Potencial de automatización</dt><dd>' + e.potencial + '%<small>tiempo repetitivo y fragilidad</small></dd></div>' +
          '<div><dt>Primer paso sugerido</dt><dd><a href="' + esc(rec.url) + '" data-track="service_click" data-track-label="diagnostico-' + recId + '">' + esc(rec.nombre) + '</a><small>' + esc(rec.precio) + '</small></dd></div>' +
          '<div><dt>Tipo de solución</dt><dd>' + esc(c.solucion) + '</dd></div>' +
        '</dl>' +
        '<p class="lectura" id="diag-lectura">' + esc(lectura(e, recId)) + '</p>' +
        htmlOportunidades(c) +
        '<div class="resultado-acciones">' +
          '<a class="btn btn--primario" href="' + esc(enlaceWsp(mensajeResultado(n, e, c, rec))) + '" target="_blank" rel="noopener" data-wsp="diagnostico-resultado" data-track="diagnostic_whatsapp_click" data-track-label="resultado">Conversar este resultado por WhatsApp</a>' +
          segunda +
        '</div>' +
        '<p class="nota">El mensaje se abre en WhatsApp con tu resultado ya escrito; lo revisas antes de enviarlo. Es una orientación: el resultado real depende del proceso.</p>' +
        '</div>';
      dVolver.hidden = false;
      var r = $('#diag-resultado'); if (r) r.focus({ preventScroll: false });
      lecturaIA(e, n, c, recId);
    };

    // Lectura escrita por IA para este caso. La local ya está en pantalla:
    // si el servicio no responde, no se nota nada.
    var lecturaIA = function (e, n, c, recId) {
      var destino = $('#diag-lectura');
      if (!destino || !window.fetch) return;
      fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indice: n, potencial: e.potencial, base: e.base, traccion: e.traccion, publico: 'empresas', categoria: c.solucion, recomendacion: recId })
      }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (j) {
          if (!j || !j.texto || !$('#diag-lectura')) return;
          destino.textContent = j.texto.split(/\n{2,}/).join('\n\n');
          destino.insertAdjacentHTML('afterend', '<p class="lectura-nota">Lectura escrita por IA para tu caso, a partir de tus respuestas.</p>');
        }).catch(function () {});
    };

    dVolver.addEventListener('click', function () {
      if (paso > TOTAL - 1) paso = TOTAL - 1; else if (paso > 0) paso--;
      pintarPregunta();
      var b = $('.opcion', dCuerpo); if (b) b.focus({ preventScroll: true });
    });
    dReiniciar.addEventListener('click', function () {
      cat = null; resp = resp.map(function () { return null; }); paso = 0;
      pintarPregunta();
      var b = $('.opcion', dCuerpo); if (b) b.focus({ preventScroll: true });
    });
    // El HTML ya trae la primera pregunta; se reemplaza por la versión interactiva.
    pintarPregunta();
  }

  /* --------------------------------------------------------- calculadora */
  var cPers = $('#c-personas');
  var K = CFG.calc;
  if (cPers && K) {
    var cHoras = $('#c-horas'), cCosto = $('#c-costo'), cAuto = $('#c-auto'), cReset = $('#c-reiniciar');
    var controles = [cPers, cHoras, cCosto, cAuto];
    var empezo = false, anuncio = null;
    // Misma fórmula que src/componentes/herramientas.mjs (calcular + textoRetorno).
    var calcular = function () {
      var personas = +cPers.value, horas = +cHoras.value, costo = +cCosto.value, auto = +cAuto.value;
      var horasAno = personas * horas * K.semanas;
      var recuperadas = Math.round(horasAno * auto / 100);
      var restantes = horasAno - recuperadas;
      var valor = recuperadas * costo;
      var ref = valor < K.umbral
        ? { nombre: K.express.nombre, precio: K.express.precio, etiqueta: K.express.etiqueta }
        : { nombre: K.piloto.nombre, precio: K.piloto.uf * ufValor, etiqueta: K.piloto.etiqueta };
      var meses = valor > 0 ? ref.precio / (valor / 12) : Infinity;
      var retorno;
      if (!isFinite(meses) || meses > K.mesesMax) retorno = 'Con estos números no se justifica automatizar solo por ahorro de tiempo. Conviene revisar si hay errores o reprocesos que cuesten más.';
      else retorno = 'Como referencia, con este valor ' + ref.nombre + ' (' + ref.etiqueta + ') se pagaría en ' + (meses < 1 ? 'menos de un mes' : meses < 10 ? meses.toFixed(1).replace('.', ',') + ' meses' : Math.round(meses) + ' meses') + '.';

      cPers.setAttribute('aria-valuetext', personas + (personas === 1 ? ' persona' : ' personas'));
      cHoras.setAttribute('aria-valuetext', horas + (horas === 1 ? ' hora' : ' horas') + ' a la semana');
      cCosto.setAttribute('aria-valuetext', pesos(costo) + ' por hora');
      cAuto.setAttribute('aria-valuetext', auto + ' por ciento');
      $('#c-personas-v').textContent = String(personas);
      $('#c-horas-v').textContent = horas + ' h';
      $('#c-costo-v').textContent = pesos(costo);
      $('#c-auto-v').textContent = auto + '%';
      $('#c-valor').textContent = pesos(valor);
      $('#c-hoy').textContent = CLP.format(horasAno) + ' h';
      $('#c-despues').textContent = CLP.format(restantes) + ' h';
      $('#c-barra-despues').style.width = (horasAno ? restantes / horasAno * 100 : 0) + '%';
      $('#c-horas-lib').textContent = CLP.format(recuperadas) + ' h';
      $('#c-retorno').textContent = retorno;
      return { valor: valor, recuperadas: recuperadas };
    };
    // Lectores de pantalla: un resumen cuando se suelta el control, no en cada paso del arrastre.
    var anunciar = function () {
      clearTimeout(anuncio);
      anuncio = setTimeout(function () {
        var r = calcular();
        $('#c-anuncio').textContent = 'Valor anual estimado: ' + pesos(r.valor) + '. Horas que se liberan al año: ' + CLP.format(r.recuperadas) + '.';
      }, 400);
    };
    var marcarTuya = function (tuya) {
      var est = $('#c-estado');
      est.textContent = tuya ? 'Tu estimación' : 'Ejemplo ilustrativo';
      est.classList.toggle('insignia--tuya', tuya);
    };
    controles.forEach(function (el) {
      el.addEventListener('input', function () {
        calcular();
        if (!empezo) { empezo = true; marcarTuya(true); medir('calculator_start', { herramienta: 'roi' }, true); }
      });
      el.addEventListener('change', function () {
        anunciar();
        if (!empezo) return;
        var v = calcular().valor;
        medir('calculator_complete', { herramienta: 'roi', tramo: v < 2000000 ? 'menos-2M' : v < 10000000 ? '2M-10M' : 'mas-10M' }, true);
      });
    });
    if (cReset) cReset.addEventListener('click', function () {
      controles.forEach(function (el) { el.value = el.getAttribute('data-defecto'); });
      empezo = false; marcarTuya(false); calcular(); anunciar();
    });
    // Enlace para compartir: solo los cuatro valores, en la URL. Al abrirlo,
    // la calculadora parte con ellos (ajustados a los rangos permitidos).
    var PARAMS = { personas: cPers, horas: cHoras, costo: cCosto, auto: cAuto };
    var cCompartir = $('#c-compartir');
    if (cCompartir) {
      var q = new URLSearchParams(location.search), traidos = false;
      Object.keys(PARAMS).forEach(function (k) {
        var el = PARAMS[k], v = parseFloat(q.get(k));
        if (!isFinite(v)) return;
        var min = +el.min, max = +el.max, paso = +el.step || 1;
        v = Math.min(max, Math.max(min, Math.round((v - min) / paso) * paso + min));
        el.value = String(v); traidos = true;
      });
      if (traidos) { empezo = true; marcarTuya(true); }
      var cMsg = $('#c-compartir-msg');
      cCompartir.addEventListener('click', function () {
        var u = location.origin + location.pathname + '?' + Object.keys(PARAMS).map(function (k) { return k + '=' + encodeURIComponent(PARAMS[k].value); }).join('&') + '#herramienta';
        var listo = function (txt) { if (cMsg) cMsg.textContent = txt; };
        medir('content_cta_click', { etiqueta: 'calculadora-compartir' });
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(u).then(function () { listo('Enlace copiado. Al abrirlo, la calculadora parte con estos valores.'); },
            function () { history.replaceState(null, '', u); listo('Copia el enlace desde la barra de direcciones.'); });
        } else { history.replaceState(null, '', u); listo('Copia el enlace desde la barra de direcciones.'); }
      });
    }
    ufListeners.push(calcular);
    calcular();
  }

  /* ----------------------------------------------------- punto de pedido */
  // Misma fórmula que src/componentes/herramientas.mjs (puntoPedido).
  var ppForm = $('#pp-form');
  if (ppForm) {
    var Z = { '90': 1.282, '95': 1.645, '97.5': 1.96, '99': 2.326 };
    var ppNum = function (id) { var el = $('#' + id); var t = (el.value || '').trim().replace(',', '.'); return t === '' ? null : Number(t); };
    var unid = function (n) { return CLP.format(n) + '<small>unidades</small>'; };
    var ppEmpezo = false, ppAnuncio = null, ppUltimo = null;
    var ppCalcular = function () {
      var d = ppNum('pp-demanda'), sd = ppNum('pp-desv-demanda') || 0, L = ppNum('pp-plazo'), sL = ppNum('pp-desv-plazo') || 0;
      var nivel = $('#pp-servicio').value, stock = ppNum('pp-stock');
      var err = $('#pp-error'), malo = null;
      var campos = { 'pp-demanda': d, 'pp-desv-demanda': sd, 'pp-plazo': L, 'pp-desv-plazo': sL, 'pp-stock': stock };
      Object.keys(campos).forEach(function (id) {
        var v = campos[id], invalido = v !== null && (!isFinite(v) || v < 0 || v > 1e7);
        $('#' + id).setAttribute('aria-invalid', String(invalido));
        if (invalido && !malo) malo = 'Revisa los valores: deben ser números positivos.';
      });
      if (!malo && (d === null || L === null)) malo = 'Completa la demanda diaria y el plazo del proveedor.';
      if (!malo && (d === 0 || L === 0)) malo = 'La demanda y el plazo deben ser mayores que cero.';
      err.hidden = !malo; err.textContent = malo || '';
      if (malo) { ppUltimo = null; return null; }
      var z = Z[nivel] || Z['95'];
      var durante = Math.ceil(d * L);
      var seg = Math.ceil(z * Math.sqrt(L * sd * sd + d * d * sL * sL));
      var punto = Math.ceil(d * L + seg);
      $('#pp-punto').innerHTML = unid(punto);
      $('#pp-seguridad').innerHTML = unid(seg);
      var txt = 'Cuando el stock baje de ' + CLP.format(punto) + ' unidades, haz el pedido. Esa cifra cubre la demanda esperada durante el plazo (' + CLP.format(durante) + ' unidades) más ' + CLP.format(seg) + ' de seguridad, con un nivel de servicio de ' + nivel.replace('.', ',') + '%.';
      if (stock !== null) {
        if (stock <= punto) txt += ' Tu stock actual (' + CLP.format(stock) + ') ya está en el punto de pedido o bajo él: corresponde pedir ahora.';
        else {
          var dias = (stock - punto) / d;
          txt += ' Con tu stock actual (' + CLP.format(stock) + '), a la demanda promedio llegarías al punto de pedido en ' + (dias < 1 ? 'menos de un día' : 'unos ' + CLP.format(Math.floor(dias)) + (Math.floor(dias) === 1 ? ' día' : ' días')) + '.';
        }
      }
      $('#pp-lectura').textContent = txt;
      ppUltimo = { punto: punto, seguridad: seg, texto: txt, nivel: nivel };
      return ppUltimo;
    };
    ppForm.addEventListener('input', function () {
      if (!ppEmpezo) { ppEmpezo = true; medir('calculator_start', { herramienta: 'punto-pedido' }, true); }
      ppCalcular();
      clearTimeout(ppAnuncio);
      ppAnuncio = setTimeout(function () { if (ppUltimo) $('#pp-anuncio').textContent = ppUltimo.texto; }, 700);
    });
    ppForm.addEventListener('change', function () {
      var r = ppCalcular();
      if (r && ppEmpezo) medir('calculator_complete', { herramienta: 'punto-pedido', nivel: r.nivel }, true);
    });
    ppForm.addEventListener('submit', function (ev) { ev.preventDefault(); ppCalcular(); });
    ppCalcular();
  }

  /* ---------------------------------------------------------- formulario */
  var form = $('#form-contacto');
  if (form) {
    var msg = $('#form-msg'), btn = $('#form-enviar');
    var btnTxt = btn ? $('span', btn) : null;
    if (form.elements.t) form.elements.t.value = String(Date.now());
    var iniciar = function () { medir('form_start', {}, true); };
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
    ['nombre', 'contacto'].forEach(function (n) {
      form.elements[n].addEventListener('blur', function () {
        if (form.elements[n].getAttribute('aria-invalid') === 'true') validar();
      });
    });
    var campo = function (n) { return (form.elements[n] && form.elements[n].value || '').trim(); };
    var validar = function () {
      var malos = [];
      if (marcar('nombre', campo('nombre').length < 2)) malos.push(form.elements.nombre);
      var c = campo('contacto');
      if (marcar('contacto', !(esCorreo(c) || esFono(c)))) malos.push(form.elements.contacto);
      return malos;
    };
    var ocupado = function (si) {
      btn.disabled = si;
      form.setAttribute('aria-busy', String(si));
      if (btnTxt) btnTxt.textContent = si ? 'Enviando…' : 'Enviar';
    };

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
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
