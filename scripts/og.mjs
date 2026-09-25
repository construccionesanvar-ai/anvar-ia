// @ts-check
// Imágenes para compartir (Open Graph, 1200×630) de cada página que declara
// `og: { titulo, bajada, etiqueta }`. Se generan con Playwright a partir de
// una plantilla HTML con las fuentes y colores del sitio, y se guardan en
// public/og/<ruta>.png. Se versionan en el repositorio: Vercel no las genera.
//   npm run og            (solo las que cambiaron)
//   npm run og -- --todas (todas)
// scripts/og-manifest.json guarda una huella de los textos de cada imagen;
// check.mjs avisa si una imagen quedó desactualizada.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

import { PAGINAS } from './build.mjs';
import { SITIO } from '../src/config.mjs';
import { esc, rutaOg } from '../src/html.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(RAIZ, 'public');
export const MANIFIESTO = join(RAIZ, 'scripts', 'og-manifest.json');

const VERSION = 3; // súbela si cambia la plantilla, para regenerar todas
/** Huella de lo que se dibuja: si cambia, hay que regenerar la imagen. */
export const huellaOg = (p) => createHash('sha256').update(JSON.stringify([p.og, p.ruta, SITIO.marca, SITIO.linea, VERSION])).digest('hex').slice(0, 16);

// Las fuentes van incrustadas: la plantilla no depende de un servidor ni de CORS.
const fuente = (f) => `url(data:font/woff2;base64,${readFileSync(join(PUBLIC, 'fuentes', f)).toString('base64')}) format('woff2')`;

function plantilla(p) {
  const o = p.og;
  const largo = o.titulo.length;
  const tam = largo > 48 ? 64 : largo > 34 ? 74 : 86;
  const dominio = SITIO.dominio.replace(/^https?:\/\//, '');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face{font-family:Archivo;font-weight:500 700;font-stretch:62% 125%;src:${fuente('archivo-latin-500-700.woff2')}}
@font-face{font-family:'IBM Plex Sans';font-weight:400 600;src:${fuente('ibm-plex-sans-latin-var.woff2')}}
@font-face{font-family:'IBM Plex Mono';font-weight:500;src:${fuente('ibm-plex-mono-latin-500.woff2')}}
@font-face{font-family:'IBM Plex Mono';font-weight:600;src:${fuente('ibm-plex-mono-latin-600.woff2')}}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px}
body{background:#101A1E;color:#E9EBE4;font-family:'IBM Plex Sans',sans-serif;
  background-image:linear-gradient(rgba(233,235,228,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(233,235,228,.035) 1px,transparent 1px);
  background-size:24px 24px;position:relative;overflow:hidden}
.marco{position:absolute;inset:40px;border:1px solid #2C3B43;display:flex;flex-direction:column}
.cuerpo{flex:1;padding:44px 44px 0;display:flex;flex-direction:column}
.marca{display:flex;align-items:center;gap:16px;font-family:Archivo;font-weight:700;font-size:24px;letter-spacing:.01em}
.marca svg{width:54px;height:54px;border:1px solid #2C3B43;border-radius:8px}
.marca span{color:#A9B5AF;font-weight:500}
.etiqueta{margin-top:40px;font-family:'IBM Plex Mono';font-weight:600;font-size:20px;letter-spacing:.08em;text-transform:uppercase;color:#F0A92A}
h1{margin-top:14px;font-family:Archivo;font-weight:700;font-stretch:92%;font-size:${tam}px;line-height:1.04;letter-spacing:-.01em;max-width:1000px;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.raya{margin-top:22px;width:120px;height:6px;background:#F0A92A}
.bajada{margin-top:20px;font-size:28px;line-height:1.3;color:#A9B5AF;max-width:980px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pie{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,2.2fr) minmax(0,.9fr);border-top:1px solid #2C3B43;height:62px}
.pie div{padding:9px 18px;border-right:1px solid #2C3B43;font-family:'IBM Plex Mono';font-size:15px;line-height:1.35;color:#A9B5AF;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pie div:last-child{border-right:0}
.pie b{display:block;color:#E9EBE4;font-weight:600;font-size:18px;text-transform:none;letter-spacing:0;overflow:hidden;text-overflow:ellipsis}
</style></head><body><div class="marco"><div class="cuerpo">
<div class="marca"><svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="8" fill="#101A1E"/><path d="M22 76 L50 22 L78 76" fill="none" stroke="#E9EBE4" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 56 L66 56" stroke="#F0A92A" stroke-width="9" stroke-linecap="round"/><circle cx="50" cy="22" r="6" fill="#F0A92A"/></svg><div>${esc(SITIO.marca)} <span>· ${esc(SITIO.linea)}</span></div></div>
<p class="etiqueta">${esc(o.etiqueta)}</p>
<h1>${esc(o.titulo)}</h1>
<div class="raya"></div>
<p class="bajada">${esc(o.bajada)}</p>
</div>
<div class="pie"><div>Sitio<b>${esc(dominio)}</b></div><div>Página<b>${esc(p.ruta)}</b></div><div>Hecho en<b>Santiago, Chile</b></div></div>
</div></body></html>`;
}

async function cargarPlaywright() {
  // @ts-ignore -- Playwright es opcional: si no está en el proyecto se busca el global.
  try { return await import('playwright'); } catch { /* sigue */ }
  const global = execSync('npm root -g', { encoding: 'utf8' }).trim();
  return createRequire(join(global, 'noop.js'))('playwright');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const todas = process.argv.includes('--todas');
  const manifiesto = existsSync(MANIFIESTO) ? JSON.parse(readFileSync(MANIFIESTO, 'utf8')) : {};
  const pendientes = PAGINAS.filter((p) => p.og).filter((p) => {
    const archivo = join(PUBLIC, rutaOg(p.ruta));
    return todas || !existsSync(archivo) || manifiesto[p.ruta] !== huellaOg(p);
  });
  if (!pendientes.length) { console.log('Imágenes OG al día.'); process.exit(0); }

  const { chromium } = await cargarPlaywright();
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  mkdirSync(join(PUBLIC, 'og'), { recursive: true });
  for (const p of pendientes) {
    await pagina.setContent(plantilla(p), { waitUntil: 'load' });
    const listas = await pagina.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === 'loaded').length; });
    if (listas < 3) throw new Error(`Las fuentes no cargaron para ${p.ruta} (${listas}).`);
    const archivo = join(PUBLIC, rutaOg(p.ruta));
    await pagina.screenshot({ path: archivo, type: 'png' });
    manifiesto[p.ruta] = huellaOg(p);
    console.log('  ' + rutaOg(p.ruta));
  }
  await navegador.close();
  const ordenado = Object.fromEntries(Object.entries(manifiesto).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(MANIFIESTO, JSON.stringify(ordenado, null, 2) + '\n');
  console.log(`${pendientes.length} imágenes OG generadas. Vuelve a correr npm run build para enlazarlas.`);
}
