import { TarotCard, AppMode } from '../types';

// Оставляем промпт генератор как был, он работает локально
const generatePrompt = (cards: TarotCard[], problem: string, mode: AppMode, consultant: string): string => {
  const cardNames = cards.map(c => c.name).join(', ');
  
  let roleDescription = "";
  if (consultant === 'VIP') {
    roleDescription = "Ты - Воланд (Мессир). Твой тон величественный, мистический, слегка ироничный, но мудрый. Используй обращения 'мой друг', 'королева', 'бесценный'. Ты видишь суть вещей. Ты не даешь пустых надежд, но открываешь правду.";
  } else {
    roleDescription = "Ты - Марго (Королева Марго). Твой тон дерзкий, страстный, эмоциональный, но поддерживающий. Ты ведьма, которая стала королевой. Ты обращаешься на 'ты', можешь быть резкой, но всегда за клиента.";
  }

  return `
    Роль: ${roleDescription}
    Задача: Проведи анализ расклада Таро.
    Контекст: Пользователь выбрал расклад "${mode}".
    Карты: ${cardNames}.
    Ситуация/Вопрос пользователя: "${problem}".
    
    Требования:
    1. Не пиши вступлений типа "Вот толкование". Сразу начинай в образе.
    2. Используй форматирование Markdown (жирный шрифт для карт).
    3. Ответ должен быть кратким, но емким (не более 150 слов).
    4. Свяжи значения карт с вопросом пользователя.
  `;
};

export const analyzeRelationship = async (
  cards: TarotCard[], 
  problem: string, 
  mode: AppMode,
  consultant: string
): Promise<string> => {
  try {
    const prompt = generatePrompt(cards, problem, mode, consultant);
    
    // ВАЖНО: Теперь мы стучимся не в openrouter, а в наш локальный /api/analyze
    // Vercel автоматически перенаправит это в папку api/analyze.js
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сети');
    }

    const data = await response.json();
    return data.choices[0].message.content || "Тумман скрывает ответ...";

  } catch (error) {
    console.error("Error analyzing:", error);
    return "Связь с астралом прервана. (Ошибка API). Попробуйте позже.";
  }
};
