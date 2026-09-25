// @ts-check
import { SERVICIOS } from '../datos/oferta.mjs';
import { FAQ } from '../datos/faq.mjs';
import { evaluar } from '../componentes/base.mjs';
import { heroServicio, paraQuien, etapas, bloquePrecio, casosRelacionados, preguntas, otrosServicios, precioLinea } from '../componentes/secciones.mjs';
import { FUENTES } from '../datos/whatsapp.mjs';
import { PROPIEDAD } from '../datos/contenido.mjs';
import { migas, servicio, faq } from './ld.mjs';

const p = SERVICIOS.piloto;

export default {
  ruta: '/automatizacion-procesos-ia',
  archivo: 'automatizacion-procesos-ia.html',
  prioridad: '0.8',
  titulo: 'Piloto e implementación de automatización con IA | ANVAR TECH',
  descripcion: 'Automatizamos procesos en etapas: un piloto medido antes y después, la implementación completa y soporte, con manual de uso y manual técnico para tu equipo.',
  contextoWsp: 'piloto',
  fuente: FUENTES.pilot,
  jsonld: [
    migas([['Piloto e implementación', p.url]]),
    servicio({ nombre: 'Automatización de procesos con IA', tipo: 'Automatización de procesos', ruta: p.url, ofertas: ['piloto', 'implementacion', 'soporte'], descripcion: 'Piloto en producción de tres a cuatro semanas medido antes y después, implementación completa integrada con los sistemas del cliente y soporte mensual.' }),
    faq(FAQ.automatizacion),
  ],
  cuerpo: () => `
${heroServicio({
  sobretitulo: 'Piloto e implementación',
  h1: 'Automatización de procesos en etapas, medida antes y después',
  lead: 'Partimos por un piloto de un proceso, lo usa tu equipo y lo medimos con el mismo método del inicio. *Solo si generó valor* implementamos el resto, documentado para que tu equipo pueda operarlo.',
  contexto: 'piloto',
  ficha: [['Piloto', precioLinea('piloto')], ['Duración', p.plazo], ['Implementación', precioLinea('implementacion')], ['Documentación', 'Manual de uso y técnico']],
})}

${paraQuien({
  id: 'que-tit', codigo: 'Qué se automatiza', titulo: 'Procesos que se repiten con la misma forma',
  bajada: 'Si cambian los datos pero no la estructura, se puede automatizar. Si cambia todo cada vez, no, y te lo decimos antes de cobrar.',
  tituloSi: 'Buenos candidatos', tituloNo: 'Malos candidatos',
  si: ['Documentos y formularios que se llenan con los mismos datos', 'Datos que se digitan desde boletas, facturas o guías', 'Informes que se arman copiando y pegando', 'Cotizaciones, registro de ventas y respuestas frecuentes', 'Planos y documentos técnicos con variantes'],
  no: ['Procesos que nadie ha escrito y cada persona hace distinto', 'Datos en papel o repartidos sin orden', 'Tareas que ocurren dos veces al año', 'Decisiones con responsabilidad legal sin revisión humana'],
})}

${etapas({
  id: 'piloto-tit', codigo: 'El piloto', titulo: 'Tres a cuatro semanas, y en cada una puedes parar',
  bajada: 'El piloto existe para que decidas con datos. Nunca te pedimos firmar un proyecto largo antes de ver un resultado.',
  lista: [
    ['Semana 1', 'Diseño y acuerdo de medición', 'Cómo va a funcionar, quiénes lo usan y qué indicador se mide, con su valor actual y el método. Se firma antes de construir.'],
    ['Semanas 2 y 3', 'Construcción y pruebas reales', 'A mitad de camino hay una demostración, aunque esté a medias. Después lo prueban tus personas con casos reales, sin que nosotros toquemos el teclado.'],
    ['Semana 4', 'Capacitación, medición y cierre', 'Capacitamos a quienes lo operan, medimos el después con el mismo método del antes y firmamos un acta con el resultado.'],
    ['Después', 'Decides con datos', 'Extender a otro proceso, implementar completo, soporte mensual o nada por ahora. Todas son respuestas válidas.'],
  ],
})}

${etapas({
  id: 'impl-tit', codigo: 'Implementación y soporte', titulo: 'Cuando el piloto funcionó', panel: false,
  lista: [
    ['Implementación', 'La solución completa', 'Integración con tus sistemas, manual de uso, manual técnico y respaldo probado restaurándolo. Se cotiza *después* de un diagnóstico o un piloto, nunca a ciegas.'],
    ['Soporte', 'Que siga funcionando', 'Monitoreo, horas de mejora definidas al contratar, plazo de respuesta por escrito y un reporte mensual. Sin permanencia mínima.'],
  ],
})}

${bloquePrecio({ titulo: { id: 'valor-tit', texto: 'Cuánto cuesta' }, ids: ['piloto', 'implementacion', 'soporte'], nota: `Valores netos más IVA, cotizados en UF. El piloto incluye el diagnóstico: si ya lo hiciste, son *UF ${p.precio.valor - SERVICIOS.diagnostico.precio.valor} adicionales*. Las implementaciones se pagan por etapas contra entregables. ${PROPIEDAD.corta}` })}
${casosRelacionados(['documentos-legales', 'venta-en-linea', 'planos-autocad'])}
${preguntas(FAQ.automatizacion, { titulo: 'Preguntas sobre piloto e implementación' })}
${otrosServicios('piloto')}
${evaluar({ contexto: 'piloto', tipo: 'diagnostico', titulo: 'Cuéntanos el proceso y te decimos si vale la pena', bajada: 'Veinte minutos, sin costo. Si tu caso no da los números, te lo decimos en la misma conversación.' })}
`,
};
