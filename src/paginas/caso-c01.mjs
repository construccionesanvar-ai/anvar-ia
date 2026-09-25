// @ts-check
// Estudio de caso largo: C-01. Contenido original basado solo en los hechos
// registrados del caso (src/datos/casos.mjs). Lo que no se midió, se dice.
import { FUENTES } from '../datos/whatsapp.mjs';
import { caso } from '../datos/casos.mjs';
import { recurso } from '../datos/recursos.mjs';
import { esc, rutaOg } from '../html.mjs';
import { evaluar } from '../componentes/base.mjs';
import { etiqueta, flujoCaso } from '../componentes/secciones.mjs';
import { cabeceraArticulo, enCorto, prosa, ctaContenido, relacionados, cajaAutor } from '../componentes/articulo.mjs';
import { migas, articulo } from './ld.mjs';

const r = recurso('/casos/automatizacion-documental-retail');
const c = caso('documentos-legales');
const ahorroMin = 45 - 4;

const SECCIONES = [
  { id: 'contexto', titulo: 'Contexto', html: `
    <p>El caso ocurre en prevención de pérdidas, en un local de una cadena de retail. Cada vez que hay un procedimiento, quien está a cargo tiene que dejar constancia en <b>ocho formatos oficiales en Word</b>. Son formatos oficiales: tienen que quedar completos y coherentes entre sí.</p>
    <p>Es un <b>proyecto propio</b>: la herramienta la construyó ANVAR TECH para un problema de su propio fundador, y hoy está <b>en operación diaria</b>. No es un cliente, y lo decimos así en todo el sitio.</p>` },
  { id: 'problema', titulo: 'El problema', html: `
    <p>Los ocho formatos piden, en su mayoría, los mismos datos: fechas, datos del procedimiento, productos y montos. Llenarlos significaba escribir la misma información ocho veces, con dos riesgos:</p>
    <ul>
      <li><b>Tiempo:</b> 45 minutos por procedimiento, que salían de la operación del local.</li>
      <li><b>Errores de transcripción:</b> un dato distinto en uno de los ocho documentos obliga a corregir y reimprimir, o deja un registro inconsistente.</li>
    </ul>` },
  { id: 'proceso-anterior', titulo: 'Cómo se hacía antes', html: `
    <ol>
      <li>Abrir cada uno de los ocho formatos en Word.</li>
      <li>Escribir en cada uno los datos del procedimiento.</li>
      <li>Transcribir los productos y montos desde la boleta.</li>
      <li>Revisar que los totales coincidieran.</li>
      <li>Guardar e imprimir cada documento por separado.</li>
    </ol>
    <p>Ninguno de esos pasos era difícil. El problema era repetirlos ocho veces en cada procedimiento.</p>` },
  { id: 'por-que-demoraba', titulo: 'Por qué consumía tanto tiempo', html: `
    <p>Al mirar el proceso de cerca, el tiempo no se iba en pensar ni en decidir, sino en tres cosas mecánicas: <b>repetir</b> los mismos datos en cada formato, <b>transcribir</b> los productos de la boleta y <b>verificar</b> que todo cuadrara. Esas tres cosas son las que una máquina hace mejor que una persona.</p>
    <p>Medimos el tiempo total por procedimiento antes y después. No medimos por separado cuánto aportaba cada una de esas tres partes, así que no las vamos a cuantificar aquí.</p>` },
  { id: 'solucion', titulo: 'La solución', html: `
    <p>Un programa de escritorio para Windows con un solo formulario. Los datos se ingresan una vez y alimentan los ocho documentos.</p>
    ${flujoCaso(c)}
    <ul>
      <li><b>Lectura de boletas</b> por foto o PDF, que carga los productos y montos sin digitarlos.</li>
      <li><b>Datos dudosos marcados en amarillo</b> para que una persona los revise antes de seguir.</li>
      <li><b>Validaciones</b> que impiden generar documentos incompletos.</li>
      <li><b>Generación</b> de los ocho documentos en Word y PDF, más un archivo único listo para imprimir.</li>
      <li><b>Historial editable, respaldos y registro de accesos cifrado.</b></li>
      <li><b>Instalador para Windows</b>, para que se pueda instalar sin ayuda técnica.</li>
    </ul>` },
  { id: 'arquitectura', titulo: 'Arquitectura', html: `
    <div class="tabla-envoltorio" tabindex="0" role="region" aria-label="Componentes de la solución">
    <table class="tabla">
      <thead><tr><th scope="col">Componente</th><th scope="col">Qué hace</th><th scope="col">Tecnología</th></tr></thead>
      <tbody>
        <tr><td>Formulario</td><td data-label="Qué hace">Recibe los datos una sola vez y los valida</td><td data-label="Tecnología">Aplicación de escritorio en Python</td></tr>
        <tr><td>Lectura de boletas</td><td data-label="Qué hace">Extrae productos y montos desde una foto o un PDF, sin internet</td><td data-label="Tecnología">Reconocimiento de texto local de Windows</td></tr>
        <tr><td>Plantillas</td><td data-label="Qué hace">Los ocho formatos oficiales, con marcadores donde va cada dato</td><td data-label="Tecnología">Plantillas Word (docxtpl)</td></tr>
        <tr><td>Salida</td><td data-label="Qué hace">Genera Word y PDF de cada documento y un archivo único para imprimir</td><td data-label="Tecnología">Conversión a PDF</td></tr>
        <tr><td>Registro</td><td data-label="Qué hace">Historial editable, respaldos y registro de accesos cifrado</td><td data-label="Tecnología">Python</td></tr>
        <tr><td>Instalación</td><td data-label="Qué hace">Deja todo funcionando en un equipo nuevo</td><td data-label="Tecnología">Instalador propio para Windows</td></tr>
      </tbody>
    </table>
    </div>
    <p>Una decisión importante fue <b>no usar un modelo de IA en la nube</b> para leer las boletas. El reconocimiento de texto local de Windows alcanza para este tipo de documento y evita que la información salga del equipo.</p>` },
  { id: 'informacion', titulo: 'Cómo se trata la información', html: `
    <ul>
      <li>Todo funciona <b>sin conexión a internet</b>, en el equipo de quien lo usa.</li>
      <li>El acceso queda registrado y ese registro se guarda <b>cifrado</b>.</li>
      <li>Hay <b>respaldos</b> del historial, para no perder procedimientos anteriores.</li>
      <li>Lo que la lectura no reconoce con seguridad <b>no se adivina</b>: se marca para revisión humana.</li>
    </ul>` },
  { id: 'antes-despues', titulo: 'Antes y después', html: `
    <div class="tabla-envoltorio" tabindex="0" role="region" aria-label="Antes y después">
    <table class="tabla">
      <thead><tr><th scope="col">Aspecto</th><th scope="col">Antes</th><th scope="col">Después</th></tr></thead>
      <tbody>
        <tr><td>Tiempo por procedimiento</td><td data-label="Antes">45 minutos</td><td data-label="Después">4 minutos</td></tr>
        <tr><td>Ingreso de datos</td><td data-label="Antes">Los mismos datos, ocho veces</td><td data-label="Después">Una vez</td></tr>
        <tr><td>Productos de la boleta</td><td data-label="Antes">Digitados a mano</td><td data-label="Después">Leídos por foto o PDF; los dudosos, marcados</td></tr>
        <tr><td>Documentos incompletos</td><td data-label="Antes">Se detectaban después</td><td data-label="Después">Las validaciones no permiten generarlos</td></tr>
        <tr><td>Salida</td><td data-label="Antes">Ocho archivos sueltos</td><td data-label="Después">Ocho Word y PDF, más un archivo para imprimir</td></tr>
      </tbody>
    </table>
    </div>` },
  { id: 'resultado', titulo: 'Resultado', html: `
    <p class="caso-resultado caso-resultado--grande"><span class="caso-resultado-v">${esc(c.resultado.valor)}</span><span>${esc(c.resultado.texto)}: de 45 a 4 minutos</span></p>
    <p>Se midió el tiempo total por procedimiento, antes y después de usar la herramienta. Son ${ahorroMin} minutos menos en cada procedimiento, y la herramienta se usa en la operación diaria.</p>` },
  { id: 'limitaciones', titulo: 'Limitaciones', html: `
    <ul>
      <li><b>La lectura de boletas se probó con una sola boleta real</b>, de diez productos: los diez y la suma coincidieron con el total impreso. Es una prueba puntual, no una tasa de precisión general. Por eso existe la revisión humana de los datos dudosos.</li>
      <li>La calidad de la lectura depende de la foto: una boleta arrugada o mal iluminada se lee peor.</li>
      <li>Funciona solo en Windows: el reconocimiento de texto y el instalador son de ese sistema.</li>
      <li>Es un proyecto propio en un solo local. Todavía no es un caso de cliente.</li>
    </ul>` },
  { id: 'aprendizajes', titulo: 'Qué aprendimos', html: `
    <ol>
      <li><b>El tiempo estaba en repetir, no en escribir.</b> Juntar el ingreso de datos en un solo formulario hizo más que cualquier otra mejora.</li>
      <li><b>Validar antes de generar</b> evita el peor escenario: un documento incompleto que se descubre después.</li>
      <li><b>Marcar lo dudoso da confianza.</b> Quien usa la herramienta sabe exactamente qué revisar, en vez de revisarlo todo o no revisar nada.</li>
      <li><b>No toda lectura de documentos necesita IA en la nube.</b> Cuando la información es sensible y el documento es simple, lo local basta.</li>
      <li><b>El instalador y los respaldos importan tanto como la función.</b> Una herramienta que nadie puede instalar o que pierde el historial no se adopta.</li>
    </ol>` },
  { id: 'replicarlo', titulo: 'Cuándo una empresa podría replicarlo', html: `
    <p>El patrón sirve cuando un equipo llena <b>varios documentos con los mismos datos</b>, con plantillas que no cambian: actas de entrega, certificados, informes de visita técnica, contratos tipo, formularios de despacho o de reclamos.</p>
    <p>No sirve si cada documento se redacta distinto, o si el formato cambia cada mes. Para revisar tu caso punto por punto, usa el <a href="/recursos/como-detectar-proceso-automatizable">checklist para detectar un proceso automatizable</a>.</p>` },
  { id: 'calcula', titulo: 'Calcula cuánto sería en tu caso', html: `
    <p>Si tu proceso se parece, la cuenta es simple: minutos que se ahorran por vez, por las veces al mes. Por ejemplo, ${ahorroMin} minutos menos en 20 procedimientos al mes serían cerca de ${Math.round((ahorroMin * 20) / 60)} horas al mes. La <a href="/calculadora-roi-automatizacion">calculadora de ROI</a> lo convierte en pesos y en meses de retorno, y la <a href="/recursos/plantilla-roi-automatizacion">plantilla Excel</a> te deja presentarlo dentro de tu empresa.</p>` },
];

