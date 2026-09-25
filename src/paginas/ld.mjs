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
    logo: { '@type': 'ImageObject', url: SITIO.dominio + '/logo-512.png', width: 512, height: 512 },
    image: SITIO.dominio + '/og-image.png',
    description: 'Automatización de procesos, software, datos e IA aplicada a las operaciones de empresas en Chile. Cada proceso se mide antes y después.',
    email: SITIO.contacto.email,
    telephone: '+' + SITIO.contacto.whatsapp,
    contactPoint: [{
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: '+' + SITIO.contacto.whatsapp,
      email: SITIO.contacto.email,
      areaServed: 'CL',
      availableLanguage: ['es'],
    }],
    areaServed: { '@type': 'Country', name: 'Chile' },
    address: { '@type': 'PostalAddress', addressLocality: SITIO.empresa.ciudad, addressRegion: 'Región Metropolitana', addressCountry: 'CL' },
    founder: { '@type': 'Person', name: SITIO.fundador.nombre, jobTitle: SITIO.fundador.cargo },
    knowsAbout: ['Automatización de procesos', 'Automatización documental', 'Automatización de Excel', 'Inteligencia de datos', 'Gestión de inventario', 'Integración con AutoCAD', 'Inteligencia artificial aplicada a operaciones'],
    sameAs: [SITIO.sitioMatriz, ...SITIO.redes.map((r) => r.url)],
  };
}

/** Persona autora de los contenidos (el fundador, real). */
export function autorLd() {
  return { '@type': 'Person', name: SITIO.fundador.nombre, jobTitle: SITIO.fundador.cargo, url: SITIO.dominio + '/#nosotros', worksFor: { '@id': ORG_ID } };
}

/**
 * Artículo o caso: autor, fechas e imagen para compartir.
 * @param {{ titulo: string, descripcion: string, ruta: string, publicado: string, actualizado: string, imagen: string, tipo?: 'Article'|'TechArticle' }} o
 */
export function articulo(o) {
  return {
    '@type': o.tipo ?? 'Article',
    '@id': absoluta(o.ruta) + '#articulo',
    headline: o.titulo,
    description: o.descripcion,
    url: absoluta(o.ruta),
    mainEntityOfPage: absoluta(o.ruta),
    image: SITIO.dominio + o.imagen,
    datePublished: o.publicado,
    dateModified: o.actualizado,
    inLanguage: SITIO.idioma,
    author: autorLd(),
    publisher: { '@id': ORG_ID },
  };
}

/**
 * Herramienta gratuita que funciona en el navegador. Sin calificaciones.
 * @param {{ nombre: string, descripcion: string, ruta: string }} o
 */
export function aplicacionWeb(o) {
  return {
    '@type': 'WebApplication',
    name: o.nombre,
    description: o.descripcion,
    url: absoluta(o.ruta),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Cualquiera (funciona en el navegador)',
    inLanguage: SITIO.idioma,
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'CLP' },
    provider: { '@id': ORG_ID },
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
