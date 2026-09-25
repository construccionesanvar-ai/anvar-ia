// @ts-check
// Revisión de SEO técnico contra un sitio servido (por defecto, producción).
// Sin dependencias: lee el HTML que entrega el servidor, como lo haría un buscador.
//
//   node scripts/seo-check.mjs                          contra https://ia.anvartech.cl
//   node scripts/seo-check.mjs --base http://127.0.0.1:8123
//   node scripts/seo-check.mjs --reporte seo-check.md   además, guarda el reporte
//
// Revisa:
//  - robots.txt: 200, texto, no bloquea páginas públicas, declara el sitemap.
//  - sitemap.xml: 200, XML válido, URL absolutas del dominio, sin /api ni 404,
//    y las mismas rutas indexables que genera el build (ni faltantes ni sobrantes).
//  - Cada URL del sitemap: 200 sin redirección, <title>, description, un solo
//    canonical que apunta a sí misma (https, host correcto, sin parámetros),
//    robots sin noindex, un solo <h1> y JSON-LD que se puede leer, sin @id
//    colgando ni nodos duplicados, con la razón social de config y enlaces
//    internos (logo, imágenes, autor, migas) que existen.
// Sale con código 1 si hay errores. No cambia nada.
import { writeFileSync } from 'node:fs';

import { SITIO } from '../src/config.mjs';
import { PAGINAS } from './build.mjs';

const arg = (/** @type {string} */ n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null; };
const BASE = (arg('--base') || SITIO.dominio).replace(/\/$/, '');
const DOMINIO = SITIO.dominio;
const HOST = new URL(DOMINIO).host;

/** @type {{ url: string, problema: string }[]} */
const errores = [];
const err = (/** @type {string} */ url, /** @type {string} */ problema) => errores.push({ url, problema });

/** @param {string} ruta */
async function traer(ruta) {
  const url = ruta.startsWith('http') ? ruta.replace(DOMINIO, BASE) : BASE + ruta;
  const r = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'anvar-seo-check/1.0', 'cache-control': 'no-cache' } });
  return { status: r.status, tipo: r.headers.get('content-type') || '', location: r.headers.get('location') || '', texto: await r.text() };
}

