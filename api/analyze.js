// api/analyze.js
export default async function handler(req, res) {
  // Разрешаем CORS вручную, чтобы запросы проходили лучше
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Обработка предварительного запроса (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Получаем ключ
  const apiKey = process.env.VITE_OPENROUTER_KEY;

  if (!apiKey) {
    console.error("CRITICAL: VITE_OPENROUTER_KEY is missing in Vercel Env Vars");
    return res.status(500).json({ error: 'Сервер не настроен: нет API ключа' });
  }

  const { messages } = req.body;

  try {
    console.log("Sending request to OpenRouter...");
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://2kard-tarot.vercel.app",
        "X-Title": "Psy Tarot",
      },
      body: JSON.stringify({
        // Пробуем более стабильную модель, если flash глючит
        model: "google/gemini-2.0-flash-exp:free", 
        messages: messages
      })
    });

    const data = await response.json();

    // Если OpenRouter вернул ошибку, возвращаем её текст на клиент
    if (!response.ok) {
        console.error("OpenRouter Error Details:", JSON.stringify(data));
        // Возвращаем точное сообщение об ошибке, чтобы ты увидел его в консоли
        return res.status(response.status).json({ 
            error: data.error?.message || 'Unknown Provider Error',
            details: data 
        });
    }

    res.status(200).json(data);

  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: error.message });
  }
}
