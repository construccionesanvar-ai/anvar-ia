// @ts-check
// Páginas por industria (metalmecánica, retail, bodegas, servicios técnicos,
// construcción…). La arquitectura está lista, pero NO se publica ninguna
// todavía: una página por industria sin casos ni problemas propios de ese
// rubro es una página SEO vacía, y Google y los clientes lo notan.
//
// ─── Cómo publicar una ───────────────────────────────────────────────────────
// Completa la entrada y cambia `publicada` a true. El build genera
// /industrias/<slug>, la suma al sitemap y al pie. El QA exige lo mínimo para
// que la página valga la pena:
//   - al menos 3 problemas propios del rubro (no copiados de la portada),
//   - al menos 1 caso de ese rubro en src/datos/casos.mjs (`cliente.industria`),
//   - título y descripción propios.
// Si falta algo, el build falla y la página no sale.

/**
 * @typedef {{ slug: string, nombre: string, publicada: boolean,
 *   titulo?: string, descripcion?: string, h1?: string, lead?: string,
 *   problemas?: { titulo: string, texto: string, servicio: string }[],
 *   casos?: string[], faq?: { q: string, a: string }[] }} Industria
 */

/** @type {Industria[]} */
export const INDUSTRIAS = [
  { slug: 'metalmecanica', nombre: 'Metalmecánica', publicada: false },
  { slug: 'retail', nombre: 'Retail', publicada: false },
  { slug: 'bodegas', nombre: 'Bodegas y logística', publicada: false },
  { slug: 'servicios-tecnicos', nombre: 'Servicios técnicos', publicada: false },
  { slug: 'construccion', nombre: 'Construcción', publicada: false },
];

/** Mínimos para publicar. Los usa el build y el QA. */
export const MINIMOS = { problemas: 3, casos: 1 };

/**
 * Qué le falta a una industria para poder publicarse (lista vacía = lista).
 * @param {Industria} i
 * @param {{ id: string, cliente: { industria?: string } }[]} casos
 */
export function faltantes(i, casos) {
  const f = [];
  if (!i.titulo) f.push('título');
  if (!i.descripcion) f.push('descripción');
  if (!i.h1 || !i.lead) f.push('h1 y lead');
  if ((i.problemas ?? []).length < MINIMOS.problemas) f.push(`${MINIMOS.problemas} problemas propios del rubro`);
  const propios = (i.casos ?? []).filter((id) => casos.some((c) => c.id === id));
  if (propios.length < MINIMOS.casos) f.push(`${MINIMOS.casos} caso del rubro`);
  return f;
}

export const publicadas = () => INDUSTRIAS.filter((i) => i.publicada);
