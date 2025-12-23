export const config = {
  runtime: 'edge', // Это делает код очень быстрым
};

export default async function handler(req) {
  // 1. Обработка CORS (Разрешаем Айфону доступ)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // 2. ПОЛУЧЕНИЕ КЛЮЧА
    // Мы ищем ключ VITE_... (который вы поставили) или обычный.
    const API_KEY = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

    if (!API_KEY) {
      console.error("No API Key found");
      return new Response(JSON.stringify({ error: "Server Error: API Key missing" }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Читаем данные от приложения
    const { text, voice } = await req.json();

    if (!text) {
      return new Response('Text is required', { status: 400 });
    }

    // 4. Отправляем запрос в OpenAI (Сервер -> Сервер)
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice || 'alloy',
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI Error:", errorText);
      return new Response(errorText, { status: openaiResponse.status });
    }

    // 5. Отдаем аудио Айфону с правильными заголовками
    return new Response(openaiResponse.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*', // ЭТО ВАЖНО ДЛЯ IPHONE
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error("Proxy Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
