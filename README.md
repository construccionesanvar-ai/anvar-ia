# ANVAR TECH · IA & Automatización — sitio ia.anvartech.cl

Sitio comercial B2B de ANVAR TECH: automatización de procesos, software, datos
e IA aplicada a las operaciones de empresas. Sitio estático generado en
`/public`, funciones serverless en `/api`, publicado en Vercel desde `main`.

> **El repositorio tiene que ser PRIVADO.** Adentro van precios con margen,
> guiones de venta y plantillas de contrato.

## Puesta en marcha

Requiere Node 22 o superior. En Vercel, la versión la define Project Settings → Node.js Version (hoy 24.x); por eso `package.json` no fija `engines`.

```bash
npm install          # herramientas de desarrollo (lint, typecheck); el sitio no tiene dependencias
npm run dev          # build + servidor local en http://127.0.0.1:8123 (URLs limpias y /api, como Vercel)
```

| Comando | Qué hace |
|---|---|
| `npm run build` | Genera `public/*.html`, `sitemap.xml` y `robots.txt` desde `src/` |
| `npm run check` | QA del HTML generado: SEO, enlaces, accesibilidad, precios, WhatsApp, frases prohibidas |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sobre los archivos con `// @ts-check` |
| `npm run test:unit` | Pruebas unitarias (`tests/`, con `node:test`) |
| `npm test` | build + check + unitarias. **Correr siempre antes de un commit** |
| `npm run e2e` | Playwright: flujos críticos, desborde de 320 a 1440 px y consola limpia. Deja capturas en `.e2e/` |
| `npm run qa` | Todo lo anterior seguido |

Para el E2E hace falta Playwright con Chromium (`npm i -D playwright && npx playwright install chromium`).

## Cómo está armado

Las páginas HTML **no se editan a mano**: se generan desde `src/` con un
generador propio en Node, sin dependencias. El HTML generado **sí se versiona**,
y Vercel vuelve a correr `npm run build` en cada deploy.

```
src/
  config.mjs              empresa, contacto, UF de referencia, agenda, analítica, calculadora
  contexto.mjs            página que se está generando (ruta y origen del lead)
  html.mjs                escape, formato de precios en CLP/UF, fechas
  datos/
    oferta.mjs            SERVICIOS y PRECIOS (fuente única) + escalera de contratación
    casos.mjs             casos con etiqueta, métricas, alcance de cada cifra, flujo y media
    testimonios.mjs       testimonios autorizados (hoy vacío, a propósito)
    industrias.mjs        páginas por industria (preparadas, ninguna publicada)
    whatsapp.mjs          mensajes de WhatsApp, origen del lead y armado de enlaces
    contenido.mjs         navegación, problemas, método, seguridad, PROPIEDAD, autodiagnóstico
    faq.mjs               preguntas frecuentes por página (alimentan también el JSON-LD)
  componentes/
    base.mjs              <head>, cabecera, pie, botones, bloque "Evaluar mi proceso"
    secciones.mjs         hero, métricas, casos, testimonios, precios, datos, seguridad, FAQ…
    herramientas.mjs      autodiagnóstico y calculadora (primer render en el servidor)
  paginas/                una por URL (+ plantilla de industria y privacidad)
scripts/
  build.mjs  check.mjs  servidor.mjs  e2e.mjs
tests/                    pruebas unitarias
public/                   lo que publica Vercel (HTML generado, styles.css, app.js, fuentes/)
api/
  contacto.js             formulario → correo (Resend) → CRM en Sheets (opcional)
  diagnostico.js          lectura del autodiagnóstico escrita por IA (opcional)
  uf.js                   valor de la UF del día (CMF o mindicador.cl), con caché
operacion/                material comercial interno (plantillas)
```

