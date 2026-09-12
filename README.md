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
propuesta.html   documento de estrategia (marca, precios, plan de salida)
artifact-anvar-ia.html   copia del sitio en un solo archivo (la publicada en Claude)
```

## Ver el sitio en tu computador

```bash
cd public && python -m http.server 8123
```

Después abre `http://127.0.0.1:8123`. No necesita nada instalado.

## Publicarlo

1. Crea un repo nuevo en GitHub **con la cuenta de ANVAR** (no la personal antigua:
   Vercel bloquea los deploys cuyo autor de commit no esté autorizado).
2. Sube esta carpeta completa.
3. En Vercel: *Add New Project* → importa el repo → sin framework → Deploy.
4. En *Settings → Domains*, agrega `ia.anvartech.cl` y crea el CNAME en tu DNS.

Cada `git push` a `main` vuelve a publicar solo.

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
