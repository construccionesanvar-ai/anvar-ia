// @ts-check
// Piezas de contenido largo: cabecera con autor y fechas, "en corto",
// índice, secciones de prosa, caja de autor, enlaces relacionados y CTA
// dentro del contenido. Las usan guías, casos largos, herramientas y
// páginas de solución.
import { SERVICIOS } from '../datos/oferta.mjs';
import { RECURSOS, CATEGORIAS, AUTOR, recurso } from '../datos/recursos.mjs';
import { SOLUCIONES, solucion } from '../datos/soluciones.mjs';
import { esc, fechaCorta } from '../html.mjs';
import { boton, encabezado, icono } from './base.mjs';
import { migasVisibles, retrato } from './secciones.mjs';

const TIPOS = { guia: 'Guía', caso: 'Caso', herramienta: 'Herramienta gratuita', plantilla: 'Plantilla gratuita' };

/** "Por Andrés Vargas · Publicado 25/09/2026 · 8 min de lectura" */
export function lineaAutor(r) {
  const act = r.actualizado !== r.publicado ? ` · Actualizado <time datetime="${esc(r.actualizado)}">${esc(fechaCorta(r.actualizado))}</time>` : '';
  return `<p class="art-meta">Por <a href="${esc(AUTOR.url)}">${esc(AUTOR.nombre)}</a>, ${esc(AUTOR.cargo.toLowerCase())} · Publicado <time datetime="${esc(r.publicado)}">${esc(fechaCorta(r.publicado))}</time>${act}${r.lectura ? ` · ${r.lectura} min de lectura` : ''}</p>`;
}

/**
 * Portada de un contenido largo.
 * @param {{ r: import('../datos/recursos.mjs').Recurso, lead: string, migas: [string, string][], sobretitulo?: string }} o
 */
export function cabeceraArticulo({ r, lead, migas, sobretitulo }) {
  return `<section class="hero hero--servicio hero--articulo" aria-labelledby="hero-tit">
  <div class="contenedor contenedor--prosa">
    ${migasVisibles(migas)}
    <p class="sobretitulo">${esc(sobretitulo ?? `${TIPOS[r.tipo]} · ${CATEGORIAS[r.categoria]}`)}</p>
    <h1 id="hero-tit">${esc(r.titulo)}</h1>
    <p class="lead">${lead}</p>
    ${lineaAutor(r)}
  </div>
</section>`;
}

/** Respuesta directa arriba del contenido: lo esencial en tres o cuatro líneas. */
export const enCorto = (html) => `<aside class="en-corto" aria-label="En corto"><p class="label">En corto</p>${html}</aside>`;

/**
 * Secciones de prosa con índice.
 * @param {{ id: string, titulo: string, html: string }[]} secciones
 * @param {{ indice?: boolean }} [o]
 */
export function prosa(secciones, { indice = true } = {}) {
  const toc = indice && secciones.length > 3
    ? `<nav class="indice-legal" aria-label="Contenido"><p class="label">Contenido</p><ol>${secciones.map((s) => `<li><a href="#${esc(s.id)}">${esc(s.titulo)}</a></li>`).join('')}</ol></nav>`
    : '';
  return `${toc}${secciones.map((s) => `<section class="prosa-sec" aria-labelledby="${esc(s.id)}"><h2 id="${esc(s.id)}">${esc(s.titulo)}</h2>${s.html}</section>`).join('\n')}`;
}

/** Caja de autor al final de guías y casos (E-E-A-T con datos reales). */
export function cajaAutor() {
  return `<aside class="autor" aria-label="Sobre el autor">
    <div class="autor-foto">${retrato({ sizes: '72px', clase: 'autor-img' })}</div>
    <div>
      <p class="label">Sobre el autor</p>
      <p class="autor-nombre"><a href="${esc(AUTOR.url)}">${esc(AUTOR.nombre)}</a> · ${esc(AUTOR.cargo)}</p>
      <p>${esc(AUTOR.bio)} <a href="/casos">Ver los casos reales</a>.</p>
    </div>
  </aside>`;
}

/**
 * CTA dentro del contenido. Mide `content_cta_click` (o el evento que se indique).
 * @param {{ titulo: string, texto: string, botones: { href?: string, wsp?: string, texto: string, variante?: 'primario'|'secundario', etiqueta: string }[], evento?: string }} o
 */
export function ctaContenido({ titulo, texto, botones, evento = 'content_cta_click' }) {
  return `<aside class="cta-contenido" aria-label="${esc(titulo)}">
    <p class="cta-contenido-tit">${esc(titulo)}</p>
    <p>${texto}</p>
    <div class="cta-contenido-botones">${botones.map((b) => boton({ href: b.href, wsp: b.wsp, texto: b.texto, variante: b.variante ?? 'primario', icono: b.wsp ? 'whatsapp' : undefined, track: b.wsp ? undefined : evento, trackData: b.etiqueta })).join('')}</div>
  </aside>`;
}

/**
 * Tarjeta de enlace relacionado. Acepta una ruta de recurso, de solución o un id de servicio.
 * @param {string} ref
 */
function tarjeta(ref) {
  let href, etiqueta, titulo, texto;
  if (SERVICIOS[ref]) {
    const s = SERVICIOS[ref];
    href = s.url; etiqueta = 'Servicio'; titulo = s.nombre; texto = s.resumen;
  } else if (SOLUCIONES.some((x) => x.ruta === ref)) {
    const s = solucion(ref);
    href = s.ruta; etiqueta = 'Solución'; titulo = s.nombre; texto = s.texto;
  } else if (ref === '/casos') {
    href = '/casos'; etiqueta = 'Evidencia'; titulo = 'Casos reales'; texto = 'Lo que ya construimos, con el antes, el después y cómo se midió.';
  } else {
    const r = recurso(ref);
    href = r.ruta; etiqueta = TIPOS[r.tipo]; titulo = r.tituloCorto; texto = r.descripcion;
  }
  return `<li><a href="${esc(href)}" data-track="content_cta_click" data-track-label="relacionado-${esc(href.replace(/^\//, '').replace(/\//g, '-') || 'inicio')}"><span class="rel-tipo">${esc(etiqueta)}</span> <span class="rel-tit">${esc(titulo)}</span> <span class="rel-txt">${esc(texto)}</span> <span class="rel-ir" aria-hidden="true">${icono('flecha')}</span></a></li>`;
}

/**
 * Bloque "Sigue leyendo".
 * @param {string[]} refs rutas de recursos o soluciones, o ids de servicios
 */
export function relacionados(refs, titulo = 'Sigue leyendo') {
  return `<section class="seccion seccion--panel" aria-labelledby="rel-contenido-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Relacionado', titulo, id: 'rel-contenido-tit' })}
    <ul class="relacionados">${refs.map(tarjeta).join('')}</ul>
  </div>
</section>`;
}

/** Lista de recursos para el índice /recursos, agrupada por tipo. */
export function listaRecursos(filtro) {
  return `<ul class="relacionados relacionados--indice">${RECURSOS.filter(filtro).map((r) => tarjeta(r.ruta)).join('')}</ul>`;
}

export { TIPOS as TIPOS_RECURSO };
