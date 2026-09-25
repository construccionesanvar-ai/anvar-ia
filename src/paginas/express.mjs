// @ts-check
import { SERVICIOS } from '../datos/oferta.mjs';
import { FAQ } from '../datos/faq.mjs';
import { FUENTES } from '../datos/whatsapp.mjs';
import { precioTexto, esc } from '../html.mjs';
import { evaluar, encabezado } from '../componentes/base.mjs';
import { heroServicio, paraQuien, etapas, bloquePrecio, casosRelacionados, preguntas, otrosServicios, precioLinea } from '../componentes/secciones.mjs';
import { relacionados } from '../componentes/articulo.mjs';
import { migas, servicio, faq } from './ld.mjs';

const s = SERVICIOS.express;
const pt = precioTexto(s.precio);
const desde = pt.principal.replace('desde', 'Desde');

const EJEMPLOS = [
  ['PDF a Excel', 'Facturas, órdenes de compra o reportes en PDF que alguien transcribe a una planilla.'],
  ['Formulario a Word o PDF', 'Un formulario que genera el documento final con el formato de tu empresa.'],
  ['Informes automáticos', 'El mismo informe semanal armado desde las mismas planillas.'],
  ['Consolidación de Excel', 'Varias planillas de sucursales o vendedores unidas en una sola, sin copiar y pegar.'],
  ['Cotizaciones', 'La cotización se arma sola a partir de los datos del cliente y tu lista de precios.'],
  ['Clasificación de información', 'Correos, solicitudes o documentos ordenados por tipo, urgencia o responsable.'],
  ['Ingreso de datos', 'Datos que hoy se digitan a mano en un sistema o una planilla.'],
  ['Correo a sistema', 'Lo que llega por correo queda registrado donde corresponde.'],
];

export default {
  ruta: '/automatizacion-express',
  archivo: 'automatizacion-express.html',
  prioridad: '0.9',
  titulo: `Automatización Express para pymes, ${pt.principal} | ANVAR TECH`,
  og: { titulo: 'Automatización Express', bajada: 'Un proceso pequeño, con alcance y precio fijo antes de partir', etiqueta: 'Servicio · pymes' },
  descripcion: `Resolvemos un proceso pequeño y repetitivo —PDF a Excel, documentos, informes, cotizaciones— con alcance y precio fijo antes de partir. ${desde} ${pt.detalle}.`,
  contextoWsp: 'express',
  fuente: FUENTES.express,
  jsonld: [
    migas([['Automatización Express', s.url]]),
    servicio({ nombre: s.nombre, tipo: 'Automatización de procesos', ruta: s.url, ofertas: ['express'], descripcion: 'Automatización de un proceso pequeño y delimitado, con alcance y precio fijo definidos por escrito antes de empezar, entregada funcionando en las herramientas del cliente, con 30 días de corrección de fallas.' }),
    faq(FAQ.express),
  ],
  cuerpo: () => `
${heroServicio({
  sobretitulo: 'Automatización Express',
  h1: 'Un proceso repetitivo, resuelto y funcionando, sin partir con un proyecto grande',
  lead: 'Elige una tarea que tu equipo repite todas las semanas. Definimos el alcance y el precio fijo por escrito, la automatizamos sobre tus herramientas y medimos cuánto tiempo libera. *Es la forma de probar ANVAR TECH con bajo riesgo.*',
  contexto: 'express',
  ficha: [['Valor', precioLinea('express')], ['Plazo', s.plazo], ['Alcance', 'Un proceso delimitado'], ['Fallas', 'Corregidas durante 30 días']],
})}

<section class="seccion seccion--panel" aria-labelledby="ej-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Ejemplos', titulo: 'Qué tipo de procesos caben', id: 'ej-tit', bajada: 'Procesos con la misma forma cada vez, donde cambian los datos pero no la estructura. Es para empresas donde alguien pierde horas cada semana en una tarea así.' })}
    <ul class="ejemplos">${EJEMPLOS.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ul>
  </div>
</section>

${paraQuien({
  id: 'quien-tit', codigo: 'Alcance', titulo: 'Cuándo sirve y cuándo no',
  bajada: 'No todo cabe en este formato, y preferimos decirlo antes de cobrar.',
  tituloSi: 'Cabe en una Express si…', tituloNo: 'Conviene un diagnóstico si…',
  si: ['Es un proceso que ya existe y se repite igual', 'Se puede explicar con ejemplos reales en una conversación', 'Toca una o dos herramientas: Excel, Word, PDF, correo', 'Tienes claro qué resultado esperas al final'],
  no: ['Nadie tiene escrito cómo se hace, o cada persona lo hace distinto', 'Involucra varios sistemas o áreas', 'Los datos están en papel o repartidos sin orden', 'No está claro cuál de varios procesos conviene atacar primero'],
})}

${etapas({
  id: 'etapas-tit', codigo: 'Cómo funciona', titulo: 'Cuatro pasos, con el precio fijo antes de empezar', panel: true,
  lista: [
    ['Paso 1 · 20 min', 'Nos muestras el proceso', 'Una videollamada o visita con ejemplos reales: el archivo que llega, lo que se hace con él y el resultado.'],
    ['Paso 2', 'Alcance y precio por escrito', 'Te enviamos qué se va a automatizar, qué queda fuera, el precio fijo y el plazo. *No cobramos nada antes de que lo apruebes.*'],
    ['Paso 3', 'Construimos', 'Sobre tus herramientas y con ejemplos reales. Te mostramos un avance antes de cerrar.'],
    ['Paso 4', 'Entregamos y medimos', 'Queda funcionando en tus equipos o cuentas, con instructivo, y comparamos el tiempo antes y después.'],
  ],
})}

${bloquePrecio({ titulo: { id: 'valor-tit', texto: 'Cuánto cuesta y qué recibes' }, ids: ['express'], conCta: true, nota: `*${desde} no es el precio de cualquier automatización:* es el valor del proceso más simple que cabe en este formato. El precio final depende del proceso y queda fijo por escrito antes de partir. Si al revisarlo vemos que no cabe, te lo decimos y te recomendamos el diagnóstico.` })}

${etapas({
  id: 'despues-tit', codigo: 'Después de la entrega', titulo: 'Qué pasa cuando ya está funcionando', panel: false,
  lista: [
    ['Día de entrega', 'Queda operando', 'Con instructivo de uso y la medición del tiempo antes y después, por escrito.'],
    ['Hasta 30 días', 'Corregimos las fallas', 'Si algo no hace lo que quedó escrito en el alcance, lo corregimos sin costo. Un cambio de lo que se pidió se cotiza aparte.'],
    ['Después', 'Tú decides', 'Nada más, otra Express, un diagnóstico para ordenar las siguientes oportunidades o soporte mensual. Sin permanencia.'],
  ],
})}

${casosRelacionados(['documentos-legales', 'venta-en-linea'], 'El tipo de resultado que buscamos')}
${preguntas(FAQ.express, { titulo: 'Preguntas sobre Automatización Express' })}
${relacionados(['/automatizacion-documental', '/automatizar-excel', '/automatizar-cotizaciones', '/recursos/cuanto-cuesta-automatizar-proceso-chile'], 'Guías sobre procesos que caben en un Express')}
${otrosServicios('express')}
${evaluar({ contexto: 'express', tipo: 'express', titulo: '¿Qué proceso te gustaría resolver primero?', bajada: 'Cuéntanos cuál es. En 20 minutos te decimos si cabe en una Automatización Express y cuánto costaría.' })}
`,
};