## Dónde se cambia cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| **Un precio**, plazo, qué incluye o qué no incluye un servicio | `SERVICIOS` en `src/datos/oferta.mjs`. Se propaga a todas las páginas, al JSON-LD, a la calculadora y al autodiagnóstico. El QA falla si aparece un precio en una página que no salga de ahí |
| El botón de WhatsApp de un servicio | `cta` del servicio en `src/datos/oferta.mjs` |
| **Un caso**, su etiqueta, métricas o el alcance de una cifra | `CASOS` en `src/datos/casos.mjs` (la portada toma sus cifras de ahí: `METRICAS`) |
| **Video o capturas de un caso** | `media` del caso — ver "Evidencia visual de los casos" |
| **Un testimonio** | `src/datos/testimonios.mjs` — ver "Testimonios" |
| Una página por industria | `src/datos/industrias.mjs` — ver "Páginas por industria" |
| Mensajes prellenados de WhatsApp | `MENSAJES` en `src/datos/whatsapp.mjs` |
| Qué se dice sobre propiedad intelectual | `PROPIEDAD` en `src/datos/contenido.mjs` (una sola política para todo el sitio; coincide con la cláusula 7 de `operacion/05-acuerdo-de-servicio.md`) |
| Preguntas frecuentes | `src/datos/faq.mjs` |
| Preguntas del autodiagnóstico | `DIAGNOSTICO` en `src/datos/contenido.mjs` (`wsp` marca las respuestas que viajan en el WhatsApp) |
| WhatsApp, correo, nombre de la empresa, RUT | `SITIO` en `src/config.mjs` |
| UF de referencia | `SITIO.uf` en `src/config.mjs` |
| Link de agenda | `SITIO.agenda.url` en `src/config.mjs` |
| Política de privacidad | `src/paginas/privacidad.mjs` + `SITIO.privacidad.actualizada` |
| Menú principal | `NAVEGACION` en `src/datos/contenido.mjs` |
| Una página nueva | copia una de `src/paginas/`, regístrala en `PAGINAS` de `scripts/build.mjs` |

Después de cualquier cambio: `npm test`, revisar en `npm run dev` y commit.

## Precios y UF

Los proyectos y mensualidades de empresa se cotizan y facturan **en UF**; los
servicios de entrada (Automatización Express) y de personas, en pesos.

La equivalencia en pesos de los precios en UF funciona así:

1. El HTML trae la **UF de referencia** de `SITIO.uf` con su fecha ("con UF de $41.000 al 24/09/2026").
2. Después de cargar, el navegador pide `/api/uf` (CMF si existe `CMF_API_KEY`, si no mindicador.cl;
   caché de 6 horas en la CDN) y reemplaza los pesos y la fecha por los del día.
   La carga de la página **nunca** espera esa llamada.
3. Si `/api/uf` falla y la referencia tiene más de `SITIO.uf.vigenciaDias` días (45), se muestra
   **solo el precio en UF**. El build hace lo mismo si la referencia está vencida. `npm run check`
   avisa cuando se acerca el vencimiento.

En los datos estructurados los precios en UF se declaran en `CLF` (código ISO de la UF), así no se desactualizan.

Automatización Express y ANVAR Intelligence tienen `hipotesis: true`: precios
aprobados pero aún sin validar con clientes. `npm run check` lo recuerda.

## Agenda de 20 minutos

Hoy `SITIO.agenda.url` está vacío: los botones dicen **"Coordinar evaluación por
WhatsApp"** y abren WhatsApp con un mensaje pidiendo horario. El sitio no usa la
palabra "Agendar" ni muestra disponibilidad inventada (el QA lo impide).

Cuando exista el evento en Cal.com, Calendly o Google Calendar (páginas de
reserva), pega la URL pública en `SITIO.agenda.url`, corre `npm test` y publica:
los botones pasan a "Agendar evaluación de 20 min" y abren el calendario en una
pestaña nueva (evento `calendar_click`). Es un enlace, no un iframe: el CSP no cambia.
Actualiza la sección de proveedores de `/privacidad` si el calendario recoge datos.

## WhatsApp y origen del lead

Todos los enlaces a WhatsApp salen de `src/datos/whatsapp.mjs` (en el navegador,
`enlaceWsp()` de `public/app.js` aplica la misma regla). Cada mensaje termina con
`(ref: …)`, el origen del lead:

