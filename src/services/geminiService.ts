import { TarotCard } from '../types';

const API_KEY = "ТВОЙ_КЛЮЧ_OPENROUTER_ИЛИ_GEMINI"; 
const API_URL = "https://openrouter.ai/api/v1/chat/completions"; // Или Google API

export const analyzeRelationship = async (
  card1: TarotCard, 
  card2: TarotCard, 
  userProblem: string
): Promise<string> => {

  // Формируем "Злой" Промпт
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
        // 'HTTP-Referer': 'https://your-site.com', // Для OpenRouter
      },
      body: JSON.stringify({
        model: "google/gemini-pro-1.5", // Рекомендую эту модель
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8 // Чуть больше креатива
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("AI Error:", error);
    return "Оракул ушел в запой. Попробуйте позже.";
  }
};
