// GET /api/uf
// UF del día en Chile, para mostrar la equivalencia en pesos de los precios en
// UF. La página no espera esta llamada: el navegador la pide después de cargar
// y, si la respuesta no es la UF de hoy, muestra solo el precio en UF.
//
// Fuente: mindicador.cl, sin clave (la lógica y las validaciones están en
// src/uf.mjs). Respuestas:
//   { estado: 'vigente', valor, fecha, fuente }   UF de hoy (America/Santiago)
//   { estado: 'no-disponible' }                    sin UF de hoy: no se muestran pesos
//
// Caché: la CDN de Vercel y la memoria de la función guardan la UF hasta 6
// horas, nunca más allá de la medianoche de Chile (así nunca se sirve la de
// ayer). Sin stale-while-revalidate, por la misma razón. Una falla se guarda
// 5 minutos para no consultar la fuente en cada visita.
import { obtenerUf, fechaChile, segundosDeCache } from '../src/uf.mjs';

let memoria = null; // { valor, fecha, fuente, hasta }

function vigente(res, uf, segundos) {
  res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${segundos}`);
  return res.status(200).json({ estado: 'vigente', valor: uf.valor, fecha: uf.fecha, fuente: uf.fuente });
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const ahora = new Date();
  const hoy = fechaChile(ahora);
  const deHoy = memoria && memoria.fecha === hoy;
  if (deHoy && memoria.hasta > ahora.getTime()) return vigente(res, memoria, Math.max(30, Math.round((memoria.hasta - ahora.getTime()) / 1000)));

  const uf = await obtenerUf({ ahora });
  if (uf.estado === 'vigente') {
    const segundos = segundosDeCache(ahora);
    memoria = { ...uf, hasta: ahora.getTime() + segundos * 1000 };
    return vigente(res, uf, segundos);
  }
  // La fuente falló, pero la UF de hoy ya estaba en memoria: sigue siendo la de hoy.
  if (deHoy) return vigente(res, memoria, Math.min(300, segundosDeCache(ahora)));

  console.warn('uf: no disponible', uf.motivo);
  res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${Math.min(300, segundosDeCache(ahora))}`);
  return res.status(200).json({ estado: 'no-disponible' });
}
