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
import { precioTexto, absoluta, rutaOg, esc } from '../src/html.mjs';
import { RECURSOS, AUTOR } from '../src/datos/recursos.mjs';
import { SOLUCIONES } from '../src/datos/soluciones.mjs';
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
import calculadora from '../src/paginas/calculadora.mjs';
import autodiagnostico from '../src/paginas/autodiagnostico.mjs';
import puntoPedido from '../src/paginas/punto-pedido.mjs';
import pymes from '../src/paginas/soluciones/pymes.mjs';
import documental from '../src/paginas/soluciones/documental.mjs';
import excel from '../src/paginas/soluciones/excel.mjs';
import cotizaciones from '../src/paginas/soluciones/cotizaciones.mjs';
import autocad from '../src/paginas/soluciones/autocad.mjs';
import casoC01 from '../src/paginas/caso-c01.mjs';
import recursosIndice from '../src/paginas/recursos/indice.mjs';
import plantillaRoi from '../src/paginas/recursos/plantilla-roi.mjs';
import cuantoCuesta from '../src/paginas/recursos/cuanto-cuesta.mjs';
import comoDetectar from '../src/paginas/recursos/como-detectar.mjs';
import noAutomatizar from '../src/paginas/recursos/no-automatizar.mjs';
import iaVsTradicional from '../src/paginas/recursos/ia-vs-tradicional.mjs';
import privacidad from '../src/paginas/privacidad.mjs';
import noEncontrada from '../src/paginas/no-encontrada.mjs';
import { paginaIndustria } from '../src/paginas/industria.mjs';

/**
 * @typedef {{ ruta: string, archivo: string, titulo: string, descripcion: string,
 *   cuerpo: () => string, fuente: string, contextoWsp?: string, ogTitulo?: string,
 *   og?: { titulo: string, bajada: string, etiqueta: string },
 *   articulo?: { publicado: string, actualizado: string },
 *   jsonld?: object[], noindex?: boolean, enSitemap?: boolean, prioridad?: string }} Pagina
 */

/** Para agregar una página: créala en src/paginas y súmala aquí. */
/** @type {Pagina[]} */
export const PAGINAS = [
  inicio, casos, express, datos, diagnostico, automatizacion, capacitacion,
  // Herramientas gratuitas y soluciones de alta intención
  calculadora, autodiagnostico, puntoPedido,
  pymes, documental, excel, cotizaciones, autocad,
  // Contenido: caso largo, índice y guías
  casoC01, recursosIndice, plantillaRoi, cuantoCuesta, comoDetectar, noAutomatizar, iaVsTradicional,
  personal, privacidad,
  ...publicadas().map(paginaIndustria),
  noEncontrada,
];

/** Imagen para compartir: la propia si existe (scripts/og.mjs), si no la general. */
export const imagenOg = (/** @type {Pagina} */ p) => (existsSync(join(PUBLIC, rutaOg(p.ruta))) ? rutaOg(p.ruta) : '/og-image.png');

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

/** RSS 2.0 con las guías y casos largos (lo que tiene sentido seguir). */
function feed() {
  const items = RECURSOS.filter((r) => r.enFeed).sort((a, b) => b.actualizado.localeCompare(a.actualizado));
  const fecha = (iso) => new Date(iso + 'T12:00:00-03:00').toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>ANVAR TECH · Recursos sobre automatización de procesos</title>
  <link>${SITIO.dominio}/recursos</link>
  <atom:link href="${SITIO.dominio}/feed.xml" rel="self" type="application/rss+xml"/>
  <description>Guías, casos y herramientas para decidir qué automatizar en una empresa, con experiencia real.</description>
  <language>es-cl</language>
  <lastBuildDate>${fecha(items[0]?.actualizado ?? SITIO.privacidad.actualizada)}</lastBuildDate>
${items.map((r) => `  <item>
    <title>${esc(r.titulo)}</title>
    <link>${absoluta(r.ruta)}</link>
    <guid isPermaLink="true">${absoluta(r.ruta)}</guid>
    <description>${esc(r.descripcion)}</description>
    <pubDate>${fecha(r.publicado)}</pubDate>
    <author>${esc(SITIO.contacto.email)} (${esc(AUTOR.nombre)})</author>
  </item>`).join('\n')}
</channel>
</rss>
`;
}

/** llms.txt: resumen breve y verificable del sitio para sistemas que lo lean. */
function llms() {
  const S = SERVICIOS;
  const precio = (id) => {
    const t = precioTexto(S[id].precio);
    return S[id].precio.moneda === 'UF' ? `${t.principal} + IVA` : `${t.principal} ${t.detalle}`;
  };
  const enlace = (nombre, ruta, texto) => `- [${nombre}](${absoluta(ruta)}): ${texto}`;
  return `# ${SITIO.marca} · ${SITIO.linea}

> Empresa chilena (${SITIO.empresa.nombre}, RUT ${SITIO.empresa.rut}) que automatiza procesos de empresas con software, datos e IA aplicada a operaciones. Trabaja sobre las herramientas que el cliente ya usa (Excel, Word, PDF, correo, WhatsApp, ERP, AutoCAD) y mide cada proceso antes y después. Atención presencial en la Región Metropolitana y remota en todo Chile. Contacto: ${SITIO.contacto.email}, WhatsApp +${SITIO.contacto.whatsapp}.

Los casos publicados llevan una etiqueta que dice si son proyecto propio, cliente, cliente confidencial o demostración. Las cifras tienen su alcance declarado. Precios netos, para empresas.

## Servicios
${['express', 'diagnostico', 'piloto', 'implementacion', 'soporte', 'intelligence', 'capacitacion'].map((id) => enlace(S[id].nombre, S[id].url.split('#')[0], `${S[id].resumen} ${precio(id)}.`)).join('\n')}

## Soluciones por tipo de proceso
${SOLUCIONES.map((s) => enlace(s.nombre, s.ruta, s.texto)).join('\n')}

## Casos
- [Casos reales](${absoluta('/casos')}): documentos (C-01, 45 → 4 min por procedimiento), venta en línea (C-02), planos en AutoCAD (C-03), pronóstico de stock (C-04, prototipo académico).
${RECURSOS.filter((r) => r.tipo === 'caso').map((r) => enlace(r.tituloCorto, r.ruta, r.descripcion)).join('\n')}

## Herramientas gratuitas
${RECURSOS.filter((r) => r.tipo === 'herramienta' || r.tipo === 'plantilla').map((r) => enlace(r.tituloCorto, r.ruta, r.descripcion)).join('\n')}

## Guías
${RECURSOS.filter((r) => r.tipo === 'guia').map((r) => enlace(r.tituloCorto, r.ruta, r.descripcion)).join('\n')}

## Optional
- [Asesoría personal en IA](${absoluta('/asesoria-ia-personal')}): línea secundaria para personas.
- [Política de privacidad](${absoluta('/privacidad')})
`;
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
      ogImagen: imagenOg(p),
      articulo: p.articulo,
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
  writeFileSync(join(PUBLIC, 'feed.xml'), feed(), 'utf8');
  writeFileSync(join(PUBLIC, 'llms.txt'), llms(), 'utf8');
  // IndexNow: la clave se publica en /<clave>.txt. Rotarla = cambiarla en config.mjs.
  const clave = SITIO.indexnow.clave;
  for (const f of readdirSync(PUBLIC)) if (/^[a-f0-9]{32}\.txt$/.test(f) && f !== `${clave}.txt`) unlinkSync(join(PUBLIC, f));
  writeFileSync(join(PUBLIC, `${clave}.txt`), clave, 'utf8');

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
