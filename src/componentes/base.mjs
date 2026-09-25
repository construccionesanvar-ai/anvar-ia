// @ts-check
// Estructura común de todas las páginas: <head>, cabecera, pie, botones,
// WhatsApp y el bloque final de evaluación.
import { SITIO } from '../config.mjs';
import { NAVEGACION } from '../datos/contenido.mjs';
import { wsp, urlWsp, conRef, MENSAJES } from '../datos/whatsapp.mjs';
import { PAGINA } from '../contexto.mjs';
import { SOLUCIONES } from '../datos/soluciones.mjs';
import { esc, attrs, absoluta, separarBloques } from '../html.mjs';

export const ISOTIPO = `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><rect width="100" height="100" rx="8" fill="#101A1E"/><path d="M22 76 L50 22 L78 76" fill="none" stroke="#E9EBE4" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 56 L66 56" stroke="#F0A92A" stroke-width="9" stroke-linecap="round"/><circle cx="50" cy="22" r="6" fill="#F0A92A"/></svg>`;

const ICONOS = {
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5v-.5c0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2"/></svg>',
  calendario: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 3v3M16 3v3"/></svg>',
  correo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M3 6.5l9 6.5 9-6.5"/></svg>',
  flecha: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5.5v13l11-6.5z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
};
export const icono = (n) => ICONOS[n] ?? '';

/**
 * Nombre de la marca en el logo. El espacio entre las dos líneas no se ve
 * (el contenedor es flex en columna) pero evita que el texto accesible o un
 * rastreador lea "ANVAR TECHIA & Automatización".
 */
const marcaTexto = () => `<span class="marca-txt"><b>${esc(SITIO.marca)}</b> <span>${esc(SITIO.linea)}</span></span>`;

/**
 * Botón o enlace con estilo de botón.
 * @param {{ href?: string, texto: string, variante?: 'primario'|'secundario'|'claro',
 *   track?: string, trackData?: string, wsp?: string, grande?: boolean,
 *   icono?: string, externo?: boolean, sr?: string }} o
 */
export function boton(o) {
  const clases = ['btn', `btn--${o.variante ?? 'primario'}`, o.grande ? 'btn--grande' : ''].filter(Boolean).join(' ');
  const href = o.wsp ? wsp(o.wsp, PAGINA.fuente) : o.href;
  return `<a${attrs({
    class: clases,
    href,
    'data-wsp': o.wsp ?? null,
    'data-track': o.track ?? null,
    'data-track-label': o.trackData ?? null,
    target: o.wsp || o.externo ? '_blank' : null,
    rel: o.wsp || o.externo ? 'noopener' : null,
  })}>${o.icono ? icono(o.icono) : ''}<span>${esc(o.texto)}</span>${o.sr ? `<span class="sr"> ${esc(o.sr)}</span>` : ''}</a>`;
}

/** Enlace a la sección "Evaluar mi proceso": en la misma página si existe, si no en la portada. */
export const hrefEvaluar = (tiene) => (tiene ? '#evaluar' : '/#evaluar');

/**
 * Encabezado de sección.
 * @param {{ codigo?: string, titulo: string, bajada?: string, id?: string, nivel?: 2|3 }} o
 */
export function encabezado(o) {
  const n = o.nivel ?? 2;
  return `<div class="enc">
  ${o.codigo ? `<p class="enc-codigo">${esc(o.codigo)}</p>` : ''}
  <h${n}${o.id ? ` id="${esc(o.id)}"` : ''}>${esc(o.titulo)}</h${n}>
  ${o.bajada ? `<p class="enc-bajada">${esc(o.bajada)}</p>` : ''}
</div>`;
}

