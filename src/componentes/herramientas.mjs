// @ts-check
// Autodiagnóstico, calculadora de ROI y punto de pedido: el HTML inicial. Trae
// el estado ya resuelto (primera pregunta, ejemplo calculado), así nada aparece
// vacío ni en cero mientras carga el JavaScript. Las fórmulas viven en
// src/calculo.mjs, que también usa el navegador (public/calculo.js).
import { CALCULADORA } from '../config.mjs';
import { SERVICIOS } from '../datos/oferta.mjs';
import { DIAGNOSTICO } from '../datos/contenido.mjs';
import { esc, precioTexto } from '../html.mjs';
import { roi, puntoPedido, NIVELES_SERVICIO, resumenRoi, ufAPesos, miles, pesos } from '../calculo.mjs';
import { encabezado } from './base.mjs';

export { puntoPedido, NIVELES_SERVICIO };

/** Valores de ejemplo de la calculadora. */
export const CALC_DEFECTO = CALCULADORA.defecto;

/**
 * Montos que la calculadora ofrece comparar, desde la fuente única de precios.
 * Un precio en UF se pasa a pesos solo con la UF de hoy; sin ella, su monto es
 * null (el HTML inicial no la tiene: la agrega el navegador desde /api/uf).
 * @param {number|null} [uf]  valor de la UF de hoy
 */
export function opcionesInversion(uf = null) {
  const op = (id) => {
    const p = SERVICIOS[id].precio;
    return { id, nombre: SERVICIOS[id].nombre, etiqueta: `${precioTexto(p).principal} + IVA`, moneda: p.moneda, valor: p.valor, monto: p.moneda === 'UF' ? ufAPesos(p.valor, uf) : p.valor };
  };
  return { express: op('express'), piloto: op('piloto') };
}

/**
 * Entradas de la calculadora → resultado (ver src/calculo.mjs).
 * @param {{ personas: number, horas: number, costo: number, auto: number, inversion: string, monto: number, mensual: number }} d
 * @param {number|null} [uf]  UF de hoy; sin ella, el piloto queda sin monto
 */
export function calcularRoi(d, uf = null) {
  const ops = opcionesInversion(uf);
  const inversion = d.inversion === 'otro' ? d.monto : (ops[d.inversion] ?? ops.piloto).monto;
  return roi({ personas: d.personas, horasSemana: d.horas, costoHora: d.costo, pctAutomatizable: d.auto, inversion, costoMensual: d.mensual, semanas: CALCULADORA.semanas });
}

/** Autodiagnóstico interactivo (el HTML trae la primera pregunta). */
export function diagnostico() {
  const cat = DIAGNOSTICO.categorias;
  const total = DIAGNOSTICO.preguntas.length + 1;
  return `<div class="diag" id="diagnostico">
  <div class="diag-panel">
    <div class="diag-cab">
      <p class="diag-paso" id="diag-paso">Pregunta 1 de ${total}</p>
      <div class="diag-progreso" id="diag-progreso" aria-hidden="true">${'<i></i>'.repeat(total)}</div>
    </div>
    <div class="diag-cuerpo" id="diag-cuerpo">
      <fieldset class="diag-pregunta">
        <legend id="diag-texto">¿Qué te gustaría resolver primero?</legend>
        <div class="opciones" id="diag-opciones">
          ${cat.map((c, i) => `<button type="button" class="opcion" data-i="${i}" aria-pressed="false"><span class="opcion-k" aria-hidden="true">${'ABCD'[i]}</span> <span>${esc(c.opcion)}</span></button>`).join('')}
        </div>
      </fieldset>
    </div>
    <div class="diag-pie">
      <button type="button" class="enlace-boton" id="diag-volver" hidden>← Volver</button>
      <button type="button" class="enlace-boton" id="diag-reiniciar">Empezar de nuevo</button>
    </div>
  </div>
  <aside class="indicador" aria-labelledby="ind-tit">
    <p class="label" id="ind-tit">Tu resultado</p>
    <svg class="medidor" viewBox="0 0 220 140" role="img" aria-labelledby="medidor-tit">
      <title id="medidor-tit">Nivel de preparación para automatizar</title>
      <path d="M22 116 A 88 88 0 0 1 198 116" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="12" stroke-linecap="round"/>
      <path id="medidor-arco" d="M22 116 A 88 88 0 0 1 198 116" fill="none" stroke="#F0A92A" stroke-width="12" stroke-linecap="round" stroke-dasharray="276" stroke-dashoffset="276"/>
      <text x="8" y="134" fill="#A9B5AF" font-family="IBM Plex Mono, monospace" font-size="10">0</text>
      <text x="200" y="134" fill="#A9B5AF" font-family="IBM Plex Mono, monospace" font-size="10" text-anchor="middle">100</text>
    </svg>
    <p class="medidor-v" id="medidor-v">— <small>/ 100</small></p>
    <p class="medidor-e" id="medidor-e">Sin responder</p>
    <dl class="ejes">
      <div><dt>Potencial de automatización</dt><dd><span class="eje-barra"><i id="eje-potencial"></i></span> <span id="eje-potencial-v">—</span></dd></div>
      <div><dt>Base y orden de la información</dt><dd><span class="eje-barra"><i id="eje-base"></i></span> <span id="eje-base-v">—</span></dd></div>
      <div><dt>Capacidad de partir</dt><dd><span class="eje-barra"><i id="eje-traccion"></i></span> <span id="eje-traccion-v">—</span></dd></div>
    </dl>
    <p class="indicador-nota">Siete preguntas, dos minutos. No pedimos tu correo para mostrarte el resultado. Es una orientación, no una evaluación del proceso.</p>
  </aside>
</div>`;
}

