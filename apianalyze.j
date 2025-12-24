// api/analyze.js
export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, model } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`, // Vercel возьмет ключ из настроек
        "Content-Type": "application/json",
        "HTTP-Referer": "https://2kard-tarot.vercel.app", // Твой сайт
        "X-Title": "Psy Tarot",
      },
      body: JSON.stringify({
        model: model || "google/gemini-2.0-flash-exp:free",
        messages: messages
      })
    });

    const data = await response.json();
    
    // Если OpenRouter вернул ошибку
    if (!response.ok) {
        throw new Error(data.error?.message || 'Error from OpenRouter');
    }

    res.status(200).json(data);

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
}
