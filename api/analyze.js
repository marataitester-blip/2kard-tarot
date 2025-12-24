export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ВАЖНО: Тут мы используем именно то название, которое ты дал
  const apiKey = process.env.VITE_OPENROUTER_KEY; 

  if (!apiKey) {
    console.error("Ошибка: Ключ VITE_OPENROUTER_KEY не найден в настройках сервера.");
    return res.status(500).json({ error: 'API Key not configured' });
  }

  const { messages } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://2kard-tarot.vercel.app", // Твой сайт
        "X-Title": "Psy Tarot",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free", // Бесплатная модель через OpenRouter
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Ошибка от OpenRouter:", data);
        throw new Error(data.error?.message || 'Ошибка API провайдера');
    }

    res.status(200).json(data);

  } catch (error) {
    console.error("Критическая ошибка сервера:", error);
    res.status(500).json({ error: error.message });
  }
}
