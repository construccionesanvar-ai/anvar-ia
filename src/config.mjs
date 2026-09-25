// @ts-check
// Configuración del sitio. Todo lo que cambia con el negocio vive acá o en
// src/datos/. Después de editar: `npm test`.

export const SITIO = {
  dominio: 'https://ia.anvartech.cl',
  sitioMatriz: 'https://anvartech.cl',
  marca: 'ANVAR TECH',
  linea: 'IA & Automatización',
  idioma: 'es-CL',

  // Identidad legal. ANVAR TECH es una MARCA (no una sociedad): la sociedad que
  // presta los servicios, emite las facturas, firma contratos y NDA y es
  // responsable de los datos personales es ANVAR Construcciones SpA.
  // Fuente: repo anvartechcl (CLAUDE.md, "Datos del negocio") y anvartech.cl,
  // que ya factura con esta razón social y este RUT. Si cambia la sociedad,
  // se cambia SOLO aquí: pie, privacidad, JSON-LD y llms.txt salen de acá.
  // Las plantillas de operacion/ repiten estos datos a mano: actualízalas también.
  empresa: {
    razonSocial: 'ANVAR Construcciones SpA',
    rut: '77.982.517-5',
    /** Frase corta y exacta para explicar la relación marca → sociedad. */
    relacion: 'ANVAR TECH es una marca de ANVAR Construcciones SpA',
    pais: 'Chile',
    ciudad: 'Santiago',
    atencion: 'Presencial en la Región Metropolitana y remota en todo Chile',
  },

  contacto: {
    whatsapp: '56926333760',
    whatsappVisible: '+56 9 2633 3760',
    email: 'contacto@anvartech.cl',
    respuesta: 'Respondemos antes de 24 horas hábiles',
  },

  // UF. Los precios de proyectos se cotizan y facturan en UF.
  //  - Equivalencia en pesos de los precios: SOLO la del día. La pide el
  //    navegador a /api/uf (CMF o mindicador.cl, cacheada 6 h en la CDN) y la
  //    muestra con su fecha. Si /api/uf falla, se muestra solo el precio en UF
  //    y "Equivalencia en pesos no disponible temporalmente". El HTML nunca
  //    trae un valor en pesos fijo que pueda quedar viejo.
  //  - Este valor de referencia se usa únicamente para el cálculo inicial de
  //    la calculadora de ROI (opción "Piloto"), siempre rotulado con su fecha,
  //    y se reemplaza por la UF del día apenas carga la página.
  uf: {
    valor: 41000,
    fecha: '2026-09-24',
  },

  // Agenda de la evaluación de 20 minutos. Pega aquí el enlace público de
  // Cal.com, Calendly o Google Calendar (páginas de reserva). Si queda vacío,
  // el botón dice "Coordinar evaluación por WhatsApp" y abre WhatsApp: el
  // sitio nunca promete una agenda que no existe.
  // Ejemplo: 'https://cal.com/anvar-tech/evaluacion-20-min'
  agenda: {
    url: '',
    duracionMin: 20,
  },

  // Analítica. Hoy: Vercel Web Analytics (sin cookies). Si cambias de
  // proveedor, ajusta `medir()` en public/app.js y el CSP de vercel.json.
  analitica: {
    proveedor: 'vercel',
    script: '/_vercel/insights/script.js',
  },

  // Perfiles públicos de ANVAR TECH (van a `sameAs` del JSON-LD y al pie).
  // SOLO perfiles que existen y son de la empresa. Hoy: el sitio matriz.
  // Para agregar LinkedIn, Instagram o YouTube, pega aquí la URL completa.
  redes: [
    // { nombre: 'LinkedIn', url: 'https://www.linkedin.com/company/…' },
  ],

  // IndexNow (Bing, Yandex, Seznam, Naver…): avisa a los buscadores cuando una
  // URL se publica, cambia o se elimina. La clave NO es secreta: se publica en
  // /<clave>.txt para demostrar que el dominio es nuestro. Para rotarla, ver
  // docs/BING_WEBMASTER_SETUP.md.
  indexnow: {
    clave: 'd269de45b82b161e07fd9c4fd6224e58',
  },
  // Códigos de verificación de buscadores (son públicos: van en el HTML).
  // Bing: solo si no importas el sitio desde Search Console (docs/BING_WEBMASTER_SETUP.md).
  verificacion: {
    bing: '',
  },

  // Política de privacidad: fecha de la versión vigente (se muestra en /privacidad).
  privacidad: {
    actualizada: '2026-09-25',
  },

  fundador: {
    nombre: 'Andrés Vargas',
    cargo: 'Fundador de ANVAR TECH',
    formacion: 'Ingeniería de Ejecución Industrial (en curso)',
    experiencia: 'Operaciones de retail · prevención de pérdidas',
    /** Página de perfil (autor de guías y casos). */
    perfil: '/equipo/andres-vargas',
    /**
     * Perfiles públicos verificables (LinkedIn, GitHub…). Van a `sameAs` del
     * Person y a la página de perfil. Vacío = no se declara ninguno.
     * @type {{ nombre: string, url: string }[]}
     */
    perfiles: [],
  },
};

/** Supuestos de la calculadora de ROI (los usa el build y el navegador). */
export const CALCULADORA = {
  /** Semanas hábiles al año. */
  semanas: 44,
  /** Sobre estos meses de payback se dice que no se recupera dentro del período. */
  mesesMaximos: 36,
  /**
   * Valores de ejemplo con que parte. `inversion`: 'express' | 'piloto' | 'otro'
   * (con 'otro' se usa `monto`). Coinciden con el ejemplo de la plantilla Excel.
   */
  defecto: { personas: 5, horas: 6, costo: 9000, auto: 60, inversion: 'piloto', monto: 0, mensual: 0 },
};

/** Compatibilidad: algunos módulos importan este nombre. */
export const SEMANAS_HABILES = CALCULADORA.semanas;
