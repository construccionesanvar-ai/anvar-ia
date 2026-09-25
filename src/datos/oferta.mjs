// @ts-check
// Fuente única de servicios y precios. Cualquier precio del sitio sale de aquí:
// páginas, tarjetas, datos estructurados para Google, calculadora y diagnóstico.
//
// Automatización Express y ANVAR Intelligence (marcados `hipotesis: true`): precios
// aprobados por Andrés el 2026-09-24, todavía sin validar con clientes reales.
// Revisarlos después de las primeras ventas.

/** @typedef {import('../html.mjs').Precio} Precio */

/**
 * Un servicio. `precio` trae moneda (unidad), valor, si es "desde", el IVA y
 * el periodo; `cta` es la acción contextual por WhatsApp (clave de MENSAJES en
 * src/datos/whatsapp.mjs). `hipotesis` marca precios aún sin validar con clientes.
 * @typedef {{ id: string, nombre: string, publico: 'empresas'|'personas',
 *   precio: Precio, plazo: string, plazoCorto: string, resumen: string, url: string,
 *   incluye: string[], noIncluye?: string[], cta: { texto: string, wsp: string },
 *   hipotesis?: boolean }} Servicio
 */

/** @type {Record<string, Servicio>} */
export const SERVICIOS = {
  express: {
    id: 'express',
    nombre: 'Automatización Express',
    publico: 'empresas',
    precio: { moneda: 'CLP', valor: 199900, desde: true, iva: 'mas' },
    plazo: 'Típicamente 1 a 2 semanas, según alcance',
    plazoCorto: 'entre una y dos semanas',
    resumen: 'Un proceso pequeño y bien delimitado, resuelto y funcionando en tus herramientas.',
    url: '/automatizacion-express',
    incluye: [
      'Alcance y precio fijo definidos por escrito antes de partir',
      'La automatización funcionando en tus equipos o cuentas',
      'Instructivo de uso y medición del antes y el después',
      'Corrección de fallas de lo entregado durante 30 días',
    ],
    noIncluye: [
      'Procesos que cruzan varios sistemas o áreas: eso es un piloto',
      'Cambios de alcance después de aprobado: se cotizan aparte',
      'Mantención y mejoras pasados los 30 días: es el soporte mensual',
      'Licencias o suscripciones de programas de terceros, si el proceso las necesita',
    ],
    cta: { texto: 'Solicitar Automatización Express', wsp: 'express' },
    hipotesis: true,
  },
  diagnostico: {
    id: 'diagnostico',
    nombre: 'Diagnóstico de automatización',
    publico: 'empresas',
    precio: { moneda: 'UF', valor: 12, iva: 'mas' },
    plazo: '1 semana',
    plazoCorto: 'una semana',
    resumen: 'Medimos tus procesos en horas y pesos y te decimos qué automatizar primero y qué no tocar.',
    url: '/diagnostico-ia-empresas',
    incluye: [
      'Medición en terreno junto a quien hace el trabajo',
      'Procesos valorizados en horas y pesos',
      'Tres oportunidades ordenadas por retorno',
      'Informe escrito y reunión de presentación',
      'Se descuenta completo si avanzas al piloto',
    ],
    cta: { texto: 'Conversar por WhatsApp', wsp: 'diagnostico' },
  },
  piloto: {
    id: 'piloto',
    nombre: 'Piloto en producción',
    publico: 'empresas',
    precio: { moneda: 'UF', valor: 40, desde: true, iva: 'mas', nota: 'UF 28 si ya hiciste el diagnóstico' },
    plazo: '3 a 4 semanas',
    plazoCorto: 'entre tres y cuatro semanas',
    resumen: 'Un proceso funcionando de verdad, usado por tu equipo y medido antes y después.',
    url: '/automatizacion-procesos-ia',
    incluye: [
      'Incluye el diagnóstico del proceso',
      'Un proceso automatizado y en uso',
      'Capacitación a quienes lo operan',
      'Acta con la medición antes y después',
    ],
    cta: { texto: 'Conversar por WhatsApp', wsp: 'piloto' },
  },
  implementacion: {
    id: 'implementacion',
    nombre: 'Implementación',
    publico: 'empresas',
    precio: { moneda: 'UF', valor: 60, desde: true, iva: 'mas' },
    plazo: 'Según alcance',
    plazoCorto: 'según alcance',
    resumen: 'La solución completa, integrada con tus sistemas, documentada y traspasada a tu equipo.',
    url: '/automatizacion-procesos-ia#implementacion',
    incluye: [
      'Desarrollo e integración con lo que ya usas',
      'Manual de uso, manual técnico y respaldos',
      'Entrega de lo desarrollado según el contrato',
      'Se cotiza después de un diagnóstico o piloto',
    ],
    cta: { texto: 'Conversar por WhatsApp', wsp: 'piloto' },
  },
  soporte: {
    id: 'soporte',
    nombre: 'Soporte y evolución',
    publico: 'empresas',
    precio: { moneda: 'UF', valor: 8, iva: 'mas', periodo: 'mes' },
    plazo: 'Mensual, sin permanencia',
    plazoCorto: 'mensual',
    resumen: 'Monitoreo, ajustes y nuevas automatizaciones sobre lo que ya está funcionando.',
    url: '/automatizacion-procesos-ia#soporte',
    incluye: [
      'Monitoreo de lo entregado',
      'Horas de mejora definidas al contratar',
      'Soporte con plazo de respuesta por escrito',
      'Reporte mensual de una página',
    ],
    cta: { texto: 'Conversar por WhatsApp', wsp: 'piloto' },
  },
  intelligence: {
    id: 'intelligence',
    nombre: 'ANVAR Intelligence',
    publico: 'empresas',
    precio: { moneda: 'UF', valor: 6, desde: true, iva: 'mas', periodo: 'mes' },
    plazo: 'Mensual, sin permanencia',
    plazoCorto: 'mensual',
    resumen: 'Tus datos de ventas, stock y costos revisados cada mes: tablero, alertas y un informe con recomendaciones.',
    url: '/inteligencia-datos#anvar-intelligence',
    incluye: [
      'Tablero actualizado con tus datos',
      'Alertas de stock, márgenes y anomalías',
      'Informe ejecutivo mensual con recomendaciones',
      'Reunión mensual de seguimiento',
    ],
    cta: { texto: 'Conversar por WhatsApp', wsp: 'intelligence' },
    hipotesis: true,
  },
  capacitacion: {
    id: 'capacitacion',
    nombre: 'Capacitación para equipos',
    publico: 'empresas',
    precio: { moneda: 'UF', valor: 14, iva: 'mas' },
    plazo: '4 horas, hasta 15 personas',
    plazoCorto: 'cuatro horas',
    resumen: 'Taller práctico en tus oficinas: cada persona sale con una tarea suya resuelta.',
    url: '/capacitacion-ia-empresas',
    incluye: [
      'Casos de tu propio rubro',
      'Dos de las cuatro horas son práctica',
      'Política escrita de qué información se puede subir',
      'Informe de cierre para la jefatura',
    ],
    cta: { texto: 'Conversar por WhatsApp', wsp: 'capacitacion' },
  },

  // Línea secundaria: personas. Precios en pesos con IVA incluido.
  sesion: {
    id: 'sesion',
    nombre: 'Sesión Despegue',
    publico: 'personas',
    precio: { moneda: 'CLP', valor: 49000, iva: 'incluido' },
    plazo: '90 minutos',
    plazoCorto: '90 minutos',
    resumen: 'Una sesión uno a uno: sales con tres tareas tuyas resueltas y funcionando.',
    url: '/asesoria-ia-personal',
    incluye: [
      'Tu asistente configurado con tu contexto real',
      'Tres flujos listos para usar',
      'Grabación y hoja con tus prompts',
    ],
    cta: { texto: 'Coordinar sesión por WhatsApp', wsp: 'personal' },
  },
  planPersonal: {
    id: 'planPersonal',
    nombre: 'Plan Piloto Personal',
    publico: 'personas',
    precio: { moneda: 'CLP', valor: 229000, iva: 'incluido' },
    plazo: '4 semanas',
    plazoCorto: 'cuatro semanas',
    resumen: 'Cuatro semanas para que una tarea tuya quede automatizada y sepas resolver la siguiente.',
    url: '/asesoria-ia-personal',
    incluye: [
      'Cuatro sesiones y soporte por WhatsApp',
      'Una tarea tuya automatizada',
      'Biblioteca de prompts y plan de tres meses',
    ],
    cta: { texto: 'Coordinar por WhatsApp', wsp: 'personal' },
  },
  acompanamiento: {
    id: 'acompanamiento',
    nombre: 'Acompañamiento personal',
    publico: 'personas',
    precio: { moneda: 'CLP', valor: 89000, iva: 'incluido', periodo: 'mes' },
    plazo: 'Mensual, sin permanencia',
    plazoCorto: 'mensual',
    resumen: 'Dos sesiones al mes para seguir incorporando lo que te sirve.',
    url: '/asesoria-ia-personal',
    incluye: ['Dos sesiones al mes', 'Revisión de lo que armaste', 'Correo mensual con lo que vale la pena probar'],
    cta: { texto: 'Coordinar por WhatsApp', wsp: 'personal' },
  },
};

/** La escalera de empresas, en el orden en que se recorre. */
export const ESCALERA = [
  { id: 'express', paso: 'Empezar', que: 'Un proceso pequeño' },
  { id: 'diagnostico', paso: 'Evaluar', que: 'Varios procesos u oportunidades' },
  { id: 'piloto', paso: 'Validar', que: 'Una primera solución medida' },
  { id: 'implementacion', paso: 'Implementar', que: 'Despliegue completo' },
  { id: 'soporte', paso: 'Evolucionar', que: 'Mantención y mejoras' },
];
