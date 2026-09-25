// @ts-check
// Servidor local que imita a Vercel lo suficiente para desarrollar y para el
// E2E: URLs limpias (/casos → casos.html), 404.html para rutas inexistentes,
// y las funciones de /api ejecutadas con un `res` compatible.
//   npm run dev            → http://127.0.0.1:8123
// Las variables de entorno se leen del proceso (sin claves, el formulario
// responde 503 y el sitio ofrece WhatsApp, igual que en producción sin config).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(RAIZ, 'public');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.mp4': 'video/mp4', '.gif': 'image/gif',
};

async function existe(ruta) {
  try { return (await stat(ruta)).isFile(); } catch { return false; }
}

/** Adapta la respuesta de Node a la API de Vercel (status, json, send). */
function resVercel(res) {
  const r = /** @type {any} */ (res);
  r.status = (/** @type {number} */ c) => { res.statusCode = c; return r; };
  r.json = (/** @type {unknown} */ o) => { if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(o)); return r; };
  r.send = (/** @type {string} */ t) => { res.end(t); return r; };
  return r;
}

async function leerCuerpo(req) {
  const partes = [];
  for await (const p of req) partes.push(p);
  const txt = Buffer.concat(partes).toString('utf8');
  const tipo = String(req.headers['content-type'] || '');
  if (tipo.includes('application/json')) { try { return JSON.parse(txt || '{}'); } catch { return txt; } }
  if (tipo.includes('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(txt));
  return txt;
}

/** @param {{ puerto?: number, silencioso?: boolean }} [o] */
export function iniciar({ puerto = 8123, silencioso = false } = {}) {
  const servidor = createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost');
    let ruta = decodeURIComponent(url.pathname);
    try {
      // Analítica de Vercel: en local no existe; se sirve vacía para no ensuciar la consola.
      if (ruta.startsWith('/_vercel/')) { res.setHeader('Content-Type', 'text/javascript'); return res.end(''); }
      if (ruta.startsWith('/api/')) {
        const archivo = join(RAIZ, 'api', ruta.slice(5).replace(/[^a-z0-9-]/gi, '') + '.js');
        if (!(await existe(archivo))) { res.statusCode = 404; return res.end('{}'); }
        const mod = await import(pathToFileURL(archivo).href);
        const r = /** @type {any} */ (req);
        r.body = req.method === 'POST' ? await leerCuerpo(req) : undefined;
        return await mod.default(r, resVercel(res));
      }
      if (ruta.endsWith('.html')) { res.statusCode = 308; res.setHeader('Location', ruta.replace(/(index)?\.html$/, '')); return res.end(); }
      if (ruta !== '/' && ruta.endsWith('/')) { res.statusCode = 308; res.setHeader('Location', ruta.slice(0, -1)); return res.end(); }
      let archivo = normalize(join(PUBLIC, ruta === '/' ? 'index.html' : ruta));
      if (!archivo.startsWith(PUBLIC)) { res.statusCode = 403; return res.end(); }
      if (!extname(archivo) && (await existe(archivo + '.html'))) archivo += '.html';
      if (!(await existe(archivo))) {
        res.statusCode = 404;
        res.setHeader('Content-Type', TIPOS['.html']);
        return res.end(await readFile(join(PUBLIC, '404.html')));
      }
      res.setHeader('Content-Type', TIPOS[extname(archivo)] || 'application/octet-stream');
      return res.end(await readFile(archivo));
    } catch (e) {
      console.error(e);
      res.statusCode = 500;
      res.end('Error');
    }
  });
  return new Promise((ok) => servidor.listen(puerto, '127.0.0.1', () => {
    const dir = servidor.address();
    const p = typeof dir === 'object' && dir ? dir.port : puerto;
    if (!silencioso) console.log(`Sitio en http://127.0.0.1:${p}`);
    ok({ servidor, puerto: p });
  }));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  iniciar({ puerto: Number(process.env.PORT) || 8123 });
}
