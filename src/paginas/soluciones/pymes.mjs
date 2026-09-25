// @ts-check
// Landing de alta intención: automatización de procesos para pymes.
// Intención principal: "automatización de procesos pymes / empresas Chile".
// No compite con la portada (marca) ni con /automatizacion-procesos-ia
// (servicio de piloto e implementación): ver docs/SEO_CONTENT_MAP.md.
import { SERVICIOS } from '../../datos/oferta.mjs';
import { FUENTES } from '../../datos/whatsapp.mjs';
import { solucion } from '../../datos/soluciones.mjs';
import { precioTexto } from '../../html.mjs';
import { evaluar } from '../../componentes/base.mjs';
import { heroServicio, casosRelacionados, preguntas, precioLinea } from '../../componentes/secciones.mjs';
import { prosa, ctaContenido, relacionados } from '../../componentes/articulo.mjs';
import { migas, servicio, faq } from '../ld.mjs';

const sol = solucion('/automatizacion-procesos-pymes');
const S = SERVICIOS;
const corto = (id) => {
  const t = precioTexto(S[id].precio);
  return S[id].precio.moneda === 'UF' ? `${t.principal} + IVA` : `${t.principal} ${t.detalle}`;
};

const FAQ_PYMES = [
  { q: '¿Necesito tener un área de informática?',
    a: 'No. Trabajamos con quien hace el proceso y con quien decide. Lo que construimos queda en tus equipos o en cuentas de tu empresa, con un instructivo y, cuando corresponde, un manual técnico para que otra persona pueda mantenerlo.' },
  { q: '¿Cuánto cuesta automatizar un proceso en una pyme?',
    a: `Un proceso pequeño y bien delimitado parte ${corto('express')}, con precio fijo por escrito antes de partir. Si son varios procesos, el diagnóstico cuesta ${corto('diagnostico')} y se descuenta si avanzas al piloto. La guía de costos explica qué encarece y qué abarata un proyecto.` },
  { q: '¿Tengo que comprar un software nuevo?',
    a: 'Casi nunca. La mayoría de las automatizaciones que hacemos corren sobre Excel, Word, PDF, correo, Drive o el sistema que ya usas. Si en algún caso conviene una licencia, te lo decimos antes con la razón concreta.' },
  { q: '¿Qué pasa si el proceso cambia después?',
    a: 'Si el cambio es pequeño, se ajusta; si cambia la forma del proceso, se cotiza como una mejora. Por eso partimos por procesos estables y dejamos escrito el alcance: sabes qué cubre y qué no.' },
  { q: '¿Trabajan con empresas fuera de Santiago?',
    a: 'Sí, de forma remota en todo Chile. Presencial, en la Región Metropolitana.' },
];

const SECCIONES = [
  { id: 'donde-se-va-el-tiempo', titulo: 'Dónde se va el tiempo en una pyme', html: `
    <p>En una empresa grande, el trabajo repetitivo lo absorbe un área completa. En una pyme lo hace la misma persona que atiende clientes, cotiza, compra y cierra el mes. Por eso cada hora que se va en copiar datos pesa el doble: sale del tiempo que debería ir a vender o a operar.</p>
    <p>Los procesos que más vemos repetirse son estos:</p>
    <ul>
      <li>Llenar varios documentos con los mismos datos: actas, certificados, guías, formularios.</li>
      <li>Armar el mismo informe cada semana copiando desde tres o cuatro planillas.</li>
      <li>Transcribir facturas, órdenes de compra o boletas en PDF a una planilla o al sistema.</li>
      <li>Cotizar a mano, buscando precios en una lista que no siempre está actualizada.</li>
      <li>Consolidar las planillas de cada sucursal o vendedor para ver el total.</li>
      <li>Revisar el stock a ojo y enterarse tarde de lo que falta.</li>
    </ul>` },
  { id: 'que-se-puede-automatizar', titulo: 'Qué se puede automatizar y con qué', html: `
    <div class="tabla-envoltorio" tabindex="0" role="region" aria-label="Procesos que se pueden automatizar">
    <table class="tabla">
      <thead><tr><th scope="col">Proceso</th><th scope="col">Cómo se automatiza</th><th scope="col">Dónde queda funcionando</th></tr></thead>
      <tbody>
        <tr><td>Documentos repetitivos</td><td data-label="Cómo se automatiza">Un formulario o planilla alimenta plantillas Word; se generan los documentos y sus PDF</td><td data-label="Dónde queda">En el computador de quien lo usa</td></tr>
        <tr><td>PDF a Excel</td><td data-label="Cómo se automatiza">Lectura del PDF, extracción de los campos y validación antes de cargar</td><td data-label="Dónde queda">Planilla o sistema actual</td></tr>
        <tr><td>Informes periódicos</td><td data-label="Cómo se automatiza">Los datos se consolidan solos y el informe se genera y envía en la fecha acordada</td><td data-label="Dónde queda">Excel, Drive o correo</td></tr>
        <tr><td>Cotizaciones</td><td data-label="Cómo se automatiza">Reglas y lista de precios única; la IA solo interpreta la solicitud</td><td data-label="Dónde queda">Plantilla, formulario o sitio web</td></tr>
        <tr><td>Stock</td><td data-label="Cómo se automatiza">Punto de pedido por producto y alerta cuando se cruza</td><td data-label="Dónde queda">Tablero o correo</td></tr>
      </tbody>
    </table>
    </div>
    <p>Hay guías para los tres casos más comunes: <a href="/automatizacion-documental">automatización documental</a>, <a href="/automatizar-excel">automatizar Excel</a> y <a href="/automatizar-cotizaciones">automatizar cotizaciones</a>.</p>` },
  { id: 'que-no-conviene', titulo: 'Qué no conviene automatizar todavía', html: `
    <p>Automatizar un proceso desordenado solo hace más rápido el desorden. No conviene partir si el proceso no está escrito y cada persona lo hace distinto, si ocurre pocas veces al año, si está por cambiar o si la información está en papel. En esos casos lo que rinde es ordenar primero, y te lo decimos antes de cobrar.</p>
    <p>La guía <a href="/recursos/procesos-que-no-deberias-automatizar">7 procesos que probablemente no deberías automatizar todavía</a> explica cada caso y qué hacer en cambio.</p>` },
  { id: 'como-partir', titulo: 'Cómo partir sin un proyecto grande', html: `
    <p>Una pyme no necesita un proyecto de transformación para empezar. Necesita un proceso resuelto y medido. Por eso trabajamos en una escalera en la que puedes parar en cualquier peldaño:</p>
    <ol>
      <li><b>Un proceso pequeño:</b> <a href="${S.express.url}">Automatización Express</a>, ${corto('express')}, con alcance y precio fijo antes de partir.</li>
      <li><b>Varios procesos o no está claro cuál:</b> <a href="${S.diagnostico.url}">diagnóstico de procesos</a>, ${corto('diagnostico')}, una semana midiendo en terreno.</li>
      <li><b>Validar una solución más grande:</b> <a href="${S.piloto.url}">piloto en producción</a>, ${corto('piloto')}, tres a cuatro semanas y medición antes y después.</li>
      <li><b>Escalar lo que funcionó:</b> implementación completa y soporte mensual sin permanencia.</li>
    </ol>
    <p>En cada paso te mostramos el número. Si el resultado no justifica seguir, no seguimos.</p>` },
  { id: 'se-paga-sola', titulo: '¿Se paga sola?', html: `
    <p>Depende del proceso, y se puede estimar en un minuto. La <a href="/calculadora-roi-automatizacion">calculadora de ROI</a> te dice cuánto cuesta al año el trabajo manual y en cuántos meses se pagaría una automatización. Si prefieres presentarlo dentro de tu empresa, la <a href="/recursos/plantilla-roi-automatizacion">plantilla Excel de ROI</a> hace el mismo cálculo con la inversión real.</p>` },
];

