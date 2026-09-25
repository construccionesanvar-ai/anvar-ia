# Distribución de contenido · ia.anvartech.cl

Cómo mover lo publicado sin depender solo de Google: publicaciones de LinkedIn, guiones de
video vertical y reglas de enlaces con UTM. Todo el contenido usa solo datos reales del sitio.

## Reglas

- **Solo hechos verificables.** Las cifras salen de `src/datos/casos.mjs` con su alcance
  (C-01: 45 → 4 min por procedimiento; C-03: 8 versiones en 5 días, que mide ritmo y no ahorro).
- **No se inventa nada**: ni clientes, ni testimonios, ni capturas "de ejemplo" presentadas
  como reales, ni videos armados con datos falsos presentados como producción.
- **Datos personales fuera**: en videos y capturas se usan datos de prueba ficticios. Nunca
  boletas, nombres, RUT ni planos reales de clientes.
- **Un enlace por publicación**, siempre con UTM (`npm run utm`), para saber qué funcionó.
- **Ritmo sostenible**: 1–2 publicaciones por semana es mejor que 7 en una semana y nada después.

## Convenciones de UTM

`npm run utm -- <ruta> <fuente> <medio> <campaña>` valida la ruta y normaliza el texto.

| Dónde se comparte | `utm_source` | `utm_medium` | `utm_campaign` |
|---|---|---|---|
| Publicación de LinkedIn | `linkedin` | `social` | tema de la pieza (`caso-c01`, `guia-costos`) |
| Mensaje directo o grupo de WhatsApp | `whatsapp` | `mensaje` | tema |
| Correo uno a uno | `email` | `email` | tema |
| Firma de correo | `email` | `firma` | `firma-correo` |
| Video (YouTube, Instagram, TikTok) | `youtube` / `instagram` / `tiktok` | `video` | `video-<tema>` |
| Perfil de Google Business | `google` | `organic` | `gbp` |
| Código QR impreso | `qr` | `qr` | lugar o pieza |

En Vercel Analytics, el evento `organic_landing_view` muestra `canal = fuente/medio` y
`campana`; los eventos `whatsapp_lead` y `service_lead` los heredan.

## 8 publicaciones para LinkedIn

Formato: gancho (primeras 2 líneas, lo que se ve antes de "ver más"), contenido, aprendizaje,
CTA suave y URL. Publica el enlace en el texto; si prefieres ponerlo en el primer comentario,
usa la misma URL con UTM.

### 1. C-01: ocho documentos, un solo ingreso

**Gancho:** Un procedimiento tomaba 45 minutos. Hoy toma 4. No por IA "mágica": por no escribir
lo mismo ocho veces.

**Contenido:** En un local de retail, cada procedimiento de prevención de pérdidas obligaba a
llenar a mano ocho formatos oficiales en Word, repitiendo los mismos datos. Construimos un
formulario único: los datos se ingresan una vez y salen los ocho documentos en Word y PDF, más
un archivo listo para imprimir. La lectura de la boleta es local, sin internet, y todo dato
dudoso queda marcado en amarillo para que una persona lo revise.

**Aprendizaje:** El mayor ahorro no vino de la parte "inteligente", sino de eliminar la
repetición. Y la lectura de boletas la probamos con una boleta real: salió bien, pero una prueba
no es una tasa de precisión. Por eso la revisión humana sigue ahí.

**CTA suave:** Si en tu equipo alguien copia los mismos datos en varios documentos, el caso
completo cuenta cómo se hizo y cómo se midió.

**URL:** https://ia.anvartech.cl/casos/automatizacion-documental-retail?utm_source=linkedin&utm_medium=social&utm_campaign=caso-c01

### 2. Cuánto cuesta automatizar un proceso

**Gancho:** "¿Cuánto cuesta automatizar esto?" es la primera pregunta que nos hacen. La respuesta
honesta es "depende", pero se puede decir de qué depende.

