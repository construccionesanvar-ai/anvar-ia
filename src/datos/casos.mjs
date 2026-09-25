// @ts-check
// Casos reales. Regla: cada caso lleva la etiqueta que le corresponde y
// ninguna métrica que no tenga respaldo.
//
// Etiquetas posibles (ETIQUETAS): proyecto propio, implementación interna,
// piloto, implementación para tercero, cliente, cliente confidencial,
// demostración tecnológica.
//
// Para agregar material visual a un caso, completa `media`:
//   { tipo: 'imagen', src: '/casos/c01.webp', alt: '…', ancho: 1200, alto: 750 }
//   { tipo: 'video',  src: '/casos/c01.mp4',  poster: '/casos/c01.webp', alt: '…' }
// El componente solo lo muestra si existe; nunca se ve un espacio vacío.

export const ETIQUETAS = {
  propio: 'Proyecto propio',
  interna: 'Implementación interna',
  piloto: 'Piloto',
  tercero: 'Implementación para tercero',
  cliente: 'Cliente',
  confidencial: 'Cliente confidencial',
  demo: 'Demostración tecnológica',
};

/**
 * @typedef {{ id: string, codigo: string, etiqueta: keyof typeof ETIQUETAS,
 *   estado: string, categoria: string, titulo: string, contexto: string,
 *   problema: string, antes: string, despues: string,
 *   resultado: { valor: string, texto: string },
 *   metricas: [string, string][], construido: string[],
 *   medicion: string, tecnico: string, servicio: string,
 *   media: null | { tipo: 'imagen'|'video', src: string, alt: string, poster?: string, ancho?: number, alto?: number } }} Caso
 */

