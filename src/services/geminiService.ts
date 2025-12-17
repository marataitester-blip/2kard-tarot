import { TarotCard } from '../types';

// Vercel подставит ключ.
// ВАЖНО: API_URL должен быть с https:// иначе будет ошибка 404 (браузер будет искать файл у нас на сайте)
const API_KEY = import.meta.env.VITE_OPENROUTER_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const analyzeRelationship = async (
  card1: TarotCard, 
  card2: TarotCard, 
  userProblem: string
): Promise<string> => {

  if (!API_KEY) {
    console.error("ОШИБКА: Нет API ключа. Проверьте Vercel Environment Variables.");
    return "Ошибка настройки: Ключ не найден. Зайдите в Vercel -> Settings -> Environment Variables.";
  }

  const prompt = `
    ROLE: You are "Astra Hero" — a cynical, Jungian psychologist.
    TONE: Ironic, sharp, cinematic, brutal honesty.
    TASK: Analyze a relationship based on two Tarot cards and the user's complaint.
    USER'S COMPLAINT: "${userProblem || "Silence."}"
    
    CARDS:
    1. HIM: ${card1.name} ("${card1.desc_general}")
    2. HER: ${card2.name} ("${card2.desc_general}")
    
    OUTPUT FORMAT (in Russian):
    1. 🎬 СЦЕНА
    2. 🩺 ДИАГНОЗ
    3. 🧠 ПРОФИЛЬ (Он/Она/Химия)
    4. 💊 РЕЦЕПТ (Ему/Ей/Вместе)
    5. ⚖️ ВЕРДИКТ
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://astra-hero.vercel.app', 
        'X-Title': 'Astra Hero Tarot'
      },
      body: JSON.stringify({
        model: "google/gemini-pro-1.5",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter Error:", response.status, errText);
      return `Ошибка API: ${response.status}. Проверьте консоль.`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Оракул молчит (пустой ответ).";

  } catch (error) {
    console.error("Fetch Error:", error);
    return "Связь с космосом прервана (сетевая ошибка).";
  }
};