| ref | Desde |
|---|---|
| `home` | Portada |
| `express` | Automatización Express |
| `data` | Inteligencia de datos / ANVAR Intelligence |
| `diagnosis` | Página del servicio de diagnóstico (UF 12) |
| `diagnostic` | Resultado del **autodiagnóstico** gratuito |
| `pilot` | Piloto e implementación |
| `training` | Capacitación |
| `case-study` | Casos (incluye el código del caso: "Vi el caso C-01…") |
| `personal-advisory` | Asesoría personal |
| `privacy`, `not-found` | Privacidad, 404 |

El mismo valor viaja en el formulario (campo `fuente`) y en cada evento de analítica.

El resultado del autodiagnóstico arma un mensaje con: puntaje, etapa, principal
oportunidad, tiempo en tareas repetidas, dónde está la información, quién decide y
el primer paso sugerido. Solo opciones del cuestionario: nada personal.

## Formulario y correos

`/api/contacto` valida nombre y contacto (WhatsApp de 8+ dígitos o correo), y
frena spam sin captcha: campo trampa, tiempo mínimo de llenado (1,5 s), mismo
origen y 5 envíos por IP cada 10 minutos (en memoria).

El correo llega con asunto `Nuevo lead · <Página> · <Nombre> (<Empresa>)` y el
cuerpo trae página, fuente, nombre, empresa, contacto, qué necesita, el problema
y la fecha, en HTML y texto plano. Si el contacto es un correo, *responder* le
escribe directo (reply-to); si es un teléfono, trae un enlace "Responder por WhatsApp".

Si el correo falla pero el CRM de Sheets guardó el lead, se responde bien (el
lead no se pierde). Si todo falla, el sitio ofrece enviar el mismo mensaje por
WhatsApp, ya redactado. Los registros de error no incluyen datos personales.

Junto al formulario va "Al enviar este formulario aceptas nuestra Política de Privacidad".

## Variables de entorno

Se cargan solo en Vercel (Settings → Environment Variables). Nunca en el repositorio.
Todas son opcionales: sin ellas, el formulario cae a WhatsApp y el autodiagnóstico usa su lectura local.

| Variable | Para qué | Si falta |
|---|---|---|
| `RESEND_API_KEY` | Que el formulario llegue por correo | Cae a WhatsApp (o al CRM, si existe) |
| `NOTIFY_MAIL` (o `NOTIFY_EMAIL`) | A dónde llegan los formularios | contacto@anvartech.cl |
| `CONTACTO_FROM` | Remitente verificado en Resend | `ANVAR TECH <contacto@anvartech.cl>` |
| `SHEETS_WEBHOOK_URL` | Deja cada contacto en el CRM de Sheets | No registra, igual llega el correo |
| `ANTHROPIC_API_KEY` | Lectura del autodiagnóstico escrita por IA | Usa la lectura local |
| `ANTHROPIC_MODEL` | Modelo (por defecto `claude-sonnet-5`) | Usa el de por defecto |
| `CMF_API_KEY` | UF oficial de la CMF (gratis en api.cmfchile.cl) | Usa mindicador.cl |

## Analítica (Vercel Web Analytics)

El sitio carga `/_vercel/insights/script.js` (sin cookies) y envía eventos con
`window.va` desde una sola función, `medir()` en `public/app.js`. `page_view` lo
registra Vercel solo. Los eventos propios requieren un plan de Vercel que los incluya.

