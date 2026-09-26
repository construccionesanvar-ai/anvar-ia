// @ts-check
// Video de la portada. Es una ANIMACIÓN hecha en Remotion (proyecto aparte, en
// C:/Users/andre/Desktop/Remotion/my-video, composiciones AnvarHomeVoz y
// AnvarHomeVozVertical), no una grabación de la herramienta: por eso se rotula así
// y no sirve como evidencia de un caso (ver docs/CASE_VIDEO_SHOTLIST.md).
// Las cifras que muestra son las del caso C-01.
//
// Dos cortes del mismo guion: 16:9 para pantallas anchas y 4:5, con letra más
// grande, para celulares (≤ 640 px). Tiene voz en off (generada con ElevenLabs,
// voz "Fernando Martinez", español latino), pero arranca en silencio: los
// navegadores no permiten reproducir sonido sin que la persona lo pida. El
// botón "Activar sonido" lo reinicia con voz. Se reproduce una vez y queda quieto
// en el cierre.
//
// El guion de la voz vive en el proyecto de Remotion (src/anvar/voz.ts). Si cambia,
// hay que volver a exportar y actualizar `voz` aquí y los subtítulos (.vtt).

/** @typedef {{ webm: string, mp4: string, poster: string, ancho: number, alto: number }} FormatoVideo */

export const VIDEO_INICIO = {
  duracion: 31,
  caso: 'documentos-legales',
  /** @type {{ h: FormatoVideo, v: FormatoVideo }} */
  formatos: {
    h: { webm: '/video/inicio-16x9.webm', mp4: '/video/inicio-16x9.mp4', poster: '/video/inicio-16x9.webp', ancho: 1920, alto: 1080 },
    v: { webm: '/video/inicio-4x5.webm', mp4: '/video/inicio-4x5.mp4', poster: '/video/inicio-4x5.webp', ancho: 1080, alto: 1350 },
  },
  /** Subtítulos de la voz en off (WebVTT), sincronizados por frase. */
  subtitulos: '/video/inicio-voz.vtt',
  /**
   * Escena por escena: lo que dice la voz y lo que muestra la pantalla. Es la
   * alternativa en texto para quien no ve ni escucha el video.
   * [título, voz, pantalla]
   */
  escenas: [
    ['El problema', '¿Cuánto tiempo se va en copiar, pegar y volver a digitar lo mismo?', 'Los mismos datos (cliente, fecha, monto) se escriben una y otra vez en Excel, Word, PDF, correo y WhatsApp.'],
    ['La solución', 'Conectamos lo que tu equipo ya usa, para que ese trabajo deje de hacerse a mano.', 'IA y software sobre esas herramientas: documentos listos, reportes automáticos, ventas registradas y alertas a tiempo.'],
    ['Caso C-01 · proyecto propio', 'En un proyecto propio, ocho documentos que tomaban cuarenta y cinco minutos hoy salen en cuatro.', 'Automatización documental en retail, en operación diaria: de 45 a 4 minutos por procedimiento (−91 %).'],
    ['Cómo trabajamos', 'Medimos antes y después. Si no genera valor, no escalamos.', 'Detectamos (semana 0 a 1), construimos una solución acotada (semanas 1 a 4), medimos al cierre con el mismo método y escalamos solo si generó valor.'],
    ['Cierre', 'ANVAR TECH. Que la IA haga el trabajo que hoy te come el día. Evaluación de veinte minutos, sin costo.', 'ANVAR TECH · IA & Automatización.'],
  ],
};
