// @ts-check
// Funciones de /api con fetch simulado: nunca salen a internet.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fechaChile, segundosHastaMedianocheChile } from '../src/uf.mjs';

const fetchReal = globalThis.fetch;
let n = 0;

/** Importa una instancia nueva del módulo con estas variables de entorno. */
async function cargar(archivo, env) {
  const previas = {};
  for (const k of ['RESEND_API_KEY', 'NOTIFY_EMAIL', 'NOTIFY_MAIL', 'SHEETS_WEBHOOK_URL', 'ANTHROPIC_API_KEY', 'CONTACTO_FROM']) {
    previas[k] = process.env[k];
    if (k in env) process.env[k] = env[k]; else delete process.env[k];
  }
  const mod = await import(`../api/${archivo}?v=${++n}`);
  for (const [k, v] of Object.entries(previas)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  return mod.default;
}

function peticion({ method = 'POST', body = {}, headers = {} } = {}) {
  return { method, body, headers: { host: 'ia.anvartech.cl', 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${++n % 250}`, ...headers } };
}
function respuesta() {
  const r = { statusCode: 0, headers: {}, cuerpo: /** @type {any} */ (null) };
  const res = {
    status(c) { r.statusCode = c; return res; },
    json(o) { r.cuerpo = o; return res; },
    send(t) { r.cuerpo = t; return res; },
    setHeader(k, v) { r.headers[k.toLowerCase()] = v; },
  };
  return { res, r };
}
const valido = () => ({ nombre: 'Ana Soto', empresa: 'Acme', contacto: 'ana@acme.cl', tipo: 'express', mensaje: 'Informe semanal', fuente: 'express', origen: '/automatizacion-express', t: String(Date.now() - 60_000) });

test('contacto: solo POST', async () => {
  const h = await cargar('contacto.js', {});
  const { res, r } = respuesta();
  await h(peticion({ method: 'GET' }), res);
  assert.equal(r.statusCode, 405);
});

test('contacto: valida nombre y forma de contacto', async () => {
  const h = await cargar('contacto.js', { RESEND_API_KEY: 'x' });
  /** @type {[Record<string, string>, RegExp][]} */
  const casos = [[{ ...valido(), nombre: '' }, /nombre/], [{ ...valido(), contacto: 'hola' }, /WhatsApp|correo/]];
  for (const [body, re] of casos) {
    const { res, r } = respuesta();
    await h(peticion({ body }), res);
    assert.equal(r.statusCode, 400);
    assert.match(r.cuerpo.error, re);
  }
});

test('contacto: sin configuración responde 503 (el sitio ofrece WhatsApp)', async () => {
  const h = await cargar('contacto.js', {});
  const { res, r } = respuesta();
  await h(peticion({ body: valido() }), res);
  assert.equal(r.statusCode, 503);
});

test('contacto: trampa y tiempo mínimo descartan bots sin enviar nada', async () => {
  const h = await cargar('contacto.js', { RESEND_API_KEY: 'x' });
  let llamadas = 0;
  globalThis.fetch = /** @type {any} */ (async () => { llamadas++; return new Response('{}'); });
  try {
    for (const body of [{ ...valido(), web: 'http://spam' }, { ...valido(), t: String(Date.now()) }]) {
      const { res, r } = respuesta();
      await h(peticion({ body }), res);
      assert.equal(r.statusCode, 200);
    }
    assert.equal(llamadas, 0);
  } finally { globalThis.fetch = fetchReal; }
});

test('contacto: otro origen se rechaza', async () => {
  const h = await cargar('contacto.js', { RESEND_API_KEY: 'x' });
  const { res, r } = respuesta();
  await h(peticion({ body: valido(), headers: { origin: 'https://otro-sitio.com' } }), res);
  assert.equal(r.statusCode, 403);
});

test('contacto: el correo llega a NOTIFY_MAIL con página, fuente y reply-to', async () => {
  const h = await cargar('contacto.js', { RESEND_API_KEY: 'x', NOTIFY_MAIL: 'dueno@example.com' });
  /** @type {any} */ let enviado = null;
  globalThis.fetch = /** @type {any} */ (async (url, o) => { enviado = { url: String(url), body: JSON.parse(o.body) }; return new Response('{"id":"1"}', { status: 200 }); });
  try {
    const { res, r } = respuesta();
    await h(peticion({ body: valido(), headers: { origin: 'https://ia.anvartech.cl' } }), res);
    assert.equal(r.statusCode, 200);
    assert.equal(enviado.url, 'https://api.resend.com/emails');
    assert.deepEqual(enviado.body.to, ['dueno@example.com']);
    assert.equal(enviado.body.reply_to, 'ana@acme.cl');
    assert.match(enviado.body.subject, /^Nuevo lead · Automatización Express · Ana Soto \(Acme\)$/);
    assert.match(enviado.body.text, /Fuente: express/);
    assert.match(enviado.body.text, /Problema:\nInforme semanal/);
    assert.match(enviado.body.html, /NUEVO LEAD · AUTOMATIZACIÓN EXPRESS/);
  } finally { globalThis.fetch = fetchReal; }
});

test('contacto: si el correo falla pero el CRM guardó el lead, no se pierde', async () => {
  const h = await cargar('contacto.js', { RESEND_API_KEY: 'x', SHEETS_WEBHOOK_URL: 'https://sheets.example/hook' });
  globalThis.fetch = /** @type {any} */ (async (url) => new Response('{}', { status: String(url).includes('resend') ? 500 : 200 }));
  const errorReal = console.error;
  console.error = () => {};
  try {
    const { res, r } = respuesta();
    await h(peticion({ body: { ...valido(), contacto: '+56 9 1234 5678' } }), res);
    assert.equal(r.statusCode, 200);
  } finally { globalThis.fetch = fetchReal; console.error = errorReal; }
});

test('contacto: Resend caído y sin CRM → 502 (el sitio ofrece WhatsApp con el mensaje escrito)', async () => {
  const h = await cargar('contacto.js', { RESEND_API_KEY: 'x' });
  globalThis.fetch = /** @type {any} */ (async () => new Response('{"message":"internal"}', { status: 500 }));
  const errorReal = console.error;
  const registros = [];
  console.error = (...a) => registros.push(a.join(' '));
  try {
    const { res, r } = respuesta();
    await h(peticion({ body: valido() }), res);
    assert.equal(r.statusCode, 502);
    assert.deepEqual(r.cuerpo, { error: 'No se pudo enviar.' });
    assert.ok(registros.length && !registros.join(' ').includes('Ana') && !registros.join(' ').includes('acme'), 'el registro no lleva datos personales');
  } finally { globalThis.fetch = fetchReal; console.error = errorReal; }
});

test('contacto: límite de envíos por IP', async () => {
  const h = await cargar('contacto.js', { RESEND_API_KEY: 'x' });
  globalThis.fetch = /** @type {any} */ (async () => new Response('{}', { status: 200 }));
  try {
    const estados = [];
    for (let i = 0; i < 7; i++) {
      const { res, r } = respuesta();
      await h(peticion({ body: valido(), headers: { 'x-forwarded-for': '9.9.9.9' } }), res);
      estados.push(r.statusCode);
    }
    assert.deepEqual(estados, [200, 200, 200, 200, 200, 429, 429]);
  } finally { globalThis.fetch = fetchReal; }
});

// La UF de hoy en Chile, para que las pruebas no dependan de la fecha en que corren.
const hoyChile = fechaChile();
const serieDeHoy = (valor) => ({ serie: [{ fecha: `${hoyChile}T12:00:00.000Z`, valor }] });

test('uf: la UF de hoy desde mindicador.cl, sin clave, cacheada hasta 6 h y nunca más allá de la medianoche de Chile', async () => {
  const h = await cargar('uf.js', {});
  const urls = [];
  globalThis.fetch = /** @type {any} */ (async (url) => { urls.push(String(url)); return new Response(JSON.stringify(serieDeHoy(41016.28))); });
  try {
    const { res, r } = respuesta();
    await h({ method: 'GET', headers: {} }, res);
    assert.equal(r.statusCode, 200);
    assert.deepEqual(r.cuerpo, { estado: 'vigente', valor: 41016.28, fecha: hoyChile, fuente: 'mindicador.cl' });
    const ttl = Number((r.headers['cache-control'].match(/s-maxage=(\d+)/) || [])[1]);
    assert.ok(ttl >= 30 && ttl <= 21600 && ttl <= segundosHastaMedianocheChile() + 1, `s-maxage ${ttl}`);
    assert.doesNotMatch(r.headers['cache-control'], /stale-while-revalidate/, 'sin servir la UF de ayer mientras se renueva');
    assert.match(urls[0], /^https:\/\/mindicador\.cl\/api\/uf\/\d{2}-\d{2}-\d{4}$/);
    // Segunda visita: sale de la memoria, sin consultar de nuevo.
    await h({ method: 'GET', headers: {} }, respuesta().res);
    assert.equal(urls.length, 1);
  } finally { globalThis.fetch = fetchReal; }
});

test('uf: sin UF de hoy (valor absurdo, fecha vieja o fuente caída) → no disponible, sin valor de respaldo', async () => {
  const avisoReal = console.warn;
  console.warn = () => {};
  const casos = [
    async () => new Response(JSON.stringify(serieDeHoy(12))),
    async () => new Response(JSON.stringify({ serie: [{ fecha: '2020-01-01T03:00:00.000Z', valor: 28310.86 }] })),
    async () => new Response('error', { status: 500 }),
    async () => { throw new TypeError('fetch failed'); },
  ];
  try {
    for (const simulada of casos) {
      const h = await cargar('uf.js', {});
      globalThis.fetch = /** @type {any} */ (simulada);
      const { res, r } = respuesta();
      await h({ method: 'GET', headers: {} }, res);
      assert.equal(r.statusCode, 200);
      assert.deepEqual(r.cuerpo, { estado: 'no-disponible' });
      assert.match(r.headers['cache-control'], /s-maxage=([1-9]|[1-9]\d|[12]\d\d|300)$/, 'la falla se guarda como máximo 5 minutos');
    }
  } finally { globalThis.fetch = fetchReal; console.warn = avisoReal; }
});

test('diagnóstico: sin clave de IA responde 503 sin romper', async () => {
  const h = await cargar('diagnostico.js', {});
  const { res, r } = respuesta();
  await h(peticion({ body: { indice: 50 } }), res);
  assert.equal(r.statusCode, 503);
});
