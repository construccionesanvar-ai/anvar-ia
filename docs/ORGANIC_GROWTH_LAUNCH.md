# Lanzamiento de adquisición orgánica · ia.anvartech.cl

Fecha de lanzamiento: 2026-09-25 (versión 2.2.0).
Objetivo: que el sitio atraiga y convierta búsquedas de empresas que quieren automatizar
procesos, con herramientas útiles, guías honestas y casos reales. Sin promesas de posiciones,
visitas ni clientes.

## Qué se lanzó

| Tipo | URL | Para qué |
|---|---|---|
| Herramienta | `/calculadora-roi-automatizacion` | Estimar el valor anual del trabajo manual y el retorno; enlace compartible con los valores |
| Herramienta | `/diagnostico-automatizacion` | Autodiagnóstico de 7 preguntas, con oportunidades según las respuestas y WhatsApp con el resultado |
| Herramienta | `/herramientas/punto-de-pedido` | Punto de pedido y stock de seguridad, con fórmula y ejemplo |
| Descarga | `/recursos/plantilla-roi-automatizacion` | Plantilla Excel de ROI (sin registro) |
| Landing | `/automatizacion-procesos-pymes` | Automatización de procesos para pymes |
| Landing | `/automatizacion-documental` | Documentos Word, Excel y PDF desde un solo ingreso |
| Landing | `/automatizar-excel` | Power Query, macros, Office Scripts, Python o IA: cuándo cada uno |
| Landing | `/automatizar-cotizaciones` | La IA interpreta, las reglas calculan, una persona aprueba |
| Landing | `/automatizacion-autocad` | Cambios en planos por instrucción, con límites claros |
| Caso | `/casos/automatizacion-documental-retail` | C-01 completo: contexto, proceso y medición |
| Hub | `/recursos` | Índice de herramientas, guías, casos y soluciones |
| Guía | `/recursos/cuanto-cuesta-automatizar-proceso-chile` | Precios reales y qué los mueve |
| Guía | `/recursos/como-detectar-proceso-automatizable` | Checklist de 10 preguntas |
| Guía | `/recursos/procesos-que-no-deberias-automatizar` | 7 casos en que conviene esperar |
| Guía | `/recursos/ia-vs-automatizacion-tradicional` | Reglas, scripts, RPA o IA |

Además: imágenes para compartir por página, datos estructurados (Article, WebApplication,
Service, Breadcrumb, FAQ visible), `feed.xml`, `llms.txt`, IndexNow automático, atribución de
visitas y leads en Vercel Analytics, 404 con salidas útiles, redirecciones de alias comunes.

## Checklist del día 0 (después del deploy)

- [ ] Abrir 3 páginas nuevas en el celular y probar la calculadora y el autodiagnóstico.
- [ ] Search Console: enviar el sitemap y solicitar indexación de las 6 primeras URL
      (`docs/SEARCH_CONSOLE_SETUP.md`, paso 3).
- [ ] Bing Webmaster Tools: importar desde Search Console (`docs/BING_WEBMASTER_SETUP.md`).
- [ ] GitHub → Actions → IndexNow → Run workflow con "todas" marcado (una sola vez).
- [ ] Compartir una prueba del sitio en redes sociales y revisar que la imagen se vea
      (LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/).

## Semana 1

- [ ] Día 1: solicitar indexación de las 9 URL restantes.
- [ ] Publicar en LinkedIn las piezas #1 y #3 (`docs/CONTENT_DISTRIBUTION.md`).
- [ ] Agregar el enlace de la calculadora a la firma de correo.
- [ ] Si corresponde, crear el perfil de Google Business (`docs/GOOGLE_BUSINESS_PROFILE.md`).

## Revisiones

### Día 7
- Search Console → Páginas: ¿cuántas de las 24 están indexadas? (Es normal que falten.)
- Bing → IndexNow: ¿llegaron los avisos?
- Vercel Analytics → Events: ¿aparecen `organic_landing_view`, `calculator_complete`,
  `diagnostic_complete`? Si no aparece ningún evento propio, revisar que el plan de Vercel
  incluya eventos personalizados.

### Día 14
- Search Console → Rendimiento → Páginas: primeras impresiones de las páginas nuevas.
- ¿Qué landing recibe visitas y cuál no? ¿Hay leads (`whatsapp_lead`, `service_lead`) con
  `canal` distinto de `directo`?
- Solicitar indexación de nuevo **solo** si una URL importante sigue "Descubierta: sin indexar".

### Día 30
- Primera fila del registro de `docs/SEO_GROWTH_LOOP.md` (línea base).
- Aplicar el diagnóstico del ciclo: títulos con CTR bajo, consultas en posición 8–20.
- Decidir la primera mejora (no página nueva) del mes 2.

## Lo que depende de cuentas externas (no del código)

| Acción | Quién | Guía |
|---|---|---|
| Sitemap y solicitudes de indexación en Google | Dueño de Search Console | `docs/SEARCH_CONSOLE_SETUP.md` |
| Alta en Bing Webmaster Tools | Cuenta Microsoft de la empresa | `docs/BING_WEBMASTER_SETUP.md` |
| Primer envío completo a IndexNow | Quien tenga acceso a GitHub Actions | `docs/BING_WEBMASTER_SETUP.md` |
| Perfil de Google Business | Dueño de la empresa | `docs/GOOGLE_BUSINESS_PROFILE.md` |
| Perfiles sociales en `sameAs` | Pegar URL reales en `SITIO.redes` | `src/config.mjs` |
| Grabar videos reales de C-01 y C-03 | Equipo | `docs/CONTENT_DISTRIBUTION.md` |
| Verificar que el plan de Vercel registre eventos propios | Dueño del proyecto en Vercel | README → Analítica |
