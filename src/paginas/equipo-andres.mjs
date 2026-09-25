// @ts-check
// Perfil del autor de guías y casos. Solo datos reales que ya están en el
// sitio (config.mjs › fundador, casos y recursos): sin títulos, años,
// certificaciones ni clientes que no se puedan respaldar. No es un CV.
import { SITIO } from '../config.mjs';
import { CASOS, ETIQUETAS, urlCaso } from '../datos/casos.mjs';
import { RECURSOS, AUTOR } from '../datos/recursos.mjs';
import { FUENTES } from '../datos/whatsapp.mjs';
import { esc, absoluta } from '../html.mjs';
import { evaluar } from '../componentes/base.mjs';
import { migasVisibles, retrato } from '../componentes/secciones.mjs';
import { prosa } from '../componentes/articulo.mjs';
import { migas, autorLd } from './ld.mjs';

const f = SITIO.fundador;
const RUTA = f.perfil;
const AREAS = ['Automatización documental', 'Automatización de Excel y reportes', 'Cotizaciones y procesos comerciales', 'Datos e inventario', 'Integración con AutoCAD', 'IA aplicada a operaciones'];
const escritos = RECURSOS.filter((r) => r.tipo === 'guia' || r.tipo === 'caso');

export default {
  ruta: RUTA,
  archivo: RUTA.slice(1) + '.html',
  prioridad: '0.5',
  titulo: `${f.nombre}, fundador de ANVAR TECH | ANVAR TECH`,
  og: { titulo: f.nombre, bajada: 'Fundador de ANVAR TECH · automatización de procesos desde las operaciones', etiqueta: 'Equipo' },
  descripcion: `${f.nombre} lidera los proyectos de ANVAR TECH. Viene de operaciones de retail y prevención de pérdidas; aquí están los proyectos que publicó y las guías que escribió.`,
  contextoWsp: 'general',
  fuente: FUENTES.team,
  jsonld: [
    migas([[f.nombre, RUTA]]),
    { '@type': 'ProfilePage', '@id': absoluta(RUTA) + '#pagina', url: absoluta(RUTA), name: `${f.nombre} · ANVAR TECH`, inLanguage: SITIO.idioma, mainEntity: { ...autorLd(), image: absoluta('/andres-vargas-600.jpg'), description: AUTOR.bio, knowsAbout: AREAS } },
  ],
  cuerpo: () => `
<section class="hero hero--servicio" aria-labelledby="hero-tit">
  <div class="contenedor">
    ${migasVisibles([[f.nombre, RUTA]])}
    <div class="perfil">
      <div class="perfil-foto">${retrato({ sizes: '(max-width: 640px) 160px, 240px', clase: 'perfil-img', lazy: false })}</div>
      <div>
        <p class="sobretitulo">Equipo · ${esc(SITIO.marca)}</p>
        <h1 id="hero-tit">${esc(f.nombre)}</h1>
        <p class="lead">${esc(f.cargo)}. ${esc(AUTOR.bio)}</p>
        <dl class="ficha-datos">
          <div><dt>Rol</dt> <dd>Lidera cada proyecto, de la medición a la entrega</dd></div>
          <div><dt>Experiencia</dt> <dd>${esc(f.experiencia)}</dd></div>
          <div><dt>Formación</dt> <dd>${esc(f.formacion)}</dd></div>
          <div><dt>Base</dt> <dd>Región Metropolitana, Chile</dd></div>
        </dl>
        ${f.perfiles.length ? `<p class="perfil-enlaces">${f.perfiles.map((x) => `<a href="${esc(x.url)}" rel="noopener me" target="_blank">${esc(x.nombre)}</a>`).join(' · ')}</p>` : ''}
      </div>
    </div>
  </div>
</section>

<section class="seccion" aria-label="Enfoque y áreas de trabajo">
  <div class="contenedor contenedor--prosa">
    ${prosa([
      { id: 'enfoque', titulo: 'Enfoque', html: `
    <p>Parte desde las operaciones, no desde la tecnología: primero entender el proceso y dónde se pierde el tiempo; después decidir si corresponde automatización, software, análisis de datos o IA. A veces la respuesta correcta es una planilla bien hecha.</p>
    <p>Cada proyecto se mide antes y después, con el indicador que corresponde a ese proceso: tiempo, errores, trazabilidad o rapidez de respuesta. Si no podemos mostrarte qué mejoró y medirlo, el trabajo no está terminado.</p>` },
      { id: 'areas', titulo: 'Áreas de trabajo', html: `<ul class="chips">${AREAS.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` },
    ], { indice: false })}
  </div>
</section>

<section class="seccion seccion--panel" aria-label="Proyectos y escritos">
  <div class="contenedor contenedor--prosa">
    ${prosa([
      { id: 'proyectos', titulo: 'Proyectos publicados', html: `
    <p>Cada uno con su etiqueta: proyecto propio, cliente confidencial o prototipo. Ninguno se presenta como algo que no es.</p>
    <ul class="perfil-lista">
      ${CASOS.map((c) => `<li><a href="${esc(c.paginaCaso ?? urlCaso(c))}"><b>${esc(c.codigo)}</b> ${esc(c.titulo)}</a> <span class="perfil-meta">${esc(ETIQUETAS[c.etiqueta])} · ${esc(c.estado)}</span></li>`).join('')}
    </ul>` },
      { id: 'escritos', titulo: 'Guías y casos escritos', html: `
    <ul class="perfil-lista">
      ${escritos.map((r) => `<li><a href="${esc(r.ruta)}">${esc(r.tituloCorto)}</a> <span class="perfil-meta"><time datetime="${esc(r.publicado)}">${esc(r.publicado.split('-').reverse().join('/'))}</time></span></li>`).join('')}
    </ul>` },
    ], { indice: false })}
  </div>
</section>
${evaluar({ contexto: 'general', tipo: 'express', modo: 'compacto', titulo: '¿Tienes un proceso en mente?' })}
`,
};
