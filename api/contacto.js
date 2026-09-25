// POST /api/contacto
// Recibe el formulario del sitio, avisa por correo (Resend) y opcionalmente
// deja la fila en el CRM de Google Sheets. Si falta configuración, no rompe:
// responde 503 y el sitio ofrece enviar el mismo mensaje por WhatsApp.
//
// Protección contra spam, sin captchas: campo trampa, tiempo mínimo de
// llenado, mismo origen y un límite de envíos por IP. Nada de esto guarda
// datos: la IP vive solo en memoria y por pocos minutos.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.CONTACTO_FROM || 'ANVAR TECH <contacto@anvartech.cl>';
// NOTIFY_MAIL es el nombre con que está creada la variable en Vercel;
// NOTIFY_EMAIL se acepta también por compatibilidad con la documentación anterior.
const TO = process.env.NOTIFY_EMAIL || process.env.NOTIFY_MAIL || 'contacto@anvartech.cl';
const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;

const TIPOS = {
  express: 'Automatizar un proceso puntual',
  diagnostico: 'Evaluar varios procesos',
  datos: 'Datos, reportes o stock',
  capacitacion: 'Capacitar a su equipo',
  piloto: 'Automatizar un proceso',
  personal: 'Uso personal de IA',
  otro: 'Otra cosa'
};

// Nombre legible de la página de origen, para el asunto y el CRM.
const PAGINAS = {
  '/': 'Inicio',
  '/automatizacion-express': 'Automatización Express',
  '/inteligencia-datos': 'Inteligencia de datos',
  '/diagnostico-ia-empresas': 'Diagnóstico',
  '/automatizacion-procesos-ia': 'Piloto e implementación',
  '/capacitacion-ia-empresas': 'Capacitación',
  '/casos': 'Casos',
  '/asesoria-ia-personal': 'Asesoría personal',
  '/privacidad': 'Privacidad'
};

const TIEMPO_MINIMO_MS = 1500; // nadie llena y envía el formulario en menos de 1,5 s
const VENTANA_MS = 10 * 60 * 1000;
const POR_IP = 5; // envíos por IP cada 10 minutos
const envios = new Map();

function permitido(ip) {
  const ahora = Date.now();
  const previos = (envios.get(ip) || []).filter((t) => ahora - t < VENTANA_MS);
  if (previos.length >= POR_IP) return false;
  previos.push(ahora);
  envios.set(ip, previos);
  if (envios.size > 2000) envios.clear();
  return true;
}

