// @ts-check
// Política de privacidad. Describe lo que el sitio hace HOY (formulario,
// WhatsApp, autodiagnóstico, calculadora, analítica, proveedores). No afirma
// cumplimiento legal ni certificaciones: eso lo debe validar un abogado.
//
// Si cambia el sitio (nuevo proveedor, cookies, CRM, agenda), actualiza esta
// página y `SITIO.privacidad.actualizada` en src/config.mjs.
import { SITIO } from '../config.mjs';
import { FUENTES, wsp } from '../datos/whatsapp.mjs';
import { esc, fechaCorta } from '../html.mjs';
import { migasVisibles } from '../componentes/secciones.mjs';
import { migas, paginaWeb } from './ld.mjs';

/**
 * Puntos que requieren validación humana (legal o comercial) antes de darlos
 * por definitivos. `npm run check` los lista como avisos en cada ejecución.
 */
export const PENDIENTES_PRIVACIDAD = [
  'Plazo de conservación de contactos que no avanzan (24 meses): es una propuesta, confirmarla.',
  'Revisión por abogado frente a la Ley 19.628 y la Ley 21.719 (nueva ley de datos personales, con entrada en vigencia prevista para diciembre de 2026).',
  'Confirmar el proveedor de la casilla que recibe los formularios (variable NOTIFY_MAIL en Vercel) y nombrarlo en la sección de proveedores si corresponde.',
  'Si se activa el CRM en Google Sheets (SHEETS_WEBHOOK_URL) o una agenda externa, revisar esta política.',
];

const e = SITIO.empresa;
const c = SITIO.contacto;

