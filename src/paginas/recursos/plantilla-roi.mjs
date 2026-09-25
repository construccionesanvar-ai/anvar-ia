// @ts-check
// Recurso descargable: plantilla Excel de ROI. Sin registro ni correo.
// El archivo se genera con scripts/plantillas/roi.py (ver README).
import { statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FUENTES } from '../../datos/whatsapp.mjs';
import { recurso } from '../../datos/recursos.mjs';
import { ej, rutaOg } from '../../html.mjs';
import { evaluar } from '../../componentes/base.mjs';
import { cabeceraArticulo, enCorto, prosa, ctaContenido, relacionados, cajaAutor } from '../../componentes/articulo.mjs';
import { migas, articulo } from '../ld.mjs';

const r = recurso('/recursos/plantilla-roi-automatizacion');
export const ARCHIVO_PLANTILLA = '/descargas/plantilla-roi-automatizacion.xlsx';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const kb = Math.max(1, Math.round(statSync(join(RAIZ, 'public', ARCHIVO_PLANTILLA)).size / 1024));

const SECCIONES = [
  { id: 'que-trae', titulo: 'Qué trae la plantilla', html: `
    <ul>
      <li><b>Calculadora.</b> Un proceso: personas, veces por semana, minutos por vez, costo por hora, parte automatizable, inversión inicial y costo mensual de operación. Calcula horas manuales al año, costo anual, horas recuperables, ahorro bruto y neto, payback y ROI a uno y tres años, con las mismas fórmulas de la calculadora en línea.</li>
      <li><b>Comparar procesos.</b> Hasta diez procesos en una tabla, para ver cuál libera más tiempo y valor y decidir por dónde partir.</li>
      <li><b>Cómo usarla.</b> Instrucciones, cómo leer cada resultado y qué no incluye el cálculo.</li>
    </ul>
    <p>Las celdas amarillas con texto azul son las que llenas; todo lo demás son fórmulas a la vista, sin macros ni contraseñas. Viene con un ejemplo que puedes reemplazar.</p>` },
  { id: 'como-usarla', titulo: 'Cómo usarla en cuatro pasos', html: `
    <ol>
      <li><b>Elige un proceso concreto</b>, no un área. "Llenar la guía de despacho" sirve; "la bodega", no.</li>
      <li><b>Mide la duración con reloj</b> en al menos cinco casos reales, incluido uno que salga mal. La estimación de memoria casi siempre se queda corta.</li>
      <li><b>Usa el costo empresa por hora</b>: sueldo bruto más aportes del empleador, dividido por las horas trabajadas al mes. Lo tiene quien hace las remuneraciones.</li>
      <li><b>Ingresa la inversión real</b> si ya tienes una cotización. Si no, usa una referencia y cámbiala después: el payback se recalcula solo.</li>
    </ol>` },
  { id: 'formulas', titulo: 'Las fórmulas que usa', html: `
    <pre class="formula">Horas a la semana     = veces por semana × minutos ÷ 60
Horas manuales al año = personas × horas a la semana × semanas al año
Costo anual actual    = horas manuales × costo por hora
Horas recuperables    = horas manuales × parte automatizable
Ahorro bruto anual    = horas recuperables × costo por hora
Ahorro neto anual     = ahorro bruto − costo mensual × 12
Ahorro neto año 1     = ahorro neto anual − inversión
Payback (meses)       = inversión ÷ (ahorro neto anual ÷ 12)
ROI año 1             = ahorro neto año 1 ÷ inversión
ROI a 3 años          = (ahorro neto anual × 3 − inversión) ÷ inversión</pre>
    <p>Con el ejemplo que trae (5 personas, 10 veces por semana, 36 minutos cada vez, ${ej('$9.000')} la hora, 60% automatizable y ${ej('$1.640.000')} de inversión), el proceso cuesta ${ej('$11.880.000')} al año, se liberan 792 horas y la inversión se recupera en 2,8 meses. Es el mismo resultado que muestra la <a href="/calculadora-roi-automatizacion">calculadora en línea</a> con esos datos.</p>` },
  { id: 'plantilla-o-calculadora', titulo: '¿Plantilla o calculadora en línea?', html: `
    <p>Las dos usan las mismas fórmulas y, con los mismos datos, dan el mismo resultado. Usa la <a href="/calculadora-roi-automatizacion">calculadora en línea</a> para una respuesta rápida en un minuto. Usa la plantilla cuando necesites <b>presentar el número dentro de tu empresa</b> o trabajar sin conexión: mide la duración en minutos por vez y permite comparar varios procesos lado a lado, que es lo que suele pedir quien aprueba el presupuesto.</p>
    <p>Las dos entregan una <b>estimación referencial basada en los datos ingresados</b>. El resultado real depende del proceso, de la implementación y del contexto operacional.</p>` },
];