**Contenido:** Lo que más encarece una automatización no es la tecnología: es la cantidad de
sistemas que toca, las excepciones ("salvo cuando…"), los datos desordenados y la disponibilidad
que exige. Lo que la abarata: un proceso escrito, una o dos herramientas que ya usas y un alcance
cerrado. Publicamos nuestros precios reales por tipo de proyecto, con lo que incluye cada uno.

**Aprendizaje:** Partir por un proceso pequeño es más barato y lo que se aprende abarata lo que
viene después.

**CTA suave:** La guía tiene la tabla completa y cómo saber si se paga sola.

**URL:** https://ia.anvartech.cl/recursos/cuanto-cuesta-automatizar-proceso-chile?utm_source=linkedin&utm_medium=social&utm_campaign=guia-costos

### 3. Calculadora de ROI

**Gancho:** Antes de automatizar algo, haz esta cuenta. Toma un minuto y te puede ahorrar un
proyecto que no se paga.

**Contenido:** Cuatro datos: cuántas personas hacen el proceso, cuántas horas a la semana,
cuánto cuesta una hora de trabajo y qué parte se puede automatizar. Con el ejemplo de la
calculadora —5 personas, 6 horas semanales cada una, $9.000 la hora, 60 % automatizable— el
trabajo manual vale $7.128.000 al año. Es un ejemplo, no un caso: la gracia es poner tus números.

**Aprendizaje:** Si con tus números la inversión no se recupera en un plazo razonable, no se
justifica automatizar solo por tiempo. A veces lo que pesa son los errores y reprocesos.

**CTA suave:** Calculadora gratis, sin registro.

**URL:** https://ia.anvartech.cl/calculadora-roi-automatizacion?utm_source=linkedin&utm_medium=social&utm_campaign=calculadora-roi

### 4. Procesos que no deberías automatizar (todavía)

**Gancho:** Automatizar un proceso desordenado solo hace más rápido el desorden.

**Contenido:** Siete casos en que recomendamos no automatizar todavía: un proceso que cada
persona hace distinto, uno que ocurre pocas veces al año, uno que está por cambiar, una decisión
con responsabilidad legal o financiera sin revisión humana, datos en papel o dispersos… En cada
uno, qué conviene hacer antes.

**Aprendizaje:** Decir "todavía no" también es parte del trabajo. Un proyecto que falla por
partir antes de tiempo quema la confianza del equipo en la automatización.

**CTA suave:** La guía completa, con qué hacer en cada caso.

**URL:** https://ia.anvartech.cl/recursos/procesos-que-no-deberias-automatizar?utm_source=linkedin&utm_medium=social&utm_campaign=guia-no-automatizar

### 5. Cotizaciones: la IA interpreta, las reglas calculan

**Gancho:** Nunca dejes que un modelo de IA calcule el precio de una cotización.

**Contenido:** Un modelo de lenguaje es muy bueno entendiendo un pedido escrito en un correo o un
WhatsApp. Es malo para sumar con exactitud: puede redondear o inventar. El diseño que usamos: la
IA interpreta la solicitud, el código calcula con la lista de precios única y una persona aprueba
antes de enviar. En nuestro propio sistema de venta en línea (caso C-02) el modelo recomienda el
servicio, pero el precio sale de una fuente única y el pago lo procesa una plataforma de pagos,
no la IA.

**Aprendizaje:** La IA va en la entrada, donde hay que interpretar; el código en el medio, donde
hay que ser exacto; una persona al final, donde hay que responder por el resultado.

**CTA suave:** Cómo se arma el flujo completo, paso a paso.

**URL:** https://ia.anvartech.cl/automatizar-cotizaciones?utm_source=linkedin&utm_medium=social&utm_campaign=cotizaciones-ia-reglas

### 6. AutoCAD: 8 versiones de un plano en 5 días

**Gancho:** Pedirle a AutoCAD un cambio en español y que se aplique sobre el .dwg real. Lo
probamos en un proyecto de un cliente.