/**
 * Calculadora de ROI (el HTML trae el ejemplo ya calculado).
 * @param {{ compartir?: boolean, formulas?: string }} [o] formulas: ancla de la sección que explica el cálculo.
 */
export function calculadora({ compartir = false, formulas = '' } = {}) {
  const d = CALC_DEFECTO;
  const r = calcularRoi(d);
  const t = resumenRoi(r, CALCULADORA.mesesMaximos);
  const ops = opcionesInversion();
  const deslizador = (id, etiquetaTxt, min, max, paso, valor, mostrar, hablado, ayuda) => `<div class="control">
    <div class="control-cab"><label for="${id}">${esc(etiquetaTxt)}</label> <output id="${id}-v" for="${id}">${esc(mostrar)}</output></div>
    <input type="range" id="${id}" min="${min}" max="${max}" step="${paso}" value="${valor}" data-defecto="${valor}" aria-valuetext="${esc(hablado)}"${ayuda ? ` aria-describedby="${id}-ayuda"` : ''}>
    ${ayuda ? `<p class="ayuda" id="${id}-ayuda">${esc(ayuda)}</p>` : ''}
  </div>`;
  const opcion = (valor, titulo, detalle, idDetalle = '') => `<label class="calc-opcion"><input type="radio" name="c-inv" value="${valor}"${d.inversion === valor ? ' checked' : ''} data-defecto="${d.inversion === valor ? '1' : '0'}"> <span class="calc-opcion-t"><b>${esc(titulo)}</b> <span class="calc-opcion-d"${idDetalle ? ` id="${idDetalle}"` : ''}>${esc(detalle)}</span></span></label>`;
  const monto = (id, etiquetaTxt, valor, ayuda) => `<div class="calc-monto">
      <label for="${id}">${esc(etiquetaTxt)}</label>
      <div class="campo-pesos"><span aria-hidden="true">$</span><input id="${id}" type="text" inputmode="numeric" autocomplete="off" value="${valor ? esc(miles(valor)) : ''}" placeholder="0" data-defecto="${valor ? esc(miles(valor)) : ''}" aria-describedby="${id}-ayuda"></div>
      <p class="ayuda" id="${id}-ayuda">${esc(ayuda)}</p>
    </div>`;
  const fila = (id, dt, dd, clase = '') => `<div${clase ? ` class="${clase}"` : ''}><dt>${esc(dt)}</dt> <dd id="${id}">${esc(dd)}</dd></div>`;
  return `<div class="calc" id="calculadora" data-necesita-uf>
  <div class="calc-controles">
    ${deslizador('c-personas', 'Personas que hacen esta tarea', 1, 50, 1, d.personas, String(d.personas), `${d.personas} personas`)}
    ${deslizador('c-horas', 'Horas a la semana, cada una', 1, 25, 1, d.horas, `${d.horas} h`, `${d.horas} horas a la semana`)}
    ${deslizador('c-costo', 'Costo de la hora de trabajo', 3000, 40000, 500, d.costo, pesos(d.costo), `${pesos(d.costo)} por hora`, 'Sueldo bruto más leyes sociales, dividido por las horas trabajadas.')}
    ${deslizador('c-auto', 'Parte que se puede automatizar', 5, 100, 5, d.auto, `${d.auto}%`, `${d.auto} por ciento`, 'Si no sabes, deja 60%. En el diagnóstico lo medimos.')}
    <fieldset class="calc-inversion">
      <legend>Inversión a comparar</legend>
      ${opcion('express', ops.express.nombre, ops.express.etiqueta)}
      ${opcion('piloto', ops.piloto.nombre, ops.piloto.etiqueta, 'c-piloto-d')}
      ${opcion('otro', 'Otro monto', 'Tu cotización o presupuesto')}
      ${monto('c-monto', 'Monto de la inversión, neto', d.inversion === 'otro' ? d.monto : 0, 'Al escribir un monto se elige "Otro monto".')}
    </fieldset>
    ${monto('c-mensual', 'Costo mensual de operación o soporte (opcional)', d.mensual, 'Licencias, suscripciones o soporte. Si no hay, deja 0.')}
    <button type="button" class="enlace-boton" id="c-reiniciar">Volver al ejemplo</button>
  </div>
  <div class="calc-resultado">
    <p class="calc-estado"><span class="insignia" id="c-estado">Ejemplo ilustrativo</span></p>
    <p class="label">Ahorro bruto anual estimado</p>
    <p class="calc-valor" id="c-valor">${esc(t.ahorroBruto)}</p>
    <div class="barras" role="img" aria-label="Horas al año antes y después">
      <div class="barra-fila"><span>Hoy</span> <span class="barra-pista"><i class="barra-hoy"></i></span> <span id="c-hoy">${esc(t.horasAnuales)}</span></div>
      <div class="barra-fila"><span>Después</span> <span class="barra-pista"><i class="barra-despues" id="c-barra-despues"></i></span> <span id="c-despues">${esc(t.horasDespues)}</span></div>
    </div>
    <dl class="calc-datos calc-datos--roi">
      ${fila('c-horas-ano', 'Horas manuales al año', t.horasAnuales)}
      ${fila('c-costo-ano', 'Costo anual actual del proceso', t.costoAnual)}
      ${fila('c-horas-lib', 'Horas potencialmente recuperadas', t.horasRecuperadas)}
      ${fila('c-inv', 'Inversión inicial', t.inversion)}
      ${fila('c-recurrente', 'Costos recurrentes al año', t.recurrente)}
      ${fila('c-neto1', 'Ahorro neto estimado, año 1', t.neto1)}
      ${fila('c-payback', 'Payback estimado', t.payback, 'calc-dato-clave')}
      ${fila('c-roi1', 'ROI año 1', t.roi1)}
      ${fila('c-roi3', 'ROI a 3 años', t.roi3)}
    </dl>
    <p class="calc-lectura" id="c-lectura">${esc(r.estado === 'sin-monto' ? 'El piloto se pasa a pesos con la UF de hoy. Si no está disponible, elige «Otro monto» y escribe el valor de tu propuesta.' : t.lectura)}</p>
    <p class="calc-aviso">Estimación referencial basada en los valores ingresados. El resultado real depende del proceso, alcance e implementación.</p>
    <p class="sr" id="c-anuncio" aria-live="polite" aria-atomic="true"></p>
    ${compartir ? `<div class="compartir"><button type="button" class="btn btn--secundario" id="c-compartir">Copiar enlace con estos valores</button> <span class="compartir-msg" id="c-compartir-msg" role="status" aria-live="polite"></span></div>` : ''}
    <p class="nota">Supuestos a la vista: ${CALCULADORA.semanas} semanas hábiles al año y montos netos, sin IVA. No incluye el costo de errores, reprocesos ni atrasos.${formulas ? ` <a href="${esc(formulas)}">Cómo calculamos esto</a>.` : ''}</p>
  </div>
</div>`;
}