function cabecera(ruta, evaluar) {
  const links = NAVEGACION.map((l) => {
    const actual = l.href === ruta ? ' aria-current="page"' : '';
    return `<li><a href="${esc(l.href)}"${actual}>${esc(l.texto)}</a></li>`;
  }).join('');
  return `<header class="cab">
  <div class="contenedor cab-in">
    <a class="marca" href="/" aria-label="${esc(SITIO.marca)}, ${esc(SITIO.linea)}: ir al inicio">
      ${ISOTIPO}
      ${marcaTexto()}
    </a>
    <nav class="menu" id="menu" aria-label="Principal">
      <ul>${links}</ul>
      <a class="btn btn--primario menu-cta" href="${hrefEvaluar(evaluar)}" data-track="hero_cta_click" data-track-label="menu"><span>Evaluar mi proceso</span></a>
    </nav>
    <div class="cab-acciones">
      <a class="btn btn--primario btn--cab" href="${hrefEvaluar(evaluar)}" data-track="hero_cta_click" data-track-label="cabecera"><span>Evaluar mi proceso</span></a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><span class="sr">Abrir menú</span>${icono('menu')}</button>
    </div>
  </div>
</header>`;
}

function pie(evaluar) {
  const e = SITIO.empresa;
  const enlace = ([t, h, extra]) => `<li><a href="${esc(h)}"${extra ?? ''}>${esc(t)}</a></li>`;
  const col = (titulo, items) => `<div class="pie-col"><h2 class="pie-tit">${esc(titulo)}</h2><ul>${items.map(enlace).join('')}</ul></div>`;
  const wspPie = ` data-wsp="general" data-track-label="pie" target="_blank" rel="noopener"`;
  const redes = SITIO.redes.length ? `<li>${SITIO.redes.map((r) => `<a href="${esc(r.url)}" rel="noopener me" target="_blank">${esc(r.nombre)}</a>`).join(' · ')}</li>` : '';
  return `<footer class="pie">
  <div class="contenedor">
    <div class="pie-grid">
      <div class="pie-marca">
        <a class="marca" href="/" aria-label="${esc(SITIO.marca)}, ${esc(SITIO.linea)}: ir al inicio">${ISOTIPO}${marcaTexto()}</a>
        <p>Automatización, software, datos e IA aplicada a las operaciones de empresas. Medimos cada proceso antes y después.</p>
        <p class="pie-sociedad">${esc(e.relacion)}, la sociedad que presta los servicios y emite las facturas.</p>
        <dl class="pie-legal">
          <div><dt>Razón social</dt><dd>${esc(e.razonSocial)}</dd></div>
          <div><dt>RUT</dt><dd>${esc(e.rut)}</dd></div>
          <div><dt>Facturación</dt><dd>Empresa chilena · emitimos factura</dd></div>
          <div><dt>Atención</dt><dd>${esc(e.atencion)}</dd></div>
        </dl>
        <ul class="pie-contacto">
          <li><a href="${hrefEvaluar(evaluar)}">Evaluar mi proceso</a></li>
          <li><a href="${esc(wsp('general', PAGINA.fuente))}"${wspPie}>WhatsApp ${esc(SITIO.contacto.whatsappVisible)}</a></li>
          <li><a href="mailto:${esc(SITIO.contacto.email)}" data-track="email_click" data-track-label="pie">${esc(SITIO.contacto.email)}</a></li>
          ${redes}
        </ul>
      </div>
      ${col('Servicios', [
        ['Automatización Express', '/automatizacion-express'],
        ['Diagnóstico de procesos', '/diagnostico-ia-empresas'],
        ['Piloto e implementación', '/automatizacion-procesos-ia'],
        ['Inteligencia de datos', '/inteligencia-datos'],
        ['Capacitación para equipos', '/capacitacion-ia-empresas'],
      ])}
      ${col('Soluciones', SOLUCIONES.map((x) => [x.nombre, x.ruta]))}
      ${col('Recursos gratuitos', [
        ['Guías y recursos', '/recursos'],
        ['Calculadora de ROI', '/calculadora-roi-automatizacion'],
        ['Autodiagnóstico', '/diagnostico-automatizacion'],
        ['Plantilla Excel de ROI', '/recursos/plantilla-roi-automatizacion'],
        ['Punto de pedido', '/herramientas/punto-de-pedido'],
      ])}
      ${col('Empresa', [
        ['Casos reales', '/casos'],
        ['Cómo trabajamos', '/#metodo'],
        ['Seguridad y propiedad', '/#seguridad'],
        ['Quiénes somos', '/#nosotros'],
        ['Preguntas frecuentes', '/#preguntas'],
        ['Asesoría personal en IA', '/asesoria-ia-personal'],
      ])}
    </div>
    <div class="pie-base">
      <p>© <span data-anio>2026</span> ${esc(SITIO.marca)} · ${esc(e.razonSocial)} · <a href="${esc(SITIO.sitioMatriz)}">anvartech.cl</a></p>
      <p><a href="/privacidad">Política de privacidad</a></p>
    </div>
  </div>
</footer>`;
}

