// @ts-check
// Herramienta gratuita: autodiagnóstico de automatización. Sin registro.
// Distinto del servicio pagado de diagnóstico (/diagnostico-ia-empresas):
// este es una orientación de dos minutos; aquel, una semana midiendo en terreno.
import { SERVICIOS } from '../datos/oferta.mjs';
import { FUENTES } from '../datos/whatsapp.mjs';
import { recurso } from '../datos/recursos.mjs';
import { precioTexto } from '../html.mjs';
import { evaluar } from '../componentes/base.mjs';
import { preguntas, migasVisibles } from '../componentes/secciones.mjs';
import { diagnostico } from '../componentes/herramientas.mjs';
import { prosa, relacionados } from '../componentes/articulo.mjs';
import { migas, faq, aplicacionWeb } from './ld.mjs';

const r = recurso('/diagnostico-automatizacion');
const s = (id) => SERVICIOS[id];
const p = (id) => precioTexto(s(id).precio).principal;

const FAQ_DIAG = [
  { q: '¿Es lo mismo que el diagnóstico de procesos pagado?',
    a: `No. Este autodiagnóstico es una orientación de dos minutos basada en tus respuestas. El diagnóstico de procesos (${p('diagnostico')} + IVA) es una semana dentro de tu operación, midiendo el proceso con cronómetro y valorizándolo en pesos. Este te ayuda a saber si vale la pena dar ese paso.` },
  { q: '¿Guardan mis respuestas?',
    a: 'No. El puntaje se calcula en tu navegador y no pedimos nombre, correo ni teléfono. Si eliges conversar el resultado por WhatsApp, el mensaje se abre con tus respuestas para que lo revises antes de enviarlo.' },
  { q: '¿Qué pasa si saco un puntaje bajo?',
    a: 'Que probablemente no conviene un proyecto grande todavía, y es bueno saberlo antes de invertir. El resultado te dice qué ordenar primero; muchas veces es medir el proceso o juntar la información en un solo lugar.' },
  { q: '¿Sirve para cualquier rubro?',
    a: 'Sirve para procesos administrativos y operativos que se repiten: documentos, cotizaciones, reportes, inventario, traspaso de datos entre sistemas. No evalúa procesos físicos de producción.' },
];

const SECCIONES = [
  { id: 'como-leer', titulo: 'Cómo leer el resultado', html: `
    <p>El puntaje de 0 a 100 es el promedio de tres ejes, y cada eje responde una pregunta distinta:</p>
    <div class="tabla-envoltorio" tabindex="0" role="region" aria-label="Ejes del autodiagnóstico">
    <table class="tabla">
      <thead><tr><th scope="col">Eje</th><th scope="col">Qué mide</th><th scope="col">Preguntas</th></tr></thead>
      <tbody>
        <tr><td>Potencial</td><td data-label="Qué mide">Cuánto tiempo se va en trabajo repetido y cuán frágil es el proceso si falta quien lo hace</td><td data-label="Preguntas">Horas repetidas y dependencia de una persona</td></tr>
        <tr><td>Base</td><td data-label="Qué mide">Si la información está ordenada y si el costo del proceso está medido</td><td data-label="Preguntas">Dónde vive la información y si saben cuánto cuesta</td></tr>
        <tr><td>Capacidad de partir</td><td data-label="Qué mide">Si hay experiencia usando IA o automatizaciones y alguien que pueda decidir</td><td data-label="Preguntas">Uso actual de IA y quién decide</td></tr>
      </tbody>
    </table>
    </div>
    <p>Las etapas van de <b>Inicial</b> (menos de 30) a <b>En exploración</b> (30 a 54), <b>En adopción</b> (55 a 77) y <b>Listo para escalar</b> (78 o más). La etapa importa menos que la combinación: mucho potencial con poca base no se resuelve igual que poco potencial con mucha base.</p>` },
  { id: 'como-se-calcula', titulo: 'Cómo se calcula el puntaje', html: `
    <p>Cada respuesta vale de 0 a 3 puntos, en el orden en que aparecen las opciones. La pregunta sobre qué pasa si falta la persona se invierte: que el proceso se caiga suma potencial, porque hay más que ganar documentándolo y automatizándolo.</p>
    <pre class="formula">Eje (%)   = puntos del eje ÷ (preguntas del eje × 3) × 100
Puntaje   = promedio de los tres ejes</pre>
    <p>La primera pregunta, qué te gustaría resolver primero, no suma puntos: define el tipo de solución que se sugiere.</p>` },
  { id: 'que-hacer', titulo: 'Qué hacer con el resultado', html: `
    <p>El primer paso sugerido sale de la combinación de ejes, no solo del puntaje:</p>
    <ul>
      <li><b>Mucho potencial, información ordenada y capacidad de decidir:</b> un <a href="${s('piloto').url}">piloto en producción</a> sobre el proceso más costoso, medido antes y después.</li>
      <li><b>Mucho potencial pero información dispersa o sin medir:</b> un <a href="${s('diagnostico').url}">diagnóstico de procesos</a> para ordenar y valorizar antes de construir.</li>
      <li><b>Potencial moderado:</b> una <a href="${s('express').url}">Automatización Express</a> sobre un proceso puntual, ${p('express')} + IVA con precio fijo antes de partir.</li>
      <li><b>Problemas con ventas, stock o costos y datos ordenados:</b> <a href="${s('intelligence').url}">ANVAR Intelligence</a>, un tablero con alertas y un informe mensual.</li>
      <li><b>Poco potencial:</b> no conviene un proyecto. Lo que más rinde es que el equipo use mejor las herramientas que ya tiene; eso es una <a href="${s('capacitacion').url}">capacitación</a>.</li>
    </ul>
    <p>Si quieres ponerle un número al tiempo, usa la <a href="/calculadora-roi-automatizacion">calculadora de ROI</a>. Y si tienes dudas sobre un proceso en particular, el <a href="/recursos/como-detectar-proceso-automatizable">checklist para detectar un proceso automatizable</a> lo revisa en diez preguntas.</p>` },
  { id: 'limites', titulo: 'Lo que el autodiagnóstico no puede ver', html: `
    <p>Siete preguntas no reemplazan ver el proceso. El autodiagnóstico no sabe si el proceso está escrito, cuántas excepciones tiene, qué sistemas toca ni cuántos errores produce. Es una orientación honesta para decidir si vale la pena una conversación, no una evaluación del proceso.</p>` },
];

