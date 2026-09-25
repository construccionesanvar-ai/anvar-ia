// @ts-check
// Índice de recursos: herramientas gratuitas, guías, casos y soluciones.
import { FUENTES } from '../../datos/whatsapp.mjs';
import { SOLUCIONES } from '../../datos/soluciones.mjs';
import { RECURSOS } from '../../datos/recursos.mjs';
import { absoluta, esc } from '../../html.mjs';
import { evaluar } from '../../componentes/base.mjs';
import { migasVisibles } from '../../componentes/secciones.mjs';
import { listaRecursos } from '../../componentes/articulo.mjs';
import { migas } from '../ld.mjs';
import { SITIO } from '../../config.mjs';

const tarjetasSoluciones = () => `<ul class="relacionados relacionados--indice">${SOLUCIONES.map((s) => `<li><a href="${s.ruta}" data-track="content_cta_click" data-track-label="recursos-${s.ruta.slice(1)}"><span class="rel-tipo">Solución</span><span class="rel-tit">${esc(s.nombre)}</span><span class="rel-txt">${esc(s.texto)}</span></a></li>`).join('')}</ul>`;

export default {
  ruta: '/recursos',
  archivo: 'recursos.html',
  prioridad: '0.8',
  titulo: 'Recursos gratuitos para automatizar procesos | ANVAR TECH',
  og: { titulo: 'Herramientas y guías para automatizar procesos', bajada: 'Calculadora de ROI, autodiagnóstico, plantilla Excel y guías prácticas · gratis', etiqueta: 'Recursos gratuitos' },
  descripcion: 'Calculadora de ROI, autodiagnóstico, plantilla Excel, punto de pedido y guías prácticas para decidir qué automatizar. Gratis y sin registro.',
  contextoWsp: 'general',
  fuente: FUENTES.resources,
  jsonld: [
    migas([['Recursos', '/recursos']]),
    {
      '@type': 'CollectionPage',
      '@id': absoluta('/recursos') + '#pagina',
      url: absoluta('/recursos'),
      name: 'Recursos y herramientas para automatizar procesos',
      inLanguage: SITIO.idioma,
      isPartOf: { '@id': SITIO.dominio + '/#sitio' },
      hasPart: RECURSOS.map((r) => ({ '@type': r.tipo === 'herramienta' ? 'WebApplication' : 'Article', name: r.titulo, url: absoluta(r.ruta) })),
    },
  ],
  cuerpo: () => `
<section class="hero hero--servicio" aria-labelledby="hero-tit">
  <div class="contenedor">
    ${migasVisibles([['Recursos', '/recursos']])}
    <div class="hero-servicio">
      <p class="sobretitulo">Recursos gratuitos · sin registro</p>
      <h1 id="hero-tit">Herramientas y guías para decidir qué automatizar</h1>
      <p class="lead">Lo que usamos nosotros para evaluar un proceso, abierto para que lo uses sin hablar con nadie: calcular cuánto cuesta, saber si está listo y entender qué tecnología conviene.</p>
    </div>
  </div>
</section>
<section class="seccion" aria-label="Recursos">
  <div class="contenedor">
    <div class="recursos-grupo" aria-labelledby="g-herr"><h2 id="g-herr">Herramientas gratuitas</h2>${listaRecursos((r) => r.tipo === 'herramienta' || r.tipo === 'plantilla')}</div>
    <div class="recursos-grupo" aria-labelledby="g-guias"><h2 id="g-guias">Guías prácticas</h2>${listaRecursos((r) => r.tipo === 'guia')}</div>
    <div class="recursos-grupo" aria-labelledby="g-casos"><h2 id="g-casos">Casos en detalle</h2>${listaRecursos((r) => r.tipo === 'caso')}<p class="herr-enlaces"><a href="/casos" data-track="case_cta_click" data-track-label="recursos-casos">Ver todos los casos reales, con su etiqueta</a></p></div>
    <div class="recursos-grupo" aria-labelledby="g-sol"><h2 id="g-sol">Soluciones por tipo de proceso</h2>${tarjetasSoluciones()}</div>
    <p class="nota">Suscríbete a las guías nuevas con cualquier lector RSS: <a href="/feed.xml">ia.anvartech.cl/feed.xml</a>.</p>
  </div>
</section>
${evaluar({ contexto: 'general', tipo: 'express' })}
`,
};
