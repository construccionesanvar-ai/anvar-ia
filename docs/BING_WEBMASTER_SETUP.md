# Bing Webmaster Tools e IndexNow · ia.anvartech.cl

Bing tiene menos tráfico que Google en Chile, pero su índice alimenta a Copilot de
Microsoft, a DuckDuckGo y a otros buscadores y asistentes con búsqueda web. Configurarlo
toma 10 minutos y no requiere tocar el código.

> Ningún buscador garantiza indexar ni posicionar. Estos pasos le avisan a Bing qué existe
> y qué cambió; el resto depende de Bing.

## 1. Agregar el sitio (la forma más rápida)

1. Entra a https://www.bing.com/webmasters con la cuenta Microsoft de la empresa.
2. Elige **Importar desde Google Search Console** y autoriza. Bing copia la propiedad
   verificada y el sitemap. No hace falta ningún código.
3. Si prefieres no conectar Google: elige **Agregar el sitio manualmente** → método
   **Etiqueta HTML** → copia solo el valor de `content` de la etiqueta
   `<meta name="msvalidate.01" content="…">` y pégalo en `src/config.mjs`:
   ```js
   verificacion: {
     bing: 'EL_VALOR_QUE_TE_DIO_BING',
   },
   ```
   Luego `npm run build`, commit y push. Cuando el deploy termine, pulsa **Verificar** en Bing.
   El código de verificación no es un secreto: queda público en el HTML, como el de Google.

## 2. Sitemap

Sitemaps → **Enviar sitemap** → `https://ia.anvartech.cl/sitemap.xml`. Si importaste desde
Search Console, ya debería aparecer. Estado esperado: "Correcto", 24 URL.

## 3. IndexNow (ya está funcionando en el sitio)

IndexNow es un protocolo abierto: el sitio avisa "esta URL cambió" y los buscadores que lo
usan (Bing, Yandex, Seznam, Naver y otros) la revisan antes. **Google no usa IndexNow**: para
Google basta el sitemap y Search Console.

Cómo está armado:

| Pieza | Dónde |
|---|---|
| Clave (pública por diseño) | `src/config.mjs` → `SITIO.indexnow.clave` |
| Archivo que prueba que el dominio es nuestro | `https://ia.anvartech.cl/d269de45b82b161e07fd9c4fd6224e58.txt` (lo genera el build) |
| Script | `scripts/indexnow.mjs` |
| Automatización | `.github/workflows/indexnow.yml`: después de cada push a `main` que cambia `public/`, espera a que producción sirva el sitemap nuevo y avisa **solo las URL que cambiaron** (y las que se eliminaron) |

No envía todo el sitio en cada deploy, a propósito: avisar URL que no cambiaron es spam para
el protocolo y puede hacer que Bing ignore los avisos.

### Primer envío (una vez, después del lanzamiento)

GitHub → pestaña **Actions** → **IndexNow** → **Run workflow** → marca "Enviar todas las URL
del sitemap" → **Run**. En el registro debe aparecer `Respuesta IndexNow: 200` o `202`.

### Envío manual desde tu computador

```bash
npm run indexnow -- --urls /recursos/cuanto-cuesta-automatizar-proceso-chile,/automatizar-excel
npm run indexnow -- --todas --simular   # muestra qué enviaría, sin enviar
```

### Respuestas de IndexNow

| Código | Significado | Qué hacer |
|---|---|---|
| 200 | Recibido | Nada |
| 202 | Recibido; la clave se está validando | Nada; es normal las primeras veces |
| 400 | Formato inválido | Revisar el script |
| 403 | La clave no coincide con el archivo publicado | Abrir `/<clave>.txt` en el navegador: debe mostrar la clave |
| 422 | Alguna URL no es de este dominio o la clave no corresponde | Revisar las URL enviadas |
| 429 | Demasiados envíos | Esperar; no reenviar en bucle |

### Rotar la clave

Solo si crees que alguien la está usando para enviar URL falsas (poco probable: solo acepta
URL de este dominio).

1. Genera 32 caracteres hexadecimales: `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`.
2. Reemplaza `SITIO.indexnow.clave` en `src/config.mjs`.
3. `npm run build` (borra el archivo de la clave anterior y crea el nuevo), commit y push.

### En Bing Webmaster Tools

Menú **IndexNow**: muestra las URL recibidas por IndexNow y si hubo errores. Revísalo la
primera semana para confirmar que llegan los avisos.

## 4. Qué revisar

| Cuándo | Dónde | Qué debe verse |
|---|---|---|
| Día 1 | IndexNow | Las URL del primer envío aparecen como recibidas |
| Día 7 | Sitemaps | 24 URL descubiertas |
| Día 14 | Search Performance | Primeras impresiones de las páginas nuevas |
| Mensual | Site Explorer / Recommendations | Sin errores graves (títulos duplicados, páginas bloqueadas) |

Si Bing recomienda "meta description too long/short": revisa `npm run check`, que ya avisa
fuera del rango 70–165 caracteres.
