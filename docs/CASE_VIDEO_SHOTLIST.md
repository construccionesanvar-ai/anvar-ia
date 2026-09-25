# Guion de grabación de videos de casos (C-01 y C-03)

El sitio ya está preparado para mostrar video en cada caso (MP4 + WebM, poster, subtítulos,
carga diferida con miniatura → reproducir; ver README › "Evidencia visual de los casos").
Mientras no exista la grabación, cada caso muestra su diagrama de flujo real: **no se publica un
video armado, simulado o con datos de otro proyecto como si fuera el caso.**

## Reglas para ambos

- **Solo la herramienta real funcionando.** Nada de maquetas, animaciones hechas después ni
  pantallas editadas para parecer otra cosa.
- **Datos ficticios.** Nunca nombres, RUT, boletas, direcciones ni planos reales de personas o
  clientes. Prepara los datos de prueba antes de grabar.
- **Formato:** 1280 × 720 (horizontal, para la página del caso). Si además se quiere una versión
  vertical para redes, grábala aparte (ver `docs/CONTENT_DISTRIBUTION.md`).
- **Duración:** 20–30 segundos. Sin audio (el video se reproduce en silencio); si hay texto que
  explicar, va en subtítulos `.vtt` o en rótulos simples.
- **Entregables por video:** `cXX-demo.mp4` (H.264, ≤ 4 MB), `cXX-demo.webm` (VP9, opcional),
  `cXX-poster.webp` (el cuadro más claro del resultado), `cXX-demo.vtt` (si hay subtítulos).
- **Grabación:** pantalla completa de la aplicación, cursor visible, sin notificaciones del sistema,
  zoom del sistema al 100 %. Cortes limpios entre planos; nada de acelerar partes sin decirlo.

## C-01 · Ocho documentos desde un solo ingreso (20–30 s)

Qué debe quedar claro: los datos se escriben **una vez** y salen **los ocho documentos**. La
lectura de la boleta es local y lo dudoso queda marcado para revisión.

| # | Plano | Qué se ve | Duración | Rótulo sugerido |
|---|---|---|---|---|
| 1 | Estado inicial | La carpeta con las ocho plantillas Word o el formulario vacío | 3 s | "Antes: 8 documentos a mano, ~45 min" |
| 2 | Entrada | Se completan los datos del procedimiento en el formulario único (datos ficticios) | 6–8 s | "Los datos se ingresan una vez" |
| 3 | Lectura | Se carga la foto o PDF de una boleta de prueba; los campos se llenan; uno queda marcado en amarillo | 5–7 s | "Lectura local; lo dudoso queda para revisión" |
| 4 | Generación | Clic en generar; barra o mensaje de avance | 3–4 s | — |
| 5 | Documentos finales | La carpeta con los 8 Word + 8 PDF y el archivo para imprimir; se abre uno | 4–6 s | "Después: ~4 min" |

Poster: el plano 5 (carpeta con los documentos generados).
Leyenda en el sitio: "Datos de prueba. Proyecto propio en operación diaria."
Alcance a mantener: la prueba de lectura fue con una boleta real de diez productos; es una prueba
puntual, no una tasa de precisión (ya está en el caso).

## C-03 · Un cambio en AutoCAD pedido en español (20–30 s)

Qué debe quedar claro: la instrucción se escribe en español y el cambio se aplica **sobre el
archivo .dwg**, con operaciones permitidas; el profesional revisa. El proyecto real es de un
**cliente confidencial**: se graba con un **plano de ejemplo propio**, nunca con el del cliente.

| # | Plano | Qué se ve | Duración | Rótulo sugerido |
|---|---|---|---|---|
| 1 | Plano | El plano de ejemplo abierto en AutoCAD, con un equipo y sus cotas visibles | 4 s | "Plano de ejemplo" |
| 2 | Instrucción | Se escribe la instrucción, por ejemplo: "mueve el equipo B-02 dos metros al norte y actualiza las cotas" | 6–8 s | "El cambio se pide en español" |
| 3 | Ejecución | El equipo se mueve y las cotas se actualizan en el mismo archivo | 5–7 s | "Se aplica sobre el .dwg" |
| 4 | Resultado | Vista del plano actualizado y el cuadro de equipos exportado a Excel | 5–6 s | "El profesional revisa cada versión" |

Poster: el plano 4 (plano actualizado con el cuadro de equipos).
Leyenda en el sitio: "Plano de ejemplo. El proyecto real es de un cliente confidencial."
Alcance a mantener: "8 versiones en 5 días" mide el ritmo de iteración, no un ahorro de tiempo.
Si en el futuro se mide el tiempo por revisión antes y después, recién ahí se puede publicar una
cifra de ahorro.

## Después de grabar

1. Copia los archivos a `public/casos/`.
2. Completa `media` del caso en `src/datos/casos.mjs` (ejemplo en el README) y quita
   `evidenciaPendiente`.
3. `npm test` (falla si falta un archivo) y revisa la página del caso en el celular.
4. Commit, pull request y merge: la verificación post-deploy confirma que el video se sirve igual
   que en el repositorio.
