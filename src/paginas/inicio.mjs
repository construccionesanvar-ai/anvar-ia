// @ts-check
import { FAQ } from '../datos/faq.mjs';
import { evaluar } from '../componentes/base.mjs';
import { heroInicio, videoInicio, tiraMetricas, problemas, casosInicio, testimonios, datosInicio, proceso, precios, seguridad, nosotros, preguntas } from '../componentes/secciones.mjs';
import { FUENTES } from '../datos/whatsapp.mjs';
import { herramientas } from '../componentes/herramientas.mjs';
import { sitioWeb, faq } from './ld.mjs';

export default {
  ruta: '/',
  archivo: 'index.html',
  prioridad: '1.0',
  titulo: 'Automatización de procesos e IA para empresas | ANVAR TECH',
  ogTitulo: 'ANVAR TECH · Automatizamos el trabajo repetitivo de tu empresa',
  descripcion: 'Automatizamos procesos repetitivos de tu empresa con IA, software y las herramientas que ya usas: Excel, Word, PDF y WhatsApp. Medimos antes y después.',
  contextoWsp: 'general',
  fuente: FUENTES.home,
  jsonld: [sitioWeb(), faq(FAQ.inicio)],
  cuerpo: () => [
    heroInicio(),
    videoInicio(),
    tiraMetricas(),
    problemas(),
    casosInicio(),
    testimonios(),
    datosInicio(),
    proceso(),
    precios(),
    herramientas(),
    seguridad(),
    nosotros(),
    preguntas(FAQ.inicio),
    evaluar({ contexto: 'general', tipo: 'express' }),
  ].join('\n'),
};
