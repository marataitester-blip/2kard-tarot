// api/analyze.js
export default async function handler(req, res) {
  // 1. Настройка заголовков, чтобы браузер не ругался (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Если браузер просто проверяет связь — отвечаем ОК
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. Проверка ключа (используем имя, которое вы дали)
  const apiKey = process.env.VITE_OPENROUTER_KEY;

  if (!apiKey) {
    console.error("CRITICAL ERROR: Ключ VITE_OPENROUTER_KEY не найден в Vercel!");
    return res.status(500).json({ 
      error: 'Server Error: API Key missing', 
      hint: 'Добавьте VITE_OPENROUTER_KEY в Settings -> Environment Variables на Vercel'
    });
  }

  // 3. Отправка запроса в OpenRouter (через сервер, обходя блокировки РФ)
  try {
    const { messages } = req.body;
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://2kard-tarot.vercel.app",
        "X-Title": "Psy Tarot",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free", // Бесплатная, быстрая модель
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(JSON.stringify(data));
    }

    // Возвращаем ответ на ваш сайт
    res.status(200).json(data);

  } catch (error) {
    console.error("OpenRouter Error:", error);
    res.status(500).json({ error: 'Ошибка связи с ИИ', details: error.message });
  }
}
