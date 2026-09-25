# ANVAR TECH · IA & Automatización — sitio ia.anvartech.cl

Sitio comercial B2B de ANVAR TECH: automatización de procesos, inteligencia
operacional y soluciones de IA para empresas. Sitio estático en `/public`,
funciones serverless en `/api`, publicado en Vercel desde `main`.

> **El repositorio tiene que ser PRIVADO.** Adentro van precios con margen,
> guiones de venta y plantillas de contrato.

## Cómo se trabaja ahora (importante)

Las páginas HTML **ya no se editan a mano**. Se generan desde `src/` con un
generador propio en Node, sin dependencias:

```bash
npm run build     # genera public/*.html, sitemap.xml y robots.txt
npm run check     # control de calidad: SEO, enlaces, accesibilidad, reglas del sitio
npm test          # las dos cosas seguidas (correr siempre antes de un commit)
npm run dev       # build + servidor local en http://127.0.0.1:8123
```

El HTML generado **sí se versiona**, así que Vercel publica igual que antes: sin
paso de build y sin tocar la configuración del proyecto.

Si `npm run check` sale con errores, no hagas push: algo quedó roto (un enlace, un
ancla, un precio prohibido, un `style=""` que el CSP bloquearía, etc.).

```
src/
  config.mjs              datos de la empresa, contacto, UF de referencia, URL de agenda
  html.mjs                utilidades: escape, formato de precios en CLP/UF
  datos/
    oferta.mjs            SERVICIOS y PRECIOS (fuente única) + la escalera de contratación
    casos.mjs             casos reales con su etiqueta, y las métricas de portada
    contenido.mjs         navegación, problemas, método, seguridad, mensajes de WhatsApp,
                          preguntas del diagnóstico
    faq.mjs               preguntas frecuentes por página (alimentan también el JSON-LD)
  componentes/
    base.mjs              cabecera, pie, botones, bloque "Evaluar mi proceso", <head> completo
    secciones.mjs         hero, métricas, problemas, casos, método, precios, datos,
                          seguridad, nosotros, FAQ y bloques de páginas de servicio
    herramientas.mjs      diagnóstico y calculadora (primer render en el servidor)
  paginas/                una por URL: ruta, título, descripción, JSON-LD y cuerpo
scripts/
  build.mjs               genera el sitio
  check.mjs               QA automático
public/                   lo que publica Vercel
  *.html                  GENERADOS, no editar
  styles.css              sistema de diseño (claro + oscuro)
  app.js                  menú móvil, diagnóstico, calculadora, formulario, analítica
api/
  contacto.js             formulario -> correo (Resend) -> CRM en Sheets
  diagnostico.js          lectura del diagnóstico escrita por Claude (opcional)
operacion/                material comercial interno (plantillas)
```

### Dónde se cambia cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Un precio, plazo o lo que incluye un servicio | `src/datos/oferta.mjs` (se propaga a todas las páginas, al JSON-LD y a la calculadora) |
| Un caso, su etiqueta o sus métricas | `src/datos/casos.mjs` |
| Agregar foto o video a un caso | `media` del caso en `src/datos/casos.mjs` (formato documentado arriba del archivo) |
| Preguntas frecuentes | `src/datos/faq.mjs` |
| Mensajes prellenados de WhatsApp | `MENSAJES` en `src/datos/contenido.mjs` |
| Preguntas o categorías del diagnóstico | `DIAGNOSTICO` en `src/datos/contenido.mjs` |
| WhatsApp, correo, razón social, RUT | `src/config.mjs` |
| Valor de la UF de referencia | `SITIO.uf` en `src/config.mjs` |
| **Link de agenda (Cal.com / Calendly)** | `SITIO.agenda.url` en `src/config.mjs` |
| Menú principal | `NAVEGACION` en `src/datos/contenido.mjs` |
| Una página nueva | copia una de `src/paginas/`, regístrala en `PAGINAS` de `scripts/build.mjs` |

Después de cualquier cambio: `npm test`, revisar en local y commit.

### Agenda de 20 minutos

Hoy `SITIO.agenda.url` está vacío y el botón "Agendar una evaluación" abre
WhatsApp con un mensaje pidiendo horario. **No se muestra disponibilidad
inventada.** Cuando exista el evento en Cal.com, Calendly o Google Calendar
(citas), pega la URL pública ahí, corre `npm test` y publica: todos los botones
de agenda pasan a abrirla en una pestaña nueva. Es un enlace, no un iframe, así
que el CSP no necesita cambios.

## Analítica (Vercel Web Analytics)

