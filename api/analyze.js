export default async function handler(req, res) {
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
    const { messages, character } = req.body;

    let selectedModel;
    let tempSetting; // Настройка креативности

    if (character === 'VIP') {
       // --- МЕССИР ---
       // Модель: Claude 3.5 Sonnet
       selectedModel = "anthropic/claude-3.5-sonnet"; 
       // Креатив: 0.6 (Чуть выше среднего, баланс между точностью и иронией)
       tempSetting = 0.6;
    } else {
       // --- МАРГО ---
       // Модель: Qwen 2.5 72B
       selectedModel = "qwen/qwen-2.5-72b-instruct"; 
       // Креатив: 0.7 (Стандарт для живого общения и практики)
       tempSetting = 0.7;
    }

    console.log(`Персонаж: ${character}. Модель: ${selectedModel}. Temp: ${tempSetting}`);

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
        messages: messages,
        temperature: tempSetting // Применяем настройку креатива
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