export default {
  ruta: sol.ruta,
  archivo: 'automatizacion-procesos-pymes.html',
  prioridad: '0.9',
  titulo: 'Automatización de procesos para pymes en Chile | ANVAR TECH',
  og: { titulo: 'Automatización de procesos para pymes', bajada: 'Un proceso resuelto y medido, sin partir con un proyecto grande', etiqueta: 'Pymes · Chile' },
  descripcion: 'Automatizamos procesos repetitivos de pymes —documentos, Excel, PDF, cotizaciones, stock— sobre las herramientas que ya usan, con precio fijo y medición.',
  contextoWsp: 'general',
  fuente: FUENTES.smb,
  jsonld: [
    migas([[sol.nombre, sol.ruta]]),
    servicio({ nombre: 'Automatización de procesos para pymes', tipo: 'Automatización de procesos', ruta: sol.ruta, ofertas: ['express', 'diagnostico', 'piloto'], descripcion: 'Automatización de procesos repetitivos para pequeñas y medianas empresas en Chile, sobre las herramientas que ya usan, con alcance escrito y medición antes y después.' }),
    faq(FAQ_PYMES),
  ],
  cuerpo: () => `
${heroServicio({
  sobretitulo: 'Automatización para pymes',
  h1: 'Automatización de procesos para pymes: partir por un proceso, no por un proyecto',
  lead: 'En una pyme, el trabajo repetitivo lo hace la misma persona que atiende clientes y cierra el mes. Automatizamos esos procesos *sobre las herramientas que ya usas* y medimos cuánto tiempo se recupera.',
  contexto: 'pymes',
  migas: [[sol.nombre, sol.ruta]],
  ficha: [['Desde', precioLinea('express')], ['Herramientas', 'Excel, Word, PDF, correo'], ['Medición', 'Antes y después'], ['Atención', 'Todo Chile']],
})}
<section class="seccion" aria-label="Automatización de procesos en pymes">
  <div class="contenedor contenedor--prosa">
    ${prosa(SECCIONES)}
    ${ctaContenido({
      titulo: '¿Tienes un proceso en mente?',
      texto: 'Cuéntanoslo en 20 minutos, sin costo. Te decimos si conviene automatizarlo, cómo y cuánto costaría. Si no conviene, también.',
      botones: [
        { href: '#evaluar', texto: 'Evaluar mi proceso', etiqueta: 'pymes-evaluar' },
        { href: '/diagnostico-automatizacion', texto: 'Hacer el autodiagnóstico', variante: 'secundario', etiqueta: 'pymes-autodiagnostico' },
      ],
    })}
  </div>
</section>
${casosRelacionados(['documentos-legales', 'venta-en-linea'], 'Procesos que ya automatizamos')}
${preguntas(FAQ_PYMES, { titulo: 'Preguntas de pymes sobre automatización' })}
${relacionados(['/automatizacion-documental', '/automatizar-excel', '/recursos/cuanto-cuesta-automatizar-proceso-chile', '/recursos/como-detectar-proceso-automatizable'])}
${evaluar({ contexto: 'general', tipo: 'express', titulo: 'Evaluemos un proceso de tu empresa' })}
`,
};