export default {
  ruta: r.ruta,
  archivo: 'casos/automatizacion-documental-retail.html',
  prioridad: '0.8',
  titulo: 'Caso real: de 45 a 4 minutos en un proceso documental | ANVAR TECH',
  ogTitulo: r.titulo,
  og: { titulo: 'De 45 a 4 minutos en un proceso documental', bajada: 'Caso C-01: ocho documentos oficiales desde un solo ingreso de datos', etiqueta: 'Caso real · proyecto propio' },
  descripcion: r.descripcion,
  contextoWsp: 'caso',
  fuente: FUENTES.caseDocumental,
  articulo: { publicado: r.publicado, actualizado: r.actualizado },
  jsonld: [
    migas([['Casos reales', '/casos'], ['C-01: automatización documental', r.ruta]]),
    articulo({ titulo: r.titulo, descripcion: r.descripcion, ruta: r.ruta, publicado: r.publicado, actualizado: r.actualizado, imagen: rutaOg(r.ruta) }),
  ],
  cuerpo: () => `
${cabeceraArticulo({ r, migas: [['Casos reales', '/casos'], ['C-01', r.ruta]], sobretitulo: `Caso ${c.codigo} · ${c.categoria}`, lead: 'Ocho formatos oficiales que se llenaban a mano con los mismos datos. Cómo se rediseñó el proceso, qué se construyó, qué se midió y qué no.' })}
<section class="seccion" aria-label="Caso C-01 completo">
  <div class="contenedor contenedor--prosa">
    <p class="caso-meta">${etiqueta(c)}<span class="caso-estado">${esc(c.estado)}</span></p>
    ${enCorto(`<ul><li><b>Problema:</b> ocho formatos oficiales en Word, llenados a mano con los mismos datos en cada procedimiento.</li><li><b>Solución:</b> un formulario único, lectura local de boletas, validaciones y generación automática de Word y PDF.</li><li><b>Resultado medido:</b> de 45 a 4 minutos por procedimiento (${esc(c.resultado.valor)}).</li><li><b>Límite:</b> la lectura de boletas se probó con una sola boleta real; no es una tasa de precisión.</li></ul>`)}
    ${prosa(SECCIONES)}
    ${ctaContenido({
      titulo: '¿Tu equipo llena los mismos datos en varios documentos?',
      texto: 'Es el tipo de proceso que suele caber en una Automatización Express: alcance y precio fijo antes de partir, funcionando en tus equipos.',
      evento: 'case_cta_click',
      botones: [
        { wsp: 'caso', texto: 'Tengo un proceso parecido', etiqueta: 'c01-largo-wsp' },
        { href: '/automatizacion-documental', texto: 'Ver automatización documental', variante: 'secundario', etiqueta: 'c01-largo-documental' },
      ],
    })}
    ${cajaAutor()}
  </div>
</section>
${relacionados(['/automatizacion-documental', '/calculadora-roi-automatizacion', '/recursos/como-detectar-proceso-automatizable', 'express'])}
${evaluar({ contexto: 'caso', tipo: 'express', titulo: '¿Un proceso parecido en tu empresa?', bajada: 'Cuéntanos cuál es y te decimos en 20 minutos si se puede automatizar, cómo y cuánto costaría. Sin costo.' })}
`,
};
