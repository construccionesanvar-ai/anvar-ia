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
    recursos.mjs          RECURSOS (guías, caso largo, herramientas, plantilla) y AUTOR: fuente del
                          índice /recursos, del feed RSS, de llms.txt y de las tarjetas "Relacionado"
    soluciones.mjs        landings de solución (pymes, documental, Excel, cotizaciones, AutoCAD)
  componentes/
    base.mjs              <head>, cabecera, pie, botones, bloque "Evaluar mi proceso"
    secciones.mjs         hero, métricas, casos, testimonios, precios, datos, seguridad, FAQ…
    herramientas.mjs      autodiagnóstico, calculadora de ROI y punto de pedido (primer render en el servidor)
    articulo.mjs          contenido largo: autor y fechas, "En corto", índice, CTA de contenido, relacionados
  paginas/                una por URL (+ plantilla de industria y privacidad)
    soluciones/           landings de alta intención
    recursos/             índice, plantilla y guías (_guia.mjs arma cada guía)
scripts/
  build.mjs  check.mjs  servidor.mjs  e2e.mjs
  og.mjs                  imágenes para compartir (npm run og)
  indexnow.mjs            aviso a Bing/IndexNow (lo corre .github/workflows/indexnow.yml)
  smoke.mjs               verificación de la web pública (lo corre .github/workflows/verificacion.yml)
  utm.mjs                 enlaces con UTM (npm run utm)
  plantillas/roi.py       genera public/descargas/plantilla-roi-automatizacion.xlsx
docs/                     SEO, Search Console, Bing, distribución, Google Business Profile, lanzamiento
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
| **Razón social, RUT**, relación marca → sociedad | `SITIO.empresa` en `src/config.mjs` (ver "Identidad empresarial") |
| WhatsApp, correo | `SITIO.contacto` en `src/config.mjs` |
| UF de referencia de la calculadora | `SITIO.uf` en `src/config.mjs` (ver "Precios y UF") |
| **Fórmulas** de la calculadora de ROI y del punto de pedido | `src/calculo.mjs` (única fuente; el build genera `public/calculo.js`) |
| Ejemplo y supuestos de la calculadora | `CALCULADORA` en `src/config.mjs` |
| Autor (perfil, bio, perfiles públicos) | `SITIO.fundador` en `src/config.mjs` y `AUTOR` en `src/datos/recursos.mjs` |
| Link de agenda | `SITIO.agenda.url` en `src/config.mjs` |
| Política de privacidad | `src/paginas/privacidad.mjs` + `SITIO.privacidad.actualizada` |
| Menú principal | `NAVEGACION` en `src/datos/contenido.mjs` |
| Una página nueva | copia una de `src/paginas/`, regístrala en `PAGINAS` de `scripts/build.mjs`. **Hasta mediados de octubre de 2026 no se crean páginas nuevas**: ver `docs/SEO_MEASUREMENT_CHECKLIST.md` |

Después de cualquier cambio: `npm test`, revisar en `npm run dev` y commit.

## Identidad empresarial

