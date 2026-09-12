// POST /api/contacto
// Recibe el formulario del sitio, avisa por correo (Resend) y opcionalmente
// deja la fila en el CRM de Google Sheets. Si falta una variable de entorno,
// no rompe: responde 503 y el front cae solo al respaldo por WhatsApp.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.CONTACTO_FROM || 'ANVAR IA <contacto@anvartech.cl>';
const TO = process.env.NOTIFY_EMAIL || 'contacto@anvartech.cl';
const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;

const TIPOS = {
  personal: 'Uso personal de IA',
  diagnostico: 'Diagnóstico para empresa',
  piloto: 'Automatizar un proceso',
  capacitacion: 'Capacitación al equipo',
  otro: 'Otra cosa'
};

function limpiar(v, max, saltos) {
  const sucio = String(v == null ? '' : v);
  const limpio = saltos
    ? sucio.replace(/\r\n/g, '\n').replace(/[\x00-\x09\x0B-\x1F\x7F]/g, ' ')
    : sucio.replace(/[\x00-\x1F\x7F]/g, ' ');
  return limpio.trim().slice(0, max || 500);
}
function escapar(s) {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const datos = {
    nombre: limpiar(body.nombre, 120),
    contacto: limpiar(body.contacto, 160),
    tipo: TIPOS[body.tipo] || 'Sin especificar',
    mensaje: limpiar(body.mensaje, 2000, true),
    publico: body.publico === 'empresas' ? 'Empresas' : 'Personas',
    fecha: new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })
  };

  if (!datos.nombre || !datos.contacto) {
    return res.status(400).json({ error: 'Falta el nombre o la forma de contacto.' });
  }
  // trampa simple contra bots: campo que ningún humano completa
  if (limpiar(body.web, 50)) return res.status(200).json({ ok: true });

  if (!RESEND_API_KEY) {
    return res.status(503).json({ error: 'Correo no configurado todavía.' });
  }

  const filas = [
    ['Nombre', datos.nombre],
    ['Contacto', datos.contacto],
    ['Necesita', datos.tipo],
    ['Público', datos.publico],
    ['Fecha', datos.fecha]
  ].map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#6b7280;font:12px/1.5 monospace;white-space:nowrap">${escapar(k)}</td><td style="padding:6px 0;font:14px/1.5 system-ui">${escapar(v)}</td></tr>`).join('');

  const html = `<div style="font-family:system-ui,sans-serif;max-width:560px">
    <p style="font:12px/1.5 monospace;letter-spacing:.12em;color:#8A5400;margin:0 0 6px">NUEVO CONTACTO · ANVAR IA</p>
    <h2 style="margin:0 0 18px;font-size:20px">${escapar(datos.nombre)}</h2>
    <table style="border-collapse:collapse;margin-bottom:18px">${filas}</table>
    ${datos.mensaje ? `<div style="border-left:3px solid #D98A0B;padding:4px 0 4px 14px;white-space:pre-wrap;font:14px/1.6 system-ui">${escapar(datos.mensaje)}</div>` : ''}
  </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject: `ANVAR IA · ${datos.nombre} — ${datos.tipo}`,
        html,
        reply_to: datos.contacto.includes('@') ? datos.contacto : undefined
      })
    });
    if (!r.ok) throw new Error(await r.text());
  } catch (e) {
    console.error('resend', e);
    return res.status(502).json({ error: 'No se pudo enviar el correo.' });
  }

  // CRM opcional: no debe hacer fallar la respuesta al visitante
  if (SHEETS_WEBHOOK_URL) {
    try {
      await fetch(SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origen: 'anvar-ia', ...datos })
      });
    } catch (e) { console.error('sheets', e); }
  }

  return res.status(200).json({ ok: true });
}
