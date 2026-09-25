// @ts-check
// Control de calidad del sitio generado. Sin dependencias.
//   npm run check
// Revisa SEO, enlaces internos, accesibilidad básica, reglas del sitio
// (CSP, precios, WhatsApp, frases prohibidas) y la configuración de Vercel.
// Sale con código 1 si hay errores. Los avisos no bloquean, pero léelos.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { SITIO } from '../src/config.mjs';
import { SERVICIOS } from '../src/datos/oferta.mjs';
import { CASOS, METRICAS } from '../src/datos/casos.mjs';
import { TESTIMONIOS, publicables } from '../src/datos/testimonios.mjs';
import { PENDIENTES_PRIVACIDAD } from '../src/paginas/privacidad.mjs';
import { fechaCorta, rutaOg } from '../src/html.mjs';
import { PAGINAS } from './build.mjs';
import { huellaOg, MANIFIESTO } from './og.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(RAIZ, 'public');
/** @type {string[]} */ const errores = [];
/** @type {string[]} */ const avisos = [];
const err = (/** @type {string} */ f, /** @type {string} */ m) => errores.push(`${f}: ${m}`);
const aviso = (/** @type {string} */ f, /** @type {string} */ m) => avisos.push(`${f}: ${m}`);

/** Todos los .html de public/, también en subcarpetas (industrias/). */
function htmlEn(dir) {
  /** @type {string[]} */ const out = [];
  for (const f of readdirSync(dir)) {
    const ruta = join(dir, f);
    if (statSync(ruta).isDirectory()) out.push(...htmlEn(ruta));
    else if (f.endsWith('.html') && !f.startsWith('google')) out.push(relative(PUBLIC, ruta).replace(/\\/g, '/'));
  }
  return out;
}

