// @ts-check
// Validación financiera de la calculadora de ROI (src/calculo.mjs): casos
// conocidos, calculados a mano, y casos límite que no deben mostrar
// Infinity, NaN ni -0. La plantilla Excel usa las mismas fórmulas: el caso
// "ejemplo de la plantilla" es el que trae el XLSX, con sus valores recalculados.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { roi, miles, pesos, porcentaje, textoPayback, lecturaRoi, leerPesos, MONTO_MAXIMO } from '../src/calculo.mjs';

const casi = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-6, `${msg}: ${a} ≠ ${b}`);
const base = { personas: 5, horasSemana: 6, costoHora: 9000, pctAutomatizable: 60, inversion: 1_640_000, costoMensual: 0, semanas: 44 };

test('ejemplo de la plantilla Excel: mismos datos, mismos resultados', () => {
  const r = roi(base);
  assert.equal(r.horasAnuales, 1320); // 5 × 6 × 44
  assert.equal(r.costoAnual, 11_880_000); // 1.320 × 9.000
  assert.equal(r.horasRecuperadas, 792); // 1.320 × 60%
  assert.equal(r.ahorroBruto, 7_128_000); // 792 × 9.000
  assert.equal(r.recurrenteAnual, 0);
  assert.equal(r.ahorroNetoAnual, 7_128_000);
  assert.equal(r.ahorroNetoAno1, 5_488_000); // 7.128.000 − 1.640.000
  // Valores que LibreOffice calculó en public/descargas/plantilla-roi-automatizacion.xlsx
  casi(/** @type {number} */ (r.paybackMeses), 2.76094276094276, 'payback');
  casi(/** @type {number} */ (r.roi1), 3.34634146341463, 'ROI año 1');
  casi(/** @type {number} */ (r.roi3), 12.0390243902439, 'ROI 3 años');
  assert.equal(r.estado, 'ok');
  assert.equal(textoPayback(r), '2,8 meses');
  assert.equal(porcentaje(r.roi1), '335%');
  assert.equal(porcentaje(r.roi3), '1.204%');
});

test('con costo mensual: se descuenta del ahorro y alarga el payback', () => {
  // 2 personas × 10 h × 44 = 880 h; 50% = 440 h; × $12.000 = $5.280.000 bruto.
  // Mensual $150.000 → $1.800.000 al año → neto $3.480.000. Inversión $2.000.000.
  const r = roi({ personas: 2, horasSemana: 10, costoHora: 12_000, pctAutomatizable: 50, inversion: 2_000_000, costoMensual: 150_000, semanas: 44 });
  assert.equal(r.ahorroBruto, 5_280_000);
  assert.equal(r.recurrenteAnual, 1_800_000);
  assert.equal(r.ahorroNetoAnual, 3_480_000);
  assert.equal(r.ahorroNetoAno1, 1_480_000);
  casi(/** @type {number} */ (r.paybackMeses), 2_000_000 / (3_480_000 / 12), 'payback'); // ≈ 6,9
  casi(/** @type {number} */ (r.roi1), 0.74, 'ROI año 1');
  casi(/** @type {number} */ (r.roi3), (3_480_000 * 3 - 2_000_000) / 2_000_000, 'ROI 3 años'); // 4,22
  assert.equal(textoPayback(r), '6,9 meses');
  assert.equal(porcentaje(r.roi3), '422%');
});

test('Automatización Express como inversión (precio en pesos)', () => {
  const r = roi({ ...base, inversion: 199_900 });
  casi(/** @type {number} */ (r.paybackMeses), 199_900 / (7_128_000 / 12), 'payback');
  assert.equal(textoPayback(r), 'Menos de 1 mes');
});

test('0 horas, 0 costo o 0% automatizable: no hay ahorro y nada es Infinity ni NaN', () => {
  for (const e of [{ horasSemana: 0 }, { costoHora: 0 }, { pctAutomatizable: 0 }, { personas: 0 }]) {
    const r = roi({ ...base, ...e });
    assert.equal(r.estado, 'sin-ahorro', JSON.stringify(e));
    assert.equal(r.ahorroBruto, 0);
    assert.equal(r.paybackMeses, null);
    assert.equal(textoPayback(r), 'No aplica');
    assert.match(lecturaRoi(r), /no hay ahorro que estimar/);
    for (const v of Object.values(r)) if (typeof v === 'number') assert.ok(Number.isFinite(v), `${JSON.stringify(e)} → ${v}`);
  }
});

test('100% automatizable: se recupera todo el costo anual, no más', () => {
  const r = roi({ ...base, pctAutomatizable: 100 });
  assert.equal(r.horasRecuperadas, r.horasAnuales);
  assert.equal(r.ahorroBruto, r.costoAnual);
  // Más de 100% se acota a 100%: no se puede recuperar más tiempo del que existe.
  assert.equal(roi({ ...base, pctAutomatizable: 250 }).ahorroBruto, r.costoAnual);
});

test('inversión 0: el ahorro existe, pero payback y ROI no aplican', () => {
  const r = roi({ ...base, inversion: 0 });
  assert.equal(r.estado, 'sin-inversion');
  assert.equal(r.paybackMeses, null);
  assert.equal(r.roi1, null);
  assert.equal(r.roi3, null);
  assert.equal(textoPayback(r), 'No aplica');
  assert.equal(porcentaje(r.roi1), 'No aplica');
  assert.equal(r.ahorroNetoAno1, 7_128_000);
});

