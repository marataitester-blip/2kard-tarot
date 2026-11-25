export const config = { runtime: 'edge' };

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

function json(value, status) {
  return new Response(JSON.stringify(value), { status, headers });
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const key = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_KEY;
  if (!key) return json({ error: 'Reading service is not configured' }, 503);

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  if (!Array.isArray(input?.messages) || !input.messages.length) {
    return json({ error: 'Messages required' }, 400);
  }

  const messir = input.character === 'VIP';
  const model = messir
    ? process.env.PSY_MESSIR_MODEL || 'anthropic/claude-sonnet-4.5'
    : process.env.PSY_MARGOT_MODEL || 'qwen/qwen-2.5-72b-instruct';

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://2kard-tarot.vercel.app',
        'X-Title': 'Psy Tarot'
      },
      body: JSON.stringify({ model, messages: input.messages, temperature: messir ? 0.6 : 0.7 })
    });
    if (!response.ok) {
      console.error('Psy Tarot reading provider returned', response.status, model);
      return json({ error: 'Reading provider unavailable' }, 502);
    }
    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) return json({ error: 'Empty reading' }, 502);
    return json(data, 200);
  } catch {
    return json({ error: 'Reading provider unavailable' }, 502);
  }
}