**Contenido:** En el layout de una planta de proceso, cada cambio de criterio obligaba a
redibujar, reacotar y rehacer el cuadro de equipos. Conectamos AutoCAD con un modelo de IA: los
cambios se piden en español, se aplican sobre el archivo real y el cuadro de equipos se exporta a
Excel. Resultado: 8 versiones del plano en 5 días.

**Aprendizaje:** Esa cifra mide el ritmo de iteración, no un ahorro: no medimos cuánto habría
tomado a mano. Y el profesional sigue revisando cada versión: la responsabilidad del plano no se
delega en un modelo.

**CTA suave:** Cómo funciona, qué hace bien y qué límites tiene.

**URL:** https://ia.anvartech.cl/automatizacion-autocad?utm_source=linkedin&utm_medium=social&utm_campaign=autocad-c03

### 7. Punto de pedido: el proveedor pesa más que la demanda

**Gancho:** Para bajar el inventario, a veces la mejor decisión no está en la bodega: está en
el contrato con el proveedor.

**Contenido:** Con un producto que vende 20 unidades diarias (desviación de 6) y un proveedor que
tarda 7 días (desviación de 1 día), el stock de seguridad para un 95 % de nivel de servicio es de
43 unidades. Si el proveedor cumpliera siempre el plazo, bajaría a 27. La variación del plazo
pesaba más que la de la demanda.

**Aprendizaje:** Antes de comprar un software de inventario, mide cuánto varían tus proveedores.

**CTA suave:** Calculadora gratuita, con la fórmula y cómo sacar los datos de tu Excel.

**URL:** https://ia.anvartech.cl/herramientas/punto-de-pedido?utm_source=linkedin&utm_medium=social&utm_campaign=punto-pedido

### 8. Diez preguntas antes de automatizar

**Gancho:** Piensa en un proceso concreto de tu empresa. Si respondes "sí" a 8 de estas 10
preguntas, vale la pena evaluarlo.

**Contenido:** ¿Se repite cada semana? ¿Se hace igual cada vez? ¿Alguien puede explicarlo con
ejemplos en una hora? ¿Los datos llegan en digital? ¿Se copia información de un lugar a otro?
¿Puedes medir cuánto demora? … Tres de ellas pesan más que las otras.

**Aprendizaje:** "Logística" no es un proceso; "emitir los certificados de despacho", sí. El
checklist funciona con procesos concretos.

**CTA suave:** El checklist completo, y cómo leer el resultado.

**URL:** https://ia.anvartech.cl/recursos/como-detectar-proceso-automatizable?utm_source=linkedin&utm_medium=social&utm_campaign=checklist-automatizable

### Calendario sugerido (4 semanas)

| Semana | Martes | Jueves |
|---|---|---|
| 1 | #1 C-01 | #3 Calculadora |
| 2 | #2 Costos | #8 Checklist |
| 3 | #5 Cotizaciones | #7 Punto de pedido |
| 4 | #6 AutoCAD | #4 No automatizar |

## Guiones de video vertical (9:16, 20–45 s)

Solo se graban con la herramienta real funcionando. Si todavía no hay grabación, **no se
publica un video "de ejemplo"**: se publica el texto del punto anterior. Cuando exista la
grabación, se agrega al caso en `src/datos/casos.mjs` (campo `media`), como indica el README.

### Video 1 · C-01: ocho documentos desde un solo ingreso (30–40 s)

Grabación de pantalla real con **datos ficticios** (nombre "Cliente de prueba", RUT inventado,
boleta de prueba propia). Nunca un procedimiento real.

| Tiempo | Imagen | Texto en pantalla | Voz |
|---|---|---|---|
| 0–3 s | Ocho documentos Word abiertos en mosaico | "45 min por procedimiento" | "Así se hacía: ocho documentos a mano, con los mismos datos." |
| 3–12 s | Formulario único; se escribe una vez | "Un solo ingreso" | "Ahora los datos se escriben una vez." |
| 12–20 s | Foto de la boleta de prueba → campos llenos, uno marcado en amarillo | "Lo dudoso queda marcado" | "La boleta se lee en el mismo computador, sin internet. Lo dudoso queda para revisión." |
| 20–30 s | Clic en generar → carpeta con 8 Word + 8 PDF | "4 min" | "Y salen los ocho documentos, en Word y PDF." |
| 30–38 s | Tarjeta final con la URL | "Caso real C-01 · proyecto propio" | "El caso completo, con cómo lo medimos, en ia.anvartech.cl." |