test('mantención alta: sin recuperación, ahorro neto negativo y ROI negativo legibles', () => {
  const r = roi({ ...base, costoMensual: 700_000 }); // 8.400.000 al año > 7.128.000 de ahorro
  assert.equal(r.estado, 'sin-recuperacion');
  assert.equal(r.paybackMeses, null);
  assert.equal(r.ahorroNetoAnual, -1_272_000);
  assert.equal(textoPayback(r), 'Sin recuperación');
  assert.equal(pesos(r.ahorroNetoAno1), '−$2.912.000');
  assert.ok(/** @type {number} */ (r.roi1) < 0);
  assert.equal(porcentaje(r.roi1), '−178%'); // −2.912.000 ÷ 1.640.000
  assert.match(lecturaRoi(r), /no se pagaría/);
  // Justo en el límite: el costo mensual iguala el ahorro.
  assert.equal(roi({ ...base, costoMensual: 594_000 }).estado, 'sin-recuperacion');
});

test('payback más allá del período: se dice, no se muestra un número sin sentido', () => {
  const r = roi({ personas: 1, horasSemana: 1, costoHora: 3000, pctAutomatizable: 10, inversion: 1_640_000, costoMensual: 0 });
  assert.ok(/** @type {number} */ (r.paybackMeses) > 36);
  assert.equal(textoPayback(r), 'Más de 36 meses');
  assert.match(lecturaRoi(r), /no se recuperaría dentro de 36 meses/);
});

test('números grandes: sin notación científica ni pérdida de formato', () => {
  const r = roi({ personas: 5000, horasSemana: 40, costoHora: 1_000_000, pctAutomatizable: 100, inversion: 1e12, costoMensual: 0 });
  assert.equal(r.ahorroBruto, 8_800_000_000_000);
  assert.equal(pesos(r.ahorroBruto), '$8.800.000.000.000');
  assert.ok(!/e\+/.test(miles(r.costoAnual)));
});

test('entradas inválidas cuentan como 0 y nunca producen NaN', () => {
  const r = roi({ personas: Number('abc'), horasSemana: -5, costoHora: Infinity, pctAutomatizable: NaN, inversion: -100, costoMensual: undefined });
  for (const v of Object.values(r)) if (typeof v === 'number') assert.ok(Number.isFinite(v));
  assert.equal(r.estado, 'sin-ahorro');
  assert.equal(r.inversion, 0);
});

test('formato: miles, pesos y porcentajes sin -0', () => {
  assert.equal(miles(1234567), '1.234.567');
  assert.equal(miles(-0), '0');
  assert.equal(miles(-0.4), '0');
  assert.equal(pesos(-0), '$0');
  assert.equal(pesos(1640000), '$1.640.000');
  assert.equal(porcentaje(0), '0%');
  assert.equal(porcentaje(-0.0001), '0%');
  assert.equal(porcentaje(null), 'No aplica');
  assert.equal(porcentaje(Infinity), 'No aplica');
});

test('personas = 0 o campos vacíos: sin ahorro, sin NaN y con mensajes legibles', () => {
  for (const e of [
    { personas: 0, horasSemana: 6, costoHora: 9000, pctAutomatizable: 60, inversion: 199_900, costoMensual: 0 },
    { personas: '', horasSemana: '', costoHora: '', pctAutomatizable: '', inversion: '', costoMensual: '' },
  ]) {
    const r = roi(/** @type {any} */ (e));
    for (const v of Object.values(r)) if (typeof v === 'number') assert.ok(Number.isFinite(v));
    assert.equal(r.estado, 'sin-ahorro');
    assert.equal(textoPayback(r), 'No aplica');
    assert.ok(!/NaN|Infinity|-0\b/.test(lecturaRoi(r)));
  }
});

test('mantención 0 vs. mantención igual al ahorro: el límite exacto no recupera', () => {
  const base = { personas: 5, horasSemana: 6, costoHora: 9000, pctAutomatizable: 60, inversion: 1_640_000 };
  const sinMantencion = roi({ ...base, costoMensual: 0 });
  assert.equal(sinMantencion.recurrenteAnual, 0);
  assert.equal(sinMantencion.ahorroNetoAnual, sinMantencion.ahorroBruto);
  const empate = roi({ ...base, costoMensual: sinMantencion.ahorroBruto / 12 });
  assert.equal(empate.ahorroNetoAnual, 0);
  assert.equal(empate.estado, 'sin-recuperacion');
  assert.equal(textoPayback(empate), 'Sin recuperación');
});

test('NaN, Infinity y -0 como entradas: nunca aparecen en el resultado ni en el texto', () => {
  const r = roi({ personas: -0, horasSemana: NaN, costoHora: -Infinity, pctAutomatizable: Infinity, inversion: NaN, costoMensual: -0 });
  for (const v of Object.values(r)) if (typeof v === 'number') assert.ok(Number.isFinite(v) && !Object.is(v, -0));
  const textos = [pesos(r.ahorroBruto), porcentaje(r.roi1), porcentaje(r.roi3), textoPayback(r), lecturaRoi(r)].join(' ');
  assert.ok(!/NaN|Infinity|-0\b|−0\b/.test(textos), textos);
});

test('montos escritos a mano: separador de miles, signo $, decimales, vacíos y tope', () => {
  assert.equal(leerPesos('1.500.000'), 1_500_000);
  assert.equal(leerPesos('$ 1.500.000'), 1_500_000);
  assert.equal(leerPesos('1500000'), 1_500_000);
  assert.equal(leerPesos('1.500.000,50'), 1_500_000);
  assert.equal(leerPesos(''), 0);
  assert.equal(leerPesos('   '), 0);
  assert.equal(leerPesos('abc'), 0);
  assert.equal(leerPesos(null), 0);
  assert.equal(leerPesos('-200.000'), 200_000);
  assert.equal(leerPesos('9'.repeat(40)), MONTO_MAXIMO);
  assert.equal(leerPesos('500.000', 100_000), 100_000);
});