export default {
  ruta: r.ruta,
  archivo: 'diagnostico-automatizacion.html',
  prioridad: '0.9',
  titulo: '¿Qué tan automatizable es tu proceso? Autodiagnóstico | ANVAR TECH',
  ogTitulo: '¿Qué tan automatizable es tu proceso?',
  og: { titulo: '¿Qué tan automatizable es tu proceso?', bajada: 'Autodiagnóstico gratuito · 7 preguntas · 2 minutos', etiqueta: 'Herramienta gratuita' },
  descripcion: 'Autodiagnóstico gratuito de automatización: siete preguntas, puntaje de preparación, principales oportunidades y el primer paso recomendado. Sin pedir tus datos.',
  contextoWsp: 'general',
  fuente: FUENTES.diagnostic,
  jsonld: [
    migas([['Recursos', '/recursos'], ['Autodiagnóstico', r.ruta]]),
    aplicacionWeb({ nombre: r.titulo, descripcion: r.descripcion, ruta: r.ruta }),
    faq(FAQ_DIAG),
  ],
  cuerpo: () => `
<section class="hero hero--servicio" aria-labelledby="hero-tit">
  <div class="contenedor">
    ${migasVisibles([['Recursos', '/recursos'], ['Autodiagnóstico', r.ruta]])}
    <div class="hero-servicio">
      <p class="sobretitulo">Autodiagnóstico gratuito · 2 minutos</p>
      <h1 id="hero-tit">¿Qué tan automatizable es tu proceso?</h1>
      <p class="lead">Siete preguntas sobre un proceso de tu empresa. Al final ves un puntaje de preparación, las principales oportunidades según tus respuestas y el primer paso que recomendamos. No pedimos correo.</p>
    </div>
  </div>
</section>
<section class="seccion seccion--panel" id="herramienta" aria-label="Autodiagnóstico" data-sin-precios>
  <div class="contenedor">
    ${diagnostico()}
  </div>
</section>
<section class="seccion" aria-label="Cómo funciona el autodiagnóstico">
  <div class="contenedor contenedor--prosa">
    ${prosa(SECCIONES)}
  </div>
</section>
${preguntas(FAQ_DIAG, { titulo: 'Preguntas sobre el autodiagnóstico', codigo: 'Preguntas' })}
${relacionados(['/recursos/como-detectar-proceso-automatizable', '/calculadora-roi-automatizacion', '/recursos/procesos-que-no-deberias-automatizar', 'diagnostico'])}
${evaluar({ contexto: 'general', tipo: 'express', titulo: 'Conversemos tu resultado', bajada: 'Veinte minutos, sin costo. Con tu resultado a la vista partimos directo por lo que importa: qué proceso, cuánto cuesta hoy y qué conviene hacer primero.' })}
`,
};
