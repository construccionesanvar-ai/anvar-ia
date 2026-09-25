/* ==========================================================================
   ANVAR TECH · IA & Automatización — interacción del sitio
   Un solo archivo para todas las páginas; cada módulo revisa si su HTML
   existe antes de actuar. Sin dependencias.

   Configuración: viene de <script type="application/json" id="config">,
   que genera el build desde src/ (precios, mensajes, WhatsApp, agenda).

   Embudo medido (Vercel Web Analytics, eventos propios):
     hero_cta_click · case_study_click · cases_view · service_click
     roi_calculator_start · roi_calculator_complete
     diagnostic_start · diagnostic_complete
     whatsapp_click · calendar_click · lead_submit
   No se envían datos personales: solo nombres de evento y etiquetas.
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

  /* ------------------------------------------------------------ medición */
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  function medir(nombre, datos) {
    try {
      var d = { pagina: pagina };
      for (var k in datos) if (Object.prototype.hasOwnProperty.call(datos, k)) d[k] = datos[k];
      window.va('event', { name: nombre, data: d });
    } catch (e) { /* la medición nunca rompe la página */ }
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-track],[data-wsp]') : null;
    if (!t) return;
    var etiqueta = t.getAttribute('data-track-label') || 'sin-etiqueta';
    if (t.hasAttribute('data-track')) medir(t.getAttribute('data-track'), { etiqueta: etiqueta });
    if (t.hasAttribute('data-wsp')) medir('whatsapp_click', { contexto: t.getAttribute('data-wsp'), etiqueta: etiqueta });
  });

  function enlaceWsp(texto) {
    return 'https://wa.me/' + (CFG.wsp || '') + '?text=' + encodeURIComponent(texto);
  }

  /* ---------------------------------------------------------- menú móvil */
  var menuBtn = $('.menu-btn'), menu = $('#menu');
  if (menuBtn && menu) {
    var etiquetaBtn = $('.sr', menuBtn);
    var cerrar = function () {
      menu.classList.remove('abierto');
      menuBtn.setAttribute('aria-expanded', 'false');
      if (etiquetaBtn) etiquetaBtn.textContent = 'Abrir menú';
    };
    menuBtn.addEventListener('click', function () {
      var abierto = menu.classList.toggle('abierto');
      menuBtn.setAttribute('aria-expanded', String(abierto));
      if (etiquetaBtn) etiquetaBtn.textContent = abierto ? 'Cerrar menú' : 'Abrir menú';
      if (abierto) { var primero = $('a', menu); if (primero) primero.focus(); }
    });
    menu.addEventListener('click', function (ev) { if (ev.target.closest('a')) cerrar(); });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && menu.classList.contains('abierto')) { cerrar(); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1121px)').addEventListener('change', function (m) { if (m.matches) cerrar(); });
  }

  /* ---------------------------------------------------- vista de casos */
  var casos = $('#casos') || $('.detalle');
  if (casos && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (en.some(function (x) { return x.isIntersecting; })) { medir('cases_view', {}); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(casos);
  }

  /* --------------------------------------------------------- diagnóstico */
  var D = CFG.diagnostico;
  var dCuerpo = $('#diag-cuerpo');
  if (D && dCuerpo) {
    var TOTAL = D.preguntas.length + 1;
    var cat = null, resp = D.preguntas.map(function () { return null; });
    var paso = 0, iniciado = false;
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
      if (e.potencial >= 60 && e.base >= 50 && e.traccion >= 50) return 'piloto';
      if (e.potencial >= 60) return 'diagnostico';
      if (e.potencial >= 40) return 'express';
      return 'capacitacion';
    };

    var lectura = function (e, recId) {
      if (recId === 'intelligence') return 'Tus datos están razonablemente ordenados: el siguiente paso es leerlos a tiempo. Un tablero con alertas de stock, márgenes y anomalías suele dar resultados en semanas, sin un proyecto grande.';
      if (recId === 'diagnostico' && e.base < 50) return 'Hay bastante que ganar, pero la información está repartida o no está medida. Automatizar encima de ese desorden solo lo hace más rápido: conviene medir y ordenar primero. Es exactamente lo que resuelve una semana de diagnóstico.';
      if (recId === 'diagnostico') return 'La oportunidad es clara, pero hace falta un caso con números para decidir o para convencer internamente. Un diagnóstico deja por escrito cuánto cuesta hoy el proceso y cuánto se ahorraría.';
      if (recId === 'piloto') return 'Estás en el mejor escenario: hay mucho que ganar, la información está ordenada y pueden decidir. No hace falta estudiar más: conviene un piloto sobre el proceso más costoso, medido antes y después.';
      if (recId === 'express') return 'Hay tiempo que recuperar, pero no lo suficiente para un proyecto grande. Lo razonable es resolver un proceso puntual con una Automatización Express y ver el resultado antes de ir por más.';
      return 'No vemos todavía un proceso caro que justifique un proyecto, y es bueno saberlo. Lo que más rinde en tu caso es que el equipo use mejor las herramientas que ya tiene.';
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
      if (!iniciado) { iniciado = true; medir('diagnostic_start', {}); }
      if (paso === 0) cat = i; else resp[paso - 1] = i;
      if (paso < TOTAL - 1) { paso++; pintarPregunta(); var b = $('.opcion', dCuerpo); if (b) b.focus({ preventScroll: true }); }
      else resultado();
    };

    var resultado = function () {
      var e = ejes(), n = indice(e), c = D.categorias[cat], recId = recomendar(e, c), rec = D.servicios[recId];
      paso = TOTAL; pintarIndicador();
      dPaso.textContent = 'Tu resultado';
      medir('diagnostic_complete', { indice: n, recomendacion: recId, categoria: c.id });

      var msg = 'Hola ANVAR, hice el diagnóstico y obtuve ' + n + '/100 (' + etapa(n).toLowerCase() + ').\n\n' +
        'Potencial de automatización: ' + e.potencial + '%.\n' +
        'Mi principal problema está relacionado con ' + c.frase + '.\n' +
        'Primer paso sugerido: ' + rec.nombre + '.\n\nQuiero conversar este resultado.';
      var agenda = CFG.agenda
        ? '<a class="btn btn--secundario" href="' + esc(CFG.agenda) + '" target="_blank" rel="noopener" data-track="calendar_click" data-track-label="diagnostico">Agendar una evaluación</a>'
        : '<a class="btn btn--secundario" href="#evaluar" data-track="hero_cta_click" data-track-label="diagnostico">Agendar una evaluación</a>';

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
        '<div class="resultado-acciones">' +
          '<a class="btn btn--primario" href="' + esc(enlaceWsp(msg)) + '" target="_blank" rel="noopener" data-wsp="diagnostico" data-track-label="resultado">Conversar este resultado por WhatsApp</a>' +
          agenda +
        '</div></div>';
      dVolver.hidden = false;
      var r = $('#diag-resultado'); if (r) r.focus({ preventScroll: false });
      lecturaIA(e, n, c);
    };

    // Lectura escrita por IA para este caso. La local ya está en pantalla:
    // si el servicio no responde, no se nota nada.
    var lecturaIA = function (e, n, c) {
      var destino = $('#diag-lectura');
      if (!destino || !window.fetch) return;
      fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indice: n, potencial: e.potencial, base: e.base, traccion: e.traccion, publico: 'empresas', categoria: c.solucion })
      }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (j) {
          if (!j || !j.texto || !$('#diag-lectura')) return;
          destino.textContent = j.texto.split(/\n{2,}/).join('\n\n');
          destino.insertAdjacentHTML('afterend', '<p class="lectura-nota">Lectura escrita para tu caso.</p>');
        }).catch(function () {});
    };

    dVolver.addEventListener('click', function () {
      if (paso > TOTAL - 1) paso = TOTAL - 1; else if (paso > 0) paso--;
      pintarPregunta();
    });
    dReiniciar.addEventListener('click', function () {
      cat = null; resp = resp.map(function () { return null; }); paso = 0;
      pintarPregunta();
    });
    // El HTML ya trae la primera pregunta; se reemplaza por la versión interactiva.
    pintarPregunta();
  }

  /* --------------------------------------------------------- calculadora */
  var cPers = $('#c-personas');
  if (cPers && CFG.precios) {
    var cHoras = $('#c-horas'), cCosto = $('#c-costo'), cAuto = $('#c-auto');
    var empezo = false, completo = false;
    var calcular = function () {
      var personas = +cPers.value, horas = +cHoras.value, costo = +cCosto.value, auto = +cAuto.value;
      var horasAno = personas * horas * (CFG.semanas || 44);
      var recuperadas = Math.round(horasAno * auto / 100);
      var restantes = horasAno - recuperadas;
      var valor = recuperadas * costo;
      var ref = valor < 2000000 ? { nombre: 'una Automatización Express', precio: CFG.precios.express } : { nombre: 'un piloto', precio: CFG.precios.piloto };
      var meses = valor > 0 ? ref.precio / (valor / 12) : Infinity;
      var retorno;
      if (!isFinite(meses) || meses > 36) retorno = 'Con estos números no se justifica automatizar por ahorro de tiempo. Conviene revisar si hay errores o reprocesos que cuesten más.';
      else retorno = 'Con este ahorro, ' + ref.nombre + ' (' + pesos(ref.precio) + ' + IVA) se pagaría en ' + (meses < 1 ? 'menos de un mes' : meses < 10 ? meses.toFixed(1).replace('.', ',') + ' meses' : Math.round(meses) + ' meses') + '.';

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
      return valor;
    };
    [cPers, cHoras, cCosto, cAuto].forEach(function (el) {
      el.addEventListener('input', function () {
        calcular();
        if (!empezo) {
          empezo = true;
          var est = $('#c-estado');
          est.textContent = 'Tu estimación';
          est.classList.add('insignia--tuya');
          medir('roi_calculator_start', {});
        }
      });
      el.addEventListener('change', function () {
        if (!empezo || completo) return;
        completo = true;
        var v = calcular();
        medir('roi_calculator_complete', { tramo: v < 2000000 ? 'menos-2M' : v < 10000000 ? '2M-10M' : 'mas-10M' });
      });
    });
    calcular();
  }

  /* ---------------------------------------------------------- formulario */
  var form = $('#form-contacto');
  if (form) {
    var msg = $('#form-msg'), btn = $('#form-enviar');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var campo = function (n) { return (form.elements[n] && form.elements[n].value || '').trim(); };
      var d = { nombre: campo('nombre'), empresa: campo('empresa'), contacto: campo('contacto'), tipo: campo('tipo'), mensaje: campo('mensaje'), web: campo('web'), origen: pagina };
      var faltan = [];
      ['nombre', 'contacto'].forEach(function (n) {
        var el = form.elements[n];
        var vacio = !d[n];
        el.setAttribute('aria-invalid', String(vacio));
        if (vacio) faltan.push(el);
      });
      if (faltan.length) {
        msg.className = 'form-msg err';
        msg.textContent = 'Falta tu nombre y una forma de contactarte (WhatsApp o correo).';
        faltan[0].focus();
        return;
      }
      msg.className = 'form-msg'; msg.textContent = 'Enviando…';
      btn.disabled = true;
      var alternativa = function () {
        var txt = 'Hola, les escribo desde su sitio.\n\nNombre: ' + d.nombre + (d.empresa ? '\nEmpresa: ' + d.empresa : '') +
          '\nNecesito: ' + form.elements.tipo.selectedOptions[0].text + (d.mensaje ? '\n\n' + d.mensaje : '');
        msg.className = 'form-msg err';
        msg.innerHTML = 'No pudimos enviar el formulario. <a href="' + esc(enlaceWsp(txt)) + '" target="_blank" rel="noopener" data-wsp="formulario" data-track-label="formulario-alternativa">Envíalo por WhatsApp</a> con el mensaje ya escrito.';
        btn.disabled = false;
      };
      fetch('/api/contacto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function () {
          medir('lead_submit', { tipo: d.tipo });
          msg.className = 'form-msg ok';
          msg.textContent = 'Listo, nos llegó. Te respondemos antes de 24 horas hábiles.';
          form.reset();
          btn.disabled = false;
        })
        .catch(alternativa);
    });
  }

  /* ------------------------------------------------------------- detalles */
  $$('[data-anio]').forEach(function (e) { e.textContent = String(new Date().getFullYear()); });
})();
