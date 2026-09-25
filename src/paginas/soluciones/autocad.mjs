// @ts-check
// Landing de alta intención: automatización en AutoCAD con IA.
// Evidencia: caso C-03 (cliente confidencial). Sin exagerar: la cifra mide
// ritmo de iteración, no ahorro, y el criterio de diseño sigue siendo humano.
import { FUENTES } from '../../datos/whatsapp.mjs';
import { solucion } from '../../datos/soluciones.mjs';
import { caso } from '../../datos/casos.mjs';
import { esc } from '../../html.mjs';
import { evaluar, encabezado } from '../../componentes/base.mjs';
import { heroServicio, preguntas, flujoCaso, etiqueta } from '../../componentes/secciones.mjs';
import { prosa, ctaContenido, relacionados } from '../../componentes/articulo.mjs';
import { migas, servicio, faq } from '../ld.mjs';

const sol = solucion('/automatizacion-autocad');
const c03 = caso('planos-autocad');

const FAQ_CAD = [
  { q: '¿Funciona con AutoCAD LT?',
    a: 'Solo en parte. Las integraciones más completas usan las interfaces de programación de AutoCAD completo o de sus verticales, como Civil 3D. AutoCAD LT admite una automatización más limitada. Lo revisamos con tu versión antes de cotizar.' },
  { q: '¿Nuestros planos salen de la empresa?',
    a: 'Te decimos por escrito qué se envía a un modelo de IA y qué no. Las instrucciones y la información del plano que el modelo necesita para ubicar cada cambio (por ejemplo, nombres de capas o coordenadas) se procesan externamente; el archivo .dwg se abre y se modifica en tus equipos. Firmamos confidencialidad antes de ver cualquier plano.' },
  { q: '¿Qué pasa si la IA interpreta mal una instrucción?',
    a: 'Cada cambio se aplica sobre una nueva versión del archivo, con registro de lo que se hizo, y se revisan superposiciones y cotas antes de entregar. Si algo no calza, se descarta esa versión. Nada reemplaza la revisión del profesional a cargo.' },
  { q: '¿Sirve para Revit u otros programas BIM?',
    a: 'No lo hemos hecho en Revit. La experiencia que podemos mostrar es en AutoCAD y Civil 3D. Si tu flujo es BIM, lo conversamos, pero no te vamos a prometer algo que no hemos construido.' },
];

const SECCIONES = [
  { id: 'que-se-automatiza', titulo: 'Qué se puede automatizar en un plano', html: `
    <ul>
      <li><b>Cambios geométricos repetitivos:</b> mover o redimensionar muros, insertar o reubicar equipos, ajustar distancias.</li>
      <li><b>Capas y bloques:</b> crear, renombrar, ordenar y aplicar propiedades de forma consistente.</li>
      <li><b>Cotas:</b> volver a acotar después de un cambio, que es lo que más tiempo consume en cada revisión.</li>
      <li><b>Cuadros y tablas:</b> exportar el cuadro de equipos o los atributos de los bloques a Excel, sin transcribir.</li>
      <li><b>Controles entre versiones:</b> revisar superposiciones y cotas antes de entregar una nueva versión.</li>
      <li><b>Variantes de un mismo layout</b> para comparar alternativas con el mandante.</li>
    </ul>` },
  { id: 'como-funciona', titulo: 'Cómo funciona la conexión', html: `
    <p>Un modelo de lenguaje recibe la instrucción en español ("mueve la línea de envasado 2 metros al norte y actualiza el cuadro de equipos"), la traduce en operaciones concretas y un programa las aplica sobre el archivo real mediante las interfaces de AutoCAD. La conexión entre el modelo y AutoCAD usa MCP, un <a href="https://modelcontextprotocol.io" rel="noopener" target="_blank">protocolo abierto para conectar modelos de IA con herramientas</a>.</p>
    <p>El modelo propone; el programa aplica solo operaciones permitidas; cada versión queda guardada. Nunca se trabaja sobre el único archivo existente.</p>` },
  { id: 'supervision', titulo: 'Qué sigue necesitando a un profesional', html: `
    <ul>
      <li><b>El criterio de diseño:</b> dónde va cada equipo, flujos, accesos y seguridad.</li>
      <li><b>La normativa</b> y cualquier cálculo que respalde el diseño.</li>
      <li><b>La revisión y la firma</b> de los planos que se entregan.</li>
    </ul>
    <p>La automatización reduce el trabajo mecánico de redibujar, acotar y transcribir. La decisión sigue siendo de quien firma.</p>` },
  { id: 'limitaciones', titulo: 'Limitaciones honestas', html: `
    <ul>
      <li><b>Depende de cómo está dibujado el plano.</b> Con capas ordenadas y bloques con atributos funciona bien; un dibujo "explotado", con líneas sueltas, rinde mucho menos.</li>
      <li><b>Las instrucciones ambiguas se confirman</b> antes de aplicarlas; no se adivina.</li>
      <li><b>No es para planos de una sola versión.</b> El valor aparece cuando hay muchas iteraciones o variantes.</li>
      <li><b>Solo tenemos un caso</b> entregado, y la cifra que mostramos mide ritmo de iteración, no ahorro.</li>
    </ul>` },
  { id: 'para-quien', titulo: 'Para quién tiene sentido', html: `
    <p>Oficinas de ingeniería y arquitectura, y áreas técnicas de empresas industriales, que hacen muchas revisiones de un mismo layout o mantienen cuadros de equipos que se desactualizan con cada cambio. Si tu caso es distinto, lo conversamos y te decimos si aplica.</p>` },
];

