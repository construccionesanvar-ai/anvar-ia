// @ts-check
// Herramienta gratuita de inventario: punto de pedido y stock de seguridad.
// Conecta con el servicio de datos (ANVAR Intelligence) sin venderlo de entrada.
import { SERVICIOS } from '../datos/oferta.mjs';
import { FUENTES } from '../datos/whatsapp.mjs';
import { recurso } from '../datos/recursos.mjs';
import { evaluar } from '../componentes/base.mjs';
import { preguntas, migasVisibles } from '../componentes/secciones.mjs';
import { calculadoraPuntoPedido, puntoPedido, PP_DEFECTO, NIVELES_SERVICIO } from '../componentes/herramientas.mjs';
import { prosa, ctaContenido, relacionados } from '../componentes/articulo.mjs';
import { migas, faq, aplicacionWeb } from './ld.mjs';

const r = recurso('/herramientas/punto-de-pedido');
const d = PP_DEFECTO;
const res = puntoPedido(d);
const coma = (n) => String(n).replace('.', ',');

const FAQ_PP = [
  { q: '¿Qué nivel de servicio conviene usar?',
    a: 'El 95% es un punto de partida razonable para la mayoría de los productos. Para productos críticos, que detienen una venta o una operación si faltan, se usa 97,5% o 99%. Cada punto adicional cuesta cada vez más stock: pasar de 95% a 99% aumenta el stock de seguridad en cerca de 40% con los mismos datos.' },
  { q: '¿Por qué los resultados se redondean hacia arriba?',
    a: 'Porque son unidades: no se puede tener 42,3 productos en bodega, y redondear hacia abajo deja el nivel de servicio por debajo del que elegiste.' },
  { q: '¿Sirve para productos que se venden de forma irregular?',
    a: 'No bien. La fórmula supone una demanda más o menos estable. Para productos estacionales, con promociones o que se venden pocas veces al mes, el punto de pedido fijo falla y conviene un pronóstico que considere esos patrones.' },
  { q: '¿Tengo que calcularlo producto por producto?',
    a: 'Sí, cada producto tiene su demanda y su proveedor. Con pocos productos, una planilla basta. Con cientos, conviene automatizar el cálculo y recibir una alerta cuando un producto cruza su punto de pedido.' },
];

const SECCIONES = [
  { id: 'que-es', titulo: 'Qué es el punto de pedido', html: `
    <p>El punto de pedido es el nivel de stock en que hay que hacer el pedido al proveedor para que la mercadería llegue antes de que se acabe. Si se pide más tarde, hay días sin producto; si se pide mucho antes, se inmoviliza plata en bodega.</p>
    <p>Tiene dos partes: la <b>demanda durante el plazo de reposición</b>, que es lo que se espera vender mientras el pedido viene en camino, y el <b>stock de seguridad</b>, que cubre lo que no se puede prever.</p>` },
  { id: 'stock-seguridad', titulo: 'Qué es el stock de seguridad', html: `
    <p>Es el colchón para dos incertidumbres: que en esos días se venda más de lo normal, y que el proveedor se demore más de lo acordado. Si ninguna de las dos varía, el stock de seguridad es cero. Mientras más variables son, más colchón hace falta para mantener el mismo nivel de servicio.</p>` },
  { id: 'formula', titulo: 'La fórmula', html: `
    <pre class="formula">Stock de seguridad = Z × √( L × σd² + d² × σL² )
Punto de pedido    = d × L + Stock de seguridad</pre>
    <ul>
      <li><b>d</b>: demanda promedio diaria, en unidades.</li>
      <li><b>σd</b>: desviación estándar de la demanda diaria.</li>
      <li><b>L</b>: plazo de reposición promedio, en días.</li>
      <li><b>σL</b>: desviación estándar del plazo, en días.</li>
      <li><b>Z</b>: factor de la distribución normal según el nivel de servicio: ${NIVELES_SERVICIO.map((n) => `${coma(n.pct)}% → ${coma(n.z)}`).join('; ')}.</li>
    </ul>
    <p>Si el proveedor siempre cumple el plazo (σL = 0), la fórmula se reduce a <b>Z × σd × √L</b>. Es la forma estándar de calcular el inventario de seguridad cuando la demanda y el plazo varían de forma independiente; está desarrollada, por ejemplo, en <i>Supply Chain Management: Strategy, Planning, and Operation</i>, de Chopra y Meindl.</p>` },
  { id: 'ejemplo', titulo: 'Un ejemplo con números', html: `
    <p>Un producto se vende en promedio ${d.demanda} unidades al día, con una desviación estándar de ${d.desvDemanda}. El proveedor se demora ${d.plazo} días, con una variación de ${d.desvPlazo} día. Se quiere un nivel de servicio de ${d.servicio}%.</p>
    <pre class="formula">Demanda durante el plazo = ${d.demanda} × ${d.plazo} = ${res.durantePlazo} unidades
Stock de seguridad       = 1,645 × √(${d.plazo} × ${d.desvDemanda}² + ${d.demanda}² × ${d.desvPlazo}²) = 1,645 × √652 ≈ 42,0 → ${res.seguridad} unidades
Punto de pedido          = ${res.durantePlazo} + ${res.seguridad} = ${res.punto} unidades</pre>
    <p>Cuando el stock de ese producto baje de ${res.punto} unidades, hay que pedir. Fíjate que la variación del plazo pesa más que la de la demanda: con un proveedor que siempre cumple, el stock de seguridad bajaría a ${puntoPedido({ ...d, desvPlazo: 0 }).seguridad} unidades. A veces la mejor forma de reducir inventario es negociar plazos más confiables.</p>` },
  { id: 'datos-excel', titulo: 'Cómo sacar los datos de tu Excel', html: `
    <ol>
      <li>Arma una columna con las ventas o salidas <b>por día</b> de los últimos tres a seis meses, incluyendo los días en que se vendió cero.</li>
      <li>La demanda promedio diaria es <b>=PROMEDIO(rango)</b> y su variación es <b>=DESVEST.M(rango)</b>.</li>
      <li>Para el plazo, anota los días que tardaron los últimos pedidos al mismo proveedor y aplica las mismas dos fórmulas.</li>
      <li>Repite por producto. Si son muchos, parte por los que más venden o los que más duelen cuando faltan.</li>
    </ol>` },
  { id: 'cuando-no-sirve', titulo: 'Cuándo esta fórmula no sirve', html: `
    <ul>
      <li><b>Demanda estacional o con promociones:</b> el promedio de los últimos meses no representa las próximas semanas.</li>
      <li><b>Demanda intermitente</b>, como repuestos que se venden pocas veces al mes: la distribución normal no los describe bien.</li>
      <li><b>Productos nuevos</b>, sin historia suficiente.</li>
      <li><b>Revisión periódica:</b> si solo revisas el stock una vez por semana, el cálculo debe cubrir el plazo más el intervalo entre revisiones.</li>
    </ul>
    <p>En esos casos conviene un pronóstico que considere estacionalidad y tendencias, y revisar los resultados con quien conoce el negocio.</p>` },
  { id: 'automatizar', titulo: 'De la planilla a una alerta automática', html: `
    <p>Con diez productos, esta calculadora y una planilla bastan. Con cientos de productos y varias sucursales, el problema ya no es la fórmula: es recalcularla cada semana y enterarse a tiempo de qué producto cruzó su punto de pedido. Eso es lo que se automatiza: los datos se consolidan solos, el cálculo se actualiza y llega una alerta de stock crítico.</p>
    <p>Es parte de lo que hace <a href="${SERVICIOS.intelligence.url}">ANVAR Intelligence</a>. Es un servicio reciente y todavía no tenemos un caso de cliente publicado en datos; lo que sí tenemos es un <a href="/casos#pronostico-stock">prototipo de pronóstico de stock</a>, mostrado como tal.</p>` },
];

