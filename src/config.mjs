// @ts-check
// Configuración del sitio. Todo lo que cambia con el negocio vive acá o en
// src/datos/. Después de editar: `npm run build`.

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

  // Valor UF de referencia para mostrar equivalencias en pesos. Actualízalo
  // de vez en cuando: los precios se cotizan en UF y el peso es solo una guía.
  uf: 41000,

  // Agenda de la evaluación de 20 minutos. Pega aquí el enlace público de
  // Cal.com, Calendly o Google Calendar (páginas de reserva). Si queda vacío,
  // el botón de agendar abre WhatsApp con un mensaje para coordinar la hora.
  // Ejemplo: 'https://cal.com/anvar-tech/evaluacion-20-min'
  agenda: {
    url: '',
    duracionMin: 20,
  },

  fundador: {
    nombre: 'Andrés Vargas',
    cargo: 'Fundador de ANVAR TECH',
    formacion: 'Ingeniería de Ejecución Industrial (en curso)',
    experiencia: 'Operaciones de retail · prevención de pérdidas',
  },
};

/** Semanas hábiles al año que usa la calculadora. */
export const SEMANAS_HABILES = 44;
