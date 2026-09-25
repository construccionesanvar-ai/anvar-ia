// @ts-check
// Adquisición orgánica: herramientas, recursos, soluciones, OG, IndexNow y UTM.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

import { SITIO } from '../src/config.mjs';
import { puntoPedido, PP_DEFECTO, NIVELES_SERVICIO } from '../src/componentes/herramientas.mjs';
import { RECURSOS, AUTOR, recurso } from '../src/datos/recursos.mjs';
import { SOLUCIONES } from '../src/datos/soluciones.mjs';
import { FUENTES } from '../src/datos/whatsapp.mjs';
import { rutaOg } from '../src/html.mjs';
import { PAGINAS } from '../scripts/build.mjs';
import { urlDeArchivo } from '../scripts/indexnow.mjs';
import { urlUtm, limpiarUtm } from '../scripts/utm.mjs';

const RUTAS = new Set(PAGINAS.map((p) => p.ruta));

test('punto de pedido: ejemplo publicado (d=20, σd=6, L=7, σL=1, 95%)', () => {
  const r = puntoPedido(PP_DEFECTO);
  assert.equal(r.durantePlazo, 140);
  // 1,645 × √(7·36 + 400·1) = 1,645 × √652 = 42,003… → 43
  assert.equal(r.seguridad, 43);
  assert.equal(r.punto, 183);
});

test('punto de pedido: sin variación no hay stock de seguridad; más servicio, más stock', () => {
  assert.equal(puntoPedido({ demanda: 10, desvDemanda: 0, plazo: 5, desvPlazo: 0, servicio: 95 }).seguridad, 0);
  const s = NIVELES_SERVICIO.map((n) => puntoPedido({ ...PP_DEFECTO, servicio: n.pct }).seguridad);
  for (let i = 1; i < s.length; i++) assert.ok(s[i] > s[i - 1], `nivel ${NIVELES_SERVICIO[i].pct}% debe pedir más stock`);
  // Un nivel no listado usa 95%, no rompe.
  assert.equal(puntoPedido({ ...PP_DEFECTO, servicio: 42 }).seguridad, 43);
});

test('punto de pedido: el navegador usa los mismos Z que el servidor', () => {
  const app = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
  for (const n of NIVELES_SERVICIO) assert.match(app, new RegExp(`'${n.pct}': ${n.z}`), `app.js sin Z para ${n.pct}%`);
});

test('recursos: rutas únicas, con página, fechas ISO y autor real', () => {
  const vistas = new Set();
  for (const r of RECURSOS) {
    assert.ok(!vistas.has(r.ruta), `ruta repetida ${r.ruta}`);
    vistas.add(r.ruta);
    assert.ok(RUTAS.has(r.ruta), `recurso sin página: ${r.ruta}`);
    assert.match(r.publicado, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(r.actualizado, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(r.actualizado >= r.publicado, `${r.ruta}: actualizado antes de publicado`);
    assert.ok(r.descripcion.length >= 60, `${r.ruta}: descripción corta`);
  }
  assert.ok(AUTOR.nombre && AUTOR.url, 'autor sin nombre o página');
  assert.throws(() => recurso('/no-existe'));
});

test('soluciones: cada landing existe y tiene su origen de lead', () => {
  const fuentes = new Set(Object.values(FUENTES));
  for (const s of SOLUCIONES) {
    assert.ok(RUTAS.has(s.ruta), `solución sin página: ${s.ruta}`);
    const p = PAGINAS.find((x) => x.ruta === s.ruta);
    assert.ok(p && fuentes.has(p.fuente), `${s.ruta} sin fuente de lead válida`);
  }
});

test('cada página tiene un origen de lead distinto (para atribuir WhatsApp y formularios)', () => {
  const indexables = PAGINAS.filter((p) => !p.noindex);
  const vistas = new Map();
  for (const p of indexables) {
    assert.ok(!vistas.has(p.fuente), `${p.ruta} repite la fuente "${p.fuente}" de ${vistas.get(p.fuente)}`);
    vistas.set(p.fuente, p.ruta);
  }
});

test('OG: ruta de imagen estable y archivo generado para cada página con og', () => {
  assert.equal(rutaOg('/'), '/og/inicio.png');
  assert.equal(rutaOg('/recursos/plantilla-roi-automatizacion'), '/og/recursos-plantilla-roi-automatizacion.png');
  for (const p of PAGINAS.filter((x) => x.og)) {
    assert.ok(p.og.titulo && p.og.bajada && p.og.etiqueta, `${p.ruta}: og incompleto`);
    assert.ok(existsSync(new URL('../public' + rutaOg(p.ruta), import.meta.url)), `falta ${rutaOg(p.ruta)} (npm run og)`);
  }
});

test('IndexNow: archivo → URL, y la clave publicada coincide', () => {
  assert.equal(urlDeArchivo('public/index.html'), SITIO.dominio + '/');
  assert.equal(urlDeArchivo('public/recursos/como-detectar-proceso-automatizable.html'), SITIO.dominio + '/recursos/como-detectar-proceso-automatizable');
  assert.equal(urlDeArchivo('public/styles.css'), null);
  assert.match(SITIO.indexnow.clave, /^[a-f0-9]{32}$/);
  const archivo = new URL(`../public/${SITIO.indexnow.clave}.txt`, import.meta.url);
  assert.equal(readFileSync(archivo, 'utf8').trim(), SITIO.indexnow.clave);
});

test('UTM: normaliza, valida la ruta y conserva el ancla', () => {
  assert.equal(limpiarUtm(' LinkedIn Página '), 'linkedin-pagina');
  const rutas = new Set(['/calculadora-roi-automatizacion']);
  assert.equal(urlUtm('/calculadora-roi-automatizacion#herramienta', 'LinkedIn', 'social', 'Lanzamiento ROI', rutas),
    `${SITIO.dominio}/calculadora-roi-automatizacion?utm_source=linkedin&utm_medium=social&utm_campaign=lanzamiento-roi#herramienta`);
  assert.throws(() => urlUtm('/no-existe', 'a', 'b', 'c', rutas));
  assert.throws(() => urlUtm('/calculadora-roi-automatizacion', 'a', '', 'c', rutas));
});

test('feed y llms.txt: generados, con los recursos y sin enlaces a páginas inexistentes', () => {
  const feed = readFileSync(new URL('../public/feed.xml', import.meta.url), 'utf8');
  const llms = readFileSync(new URL('../public/llms.txt', import.meta.url), 'utf8');
  assert.match(feed, /<rss version="2.0"/);
  for (const r of RECURSOS.filter((x) => x.enFeed)) assert.ok(feed.includes(SITIO.dominio + r.ruta), `feed sin ${r.ruta}`);
  assert.match(llms, /^# /m);
  for (const m of llms.matchAll(/\]\((https:\/\/ia\.anvartech\.cl[^)]*)\)/g)) {
    const ruta = m[1].replace(SITIO.dominio, '') || '/';
    if (!/\.(xml|txt|xlsx)$/.test(ruta)) assert.ok(RUTAS.has(ruta), `llms.txt enlaza ${ruta}, que no existe`);
  }
});