**Texto de la publicación:** Caso real C-01 (proyecto propio): de 45 a 4 minutos por
procedimiento. Datos de prueba en el video. Caso completo: URL con `utm_campaign=video-c01`.

### Video 2 · C-03: un cambio en AutoCAD pedido en español (25–35 s)

Grabación con un **plano de ejemplo propio**, nunca el del cliente (el caso es confidencial).

| Tiempo | Imagen | Texto en pantalla | Voz |
|---|---|---|---|
| 0–3 s | Plano de ejemplo en AutoCAD | "¿Y si le pidieras el cambio en español?" | — |
| 3–10 s | Se escribe: "mueve el equipo B-02 dos metros al norte y actualiza las cotas" | La instrucción | "Pido el cambio en español." |
| 10–20 s | El equipo se mueve y las cotas se actualizan en el .dwg | "Sobre el archivo real" | "Se aplica sobre el archivo real, con operaciones permitidas." |
| 20–28 s | Cuadro de equipos exportado a Excel | "Cuadro de equipos → Excel" | "Y el cuadro de equipos sale a Excel." |
| 28–34 s | Tarjeta final | "Un profesional revisa cada versión" | "La revisión sigue siendo del profesional. Cómo funciona, en ia.anvartech.cl." |

**Aviso en la publicación:** Plano de ejemplo. En el proyecto real (C-03, cliente confidencial)
se hicieron 8 versiones en 5 días; esa cifra mide ritmo, no ahorro.

### Video 3 · Calculadora de ROI (20–30 s)

Grabación de pantalla del sitio en el celular.

| Tiempo | Imagen | Texto en pantalla | Voz |
|---|---|---|---|
| 0–3 s | Pregunta en pantalla | "¿Cuánto te cuesta al año copiar y pegar?" | — |
| 3–15 s | Se mueven los cuatro controles | "4 datos · 1 minuto" | "Cuántas personas, cuántas horas, cuánto cuesta la hora y qué parte se puede automatizar." |
| 15–22 s | Resultado: valor anual y horas | "Tu estimación" | "Te dice cuánto vale ese trabajo al año y en cuánto se pagaría automatizarlo." |
| 22–28 s | Botón "Copiar enlace con estos valores" | "Gratis · sin registro" | "Gratis y sin registro." |

### Video 4 · Autodiagnóstico (20–30 s)

| Tiempo | Imagen | Texto en pantalla | Voz |
|---|---|---|---|
| 0–3 s | Portada del autodiagnóstico | "¿Tu proceso está listo para automatizarse?" | — |
| 3–15 s | Se responden las preguntas rápido | "7 preguntas · 2 minutos" | "Siete preguntas sobre un proceso concreto." |
| 15–24 s | Resultado y "Lo que sale de tus respuestas" | "Puntaje + oportunidades" | "Te da un puntaje, las oportunidades según tus respuestas y un primer paso." |
| 24–29 s | Botón de WhatsApp con el resultado | "Sin pedir tu correo" | "Sin pedirte el correo." |

## Otros canales, sin costo

- **Firma de correo:** "ANVAR TECH · IA & Automatización — Calcula el ROI de automatizar un
  proceso: " + URL con `utm_source=email&utm_medium=firma&utm_campaign=firma-correo`.
- **Respuestas por WhatsApp:** cuando alguien pregunta por precio, enviar la guía de costos con
  `utm_source=whatsapp&utm_medium=mensaje&utm_campaign=guia-costos`.
- **Google Business Profile:** ver `docs/GOOGLE_BUSINESS_PROFILE.md`.
