// @ts-check
// Landing de alta intención con contenido de guía: automatizar Excel.
// Intención: "automatizar Excel / procesos en Excel en la empresa". Primero
// ayuda a elegir la herramienta correcta; el servicio viene después.
import { SERVICIOS } from '../../datos/oferta.mjs';
import { FUENTES } from '../../datos/whatsapp.mjs';
import { solucion } from '../../datos/soluciones.mjs';
import { evaluar } from '../../componentes/base.mjs';
import { heroServicio, preguntas, precioLinea } from '../../componentes/secciones.mjs';
import { prosa, ctaContenido, relacionados, enCorto } from '../../componentes/articulo.mjs';
import { migas, servicio, faq } from '../ld.mjs';

const sol = solucion('/automatizar-excel');
const MS = {
  powerQuery: 'https://learn.microsoft.com/es-es/power-query/power-query-what-is-power-query',
  macros: 'https://learn.microsoft.com/es-es/microsoft-365-apps/security/internet-macros-blocked',
  officeScripts: 'https://learn.microsoft.com/es-es/office/dev/scripts/overview/excel',
};
const ext = (href, texto) => `<a href="${href}" rel="noopener" target="_blank">${texto}</a>`;

const FAQ_XL = [
  { q: '¿Pueden trabajar sobre nuestro Excel actual?',
    a: 'Sí. Partimos por el archivo que ya usan. Muchas veces la mejora es ordenar los datos de entrada y agregar una consulta de Power Query, sin cambiar la forma de trabajar del equipo.' },
  { q: '¿Necesitamos Microsoft 365?',
    a: 'No para la mayoría de los casos. Power Query y las macros funcionan en Excel de escritorio. Office Scripts y Power Automate sí requieren Microsoft 365 empresarial. Si no lo tienen, usamos otra vía.' },
  { q: '¿Qué pasa con las macros que ya tenemos?',
    a: 'Se revisan. Si funcionan y alguien las entiende, se mantienen. Si dependen de una persona que ya no está o fallan cada vez que cambia un archivo, conviene reemplazarlas por algo más fácil de mantener.' },
  { q: '¿Se puede conectar Excel con nuestro sistema o ERP?',
    a: 'Casi siempre hay una forma: una exportación programada, una conexión a la base de datos o la API del sistema. Lo vemos en la primera conversación con un ejemplo real.' },
  { q: '¿Cuánto cuesta automatizar un proceso en Excel?',
    a: 'Un proceso puntual suele caber en una Automatización Express, con precio fijo antes de partir. La guía de costos explica qué lo encarece: sobre todo, la cantidad de archivos distintos y de excepciones.' },
];