| Evento | Cuándo | Datos |
|---|---|---|
| `hero_cta_click` | CTA principal del hero, cabecera, menú o resultado | `etiqueta` |
| `case_study_click` | Clic en un caso, métrica o "Tengo un proceso parecido" | `etiqueta` |
| `cases_view` | La sección de casos entra en pantalla (1 vez) | — |
| `service_click` | Clic hacia la página de un servicio | `etiqueta` |
| `roi_calculator_start` / `_complete` | Primer uso de la calculadora / primer valor soltado (1 vez) | `tramo` |
| `diagnostic_start` / `_complete` | Primera respuesta / resultado mostrado (1 vez por visita) | `indice`, `recomendacion`, `categoria` |
| `diagnostic_whatsapp_click` | "Conversar este resultado por WhatsApp" | `etiqueta` |
| `whatsapp_click` | **Cualquier** enlace a WhatsApp (incluye el anterior) | `contexto`, `etiqueta` |
| `calendar_click` | Botón de agenda real (solo con `SITIO.agenda.url`) | `etiqueta` |
| `email_click` | Enlace al correo | `etiqueta` |
| `form_start` / `form_submit` / `form_error` | Primer uso del formulario (1 vez) / enviado / falló | `tipo` o `motivo` |

Todos llevan `pagina` y `fuente`. Nunca se envía nombre, correo, teléfono ni texto escrito.
Para cambiar de proveedor: ajusta `medir()` y el CSP de `vercel.json`.

## Evidencia visual de los casos

Cada caso muestra hoy su **diagrama de flujo** (texto real, sin marcadores vacíos).
Para agregar un video de 15–30 s:

1. Graba la pantalla (sin datos reales del cliente; en C-03 usa un plano de ejemplo).
2. Exporta MP4 H.264, 1280 px de ancho, sin audio, ≤ 4 MB, y una imagen de portada WebP.
3. Déjalos en `public/casos/` y completa `media` del caso en `src/datos/casos.mjs`:
   ```js
   media: {
     principal: { tipo: 'video', src: '/casos/c01-demo.mp4', poster: '/casos/c01-poster.webp',
                  alt: 'Se ingresan los datos una vez y se generan los ocho documentos',
                  ancho: 1280, alto: 720, duracion: '0:24' },
     galeria: [{ tipo: 'captura', src: '/casos/c01-form.webp', alt: '…', ancho: 1200, alto: 750 }],
   }
   ```
4. `npm test`. Si un archivo no existe, **el build falla**: nunca se publica un reproductor roto.

Tipos: `video` (en bucle, sin sonido, con controles, no se descarga hasta que se reproduce),
`gif`, `imagen`, `captura`, y `demo: { url, texto }` para una demostración en línea.
`npm run check` lista la evidencia pendiente de cada caso (`evidenciaPendiente`).

## Testimonios

No hay ninguno publicado y la sección **no aparece** hasta que exista uno con
autorización registrada. Para agregar uno, sigue los pasos al inicio de
`src/datos/testimonios.mjs`: frase textual, nombre, cargo, empresa, industria,
logo y foto opcionales, `confidencial: true` si el cliente pidió reserva (se
muestra solo cargo e industria), caso y resultado relacionados, y la fecha y el
medio de la autorización. Sin `autorizado`, no se publica.

## Páginas por industria

`src/datos/industrias.mjs` lista metalmecánica, retail, bodegas, servicios
técnicos y construcción, todas con `publicada: false`. Al publicar una, el build
genera `/industrias/<slug>`, la suma al sitemap, y **falla** si le faltan
título, descripción, 3 problemas propios del rubro o 1 caso del rubro. No se
publican páginas SEO vacías.

## Privacidad

`/privacidad` describe lo que el sitio hace hoy: formulario, WhatsApp,
autodiagnóstico, calculadora, analítica sin cookies, registros técnicos,
proveedores (Vercel, Resend, proveedor de correo, Anthropic, WhatsApp),
transferencias, conservación, derechos y seguridad sin promesas absolutas. No
hay cookies, así que no hay aviso de cookies.

**No es asesoría legal.** Los puntos por validar están en `PENDIENTES_PRIVACIDAD`
(`src/paginas/privacidad.mjs`) y `npm run check` los muestra en cada ejecución.
Si cambia un proveedor, se agrega un CRM, una agenda o cookies, actualiza la página
y `SITIO.privacidad.actualizada`.

## SEO técnico

