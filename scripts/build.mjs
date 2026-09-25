// @ts-check
// Genera el sitio en /public a partir de src/. Sin dependencias.
//   npm run build
//
// Qué hace:
//  1. Calcula un hash de styles.css y app.js y lo pone en las URLs (?v=hash),
//     así cada cambio llega a los navegadores sin tocar la caché a mano.
//  2. Renderiza cada página de src/paginas a public/*.html.
//  3. Escribe sitemap.xml (conserva la fecha de las páginas que no cambiaron)
//     y robots.txt.
//  4. Borra archivos que el sitio dejó de usar.
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITIO, SEMANAS_HABILES } from '../src/config.mjs';
import { SERVICIOS } from '../src/datos/oferta.mjs';
import { MENSAJES, DIAGNOSTICO } from '../src/datos/contenido.mjs';
import { precioTexto, absoluta } from '../src/html.mjs';
import { documento } from '../src/componentes/base.mjs';
import { organizacion } from '../src/paginas/ld.mjs';

import inicio from '../src/paginas/inicio.mjs';
import casos from '../src/paginas/casos.mjs';
import express from '../src/paginas/express.mjs';
import datos from '../src/paginas/datos.mjs';
import diagnostico from '../src/paginas/diagnostico.mjs';
import automatizacion from '../src/paginas/automatizacion.mjs';
import capacitacion from '../src/paginas/capacitacion.mjs';
import personal from '../src/paginas/personal.mjs';
import noEncontrada from '../src/paginas/no-encontrada.mjs';

/** Para agregar una página: créala en src/paginas y súmala aquí. */
export const PAGINAS = [inicio, casos, express, datos, diagnostico, automatizacion, capacitacion, personal, noEncontrada];

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(RAIZ, 'public');
const OBSOLETOS = ['servicio.css', 'servicio.js'];

const hash = (archivo) => createHash('sha256').update(readFileSync(join(PUBLIC, archivo))).digest('hex').slice(0, 10);

/** Lo que el JavaScript del navegador necesita saber. Sin secretos. */
function configCliente() {
  const serv = (id) => ({ id, nombre: SERVICIOS[id].nombre, precio: precioTexto(SERVICIOS[id].precio).principal, url: SERVICIOS[id].url });
  return {
    wsp: SITIO.contacto.whatsapp,
    mensajes: MENSAJES,
    agenda: SITIO.agenda.url,
    uf: SITIO.uf,
    semanas: SEMANAS_HABILES,
    precios: { express: SERVICIOS.express.precio.valor, piloto: SERVICIOS.piloto.precio.valor * SITIO.uf },
    diagnostico: {
      categorias: DIAGNOSTICO.categorias,
      preguntas: DIAGNOSTICO.preguntas,
      servicios: Object.fromEntries(['express', 'diagnostico', 'piloto', 'capacitacion', 'intelligence'].map((id) => [id, serv(id)])),
    },
  };
}

function sitemapAnterior() {
  const f = join(PUBLIC, 'sitemap.xml');
  if (!existsSync(f)) return {};
  const xml = readFileSync(f, 'utf8');
  return Object.fromEntries([...xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map((m) => [m[1], m[2]]));
}

export function construir({ silencioso = false } = {}) {
  const hashes = { css: hash('styles.css'), js: hash('app.js') };
  const cliente = configCliente();
  const hoy = new Date().toISOString().slice(0, 10);
  const anteriores = sitemapAnterior();
  const urls = [];

  for (const p of PAGINAS) {
    const html = documento({
      ruta: p.ruta,
      titulo: p.titulo,
      ogTitulo: p.ogTitulo,
      descripcion: p.descripcion,
      cuerpo: p.cuerpo(),
      jsonld: p.noindex ? [] : [organizacion(), ...(p.jsonld ?? [])],
      noindex: p.noindex,
      contextoWsp: p.contextoWsp,
      hashes,
      cliente,
    });
    const destino = join(PUBLIC, p.archivo);
    const previo = existsSync(destino) ? readFileSync(destino, 'utf8') : null;
    writeFileSync(destino, html, 'utf8');
    if (p.enSitemap !== false && !p.noindex) {
      const loc = absoluta(p.ruta);
      const cambio = previo !== html;
      urls.push({ loc, lastmod: cambio || !anteriores[loc] ? hoy : anteriores[loc], prioridad: p.prioridad ?? '0.5' });
    }
    if (!silencioso) console.log(`  ${p.archivo.padEnd(34)} ${previo === html ? 'sin cambios' : 'actualizada'}`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.prioridad}</priority>\n  </url>`).join('\n')}
</urlset>
`;
  writeFileSync(join(PUBLIC, 'sitemap.xml'), sitemap, 'utf8');
  writeFileSync(join(PUBLIC, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITIO.dominio}/sitemap.xml\n`, 'utf8');

  for (const f of OBSOLETOS) {
    const ruta = join(PUBLIC, f);
    if (existsSync(ruta)) { unlinkSync(ruta); if (!silencioso) console.log(`  ${f.padEnd(34)} eliminado (ya no se usa)`); }
  }
  if (!silencioso) console.log(`\n  ${urls.length} páginas en sitemap.xml · css ${hashes.css} · js ${hashes.js}`);
  return { urls, hashes };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log('Construyendo el sitio…');
  construir();
}