const SECCIONES = [
  { id: 'que-herramienta', titulo: 'Qué herramienta usar para cada caso', html: `
    <div class="tabla-envoltorio" tabindex="0" role="region" aria-label="Herramientas para automatizar Excel">
    <table class="tabla">
      <thead><tr><th scope="col">Herramienta</th><th scope="col">Sirve para</th><th scope="col">Su límite</th></tr></thead>
      <tbody>
        <tr><td>Fórmulas y tablas dinámicas</td><td data-label="Sirve para">Calcular, cruzar y resumir datos que ya están en la planilla</td><td data-label="Su límite">No traen datos de otros archivos ni generan documentos</td></tr>
        <tr><td>Power Query</td><td data-label="Sirve para">Juntar y limpiar datos de varios archivos, carpetas o sistemas; se actualiza con un clic</td><td data-label="Su límite">No envía correos ni crea documentos; transforma datos</td></tr>
        <tr><td>Macros (VBA)</td><td data-label="Sirve para">Repetir acciones dentro de Excel o Word: formatear, copiar, imprimir, generar hojas</td><td data-label="Su límite">Se rompen cuando cambia el archivo y dependen de quien las escribió</td></tr>
        <tr><td>Office Scripts y Power Automate</td><td data-label="Sirve para">Automatizar Excel en la web y conectarlo con correo o SharePoint</td><td data-label="Su límite">Requieren Microsoft 365 empresarial</td></tr>
        <tr><td>Python</td><td data-label="Sirve para">Muchos archivos, reglas complejas, generar documentos, conectar sistemas y correr sin abrir Excel</td><td data-label="Su límite">Necesita instalación y alguien que lo mantenga</td></tr>
        <tr><td>Inteligencia artificial</td><td data-label="Sirve para">Leer texto libre, correos o PDF desordenados y clasificar información</td><td data-label="Su límite">Puede equivocarse: necesita revisión y no debe calcular montos</td></tr>
      </tbody>
    </table>
    </div>` },
  { id: 'cuando-basta-power-query', titulo: 'Cuándo basta con Power Query', html: `
    <p>Si cada semana alguien abre los mismos archivos, copia sus datos a una planilla maestra y limpia columnas, <b>Power Query suele bastar</b>. Se configura una vez: toma todos los archivos de una carpeta, los une, corrige formatos y deja una tabla lista. La semana siguiente, basta con "Actualizar". Viene incluido en Excel de escritorio (${ext(MS.powerQuery, 'documentación de Microsoft')}).</p>
    <p>Es la primera opción que revisamos, porque no requiere instalar nada y el equipo puede mantenerla.</p>` },
  { id: 'cuando-macro', titulo: 'Cuándo una macro sirve, y cuándo se vuelve un problema', html: `
    <p>Una macro sirve para acciones repetitivas dentro de Office que no cambian: aplicar un formato, generar una hoja por cliente, imprimir un lote. El problema aparece con el tiempo: la macro depende del nombre exacto de cada hoja y columna, falla sin avisar cuando alguien cambia el archivo y, muchas veces, solo la entiende quien la escribió.</p>
    <p>Además, Microsoft bloquea por defecto las macros de archivos descargados de internet (${ext(MS.macros, 'explicación oficial')}), así que una planilla con macros que circula por correo puede dejar de funcionar. Para procesos importantes preferimos algo que se pueda mantener sin depender de una persona.</p>` },
  { id: 'cuando-python', titulo: 'Cuándo conviene Python u otro software', html: `
    <ul>
      <li>Son decenas o cientos de archivos, o llegan en formatos distintos.</li>
      <li>El resultado no es una planilla sino documentos Word o PDF, correos o registros en otro sistema.</li>
      <li>El proceso debe correr solo, a una hora, sin que nadie abra Excel.</li>
      <li>Las reglas son muchas y cambian: conviene tenerlas escritas en un solo lugar y probadas.</li>
    </ul>
    <p>El caso <a href="/casos/automatizacion-documental-retail">C-01</a> usa Python para generar ocho documentos Word y PDF desde un solo ingreso de datos. Excel sigue siendo útil como entrada o salida; el trabajo pesado lo hace el programa.</p>` },
  { id: 'cuando-ia', titulo: 'Cuándo la IA aporta algo, y cuándo no hace falta', html: `
    <p>La IA aporta cuando la entrada <b>no está ordenada</b>: correos con pedidos escritos a mano, PDF de proveedores distintos, descripciones de productos que hay que clasificar. Ahí puede leer e interpretar lo que una regla no alcanza.</p>
    <p>No hace falta, y conviene evitarla, cuando la tarea es calcular, cruzar o copiar datos que ya están en columnas. Una fórmula o una consulta hacen eso sin equivocarse y sin costo por uso. Si alguien te ofrece "IA para Excel" para sumar columnas, pregunta qué hace que una fórmula no pueda hacer.</p>` },
  { id: 'senales', titulo: 'Señales de que tu Excel ya no da más', html: `
    <ul>
      <li>Hay archivos "final", "final_v2" y "final_ahora_si", y nadie sabe cuál vale.</li>
      <li>Varias personas editan la misma planilla y se pisan los cambios.</li>
      <li>Hay fórmulas que nadie se atreve a tocar.</li>
      <li>Cada cierre de mes empieza copiando datos de un lugar a otro.</li>
      <li>Los errores se descubren cuando el cliente reclama.</li>
    </ul>
    <p>Ninguna de estas señales significa que haya que dejar Excel. Significa que la parte repetitiva debería hacerla un proceso automático, y Excel quedar para lo que hace bien: revisar y decidir.</p>` },
];

