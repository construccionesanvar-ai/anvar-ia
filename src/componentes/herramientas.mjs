// @ts-check
// Diagnóstico y calculadora. El HTML trae el estado inicial ya resuelto
// (primera pregunta y ejemplo calculado), así nada aparece vacío ni en cero
// mientras carga el JavaScript.
import { SITIO, SEMANAS_HABILES } from '../config.mjs';
import { SERVICIOS } from '../datos/oferta.mjs';
import { DIAGNOSTICO } from '../datos/contenido.mjs';
import { esc, pesos } from '../html.mjs';
import { encabezado } from './base.mjs';

/** Valores de ejemplo de la calculadora. */
export const CALC_DEFECTO = { personas: 5, horas: 6, costo: 9000, auto: 60 };

/** La misma fórmula que usa app.js, para el estado inicial. */
export function calcular({ personas, horas, costo, auto }) {
  const horasAno = personas * horas * SEMANAS_HABILES;
  const recuperadas = Math.round(horasAno * (auto / 100));
  const valor = recuperadas * costo;
  const express = SERVICIOS.express.precio.valor;
  const piloto = SERVICIOS.piloto.precio.valor * SITIO.uf;
  const mensual = valor / 12;
  const referencia = valor < 2_000_000 ? { nombre: 'una Automatización Express', precio: express } : { nombre: 'un piloto', precio: piloto };
  const meses = mensual > 0 ? referencia.precio / mensual : Infinity;
  return { horasAno, recuperadas, restantes: horasAno - recuperadas, valor, referencia, meses };
}

export function textoRetorno(r) {
  if (!isFinite(r.meses) || r.meses > 36) return 'Con estos números no se justifica automatizar por ahorro de tiempo. Conviene revisar si hay errores o reprocesos que cuesten más.';
  const m = r.meses < 1 ? 'menos de un mes' : r.meses < 10 ? `${r.meses.toFixed(1).replace('.', ',')} meses` : `${Math.round(r.meses)} meses`;
  return `Con este ahorro, ${r.referencia.nombre} (${pesos(r.referencia.precio)} + IVA) se pagaría en ${m}.`;
}

function diagnostico() {
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
          ${cat.map((c, i) => `<button type="button" class="opcion" data-i="${i}"><span class="opcion-k" aria-hidden="true">${'ABCD'[i]}</span><span>${esc(c.opcion)}</span></button>`).join('')}
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
    <p class="medidor-v" id="medidor-v" aria-live="polite">— <small>/ 100</small></p>
    <p class="medidor-e" id="medidor-e">Sin responder</p>
    <dl class="ejes">
      <div><dt>Potencial de automatización</dt><dd><span class="eje-barra"><i id="eje-potencial"></i></span><span id="eje-potencial-v">—</span></dd></div>
      <div><dt>Base y orden de la información</dt><dd><span class="eje-barra"><i id="eje-base"></i></span><span id="eje-base-v">—</span></dd></div>
      <div><dt>Capacidad de partir</dt><dd><span class="eje-barra"><i id="eje-traccion"></i></span><span id="eje-traccion-v">—</span></dd></div>
    </dl>
    <p class="indicador-nota">Siete preguntas, dos minutos. No pedimos tu correo para mostrarte el resultado.</p>
  </aside>
</div>`;
}

function calculadora() {
  const d = CALC_DEFECTO;
  const r = calcular(d);
  const deslizador = (id, etiquetaTxt, min, max, paso, valor, mostrar, hablado, ayuda) => `<div class="control">
    <div class="control-cab"><label for="${id}">${esc(etiquetaTxt)}</label><output id="${id}-v" for="${id}">${esc(mostrar)}</output></div>
    <input type="range" id="${id}" min="${min}" max="${max}" step="${paso}" value="${valor}" aria-valuetext="${esc(hablado)}"${ayuda ? ` aria-describedby="${id}-ayuda"` : ''}>
    ${ayuda ? `<p class="ayuda" id="${id}-ayuda">${esc(ayuda)}</p>` : ''}
  </div>`;
  return `<div class="calc" id="calculadora">
  <div class="calc-controles">
    ${deslizador('c-personas', 'Personas que hacen esta tarea', 1, 50, 1, d.personas, String(d.personas), `${d.personas} personas`)}
    ${deslizador('c-horas', 'Horas a la semana, cada una', 1, 25, 1, d.horas, `${d.horas} h`, `${d.horas} horas a la semana`)}
    ${deslizador('c-costo', 'Costo de la hora de trabajo', 3000, 40000, 500, d.costo, pesos(d.costo), `${pesos(d.costo)} por hora`, 'Sueldo bruto más leyes sociales, dividido por las horas trabajadas.')}
    ${deslizador('c-auto', 'Parte que se puede automatizar', 20, 90, 5, d.auto, `${d.auto}%`, `${d.auto} por ciento`, 'Si no sabes, deja 60%. En el diagnóstico lo medimos.')}
  </div>
  <div class="calc-resultado">
    <p class="calc-estado"><span class="insignia" id="c-estado">Ejemplo ilustrativo</span></p>
    <p class="label">Valor anual del trabajo que se podría automatizar</p>
    <p class="calc-valor" id="c-valor" aria-live="polite" aria-atomic="true">${esc(pesos(r.valor))}</p>
    <div class="barras" role="img" aria-label="Horas al año antes y después">
      <div class="barra-fila"><span>Hoy</span><span class="barra-pista"><i class="barra-hoy"></i></span><span id="c-hoy">${esc(r.horasAno.toLocaleString('es-CL'))} h</span></div>
      <div class="barra-fila"><span>Después</span><span class="barra-pista"><i class="barra-despues" id="c-barra-despues" data-pct="${Math.round((r.restantes / r.horasAno) * 100)}"></i></span><span id="c-despues">${esc(r.restantes.toLocaleString('es-CL'))} h</span></div>
    </div>
    <dl class="calc-datos">
      <div><dt>Horas que se liberan al año</dt><dd id="c-horas-lib">${esc(r.recuperadas.toLocaleString('es-CL'))} h</dd></div>
      <div><dt>Referencia de inversión</dt><dd id="c-retorno">${esc(textoRetorno(r))}</dd></div>
    </dl>
    <p class="nota">Supuestos a la vista: ${SEMANAS_HABILES} semanas hábiles al año. No incluye errores, reprocesos ni atrasos, que suelen costar más que las horas.</p>
  </div>
</div>`;
}

export function herramientas() {
  return `<section class="seccion seccion--panel" id="herramientas" aria-labelledby="herramientas-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Antes de hablar con nosotros', titulo: '¿Vale la pena automatizar tu proceso?', id: 'herramientas-tit', bajada: 'Dos herramientas para responderlo tú mismo: un diagnóstico de preparación y una calculadora de ahorro. Ninguna pide tus datos.' })}
    <h3 class="subtit">Diagnóstico de automatización</h3>
    ${diagnostico()}
    <h3 class="subtit subtit--sep">Calculadora de ahorro</h3>
    ${calculadora()}
  </div>
</section>`;
}