**ANVAR TECH es una marca de ANVAR Construcciones SpA (RUT 77.982.517-5).** Esa sociedad presta
los servicios, emite las facturas, firma contratos y acuerdos de confidencialidad y es la
responsable de los datos personales. Fuente: el repositorio de anvartech.cl (`CLAUDE.md`, "Datos
del negocio") y el propio anvartech.cl, que factura con esa razón social y ese RUT.

- Todo sale de `SITIO.empresa` en `src/config.mjs`: pie ("Razón social", "RUT" y la frase
  "ANVAR TECH es una marca de…"), privacidad (responsable), JSON-LD (`legalName`, `taxID`) y llms.txt.
- La marca visible sigue siendo ANVAR TECH. No se usa "ANVAR TECH SpA": no existe una sociedad
  con ese nombre.
- Las plantillas de `operacion/` (acuerdo de servicio, informe, acta) repiten estos datos a mano:
  si cambia la sociedad, actualízalas también.
- No se publica la dirección exacta (domicilio legal en Quinta Normal): el sitio dice "Región Metropolitana".

## Precios y UF

Los proyectos y mensualidades de empresa se cotizan y facturan **en UF**; los
servicios de entrada (Automatización Express) y de personas, en pesos.

**El HTML nunca trae una equivalencia en pesos fija** de un precio en UF: una cifra así envejece
al día siguiente. Funciona así:

1. El HTML muestra el precio en UF y "+ IVA" (por ejemplo, "UF 12 + IVA").
2. Después de cargar, el navegador pide `/api/uf` (CMF si existe `CMF_API_KEY`, si no mindicador.cl;
   timeout de 7 s por fuente; caché de 6 horas en la CDN y en memoria; si la fuente no responde al
   renovar, sirve el último valor solo si es del mismo día en Chile) y agrega "≈ $X + IVA" con la **fecha del
   valor** a la vista ("Equivalencia en pesos con la UF del 25/09/2026"). La carga de la página
   **nunca** espera esa llamada.
3. Si `/api/uf` falla, queda solo el precio en UF y la nota dice "Equivalencia en pesos no
   disponible temporalmente". No se muestra ningún valor viejo.

`SITIO.uf` (valor y fecha de referencia) se usa **solo** en la calculadora de ROI, para el cálculo
inicial de la opción "Piloto", siempre rotulado "con UF de referencia ($41.000 al 24/09/2026)", y
se reemplaza por la UF del día apenas llega. `npm run check` avisa si esa referencia tiene más de
60 días. Toda conversión UF → pesos pasa por `opcionesInversion()` (servidor) o por la UF del día
que expone `app.js` (navegador): no hay valores de UF copiados en otros archivos.

En los datos estructurados los precios en UF se declaran en `CLF` (código ISO de la UF), así no se desactualizan.

Automatización Express y ANVAR Intelligence tienen `hipotesis: true`: precios
aprobados pero aún sin validar con clientes. `npm run check` lo recuerda.

## Calculadora de ROI

Vive en `/calculadora-roi-automatizacion` (la portada solo enlaza). Entradas: personas, horas a la
semana, costo por hora, % automatizable, **inversión a comparar** (Automatización Express, Piloto
o "Otro monto") y **costo mensual** opcional. Resultados: horas manuales al año, costo anual actual,
horas recuperables, ahorro bruto anual, inversión, costos recurrentes, ahorro neto del año 1,
payback, ROI año 1 y ROI a 3 años. Las fórmulas están a la vista en la página y en `src/calculo.mjs`.

- **Una sola fuente:** `src/calculo.mjs` (sin imports). El build la usa para el HTML inicial y
  genera `public/calculo.js` para el navegador; `tests/organico.test.mjs` comprueba que el archivo
  generado esté al día y dé el mismo resultado.
- **Casos límite:** sin ahorro o sin inversión → "No aplica"; costos recurrentes ≥ ahorro →
  "Sin recuperación"; payback > 36 meses → "Más de 36 meses". Nunca Infinity, NaN ni -0
  (`tests/calculo.test.mjs`, 11 pruebas con casos calculados a mano).
- **Plantilla Excel** (`scripts/plantillas/roi.py`): mismas fórmulas y mismas etiquetas; con el
  ejemplo (5 personas, 6 h/semana, $9.000, 60 %, $1.640.000) da exactamente lo mismo que la web
  (payback 2,76 meses, ROI 335 %, ROI 3 años 1.204 %).

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

**Regla: un clic = un evento.** Un clic en WhatsApp genera solo su evento de lead (no se suma un
`data-track`). Los eventos "de una vez" (`start`, `complete`, `view`) no se repiten en la visita.

| Grupo | Evento | Cuándo | Datos |
|---|---|---|---|
| Visita | `organic_landing_view` | Primera página de cada visita (1 vez por pestaña) | `landing`, `canal`, `campana` |
| Visita | `resource_view` | Abre `/recursos` o un recurso | `tipo` |
| Visita | `case_view` | Abre un caso largo, o ve la sección de casos | `lugar` |
| Portada | `home_roi_tool_click` / `home_diagnostic_tool_click` | Tarjetas de herramientas | `etiqueta` |
| Herramientas | `calculator_view` · `calculator_start` · `calculator_complete` | Se ve / primer uso / primer resultado | `herramienta` (`roi`, `punto-pedido`); `inversion`, `estado`, `tramo` o `nivel` |
| Herramientas | `diagnostic_view` · `diagnostic_start` · `diagnostic_complete` | Se ve / primera respuesta / resultado | `indice`, `recomendacion`, `categoria` |
| Contenido | `hero_cta_click`, `content_cta_click`, `case_cta_click`, `service_click`, `email_click` | Clics en CTA, guías, casos, servicios, correo | `etiqueta` |
| Contenido | `template_download` | Descarga de la plantilla Excel | `etiqueta` |
| Lead | `express_lead` | WhatsApp de Automatización Express | `contexto`, `etiqueta`, `via` + atribución |
| Lead | `data_lead` | WhatsApp de datos / ANVAR Intelligence | ídem |
| Lead | `diagnostic_lead` | "Conversar este resultado por WhatsApp" (autodiagnóstico) | ídem |
| Lead | `case_lead` | "Tengo un proceso parecido" en un caso | ídem |
| Lead | `whatsapp_lead` | Cualquier otro WhatsApp (general, agenda, piloto…) | ídem |
| Lead | `service_lead` | Formulario enviado | `tipo` + atribución |
| Formulario | `form_start` / `form_error` | Primer uso del formulario / falló | `motivo` |

Todos llevan `pagina` y `fuente`. Los de lead llevan la **atribución de la visita**: `landing`
(primera página), `canal` (`google/organic`, `bing/organic`, `linkedin/social`, `chatgpt.com/ai`,
`directo`, `anvartech.cl/referral`, `<dominio>/referral` o `utm_source/utm_medium`) y `campana`
(`utm_campaign`). Se guarda en `sessionStorage` (se borra al cerrar la pestaña). Nunca se envía
nombre, correo, teléfono, texto escrito ni la URL completa del referente.
Enlaces con UTM: `npm run utm -- <ruta> <fuente> <medio> <campaña>` (convenciones en
`docs/CONTENT_DISTRIBUTION.md`).

> Cambios de nombre. Hasta 2.1: `whatsapp_click`, `form_submit`, `case_study_click`,
> `roi_calculator_*`. En 2.2: `cases_view` pasó a `case_view` y `diagnostic_whatsapp_click` a
> `diagnostic_lead`; los WhatsApp de Express, datos y casos pasaron de `whatsapp_lead` a
> `express_lead`, `data_lead` y `case_lead`. Para totales de leads, suma todos los `*_lead`.
Para cambiar de proveedor: ajusta `medir()` y el CSP de `vercel.json`.

## Evidencia visual de los casos

Cada caso muestra hoy su **diagrama de flujo** (texto real, sin marcadores vacíos). Qué grabar y
cómo: `docs/CASE_VIDEO_SHOTLIST.md`. Para publicar un video:

1. Exporta MP4 H.264 (obligatorio) y, si puedes, WebM (VP9, más liviano); 1280 px de ancho,
   20–30 s, sin audio, ≤ 4 MB. Un poster WebP (obligatorio) y, si hay texto hablado, subtítulos `.vtt`.
2. Déjalos en `public/casos/` y completa `media` del caso en `src/datos/casos.mjs`:
   ```js
   media: {
     principal: { tipo: 'video', src: '/casos/c01-demo.mp4', webm: '/casos/c01-demo.webm',
                  poster: '/casos/c01-poster.webp', subtitulos: '/casos/c01-demo.vtt',
                  alt: 'Se ingresan los datos una vez y se generan los ocho documentos',
                  ancho: 1280, alto: 720, duracion: '0:24', leyenda: 'Datos de prueba' },
     galeria: [{ tipo: 'captura', src: '/casos/c01-form.webp', alt: '…', ancho: 1200, alto: 750 }],
   }
   ```
3. `npm test`. Si falta un archivo (video, WebM, poster o subtítulos declarados), **el build falla**.

Cómo se muestra: **miniatura → reproducir**. La página carga solo el poster (diferido, con ancho y
alto para no mover el diseño) y un botón "Ver video (0:24)". El `<video>` con WebM, MP4 y
subtítulos se crea recién al hacer clic, así varios videos no pesan en la carga (Core Web Vitals).
Sin JavaScript, el enlace abre el MP4. También: `gif`, `imagen`, `captura` (carga diferida) y
`demo: { url, texto }`. `npm run check` lista la evidencia pendiente (`evidenciaPendiente`).

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

- `robots.txt`, `sitemap.xml` (25 URL), `feed.xml` (RSS de guías y caso largo), `llms.txt` y la
  clave de IndexNow se generan en cada build. El sitemap conserva `lastmod` si la página no cambió
  y nunca incluye páginas `noindex` (404).
- Cada página: título y descripción únicos, canonical absoluta sin barra final, Open Graph con imagen
  propia (`public/og/`, `npm run og`), un solo `<h1>` y títulos sin saltos de nivel (el QA lo exige).
- Datos estructurados: `ProfessionalService` con logo, contacto y `sameAs` (en todas), `WebSite`
  (portada), `Service` con ofertas, `WebApplication` gratuita en las herramientas, `Article` con autor
  y fechas en guías y caso largo, `CollectionPage` en /recursos, `FAQPage` **solo con preguntas
  visibles** y `BreadcrumbList`. Sin reseñas ni calificaciones: el QA falla si aparecen.
- El QA también exige: ninguna página indexable huérfana, `og:image` existente, feed y llms.txt sin
  enlaces rotos, clave de IndexNow publicada.
- `vercel.json`: `cleanUrls`, `trailingSlash: false`, redirecciones (`/index`, alias de privacidad,
  `/calculadora`, `/autodiagnostico`, `/herramientas`, `/blog`, `/guias`, `/rss`), `noindex` para
  `/api/*` y `/descargas/*`, CSP estricto.
- **IndexNow** (Bing y otros): clave pública en `src/config.mjs` → `public/<clave>.txt`. Después de
  cada push a `main` que toca `public/`, `.github/workflows/indexnow.yml` espera a que producción
  sirva el sitemap nuevo y avisa solo las URL que cambiaron. Manual: `npm run indexnow -- --urls /a,/b`.
  Rotar la clave: poner una nueva de 32 caracteres hex en `SITIO.indexnow.clave` y `npm run build`
  (el build borra la anterior).
- Guías completas: `docs/SEARCH_CONSOLE_SETUP.md`, `docs/BING_WEBMASTER_SETUP.md`,
  `docs/SEO_CONTENT_MAP.md` (qué página responde a qué búsqueda) y `docs/SEO_GROWTH_LOOP.md`.

### Contenido orgánico: cómo agregar o cambiar

- **Una guía nueva**: copia una de `src/paginas/recursos/`, regístrala en `RECURSOS`
  (`src/datos/recursos.mjs`) con fechas reales, agrégala a `PAGINAS` en `scripts/build.mjs`,
  corre `npm run og` y `npm run build`. Antes, revisa `docs/SEO_CONTENT_MAP.md`: si ya hay una
  página para esa búsqueda, mejora esa en vez de crear otra.
- **Actualizar una guía**: cambia `actualizado` en `RECURSOS` solo si cambió el contenido de verdad.
- **Imágenes para compartir**: `npm run og` regenera solo las que cambiaron (`--todas` para todas).
- **Plantilla Excel**: `python3 scripts/plantillas/roi.py` y luego recalcular con LibreOffice
  (instrucciones al inicio del script). El QA verifica que el archivo exista.

### Google Search Console (lo hace el dueño de la cuenta)

> Versión completa y actualizada: `docs/SEARCH_CONSOLE_SETUP.md`.

1. **Propiedad**: ya hay verificación por archivo (`public/google122ea0ce84fcb2ef.html`) y por etiqueta
   `<meta name="google-site-verification">` en todas las páginas. En Search Console confirma que la
   propiedad `https://ia.anvartech.cl/` (prefijo de URL) aparece verificada. Si prefieres una propiedad
   de dominio (`anvartech.cl`), verifícala por DNS.
2. **Sitemap**: Indexación → Sitemaps → enviar `https://ia.anvartech.cl/sitemap.xml`. Debe quedar
   "Correcto" con 25 URLs descubiertas.
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
   `whatsapp_lead` y `service_lead` de Vercel Analytics por `fuente` y `canal`.

## Rendimiento

- Tipografías servidas desde `/fuentes` (subconjunto latino, woff2, `font-display: swap`) y
  precargadas las dos del primer render. Sin Google Fonts ni scripts de terceros.
- Retrato en WebP/JPEG con `srcset`, `loading="lazy"`; videos de casos como miniatura → reproducir.
- Un CSS y JS con `defer` y `?v=hash`: `app.js` (común, ~6 KB comprimido) en todas las páginas;
  `herramientas.js` y `calculo.js` **solo** en las páginas que tienen una herramienta. La config
  del navegador (`#config`) lleva los datos de cada herramienta solo donde se usa.
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

Flujo habitual: rama → pull request → merge a `main` → Vercel publica en ~15 s. Después de cada
push a `main` corren dos workflows de GitHub Actions (pestaña Actions):

- **Verificación post-deploy** (`scripts/smoke.mjs`): espera a que `ia.anvartech.cl` sirva
  exactamente el HTML del commit y revisa contra la web pública todas las páginas del sitemap, redirecciones,
  cabeceras de seguridad, imágenes OG, CSS/JS, la descarga XLSX, robots, sitemap, feed,
  llms.txt, la clave de IndexNow y el 404. Si falla, GitHub avisa por correo.
- **IndexNow**: avisa a Bing y compañía solo las páginas que cambiaron (ver SEO técnico).

Ninguno bloquea el deploy. Para correr la verificación a mano: `npm run smoke`.

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
