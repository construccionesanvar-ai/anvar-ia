// @ts-check
// Landing de alta intención: automatización documental.
// Intención: "automatización documental / generar documentos automáticamente /
// automatizar Word, Excel y PDF". Evidencia: caso C-01.
import { SERVICIOS } from '../../datos/oferta.mjs';
import { FUENTES } from '../../datos/whatsapp.mjs';
import { solucion } from '../../datos/soluciones.mjs';
import { caso } from '../../datos/casos.mjs';
import { precioTexto, esc } from '../../html.mjs';
import { evaluar, encabezado } from '../../componentes/base.mjs';
import { heroServicio, preguntas, precioLinea, tarjetaPrueba, flujoCaso } from '../../componentes/secciones.mjs';
import { prosa, ctaContenido, relacionados } from '../../componentes/articulo.mjs';
import { migas, servicio, faq } from '../ld.mjs';

const sol = solucion('/automatizacion-documental');
const c01 = caso('documentos-legales');
const ex = SERVICIOS.express;
const exPrecio = `${precioTexto(ex.precio).principal} ${precioTexto(ex.precio).detalle}`;

const FAQ_DOC = [
  { q: '¿Funciona con las plantillas que ya usamos?',
    a: 'Sí, y es lo recomendable: se toma tu plantilla Word o Excel actual, se marcan los campos que cambian y el documento sale con el mismo formato de siempre. Si el formato es oficial, no se toca.' },
  { q: '¿Y si los PDF que recibimos vienen en formatos distintos?',
    a: 'Si vienen de pocos emisores con formato estable, se leen con reglas. Si cambian mucho, se usa un modelo que interpreta el documento, y los campos dudosos quedan marcados para que una persona los revise antes de continuar.' },
  { q: '¿Necesita internet?',
    a: 'No necesariamente. En el caso C-01 la lectura de boletas y la generación de documentos funcionan sin conexión, en el computador de quien lo usa. Cuando conviene usar un servicio externo, te decimos antes qué datos salen de tu red.' },
  { q: '¿Qué pasa con la firma y la validez de los documentos?',
    a: 'La automatización prepara el documento; la firma y la responsabilidad siguen siendo de quien la tiene hoy. Si el documento tiene efecto legal, una persona lo revisa antes de que salga.' },
  { q: '¿Cuánto cuesta?',
    a: `Un proceso documental bien delimitado suele caber en una Automatización Express, ${exPrecio}, con alcance y precio fijo por escrito antes de partir. Si son varios procesos o sistemas, conviene partir por un diagnóstico.` },
];

const SECCIONES = [
  { id: 'que-documentos', titulo: 'Qué documentos se pueden generar solos', html: `
    <p>Cualquier documento que tenga la misma estructura cada vez y cambie solo en sus datos. Los casos más comunes:</p>
    <ul>
      <li><b>De Excel a Word:</b> una fila de la planilla genera el contrato, el certificado o el acta, con el formato de tu empresa.</li>
      <li><b>De formulario a Word y PDF:</b> se ingresan los datos una vez y salen todos los documentos del trámite, listos para imprimir o enviar.</li>
      <li><b>De PDF a Excel:</b> facturas, órdenes de compra o guías en PDF se leen y sus datos se cargan en la planilla o el sistema.</li>
      <li><b>Consolidación:</b> varios documentos o planillas se juntan en un solo informe sin copiar y pegar.</li>
      <li><b>Generación masiva:</b> cien certificados, cartas o informes con datos distintos en minutos.</li>
    </ul>` },
  { id: 'como-funciona', titulo: 'Cómo funciona por dentro, explicado simple', html: `
    <ol>
      <li><b>Los datos entran una sola vez</b>, desde un formulario, una planilla o la lectura de un documento (una foto o un PDF).</li>
      <li><b>Se validan antes de seguir:</b> campos obligatorios, formatos de RUT y fechas, totales que cuadran. Si algo falla, no se genera nada.</li>
      <li><b>Las plantillas tienen marcadores</b> donde va cada dato. Un programa los reemplaza y guarda el Word y el PDF de cada documento.</li>
      <li><b>Queda un registro:</b> historial editable, respaldos y, si el proceso lo requiere, registro de quién generó qué.</li>
    </ol>
    <p>La inteligencia artificial entra solo donde aporta: <b>leer</b> documentos que no vienen ordenados, como una boleta fotografiada. Llenar una plantilla no necesita IA; lo hace mejor una regla, porque no se equivoca. Explicamos esa diferencia en <a href="/recursos/ia-vs-automatizacion-tradicional">IA o automatización tradicional</a>.</p>` },
  { id: 'que-necesitas', titulo: 'Qué necesitas para partir', html: `
    <ul>
      <li>Las plantillas que usan hoy, aunque estén desordenadas.</li>
      <li>Cinco a diez ejemplos reales, incluido alguno con errores o casos raros.</li>
      <li>Quien hace el proceso, una hora para mostrarlo.</li>
    </ul>
    <p>Con eso te enviamos el alcance y el precio fijo por escrito. No cobramos nada antes de que lo apruebes.</p>` },
  { id: 'limites', titulo: 'Lo que no te vamos a prometer', html: `
    <ul>
      <li><b>Lectura perfecta de documentos.</b> La lectura de una foto o un PDF depende de su calidad. Por eso los datos dudosos se marcan para revisión y no se generan documentos incompletos.</li>
      <li><b>Cero intervención humana</b> en documentos con efecto legal o financiero: la automatización prepara, una persona aprueba.</li>
      <li><b>Que sirva para cualquier documento:</b> si cada uno se redacta distinto, no es un proceso automatizable con plantillas.</li>
    </ul>` },
];

