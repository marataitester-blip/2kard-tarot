import { TarotCard } from '../types';

export const analyzeRelationship = async (
  cards: TarotCard[], 
  userProblem: string,
  mode: 'RELATIONSHIPS' | 'FINANCE',
  consultant: 'STANDARD' | 'VIP' // <--- НОВЫЙ ПАРАМЕТР
): Promise<string> => {
  
  // 1. ВЫБОР МОДЕЛИ
  // Qwen (Бесплатно/Дешево) vs Claude 3.5 Sonnet (Дорого/Элитно)
  const modelName = consultant === 'VIP' 
    ? "anthropic/claude-3.5-sonnet" 
    : "qwen/qwen-2.5-72b-instruct";

  // --- НАСТРОЙКА ЛИЧНОСТИ ---
  let systemPrompt = "";
  let userPrompt = "";

  // Если это VIP Клод, добавим ему "лоска" в инструкцию
  const personalityFlavor = consultant === 'VIP'
    ? "Ты — элитный консультант высшего уровня. Твой анализ глубок, точен и стоит дорого. Ты видишь то, что скрыто."
    : "Ты — резкий, прямой и честный консультант. Говоришь правду-матку без прикрас.";

  if (mode === 'RELATIONSHIPS') {
    // РЕЖИМ 1: ПСИХОЛОГ
    systemPrompt = `
      ${personalityFlavor}
      Ты — Astra Hero. Твоя специализация — отношения.
      Тон: ${consultant === 'VIP' ? 'Интеллектуальный, глубокий, проницательный' : 'Саркастичный, дерзкий, дворовый'}.
      Задача: Разобрать ситуацию клиента.
    `;
    userPrompt = `
      Клиент: "${userProblem}"
      Карта 1 (ОН): ${cards[0].name} (${cards[0].desc_general})
      Карта 2 (ОНА): ${cards[1].name} (${cards[1].desc_general})
      Дай прогноз.
    `;
  } else {
    // РЕЖИМ 2: ДЕНЕЖНАЯ АКУЛА
    systemPrompt = `
      ${personalityFlavor}
      Ты — "Money Shark". Финансы — твоя стихия.
      Тон: ${consultant === 'VIP' ? 'Как у партнера Goldman Sachs. Стратегический.' : 'Как у волка с Уолл-стрит. Агрессивный.'}.
      Термины: актив, пассив, ROI, маржа.
    `;
    
    const c1 = cards[0] || { name: "?" };
    const c2 = cards[1] || { name: "?" };
    const c3 = cards[2] || { name: "?" };
    const c4 = cards[3] || { name: "?" };

    userPrompt = `
      Запрос: "${userProblem}"
      1. АКТИВ: ${c1.name}
      2. ПОТОК: ${c2.name}
      3. ПЛАН: ${c3.name}
      4. РЕАЛЬНОСТЬ: ${c4.name}
      Дай разбор и план действий.
    `;
  }

  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_KEY; 
    if (!apiKey) return "Ошибка: Нет ключа VITE_OPENROUTER_KEY.";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://astra-hero.vercel.app", 
        "X-Title": "Astra Hero",
      },
      body: JSON.stringify({
        model: modelName, // <--- ОТПРАВЛЯЕМ ВЫБРАННУЮ МОДЕЛЬ
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
        // Если у Claude кончились деньги, он вернет ошибку тут
        if (consultant === 'VIP' && response.status === 402) {
            return "VIP-канал недоступен (недостаточно средств на балансе API). Переключитесь на Стандарт.";
        }
        return `Ошибка сети: ${response.status}`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Тишина в эфире.";
    
  } catch (error) {
    console.error("Network Error:", error);
    return "Связь прервана.";
  }
};