/**
 * Herramientas en la portada: solo la entrada a cada una. La experiencia
 * completa vive en su propia URL (una sola página por intención).
 * Los ids "calculadora" y "autodiagnostico" se mantienen para enlaces antiguos.
 */
export function herramientas() {
  const r = calcularRoi(CALC_DEFECTO);
  const d = CALC_DEFECTO;
  const tarjeta = ({ id, meta, titulo, texto, ejemplo, href, boton, evento }) => `<li class="herr-card" id="${id}">
        <p class="herr-card-meta">${esc(meta)}</p>
        <h3>${esc(titulo)}</h3>
        <p>${esc(texto)}</p>
        <p class="herr-card-ej"><span class="label">${esc(ejemplo[0])}</span> ${esc(ejemplo[1])}</p>
        <a class="btn btn--secundario" href="${esc(href)}" data-track="${evento}" data-track-label="inicio"><span>${esc(boton)}</span></a>
      </li>`;
  return `<section class="seccion seccion--panel" id="herramientas" aria-labelledby="herramientas-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Herramientas gratuitas', titulo: '¿Vale la pena automatizar tu proceso?', id: 'herramientas-tit', bajada: 'Dos herramientas para responderlo tú mismo, antes de hablar con nosotros. Ninguna pide tus datos.' })}
    <ul class="herr-cards">
      ${tarjeta({ id: 'calculadora', meta: '1 minuto · sin registro', titulo: 'Calculadora ROI de automatización', texto: 'Descubre cuánto cuesta mantener un proceso manual y estima el retorno potencial de automatizarlo.', ejemplo: ['Ejemplo', `${d.personas} personas × ${d.horas} h a la semana → ${miles(r.horasRecuperadas)} h al año que se podrían recuperar`], href: '/calculadora-roi-automatizacion', boton: 'Calcular ROI', evento: 'home_roi_tool_click' })}
      ${tarjeta({ id: 'autodiagnostico', meta: '2 minutos · sin correo', titulo: 'Diagnóstico de automatización', texto: 'Evalúa qué tan automatizable es un proceso y qué tipo de solución podría tener sentido.', ejemplo: ['Resultado', 'Puntaje de 0 a 100, oportunidades según tus respuestas y un primer paso sugerido'], href: '/diagnostico-automatizacion', boton: 'Hacer diagnóstico', evento: 'home_diagnostic_tool_click' })}
    </ul>
    <p class="herr-enlaces">
      <a href="/recursos/plantilla-roi-automatizacion" data-track="content_cta_click" data-track-label="inicio-plantilla">Plantilla Excel de ROI (gratis)</a>
      <a href="/herramientas/punto-de-pedido" data-track="content_cta_click" data-track-label="inicio-punto-pedido">Calculadora de punto de pedido</a>
      <a href="/recursos" data-track="content_cta_click" data-track-label="inicio-recursos">Todas las guías y herramientas</a>
    </p>
  </div>
</section>`;
}

