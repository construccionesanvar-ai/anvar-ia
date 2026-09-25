// @ts-check
// Autodiagnóstico y calculadora. El HTML trae el estado inicial ya resuelto
// (primera pregunta y ejemplo calculado), así nada aparece vacío ni en cero
// mientras carga el JavaScript. La fórmula de `calcular()` es la misma de
// public/app.js; tests/calculadora.test.mjs y el E2E comprueban que coincidan.
import { SITIO, CALCULADORA } from '../config.mjs';
import { SERVICIOS } from '../datos/oferta.mjs';
import { DIAGNOSTICO } from '../datos/contenido.mjs';
import { esc, pesos, precioTexto } from '../html.mjs';
import { encabezado } from './base.mjs';

/** Valores de ejemplo de la calculadora. */
export const CALC_DEFECTO = CALCULADORA.defecto;

/** Referencias de inversión que usa la calculadora (desde la fuente única de precios). */
export function referenciasCalculadora(uf = SITIO.uf.valor) {
  const ex = SERVICIOS.express.precio;
  const pi = SERVICIOS.piloto.precio;
  return {
    express: { nombre: 'una Automatización Express', precio: ex.valor, etiqueta: `${precioTexto(ex).principal} + IVA` },
    piloto: { nombre: 'un piloto', precio: pi.valor * uf, etiqueta: `${precioTexto(pi).principal} + IVA` },
  };
}

/**
 * La misma fórmula que usa app.js.
 * @param {{ personas: number, horas: number, costo: number, auto: number }} v
 * @param {{ uf?: number }} [o]
 */
export function calcular({ personas, horas, costo, auto }, o = {}) {
  const refs = referenciasCalculadora(o.uf);
  const horasAno = personas * horas * CALCULADORA.semanas;
  const recuperadas = Math.round(horasAno * (auto / 100));
  const valor = recuperadas * costo;
  const mensual = valor / 12;
  const referencia = valor < CALCULADORA.umbralExpress ? refs.express : refs.piloto;
  const meses = mensual > 0 ? referencia.precio / mensual : Infinity;
  return { horasAno, recuperadas, restantes: horasAno - recuperadas, valor, referencia, meses };
}

