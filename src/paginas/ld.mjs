// @ts-check
// Datos estructurados (schema.org). Salen de las mismas fuentes que el
// contenido visible, así nunca dicen algo distinto de la página.
import { SITIO } from '../config.mjs';
import { SERVICIOS } from '../datos/oferta.mjs';
import { absoluta } from '../html.mjs';

const ORG_ID = SITIO.dominio + '/#organizacion';

export function organizacion() {
  return {
    '@type': 'ProfessionalService',
    '@id': ORG_ID,
    name: SITIO.marca,
    alternateName: `${SITIO.marca} · ${SITIO.linea}`,
    legalName: SITIO.empresa.razonSocial,
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

/** Oferta de un servicio en pesos, desde la fuente única de precios. */
function oferta(id) {
  const p = SERVICIOS[id].precio;
  const valor = p.moneda === 'UF' ? p.valor * SITIO.uf : p.valor;
  const iva = p.iva === 'incluido' ? 'IVA incluido' : 'más IVA';
  return {
    '@type': 'Offer',
    name: SERVICIOS[id].nombre,
    price: String(Math.round(valor)),
    priceCurrency: 'CLP',
    description: `${p.desde ? 'Desde ' : ''}${p.moneda === 'UF' ? 'UF ' + p.valor : '$' + p.valor.toLocaleString('es-CL')}${p.periodo === 'mes' ? ' al mes' : ''}, ${iva}.${p.nota ? ' ' + p.nota + '.' : ''}`,
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
    mainEntity: lista.map((p) => ({ '@type': 'Question', name: p.q, acceptedAnswer: { '@type': 'Answer', text: p.a.replace(/\*/g, '') } })),
  };
}