/** Secciones: [id, título, HTML del cuerpo]. */
const SECCIONES = [
  ['responsable', 'Quién es responsable de tus datos', `
    <p>${esc(e.razonSocial)} (RUT ${esc(e.rut)}), sociedad chilena con domicilio en la Región Metropolitana, es responsable de los datos personales que se recogen en este sitio (${esc(SITIO.dominio.replace('https://', ''))}). ${esc(SITIO.marca)} es una marca de ${esc(e.razonSocial)}.</p>
    <p>Para cualquier consulta sobre tus datos: <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>.</p>`],

  ['datos', 'Qué datos recogemos y cuándo', `
    <ul class="lista">
      <li><b>Formulario de contacto.</b> Tu nombre, tu WhatsApp o correo, y opcionalmente tu empresa y la descripción del proceso que nos cuentas. También la página desde la que escribiste y la fecha.</li>
      <li><b>WhatsApp.</b> Si haces clic en un botón de WhatsApp, se abre WhatsApp con un mensaje ya escrito que incluye la página de origen (por ejemplo, <i>(ref: express)</i>). Nada se envía hasta que tú lo mandas. Desde ahí, la conversación ocurre en WhatsApp.</li>
      <li><b>Correo electrónico.</b> Lo que nos escribas a ${esc(c.email)}.</li>
      <li><b>Autodiagnóstico y calculadoras.</b> Se calculan en tu navegador y no piden datos personales. Si usas "Copiar enlace con estos valores", los números de la calculadora quedan en el enlace que copias; no los guardamos. Si el resultado del autodiagnóstico se muestra con una lectura escrita por IA, enviamos solo los puntajes, el tipo de problema elegido y el primer paso sugerido, sin datos que te identifiquen. Si eliges "Conversar este resultado por WhatsApp", el mensaje prellenado incluye tu resultado y algunas de tus respuestas; lo ves antes de enviarlo.</li>
      <li><b>Medición de visitas.</b> Usamos Vercel Web Analytics para contar visitas y clics en botones (por ejemplo, "abrió WhatsApp desde la página de casos"). No usa cookies y no enviamos nombres, correos, teléfonos ni textos que escribas. Para saber qué contenido genera contactos, el navegador recuerda durante la visita la primera página que abriste y el canal por el que llegaste (por ejemplo, un buscador o una campaña con parámetros UTM, nunca la dirección completa de la página anterior); se guarda en el almacenamiento de sesión del navegador, se borra al cerrar la pestaña y solo acompaña a esos clics, sin identificarte.</li>
      <li><b>Valor de la UF.</b> Para mostrar la equivalencia en pesos de los precios en UF, el navegador consulta a nuestro servidor el valor del día, que lo obtiene de la CMF o de mindicador.cl. Esa consulta no incluye datos tuyos.</li>
      <li><b>Registros técnicos.</b> Como todo sitio web, el servidor registra datos técnicos de cada solicitud, como la dirección IP y el navegador, para operar y proteger el sitio. También usamos la IP, solo en memoria y por poco tiempo, para frenar envíos abusivos del formulario.</li>
    </ul>`],

  ['uso', 'Para qué los usamos', `
    <ul class="lista">
      <li>Responder tu consulta y coordinar la conversación o la evaluación que pediste.</li>
      <li>Preparar una propuesta si la pides, y hacer seguimiento de esa conversación comercial.</li>
      <li>Saber qué páginas y botones generan conversaciones, de forma agregada, para mejorar el sitio.</li>
      <li>Operar el sitio de forma segura y evitar spam.</li>
    </ul>
    <p>No vendemos ni arrendamos tus datos, no los usamos para publicidad de terceros y no te inscribimos en listas de correo sin que lo pidas.</p>`],

  ['proveedores', 'Proveedores que procesan información', `
    <p>Para que el sitio funcione usamos estos servicios externos. Cada uno procesa solo lo necesario para su función:</p>
    <div class="tabla-envoltorio" tabindex="0" role="region" aria-label="Proveedores">
    <table class="tabla">
      <thead><tr><th scope="col">Proveedor</th><th scope="col">Para qué</th><th scope="col">Qué recibe</th></tr></thead>
      <tbody>
        <tr><td>Vercel</td><td data-label="Para qué">Alojamiento del sitio, funciones del servidor y medición de visitas</td><td data-label="Qué recibe">Datos técnicos de cada visita; el contenido del formulario al procesarlo</td></tr>
        <tr><td>Resend</td><td data-label="Para qué">Enviarnos por correo lo que escribes en el formulario</td><td data-label="Qué recibe">El contenido del formulario</td></tr>
        <tr><td>Nuestro proveedor de correo</td><td data-label="Para qué">Recibir y guardar esos correos</td><td data-label="Qué recibe">El contenido del formulario</td></tr>
        <tr><td>Anthropic</td><td data-label="Para qué">Escribir la lectura del autodiagnóstico, cuando está activa</td><td data-label="Qué recibe">Solo puntajes y opciones del autodiagnóstico, sin datos personales</td></tr>
        <tr><td>WhatsApp (Meta)</td><td data-label="Para qué">Las conversaciones que inicias por WhatsApp</td><td data-label="Qué recibe">Lo que envías por WhatsApp, según las condiciones de WhatsApp</td></tr>
      </tbody>
    </table>
    </div>
    <p>Algunos de estos proveedores procesan datos fuera de Chile, principalmente en Estados Unidos y Brasil. Los elegimos por sus medidas de seguridad, pero se rigen por sus propias políticas.</p>
    <p>Las tipografías y todos los archivos del sitio se sirven desde nuestro propio dominio: no cargamos recursos de Google ni de redes sociales al abrir una página.</p>`],

  ['cookies', 'Cookies', `
    <p>Este sitio no usa cookies propias ni de terceros para publicidad o seguimiento, y la medición de visitas funciona sin cookies. Por eso no te mostramos un aviso de cookies.</p>
    <p>Lo único que se guarda en tu navegador es lo descrito en "Medición de visitas": la primera página y el canal de llegada de la visita, en el almacenamiento de sesión, que se borra al cerrar la pestaña.</p>
    <p>Si en el futuro incorporamos alguna herramienta que las use y no sea esencial, te pediremos consentimiento antes de activarla y actualizaremos esta política.</p>`],

  ['conservacion', 'Cuánto tiempo los guardamos', `
    <ul class="lista">
      <li><b>Contactos que no avanzan a un proyecto:</b> hasta 24 meses desde el último intercambio, salvo que antes nos pidas eliminarlos.</li>
      <li><b>Clientes:</b> mientras dure la relación y, después, el tiempo que exijan nuestras obligaciones tributarias y contables.</li>
      <li><b>Medición de visitas y registros técnicos:</b> según los plazos de Vercel, en forma agregada o por períodos cortos.</li>
    </ul>`],

  ['derechos', 'Tus derechos y cómo ejercerlos', `
    <p>Puedes pedirnos, en cualquier momento y sin costo:</p>
    <ul class="lista">
      <li>saber qué datos tuyos tenemos y de dónde vienen;</li>
      <li>corregirlos si están mal o incompletos;</li>
      <li>eliminarlos, o que dejemos de usarlos para contactarte.</li>
    </ul>
    <p>Escríbenos a <a href="mailto:${esc(c.email)}?subject=${encodeURIComponent('Solicitud sobre mis datos personales')}">${esc(c.email)}</a> con el asunto "Solicitud sobre mis datos personales", o por <a href="${esc(wsp('privacidad', FUENTES.privacy))}" data-wsp="privacidad" data-track-label="privacidad" target="_blank" rel="noopener">WhatsApp</a>. Te podemos pedir un dato para confirmar que eres tú. Respondemos dentro de los plazos que fija la ley.</p>`],

  ['seguridad', 'Cómo los protegemos', `
    <p>Aplicamos medidas razonables: el sitio funciona solo con conexión cifrada (HTTPS), el formulario no guarda datos en el sitio sino que los envía directamente a nuestro correo, las claves de los servicios están fuera del código y el acceso a las cuentas está restringido a quien lo necesita.</p>
    <p>Ningún sistema conectado a internet es invulnerable, así que no podemos garantizar una seguridad absoluta. Si ocurriera un incidente que afecte tus datos, te lo informaremos.</p>`],

  ['menores', 'Menores de edad', `
    <p>El sitio está dirigido a empresas y a personas adultas. No recogemos a sabiendas datos de menores de edad.</p>`],

  ['cambios', 'Cambios a esta política', `
    <p>Si cambiamos cómo tratamos los datos, actualizaremos esta página y su fecha. Última actualización: <time datetime="${esc(SITIO.privacidad.actualizada)}">${esc(fechaCorta(SITIO.privacidad.actualizada))}</time>.</p>`],
];

