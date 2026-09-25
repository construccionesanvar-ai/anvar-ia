// @ts-check
// Pruebas de punta a punta con Playwright (Chromium), contra el servidor local.
//   npm run e2e
// Requiere Playwright instalado (npm i -D playwright && npx playwright install chromium).
// Revisa los flujos críticos, que ninguna página se desborde de 320 a 1440 px,
// y que no haya errores en la consola. Deja capturas en .e2e/ para revisar a ojo.
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

import { iniciar } from './servidor.mjs';
import { PAGINAS } from './build.mjs';
import { calcular, puntoPedido, PP_DEFECTO } from '../src/componentes/herramientas.mjs';
import { SOLUCIONES } from '../src/datos/soluciones.mjs';
import { SITIO, CALCULADORA } from '../src/config.mjs';

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
  const { p } = await pagina(ctx, '/');
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
  exigir(ev.includes('diagnostic_whatsapp_click') && ev.includes('whatsapp_lead'), 'no midió el clic a WhatsApp');
  const lead = await evento(p, 'whatsapp_lead');
  exigir(lead && lead.landing === '/' && lead.canal === 'directo', 'whatsapp_lead sin atribución: ' + JSON.stringify(lead));
  // Volver y reiniciar no duplican eventos
  await p.locator('#diag-volver').click();
  await p.locator('#diag-cuerpo .opcion').nth(1).click();
  const ev2 = await eventos(p);
  exigir(ev2.filter((x) => x === 'diagnostic_complete').length === 1, 'diagnostic_complete se duplicó');
  await ctx.close();
});

await prueba('Calculadora: mismo cálculo que el build, reinicio y valores extremos', async () => {
  const ctx = await contexto();
  const { p } = await pagina(ctx, '/');
  const fijar = async (v) => p.evaluate((v) => {
    for (const [id, val] of Object.entries(v)) {
      const el = /** @type {HTMLInputElement} */ (document.getElementById(id));
      el.value = String(val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, v);
  for (const caso of [{ personas: 12, horas: 9, costo: 11500, auto: 45 }, { personas: 1, horas: 1, costo: 3000, auto: 20 }, { personas: 50, horas: 25, costo: 40000, auto: 90 }]) {
    await fijar({ 'c-personas': caso.personas, 'c-horas': caso.horas, 'c-costo': caso.costo, 'c-auto': caso.auto });
    const esperado = '$' + new Intl.NumberFormat('es-CL').format(calcular(caso).valor);
    const visto = await p.locator('#c-valor').textContent();
    exigir(visto === esperado, `valor ${visto} ≠ ${esperado}`);
  }
  exigir((await p.locator('#c-estado').textContent()) === 'Tu estimación', 'no marcó la estimación como propia');
  await p.locator('#c-reiniciar').click();
  exigir((await p.locator('#c-estado').textContent()) === 'Ejemplo ilustrativo', 'reinicio no volvió al ejemplo');
  exigir((await p.locator('#c-valor').textContent()) === '$' + new Intl.NumberFormat('es-CL').format(calcular(CALCULADORA.defecto).valor), 'reinicio no restauró valores');
  const ev = await eventos(p);
  exigir(ev.filter((x) => x === 'calculator_start').length === 1 && ev.filter((x) => x === 'calculator_complete').length === 1, 'eventos de calculadora duplicados o faltantes: ' + ev.join(','));
  exigir((await evento(p, 'calculator_complete'))?.herramienta === 'roi', 'calculator_complete sin herramienta');
  exigir(await p.locator('text=Estimación referencial basada en los valores ingresados').count() === 1, 'falta el aviso de estimación');
  await ctx.close();
});

await prueba('UF del día: /api/uf actualiza los pesos; si falla quedan los de referencia', async () => {
  const ctx = await contexto();
  await ctx.route('**/api/uf', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valor: 40000, fecha: '2026-09-25', fuente: 'prueba' }) }));
  const { p } = await pagina(ctx, '/diagnostico-ia-empresas');
  await p.waitForFunction(() => /480\.000/.test(document.querySelector('[data-uf="12"]')?.textContent || ''), null, { timeout: 8000 });
  exigir(/valor del 25\/09\/2026/.test(await p.locator('[data-uf-nota]').first().textContent() || ''), 'la nota no muestra la fecha del día');
  await ctx.close();
  const ctx2 = await contexto();
  await ctx2.route('**/api/uf', (r) => r.fulfill({ status: 503, body: '{}' }));
  const { p: p2 } = await pagina(ctx2, '/diagnostico-ia-empresas');
  await p2.waitForTimeout(2500);
  const txt = await p2.locator('[data-uf="12"]').first().textContent() || '';
  exigir(txt.includes('+ IVA'), 'sin IVA tras el fallo: ' + txt);
  await ctx2.close();
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
  const { p } = await pagina(ctx, '/calculadora-roi-automatizacion?personas=8&horas=12&costo=15000&auto=50');
  const esperado = '$' + miles(calcular({ personas: 8, horas: 12, costo: 15000, auto: 50 }).valor);
  exigir((await p.locator('#c-valor').textContent()) === esperado, `valor desde URL ${await p.locator('#c-valor').textContent()} ≠ ${esperado}`);
  exigir((await p.locator('#c-estado').textContent()) === 'Tu estimación', 'valores de la URL no se marcaron como propios');
  await p.locator('#c-compartir').click();
  await p.locator('#c-compartir-msg').filter({ hasText: /Enlace copiado|barra de direcciones/ }).waitFor({ timeout: 3000 });
  const copiado = await p.evaluate(() => navigator.clipboard.readText()).catch(() => p.evaluate(() => location.href));
  exigir(/personas=8&horas=12&costo=15000&auto=50/.test(copiado), 'enlace compartido sin valores: ' + copiado);
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