/** Aviso de privacidad junto a cada formulario. */
export const avisoPrivacidad = (clase = 'form-aviso') => `<p class="${clase}">Al enviar este formulario aceptas nuestra <a href="/privacidad">Política de Privacidad</a>.</p>`;

/**
 * Bloque final "Evaluar mi proceso": agenda o WhatsApp, correo y formulario.
 * @param {{ contexto?: string, titulo?: string, bajada?: string, tipo?: string, conFormulario?: boolean,
 *   accion?: { texto: string, nota: string } }} o
 */
export function evaluar(o = {}) {
  const contexto = o.contexto ?? 'general';
  const f = PAGINA.fuente;
  // Páginas que no venden una evaluación (asesoría personal) cambian la
  // acción principal por un WhatsApp con su propio mensaje.
  if (o.accion) {
    const btn = `<a class="btn btn--primario btn--grande" href="${esc(wsp(contexto, f))}" data-wsp="${esc(contexto)}" data-track-label="evaluar-principal" target="_blank" rel="noopener">${icono('whatsapp')}<span>${esc(o.accion.texto)}</span></a>`;
    return evaluarBloque(o, btn, o.accion.nota, false);
  }
  // Agenda real si hay enlace configurado; si no, se dice lo que pasa: se coordina por WhatsApp.
  if (SITIO.agenda.url) {
    const btn = `<a class="btn btn--primario btn--grande" href="${esc(SITIO.agenda.url)}" target="_blank" rel="noopener" data-track="calendar_click" data-track-label="evaluar">${icono('calendario')}<span>Agendar evaluación de ${SITIO.agenda.duracionMin} min</span></a>`;
    return evaluarBloque(o, btn, 'Eliges el horario en el calendario. Videollamada o presencial en Santiago.', true);
  }
  const btn = `<a class="btn btn--primario btn--grande" href="${esc(urlWsp(conRef(MENSAJES.agenda, f)))}" data-wsp="agenda" data-track-label="evaluar-coordinar" target="_blank" rel="noopener">${icono('whatsapp')}<span>Coordinar evaluación por WhatsApp</span></a>`;
  return evaluarBloque(o, btn, `Coordinamos el horario por WhatsApp (${SITIO.contacto.whatsappVisible}). Videollamada o presencial en Santiago.`, false);
}

/**
 * @param {{ contexto?: string, titulo?: string, bajada?: string, tipo?: string, conFormulario?: boolean }} o
 * @param {string} accionPrincipal
 * @param {string} notaAccion
 * @param {boolean} conWsp  mostrar WhatsApp como vía adicional (cuando la acción principal no lo es)
 */
