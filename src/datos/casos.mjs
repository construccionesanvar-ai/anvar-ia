// @ts-check
// Casos reales: fuente única para la portada, /casos, las páginas de servicio
// y los datos estructurados. Regla: cada caso lleva la etiqueta que le
// corresponde y ninguna métrica que no tenga respaldo.
//
// ─── Cómo agregar evidencia visual a un caso ────────────────────────────────
// 1. Deja el archivo en public/casos/ (ej. public/casos/c01-demo.mp4).
//    Video: MP4 (H.264), 15–30 s, sin audio o con subtítulos, ≤ 4 MB, 1280 px
//    de ancho. Prefiere MP4 en bucle antes que GIF (pesa 5–10 veces menos).
//    Imagen o captura: WebP, 1200 px de ancho.
// 2. Completa `media` del caso:
//      media: {
//        principal: { tipo: 'video', src: '/casos/c01-demo.mp4', poster: '/casos/c01-poster.webp',
//                     alt: 'Se ingresan los datos una vez y se generan los ocho documentos',
//                     ancho: 1280, alto: 720, duracion: '0:24' },
//        galeria: [{ tipo: 'captura', src: '/casos/c01-form.webp', alt: '…', ancho: 1200, alto: 750 }],
//        demo: { url: 'https://…', texto: 'Probar la demostración' },
//      }
//    Tipos: 'video' (se reproduce en bucle, sin sonido, con controles),
//    'gif', 'imagen' y 'captura'.
// 3. `npm test`. Si un archivo no existe, el build falla: nunca se publica un
//    espacio vacío ni un reproductor roto. Sin `media`, el caso muestra su
//    diagrama de flujo (`flujo`), que es texto real y no un marcador.

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
 * @typedef {{ tipo: 'video'|'gif'|'imagen'|'captura', src: string, alt: string,
 *   poster?: string, ancho: number, alto: number, duracion?: string, leyenda?: string }} Medio
 * @typedef {{ principal?: Medio, galeria?: Medio[], demo?: { url: string, texto: string } }} Media
 * @typedef {{ valor: string, texto: string, nota?: string }} Metrica
 * @typedef {{ visibilidad: 'propio'|'publico'|'confidencial', nombre?: string, industria?: string }} ClienteCaso
 * @typedef {{ id: string, codigo: string, etiqueta: keyof typeof ETIQUETAS,
 *   estado: string, categoria: string, titulo: string, contexto: string,
 *   cliente: ClienteCaso,
 *   problema: string, antes: string, despues: string,
 *   resultado: { valor: string, texto: string },
 *   antesDespues?: { antes: string, despues: string, texto: string, pct: number },
 *   metricas: Metrica[], construido: string[], flujo: [string, string][],
 *   medicion: string, disclaimer?: string, tecnologias: string[], servicio: string,
 *   media: Media | null, evidenciaPendiente?: string }} Caso
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
    cliente: { visibilidad: 'propio', industria: 'Retail' },
    problema: 'Cada procedimiento obligaba a llenar a mano ocho formatos oficiales en Word, repitiendo los mismos datos en cada uno y arriesgando errores de transcripción.',
    antes: '45 minutos por procedimiento, llenando ocho documentos a mano.',
    despues: '4 minutos: los datos se ingresan una vez y se generan los ocho documentos en Word y PDF, más un archivo único listo para imprimir.',
    resultado: { valor: '−91%', texto: 'de tiempo por procedimiento' },
    antesDespues: { antes: '45 min', despues: '4 min', texto: 'Tiempo por procedimiento', pct: 91 },
    metricas: [
      { valor: '45 → 4 min', texto: 'por procedimiento' },
      { valor: '8', texto: 'documentos generados desde un solo ingreso' },
      { valor: '10 de 10', texto: 'productos leídos en la boleta de prueba', nota: 'Una sola boleta real: prueba puntual, no una tasa de precisión.' },
    ],
    construido: [
      'Un formulario único que alimenta los ocho documentos',
      'Lectura de boletas por foto o PDF, sin conexión a internet',
      'Datos dudosos marcados en amarillo para revisión humana',
      'Validaciones que impiden generar documentos incompletos',
      'Historial editable, respaldos y registro de accesos cifrado',
      'Instalador para Windows',
    ],
    flujo: [
      ['Entrada', 'Datos del procedimiento y foto o PDF de la boleta'],
      ['Proceso', 'Un formulario con validaciones y lectura local de la boleta'],
      ['Revisión', 'Los datos dudosos quedan marcados para una persona'],
      ['Salida', 'Ocho documentos en Word y PDF, más uno para imprimir'],
    ],
    medicion: 'Tiempo total por procedimiento, antes y después de usar la herramienta.',
    disclaimer: 'La lectura de boletas se probó con una boleta real de diez productos: los diez y la suma coincidieron con el total impreso. Es una prueba puntual, no una tasa de precisión general; por eso todo dato dudoso queda marcado para revisión humana antes de generar los documentos.',
    tecnologias: ['Python', 'Plantillas Word (docxtpl)', 'Conversión a PDF', 'Reconocimiento de texto local de Windows', 'Instalador propio'],
    servicio: 'express',
    media: null,
    evidenciaPendiente: 'Video de 15–30 s: se ingresan los datos una vez → se generan los ocho documentos.',
  },
  {
    id: 'venta-en-linea',
    codigo: 'C-02',
    etiqueta: 'propio',
    estado: 'En producción',
    categoria: 'Proceso comercial',
    titulo: 'Un servicio que cotiza, cobra y registra sin intervención manual',
    contexto: 'Servicio técnico de computadores de ANVAR TECH, con venta en línea.',
    cliente: { visibilidad: 'propio', industria: 'Servicio técnico' },
    problema: 'Explicar el servicio, cotizar, cobrar y registrar cada venta se hacía a mano, por WhatsApp y en una planilla que no siempre se actualizaba.',
    antes: 'Cotización por WhatsApp, cobro por transferencia y registro manual en planilla.',
    despues: 'El cliente describe su problema, un recomendador le sugiere el servicio, paga en línea y recibe su comprobante. La venta queda registrada sola.',
    resultado: { valor: '24/7', texto: 'cotización, cobro y registro funcionando' },
    metricas: [
      { valor: '24/7', texto: 'cotiza y cobra' },
      { valor: '1', texto: 'fuente única de precios' },
      { valor: '0', texto: 'registros manuales por venta' },
    ],
    construido: [
      'Recomendador que sugiere el servicio según el problema descrito',
      'Pago en línea con comprobante automático por correo',
      'Registro de cada venta en el CRM sin intervención',
      'Catálogo sincronizado con WhatsApp Business',
      'Panel privado de ventas',
    ],
    flujo: [
      ['Consulta', 'El cliente describe su problema'],
      ['Recomendación', 'El sistema sugiere el servicio que corresponde'],
      ['Pago', 'Pago en línea y comprobante por correo'],
      ['Registro', 'La venta queda en el CRM y llega el aviso'],
    ],
    medicion: 'Resultado operativo, no de tiempo: cada venta pagada queda registrada y notificada sin pasos manuales.',
    tecnologias: ['Sitio y funciones serverless (Vercel)', 'Modelo de lenguaje de Anthropic', 'Pagos Flow', 'Correos Resend', 'Google Sheets como CRM', 'Catálogo de Meta'],
    servicio: 'piloto',
    media: null,
    evidenciaPendiente: 'Video de 15–30 s: consulta → recomendación → pago → registro en el CRM.',
  },
  {
    id: 'planos-autocad',
    codigo: 'C-03',
    etiqueta: 'confidencial',
    estado: 'Entregado',
    categoria: 'Ingeniería y AutoCAD',
    titulo: 'Un plano de planta iterado por instrucciones, sobre el archivo real',
    contexto: 'Layout de una planta de proceso para una organización cliente.',
    cliente: { visibilidad: 'confidencial' },
    problema: 'Cada cambio de criterio obligaba a redibujar, volver a acotar y rehacer el cuadro de equipos a mano.',
    antes: 'Cada revisión del plano implicaba redibujar, reacotar y actualizar el cuadro de equipos.',
    despues: 'Los cambios se piden en español y se aplican directamente sobre el archivo .dwg; el cuadro de equipos se exporta a Excel.',
    resultado: { valor: '8', texto: 'versiones del plano en 5 días' },
    metricas: [
      { valor: '8', texto: 'versiones en 5 días' },
      { valor: '.dwg', texto: 'trabajo sobre el archivo real' },
      { valor: 'Excel', texto: 'cuadro de equipos exportado' },
    ],
    construido: [
      'Conexión entre AutoCAD y un modelo de IA',
      'Muros, equipos, cotas y capas por instrucción',
      'Revisión de superposiciones y cotas entre versiones',
      'Exportación del cuadro de equipos a Excel',
    ],
    flujo: [
      ['Instrucción', 'El cambio se pide en español'],
      ['Modificación', 'Se aplica sobre el archivo .dwg real'],
      ['Control', 'Revisión de superposiciones y cotas'],
      ['Salida', 'Plano actualizado y cuadro de equipos en Excel'],
    ],
    medicion: 'Número de versiones del plano entregadas entre la primera y la revisión final.',
    disclaimer: 'La cifra mide el ritmo de iteración, no un ahorro: no se midió cuánto habría tomado hacer las mismas revisiones a mano.',
    tecnologias: ['AutoCAD / Civil 3D', 'Conexión mediante MCP', 'Modelo de lenguaje', 'Exportación a Excel'],
    servicio: 'implementacion',
    media: null,
    evidenciaPendiente: 'Video de 15–30 s con un plano de ejemplo (no el del cliente): instrucción → cambio en AutoCAD.',
  },
  {
    id: 'pronostico-stock',
    codigo: 'C-04',
    etiqueta: 'demo',
    estado: 'Prototipo académico',
    categoria: 'Inteligencia de datos',
    titulo: 'Pronóstico de stock con un modelo entrenado sobre el histórico',
    contexto: 'Prototipo desarrollado en un contexto académico, con datos de movimientos de bodega.',
    cliente: { visibilidad: 'propio', industria: 'Bodegas' },
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
    flujo: [
      ['Histórico', 'Movimientos de bodega'],
      ['Modelo', 'Red neuronal entrenada con esos datos'],
      ['Informe', 'Pronóstico dentro de una aplicación de escritorio'],
    ],
    medicion: 'Validado en contexto académico. No tiene medición de impacto en una operación real.',
    tecnologias: ['Python', 'Red neuronal propia', 'Aplicación de escritorio'],
    servicio: 'intelligence',
    media: null,
  },
];

/** Enlace a la ficha completa de un caso. */
export const urlCaso = (c) => `/casos#${c.id}`;

/** Busca un caso por id. */
export const caso = (id) => CASOS.find((c) => c.id === id);

/**
 * Métricas destacadas de la portada. El valor sale del caso (métrica número
 * `metrica`), así la portada y /casos nunca dicen cosas distintas.
 */
export const METRICAS = [
  { caso: 'documentos-legales', metrica: 0, texto: 'por procedimiento documental' },
  { caso: 'documentos-legales', metrica: 1, texto: 'documentos generados desde un solo ingreso de datos' },
  { caso: 'venta-en-linea', metrica: 0, texto: 'cotización, cobro y registro sin intervención manual' },
  { caso: 'planos-autocad', metrica: 0, texto: 'versiones de un plano de planta en 5 días' },
];
