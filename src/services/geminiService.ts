import { TarotCard, AppMode } from '../types';

const generatePrompt = (cards: TarotCard[], problem: string, mode: AppMode, consultant: string): string => {
  const cardNames = cards.map(c => c.name).join(', ');
  
  let roleDescription = "";
  if (consultant === 'VIP') {
    roleDescription = "Ты - Воланд (Мессир). Твой тон величественный, мистический, ироничный. Ты видишь суть.";
  } else {
    roleDescription = "Ты - Марго (Королева). Твой тон дерзкий, эмоциональный, но поддерживающий. Ты всегда за клиента.";
  }

  return `
    Роль: ${roleDescription}
    Задача: Краткий анализ Таро (макс 150 слов).
    Расклад: "${mode}". Карты: ${cardNames}.
    Вопрос: "${problem}".
    Отвечай сразу в образе, используй Markdown.
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
    
    // ВАЖНО: Запрос идет на НАШ сервер (/api/analyze), а не наружу.
    // Это позволяет работать без VPN.
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error Details:", errorData);
        throw new Error('Ошибка на сервере предсказаний');
    }

    const data = await response.json();
    return data.choices[0].message.content || "Туман скрывает ответ...";

  } catch (error) {
    console.error("Error analyzing:", error);
    return "Связь с астралом нестабильна. Попробуйте еще раз.";
  }
};
