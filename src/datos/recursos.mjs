// @ts-check
// Recursos: guías, casos largos y herramientas gratuitas. Fuente única para
// el índice /recursos, el feed RSS, llms.txt, los enlaces "sigue leyendo" y
// los datos estructurados de cada artículo.
//
// Regla: pocos recursos, muy buenos. Cada uno responde una pregunta real de
// alguien que intenta resolver un problema, con la experiencia de ANVAR TECH.
// Antes de sumar uno, revisa docs/SEO_CONTENT_MAP.md para no competir con una
// página que ya existe.
import { SITIO } from '../config.mjs';

/** Autor de los contenidos. Persona real; no se inventan perfiles. */
export const AUTOR = {
  nombre: SITIO.fundador.nombre,
  cargo: SITIO.fundador.cargo,
  url: '/equipo/andres-vargas',
  bio: 'Viene de operaciones de retail y prevención de pérdidas. Construyó el sistema documental del caso C-01, que se usa en operación diaria, y lidera cada proyecto de ANVAR TECH.',
};

export const CATEGORIAS = {
  automatizacion: 'Automatización',
  operaciones: 'Operaciones',
  datos: 'Datos',
  casos: 'Casos',
  herramientas: 'Herramientas',
};

/**
 * @typedef {{ ruta: string, titulo: string, tituloCorto: string, descripcion: string,
 *   categoria: keyof typeof CATEGORIAS, tipo: 'guia'|'caso'|'herramienta'|'plantilla',
 *   publicado: string, actualizado: string, lectura?: number, enFeed: boolean }} Recurso
 */

/** @type {Recurso[]} */
export const RECURSOS = [
  {
    ruta: '/casos/automatizacion-documental-retail',
    titulo: 'Cómo pasamos de 45 a 4 minutos en un proceso documental',
    tituloCorto: 'Caso C-01: de 45 a 4 minutos por procedimiento',
    descripcion: 'El caso completo: ocho documentos oficiales llenados a mano, cómo se rediseñó el proceso, la arquitectura, las limitaciones y cuándo se puede replicar.',
    categoria: 'casos', tipo: 'caso', publicado: '2026-09-25', actualizado: '2026-09-25', lectura: 9, enFeed: true,
  },
  {
    ruta: '/recursos/cuanto-cuesta-automatizar-proceso-chile',
    titulo: 'Cuánto cuesta automatizar un proceso en Chile',
    tituloCorto: 'Cuánto cuesta automatizar un proceso',
    descripcion: 'Rangos reales por tipo de proyecto, qué encarece y qué abarata una automatización, y cómo saber si se paga sola. Con los precios publicados de ANVAR TECH.',
    categoria: 'automatizacion', tipo: 'guia', publicado: '2026-09-25', actualizado: '2026-09-25', lectura: 8, enFeed: true,
  },
  {
    ruta: '/recursos/como-detectar-proceso-automatizable',
    titulo: 'Cómo saber si un proceso se puede automatizar: checklist práctico',
    tituloCorto: 'Checklist: ¿se puede automatizar este proceso?',
    descripcion: 'Diez preguntas para revisar un proceso antes de invertir en automatizarlo, con ejemplos de procesos que califican y otros que todavía no.',
    categoria: 'operaciones', tipo: 'guia', publicado: '2026-09-25', actualizado: '2026-09-25', lectura: 7, enFeed: true,
  },
  {
    ruta: '/recursos/procesos-que-no-deberias-automatizar',
    titulo: '7 procesos que probablemente no deberías automatizar todavía',
    tituloCorto: '7 procesos que todavía no conviene automatizar',
    descripcion: 'Automatizar un proceso mal definido solo hace más rápido el desorden. Siete situaciones en que conviene esperar, y qué hacer antes.',
    categoria: 'operaciones', tipo: 'guia', publicado: '2026-09-25', actualizado: '2026-09-25', lectura: 7, enFeed: true,
  },
  {
    ruta: '/recursos/ia-vs-automatizacion-tradicional',
    titulo: 'IA o automatización tradicional: cuándo usar cada una',
    tituloCorto: 'IA vs. reglas, scripts y RPA',
    descripcion: 'Reglas, scripts, RPA e inteligencia artificial resuelven problemas distintos. Cómo elegir, con ejemplos de procesos reales y una tabla para decidir.',
    categoria: 'automatizacion', tipo: 'guia', publicado: '2026-09-25', actualizado: '2026-09-25', lectura: 8, enFeed: true,
  },
  {
    ruta: '/recursos/plantilla-roi-automatizacion',
    titulo: 'Plantilla Excel para calcular el ROI de una automatización',
    tituloCorto: 'Plantilla Excel de ROI (gratis)',
    descripcion: 'Descarga gratis la planilla para calcular costo anual, horas liberadas, ahorro, payback y ROI de automatizar un proceso. Sin registro.',
    categoria: 'herramientas', tipo: 'plantilla', publicado: '2026-09-25', actualizado: '2026-09-25', enFeed: true,
  },
  {
    ruta: '/calculadora-roi-automatizacion',
    titulo: 'Calculadora de ROI de automatización de procesos',
    tituloCorto: 'Calculadora de ROI',
    descripcion: 'Calcula cuánto cuesta al año el trabajo manual de un proceso y en cuánto tiempo se pagaría automatizarlo. Gratis y sin registro.',
    categoria: 'herramientas', tipo: 'herramienta', publicado: '2026-09-25', actualizado: '2026-09-25', enFeed: false,
  },
  {
    ruta: '/diagnostico-automatizacion',
    titulo: '¿Qué tan automatizable es tu proceso? Autodiagnóstico',
    tituloCorto: 'Autodiagnóstico de automatización',
    descripcion: 'Siete preguntas, dos minutos: puntaje de preparación, principales oportunidades y el primer paso recomendado. Sin pedir tus datos.',
    categoria: 'herramientas', tipo: 'herramienta', publicado: '2026-09-25', actualizado: '2026-09-25', enFeed: false,
  },
  {
    ruta: '/herramientas/punto-de-pedido',
    titulo: 'Calculadora de punto de pedido y stock de seguridad',
    tituloCorto: 'Punto de pedido y stock de seguridad',
    descripcion: 'Calcula cuándo reponer un producto y cuánto stock de seguridad mantener según tu demanda, su variación y el plazo del proveedor.',
    categoria: 'datos', tipo: 'herramienta', publicado: '2026-09-25', actualizado: '2026-09-25', enFeed: false,
  },
];

/** Busca un recurso por ruta (falla en el build si no existe: evita enlaces rotos). */
export function recurso(ruta) {
  const r = RECURSOS.find((x) => x.ruta === ruta);
  if (!r) throw new Error(`Recurso inexistente: ${ruta}`);
  return r;
}
