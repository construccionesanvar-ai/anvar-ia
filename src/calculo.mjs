// @ts-check
// Cálculos de las herramientas: ROI de automatizar un proceso y punto de pedido.
// FUENTE ÚNICA. El build la usa para el HTML inicial, las pruebas la validan
// con casos conocidos (tests/calculo.test.mjs) y scripts/build.mjs la copia a
// public/calculo.js para el navegador. Por eso este archivo:
//   - no importa nada (se copia tal cual),
//   - solo usa JavaScript que corre en cualquier navegador actual,
//   - formatea números sin Intl, para que el servidor y el navegador escriban
//     exactamente lo mismo.
// La plantilla Excel (scripts/plantillas/roi.py) usa las mismas fórmulas.

/** Número válido y no negativo; cualquier otra cosa cuenta como 0. */
const positivo = (v) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : 0; };

/**
 * ROI de automatizar un proceso.
 *   Horas manuales al año   = personas × horas por semana × semanas
 *   Costo anual actual      = horas manuales × costo por hora
 *   Horas recuperables      = horas manuales × % automatizable
 *   Ahorro bruto anual      = horas recuperables × costo por hora
 *   Costos recurrentes      = costo mensual × 12
 *   Ahorro neto anual       = ahorro bruto − costos recurrentes
 *   Ahorro neto año 1       = ahorro neto anual − inversión
 *   Payback (meses)         = inversión ÷ (ahorro neto anual ÷ 12)
 *   ROI año 1               = ahorro neto año 1 ÷ inversión
 *   ROI a 3 años            = (ahorro neto anual × 3 − inversión) ÷ inversión
 * `estado` dice cuándo payback y ROI no aplican, para no mostrar Infinity ni NaN.
 * @param {{ personas: number, horasSemana: number, costoHora: number, pctAutomatizable: number,
 *   inversion: number, costoMensual?: number, semanas?: number }} e
 */
export function roi(e) {
  const personas = positivo(e.personas);
  const horasSemana = positivo(e.horasSemana);
  const costoHora = positivo(e.costoHora);
  const pct = Math.min(100, positivo(e.pctAutomatizable)) / 100;
  const inversion = positivo(e.inversion);
  const costoMensual = positivo(e.costoMensual);
  const semanas = e.semanas === undefined ? 44 : positivo(e.semanas);

  const horasAnuales = personas * horasSemana * semanas;
  const costoAnual = horasAnuales * costoHora;
  const horasRecuperadas = horasAnuales * pct;
  const ahorroBruto = horasRecuperadas * costoHora;
  const recurrenteAnual = costoMensual * 12;
  const ahorroNetoAnual = ahorroBruto - recurrenteAnual;
  const ahorroNetoAno1 = ahorroNetoAnual - inversion;

  /** @type {'ok'|'sin-ahorro'|'sin-recuperacion'|'sin-inversion'} */
  let estado = 'ok';
  /** @type {number|null} */
  let paybackMeses = null;
  if (ahorroBruto <= 0) estado = 'sin-ahorro';
  else if (ahorroNetoAnual <= 0) estado = 'sin-recuperacion';
  else if (inversion <= 0) estado = 'sin-inversion';
  else paybackMeses = inversion / (ahorroNetoAnual / 12);

  const roi1 = inversion > 0 ? ahorroNetoAno1 / inversion : null;
  const roi3 = inversion > 0 ? (ahorroNetoAnual * 3 - inversion) / inversion : null;
  return { horasAnuales, costoAnual, horasRecuperadas, ahorroBruto, inversion, recurrenteAnual, ahorroNetoAnual, ahorroNetoAno1, paybackMeses, roi1, roi3, estado };
}

/* ------------------------------------------------------------ formato */

/** Miles con punto, sin decimales y sin "-0": 1234567 → "1.234.567"; −5 → "−5". */
export function miles(n) {
  const r = Math.round(Number(n) || 0);
  const s = String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return r < 0 ? '−' + s : s;
}

/** Pesos chilenos: $1.234.567. */
export const pesos = (n) => {
  const r = Math.round(Number(n) || 0);
  return (r < 0 ? '−$' : '$') + miles(Math.abs(r));
};

/** Porcentaje entero con miles: 3,346 → "335%"; null → "No aplica". */
export const porcentaje = (x) => (x === null || !Number.isFinite(x) ? 'No aplica' : miles(x * 100) + '%');

/** Un decimal con coma: 2,76 → "2,8". */
const unDecimal = (x) => String(Math.round(x * 10) / 10).replace('.', ',');

/** Payback para mostrar: nunca "Infinity", "NaN" ni "-0". */
export function textoPayback(r, mesesMax = 36) {
  if (r.estado === 'sin-ahorro' || r.estado === 'sin-inversion') return 'No aplica';
  if (r.estado === 'sin-recuperacion' || r.paybackMeses === null) return 'Sin recuperación';
  if (r.paybackMeses > mesesMax) return `Más de ${mesesMax} meses`;
  if (r.paybackMeses < 1) return 'Menos de 1 mes';
  return `${unDecimal(r.paybackMeses)} meses`;
}

/** Lectura en una frase, prudente: estimación, no promesa. */
export function lecturaRoi(r, mesesMax = 36) {
  if (r.estado === 'sin-ahorro') return 'Con estos valores no hay horas que recuperar: no hay ahorro que estimar.';
  if (r.estado === 'sin-recuperacion') return 'Con estos valores la automatización no se pagaría: el costo mensual iguala o supera el ahorro estimado.';
  if (r.estado === 'sin-inversion') return 'Sin inversión inicial, el ahorro estimado es el ahorro neto anual. El payback y el ROI no aplican.';
  if (/** @type {number} */ (r.paybackMeses) > mesesMax) return `Con estos números la inversión no se recuperaría dentro de ${mesesMax} meses solo con ahorro de tiempo. Conviene revisar si hay errores o reprocesos que cuesten más.`;
  return `Con esta inversión, el ahorro estimado la recuperaría en ${textoPayback(r, mesesMax).toLowerCase()}. Es un valor referencial: depende del proceso, del alcance y de la implementación.`;
}

/* ---------------------------------------------------- punto de pedido */

/** Valores Z de la distribución normal para cada nivel de servicio. */
export const NIVELES_SERVICIO = [
  { pct: 90, z: 1.282 },
  { pct: 95, z: 1.645 },
  { pct: 97.5, z: 1.96 },
  { pct: 99, z: 2.326 },
];

/**
 * Stock de seguridad y punto de pedido.
 *   SS = Z · √(L · σd² + d² · σL²) ; PP = d · L + SS
 * Se redondean hacia arriba: son unidades. Un nivel no listado usa 95%.
 * @param {{ demanda: number, desvDemanda: number, plazo: number, desvPlazo: number, servicio: number }} v
 */
export function puntoPedido({ demanda, desvDemanda, plazo, desvPlazo, servicio }) {
  const d = positivo(demanda), sd = positivo(desvDemanda), L = positivo(plazo), sL = positivo(desvPlazo);
  let z = NIVELES_SERVICIO[1].z;
  for (const n of NIVELES_SERVICIO) if (n.pct === Number(servicio)) z = n.z;
  const durantePlazo = d * L;
  const seguridad = Math.ceil(z * Math.sqrt(L * sd * sd + d * d * sL * sL));
  return { z, durantePlazo: Math.ceil(durantePlazo), seguridad, punto: Math.ceil(durantePlazo + seguridad) };
}
