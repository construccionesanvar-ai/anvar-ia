// @ts-check
// Fuentes únicas: precios, casos, WhatsApp, testimonios e industrias.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SITIO } from '../src/config.mjs';
import { SERVICIOS } from '../src/datos/oferta.mjs';
import { CASOS, METRICAS } from '../src/datos/casos.mjs';
import { MENSAJES, urlWsp, wsp, conRef, mensajeCaso, FUENTES } from '../src/datos/whatsapp.mjs';
import { TESTIMONIOS, publicables } from '../src/datos/testimonios.mjs';
import { INDUSTRIAS, faltantes } from '../src/datos/industrias.mjs';
import { PROPIEDAD } from '../src/datos/contenido.mjs';
import { FAQ } from '../src/datos/faq.mjs';
import { precioTexto, notaUf, ufVigente } from '../src/html.mjs';

test('cada servicio tiene los campos comerciales completos', () => {
  for (const [clave, s] of Object.entries(SERVICIOS)) {
    assert.equal(s.id, clave, `id de ${clave}`);
    assert.ok(['UF', 'CLP'].includes(s.precio.moneda), `moneda de ${clave}`);
    assert.ok(s.precio.valor > 0, `valor de ${clave}`);
    assert.ok(['mas', 'incluido'].includes(s.precio.iva), `IVA de ${clave}`);
    assert.ok(s.resumen && s.plazo && s.plazoCorto, `textos de ${clave}`);
    assert.ok(s.url.startsWith('/'), `url de ${clave}`);
    assert.ok(s.cta && MENSAJES[s.cta.wsp], `cta de ${clave} apunta a un mensaje que existe`);
    assert.ok(s.incluye.length > 0, `incluye de ${clave}`);
  }
});

test('precio en UF: equivalencia en pesos solo mientras la UF de referencia esté vigente', () => {
  const p = SERVICIOS.diagnostico.precio;
  const base = new Date(SITIO.uf.fecha + 'T12:00:00-03:00');
  const vigente = precioTexto(p, { hoy: base });
  assert.equal(vigente.principal, 'UF 12');
  assert.match(vigente.detalle, /^≈ \$[\d.]+ \+ IVA$/);
  assert.equal(vigente.clp, 12 * SITIO.uf.valor);

  const vieja = new Date(base.getTime() + (SITIO.uf.vigenciaDias + 1) * 86_400_000);
  assert.equal(ufVigente(vieja), false);
  const sinPesos = precioTexto(p, { hoy: vieja });
  assert.equal(sinPesos.detalle, '+ IVA');
  assert.equal(sinPesos.clp, null);
  assert.match(notaUf({ hoy: vieja }), /UF del día de la factura/);
  assert.match(notaUf({ hoy: base }), /al \d{2}\/\d{2}\/\d{4}/);
});

test('precio en pesos: desde, IVA y periodo', () => {
  assert.deepEqual(precioTexto(SERVICIOS.express.precio), { principal: 'desde $199.900', detalle: '+ IVA', clp: 199900 });
  assert.equal(precioTexto(SERVICIOS.acompanamiento.precio).principal, '$89.000 / mes');
  assert.equal(precioTexto(SERVICIOS.sesion.precio).detalle, 'IVA incluido');
  assert.equal(precioTexto(SERVICIOS.intelligence.precio).principal, 'desde UF 6 / mes');
});

test('WhatsApp: UTF-8, saltos de línea y origen del lead', () => {
  const u = urlWsp('Hola ¿qué tal? Año\n\nñ');
  assert.ok(u.startsWith(`https://wa.me/${SITIO.contacto.whatsapp}?text=`));
  assert.equal(decodeURIComponent(u.split('text=')[1]), 'Hola ¿qué tal? Año\n\nñ');
  assert.ok(u.includes('%0A%0A'), 'los saltos van codificados');
  assert.equal(conRef('Hola', 'express'), 'Hola\n\n(ref: express)');
  assert.equal(decodeURIComponent(wsp('express', FUENTES.express).split('text=')[1]), MENSAJES.express + '\n\n(ref: express)');
  assert.equal(decodeURIComponent(wsp('no-existe').split('text=')[1]), MENSAJES.general, 'clave desconocida cae al mensaje general');
  assert.equal(mensajeCaso('C-01'), 'Hola ANVAR TECH. Vi el caso C-01 y tengo un proceso parecido.');
  for (const [k, m] of Object.entries(MENSAJES)) assert.ok(m.startsWith('Hola ANVAR TECH.'), `mensaje ${k}`);
  for (const f of Object.values(FUENTES)) assert.match(f, /^[a-z-]+$/);
});

test('casos: ids únicos, métricas de portada válidas y alcance de las cifras', () => {
  assert.equal(new Set(CASOS.map((c) => c.id)).size, CASOS.length);
  assert.equal(new Set(CASOS.map((c) => c.codigo)).size, CASOS.length);
  for (const m of METRICAS) assert.ok(CASOS.find((c) => c.id === m.caso)?.metricas[m.metrica], `${m.caso} #${m.metrica}`);
  for (const c of CASOS) {
    assert.ok(c.flujo.length >= 3, `${c.codigo} tiene flujo`);
    assert.ok(SERVICIOS[c.servicio], `${c.codigo} apunta a un servicio que existe`);
    assert.ok(c.tecnologias.length, `${c.codigo} tiene tecnologías`);
  }
  const c01 = CASOS.find((c) => c.codigo === 'C-01');
  assert.match(c01?.disclaimer ?? '', /una boleta real/);
  assert.match(c01?.disclaimer ?? '', /no una tasa de precisión/);
  const c03 = CASOS.find((c) => c.codigo === 'C-03');
  assert.match(c03?.disclaimer ?? '', /no un ahorro/);
  assert.equal(c03?.etiqueta, 'confidencial');
});

test('propiedad intelectual: una sola política en todas las FAQ', () => {
  const respuestas = Object.values(FAQ).flat().filter((p) => /(se queda|código|automatización\?)/i.test(p.q) && /Quién/.test(p.q));
  assert.ok(respuestas.length >= 3);
  for (const p of respuestas) assert.ok(p.a.includes(PROPIEDAD.completa), `"${p.q}" usa la política única`);
  assert.doesNotMatch(PROPIEDAD.completa, /siempre/);
});

test('testimonios: sin autorización no se publica ninguno', () => {
  assert.deepEqual(TESTIMONIOS, [], 'hoy no hay testimonios reales');
  const lista = [
    { frase: 'x', nombre: 'A', cargo: 'B', empresa: 'C', industria: 'D', confidencial: false, autorizado: null },
    { frase: 'y', nombre: 'A', cargo: 'B', empresa: 'C', industria: 'D', confidencial: false, autorizado: { fecha: '2026-10-01', medio: 'correo' } },
  ];
  assert.equal(publicables(lista).length, 1);
});

test('industrias: ninguna publicada sin contenido suficiente', () => {
  for (const i of INDUSTRIAS) {
    if (i.publicada) assert.deepEqual(faltantes(i, CASOS), [], `${i.slug} publicada con faltantes`);
  }
  assert.ok(faltantes({ slug: 'x', nombre: 'X', publicada: true }, CASOS).length >= 4);
});
