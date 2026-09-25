// POST /api/diagnostico
// Opcional. Toma el resultado del cuestionario del sitio y le pide a un modelo
// de lenguaje una lectura personalizada con el primer paso concreto.
// Si no hay ANTHROPIC_API_KEY, responde 503 y el sitio usa su lectura local.

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Primer paso que el sitio ya mostró. Mismos ids que src/datos/oferta.mjs.
const PASOS = {
  express: 'Automatización Express (un proceso pequeño, con precio fijo)',
  diagnostico: 'Diagnóstico de automatización (una semana midiendo procesos en horas y pesos)',
  piloto: 'Piloto en producción (automatizar el proceso más costoso y medirlo antes y después)',
  intelligence: 'ANVAR Intelligence (tablero, alertas y análisis mensual de ventas, stock y costos)',
  capacitacion: 'Capacitación para el equipo (taller práctico de 4 horas)'
};
const MODELO = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

const SISTEMA = `Eres el asistente de ANVAR TECH (IA & Automatización), una empresa chilena de
automatización e inteligencia operacional. Su especialidad parte desde las operaciones:
primero entiende el proceso y dónde la empresa pierde tiempo, y después decide si
corresponde automatización, software, análisis de datos o IA.

Servicios que puedes sugerir, solo si calzan con el resultado: Automatización Express
(un proceso pequeño y delimitado), Diagnóstico (varios procesos o datos desordenados),
Piloto en producción (mucho potencial, datos ordenados y capacidad de decidir),
ANVAR Intelligence (datos de ventas, stock o costos ya ordenados) o capacitación del equipo
(poco potencial de automatización).

Tono: chileno profesional, directo, sin humo, sin anglicismos innecesarios, sin exclamaciones.
Trata de "tú". Habla del resultado para la empresa, no de tecnología. No menciones marcas de
modelos de IA. Nunca prometas ahorros, porcentajes ni plazos que no estén en los datos.
Si el diagnóstico muestra poco potencial, dilo con claridad y recomienda algo chico.

El sitio ya le mostró un "primer paso sugerido". Tu lectura tiene que respaldar ese mismo
paso: nunca recomiendes otro servicio como primer paso, porque el visitante lo ve como una
contradicción. Si el dato no viene, elige tú según los criterios de arriba.

Entregas exactamente tres párrafos cortos, sin títulos ni listas:
1) Qué está pasando en su caso, leyendo los tres ejes y el tipo de problema.
2) Por qué el primer paso sugerido es el que corresponde, y qué se hace en él.
3) Qué debería poder medir en las primeras semanas.
Máximo 140 palabras en total.`;

// Freno contra abuso. Este endpoint es público y cada llamada cuesta plata.
// Ojo: las funciones serverless se reinician y pueden correr varias instancias
// a la vez, así que esto frena el uso casual, NO a alguien decidido. La
// protección de verdad es el límite de gasto en la consola de Anthropic.
const VENTANA_MS = 60 * 60 * 1000;   // 1 hora
const POR_IP = 5;                     // lecturas por IP por hora
const POR_INSTANCIA_DIA = 200;        // techo diario por instancia
const visitas = new Map();
let delDia = { fecha: '', n: 0 };

function permitido(ip) {
  const hoy = new Date().toISOString().slice(0, 10);
  if (delDia.fecha !== hoy) delDia = { fecha: hoy, n: 0 };
  if (delDia.n >= POR_INSTANCIA_DIA) return false;

  const ahora = Date.now();
  const previas = (visitas.get(ip) || []).filter(t => ahora - t < VENTANA_MS);
  if (previas.length >= POR_IP) return false;

  previas.push(ahora);
  visitas.set(ip, previas);
  if (visitas.size > 2000) visitas.clear();   // que no crezca sin control
  delDia.n++;
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  res.setHeader('Cache-Control', 'no-store');
  if (!ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Sin clave de IA configurada.' });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconocida';
  if (!permitido(ip)) {
    // El sitio ya muestra su lectura local, así que el visitante no ve error.
    return res.status(429).json({ error: 'Demasiadas lecturas seguidas.' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const n = (v, def) => {
    const x = Number(v);
    return Number.isFinite(x) ? Math.max(0, Math.min(100, Math.round(x))) : def;
  };
  const d = {
    indice: n(body.indice, 0),
    potencial: n(body.potencial, 0),
    base: n(body.base, 0),
    traccion: n(body.traccion, 0),
    publico: body.publico === 'personas' ? 'una persona' : 'una empresa',
    /* eslint-disable no-control-regex -- quita caracteres de control a propósito */
    rubro: String(body.rubro || '').replace(/[\x00-\x1F\x7F]/g, ' ').trim().slice(0, 120),
    categoria: String(body.categoria || '').replace(/[\x00-\x1F\x7F]/g, ' ').trim().slice(0, 80),
    /* eslint-enable no-control-regex */
    // Solo ids conocidos: el texto que llega al modelo lo escribimos nosotros.
    recomendacion: PASOS[body.recomendacion] || ''
  };

  const prompt = `Resultado del diagnóstico de ${d.publico}${d.rubro ? ` del rubro ${d.rubro}` : ''}:
- Índice general: ${d.indice}/100
- Potencial a ganar (horas repetidas y fragilidad del proceso): ${d.potencial}%
- Base y orden (dónde viven los datos, si está medido): ${d.base}%
- Tracción para partir (uso actual de IA y capacidad de decidir): ${d.traccion}%
${d.categoria ? `- Tipo de problema que quiere resolver primero: ${d.categoria}\n` : ''}${d.recomendacion ? `- Primer paso sugerido que ya le mostró el sitio: ${d.recomendacion}\n` : ''}
Escribe la lectura para esta empresa.`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 500,
        system: SISTEMA,
        messages: [{ role: 'user', content: prompt }]
      }),
      signal: AbortSignal.timeout(15000)
    });
    if (!r.ok) throw new Error(await r.text());
    const j = await r.json();
    const texto = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    if (!texto) throw new Error('respuesta vacía');
    return res.status(200).json({ ok: true, texto });
  } catch (e) {
    console.error('anthropic', e instanceof Error ? e.message : e);
    return res.status(502).json({ error: 'La IA no respondió.' });
  }
}
