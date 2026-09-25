// @ts-check
import { SERVICIOS } from '../datos/oferta.mjs';
import { FAQ } from '../datos/faq.mjs';
import { esc } from '../html.mjs';
import { evaluar, encabezado, boton } from '../componentes/base.mjs';
import { heroServicio, flujoDatos, precio, precioLinea, notaPreciosUf, casosRelacionados, preguntas, otrosServicios, paraQuien } from '../componentes/secciones.mjs';
import { relacionados } from '../componentes/articulo.mjs';
import { FUENTES } from '../datos/whatsapp.mjs';
import { migas, servicio, faq } from './ld.mjs';

const s = SERVICIOS.intelligence;

const CAPAS = [
  { t: 'Ordenar', d: 'Que los datos existan en un solo lugar y digan lo mismo.', items: ['Limpieza y corrección de datos', 'Consolidación de Excel, CSV y exportaciones del ERP', 'Un maestro de productos y clientes consistente'] },
  { t: 'Ver', d: 'Que la información se lea en minutos, no en horas.', items: ['Tablero de ventas, stock y márgenes', 'Análisis ABC y rotación de inventario', 'Reportes periódicos que se generan solos'] },
  { t: 'Anticipar', d: 'Que las señales lleguen antes que el problema.', items: ['Alertas de stock crítico y productos detenidos', 'Detección de anomalías en ventas o costos', 'Pronóstico de demanda cuando hay historia suficiente'] },
];

const MES = [
  ['Análisis periódico', 'Cada mes revisamos tus datos con las fuentes y los indicadores que acordemos.'],
  ['Tablero actualizado', 'Tus indicadores al día, en un tablero que se lee en minutos.'],
  ['Alertas y anomalías', 'Stock crítico, márgenes que caen y movimientos fuera de lo normal.'],
  ['Tendencias', 'Cómo se mueven ventas, rotación y márgenes mes a mes.'],
  ['Recomendaciones', 'Qué reponer, qué liquidar y qué revisar, con la razón de cada una.'],
  ['Seguimiento', 'Una reunión mensual para revisar el informe y ajustar el tablero.'],
];

