// @ts-check
import { CASOS, ETIQUETAS } from '../datos/casos.mjs';
import { esc } from '../html.mjs';
import { evaluar } from '../componentes/base.mjs';
import { detalleCaso, testimonios, migasVisibles } from '../componentes/secciones.mjs';
import { FUENTES } from '../datos/whatsapp.mjs';
import { migas } from './ld.mjs';

const usadas = [...new Set(CASOS.map((c) => c.etiqueta))];

export default {
  ruta: '/casos',
  archivo: 'casos.html',
  prioridad: '0.9',
  titulo: 'Casos reales de automatización e IA | ANVAR TECH',
  og: { titulo: 'Casos reales de automatización e IA', bajada: 'Cada caso con su etiqueta: proyecto propio, cliente o demostración', etiqueta: 'Casos' },
  descripcion: 'Casos de automatización documental, venta en línea, planos en AutoCAD y datos, con antes, después y cómo se midió. Cada caso indica si es propio, cliente o demo.',
  contextoWsp: 'caso',
  fuente: FUENTES.caseStudy,
  jsonld: [migas([['Casos reales', '/casos']])],
  cuerpo: () => `
<section class="hero hero--servicio" aria-labelledby="hero-tit">
  <div class="contenedor">
    ${migasVisibles([['Casos reales', '/casos']])}
    <div class="hero-servicio">
      <p class="sobretitulo">Casos reales</p>
      <h1 id="hero-tit">Lo que ya construimos, con el antes, el después y cómo se midió</h1>
      <p class="lead">Mostramos solo resultados que podemos respaldar. Cada caso indica qué tipo de proyecto es y hasta dónde llega cada cifra: hoy la mayoría son proyectos propios, y cuando un cliente autorice publicar su caso aparecerá como tal.</p>
      <ul class="leyenda" aria-label="Tipos de proyecto">
        ${usadas.map((e) => `<li><span class="etiqueta etiqueta--${esc(e)}">${esc(ETIQUETAS[e])}</span></li>`).join('')}
      </ul>
      <nav class="indice" aria-label="Casos en esta página">
        <ul>${CASOS.map((c) => `<li><a href="#${esc(c.id)}"><span>${esc(c.codigo)}</span>${esc(c.titulo)}</a></li>`).join('')}</ul>
      </nav>
    </div>
  </div>
</section>
<section class="seccion" aria-label="Casos">
  <div class="contenedor contenedor--medio">
    ${CASOS.map(detalleCaso).join('\n')}
  </div>
</section>
${testimonios()}
${evaluar({ contexto: 'caso', titulo: '¿Un proceso parecido en tu empresa?', bajada: 'Cuéntanos cuál es y te decimos en 20 minutos si se puede automatizar, cómo y cuánto costaría. Sin costo.' })}
`,
};
