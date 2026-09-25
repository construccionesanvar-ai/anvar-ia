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
import { huellaContenido } from '../scripts/huella.mjs';
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

test('el navegador usa el mismo código de cálculo que el servidor (calculo.js generado)', () => {
  const js = readFileSync(new URL('../public/calculo.js', import.meta.url), 'utf8');
  const fuente = readFileSync(new URL('../src/calculo.mjs', import.meta.url), 'utf8');
  assert.match(js, /^\/\* GENERADO/);
  // Cada línea de código de la fuente (sin "export") está en el archivo del navegador.
  for (const l of fuente.split('\n').filter((x) => x.trim() && !x.startsWith('// @ts-check'))) {
    assert.ok(js.includes(l.replace(/^export /, '').trim()), `calculo.js desactualizado: falta "${l.trim().slice(0, 60)}" (npm run build)`);
  }
  // Y lo evalúa igual: mismo resultado con el ejemplo.
  const ctx = { window: {} };
  new Function('window', js)(ctx.window);
  const K = /** @type {any} */ (ctx.window).ANVAR_CALCULO;
  assert.equal(K.puntoPedido(PP_DEFECTO).punto, puntoPedido(PP_DEFECTO).punto);
  assert.equal(K.roi({ personas: 5, horasSemana: 6, costoHora: 9000, pctAutomatizable: 60, inversion: 1640000 }).ahorroNetoAno1, 5488000);
  assert.equal(NIVELES_SERVICIO.length, K.NIVELES_SERVICIO.length);
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

test('contacto según la página: formulario completo en comerciales, plegado en editoriales y herramientas', () => {
  const html = (/** @type {string} */ f) => readFileSync(new URL(`../public/${f}.html`, import.meta.url), 'utf8');
  const MODOS = {
    completo: ['index', 'automatizacion-express', 'diagnostico-ia-empresas', 'automatizacion-procesos-ia', 'inteligencia-datos',
      'capacitacion-ia-empresas', 'automatizacion-procesos-pymes', 'automatizacion-documental', 'automatizar-excel',
      'automatizar-cotizaciones', 'automatizacion-autocad'],
    compacto: ['recursos', 'casos', 'casos/automatizacion-documental-retail', 'equipo/andres-vargas',
      ...RECURSOS.filter((r) => r.ruta.startsWith('/recursos/')).map((r) => r.ruta.slice(1))],
    herramienta: ['calculadora-roi-automatizacion', 'diagnostico-automatizacion', 'herramientas/punto-de-pedido'],
  };
  for (const [modo, archivos] of Object.entries(MODOS)) {
    for (const f of archivos) {
      const h = html(f);
      assert.equal((h.match(/id="form-contacto"/g) || []).length, 1, `${f}: un solo formulario`);
      const plegado = /<details class="form-desplegable">[\s\S]*id="form-contacto"[\s\S]*<\/details>/.test(h);
      if (modo === 'completo') assert.ok(!plegado, `${f}: página comercial con el formulario plegado`);
      else {
        assert.ok(plegado, `${f}: el formulario debería estar plegado`);
        const resumen = modo === 'compacto' ? 'Prefiero que me contacten' : 'Prefiero dejar mis datos';
        assert.ok(h.includes(`<summary><span>${resumen}</span>`), `${f}: texto del desplegable`);
        if (modo === 'compacto') assert.match(h, /data-wsp="[a-z]+" data-track-label="evaluar-compacto"/, `${f}: sin WhatsApp a la vista`);
      }
    }
  }
});

test('huella de contenido: espacios, plantilla y texto para lectores no cuentan; el contenido sí', () => {
  const pag = (/** @type {string} */ main, titulo = 'Título') => `<html><head><title>${titulo}</title><meta name="description" content="D"><link rel="canonical" href="https://x/a"></head><body><header>Cabecera</header><main>${main}</main><footer>Pie</footer></body></html>`;
  const base = huellaContenido(pag('<p><b>C-01</b><span>Proyecto propio</span></p>'));
  assert.equal(huellaContenido(pag('<p>\n<b>C-01</b> <span>Proyecto propio</span></p>')), base, 'espacios');
  assert.equal(huellaContenido(pag('<p><b>C-01<span class="sr">:</span></b> <span>Proyecto propio</span></p>')), base, 'texto .sr');
  assert.equal(huellaContenido(pag('<p><b>C-01</b><span>Proyecto propio</span></p>').replace('Cabecera', 'Otra cabecera')), base, 'cabecera');
  assert.notEqual(huellaContenido(pag('<p><b>C-01</b><span>Cliente confidencial</span></p>')), base, 'texto de main');
  assert.notEqual(huellaContenido(pag('<p><b>C-01</b><span>Proyecto propio</span></p>', 'Otro título')), base, 'title');
});

test('JSON-LD de cada página: se puede leer, cada entidad una vez y ningún @id colgando', () => {
  for (const p of PAGINAS.filter((x) => !x.noindex)) {
    const h = readFileSync(new URL(`../public/${p.archivo}`, import.meta.url), 'utf8');
    const bloque = h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(bloque, `${p.ruta}: sin JSON-LD`);
    const nodos = [];
    const recorrer = (/** @type {any} */ x) => { if (Array.isArray(x)) x.forEach(recorrer); else if (x && typeof x === 'object') { nodos.push(x); Object.values(x).forEach(recorrer); } };
    recorrer(JSON.parse(bloque[1]));
    const definidos = nodos.filter((n) => n['@id'] && n['@type']).map((n) => n['@id']);
    assert.equal(new Set(definidos).size, definidos.length, `${p.ruta}: entidades repetidas`);
    for (const n of nodos) if (n['@id'] && !n['@type']) assert.ok(definidos.includes(n['@id']), `${p.ruta}: @id colgando ${n['@id']}`);
    for (const n of nodos) if (n.legalName) assert.equal(n.legalName, SITIO.empresa.razonSocial);
  }
});
