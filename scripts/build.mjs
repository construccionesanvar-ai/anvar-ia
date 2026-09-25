// @ts-check
// Genera el sitio en /public a partir de src/. Sin dependencias.
//   npm run build
//
// Qué hace:
//  1. Valida que existan los archivos de casos y testimonios (si falta uno, falla).
//  2. Calcula un hash de styles.css y app.js y lo pone en las URLs (?v=hash),
//     así cada cambio llega a los navegadores sin tocar la caché a mano.
//  3. Renderiza cada página de src/paginas a public/*.html.
//  4. Escribe sitemap.xml (conserva la fecha de las páginas que no cambiaron)
//     y robots.txt.
//  5. Borra archivos que el sitio dejó de usar.
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITIO, CALCULADORA } from '../src/config.mjs';
import { SERVICIOS } from '../src/datos/oferta.mjs';
import { CASOS } from '../src/datos/casos.mjs';
import { TESTIMONIOS } from '../src/datos/testimonios.mjs';
import { publicadas } from '../src/datos/industrias.mjs';
import { DIAGNOSTICO } from '../src/datos/contenido.mjs';
import { MENSAJES } from '../src/datos/whatsapp.mjs';
import { precioTexto, absoluta } from '../src/html.mjs';
import { fijarPagina } from '../src/contexto.mjs';
import { documento } from '../src/componentes/base.mjs';
import { referenciasCalculadora } from '../src/componentes/herramientas.mjs';
import { organizacion } from '../src/paginas/ld.mjs';

import inicio from '../src/paginas/inicio.mjs';
import casos from '../src/paginas/casos.mjs';
import express from '../src/paginas/express.mjs';
import datos from '../src/paginas/datos.mjs';
import diagnostico from '../src/paginas/diagnostico.mjs';
import automatizacion from '../src/paginas/automatizacion.mjs';
import capacitacion from '../src/paginas/capacitacion.mjs';
import personal from '../src/paginas/personal.mjs';
import privacidad from '../src/paginas/privacidad.mjs';
import noEncontrada from '../src/paginas/no-encontrada.mjs';
import { paginaIndustria } from '../src/paginas/industria.mjs';

/**
 * @typedef {{ ruta: string, archivo: string, titulo: string, descripcion: string,
 *   cuerpo: () => string, fuente: string, contextoWsp?: string, ogTitulo?: string,
 *   jsonld?: object[], noindex?: boolean, enSitemap?: boolean, prioridad?: string }} Pagina
 */

/** Para agregar una página: créala en src/paginas y súmala aquí. */
/** @type {Pagina[]} */
export const PAGINAS = [
  inicio, casos, express, datos, diagnostico, automatizacion, capacitacion, personal, privacidad,
  ...publicadas().map(paginaIndustria),
  noEncontrada,
];

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(RAIZ, 'public');
const OBSOLETOS = ['servicio.css', 'servicio.js'];

// Sin \r: Vercel vuelve a construir en Linux (LF) y el hash tiene que coincidir con el de Windows (CRLF).
const hash = (/** @type {string} */ archivo) => createHash('sha256').update(readFileSync(join(PUBLIC, archivo), 'utf8').replace(/\r/g, '')).digest('hex').slice(0, 10);

/** Archivos que los datos declaran y que tienen que existir en public/. */
export function archivosDeclarados() {
  /** @type {{ archivo: string, donde: string }[]} */
  const lista = [];
  for (const c of CASOS) {
    const m = c.media;
    if (!m) continue;
    const medios = [m.principal, ...(m.galeria ?? [])].filter(Boolean);
    for (const x of medios) {
      if (!x) continue;
      lista.push({ archivo: x.src, donde: `caso ${c.codigo}` });
      if (x.poster) lista.push({ archivo: x.poster, donde: `caso ${c.codigo} (poster)` });
    }
  }
  for (const t of TESTIMONIOS) {
    if (t.logo) lista.push({ archivo: t.logo, donde: `testimonio de ${t.empresa}` });
    if (t.foto) lista.push({ archivo: t.foto, donde: `testimonio de ${t.nombre}` });
  }
  return lista;
}

function validarArchivos() {
  const faltan = archivosDeclarados().filter((x) => !existsSync(join(PUBLIC, x.archivo)));
  if (faltan.length) {
    throw new Error('Faltan archivos declarados en los datos (no se publica un espacio roto):\n  ' + faltan.map((x) => `${x.archivo} (${x.donde})`).join('\n  '));
  }
}

/** Lo que el JavaScript del navegador necesita saber. Sin secretos. */
function configCliente() {
  const serv = (id) => ({ id, nombre: SERVICIOS[id].nombre, precio: precioTexto(SERVICIOS[id].precio).principal, url: SERVICIOS[id].url });
  const refs = referenciasCalculadora();
  return {
    wsp: SITIO.contacto.whatsapp,
    mensajes: MENSAJES,
    agenda: SITIO.agenda.url,
    uf: SITIO.uf,
    calc: {
      semanas: CALCULADORA.semanas,
      umbral: CALCULADORA.umbralExpress,
      mesesMax: CALCULADORA.mesesMaximos,
      express: refs.express,
      piloto: { nombre: refs.piloto.nombre, etiqueta: refs.piloto.etiqueta, uf: SERVICIOS.piloto.precio.valor },
    },
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
  validarArchivos();
  const hashes = { css: hash('styles.css'), js: hash('app.js') };
  const cliente = configCliente();
  const hoy = new Date().toISOString().slice(0, 10);
  const anteriores = sitemapAnterior();
  /** @type {{ loc: string, lastmod: string, prioridad: string }[]} */
  const urls = [];
  const generados = new Set();

  for (const p of PAGINAS) {
    fijarPagina({ ruta: p.ruta, fuente: p.fuente });
    const html = documento({
      ruta: p.ruta,
      titulo: p.titulo,
      ogTitulo: p.ogTitulo,
      descripcion: p.descripcion,
      cuerpo: p.cuerpo(),
      jsonld: p.noindex ? [] : [organizacion(), ...(p.jsonld ?? [])],
      noindex: p.noindex,
      contextoWsp: p.contextoWsp,
      fuente: p.fuente,
      hashes,
      cliente,
    });
    const destino = join(PUBLIC, p.archivo);
    mkdirSync(dirname(destino), { recursive: true });
    const previo = existsSync(destino) ? readFileSync(destino, 'utf8') : null;
    writeFileSync(destino, html, 'utf8');
    generados.add(p.archivo);
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

  // Obsoletos: archivos viejos y páginas de industria que dejaron de publicarse.
  const sobran = [...OBSOLETOS];
  const dirInd = join(PUBLIC, 'industrias');
  if (existsSync(dirInd)) for (const f of readdirSync(dirInd)) if (!generados.has(`industrias/${f}`)) sobran.push(`industrias/${f}`);
  for (const f of sobran) {
    const ruta = join(PUBLIC, f);
    if (existsSync(ruta)) { unlinkSync(ruta); if (!silencioso) console.log(`  ${f.padEnd(34)} eliminado (ya no se usa)`); }
  }
  if (!silencioso) console.log(`\n  ${urls.length} páginas en sitemap.xml · css ${hashes.css} · js ${hashes.js}`);
  return { urls, hashes };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log('Construyendo el sitio…');
  try {
    construir();
  } catch (e) {
    console.error('\n' + (e instanceof Error ? e.message : String(e)));
    process.exit(1);
  }
}