/* ---------------------------------------------------- punto de pedido */

/** Ejemplo con que parte la calculadora de punto de pedido. */
export const PP_DEFECTO = { demanda: 20, desvDemanda: 6, plazo: 7, desvPlazo: 1, servicio: 95, stock: null };

/** Calculadora de punto de pedido (el HTML trae el ejemplo ya calculado). */
export function calculadoraPuntoPedido() {
  const d = PP_DEFECTO;
  const r = puntoPedido(d);
  const campo = (id, etiquetaTxt, valor, ayuda, attrsExtra = '') => `<div class="pp-campo"><label for="${id}">${esc(etiquetaTxt)}</label><input id="${id}" type="number" inputmode="decimal" value="${valor ?? ''}" ${attrsExtra}${ayuda ? ` aria-describedby="${id}-ayuda"` : ''}>${ayuda ? `<p class="ayuda" id="${id}-ayuda">${esc(ayuda)}</p>` : ''}</div>`;
  return `<div class="pp" id="punto-pedido">
  <form class="pp-form" id="pp-form" novalidate>
    ${campo('pp-demanda', 'Demanda promedio diaria (unidades por día)', d.demanda, 'Ventas o salidas del producto, en promedio por día.', 'min="0" step="any" required')}
    ${campo('pp-desv-demanda', 'Variación de la demanda diaria (desviación estándar)', d.desvDemanda, 'En Excel: =DESVEST.M() de las ventas diarias de los últimos 3 a 6 meses. Si no la tienes, deja 0.', 'min="0" step="any"')}
    ${campo('pp-plazo', 'Plazo de reposición del proveedor (días)', d.plazo, 'Días desde que haces el pedido hasta que el producto está disponible.', 'min="0" step="any" required')}
    ${campo('pp-desv-plazo', 'Variación del plazo (desviación estándar, en días)', d.desvPlazo, 'Si el proveedor siempre cumple, deja 0.', 'min="0" step="any"')}
    <div class="pp-campo"><label for="pp-servicio">Nivel de servicio</label><select id="pp-servicio" aria-describedby="pp-servicio-ayuda">${NIVELES_SERVICIO.map((n) => `<option value="${n.pct}"${n.pct === d.servicio ? ' selected' : ''}>${String(n.pct).replace('.', ',')}% (Z = ${String(n.z).replace('.', ',')})</option>`).join('')}</select><p class="ayuda" id="pp-servicio-ayuda">Probabilidad de no quedarte sin stock mientras llega el pedido.</p></div>
    ${campo('pp-stock', 'Stock actual (opcional)', '', 'Para saber si ya corresponde pedir.', 'min="0" step="any"')}
  </form>
  <div class="pp-resultado" aria-labelledby="pp-res-tit">
    <p class="label" id="pp-res-tit">Resultado</p>
    <dl class="pp-cifras">
      <div><dt>Punto de pedido</dt><dd id="pp-punto">${miles(r.punto)} <small>unidades</small></dd></div>
      <div><dt>Stock de seguridad</dt><dd id="pp-seguridad">${miles(r.seguridad)} <small>unidades</small></dd></div>
    </dl>
    <p class="pp-lectura" id="pp-lectura">Cuando el stock baje de ${miles(r.punto)} unidades, haz el pedido. Esa cifra cubre la demanda esperada durante el plazo (${miles(r.durantePlazo)} unidades) más ${miles(r.seguridad)} de seguridad, con un nivel de servicio de 95%.</p>
    <p class="pp-error" id="pp-error" role="alert" hidden></p>
    <p class="sr" id="pp-anuncio" aria-live="polite" aria-atomic="true"></p>
  </div>
</div>`;
}
