// @ts-check
// Utilidades para armar HTML de forma segura y formatear precios.
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

/** Quita las marcas de énfasis (*así*) para texto plano: JSON-LD, metadatos. */
export const plano = (v) => String(v ?? '').replace(/\*/g, '');

/** Atributos a partir de un objeto; ignora null, undefined y false. */
export function attrs(o) {
  return Object.entries(o)
    .filter(([, v]) => v !== null && v !== undefined && v !== false)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`))
    .join('');
}

const CLP = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });
export const miles = (n) => CLP.format(Math.round(n));
export const pesos = (n) => '$' + miles(n);

/** 'AAAA-MM-DD' → 'DD/MM/AAAA'. */
export function fechaCorta(iso) {
  const [a, m, d] = String(iso).split('-');
  return `${d}/${m}/${a}`;
}

/**
 * @typedef {{ moneda: 'UF'|'CLP', valor: number, desde?: boolean,
 *   iva: 'mas'|'incluido', periodo?: 'mes'|null, nota?: string }} Precio
 */

/** Texto del IVA según el precio. */
export const textoIva = (p) => (p.iva === 'incluido' ? 'IVA incluido' : '+ IVA');

/**
 * Presentación de un precio en dos partes: la principal y el detalle.
 * Regla del sitio: proyectos y mensualidades de empresa en UF; servicios de
 * entrada y de personas en pesos. El HTML NUNCA trae la equivalencia en pesos
 * de un precio en UF: una cifra fija envejece al día siguiente. La agrega el
 * navegador con la UF del día (/api/uf), con su fecha a la vista; si no hay
 * UF del día, queda solo el precio en UF.
 * @param {Precio} p
 * @returns {{ principal: string, detalle: string }}
 */
export function precioTexto(p) {
  const desde = p.desde ? 'desde ' : '';
  const periodo = p.periodo === 'mes' ? ' / mes' : '';
  if (p.moneda === 'UF') return { principal: `${desde}UF ${miles(p.valor)}${periodo}`, detalle: textoIva(p) };
  return { principal: `${desde}${pesos(p.valor)}${periodo}`, detalle: textoIva(p) };
}

/** Nota que acompaña a los precios en UF (el navegador le agrega la UF del día). */
export const notaUf = () => 'Los precios en UF se facturan con la UF del día de la factura.';

/**
 * Cifra de ejemplo (ilustrativa, no un precio). El QA revisa que todo monto
 * visible salga de la fuente única de precios; los que van marcados con esto
 * quedan fuera de esa revisión porque son ejemplos de cálculo.
 */
export const ej = (texto) => `<span class="cifra-ej">${esc(texto)}</span>`;

/** Imagen para compartir de una página: /og/<ruta-con-guiones>.png (la genera scripts/og.mjs). */
export const rutaOg = (ruta) => `/og/${ruta === '/' ? 'inicio' : ruta.replace(/^\//, '').replace(/\//g, '-')}.png`;

/** URL absoluta a partir de una ruta del sitio. */
export const absoluta = (ruta) => SITIO.dominio + (ruta === '/' ? '/' : ruta);

/**
 * Elementos de bloque: entre ellos el navegador separa visualmente, pero el
 * texto del DOM (textContent, lo que leen extractores y buscadores) los pega:
 * "RUT77.982.517-5", "SolucionesCasos". separarBloques() agrega un salto de
 * línea en esos bordes. No cambia cómo se ve: entre bloques y dentro de
 * flex/grid el espacio en blanco no se dibuja.
 */
const BLOQUES = 'address|article|aside|blockquote|dd|details|div|dl|dt|figcaption|figure|footer|form|fieldset|h[1-6]|header|legend|li|main|nav|ol|p|section|summary|table|tbody|thead|tfoot|tr|td|th|ul';
const CIERRE_BLOQUE = new RegExp(`(</(?:${BLOQUES})>)(?=<)`, 'g');
const ANTES_DE_BLOQUE = new RegExp(`>(?=<(?:${BLOQUES})[\\s>])`, 'g');
export function separarBloques(html) {
  // No se toca el interior de <script>, <pre> ni <textarea>: ahí el texto es literal.
  return html.split(/(<(?:script|pre|textarea)\b[\s\S]*?<\/(?:script|pre|textarea)>)/).map((parte, i) => (i % 2
    ? parte
    : parte.replace(CIERRE_BLOQUE, '$1\n').replace(ANTES_DE_BLOQUE, '>\n'))).join('');
}
