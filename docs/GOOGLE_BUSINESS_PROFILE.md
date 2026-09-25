# Perfil de Empresa en Google (Google Business Profile) · ANVAR TECH

Un perfil de empresa puede mostrar a ANVAR TECH en Google Maps y en búsquedas locales
("automatización de procesos santiago"). Lo crea el dueño de la empresa con su cuenta de
Google; no requiere tocar el sitio.

> Google decide si aprueba el perfil y dónde lo muestra. No hay garantía de aparecer ni de
> una posición. Las políticas cambian: revisa las vigentes antes de publicar
> (https://support.google.com/business).

## ¿Corresponde tener perfil?

Google acepta perfiles de empresas que atienden a clientes **en persona** durante su horario,
en su local o yendo donde el cliente. ANVAR TECH atiende **presencial en la Región
Metropolitana** y remoto en todo Chile, así que corresponde como **empresa de servicio en un
área** (sin local abierto al público):

- Se configura un **área de servicio** (comunas o la región) y **se oculta la dirección**.
- No se inventa una dirección comercial ni se usa una oficina virtual o de cowork solo para
  aparecer: va contra las políticas y puede terminar en suspensión.

## Paso a paso

1. Entra a https://business.google.com con la cuenta de Google de la empresa (idealmente la
   misma de Search Console).
2. **Nombre**: `ANVAR TECH` — el nombre real de la empresa, sin agregar palabras clave
   ("ANVAR TECH Automatización IA Santiago" va contra las políticas).
3. **Categoría principal**: elige la más específica que exista en la lista de Google para lo que
   hacen (por ejemplo, algo como "Consultor informático" o "Servicio de consultoría"). Escribe y
   mira las opciones: solo se puede elegir de la lista. Hasta 9 categorías secundarias, solo si
   de verdad describen servicios que prestan.
4. **¿Tienes un local que los clientes pueden visitar?** → **No**.
5. **Áreas de servicio**: Región Metropolitana (o las comunas donde de verdad van a atender).
6. **Contacto**: teléfono `+56 9 2633 3760` y sitio web con UTM para medir:
   `https://ia.anvartech.cl/?utm_source=google&utm_medium=organic&utm_campaign=gbp`
7. **Verificación**: Google indica el método (video, llamada, correo u otro). Sigue sus
   instrucciones; puede tardar varios días.

## Contenido del perfil (listo para pegar, revisa antes)

**Descripción** (máximo 750 caracteres, sin enlaces ni promociones):

> ANVAR TECH es una empresa chilena que automatiza el trabajo repetitivo de otras empresas:
> documentos Word, Excel y PDF, cotizaciones, informes, stock y trabajo manual entre sistemas.
> Conectamos IA, software y las herramientas que tu equipo ya usa. Partimos por un proceso, lo
> medimos antes y después y, si no genera valor, no escalamos. Precio fijo por escrito antes de
> partir. Atención presencial en la Región Metropolitana y remota en todo Chile. Emitimos
> factura.

**Horario**: el horario real en que responden. Si no hay atención fija, usa el horario hábil en
que contestan WhatsApp. No marques "abierto 24 horas" si no es cierto.

**Servicios** (toma nombre y precio del sitio, que es la fuente única; si cambian, actualízalos
aquí también):

| Servicio | Precio en el sitio | Página |
|---|---|---|
| Automatización Express | desde $199.900 + IVA | /automatizacion-express |
| Diagnóstico de automatización | UF 12 + IVA | /diagnostico-ia-empresas |
| Piloto en producción | desde UF 40 + IVA | /automatizacion-procesos-ia |
| ANVAR Intelligence | desde UF 6 / mes + IVA | /inteligencia-datos |
| Capacitación para equipos | UF 14 + IVA | /capacitacion-ia-empresas |

**Fotos**: solo reales. Logo (`public/logo-512.png`), una foto de portada con la marca, el
retrato del fundador si quieren mostrarlo, y capturas de las herramientas propias (calculadora,
autodiagnóstico) o de casos propios con **datos ficticios**. Nunca imágenes de stock presentadas
como trabajos propios, ni planos o documentos de clientes.

**Publicaciones** (opcional, una o dos al mes): reutiliza las de LinkedIn de
`docs/CONTENT_DISTRIBUTION.md`, con el enlace que corresponda y `utm_source=google&utm_medium=organic&utm_campaign=gbp-post`.

## Reseñas

- Pídelas **solo a clientes reales**, después de entregar, con el enlace para reseñas que da
  el perfil. Una por cliente, con sus palabras.
- Nunca: ofrecer descuentos o regalos a cambio, pedir solo reseñas positivas, escribirlas
  uno mismo, a familiares o empleados, ni comprarlas. Google las elimina y puede suspender el perfil.
- Responde todas, también las negativas, con respeto y sin datos del cliente.
- Las reseñas del perfil **no** se copian al sitio como testimonios sin autorización escrita
  del cliente (ver `src/datos/testimonios.mjs`).

## Medición

- En el perfil: Rendimiento → búsquedas, vistas, clics al sitio y llamadas.
- En Vercel Analytics: `organic_landing_view` con `canal = google/organic` y
  `campana = gbp` → visitas que llegaron desde el perfil; `whatsapp_lead` y `service_lead`
  con la misma campaña → leads.
