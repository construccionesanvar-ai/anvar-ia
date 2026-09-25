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
 * `inversion: null` significa "monto en pesos desconocido" (por ejemplo, un
 * piloto en UF cuando no hay UF del día): el ahorro se calcula igual, pero la
 * inversión, el ahorro neto del año 1, el payback y el ROI quedan en null
 * (estado 'sin-monto'). Nunca se inventa un monto.
 * @param {{ personas: number, horasSemana: number, costoHora: number, pctAutomatizable: number,
 *   inversion: number|null, costoMensual?: number, semanas?: number }} e
 */
export function roi(e) {
  const personas = positivo(e.personas);
  const horasSemana = positivo(e.horasSemana);
  const costoHora = positivo(e.costoHora);
  const pct = Math.min(100, positivo(e.pctAutomatizable)) / 100;
  const sinMonto = e.inversion === null;
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

  if (sinMonto) {
    return { horasAnuales, costoAnual, horasRecuperadas, ahorroBruto, inversion: null, recurrenteAnual, ahorroNetoAnual, ahorroNetoAno1: null, paybackMeses: null, roi1: null, roi3: null, estado: /** @type {const} */ ('sin-monto') };
  }

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
/** Tope de un monto escrito a mano: un billón de pesos. */
export const MONTO_MAXIMO = 1e12;

/**
 * Monto en pesos escrito por una persona: "$ 1.500.000", "1500000" o
 * "1.500.000,50" → 1500000. Sin signo ni decimales (los pesos no los usan), y con
 * tope, para que un número pegado por error no rompa el resultado.
 * @param {unknown} texto
 * @param {number} [tope]
 */
export function leerPesos(texto, tope = MONTO_MAXIMO) {
  const entero = String(texto ?? '').split(',')[0].replace(/\D/g, '');
  const n = entero ? Number(entero) : 0;
  return Number.isFinite(n) ? Math.min(n, tope) : 0;
}

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

/**
 * Precio en UF pasado a pesos, redondeado al peso: 40 × 41.016,28 → 1.640.651.
 * Sin UF válida devuelve null (la interfaz muestra solo el precio en UF).
 * @param {number} cantidad  UF
 * @param {number|null|undefined} valorUf  pesos por UF
 */
export function ufAPesos(cantidad, valorUf) {
  const c = Number(cantidad), v = Number(valorUf);
  if (valorUf === null || valorUf === undefined || !Number.isFinite(c) || !Number.isFinite(v) || c < 0 || v <= 0) return null;
  return Math.round(c * v);
}

/** Sin monto de inversión (estado 'sin-monto') estos valores no existen. */
export const SIN_DATO = '—';

/** Payback para mostrar: nunca "Infinity", "NaN" ni "-0". */
export function textoPayback(r, mesesMax = 36) {
  if (r.estado === 'sin-monto') return SIN_DATO;
  if (r.estado === 'sin-ahorro' || r.estado === 'sin-inversion') return 'No aplica';
  if (r.estado === 'sin-recuperacion' || r.paybackMeses === null) return 'Sin recuperación';
  if (r.paybackMeses > mesesMax) return `Más de ${mesesMax} meses`;
  if (r.paybackMeses < 1) return 'Menos de 1 mes';
  return `${unDecimal(r.paybackMeses)} meses`;
}

/** Lectura en una frase, prudente: estimación, no promesa. */
export function lecturaRoi(r, mesesMax = 36) {
  if (r.estado === 'sin-monto') return 'Falta el monto de la inversión en pesos: elige una opción o escribe «Otro monto» para ver el payback y el ROI.';
  if (r.estado === 'sin-ahorro') return 'Con estos valores no hay horas que recuperar: no hay ahorro que estimar.';
  if (r.estado === 'sin-recuperacion') return 'Con estos valores la automatización no se pagaría: el costo mensual iguala o supera el ahorro estimado.';
  if (r.estado === 'sin-inversion') return 'Sin inversión inicial, el ahorro estimado es el ahorro neto anual. El payback y el ROI no aplican.';
  if (/** @type {number} */ (r.paybackMeses) > mesesMax) return `Con estos números la inversión no se recuperaría dentro de ${mesesMax} meses solo con ahorro de tiempo. Conviene revisar si hay errores o reprocesos que cuesten más.`;
  return `Con esta inversión, el ahorro estimado la recuperaría en ${textoPayback(r, mesesMax).toLowerCase()}. Es un valor referencial: depende del proceso, del alcance y de la implementación.`;
}

/**
 * Todos los textos del resultado de ROI, para que el HTML inicial y el
 * navegador escriban exactamente lo mismo.
 * @param {ReturnType<typeof roi>} r
 * @param {number} [mesesMax]
 */
export function resumenRoi(r, mesesMax = 36) {
  const sinMonto = r.estado === 'sin-monto';
  return {
    ahorroBruto: pesos(r.ahorroBruto),
    horasAnuales: miles(r.horasAnuales) + ' h',
    horasDespues: miles(r.horasAnuales - r.horasRecuperadas) + ' h',
    costoAnual: pesos(r.costoAnual),
    horasRecuperadas: miles(r.horasRecuperadas) + ' h',
    inversion: sinMonto ? SIN_DATO : pesos(r.inversion),
    recurrente: pesos(r.recurrenteAnual),
    neto1: sinMonto ? SIN_DATO : pesos(r.ahorroNetoAno1),
    payback: textoPayback(r, mesesMax),
    roi1: sinMonto ? SIN_DATO : porcentaje(r.roi1),
    roi3: sinMonto ? SIN_DATO : porcentaje(r.roi3),
    lectura: lecturaRoi(r, mesesMax),
  };
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
