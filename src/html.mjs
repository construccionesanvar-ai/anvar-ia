// @ts-check
// Utilidades para armar HTML de forma segura.
import { SITIO } from './config.mjs';

/** Escapa texto para usarlo dentro de HTML o de un atributo. */
export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

/**
 * Texto con énfasis mínimo: *palabras* se vuelven <strong>. Todo lo demás se
 * escapa, así que el contenido de los datos nunca inyecta HTML.
 */
export function rico(v) {
  return esc(v).replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
}

/** Atributos a partir de un objeto; ignora null, undefined y false. */
export function attrs(o) {
  return Object.entries(o)
    .filter(([, v]) => v !== null && v !== undefined && v !== false)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`))
    .join('');
}

const CLP = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });
export const pesos = (n) => '$' + CLP.format(Math.round(n));

/**
 * @typedef {{ moneda: 'UF'|'CLP', valor: number, desde?: boolean,
 *   iva: 'mas'|'incluido', periodo?: 'mes'|null, nota?: string }} Precio
 */

/**
 * Presentación de un precio en dos líneas: la principal y el detalle.
 * Regla del sitio: proyectos y mensualidades de empresa en UF con su
 * equivalente en pesos; servicios de entrada y de personas en pesos.
 * @param {Precio} p
 */
export function precioTexto(p) {
  const desde = p.desde ? 'desde ' : '';
  const periodo = p.periodo === 'mes' ? ' / mes' : '';
  const iva = p.iva === 'incluido' ? 'IVA incluido' : '+ IVA';
  if (p.moneda === 'UF') {
    return {
      principal: `${desde}UF ${CLP.format(p.valor)}${periodo}`,
      detalle: `≈ ${pesos(p.valor * SITIO.uf)} ${p.iva === 'incluido' ? 'IVA incluido' : '+ IVA'}`,
    };
  }
  return { principal: `${desde}${pesos(p.valor)}${periodo}`, detalle: iva };
}

/** URL absoluta a partir de una ruta del sitio. */
export const absoluta = (ruta) => SITIO.dominio + (ruta === '/' ? '/' : ruta);
