# ANVAR IA — sitio de asesoría en inteligencia artificial

Sitio estático en `/public` + funciones serverless en `/api`. Misma arquitectura que
anvartech.cl, así que el flujo de trabajo es el que ya conoces.

```
public/          <- raíz del sitio (lo que ve el visitante)
  index.html       página completa
  styles.css       sistema visual (claro + oscuro)
  app.js           conmutador de público, diagnóstico, calculadora, formulario
  favicon.svg
  og-image.png     imagen al compartir por WhatsApp / redes
  robots.txt
  sitemap.xml
api/             <- funciones serverless (opcionales)
  contacto.js      formulario -> correo (Resend) -> CRM en Sheets
  diagnostico.js   lectura personalizada del diagnóstico con Claude
vercel.json      cabeceras de seguridad y caché
operacion/       <- material comercial para usar, no para leer
  01-formulario-previo.md              antes de una Sesión Despegue
  02-mensajes-prospeccion.md           para salir a buscar clientes
  03-guion-llamada-30min.md            la llamada de calificación
  04-plantilla-informe-diagnostico.md  el entregable de las UF 12
  05-acuerdo-de-servicio.md            cliente empresa y colaborador
  06-acta-de-resultado.md              cierre de piloto o implementación
propuesta.html   estrategia: marca, precios, dominio, socio, plan de salida
manual.html      qué se vende y cómo se entrega cada servicio
artifact-anvar-ia.html   copia del sitio en un archivo (generada, no versionada)
```

> **El repositorio tiene que ser PRIVADO.** Adentro van tus precios con margen,
> los guiones de venta y las plantillas de contrato. Nada de eso debe quedar
> público.

## Documentos publicados

Viven como Artifacts en claude.ai. Se actualizan republicando el archivo local
del proyecto; desde otra conversación hay que pasar la URL como `url`, si no se
crea uno nuevo en vez de actualizar el que ya existe.

| Documento | Archivo | URL |
|---|---|---|
| El sitio | `artifact-anvar-ia.html` | https://claude.ai/code/artifact/a0f3ef6f-e812-4aa9-ba10-48d38551b70f |
| Propuesta de lanzamiento | `propuesta.html` | https://claude.ai/code/artifact/c0cb6926-83e2-4f32-926e-9ca2eb9803bd |
| **Manual de operación** | `manual.html` | https://claude.ai/code/artifact/973bbe6c-8998-4466-bea5-9e3b5590a279 |
| Ensayo de cliente | `ensayo.html` | https://claude.ai/code/artifact/05be5c9d-010b-419d-86a6-5cd756a9731c |

El manual enlaza los ocho planes de acción por servicio, así que con ese basta:

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

`artifact-anvar-ia.html` **no se edita a mano**: se genera juntando
`public/index.html` + `styles.css` + `app.js`, y al republicarlo hay que pasarle
la foto (`files: {"andres-vargas.jpg": "public/andres-vargas.jpg"}`) o el
retrato sale roto. Los ocho planes se generan desde `servicios/` inyectando
`servicios/_estilo.css`.

## Ver el sitio en tu computador

```bash
cd public && python -m http.server 8123
```

Después abre `http://127.0.0.1:8123`. No necesita nada instalado.

## Publicarlo

El repo local **ya está iniciado**, en la rama `main`, con el primer commit hecho
y el autor configurado como `construcciones.anvar@gmail.com` (el autorizado en
Vercel; los commits de la cuenta personal antigua quedan bloqueados).

1. Crea un repo **privado** y vacío llamado `anvar-ia` en GitHub, con la cuenta
   **construccionesanvar-ai**.
2. Empuja:

```bash
git remote add origin https://github.com/construccionesanvar-ai/anvar-ia.git
git push -u origin main
```

3. En Vercel, equipo **ANVAR TECH**: *Add New → Project* → importa `anvar-ia` →
   framework *Other* → Deploy.
4. *Settings → Domains* → `ia.anvartech.cl`. Si el DNS de anvartech.cl está en
   Vercel el registro se crea solo; si está en NIC Chile, crea un CNAME
   `ia` → `cname.vercel-dns.com`.

