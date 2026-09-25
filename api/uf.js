// GET /api/uf
// Valor de la UF del día, para mostrar la equivalencia en pesos de los precios
// en UF. El sitio no depende de esta función para cargar: el navegador la pide
// después, y si falla muestra la UF de referencia con su fecha (o solo UF).
//
// Fuentes, en orden:
//  1. CMF (Comisión para el Mercado Financiero), la oficial. Requiere
//     CMF_API_KEY (gratis en https://api.cmfchile.cl).
//  2. mindicador.cl, pública y sin clave.
// La respuesta se guarda 6 horas en la CDN de Vercel y en la memoria de la
// función, así casi ninguna visita llega a consultar la fuente.

const CMF_API_KEY = process.env.CMF_API_KEY;
const SEIS_HORAS = 6 * 60 * 60;
let memoria = null; // { valor, fecha, fuente, hasta }

const valida = (v) => typeof v === 'number' && Number.isFinite(v) && v > 20000 && v < 100000;

async function traer(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(4000), headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function desdeCmf() {
  if (!CMF_API_KEY) throw new Error('sin clave');
  const j = await traer(`https://api.cmfchile.cl/api-sbifv3/recursos_api/uf?apikey=${encodeURIComponent(CMF_API_KEY)}&formato=json`);
  const d = j && j.UFs && j.UFs[0];
  const valor = d ? Number(String(d.Valor).replace(/\./g, '').replace(',', '.')) : NaN;
  if (!valida(valor) || !/^\d{4}-\d{2}-\d{2}$/.test(d.Fecha)) throw new Error('respuesta inesperada');
  return { valor, fecha: d.Fecha, fuente: 'CMF' };
}

async function desdeMindicador() {
  const j = await traer('https://mindicador.cl/api/uf');
  const d = j && j.serie && j.serie[0];
  const valor = d ? Number(d.valor) : NaN;
  if (!valida(valor) || !d.fecha) throw new Error('respuesta inesperada');
  // La fecha viene en UTC (medianoche de Chile): se pasa a la fecha local.
  const fecha = new Date(d.fecha).toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
  return { valor, fecha, fuente: 'mindicador.cl' };
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  if (memoria && memoria.hasta > Date.now()) {
    res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${SEIS_HORAS}, stale-while-revalidate=86400`);
    const { valor, fecha, fuente } = memoria;
    return res.status(200).json({ valor, fecha, fuente });
  }
  for (const fuente of [desdeCmf, desdeMindicador]) {
    try {
      const uf = await fuente();
      memoria = { ...uf, hasta: Date.now() + SEIS_HORAS * 1000 };
      res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${SEIS_HORAS}, stale-while-revalidate=86400`);
      return res.status(200).json(uf);
    } catch (e) {
      if (fuente !== desdeCmf || CMF_API_KEY) console.error('uf', fuente.name, e instanceof Error ? e.message : e);
    }
  }
  // Sin fuente disponible: el navegador usa la UF de referencia. Se reintenta en 5 minutos.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300');
  return res.status(503).json({ error: 'UF no disponible por ahora.' });
}
