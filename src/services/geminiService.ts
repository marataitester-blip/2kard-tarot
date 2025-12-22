import { TarotCard, AppMode } from '../types';

export const analyzeRelationship = async (
  cards: TarotCard[], 
  userProblem: string,
  mode: AppMode, 
  consultant: 'STANDARD' | 'VIP'
): Promise<string> => {
  
  const modelName = consultant === 'VIP' 
    ? "anthropic/claude-3.5-sonnet" 
    : "qwen/qwen-2.5-72b-instruct";

  // --- ЛИЧНОСТИ ---
  const messireSystem = `
    ТВОЕ ИМЯ: Мессир. 
    РОЛЬ: Аристократ, мистик, циник.
    СТИЛЬ: Элегантный, сложный, с черным юмором. Ирония над людьми.
    ЗАДАЧА: Дай глубокий анализ. Объем ответа большой.
    ЯЗЫК: Русский.
  `;

  const margoSystem = `
    ТВОЕ ИМЯ: Марго.
    РОЛЬ: Психолог-практик.
    СТИЛЬ: Прямой, житейский, с юмором. "Подруга, которая не врет".
    ЗАДАЧА: Конкретный совет.
    ЯЗЫК: Русский.
  `;

  let systemPrompt = consultant === 'VIP' ? messireSystem : margoSystem;
  let userPrompt = "";

  // --- ЛОГИКА 5 РЕЖИМОВ ---
  if (mode === 'BLITZ') {
    userPrompt = `Блиц-вопрос: "${userProblem}". Карта: ${cards[0].name}. Ответ (Да/Нет) и краткая суть.`;
  }
  else if (mode === 'RELATIONSHIPS') {
    userPrompt = `Отношения: "${userProblem}". 
    1. ОН: ${cards[0].name}
    2. ОНА: ${cards[1].name}
    В чем проблема и есть ли будущее?`;
  }
  else if (mode === 'FATE') { // Бывший GENERAL
    systemPrompt += "\nМетод SAR: Ситуация -> Действие -> Результат.";
    userPrompt = `Судьба: "${userProblem}".
    1. Ситуация: ${cards[0].name}
    2. Действие: ${cards[1].name}
    3. Итог: ${cards[2].name}`;
  }
  else if (mode === 'FINANCE') {
    userPrompt = `Финансы: "${userProblem}".
    1. Актив: ${cards[0].name}
    2. Поток: ${cards[1].name}
    3. План: ${cards[2].name}
    4. Реальность: ${cards[3].name}`;
  }
  else if (mode === 'CROSS') {
    userPrompt = `Расклад КРЕСТ: "${userProblem}".
    1. Центр (Суть): ${cards[0].name}
    2. Слева (Прошлое): ${cards[1].name}
    3. Справа (Будущее): ${cards[2].name}
    4. Сверху (Явное): ${cards[3].name}
    5. Снизу (Скрытое): ${cards[4].name}
    Свяжи всё в систему.`;
  }

  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_KEY; 
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://astra-hero.vercel.app", 
      },
      body: JSON.stringify({
        model: modelName, 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8, 
        max_tokens: 2000,
      }),
    });

    if (!response.ok) return "Ошибка связи с астралом.";
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Тишина...";
  } catch (error) {
    return "Ошибка сети.";
  }
};
