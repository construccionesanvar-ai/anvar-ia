// @ts-check
// UF del día (src/uf.mjs): fecha de Chile, validación, fallas de la fuente y
// conversión a pesos. Nunca sale a internet: la fuente se simula.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { obtenerUf, fechaChile, ufDelDia, segundosHastaMedianocheChile, segundosDeCache, valorUfValido } from '../src/uf.mjs';
import { ufAPesos, pesos } from '../src/calculo.mjs';

// 25/09/2026, 12:00 en Santiago (UTC−3 en septiembre).
const AHORA = new Date('2026-09-25T15:00:00Z');
const HOY = '2026-09-25';
/** mindicador.cl publica la fecha como la medianoche de Chile en UTC. */
const dia = (fecha, valor) => ({ fecha: `${fecha}T03:00:00.000Z`, valor });

/**
 * Fuente simulada: responde según la URL pedida.
 * @param {(url: string) => Response | Promise<Response>} fn
 */
function fuente(fn) {
  /** @type {string[]} */
  const urls = [];
  const traer = /** @type {typeof fetch} */ (async (url) => { urls.push(String(url)); return fn(String(url)); });
  return { traer, urls };
}
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });

test('fecha de Chile: usa America/Santiago, no UTC (cerca de la medianoche y con horario de invierno)', () => {
  assert.equal(fechaChile(new Date('2026-09-26T02:30:00Z')), '2026-09-25', '23:30 del 25 en Chile es el 26 en UTC');
  assert.equal(fechaChile(new Date('2026-09-26T03:30:00Z')), '2026-09-26');
  assert.equal(fechaChile(new Date('2026-06-15T03:30:00Z')), '2026-06-14', 'invierno: UTC−4');
  assert.equal(fechaChile(new Date('2026-06-15T04:30:00Z')), '2026-06-15');
});

test('caché: nunca pasa la medianoche de Chile', () => {
  assert.equal(segundosHastaMedianocheChile(new Date('2026-09-25T23:00:00Z')), 4 * 3600, '20:00 en Chile');
  assert.equal(segundosDeCache(new Date('2026-09-25T15:00:00Z')), 6 * 3600, 'a mediodía: 6 horas');
  assert.equal(segundosDeCache(new Date('2026-09-25T23:00:00Z')), 4 * 3600, 'a las 20:00: hasta medianoche');
  assert.equal(segundosDeCache(new Date('2026-09-26T02:59:30Z')), 30, 'a las 23:59:30: el mínimo');
});

test('caso 1: respuesta correcta con la UF de hoy → vigente, pidiendo la fecha de Chile', async () => {
  const f = fuente(() => json({ serie: [dia(HOY, 41016.28)] }));
  const uf = await obtenerUf({ ahora: AHORA, traer: f.traer });
  assert.deepEqual(uf, { estado: 'vigente', valor: 41016.28, fecha: HOY, fuente: 'mindicador.cl' });
  assert.equal(f.urls[0], 'https://mindicador.cl/api/uf/25-09-2026');
  // A las 23:30 del 25 en Chile (ya 26 en UTC) se pide el 25, no el 26.
  const g = fuente(() => json({ serie: [dia(HOY, 41016.28)] }));
  assert.equal((await obtenerUf({ ahora: new Date('2026-09-26T02:30:00Z'), traer: g.traer })).estado, 'vigente');
  assert.equal(g.urls[0], 'https://mindicador.cl/api/uf/25-09-2026');
});

test('si la consulta por fecha no trae el día, se busca exactamente hoy en la serie', async () => {
  const f = fuente((url) => (url.endsWith('/uf') ? json({ serie: [dia('2026-09-26', 41020.1), dia(HOY, 41016.28), dia('2026-09-24', 41012.5)] }) : json({ serie: [] })));
  const uf = await obtenerUf({ ahora: AHORA, traer: f.traer });
  assert.equal(uf.estado, 'vigente');
  assert.equal(/** @type {any} */ (uf).valor, 41016.28, 'el de hoy, no el de mañana ni el de ayer');
  assert.deepEqual(f.urls, ['https://mindicador.cl/api/uf/25-09-2026', 'https://mindicador.cl/api/uf']);
});

