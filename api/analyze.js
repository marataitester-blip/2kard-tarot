export default async function handler(req, res) {
  // Настройки CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const apiKey = process.env.VITE_OPENROUTER_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server Error: API Key missing' });
  }

  try {
    // Получаем сообщения И идентификатор персонажа
    const { messages, character } = req.body;

    let selectedModel;

    // --- ЛОГИКА ПАРАЛЛЕЛЬНОГО ВЫБОРА ---
    // Если фронтенд передал 'VIP' — это Мессир -> Включаем Claude
    if (character === 'VIP') {
       selectedModel = "anthropic/claude-3.5-sonnet"; 
    } 
    // В остальных случаях (Марго) -> Включаем Qwen
    else {
       selectedModel = "qwen/qwen-2.5-72b-instruct"; 
    }

    console.log(`Запрос от: ${character || 'Unknown'}. Модель: ${selectedModel}`);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://2kard-tarot.vercel.app",
        "X-Title": "Psy Tarot",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(JSON.stringify(data));
    }

    res.status(200).json(data);

  } catch (error) {
    console.error("OpenRouter Error:", error);
    res.status(500).json({ error: 'Ошибка связи с ИИ', details: error.message });
  }
}