export default {
  ruta: sol.ruta,
  archivo: 'automatizacion-documental.html',
  prioridad: '0.9',
  titulo: 'Automatización documental: Word, Excel y PDF sin digitar | ANVAR TECH',
  og: { titulo: 'De 45 a 4 minutos por procedimiento', bajada: 'Automatización documental: Word, Excel y PDF desde un solo ingreso de datos', etiqueta: 'Caso real C-01' },
  descripcion: 'Generamos documentos Word, Excel y PDF desde un solo ingreso de datos, con validaciones y revisión humana. Caso real: de 45 a 4 minutos por procedimiento.',
  contextoWsp: 'express',
  fuente: FUENTES.documental,
  jsonld: [
    migas([[sol.nombre, sol.ruta]]),
    servicio({ nombre: 'Automatización documental', tipo: 'Automatización documental', ruta: sol.ruta, ofertas: ['express', 'diagnostico'], descripcion: 'Generación automática de documentos Word, Excel y PDF desde un solo ingreso de datos, lectura de documentos y consolidación, con validaciones y revisión humana.' }),
    faq(FAQ_DOC),
  ],
  cuerpo: () => `
${heroServicio({
  sobretitulo: 'Automatización documental',
  h1: 'Automatización documental: los mismos datos, una sola vez',
  lead: 'Si tu equipo llena varios documentos con los mismos datos, ese trabajo se puede automatizar: se ingresa una vez, se valida y se generan todos los documentos. *En un caso real, un procedimiento pasó de 45 a 4 minutos.*',
  contexto: 'documental',
  migas: [[sol.nombre, sol.ruta]],
  ficha: [['Desde', precioLinea('express')], ['Formatos', 'Word, Excel, PDF'], ['Caso real', '45 → 4 min'], ['Revisión', 'Humana donde importa']],
})}
<section class="seccion seccion--panel" aria-labelledby="c01-tit">
  <div class="contenedor">
    ${encabezado({ codigo: `Caso real ${c01.codigo}`, titulo: 'Ocho documentos oficiales desde un solo ingreso de datos', id: 'c01-tit', bajada: 'Un proyecto propio en operación diaria: prevención de pérdidas en un local de una cadena de retail.' })}
    <div class="doc-caso">
      ${tarjetaPrueba(c01)}
      <div>
        ${flujoCaso(c01)}
        <p class="nota">${esc(c01.disclaimer ?? '')}</p>
        <p class="herr-enlaces"><a href="/casos/automatizacion-documental-retail" data-track="case_cta_click" data-track-label="documental-caso-largo">Leer el caso completo: arquitectura, limitaciones y qué aprendimos</a></p>
      </div>
    </div>
  </div>
</section>
<section class="seccion" aria-label="Cómo se automatizan los documentos">
  <div class="contenedor contenedor--prosa">
    ${prosa(SECCIONES)}
    ${ctaContenido({
      titulo: '¿Cuántas veces a la semana llenan los mismos datos?',
      texto: 'Si es un proceso documental puntual, probablemente cabe en una Automatización Express: alcance y precio fijo antes de partir, funcionando en tus equipos y con 30 días de corrección de fallas.',
      botones: [
        { wsp: 'express', texto: 'Solicitar Automatización Express', etiqueta: 'documental-express' },
        { href: '/calculadora-roi-automatizacion', texto: 'Calcular el ahorro', variante: 'secundario', etiqueta: 'documental-calculadora' },
      ],
    })}
  </div>
</section>
${preguntas(FAQ_DOC, { titulo: 'Preguntas sobre automatización documental' })}
${relacionados(['/casos/automatizacion-documental-retail', '/automatizar-excel', 'express', '/calculadora-roi-automatizacion'])}
${evaluar({ contexto: 'express', tipo: 'express', titulo: '¿Qué documentos llenan a mano?', bajada: 'Cuéntanos cuáles son. En 20 minutos te decimos si se pueden generar solos y cuánto costaría.' })}
`,
};
