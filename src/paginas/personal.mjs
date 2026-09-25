// @ts-check
// Línea secundaria de ANVAR TECH: asesoría para personas. Usa el mismo sistema
// que las páginas de empresa (cabecera, pie, componentes, CTA), pero se
// presenta como línea secundaria y deriva a empresas cuando corresponde.
// Precios en pesos, IVA incluido.
import { SITIO } from '../config.mjs';
import { SERVICIOS } from '../datos/oferta.mjs';
import { FAQ } from '../datos/faq.mjs';
import { FUENTES } from '../datos/whatsapp.mjs';
import { precioTexto, esc } from '../html.mjs';
import { evaluar, encabezado, boton } from '../componentes/base.mjs';
import { heroServicio, paraQuien, etapas, preguntas, precio, precioLinea, retrato } from '../componentes/secciones.mjs';
import { migas, servicio, faq } from './ld.mjs';

const ids = ['sesion', 'planPersonal', 'acompanamiento'];
const f = SITIO.fundador;

export default {
  ruta: '/asesoria-ia-personal',
  archivo: 'asesoria-ia-personal.html',
  prioridad: '0.5',
  titulo: 'Asesoría personal en IA para tu trabajo | ANVAR TECH',
  descripcion: `Sesiones uno a uno para usar IA en tu trabajo real, con tus propios archivos. En 90 minutos sales con tres tareas resueltas. Desde ${precioTexto(SERVICIOS.sesion.precio).principal}, IVA incluido.`,
  contextoWsp: 'personal',
  fuente: FUENTES.personal,
  jsonld: [
    migas([['Asesoría personal', '/asesoria-ia-personal']]),
    servicio({ nombre: 'Asesoría personal en IA', tipo: 'Asesoría uno a uno', ruta: '/asesoria-ia-personal', ofertas: ids, descripcion: 'Línea para personas de ANVAR TECH: sesiones uno a uno para usar inteligencia artificial en el trabajo real, con tareas propias del participante.' }),
    faq(FAQ.personal),
  ],
  cuerpo: () => `
${heroServicio({
  sobretitulo: 'Asesoría personal · línea para personas',
  aviso: 'Esta es la línea de ANVAR TECH para personas que quieren usar IA en su propio trabajo. Si buscas automatizar un proceso de tu empresa, <a href="/" data-track="service_click" data-track-label="personal-a-empresas">ve a soluciones para empresas</a>.',
  h1: 'Aprende a usar IA en tu trabajo, con alguien al lado',
  lead: 'Probaste ChatGPT, sirvió para un par de textos y después quedó en nada. En 90 minutos, uno a uno, *salimos con tres tareas tuyas resueltas y funcionando en tu computador*. No con apuntes.',
  contexto: 'personal',
  migas: [['Asesoría personal', '/asesoria-ia-personal']],
  primario: { wsp: 'personal', texto: 'Coordinar sesión por WhatsApp' },
  secundario: { href: '#valores-tit', texto: 'Ver valores' },
  ficha: [['Sesión', precioLinea('sesion')], ['Duración', '90 minutos'], ['Modalidad', 'En línea o presencial'], ['Garantía', 'Devolución en la primera hora']],
})}

${paraQuien({
  id: 'quien-tit', codigo: 'Para quién', titulo: 'Para quien tiene un trabajo, no para quien quiere estudiar IA',
  si: ['Rehaces el mismo informe, correo o resumen todas las semanas', 'Lees documentos largos para sacar tres datos', 'Eres independiente y la parte administrativa te toca a ti', 'Probaste IA por tu cuenta y no se quedó'],
  no: ['Buscas un curso teórico con certificado', 'Quieres aprender a programar con IA', 'Necesitas automatizar un proceso de una empresa: eso es *Automatización Express*', 'Esperas que la IA haga el trabajo sin que lo revises'],
})}

${etapas({
  id: 'sesion-tit', codigo: 'La sesión', titulo: 'Los 90 minutos',
  bajada: 'Antes te enviamos cinco preguntas para llegar preparados. Se trabaja con tus archivos y el teclado lo manejas tú.',
  lista: [
    ['00 – 10', 'Encuadre', 'Sin teoría: te decimos los tres flujos que vamos a dejar funcionando.'],
    ['10 – 25', 'Tu asistente', 'Configurado con tu contexto: a qué te dedicas, cómo escribes, qué formatos usas.'],
    ['25 – 50', 'Tu tarea más pesada', 'Completa, con tu archivo real. Queda guardada como plantilla.'],
    ['50 – 70', 'Un flujo que te ahorre más', 'Resumir un documento largo, preparar una reunión, ordenar una planilla, según tu caso.'],
    ['70 – 90', 'Errores y cierre', 'Dónde se equivoca la IA con tu material, cómo verificar y qué nunca subir.'],
  ],
})}

<section class="seccion" aria-labelledby="valores-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Valores', titulo: 'Tres formas de partir', id: 'valores-tit', bajada: 'Precios en pesos, IVA incluido. Lo que ves es lo que pagas.' })}
    <div class="planes">
      ${ids.map((id, i) => {
        const s = SERVICIOS[id];
        return `<article class="plan${i === 0 ? ' plan--destacado' : ''}">
          <p class="plan-nivel">${esc(i === 0 ? 'Recomendado para partir' : s.plazo)}</p>
          <h3>${esc(s.nombre)}</h3>
          <p class="plan-bajada">${esc(s.resumen)}</p>
          ${precio(id)}
          <ul class="lista lista--check">${s.incluye.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          ${boton({ wsp: s.cta.wsp, texto: s.cta.texto, icono: 'whatsapp', variante: i === 0 ? 'primario' : 'secundario', trackData: 'plan-' + id, sr: `: ${s.nombre}` })}
        </article>`;
      }).join('')}
    </div>
    <p class="nota">Si dentro de la primera hora te das cuenta de que no era para ti, te devolvemos el dinero.</p>
  </div>
</section>

<section class="seccion seccion--panel" aria-labelledby="quien-acompana-tit">
  <div class="contenedor">
    ${encabezado({ codigo: 'Quién te acompaña', titulo: `${f.nombre}, fundador de ANVAR TECH`, id: 'quien-acompana-tit' })}
    <div class="acompana">
      <div class="acompana-foto">${retrato({ sizes: '(max-width: 640px) 120px, 200px', clase: 'acompana-img' })}</div>
      <div class="acompana-txt">
        <p class="lead">Mi especialidad parte desde operaciones, no desde la tecnología.</p>
        <p>Vengo de operaciones de retail y prevención de pérdidas, y empecé construyendo herramientas para sacarme de encima el trabajo repetitivo: el sistema documental del <a href="/casos#documentos-legales" data-track="case_study_click" data-track-label="personal-c01">caso C-01</a> nació así. Por eso la sesión parte desde tu tarea real y no desde la herramienta.</p>
        <p class="nota">La asesoría personal es una línea secundaria. El foco de ANVAR TECH es automatizar procesos de empresas: si eso es lo que buscas, mira los <a href="/casos" data-track="case_study_click" data-track-label="personal-casos">casos reales</a>.</p>
      </div>
    </div>
  </div>
</section>

${preguntas(FAQ.personal, { titulo: 'Preguntas sobre la asesoría personal', codigo: 'Preguntas' })}
${evaluar({ contexto: 'personal', conFormulario: false, titulo: 'Coordina tu sesión', bajada: 'Cuéntanos qué tarea te está quitando tiempo. Te respondemos con horarios y, si vemos que te sirve más otra cosa, también te lo decimos.', accion: { texto: 'Coordinar sesión por WhatsApp', nota: 'En línea o presencial en Santiago. Te respondemos con los horarios disponibles.' } })}
`,
};
