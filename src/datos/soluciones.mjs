// @ts-check
// Páginas de solución (alta intención de búsqueda). Cada una tiene UNA
// intención principal; el mapa completo está en docs/SEO_CONTENT_MAP.md.
// Se usan en el pie, en los enlaces "sigue leyendo" y en llms.txt.

/** @typedef {{ ruta: string, nombre: string, texto: string, intencion: string }} Solucion */

/** @type {Solucion[]} */
export const SOLUCIONES = [
  { ruta: '/automatizacion-procesos-pymes', nombre: 'Automatización para pymes', intencion: 'automatización de procesos para pymes',
    texto: 'Qué conviene automatizar en una pyme, qué no, y cómo partir sin un proyecto grande.' },
  { ruta: '/automatizacion-documental', nombre: 'Automatización documental', intencion: 'automatización documental',
    texto: 'Documentos Word, Excel y PDF generados desde un solo ingreso de datos, con revisión humana donde importa.' },
  { ruta: '/automatizar-excel', nombre: 'Automatizar Excel', intencion: 'automatizar Excel en la empresa',
    texto: 'Cuándo basta con Power Query o una macro, cuándo conviene Python y cuándo la IA agrega algo de verdad.' },
  { ruta: '/automatizar-cotizaciones', nombre: 'Automatizar cotizaciones', intencion: 'automatizar cotizaciones',
    texto: 'De la solicitud del cliente al documento aprobado: la IA interpreta, las reglas calculan el precio.' },
  { ruta: '/automatizacion-autocad', nombre: 'Automatización en AutoCAD', intencion: 'automatizar AutoCAD',
    texto: 'Cambios en planos pedidos en español y aplicados sobre el .dwg real, con revisión de un profesional.' },
];

export const solucion = (ruta) => {
  const s = SOLUCIONES.find((x) => x.ruta === ruta);
  if (!s) throw new Error(`Solución inexistente: ${ruta}`);
  return s;
};
