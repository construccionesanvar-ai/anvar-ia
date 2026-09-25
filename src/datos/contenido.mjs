// @ts-check
// Contenido reutilizable: navegación, problemas, método, seguridad, mensajes
// de WhatsApp y el cuestionario del diagnóstico.

export const NAVEGACION = [
  { texto: 'Soluciones', href: '/#soluciones' },
  { texto: 'Casos', href: '/casos' },
  { texto: 'Datos', href: '/inteligencia-datos' },
  { texto: 'Precios', href: '/#contratar' },
  { texto: 'Nosotros', href: '/#nosotros' },
];

/** Problemas que resolvemos, organizados por problema y no por tecnología. */
export const PROBLEMAS = [
  {
    id: 'documental',
    titulo: 'Automatización documental',
    cuando: 'Tu equipo llena Word, Excel, PDF o formularios con los mismos datos una y otra vez.',
    ejemplos: ['Informes', 'Actas', 'Certificados', 'Formularios oficiales', 'PDF a Excel'],
    empieza: 'express',
    caso: 'documentos-legales',
    url: '/automatizacion-express',
  },
  {
    id: 'comercial',
    titulo: 'Cotizaciones y procesos comerciales',
    cuando: 'Cotizar, responder consultas o registrar ventas consume horas de alguien que debería estar vendiendo.',
    ejemplos: ['Cotizaciones', 'Respuestas frecuentes', 'Registro de ventas', 'Seguimiento'],
    empieza: 'express',
    caso: 'venta-en-linea',
    url: '/automatizacion-express',
  },
  {
    id: 'datos',
    titulo: 'Inteligencia de datos',
    cuando: 'Tienes ventas, stock o costos en Excel o en el ERP, pero no logras convertirlos en decisiones.',
    ejemplos: ['Stock crítico', 'Rotación', 'Márgenes', 'Reportes automáticos'],
    empieza: 'intelligence',
    caso: 'pronostico-stock',
    url: '/inteligencia-datos',
  },
  {
    id: 'operacional',
    titulo: 'Automatización operacional',
    cuando: 'Hay trabajo manual entre herramientas: del correo al Excel, del Excel al sistema, del sistema al WhatsApp.',
    ejemplos: ['Correo', 'Excel', 'Drive', 'WhatsApp', 'ERP'],
    empieza: 'diagnostico',
    caso: null,
    url: '/automatizacion-procesos-ia',
  },
  {
    id: 'copiloto',
    titulo: 'Asistentes internos',
    cuando: 'La información importante está repartida en manuales, procedimientos y correos, y encontrarla depende de preguntarle a una persona.',
    ejemplos: ['Procedimientos', 'Manuales técnicos', 'Contratos', 'Preguntas del equipo'],
    empieza: 'diagnostico',
    caso: null,
    url: '/diagnostico-ia-empresas',
  },
  {
    id: 'medida',
    titulo: 'Desarrollo a medida',
    cuando: 'El problema no cabe en una solución estándar: una aplicación propia, una integración con AutoCAD o un sistema que tu operación necesita.',
    ejemplos: ['Aplicaciones de escritorio', 'AutoCAD', 'Integraciones', 'Paneles'],
    empieza: 'diagnostico',
    caso: 'planos-autocad',
    url: '/automatizacion-procesos-ia',
  },
];

/** Cómo trabajamos: la secuencia es real, por eso va numerada. */
export const PROCESO = [
  {
    titulo: 'Detectamos',
    cuando: 'Semana 0 a 1',
    texto: 'Una conversación de 20 minutos y, si hace falta, un diagnóstico en terreno. Medimos el proceso en horas y pesos antes de proponer nada.',
    entrega: 'Qué conviene automatizar y qué no',
  },
  {
    titulo: 'Construimos',
    cuando: 'Semanas 1 a 4',
    texto: 'Una solución acotada, sobre las herramientas que ya usas y con las personas que la van a usar. Te mostramos avances temprano, aunque estén a medias.',
    entrega: 'Una solución funcionando en tu operación',
  },
  {
    titulo: 'Medimos',
    cuando: 'Al cierre',
    texto: 'Comparamos el antes y el después con el mismo método que acordamos al inicio. Si no mejoró lo prometido, queda escrito igual.',
    entrega: 'Acta con el resultado medido',
  },
  {
    titulo: 'Escalamos',
    cuando: 'Solo si generó valor',
    texto: 'Otros procesos, la implementación completa o soporte mensual. Si el resultado no justifica seguir, no seguimos.',
    entrega: 'La siguiente decisión, con datos',
  },
];

