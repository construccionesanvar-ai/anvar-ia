# Ciclo de crecimiento orgánico · ia.anvartech.cl

Un ciclo mensual, corto y medible, para que el sitio mejore con datos y no con intuición.
Dueño: quien administra el sitio. Tiempo: 2 a 4 horas al mes.

> No hay posiciones, visitas ni clientes garantizados. El ciclo sirve para decidir dónde
> poner el esfuerzo y para dejar de hacer lo que no funciona.

## El ciclo (una vez al mes)

```
Medir → Diagnosticar → Mejorar lo que existe → Crear solo si hay señal → Distribuir → Avisar → Registrar
```

### 1. Medir (30 min)

Search Console, últimos 28 días vs. los 28 anteriores (filtros en `docs/SEARCH_CONSOLE_SETUP.md`):

- Clics, impresiones, CTR y posición media por página y por grupo de consultas.
- Páginas indexadas vs. 25 del sitemap.

Vercel Analytics, mismo periodo:

- `organic_landing_view` por `canal` y por `landing`: cuántas visitas entran por buscadores
  (`google/organic`, `bing/organic`, `duckduckgo/organic`), por asistentes (`…/ai`),
  por redes (`linkedin/social`) y por campaña.
- `calculator_complete`, `diagnostic_complete`, `template_download`: uso de herramientas.
- `whatsapp_lead` y `service_lead` por `canal` y `landing`: **el número que importa**.

### 2. Diagnosticar (30 min)

| Señal en Search Console | Qué significa | Qué hacer |
|---|---|---|
| Muchas impresiones, CTR bajo (< 2 %) en posición 1–10 | El resultado se ve pero no convence | Reescribir título y descripción de esa página (concretos, con el beneficio o el número real) |
| Posición media 8–20 en una consulta relevante | Google la considera, pero no alcanza | Mejorar la página: responder mejor esa pregunta, ejemplo concreto, enlaces internos desde páginas relacionadas |
| Consulta con impresiones que ninguna página responde bien | Hay demanda sin contenido | Evaluar contenido nuevo con `docs/SEO_CONTENT_MAP.md` (paso 4) |
| Dos páginas alternándose en la misma consulta | Canibalización | Dejar una como principal, ajustar la otra a su intención distinta y enlazar de una a otra |
| Página indexada sin impresiones en 60 días | Intención muy competida o sin demanda | No borrarla: enlazarla mejor o esperar; revisar si la intención está bien planteada |
| "Descubierta: sin indexar" por más de 30 días | Google no le ve valor suficiente todavía | Reforzar enlaces internos hacia ella y mejorar el contenido; no reenviar en bucle |

| Señal en Vercel Analytics | Qué hacer |
|---|---|
| Landing con visitas orgánicas y 0 leads | Revisar el CTA: ¿está visible arriba?, ¿el siguiente paso es claro? |
| Herramienta usada, pocos leads | Revisar el paso del resultado al contacto (mensaje de WhatsApp prellenado) |
| Canal nuevo aparece (p. ej. `chatgpt.com/ai`) | Ver en qué landing aterriza y reforzar esa página |

### 3. Mejorar lo que existe (1–2 h)

Siempre antes de crear algo nuevo. Máximo 3 páginas por mes, para poder medir el efecto.
Al cambiar una página de forma real, actualiza su fecha `actualizado` en
`src/datos/recursos.mjs` (solo si es una guía o recurso). El sitemap actualiza `lastmod` solo.

### 4. Crear solo si hay señal (opcional)

Una pieza nueva al mes como máximo, y solo si cumple **todo**:

- Hay una señal concreta: impresiones sin página adecuada, o la misma pregunta de 3 clientes.
- No existe ya una página para esa intención (`docs/SEO_CONTENT_MAP.md`).
- Se puede escribir desde experiencia real, con ejemplos o datos propios verificables.
- Tiene un siguiente paso claro (herramienta, caso o servicio).

Cómo agregarla: README → "Contenido orgánico: cómo agregar o cambiar".

### 5. Distribuir

Cada pieza nueva o mejorada se comparte una vez con enlace UTM
(`npm run utm -- <ruta> linkedin social <campaña>`), siguiendo `docs/CONTENT_DISTRIBUTION.md`.

### 6. Avisar a los buscadores

- Bing y los demás de IndexNow: automático al hacer push a `main`.
- Google: Search Console → Inspección de URL → Solicitar indexación, **solo** para páginas
  nuevas o cambios grandes.

### 7. Registrar

Una fila por mes. Sin registro no se sabe qué funcionó.

| Mes | Clics Google | Impresiones | Páginas indexadas | Visitas orgánicas (Vercel) | Leads orgánicos | Qué se cambió | Resultado del cambio anterior |
|---|---|---|---|---|---|---|---|
| 2026-10 | | | / 25 | | | | (línea base) |
| 2026-11 | | | / 25 | | | | |
| 2026-12 | | | / 25 | | | | |

## Lo que no se hace, aunque "funcione"

- Comprar enlaces, intercambiar enlaces en masa o publicar en redes de blogs.
- Generar artículos en masa con IA sin experiencia ni revisión.
- Repetir palabras clave, texto oculto, páginas por comuna con el mismo contenido.
- Inventar reseñas, clientes, cifras o fechas de actualización.
- Cambiar títulos cada semana: cada cambio necesita 3–4 semanas para medirse.
