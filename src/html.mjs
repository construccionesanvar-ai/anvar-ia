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
 * ¿La UF de referencia de config.mjs sigue vigente? Pasado `vigenciaDias`
 * el sitio deja de mostrar pesos para los precios en UF.
 * @param {Date} [hoy]
 */
export function ufVigente(hoy = new Date()) {
  const desde = new Date(SITIO.uf.fecha + 'T12:00:00-03:00').getTime();
  return (hoy.getTime() - desde) / 86_400_000 <= SITIO.uf.vigenciaDias;
}

/**
 * @typedef {{ moneda: 'UF'|'CLP', valor: number, desde?: boolean,
 *   iva: 'mas'|'incluido', periodo?: 'mes'|null, nota?: string }} Precio
 */

/** Texto del IVA según el precio. */
export const textoIva = (p) => (p.iva === 'incluido' ? 'IVA incluido' : '+ IVA');

/**
 * Presentación de un precio en dos partes: la principal y el detalle.
 * Regla del sitio: proyectos y mensualidades de empresa en UF, con su
 * equivalente en pesos solo mientras la UF de referencia esté vigente;
 * servicios de entrada y de personas en pesos.
 * @param {Precio} p
 * @param {{ hoy?: Date }} [o]
 * @returns {{ principal: string, detalle: string, clp: number | null }}
 */
export function precioTexto(p, o = {}) {
  const desde = p.desde ? 'desde ' : '';
  const periodo = p.periodo === 'mes' ? ' / mes' : '';
  if (p.moneda === 'UF') {
    const vigente = ufVigente(o.hoy);
    const clp = p.valor * SITIO.uf.valor;
    return {
      principal: `${desde}UF ${miles(p.valor)}${periodo}`,
      detalle: vigente ? `≈ ${pesos(clp)} ${textoIva(p)}` : textoIva(p),
      clp: vigente ? clp : null,
    };
  }
  return { principal: `${desde}${pesos(p.valor)}${periodo}`, detalle: textoIva(p), clp: p.valor };
}

/** Nota que acompaña a los precios en UF: de dónde sale el valor en pesos. */
export function notaUf(o = {}) {
  return ufVigente(o.hoy)
    ? `Equivalencia en pesos referencial, con UF de ${pesos(SITIO.uf.valor)} al ${fechaCorta(SITIO.uf.fecha)}.`
    : 'Precios en UF. El valor en pesos se calcula con la UF del día de la factura.';
}

/** URL absoluta a partir de una ruta del sitio. */
export const absoluta = (ruta) => SITIO.dominio + (ruta === '/' ? '/' : ruta);
