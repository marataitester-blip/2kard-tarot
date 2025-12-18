export const config = {
  runtime: 'edge', // Используем Edge Runtime для скорости
};

export default async function handler(req) {
  // 1. Проверяем метод
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // 2. Получаем текст от фронтенда
    const { text } = await req.json();

    if (!text) {
      return new Response('Text is required', { status: 400 });
    }

    // 3. Сервер Vercel делает запрос к OpenAI (этот запрос не блокируется)
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Ключ берется из переменных Vercel
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'alloy', // Можно поменять голос
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      return new Response(error, { status: openaiResponse.status });
    }

    // 4. Возвращаем аудио-поток прямо в браузер
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
