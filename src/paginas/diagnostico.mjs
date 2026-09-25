// @ts-check
import { SERVICIOS } from '../datos/oferta.mjs';
import { FAQ } from '../datos/faq.mjs';
import { precioTexto, esc } from '../html.mjs';
import { evaluar, encabezado } from '../componentes/base.mjs';
import { heroServicio, paraQuien, etapas, bloquePrecio, casosRelacionados, preguntas, otrosServicios, precioLinea } from '../componentes/secciones.mjs';
import { relacionados } from '../componentes/articulo.mjs';
import { FUENTES } from '../datos/whatsapp.mjs';
import { migas, servicio, faq } from './ld.mjs';

const s = SERVICIOS.diagnostico;
const pt = precioTexto(s.precio);

const INFORME = [
  ['Qué levantamos y con quién', 'Personas entrevistadas, horas de observación directa, documentos y sistemas revisados.'],
  ['El proceso hoy', 'Los pasos reales, tiempos medidos en terreno y el costo anual del proceso, con la fuente de cada número.'],
  ['Tres oportunidades priorizadas', 'Qué se automatiza, ahorro anual, esfuerzo, inversión, en cuánto se paga y cuál es el riesgo.'],
  ['Lo que no conviene automatizar', 'Con la razón honesta y qué haría falta antes. Es el capítulo que casi nadie escribe.'],
  ['Plan recomendado', 'Fases, plazos y valores, con el descuento del diagnóstico ya aplicado.'],
  ['Cómo mediremos el resultado', 'Indicadores, valor actual, meta y método, acordados antes de construir.'],
];

export default {
  ruta: '/diagnostico-ia-empresas',
  archivo: 'diagnostico-ia-empresas.html',
  prioridad: '0.8',
  titulo: 'Diagnóstico de automatización e IA para empresas | ANVAR TECH',
  og: { titulo: 'Diagnóstico de automatización e IA', bajada: 'Una semana midiendo en terreno para decidir por dónde partir', etiqueta: 'Servicio · empresas' },
  descripcion: `Una semana midiendo tus procesos en horas y pesos: qué automatizar, cuánto ahorra cada oportunidad y qué no tocar. ${pt.principal} + IVA, descontable del piloto.`,
  contextoWsp: 'diagnostico',
  fuente: FUENTES.diagnosis,
  jsonld: [
    migas([['Diagnóstico de automatización', s.url]]),
    servicio({ nombre: 'Diagnóstico de automatización e IA', tipo: 'Consultoría en automatización de procesos', ruta: s.url, ofertas: ['diagnostico'], descripcion: 'Levantamiento en terreno de una semana que mide los procesos en horas y pesos y entrega tres oportunidades de automatización priorizadas por retorno, más lo que no conviene automatizar.' }),
    faq(FAQ.diagnostico),
  ],
  cuerpo: () => `
${heroServicio({
  sobretitulo: 'Diagnóstico de automatización',
  h1: 'Qué conviene automatizar en tu empresa, y cuánto te ahorra',
  lead: 'Una semana dentro de tu operación. Nos sentamos junto a quien hace el trabajo, lo cronometramos y lo valorizamos en pesos. Recibes un informe con qué automatizar primero, cuánto rinde cada oportunidad y *qué no conviene tocar todavía*.',
  contexto: 'diagnostico',
  ficha: [['Valor', precioLinea('diagnostico')], ['Duración', s.plazo], ['Entrega', 'Informe y presentación'], ['Si avanzas', 'Se descuenta del piloto']],
})}

${paraQuien({
  id: 'quien-tit', codigo: 'Para quién', titulo: 'Cuando hay que decidir con números',
  bajada: 'Sin medir, cualquier propuesta de automatización es una apuesta, y el que apuesta con su presupuesto eres tú.',
  si: ['Tienes varios procesos repetitivos y no sabes cuál atacar primero', 'Alguien arriba te va a pedir justificar la inversión', 'Ya te cotizaron un proyecto de IA y no sabes si vale lo que piden', 'Quieres partir por algo acotado, no por una transformación completa'],
  no: ['Es un solo proceso chico y claro: te conviene una *Automatización Express*', 'El trabajo lo hace una persona distinta cada vez y de forma distinta', 'Buscas una charla para el equipo: eso es capacitación', 'Esperas que el informe diga que sí a todo'],
})}

<section class="seccion seccion--angosta" aria-label="Autodiagnóstico gratuito">
  <div class="contenedor contenedor--estrecho">
    <p class="nota nota--destacada">¿Todavía no sabes si te conviene? El <a href="/diagnostico-automatizacion">autodiagnóstico gratuito</a> te da una primera orientación en dos minutos, sin pedir datos personales. No reemplaza la medición en terreno, pero te dice por dónde partir.</p>
  </div>
</section>

${etapas({
  id: 'semana-tit', codigo: 'La semana', titulo: 'Cómo se hace, día por día',
  bajada: 'La parte que da los buenos números es estar ahí, no preguntar por correo.',
  lista: [
    ['Día 1 · 2 h', 'Encuadre con quien decide', 'Qué proceso duele, cuánta gente lo hace y qué sistemas usan. Y una pregunta que suele explicar mucho: qué pasó la última vez que intentaron mejorar algo.'],
    ['Días 2 y 3 · 6 h', 'Medición en terreno', 'Junto a quien ejecuta el proceso, con el cronómetro a la vista. Al menos cinco casos reales, incluido uno que salga mal: ahí se esconde buena parte del tiempo perdido.'],
    ['Día 4 · 6 h', 'Análisis y valorización', 'Horas por costo-hora. Las oportunidades se ordenan por ahorro anual dividido por esfuerzo, no por lo entretenidas que son de construir.'],
    ['Día 5 · 6 h', 'Informe y presentación', 'Ocho a diez páginas y una reunión de una hora. El informe se presenta; no se manda por correo.'],
  ],
})}

<section class="seccion" aria-labelledby="informe-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Qué recibes', titulo: 'El informe, capítulo por capítulo', id: 'informe-tit', bajada: 'Escrito para que puedas defenderlo dentro de tu empresa sin nosotros en la sala.' })}
    <ol class="ejemplos ejemplos--numerados">${INFORME.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol>
  </div>
</section>

${bloquePrecio({ titulo: { id: 'valor-tit', texto: 'Cuánto cuesta' }, ids: ['diagnostico', 'piloto'], nota: `El diagnóstico se descuenta completo del piloto: si ya lo hiciste, el piloto son *UF ${SERVICIOS.piloto.precio.valor - s.precio.valor} adicionales*. Firmamos confidencialidad antes de empezar. Emitimos factura.` })}
${casosRelacionados(['documentos-legales', 'planos-autocad'])}
${preguntas(FAQ.diagnostico, { titulo: 'Preguntas sobre el diagnóstico' })}
${relacionados(['/diagnostico-automatizacion', '/recursos/como-detectar-proceso-automatizable', '/recursos/procesos-que-no-deberias-automatizar', '/calculadora-roi-automatizacion'], 'Antes del diagnóstico')}
${otrosServicios('diagnostico')}
${evaluar({ contexto: 'diagnostico', tipo: 'diagnostico', titulo: 'Veinte minutos para saber si un diagnóstico tiene sentido', bajada: 'Cuéntanos qué proceso les está costando caro. Te decimos derecho si conviene un diagnóstico o si tu caso es otro.' })}
`,
};
