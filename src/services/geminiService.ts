import { TarotCard } from '../types';

// Vercel сам подставит сюда ключ, который ты добавишь в настройках сайта
const API_KEY = import.meta.env.VITE_OPENROUTER_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const analyzeRelationship = async (
  card1: TarotCard, 
  card2: TarotCard, 
  userProblem: string
): Promise<string> => {

  // Проверка: Если ключа нет, не ломаем приложение, а говорим об этом
  if (!API_KEY) {
    console.error("Ключ VITE_OPENROUTER_KEY не найден!");
    return "Ошибка настройки: Нет API ключа. Проверьте Vercel Environment Variables.";
  }

  // Формируем "Злой" Промпт для ИИ
  const prompt = `
    ROLE: You are "Astra Hero" — a cynical, Jungian psychologist and profiler. 
    TONE: Ironic, sharp, cinematic, brutal honesty. No esoteric fluff.
    
    TASK: Analyze a relationship based on two Tarot cards and the user's complaint.
    
    USER'S COMPLAINT (CONTEXT): "${userProblem || "The user is silent, but the cards speak."}"
    
    CARDS:
    1. HIM (The Man): ${card1.name}
       Archetype Meaning: "${card1.desc_general}"
    2. HER (The Woman): ${card2.name}
       Archetype Meaning: "${card2.desc_general}"
    
    INSTRUCTIONS:
    1. Analyze how these specific archetypes interact.
    2. Use the provided "Archetype Meanings" as the base truth.
    3. Respond in Russian.
    
    RESPONSE STRUCTURE:
    1. 🎬 СЦЕНА: Visual metaphor (max 2 sentences).
    2. 🩺 ДИАГНОЗ: Ironic title (e.g. "Mutual Parasitism").
    3. 🧠 ПРОФИЛЬ:
       - HIM: His neurosis/motive.
       - HER: Her trigger/reaction.
       - CHEMISTRY: The toxic loop.
    4. 💊 РЕЦЕПТ (Actionable Advice):
       - HIM: Instruction.
       - HER: Instruction.
       - TOGETHER: How to break the loop.
    5. ⚖️ ВЕРДИКТ: Final cynical sentence.
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://astra-hero.vercel.app', // Для OpenRouter
      },
      body: JSON.stringify({
        model: "google/gemini-pro-1.5", // Или "google/gemini-flash-1.5" (дешевле)
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8 
      })
    });

    const data = await response.json();
    // Возвращаем текст ответа или сообщение об ошибке, если ответ пуст
    return data.choices?.[0]?.message?.content || "Оракул молчит (ошибка API).";

  } catch (error) {
    console.error("AI Error:", error);
    return "Связь с космосом прервана. Попробуйте позже.";
  }
};
