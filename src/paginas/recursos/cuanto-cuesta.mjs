// @ts-check
// Guía: cuánto cuesta automatizar un proceso en Chile. Precios reales,
// tomados de la fuente única (src/datos/oferta.mjs); nada inventado.
import { SERVICIOS } from '../../datos/oferta.mjs';
import { FUENTES } from '../../datos/whatsapp.mjs';
import { precioTexto, esc } from '../../html.mjs';
import { precioLinea, notaPreciosUf } from '../../componentes/secciones.mjs';
import { guia } from './_guia.mjs';

const S = SERVICIOS;
const linea = (id) => precioLinea(id).html;
const corto = (id) => {
  const t = precioTexto(S[id].precio);
  return S[id].precio.moneda === 'UF' ? `${t.principal} + IVA` : `${t.principal} ${t.detalle}`;
};
const fila = (id, que) => `<tr><td><a href="${esc(S[id].url)}">${esc(S[id].nombre)}</a></td><td data-label="Qué incluye">${esc(que)}</td><td data-label="Plazo">${esc(S[id].plazo)}</td><td data-label="Valor">${linea(id)}</td></tr>`;

export default guia({
  ruta: '/recursos/cuanto-cuesta-automatizar-proceso-chile',
  fuente: FUENTES.guideCost,
  tituloSeo: 'Cuánto cuesta automatizar un proceso en Chile | ANVAR TECH',
  og: { titulo: '¿Cuánto cuesta automatizar un proceso?', bajada: 'Precios reales por tipo de proyecto, y qué los encarece o abarata', etiqueta: 'Guía de costos' },
  lead: 'Rangos reales por tipo de proyecto, qué hace que una automatización cueste más o menos, y cómo saber si se paga sola antes de decidir.',
  corto: `<ul>
    <li>Un proceso pequeño y bien delimitado: <b>${esc(corto('express'))}</b>, con precio fijo antes de partir.</li>
    <li>Medir varios procesos y decidir por cuál partir: <b>${esc(corto('diagnostico'))}</b>.</li>
    <li>Una primera solución medida en producción: <b>${esc(corto('piloto'))}</b>.</li>
    <li>La solución completa integrada con tus sistemas: <b>${esc(corto('implementacion'))}</b>, cotizada después de un diagnóstico o piloto.</li>
    <li>Lo que más encarece: integrar varios sistemas, muchas excepciones y datos desordenados.</li>
  </ul>`,
  secciones: [
    { id: 'por-tipo', titulo: 'Cuánto cuesta cada tipo de proyecto', html: `
      <p>Estos son los precios publicados de ANVAR TECH, netos, para empresas. Los usamos como referencia porque son reales y verificables; otros proveedores cobran distinto, pero la estructura de costos se parece.</p>
      <div class="tabla-envoltorio" tabindex="0" role="region" aria-label="Precios por tipo de proyecto">
      <table class="tabla">
        <thead><tr><th scope="col">Tipo</th><th scope="col">Qué incluye</th><th scope="col">Plazo</th><th scope="col">Valor</th></tr></thead>
        <tbody>
          ${fila('express', 'Un proceso pequeño, funcionando en tus herramientas, con 30 días de corrección de fallas')}
          ${fila('diagnostico', 'Medición en terreno, procesos valorizados y tres oportunidades ordenadas por retorno')}
          ${fila('piloto', 'Un proceso automatizado, en uso y medido antes y después; incluye el diagnóstico')}
          ${fila('implementacion', 'Integración con tus sistemas, manuales y respaldos')}
          ${fila('soporte', 'Monitoreo, horas de mejora y soporte con plazo de respuesta')}
          ${fila('intelligence', 'Tablero, alertas e informe mensual de ventas, stock y costos')}
        </tbody>
      </table>
      </div>
      <p class="fuente-cita">${notaPreciosUf()} Los proyectos se cotizan en UF para que el valor no cambie entre la propuesta y la firma.</p>` },
    { id: 'que-encarece', titulo: 'Qué hace que cueste más', html: `
      <ul>
        <li><b>Cantidad de sistemas que toca.</b> Un proceso dentro de Excel es barato; uno que lee del correo, escribe en el ERP y avisa por WhatsApp tiene tres integraciones que construir, probar y mantener.</li>
        <li><b>Excepciones.</b> Cada "salvo cuando…" es una regla más. Un proceso con veinte excepciones cuesta varias veces lo que uno con dos.</li>
        <li><b>Datos desordenados.</b> Si antes de automatizar hay que limpiar y unificar la información, ese trabajo se paga.</li>
        <li><b>Documentos sin estructura.</b> Leer PDF de muchos proveedores distintos o correos escritos a mano requiere IA y revisión humana, y eso agrega trabajo.</li>
        <li><b>Requisitos de seguridad.</b> Procesar todo dentro de tu red o con controles de acceso estrictos es posible, pero cuesta más que usar servicios en la nube.</li>
        <li><b>Disponibilidad.</b> Algo que tiene que funcionar las 24 horas necesita monitoreo y soporte.</li>
      </ul>` },
    { id: 'que-abarata', titulo: 'Qué hace que cueste menos', html: `
      <ul>
        <li>El proceso está escrito, o alguien puede explicarlo con ejemplos en una hora.</li>
        <li>Toca una o dos herramientas que ya usas: Excel, Word, PDF, correo.</li>
        <li>El alcance está cerrado: se sabe qué entra y qué no.</li>
        <li>Hay alguien del equipo disponible para probar con casos reales.</li>
        <li>Se aprovecha lo que ya existe en vez de comprar software nuevo.</li>
      </ul>
      <p>Por eso recomendamos partir por un proceso pequeño. Es más barato, se prueba rápido y lo que se aprende abarata lo que viene después.</p>` },
    { id: 'costos-invisibles', titulo: 'Los costos que no aparecen en la cotización', html: `
      <ul>
        <li><b>Mantención.</b> Si cambia un formato, un sistema o una regla, la automatización se ajusta. Pregunta siempre qué cubre la garantía y qué cuesta después.</li>
        <li><b>Uso de servicios externos.</b> Los modelos de IA y algunas plataformas cobran por uso. Debe quedar escrito cuánto se estima al mes.</li>
        <li><b>Tiempo de tu equipo.</b> Explicar el proceso, probar y aprender a usarlo. Es poco, pero no es cero.</li>
      </ul>` },
    { id: 'se-paga-sola', titulo: 'Cómo saber si se paga sola', html: `
      <p>La cuenta de fondo es simple: cuánto cuesta hoy el trabajo que se va a automatizar, comparado con lo que cuesta automatizarlo. La <a href="/calculadora-roi-automatizacion">calculadora de ROI</a> la hace en un minuto, con la inversión que quieras comparar y el costo mensual si lo hay; la <a href="/recursos/plantilla-roi-automatizacion">plantilla Excel</a> hace lo mismo y permite comparar varios procesos.</p>
      <p>Una referencia práctica: si la inversión se recupera en menos de doce meses, suele ser una decisión fácil. Si pasa de tres años, conviene revisar si hay errores o reprocesos que el cálculo no está viendo, o dejarlo para más adelante.</p>` },
    { id: 'como-cotizamos', titulo: 'Cómo cotizamos nosotros', html: `
      <ol>
        <li>Una conversación de 20 minutos, sin costo, con ejemplos reales del proceso.</li>
        <li>Te enviamos por escrito el alcance, lo que queda fuera, el precio fijo y el plazo.</li>
        <li>No partimos ni cobramos nada antes de que lo apruebes.</li>
        <li>Los proyectos más grandes se pagan por etapas: anticipo, pagos contra entregables y saldo contra recepción.</li>
      </ol>` },
  ],
  cta: {
    titulo: '¿Quieres el precio de tu proceso, no un rango?',
    texto: 'En 20 minutos vemos tu proceso y te decimos cuánto costaría automatizarlo. Si no conviene, también te lo decimos.',
    botones: [
      { href: '#evaluar', texto: 'Evaluar mi proceso', etiqueta: 'costos-evaluar' },
      { href: '/calculadora-roi-automatizacion', texto: 'Calcular mi ROI', variante: 'secundario', etiqueta: 'costos-calculadora' },
    ],
  },
  preguntas: [
    { q: '¿Por qué algunos precios están en UF?',
      a: 'Porque los proyectos toman semanas y la UF mantiene el valor entre la propuesta y la factura. Se factura con la UF del día. Los servicios de entrada, como la Automatización Express, tienen precio en pesos.' },
    { q: '¿El precio "desde" es lo que voy a pagar?',
      a: 'Es el piso: el valor del proceso más simple que cabe en ese formato. El precio final se fija por escrito después de ver el proceso y no cambia si no cambia el alcance.' },
    { q: '¿Hay costos mensuales obligatorios?',
      a: 'No. El soporte mensual es opcional y sin permanencia. Lo que sí puede haber son costos de uso de servicios externos, que te decimos antes de construir.' },
  ],
  relacionados: ['/calculadora-roi-automatizacion', '/recursos/plantilla-roi-automatizacion', '/recursos/como-detectar-proceso-automatizable', 'express'],
});
