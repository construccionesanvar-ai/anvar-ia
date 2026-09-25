// @ts-check
// Secciones reutilizables. Cada función recibe datos y devuelve HTML.
import { SITIO } from '../config.mjs';
import { SERVICIOS, ESCALERA } from '../datos/oferta.mjs';
import { CASOS, ETIQUETAS, METRICAS } from '../datos/casos.mjs';
import { PROBLEMAS, PROCESO, SEGURIDAD } from '../datos/contenido.mjs';
import { esc, rico, precioTexto, attrs } from '../html.mjs';
import { boton, encabezado, icono } from './base.mjs';

const caso = (id) => CASOS.find((c) => c.id === id);

/** Etiqueta de transparencia: qué tipo de proyecto es. */
export function etiqueta(c) {
  return `<span class="etiqueta etiqueta--${esc(c.etiqueta)}">${esc(ETIQUETAS[c.etiqueta])}</span>`;
}

/** Precio en dos líneas, desde la fuente única. */
export function precio(id, clase = 'precio') {
  const s = SERVICIOS[id];
  const t = precioTexto(s.precio);
  return `<p class="${clase}"><span class="precio-v">${esc(t.principal)}</span><span class="precio-d">${esc(t.detalle)}</span>${s.precio.nota ? `<span class="precio-n">${esc(s.precio.nota)}</span>` : ''}</p>`;
}

/* ------------------------------------------------------------------ hero */

/** Tarjeta de prueba del hero: un caso real, con sus números. */
function tarjetaPrueba(c) {
  const [antes, despues] = c.metricas[0][0].split('→').map((x) => x.trim());
  return `<aside class="prueba" aria-label="Caso real ${esc(c.codigo)}">
  <div class="prueba-top"><span>Caso real · ${esc(c.codigo)}</span>${etiqueta(c)}</div>
  <div class="prueba-cuerpo">
    <p class="prueba-cat">${esc(c.categoria)}</p>
    <p class="prueba-tit">${esc(c.titulo)}</p>
    <div class="antes-despues" role="group" aria-label="Tiempo por procedimiento">
      <div><span class="ad-l">Antes</span><span class="ad-v">${esc(antes)}</span></div>
      <span class="ad-flecha" aria-hidden="true">→</span>
      <div><span class="ad-l">Después</span><span class="ad-v ad-v--ok">${esc(despues)}</span></div>
    </div>
    <div class="barra" aria-hidden="true"><i class="barra-91"></i></div>
    <p class="prueba-res"><b>${esc(c.resultado.valor)}</b> ${esc(c.resultado.texto)}</p>
    <p class="prueba-txt">${esc(c.despues)}</p>
  </div>
  <dl class="rotulo">
    <div><dt>Estado</dt><dd>${esc(c.estado)}</dd></div>
    <div><dt>Medición</dt><dd>Antes y después</dd></div>
    <div><dt>Contexto</dt><dd>Retail</dd></div>
    <div><dt>Detalle</dt><dd><a href="/casos#${esc(c.id)}" data-track="case_study_click" data-track-label="${esc(c.id)}">Ver caso</a></dd></div>
  </dl>
</aside>`;
}

export function heroInicio() {
  return `<section class="hero" aria-labelledby="hero-tit">
  <div class="contenedor hero-grid">
    <div class="hero-txt">
      <p class="sobretitulo">${esc(SITIO.empresa.nombre)} · Automatización e inteligencia operacional · Chile</p>
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
        return `<li><a href="/casos#${esc(c.id)}" data-track="case_study_click" data-track-label="metrica-${esc(c.id)}"><span class="metrica-v">${esc(m.valor)}</span><span class="metrica-t">${esc(m.texto)}</span><span class="metrica-f">${esc(c.codigo)} · ${esc(ETIQUETAS[c.etiqueta])}</span></a></li>`;
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
          ${c ? `<span class="problema-caso">· <a href="/casos#${esc(c.id)}" data-track="case_study_click" data-track-label="problema-${esc(c.id)}">caso ${esc(c.codigo)}</a></span>` : ''}
        </p>
      </li>`;
      }).join('')}
    </ul>
  </div>
</section>`;
}

/* ----------------------------------------------------------------- casos */

/** Tarjeta visual de un caso: problema, antes, después y resultado. */
export function tarjetaCaso(c) {
  const media = c.media ? mediaCaso(c) : '';
  return `<article class="caso" aria-labelledby="caso-${esc(c.id)}">
  ${media}
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
  <p class="caso-resultado"><span class="caso-resultado-v">${esc(c.resultado.valor)}</span><span>${esc(c.resultado.texto)}</span></p>
  <a class="enlace-flecha" href="/casos#${esc(c.id)}" data-track="case_study_click" data-track-label="${esc(c.id)}"><span>Ver caso completo</span>${icono('flecha')}</a>
