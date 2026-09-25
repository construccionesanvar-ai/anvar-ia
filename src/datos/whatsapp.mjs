// @ts-check
// WhatsApp: fuente única de mensajes, origen del lead y armado de enlaces.
// Todo enlace a WhatsApp del sitio sale de `urlWsp()`; el navegador usa la
// misma regla (ver `enlaceWsp()` en public/app.js).
import { SITIO } from '../config.mjs';

/**
 * Origen del lead (lead source). Va al final de cada mensaje de WhatsApp
 * como "(ref: …)", viaja con el formulario y en la analítica, así se puede
 * medir qué página genera conversaciones.
 */
export const FUENTES = {
  home: 'home',
  team: 'team-profile', //         perfil del autor (/equipo/andres-vargas)
  express: 'express',
  data: 'data',
  diagnosis: 'diagnosis', //        página del servicio de diagnóstico (UF 12)
  diagnostic: 'diagnostic', //      resultado del autodiagnóstico gratuito
  pilot: 'pilot',
  training: 'training',
  caseStudy: 'case-study',
  personal: 'personal-advisory',
  privacy: 'privacy',
  notFound: 'not-found',
  // Herramientas y contenido de adquisición orgánica
  calculator: 'roi-calculator',
  reorderPoint: 'reorder-point',
  template: 'roi-template',
  resources: 'resources',
  smb: 'smb-automation',
  documental: 'document-automation',
  excel: 'excel-automation',
  quotes: 'quote-automation',
  autocad: 'autocad-automation',
  caseDocumental: 'case-document-retail',
  guideCost: 'guide-cost',
  guideDetect: 'guide-detect',
  guideDont: 'guide-dont-automate',
  guideAi: 'guide-ai-vs-rules',
};

/**
 * Mensajes prellenados por contexto. Breves, naturales y sin datos
 * personales: el visitante completa el resto.
 */
export const MENSAJES = {
  general: 'Hola ANVAR TECH. Quiero evaluar si un proceso de mi empresa se puede automatizar.',
  agenda: 'Hola ANVAR TECH. Quiero coordinar una evaluación de 20 minutos para un proceso de mi empresa. ¿Qué horarios tienen disponibles?',
  express: 'Hola ANVAR TECH. Quiero evaluar una Automatización Express para un proceso de mi empresa.',
  datos: 'Hola ANVAR TECH. Quiero revisar una solución de datos e inteligencia operacional para mi empresa.',
  intelligence: 'Hola ANVAR TECH. Quiero saber más de ANVAR Intelligence para mi empresa.',
  diagnostico: 'Hola ANVAR TECH. Quiero cotizar un diagnóstico de automatización para mi empresa.',
  piloto: 'Hola ANVAR TECH. Tengo un proceso manual en mi empresa y quiero evaluar un piloto de automatización.',
  capacitacion: 'Hola ANVAR TECH. Quiero cotizar una capacitación en IA para mi equipo.',
  personal: 'Hola ANVAR TECH. Quiero coordinar una sesión de asesoría personal en IA.',
  caso: 'Hola ANVAR TECH. Vi sus casos y tengo un proceso parecido en mi empresa.',
  privacidad: 'Hola ANVAR TECH. Tengo una consulta sobre mis datos personales.',
};

/** Mensaje para un caso puntual: "Vi el caso C-01 y tengo un proceso parecido." */
export const mensajeCaso = (codigo) => `Hola ANVAR TECH. Vi el caso ${codigo} y tengo un proceso parecido.`;

/** Agrega el origen al final del mensaje. */
export const conRef = (texto, fuente) => (fuente ? `${texto}\n\n(ref: ${fuente})` : texto);

/**
 * Enlace a WhatsApp con el texto prellenado. `wa.me` abre la app en el
 * teléfono y WhatsApp Web en el computador; el texto va en UTF-8.
 * @param {string} [texto]
 */
export function urlWsp(texto) {
  return `https://wa.me/${SITIO.contacto.whatsapp}` + (texto ? `?text=${encodeURIComponent(texto)}` : '');
}

/**
 * Enlace a WhatsApp para un contexto del sitio.
 * @param {keyof typeof MENSAJES | string} clave
 * @param {string} [fuente]
 */
export function wsp(clave, fuente) {
  return urlWsp(conRef(MENSAJES[clave] ?? MENSAJES.general, fuente));
}