function evaluarBloque(o, accionPrincipal, notaAccion, conWsp) {
  const contexto = o.contexto ?? 'general';
  const tipos = [
    ['express', 'Automatizar un proceso puntual'],
    ['diagnostico', 'Evaluar varios procesos'],
    ['datos', 'Datos, reportes o stock'],
    ['capacitacion', 'Capacitar a mi equipo'],
    ['otro', 'Otra cosa'],
  ];
  const opciones = tipos.map(([v, t]) => `<option value="${v}"${v === (o.tipo ?? 'express') ? ' selected' : ''}>${esc(t)}</option>`).join('');

  const formulario = o.conFormulario === false ? '' : `
    <form class="form" id="form-contacto" action="/api/contacto" method="post" novalidate>
      <h3 class="form-tit">O déjanos los datos y te escribimos</h3>
      <div class="form-fila">
        <div class="campo"><label for="f-nombre">Nombre</label><input id="f-nombre" name="nombre" type="text" autocomplete="name" maxlength="120" required aria-describedby="f-nombre-err"><p class="campo-err" id="f-nombre-err" hidden>Escribe tu nombre.</p></div>
        <div class="campo"><label for="f-empresa">Empresa <span class="opc">(opcional)</span></label><input id="f-empresa" name="empresa" type="text" autocomplete="organization" maxlength="160"></div>
      </div>
      <div class="campo"><label for="f-contacto">WhatsApp o correo</label><input id="f-contacto" name="contacto" type="text" autocomplete="email" maxlength="160" required aria-describedby="f-contacto-ayuda f-contacto-err"><p class="ayuda" id="f-contacto-ayuda">Solo lo usamos para responderte. Ej.: +56 9 1234 5678 o nombre@empresa.cl</p><p class="campo-err" id="f-contacto-err" hidden>Escribe un WhatsApp (8 dígitos o más) o un correo válido.</p></div>
      <div class="campo"><label for="f-tipo">Qué necesitas</label><select id="f-tipo" name="tipo">${opciones}</select></div>
      <div class="campo"><label for="f-mensaje">Qué proceso te está costando tiempo <span class="opc">(opcional)</span></label><textarea id="f-mensaje" name="mensaje" rows="4" maxlength="2000" placeholder="Ejemplo: cada semana armamos el mismo informe de ventas desde tres planillas."></textarea></div>
      <div class="trampa" aria-hidden="true" inert><input id="f-web" name="web" type="text" tabindex="-1" autocomplete="off" data-trampa></div>
      <input type="hidden" name="fuente" value="${esc(PAGINA.fuente)}">
      <input type="hidden" name="t" value="">
      <p class="form-msg" id="form-msg" role="status" aria-live="polite"></p>
      <button class="btn btn--primario" type="submit" id="form-enviar"><span>Enviar</span></button>
      ${avisoPrivacidad()}
    </form>`;

  return `<section class="seccion seccion--oscura" id="evaluar" aria-labelledby="evaluar-tit">
  <div class="contenedor evaluar">
    <div class="evaluar-txt">
      <p class="lema">Que la IA haga el trabajo que hoy te come el día.</p>
      <h2 id="evaluar-tit">${esc(o.titulo ?? 'Evaluemos un proceso de tu empresa')}</h2>
      <p class="lead">${esc(o.bajada ?? 'Veinte minutos, sin costo. Nos cuentas el proceso y te decimos si conviene automatizarlo, cómo lo haríamos y cuánto costaría. Si no conviene, también te lo decimos.')}</p>
      <div class="evaluar-acciones">
        ${accionPrincipal}
        <p class="nota-clara">${esc(notaAccion)}</p>
      </div>
      <ul class="vias">
        ${conWsp ? `<li><a href="${esc(wsp(contexto, PAGINA.fuente))}" data-wsp="${esc(contexto)}" data-track-label="evaluar" target="_blank" rel="noopener">${icono('whatsapp')}<span><b>WhatsApp</b>${esc(SITIO.contacto.whatsappVisible)}</span></a></li>` : ''}
        <li><a href="mailto:${esc(SITIO.contacto.email)}" data-track="email_click" data-track-label="evaluar">${icono('correo')}<span><b>Correo</b>${esc(SITIO.contacto.email)}</span></a></li>
      </ul>
      <p class="nota-clara">${esc(SITIO.contacto.respuesta)} · Confidencialidad por escrito antes de ver tus datos.</p>
    </div>
    ${formulario}
  </div>
</section>`;
}

