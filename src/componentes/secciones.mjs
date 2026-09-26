// @ts-check
// Secciones reutilizables. Cada función recibe datos y devuelve HTML.
import { SITIO } from '../config.mjs';
import { SERVICIOS, ESCALERA } from '../datos/oferta.mjs';
import { CASOS, ETIQUETAS, METRICAS, caso, urlCaso } from '../datos/casos.mjs';
import { PROBLEMAS, PROCESO, SEGURIDAD } from '../datos/contenido.mjs';
import { publicables } from '../datos/testimonios.mjs';
import { VIDEO_INICIO } from '../datos/video.mjs';
import { urlWsp, conRef, mensajeCaso } from '../datos/whatsapp.mjs';
import { PAGINA } from '../contexto.mjs';
import { esc, rico, precioTexto, notaUf, attrs } from '../html.mjs';
import { boton, encabezado, icono } from './base.mjs';

/** Etiqueta de transparencia: qué tipo de proyecto es. */
export function etiqueta(c) {
  return `<span class="etiqueta etiqueta--${esc(c.etiqueta)}">${esc(ETIQUETAS[c.etiqueta])}</span>`;
}

/**
 * Detalle de un precio (IVA y, si es en UF, su equivalente en pesos). Los
 * precios en UF llevan `data-uf` para que el navegador los actualice con la
 * UF del día (ver /api/uf y app.js).
 */
function detallePrecio(s, t) {
  if (s.precio.moneda !== 'UF') return `<span class="precio-d">${esc(t.detalle)}</span>`;
  return `<span class="precio-d"${attrs({ 'data-uf': s.precio.valor, 'data-iva': s.precio.iva })}>${esc(t.detalle)}</span>`;
}

/** Precio en dos líneas, desde la fuente única. */
export function precio(id, clase = 'precio') {
  const s = SERVICIOS[id];
  const t = precioTexto(s.precio);
  return `<p class="${clase}"><span class="precio-v">${esc(t.principal)}</span> ${detallePrecio(s, t)}${s.precio.nota ? ` <span class="precio-n">${esc(s.precio.nota)}</span>` : ''}</p>`;
}

/** Precio en una línea, para fichas: "UF 12 ≈ $492.000 + IVA". Devuelve HTML. */
export function precioLinea(id) {
  const s = SERVICIOS[id];
  const t = precioTexto(s.precio);
  return { html: `${esc(t.principal)} ${detallePrecio(s, t)}` };
}

/** Nota de la UF (con fecha), actualizable por el navegador. */
export const notaPreciosUf = () => `<span data-uf-nota>${esc(notaUf())}</span>`;

/* ------------------------------------------------------------------ hero */

/** Tarjeta de prueba: un caso real con su antes y después (hero de la portada y páginas de solución). */
export function tarjetaPrueba(c) {
  const ad = c.antesDespues;
  if (!ad) return '';
  return `<aside class="prueba" aria-label="Caso real ${esc(c.codigo)}">
  <div class="prueba-top"><span>Caso real · ${esc(c.codigo)}</span>${etiqueta(c)}</div>
  <div class="prueba-cuerpo">
    <p class="prueba-cat">${esc(c.categoria)}</p>
    <p class="prueba-tit">${esc(c.titulo)}</p>
    <div class="antes-despues" role="group" aria-label="${esc(ad.texto)}">
      <div><span class="ad-l">Antes</span> <span class="ad-v">${esc(ad.antes)}</span></div>
      <span class="ad-flecha" aria-hidden="true">→</span>
      <div><span class="ad-l">Después</span> <span class="ad-v ad-v--ok">${esc(ad.despues)}</span></div>
    </div>
    <div class="barra" aria-hidden="true"><i class="barra-${esc(ad.pct)}"></i></div>
    <p class="prueba-res"><b>${esc(c.resultado.valor)}</b> ${esc(c.resultado.texto)}</p>
    <p class="prueba-txt">${esc(c.despues)}</p>
  </div>
  <dl class="rotulo">
    <div><dt>Estado</dt><dd>${esc(c.estado)}</dd></div>
    <div><dt>Medición</dt><dd>Antes y después</dd></div>
    <div><dt>Contexto</dt><dd>${esc(c.cliente.industria ?? c.categoria)}</dd></div>
    <div><dt>Detalle</dt><dd><a href="${esc(urlCaso(c))}" data-track="case_cta_click" data-track-label="hero-${esc(c.id)}">Ver caso<span class="sr"> ${esc(c.codigo)}</span></a></dd></div>
  </dl>
</aside>`;
}

/**
 * Video de la portada, bajo el hero. El poster se ve de inmediato (<picture>,
 * 16:9 o 4:5 según el ancho) y el video no se descarga hasta que app.js lo
 * pide: al entrar en pantalla, en silencio, salvo que la persona prefiera
 * menos movimiento o esté ahorrando datos (entonces espera el botón). Se
 * reproduce una vez y queda en el cierre. Tiene voz en off: "Activar sonido" lo
 * reinicia con voz, y "Subtítulos" muestra la pista .vtt.
 */
