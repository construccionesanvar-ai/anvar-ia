# Congelamiento post-lanzamiento · ia.anvartech.cl

**Estado: MODO MEDICIÓN.** El sitio quedó estable y completo. Durante las próximas 2–3 semanas
no se desarrolla nada nuevo: se mide.

| | |
|---|---|
| Fecha del deploy final | 25/09/2026 |
| Versión congelada | `cfd6507` (merge de construccionesanvar-ai/anvar-ia#7) |
| Deployment de Vercel | `dpl_EK69HVpj3rg71CeUudohZRyokKHm` (READY, alias ia.anvartech.cl) |
| Después | Solo commits de verificación y documentación, sin cambios en `public/` |
| URL | https://ia.anvartech.cl |
| Congelado hasta | ~16/10/2026 (revisión del día 21) |

## Qué quedó congelado

No se cambia, salvo por las razones de la sección siguiente:

- **URL, slugs y redirecciones** (`vercel.json`). Las 25 URL del sitemap ya se enviaron a Google.
- **Titles, descriptions, H1, canonicals y keyword target** de cada página.
- **Estructura y copy principal**: portada, soluciones, servicios, casos, guías, herramientas.
- **Contenido**: no se crean páginas, artículos, landings, herramientas ni casos.
- **Diseño**: paleta, tipografía, hero, componentes.
- **Arquitectura**: hosting (Vercel), dominio, DNS, analítica (Vercel Web Analytics), formulario
  (Resend), UF (mindicador.cl vía `/api/uf`).
- **Indexación**: no volver a pedir indexación en Search Console ni cambiar páginas para
  "apurar" a Google.

## Qué sí se puede modificar

Solo por una de estas razones, con un cambio mínimo y verificado (`npm run qa`):

1. **Bug** (algo no funciona como está descrito).
2. **Dato incorrecto** (precio, cifra, nombre, contacto).
3. **Problema legal** (privacidad, razón social, condiciones).
4. **Seguridad**.
5. **Caída funcional** (formulario, WhatsApp, herramientas, UF).

Cada cambio queda en un commit que diga cuál de las cinco razones lo justifica. IndexNow avisa
solo las páginas cuyo contenido cambió; no hace falta hacer nada más.

## Estado técnico al congelar

- **UF:** mindicador.cl, sin clave. Se muestra solo la UF de hoy en Chile (America/Santiago),
  validada (rango y fecha). Caché hasta 6 h y nunca más allá de la medianoche de Chile. Si no hay
  UF de hoy, se ve solo "UF n + IVA". No existe un valor de respaldo en pesos. Detalle en README ›
  "Precios y UF".
- **Contacto:** formulario completo en páginas comerciales; plegado ("Prefiero dejar mis datos →"
  / "Prefiero que me contacten →") en herramientas, guías, casos y perfil.
- **SEO técnico:** robots, sitemap, canonicals, meta robots, H1 y JSON-LD revisados en cada deploy
  por `scripts/seo-check.mjs` (resumen en GitHub → Actions → "Verificación post-deploy").
- **Pruebas:** lint, typecheck, pruebas unitarias, `npm run check` y E2E en navegador.
- **Verificación post-deploy** (GitHub → Actions): las 25 páginas idénticas al build, SEO técnico
  y la UF de producción (debe ser la de hoy en Chile o "no disponible", nunca otra fecha).
- **UF al congelar:** 41.016,28 para el 25/09/2026 (mindicador.cl), el mismo valor que publican
  fuentes independientes para ese día.

## Qué mirar

Detalle y casillas en `docs/SEO_MEASUREMENT_CHECKLIST.md`; filtros de Search Console en
`docs/SEARCH_CONSOLE_SETUP.md`.

### Día 7 (~02/10/2026)

- **Search Console:** páginas indexadas (de 25), errores de indexación o de sitemap, primeras
  impresiones.
- **Vercel Analytics:** visitas, uso de herramientas (`calculator_view` / `_start` / `_complete`,
  `diagnostic_view` / `_start` / `_complete`), clics en CTA (`hero_cta_click`,
  `content_cta_click`, `home_roi_tool_click`, `home_diagnostic_tool_click`).

### Día 14 (~09/10/2026)

- **Search Console:** consultas, CTR, posición media y landing pages con impresiones.
- **Leads:** `whatsapp_lead`, `express_lead`, `data_lead`, `diagnostic_lead`, `case_lead` y
  `service_lead` (formulario enviado), por `landing` y `canal`.
- **Formulario plegado:** `form_open` vs. `service_lead` en herramientas y páginas editoriales.

### Día 30 (~25/10/2026)

- Páginas con crecimiento de impresiones (28 días vs. los 28 anteriores).
- Consultas en posición 5–30: las oportunidades del mes 2.
- Páginas que convierten (leads por `landing`) y tráfico orgánico (`organic_landing_view` con
  `canal` = `google/organic`, `bing/organic`…).
- Consultas comerciales (precio, cotizar, automatizar + proceso).

Recién después del día 30 se decide la siguiente mejora, con las reglas de
`docs/SEO_MEASUREMENT_CHECKLIST.md` (máximo tres por mes, una por señal).