/**
 * Documento HTML completo.
 * @param {{ ruta: string, titulo: string, descripcion: string, cuerpo: string,
 *   jsonld?: object[], noindex?: boolean, contextoWsp?: string, fuente: string,
 *   ogTitulo?: string, ogImagen?: string, articulo?: { publicado: string, actualizado: string },
 *   hashes: { css: string, js: string, herramientas?: string, calculo?: string }, cliente: object,
 *   herramientas?: { alguna: boolean, calculo: boolean } }} p
 */
export function documento(p) {
  const url = absoluta(p.ruta);
  const og = p.ogTitulo ?? p.titulo;
  const ld = (p.jsonld ?? []).length
    ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': p.jsonld }).replace(/</g, '\\u003c')}</script>`
    : '';
  const contexto = p.contextoWsp ?? 'general';
  const tieneEvaluar = p.cuerpo.includes('id="evaluar"');
  const imagen = SITIO.dominio + (p.ogImagen ?? '/og-image.png');
  const art = p.articulo
    ? `\n<meta property="article:published_time" content="${esc(p.articulo.publicado)}">\n<meta property="article:modified_time" content="${esc(p.articulo.actualizado)}">\n<meta property="article:author" content="${esc(SITIO.fundador.nombre)}">`
    : '';
  return separarBloques(`<!DOCTYPE html>
<html lang="${SITIO.idioma}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.titulo)}</title>
<meta name="description" content="${esc(p.descripcion)}">
<meta name="robots" content="${p.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
<meta name="theme-color" content="#EFF0EC" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0D1215" media="(prefers-color-scheme: dark)">
<meta name="google-site-verification" content="F0wlUHOu0ZbhIH8Lr_W29YTM3gHIGOkzrA9IIeWU8Jw">${SITIO.verificacion?.bing ? `\n<meta name="msvalidate.01" content="${esc(SITIO.verificacion.bing)}">` : ''}
${p.noindex ? '' : `<link rel="canonical" href="${esc(url)}">`}
<meta property="og:type" content="${p.articulo ? 'article' : 'website'}">
<meta property="og:locale" content="es_CL">
<meta property="og:site_name" content="${esc(SITIO.marca)} · ${esc(SITIO.linea)}">
<meta property="og:title" content="${esc(og)}">
<meta property="og:description" content="${esc(p.descripcion)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(imagen)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(og)}">${art}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(og)}">
<meta name="twitter:description" content="${esc(p.descripcion)}">
<meta name="twitter:image" content="${esc(imagen)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="Recursos de ANVAR TECH" href="/feed.xml">
<link rel="preload" href="/fuentes/archivo-latin-500-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fuentes/ibm-plex-sans-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css?v=${p.hashes.css}">
${ld}
</head>
<body data-wsp-contexto="${esc(contexto)}" data-fuente="${esc(p.fuente)}">
<a class="saltar" href="#contenido">Saltar al contenido</a>
${cabecera(p.ruta, tieneEvaluar)}
<main id="contenido">
${p.cuerpo}
</main>
${pie(tieneEvaluar)}
<a class="wsp-flotante" href="${esc(wsp(contexto, p.fuente))}" data-wsp="${esc(contexto)}" data-track-label="flotante" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">${icono('whatsapp')}<span>WhatsApp</span></a>
<script type="application/json" id="config">${JSON.stringify(p.cliente).replace(/</g, '\\u003c')}</script>
<script defer src="${esc(SITIO.analitica.script)}"></script>${p.herramientas?.calculo ? `\n<script defer src="/calculo.js?v=${p.hashes.calculo}"></script>` : ''}
<script defer src="/app.js?v=${p.hashes.js}"></script>${p.herramientas?.alguna ? `\n<script defer src="/herramientas.js?v=${p.hashes.herramientas}"></script>` : ''}
</body>
</html>
`);
}