export function videoInicio(v = VIDEO_INICIO) {
  const c = caso(v.caso);
  const fuentes = Object.fromEntries(Object.entries(v.formatos).map(([k, f]) => [k, { webm: f.webm, mp4: f.mp4 }]));
  const i = (n, icon) => `<span class="video-inicio-i" data-i="${n}">${icono(icon)}</span>`;
  return `<section class="seccion seccion--video" id="video" aria-labelledby="video-tit">
  <div class="contenedor">
    <h2 class="sr" id="video-tit">ANVAR TECH en ${v.duracion} segundos</h2>
    <figure class="video-inicio"${attrs({ 'data-video-inicio': JSON.stringify(fuentes) })}>
      <div class="video-inicio-caja">
        <div class="video-inicio-marco">
          <video class="video-inicio-v" muted playsinline preload="none" aria-label="Animación con voz en off: qué hace ANVAR TECH, en ${v.duracion} segundos" aria-describedby="video-texto">
            <track kind="captions"${attrs({ src: v.subtitulos })} srclang="es" label="Español">
          </video>
          <picture class="video-inicio-portada">
            <source media="(max-width: 640px)"${attrs({ srcset: v.formatos.v.poster, width: v.formatos.v.ancho, height: v.formatos.v.alto })}>
            <img${attrs({ src: v.formatos.h.poster, alt: '', width: v.formatos.h.ancho, height: v.formatos.h.alto, decoding: 'async' })}>
          </picture>
        </div>
        <div class="video-inicio-controles" hidden>
          <button class="video-inicio-btn" type="button" data-accion="reproducir" data-estado="reproducir">${i('reproducir', 'play')}${i('pausar', 'pausa')}${i('repetir', 'repetir')}<span class="video-inicio-txt">Reproducir video</span></button>
          <button class="video-inicio-btn" type="button" data-accion="sonido" aria-pressed="false">${i('sonido', 'sonido')}${i('silencio', 'silencio')}<span class="video-inicio-txt">Activar sonido</span></button>
          <button class="video-inicio-btn" type="button" data-accion="subtitulos" aria-pressed="false">${i('cc', 'subtitulos')}<span class="video-inicio-txt">Subtítulos</span></button>
        </div>
      </div>
      <figcaption class="video-inicio-pie"><span>Animación de ${v.duracion} s con voz en off generada con IA. Parte sin sonido.</span> <span>Las cifras son las del <a${attrs({ href: c.paginaCaso || urlCaso(c), 'data-track': 'case_cta_click', 'data-track-label': 'video-inicio' })}>caso ${esc(c.codigo)}</a>, ${esc(ETIQUETAS[c.etiqueta].toLowerCase())} ${esc(c.estado.toLowerCase())}.</span></figcaption>
      <details class="video-inicio-texto" id="video-texto">
        <summary>Qué dice y muestra el video, en texto</summary>
        <ol>${v.escenas.map(([t, voz, pantalla]) => `<li><b>${esc(t)}.</b> Voz: «${esc(voz)}» En pantalla: ${esc(pantalla)}</li>`).join('')}</ol>
      </details>
    </figure>
  </div>
</section>`;
}

export function heroInicio() {
  return `<section class="hero" aria-labelledby="hero-tit">
  <div class="contenedor hero-grid">
    <div class="hero-txt">
      <p class="sobretitulo">${esc(SITIO.marca)} · Automatización e inteligencia operacional · Chile</p>
      <h1 id="hero-tit">Automatizamos el trabajo repetitivo de tu empresa.</h1>
      <p class="lead">Conectamos IA, software y las herramientas que ya usas —Excel, Word, PDF, correo, WhatsApp— para que tu equipo deje de copiar, pegar y digitar.</p>
      <p class="hero-metodo">Partimos por un proceso. Lo medimos antes y después. <b>Si no genera valor, no escalamos.</b></p>
      <div class="hero-cta">
        ${boton({ href: '#evaluar', texto: 'Evaluar mi proceso', grande: true, track: 'hero_cta_click', trackData: 'hero' })}
        ${boton({ href: '#casos', texto: 'Ver casos reales', variante: 'secundario', grande: true, track: 'hero_cta_click', trackData: 'hero-casos' })}
      </div>
      <ul class="confianza">
        <li>Emitimos factura</li>
        <li>Confidencialidad antes de ver tus datos</li>
        <li>Santiago y remoto</li>
      </ul>
    </div>
    ${tarjetaPrueba(caso('documentos-legales'))}
  </div>
</section>`;
}

/* -------------------------------------------------------------- métricas */

export function tiraMetricas() {
  return `<section class="metricas" aria-label="Resultados medidos">
  <div class="contenedor">
    <ul class="metricas-lista">
      ${METRICAS.map((m) => {
        const c = caso(m.caso);
        const v = c.metricas[m.metrica].valor;
        return `<li><a href="${esc(urlCaso(c))}" data-track="case_cta_click" data-track-label="metrica-${esc(c.id)}"><span class="metrica-v">${esc(v)}</span> <span class="metrica-t">${esc(m.texto)}</span> <span class="metrica-f">${esc(c.codigo)} · ${esc(ETIQUETAS[c.etiqueta])}</span></a></li>`;
      }).join('')}
    </ul>
    <p class="metricas-nota">Resultados de proyectos propios y de un cliente confidencial, con la etiqueta de cada uno. Así medimos también cada proyecto nuevo.</p>
  </div>
</section>`;
}

/* ------------------------------------------------------------- problemas */

