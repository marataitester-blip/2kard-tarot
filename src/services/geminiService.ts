import { TarotCard } from '../types';

// ============================================================================
// НАСТРОЙКИ МОДЕЛЕЙ (МОЗГИ)
// ============================================================================

// 1. ТЕКУЩАЯ МОДЕЛЬ: Qwen 2.5 72B (Отличный русский язык, креативный, живой)
const MODEL = "qwen/qwen-2.5-72b-instruct";

// 2. ЗАПАСНАЯ МОДЕЛЬ: DeepSeek V3 (Если Qwen перегружен, раскомментируй эту строку)
// const MODEL = "deepseek/deepseek-chat";

// ============================================================================

// Vercel подставит ключ сам.
// ВАЖНО: API_URL должен быть с https:// иначе будет ошибка 404
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

  // Злой Промпт для Astra Hero
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
    1. Analyze how these specific archetypes interact in the context of the user's problem.
    2. Use the provided "Archetype Meanings" as the base truth.
    3. Respond in Russian.
    
    RESPONSE STRUCTURE:
    1. 🎬 СЦЕНА: A short visual metaphor of their interaction (max 2 sentences).
    2. 🩺 ДИАГНОЗ: A short, ironic title for their problem (e.g., "Mutual Parasitism").
    3. 🧠 ПРОФИЛЬ:
       - HIM: Why is he acting this way? (Psychological motive).
       - HER: What is her trigger?
       - CHEMISTRY: The toxic loop.
    4. 💊 РЕЦЕПТ (Actionable Advice):
       - HIM: Specific instruction.
       - HER: Specific instruction.
       - TOGETHER: How to break the loop.
    5. ⚖️ ВЕРДИКТ: One final cynical sentence.
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
        model: MODEL, // Используем Qwen
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, // Qwen любит 0.7 для креатива
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter Error:", response.status, errText);
      return `Ошибка API: ${response.status}. Модель перегружена, попробуйте позже.`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Оракул молчит (пустой ответ).";

  } catch (error) {
    console.error("Fetch Error:", error);
    return "Связь с космосом прервана (сетевая ошибка).";
  }
};
