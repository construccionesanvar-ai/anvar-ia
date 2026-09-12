// POST /api/diagnostico
// Opcional. Toma el resultado del cuestionario del sitio y le pide a Claude
// un párrafo personalizado, en tu voz, con el primer paso concreto.
// Si no hay ANTHROPIC_API_KEY, responde 503 y el sitio usa su lectura local.

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODELO = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

const SISTEMA = `Eres el asistente de ANVAR IA, la consultora de Andrés Vargas (Santiago, Chile).
Andrés es estudiante de Ingeniería Civil Industrial, trabaja en prevención de pérdidas en retail
y construye sistemas reales: una app que genera ocho documentos legales y lee boletas sin internet,
un sitio de servicios que cotiza con IA y cobra en línea, y planos de AutoCAD dibujados por instrucciones.

Tono: chileno neutro, directo, sin humo, sin anglicismos innecesarios, sin exclamaciones.
Trata de "tú". Nunca prometas magia ni porcentajes que no te dieron.
Si el diagnóstico muestra poco potencial, dilo con claridad y recomienda algo chico.

Entregas exactamente tres párrafos cortos, sin títulos ni listas:
1) Qué está pasando en su caso, leyendo los tres ejes.
2) Cuál es el primer paso concreto y por qué ese y no otro.
3) Qué esperar en las primeras cuatro semanas, en términos medibles.
Máximo 140 palabras en total.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  if (!ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Sin clave de IA configurada.' });
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
    publico: body.publico === 'empresas' ? 'una empresa' : 'una persona',
    rubro: String(body.rubro || '').replace(/[\x00-\x1F\x7F]/g, ' ').trim().slice(0, 120)
  };

  const prompt = `Resultado del diagnóstico de ${d.publico}${d.rubro ? ` del rubro ${d.rubro}` : ''}:
- Índice general: ${d.indice}/100
- Potencial a ganar (horas repetidas y fragilidad del proceso): ${d.potencial}%
- Base y orden (dónde viven los datos, si está medido): ${d.base}%
- Tracción para partir (uso actual de IA y capacidad de decidir): ${d.traccion}%

Escribe la lectura para esta persona.`;

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
      })
    });
    if (!r.ok) throw new Error(await r.text());
    const j = await r.json();
    const texto = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    if (!texto) throw new Error('respuesta vacía');
    return res.status(200).json({ ok: true, texto });
  } catch (e) {
    console.error('anthropic', e);
    return res.status(502).json({ error: 'La IA no respondió.' });
  }
}