export default {
  ruta: r.ruta,
  archivo: 'herramientas/punto-de-pedido.html',
  prioridad: '0.7',
  titulo: 'Calculadora de punto de pedido y stock de seguridad | ANVAR TECH',
  ogTitulo: '¿Cuándo reponer? Punto de pedido y stock de seguridad',
  og: { titulo: '¿Cuándo reponer cada producto?', bajada: 'Calculadora de punto de pedido y stock de seguridad · gratis', etiqueta: 'Herramienta de inventario' },
  descripcion: 'Calcula gratis el punto de pedido y el stock de seguridad según tu demanda, su variación y el plazo del proveedor. Con fórmula, ejemplo y guía en Excel.',
  contextoWsp: 'datos',
  fuente: FUENTES.reorderPoint,
  jsonld: [
    migas([['Recursos', '/recursos'], ['Punto de pedido', r.ruta]]),
    aplicacionWeb({ nombre: r.titulo, descripcion: r.descripcion, ruta: r.ruta }),
    faq(FAQ_PP),
  ],
  cuerpo: () => `
<section class="hero hero--servicio" aria-labelledby="hero-tit">
  <div class="contenedor">
    ${migasVisibles([['Recursos', '/recursos'], ['Punto de pedido', r.ruta]])}
    <div class="hero-servicio">
      <p class="sobretitulo">Herramienta gratuita · inventario</p>
      <h1 id="hero-tit">Calculadora de punto de pedido y stock de seguridad</h1>
      <p class="lead">Calcula cuándo reponer un producto y cuánto stock de seguridad mantener, según cuánto vendes, cuánto varía y cuánto se demora tu proveedor. Sin registro.</p>
    </div>
  </div>
</section>
<section class="seccion seccion--panel" id="herramienta" aria-label="Calculadora de punto de pedido" data-sin-precios>
  <div class="contenedor">
    ${calculadoraPuntoPedido()}
  </div>
</section>
<section class="seccion" aria-label="Cómo se calcula el punto de pedido">
  <div class="contenedor contenedor--prosa">
    ${prosa(SECCIONES)}
    ${ctaContenido({
      titulo: '¿Muchos productos y el stock se revisa a mano?',
      texto: 'Revisemos tus datos de ventas y stock en 20 minutos. Te decimos qué alertas y análisis se pueden armar con lo que ya tienes.',
      botones: [
        { wsp: 'intelligence', texto: 'Conversar por WhatsApp', etiqueta: 'punto-pedido-wsp' },
        { href: '/inteligencia-datos', texto: 'Ver inteligencia de datos', variante: 'secundario', etiqueta: 'punto-pedido-datos' },
      ],
    })}
  </div>
</section>
${preguntas(FAQ_PP, { titulo: 'Preguntas sobre punto de pedido', codigo: 'Preguntas' })}
${relacionados(['intelligence', '/calculadora-roi-automatizacion', '/recursos/ia-vs-automatizacion-tradicional', '/recursos/como-detectar-proceso-automatizable'])}
${evaluar({ contexto: 'datos', tipo: 'datos', modo: 'herramienta', titulo: 'Revisemos tu inventario', bajada: 'En 20 minutos vemos qué datos tienes, cómo están y qué alertas podrían salir de ellos. Sin costo.' })}
`,
};
