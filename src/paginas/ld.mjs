// @ts-check
// Datos estructurados (schema.org). Salen de las mismas fuentes que el
// contenido visible, así nunca dicen algo distinto de la página.
import { SITIO } from '../config.mjs';
import { SERVICIOS } from '../datos/oferta.mjs';
import { absoluta, precioTexto, plano } from '../html.mjs';

const ORG_ID = SITIO.dominio + '/#organizacion';

export function organizacion() {
  return {
    '@type': 'ProfessionalService',
    '@id': ORG_ID,
    name: SITIO.marca,
    alternateName: `${SITIO.marca} · ${SITIO.linea}`,
    url: SITIO.dominio + '/',
    logo: SITIO.dominio + '/apple-touch-icon.png',
    image: SITIO.dominio + '/og-image.png',
    description: 'Automatización e inteligencia operacional para empresas: automatización de procesos, inteligencia de datos y desarrollo a medida, medidos antes y después.',
    email: SITIO.contacto.email,
    telephone: '+' + SITIO.contacto.whatsapp,
    areaServed: { '@type': 'Country', name: 'Chile' },
    address: { '@type': 'PostalAddress', addressLocality: SITIO.empresa.ciudad, addressCountry: 'CL' },
    founder: { '@type': 'Person', name: SITIO.fundador.nombre },
    sameAs: [SITIO.sitioMatriz],
  };
}

export function sitioWeb() {
  return { '@type': 'WebSite', '@id': SITIO.dominio + '/#sitio', url: SITIO.dominio + '/', name: `${SITIO.marca} · ${SITIO.linea}`, inLanguage: SITIO.idioma, publisher: { '@id': ORG_ID } };
}

/** @param {[string, string][]} tramos pares [nombre, ruta], sin el inicio */
export function migas(tramos) {
  const items = [['Inicio', '/'], ...tramos];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, ruta], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absoluta(ruta) })),
  };
}

/**
 * Oferta de un servicio desde la fuente única de precios, en su moneda real:
 * los precios en UF se declaran en CLF (código ISO 4217 de la Unidad de
 * Fomento), así el dato estructurado no queda desactualizado con el peso.
 */
function oferta(id) {
  const s = SERVICIOS[id];
  const p = s.precio;
  const moneda = p.moneda === 'UF' ? 'CLF' : 'CLP';
  /** @type {Record<string, unknown>} */
  const spec = {
    '@type': p.periodo === 'mes' ? 'UnitPriceSpecification' : 'PriceSpecification',
    priceCurrency: moneda,
    valueAddedTaxIncluded: p.iva === 'incluido',
    [p.desde ? 'minPrice' : 'price']: String(p.valor),
  };
  if (p.periodo === 'mes') Object.assign(spec, { unitCode: 'MON', unitText: 'mes' });
  const t = precioTexto(p);
  return {
    '@type': 'Offer',
    name: s.nombre,
    url: absoluta(s.url.split('#')[0]),
    priceCurrency: moneda,
    ...(p.desde ? {} : { price: String(p.valor) }),
    priceSpecification: spec,
    description: `${plano(s.resumen)} ${t.principal.replace(/^desde/, 'Desde')}, ${p.iva === 'incluido' ? 'IVA incluido' : 'más IVA'}.${p.nota ? ' ' + p.nota + '.' : ''}`,
  };
}

/**
 * @param {{ nombre: string, tipo: string, descripcion: string, ruta: string, ofertas: string[], area?: 'Chile'|'Santiago' }} o
 */
export function servicio(o) {
  return {
    '@type': 'Service',
    name: o.nombre,
    serviceType: o.tipo,
    description: o.descripcion,
    url: absoluta(o.ruta),
    provider: { '@id': ORG_ID },
    areaServed: o.area === 'Santiago' ? { '@type': 'City', name: 'Santiago' } : { '@type': 'Country', name: 'Chile' },
    offers: o.ofertas.map(oferta),
  };
}

/** @param {{ q: string, a: string }[]} lista */
export function faq(lista) {
  return {
    '@type': 'FAQPage',
    mainEntity: lista.map((p) => ({ '@type': 'Question', name: p.q, acceptedAnswer: { '@type': 'Answer', text: plano(p.a) } })),
  };
}

/**
 * Página informativa (p. ej. privacidad).
 * @param {{ nombre: string, ruta: string, fecha?: string }} o
 */
export function paginaWeb(o) {
  return {
    '@type': 'WebPage',
    '@id': absoluta(o.ruta) + '#pagina',
    url: absoluta(o.ruta),
    name: o.nombre,
    inLanguage: SITIO.idioma,
    isPartOf: { '@id': SITIO.dominio + '/#sitio' },
    publisher: { '@id': ORG_ID },
    ...(o.fecha ? { dateModified: o.fecha } : {}),
  };
}
