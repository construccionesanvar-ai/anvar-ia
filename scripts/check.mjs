// @ts-check
// Control de calidad del sitio generado. Sin dependencias.
//   npm run check
// Revisa SEO, enlaces internos, accesibilidad básica, reglas del sitio
// (CSP, precios) y la configuración de Vercel. Sale con código 1 si hay errores.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(RAIZ, 'public');
const errores = [];
const avisos = [];
const err = (f, m) => errores.push(`${f}: ${m}`);
const aviso = (f, m) => avisos.push(`${f}: ${m}`);

const paginas = readdirSync(PUBLIC).filter((f) => f.endsWith('.html') && !f.startsWith('google'));
const rutas = new Map(paginas.map((f) => [f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, ''), f]));
const htmls = Object.fromEntries(paginas.map((f) => [f, readFileSync(join(PUBLIC, f), 'utf8')]));
const ids = Object.fromEntries(paginas.map((f) => [f, new Set([...htmls[f].matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
const texto = (html) => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

for (const f of paginas) {
  const h = htmls[f];
  const noindex = /name="robots" content="noindex/.test(h);

  // SEO
  const titulo = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (!titulo) err(f, 'sin <title>');
  else if (titulo.length > 70) aviso(f, `título largo (${titulo.length} caracteres)`);
  const desc = (h.match(/name="description" content="([^"]*)"/) || [])[1] || '';
  if (!desc) err(f, 'sin meta description');
  else if (!noindex && (desc.length < 70 || desc.length > 165)) aviso(f, `descripción de ${desc.length} caracteres (ideal 120-160)`);
  if (!noindex && !/rel="canonical" href="https:\/\/ia\.anvartech\.cl[^"]*"/.test(h)) err(f, 'sin canonical absoluta');
  if (!/property="og:image"/.test(h)) err(f, 'sin og:image');
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(f, `tiene ${h1} <h1> (debe ser 1)`);
  if (!/<html lang="es/.test(h)) err(f, 'sin lang en <html>');

  // Datos estructurados válidos
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { err(f, 'JSON-LD inválido: ' + e.message); }
  }
  try { JSON.parse((h.match(/<script type="application\/json" id="config">([\s\S]*?)<\/script>/) || [])[1] || '{}'); } catch (e) { err(f, 'config del cliente inválida'); }

  // Reglas del sitio
  if (/\sstyle="/.test(h)) err(f, 'atributo style="" (el CSP lo bloquea: usa una clase)');
  if (/<script(?![^>]*\s(?:src|type="application\/(?:ld\+)?json"))[^>]*>/.test(h)) err(f, 'script en línea (el CSP solo permite archivos)');
  if (/desde UF 28\b/.test(texto(h))) err(f, '"desde UF 28" como precio del piloto (el piloto es desde UF 40)');
  if (/más elegido/i.test(texto(h))) err(f, 'afirmación "el más elegido" sin respaldo');
  if (/no vengo del mundo del software/i.test(texto(h))) err(f, 'frase de posicionamiento descartada');

  // Accesibilidad básica
  for (const m of h.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) err(f, 'imagen sin alt: ' + m[0].slice(0, 60));
  for (const m of h.matchAll(/<input\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
    if (/type="hidden"/.test(m[0])) continue;
    if (!new RegExp(`<label[^>]*for="${m[1]}"`).test(h)) err(f, `input #${m[1]} sin <label>`);
  }
  for (const m of h.matchAll(/target="_blank"(?![^>]*rel="noopener)/g)) err(f, 'target="_blank" sin rel="noopener"');

  // Enlaces internos: la página y el ancla tienen que existir
  for (const m of h.matchAll(/href="(\/[^"#?]*|)(#[^"]*)?"/g)) {
    const ruta = m[1] || null;
    const ancla = m[2] ? m[2].slice(1) : null;
    if (ruta && /\.(css|js|png|jpg|webp|svg|xml|txt)$/.test(ruta)) {
      if (!existsSync(join(PUBLIC, ruta))) err(f, `recurso inexistente ${ruta}`);
      continue;
    }
    const destino = ruta ? rutas.get(ruta) : f;
    if (ruta && !destino) { err(f, `enlace roto ${ruta}`); continue; }
    if (ancla && destino && !ids[destino].has(ancla)) err(f, `ancla inexistente ${ruta ?? ''}#${ancla}`);
  }
  for (const m of h.matchAll(/(?:src|srcset)="([^"]+)"/g)) {
    for (const parte of m[1].split(',')) {
      const u = parte.trim().split(/\s+/)[0].split('?')[0];
      if (u.startsWith('/') && !u.startsWith('/_vercel') && !existsSync(join(PUBLIC, u))) err(f, `recurso inexistente ${u}`);
    }
  }
}

// sitemap y robots
const sitemap = readFileSync(join(PUBLIC, 'sitemap.xml'), 'utf8');
for (const [ruta, f] of rutas) {
  const noindex = /name="robots" content="noindex/.test(htmls[f]);
  const enSitemap = sitemap.includes(`<loc>https://ia.anvartech.cl${ruta === '/' ? '/' : ruta}</loc>`);
  if (!noindex && !enSitemap) err('sitemap.xml', `falta ${ruta}`);
  if (noindex && enSitemap) err('sitemap.xml', `incluye ${ruta}, que es noindex`);
}
const robots = readFileSync(join(PUBLIC, 'robots.txt'), 'utf8');
if (/Disallow:\s*\/\s*$/m.test(robots)) err('robots.txt', 'bloquea todo el sitio');
if (!/Sitemap:\s*https:\/\//.test(robots)) err('robots.txt', 'sin Sitemap');

// vercel.json contra el esquema (solo claves permitidas en headers)
const vercel = JSON.parse(readFileSync(join(RAIZ, 'vercel.json'), 'utf8'));
for (const e of vercel.headers ?? []) {
  const extra = Object.keys(e).filter((k) => !['source', 'headers', 'has', 'missing'].includes(k));
  if (extra.length) err('vercel.json', `clave no permitida en headers: ${extra.join(', ')} (Vercel rechaza el deploy)`);
}

// Sintaxis de JavaScript
for (const f of ['public/app.js', 'api/contacto.js', 'api/diagnostico.js']) {
  try { execFileSync(process.execPath, ['--check', join(RAIZ, f)], { stdio: 'pipe' }); } catch (e) { err(f, 'error de sintaxis'); }
}

console.log(`Revisadas ${paginas.length} páginas.`);
if (avisos.length) console.log(`\nAvisos (${avisos.length}):\n  ` + avisos.join('\n  '));
if (errores.length) { console.log(`\nErrores (${errores.length}):\n  ` + errores.join('\n  ')); process.exit(1); }
console.log('\nSin errores.');