export function problemas() {
  return `<section class="seccion" id="soluciones" aria-labelledby="soluciones-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Soluciones', titulo: '¿Dónde se le está yendo el tiempo a tu empresa?', id: 'soluciones-tit', bajada: 'Organizamos el trabajo por problema, no por tecnología. La herramienta se elige después de entender el proceso.' })}
    <ul class="problemas">
      ${PROBLEMAS.map((p) => {
        const s = SERVICIOS[p.empieza];
        const c = p.caso ? caso(p.caso) : null;
        return `<li class="problema">
        <h3>${esc(p.titulo)}</h3>
        <p class="problema-cuando"><span class="label">Cuando</span> ${esc(p.cuando)}</p>
        <ul class="chips" aria-label="Ejemplos">${p.ejemplos.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
        <p class="problema-pie">
          <span class="label">Se parte con</span>
          <a href="${esc(s.url)}" data-track="service_click" data-track-label="${esc(s.id)}">${esc(s.nombre)}</a>
          ${c ? `<span class="problema-caso">· <a href="${esc(urlCaso(c))}" data-track="case_cta_click" data-track-label="problema-${esc(c.id)}">caso ${esc(c.codigo)}</a></span>` : ''}
        </p>
        ${p.guia ? `<p class="problema-guia"><a href="${esc(p.guia[0])}" data-track="content_cta_click" data-track-label="problema-${esc(p.id)}">${esc(p.guia[1])} →</a></p>` : ''}
      </li>`;
      }).join('')}
    </ul>
  </div>
</section>`;
}

/* ----------------------------------------------------------------- casos */

/** Un archivo de un caso: video en bucle, GIF, imagen o captura. */
function medio(m, { lazy = true } = {}) {
  const leyenda = m.leyenda ? `<figcaption>${esc(m.leyenda)}${m.duracion ? ` <span class="medio-dur">${esc(m.duracion)}</span>` : ''}</figcaption>` : '';
  if (m.tipo === 'video') {
    // Miniatura → reproducir: la página carga solo el poster (diferido). El
    // video se crea al hacer clic (herramienta en app.js), con WebM si existe,
    // MP4 y subtítulos. Sin JavaScript, el enlace abre el MP4 directamente.
    const fuentes = [m.webm ? { src: m.webm, tipo: 'video/webm' } : null, { src: m.src, tipo: 'video/mp4' }].filter(Boolean);
    const datos = JSON.stringify({ fuentes, subtitulos: m.subtitulos ?? null, ancho: m.ancho, alto: m.alto, alt: m.alt });
    return `<figure class="medio medio--video"><a class="video-miniatura" href="${esc(m.src)}"${attrs({ 'data-video': datos })}>` +
      `<img${attrs({ src: m.poster, alt: m.alt, width: m.ancho, height: m.alto, loading: lazy ? 'lazy' : null, decoding: 'async' })}>` +
      ` <span class="video-play">${icono('play')}<span>Ver video${m.duracion ? ` <span class="medio-dur">(${esc(m.duracion)})</span>` : ''}</span></span></a>${leyenda}</figure>`;
  }
  return `<figure class="medio medio--${esc(m.tipo)}"><img${attrs({ src: m.src, alt: m.alt, width: m.ancho, height: m.alto, loading: lazy ? 'lazy' : null, decoding: 'async' })}>${leyenda}</figure>`;
}

/** Diagrama del flujo del caso, en HTML: sirve de evidencia visual cuando aún no hay video. */
export function flujoCaso(c, clase = '') {
  return `<ol class="flujo-caso${clase ? ' ' + clase : ''}" aria-label="Cómo funciona el caso ${esc(c.codigo)}">${c.flujo.map(([t, d]) => `<li><span class="flujo-caso-t">${esc(t)}</span> <span class="flujo-caso-d">${esc(d)}</span></li>`).join('')}</ol>`;
}

/** Evidencia visual completa del caso (para /casos): principal, galería y demostración. */
function evidenciaCaso(c) {
  const m = c.media;
  if (!m) return flujoCaso(c);
  const partes = [];
  if (m.principal) partes.push(medio(m.principal));
  if (m.galeria?.length) partes.push(`<div class="galeria">${m.galeria.map((g) => medio(g)).join('')}</div>`);
  if (m.demo) partes.push(`<p class="demo-enlace"><a class="btn btn--secundario" href="${esc(m.demo.url)}" target="_blank" rel="noopener" data-track="case_cta_click" data-track-label="demo-${esc(c.id)}"><span>${esc(m.demo.texto)}</span></a></p>`);
  partes.push(flujoCaso(c, 'flujo-caso--compacto'));
  return `<div class="evidencia">${partes.join('')}</div>`;
}

/** Tarjeta visual de un caso: problema, antes, después y resultado. */
export function tarjetaCaso(c) {
  const portada = c.media?.principal ? medio(c.media.principal.tipo === 'video' && c.media.principal.poster
    ? { tipo: 'imagen', src: c.media.principal.poster, alt: c.media.principal.alt, ancho: c.media.principal.ancho, alto: c.media.principal.alto }
    : c.media.principal) : '';
  return `<article class="caso" aria-labelledby="caso-${esc(c.id)}">
  ${portada ? `<div class="caso-media">${portada}</div>` : ''}
  <header class="caso-cab">
    <p class="caso-meta"><span class="caso-cod">${esc(c.codigo)}</span>${etiqueta(c)}<span class="caso-estado">${esc(c.estado)}</span></p>
    <p class="caso-cat">${esc(c.categoria)}</p>
    <h3 id="caso-${esc(c.id)}">${esc(c.titulo)}</h3>
  </header>
  <p class="caso-problema">${esc(c.problema)}</p>
  <div class="ad-bloques">
    <div class="ad-bloque"><span class="label">Antes</span><p>${esc(c.antes)}</p></div>
    <div class="ad-bloque ad-bloque--despues"><span class="label">Después</span><p>${esc(c.despues)}</p></div>
  </div>
  <p class="caso-resultado"><span class="caso-resultado-v">${esc(c.resultado.valor)}</span> <span>${esc(c.resultado.texto)}</span></p>
  <a class="enlace-flecha" href="${esc(c.paginaCaso ?? urlCaso(c))}" data-track="case_cta_click" data-track-label="${esc(c.id)}"><span>Ver caso completo<span class="sr"> ${esc(c.codigo)}</span></span>${icono('flecha')}</a>
</article>`;
}

export function casosInicio() {
  return `<section class="seccion seccion--panel" id="casos" aria-labelledby="casos-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Casos reales', titulo: 'Casos reales, con la etiqueta que corresponde', id: 'casos-tit', bajada: 'Cada caso dice si es un proyecto propio, un cliente o una demostración. No mostramos proyectos propios como si fueran clientes.' })}
    <p class="desliza" aria-hidden="true">Desliza para ver los ${CASOS.length} casos →</p>
    <div class="casos casos--desliza" role="region" aria-label="Casos reales" tabindex="0">
      ${CASOS.map(tarjetaCaso).join('')}
    </div>
    <p class="casos-pie"><a class="enlace-flecha" href="/casos" data-track="case_cta_click" data-track-label="todos"><span>Ver todos los casos en detalle</span>${icono('flecha')}</a></p>
  </div>
</section>`;
}

/** Ficha completa de un caso, para /casos. */
export function detalleCaso(c) {
  const metricas = c.metricas.length
    ? `<ul class="metricas-caso">${c.metricas.map((m) => `<li><span class="metrica-v">${esc(m.valor)}</span> <span class="metrica-t">${esc(m.texto)}</span>${m.nota ? `<span class="metrica-nota">${esc(m.nota)}</span>` : ''}</li>`).join('')}</ul>`
    : '';
  const s = SERVICIOS[c.servicio];
  const wspCaso = urlWsp(conRef(mensajeCaso(c.codigo), PAGINA.fuente));
  return `<article class="detalle" id="${esc(c.id)}" aria-labelledby="det-${esc(c.id)}">
  <header class="detalle-cab">
    <p class="caso-meta"><span class="caso-cod">${esc(c.codigo)}</span>${etiqueta(c)}<span class="caso-estado">${esc(c.estado)}</span></p>
    <p class="caso-cat">${esc(c.categoria)}</p>
    <h2 id="det-${esc(c.id)}">${esc(c.titulo)}</h2>
    <p class="detalle-contexto">${esc(c.contexto)}</p>
  </header>
  ${evidenciaCaso(c)}
  <div class="detalle-grid">
    <div class="detalle-bloque"><h3 class="label">Problema</h3><p>${esc(c.problema)}</p></div>
    <div class="detalle-bloque"><h3 class="label">Antes</h3><p>${esc(c.antes)}</p></div>
    <div class="detalle-bloque detalle-bloque--despues"><h3 class="label">Después</h3><p>${esc(c.despues)}</p></div>
  </div>
  <p class="caso-resultado caso-resultado--grande"><span class="caso-resultado-v">${esc(c.resultado.valor)}</span> <span>${esc(c.resultado.texto)}</span></p>
  ${metricas}
  <div class="detalle-grid detalle-grid--2">
    <div class="detalle-bloque"><h3 class="label">Qué se construyó</h3><ul class="lista">${c.construido.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="detalle-bloque"><h3 class="label">Cómo se midió</h3><p>${esc(c.medicion)}</p>${c.disclaimer ? `<p class="alcance"><b>Alcance de la cifra.</b> ${esc(c.disclaimer)}</p>` : ''}</div>
  </div>
  <details class="tecnico"><summary>Detalles técnicos</summary><ul class="chips chips--tec">${c.tecnologias.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></details>
  ${c.paginaCaso ? `<p class="detalle-mas"><a class="enlace-flecha" href="${esc(c.paginaCaso)}" data-track="case_cta_click" data-track-label="largo-${esc(c.id)}"><span>Leer el caso completo: contexto, proceso y cómo se midió</span>${icono('flecha')}</a></p>` : ''}
  ${c.guia ? `<p class="detalle-mas"><a class="enlace-flecha" href="${esc(c.guia.url)}" data-track="content_cta_click" data-track-label="guia-${esc(c.id)}"><span>${esc(c.guia.texto)}</span>${icono('flecha')}</a></p>` : ''}
  <div class="detalle-pie">
    <p>¿Un proceso parecido en tu empresa? Lo más cercano es <a href="${esc(s.url)}" data-track="service_click" data-track-label="caso-${esc(s.id)}">${esc(s.nombre)}</a>.</p>
    <a class="btn btn--secundario" href="${esc(wspCaso)}" data-wsp="caso" data-track-label="wsp-${esc(c.id)}" target="_blank" rel="noopener">${icono('whatsapp')}<span>Tengo un proceso parecido</span> <span class="sr"> al caso ${esc(c.codigo)}</span></a>
  </div>
</article>`;
}

/* ------------------------------------------------------------ testimonios */

/**
 * Testimonios autorizados. Sin ninguno publicable devuelve '' y la sección
 * no existe: nunca se muestra un bloque vacío ni un testimonio genérico.
 */
export function testimonios({ caso: idCaso = null, titulo = 'Lo que dicen quienes ya trabajaron con nosotros', datos = undefined } = {}) {
  const lista = publicables(datos).filter((t) => !idCaso || t.caso === idCaso);
  if (!lista.length) return '';
  const tarjeta = (t) => {
    const quien = t.confidencial
      ? `<span class="testimonio-nombre">${esc(t.cargo)}</span> <span class="testimonio-org">Cliente confidencial · ${esc(t.industria)}</span>`
      : `<span class="testimonio-nombre">${esc(t.nombre)}</span> <span class="testimonio-org">${esc(t.cargo)} · ${esc(t.empresa)} · ${esc(t.industria)}</span>`;
    const foto = !t.confidencial && t.foto ? `<img class="testimonio-foto" src="${esc(t.foto)}" alt="" width="56" height="56" loading="lazy" decoding="async">` : '';
    const logo = !t.confidencial && t.logo ? `<img class="testimonio-logo" src="${esc(t.logo)}" alt="${esc(t.empresa)}" height="28" loading="lazy" decoding="async">` : '';
    const c = t.caso ? caso(t.caso) : null;
    return `<figure class="testimonio">
      <blockquote><p>${esc(t.frase)}</p></blockquote>
      <figcaption>${foto}<span class="testimonio-quien">${quien}</span>${logo}</figcaption>
      ${t.resultado || c ? `<p class="testimonio-res">${t.resultado ? `<b>${esc(t.resultado)}</b>` : ''}${c ? ` · <a href="${esc(urlCaso(c))}" data-track="case_cta_click" data-track-label="testimonio-${esc(c.id)}">caso ${esc(c.codigo)}</a>` : ''}</p>` : ''}
    </figure>`;
  };
  return `<section class="seccion" id="testimonios" aria-labelledby="testimonios-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Clientes', titulo, id: 'testimonios-tit', bajada: 'Publicados con autorización escrita de cada cliente.' })}
    <div class="testimonios">${lista.map(tarjeta).join('')}</div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- método */

export function proceso() {
  return `<section class="seccion" id="metodo" aria-labelledby="metodo-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Cómo trabajamos', titulo: 'Detectamos, construimos, medimos y recién ahí escalamos', id: 'metodo-tit', bajada: 'En cada etapa puedes parar. Nunca te pedimos firmar un proyecto largo antes de ver un resultado.' })}
    <ol class="pasos">
      ${PROCESO.map((p, i) => `<li class="paso">
        <span class="paso-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <p class="paso-cuando">${esc(p.cuando)}</p>
        <h3>${esc(p.titulo)}</h3>
        <p>${esc(p.texto)}</p>
        <p class="paso-entrega"><span class="label">Resultado</span> ${esc(p.entrega)}</p>
      </li>`).join('')}
    </ol>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- precios */

function tarjetaPrecio({ nivel, titulo, bajada, ids, destacado = false, cta }) {
  const lineas = ids.map((id) => {
    const s = SERVICIOS[id];
    return `<div class="plan-linea">
      <p class="plan-servicio"><a href="${esc(s.url)}" data-track="service_click" data-track-label="${esc(id)}">${esc(s.nombre)}</a><span>${esc(s.plazo)}</span></p>
      ${precio(id)}
    </div>`;
  }).join('');
  const incluye = SERVICIOS[ids[0]].incluye;
  return `<article class="plan${destacado ? ' plan--destacado' : ''}">
    <p class="plan-nivel">${esc(nivel)}</p>
    <h3>${esc(titulo)}</h3>
    <p class="plan-bajada">${esc(bajada)}</p>
    ${lineas}
    <ul class="lista lista--check">${incluye.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    ${cta}
  </article>`;
}

/** "desde UF 6 / mes + IVA" en una línea, para listas cortas. */
const precioCorto = (id) => {
  const s = SERVICIOS[id];
  const t = precioTexto(s.precio);
  return s.precio.moneda === 'UF' ? `${t.principal} + IVA` : `${t.principal} ${t.detalle}`;
};

export function precios() {
  return `<section class="seccion seccion--panel" id="contratar" aria-labelledby="contratar-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Formas de contratar', titulo: 'Empieza pequeño. Escala solo si funciona.', id: 'contratar-tit', bajada: 'Tres formas de empezar según el tamaño del problema. Precios publicados, netos más IVA, con alcance escrito antes de partir.' })}
    <div class="planes">
      ${tarjetaPrecio({
        nivel: 'Empezar', titulo: 'Un proceso pequeño', bajada: 'La forma de probar ANVAR TECH con bajo riesgo: un proceso delimitado, resuelto y funcionando. El precio final se fija por escrito según el proceso.',
        ids: ['express'], destacado: true,
        cta: boton({ href: SERVICIOS.express.url, texto: 'Ver Automatización Express', track: 'service_click', trackData: 'plan-express' }),
      })}
      ${tarjetaPrecio({
        nivel: 'Validar', titulo: 'Varios procesos o uno grande', bajada: 'Primero medimos, después construimos un piloto sobre la mejor oportunidad.',
        ids: ['diagnostico', 'piloto'],
        cta: boton({ href: SERVICIOS.diagnostico.url, texto: 'Ver diagnóstico y piloto', variante: 'secundario', track: 'service_click', trackData: 'plan-diagnostico' }),
      })}
      ${tarjetaPrecio({
        nivel: 'Escalar', titulo: 'La solución completa', bajada: 'Implementación integrada con tus sistemas y soporte para que siga funcionando.',
        ids: ['implementacion', 'soporte'],
        cta: boton({ href: SERVICIOS.implementacion.url, texto: 'Ver implementación', variante: 'secundario', track: 'service_click', trackData: 'plan-implementacion' }),
      })}
    </div>
    <ol class="escalera" aria-label="Recorrido típico">
      ${ESCALERA.map((e) => `<li><span class="escalera-paso">${esc(e.paso)}</span><a href="${esc(SERVICIOS[e.id].url)}" data-track="service_click" data-track-label="escalera-${esc(e.id)}">${esc(SERVICIOS[e.id].nombre)}</a><span class="escalera-que">${esc(e.que)}</span></li>`).join('')}
    </ol>
    <div class="otras">
      <p class="label">También</p>
      <ul>
        <li><a href="${esc(SERVICIOS.intelligence.url)}" data-track="service_click" data-track-label="intelligence">${esc(SERVICIOS.intelligence.nombre)}</a> <span>${esc(precioCorto('intelligence'))} · datos y alertas cada mes</span></li>
        <li><a href="${esc(SERVICIOS.capacitacion.url)}" data-track="service_click" data-track-label="capacitacion">${esc(SERVICIOS.capacitacion.nombre)}</a> <span>${esc(precioCorto('capacitacion'))} · taller de 4 horas</span></li>
        <li><a href="${esc(SERVICIOS.sesion.url)}" data-track="service_click" data-track-label="personas">Asesoría personal</a> <span>para personas, desde ${esc(precioCorto('sesion'))}</span></li>
      </ul>
    </div>
    <p class="nota">Valores referenciales, netos más IVA. Los proyectos se cotizan y facturan en UF. ${notaPreciosUf()} Emitimos factura.</p>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ datos */

/** Flujo de datos: de las fuentes a la decisión. HTML, no imagen: se lee y se adapta al móvil. */
export function flujoDatos() {
  const pasos = [
    ['Tus fuentes', 'ERP, Excel, CSV, sistema de ventas'],
    ['Datos consolidados', 'Limpios, unificados, en un solo lugar'],
    ['Análisis', 'Rotación, márgenes, ABC, anomalías'],
    ['Tablero', 'Actualizado y fácil de leer'],
    ['Alertas y tendencias', 'Stock crítico, desvíos, demanda'],
    ['Decisiones', 'Qué pedir, qué ajustar, qué revisar'],
  ];
  return `<ol class="flujo" aria-label="Del dato a la decisión">
  ${pasos.map(([t, d], i) => `<li class="flujo-paso${i === pasos.length - 1 ? ' flujo-paso--fin' : ''}"><span class="flujo-t">${esc(t)}</span> <span class="flujo-d">${esc(d)}</span></li>`).join('')}
</ol>`;
}

export function datosInicio() {
  const s = SERVICIOS.intelligence;
  return `<section class="seccion" id="datos" aria-labelledby="datos-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Datos e inteligencia operacional', titulo: 'Tus ventas, stock y costos, convertidos en decisiones', id: 'datos-tit', bajada: 'La mayoría de las empresas ya tiene los datos. Lo que falta es ordenarlos, leerlos a tiempo y saber qué hacer con ellos.' })}
    ${flujoDatos()}
    <div class="datos-grid">
      <ul class="resultados">
        <li><h3>Saber qué se está agotando</h3><p>Alertas de stock crítico y productos sin rotación, antes de que falten o se acumulen.</p></li>
        <li><h3>Ver dónde se pierde margen</h3><p>Ventas, costos y márgenes por producto, cliente o sucursal, en un solo tablero.</p></li>
        <li><h3>Dejar de armar reportes a mano</h3><p>Reportes periódicos que se generan solos, con un resumen ejecutivo en lenguaje claro.</p></li>
      </ul>
      <aside class="servicio-mes" aria-labelledby="intel-tit">
        <p class="plan-nivel">Servicio mensual · nuevo</p>
        <h3 id="intel-tit">${esc(s.nombre)}</h3>
        <p>${esc(s.resumen)}</p>
        <ul class="lista lista--check">${s.incluye.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        ${precio('intelligence')}
        <p class="servicio-mes-nota">Servicio reciente: el alcance se define por escrito con cada empresa y no tiene permanencia mínima.</p>
        ${boton({ href: '/inteligencia-datos', texto: 'Ver inteligencia de datos', variante: 'secundario', track: 'service_click', trackData: 'intelligence' })}
      </aside>
    </div>
  </div>
</section>`;
}

/* -------------------------------------------------------------- seguridad */

export function seguridad() {
  return `<section class="seccion seccion--panel" id="seguridad" aria-labelledby="seguridad-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Seguridad y propiedad', titulo: 'Diseñado para operar dentro de una empresa real', id: 'seguridad-tit', bajada: 'Medidas y controles que aplicamos en cada proyecto, según el riesgo de la información que maneja.' })}
    <ul class="seguridad">
      ${SEGURIDAD.map((s) => `<li><h3>${esc(s.titulo)}</h3><p>${esc(s.texto)}</p></li>`).join('')}
    </ul>
    <p class="nota">Ningún sistema es invulnerable, y no prometemos seguridad absoluta ni certificaciones que no tenemos. Lo que sí hacemos es reducir el riesgo con estas medidas y decirte por escrito qué se hace con tu información. Más detalle en la <a href="/privacidad">política de privacidad</a>.</p>
  </div>
</section>`;
}

/* ------------------------------------------------------------- fundador */

/** Foto del fundador, en los tamaños que corresponden. */
export function retrato({ sizes = '(max-width: 900px) 168px, 360px', clase = 'ficha-foto', lazy = true } = {}) {
  const f = SITIO.fundador;
  return `<picture>
          <source type="image/webp" srcset="/andres-vargas-160.webp 160w, /andres-vargas-320.webp 320w, /andres-vargas-600.webp 600w" sizes="${esc(sizes)}">
          <img class="${esc(clase)}" src="/andres-vargas-600.jpg" srcset="/andres-vargas-160.jpg 160w, /andres-vargas-320.jpg 320w, /andres-vargas-600.jpg 600w" sizes="${esc(sizes)}" width="600" height="750" alt="${esc(f.nombre)}, fundador de ANVAR TECH"${lazy ? ' loading="lazy"' : ''} decoding="async">
        </picture>`;
}

export function nosotros() {
  const e = SITIO.empresa;
  const f = SITIO.fundador;
  return `<section class="seccion" id="nosotros" aria-labelledby="nosotros-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Quiénes somos', titulo: 'Una empresa chilena que parte desde las operaciones', id: 'nosotros-tit' })}
    <div class="nosotros">
      <div class="ficha">
        ${retrato()}
        <div class="ficha-nombre"><b>${esc(f.nombre)}</b> <span>${esc(f.cargo)}</span></div>
        <dl class="ficha-datos">
          <div><dt>Empresa</dt><dd>${esc(SITIO.marca)}, marca de ${esc(e.razonSocial)} · RUT ${esc(e.rut)}</dd></div>
          <div><dt>Formación</dt><dd>${esc(f.formacion)}</dd></div>
          <div><dt>Experiencia</dt><dd>${esc(f.experiencia)}</dd></div>
          <div><dt>Atención</dt><dd>${esc(e.atencion)}</dd></div>
        </dl>
      </div>
      <div class="nosotros-txt">
        <p class="lead">Nuestra especialidad parte desde las operaciones, no desde la tecnología.</p>
        <p>Primero entendemos el proceso y dónde tu empresa pierde tiempo. Después decidimos si corresponde resolverlo con automatización, software, análisis de datos o IA. A veces la respuesta correcta es una planilla bien hecha, y también lo decimos.</p>
        <ul class="combinacion" aria-label="Lo que combinamos">
          <li>Ingeniería</li><li>Operaciones</li><li>Software</li><li>Automatización</li><li>IA</li>
        </ul>
        <p>ANVAR TECH nace de construir soluciones para problemas propios: un sistema documental que hoy se usa en operación diaria, un negocio que cotiza y cobra en línea, planos de ingeniería iterados sobre el archivo real. Ese mismo criterio es el que aplicamos en tu empresa.</p>
        <blockquote class="cita"><p>Si no podemos mostrarte qué mejoró y medirlo, el trabajo no está terminado.</p><footer>— ${esc(f.nombre)}</footer></blockquote>
        <p class="nota">Cada proyecto lo lidera directamente el fundador. Por eso trabajamos con pocos proyectos en paralelo y te damos la fecha real de inicio antes de cotizar. <a href="${esc(f.perfil)}">Perfil de ${esc(f.nombre)}</a>.</p>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------- faq */

/** @param {{ q: string, a: string }[]} lista */
export function preguntas(lista, { titulo = 'Lo que las empresas nos preguntan', codigo = 'Preguntas frecuentes' } = {}) {
  return `<section class="seccion" id="preguntas" aria-labelledby="preguntas-tit">
  <div class="contenedor contenedor--estrecho">
    ${encabezado({ codigo, titulo, id: 'preguntas-tit' })}
    <div class="faq">
      ${lista.map((p, i) => `<details class="faq-item"${i === 0 ? ' open' : ''}><summary>${esc(p.q)}</summary><div class="faq-r"><p>${rico(p.a)}</p></div></details>`).join('')}
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------ páginas de servicio */

/** Migas de pan visibles. `tramos` sin el inicio; el último es la página actual. */
export function migasVisibles(tramos) {
  const partes = [`<a href="/">Inicio</a>`];
  tramos.forEach(([t, h], i) => {
    partes.push('<span aria-hidden="true">/</span>');
    partes.push(i === tramos.length - 1 ? `<span aria-current="page">${esc(t)}</span>` : `<a href="${esc(h)}">${esc(t)}</a>`);
  });
  return `<nav class="migas" aria-label="Ruta">${partes.join('')}</nav>`;
}

/**
 * Portada de una página de servicio.
 * @param {{ sobretitulo: string, h1: string, lead: string, migas?: [string, string][],
 *   ficha: [string, string | { html: string }][], contexto: string,
 *   secundario?: {href:string, texto:string, track?: string},
 *   primario?: {href?:string, wsp?: string, texto:string, track?: string}, aviso?: string }} o
 *   `ficha`: [etiqueta, valor]. Texto (se escapa) o { html } (p. ej. un precio de `precioLinea`).
 *   `aviso`: HTML ya escapado que va sobre el título (p. ej. "línea para personas").
 */
export function heroServicio(o) {
  const primario = o.primario ?? { href: '#evaluar', texto: 'Evaluar mi proceso', track: 'hero_cta_click' };
  const btnPrimario = primario.wsp
    ? boton({ wsp: primario.wsp, texto: primario.texto, icono: 'whatsapp', grande: true, trackData: 'hero-' + o.contexto })
    : boton({ href: primario.href, texto: primario.texto, grande: true, track: primario.track ?? 'hero_cta_click', trackData: o.contexto });
  return `<section class="hero hero--servicio" aria-labelledby="hero-tit">
  <div class="contenedor">
    ${migasVisibles(o.migas ?? [[o.sobretitulo, '']])}
    <div class="hero-servicio">
      ${o.aviso ? `<p class="aviso-linea">${o.aviso}</p>` : ''}
      <p class="sobretitulo">${esc(o.sobretitulo)}</p>
      <h1 id="hero-tit">${esc(o.h1)}</h1>
      <p class="lead">${rico(o.lead)}</p>
      <div class="hero-cta">
        ${btnPrimario}
        ${o.secundario ? boton({ href: o.secundario.href, texto: o.secundario.texto, variante: 'secundario', grande: true, track: o.secundario.track ?? null, trackData: o.secundario.track ? 'hero-' + o.contexto : null }) : boton({ href: '/casos', texto: 'Ver casos reales', variante: 'secundario', grande: true, track: 'case_cta_click', trackData: 'hero-' + o.contexto })}
      </div>
      <dl class="datos-servicio">${o.ficha.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${typeof v === 'string' ? esc(v) : v.html}</dd></div>`).join('')}</dl>
    </div>
  </div>
</section>`;
}

/** Para quién sí y para quién no. */
export function paraQuien({ id, codigo, titulo, bajada = '', si, no, tituloSi = 'Es para ti si…', tituloNo = 'No es para ti si…' }) {
  return `<section class="seccion" aria-labelledby="${esc(id)}">
  <div class="contenedor">
    ${encabezado({ codigo, titulo, bajada, id })}
    <div class="si-no">
      <div class="si-no-col si-no-col--si"><h3>${esc(tituloSi)}</h3><ul class="lista">${si.map((x) => `<li>${rico(x)}</li>`).join('')}</ul></div>
      <div class="si-no-col"><h3>${esc(tituloNo)}</h3><ul class="lista lista--no">${no.map((x) => `<li>${rico(x)}</li>`).join('')}</ul></div>
    </div>
  </div>
</section>`;
}

/** Etapas numeradas de un servicio. */
export function etapas({ id, codigo, titulo, bajada = '', lista, panel = true }) {
  return `<section class="seccion${panel ? ' seccion--panel' : ''}" aria-labelledby="${esc(id)}">
  <div class="contenedor">
    ${encabezado({ codigo, titulo, bajada, id })}
    <ol class="etapas">
      ${lista.map(([cuando, t, d]) => `<li class="etapa"><span class="etapa-cuando">${esc(cuando)}</span><div><h3>${esc(t)}</h3><p>${rico(d)}</p></div></li>`).join('')}
    </ol>
  </div>
</section>`;
}

/**
 * Bloque de precio de un servicio, con lo que incluye, lo que no y su acción.
 * @param {{ titulo: { id: string, texto: string }, ids: string[], nota?: string, conCta?: boolean }} o
 */
export function bloquePrecio({ titulo, ids, nota = '', conCta = false }) {
  const hayUf = ids.some((sid) => SERVICIOS[sid].precio.moneda === 'UF');
  return `<section class="seccion" aria-labelledby="${esc(titulo.id)}">
  <div class="contenedor">
    ${encabezado({ codigo: 'Valor', titulo: titulo.texto, id: titulo.id })}
    <div class="precios-servicio">
      ${ids.map((sid) => {
        const s = SERVICIOS[sid];
        const noIncluye = s.noIncluye?.length ? `<p class="label">No incluye</p><ul class="lista lista--no">${s.noIncluye.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
        const cta = conCta ? boton({ wsp: s.cta.wsp, texto: s.cta.texto, icono: 'whatsapp', trackData: 'precio-' + sid }) : '';
        return `<article class="precio-tarjeta" id="${esc(sid === 'implementacion' ? 'implementacion' : sid === 'soporte' ? 'soporte' : 'precio-' + sid)}">
          <div class="precio-tarjeta-cab"><h3>${esc(s.nombre)}</h3><p class="precio-plazo">${esc(s.plazo)}</p>${precio(sid, 'precio precio--grande')}</div>
          <p>${esc(s.resumen)}</p>
          <p class="label">Incluye</p>
          <ul class="lista lista--check">${s.incluye.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          ${noIncluye}
          ${cta}
        </article>`;
      }).join('')}
    </div>
    ${nota || hayUf ? `<p class="nota">${rico(nota)}${hayUf ? ` ${notaPreciosUf()}` : ''}</p>` : ''}
  </div>
</section>`;
}

/** Casos relacionados, en formato tarjeta. */
export function casosRelacionados(ids, titulo = 'Casos relacionados') {
  const lista = ids.map(caso).filter(Boolean);
  if (!lista.length) return '';
  return `<section class="seccion seccion--panel" aria-labelledby="rel-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Evidencia', titulo, id: 'rel-tit' })}
    <div class="casos casos--${lista.length}">${lista.map(tarjetaCaso).join('')}</div>
  </div>
</section>`;
}

/** Enlaces a los otros servicios de empresa. */
export function otrosServicios(actual) {
  const ids = ['express', 'diagnostico', 'piloto', 'intelligence', 'capacitacion'].filter((x) => x !== actual);
  return `<section class="seccion" aria-labelledby="otros-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Otras formas de empezar', titulo: 'Otros servicios para empresas', id: 'otros-tit' })}
    <ul class="otros">
      ${ids.map((id) => {
        const s = SERVICIOS[id];
        return `<li><a href="${esc(s.url)}" data-track="service_click" data-track-label="otros-${esc(id)}"><span class="otros-t">${esc(s.nombre)}</span> <span class="otros-d">${esc(s.resumen)}</span> <span class="otros-p">${esc(precioCorto(id))}</span></a></li>`;
      }).join('')}
    </ul>
  </div>
</section>`;
}