export default {
  ruta: r.ruta,
  archivo: 'recursos/plantilla-roi-automatizacion.html',
  prioridad: '0.7',
  titulo: 'Plantilla Excel de ROI de automatización (gratis) | ANVAR TECH',
  ogTitulo: 'Plantilla Excel gratis para calcular el ROI de automatizar',
  og: { titulo: 'Plantilla Excel para calcular el ROI de automatizar un proceso', bajada: 'Gratis · sin registro · payback y ROI a 1 y 3 años', etiqueta: 'Plantilla gratuita' },
  descripcion: r.descripcion,
  contextoWsp: 'general',
  fuente: FUENTES.template,
  articulo: { publicado: r.publicado, actualizado: r.actualizado },
  jsonld: [
    migas([['Recursos', '/recursos'], ['Plantilla de ROI', r.ruta]]),
    articulo({ titulo: r.titulo, descripcion: r.descripcion, ruta: r.ruta, publicado: r.publicado, actualizado: r.actualizado, imagen: rutaOg(r.ruta) }),
  ],
  cuerpo: () => `
${cabeceraArticulo({ r, migas: [['Recursos', '/recursos'], ['Plantilla de ROI', r.ruta]], lead: 'Una planilla para calcular cuánto cuesta un proceso manual, cuánto ahorra automatizarlo y en cuánto tiempo se paga. Gratis, sin registro y sin macros.' })}
<section class="seccion" aria-label="Plantilla de ROI">
  <div class="contenedor contenedor--prosa">
    <div class="descarga">
      <div>
        <p class="cta-contenido-tit">Plantilla de ROI de automatización</p>
        <p class="descarga-meta">Excel (.xlsx) · ${kb} KB · 3 hojas · abre en Excel, Google Sheets y LibreOffice</p>
      </div>
      <a class="btn btn--primario btn--grande" href="${ARCHIVO_PLANTILLA}" download data-track="template_download" data-track-label="plantilla-roi"><span>Descargar gratis</span></a>
    </div>
    ${enCorto('<p>Llenas siete datos de un proceso y obtienes el costo anual, las horas liberadas, el payback y el ROI a uno y tres años. Incluye una hoja para comparar hasta diez procesos y decidir por cuál partir.</p>')}
    ${prosa(SECCIONES, { indice: false })}
    ${ctaContenido({
      titulo: '¿Ya tienes el número?',
      texto: 'Si el payback sale bajo un año, vale la pena conversar. En 20 minutos te decimos si el proceso se puede automatizar y cuánto costaría de verdad.',
      botones: [
        { href: '#evaluar', texto: 'Evaluar mi proceso', etiqueta: 'plantilla-evaluar' },
        { href: '/automatizacion-express', texto: 'Ver Automatización Express', variante: 'secundario', etiqueta: 'plantilla-express' },
      ],
    })}
    ${cajaAutor()}
  </div>
</section>
${relacionados(['/calculadora-roi-automatizacion', '/recursos/cuanto-cuesta-automatizar-proceso-chile', '/recursos/como-detectar-proceso-automatizable', 'express'])}
${evaluar({ contexto: 'general', tipo: 'express', modo: 'compacto', titulo: '¿Tienes un proceso en mente?' })}
`,
};