Desde ahí, cada `git push` a `main` vuelve a publicar solo.

## Variables de entorno (todas opcionales)

El sitio funciona sin ninguna: el formulario cae solo a WhatsApp con el mensaje
ya redactado, y el diagnóstico usa su lectura local.

| Variable | Para qué | Si falta |
|---|---|---|
| `RESEND_API_KEY` | Que el formulario te llegue por correo | Cae a WhatsApp |
| `NOTIFY_EMAIL` | A dónde llega (por defecto contacto@anvartech.cl) | Usa el de por defecto |
| `CONTACTO_FROM` | Remitente verificado en Resend | Usa contacto@anvartech.cl |
| `SHEETS_WEBHOOK_URL` | Deja cada contacto en el CRM de Sheets | No registra, igual te llega el correo |
| `ANTHROPIC_API_KEY` | Lectura del diagnóstico escrita por Claude | Usa la lectura local (ya es buena) |
| `ANTHROPIC_MODEL` | Modelo a usar (por defecto `claude-sonnet-5`) | Usa el de por defecto |

## Qué cambiar antes de publicar

- **Tu foto** en la sección "Quién está detrás" (hoy hay un monograma "AV").
- **El nombre y el dominio** — hoy dice ANVAR IA y apunta a `ia.anvartech.cl`.
- **Los precios** — están en `index.html` (secciones Servicios y Planes) y los
  textos de recomendación en `app.js`.
- **El correo** si creas uno con el dominio nuevo.
- **El dominio** en las etiquetas `canonical`, `og:url` y `og:image` del `<head>`,
  en `robots.txt` y en `sitemap.xml`.

El número de WhatsApp está una sola vez, en la constante `WSP` de `app.js`
(y en el texto visible de la sección de contacto).

## Caché: por qué css y js NO son inmutables

`styles.css` y `app.js` conservan el mismo nombre entre versiones. Si se sirven
con `immutable`, el navegador de quien ya visitó el sitio se queda con la copia
vieja **para siempre** y no ve ningún cambio publicado. Pasó, y costó encontrarlo
porque `curl` mostraba el archivo nuevo y el navegador el viejo.

Por eso `vercel.json` sirve:

| Tipo | Política | Razón |
|---|---|---|
| css, js | `max-age=0, must-revalidate` | El ETag responde 304: son bytes y siempre está fresco |
| imágenes | `max-age=86400, must-revalidate` | Cambian poco, pero cambian |
| tipografías | `max-age=31536000, immutable` | Esas sí que nunca cambian |

Las referencias en el HTML llevan `?v=N`. **Si publicas un cambio de CSS o JS y
no lo ves en el navegador pero sí con `curl`, sube ese número.**

> **Ojo con `vercel.json`:** el esquema solo acepta `source`, `headers`, `has` y
> `missing` en cada entrada, y rechaza cualquier clave extra. Agregar un
> `"comment"` hace fallar el deploy **sin logs de build**, porque Vercel valida
> la configuración antes de construir. Para validarlo antes de subir:

```bash
python -c "import json;json.load(open('vercel.json',encoding='utf-8'));print('JSON OK')"
```

## Detalles que conviene no romper

- Los colores salen todos de variables CSS en `:root`. Hay tres juegos: claro,
  oscuro por preferencia del sistema y oscuro forzado. Si agregas un color,
  defínelo primero en el bloque claro o desaparece en un tema.
- El conmutador Personas / Empresas funciona con las clases `only-per` y
  `only-emp`. Cualquier bloque nuevo que dependa del público usa una de las dos.
- La calculadora asume 44 semanas hábiles y un piloto de UF 28. Están arriba de
  `app.js` en las constantes `SEMANAS`, `UF` y `PILOTO`.
- `artifact-anvar-ia.html` se regenera juntando los tres archivos de `/public`;
  si editas el sitio, ese archivo queda desactualizado hasta que lo rehagas.