export default {
  ruta: sol.ruta,
  archivo: 'automatizar-excel.html',
  prioridad: '0.8',
  titulo: 'Automatizar Excel: Power Query, macros, Python o IA | ANVAR TECH',
  og: { titulo: 'Cómo automatizar Excel (y cuándo no hace falta IA)', bajada: 'Power Query, macros, Python o IA: qué usar en cada caso', etiqueta: 'Guía práctica' },
  descripcion: 'Cómo automatizar procesos en Excel: cuándo basta Power Query o una macro, cuándo conviene Python y cuándo la IA agrega algo. Con ejemplos reales y sin vender humo.',
  contextoWsp: 'express',
  fuente: FUENTES.excel,
  jsonld: [
    migas([[sol.nombre, sol.ruta]]),
    servicio({ nombre: 'Automatización de procesos en Excel', tipo: 'Automatización de procesos', ruta: sol.ruta, ofertas: ['express'], descripcion: 'Automatización de procesos que hoy se hacen en Excel: consolidación de planillas, informes periódicos, traspaso de datos entre archivos y sistemas, y generación de documentos.' }),
    faq(FAQ_XL),
  ],
  cuerpo: () => `
${heroServicio({
  sobretitulo: 'Automatizar Excel',
  h1: 'Cómo automatizar Excel en tu empresa, y cuándo no hace falta IA',
  lead: 'La mayoría de los procesos que se hacen en Excel se pueden automatizar, pero no siempre con lo mismo. A veces basta con Power Query; otras conviene Python. *La IA solo cuando la entrada viene desordenada.*',
  contexto: 'excel',
  migas: [[sol.nombre, sol.ruta]],
  ficha: [['Primera opción', 'Power Query'], ['Muchos archivos', 'Python'], ['IA', 'Solo si aporta'], ['Desde', precioLinea('express')]],
})}
<section class="seccion" aria-label="Guía para automatizar Excel">
  <div class="contenedor contenedor--prosa">
    ${enCorto('<ul><li><b>Juntar y limpiar datos</b> de varios archivos: Power Query.</li><li><b>Repetir acciones</b> dentro de Excel que no cambian: una macro, con cuidado.</li><li><b>Muchos archivos, documentos o sistemas</b>, o que corra solo: Python.</li><li><b>Leer texto o PDF desordenados:</b> IA, con revisión humana.</li><li><b>Calcular y cruzar datos:</b> fórmulas. Ahí la IA sobra.</li></ul>')}
    ${prosa(SECCIONES)}
    ${ctaContenido({
      titulo: '¿Un proceso de Excel que se repite cada semana?',
      texto: `Muéstranoslo en 20 minutos. Si se resuelve con Power Query, te lo decimos y puedes hacerlo tú. Si necesita más, suele caber en una ${SERVICIOS.express.nombre} con precio fijo.`,
      botones: [
        { wsp: 'express', texto: 'Solicitar Automatización Express', etiqueta: 'excel-express' },
        { href: '/calculadora-roi-automatizacion', texto: 'Calcular cuánto cuesta hoy', variante: 'secundario', etiqueta: 'excel-calculadora' },
      ],
    })}
  </div>
</section>
${preguntas(FAQ_XL, { titulo: 'Preguntas sobre automatizar Excel' })}
${relacionados(['/automatizacion-documental', '/recursos/ia-vs-automatizacion-tradicional', '/recursos/plantilla-roi-automatizacion', 'express'])}
${evaluar({ contexto: 'express', tipo: 'express', titulo: '¿Qué planilla te está comiendo el día?', bajada: 'Cuéntanos qué se hace con ella cada semana. Te decimos cómo lo automatizaríamos y cuánto costaría, o cómo hacerlo tú si es simple.' })}
`,
};