</article>`;
}

function mediaCaso(c) {
  const m = c.media;
  if (m.tipo === 'video') {
    return `<figure class="caso-media"><video controls preload="none"${attrs({ poster: m.poster, width: m.ancho, height: m.alto })}><source src="${esc(m.src)}"></video><figcaption class="sr">${esc(m.alt)}</figcaption></figure>`;
  }
  return `<figure class="caso-media"><img${attrs({ src: m.src, alt: m.alt, width: m.ancho, height: m.alto, loading: 'lazy', decoding: 'async' })}></figure>`;
}

export function casosInicio() {
  return `<section class="seccion seccion--panel" id="casos" aria-labelledby="casos-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Casos reales', titulo: 'Casos reales, con la etiqueta que corresponde', id: 'casos-tit', bajada: 'Cada caso dice si es un proyecto propio, un cliente o una demostración. No mostramos proyectos propios como si fueran clientes.' })}
    <p class="desliza" aria-hidden="true">Desliza para ver los ${CASOS.length} casos →</p>
    <div class="casos casos--desliza" role="region" aria-label="Casos reales" tabindex="0">
      ${CASOS.map(tarjetaCaso).join('')}
    </div>
    <p class="casos-pie"><a class="enlace-flecha" href="/casos" data-track="case_study_click" data-track-label="todos"><span>Ver todos los casos en detalle</span>${icono('flecha')}</a></p>
  </div>
