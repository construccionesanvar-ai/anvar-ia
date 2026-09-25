// @ts-check
// Línea secundaria: asesoría para personas. Precios en pesos, IVA incluido.
import { SERVICIOS } from '../datos/oferta.mjs';
import { FAQ } from '../datos/faq.mjs';
import { precioTexto, esc } from '../html.mjs';
import { evaluar, encabezado, boton } from '../componentes/base.mjs';
import { heroServicio, paraQuien, etapas, preguntas, precio } from '../componentes/secciones.mjs';
import { migas, servicio, faq } from './ld.mjs';

const ids = ['sesion', 'planPersonal', 'acompanamiento'];

export default {
  ruta: '/asesoria-ia-personal',
  archivo: 'asesoria-ia-personal.html',
  prioridad: '0.6',
  titulo: 'Asesoría personal en IA: aprende a usarla en tu trabajo | ANVAR TECH',
  descripcion: `Sesiones uno a uno para usar IA en tu trabajo real. En 90 minutos sales con tres tareas tuyas resueltas y funcionando. Desde ${precioTexto(SERVICIOS.sesion.precio).principal}, IVA incluido.`,
  contextoWsp: 'personal',
  jsonld: [
    migas([['Asesoría personal', '/asesoria-ia-personal']]),
    servicio({ nombre: 'Asesoría personal en IA', tipo: 'Asesoría uno a uno', ruta: '/asesoria-ia-personal', ofertas: ids, descripcion: 'Sesiones uno a uno para usar inteligencia artificial en el trabajo real, con tareas propias del participante.' }),
    faq(FAQ.personal),
  ],
  cuerpo: () => `
${heroServicio({
  sobretitulo: 'Asesoría personal',
  h1: 'Aprende a usar IA en tu trabajo, con alguien al lado',
  lead: 'Probaste ChatGPT, sirvió para un par de textos y después quedó en nada. En 90 minutos, uno a uno, *salimos con tres tareas tuyas resueltas y funcionando en tu computador*. No con apuntes.',
  contexto: 'personal',
  secundario: { href: '/', texto: '¿Vienes por tu empresa?' },
  ficha: [['Sesión', `${precioTexto(SERVICIOS.sesion.precio).principal} IVA incluido`], ['Duración', '90 minutos'], ['Modalidad', 'En línea o presencial'], ['Garantía', 'Devolución en la primera hora']],
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
          ${boton({ href: '#evaluar', texto: i === 0 ? 'Reservar una sesión' : 'Consultar', variante: i === 0 ? 'primario' : 'secundario' })}
        </article>`;
      }).join('')}
    </div>
    <p class="nota">Si dentro de la primera hora te das cuenta de que no era para ti, te devolvemos el dinero.</p>
  </div>
</section>

${preguntas(FAQ.personal, { titulo: 'Preguntas sobre la asesoría personal', codigo: 'Preguntas' })}
${evaluar({ contexto: 'personal', conFormulario: false, titulo: 'Reserva tu sesión', bajada: 'Cuéntanos qué tarea te está quitando tiempo. Te respondemos con horarios y, si vemos que te sirve más otra cosa, también te lo decimos.', accion: { texto: 'Reservar por WhatsApp', nota: 'En línea o presencial en Santiago.' } })}
`,
};
