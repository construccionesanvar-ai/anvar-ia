// @ts-check
// Video de la portada. Es una ANIMACIÓN hecha en Remotion (proyecto aparte, en
// C:/Users/andre/Desktop/Remotion/my-video, composiciones AnvarHome y
// AnvarHomeVertical), no una grabación de la herramienta: por eso se rotula así
// y no sirve como evidencia de un caso (ver docs/CASE_VIDEO_SHOTLIST.md).
// Las cifras que muestra son las del caso C-01.
//
// Dos cortes del mismo guion: 16:9 para pantallas anchas y 4:5, con letra más
// grande, para celulares (≤ 640 px). Sin audio. Se reproduce una vez y queda
// quieto en el cierre.

/** @typedef {{ webm: string, mp4: string, poster: string, ancho: number, alto: number }} FormatoVideo */

export const VIDEO_INICIO = {
  duracion: 24,
  caso: 'documentos-legales',
  /** @type {{ h: FormatoVideo, v: FormatoVideo }} */
  formatos: {
    h: { webm: '/video/inicio-16x9.webm', mp4: '/video/inicio-16x9.mp4', poster: '/video/inicio-16x9.webp', ancho: 1920, alto: 1080 },
    v: { webm: '/video/inicio-4x5.webm', mp4: '/video/inicio-4x5.mp4', poster: '/video/inicio-4x5.webp', ancho: 1080, alto: 1350 },
  },
  /** Lo que dice el video, escena por escena: alternativa en texto para quien no lo ve. */
  escenas: [
    ['El problema', 'Copiar, pegar, digitar: los mismos datos (cliente, fecha, monto) se escriben una y otra vez en Excel, Word, PDF, correo y WhatsApp.'],
    ['La solución', 'Conectamos lo que ya usas: IA y software sobre las herramientas que tu equipo conoce, para tener documentos listos, reportes automáticos, ventas registradas y alertas a tiempo.'],
    ['Caso C-01 · proyecto propio', 'Automatización documental en retail: ocho documentos oficiales desde un solo ingreso de datos. De 45 a 4 minutos por procedimiento (−91 %), en operación diaria.'],
    ['Cómo trabajamos', 'Si no genera valor, no escalamos. Detectamos (semana 0 a 1), construimos una solución acotada (semanas 1 a 4), medimos antes y después con el mismo método y escalamos solo si generó valor.'],
    ['Cierre', 'ANVAR TECH · IA & Automatización. Que la IA haga el trabajo que hoy te come el día. Evaluación de 20 minutos, sin costo.'],
  ],
};
