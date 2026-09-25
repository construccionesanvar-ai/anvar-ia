// @ts-check
// Arma enlaces con UTM para compartir contenido y medir de dónde llegan las
// visitas (Vercel Analytics › evento organic_landing_view › canal/campana).
//   npm run utm -- <ruta> <fuente> <medio> <campaña>
//   npm run utm -- /calculadora-roi-automatizacion linkedin social calculadora-roi
// Convenciones (docs/CONTENT_DISTRIBUTION.md): todo en minúsculas, sin
// espacios ni tildes; fuente = dónde (linkedin, whatsapp, email, youtube);
// medio = tipo (social, mensaje, newsletter, video, firma); campaña = qué pieza.
// Nunca pongas datos personales en un UTM: quedan en la analítica.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITIO } from '../src/config.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
export const MEDIOS = ['social', 'mensaje', 'newsletter', 'email', 'video', 'firma', 'organic', 'referral', 'qr', 'cpc'];

/** Normaliza un valor de UTM: minúsculas, sin tildes, guiones en vez de espacios. */
export const limpiarUtm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  .replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

/** Devuelve la URL con UTM, o lanza un error si la ruta no está en el sitemap. */
export function urlUtm(ruta, fuente, medio, campana, rutasValidas) {
  const r = ruta.startsWith('/') ? ruta : '/' + ruta;
  const [camino, ancla] = r.split('#');
  if (rutasValidas && !rutasValidas.has(camino)) throw new Error(`La ruta ${camino} no está en el sitemap.`);
  const [f, m, c] = [fuente, medio, campana].map(limpiarUtm);
  if (!f || !m || !c) throw new Error('Faltan fuente, medio o campaña.');
  const q = new URLSearchParams({ utm_source: f, utm_medium: m, utm_campaign: c });
  return `${SITIO.dominio}${camino === '/' ? '/' : camino}?${q}${ancla ? '#' + ancla : ''}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [ruta, fuente, medio, campana] = process.argv.slice(2);
  if (!campana) {
    console.log('Uso: npm run utm -- <ruta> <fuente> <medio> <campaña>\n  ej: npm run utm -- /calculadora-roi-automatizacion linkedin social calculadora-roi');
    process.exit(1);
  }
  const sitemap = readFileSync(join(RAIZ, 'public', 'sitemap.xml'), 'utf8');
  const rutas = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITIO.dominio, '') || '/'));
  try {
    if (!MEDIOS.includes(limpiarUtm(medio))) console.warn(`Aviso: medio "${medio}" fuera de la convención (${MEDIOS.join(', ')}).`);
    console.log(urlUtm(ruta, fuente, medio, campana, rutas));
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
