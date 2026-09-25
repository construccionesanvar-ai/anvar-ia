# Checklist de medición SEO · ia.anvartech.cl

**Fase: observación y medición (desde el 2026-09-25, al menos hasta el 2026-10-16).**
El sitio tiene suficiente contenido inicial: 25 URL indexables, 4 herramientas, 5 páginas de
solución, 4 guías y un caso largo. Durante estas semanas **no se crean páginas nuevas** (ni
landings, ni artículos, ni herramientas, ni páginas por industria) y **no se cambian URL ni
títulos** de lo publicado, salvo errores. Cada cambio reinicia la evaluación de Google y no
permite saber qué funcionó.

La pregunta es una sola: **qué contenido trae tráfico y qué tráfico se convierte en negocio.**

Fuentes: Google Search Console (`docs/SEARCH_CONSOLE_SETUP.md`), Bing Webmaster Tools
(`docs/BING_WEBMASTER_SETUP.md`) y Vercel Analytics (eventos en README › Analítica).

---

## Día 7 (≈ 2026-10-02)

- [ ] **URL indexadas** (Search Console → Indexación → Páginas): ___ de 25.
- [ ] **Errores** en Páginas: ninguna URL del sitemap con "Error" o "Excluida por noindex".
      "Descubierta: actualmente sin indexar" es normal esta semana.
- [ ] **Sitemap** (Indexación → Sitemaps): "Correcto", 25 URL descubiertas.
- [ ] **Impresiones** totales de los últimos 7 días: ___.
- [ ] **Consultas iniciales** (Rendimiento → Consultas): anota las 10 primeras, aunque tengan 1 impresión.
- [ ] **Bing** → IndexNow: los avisos del deploy llegaron.
- [ ] **Vercel** → Events: aparecen `organic_landing_view`, `calculator_view`, `diagnostic_view`.
      Si no aparece ningún evento propio, revisar que el plan de Vercel incluya eventos personalizados.

## Día 14 (≈ 2026-10-09)

- [ ] **Top consultas** (28 días): las 20 con más impresiones, con su posición media.
- [ ] **Páginas con impresiones**: ¿cuáles de las 25? ¿Cuáles siguen en cero?
- [ ] **CTR** por página (solo las que tengan más de 100 impresiones; con menos no es significativo).
- [ ] **Posición media** por página.
- [ ] **Herramientas usadas** (Vercel): `calculator_view` → `calculator_start` → `calculator_complete`
      por `herramienta`; `diagnostic_view` → `diagnostic_start` → `diagnostic_complete`;
      `template_download`.
- [ ] **Portada**: `home_roi_tool_click` vs. `home_diagnostic_tool_click`.

## Día 30 (≈ 2026-10-25)

- [ ] **Crecimiento de impresiones**: últimos 28 días vs. los 28 anteriores.
- [ ] **Tráfico orgánico** (Vercel): `organic_landing_view` con `canal` = `google/organic`,
      `bing/organic`, `duckduckgo/organic` o `…/ai`, por `landing`.
- [ ] **Páginas que generan leads**: todos los `*_lead` (`whatsapp_lead`, `express_lead`,
      `data_lead`, `diagnostic_lead`, `case_lead`, `service_lead`) agrupados por `landing` y `canal`.
- [ ] **Consultas en posición 5–30**: la lista de oportunidades para el mes 2.
- [ ] **Páginas sin señales** (0 impresiones en 30 días): anotarlas; revisar según las reglas de abajo.
- [ ] Primera fila del registro mensual en `docs/SEO_GROWTH_LOOP.md`.

---

## Reglas para la próxima ronda de SEO (después del día 30)

Una decisión por señal. Antes de tocar nada, anota el número de hoy para comparar en 3–4 semanas.

| Señal | Qué hacer | Qué NO hacer |
|---|---|---|
| Muchas impresiones y CTR bajo | Mejorar **title, description y snippet** de esa página: concretos, con el beneficio o el número real de la página | Cambiar la URL o el contenido completo |
| Posición media 8–20 | Mejorar **contenido útil, enlaces internos desde páginas relacionadas y evidencia** (ejemplos, cifras propias con su alcance) | Crear otra página para la misma búsqueda |
| Cero impresiones | Revisar primero **indexación** (¿está indexada?), **intención** (¿alguien busca esto así?) y **relevancia** (¿la página responde eso?) | Crear cinco artículos nuevos para "empujarla" |
| Una herramienta trae tráfico | **Expandir alrededor de ese tema**: mejorar la herramienta y enlazar desde las páginas del mismo tema | Crear herramientas nuevas sin relación |
| Una herramienta genera leads | **Priorizar ese cluster**: la herramienta, su landing y su caso | Repartir el esfuerzo en temas sin señales |
| Consulta con impresiones que ninguna página responde | Evaluarla con `docs/SEO_CONTENT_MAP.md`: primero una sección en la página más cercana | Una página nueva por cada consulta |

Máximo tres mejoras por mes, para poder atribuir el efecto de cada una.