function limpiar(v, max, saltos) {
  const sucio = String(v == null ? '' : v);
  // Quita caracteres de control a propósito (evita inyección en el correo y el CRM).
  /* eslint-disable no-control-regex */
  const limpio = saltos
    ? sucio.replace(/\r\n/g, '\n').replace(/[\x00-\x09\x0B-\x1F\x7F]/g, ' ')
    : sucio.replace(/[\x00-\x1F\x7F]/g, ' ');
  /* eslint-enable no-control-regex */
  return limpio.trim().slice(0, max || 500);
}
function escapar(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
const esCorreo = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const esFono = (v) => /^[+\d\s().-]+$/.test(v) && v.replace(/\D/g, '').length >= 8;

/** Número chileno a formato de wa.me (569XXXXXXXX), si se puede. */
function wspDe(fono) {
  let d = fono.replace(/\D/g, '');
  if (d.length === 9 && d.startsWith('9')) d = '56' + d;
  return d.length >= 10 ? `https://wa.me/${d}` : null;
}

/** El mismo origen que el sitio: evita que otro sitio use este formulario. */
function mismoOrigen(req) {
  const origen = req.headers.origin;
  if (!origen) return true; // navegadores sin Origin en POST del mismo sitio, o sin JS
  try {
    const host = new URL(origen).host;
    return host === req.headers.host || host === req.headers['x-forwarded-host'];
  } catch { return false; }
}

function responder(req, res, status, cuerpo) {
  res.setHeader('Cache-Control', 'no-store');
  // Envío sin JavaScript (formulario HTML clásico): se contesta con una página simple.
  const html = String(req.headers['content-type'] || '').includes('application/x-www-form-urlencoded');
  if (!html) return res.status(status).json(cuerpo);
  const ok = status < 300;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(status).send(`<!DOCTYPE html><html lang="es-CL"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${ok ? 'Mensaje recibido' : 'No se pudo enviar'} | ANVAR TECH</title><link rel="stylesheet" href="/styles.css"></head><body><main class="seccion"><div class="contenedor contenedor--estrecho"><h1>${ok ? 'Listo, nos llegó tu mensaje' : 'No pudimos enviar el formulario'}</h1><p class="lead">${ok ? 'Te respondemos antes de 24 horas hábiles.' : 'Escríbenos por WhatsApp al +56 9 2633 3760 o a contacto@anvartech.cl.'}</p><p><a class="btn btn--primario" href="/">Volver al sitio</a></p></div></main></body></html>`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  if (!mismoOrigen(req)) return responder(req, res, 403, { error: 'Origen no permitido.' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Trampas para bots: se responde "ok" para no darles pistas, pero no se envía nada.
  if (limpiar(body.web, 50)) return responder(req, res, 200, { ok: true });
  const t = Number(body.t);
  if (Number.isFinite(t) && t > 0 && Date.now() - t < TIEMPO_MINIMO_MS) return responder(req, res, 200, { ok: true });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconocida';
  if (!permitido(ip)) return responder(req, res, 429, { error: 'Demasiados envíos seguidos.' });

  const origen = limpiar(body.origen, 80) || '/';
  const datos = {
    nombre: limpiar(body.nombre, 120),
    empresa: limpiar(body.empresa, 160),
    contacto: limpiar(body.contacto, 160),
    tipo: TIPOS[body.tipo] || 'Sin especificar',
    mensaje: limpiar(body.mensaje, 2000, true),
    origen,
    pagina: PAGINAS[origen] || origen,
    fuente: limpiar(body.fuente, 40).replace(/[^a-z0-9-]/gi, '') || 'web',
    fecha: new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })
  };

  if (datos.nombre.length < 2) return responder(req, res, 400, { error: 'Falta tu nombre.' });
  if (!esCorreo(datos.contacto) && !esFono(datos.contacto)) {
    return responder(req, res, 400, { error: 'Escribe un WhatsApp (8 dígitos o más) o un correo válido.' });
  }
  if (!RESEND_API_KEY && !SHEETS_WEBHOOK_URL) {
    return responder(req, res, 503, { error: 'Formulario no configurado todavía.' });
  }

  const correoLead = esCorreo(datos.contacto) ? datos.contacto : null;
  const wspLead = correoLead ? null : wspDe(datos.contacto);
  const asunto = `Nuevo lead · ${datos.pagina} · ${datos.nombre}${datos.empresa ? ' (' + datos.empresa + ')' : ''}`;

  const filas = [
    ['Página', datos.pagina],
    ['Fuente', datos.fuente],
    ['Nombre', datos.nombre],
    ['Empresa', datos.empresa || '—'],
    ['Contacto', datos.contacto],
    ['Necesita', datos.tipo],
    ['Fecha', datos.fecha]
  ];
  const html = `<div style="font-family:system-ui,sans-serif;max-width:560px">
    <p style="font:12px/1.5 monospace;letter-spacing:.12em;color:#8A5400;margin:0 0 6px">NUEVO LEAD · ${escapar(datos.pagina.toUpperCase())}</p>
    <h2 style="margin:0 0 18px;font-size:20px">${escapar(datos.nombre)}${datos.empresa ? ' · ' + escapar(datos.empresa) : ''}</h2>
    <table style="border-collapse:collapse;margin-bottom:18px">${filas.map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#6b7280;font:12px/1.5 monospace;white-space:nowrap">${escapar(k)}</td><td style="padding:6px 0;font:14px/1.5 system-ui">${escapar(v)}</td></tr>`).join('')}</table>
    <p style="font:12px/1.5 monospace;color:#6b7280;margin:0 0 6px">PROBLEMA</p>
    <div style="border-left:3px solid #D98A0B;padding:4px 0 4px 14px;white-space:pre-wrap;font:14px/1.6 system-ui">${datos.mensaje ? escapar(datos.mensaje) : '— (no lo describió)'}</div>
    ${wspLead ? `<p style="margin-top:18px"><a href="${escapar(wspLead)}" style="font:600 14px system-ui;color:#8A5400">Responder por WhatsApp</a></p>` : ''}
    ${correoLead ? '<p style="margin-top:18px;font:13px system-ui;color:#6b7280">Responde este correo para escribirle directamente.</p>' : ''}
  </div>`;
  const texto = [
    `NUEVO LEAD · ${datos.pagina}`, '',
    ...filas.map(([k, v]) => `${k}: ${v}`), '',
    'Problema:', datos.mensaje || '— (no lo describió)',
    wspLead ? `\nResponder por WhatsApp: ${wspLead}` : ''
  ].join('\n');

  const correo = RESEND_API_KEY
    ? fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: [TO], subject: asunto, html, text: texto, reply_to: correoLead || undefined }),
        signal: AbortSignal.timeout(8000)
      }).then(async (r) => { if (!r.ok) throw new Error(`resend HTTP ${r.status}`); return true; })
    : Promise.reject(new Error('resend sin configurar'));

  const crm = SHEETS_WEBHOOK_URL
    ? fetch(SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origen: 'anvar-ia', ...datos }),
        signal: AbortSignal.timeout(8000)
      }).then((r) => { if (!r.ok) throw new Error(`sheets HTTP ${r.status}`); return true; })
    : Promise.reject(new Error('sheets sin configurar'));

  const [rCorreo, rCrm] = await Promise.allSettled([correo, crm]);
  // Registro sin datos personales: solo qué canal falló.
  if (rCorreo.status === 'rejected' && RESEND_API_KEY) console.error('contacto: correo', rCorreo.reason && rCorreo.reason.message);
  if (rCrm.status === 'rejected' && SHEETS_WEBHOOK_URL) console.error('contacto: crm', rCrm.reason && rCrm.reason.message);

  // Basta con que el lead haya quedado en un lugar.
  if (rCorreo.status === 'fulfilled' || rCrm.status === 'fulfilled') return responder(req, res, 200, { ok: true });
  return responder(req, res, 502, { error: 'No se pudo enviar.' });
}
