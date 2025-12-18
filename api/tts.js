// /api/tts.js
export default async function handler(req, res) {
  // Разрешаем CORS, чтобы ваш фронтенд мог обращаться к этому эндпоинту
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обработка предварительного запроса (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`, // Или просто OPENAI_API_KEY, проверьте переменные окружения в Vercel
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'alloy', // Или другой голос
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'OpenAI API Error');
    }

    // Получаем аудио как ArrayBuffer
    const audioBuffer = await response.arrayBuffer();

    // Возвращаем аудио файл обратно на фронтенд
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: error.message });
  }
}