- `robots.txt` y `sitemap.xml` se generan en cada build. El sitemap incluye todas las páginas
  indexables (portada, Express, datos, casos, diagnóstico, piloto, capacitación, asesoría personal,
  privacidad) y conserva `lastmod` si la página no cambió. Nunca incluye páginas `noindex` (404).
- Cada página: título y descripción únicos, canonical absoluta sin barra final, Open Graph, un solo `<h1>`
  y títulos sin saltos de nivel (el QA lo exige).
- Datos estructurados: `ProfessionalService` (en todas), `WebSite` (portada), `Service` con ofertas,
  `FAQPage` y `BreadcrumbList` por página, `WebPage` en privacidad. Sin reseñas ni calificaciones.
- `vercel.json`: `cleanUrls` (`/casos.html` → `/casos`), `trailingSlash: false`, redirecciones de
  `/index` y alias de privacidad, `noindex` para `/api/*`, CSP estricto.

### Google Search Console (lo hace el dueño de la cuenta)

1. **Propiedad**: ya hay verificación por archivo (`public/google122ea0ce84fcb2ef.html`) y por etiqueta
   `<meta name="google-site-verification">` en todas las páginas. En Search Console confirma que la
   propiedad `https://ia.anvartech.cl/` (prefijo de URL) aparece verificada. Si prefieres una propiedad
   de dominio (`anvartech.cl`), verifícala por DNS.
2. **Sitemap**: Indexación → Sitemaps → enviar `https://ia.anvartech.cl/sitemap.xml`. Debe quedar
   "Correcto" con 9 URLs descubiertas.
3. **Inspección de URL** y **Solicitar indexación**, en este orden:
   `https://ia.anvartech.cl/`, `/automatizacion-express`, `/casos`, `/diagnostico-ia-empresas`,
   `/inteligencia-datos`, `/automatizacion-procesos-ia`, `/asesoria-ia-personal`, `/privacidad`,
   `/capacitacion-ia-empresas`. En cada una revisa que la "URL canónica seleccionada por Google"
   coincida con la declarada.
4. **Cobertura** (Indexación → Páginas), a los 7–14 días: todas las URLs del sitemap deben estar
   "Indexadas". Revisa los motivos de las excluidas; "Página con redirección" para `/index` o URLs
   `.html` es normal.
5. **Core Web Vitals** (Experiencia): aparece cuando hay tráfico suficiente. LCP < 2,5 s,
   INP < 200 ms y CLS < 0,1 en móvil.
6. **Mejoras**: el informe de Rutas de exploración (breadcrumbs) no debe mostrar errores.
   Si aparece un error de datos estructurados, pega la URL en https://search.google.com/test/rich-results.
7. **Seguimiento**: una vez al mes, Rendimiento → consultas y páginas; cruza con los eventos
   `whatsapp_click` y `form_submit` de Vercel Analytics por `fuente`.

## Rendimiento

- Tipografías servidas desde `/fuentes` (subconjunto latino, woff2, `font-display: swap`) y
  precargadas las dos del primer render. Sin Google Fonts ni scripts de terceros.
- Retrato en WebP/JPEG con `srcset`, `loading="lazy"`; videos de casos con `preload="none"`.
- Un CSS y un JS (`defer`), con `?v=hash` para invalidar caché solo cuando cambian.
- La UF y la lectura por IA se piden después de cargar: nunca bloquean el render.

## Caché: por qué css y js NO son inmutables

`styles.css` y `app.js` conservan el nombre entre versiones. El build agrega a
cada referencia un `?v=` con el hash del contenido. `vercel.json` sirve:

| Tipo | Política |
|---|---|
| css, js | `max-age=0, must-revalidate` |
| imágenes y videos | `max-age=86400, must-revalidate` |
| tipografías | `max-age=31536000, immutable` (si reemplazas una, cámbiale el nombre) |

> **Ojo con `vercel.json`:** cada entrada de `headers` acepta solo `source`,
> `headers`, `has` y `missing`. Una clave extra hace fallar el deploy **sin logs
> de build**. `npm run check` lo revisa.