const uno = (/** @type {string} */ html, /** @type {RegExp} */ re) => (html.match(re) || [])[1];
const todos = (/** @type {string} */ html, /** @type {RegExp} */ re) => [...html.matchAll(re)].map((m) => m[1]);
const decodificar = (/** @type {string} */ s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// ------------------------------------------------------------------ robots.txt
const robots = await traer('/robots.txt');
if (robots.status !== 200) err('/robots.txt', `respondió ${robots.status}`);
if (!robots.tipo.startsWith('text/plain')) err('/robots.txt', `content-type ${robots.tipo}`);
const bloqueos = todos(robots.texto, /^Disallow:\s*(\S+)\s*$/gim);
if (!new RegExp(`^Sitemap:\\s*${DOMINIO.replace(/\./g, '\\.')}/sitemap\\.xml\\s*$`, 'm').test(robots.texto)) err('/robots.txt', 'no declara el sitemap');

// ----------------------------------------------------------------- sitemap.xml
const sm = await traer('/sitemap.xml');
if (sm.status !== 200) err('/sitemap.xml', `respondió ${sm.status}`);
if (!/xml/.test(sm.tipo)) err('/sitemap.xml', `content-type ${sm.tipo}`);
if (!/^<\?xml [^>]*\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">[\s\S]*<\/urlset>\s*$/.test(sm.texto)) err('/sitemap.xml', 'no es un urlset válido');
const bloquesUrl = sm.texto.match(/<url>[\s\S]*?<\/url>/g) || [];
if (bloquesUrl.length !== (sm.texto.match(/<url>/g) || []).length) err('/sitemap.xml', 'etiquetas <url> sin cerrar');
const locs = todos(sm.texto, /<loc>([^<]+)<\/loc>/g);
if (new Set(locs).size !== locs.length) err('/sitemap.xml', 'URL repetidas');
for (const b of bloquesUrl) if (!/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(b)) err('/sitemap.xml', `lastmod inválido en ${uno(b, /<loc>([^<]+)</)}`);

const indexables = PAGINAS.filter((p) => !p.noindex && p.enSitemap !== false).map((p) => DOMINIO + (p.ruta === '/' ? '/' : p.ruta));
for (const u of indexables) if (!locs.includes(u)) err(u, 'página indexable que falta en el sitemap');
for (const u of locs) {
  if (!indexables.includes(u)) err(u, 'en el sitemap pero no es una página indexable del build');
  const { host, protocol, search, hash, pathname } = new URL(u);
  if (protocol !== 'https:' || host !== HOST || search || hash) err(u, 'URL del sitemap no canónica (https, host, sin parámetros)');
  if (/^\/api\/|^\/404|\.html$/.test(pathname)) err(u, 'URL privada o técnica en el sitemap');
  for (const d of bloqueos) if (pathname.startsWith(d)) err(u, `bloqueada por robots.txt (Disallow: ${d})`);
}

// ------------------------------------------------------------- cada página
const existentes = new Map(); // url → status, para enlaces internos del JSON-LD
/** @type {{ ruta: string, status: number, title: string, desc: string, canonical: string, robots: string, h1: number, ld: string }[]} */
const filas = [];

for (const u of locs) {
  const ruta = new URL(u).pathname;
  const r = await traer(u);
  existentes.set(u, r.status);
  const h = r.texto;
  const titulo = decodificar(uno(h, /<title>([^<]*)<\/title>/) || '');
  const desc = decodificar(uno(h, /<meta name="description" content="([^"]*)"/) || '');
  const canonicals = todos(h, /<link rel="canonical" href="([^"]*)"/g);
  const robotsMeta = uno(h, /<meta name="robots" content="([^"]*)"/) || '';
  const h1 = (h.match(/<h1[\s>]/g) || []).length;

  if (r.status !== 200) err(u, `respondió ${r.status}${r.location ? ' → ' + r.location : ''}`);
  if (!titulo) err(u, 'sin <title>');
  else if (titulo.length > 70) err(u, `title de ${titulo.length} caracteres (se corta en resultados)`);
  if (!desc) err(u, 'sin meta description');
  else if (desc.length < 70 || desc.length > 170) err(u, `description de ${desc.length} caracteres`);
  if (canonicals.length !== 1) err(u, `${canonicals.length} canonical (debe haber 1)`);
  else if (canonicals[0] !== u) err(u, `canonical apunta a ${canonicals[0]}`);
  if (/noindex/i.test(robotsMeta)) err(u, `meta robots "${robotsMeta}"`);
  if (h1 !== 1) err(u, `${h1} <h1> (debe haber 1)`);

  // JSON-LD: se puede leer, @id sin colgar, razón social y enlaces internos.
  const bloques = todos(h, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  let ldEstado = bloques.length ? 'ok' : 'sin JSON-LD';
  for (const b of bloques) {
    let datos;
    try { datos = JSON.parse(b); } catch (e) { err(u, `JSON-LD inválido: ${e instanceof Error ? e.message : e}`); ldEstado = 'inválido'; continue; }
    const nodos = [];
    const recorrer = (/** @type {any} */ x) => {
      if (Array.isArray(x)) return x.forEach(recorrer);
      if (x && typeof x === 'object') { nodos.push(x); Object.values(x).forEach(recorrer); }
    };
    recorrer(datos);
    const conTipo = nodos.filter((n) => n['@id'] && n['@type']).map((n) => n['@id']);
    const definidos = new Set(conTipo);
    for (const id of definidos) if (conTipo.filter((x) => x === id).length > 1) err(u, `JSON-LD: nodo duplicado ${id}`);
    for (const n of nodos) {
      if (n['@id'] && !n['@type'] && Object.keys(n).length === 1 && !definidos.has(n['@id'])) err(u, `JSON-LD: @id sin definir en la página: ${n['@id']}`);
      if (n['@type'] === 'Organization' || (Array.isArray(n['@type']) && n['@type'].includes('Organization')) || n['@type'] === 'ProfessionalService') {
        if (n.legalName && n.legalName !== SITIO.empresa.razonSocial) err(u, `JSON-LD: legalName "${n.legalName}" ≠ ${SITIO.empresa.razonSocial}`);
      }
      if (/SpA/.test(String(n.name || '')) && n.name !== SITIO.empresa.razonSocial) err(u, `JSON-LD: nombre de sociedad "${n.name}"`);
      for (const k of ['url', 'logo', 'image', 'item']) {
        const v = typeof n[k] === 'string' ? n[k] : (n[k] && typeof n[k].url === 'string' ? n[k].url : null);
        if (v && v.startsWith(DOMINIO)) existentes.has(v.split('#')[0]) || existentes.set(v.split('#')[0], null);
      }
    }
  }
  filas.push({ ruta, status: r.status, title: `${titulo.length}`, desc: `${desc.length}`, canonical: canonicals[0] === u ? 'propia' : (canonicals[0] || '—'), robots: robotsMeta.replace(/, max-image-preview:large/, ''), h1, ld: ldEstado });
}

// Enlaces internos del JSON-LD (logo, imágenes, url de Person, migas) que no son páginas del sitemap.
for (const [url, status] of existentes) {
  if (status !== null) continue;
  const r = await traer(url);
  if (r.status !== 200) err(url, `enlazada desde JSON-LD y respondió ${r.status}`);
}

// ------------------------------------------------------------------ reporte
const tabla = ['| Ruta | HTTP | Title | Description | Canonical | Robots | H1 | JSON-LD |', '|---|---|---|---|---|---|---|---|',
  ...filas.map((f) => `| \`${f.ruta}\` | ${f.status} | ${f.title} car. | ${f.desc} car. | ${f.canonical} | ${f.robots} | ${f.h1} | ${f.ld} |`)].join('\n');
const reporte = `# SEO técnico · ${BASE}

Revisado: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC

- robots.txt: ${robots.status}, ${bloqueos.length ? 'bloquea ' + bloqueos.join(', ') : 'no bloquea nada'}, sitemap declarado
- sitemap.xml: ${sm.status}, ${locs.length} URL (build: ${indexables.length} indexables)

${tabla}

${errores.length ? `## Problemas (${errores.length})\n\n${errores.map((e) => `- \`${e.url}\`: ${e.problema}`).join('\n')}` : 'Sin problemas.'}
`;
console.log(reporte);
const destino = arg('--reporte');
if (destino) writeFileSync(destino, reporte, 'utf8');
if (errores.length) process.exit(1);
