// @ts-check
import { SERVICIOS } from '../datos/oferta.mjs';
import { FAQ } from '../datos/faq.mjs';
import { esc } from '../html.mjs';
import { evaluar, encabezado } from '../componentes/base.mjs';
import { heroServicio, paraQuien, etapas, bloquePrecio, preguntas, otrosServicios, precioLinea } from '../componentes/secciones.mjs';
import { FUENTES } from '../datos/whatsapp.mjs';
import { migas, servicio, faq } from './ld.mjs';

const s = SERVICIOS.capacitacion;

const ENTREGAS = [
  ['Biblioteca de prompts del rubro', 'Los que se usaron en el taller, ordenados por tarea y con una línea de cuándo conviene usar cada uno.'],
  ['Guía de uso responsable', 'Una página con las reglas de tu empresa sobre qué se puede subir y qué no. Se puede adoptar como política interna.'],
  ['Plan de 30 días', 'Tres acciones concretas para el equipo. No quince, porque quince no las hace nadie.'],
  ['Informe para la jefatura', 'Quiénes asistieron, qué resolvió cada uno, lo que observamos y qué recomendamos. Dentro de 48 horas.'],
];

export default {
  ruta: '/capacitacion-ia-empresas',
  archivo: 'capacitacion-ia-empresas.html',
  prioridad: '0.7',
  titulo: 'Capacitación en IA para equipos de empresas en Santiago | ANVAR TECH',
  og: { titulo: 'Capacitación en IA para equipos', bajada: 'Con los procesos reales de tu empresa, no con ejemplos genéricos', etiqueta: 'Servicio · equipos' },
  descripcion: 'Taller práctico de 4 horas en tus oficinas, hasta 15 personas. Cada persona sale con una tarea suya resuelta y la empresa con una política escrita de uso de IA.',
  contextoWsp: 'capacitacion',
  fuente: FUENTES.training,
  jsonld: [
    migas([['Capacitación para equipos', s.url]]),
    servicio({ nombre: 'Capacitación en IA para equipos', tipo: 'Capacitación in-company', ruta: s.url, ofertas: ['capacitacion'], area: 'Santiago', descripcion: 'Taller práctico de cuatro horas en las oficinas del cliente, para hasta quince personas, con casos de su rubro. Incluye biblioteca de prompts, guía de uso responsable y plan de treinta días.' }),
    faq(FAQ.capacitacion),
  ],
  cuerpo: () => `
${heroServicio({
  sobretitulo: 'Capacitación para equipos',
  h1: 'Capacitación en IA para tu equipo, en tus oficinas',
  lead: 'Nadie escucha una charla. En este taller *cada persona llega con una tarea suya y se va con esa tarea resuelta*, y la empresa queda con una política escrita de qué información se puede subir y cuál no.',
  contexto: 'capacitacion',
  ficha: [['Valor', precioLinea('capacitacion')], ['Duración', '4 horas'], ['Capacidad', 'Hasta 15 personas'], ['Práctica', '2 de las 4 horas']],
})}

${paraQuien({
  id: 'problema-tit', codigo: 'El problema', titulo: 'El desnivel del equipo es el verdadero problema',
  bajada: 'En cualquier sala hay alguien que usa IA todos los días y alguien que nunca la abrió. Si la capacitación apunta al promedio, aburre a uno y pierde al otro.',
  tituloSi: 'Cómo lo resolvemos', tituloNo: 'Lo que no hacemos',
  si: ['Una semana antes, cada participante elige una tarea suya que se repite', 'Quien ya usa IA resuelve algo difícil; quien no, algo simple', 'Dos de las cuatro horas son práctica, no exposición', 'Los ejemplos se preparan para tu rubro'],
  no: ['Explicar qué es un modelo de lenguaje', 'Diapositivas sobre el futuro del trabajo', 'Ejemplos genéricos que no tienen nada que ver con tu empresa', 'Cuatro horas de alguien hablando adelante'],
})}

${etapas({
  id: 'programa-tit', codigo: 'Programa', titulo: 'Las cuatro horas',
  lista: [
    ['0:00 – 0:30', 'Qué es y qué no es', 'Demostraciones en vivo con cosas que les sirven a ustedes. Cero teoría.'],
    ['0:30 – 1:30', 'Práctica 1 · la tarea propia', 'Cada persona trabaja su tarea. Recorremos la sala, porque quien está atascado casi nunca levanta la mano.'],
    ['1:45 – 2:45', 'Práctica 2 · material de la empresa', 'Un informe, una planilla o un procedimiento real de ustedes.'],
    ['2:45 – 3:30', 'Errores, verificación y qué no subir', 'Dónde falla la IA, cómo revisar antes de enviar algo y la política de información de tu empresa.'],
    ['3:30 – 4:00', 'Cierre y plan de 30 días', 'Cada persona cuenta qué resolvió. Es el momento en que la jefatura ve el resultado en la misma sala.'],
  ],
})}

<section class="seccion" aria-labelledby="entrega-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Qué queda', titulo: 'Lo que se llevan después del taller', id: 'entrega-tit' })}
    <ul class="ejemplos">${ENTREGAS.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ul>
  </div>
</section>

${bloquePrecio({ titulo: { id: 'valor-tit', texto: 'Cuánto cuesta' }, ids: ['capacitacion'], nota: 'Por área. Presencial en la Región Metropolitana. Si capacitas a varias áreas, las siguientes tienen valor preferente porque el material ya está adaptado a tu empresa.' })}
${preguntas(FAQ.capacitacion, { titulo: 'Preguntas sobre la capacitación' })}
${otrosServicios('capacitacion')}
${evaluar({ contexto: 'capacitacion', tipo: 'capacitacion', titulo: 'Cotiza el taller para tu equipo', bajada: 'Cuéntanos de qué trabaja tu equipo y te proponemos el taller adaptado a eso. Veinte minutos, sin costo.' })}
`,
};
