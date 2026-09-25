# Google Search Console · ia.anvartech.cl

Lo hace quien administra la cuenta de Google de ANVAR TECH. Nada de esto requiere
tocar el código. Tiempo: 20 minutos el primer día, 10 minutos cada semana.

> Google no promete indexar ni posicionar ninguna página. Estos pasos le facilitan
> descubrir y entender el sitio; el resultado depende de Google y de la competencia.

## 1. Propiedad (ya verificada)

El sitio ya trae dos verificaciones: el archivo `public/google122ea0ce84fcb2ef.html` y la
etiqueta `<meta name="google-site-verification">` en todas las páginas.

1. Entra a https://search.google.com/search-console.
2. Confirma que la propiedad **`https://ia.anvartech.cl/`** (prefijo de URL) aparece verificada.
3. Opcional y recomendado: agrega también una **propiedad de dominio** `anvartech.cl`
   (verificación por DNS en tu proveedor de dominio). Así ves juntos el sitio principal y este.
4. En Configuración → Usuarios y permisos, agrega a quien más deba ver los datos con permiso
   "Restringido" (solo lectura).

## 2. Sitemap (día 0)

1. Indexación → Sitemaps.
2. Envía `https://ia.anvartech.cl/sitemap.xml`.
3. Debe quedar **Correcto** con **24 URL descubiertas**. Si dice "No se pudo obtener",
   espera una hora y reintenta; si sigue, abre la URL en el navegador y revisa que cargue.

El sitemap se regenera solo en cada deploy y conserva la fecha `lastmod` de las páginas que
no cambiaron. No hace falta volver a enviarlo: Google lo relee.

## 3. Solicitar indexación de las páginas nuevas (día 0 y día 1)

Google limita cuántas solicitudes acepta por día (el límite no es público). Hazlas en este
orden, de más a menos importante, repartidas en dos días si te pide esperar:

**Día 0**
1. `https://ia.anvartech.cl/calculadora-roi-automatizacion`
2. `https://ia.anvartech.cl/automatizacion-procesos-pymes`
3. `https://ia.anvartech.cl/automatizacion-documental`
4. `https://ia.anvartech.cl/recursos/cuanto-cuesta-automatizar-proceso-chile`
5. `https://ia.anvartech.cl/diagnostico-automatizacion`
6. `https://ia.anvartech.cl/recursos`

**Día 1**
7. `https://ia.anvartech.cl/automatizar-excel`
8. `https://ia.anvartech.cl/automatizar-cotizaciones`
9. `https://ia.anvartech.cl/casos/automatizacion-documental-retail`
10. `https://ia.anvartech.cl/recursos/plantilla-roi-automatizacion`
11. `https://ia.anvartech.cl/recursos/como-detectar-proceso-automatizable`
12. `https://ia.anvartech.cl/herramientas/punto-de-pedido`
13. `https://ia.anvartech.cl/automatizacion-autocad`
14. `https://ia.anvartech.cl/recursos/ia-vs-automatizacion-tradicional`
15. `https://ia.anvartech.cl/recursos/procesos-que-no-deberias-automatizar`

Para cada una: pega la URL en la barra superior → **Probar URL publicada** → revisa que diga
"La URL está disponible para Google" → **Solicitar indexación**.

En "Cobertura" de la inspección, la **URL canónica seleccionada por Google** debe coincidir con
la URL que pegaste. Si no coincide, anótalo y revísalo con `docs/SEO_GROWTH_LOOP.md`.

## 4. Qué revisar y cuándo

| Cuándo | Dónde | Qué debe verse | Si no |
|---|---|---|---|
| Día 3–7 | Indexación → Páginas | Las páginas nuevas pasan de "Descubierta: actualmente sin indexar" a "Indexada" | Normal que tarde. Revisa que la URL no tenga `noindex` (no debería) y vuelve a solicitar solo una vez |
| Día 7 | Indexación → Sitemaps | 24 URL descubiertas, sin errores | Reenviar el sitemap |
| Día 14 | Rendimiento → Páginas | Las páginas nuevas empiezan a tener impresiones | Normal si son 0 aún en páginas muy competidas |
| Día 30 | Rendimiento → Consultas | Consultas nuevas relacionadas con las guías y herramientas | Aplicar el ciclo de `docs/SEO_GROWTH_LOOP.md` |
| Mensual | Experiencia → Core Web Vitals | Sin URL "deficientes" en móvil | Revisar con PageSpeed Insights la URL afectada |
| Mensual | Mejoras → Rutas de exploración | Sin errores de breadcrumbs | Pegar la URL en https://search.google.com/test/rich-results |

"Página con redirección" para `/index`, URL terminadas en `.html` o `/calculadora` es normal:
son redirecciones intencionales hacia la URL canónica.

## 5. Datos estructurados: qué esperar

El sitio declara `ProfessionalService`, `Service`, `WebApplication`, `Article`, `BreadcrumbList`
y `FAQPage` (solo con preguntas visibles). Ten en cuenta:

- Google muestra resultados enriquecidos de **FAQ** solo para algunos sitios muy reconocidos de
  gobierno y salud. En este sitio el `FAQPage` ayuda a entender la página, pero lo normal es que
  **no** aparezca como desplegable en los resultados.
- Las **migas de pan** (breadcrumbs) sí suelen mostrarse.
- No hay reseñas ni calificaciones declaradas, a propósito: no existen reseñas verificables y
  declararlas iría contra las políticas de Google.

## 6. Informes útiles (filtros listos)

En Rendimiento → Resultados de búsqueda → **+ Agregar filtro → Consulta → Regex personalizado**:

| Grupo | Regex |
|---|---|
| Marca | `anvar` |
| Precio y costo | `cuanto cuesta|precio|valor|costo` |
| Herramientas | `calculadora|plantilla|roi|punto de pedido|stock de seguridad` |
| Excel | `excel|macro|power query` |
| Documentos | `document|word|pdf|formulario` |
| Cotizaciones | `cotiza` |
| AutoCAD | `autocad|dwg|plano` |

Compara siempre **últimos 28 días vs. los 28 anteriores** y mira clics, impresiones, CTR y
posición media por grupo. Anota los números en la tabla de `docs/SEO_GROWTH_LOOP.md`.

## 7. Cruzar con Vercel Analytics

Search Console dice cuántas personas llegaron desde Google; Vercel Analytics dice qué hicieron:

- Evento `organic_landing_view` con `canal = google/organic` → visitas que entraron desde Google
  y en qué página aterrizaron (`landing`).
- Eventos `whatsapp_lead` y `service_lead` filtrados por `canal = google/organic` → leads que
  vinieron de búsqueda.
- `calculator_complete`, `diagnostic_complete`, `template_download` → uso de las herramientas.

Los eventos propios requieren un plan de Vercel que los incluya: si no aparecen en
Analytics → Events, revisa el plan del proyecto.