export default {
  ruta: sol.ruta,
  archivo: 'automatizacion-autocad.html',
  prioridad: '0.8',
  titulo: 'Automatización en AutoCAD con IA: cambios en planos | ANVAR TECH',
  og: { titulo: '8 versiones de un plano en 5 días', bajada: 'Automatización en AutoCAD: cambios pedidos en español, aplicados sobre el .dwg real', etiqueta: 'Caso real C-03' },
  descripcion: 'Cambios en planos de AutoCAD pedidos en español y aplicados sobre el .dwg real: cotas, capas y cuadros de equipos a Excel, con revisión profesional.',
  contextoWsp: 'piloto',
  fuente: FUENTES.autocad,
  jsonld: [
    migas([[sol.nombre, sol.ruta]]),
    servicio({ nombre: 'Automatización en AutoCAD con IA', tipo: 'Automatización de diseño y dibujo técnico', ruta: sol.ruta, ofertas: ['piloto', 'implementacion'], descripcion: 'Conexión entre AutoCAD y un modelo de IA para aplicar cambios por instrucción sobre el archivo real, acotar, ordenar capas y exportar cuadros de equipos, con revisión profesional.' }),
    faq(FAQ_CAD),
  ],
  cuerpo: () => `
${heroServicio({
  sobretitulo: 'Automatización en AutoCAD',
  h1: 'Automatización en AutoCAD: cambios en el plano pedidos en español',
  lead: 'Conectamos AutoCAD con un modelo de IA para que los cambios repetitivos —mover, acotar, ordenar capas, actualizar el cuadro de equipos— se pidan en español y se apliquen sobre el archivo .dwg real. *El criterio y la firma siguen siendo del profesional.*',
  contexto: 'autocad',
  migas: [[sol.nombre, sol.ruta]],
  ficha: [['Caso real', '8 versiones en 5 días'], ['Archivo', '.dwg real'], ['Salida', 'Cuadro de equipos en Excel'], ['Revisión', 'Profesional, siempre']],
})}
<section class="seccion seccion--panel" aria-labelledby="c03-tit">
  <div class="contenedor contenedor--prosa">
    ${encabezado({ codigo: `Caso real ${c03.codigo}`, titulo: c03.titulo, id: 'c03-tit', bajada: c03.contexto })}
    <p class="caso-meta">${etiqueta(c03)}<span class="caso-estado">${esc(c03.estado)}</span></p>
    ${flujoCaso(c03)}
    <p class="caso-resultado caso-resultado--grande"><span class="caso-resultado-v">${esc(c03.resultado.valor)}</span> <span>${esc(c03.resultado.texto)}</span></p>
    <p class="alcance"><b>Alcance de la cifra.</b> ${esc(c03.disclaimer ?? '')}</p>
    <p class="herr-enlaces"><a href="/casos#planos-autocad" data-track="case_cta_click" data-track-label="autocad-caso">Ver el caso con el detalle técnico</a></p>
  </div>
</section>
<section class="seccion" aria-label="Automatización en AutoCAD">
  <div class="contenedor contenedor--prosa">
    ${prosa(SECCIONES)}
    ${ctaContenido({
      titulo: '¿Muchas revisiones del mismo plano?',
      texto: 'Muéstranos un plano de ejemplo (no tiene que ser el real) y cómo son las revisiones. Te decimos qué parte se puede automatizar con tu versión de AutoCAD.',
      botones: [
        { wsp: 'piloto', texto: 'Conversar por WhatsApp', etiqueta: 'autocad-wsp' },
        { href: '#evaluar', texto: 'Evaluar mi proceso', variante: 'secundario', etiqueta: 'autocad-evaluar' },
      ],
    })}
  </div>
</section>
${preguntas(FAQ_CAD, { titulo: 'Preguntas sobre automatización en AutoCAD' })}
${relacionados(['/casos', '/recursos/ia-vs-automatizacion-tradicional', 'piloto', 'implementacion'])}
${evaluar({ contexto: 'piloto', tipo: 'diagnostico', titulo: 'Revisemos tu flujo de planos', bajada: 'Veinte minutos, sin costo. Te decimos qué se puede automatizar con tu versión de AutoCAD y qué no.' })}
`,
};
