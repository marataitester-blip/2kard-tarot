import { TarotCard, AppMode } from '../types';

const generatePrompt = (cards: TarotCard[], problem: string, mode: AppMode, consultant: string): string => {
  const cardNames = cards.map(c => c.name).join(', ');
  
  let roleDescription = "";
  let constraints = "";

  if (consultant === 'VIP') {
    // --- МЕССИР (Claude) ---
    // Смесь психолога, Воланда и Штирлица. Глубина и ирония.
    roleDescription = `
      Ты — проницательный психолог, который использует персону Воланда (из "Мастера и Маргариты") как метафору.
      Твой характер: смесь булгаковской мистики и аналитической выдержки Штирлица.
      Ты обладаешь тонким чувством юмора, иронией и самоиронией, но без театральных излишеств.
      Ты видишь людей насквозь. Твоя цель — составить глубокий психологический портрет клиента и вскрыть истинные мотивы ситуации.
    `;
    constraints = "Максимум 200 слов. Упор на психологию и скрытые мотивы.";
  } else {
    // --- МАРГО (Qwen) ---
    // Практика, объяснения, поддержка.
    roleDescription = `
      Ты — Марго. Твой тон дерзкий, живой, но при этом максимально практичный. 
      Ты не просто гадаешь, ты объясняешь, как это работает в жизни.
      Ты всегда на стороне клиента, но вместо туманных фраз даешь четкое понимание ситуации.
    `;
    constraints = "Максимум 180 слов. Упор на практическое объяснение и советы: что делать.";
  }

  return `
    Роль: ${roleDescription}
    Задача: Проанализируй расклад Таро. ${constraints}
    
    Вводные данные:
    - Расклад: "${mode}"
    - Карты: ${cardNames}
    - Вопрос клиента: "${problem}"
    
    Формат ответа:
    Используй Markdown. Пиши сразу от лица персонажа.
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
    
    // Отправляем на сервер текст и имя персонажа
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        character: consultant 
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
