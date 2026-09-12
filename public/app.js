/* ==========================================================================
   ANVAR IA — interacción
   Sin dependencias. Todo degrada a algo útil si algo falla.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var WSP = '56926333760';
  var CLP = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });
  var UF = 40000;              // valor de referencia de la UF
  var SEMANAS = 44;            // semanas hábiles al año
  var PILOTO = 28 * UF;        // piloto base: UF 28

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }
    catch (e) { return null; }
  }

  /* ---------------------------------------------------------------- público */
  var seg = store('anvar-seg') || 'personas';
  function setSeg(v) {
    seg = v;
    root.setAttribute('data-seg', v);
    $$('[data-set-seg]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-seg') === v));
    });
    var lbl = $('#cPersLbl');
    if (lbl) lbl.textContent = v === 'empresas'
      ? 'Personas que hacen esta tarea'
      : 'Personas involucradas (cuéntate tú)';
    store('anvar-seg', v);
    calcular();
  }
  $$('[data-set-seg]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-set-seg');
      setSeg(v);
      medir('segmento', { elegido: v });
    });
  });

  /* -------------------------------------------------------------- medición */
  // Vercel Web Analytics. Si no está habilitado, no hace nada y no rompe nada.
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  function medir(nombre, datos) {
    try { window.va('event', { name: nombre, data: datos || {} }); } catch (e) { /* da igual */ }
  }

  /* ------------------------------------------------------------- whatsapp */
  // Cada puerta de entrada manda una primera línea distinta: así Andrés sabe
  // de dónde viene el mensaje sin depender de ninguna herramienta de analítica.
  var ENTRADAS = {
    portada:  'Vengo de la portada',
    contacto: 'Vengo de la sección de contacto',
    flotante: 'Vengo del botón flotante',
    formulario: 'Vengo del formulario'
  };
  function wspHref(origen) {
    var de = ENTRADAS[origen] ? ENTRADAS[origen] + ' de anvar ia.' : 'Vengo de la página de ANVAR IA.';
    var t = 'Hola Andrés. ' + de + '\n\n' + (seg === 'empresas'
      ? 'Quiero ver un diagnóstico de IA para mi empresa.'
      : 'Quiero usar IA en mi trabajo y no sé por dónde partir.');
    return 'https://wa.me/' + WSP + '?text=' + encodeURIComponent(t);
  }
  $$('[data-wsp]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var origen = a.getAttribute('data-wsp') || 'otro';
      medir('whatsapp', { origen: origen, publico: seg });
      window.open(wspHref(origen), '_blank', 'noopener');
    });
  });

  /* -------------------------------------------------------------- portada */
  var PROCESOS = [
    {
      kicker: 'Proceso · prevención de pérdidas',
      proc: 'Armar el procedimiento completo de un robo en tienda',
      before: '45 min', after: '4 min', pct: 91
    },
    {
      kicker: 'Proceso · bodega y caja',
      proc: 'Digitar los productos de una boleta larga, uno por uno',
      before: '12 min', after: '20 seg', pct: 97
    },
    {
      kicker: 'Proceso · ingeniería',
      proc: 'Rehacer un plano de planta cuando cambia el criterio',
      before: '2 jornadas', after: '3 horas', pct: 81
    },
    {
      kicker: 'Proceso · comercial',
      proc: 'Cotizar, coordinar y cobrar un servicio por WhatsApp',
      before: '2 días', after: 'automático', pct: 95
    }
  ];
  var iIdx = 0, iTimer = null;
  var iKicker = $('#iKicker'), iProc = $('#iProc'), iBefore = $('#iBefore'),
      iAfter = $('#iAfter'), iTrack = $('#iTrack'), iDelta = $('#iDelta'), iDots = $('#iDots');

  function pintarProceso(n) {
    var p = PROCESOS[n];
    if (!p || !iProc) return;
    iIdx = n;
    iKicker.textContent = p.kicker;
    iProc.textContent = p.proc;
    iBefore.textContent = p.before;
    iAfter.textContent = p.after;
    iDelta.innerHTML = '&minus;' + p.pct + '% de tiempo';
    iTrack.style.width = '0%';
    setTimeout(function () { iTrack.style.width = p.pct + '%'; }, 60);
    $$('button', iDots).forEach(function (d, k) {
      d.setAttribute('aria-current', String(k === n));
    });
  }
  if (iDots) {
    PROCESOS.forEach(function (p, k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Ver proceso ' + (k + 1));
      b.addEventListener('click', function () { pintarProceso(k); reiniciarCiclo(); });
      iDots.appendChild(b);
    });
    pintarProceso(0);
  }
  function reiniciarCiclo() {
    clearInterval(iTimer);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    iTimer = setInterval(function () {
      pintarProceso((iIdx + 1) % PROCESOS.length);
    }, 5200);
  }
  reiniciarCiclo();

  /* ----------------------------------------------------------- diagnóstico */
  var PREGUNTAS = [
    {
      t: '¿Cuánto de tu semana se va en tareas que se repiten casi igual?',
      eje: 'potencial',
      o: ['Casi nada, cada día es distinto', 'Entre 1 y 3 horas', 'Entre 4 y 8 horas', 'Más de 8 horas']
    },
    {
      t: 'Si mañana faltara la persona que hace ese trabajo, ¿qué pasa?',
      eje: 'potencial', invertir: true,
      o: ['Está documentado, alguien sigue sin problema', 'Alguien lo toma, con esfuerzo', 'Se atrasa todo varios días', 'Se cae, nadie más sabe hacerlo']
    },
    {
      t: '¿Dónde vive hoy la información con la que trabajas?',
      eje: 'base',
      o: ['En papel, o en la cabeza de alguien', 'Archivos sueltos en el computador', 'Carpetas ordenadas o Drive compartido', 'Un sistema o base de datos']
    },
    {
      t: '¿Sabes cuánto cuesta hoy ese proceso?',
      eje: 'base',
      o: ['Ni idea, nunca lo medimos', 'Una estimación gruesa', 'Sé cuántas horas toma', 'Sé las horas y los pesos']
    },
    {
      t: '¿Ya usan IA para algo del trabajo?',
      eje: 'traccion',
      o: ['Nunca la hemos usado', 'Preguntas sueltas, de vez en cuando', 'La usamos casi todos los días', 'Ya hay algo automatizado andando']
    },
    {
      t: '¿Quién decide invertir en mejorar esto?',
      eje: 'traccion',
      o: ['Nadie lo ha planteado todavía', 'Hay que convencer a alguien arriba', 'Yo puedo decidir con un buen caso', 'Ya hay presupuesto asignado']
    }
  ];

  var resp = new Array(PREGUNTAS.length).fill(null);
  var qPaso = 0, enResultado = false;
  var qStep = $('#qStep'), qProg = $('#qProg'), qText = $('#qText'), qOpts = $('#qOpts'),
      qBody = $('#qBody'), qBack = $('#qBack'), qReset = $('#qReset');

  if (qProg) PREGUNTAS.forEach(function () { qProg.appendChild(document.createElement('i')); });

  function ejes() {
    var e = { potencial: [], base: [], traccion: [] };
    PREGUNTAS.forEach(function (p, i) {
      if (resp[i] === null) return;
      e[p.eje].push(p.invertir ? (3 - resp[i]) : resp[i]);
    });
    function pct(a) { return a.length ? Math.round(a.reduce(function (x, y) { return x + y; }, 0) / (a.length * 3) * 100) : 0; }
    return { potencial: pct(e.potencial), base: pct(e.base), traccion: pct(e.traccion) };
  }

  function etapa(n) {
    if (n < 30) return 'primer contacto';
    if (n < 55) return 'explorando';
    if (n < 78) return 'en adopción';
    return 'listo para escalar';
  }

  function lectura(ej, idx) {
    var p = ej.potencial, b = ej.base, t = ej.traccion;
    var esEmp = seg === 'empresas';
    if (p >= 60 && b < 50) {
      return '<b>Tienes mucho que ganar, pero tu información está desordenada.</b> Automatizar encima de un desorden solo lo hace más rápido. El primer paso es ordenar y medir el proceso: una semana de trabajo que después se paga sola. ' +
        (esEmp ? 'Te corresponde el Diagnóstico IA.' : 'Te corresponde la Sesión Despegue, para poner orden primero.');
    }
    if (p >= 60 && b >= 50 && t >= 50) {
      return '<b>Estás en el mejor escenario posible: hay mucho que ganar, el material está ordenado y puedes decidir.</b> Acá no hay que estudiar más, hay que construir. ' +
        (esEmp ? 'Iría directo a un piloto en producción, midiendo antes y después.' : 'Iría directo al Plan Piloto Personal.');
    }
    if (p >= 60 && t < 50) {
      return '<b>La oportunidad está clara, lo que falta es el permiso o el impulso para partir.</b> Lo que sirve acá es un caso escrito con horas y pesos: es mucho más fácil aprobar un número que una idea. ' +
        (esEmp ? 'El Diagnóstico IA te deja justamente ese informe.' : 'Empieza chico, con una sesión, y muestra el resultado.');
    }
    if (p < 40 && idx >= 55) {
      return '<b>Tu proceso ya está bastante sano y no veo un ahorro grande escondido.</b> Te sirve más subir el techo que tapar goteras: usar IA para hacer cosas que hoy simplemente no haces. ' +
        (esEmp ? 'Conversemos una capacitación al equipo antes que un proyecto.' : 'La Sesión Despegue te va a rendir más que un programa largo.');
    }
    if (p < 40) {
      return '<b>No veo todavía un problema caro que justifique un proyecto.</b> Eso es una buena noticia y te lo digo igual. Partiría por una sesión corta, sin comprometerte a nada, y recién ahí decidimos si hay algo más grande.';
    }
    return '<b>Estás en un punto intermedio y razonable para partir.</b> Hay horas que recuperar y una base con la que trabajar. ' +
      (esEmp ? 'El camino natural es diagnóstico y después un piloto acotado.' : 'El camino natural es una sesión y después cuatro semanas de piloto.');
  }

  function pintarIndicador() {
    var ej = ejes();
    var contestadas = resp.filter(function (r) { return r !== null; }).length;
    var idx = Math.round((ej.potencial + ej.base + ej.traccion) / 3);

    var arco = 276;
    $('#gArc').style.strokeDashoffset = String(arco - arco * (idx / 100));
    $('#gScore').innerHTML = idx + '<small>/100</small>';
    $('#gStage').textContent = contestadas === 0 ? 'sin responder' : etapa(idx);

    [['#gb1', '#gv1', ej.potencial], ['#gb2', '#gv2', ej.base], ['#gb3', '#gv3', ej.traccion]]
      .forEach(function (r) {
        $(r[0]).style.width = r[2] + '%';
        $(r[1]).textContent = contestadas === 0 ? '—' : r[2] + '%';
      });

    if (contestadas === PREGUNTAS.length) $('#gOut').innerHTML = lectura(ej, idx);
  }

  function pintarPregunta() {
    if (!qText) return;
    enResultado = false;
    var p = PREGUNTAS[qPaso];
    qStep.textContent = 'Pregunta ' + (qPaso + 1) + ' de ' + PREGUNTAS.length;
    qText.textContent = p.t;
    qOpts.innerHTML = '';
    p.o.forEach(function (txt, k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.setAttribute('aria-pressed', String(resp[qPaso] === k));
      b.innerHTML = '<span class="k">' + 'ABCD'[k] + '</span><span class="t"></span>';
      $('.t', b).textContent = txt;
      b.addEventListener('click', function () {
        resp[qPaso] = k;
        pintarIndicador();
        if (qPaso < PREGUNTAS.length - 1) { qPaso++; pintarPregunta(); }
        else { pintarCierre(); }
      });
      qOpts.appendChild(b);
    });
    $$('i', qProg).forEach(function (i, k) { i.classList.toggle('on', k <= qPaso && resp[k] !== null); });
    qBack.style.visibility = qPaso === 0 ? 'hidden' : 'visible';
  }

  function lecturaConIA(ej, idx) {
    var destino = $('#qLectura');
    if (!destino) return;
    var fin = false;
    // Aviso de que está pensando, solo si demora: nunca deja el texto en blanco.
    var aviso = setTimeout(function () {
      if (!fin) destino.insertAdjacentHTML('afterend',
        '<p id="qPensando" class="mono" style="margin-top:10px;font-size:.76rem;color:var(--ink-3)">Escribiendo una lectura para tu caso…</p>');
    }, 450);

    fetch('/api/diagnostico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        indice: idx, potencial: ej.potencial, base: ej.base,
        traccion: ej.traccion, publico: seg
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('sin ia');
      return r.json();
    }).then(function (j) {
      if (!j || !j.texto) throw new Error('vacio');
      var parrafos = j.texto.split(/\n{2,}/).filter(Boolean);
      destino.innerHTML = parrafos.map(function (p, i) {
        return i === 0 ? '<b>' + esc(p) + '</b>' : esc(p);
      }).join('<br><br>');
      destino.insertAdjacentHTML('afterend',
        '<p class="mono" style="margin-top:10px;font-size:.72rem;color:var(--ink-3)">↳ lectura escrita para tu caso, no una respuesta guardada</p>');
      medir('diagnostico_ia', { indice: idx, publico: seg });
    }).catch(function () {
      /* se queda la lectura local, que ya está en pantalla */
    }).then(function () {
      fin = true;
      clearTimeout(aviso);
      var p = $('#qPensando');
      if (p) p.remove();
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  function pintarCierre() {
    var ej = ejes();
    var idx = Math.round((ej.potencial + ej.base + ej.traccion) / 3);
    var esEmp = seg === 'empresas';
    var rec = (ej.potencial >= 60 && ej.base >= 50 && ej.traccion >= 50)
      ? (esEmp ? { n: 'Piloto en producción', d: 'Un proceso andando en 3 a 4 semanas, medido antes y después.', p: 'desde UF 28' }
               : { n: 'Plan Piloto Personal', d: 'Cuatro semanas para cambiar de verdad cómo trabajas.', p: '$229.000' })
      : (ej.potencial < 40)
        ? (esEmp ? { n: 'Capacitación in-company', d: 'Taller de 4 horas donde cada persona sale con una tarea suya resuelta.', p: 'UF 14' }
                 : { n: 'Sesión Despegue', d: '90 minutos, tres tareas resueltas, sin comprometerte a más.', p: '$49.000' })
        : (esEmp ? { n: 'Diagnóstico IA', d: 'Una semana para saber qué automatizar y cuánto vale. Se descuenta si avanzamos.', p: 'UF 12' }
                 : { n: 'Sesión Despegue', d: '90 minutos, tres tareas resueltas, sin comprometerte a más.', p: '$49.000' });

    qStep.textContent = 'Resultado';
    enResultado = true;
    medir('diagnostico_completado', { indice: idx, publico: seg, etapa: etapa(idx) });
    qBody.innerHTML =
      '<div class="qdone">' +
      '<h3>Tu índice es ' + idx + ' de 100: ' + etapa(idx) + '</h3>' +
      '<p id="qLectura">' + lectura(ej, idx) + '</p>' +
      '<div class="rec"><span class="k">Lo que yo te recomendaría</span><b></b><p></p>' +
      '<p class="mono" style="margin-top:10px;color:var(--amber-text);font-size:.9rem"></p></div>' +
      '<div class="acts">' +
      '<a class="btn btn-amber" data-wsp-result href="#contacto">Mandarle esto a Andrés</a>' +
      '<a class="btn btn-ghost" href="#planes">Ver los planes</a>' +
      '</div></div>';
    $('.rec b', qBody).textContent = rec.n;
    $('.rec > p', qBody).textContent = rec.d;
    $('.rec p.mono', qBody).textContent = rec.p;
    $$('i', qProg).forEach(function (i) { i.classList.add('on'); });
    qBack.style.visibility = 'visible';

    // Lectura escrita por la IA para este caso puntual. La local ya está en
    // pantalla: si el endpoint no existe o falla, no se nota nada.
    lecturaConIA(ej, idx);

    var env = $('[data-wsp-result]', qBody);
    if (env) env.addEventListener('click', function (e) {
      e.preventDefault();
      medir('whatsapp', { origen: 'diagnostico', publico: seg, indice: idx });
      var t = 'Hola Andrés, hice el diagnóstico en tu página.\n\n' +
        'Índice: ' + idx + '/100 (' + etapa(idx) + ')\n' +
        'Potencial a ganar: ' + ej.potencial + '%\n' +
        'Base y orden: ' + ej.base + '%\n' +
        'Tracción para partir: ' + ej.traccion + '%\n' +
        'Me recomendó: ' + rec.n + '\n\nQuiero conversarlo.';
      window.open('https://wa.me/' + WSP + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
    });
  }

  if (qBack) qBack.addEventListener('click', function () {
    if (!enResultado && qPaso > 0) qPaso--;
    qBody.innerHTML = '<p class="qt" id="qText"></p><div class="opts" id="qOpts"></div>';
    qText = $('#qText'); qOpts = $('#qOpts');
    pintarPregunta();
  });
  if (qReset) qReset.addEventListener('click', function () {
    resp = new Array(PREGUNTAS.length).fill(null);
    qPaso = 0;
    qBody.innerHTML = '<p class="qt" id="qText"></p><div class="opts" id="qOpts"></div>';
    qText = $('#qText'); qOpts = $('#qOpts');
    $('#gOut').textContent = 'Responde las seis preguntas y acá aparece tu lectura: qué tienes a favor, qué te falta y cuál sería el primer paso que yo te recomendaría.';
    pintarPregunta(); pintarIndicador();
  });
  pintarPregunta();
  pintarIndicador();

  /* ---------------------------------------------------------- calculadora */
  var cPers = $('#cPers'), cHrs = $('#cHrs'), cCost = $('#cCost'), cAuto = $('#cAuto');

  function calcular() {
    if (!cPers) return;
    var personas = +cPers.value, horas = +cHrs.value, costo = +cCost.value, auto = +cAuto.value / 100;

    $('#cPersV').textContent = personas;
    $('#cHrsV').textContent = horas + ' h';
    $('#cCostV').textContent = '$' + CLP.format(costo);
    $('#cAutoV').textContent = Math.round(auto * 100) + '%';

    var horasAno = personas * horas * SEMANAS;
    var recuperadas = Math.round(horasAno * auto);
    var restantes = horasAno - recuperadas;
    var plata = recuperadas * costo;

    $('#rMoney').textContent = '$' + CLP.format(plata);
    $('#rHoy').textContent = CLP.format(horasAno) + ' h';
    $('#rIA').textContent = CLP.format(restantes) + ' h';
    $('#rBarHoy').style.width = '100%';
    $('#rBarIA').style.width = (horasAno ? (restantes / horasAno) * 100 : 0) + '%';
    $('#rHoras').textContent = CLP.format(recuperadas) + ' h';

    var meses = plata > 0 ? PILOTO / (plata / 12) : 0;
    var txt;
    if (!meses || meses > 60) txt = 'más de 5 años';
    else if (meses < 1) txt = 'menos de 1 mes';
    else txt = (meses < 10 ? meses.toFixed(1).replace('.', ',') : Math.round(meses)) + ' meses';
    $('#rPayback').textContent = txt;
  }
  var calcUsada = false;
  [cPers, cHrs, cCost, cAuto].forEach(function (el) {
    if (!el) return;
    el.addEventListener('input', calcular);
    el.addEventListener('change', function () {
      if (calcUsada) return;          // una sola vez por visita
      calcUsada = true;
      medir('calculadora', { publico: seg });
    });
  });

  /* ------------------------------------------------------------ acordeones */
  function acordeon(sel, itemSel) {
    var cont = $(sel);
    if (!cont) return;
    $$(itemSel, cont).forEach(function (it) {
      var btn = $('button', it);
      btn.addEventListener('click', function () {
        var abierto = it.getAttribute('data-open') === 'true';
        $$(itemSel, cont).forEach(function (o) {
          o.setAttribute('data-open', 'false');
          $('button', o).setAttribute('aria-expanded', 'false');
        });
        it.setAttribute('data-open', String(!abierto));
        btn.setAttribute('aria-expanded', String(!abierto));
      });
    });
  }
  acordeon('#cases', '.case');
  acordeon('#faq', '.fq');

  /* ------------------------------------------------------------ formulario */
  var form = $('#form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var box = $('#fMsgBox'), btn = $('#fSend');
    var d = {
      nombre: $('#fNombre').value.trim(),
      contacto: $('#fContacto').value.trim(),
      tipo: $('#fTipo').value,
      mensaje: $('#fMsg').value.trim(),
      publico: seg
    };
    if (!d.nombre || !d.contacto) {
      box.className = 'formmsg err';
      box.textContent = 'Faltan tu nombre y una forma de contactarte.';
      return;
    }
    box.className = 'formmsg';
    btn.disabled = true;
    btn.textContent = 'Enviando…';

    function aWhatsApp() {
      medir('whatsapp', { origen: 'formulario', publico: seg, tipo: d.tipo });
      var t = 'Hola Andrés. Vengo del formulario de anvar ia.\n\n' +
        'Nombre: ' + d.nombre + '\n' +
        'Contacto: ' + d.contacto + '\n' +
        'Necesito: ' + $('#fTipo').selectedOptions[0].text + '\n' +
        (d.mensaje ? '\n' + d.mensaje : '');
      window.open('https://wa.me/' + WSP + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
      box.className = 'formmsg ok';
      box.textContent = 'Te abrí WhatsApp con el mensaje listo. Si no se abrió, escríbeme al +56 9 2633 3760.';
      btn.disabled = false;
      btn.textContent = 'Enviar y coordinar los 30 minutos';
    }

    fetch('/api/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d)
    }).then(function (r) {
      if (!r.ok) throw new Error('sin backend');
      return r.json();
    }).then(function () {
      medir('formulario', { tipo: d.tipo, publico: seg });
      box.className = 'formmsg ok';
      box.textContent = 'Listo, me llegó. Te respondo antes de 24 horas.';
      form.reset();
      btn.disabled = false;
      btn.textContent = 'Enviar otro mensaje';
    }).catch(aWhatsApp);
  });

  /* -------------------------------------------------------------- detalles */
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
    // red de seguridad: si el observador falla, nada queda invisible
    setTimeout(function () { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }, 1800);
  } else {
    $$('.rv').forEach(function (el) { el.classList.add('in'); });
  }

  setSeg(seg);
})();
