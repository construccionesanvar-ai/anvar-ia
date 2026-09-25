// @ts-check
// Verificación post-deploy contra la web pública (no contra el build local).
//   node scripts/smoke.mjs                    → https://ia.anvartech.cl
//   node scripts/smoke.mjs --base <url>       → otro dominio (p. ej. un preview)
//   node scripts/smoke.mjs --sin-espera       → no espera a que el deploy termine
//
// 1. Espera a que producción sirva EXACTAMENTE el HTML de este commit (todas
//    las páginas del sitemap y el 404). Si el HTML es idéntico al que pasó
//    check.mjs y el E2E, lo que se probó en local es lo que ve la gente.
// 2. Revisa lo que solo existe en Vercel: redirecciones, cabeceras de
//    seguridad, noindex de /descargas, tipos de contenido, 404 real.
// 3. Revisa que cada imagen OG, el CSS, el JS y la plantilla XLSX respondan
//    con el mismo contenido que el repositorio.
// Lo corre .github/workflows/verificacion.yml después de cada push a main.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

import { SITIO } from '../src/config.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(RAIZ, 'public');
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null; };
const BASE = (arg('--base') || SITIO.dominio).replace(/\/$/, '');
const ESPERA_MIN = 12;

const locs = [...readFileSync(join(PUBLIC, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITIO.dominio, '') || '/');
const archivoDe = (ruta) => join(PUBLIC, ruta === '/' ? 'index.html' : ruta.slice(1) + '.html');
const sha = (b) => createHash('sha256').update(b).digest('hex').slice(0, 12);

/** @type {string[]} */ const fallas = [];
let revisadas = 0;
const ok = (cond, msg) => { revisadas++; if (!cond) fallas.push(msg); };

async function traer(ruta, opciones = {}) {
  const r = await fetch(BASE + ruta, { redirect: 'manual', headers: { 'cache-control': 'no-cache', 'user-agent': 'anvar-smoke/1.0' }, ...opciones });
  return r;
}

/** Espera a que todas las páginas del sitemap sirvan el HTML de este commit. */
async function esperarDeploy() {
  const fin = Date.now() + ESPERA_MIN * 60_000;
  let distintas = locs;
  while (Date.now() < fin) {
    const res = await Promise.all(locs.map(async (ruta) => {
      try {
        const r = await traer(ruta);
        return (r.status === 200 && (await r.text()) === readFileSync(archivoDe(ruta), 'utf8')) ? null : ruta;
      } catch { return ruta; }
    }));
    distintas = res.filter(Boolean);
    if (!distintas.length) return [];
    await new Promise((listo) => setTimeout(listo, 20_000));
  }
  return distintas;
}

if (!process.argv.includes('--sin-espera')) {
  console.log(`Esperando a que ${BASE} sirva el HTML de este commit (${locs.length} páginas)…`);
  const distintas = await esperarDeploy();
  ok(!distintas.length, `HTML distinto al del repositorio después de ${ESPERA_MIN} min: ${distintas.join(', ')}`);
  if (!distintas.length) console.log('  ✓ las páginas públicas son idénticas al build de este commit');
}

// Páginas: 200, HTML, cabeceras de seguridad, canonical y og:image que responden.
const imagenes = new Set();
for (const ruta of locs) {
  const r = await traer(ruta);
  const h = await r.text();
  ok(r.status === 200, `${ruta}: respondió ${r.status}`);
  ok((r.headers.get('content-type') || '').includes('text/html'), `${ruta}: content-type ${r.headers.get('content-type')}`);
  ok(!!r.headers.get('content-security-policy'), `${ruta}: sin Content-Security-Policy`);
  ok(r.headers.get('x-content-type-options') === 'nosniff', `${ruta}: sin X-Content-Type-Options`);
  // Los previews de Vercel llevan noindex a propósito; solo producción debe ser indexable.
  if (BASE === SITIO.dominio) ok(!/noindex/i.test(r.headers.get('x-robots-tag') || ''), `${ruta}: X-Robots-Tag noindex en una página indexable`);
  const canonical = (h.match(/rel="canonical" href="([^"]+)"/) || [])[1];
  ok(canonical === SITIO.dominio + ruta || (ruta === '/' && canonical === SITIO.dominio + '/'), `${ruta}: canonical ${canonical}`);
  const og = (h.match(/property="og:image" content="([^"]+)"/) || [])[1];
  if (og) imagenes.add(og.replace(SITIO.dominio, ''));
  for (const m of h.matchAll(/(?:href|src)="(\/(?:styles\.css|app\.js)\?v=[^"]+)"/g)) imagenes.add(m[1]);
}

// Archivos estáticos: mismo contenido que el repositorio.
imagenes.add('/descargas/plantilla-roi-automatizacion.xlsx');
imagenes.add('/logo-512.png');
for (const ruta of imagenes) {
  const r = await traer(ruta);
  const cuerpo = Buffer.from(await r.arrayBuffer());
  const local = join(PUBLIC, ruta.split('?')[0]);
  ok(r.status === 200, `${ruta}: respondió ${r.status}`);
  if (existsSync(local)) ok(sha(cuerpo) === sha(readFileSync(local)), `${ruta}: contenido distinto al del repositorio`);
}

// Descarga: se baja como archivo y no se indexa.
{
  const r = await traer('/descargas/plantilla-roi-automatizacion.xlsx');
  ok(/noindex/.test(r.headers.get('x-robots-tag') || ''), '/descargas: sin X-Robots-Tag noindex');
  ok(/attachment/.test(r.headers.get('content-disposition') || ''), '/descargas: sin Content-Disposition attachment');
}

// Archivos para buscadores.
for (const [ruta, tipo, contiene] of [
  ['/robots.txt', 'text/plain', 'Sitemap: https://ia.anvartech.cl/sitemap.xml'],
  ['/sitemap.xml', 'xml', '<urlset'],
  ['/feed.xml', 'application/rss+xml', '<rss'],
  ['/llms.txt', 'text/plain', '# ANVAR TECH'],
  [`/${SITIO.indexnow.clave}.txt`, 'text/plain', SITIO.indexnow.clave],
]) {
  const r = await traer(ruta);
  const t = await r.text();
  ok(r.status === 200, `${ruta}: respondió ${r.status}`);
  ok((r.headers.get('content-type') || '').includes(tipo), `${ruta}: content-type ${r.headers.get('content-type')}`);
  ok(t.includes(contiene), `${ruta}: no contiene "${contiene}"`);
}

// Redirecciones (vercel.json) y URL limpias.
const vercel = JSON.parse(readFileSync(join(RAIZ, 'vercel.json'), 'utf8'));
const redirecciones = [
  ...vercel.redirects.filter((/** @type {{source: string}} */ x) => !x.source.includes(':')).map((/** @type {{source: string, destination: string}} */ x) => [x.source, x.destination]),
  ['/casos.html', '/casos'],
  ['/recursos/', '/recursos'],
];
for (const [desde, hacia] of redirecciones) {
  const r = await traer(desde);
  const destino = (r.headers.get('location') || '').replace(BASE, '').replace(SITIO.dominio, '');
  ok([301, 308].includes(r.status) && destino === hacia, `${desde}: esperaba 301/308 → ${hacia}, llegó ${r.status} → ${destino || '(sin location)'}`);
}

// 404 real, con la página de ayuda.
{
  const r = await traer('/esta-pagina-no-existe-' + Date.now());
  const t = await r.text();
  ok(r.status === 404, `404: respondió ${r.status}`);
  ok(t === readFileSync(join(PUBLIC, '404.html'), 'utf8'), '404: el HTML no es el del repositorio');
}

console.log(`\n${revisadas} verificaciones contra ${BASE} · ${locs.length} páginas · ${imagenes.size} archivos estáticos`);
if (fallas.length) {
  console.log(`\n${fallas.length} fallas:\n  ` + fallas.join('\n  '));
  process.exit(1);
}
console.log('Todo en orden.');
