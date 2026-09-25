// @ts-check
// Herramienta gratuita: calculadora de ROI de automatización. Sin registro.
import { SERVICIOS } from '../datos/oferta.mjs';
import { CALCULADORA } from '../config.mjs';
import { FUENTES } from '../datos/whatsapp.mjs';
import { recurso } from '../datos/recursos.mjs';
import { pesos, ej, precioTexto } from '../html.mjs';
import { evaluar } from '../componentes/base.mjs';
import { preguntas, migasVisibles } from '../componentes/secciones.mjs';
import { calculadora, calcular, CALC_DEFECTO } from '../componentes/herramientas.mjs';
import { prosa, ctaContenido, relacionados } from '../componentes/articulo.mjs';
import { migas, faq, aplicacionWeb } from './ld.mjs';

const r = recurso('/calculadora-roi-automatizacion');
const ejemplo = calcular(CALC_DEFECTO);
const ex = SERVICIOS.express;

const FAQ_CALC = [
  { q: '¿La calculadora es gratis? ¿Tengo que registrarme?',
    a: 'Es gratis y no pide registro, correo ni teléfono. Los cálculos se hacen en tu navegador y no guardamos los valores que ingresas.' },
  { q: '¿Qué costo por hora debo usar?',
    a: 'El costo empresa, no el sueldo líquido: sueldo bruto más los aportes que paga el empleador, dividido por las horas trabajadas al mes. Quien hace las remuneraciones lo tiene. Si varias personas con sueldos distintos hacen la tarea, usa un promedio.' },
  { q: '¿Por qué 44 semanas y no 52?',
    a: 'Porque nadie trabaja las 52 semanas del año. Descontamos el feriado legal de 15 días hábiles (tres semanas), los feriados y un margen para licencias y ausencias. Es un supuesto conservador: con 52 semanas el resultado sale inflado.' },
  { q: '¿El resultado es lo que voy a ahorrar?',
    a: 'No necesariamente. Es el valor del tiempo que hoy se va en la tarea. Se convierte en ahorro solo si ese tiempo se usa en otra cosa útil, y el resultado real depende del proceso y de cómo se implemente. Por eso es una estimación referencial, no una promesa.' },
  { q: '¿Puedo hacer este cálculo en Excel?',
    a: 'Sí. La plantilla gratuita de ROI hace el mismo cálculo y agrega la inversión, el payback y el ROI a uno y tres años, para que lo presentes dentro de tu empresa.' },
];

const SECCIONES = [
  { id: 'que-significa', titulo: 'Qué significa el resultado', html: `
    <p><b>Valor anual del trabajo que se podría automatizar</b> es cuánto le cuestan hoy a tu empresa, en un año, las horas que se van en la parte repetitiva de la tarea. Con el ejemplo que trae la calculadora (${CALC_DEFECTO.personas} personas, ${CALC_DEFECTO.horas} horas a la semana cada una, ${ej(pesos(CALC_DEFECTO.costo))} la hora y ${CALC_DEFECTO.auto}% automatizable) son ${ej(pesos(ejemplo.valor))} al año.</p>
    <p><b>Horas que se liberan al año</b> es ese mismo tiempo en horas: ${ejemplo.recuperadas.toLocaleString('es-CL')} en el ejemplo. Es la cifra que conviene mirar primero, porque se entiende sin discutir el costo por hora.</p>
    <p><b>Referencia de inversión</b> compara ese valor con lo que cuesta partir: una Automatización Express si el valor anual es menor a ${ej(pesos(CALCULADORA.umbralExpress))}, o un piloto si es mayor. Dice en cuántos meses se pagaría. Si pasa de ${CALCULADORA.mesesMaximos} meses, la calculadora te dice que no se justifica solo por tiempo.</p>` },
  { id: 'como-se-calcula', titulo: 'Cómo se calcula', html: `
    <p>Sin cajas negras. Estas son las cuatro operaciones, en el mismo orden que la calculadora:</p>
    <pre class="formula">Horas al año          = personas × horas por semana × ${CALCULADORA.semanas} semanas
Horas que se liberan  = horas al año × % automatizable
Valor anual           = horas que se liberan × costo de la hora
Meses de retorno      = inversión de referencia ÷ (valor anual ÷ 12)</pre>
    <p>Las ${CALCULADORA.semanas} semanas salen de restar a las 52 del año el feriado legal de 15 días hábiles que fija el <a href="https://www.bcn.cl/leychile/navegar?idNorma=207436" rel="noopener" target="_blank">Código del Trabajo</a> (tres semanas), los feriados y un margen para licencias y ausencias.</p>
    <p>La inversión de referencia es el precio publicado de entrada: ${ex.nombre} ${precioTexto(ex.precio).principal} + IVA, o un piloto desde UF ${SERVICIOS.piloto.precio.valor} + IVA convertido a pesos con la UF del día. Son pisos, no el precio de tu proceso: el valor final se fija por escrito después de ver el proceso.</p>` },
  { id: 'cuando-vale-la-pena', titulo: 'Cuándo vale la pena automatizar', html: `
    <p>En los procesos que hemos medido, lo que decide si una automatización rinde no es la tecnología, sino cuatro condiciones del proceso:</p>
    <ul>
      <li><b>Se repite con la misma forma.</b> Cambian los datos, no la estructura. Llenar el mismo formulario cien veces al mes califica; redactar un informe distinto cada vez, no.</li>
      <li><b>Consume horas que se pueden medir.</b> Si no sabes cuánto demora hoy, mídelo una semana antes de decidir: sin línea base no hay forma de demostrar el ahorro después.</li>
      <li><b>Los errores cuestan.</b> Un dato mal transcrito en una factura, un certificado o un stock suele costar más que las horas. La calculadora no los incluye, así que tu resultado real puede ser mayor.</li>
      <li><b>Hay alguien que usará el tiempo liberado.</b> Una hora ahorrada vale solo si se ocupa en algo mejor. Si no, el beneficio es menor que el que muestra la calculadora.</li>
    </ul>
    <p>Como referencia, en el <a href="/casos/automatizacion-documental-retail">caso C-01</a> un procedimiento pasó de 45 a 4 minutos. Si tu proceso se parece, la calculadora te dirá rápido si vale la pena conversarlo.</p>` },
  { id: 'que-no-incluye', titulo: 'Qué no incluye esta estimación', html: `
    <ul>
      <li>El costo de los errores, los reprocesos y los atrasos.</li>
      <li>La mantención de la automatización ni las licencias que pueda necesitar.</li>
      <li>La curva de aprendizaje de las primeras semanas.</li>
      <li>Los procesos que se vuelven posibles cuando el trabajo manual desaparece, como revisar todos los documentos y no una muestra.</li>
    </ul>
    <p>Por eso el resultado es una <b>estimación referencial basada en los datos ingresados</b>. El resultado real depende del proceso, de la implementación y del contexto operacional. Si quieres la cifra medida, eso es lo que entrega un <a href="/diagnostico-ia-empresas">diagnóstico de procesos</a>.</p>` },
];

