// @ts-check
// Componentes: testimonios, calculadora, industria, evaluación y cabecera.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SITIO, CALCULADORA } from '../src/config.mjs';
import { SERVICIOS } from '../src/datos/oferta.mjs';
import { testimonios, detalleCaso, precio } from '../src/componentes/secciones.mjs';
import { calculadora, calcularRoi, opcionesInversion, herramientas } from '../src/componentes/herramientas.mjs';
import { pesos } from '../src/calculo.mjs';
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

test('calculadora: el ejemplo abre con Automatización Express y resultados completos, sin depender de la UF', () => {
  const r = calcularRoi(CALCULADORA.defecto);
  const html = calculadora({ compartir: true, formulas: '#como-se-calcula' });
  assert.match(html, /name="c-inv" value="express" checked data-defecto="1"/, 'Express seleccionado en el HTML');
  assert.equal(r.inversion, SERVICIOS.express.precio.valor, 'precio de la fuente única');
  assert.ok(html.includes(`id="c-inv">${pesos(SERVICIOS.express.precio.valor)}<`), 'inversión inicial');
  for (const id of ['c-neto1', 'c-payback', 'c-roi1', 'c-roi3']) assert.doesNotMatch(html, new RegExp(`id="${id}">—<`), `${id} completo`);
  assert.ok(html.includes(`id="c-valor">${pesos(r.ahorroBruto)}<`), 'ahorro bruto');
  assert.match(html, /id="c-piloto-d">desde UF 40 \+ IVA</, 'el piloto sigue, solo con su precio en UF');
  assert.match(html, /id="c-inv-nota" role="status" hidden>/, 'aviso del piloto sin UF, oculto de partida');
  assert.doesNotMatch(html, /UF de referencia|41\.000|24\/09\/2026|≈\s*\$|1\.640\.000|335%/);
  assert.match(html, /href="#como-se-calcula">Cómo calculamos esto/);
  assert.match(html, /Estimación referencial basada en los valores ingresados/);
  assert.doesNotMatch(html, /Infinity|NaN|vas a ahorrar/);
});

test('calculadora: Express, piloto con UF de hoy, piloto sin UF y otro monto', () => {
  const d = CALCULADORA.defecto;
  // Express: precio en pesos, siempre disponible.
  const ex = calcularRoi({ ...d, inversion: 'express' });
  assert.equal(ex.inversion, SERVICIOS.express.precio.valor);
  assert.equal(ex.estado, 'ok');
  // Piloto con la UF de hoy: UF 40 × valor, redondeado al peso.
  const conUf = calcularRoi({ ...d, inversion: 'piloto' }, 41016.28);
  assert.equal(conUf.inversion, 1_640_651);
  assert.equal(opcionesInversion(41016.28).piloto.monto, 1_640_651);
  assert.equal(conUf.estado, 'ok');
  assert.ok(/** @type {number} */ (conUf.paybackMeses) > 2.7 && /** @type {number} */ (conUf.paybackMeses) < 2.8);
  // Piloto sin UF: sin monto; el ahorro sigue, payback y ROI no se inventan.
  for (const sinUf of [null, undefined, Number.NaN, 0]) {
    const r = calcularRoi({ ...d, inversion: 'piloto' }, /** @type {any} */ (sinUf));
    assert.equal(r.estado, 'sin-monto', `UF ${sinUf}`);
    assert.equal(r.inversion, null);
    assert.equal(r.paybackMeses, null);
    assert.equal(r.ahorroBruto, ex.ahorroBruto);
  }
  assert.equal(opcionesInversion().piloto.monto, null);
  // Otro monto.
  assert.equal(calcularRoi({ ...d, inversion: 'otro', monto: 500000 }).inversion, 500000);
});

test('portada: herramientas como tarjetas con enlace a su página, sin la experiencia completa', () => {
  const html = herramientas();
  assert.match(html, /href="\/calculadora-roi-automatizacion" data-track="home_roi_tool_click"/);
  assert.match(html, /href="\/diagnostico-automatizacion" data-track="home_diagnostic_tool_click"/);
  assert.doesNotMatch(html, /id="c-personas"|id="diag-cuerpo"/);
  assert.match(html, /id="calculadora"/, 'se mantiene el ancla para enlaces antiguos');
  assert.match(html, /id="autodiagnostico"/);
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

test('cabecera y contacto: el texto extraído es natural ("ANVAR TECH · IA & Automatización", "Correo: …")', () => {
  const cuerpo = `<h1>x</h1>${evaluar({ contexto: 'general' })}`;
  const html = documento({ ruta: '/x', titulo: 't', descripcion: 'd', cuerpo, fuente: 'home', hashes: { css: '1', js: '1' }, cliente: {} });
  const txt = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');
  assert.doesNotMatch(txt, /ANVAR TECHIA/);
  assert.match(txt, /ANVAR TECH · IA &amp; Automatización/);
  assert.match(txt, /Correo: contacto@anvartech\.cl/);
  assert.doesNotMatch(txt, /Correocontacto/);
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

test('casos con video: miniatura → reproducir, con WebM, MP4, subtítulos y poster diferido', () => {
  const c = { ...CASOS[0], media: { principal: { tipo: 'video', src: '/casos/x.mp4', webm: '/casos/x.webm', subtitulos: '/casos/x.vtt', poster: '/casos/x.webp', alt: 'Demo', ancho: 1280, alto: 720, duracion: '0:24' } } };
  fijarPagina({ ruta: '/casos', fuente: 'case-study' });
  const html = detalleCaso(/** @type {any} */ (c));
  assert.match(html, /<a class="video-miniatura" href="\/casos\/x\.mp4" data-video=/, 'sin JavaScript abre el MP4');
  assert.match(html, /<img src="\/casos\/x\.webp" alt="Demo" width="1280" height="720" loading="lazy"/);
  assert.doesNotMatch(html, /<video/, 'no se crea el reproductor hasta el clic');
  const datos = JSON.parse(html.match(/data-video="([^"]+)"/)[1].replace(/&quot;/g, '"'));
  assert.deepEqual(datos.fuentes.map((f) => f.tipo), ['video/webm', 'video/mp4']);
  assert.equal(datos.subtitulos, '/casos/x.vtt');
  assert.match(html, /Ver video <span class="medio-dur">\(0:24\)<\/span>/);
});
