export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // 1. Теперь мы получаем не только text, но и voice!
    const { text, voice } = await req.json();

    if (!text) {
      return new Response('Text is required', { status: 400 });
    }

    // 2. Отправляем запрос в OpenAI с нужным голосом
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice || 'alloy', // Если голос не передан, используем alloy
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      return new Response(error, { status: openaiResponse.status });
    }

    // 3. Возвращаем аудио
    return new Response(openaiResponse.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