export default {
  ruta: r.ruta,
  archivo: 'calculadora-roi-automatizacion.html',
  prioridad: '0.9',
  titulo: 'Calculadora de ROI de automatización de procesos (gratis) | ANVAR TECH',
  ogTitulo: 'Calcula cuánto le cuesta a tu empresa el trabajo manual',
  og: { titulo: 'Calcula cuánto le cuesta a tu empresa el trabajo manual', bajada: 'Calculadora de ROI de automatización · gratis y sin registro', etiqueta: 'Herramienta gratuita' },
  descripcion: 'Calcula gratis cuánto cuesta al año un proceso manual, cuántas horas liberaría automatizarlo y en cuántos meses se pagaría. Fórmula a la vista, sin registro.',
  contextoWsp: 'general',
  fuente: FUENTES.calculator,
  jsonld: [
    migas([['Recursos', '/recursos'], ['Calculadora de ROI', r.ruta]]),
    aplicacionWeb({ nombre: r.titulo, descripcion: r.descripcion, ruta: r.ruta }),
    faq(FAQ_CALC),
  ],
  cuerpo: () => `
<section class="hero hero--servicio" aria-labelledby="hero-tit">
  <div class="contenedor">
    ${migasVisibles([['Recursos', '/recursos'], ['Calculadora de ROI', r.ruta]])}
    <div class="hero-servicio">
      <p class="sobretitulo">Herramienta gratuita · sin registro</p>
      <h1 id="hero-tit">Calculadora de ROI de automatización de procesos</h1>
      <p class="lead">Calcula cuánto le cuesta al año a tu empresa un proceso manual y en cuánto tiempo se pagaría automatizarlo. Funciona en tu navegador: no pedimos correo ni guardamos lo que ingresas.</p>
    </div>
  </div>
</section>
<section class="seccion seccion--panel" id="herramienta" aria-label="Calculadora" data-sin-precios>
  <div class="contenedor">
    ${calculadora({ compartir: true })}
  </div>
</section>
<section class="seccion" aria-label="Cómo funciona la calculadora">
  <div class="contenedor contenedor--prosa">
    ${prosa(SECCIONES)}
    ${ctaContenido({
      titulo: '¿El número justifica mirar tu proceso?',
      texto: 'Conversemos 20 minutos, sin costo. Te decimos si conviene automatizarlo, cómo lo haríamos y cuánto costaría. Si es un proceso pequeño y bien delimitado, probablemente sea una Automatización Express.',
      botones: [
        { href: '#evaluar', texto: 'Evaluar mi proceso', etiqueta: 'calculadora-evaluar' },
        { href: ex.url, texto: 'Ver Automatización Express', variante: 'secundario', etiqueta: 'calculadora-express' },
      ],
    })}
  </div>
</section>
${preguntas(FAQ_CALC, { titulo: 'Preguntas sobre la calculadora', codigo: 'Preguntas' })}
${relacionados(['/recursos/plantilla-roi-automatizacion', '/recursos/cuanto-cuesta-automatizar-proceso-chile', '/diagnostico-automatizacion', 'express'])}
${evaluar({ contexto: 'general', tipo: 'express', titulo: 'Evaluemos el proceso que calculaste', bajada: 'Veinte minutos, sin costo. Trae el número de la calculadora: con eso partimos la conversación.' })}
`,
};

