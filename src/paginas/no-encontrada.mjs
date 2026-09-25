// @ts-check
import { boton, evaluar } from '../componentes/base.mjs';

export default {
  ruta: '/404',
  archivo: '404.html',
  noindex: true,
  enSitemap: false,
  titulo: 'Página no encontrada | ANVAR TECH',
  descripcion: 'La página que buscas no existe o cambió de dirección.',
  contextoWsp: 'general',
  jsonld: [],
  cuerpo: () => `
<section class="hero hero--servicio" aria-labelledby="hero-tit">
  <div class="contenedor">
    <div class="hero-servicio">
      <p class="sobretitulo">Error 404</p>
      <h1 id="hero-tit">Esta página no existe o cambió de dirección</h1>
      <p class="lead">Puede que el enlace esté incompleto. Estas son las páginas más visitadas:</p>
      <div class="hero-cta">
        ${boton({ href: '/', texto: 'Ir al inicio' })}
        ${boton({ href: '/casos', texto: 'Ver casos reales', variante: 'secundario' })}
        ${boton({ href: '/automatizacion-express', texto: 'Automatización Express', variante: 'secundario' })}
      </div>
    </div>
  </div>
</section>
${evaluar({ contexto: 'general', conFormulario: false })}
`,
};