test('caso 2: la fuente responde 500 → no disponible', async () => {
  const uf = await obtenerUf({ ahora: AHORA, traer: fuente(() => json({ error: 'x' }, 500)).traer });
  assert.deepEqual(uf, { estado: 'no-disponible', motivo: 'http-500' });
});

test('caso 3: la fuente no responde a tiempo → no disponible, sin esperar de más', async () => {
  const lenta = /** @type {typeof fetch} */ ((_url, init) => new Promise((_ok, falla) => {
    init?.signal?.addEventListener('abort', () => falla(init.signal?.reason));
  }));
  // Un fetch real mantiene vivo el proceso mientras espera; el simulado no, y el
  // temporizador de AbortSignal.timeout no lo hace por sí solo.
  const vivo = setInterval(() => {}, 1000);
  const t0 = Date.now();
  const uf = await obtenerUf({ ahora: AHORA, traer: lenta, espera: 50 }).finally(() => clearInterval(vivo));
  assert.deepEqual(uf, { estado: 'no-disponible', motivo: 'tiempo-agotado' });
  assert.ok(Date.now() - t0 < 1000, 'dos consultas de 50 ms no pueden tardar un segundo');
});

test('sin conexión → no disponible', async () => {
  const uf = await obtenerUf({ ahora: AHORA, traer: /** @type {typeof fetch} */ (async () => { throw new TypeError('fetch failed'); }) });
  assert.deepEqual(uf, { estado: 'no-disponible', motivo: 'sin-conexion' });
});

test('caso 4: JSON inválido → no disponible', async () => {
  const uf = await obtenerUf({ ahora: AHORA, traer: fuente(() => new Response('<html>mantención</html>')).traer });
  assert.deepEqual(uf, { estado: 'no-disponible', motivo: 'json-invalido' });
});

test('caso 5: valores inválidos (0, NaN, 999, 900.000.000, texto, negativo) → no disponible', async () => {
  for (const valor of [0, null, 'NaN', 999, 900_000_000, '41016.28', -41016.28]) {
    const uf = await obtenerUf({ ahora: AHORA, traer: fuente(() => json({ serie: [dia(HOY, valor)] })).traer });
    assert.equal(uf.estado, 'no-disponible', `valor ${valor}`);
  }
  assert.ok(valorUfValido(41016.28) && valorUfValido(10_000) && !valorUfValido(9_999) && !valorUfValido(Number.NaN) && !valorUfValido(Infinity));
});

test('caso 6: solo hay una UF antigua (o futura) → no disponible; nunca se muestra como la de hoy', async () => {
  for (const serie of [[dia('2026-09-24', 41012.5)], [dia('2026-09-26', 41020.1)], [dia('2025-09-25', 39000)], []]) {
    const uf = await obtenerUf({ ahora: AHORA, traer: fuente(() => json({ serie })).traer });
    assert.deepEqual(uf, { estado: 'no-disponible', motivo: 'sin-dato-del-dia' }, JSON.stringify(serie));
  }
  assert.equal(ufDelDia({ serie: [{ fecha: 'no es fecha', valor: 41000 }] }, HOY), null);
  assert.equal(ufDelDia(null, HOY), null);
  assert.equal(ufDelDia({ serie: 'x' }, HOY), null);
});

test('caso 7: UF × cantidad en pesos, redondeado al peso y con formato chileno', () => {
  assert.equal(ufAPesos(40, 41016.28), 1_640_651);
  assert.equal(pesos(ufAPesos(40, 41016.28)), '$1.640.651');
  assert.equal(pesos(ufAPesos(12, 41016.28)), '$492.195');
  assert.equal(pesos(ufAPesos(6, 41016.28)), '$246.098');
  assert.equal(ufAPesos(1, 41016.5), 41_017, 'medio peso redondea hacia arriba');
  for (const sinUf of [null, undefined, 0, -1, Number.NaN, Infinity]) assert.equal(ufAPesos(40, /** @type {any} */ (sinUf)), null, `UF ${sinUf}`);
});
