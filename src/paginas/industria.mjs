// @ts-check
// Plantilla de página por industria (/industrias/<slug>). Solo se genera para
// industrias con `publicada: true` que cumplen los mínimos de
// src/datos/industrias.mjs. Hoy no hay ninguna publicada.
import { SERVICIOS } from '../datos/oferta.mjs';
import { CASOS } from '../datos/casos.mjs';
import { esc } from '../html.mjs';
import { evaluar, encabezado } from '../componentes/base.mjs';
import { heroServicio, casosRelacionados, preguntas, otrosServicios } from '../componentes/secciones.mjs';
import { faltantes } from '../datos/industrias.mjs';
import { migas, faq } from './ld.mjs';

/**
 * @param {import('../datos/industrias.mjs').Industria} i
 */
export function paginaIndustria(i) {
  const falta = faltantes(i, CASOS);
  if (falta.length) throw new Error(`La industria "${i.slug}" está publicada pero le falta: ${falta.join(', ')}. Complétala o vuelve a poner publicada: false.`);
  const ruta = `/industrias/${i.slug}`;
  const problemas = i.problemas ?? [];
  const preguntasInd = i.faq ?? [];
  return {
    ruta,
    archivo: `industrias/${i.slug}.html`,
    prioridad: '0.7',
    titulo: /** @type {string} */ (i.titulo),
    descripcion: /** @type {string} */ (i.descripcion),
    contextoWsp: 'general',
    fuente: `industry-${i.slug}`,
    jsonld: [migas([[i.nombre, ruta]]), ...(preguntasInd.length ? [faq(preguntasInd)] : [])],
    cuerpo: () => `
${heroServicio({
  sobretitulo: `Industria · ${i.nombre}`,
  h1: /** @type {string} */ (i.h1),
  lead: /** @type {string} */ (i.lead),
  contexto: `industria-${i.slug}`,
  migas: [[i.nombre, ruta]],
  ficha: [['Industria', i.nombre], ['Primer paso', SERVICIOS.express.nombre], ['Medición', 'Antes y después'], ['Datos', 'Confidencialidad por escrito']],
})}
<section class="seccion" aria-labelledby="ind-problemas-tit">
  <div class="contenedor">
    ${encabezado({ codigo: i.nombre, titulo: `Dónde se pierde tiempo en ${i.nombre.toLowerCase()}`, id: 'ind-problemas-tit' })}
    <ul class="ejemplos">${problemas.map((p) => `<li><h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p><p><a href="${esc(SERVICIOS[p.servicio].url)}" data-track="service_click" data-track-label="industria-${esc(i.slug)}-${esc(p.servicio)}">${esc(SERVICIOS[p.servicio].nombre)}</a></p></li>`).join('')}</ul>
  </div>
</section>
${casosRelacionados(i.casos ?? [], `Casos en ${i.nombre.toLowerCase()}`)}
${preguntasInd.length ? preguntas(preguntasInd, { titulo: `Preguntas de empresas de ${i.nombre.toLowerCase()}` }) : ''}
${otrosServicios('')}
${evaluar({ contexto: 'general' })}
`,
  };
}