</section>`;
}

/** Ficha completa de un caso, para /casos. */
export function detalleCaso(c) {
  const metricas = c.metricas.length
    ? `<ul class="metricas-caso">${c.metricas.map(([v, t]) => `<li><span class="metrica-v">${esc(v)}</span><span class="metrica-t">${esc(t)}</span></li>`).join('')}</ul>`
    : '';
  const s = SERVICIOS[c.servicio];
  return `<article class="detalle" id="${esc(c.id)}" aria-labelledby="det-${esc(c.id)}">
  <header class="detalle-cab">
    <p class="caso-meta"><span class="caso-cod">${esc(c.codigo)}</span>${etiqueta(c)}<span class="caso-estado">${esc(c.estado)}</span></p>
    <p class="caso-cat">${esc(c.categoria)}</p>
    <h2 id="det-${esc(c.id)}">${esc(c.titulo)}</h2>
    <p class="detalle-contexto">${esc(c.contexto)}</p>
  </header>
  ${c.media ? mediaCaso(c) : ''}
  <div class="detalle-grid">
    <div class="detalle-bloque"><h3 class="label">Problema</h3><p>${esc(c.problema)}</p></div>
    <div class="detalle-bloque"><h3 class="label">Antes</h3><p>${esc(c.antes)}</p></div>
    <div class="detalle-bloque detalle-bloque--despues"><h3 class="label">Después</h3><p>${esc(c.despues)}</p></div>
  </div>
  <p class="caso-resultado caso-resultado--grande"><span class="caso-resultado-v">${esc(c.resultado.valor)}</span><span>${esc(c.resultado.texto)}</span></p>
  ${metricas}
  <div class="detalle-grid detalle-grid--2">
    <div class="detalle-bloque"><h3 class="label">Qué se construyó</h3><ul class="lista">${c.construido.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="detalle-bloque"><h3 class="label">Cómo se midió</h3><p>${esc(c.medicion)}</p></div>
  </div>
  <details class="tecnico"><summary>Detalles técnicos</summary><p>${esc(c.tecnico)}</p></details>
  <p class="detalle-pie">¿Un proceso parecido en tu empresa? Lo más cercano es <a href="${esc(s.url)}" data-track="service_click" data-track-label="${esc(s.id)}">${esc(s.nombre)}</a>.</p>
</article>`;
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

function tarjetaPrecio({ nivel, titulo, bajada, ids, destacado, cta }) {
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

export function precios() {
  return `<section class="seccion seccion--panel" id="contratar" aria-labelledby="contratar-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Formas de contratar', titulo: 'Empieza pequeño. Escala solo si funciona.', id: 'contratar-tit', bajada: 'Tres formas de empezar según el tamaño del problema. Precios publicados, netos más IVA, con alcance escrito antes de partir.' })}
    <div class="planes">
      ${tarjetaPrecio({
        nivel: 'Empezar', titulo: 'Un proceso pequeño', bajada: 'La forma de probar ANVAR TECH con bajo riesgo: un proceso delimitado, resuelto y funcionando.',
        ids: ['express'], destacado: true,
        cta: boton({ href: '/automatizacion-express', texto: 'Ver Automatización Express', track: 'service_click', trackData: 'express' }),
      })}
      ${tarjetaPrecio({
        nivel: 'Validar', titulo: 'Varios procesos o uno grande', bajada: 'Primero medimos, después construimos un piloto sobre la mejor oportunidad.',
        ids: ['diagnostico', 'piloto'],
        cta: boton({ href: '/diagnostico-ia-empresas', texto: 'Ver diagnóstico y piloto', variante: 'secundario', track: 'service_click', trackData: 'diagnostico' }),
      })}
      ${tarjetaPrecio({
        nivel: 'Escalar', titulo: 'La solución completa', bajada: 'Implementación integrada con tus sistemas y soporte para que siga funcionando.',
        ids: ['implementacion', 'soporte'],
        cta: boton({ href: '/automatizacion-procesos-ia#implementacion', texto: 'Ver implementación', variante: 'secundario', track: 'service_click', trackData: 'implementacion' }),
      })}
    </div>
    <ol class="escalera" aria-label="Recorrido típico">
      ${ESCALERA.map((e) => `<li><span class="escalera-paso">${esc(e.paso)}</span><a href="${esc(SERVICIOS[e.id].url)}" data-track="service_click" data-track-label="escalera-${esc(e.id)}">${esc(SERVICIOS[e.id].nombre)}</a><span class="escalera-que">${esc(e.que)}</span></li>`).join('')}
    </ol>
    <div class="otras">
      <p class="label">También</p>
      <ul>
        <li><a href="${esc(SERVICIOS.intelligence.url)}" data-track="service_click" data-track-label="intelligence">${esc(SERVICIOS.intelligence.nombre)}</a> <span>${esc(precioTexto(SERVICIOS.intelligence.precio).principal)} + IVA · datos y alertas cada mes</span></li>
        <li><a href="${esc(SERVICIOS.capacitacion.url)}" data-track="service_click" data-track-label="capacitacion">${esc(SERVICIOS.capacitacion.nombre)}</a> <span>${esc(precioTexto(SERVICIOS.capacitacion.precio).principal)} + IVA · taller de 4 horas</span></li>
        <li><a href="/asesoria-ia-personal" data-track="service_click" data-track-label="personas">Asesoría personal</a> <span>para personas, desde ${esc(precioTexto(SERVICIOS.sesion.precio).principal)}</span></li>
      </ul>
    </div>
    <p class="nota">Valores referenciales. Los precios en UF se muestran con su equivalente en pesos a una UF de ${esc(precioTexto({ moneda: 'CLP', valor: SITIO.uf, iva: 'mas' }).principal)}. Emitimos factura.</p>
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
    ['Alertas y pronóstico', 'Stock crítico, desvíos, demanda'],
    ['Decisiones', 'Qué pedir, qué ajustar, qué revisar'],
  ];
  return `<ol class="flujo" aria-label="Del dato a la decisión">
  ${pasos.map(([t, d], i) => `<li class="flujo-paso${i === pasos.length - 1 ? ' flujo-paso--fin' : ''}"><span class="flujo-t">${esc(t)}</span><span class="flujo-d">${esc(d)}</span></li>`).join('')}
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
        <p class="plan-nivel">Servicio mensual</p>
        <h3 id="intel-tit">${esc(s.nombre)}</h3>
        <p>${esc(s.resumen)}</p>
        <ul class="lista lista--check">${s.incluye.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        ${precio('intelligence')}
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
    ${encabezado({ codigo: 'Seguridad y propiedad', titulo: 'Diseñado para operar dentro de una empresa real', id: 'seguridad-tit', bajada: 'Tus datos, tu código y tu operación siguen siendo tuyos. Esto es lo que hacemos en cada proyecto.' })}
    <ul class="seguridad">
      ${SEGURIDAD.map((s) => `<li><h3>${esc(s.titulo)}</h3><p>${esc(s.texto)}</p></li>`).join('')}
    </ul>
    <p class="nota">No prometemos seguridad absoluta ni certificaciones que no tenemos. Diseñamos cada proyecto según el riesgo real de la información que maneja.</p>
  </div>
</section>`;
}

/* ------------------------------------------------------------- fundador */

