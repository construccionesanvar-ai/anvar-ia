// @ts-check
// Avisa a los buscadores que usan IndexNow (Bing, Yandex, Seznam, Naver y
// otros) qué URL cambiaron. Google no usa IndexNow: para Google basta el
// sitemap en Search Console (ver docs/SEARCH_CONSOLE_SETUP.md).
//
//   node scripts/indexnow.mjs --desde <commit>   URL cuyas páginas cambiaron desde ese commit
//   node scripts/indexnow.mjs --urls /a,/b       URL puntuales (rutas o absolutas)
//   node scripts/indexnow.mjs --todas            todo el sitemap (solo la primera vez o tras un cambio grande)
//   node scripts/indexnow.mjs --esperar          espera a que producción sirva el sitemap de este commit
//   --simular                                    muestra lo que enviaría, sin enviar
//
// Lo corre .github/workflows/indexnow.yml después de cada push a main que toca
// public/. Solo cuenta una página si cambió su contenido (scripts/huella.mjs):
// un ajuste de cabecera, pie o espacios no notifica todo el sitio. Nunca bloquea el deploy: es un paso aparte y, si falla, el sitio
// sigue igual. La clave es pública por diseño (public/<clave>.txt); no es un
// secreto. Para rotarla: nueva clave en src/config.mjs → npm run build.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { SITIO } from '../src/config.mjs';
import { huellaContenido } from './huella.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(RAIZ, 'public');
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 10_000;

const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null; };
const bandera = (n) => process.argv.includes(n);
const git = (...a) => execFileSync('git', a, { cwd: RAIZ, encoding: 'utf8' });

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemapActual = () => readFileSync(join(PUBLIC, 'sitemap.xml'), 'utf8');

/** public/recursos/x.html → https://dominio/recursos/x */
export function urlDeArchivo(archivo) {
  const rel = archivo.replace(/^public\//, '');
  if (!rel.endsWith('.html')) return null;
  const ruta = rel === 'index.html' ? '/' : '/' + rel.replace(/\.html$/, '');
  return SITIO.dominio + ruta;
}

/**
 * ¿Cambió el contenido de la página entre el commit base y ahora? Un cambio solo
 * de plantilla, espacios o texto para lectores de pantalla no cuenta.
 * @param {string} base  commit
 * @param {string} archivo  ruta en el repo (public/…)
 */
function contenidoCambio(base, archivo) {
  let antes;
  try { antes = git('show', `${base}:${archivo}`); } catch { return true; }
  const ruta = join(RAIZ, archivo);
  if (!existsSync(ruta)) return true;
  return huellaContenido(antes) !== huellaContenido(readFileSync(ruta, 'utf8'));
}

/** URL a notificar entre dos commits: páginas con contenido cambiado + URL que salieron del sitemap. */
export function urlsDesde(ref) {
  const enSitemap = new Set(locs(sitemapActual()));
  let base = ref;
  try { git('cat-file', '-e', `${ref}^{commit}`); } catch {
    console.log(`No se encontró el commit ${ref}; se compara con el commit anterior.`);
    base = 'HEAD~1';
  }
  const cambiados = git('diff', '--name-only', base, 'HEAD', '--', 'public/').split('\n').filter(Boolean);
  let anterior;
  try { anterior = git('show', `${base}:public/sitemap.xml`); } catch { anterior = ''; }
  const actualizadas = cambiados
    .filter((f) => { const u = urlDeArchivo(f); return u && enSitemap.has(u) && contenidoCambio(base, f); })
    .map(urlDeArchivo);
  const retiradas = locs(anterior).filter((u) => !enSitemap.has(u));
  return [...new Set([...actualizadas, ...retiradas])];
}

async function esperarProduccion(minutos = 12) {
  const local = sitemapActual();
  const fin = Date.now() + minutos * 60_000;
  while (Date.now() < fin) {
    try {
      const r = await fetch(`${SITIO.dominio}/sitemap.xml`, { headers: { 'cache-control': 'no-cache' } });
      if (r.ok && (await r.text()) === local) { console.log('Producción ya sirve el sitemap de este commit.'); return true; }
    } catch { /* reintenta */ }
    await new Promise((ok) => setTimeout(ok, 20_000));
  }
  console.log(`Producción no mostró el sitemap nuevo en ${minutos} minutos.`);
  return false;
}

async function enviar(urls, simular) {
  const clave = SITIO.indexnow?.clave;
  if (!clave) throw new Error('Falta SITIO.indexnow.clave en src/config.mjs');
  if (!existsSync(join(PUBLIC, `${clave}.txt`))) throw new Error(`Falta public/${clave}.txt (corre npm run build)`);
  const host = new URL(SITIO.dominio).host;
  const absolutas = [...new Set(urls.map((u) => (u.startsWith('http') ? u : SITIO.dominio + (u.startsWith('/') ? u : '/' + u))))];
  const ajenas = absolutas.filter((u) => new URL(u).host !== host);
  if (ajenas.length) throw new Error('URL de otro dominio: ' + ajenas.join(', '));
  if (!absolutas.length) { console.log('Nada que notificar: ninguna página indexable cambió.'); return; }
  if (absolutas.length > MAX_URLS) throw new Error(`Más de ${MAX_URLS} URL en un envío.`);
  console.log(`${simular ? '[simulación] ' : ''}IndexNow · ${absolutas.length} URL:\n  ` + absolutas.join('\n  '));
  if (simular) return;
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: clave, keyLocation: `${SITIO.dominio}/${clave}.txt`, urlList: absolutas }),
  });
  // 200: recibido · 202: recibido, clave en validación · 4xx: revisar clave o URL
  console.log(`Respuesta IndexNow: ${r.status} ${r.statusText}`);
  if (r.status >= 400) throw new Error(`IndexNow rechazó el envío (${r.status}): ${(await r.text()).slice(0, 300)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const simular = bandera('--simular');
  try {
    if (bandera('--esperar')) {
      const listo = await esperarProduccion();
      if (!listo) process.exit(1);
    } else if (bandera('--todas')) {
      await enviar(locs(sitemapActual()), simular);
    } else if (arg('--urls')) {
      await enviar(String(arg('--urls')).split(',').map((s) => s.trim()).filter(Boolean), simular);
    } else if (arg('--desde')) {
      await enviar(urlsDesde(String(arg('--desde'))), simular);
    } else {
      console.log('Uso: node scripts/indexnow.mjs --desde <commit> | --urls /a,/b | --todas | --esperar  [--simular]');
    }
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
