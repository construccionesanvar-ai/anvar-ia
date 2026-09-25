// @ts-check
// Guía: checklist para detectar si un proceso se puede automatizar.
import { FUENTES } from '../../datos/whatsapp.mjs';
import { esc } from '../../html.mjs';
import { guia } from './_guia.mjs';

const PREGUNTAS = [
  ['¿Se repite al menos una vez por semana?', 'Lo que ocurre dos veces al año casi nunca justifica automatizarse: una lista de pasos bien escrita rinde más.'],
  ['¿Se hace igual cada vez?', 'Cambian los datos, no los pasos. Si cada vez es distinto, primero hay que definir una forma de hacerlo.'],
  ['¿Alguien puede explicarlo con ejemplos en una hora?', 'Si nadie sabe explicarlo completo, el proceso vive en la cabeza de una persona. Eso se resuelve documentando, no automatizando.'],
  ['¿Los datos de entrada llegan en formato digital?', 'Excel, PDF, correo, formulario o sistema. Si llegan en papel, hay un paso previo de digitalización que cambia el cálculo.'],
  ['¿Se copia la misma información de un lugar a otro?', 'Es la señal más clara. Copiar y pegar entre planillas, documentos o sistemas es exactamente lo que una máquina hace mejor.'],
  ['¿Puedes medir cuánto demora hoy?', 'Sin saber cuánto demora, no hay forma de demostrar el ahorro después. Si no lo sabes, mídelo una semana antes de decidir.'],
  ['¿Los errores tienen un costo claro?', 'Reprocesos, multas, reclamos, quiebres de stock. Muchas veces el error cuesta más que las horas.'],
  ['¿Las excepciones son pocas y se pueden listar?', 'Cinco excepciones conocidas se programan. Cincuenta que aparecen sin aviso, no.'],
  ['¿Hay alguien que decide y alguien que lo va a usar?', 'Sin quien decida no parte; sin quien lo use, no se adopta. Las dos personas deben estar desde el comienzo.'],
  ['¿El proceso va a seguir existiendo el próximo año?', 'Si viene un sistema nuevo, una reorganización o un cambio de normativa, conviene esperar a que se asiente.'],
];

export default guia({
  ruta: '/recursos/como-detectar-proceso-automatizable',
  fuente: FUENTES.guideDetect,
  tituloSeo: 'Cómo saber si un proceso es automatizable: checklist | ANVAR TECH',
  og: { titulo: '¿Se puede automatizar este proceso?', bajada: 'Checklist práctico de 10 preguntas antes de invertir', etiqueta: 'Guía práctica' },
  lead: 'Diez preguntas para revisar un proceso antes de invertir en automatizarlo. Se responden en diez minutos y te dicen si conviene partir, ordenar primero o esperar.',
  corto: '<p>Un proceso es buen candidato si se repite cada semana, se hace igual cada vez, sus datos llegan en formato digital y alguien puede explicarlo con ejemplos. Si respondes <b>sí a ocho o más</b> de las diez preguntas, conviene evaluarlo; entre cinco y siete, ordena primero; con cuatro o menos, todavía no.</p>',
  secciones: [
    { id: 'checklist', titulo: 'El checklist', html: `
      <p>Piensa en <b>un proceso concreto</b>, no en un área. "Emitir los certificados de despacho" sirve; "logística", no. Responde sí o no:</p>
      <ol>${PREGUNTAS.map(([q, d]) => `<li><b>${esc(q)}</b> ${esc(d)}</li>`).join('')}</ol>` },
    { id: 'como-leer', titulo: 'Cómo leer el resultado', html: `
      <div class="tabla-envoltorio" tabindex="0" role="region" aria-label="Cómo leer el checklist">
      <table class="tabla">
        <thead><tr><th scope="col">Respuestas "sí"</th><th scope="col">Qué significa</th><th scope="col">Qué hacer</th></tr></thead>
        <tbody>
          <tr><td>8 a 10</td><td data-label="Qué significa">Candidato claro</td><td data-label="Qué hacer">Si es un proceso puntual, una <a href="/automatizacion-express">Automatización Express</a>; si es grande, un piloto</td></tr>
          <tr><td>5 a 7</td><td data-label="Qué significa">Hay potencial, pero falta orden</td><td data-label="Qué hacer">Resolver primero las preguntas en "no"; si son varios procesos, un <a href="/diagnostico-ia-empresas">diagnóstico</a></td></tr>
          <tr><td>0 a 4</td><td data-label="Qué significa">Todavía no</td><td data-label="Qué hacer">Documentar, medir y estabilizar el proceso; revisar en unos meses</td></tr>
        </tbody>
      </table>
      </div>
      <p>Las preguntas 2, 3 y 10 pesan más que las otras. Un proceso que no se hace igual cada vez, que nadie sabe explicar o que va a cambiar pronto no se debería automatizar aunque sume ocho.</p>` },
    { id: 'medir', titulo: 'Cómo medir un proceso en una semana', html: `
      <ol>
        <li><b>Cronometra cinco casos reales</b>, incluido uno que salga mal. En los casos que salen mal se esconde buena parte del tiempo.</li>
        <li><b>Cuenta cuántas veces ocurre</b> en la semana y quiénes lo hacen.</li>
        <li><b>Anota los errores</b>: cuántos hubo y qué costó corregirlos.</li>
        <li><b>Pide el costo empresa por hora</b> a quien hace las remuneraciones.</li>
      </ol>
      <p>Con esos cuatro datos, la <a href="/calculadora-roi-automatizacion">calculadora de ROI</a> te dice cuánto cuesta el proceso al año, y la <a href="/recursos/plantilla-roi-automatizacion">plantilla Excel</a> te deja comparar varios.</p>` },
    { id: 'ejemplos', titulo: 'Ejemplos que califican y ejemplos que todavía no', html: `
      <h3>Suelen calificar</h3>
      <ul>
        <li>Generar certificados, actas o contratos tipo desde una planilla.</li>
        <li>Consolidar cada semana las ventas de varias sucursales.</li>
        <li>Pasar facturas o guías en PDF a una planilla o al sistema.</li>
        <li>Llenar varios formularios con los mismos datos, como en el <a href="/casos/automatizacion-documental-retail">caso C-01</a>, que pasó de 45 a 4 minutos por procedimiento.</li>
      </ul>
      <h3>Todavía no</h3>
      <ul>
        <li>Responder reclamos complejos, donde cada caso requiere criterio.</li>
        <li>Un proceso de compras que se va a rediseñar con un sistema nuevo el próximo trimestre.</li>
        <li>Un informe que cada gerente pide con un formato distinto.</li>
      </ul>
      <p>Para los casos del segundo grupo, la guía <a href="/recursos/procesos-que-no-deberias-automatizar">7 procesos que probablemente no deberías automatizar todavía</a> explica qué hacer en cambio.</p>` },
  ],
  cta: {
    titulo: '¿Sacaste ocho o más?',
    texto: 'Entonces vale la pena una conversación. En 20 minutos te decimos cómo lo automatizaríamos y cuánto costaría. Si prefieres una segunda opinión automática, haz el autodiagnóstico.',
    botones: [
      { href: '#evaluar', texto: 'Evaluar mi proceso', etiqueta: 'checklist-evaluar' },
      { href: '/diagnostico-automatizacion', texto: 'Hacer el autodiagnóstico', variante: 'secundario', etiqueta: 'checklist-autodiagnostico' },
    ],
  },
  relacionados: ['/diagnostico-automatizacion', '/recursos/procesos-que-no-deberias-automatizar', '/calculadora-roi-automatizacion', '/automatizacion-procesos-pymes'],
});