export default {
  ruta: '/privacidad',
  archivo: 'privacidad.html',
  prioridad: '0.3',
  titulo: 'Política de privacidad | ANVAR TECH',
  descripcion: 'Qué datos recoge ia.anvartech.cl, para qué los usamos, qué proveedores los procesan, cuánto tiempo los guardamos y cómo pedir que los corrijamos o eliminemos.',
  contextoWsp: 'privacidad',
  fuente: FUENTES.privacy,
  jsonld: [
    migas([['Política de privacidad', '/privacidad']]),
    paginaWeb({ nombre: 'Política de privacidad', ruta: '/privacidad', fecha: SITIO.privacidad.actualizada }),
  ],
  cuerpo: () => `
<section class="hero hero--servicio hero--legal" aria-labelledby="hero-tit">
  <div class="contenedor contenedor--estrecho">
    ${migasVisibles([['Política de privacidad', '/privacidad']])}
    <p class="sobretitulo">Privacidad</p>
    <h1 id="hero-tit">Política de privacidad</h1>
    <p class="lead">Qué datos recoge este sitio, para qué, quién más los procesa y cómo pedirnos que los corrijamos o eliminemos. En corto:</p>
    <ul class="resumen-legal">
      <li>Solo pedimos lo necesario para responderte.</li>
      <li>No usamos cookies ni vendemos datos.</li>
      <li>El autodiagnóstico y la calculadora no piden datos personales.</li>
      <li>Puedes pedir que eliminemos tus datos cuando quieras.</li>
    </ul>
    <p class="nota">Última actualización: <time datetime="${esc(SITIO.privacidad.actualizada)}">${esc(fechaCorta(SITIO.privacidad.actualizada))}</time>.</p>
  </div>
</section>
<section class="seccion seccion--legal" aria-label="Política de privacidad completa">
  <div class="contenedor contenedor--estrecho legal">
    <nav class="indice-legal" aria-label="Contenido">
      <p class="label">Contenido</p>
      <ol>${SECCIONES.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join('')}</ol>
    </nav>
    ${SECCIONES.map(([id, t, html]) => `<section class="legal-sec" aria-labelledby="${id}"><h2 id="${id}">${esc(t)}</h2>${html}</section>`).join('\n')}
  </div>
</section>
`,
};
