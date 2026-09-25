// @ts-check
// Fuente única de servicios y precios. Cualquier precio del sitio sale de aquí:
// páginas, tarjetas, datos estructurados para Google, calculadora y diagnóstico.
//
// Automatización Express y ANVAR Intelligence (marcados `hipotesis: true`): precios
// aprobados por Andrés el 2026-09-24, todavía sin validar con clientes reales.
// Revisarlos después de las primeras ventas.

/** @typedef {import('../html.mjs').Precio} Precio */

/**
 * @typedef {{ id: string, nombre: string, publico: 'empresas'|'personas',
 *   precio: Precio, plazo: string, resumen: string, url: string,
 *   incluye: string[], hipotesis?: boolean }} Servicio
 */

/** @type {Record<string, Servicio>} */
export const SERVICIOS = {
  express: {
    id: 'express',
    nombre: 'Automatización Express',
    publico: 'empresas',
    precio: { moneda: 'CLP', valor: 199900, desde: true, iva: 'mas' },
    plazo: 'Típicamente 1 a 2 semanas, según alcance',
    resumen: 'Un proceso pequeño y bien delimitado, resuelto y funcionando en tus herramientas.',
    url: '/automatizacion-express',
    incluye: [
      'Alcance y precio fijo definidos por escrito antes de partir',
      'La automatización funcionando en tus equipos o cuentas',
      'Instructivo de uso y medición del antes y el después',
      'Corrección de fallas de lo entregado durante 30 días',
    ],
    hipotesis: true,
  },
  diagnostico: {
    id: 'diagnostico',
    nombre: 'Diagnóstico de automatización',
    publico: 'empresas',
    precio: { moneda: 'UF', valor: 12, iva: 'mas' },
    plazo: '1 semana',
    resumen: 'Medimos tus procesos en horas y pesos y te decimos qué automatizar primero y qué no tocar.',
    url: '/diagnostico-ia-empresas',
    incluye: [
      'Medición en terreno junto a quien hace el trabajo',
      'Procesos valorizados en horas y pesos',
      'Tres oportunidades ordenadas por retorno',
      'Informe escrito y reunión de presentación',
      'Se descuenta completo si avanzas al piloto',
    ],
  },
  piloto: {
    id: 'piloto',
    nombre: 'Piloto en producción',
    publico: 'empresas',
    precio: { moneda: 'UF', valor: 40, desde: true, iva: 'mas', nota: 'UF 28 si ya hiciste el diagnóstico' },
    plazo: '3 a 4 semanas',
    resumen: 'Un proceso funcionando de verdad, usado por tu equipo y medido antes y después.',
    url: '/automatizacion-procesos-ia',
    incluye: [
      'Incluye el diagnóstico del proceso',
      'Un proceso automatizado y en uso',
      'Capacitación a quienes lo operan',
      'Acta con la medición antes y después',
    ],
  },
  implementacion: {
    id: 'implementacion',
    nombre: 'Implementación',
    publico: 'empresas',
    precio: { moneda: 'UF', valor: 60, desde: true, iva: 'mas' },
    plazo: 'Según alcance',
    resumen: 'La solución completa, integrada con tus sistemas, documentada y traspasada a tu equipo.',
    url: '/automatizacion-procesos-ia#implementacion',
    incluye: [
      'Desarrollo e integración con lo que ya usas',
      'Manual de uso, manual técnico y respaldos',
      'Código y cuentas a nombre de tu empresa',
      'Se cotiza después de un diagnóstico o piloto',
    ],
  },
  soporte: {
    id: 'soporte',
    nombre: 'Soporte y evolución',
    publico: 'empresas',
    precio: { moneda: 'UF', valor: 8, iva: 'mas', periodo: 'mes' },
    plazo: 'Mensual, sin permanencia',
    resumen: 'Monitoreo, ajustes y nuevas automatizaciones sobre lo que ya está funcionando.',
    url: '/automatizacion-procesos-ia#soporte',
    incluye: [
      'Monitoreo de lo entregado',
      'Horas de mejora definidas al contratar',
      'Soporte con plazo de respuesta por escrito',
      'Reporte mensual de una página',
    ],
  },
  intelligence: {
    id: 'intelligence',
    nombre: 'ANVAR Intelligence',
    publico: 'empresas',
    precio: { moneda: 'UF', valor: 6, desde: true, iva: 'mas', periodo: 'mes' },
    plazo: 'Mensual',
    resumen: 'Tus datos de ventas, stock y costos convertidos cada mes en un tablero, alertas y un informe ejecutivo.',
    url: '/inteligencia-datos#anvar-intelligence',
    incluye: [
      'Tablero actualizado con tus datos',
      'Alertas de stock, márgenes y anomalías',
      'Informe ejecutivo mensual con recomendaciones',
      'Reunión mensual de seguimiento',
    ],
    hipotesis: true,
  },
  capacitacion: {
    id: 'capacitacion',
    nombre: 'Capacitación para equipos',
    publico: 'empresas',
    precio: { moneda: 'UF', valor: 14, iva: 'mas' },
    plazo: '4 horas, hasta 15 personas',
    resumen: 'Taller práctico en tus oficinas: cada persona sale con una tarea suya resuelta.',
    url: '/capacitacion-ia-empresas',
    incluye: [
      'Casos de tu propio rubro',
      'Dos de las cuatro horas son práctica',
      'Política escrita de qué información se puede subir',
      'Informe de cierre para la jefatura',
    ],
  },

  // Línea secundaria: personas. Precios en pesos con IVA incluido.
  sesion: {
    id: 'sesion',
    nombre: 'Sesión Despegue',
    publico: 'personas',
    precio: { moneda: 'CLP', valor: 49000, iva: 'incluido' },
    plazo: '90 minutos',
    resumen: 'Una sesión uno a uno: sales con tres tareas tuyas resueltas y funcionando.',
    url: '/asesoria-ia-personal',
    incluye: [
      'Tu asistente configurado con tu contexto real',
      'Tres flujos listos para usar',
      'Grabación y hoja con tus prompts',
    ],
  },
  planPersonal: {
    id: 'planPersonal',
    nombre: 'Plan Piloto Personal',
    publico: 'personas',
    precio: { moneda: 'CLP', valor: 229000, iva: 'incluido' },
    plazo: '4 semanas',
    resumen: 'Cuatro semanas para que una tarea tuya quede automatizada y sepas resolver la siguiente.',
    url: '/asesoria-ia-personal',
    incluye: [
      'Cuatro sesiones y soporte por WhatsApp',
      'Una tarea tuya automatizada',
      'Biblioteca de prompts y plan de tres meses',
    ],
  },
  acompanamiento: {
    id: 'acompanamiento',
    nombre: 'Acompañamiento personal',
    publico: 'personas',
    precio: { moneda: 'CLP', valor: 89000, iva: 'incluido', periodo: 'mes' },
    plazo: 'Mensual, sin permanencia',
    resumen: 'Dos sesiones al mes para seguir incorporando lo que te sirve.',
    url: '/asesoria-ia-personal',
    incluye: ['Dos sesiones al mes', 'Revisión de lo que armaste', 'Correo mensual con lo que vale la pena probar'],
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