/** Frase del retorno. Idéntica a la de app.js. */
export function textoRetorno(r) {
  if (!isFinite(r.meses) || r.meses > CALCULADORA.mesesMaximos) return 'Con estos números no se justifica automatizar solo por ahorro de tiempo. Conviene revisar si hay errores o reprocesos que cuesten más.';
  const m = r.meses < 1 ? 'menos de un mes' : r.meses < 10 ? `${r.meses.toFixed(1).replace('.', ',')} meses` : `${Math.round(r.meses)} meses`;
  return `Como referencia, con este valor ${r.referencia.nombre} (${r.referencia.etiqueta}) se pagaría en ${m}.`;
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
          ${cat.map((c, i) => `<button type="button" class="opcion" data-i="${i}" aria-pressed="false"><span class="opcion-k" aria-hidden="true">${'ABCD'[i]}</span><span>${esc(c.opcion)}</span></button>`).join('')}
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
      <div><dt>Potencial de automatización</dt><dd><span class="eje-barra"><i id="eje-potencial"></i></span><span id="eje-potencial-v">—</span></dd></div>
      <div><dt>Base y orden de la información</dt><dd><span class="eje-barra"><i id="eje-base"></i></span><span id="eje-base-v">—</span></dd></div>
      <div><dt>Capacidad de partir</dt><dd><span class="eje-barra"><i id="eje-traccion"></i></span><span id="eje-traccion-v">—</span></dd></div>
    </dl>
    <p class="indicador-nota">Siete preguntas, dos minutos. No pedimos tu correo para mostrarte el resultado. Es una orientación, no una evaluación del proceso.</p>
  </aside>
</div>`;
}

/** Calculadora de ahorro (el HTML trae el ejemplo ya calculado). */
export function calculadora({ compartir = false } = {}) {
  const d = CALC_DEFECTO;
  const r = calcular(d);
  const deslizador = (id, etiquetaTxt, min, max, paso, valor, mostrar, hablado, ayuda) => `<div class="control">
    <div class="control-cab"><label for="${id}">${esc(etiquetaTxt)}</label><output id="${id}-v" for="${id}">${esc(mostrar)}</output></div>
    <input type="range" id="${id}" min="${min}" max="${max}" step="${paso}" value="${valor}" data-defecto="${valor}" aria-valuetext="${esc(hablado)}"${ayuda ? ` aria-describedby="${id}-ayuda"` : ''}>
    ${ayuda ? `<p class="ayuda" id="${id}-ayuda">${esc(ayuda)}</p>` : ''}
  </div>`;
  return `<div class="calc" id="calculadora">
  <div class="calc-controles">
    ${deslizador('c-personas', 'Personas que hacen esta tarea', 1, 50, 1, d.personas, String(d.personas), `${d.personas} personas`)}
    ${deslizador('c-horas', 'Horas a la semana, cada una', 1, 25, 1, d.horas, `${d.horas} h`, `${d.horas} horas a la semana`)}
    ${deslizador('c-costo', 'Costo de la hora de trabajo', 3000, 40000, 500, d.costo, pesos(d.costo), `${pesos(d.costo)} por hora`, 'Sueldo bruto más leyes sociales, dividido por las horas trabajadas.')}
    ${deslizador('c-auto', 'Parte que se puede automatizar', 20, 90, 5, d.auto, `${d.auto}%`, `${d.auto} por ciento`, 'Si no sabes, deja 60%. En el diagnóstico lo medimos.')}
    <button type="button" class="enlace-boton" id="c-reiniciar">Volver al ejemplo</button>
  </div>
  <div class="calc-resultado">
    <p class="calc-estado"><span class="insignia" id="c-estado">Ejemplo ilustrativo</span></p>
    <p class="label">Valor anual del trabajo que se podría automatizar</p>
    <p class="calc-valor" id="c-valor">${esc(pesos(r.valor))}</p>
    <div class="barras" role="img" aria-label="Horas al año antes y después">
      <div class="barra-fila"><span>Hoy</span><span class="barra-pista"><i class="barra-hoy"></i></span><span id="c-hoy">${esc(r.horasAno.toLocaleString('es-CL'))} h</span></div>
      <div class="barra-fila"><span>Después</span><span class="barra-pista"><i class="barra-despues" id="c-barra-despues"></i></span><span id="c-despues">${esc(r.restantes.toLocaleString('es-CL'))} h</span></div>
    </div>
    <dl class="calc-datos">
      <div><dt>Horas que se liberan al año</dt><dd id="c-horas-lib">${esc(r.recuperadas.toLocaleString('es-CL'))} h</dd></div>
      <div><dt>Referencia de inversión</dt><dd id="c-retorno">${esc(textoRetorno(r))}</dd></div>
    </dl>
    <p class="calc-aviso">Estimación referencial basada en los valores ingresados, no una promesa de ahorro. El resultado real depende del proceso.</p>
    <p class="sr" id="c-anuncio" aria-live="polite" aria-atomic="true"></p>
    ${compartir ? `<div class="compartir"><button type="button" class="btn btn--secundario" id="c-compartir">Copiar enlace con estos valores</button><span class="compartir-msg" id="c-compartir-msg" role="status" aria-live="polite"></span></div>` : ''}
    <p class="nota">Supuestos a la vista: ${CALCULADORA.semanas} semanas hábiles al año y valores netos. No incluye errores, reprocesos ni atrasos, que suelen costar más que las horas.</p>
  </div>
</div>`;
}

export function herramientas() {
  return `<section class="seccion seccion--panel" id="herramientas" aria-labelledby="herramientas-tit" data-sin-precios>
  <div class="contenedor">
    ${encabezado({ codigo: 'Antes de hablar con nosotros', titulo: '¿Vale la pena automatizar tu proceso?', id: 'herramientas-tit', bajada: 'Dos herramientas para responderlo tú mismo: un autodiagnóstico de preparación y una calculadora de ahorro. Ninguna pide tus datos.' })}
    <h3 class="subtit" id="autodiagnostico">Autodiagnóstico: ¿qué tan preparado está tu proceso?</h3>
    ${diagnostico()}
    <p class="herr-enlaces"><a href="/diagnostico-automatizacion" data-track="content_cta_click" data-track-label="inicio-diagnostico">Cómo se calcula el autodiagnóstico y qué hacer con el resultado</a></p>
    <h3 class="subtit subtit--sep" id="calculadora-tit">Calculadora de ahorro</h3>
    ${calculadora()}
    <p class="herr-enlaces">
      <a href="/calculadora-roi-automatizacion" data-track="content_cta_click" data-track-label="inicio-calculadora">La fórmula, paso a paso</a>
      <a href="/recursos/plantilla-roi-automatizacion" data-track="content_cta_click" data-track-label="inicio-plantilla">Plantilla Excel de ROI (gratis)</a>
      <a href="/herramientas/punto-de-pedido" data-track="content_cta_click" data-track-label="inicio-punto-pedido">Calculadora de punto de pedido</a>
      <a href="/recursos" data-track="content_cta_click" data-track-label="inicio-recursos">Todas las guías y herramientas</a>
    </p>
  </div>
</section>`;
}

/* ---------------------------------------------------- punto de pedido */

/** Valores Z de la distribución normal para cada nivel de servicio. */
export const NIVELES_SERVICIO = [
  { pct: 90, z: 1.282 },
  { pct: 95, z: 1.645 },
  { pct: 97.5, z: 1.96 },
  { pct: 99, z: 2.326 },
];

/** Ejemplo con que parte la calculadora de punto de pedido. */
export const PP_DEFECTO = { demanda: 20, desvDemanda: 6, plazo: 7, desvPlazo: 1, servicio: 95, stock: null };

/**
 * Stock de seguridad y punto de pedido (misma fórmula que app.js).
 * SS = Z · √(L · σd² + d² · σL²) ; PP = d · L + SS. Se redondean hacia arriba: son unidades.
 * @param {{ demanda: number, desvDemanda: number, plazo: number, desvPlazo: number, servicio: number }} v
 */
export function puntoPedido({ demanda, desvDemanda, plazo, desvPlazo, servicio }) {
  const z = (NIVELES_SERVICIO.find((n) => n.pct === servicio) ?? NIVELES_SERVICIO[1]).z;
  const durantePlazo = demanda * plazo;
  const seguridad = Math.ceil(z * Math.sqrt(plazo * desvDemanda ** 2 + demanda ** 2 * desvPlazo ** 2));
  return { z, durantePlazo: Math.ceil(durantePlazo), seguridad, punto: Math.ceil(durantePlazo + seguridad) };
}

/** Formulario de punto de pedido, con el ejemplo ya calculado. */
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
      <div><dt>Punto de pedido</dt><dd id="pp-punto">${r.punto.toLocaleString('es-CL')}<small>unidades</small></dd></div>
      <div><dt>Stock de seguridad</dt><dd id="pp-seguridad">${r.seguridad.toLocaleString('es-CL')}<small>unidades</small></dd></div>
    </dl>
    <p class="pp-lectura" id="pp-lectura">Cuando el stock baje de ${r.punto.toLocaleString('es-CL')} unidades, haz el pedido. Esa cifra cubre la demanda esperada durante el plazo (${r.durantePlazo.toLocaleString('es-CL')} unidades) más ${r.seguridad.toLocaleString('es-CL')} de seguridad, con un nivel de servicio de 95%.</p>
    <p class="pp-error" id="pp-error" role="alert" hidden></p>
    <p class="sr" id="pp-anuncio" aria-live="polite" aria-atomic="true"></p>
  </div>
</div>`;
}