export function nosotros() {
  const e = SITIO.empresa;
  const f = SITIO.fundador;
  return `<section class="seccion" id="nosotros" aria-labelledby="nosotros-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Quiénes somos', titulo: 'Una empresa chilena que parte desde las operaciones', id: 'nosotros-tit' })}
    <div class="nosotros">
      <div class="ficha">
        <picture>
          <source type="image/webp" srcset="/andres-vargas-160.webp 160w, /andres-vargas-320.webp 320w, /andres-vargas-600.webp 600w" sizes="(max-width: 900px) 168px, 360px">
          <img class="ficha-foto" src="/andres-vargas-600.jpg" srcset="/andres-vargas-160.jpg 160w, /andres-vargas-320.jpg 320w, /andres-vargas-600.jpg 600w" sizes="(max-width: 900px) 168px, 360px" width="600" height="750" alt="${esc(f.nombre)}, fundador de ANVAR TECH" loading="lazy" decoding="async">
        </picture>
        <div class="ficha-nombre"><b>${esc(f.nombre)}</b><span>${esc(f.cargo)}</span></div>
        <dl class="ficha-datos">
          <div><dt>Empresa</dt><dd>${esc(e.nombre)} · RUT ${esc(e.rut)}</dd></div>
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
        <blockquote class="cita"><p>Si no podemos mostrarte la hora que te ahorramos, el trabajo no está terminado.</p><footer>— ${esc(f.nombre)}</footer></blockquote>
        <p class="nota">Cada proyecto lo lidera directamente el fundador. Por eso trabajamos con pocos proyectos en paralelo y te damos la fecha real de inicio antes de cotizar.</p>
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

/**
 * Portada de una página de servicio.
 * @param {{ sobretitulo: string, h1: string, lead: string, servicio?: string,
 *   ficha: [string,string][], contexto: string, secundario?: {href:string, texto:string} }} o
 */
export function heroServicio(o) {
  return `<section class="hero hero--servicio" aria-labelledby="hero-tit">
  <div class="contenedor">
    <nav class="migas" aria-label="Ruta"><a href="/">Inicio</a><span aria-hidden="true">/</span><span aria-current="page">${esc(o.sobretitulo)}</span></nav>
    <div class="hero-servicio">
      <p class="sobretitulo">${esc(o.sobretitulo)}</p>
      <h1 id="hero-tit">${esc(o.h1)}</h1>
      <p class="lead">${rico(o.lead)}</p>
      <div class="hero-cta">
        ${boton({ href: '#evaluar', texto: 'Evaluar mi proceso', grande: true, track: 'hero_cta_click', trackData: o.contexto })}
        ${o.secundario ? boton({ href: o.secundario.href, texto: o.secundario.texto, variante: 'secundario', grande: true }) : boton({ href: '/casos', texto: 'Ver casos reales', variante: 'secundario', grande: true, track: 'case_study_click', trackData: 'hero-' + o.contexto })}
      </div>
      <dl class="datos-servicio">${o.ficha.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    </div>
  </div>
</section>`;
}

/** Para quién sí y para quién no. */
export function paraQuien({ id, codigo, titulo, bajada, si, no, tituloSi = 'Es para ti si…', tituloNo = 'No es para ti si…' }) {
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
export function etapas({ id, codigo, titulo, bajada, lista, panel = true }) {
  return `<section class="seccion${panel ? ' seccion--panel' : ''}" aria-labelledby="${esc(id)}">
  <div class="contenedor">
    ${encabezado({ codigo, titulo, bajada, id })}
    <ol class="etapas">
      ${lista.map(([cuando, t, d]) => `<li class="etapa"><span class="etapa-cuando">${esc(cuando)}</span><div><h3>${esc(t)}</h3><p>${rico(d)}</p></div></li>`).join('')}
    </ol>
  </div>
</section>`;
}

/** Bloque de precio de un servicio, con lo que incluye. */
export function bloquePrecio({ id, titulo, ids, nota }) {
  return `<section class="seccion" aria-labelledby="${esc(titulo.id)}">
  <div class="contenedor">
    ${encabezado({ codigo: 'Valor', titulo: titulo.texto, id: titulo.id })}
    <div class="precios-servicio">
      ${ids.map((sid) => {
        const s = SERVICIOS[sid];
        return `<article class="precio-tarjeta" id="${esc(sid === 'implementacion' ? 'implementacion' : sid === 'soporte' ? 'soporte' : 'precio-' + sid)}">
          <div class="precio-tarjeta-cab"><h3>${esc(s.nombre)}</h3><p class="precio-plazo">${esc(s.plazo)}</p>${precio(sid, 'precio precio--grande')}</div>
          <p>${esc(s.resumen)}</p>
          <ul class="lista lista--check">${s.incluye.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </article>`;
      }).join('')}
    </div>
    ${nota ? `<p class="nota">${rico(nota)}</p>` : ''}
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
        return `<li><a href="${esc(s.url)}" data-track="service_click" data-track-label="otros-${esc(id)}"><span class="otros-t">${esc(s.nombre)}</span><span class="otros-d">${esc(s.resumen)}</span><span class="otros-p">${esc(precioTexto(s.precio).principal)}</span></a></li>`;
      }).join('')}
    </ul>
  </div>
</section>`;
}