const paginas = htmlEn(PUBLIC);
const rutas = new Map(paginas.map((f) => [f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, ''), f]));
/** @type {Record<string, string>} */
const htmls = Object.fromEntries(paginas.map((f) => [f, readFileSync(join(PUBLIC, f), 'utf8')]));
/** @type {Record<string, Set<string>>} */
const ids = Object.fromEntries(paginas.map((f) => [f, new Set([...htmls[f].matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
const sinScripts = (/** @type {string} */ html) => html.replace(/<script[\s\S]*?<\/script>/g, '');
const texto = (/** @type {string} */ html) => sinScripts(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

// ------------------------------------------------------------- frases vetadas
// Posicionamiento descartado, marketing vacío y promesas absolutas.
/** @type {[RegExp, string][]} */
const VETADAS = [
  [/desde UF 28\b/, '"desde UF 28" como precio del piloto (el piloto es desde UF 40)'],
  [/más elegido/i, 'afirmación "el más elegido" sin respaldo'],
  [/no vengo del mundo del software/i, 'frase de posicionamiento descartada'],
  [/revolucion/i, 'marketing vacío ("revolucionamos")'],
  [/el futuro de la IA/i, 'marketing vacío ("el futuro de la IA")'],
  [/sin límites/i, 'marketing vacío ("sin límites")'],
  [/clase mundial/i, 'marketing vacío ("clase mundial")'],
  [/potencia tu empresa/i, 'marketing vacío ("potencia tu empresa")'],
  [/100\s?% seguro|completamente segur|totalmente segur|imposible de hackear|cero riesgo|privacidad garantizada|seguridad garantizada/i, 'promesa de seguridad absoluta'],
  [/queda en tu poder|el código queda|siempre queda con|código[^.]{0,20}queda en tu empresa/i, 'propiedad intelectual absoluta: usa PROPIEDAD de src/datos/contenido.mjs'],
  [/100\s?% de precisión|precisión del 100/i, 'precisión presentada como general'],
];

// ------------------------------------------------------ precios permitidos
const UF_VALIDOS = new Set();
const CLP_VALIDOS = new Set([SITIO.uf.valor]);
for (const s of Object.values(SERVICIOS)) {
  if (s.precio.moneda === 'UF') { UF_VALIDOS.add(s.precio.valor); CLP_VALIDOS.add(s.precio.valor * SITIO.uf.valor); }
  else CLP_VALIDOS.add(s.precio.valor);
  for (const m of (s.precio.nota ?? '').matchAll(/UF (\d+)/g)) UF_VALIDOS.add(Number(m[1]));
}
UF_VALIDOS.add(SERVICIOS.piloto.precio.valor - SERVICIOS.diagnostico.precio.valor);
const numero = (/** @type {string} */ s) => Number(s.replace(/\./g, ''));

for (const f of paginas) {
  const h = htmls[f];
  const noindex = /name="robots" content="noindex/.test(h);
  const txt = texto(h);

  // SEO
  const titulo = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (!titulo) err(f, 'sin <title>');
  else if (titulo.length > 70) aviso(f, `título largo (${titulo.length} caracteres)`);
  const desc = (h.match(/name="description" content="([^"]*)"/) || [])[1] || '';
  if (!desc) err(f, 'sin meta description');
  else if (!noindex && (desc.length < 70 || desc.length > 165)) aviso(f, `descripción de ${desc.length} caracteres (ideal 120-160)`);
  const canonical = (h.match(/rel="canonical" href="([^"]+)"/) || [])[1];
  if (!noindex && !/^https:\/\/ia\.anvartech\.cl(\/[^"]*)?$/.test(canonical ?? '')) err(f, 'sin canonical absoluta');
  if (canonical && /^https:\/\/[^/]+\/.+\/$/.test(canonical)) err(f, 'canonical con barra final (el sitio usa trailingSlash: false)');
  const ogUrl = (h.match(/property="og:url" content="([^"]+)"/) || [])[1];
  if (!noindex && ogUrl !== canonical) err(f, 'og:url distinta de la canonical');
  const ogImg = (h.match(/property="og:image" content="([^"]+)"/) || [])[1];
  if (!ogImg) err(f, 'sin og:image');
  else if (!ogImg.startsWith(SITIO.dominio + '/') || !existsSync(join(PUBLIC, ogImg.slice(SITIO.dominio.length)))) err(f, `og:image inexistente ${ogImg}`);
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(f, `tiene ${h1} <h1> (debe ser 1)`);
  if (!/<html lang="es/.test(h)) err(f, 'sin lang en <html>');

  // Jerarquía de títulos: nunca saltar un nivel hacia abajo (h1 → h3).
  let previo = 0;
  for (const m of sinScripts(h).matchAll(/<h([1-6])[\s>]/g)) {
    const n = Number(m[1]);
    if (previo && n > previo + 1) { err(f, `salto de título h${previo} → h${n}`); break; }
    previo = n;
  }

  // Datos estructurados válidos y sin reseñas inventadas
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1]);
      if (/"(AggregateRating|Review)"/.test(JSON.stringify(j))) err(f, 'JSON-LD con reseñas o calificaciones: no existen, no se declaran');
      const nodos = (Array.isArray(j) ? j : [j]).flatMap((x) => x['@graph'] ?? [x]);
      const visible = txt.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      for (const n of nodos) {
        // FAQPage solo con preguntas que se ven en la página
        if (n['@type'] === 'FAQPage') {
          for (const q of n.mainEntity ?? []) if (!visible.includes(q.name)) err(f, `FAQPage con una pregunta que no se ve en la página: "${q.name.slice(0, 50)}"`);
        }
        if (n['@type'] === 'Article' || n['@type'] === 'TechArticle') {
          for (const k of ['headline', 'datePublished', 'dateModified', 'author', 'image']) if (!n[k]) err(f, `Article sin ${k}`);
          if (n.headline && n.headline.length > 110) err(f, 'Article con headline de más de 110 caracteres');
        }
      }
    } catch (e) { err(f, 'JSON-LD inválido: ' + (e instanceof Error ? e.message : e)); }
  }
  try { JSON.parse((h.match(/<script type="application\/json" id="config">([\s\S]*?)<\/script>/) || [])[1] || '{}'); } catch { err(f, 'config del cliente inválida'); }

  // Reglas del sitio
  if (/\sstyle="/.test(h)) err(f, 'atributo style="" (el CSP lo bloquea: usa una clase)');
  if (/<script(?![^>]*\s(?:src|type="application\/(?:ld\+)?json"))[^>]*>/.test(h)) err(f, 'script en línea (el CSP solo permite archivos)');
  if (/fonts\.(googleapis|gstatic)\.com/.test(h)) err(f, 'carga Google Fonts (las tipografías se sirven desde /fuentes)');
  for (const [re, m] of VETADAS) if (re.test(txt)) err(f, m);
  if (!SITIO.agenda.url && /Agendar/i.test(txt)) err(f, 'dice "Agendar" pero no hay agenda configurada: usa "Coordinar…"');

  // Precios: todo "UF n" y todo "$n.nnn" visible tiene que salir de la fuente única.
  // Fuera de la revisión: las herramientas (montos que calcula el visitante) y las cifras de ejemplo marcadas con ej().
  const txtPrecios = texto(h.replace(/<section[^>]*data-sin-precios[^>]*>[\s\S]*?<\/section>/g, '').replace(/<span class="cifra-ej">[^<]*<\/span>/g, ''));
  for (const m of txtPrecios.matchAll(/UF (\d+(?:\.\d{3})*)/g)) if (!UF_VALIDOS.has(numero(m[1]))) err(f, `precio "UF ${m[1]}" que no está en src/datos/oferta.mjs`);
  for (const m of txtPrecios.matchAll(/\$(\d{1,3}(?:\.\d{3})+)/g)) if (!CLP_VALIDOS.has(numero(m[1]))) err(f, `monto "$${m[1]}" que no sale de src/datos/oferta.mjs ni de la UF`);

  // WhatsApp: todo enlace lleva mensaje y origen del lead.
  for (const m of h.matchAll(/href="(https:\/\/wa\.me\/[^"]*)"/g)) {
    if (!m[1].includes(`wa.me/${SITIO.contacto.whatsapp}`)) err(f, 'enlace a WhatsApp con otro número');
    if (!/\?text=/.test(m[1])) err(f, 'enlace a WhatsApp sin mensaje prellenado');
    else if (!/\(ref%3A%20[a-z-]+\)/.test(m[1])) err(f, 'enlace a WhatsApp sin "(ref: …)"');
  }

  // Formularios: aviso de privacidad al lado
  if (/<form\b/.test(h) && !/<form[\s\S]*href="\/privacidad"[\s\S]*<\/form>/.test(h)) err(f, 'formulario sin enlace a la política de privacidad');

  // Accesibilidad básica
  for (const m of h.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) err(f, 'imagen sin alt: ' + m[0].slice(0, 60));
  for (const m of h.matchAll(/<(?:input|select|textarea)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
    if (/type="(hidden|submit)"/.test(m[0])) continue;
    if (!new RegExp(`<label[^>]*for="${m[1]}"`).test(h)) err(f, `campo #${m[1]} sin <label>`);
  }
  for (const m of h.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) if (!/rel="[^"]*noopener/.test(m[0])) err(f, 'target="_blank" sin rel="noopener": ' + m[0].slice(0, 70));
  for (const m of h.matchAll(/aria-(?:labelledby|describedby|controls)="([^"]+)"/g)) {
    for (const id of m[1].split(/\s+/)) if (!ids[f].has(id)) err(f, `aria referencia a #${id}, que no existe`);
  }
  for (const m of h.matchAll(/<label[^>]*for="([^"]+)"/g)) if (!ids[f].has(m[1])) err(f, `<label for="${m[1]}"> sin campo`);
  const vistos = new Set();
  for (const m of h.matchAll(/\sid="([^"]+)"/g)) { if (vistos.has(m[1])) err(f, `id duplicado #${m[1]}`); vistos.add(m[1]); }
  for (const m of h.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    if (/aria-label="[^"]+"/.test(m[1])) continue;
    if (!m[2].replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').trim()) err(f, 'enlace sin texto accesible: ' + m[1].slice(0, 60));
  }
  for (const m of h.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    if (/aria-label="[^"]+"/.test(m[1])) continue;
    if (!m[2].replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').trim()) err(f, 'botón sin texto accesible');
  }
  // El logo no debe leerse como "ANVAR TECHIA & Automatización"
  if (/<b>ANVAR TECH<\/b><span>/.test(h)) err(f, 'logo sin espacio entre marca y línea (el texto accesible se pega)');

  // Enlaces internos: la página y el ancla tienen que existir
  for (const m of h.matchAll(/href="(\/[^"#?]*|)(#[^"]*)?"/g)) {
    const ruta = m[1] || null;
    const ancla = m[2] ? m[2].slice(1) : null;
    if (ruta && /\.(css|js|png|jpg|webp|svg|xml|txt|woff2|mp4|xlsx|pdf)$/.test(ruta)) {
      if (!existsSync(join(PUBLIC, ruta))) err(f, `recurso inexistente ${ruta}`);
      continue;
    }
    const destino = ruta ? rutas.get(ruta) : f;
    if (ruta && !destino) { err(f, `enlace roto ${ruta}`); continue; }
    if (ancla && destino && !ids[destino].has(ancla)) err(f, `ancla inexistente ${ruta ?? ''}#${ancla}`);
  }
  for (const m of h.matchAll(/(?:src|srcset|poster)="([^"]+)"/g)) {
    for (const parte of m[1].split(',')) {
      const u = parte.trim().split(/\s+/)[0].split('?')[0];
      if (u.startsWith('/') && !u.startsWith('/_vercel') && !existsSync(join(PUBLIC, u))) err(f, `recurso inexistente ${u}`);
    }
  }
  for (const m of h.matchAll(/<link rel="preload" href="([^"]+)"/g)) if (!existsSync(join(PUBLIC, m[1]))) err(f, `preload de un archivo inexistente ${m[1]}`);
}

// Títulos y descripciones únicos entre páginas indexables
const indexables = paginas.filter((f) => !/name="robots" content="noindex/.test(htmls[f]));
for (const [campo, re] of /** @type {[string, RegExp][]} */ ([['título', /<title>([^<]*)<\/title>/], ['descripción', /name="description" content="([^"]*)"/]])) {
  const vistos = new Map();
  for (const f of indexables) {
    const v = (htmls[f].match(re) || [])[1];
    if (vistos.has(v)) err(f, `${campo} repetido con ${vistos.get(v)}`);
    vistos.set(v, f);
  }
}

// Ninguna página indexable queda huérfana: al menos otra página la enlaza.
for (const [ruta, f] of rutas) {
  if (ruta === '/' || /name="robots" content="noindex/.test(htmls[f])) continue;
  const enlazada = paginas.some((g) => g !== f && new RegExp(`href="${ruta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[#?"])`).test(htmls[g]));
  if (!enlazada) err(f, 'página huérfana: ninguna otra página la enlaza');
}

// Imágenes para compartir al día (npm run og)
const manifiestoOg = existsSync(MANIFIESTO) ? JSON.parse(readFileSync(MANIFIESTO, 'utf8')) : {};
for (const p of PAGINAS.filter((x) => x.og)) {
  const img = rutaOg(p.ruta);
  if (!existsSync(join(PUBLIC, img))) aviso(p.archivo, `falta la imagen para compartir ${img}: npm run og`);
  else if (manifiestoOg[p.ruta] !== huellaOg(p)) aviso(p.archivo, `imagen para compartir ${img} desactualizada: npm run og`);
}

// feed.xml y llms.txt solo apuntan a páginas que existen
for (const archivo of ['feed.xml', 'llms.txt']) {
  const contenido = readFileSync(join(PUBLIC, archivo), 'utf8');
  for (const m of contenido.matchAll(/https:\/\/ia\.anvartech\.cl(\/[^\s<)"\]]*)?/g)) {
    const ruta = (m[1] ?? '/').replace(/[#?].*$/, '') || '/';
    if (/\.(xml|txt|png|xlsx)$/.test(ruta)) { if (!existsSync(join(PUBLIC, ruta))) err(archivo, `recurso inexistente ${ruta}`); continue; }
    if (!rutas.has(ruta)) err(archivo, `enlace a una página inexistente ${ruta}`);
  }
}

// IndexNow: la clave publicada coincide con la configurada
if (SITIO.indexnow?.clave) {
  const archivoClave = join(PUBLIC, `${SITIO.indexnow.clave}.txt`);
  if (!existsSync(archivoClave) || readFileSync(archivoClave, 'utf8').trim() !== SITIO.indexnow.clave) err('indexnow', `falta public/${SITIO.indexnow.clave}.txt con la clave`);
}

// La privacidad está enlazada desde el pie de todas las páginas
for (const f of paginas) if (!/<footer[\s\S]*href="\/privacidad"/.test(htmls[f])) err(f, 'pie sin enlace a /privacidad');

// sitemap y robots
const sitemap = readFileSync(join(PUBLIC, 'sitemap.xml'), 'utf8');
for (const [ruta, f] of rutas) {
  const noindex = /name="robots" content="noindex/.test(htmls[f]);
  const enSitemap = sitemap.includes(`<loc>https://ia.anvartech.cl${ruta === '/' ? '/' : ruta}</loc>`);
  if (!noindex && !enSitemap) err('sitemap.xml', `falta ${ruta}`);
  if (noindex && enSitemap) err('sitemap.xml', `incluye ${ruta}, que es noindex`);
}
for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const ruta = m[1].replace('https://ia.anvartech.cl', '') || '/';
  if (!rutas.has(ruta)) err('sitemap.xml', `URL sin página: ${m[1]}`);
  if (ruta !== '/' && ruta.endsWith('/')) err('sitemap.xml', `URL con barra final: ${m[1]}`);
}
const robots = readFileSync(join(PUBLIC, 'robots.txt'), 'utf8');
if (/Disallow:\s*\/\s*$/m.test(robots)) err('robots.txt', 'bloquea todo el sitio');
if (!/Sitemap:\s*https:\/\//.test(robots)) err('robots.txt', 'sin Sitemap');

// vercel.json contra el esquema (solo claves permitidas)
const vercel = JSON.parse(readFileSync(join(RAIZ, 'vercel.json'), 'utf8'));
for (const e of vercel.headers ?? []) {
  const extra = Object.keys(e).filter((k) => !['source', 'headers', 'has', 'missing'].includes(k));
  if (extra.length) err('vercel.json', `clave no permitida en headers: ${extra.join(', ')} (Vercel rechaza el deploy)`);
}
for (const e of vercel.redirects ?? []) {
  const extra = Object.keys(e).filter((k) => !['source', 'destination', 'permanent', 'statusCode', 'has', 'missing', 'basePath', 'locale'].includes(k));
  if (extra.length) err('vercel.json', `clave no permitida en redirects: ${extra.join(', ')}`);
}
const csp = (vercel.headers ?? []).flatMap((/** @type {{headers: {key: string, value: string}[]}} */ e) => e.headers).find((/** @type {{key: string}} */ x) => x.key === 'Content-Security-Policy');
if (!csp) err('vercel.json', 'sin Content-Security-Policy');

// Datos: casos, métricas y testimonios coherentes
for (const m of METRICAS) {
  const c = CASOS.find((x) => x.id === m.caso);
  if (!c || !c.metricas[m.metrica]) err('src/datos/casos.mjs', `METRICAS apunta a una métrica inexistente (${m.caso} #${m.metrica})`);
}
for (const c of CASOS) {
  if (!c.flujo?.length) err('src/datos/casos.mjs', `${c.codigo} sin flujo (es la evidencia visual cuando no hay video)`);
  if (!c.media && c.evidenciaPendiente) aviso('evidencia', `${c.codigo}: pendiente ${c.evidenciaPendiente}`);
}
for (const t of TESTIMONIOS) {
  if (!t.autorizado?.fecha) aviso('src/datos/testimonios.mjs', `testimonio de "${t.empresa || t.cargo}" sin autorización registrada: no se publica`);
}
if (!publicables().length) aviso('testimonios', 'no hay testimonios autorizados: la sección no se muestra (correcto)');

// Recordatorios comerciales y legales
const diasUf = Math.round((Date.now() - new Date(SITIO.uf.fecha + 'T12:00:00-03:00').getTime()) / 86_400_000);
if (diasUf > SITIO.uf.vigenciaDias) aviso('src/config.mjs', `la UF de referencia (${fechaCorta(SITIO.uf.fecha)}) tiene ${diasUf} días: ya no se muestran pesos si /api/uf falla. Actualízala.`);
else if (diasUf > SITIO.uf.vigenciaDias - 10) aviso('src/config.mjs', `la UF de referencia vence en ${SITIO.uf.vigenciaDias - diasUf} días`);
for (const s of Object.values(SERVICIOS)) if (s.hipotesis) aviso('precios', `${s.nombre}: precio aún sin validar con clientes (hipotesis: true)`);
for (const p of PENDIENTES_PRIVACIDAD) aviso('privacidad (validar)', p);
if (!SITIO.agenda.url) aviso('agenda', 'sin agenda configurada: el sitio ofrece coordinar por WhatsApp (SITIO.agenda.url)');

// Sintaxis de JavaScript
for (const f of ['public/app.js', 'api/contacto.js', 'api/diagnostico.js', 'api/uf.js']) {
  try { execFileSync(process.execPath, ['--check', join(RAIZ, f)], { stdio: 'pipe' }); } catch { err(f, 'error de sintaxis'); }
}

console.log(`Revisadas ${paginas.length} páginas.`);
if (avisos.length) console.log(`\nAvisos (${avisos.length}):\n  ` + avisos.join('\n  '));
if (errores.length) { console.log(`\nErrores (${errores.length}):\n  ` + errores.join('\n  ')); process.exit(1); }
console.log('\nSin errores.');
