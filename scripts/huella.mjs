// @ts-check
// Huella del contenido de una página: lo que un buscador considera "la página
// cambió". Incluye title, description, canonical, robots, datos estructurados y
// el texto de <main>. Ignora espacios, el marcado y el texto solo para lectores
// de pantalla (.sr), y todo lo que está fuera de <main> (cabecera y pie).
//
// La usan el build (lastmod del sitemap) y IndexNow (qué URL notificar), para
// que un ajuste de plantilla no marque las 25 páginas como nuevas.
import { createHash } from 'node:crypto';

/** @param {string} html */
export function huellaContenido(html) {
  const uno = (/** @type {RegExp} */ re) => (html.match(re) || [])[1] || '';
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('');
  const texto = uno(/<main\b[^>]*>([\s\S]*?)<\/main>/)
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<span class="sr">[^<]*<\/span>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, '');
  const partes = [
    uno(/<title>([\s\S]*?)<\/title>/),
    uno(/<meta name="description" content="([^"]*)"/),
    uno(/<link rel="canonical" href="([^"]*)"/),
    uno(/<meta name="robots" content="([^"]*)"/),
    ld,
    texto,
  ];
  return createHash('sha256').update(partes.join('\u0000')).digest('hex');
}
