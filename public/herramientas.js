/* ==========================================================================
   ANVAR TECH · herramientas: autodiagnóstico, calculadora de ROI y punto de
   pedido. Se carga solo en las páginas que tienen alguna (el build agrega el
   <script> donde corresponde), después de calculo.js y app.js.
   Las fórmulas NO están aquí: vienen de calculo.js, que el build genera desde
   src/calculo.mjs (la misma fuente que usan el HTML inicial y las pruebas).
   ========================================================================== */
(function () {
  'use strict';
  var A = window.ANVAR, K = window.ANVAR_CALCULO;
  if (!A) return;
  var $ = A.$, $$ = A.$$, CFG = A.cfg, esc = A.esc, medir = A.medir, conRef = A.conRef, enlaceWsp = A.enlaceWsp;

  /** Evento de "vista" una vez, cuando la herramienta entra en pantalla. */
  function alVerse(el, fn) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (en) {
      if (en.some(function (x) { return x.isIntersecting; })) { fn(); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(el);
  }

  /* ----------------------------------------------------- autodiagnóstico */
  var D = CFG.diagnostico;
  var dCuerpo = $('#diag-cuerpo');
  if (D && dCuerpo) {
    alVerse($('#diagnostico'), function () { medir('diagnostic_view', {}, true); });
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
          '<div><dt>Nivel de preparación</dt> <dd>' + esc(etapa(n)) + ' <small>' + n + ' / 100</small></dd></div> ' +
          '<div><dt>Potencial de automatización</dt> <dd>' + e.potencial + '% <small>tiempo repetitivo y fragilidad</small></dd></div> ' +
          '<div><dt>Primer paso sugerido</dt> <dd><a href="' + esc(rec.url) + '" data-track="service_click" data-track-label="diagnostico-' + recId + '">' + esc(rec.nombre) + '</a> <small>' + esc(rec.precio) + '</small></dd></div> ' +
          '<div><dt>Tipo de solución</dt> <dd>' + esc(c.solucion) + '</dd></div>' +
        '</dl>' +
        '<p class="lectura" id="diag-lectura">' + esc(lectura(e, recId)) + '</p>' +
        htmlOportunidades(c) +
        '<div class="resultado-acciones">' +
          '<a class="btn btn--primario" href="' + esc(enlaceWsp(mensajeResultado(n, e, c, rec))) + '" target="_blank" rel="noopener" data-wsp="diagnostico-resultado" data-track-label="resultado">Conversar este resultado por WhatsApp</a>' +
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
  var C = CFG.calc;
  var cPers = $('#c-personas');
  if (cPers && C && K) {
    alVerse($('#calculadora'), function () { medir('calculator_view', { herramienta: 'roi' }, true); });
    var cHoras = $('#c-horas'), cCosto = $('#c-costo'), cAuto = $('#c-auto');
    var cMonto = $('#c-monto'), cMensual = $('#c-mensual'), cReset = $('#c-reiniciar');
    var radios = $$('input[name="c-inv"]');
    var deslizadores = [cPers, cHoras, cCosto, cAuto];
    var empezo = false, anuncio = null;
    var P = K.pesos, M = K.miles;

    // El piloto (precio en UF) se pasa a pesos solo con la UF de HOY. Mientras no
    // llega, o si no está disponible, el piloto queda sin monto: el ahorro se
    // calcula igual y payback/ROI piden "Otro monto". Nunca un valor de respaldo.
    var uf = A.ufDia();
    var leerMonto = function (el) { return K.leerPesos(el.value); };
    var escribirMonto = function (el) { var n = leerMonto(el); el.value = n ? M(n) : ''; };
    var inversionElegida = function () { var r = radios.filter(function (x) { return x.checked; })[0]; return r ? r.value : 'piloto'; };
    var montoInversion = function (tipo) {
      if (tipo === 'otro') return leerMonto(cMonto);
      var o = C.opciones[tipo];
      return o.moneda === 'UF' ? K.ufAPesos(o.valor, uf ? uf.valor : null) : o.valor;
    };
    var pintarPiloto = function () {
      var el = $('#c-piloto-d'), o = C.opciones.piloto;
      if (!el || o.moneda !== 'UF') return;
      el.textContent = o.etiqueta + (uf ? ' · ≈ ' + P(K.ufAPesos(o.valor, uf.valor)) + ' (UF del ' + A.fechaCorta(uf.fecha) + ')' : '');
    };
    // Sin monto para el piloto: qué decir según si la UF todavía viene o no está.
    var lecturaSinMonto = function () {
      return A.ufEstado() === 'pendiente'
        ? 'Pasando el piloto a pesos con la UF de hoy…'
        : 'La equivalencia en pesos del piloto no está disponible en este momento. Para ver payback y ROI, elige «Otro monto» y escribe el valor de tu propuesta, o compara con la Automatización Express.';
    };

    var calcular = function () {
      var tipo = inversionElegida();
      var r = K.roi({
        personas: +cPers.value, horasSemana: +cHoras.value, costoHora: +cCosto.value, pctAutomatizable: +cAuto.value,
        inversion: montoInversion(tipo), costoMensual: leerMonto(cMensual), semanas: C.semanas
      });
      cPers.setAttribute('aria-valuetext', cPers.value + (+cPers.value === 1 ? ' persona' : ' personas'));
      cHoras.setAttribute('aria-valuetext', cHoras.value + (+cHoras.value === 1 ? ' hora' : ' horas') + ' a la semana');
      cCosto.setAttribute('aria-valuetext', P(+cCosto.value) + ' por hora');
      cAuto.setAttribute('aria-valuetext', cAuto.value + ' por ciento');
      $('#c-personas-v').textContent = cPers.value;
      $('#c-horas-v').textContent = cHoras.value + ' h';
      $('#c-costo-v').textContent = P(+cCosto.value);
      $('#c-auto-v').textContent = cAuto.value + '%';
      var t = K.resumenRoi(r, C.mesesMax);
      $('#c-valor').textContent = t.ahorroBruto;
      $('#c-hoy').textContent = t.horasAnuales;
      $('#c-despues').textContent = t.horasDespues;
      $('#c-barra-despues').style.width = (r.horasAnuales ? (r.horasAnuales - r.horasRecuperadas) / r.horasAnuales * 100 : 0) + '%';
      $('#c-horas-ano').textContent = t.horasAnuales;
      $('#c-costo-ano').textContent = t.costoAnual;
      $('#c-horas-lib').textContent = t.horasRecuperadas;
      $('#c-inv').textContent = t.inversion;
      $('#c-recurrente').textContent = t.recurrente;
      $('#c-neto1').textContent = t.neto1;
      $('#c-payback').textContent = t.payback;
      $('#c-roi1').textContent = t.roi1;
      $('#c-roi3').textContent = t.roi3;
      $('#c-lectura').textContent = r.estado === 'sin-monto' && tipo === 'piloto' ? lecturaSinMonto() : t.lectura;
      return r;
    };
    // Lectores de pantalla: un resumen al soltar el control, no en cada paso del arrastre.
    var anunciar = function () {
      clearTimeout(anuncio);
      anuncio = setTimeout(function () {
        var r = calcular();
        $('#c-anuncio').textContent = 'Ahorro bruto anual estimado: ' + P(r.ahorroBruto) + '. ' + (r.estado === 'sin-monto' ? $('#c-lectura').textContent : 'Payback estimado: ' + K.textoPayback(r, C.mesesMax) + '.');
      }, 400);
    };
    var marcarTuya = function (tuya) {
      var est = $('#c-estado');
      est.textContent = tuya ? 'Tu estimación' : 'Ejemplo ilustrativo';
      est.classList.toggle('insignia--tuya', tuya);
    };
    var empezar = function () { if (!empezo) { empezo = true; marcarTuya(true); medir('calculator_start', { herramienta: 'roi' }, true); } };
    var completar = function () {
      if (!empezo) return;
      var r = calcular();
      medir('calculator_complete', { herramienta: 'roi', inversion: inversionElegida(), estado: r.estado, tramo: r.ahorroBruto < 2000000 ? 'menos-2M' : r.ahorroBruto < 10000000 ? '2M-10M' : 'mas-10M' }, true);
    };
    deslizadores.concat(radios).forEach(function (el) {
      el.addEventListener('input', function () { empezar(); calcular(); });
      el.addEventListener('change', function () { anunciar(); completar(); });
    });
    [cMonto, cMensual].forEach(function (el) {
      el.addEventListener('input', function () {
        if (el === cMonto) { var otro = radios.filter(function (x) { return x.value === 'otro'; })[0]; if (otro) otro.checked = true; }
        empezar(); calcular();
      });
      el.addEventListener('change', function () { escribirMonto(el); anunciar(); completar(); });
      el.addEventListener('blur', function () { escribirMonto(el); });
    });
    if (cReset) cReset.addEventListener('click', function () {
      deslizadores.forEach(function (el) { el.value = el.getAttribute('data-defecto'); });
      radios.forEach(function (r) { r.checked = r.getAttribute('data-defecto') === '1'; });
      [cMonto, cMensual].forEach(function (el) { el.value = el.getAttribute('data-defecto') || ''; });
      empezo = false; marcarTuya(false); calcular(); anunciar();
    });

    // Enlace para compartir: solo los valores, en la URL. Al abrirlo, la
    // calculadora parte con ellos (acotados a los rangos permitidos).
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
      var inv = q.get('inv');
      if (inv && radios.some(function (r) { return r.value === inv; })) { radios.forEach(function (r) { r.checked = r.value === inv; }); traidos = true; }
      if (q.get('monto')) { cMonto.value = String(K.leerPesos(q.get('monto'))); escribirMonto(cMonto); traidos = true; }
      if (q.get('mensual')) { cMensual.value = String(K.leerPesos(q.get('mensual'), 1e11)); escribirMonto(cMensual); traidos = true; }
      if (traidos) { empezo = true; marcarTuya(true); }
      var cMsg = $('#c-compartir-msg');
      cCompartir.addEventListener('click', function () {
        var partes = Object.keys(PARAMS).map(function (k) { return k + '=' + encodeURIComponent(PARAMS[k].value); });
        partes.push('inv=' + inversionElegida());
        if (inversionElegida() === 'otro' && leerMonto(cMonto)) partes.push('monto=' + leerMonto(cMonto));
        if (leerMonto(cMensual)) partes.push('mensual=' + leerMonto(cMensual));
        var u = location.origin + location.pathname + '?' + partes.join('&') + '#herramienta';
        var listo = function (txt) { if (cMsg) cMsg.textContent = txt; };
        medir('content_cta_click', { etiqueta: 'calculadora-compartir' });
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(u).then(function () { listo('Enlace copiado. Al abrirlo, la calculadora parte con estos valores.'); },
            function () { history.replaceState(null, '', u); listo('Copia el enlace desde la barra de direcciones.'); });
        } else { history.replaceState(null, '', u); listo('Copia el enlace desde la barra de direcciones.'); }
      });
    }
    A.alCambiarUf(function (d) { uf = d; pintarPiloto(); calcular(); });
    pintarPiloto();
    calcular();
  }

  /* ----------------------------------------------------- punto de pedido */
  var ppForm = $('#pp-form');
  if (ppForm && K) {
    alVerse($('#punto-pedido'), function () { medir('calculator_view', { herramienta: 'punto-pedido' }, true); });
    var ppNum = function (id) { var el = $('#' + id); var t = (el.value || '').trim().replace(',', '.'); return t === '' ? null : Number(t); };
    var unid = function (n) { return K.miles(n) + ' <small>unidades</small>'; };
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
      var r = K.puntoPedido({ demanda: d, desvDemanda: sd, plazo: L, desvPlazo: sL, servicio: Number(nivel) });
      $('#pp-punto').innerHTML = unid(r.punto);
      $('#pp-seguridad').innerHTML = unid(r.seguridad);
      var txt = 'Cuando el stock baje de ' + K.miles(r.punto) + ' unidades, haz el pedido. Esa cifra cubre la demanda esperada durante el plazo (' + K.miles(r.durantePlazo) + ' unidades) más ' + K.miles(r.seguridad) + ' de seguridad, con un nivel de servicio de ' + nivel.replace('.', ',') + '%.';
      if (stock !== null) {
        if (stock <= r.punto) txt += ' Tu stock actual (' + K.miles(stock) + ') ya está en el punto de pedido o bajo él: corresponde pedir ahora.';
        else {
          var dias = (stock - r.punto) / d;
          txt += ' Con tu stock actual (' + K.miles(stock) + '), a la demanda promedio llegarías al punto de pedido en ' + (dias < 1 ? 'menos de un día' : 'unos ' + K.miles(Math.floor(dias)) + (Math.floor(dias) === 1 ? ' día' : ' días')) + '.';
        }
      }
      $('#pp-lectura').textContent = txt;
      ppUltimo = { punto: r.punto, seguridad: r.seguridad, texto: txt, nivel: nivel };
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
})();
