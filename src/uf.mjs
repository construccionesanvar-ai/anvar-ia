// @ts-check
// UF del día: la única puerta a la fuente externa. La usa /api/uf (servidor);
// el navegador nunca llama a mindicador.cl.
//
// Regla: la UF se muestra solo si es la del día de HOY en Chile
// (America/Santiago). Una UF de otro día, un valor fuera de rango, un error,
// un JSON roto o una fuente lenta dan { estado: 'no-disponible' } y el sitio
// muestra solo el precio en UF. No hay valor de respaldo en pesos.
//
// Fuente: mindicador.cl, API pública sin clave.
//   1. /api/uf/DD-MM-AAAA  (el valor de ese día)
//   2. /api/uf             (la serie reciente; se toma exactamente el día de hoy)

export const FUENTE = 'mindicador.cl';
const BASE = 'https://mindicador.cl/api/uf';
export const ESPERA_MS = 3000; // por consulta; como máximo dos consultas
const SEIS_HORAS = 6 * 60 * 60;

// Rango amplio a propósito: la UF vale ~41.000 en 2026 y sube despacio. Deja
// fuera 0, 999 o 900.000.000 sin tener que tocarlo en décadas.
export const UF_MINIMA = 10_000;
export const UF_MAXIMA = 1_000_000;

/**
 * Fecha calendario en Chile (AAAA-MM-DD) de un instante. Usa la zona horaria,
 * no UTC: a las 22:00 del 25 en Santiago ya es el 26 en UTC, pero en Chile
 * sigue siendo el 25.
 * @param {Date} [instante]
 */
export function fechaChile(instante = new Date()) {
  return instante.toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
}

/**
 * Segundos que faltan para la medianoche de Chile: el tope de cualquier caché
 * de la UF, para que nunca se sirva la de ayer como la de hoy.
 * @param {Date} [ahora]
 */
export function segundosHastaMedianocheChile(ahora = new Date()) {
  const partes = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(ahora).map((p) => [p.type, p.value]));
  const transcurridos = Number(partes.hour) * 3600 + Number(partes.minute) * 60 + Number(partes.second);
  return Math.max(1, 86_400 - transcurridos);
}

/**
 * Cuánto guardar una UF válida: 6 horas o hasta la medianoche de Chile, lo que
 * llegue primero (mínimo 30 s).
 * @param {Date} [ahora]
 */
export function segundosDeCache(ahora = new Date()) {
  return Math.max(30, Math.min(SEIS_HORAS, segundosHastaMedianocheChile(ahora)));
}

/** @param {unknown} v */
export const valorUfValido = (v) => typeof v === 'number' && Number.isFinite(v) && v >= UF_MINIMA && v <= UF_MAXIMA;

/**
 * De una respuesta de mindicador.cl, el valor de la UF del día `hoy`, o null.
 * @param {any} json
 * @param {string} hoy  AAAA-MM-DD en Chile
 * @returns {number|null}
 */
export function ufDelDia(json, hoy) {
  const serie = json && Array.isArray(json.serie) ? json.serie : [];
  for (const d of serie) {
    if (!d || typeof d.fecha !== 'string') continue;
    const instante = new Date(d.fecha);
    if (Number.isNaN(instante.getTime())) continue;
    // mindicador.cl publica la fecha como la medianoche de Chile expresada en UTC.
    if (fechaChile(instante) !== hoy) continue;
    return valorUfValido(d.valor) ? d.valor : null;
  }
  return null;
}

/**
 * @typedef {{ estado: 'vigente', valor: number, fecha: string, fuente: string }} UfVigente
 * @typedef {{ estado: 'no-disponible', motivo: string }} UfNoDisponible
 */

/**
 * @param {string} url
 * @param {typeof fetch} traer
 * @param {number} espera
 */
async function pedirJson(url, traer, espera) {
  let r;
  try {
    r = await traer(url, { signal: AbortSignal.timeout(espera), headers: { accept: 'application/json', 'user-agent': 'ANVAR-IA/1.0 (+https://ia.anvartech.cl)' } });
  } catch (e) {
    throw new Error(e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError') ? 'tiempo-agotado' : 'sin-conexion', { cause: e });
  }
  if (!r.ok) throw new Error(`http-${r.status}`);
  const texto = await r.text();
  try { return JSON.parse(texto); } catch (e) { throw new Error('json-invalido', { cause: e }); }
}

/**
 * UF del día en Chile desde mindicador.cl, validada.
 * @param {{ ahora?: Date, traer?: typeof fetch, espera?: number }} [o]
 * @returns {Promise<UfVigente|UfNoDisponible>}
 */
export async function obtenerUf({ ahora = new Date(), traer = globalThis.fetch, espera = ESPERA_MS } = {}) {
  const hoy = fechaChile(ahora);
  const [a, m, d] = hoy.split('-');
  let motivo = 'sin-dato-del-dia';
  for (const url of [`${BASE}/${d}-${m}-${a}`, BASE]) {
    try {
      const valor = ufDelDia(await pedirJson(url, traer, espera), hoy);
      if (valor !== null) return { estado: 'vigente', valor, fecha: hoy, fuente: FUENTE };
      motivo = 'sin-dato-del-dia';
    } catch (e) {
      motivo = e instanceof Error ? e.message : 'error';
    }
  }
  return { estado: 'no-disponible', motivo };
}
