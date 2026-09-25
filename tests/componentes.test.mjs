// @ts-check
// Componentes: testimonios, calculadora, industria, evaluación y cabecera.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SITIO, CALCULADORA } from '../src/config.mjs';
import { SERVICIOS } from '../src/datos/oferta.mjs';
import { testimonios, detalleCaso, precio } from '../src/componentes/secciones.mjs';
import { calcular, textoRetorno } from '../src/componentes/herramientas.mjs';
import { evaluar, documento } from '../src/componentes/base.mjs';
import { paginaIndustria } from '../src/paginas/industria.mjs';
import { CASOS } from '../src/datos/casos.mjs';
import { fijarPagina } from '../src/contexto.mjs';

const autorizado = { fecha: '2026-10-01', medio: 'Correo' };

test('testimonios: la sección no existe sin testimonios autorizados', () => {
  assert.equal(testimonios(), '');
  assert.equal(testimonios({ datos: [{ frase: 'x', nombre: 'A', cargo: 'B', empresa: 'C', industria: 'D', confidencial: false, autorizado: null }] }), '');
});

test('testimonios: un cliente confidencial nunca muestra nombre, empresa, logo ni foto', () => {
  const html = testimonios({ datos: [{ frase: 'Nos ahorró tiempo.', nombre: 'Juana Pérez', cargo: 'Jefa de operaciones', empresa: 'Empresa Secreta', industria: 'Metalmecánica', logo: '/x.webp', foto: '/y.webp', confidencial: true, autorizado }] });
  assert.match(html, /Cliente confidencial · Metalmecánica/);
  assert.doesNotMatch(html, /Juana|Empresa Secreta|x\.webp|y\.webp/);
});

test('testimonios: uno público muestra nombre, empresa y caso relacionado', () => {
  const html = testimonios({ datos: [{ frase: 'Frase real.', nombre: 'Ana Soto', cargo: 'Gerenta', empresa: 'Acme', industria: 'Retail', confidencial: false, caso: 'documentos-legales', resultado: '45 → 4 min', autorizado }] });
  assert.match(html, /Ana Soto/);
  assert.match(html, /Acme/);
  assert.match(html, /\/casos#documentos-legales/);
});

test('calculadora: ejemplo por defecto', () => {
  const r = calcular(CALCULADORA.defecto);
  assert.equal(r.horasAno, 5 * 6 * CALCULADORA.semanas);
  assert.equal(r.recuperadas, Math.round(r.horasAno * 0.6));
  assert.equal(r.valor, r.recuperadas * 9000);
  assert.equal(r.referencia.nombre, 'un piloto');
  assert.match(textoRetorno(r), /^Como referencia, con este valor un piloto \(desde UF 40 \+ IVA\) se pagaría en \d/);
});

test('calculadora: valores extremos y umbral Express/piloto', () => {
  const min = calcular({ personas: 1, horas: 1, costo: 3000, auto: 20 });
  assert.equal(min.referencia.nombre, 'una Automatización Express');
  assert.match(textoRetorno(min), /no se justifica/);
  const max = calcular({ personas: 50, horas: 25, costo: 40000, auto: 90 });
  assert.ok(Number.isFinite(max.valor) && max.valor > 0);
  assert.match(textoRetorno(max), /menos de un mes/);
  const cero = { horasAno: 0, recuperadas: 0, restantes: 0, valor: 0, referencia: { nombre: 'x', precio: 1, etiqueta: 'x' }, meses: Infinity };
  assert.match(textoRetorno(cero), /no se justifica/);
  // El texto de la Express dice "desde": su precio es el piso, no el de cualquier automatización.
  const bajo = calcular({ personas: 2, horas: 3, costo: 8000, auto: 50 });
  assert.equal(bajo.referencia.nombre, 'una Automatización Express');
  assert.match(textoRetorno(bajo), /desde \$199\.900 \+ IVA/);
  assert.ok(bajo.valor < CALCULADORA.umbralExpress);
});

test('evaluar: sin agenda configurada no promete "Agendar"', () => {
  fijarPagina({ ruta: '/', fuente: 'home' });
  assert.equal(SITIO.agenda.url, '');
  const html = evaluar({ contexto: 'general' });
  assert.match(html, /Coordinar evaluación por WhatsApp/);
  assert.doesNotMatch(html, /Agendar/);
  assert.match(html, /href="\/privacidad"/);
  assert.match(html, /name="fuente" value="home"/);
});

test('cabecera: el logo no concatena "ANVAR TECHIA"', () => {
  const html = documento({ ruta: '/x', titulo: 't', descripcion: 'd', cuerpo: '<h1>x</h1>', fuente: 'home', hashes: { css: '1', js: '1' }, cliente: {} });
  const txt = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');
  assert.doesNotMatch(txt, /ANVAR TECHIA/);
  assert.match(txt, /ANVAR TECH IA &amp; Automatización/);
  assert.doesNotMatch(html, /fonts\.googleapis/);
});

test('precio en UF lleva data-uf para actualizarse con la UF del día', () => {
  assert.match(precio('diagnostico'), /data-uf="12" data-iva="mas"/);
  assert.doesNotMatch(precio('express'), /data-uf/);
});

test('detalle de caso: alcance de la cifra, flujo y WhatsApp con el código del caso', () => {
  fijarPagina({ ruta: '/casos', fuente: 'case-study' });
  const c01 = CASOS.find((c) => c.codigo === 'C-01');
  if (!c01) throw new Error('falta C-01');
  const html = detalleCaso(c01);
  assert.match(html, /Alcance de la cifra/);
  assert.match(html, /flujo-caso/);
  const u = decodeURIComponent((html.match(/href="(https:\/\/wa\.me\/[^"]+)"/) || [])[1].split('text=')[1]);
  assert.equal(u, 'Hola ANVAR TECH. Vi el caso C-01 y tengo un proceso parecido.\n\n(ref: case-study)');
});

test('industria: la plantilla falla si falta contenido y funciona si está completa', () => {
  assert.throws(() => paginaIndustria({ slug: 'retail', nombre: 'Retail', publicada: true }), /le falta/);
  const p = paginaIndustria({
    slug: 'retail', nombre: 'Retail', publicada: true, titulo: 'T', descripcion: 'D', h1: 'H1 retail', lead: 'Lead',
    problemas: [1, 2, 3].map((n) => ({ titulo: `P${n}`, texto: 'x', servicio: 'express' })),
    casos: ['documentos-legales'],
  });
  fijarPagina({ ruta: p.ruta, fuente: p.fuente });
  const html = p.cuerpo();
  assert.equal(p.ruta, '/industrias/retail');
  assert.match(html, /H1 retail/);
  assert.match(html, /C-01/);
  assert.ok(SERVICIOS.express);
});
