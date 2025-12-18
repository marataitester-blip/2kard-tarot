// api/tts.js
// Этот код выполняется на серверах Vercel. VPN здесь не нужен!

export default async function handler(req, res) {
  // 1. Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  // 2. Берем секретный ключ из настроек Vercel
  const apiKey = process.env.VITE_OPENAI_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key is missing on server' });
  }

  try {
    // 3. Стучимся в OpenAI от имени американского сервера
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "onyx", // <-- Наш голос (глубокий мужской)
        speed: 1.0     // Скорость (1.0 - норма)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    // 4. Получаем аудио и отправляем клиенту
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(buffer);

  } catch (error) {
    console.error("TTS Proxy Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