## Reglas del sitio que el QA hace cumplir

- Sin `style=""` ni scripts en línea (CSP). Sin Google Fonts.
- Un `<h1>` por página, títulos sin saltos, títulos y descripciones únicos, canonical absoluta.
- Toda imagen con `alt`, todo campo con `<label>`, referencias ARIA válidas, sin ids repetidos,
  enlaces y botones con texto accesible, `target="_blank"` con `rel="noopener"`.
- Precios: todo "UF n" y "$n.nnn" visible sale de `src/datos/oferta.mjs` o de la UF.
- WhatsApp: todo enlace lleva mensaje y `(ref: …)`.
- Sin "Agendar" mientras no haya agenda real.
- Formularios con enlace a la privacidad; pie con enlace a la privacidad.
- Frases vetadas: "desde UF 28" como precio del piloto, "el más elegido", "no vengo del mundo del
  software", "revolucionamos", "el futuro de la IA", "sin límites", "clase mundial", "potencia tu
  empresa", promesas de seguridad absoluta y propiedad intelectual absoluta ("queda en tu poder").

Y las que no puede revisar una máquina: **no publicar clientes, testimonios,
logos, métricas, certificaciones ni integraciones que no existan.** Cada caso
lleva su etiqueta y, si la cifra tiene límites, su "alcance de la cifra".

## Publicar

Cada `git push` a `main` publica solo en Vercel (proyecto `anvar-ia`, equipo
ANVAR TECH): Vercel corre `npm install` y `npm run build`. Lo que Vercel no corre
es `npm run check` ni las pruebas: hazlo tú antes del push (`npm run qa`).

## Documentos publicados

Viven como Artifacts en claude.ai. Se actualizan republicando el archivo local;
desde otra conversación hay que pasar la URL como `url` o se crea uno nuevo.

| Documento | Archivo | URL |
|---|---|---|
| El sitio (versión anterior) | `artifact-anvar-ia.html` | https://claude.ai/code/artifact/a0f3ef6f-e812-4aa9-ba10-48d38551b70f |
| Propuesta de lanzamiento | `propuesta.html` | https://claude.ai/code/artifact/c0cb6926-83e2-4f32-926e-9ca2eb9803bd |
| **Manual de operación** | `manual.html` | https://claude.ai/code/artifact/973bbe6c-8998-4466-bea5-9e3b5590a279 |
| Ensayo de cliente | `ensayo.html` | https://claude.ai/code/artifact/05be5c9d-010b-419d-86a6-5cd756a9731c |

| Cód. | Servicio | URL |
|---|---|---|
| S-01 | Sesión Despegue | https://claude.ai/code/artifact/0932bec9-b9d2-4d8b-8a64-09473d13260c |
| S-02 | Plan Piloto Personal | https://claude.ai/code/artifact/c5c2e003-611d-4612-b585-0fae1c2c4e57 |
| S-03 | Acompañamiento Personal | https://claude.ai/code/artifact/cb3322bb-60cc-4bef-85dd-806f525bfaef |
| E-01 | Diagnóstico IA | https://claude.ai/code/artifact/2a4c6f33-e74d-4003-8f40-06fdeb81bb52 |
| E-02 | Piloto en Producción | https://claude.ai/code/artifact/b3d5fde5-ba65-4d7f-b8c4-53d9137f44f6 |
| E-03 | Implementación a Medida | https://claude.ai/code/artifact/3d7701ca-cfeb-4312-97db-a9265da36fa4 |
| E-04 | Capacitación In-Company | https://claude.ai/code/artifact/61751856-616f-4627-9092-e442c1e2b6f8 |
| E-05 | Acompañamiento Empresa | https://claude.ai/code/artifact/e2177007-906c-47b6-baf3-bbf5f66eb223 |

> Los documentos internos (manual, propuesta, ensayo, planes) todavía no incluyen
> Automatización Express ni ANVAR Intelligence. El sitio publicado es la fuente
> vigente de precios y servicios.