export default {
  ruta: '/inteligencia-datos',
  archivo: 'inteligencia-datos.html',
  prioridad: '0.9',
  titulo: 'Inteligencia de datos para pymes: stock y márgenes | ANVAR TECH',
  og: { titulo: 'Inteligencia de datos para pymes', bajada: 'Stock, márgenes y alertas desde los datos que ya tienes', etiqueta: 'ANVAR Intelligence' },
  descripcion: 'Convertimos ventas, inventario y costos en decisiones: datos consolidados, tablero, alertas de stock crítico y márgenes. Servicio mensual ANVAR Intelligence.',
  contextoWsp: 'datos',
  fuente: FUENTES.data,
  jsonld: [
    migas([['Inteligencia de datos', '/inteligencia-datos']]),
    servicio({ nombre: 'Datos e inteligencia operacional', tipo: 'Análisis de datos para empresas', ruta: '/inteligencia-datos', ofertas: ['intelligence', 'diagnostico'], descripcion: 'Consolidación de datos de ventas, inventario y costos; tableros, alertas, análisis de rotación y márgenes, y pronóstico de demanda.' }),
    faq(FAQ.datos),
  ],
  cuerpo: () => `
${heroServicio({
  sobretitulo: 'Datos e inteligencia operacional',
  h1: 'Tus ventas, tu stock y tus costos, convertidos en decisiones',
  lead: 'La mayoría de las pymes ya tiene los datos: en Excel, en el sistema de ventas o en el ERP. Lo que falta es *ordenarlos, leerlos a tiempo y saber qué hacer con ellos*.',
  contexto: 'datos',
  secundario: { href: '#anvar-intelligence', texto: 'Ver ANVAR Intelligence' },
  ficha: [['Fuentes', 'Excel, CSV, ERP, sistema de ventas'], ['Entrega', 'Tablero, alertas e informe'], ['Servicio mensual', precioLinea('intelligence')], ['Datos', 'Confidencialidad por escrito']],
})}

<section class="seccion seccion--panel" aria-labelledby="flujo-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Cómo funciona', titulo: 'Del archivo suelto a la decisión', id: 'flujo-tit', bajada: 'El orden importa: un tablero construido sobre datos desordenados solo muestra el desorden más rápido.' })}
    ${flujoDatos()}
  </div>
</section>

<section class="seccion" aria-labelledby="capas-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Qué hacemos', titulo: 'Tres capas, en orden', id: 'capas-tit', bajada: 'Cada empresa entra por donde está. Si tus datos ya están ordenados, partimos directo por el tablero.' })}
    <ol class="capas">
      ${CAPAS.map((c, i) => `<li class="capa"><span class="paso-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${esc(c.t)}</h3><p>${esc(c.d)}</p><ul class="lista">${c.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></li>`).join('')}
    </ol>
  </div>
</section>

<section class="seccion seccion--oscura" id="anvar-intelligence" aria-labelledby="intel-tit">
  <div class="contenedor intel">
    <div>
      <p class="enc-codigo">Servicio mensual</p>
      <h2 id="intel-tit">${esc(s.nombre)}</h2>
      <p class="lead">Nos conectas o nos entregas tus datos y, cada mes, recibes un tablero actualizado, las alertas que importan y un informe con recomendaciones, revisado en una reunión de seguimiento.</p>
      <p class="intel-nota">Es un servicio reciente: todavía no tenemos un caso de cliente publicado en datos. Por eso el alcance —qué fuentes, qué indicadores y qué alertas— se define por escrito con cada empresa antes de partir.</p>
      <ul class="intel-lista">${MES.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ul>
    </div>
    <aside class="intel-precio">
      <p class="label">Valor</p>
      ${precio('intelligence', 'precio precio--grande')}
      <p>El valor mensual depende de cuántas fuentes de datos y sucursales incluye. La conexión inicial de tus datos se cotiza aparte, según cómo están hoy. ${notaPreciosUf()}</p>
      <ul class="lista lista--check"><li>Sin permanencia mínima</li><li>Los datos siguen siendo tuyos</li><li>Confidencialidad por escrito</li></ul>
      ${boton({ wsp: s.cta.wsp, texto: s.cta.texto, icono: 'whatsapp', trackData: 'intelligence' })}
    </aside>
  </div>
</section>

${paraQuien({
  id: 'datos-quien', codigo: 'Para quién', titulo: 'Cuándo tiene sentido',
  tituloSi: 'Sirve si…', tituloNo: 'Todavía no, si…',
  si: ['Manejas inventario, varias sucursales o muchos productos', 'Armas reportes a mano cada semana o cada mes', 'Te enteras tarde de quiebres de stock o productos detenidos', 'Tus datos existen, aunque estén repartidos en planillas'],
  no: ['Las ventas no se registran en ninguna parte', 'Quieres un pronóstico sin historia de datos que lo respalde', 'Buscas un tablero decorativo más que decisiones'],
})}

${casosRelacionados(['pronostico-stock'], 'Lo que ya construimos en datos')}
<section class="seccion" aria-label="Transparencia">
  <div class="contenedor contenedor--estrecho">
    <p class="nota nota--destacada">Transparencia: en datos todavía no tenemos un caso de cliente publicado. El caso C-04 es un prototipo académico de pronóstico de stock, y lo mostramos como tal. Cuando un cliente autorice publicar su caso, aparecerá aquí.</p>
  </div>
</section>
${preguntas(FAQ.datos, { titulo: 'Preguntas sobre inteligencia de datos' })}
${relacionados(['/herramientas/punto-de-pedido', '/automatizar-excel', '/recursos/plantilla-roi-automatizacion'], 'Herramientas gratuitas para tus datos')}
${otrosServicios('intelligence')}
${evaluar({ contexto: 'datos', tipo: 'datos', titulo: 'Revisemos tus datos', bajada: 'En 20 minutos vemos qué datos tienes, cómo están y qué decisiones podrían salir de ellos. Sin costo.' })}
`,
};
