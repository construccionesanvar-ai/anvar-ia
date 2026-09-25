// @ts-check
// Landing de alta intención: automatizar cotizaciones.
// Principio: la IA interpreta la solicitud; las reglas y el código calculan.
// Evidencia: caso C-02 (proyecto propio).
import { FUENTES } from '../../datos/whatsapp.mjs';
import { solucion } from '../../datos/soluciones.mjs';
import { caso } from '../../datos/casos.mjs';
import { esc } from '../../html.mjs';
import { evaluar } from '../../componentes/base.mjs';
import { heroServicio, preguntas, precioLinea, casosRelacionados } from '../../componentes/secciones.mjs';
import { prosa, ctaContenido, relacionados, enCorto } from '../../componentes/articulo.mjs';
import { migas, servicio, faq } from '../ld.mjs';

const sol = solucion('/automatizar-cotizaciones');
const c02 = caso('venta-en-linea');

const FLUJO = [
  ['Solicitud', 'Llega por correo, WhatsApp o un formulario, escrita como el cliente quiera'],
  ['Interpretación', 'La IA identifica productos, cantidades, plazos y datos del cliente'],
  ['Reglas', 'Lista de precios única, descuentos por volumen, recargos y stock'],
  ['Cálculo', 'El código calcula cada línea y el total: siempre el mismo resultado'],
  ['Documento', 'Se genera la cotización en PDF con el formato de tu empresa'],
  ['Aprobación', 'Si hay una excepción o un monto alto, una persona la revisa'],
  ['Envío y registro', 'Se envía al cliente y queda registrada para el seguimiento'],
];

const FAQ_COT = [
  { q: '¿Qué pasa con los precios especiales por cliente?',
    a: 'Se escriben como reglas: descuento por cliente, por volumen o por canal. Si un caso no calza con ninguna regla, la cotización queda para aprobación en vez de inventar un precio.' },
  { q: '¿Y si la solicitud del cliente es ambigua?',
    a: 'La IA marca lo que no pudo interpretar con seguridad y la cotización pasa a una persona, que la completa en segundos. Con el tiempo, las ambigüedades más comunes se convierten en preguntas del formulario.' },
  { q: '¿Se integra con nuestro sistema de ventas o facturación?',
    a: 'Normalmente sí, por exportación, conexión a la base de datos o la API del sistema. Si no hay forma segura de integrarlo, la cotización queda en una planilla o CRM y se traspasa con un paso simple.' },
  { q: '¿Cuánto cuesta?',
    a: 'Una plantilla que se llena sola desde la lista de precios suele caber en una Automatización Express. Leer solicitudes por correo o WhatsApp e integrarse con otros sistemas es un piloto. Te damos el precio fijo por escrito después de ver el proceso.' },
];

const SECCIONES = [
  { id: 'regla-de-oro', titulo: 'La regla de oro: la IA interpreta, las reglas calculan', html: `
    <p>Un modelo de lenguaje es muy bueno para entender "necesito 40 cajas del mismo papel de la vez pasada, para el martes". Es malo para garantizar que el precio sea exactamente el de tu lista. Puede redondear, confundir un producto con otro parecido o, en el peor caso, inventar un número que suena razonable.</p>
    <p>Por eso separamos el trabajo:</p>
    <ul>
      <li><b>La IA lee e interpreta</b> la solicitud y la convierte en datos: qué producto, cuántos, para cuándo.</li>
      <li><b>Las reglas y el código calculan</b> con la lista de precios, los descuentos y el stock. El mismo pedido da siempre el mismo precio.</li>
      <li><b>Una persona aprueba</b> las excepciones y los montos altos.</li>
    </ul>
    <p>Si alguien te propone que "la IA arme la cotización completa", pregunta de dónde saca los precios y qué pasa cuando se equivoca.</p>` },
  { id: 'niveles', titulo: 'Tres niveles de automatización', html: `
    <ol>
      <li><b>La plantilla que se llena sola.</b> Ingresas el cliente y los productos; la cotización sale con precios de la lista única, totales e IVA. Es el punto de partida más rápido y suele caber en una Automatización Express.</li>
      <li><b>El cliente cotiza solo.</b> Un formulario o página donde el cliente elige y ve el precio al instante, con las mismas reglas. Es lo que hace el caso C-02.</li>
      <li><b>Solicitudes por correo o WhatsApp.</b> La IA interpreta el mensaje, el sistema prepara la cotización y una persona la revisa antes de enviarla. Tiene más partes y conviene partir por un piloto.</li>
    </ol>` },
  { id: 'que-se-necesita', titulo: 'Qué se necesita antes de automatizar', html: `
    <ul>
      <li><b>Una sola lista de precios</b>, actualizada y en un solo lugar. Si hoy hay tres versiones, ese es el primer trabajo.</li>
      <li><b>Las reglas de descuento escritas</b>, aunque hoy estén en la cabeza del vendedor.</li>
      <li><b>El formato de cotización</b> que quieres mantener.</li>
      <li><b>Diez solicitudes reales</b>, incluidas algunas confusas, para probar.</li>
    </ul>` },
  { id: 'que-medir', titulo: 'Qué medir para saber si funcionó', html: `
    <ul>
      <li>Tiempo desde que llega la solicitud hasta que el cliente recibe la cotización.</li>
      <li>Cotizaciones enviadas por día con el mismo equipo.</li>
      <li>Errores de precio detectados después de enviar.</li>
      <li>Porcentaje de cotizaciones que se cierran, antes y después.</li>
    </ul>
    <p>El tiempo de respuesta suele ser lo que más cambia, y en ventas llegar primero pesa.</p>` },
];

