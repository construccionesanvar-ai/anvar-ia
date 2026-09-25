// @ts-check
// Constructor de páginas de guía: cabecera con autor y fechas, "en corto",
// secciones, CTA, caja de autor, relacionados y bloque de evaluación.
// Los datos de cada guía (título, fechas, descripción) salen de
// src/datos/recursos.mjs, así el índice, el feed y el JSON-LD coinciden.
import { recurso } from '../../datos/recursos.mjs';
import { rutaOg } from '../../html.mjs';
import { evaluar } from '../../componentes/base.mjs';
import { cabeceraArticulo, enCorto, prosa, ctaContenido, relacionados, cajaAutor } from '../../componentes/articulo.mjs';
import { preguntas } from '../../componentes/secciones.mjs';
import { migas, articulo, faq } from '../ld.mjs';

/**
 * @param {{ ruta: string, fuente: string, tituloSeo: string, lead: string, corto: string,
 *   secciones: { id: string, titulo: string, html: string }[],
 *   cta: Parameters<typeof ctaContenido>[0], relacionados: string[],
 *   preguntas?: { q: string, a: string }[], og: { titulo: string, bajada: string, etiqueta: string },
 *   contexto?: string, tipo?: string }} g
 */
export function guia(g) {
  const r = recurso(g.ruta);
  const archivo = g.ruta.replace(/^\//, '') + '.html';
  return {
    ruta: r.ruta,
    archivo,
    prioridad: '0.7',
    titulo: g.tituloSeo,
    ogTitulo: r.titulo,
    og: g.og,
    descripcion: r.descripcion,
    contextoWsp: g.contexto ?? 'general',
    fuente: g.fuente,
    articulo: { publicado: r.publicado, actualizado: r.actualizado },
    jsonld: [
      migas([['Recursos', '/recursos'], [r.tituloCorto, r.ruta]]),
      articulo({ titulo: r.titulo, descripcion: r.descripcion, ruta: r.ruta, publicado: r.publicado, actualizado: r.actualizado, imagen: rutaOg(r.ruta) }),
      ...(g.preguntas?.length ? [faq(g.preguntas)] : []),
    ],
    cuerpo: () => `
${cabeceraArticulo({ r, lead: g.lead, migas: [['Recursos', '/recursos'], [r.tituloCorto, r.ruta]] })}
<section class="seccion" aria-label="Texto de la guía">
  <div class="contenedor contenedor--prosa">
    ${enCorto(g.corto)}
    ${prosa(g.secciones)}
    ${ctaContenido(g.cta)}
    ${cajaAutor()}
  </div>
</section>
${g.preguntas?.length ? preguntas(g.preguntas, { titulo: 'Preguntas frecuentes', codigo: 'Preguntas' }) : ''}
${relacionados(g.relacionados)}
${evaluar({ contexto: g.contexto ?? 'general', tipo: g.tipo ?? 'express', modo: 'compacto', titulo: '¿Tienes un proceso en mente?' })}
`,
  };
}
