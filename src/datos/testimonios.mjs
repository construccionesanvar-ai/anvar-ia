// @ts-check
// Testimonios de clientes. HOY NO HAY NINGUNO, y la lista está vacía a
// propósito: el sitio no publica testimonios inventados ni genéricos.
//
// Mientras no haya al menos un testimonio con `autorizado` completo, la
// sección no aparece en ninguna página (ni vacía, ni con un título solo).
//
// ─── Cómo agregar uno ───────────────────────────────────────────────────────
// 1. Pide la autorización por escrito (correo o WhatsApp sirve) y guarda la
//    fecha. Sin eso, no se publica.
// 2. Copia la frase textual, sin mejorarla. Si el cliente la edita, usa su versión.
// 3. Logo o foto: archivos propios del cliente, en public/testimonios/
//    (WebP, logo ≤ 240 px de ancho, foto cuadrada 160 px). Opcionales.
// 4. Si el cliente pidió reserva, `confidencial: true`: se muestra el cargo y
//    la industria, nunca el nombre, la empresa, el logo ni la foto.
// 5. `caso` enlaza al caso relacionado (id de src/datos/casos.mjs) y
//    `resultado` es la cifra medida que respalda el testimonio, si existe.
// 6. `npm test`: el QA valida que la autorización esté y que los archivos existan.
//
// Ejemplo (no real, solo el formato):
//   {
//     frase: 'Texto tal como lo dijo el cliente.',
//     nombre: 'Nombre Apellido', cargo: 'Jefe de operaciones',
//     empresa: 'Empresa S.A.', industria: 'Metalmecánica',
//     logo: '/testimonios/empresa.webp', foto: null,
//     confidencial: false, caso: 'documentos-legales',
//     resultado: '45 → 4 min por procedimiento',
//     autorizado: { fecha: '2026-10-01', medio: 'Correo del 01/10/2026' },
//   }

/**
 * @typedef {{ frase: string, nombre: string, cargo: string, empresa: string,
 *   industria: string, logo?: string | null, foto?: string | null,
 *   confidencial: boolean, caso?: string, resultado?: string,
 *   autorizado: { fecha: string, medio: string } | null }} Testimonio
 */

/** @type {Testimonio[]} */
export const TESTIMONIOS = [];

/** Solo los que se pueden publicar: con autorización registrada. */
export const publicables = (lista = TESTIMONIOS) => lista.filter((t) => t.autorizado && t.autorizado.fecha && t.frase);