export default {
  ruta: sol.ruta,
  archivo: 'automatizar-cotizaciones.html',
  prioridad: '0.8',
  titulo: 'Automatizar cotizaciones sin que la IA invente precios | ANVAR TECH',
  og: { titulo: 'Automatizar cotizaciones sin que la IA invente precios', bajada: 'La IA interpreta la solicitud · las reglas calculan · una persona aprueba', etiqueta: 'Proceso comercial' },
  descripcion: 'De la solicitud por correo o WhatsApp al PDF aprobado: la IA interpreta, las reglas calculan con tu lista de precios y una persona aprueba.',
  contextoWsp: 'express',
  fuente: FUENTES.quotes,
  jsonld: [
    migas([[sol.nombre, sol.ruta]]),
    servicio({ nombre: 'Automatización de cotizaciones', tipo: 'Automatización de procesos comerciales', ruta: sol.ruta, ofertas: ['express', 'piloto'], descripcion: 'Automatización de cotizaciones: interpretación de solicitudes, cálculo con reglas y lista de precios única, generación del documento, aprobación y registro.' }),
    faq(FAQ_COT),
  ],
  cuerpo: () => `
${heroServicio({
  sobretitulo: 'Automatizar cotizaciones',
  h1: 'Automatizar cotizaciones sin que la IA invente precios',
  lead: 'De la solicitud del cliente al documento aprobado. *La IA interpreta lo que pide; las reglas calculan el precio con tu lista; una persona aprueba las excepciones.* Así se cotiza más rápido sin perder control.',
  contexto: 'cotizaciones',
  migas: [[sol.nombre, sol.ruta]],
  ficha: [['Desde', precioLinea('express')], ['Precios', 'Lista única, con reglas'], ['IA', 'Solo interpreta'], ['Aprobación', 'Humana en excepciones']],
})}
<section class="seccion seccion--panel" aria-labelledby="flujo-cot-tit">
  <div class="contenedor">
    <div class="enc"><p class="enc-codigo">El flujo</p><h2 id="flujo-cot-tit">De la solicitud al envío, en siete pasos</h2></div>
    <ol class="flujo-caso" aria-label="Flujo de una cotización automatizada">${FLUJO.map(([t, d]) => `<li><span class="flujo-caso-t">${esc(t)}</span><span class="flujo-caso-d">${esc(d)}</span></li>`).join('')}</ol>
  </div>
</section>
<section class="seccion" aria-label="Cómo automatizar cotizaciones">
  <div class="contenedor contenedor--prosa">
    ${enCorto('<p>Se automatiza todo lo que es repetición: leer la solicitud, buscar precios, calcular, armar el documento y registrarlo. No se automatiza la decisión en los casos raros. La IA nunca pone el precio: lo calcula el sistema con tu lista.</p>')}
    ${prosa(SECCIONES)}
    ${ctaContenido({
      titulo: '¿Cuánto se demoran hoy en responder una cotización?',
      texto: 'Si la respuesta es "depende de quién esté", hay algo que automatizar. Revisemos tu proceso en 20 minutos, sin costo.',
      botones: [
        { wsp: 'express', texto: 'Conversar por WhatsApp', etiqueta: 'cotizaciones-wsp' },
        { href: '#evaluar', texto: 'Evaluar mi proceso', variante: 'secundario', etiqueta: 'cotizaciones-evaluar' },
      ],
    })}
  </div>
</section>
${casosRelacionados([c02.id], 'Un servicio que cotiza, cobra y registra solo')}
${preguntas(FAQ_COT, { titulo: 'Preguntas sobre automatizar cotizaciones' })}
${relacionados(['/recursos/ia-vs-automatizacion-tradicional', '/automatizacion-procesos-pymes', '/calculadora-roi-automatizacion', 'piloto'])}
${evaluar({ contexto: 'express', tipo: 'express', titulo: 'Revisemos cómo cotizan hoy', bajada: 'Trae una solicitud real y la lista de precios. En 20 minutos te decimos qué nivel de automatización conviene y cuánto costaría.' })}
`,
};