El sitio carga `/_vercel/insights/script.js` y envía eventos con `window.va`.
Hay que **activar Web Analytics en el proyecto de Vercel** (Analytics → Enable);
sin eso el script responde 404 y no pasa nada más. En local también da 404, y es
normal. Los eventos personalizados requieren un plan de Vercel que los incluya.

Embudo medido: visita → casos → calculadora → diagnóstico → WhatsApp → agenda → lead.

| Evento | Cuándo | Datos |
|---|---|---|
| `hero_cta_click` | CTA del hero, cabecera o menú móvil | `etiqueta` |
| `case_study_click` | Clic en un caso o en "Ver caso completo" | `etiqueta` (id del caso) |
| `cases_view` | La sección de casos entra en pantalla | — |
| `service_click` | Clic hacia la página de un servicio | `etiqueta` (id del servicio) |
| `roi_calculator_start` | Primer movimiento de la calculadora | — |
| `roi_calculator_complete` | Primer valor soltado | `tramo` (menos-2M, 2M-10M, mas-10M) |
| `diagnostic_start` | Primera respuesta del diagnóstico | — |
| `diagnostic_complete` | Resultado mostrado | `indice`, `recomendacion`, `categoria` |
| `whatsapp_click` | Cualquier enlace a WhatsApp | `contexto`, `etiqueta` |
| `calendar_click` | Botón de agenda | `etiqueta` |
| `lead_submit` | Formulario enviado con éxito | `tipo` |

Todos llevan `pagina`. No se envía ningún dato personal: ni nombre, ni correo,
ni teléfono, ni el texto del mensaje.

## Variables de entorno (todas opcionales)

El sitio funciona sin ninguna: el formulario cae a WhatsApp con el mensaje ya
redactado y el diagnóstico usa su lectura local.

| Variable | Para qué | Si falta |
|---|---|---|
| `RESEND_API_KEY` | Que el formulario llegue por correo | Cae a WhatsApp |
| `NOTIFY_EMAIL` | A dónde llega (por defecto contacto@anvartech.cl) | Usa el de por defecto |
| `CONTACTO_FROM` | Remitente verificado en Resend | `ANVAR TECH <contacto@anvartech.cl>` |
| `SHEETS_WEBHOOK_URL` | Deja cada contacto en el CRM de Sheets | No registra, igual llega el correo |
| `ANTHROPIC_API_KEY` | Lectura del diagnóstico escrita por Claude | Usa la lectura local |
| `ANTHROPIC_MODEL` | Modelo (por defecto `claude-sonnet-5`) | Usa el de por defecto |

Las claves se cargan solo en Vercel (Settings → Environment Variables). Nunca en
el repositorio.

## Caché: por qué css y js NO son inmutables

`styles.css` y `app.js` conservan el nombre entre versiones. El build agrega a
cada referencia un `?v=` con el hash del contenido, así que cada cambio real
invalida la caché solo. `vercel.json` sirve:

| Tipo | Política |
|---|---|
| css, js | `max-age=0, must-revalidate` |
| imágenes | `max-age=86400, must-revalidate` |
| tipografías | `max-age=31536000, immutable` |

> **Ojo con `vercel.json`:** cada entrada de `headers` acepta solo `source`,
> `headers`, `has` y `missing`. Una clave extra (por ejemplo `"comment"`) hace
> fallar el deploy **sin logs de build**. `npm run check` lo revisa.

## Reglas del sitio que el QA hace cumplir

- Sin atributos `style=""` ni scripts en línea: el CSP los bloquea.
- Una sola `<h1>` por página, título y descripción presentes, canonical absoluta.
- Toda imagen con `alt`, todo campo con `<label>`, `target="_blank"` con `rel="noopener"`.
- Enlaces internos y anclas que existan; sitemap sin páginas `noindex`.
- Frases descartadas que no deben volver: "desde UF 28" como precio del piloto,
  "el más elegido", "no vengo del mundo del software".

Y las que no puede revisar una máquina: **no publicar clientes, testimonios,
logos, métricas, certificaciones ni integraciones que no existan.** Cada caso
lleva la etiqueta que le corresponde (proyecto propio, cliente confidencial,
demostración tecnológica, etc.).

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
>
> `artifact-anvar-ia.html` es una copia en un archivo del sitio **anterior** al
> rediseño. Hoy el sitio real es mejor referencia: https://ia.anvartech.cl

## Publicar

Cada `git push` a `main` publica solo en Vercel (proyecto `anvar-ia`, equipo
ANVAR TECH). El autor de los commits debe ser `construcciones.anvar@gmail.com`.

Páginas nuevas para pedir indexación en Search Console después del push:
`/automatizacion-express`, `/inteligencia-datos` y `/casos`. El sitemap
(`https://ia.anvartech.cl/sitemap.xml`) ya las incluye.