/** @type {Caso[]} */
export const CASOS = [
  {
    id: 'documentos-legales',
    codigo: 'C-01',
    etiqueta: 'propio',
    estado: 'En operación diaria',
    categoria: 'Automatización documental',
    titulo: 'Ocho documentos oficiales desde un solo ingreso de datos',
    contexto: 'Prevención de pérdidas en un local de una cadena de retail.',
    problema: 'Cada procedimiento obligaba a llenar a mano ocho formatos oficiales en Word, repitiendo los mismos datos en cada uno y arriesgando errores de transcripción.',
    antes: '45 minutos por procedimiento, llenando ocho documentos a mano.',
    despues: '4 minutos: los datos se ingresan una vez y se generan los ocho documentos en Word y PDF, más un archivo único listo para imprimir.',
    resultado: { valor: '−91%', texto: 'de tiempo por procedimiento' },
    metricas: [
      ['45 → 4 min', 'por procedimiento'],
      ['8', 'documentos generados'],
      ['10 / 10', 'productos leídos en una boleta real de prueba'],
    ],
    construido: [
      'Un formulario único que alimenta los ocho documentos',
      'Lectura de boletas por foto o PDF, sin conexión a internet',
      'Datos dudosos marcados en amarillo para revisión humana',
      'Validaciones que impiden generar documentos incompletos',
      'Historial editable, respaldos y registro de accesos cifrado',
      'Instalador para Windows',
    ],
    medicion: 'Tiempo total por procedimiento, antes y después de usar la herramienta. La lectura de boletas se validó con una boleta real: los diez productos y la suma coincidieron con el total impreso.',
    tecnico: 'Python · plantillas Word (docxtpl) · conversión a PDF · reconocimiento de texto local de Windows · instalador propio',
    servicio: 'express',
    media: null,
  },
  {
    id: 'venta-en-linea',
    codigo: 'C-02',
    etiqueta: 'propio',
    estado: 'En producción',
    categoria: 'Proceso comercial',
    titulo: 'Un servicio que cotiza, cobra y registra sin intervención manual',
    contexto: 'Servicio técnico de computadores de ANVAR TECH, con venta en línea.',
    problema: 'Explicar el servicio, cotizar, cobrar y registrar cada venta se hacía a mano, por WhatsApp y en una planilla que no siempre se actualizaba.',
    antes: 'Cotización por WhatsApp, cobro por transferencia y registro manual en planilla.',
    despues: 'El cliente describe su problema, un recomendador le sugiere el servicio, paga en línea y recibe su comprobante. La venta queda registrada sola.',
    resultado: { valor: '24/7', texto: 'cotización, cobro y registro funcionando' },
    metricas: [
      ['24/7', 'cotiza y cobra'],
      ['1', 'fuente única de precios'],
      ['0', 'registros manuales por venta'],
    ],
    construido: [
      'Recomendador que sugiere el servicio según el problema descrito',
      'Pago en línea con comprobante automático por correo',
      'Registro de cada venta en el CRM sin intervención',
      'Catálogo sincronizado con WhatsApp Business',
      'Panel privado de ventas',
    ],
    medicion: 'Resultado operativo, no de tiempo: cada venta pagada queda registrada y notificada sin pasos manuales.',
    tecnico: 'Sitio y funciones serverless (Vercel) · modelo de lenguaje de Anthropic · pagos Flow · correos Resend · Google Sheets como CRM · catálogo de Meta',
    servicio: 'piloto',
    media: null,
  },
  {
    id: 'planos-autocad',
    codigo: 'C-03',
    etiqueta: 'confidencial',
    estado: 'Entregado',
    categoria: 'Ingeniería y AutoCAD',
    titulo: 'Un plano de planta iterado por instrucciones, sobre el archivo real',
    contexto: 'Layout de una planta de proceso para una organización cliente.',
    problema: 'Cada cambio de criterio obligaba a redibujar, volver a acotar y rehacer el cuadro de equipos a mano.',
    antes: 'Cada revisión del plano implicaba redibujar, reacotar y actualizar el cuadro de equipos.',
    despues: 'Los cambios se piden en español y se aplican directamente sobre el archivo .dwg; el cuadro de equipos se exporta a Excel.',
    resultado: { valor: '8', texto: 'versiones del plano en 5 días' },
    metricas: [
      ['8', 'versiones en 5 días'],
      ['.dwg', 'trabajo sobre el archivo real'],
      ['Excel', 'cuadro de equipos exportado'],
    ],
    construido: [
      'Conexión entre AutoCAD y un modelo de IA',
      'Muros, equipos, cotas y capas por instrucción',
      'Revisión de superposiciones y cotas entre versiones',
      'Exportación del cuadro de equipos a Excel',
    ],
    medicion: 'Número de versiones del plano entregadas entre la primera y la revisión final.',
    tecnico: 'AutoCAD / Civil 3D · conexión mediante MCP · modelo de lenguaje · exportación a Excel',
    servicio: 'implementacion',
    media: null,
  },
  {
    id: 'pronostico-stock',
    codigo: 'C-04',
    etiqueta: 'demo',
    estado: 'Prototipo académico',
    categoria: 'Inteligencia de datos',
    titulo: 'Pronóstico de stock con un modelo entrenado sobre el histórico',
    contexto: 'Prototipo desarrollado en un contexto académico, con datos de movimientos de bodega.',
    problema: 'Decidir cuánto pedir y cuándo sin depender del criterio de quien esté a cargo ese día.',
    antes: 'Reposición según criterio personal, sin un pronóstico que lo respalde.',
    despues: 'Un modelo que aprende del histórico de movimientos, dentro de una aplicación de escritorio con informes.',
    resultado: { valor: 'Prototipo', texto: 'funcional, no está en operación en una empresa' },
    metricas: [],
    construido: [
      'Modelo de red neuronal entrenado con el histórico',
      'Aplicación de escritorio con interfaz e informes',
      'Modelo de clases documentado',
    ],
    medicion: 'Validado en contexto académico. No tiene medición de impacto en una operación real.',
    tecnico: 'Python · red neuronal propia · aplicación de escritorio',
    servicio: 'intelligence',
    media: null,
  },
];

/** Métricas destacadas de la portada. Cada una apunta a su caso. */
export const METRICAS = [
  { valor: '45 → 4 min', texto: 'por procedimiento documental', caso: 'documentos-legales' },
  { valor: '8', texto: 'documentos generados desde un solo ingreso de datos', caso: 'documentos-legales' },
  { valor: '24/7', texto: 'cotización, cobro y registro sin intervención manual', caso: 'venta-en-linea' },
  { valor: '8', texto: 'versiones de un plano de planta en 5 días', caso: 'planos-autocad' },
];