/** Seguridad, confidencialidad y propiedad. Sin promesas absolutas. */
export const SEGURIDAD = [
  { titulo: 'Confidencialidad antes de ver datos', texto: 'Firmamos un acuerdo de confidencialidad antes de acceder a información de tu empresa.' },
  { titulo: 'Revisión humana', texto: 'Cuando un resultado tiene efecto legal, comercial o financiero, una persona lo revisa antes de que salga. La IA propone; alguien aprueba.' },
  { titulo: 'En tu infraestructura', texto: 'Cuando corresponde, la solución corre en tus equipos y en cuentas de tu empresa, no en cuentas nuestras.' },
  { titulo: 'Propiedad del código', texto: 'Lo desarrollado a medida para tu empresa queda en tu poder una vez pagado, según el contrato de cada proyecto.' },
  { titulo: 'Documentación y respaldos', texto: 'Manual de uso, manual técnico y procedimiento de respaldo. Un respaldo se da por bueno cuando se prueba restaurándolo.' },
  { titulo: 'Procesamiento local', texto: 'Si la información no debe salir de tu red, se procesa en tus equipos. El lector de boletas del caso C-01 funciona sin internet.' },
  { titulo: 'Control de acceso', texto: 'Acceso con clave y registro de actividad cuando el proceso lo requiere, como en el caso C-01.' },
  { titulo: 'Qué sale de tu red, por escrito', texto: 'Antes de construir te decimos qué datos se envían a servicios externos —por ejemplo, a un modelo de IA— y cuáles no.' },
];

/**
 * Mensajes de WhatsApp por contexto. Breves, naturales y sin datos
 * personales: el visitante completa el resto.
 */
export const MENSAJES = {
  general: 'Hola, quiero evaluar si un proceso de mi empresa se puede automatizar.',
  agenda: 'Hola, quiero agendar una evaluación de 20 minutos para un proceso de mi empresa. ¿Qué horarios tienen?',
  express: 'Hola, quiero evaluar si uno de mis procesos puede resolverse con Automatización Express.',
  datos: 'Hola, quiero evaluar una solución de datos para mi empresa.',
  intelligence: 'Hola, quiero saber más de ANVAR Intelligence para mi empresa.',
  diagnostico: 'Hola, quiero cotizar un diagnóstico de automatización para mi empresa.',
  piloto: 'Hola, tengo un proceso manual en mi empresa y quiero evaluar un piloto de automatización.',
  capacitacion: 'Hola, quiero cotizar una capacitación en IA para mi equipo.',
  personal: 'Hola, quiero agendar una sesión de asesoría personal en IA.',
  caso: 'Hola, vi sus casos y quiero evaluar si algo parecido sirve para mi empresa.',
};

/**
 * Cuestionario del diagnóstico. La primera pregunta no suma puntos: define el
 * tipo de solución y el mensaje de WhatsApp. Las demás miden tres ejes.
 */
export const DIAGNOSTICO = {
  categorias: [
    { id: 'documental', opcion: 'Documentos, informes y formularios', solucion: 'Automatización documental', frase: 'documentos y formularios' },
    { id: 'comercial', opcion: 'Cotizaciones, ventas y atención', solucion: 'Automatización comercial', frase: 'cotizaciones y ventas' },
    { id: 'datos', opcion: 'Ventas, stock, costos y reportes', solucion: 'Inteligencia de datos', frase: 'datos y reportes' },
    { id: 'operacional', opcion: 'Trabajo manual entre planillas y sistemas', solucion: 'Automatización operacional', frase: 'trabajo manual entre sistemas' },
  ],
  preguntas: [
    { t: '¿Cuánto de la semana se va en tareas que se repiten casi igual?', eje: 'potencial',
      o: ['Casi nada, cada día es distinto', 'Entre 1 y 3 horas por persona', 'Entre 4 y 8 horas por persona', 'Más de 8 horas por persona'] },
    { t: 'Si mañana faltara la persona que hace ese trabajo, ¿qué pasa?', eje: 'potencial', invertir: true,
      o: ['Está documentado y alguien sigue sin problema', 'Alguien lo toma, con esfuerzo', 'Se atrasa todo varios días', 'Se cae: nadie más sabe hacerlo'] },
    { t: '¿Dónde vive hoy la información con la que trabajan?', eje: 'base',
      o: ['En papel o en la cabeza de alguien', 'Archivos sueltos en distintos computadores', 'Carpetas ordenadas o Drive compartido', 'Un sistema, ERP o base de datos'] },
    { t: '¿Saben cuánto cuesta hoy ese proceso?', eje: 'base',
      o: ['No, nunca lo hemos medido', 'Tenemos una estimación gruesa', 'Sabemos cuántas horas toma', 'Sabemos las horas y los pesos'] },
    { t: '¿Ya usan IA o automatizaciones en el trabajo?', eje: 'traccion',
      o: ['No, nunca', 'Preguntas sueltas, de vez en cuando', 'Casi todos los días, de forma individual', 'Ya tenemos algo automatizado funcionando'] },
    { t: '¿Quién decide invertir en mejorar esto?', eje: 'traccion',
      o: ['Nadie lo ha planteado todavía', 'Hay que convencer a alguien arriba', 'Yo puedo decidir con un buen caso', 'Ya hay presupuesto asignado'] },
  ],
};
