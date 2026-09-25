// @ts-check
// Configuración del sitio. Todo lo que cambia con el negocio vive acá o en
// src/datos/. Después de editar: `npm test`.

export const SITIO = {
  dominio: 'https://ia.anvartech.cl',
  sitioMatriz: 'https://anvartech.cl',
  marca: 'ANVAR TECH',
  linea: 'IA & Automatización',
  idioma: 'es-CL',

  empresa: {
    // Nombre que se muestra. Decisión de Andrés (2026-09-24): se usa ANVAR TECH SpA
    // como nombre de fantasía. El RUT es de ANVAR Construcciones SpA, que es quien
    // factura; por eso el sitio no rotula este nombre como "razón social" ni lo
    // declara como legalName en los datos estructurados.
    nombre: 'ANVAR TECH SpA',
    rut: '77.982.517-5',
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

  // UF de referencia para mostrar equivalencias en pesos. Los precios se
  // cotizan y se facturan en UF; el peso es solo una guía.
  //  - En el navegador, /api/uf trae el valor del día y reemplaza este.
  //  - Si /api/uf falla, se muestra este valor con su fecha.
  //  - Si este valor tiene más de `vigenciaDias` días, deja de mostrarse:
  //    queda solo el precio en UF. Actualízalo cuando lo veas viejo.
  uf: {
    valor: 41000,
    fecha: '2026-09-24',
    vigenciaDias: 45,
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

  // Política de privacidad: fecha de la versión vigente (se muestra en /privacidad).
  privacidad: {
    actualizada: '2026-09-25',
  },

  fundador: {
    nombre: 'Andrés Vargas',
    cargo: 'Fundador de ANVAR TECH',
    formacion: 'Ingeniería de Ejecución Industrial (en curso)',
    experiencia: 'Operaciones de retail · prevención de pérdidas',
  },
};

/** Supuestos de la calculadora de ahorro (los usa el build y el navegador). */
export const CALCULADORA = {
  /** Semanas hábiles al año. */
  semanas: 44,
  /** Bajo este valor anual se compara con una Express; sobre él, con un piloto. */
  umbralExpress: 2_000_000,
  /** Sobre estos meses de retorno se dice que no se justifica por tiempo. */
  mesesMaximos: 36,
  /** Valores de ejemplo con que parte. */
  defecto: { personas: 5, horas: 6, costo: 9000, auto: 60 },
};

/** Compatibilidad: algunos módulos importan este nombre. */
export const SEMANAS_HABILES = CALCULADORA.semanas;
