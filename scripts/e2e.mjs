// @ts-check
// Pruebas de punta a punta con Playwright (Chromium), contra el servidor local.
//   npm run e2e
// Requiere Playwright instalado (npm i -D playwright && npx playwright install chromium).
// Revisa los flujos críticos, que ninguna página se desborde de 320 a 1440 px,
// y que no haya errores en la consola. Deja capturas en .e2e/ para revisar a ojo.
import { mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

import { iniciar } from './servidor.mjs';
import { PAGINAS } from './build.mjs';
import { calcularRoi, puntoPedido, PP_DEFECTO } from '../src/componentes/herramientas.mjs';
import { roi, pesos as pesosK, textoPayback, porcentaje } from '../src/calculo.mjs';
import { SOLUCIONES } from '../src/datos/soluciones.mjs';
import { SITIO, CALCULADORA } from '../src/config.mjs';
import { SERVICIOS } from '../src/datos/oferta.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAPTURAS = join(RAIZ, '.e2e');
const ANCHOS = [320, 375, 390, 430, 768, 1024, 1440];

async function cargarPlaywright() {
  // @ts-ignore -- Playwright es opcional: si no está en el proyecto se busca el global.
  try { return await import('playwright'); } catch { /* sigue */ }
  try {
    const global = execSync('npm root -g', { encoding: 'utf8' }).trim();
    return createRequire(join(global, 'noop.js'))('playwright');
  } catch {
    console.error('Falta Playwright. Instálalo con: npm i -D playwright && npx playwright install chromium');
    process.exit(2);
  }
}

const { chromium } = await cargarPlaywright();
const { servidor, puerto } = await iniciar({ puerto: 0, silencioso: true });
const BASE = `http://127.0.0.1:${puerto}`;
const navegador = await chromium.launch();
mkdirSync(CAPTURAS, { recursive: true });

/** @type {string[]} */ const fallas = [];
/** @type {string[]} */ const erroresConsola = [];
let ok = 0;

/** Contexto con la analítica interceptada y WhatsApp/servicios externos simulados. */
async function contexto(ancho = 1280, alto = 900) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: alto }, locale: 'es-CL' });
  await ctx.addInitScript(() => {
    // @ts-ignore
    window.__eventos = [];
    // @ts-ignore
    window.va = (tipo, e) => { if (tipo === 'event') window.__eventos.push(e); };
  });
  await ctx.route('https://wa.me/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>wa</title>' }));
  await ctx.route('**/api/diagnostico', (r) => r.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  // Sin salida a internet en las pruebas: la UF "falla" salvo en la prueba que la simula.
  await ctx.route('**/api/uf', (r) => r.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  return ctx;
}

async function pagina(ctx, ruta) {
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') erroresConsola.push(`${ruta}: [${m.type()}] ${m.text()}`); });
  p.on('pageerror', (e) => erroresConsola.push(`${ruta}: ${e.message}`));
  const r = await p.goto(BASE + ruta, { waitUntil: 'load' });
  return { p, status: r ? r.status() : 0 };
}

const eventos = (p) => p.evaluate(() => /** @type {any} */ (window).__eventos.map((e) => e.name));
const evento = (p, nombre) => p.evaluate((n) => /** @type {any} */ (window).__eventos.find((e) => e.name === n)?.data ?? null, nombre);
const miles = (n) => new Intl.NumberFormat('es-CL').format(n);
// Fuentes primarias que el contenido cita a propósito (documentación oficial y ley).
const EXTERNOS_PERMITIDOS = /^https:\/\/(anvartech\.cl|ia\.anvartech\.cl|learn\.microsoft\.com|www\.bcn\.cl|modelcontextprotocol\.io)(\/|$)/;
const hrefWsp = (href) => decodeURIComponent(String(href).split('text=')[1] || '');

async function prueba(nombre, fn) {
  try { await fn(); ok++; console.log(`  ✓ ${nombre}`); } catch (e) { fallas.push(`${nombre}: ${e instanceof Error ? e.message : e}`); console.log(`  ✗ ${nombre}\n      ${e instanceof Error ? e.message : e}`); }
}
function exigir(cond, msg) { if (!cond) throw new Error(msg); }

const rutas = PAGINAS.filter((x) => !x.noindex).map((x) => x.ruta);

console.log(`E2E contra ${BASE}\n`);

// ---------------------------------------------------------------- flujos
await prueba('Inicio → "Evaluar mi proceso" lleva al bloque de evaluación', async () => {
  const ctx = await contexto();
  const { p } = await pagina(ctx, '/');
  await p.locator('.hero-cta a', { hasText: 'Evaluar mi proceso' }).click();
  await p.waitForFunction(() => location.hash === '#evaluar');
  exigir(await p.locator('#evaluar').isVisible(), 'no se ve #evaluar');
  exigir((await eventos(p)).includes('hero_cta_click'), 'no midió hero_cta_click');
  exigir(await p.locator('#evaluar', { hasText: 'Coordinar evaluación por WhatsApp' }).count() === 1, 'sin agenda, el CTA debe decir "Coordinar evaluación por WhatsApp"');
  await ctx.close();
});

await prueba('Inicio → Automatización Express', async () => {
  const ctx = await contexto();
  const { p } = await pagina(ctx, '/');
  await p.locator('#contratar a', { hasText: 'Ver Automatización Express' }).click();
  await p.waitForURL('**/automatizacion-express');
  exigir((await p.locator('h1').textContent() || '').includes('proceso repetitivo'), 'h1 inesperado');
  exigir(await p.locator('text=No incluye').count() > 0, 'la Express no muestra qué no incluye');
  exigir(await p.locator('text=no es el precio de cualquier automatización').count() > 0, 'falta aclarar que el precio es el piso');
  await ctx.close();
});

await prueba('Autodiagnóstico → resultado → WhatsApp con el resultado y ref: diagnostic', async () => {
  const ctx = await contexto(390, 844);
  const { p } = await pagina(ctx, '/diagnostico-automatizacion');
  for (let i = 0; i < 7; i++) await p.locator('#diag-cuerpo .opcion').nth(i === 0 ? 0 : 2).click();
  await p.locator('#diag-resultado').waitFor();
  const a = p.locator('#diag-resultado a', { hasText: 'Conversar este resultado por WhatsApp' });
  const msg = hrefWsp(await a.getAttribute('href'));
  exigir(/^Hola ANVAR TECH\. Hice el autodiagnóstico/.test(msg), 'saludo del mensaje: ' + msg.slice(0, 60));
  exigir(/Resultado: \d+\/100 \(/.test(msg), 'sin puntaje');
  exigir(msg.includes('Principal oportunidad: documentos y formularios'), 'sin oportunidad');
  exigir(msg.includes('Tiempo en tareas repetidas: Entre 4 y 8 horas por persona'), 'sin respuesta de tiempo');
  exigir(msg.includes('Primer paso sugerido: '), 'sin primer paso');
  exigir(msg.trim().endsWith('(ref: diagnostic)'), 'sin ref: diagnostic');
  const oport = await p.locator('#diag-resultado .oportunidades li').count();
  exigir(oport >= 1 && oport <= 3, `oportunidades: ${oport} (debe haber de 1 a 3)`);
  exigir(await p.locator('#diag-resultado .oportunidades a[href="/automatizacion-documental"]').count() === 1, 'la oportunidad no enlaza a la guía de su categoría');
  exigir(!/@|\+56/.test(msg), 'el mensaje no debe incluir datos personales');
  const popup = ctx.waitForEvent('page');
  await a.click();
  await (await popup).close();
  const ev = await eventos(p);
  exigir(ev.filter((x) => x === 'diagnostic_start').length === 1, 'diagnostic_start ≠ 1');
  exigir(ev.filter((x) => x === 'diagnostic_complete').length === 1, 'diagnostic_complete ≠ 1');
  exigir(ev.filter((x) => x === 'diagnostic_lead').length === 1, 'el clic a WhatsApp debe medirse UNA vez como diagnostic_lead: ' + ev.join(','));
  exigir(!ev.includes('whatsapp_lead') && !ev.includes('diagnostic_whatsapp_click'), 'el clic generó eventos duplicados: ' + ev.join(','));
  exigir(ev.includes('diagnostic_view'), 'sin diagnostic_view');
  const lead = await evento(p, 'diagnostic_lead');
  exigir(lead && lead.landing === '/diagnostico-automatizacion' && lead.canal === 'directo' && lead.via === 'whatsapp', 'diagnostic_lead sin atribución: ' + JSON.stringify(lead));
  // Volver y reiniciar no duplican eventos
  await p.locator('#diag-volver').click();
  await p.locator('#diag-cuerpo .opcion').nth(1).click();
  const ev2 = await eventos(p);
  exigir(ev2.filter((x) => x === 'diagnostic_complete').length === 1, 'diagnostic_complete se duplicó');
  await ctx.close();
});

await prueba('Calculadora de ROI: mismo cálculo que el módulo único, inversión editable y casos límite', async () => {
  const ctx = await contexto();
  const { p } = await pagina(ctx, '/calculadora-roi-automatizacion');
  const fijar = async (v) => p.evaluate((v) => {
    for (const [id, val] of Object.entries(v)) {
      const el = /** @type {HTMLInputElement} */ (document.getElementById(id));
      el.value = String(val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, v);
  const elegir = async (valor) => { await p.locator(`input[name="c-inv"][value="${valor}"]`).check(); };
  const leer = async (id) => (await p.locator('#' + id).textContent()) || '';
  // Con la UF de referencia (la API está caída en la prueba), el piloto usa ese valor.
  const esperado = (e, inversion, mensual = 0) => roi({ personas: e.personas, horasSemana: e.horas, costoHora: e.costo, pctAutomatizable: e.auto, inversion, costoMensual: mensual, semanas: CALCULADORA.semanas });
  for (const caso of [{ personas: 12, horas: 9, costo: 11500, auto: 45 }, { personas: 1, horas: 1, costo: 3000, auto: 5 }, { personas: 50, horas: 25, costo: 40000, auto: 100 }]) {
    await fijar({ 'c-personas': caso.personas, 'c-horas': caso.horas, 'c-costo': caso.costo, 'c-auto': caso.auto });
    const r = esperado(caso, SERVICIOS.piloto.precio.valor * SITIO.uf.valor);
    exigir(await leer('c-valor') === pesosK(r.ahorroBruto), `ahorro ${await leer('c-valor')} ≠ ${pesosK(r.ahorroBruto)}`);
    exigir(await leer('c-payback') === textoPayback(r), `payback ${await leer('c-payback')} ≠ ${textoPayback(r)}`);
    exigir(await leer('c-roi3') === porcentaje(r.roi3), 'ROI 3 años distinto');
  }
  exigir(await leer('c-estado') === 'Tu estimación', 'no marcó la estimación como propia');
  // Express, otro monto y costo mensual
  const e = { personas: 5, horas: 6, costo: 9000, auto: 60 };
  await fijar({ 'c-personas': 5, 'c-horas': 6, 'c-costo': 9000, 'c-auto': 60 });
  await elegir('express');
  exigir(await leer('c-inv') === pesosK(SERVICIOS.express.precio.valor), 'inversión Express');
  await p.fill('#c-monto', '3000000');
  exigir(await p.locator('input[name="c-inv"][value="otro"]').isChecked(), 'escribir un monto no eligió "Otro monto"');
  await p.fill('#c-mensual', '150000');
  await p.locator('#c-mensual').blur();
  const r2 = esperado(e, 3000000, 150000);
  exigir(await leer('c-neto1') === pesosK(r2.ahorroNetoAno1) && await leer('c-payback') === textoPayback(r2), `otro monto/mensual: ${await leer('c-neto1')} · ${await leer('c-payback')}`);
  exigir(await p.locator('#c-mensual').inputValue() === '150.000', 'el monto no se formateó con miles');
  // Casos límite: sin recuperación y sin inversión, sin Infinity ni NaN
  await p.fill('#c-mensual', '900000'); await p.locator('#c-mensual').blur();
  exigir(await leer('c-payback') === 'Sin recuperación', 'mantención alta: ' + await leer('c-payback'));
  await p.fill('#c-mensual', '0'); await p.fill('#c-monto', ''); await p.locator('#c-monto').blur();
  exigir(await leer('c-payback') === 'No aplica' && await leer('c-roi1') === 'No aplica', 'inversión 0: ' + await leer('c-payback'));
  const todo = (await p.locator('.calc-resultado').textContent()) || '';
  exigir(!/Infinity|NaN|−0\b|-0\b/.test(todo), 'aparece Infinity, NaN o -0: ' + todo.slice(0, 120));
  // Reinicio
  await p.locator('#c-reiniciar').click();
  exigir(await leer('c-estado') === 'Ejemplo ilustrativo', 'reinicio no volvió al ejemplo');
  exigir(await leer('c-valor') === pesosK(calcularRoi(CALCULADORA.defecto).ahorroBruto), 'reinicio no restauró valores');
  exigir(await p.locator('input[name="c-inv"][value="piloto"]').isChecked(), 'reinicio no restauró la inversión');
  const ev = await eventos(p);
  exigir(ev.filter((x) => x === 'calculator_start').length === 1 && ev.filter((x) => x === 'calculator_complete').length === 1, 'eventos de calculadora duplicados o faltantes: ' + ev.join(','));
  exigir(ev.includes('calculator_view'), 'sin calculator_view');
  exigir((await evento(p, 'calculator_complete'))?.herramienta === 'roi', 'calculator_complete sin herramienta');
  exigir(await p.locator('text=Estimación referencial basada en los valores ingresados').count() === 1, 'falta el aviso de estimación');
  await ctx.close();
});

await prueba('Portada: herramientas en tarjetas, sin la experiencia completa ni su JavaScript', async () => {
  const ctx = await contexto();
  const { p } = await pagina(ctx, '/');
  exigir(await p.locator('#c-personas, #diag-cuerpo').count() === 0, 'la portada todavía trae una herramienta completa');
  exigir(await p.locator('script[src^="/herramientas.js"], script[src^="/calculo.js"]').count() === 0, 'la portada carga JS de herramientas');
  await p.evaluate(() => document.addEventListener('click', (e) => e.preventDefault()));
  await p.locator('#herramientas a', { hasText: 'Calcular ROI' }).click();
  await p.locator('#herramientas a', { hasText: 'Hacer diagnóstico' }).click();
  const ev = await eventos(p);
  exigir(ev.includes('home_roi_tool_click') && ev.includes('home_diagnostic_tool_click'), 'no midió las tarjetas: ' + ev.join(','));
  exigir(await p.locator('#calculadora, #autodiagnostico').count() === 2, 'se perdieron las anclas antiguas');
  await ctx.close();
});

await prueba('UF del día: /api/uf pone los pesos con su fecha; si falla no se muestra un valor viejo', async () => {
  const ctx = await contexto();
  await ctx.route('**/api/uf', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valor: 40000, fecha: '2026-09-25', fuente: 'prueba' }) }));
  const { p } = await pagina(ctx, '/diagnostico-ia-empresas');
  await p.waitForFunction(() => /480\.000/.test(document.querySelector('[data-uf="12"]')?.textContent || ''), null, { timeout: 8000 });
  exigir(/UF del 25\/09\/2026/.test(await p.locator('[data-uf-nota]').first().textContent() || ''), 'la nota no muestra la fecha del día');
  await ctx.close();
  const ctx2 = await contexto();
  await ctx2.route('**/api/uf', (r) => r.fulfill({ status: 503, body: '{}' }));
  const { p: p2 } = await pagina(ctx2, '/diagnostico-ia-empresas');
  await p2.waitForFunction(() => /no disponible/.test(document.querySelector('[data-uf-nota]')?.textContent || ''), null, { timeout: 8000 });
  const txt = await p2.locator('[data-uf="12"]').first().textContent() || '';
  exigir(txt === '+ IVA', 'tras el fallo debe quedar solo "+ IVA": ' + txt);
  exigir(!/41\.000|≈/.test(await p2.locator('main').textContent() || ''), 'se muestra una equivalencia vieja');
  await ctx2.close();
  // En el HTML (sin JavaScript) no hay pesos derivados de la UF.
  exigir(!readFileSync(join(RAIZ, 'public', 'diagnostico-ia-empresas.html'), 'utf8').includes('≈'), 'el HTML trae una equivalencia en pesos fija');
});

await prueba('Formulario: errores accesibles, envío, y respaldo por WhatsApp si falla', async () => {
  const ctx = await contexto(375, 812);
  let respuesta = 200;
  await ctx.route('**/api/contacto', (r) => r.fulfill({ status: respuesta, contentType: 'application/json', body: respuesta === 200 ? '{"ok":true}' : '{"error":"x"}' }));
  const { p } = await pagina(ctx, '/automatizacion-express');
  await p.locator('#form-enviar').click();
  exigir((await p.locator('#f-nombre').getAttribute('aria-invalid')) === 'true', 'nombre vacío no quedó marcado');
  exigir(await p.locator('#f-nombre-err').isVisible(), 'no se ve el error del nombre');
  exigir(await p.evaluate(() => document.activeElement?.id) === 'f-nombre', 'el foco no fue al primer error');
  await p.fill('#f-nombre', 'Ana Soto');
  await p.fill('#f-contacto', 'no-es-contacto');
  await p.locator('#form-enviar').click();
  exigir(await p.locator('#f-contacto-err').isVisible(), 'contacto inválido no se marcó');
  await p.fill('#f-contacto', '+56 9 1234 5678');
  await p.fill('#f-mensaje', 'Informe semanal desde tres planillas');
  await p.locator('#form-enviar').click();
  await p.locator('#form-msg.ok').waitFor({ timeout: 5000 });
  let ev = await eventos(p);
  exigir(ev.includes('form_start') && ev.includes('service_lead'), 'faltan eventos del formulario: ' + ev.join(','));
  const sl = await evento(p, 'service_lead');
  exigir(sl && sl.landing === '/automatizacion-express' && sl.canal && sl.campana, 'service_lead sin atribución: ' + JSON.stringify(sl));
  exigir(!JSON.stringify(sl).includes('Ana') && !JSON.stringify(sl).includes('5678'), 'service_lead con datos personales');
  exigir(ev.filter((x) => x === 'form_start').length === 1, 'form_start duplicado');
  // Falla del servidor → respaldo
  respuesta = 503;
  await p.fill('#f-nombre', 'Ana Soto');
  await p.fill('#f-contacto', 'ana@acme.cl');
  await p.locator('#form-enviar').click();
  const alt = p.locator('#form-msg a', { hasText: 'Envíalo por WhatsApp' });
  await alt.waitFor({ timeout: 5000 });
  const m = hrefWsp(await alt.getAttribute('href'));
  exigir(m.includes('Nombre: Ana Soto') && m.trim().endsWith('(ref: express)'), 'respaldo sin datos o sin ref: ' + m);
  exigir(await p.locator('#form-contacto a[href="/privacidad"]').count() === 1, 'sin aviso de privacidad');
  ev = await eventos(p);
  exigir(ev.includes('form_error'), 'no midió form_error');
  await ctx.close();
});

await prueba('Formularios: validación, carga, doble clic, error, reintento, red caída y honeypot', async () => {
  const antes = erroresConsola.length;
  const ctx = await contexto(390, 844);
  let respuesta = 200, envios = 0, espera = 0;
  await ctx.route('**/api/contacto', async (r) => {
    envios++;
    if (respuesta === -1) return r.abort('failed');
    if (espera) await new Promise((ok) => setTimeout(ok, espera));
    await r.fulfill({ status: respuesta, contentType: 'application/json', body: respuesta === 200 ? '{"ok":true}' : '{"error":"Falta tu nombre."}' });
  });
  const { p } = await pagina(ctx, '/automatizacion-express');
  const err = async (id) => p.locator(`#f-${id}-err`).isVisible();
  // Contacto vacío: se marca solo ese campo.
  await p.fill('#f-nombre', 'Ana Soto');
  await p.locator('#form-enviar').click();
  exigir(await err('contacto') && !(await err('nombre')), 'contacto vacío mal validado');
  // Correo y teléfono, válidos e inválidos. Con el nombre vacío la app valida
  // ambos campos y no envía nada: así se prueba la validación real, sin envíos.
  await p.fill('#f-nombre', '');
  for (const [valor, valido] of [['ana@', false], ['ana@acme', false], ['ana@acme.cl', true], ['1234', false], ['+56 9 12', false], ['+56 9 1234 5678', true], ['912345678', true]]) {
    await p.fill('#f-contacto', /** @type {string} */ (valor));
    await p.locator('#form-enviar').click();
    exigir((await err('contacto')) === !valido, `validación de "${valor}": ${valido ? 'rechazó uno válido' : 'aceptó uno inválido'}`);
  }
  exigir(envios === 0, 'se envió con el nombre vacío');
  await p.fill('#f-nombre', 'Ana Soto');
  // Carga + doble clic: un solo envío, botón ocupado mientras tanto.
  espera = 700;
  await p.fill('#f-contacto', 'ana@acme.cl');
  await p.locator('#form-enviar').dblclick();
  await p.locator('#form-enviar').click({ force: true }).catch(() => {});
  exigir(await p.locator('#form-contacto[aria-busy="true"]').count() === 1, 'no quedó en estado de carga');
  exigir(await p.locator('#form-enviar').isDisabled(), 'el botón no se desactivó durante el envío');
  exigir(((await p.locator('#form-enviar').textContent()) || '').includes('Enviando'), 'el botón no dice "Enviando…"');
  await p.locator('#form-msg.ok').waitFor({ timeout: 5000 });
  exigir(envios === 1, `doble clic envió ${envios} veces`);
  exigir(!(await p.locator('#form-enviar').isDisabled()), 'el botón quedó desactivado después del éxito');
  // Éxito: el formulario queda limpio; enviar de nuevo sin datos no manda nada.
  await p.locator('#form-enviar').click();
  exigir(envios === 1 && await err('nombre'), 'reenvío accidental después del éxito');
  // Error del servidor → alternativa por WhatsApp; se puede reintentar y funciona.
  espera = 0; respuesta = 500;
  await p.fill('#f-nombre', 'Ana Soto'); await p.fill('#f-contacto', 'ana@acme.cl');
  await p.locator('#form-enviar').click();
  await p.locator('#form-msg a', { hasText: 'Envíalo por WhatsApp' }).waitFor({ timeout: 5000 });
  exigir(!(await p.locator('#form-enviar').isDisabled()), 'tras el error no se puede reintentar');
  respuesta = 200;
  await p.locator('#form-enviar').click();
  await p.locator('#form-msg.ok').waitFor({ timeout: 5000 });
  exigir(envios === 3, `reintento: ${envios} envíos (esperaba 3)`);
  // Red caída (sin respuesta) → alternativa, sin quedar colgado.
  respuesta = -1;
  await p.fill('#f-nombre', 'Ana Soto'); await p.fill('#f-contacto', '+56 9 1234 5678');
  await p.locator('#form-enviar').click();
  await p.locator('#form-msg a', { hasText: 'Envíalo por WhatsApp' }).waitFor({ timeout: 5000 });
  const ev = await eventos(p);
  exigir(ev.filter((x) => x === 'service_lead').length === 2, 'service_lead debe contarse una vez por envío exitoso: ' + ev.join(','));
  exigir(ev.filter((x) => x === 'form_error').length === 2, 'form_error por cada falla: ' + ev.join(','));
  // Honeypot: fuera de la vista, del teclado y del árbol accesible; sin etiqueta visible.
  const box = await p.locator('#f-web').boundingBox();
  exigir(!box || box.x + box.width <= 0, 'el honeypot se ve');
  const arbol = await p.locator('#form-contacto').ariaSnapshot();
  exigir((arbol.match(/textbox/g) || []).length === 4, 'el árbol accesible tiene campos de más:\n' + arbol);
  exigir(!/no complet|web/i.test(arbol), 'el honeypot se anuncia');
  await p.locator('#f-nombre').focus();
  for (let i = 0; i < 8; i++) {
    await p.keyboard.press('Tab');
    exigir(await p.evaluate(() => document.activeElement?.id) !== 'f-web', 'el honeypot se alcanza con Tab');
  }
  await ctx.close();
  // El 500 y la red caída de esta prueba son simulados: sus avisos en consola no cuentan.
  const propios = erroresConsola.splice(antes).filter((e) => !/status of 500|ERR_FAILED/.test(e));
  erroresConsola.push(...propios);
});

await prueba('Contacto según la página: completo en comerciales, plegado en editoriales y herramientas', async () => {
  const ctx = await contexto(1280, 900);
  await ctx.route('**/api/contacto', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  // Editorial: WhatsApp a la vista, formulario plegado bajo "Prefiero que me contacten".
  const { p } = await pagina(ctx, '/recursos/cuanto-cuesta-automatizar-proceso-chile');
  const wspBtn = p.locator('#evaluar a[data-wsp]', { hasText: 'Conversar por WhatsApp' });
  exigir(await wspBtn.isVisible(), 'sin WhatsApp visible en la página editorial');
  exigir(!(await p.locator('#f-nombre').isVisible()), 'el formulario debería estar plegado');
  const resumen = p.locator('#evaluar details.form-desplegable > summary');
  exigir(((await resumen.textContent()) || '').includes('Prefiero que me contacten'), 'texto del desplegable');
  await resumen.click();
  exigir(await p.locator('#f-nombre').isVisible(), 'el formulario no se abrió');
  await resumen.click(); await resumen.click();
  await p.fill('#f-nombre', 'Ana Soto'); await p.fill('#f-contacto', 'ana@acme.cl');
  await p.locator('#form-enviar').click();
  await p.locator('#form-msg.ok').waitFor({ timeout: 5000 });
  const ev = await eventos(p);
  exigir(ev.filter((x) => x === 'form_open').length === 1 && ev.filter((x) => x === 'service_lead').length === 1, 'eventos del plegado: ' + ev.join(','));
  // Teclado: el desplegable se abre con Enter.
  const { p: p2 } = await pagina(ctx, '/equipo/andres-vargas');
  await p2.locator('#evaluar details > summary').focus();
  await p2.keyboard.press('Enter');
  exigir(await p2.locator('#f-nombre').isVisible(), 'Enter no abre el formulario');
  // Herramienta: CTA contextual a la vista, formulario plegado bajo "Prefiero dejar mis datos".
  const { p: p3 } = await pagina(ctx, '/calculadora-roi-automatizacion');
  exigir(await p3.locator('#evaluar a', { hasText: 'Coordinar evaluación por WhatsApp' }).isVisible(), 'la calculadora perdió su CTA');
  exigir(((await p3.locator('#evaluar summary').textContent()) || '').includes('Prefiero dejar mis datos'), 'texto del desplegable en la herramienta');
  exigir(!(await p3.locator('#f-nombre').isVisible()), 'el formulario de la calculadora debería estar plegado');
  // Comercial: formulario a la vista sin tocar nada.
  const { p: p4 } = await pagina(ctx, '/automatizacion-express');
  await p4.locator('#evaluar').scrollIntoViewIfNeeded();
  exigir(await p4.locator('#f-nombre').isVisible() && await p4.locator('#evaluar details').count() === 0, 'la página comercial debe mostrar el formulario completo');
  await ctx.close();
});

await prueba('Formulario contra la API real (sin claves → 503 → respaldo)', async () => {
  const ctx = await contexto();
  const { p } = await pagina(ctx, '/');
  await p.fill('#f-nombre', 'Prueba E2E');
  await p.fill('#f-contacto', 'prueba@example.com');
  await p.waitForTimeout(1700); // tiempo mínimo anti-bots
  await p.locator('#form-enviar').click();
  await p.locator('#form-msg a', { hasText: 'Envíalo por WhatsApp' }).waitFor({ timeout: 8000 });
  await ctx.close();
});

await prueba('Casos: CTA por caso abre WhatsApp con el código del caso', async () => {
  const ctx = await contexto();
  const { p } = await pagina(ctx, '/casos');
  const href = await p.locator('#documentos-legales a', { hasText: 'Tengo un proceso parecido' }).getAttribute('href');
  exigir(hrefWsp(href) === 'Hola ANVAR TECH. Vi el caso C-01 y tengo un proceso parecido.\n\n(ref: case-study)', 'mensaje del caso: ' + hrefWsp(href));
  exigir(await p.locator('#documentos-legales .alcance', { hasText: 'una boleta real' }).count() === 1, 'C-01 sin alcance de la cifra');
  exigir(await p.locator('#planos-autocad .alcance', { hasText: 'no un ahorro' }).count() === 1, 'C-03 sin alcance de la cifra');
  exigir(await p.locator('#testimonios').count() === 0, 'no debe haber sección de testimonios vacía');
  // Un clic = un evento: case_lead, sin case_cta_click ni whatsapp_lead extra.
  await p.evaluate(() => document.addEventListener('click', (e) => e.preventDefault()));
  await p.locator('#documentos-legales a', { hasText: 'Tengo un proceso parecido' }).click();
  const ev = await eventos(p);
  exigir(ev.filter((x) => /_lead$|case_cta_click/.test(x)).join(',') === 'case_lead', 'eventos del clic: ' + ev.join(','));
  // Métricas con espacios reales en el DOM (no solo por CSS).
  const res = (await p.locator('#documentos-legales .caso-resultado').textContent()) || '';
  exigir(/−91% de tiempo/.test(res.replace(/\s+/g, ' ')), 'resultado pegado en el DOM: ' + res);
  const met = (await p.locator('#documentos-legales .metricas-caso li').nth(1).textContent()) || '';
  exigir(/^8 documentos/.test(met.trim().replace(/\s+/g, ' ')), 'métrica pegada en el DOM: ' + met);
  await ctx.close();
});

await prueba('Menú móvil: abre, cierra con Escape y devuelve el foco', async () => {
  const ctx = await contexto(375, 812);
  const { p } = await pagina(ctx, '/');
  const btn = p.locator('.menu-btn');
  await btn.click();
  exigir((await btn.getAttribute('aria-expanded')) === 'true', 'aria-expanded no cambió');
  exigir(await p.locator('#menu a', { hasText: 'Casos' }).isVisible(), 'enlaces no visibles');
  exigir(await p.locator('#menu a', { hasText: 'Asesoría personal' }).count() === 0, 'la asesoría personal no debe competir en el menú principal');
  await p.keyboard.press('Escape');
  exigir((await btn.getAttribute('aria-expanded')) === 'false', 'Escape no cerró');
  exigir(await p.evaluate(() => document.activeElement?.classList.contains('menu-btn')), 'el foco no volvió al botón');
  await ctx.close();
});

await prueba('FAQ, pie, privacidad y 404', async () => {
  const ctx = await contexto();
  const { p } = await pagina(ctx, '/');
  // Honeypot: invisible, sin texto, fuera del orden de tabulación y oculto para lectores de pantalla.
  exigir(!/No completar/.test(await p.locator('form').first().textContent() || ''), 'el honeypot tiene texto visible para extractores');
  exigir(await p.locator('.trampa[aria-hidden="true"][inert] input[tabindex="-1"][autocomplete="off"]').count() === 1, 'honeypot sin aria-hidden/inert/tabindex');
  exigir(await p.locator('#f-web').isVisible() === false || (await p.locator('#f-web').boundingBox())?.x < 0, 'el honeypot se ve');
  exigir(/ANVAR Construcciones SpA/.test(await p.locator('footer.pie').textContent() || ''), 'el pie no dice la razón social');
  const segunda = p.locator('#preguntas details').nth(1);
  await segunda.locator('summary').click();
  exigir(await segunda.evaluate((d) => /** @type {HTMLDetailsElement} */ (d).open), 'la FAQ no abrió');
  await p.locator('footer a', { hasText: 'Política de privacidad' }).click();
  await p.waitForURL('**/privacidad');
  exigir((await p.locator('h1').textContent()) === 'Política de privacidad', 'h1 de privacidad');
  exigir(await p.locator('.legal-sec').count() >= 8, 'faltan secciones de privacidad');
  const { p: p404, status } = await pagina(ctx, '/esta-pagina-no-existe');
  exigir(status === 404, `404 respondió ${status}`);
  exigir(/no existe/.test(await p404.locator('h1').textContent() || ''), 'h1 del 404');
  await ctx.close();
});

await prueba('Asesoría personal: línea secundaria, mismo sistema, sin framing antiguo', async () => {
  const ctx = await contexto();
  const { p } = await pagina(ctx, '/asesoria-ia-personal');
  exigir(await p.locator('.aviso-linea a[href="/"]').count() === 1, 'no deriva a empresas');
  exigir(await p.locator('text=Mi especialidad parte desde operaciones').count() === 1, 'falta el enfoque desde operaciones');
  exigir(await p.locator('text=/no vengo del mundo del software/i').count() === 0, 'framing antiguo');
  exigir(await p.locator('header.cab .marca').count() === 1 && await p.locator('footer.pie').count() === 1, 'no usa cabecera/pie del sistema');
  const href = await p.locator('.hero-cta a').first().getAttribute('href');
  exigir(hrefWsp(href).endsWith('(ref: personal-advisory)'), 'CTA sin ref: personal-advisory');
  await ctx.close();
});

await prueba('Teclado: el primer Tab lleva a "Saltar al contenido"', async () => {
  const ctx = await contexto();
  const { p } = await pagina(ctx, '/');
  await p.keyboard.press('Tab');
  exigir((await p.evaluate(() => document.activeElement?.textContent)) === 'Saltar al contenido', 'primer foco inesperado');
  await ctx.close();
});

await prueba('Enlaces externos con formato correcto', async () => {
  const ctx = await contexto();
  const malos = [];
  for (const ruta of rutas) {
    const { p } = await pagina(ctx, ruta);
    const hrefs = await p.$$eval('a[href^="http"], a[href^="mailto:"]', (as) => as.map((a) => a.getAttribute('href') || ''));
    for (const h of hrefs) {
      if (h.startsWith('https://wa.me/')) { if (!h.startsWith(`https://wa.me/${SITIO.contacto.whatsapp}?text=`)) malos.push(`${ruta}: ${h.slice(0, 50)}`); }
      else if (h.startsWith('mailto:')) { if (!h.startsWith(`mailto:${SITIO.contacto.email}`)) malos.push(`${ruta}: ${h}`); }
      else if (!EXTERNOS_PERMITIDOS.test(h)) malos.push(`${ruta}: ${h}`);
    }
    await p.close();
  }
  exigir(!malos.length, malos.join(' | '));
  await ctx.close();
});


// ------------------------------------------------ adquisición orgánica
await prueba('Atribución: organic_landing_view una vez por visita, con canal UTM y sin repetir', async () => {
  const ctx = await contexto();
  const { p } = await pagina(ctx, '/recursos?utm_source=LinkedIn&utm_medium=social&utm_campaign=lanzamiento-recursos');
  const v = await evento(p, 'organic_landing_view');
  exigir(v && v.landing === '/recursos' && v.canal === 'linkedin/social' && v.campana === 'lanzamiento-recursos', 'atribución: ' + JSON.stringify(v));
  await p.goto(BASE + '/calculadora-roi-automatizacion');
  exigir(!(await eventos(p)).includes('organic_landing_view'), 'organic_landing_view se repitió en la misma visita');
  // El lead de la segunda página conserva la landing y el canal de la primera.
  await p.evaluate(() => document.querySelector('a[data-wsp]')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
  const lead = await evento(p, 'whatsapp_lead');
  exigir(lead && lead.landing === '/recursos' && lead.canal === 'linkedin/social', 'lead sin la atribución de la visita: ' + JSON.stringify(lead));
  await ctx.close();
  const ctx2 = await contexto();
  const p2 = await ctx2.newPage();
  await p2.goto(BASE + '/automatizar-excel', { referer: 'https://www.google.cl/' });
  exigir((await evento(p2, 'organic_landing_view'))?.canal === 'google/organic', 'referente de Google no se leyó como orgánico');
  await ctx2.close();
});

await prueba('Calculadora de ROI: valores desde la URL (acotados) y enlace para compartir', async () => {
  const ctx = await contexto();
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const { p } = await pagina(ctx, '/calculadora-roi-automatizacion?personas=8&horas=12&costo=15000&auto=50&inv=otro&monto=2500000&mensual=100000');
  const r = calcularRoi({ personas: 8, horas: 12, costo: 15000, auto: 50, inversion: 'otro', monto: 2500000, mensual: 100000 });
  exigir((await p.locator('#c-valor').textContent()) === pesosK(r.ahorroBruto), `valor desde URL ${await p.locator('#c-valor').textContent()} ≠ ${pesosK(r.ahorroBruto)}`);
  exigir((await p.locator('#c-neto1').textContent()) === pesosK(r.ahorroNetoAno1), 'inversión/mensual desde URL');
  exigir((await p.locator('#c-estado').textContent()) === 'Tu estimación', 'valores de la URL no se marcaron como propios');
  await p.locator('#c-compartir').click();
  await p.locator('#c-compartir-msg').filter({ hasText: /Enlace copiado|barra de direcciones/ }).waitFor({ timeout: 3000 });
  const copiado = await p.evaluate(() => navigator.clipboard.readText()).catch(() => p.evaluate(() => location.href));
  exigir(/personas=8&horas=12&costo=15000&auto=50&inv=otro&monto=2500000&mensual=100000/.test(copiado), 'enlace compartido sin valores: ' + copiado);
  const { p: p2 } = await pagina(ctx, '/calculadora-roi-automatizacion?personas=9999&horas=-4&costo=abc');
  const [pers, horas] = await p2.evaluate(() => [/** @type {HTMLInputElement} */ (document.getElementById('c-personas')).value, /** @type {HTMLInputElement} */ (document.getElementById('c-horas')).value]);
  const maxPers = await p2.locator('#c-personas').getAttribute('max');
  const minHoras = await p2.locator('#c-horas').getAttribute('min');
  exigir(pers === maxPers && horas === minHoras, `valores fuera de rango no se acotaron (${pers}, ${horas})`);
  await ctx.close();
});

await prueba('Punto de pedido: mismo cálculo que el build, validación y stock actual', async () => {
  const ctx = await contexto(390, 844);
  const { p } = await pagina(ctx, '/herramientas/punto-de-pedido');
  const def = puntoPedido(PP_DEFECTO);
  exigir((await p.locator('#pp-punto').textContent() || '').startsWith(miles(def.punto)), 'valor inicial distinto al del build');
  const escribir = async (id, v) => { await p.fill('#' + id, String(v)); };
  await escribir('pp-demanda', 35); await escribir('pp-desv-demanda', 9); await escribir('pp-plazo', 12); await escribir('pp-desv-plazo', 2);
  await p.selectOption('#pp-servicio', '99');
  const r = puntoPedido({ demanda: 35, desvDemanda: 9, plazo: 12, desvPlazo: 2, servicio: 99 });
  exigir((await p.locator('#pp-punto').textContent() || '').startsWith(miles(r.punto)), `punto ${await p.locator('#pp-punto').textContent()} ≠ ${r.punto}`);
  exigir((await p.locator('#pp-seguridad').textContent() || '').startsWith(miles(r.seguridad)), 'stock de seguridad distinto');
  await escribir('pp-stock', r.punto - 1);
  exigir(/corresponde pedir ahora/.test(await p.locator('#pp-lectura').textContent() || ''), 'no avisa que corresponde pedir');
  await escribir('pp-stock', r.punto + 35 * 4);
  exigir(/unos 4 días/.test(await p.locator('#pp-lectura').textContent() || ''), 'no calcula los días hasta el punto de pedido');
  await escribir('pp-plazo', '');
  exigir(await p.locator('#pp-error').isVisible(), 'plazo vacío sin error visible');
  await escribir('pp-plazo', -3);
  exigir((await p.locator('#pp-plazo').getAttribute('aria-invalid')) === 'true', 'valor negativo no se marcó');
  await escribir('pp-plazo', 12);
  await p.locator('#pp-plazo').blur();
  exigir(!(await p.locator('#pp-error').isVisible()), 'el error no se fue al corregir');
  const ev = await eventos(p);
  exigir(ev.filter((x) => x === 'calculator_start').length === 1 && ev.filter((x) => x === 'calculator_complete').length === 1, 'eventos: ' + ev.join(','));
  exigir((await evento(p, 'calculator_complete'))?.herramienta === 'punto-pedido', 'calculator_complete sin herramienta');
  await ctx.close();
});

await prueba('Plantilla de ROI: descarga real (XLSX) y evento template_download', async () => {
  const ctx = await contexto();
  const { p } = await pagina(ctx, '/recursos/plantilla-roi-automatizacion');
  const a = p.locator('a[data-track="template_download"]').first();
  const href = await a.getAttribute('href');
  exigir(href === '/descargas/plantilla-roi-automatizacion.xlsx' && (await a.getAttribute('download')) !== null, 'enlace de descarga: ' + href);
  const r = await ctx.request.get(BASE + href);
  const cuerpo = await r.body();
  exigir(r.ok() && cuerpo.subarray(0, 2).toString() === 'PK' && cuerpo.length > 5000, 'el archivo no es un XLSX válido');
  const descarga = p.waitForEvent('download');
  await a.click();
  await (await descarga).cancel();
  exigir((await eventos(p)).includes('template_download'), 'no midió template_download');
  await ctx.close();
});

await prueba('Landings de solución: h1, CTA a WhatsApp con su ref y enlaces a recursos', async () => {
  const ctx = await contexto();
  for (const s of SOLUCIONES) {
    const pag = PAGINAS.find((x) => x.ruta === s.ruta);
    const { p, status } = await pagina(ctx, s.ruta);
    exigir(status === 200, `${s.ruta} respondió ${status}`);
    exigir(await p.locator('h1').count() === 1, `${s.ruta} sin h1 único`);
    const hrefs = await p.$$eval('a[href^="https://wa.me/"]', (as) => as.map((a) => a.getAttribute('href') || ''));
    exigir(hrefs.some((h) => decodeURIComponent(h).includes(`(ref: ${pag?.fuente})`)), `${s.ruta} sin WhatsApp con ref: ${pag?.fuente}`);
    exigir(await p.locator('.relacionados a').count() >= 3, `${s.ruta} sin contenido relacionado`);
    await p.close();
  }
  await ctx.close();
});

await prueba('Recursos: índice, guías con autor y fechas, caso largo enlazado desde /casos', async () => {
  const ctx = await contexto();
  const { p } = await pagina(ctx, '/recursos');
  exigir(await p.locator('.relacionados--indice a').count() >= 8, 'el índice muestra pocos recursos');
  const { p: g } = await pagina(ctx, '/recursos/como-detectar-proceso-automatizable');
  exigir(await g.locator('time[datetime]').count() >= 1, 'guía sin fecha');
  exigir(await g.locator('.autor, .caja-autor').count() >= 1, 'guía sin autor');
  const { p: c } = await pagina(ctx, '/casos');
  const largo = c.locator('#documentos-legales a', { hasText: 'Leer el caso completo' });
  // Se mide el clic sin navegar (al navegar se pierde la lista de eventos de la página).
  await c.evaluate(() => document.addEventListener('click', (e) => e.preventDefault()));
  await largo.click();
  exigir((await eventos(c)).includes('case_cta_click'), 'no midió case_cta_click');
  const { status } = await pagina(ctx, String(await largo.getAttribute('href')));
  exigir(status === 200, 'el caso largo no responde');
  await ctx.close();
});

await prueba('Archivos para buscadores: robots, sitemap, feed, llms.txt y clave IndexNow', async () => {
  const ctx = await contexto();
  for (const [ruta, tipo, contiene] of [['/robots.txt', 'text/plain', 'Sitemap:'], ['/sitemap.xml', 'xml', '<urlset'], ['/feed.xml', 'xml', '<rss'], ['/llms.txt', 'text/plain', '# '], [`/${SITIO.indexnow.clave}.txt`, 'text/plain', SITIO.indexnow.clave]]) {
    const r = await ctx.request.get(BASE + ruta);
    exigir(r.ok(), `${ruta} respondió ${r.status()}`);
    exigir((r.headers()['content-type'] || '').includes(tipo), `${ruta} con content-type ${r.headers()['content-type']}`);
    exigir((await r.text()).includes(contiene), `${ruta} sin "${contiene}"`);
  }
  const { p } = await pagina(ctx, '/esta-no-existe');
  for (const texto of ['Calculadora de ROI', 'Recursos y guías', 'Autodiagnóstico gratuito', 'Ver casos reales']) exigir(await p.locator('.hero-cta a', { hasText: texto }).count() === 1, `404 sin "${texto}"`);
  await ctx.close();
});

// ------------------------------------------- desborde horizontal y capturas
await prueba(`Sin desborde horizontal en ${rutas.length} páginas × ${ANCHOS.length} anchos`, async () => {
  const problemas = [];
  for (const ancho of ANCHOS) {
    const ctx = await contexto(ancho, 900);
    for (const ruta of [...rutas, '/404']) {
      const { p } = await pagina(ctx, ruta);
      const res = await p.evaluate(() => {
        const w = document.documentElement.clientWidth;
        const recorta = (el) => {
          for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const ox = getComputedStyle(a).overflowX;
            if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') return true;
          }
          return false;
        };
        const culpables = [];
        for (const el of Array.from(document.querySelectorAll('main *, header *, footer *'))) {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          if (el.closest('.sr,.trampa,.saltar')) continue;
          if (r.right > w + 1 && !recorta(el)) culpables.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} (${Math.round(r.right)}px)`);
        }
        return { w, sw: document.documentElement.scrollWidth, culpables: culpables.slice(0, 4) };
      });
      if (res.sw > res.w + 1 || res.culpables.length) problemas.push(`${ruta} @${ancho}px: ${res.culpables.join(', ') || `scrollWidth ${res.sw}`}`);
      if ([375, 1440].includes(ancho) && ['/', '/automatizacion-express', '/casos', '/calculadora-roi-automatizacion', '/herramientas/punto-de-pedido', '/recursos', '/automatizacion-documental', '/recursos/cuanto-cuesta-automatizar-proceso-chile', '/casos/automatizacion-documental-retail'].includes(ruta)) {
        await p.screenshot({ path: join(CAPTURAS, `${ruta === '/' ? 'inicio' : ruta.slice(1).replace(/\//g, '-')}-${ancho}.png`), fullPage: true });
      }
      await p.close();
    }
    await ctx.close();
  }
  exigir(!problemas.length, '\n        ' + problemas.join('\n        '));
});

await prueba('Consola limpia (sin errores ni advertencias)', async () => {
  const relevantes = erroresConsola.filter((e) => !/wa\.me/.test(e) && !/api\/(contacto|uf).*(503|500)/.test(e) && !/Failed to load resource: the server responded with a status of (503|404)/.test(e));
  exigir(!relevantes.length, '\n        ' + [...new Set(relevantes)].slice(0, 10).join('\n        '));
});

await navegador.close();
servidor.close();
console.log(`\n${ok} pruebas bien, ${fallas.length} con fallas. Capturas en .e2e/`);
if (fallas.length) process.exit(1);
