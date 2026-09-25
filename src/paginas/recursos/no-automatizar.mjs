// @ts-check
// Guía: 7 procesos que probablemente no deberías automatizar todavía.
// Demuestra criterio: decir que no también es parte del trabajo.
import { FUENTES } from '../../datos/whatsapp.mjs';
import { esc } from '../../html.mjs';
import { guia } from './_guia.mjs';

const PROCESOS = [
  { id: 'no-escrito', t: 'Un proceso que nadie ha escrito y cada persona hace distinto',
    por: 'Automatizarlo obliga a elegir una de las formas de hacerlo, y la discusión sobre cuál es la correcta aparece en medio del proyecto, cuando es más cara.',
    antes: 'Escribir el proceso en una página, acordar una sola forma y usarla un mes. Si se sostiene, ya está listo para automatizar.' },
  { id: 'poco-frecuente', t: 'Un proceso que ocurre pocas veces al año',
    por: 'El cierre anual o un informe semestral pueden ser pesados, pero el ahorro se reparte en muy pocas veces y no alcanza a pagar la construcción ni la mantención.',
    antes: 'Una lista de pasos bien escrita y una plantilla. Muchas veces eso basta para hacerlo más rápido y sin errores, sin programar nada.' },
  { id: 'por-cambiar', t: 'Un proceso que está por cambiar',
    por: 'Si viene un sistema nuevo, una reorganización o una normativa distinta, se automatiza algo que va a dejar de existir.',
    antes: 'Esperar a que el cambio se asiente y automatizar la versión nueva. Mientras tanto, medir cuánto demora para tener la línea base.' },
  { id: 'decision-critica', t: 'Una decisión con responsabilidad legal o financiera, sin revisión humana',
    por: 'Aprobar un crédito, firmar un documento legal o liberar un pago tiene consecuencias. Un sistema que decide solo, y se equivoca, genera un problema que nadie firmó.',
    antes: 'Automatizar la preparación —juntar datos, validar, armar el documento— y dejar la decisión a una persona. Es lo que hacemos en cada proyecto.' },
  { id: 'datos-papel', t: 'Un proceso cuyos datos están en papel o dispersos',
    por: 'Automatizar encima del desorden solo lo hace más rápido. Si la información está en cuadernos, correos sueltos y tres planillas distintas, el primer trabajo es juntarla.',
    antes: 'Ordenar la fuente de datos: una planilla maestra, un formulario, un sistema. Es un paso menos vistoso, pero es el que hace posible todo lo demás.' },
  { id: 'problema-otro', t: 'Un proceso donde el problema real es otro',
    por: 'Si las cotizaciones se atrasan porque la aprobación depende de una persona que está en terreno, automatizar el documento no cambia nada. El cuello de botella está en otro lado.',
    antes: 'Mapear dónde se detiene el proceso y cuánto tiempo pasa esperando. A veces la solución es cambiar una regla, no escribir código.' },
  { id: 'relacion-humana', t: 'Un proceso cuyo valor está en la conversación',
    por: 'Un cliente molesto, una negociación o una venta compleja se resuelven por la calidad del trato. Automatizarlos empeora justamente lo que los hace funcionar.',
    antes: 'Automatizar lo que rodea la conversación —el historial del cliente, el borrador de respuesta, el registro— y dejar la conversación a las personas.' },
];

export default guia({
  ruta: '/recursos/procesos-que-no-deberias-automatizar',
  fuente: FUENTES.guideDont,
  tituloSeo: '7 procesos que no deberías automatizar todavía | ANVAR TECH',
  og: { titulo: '7 procesos que probablemente no deberías automatizar todavía', bajada: 'Automatizar el desorden solo lo hace más rápido', etiqueta: 'Guía de criterio' },
  lead: 'Automatizar un proceso mal definido solo hace más rápido el desorden. Siete situaciones en las que conviene esperar, por qué, y qué hacer mientras tanto.',
  corto: '<p>No conviene automatizar todavía un proceso que nadie ha escrito, que ocurre pocas veces al año, que está por cambiar, que toma decisiones críticas sin revisión humana, cuyos datos están en papel, cuyo problema real está en otra parte, o cuyo valor está en la conversación. En casi todos los casos hay un paso previo más barato que sí rinde.</p>',
  secciones: [
    ...PROCESOS.map((p, i) => ({ id: p.id, titulo: `${i + 1}. ${p.t}`, html: `<p><b>Por qué esperar:</b> ${esc(p.por)}</p><p><b>Qué hacer antes:</b> ${esc(p.antes)}</p>` })),
    { id: 'por-que-lo-decimos', titulo: 'Por qué una empresa de automatización escribe esto', html: `
      <p>Porque un proyecto que no debió hacerse es el peor resultado posible para las dos partes: el cliente pierde plata y confianza, y nosotros perdemos un caso que mostrar. Por eso cada <a href="/diagnostico-ia-empresas">diagnóstico</a> que hacemos incluye un capítulo sobre lo que no conviene automatizar todavía, con la razón y lo que haría falta antes.</p>
      <p>Si tu proceso no está en esta lista, revisa el <a href="/recursos/como-detectar-proceso-automatizable">checklist de diez preguntas</a> para saber si es un buen candidato.</p>` },
  ],
  cta: {
    titulo: '¿No sabes si tu proceso está en esta lista?',
    texto: 'Cuéntanoslo en 20 minutos. Si no conviene automatizarlo todavía, te lo decimos y te explicamos qué haría falta antes.',
    botones: [
      { href: '#evaluar', texto: 'Evaluar mi proceso', etiqueta: 'no-automatizar-evaluar' },
      { href: '/diagnostico-automatizacion', texto: 'Hacer el autodiagnóstico', variante: 'secundario', etiqueta: 'no-automatizar-autodiagnostico' },
    ],
  },
  relacionados: ['/recursos/como-detectar-proceso-automatizable', '/recursos/ia-vs-automatizacion-tradicional', '/diagnostico-automatizacion', 'diagnostico'],
});
