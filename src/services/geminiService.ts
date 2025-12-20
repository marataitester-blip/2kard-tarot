import { TarotCard } from '../types';

export const analyzeRelationship = async (
  cards: TarotCard[], 
  userProblem: string,
  mode: 'RELATIONSHIPS' | 'FINANCE' | 'GENERAL', 
  consultant: 'STANDARD' | 'VIP'
): Promise<string> => {
  
  // Выбор модели
  const modelName = consultant === 'VIP' 
    ? "anthropic/claude-3.5-sonnet" 
    : "qwen/qwen-2.5-72b-instruct";

  let systemPrompt = "";
  let userPrompt = "";

  // Базовая инструкция + ЗАПРЕТ НА КИТАЙСКИЙ
  const baseInstruction = `
    ВАЖНО: ОТВЕЧАЙ СТРОГО НА РУССКОМ ЯЗЫКЕ. 
    Никаких иероглифов или иностранных вставок, если это не часть стиля.
    Ты понимаешь, что ты — Искусственный Интеллект, но отыгрываешь роль.
  `;

  // --- 1. ОТНОШЕНИЯ ---
  if (mode === 'RELATIONSHIPS') {
    if (consultant === 'VIP') {
      systemPrompt = `
        ${baseInstruction}
        ТВОЕ ИМЯ: Мессир. ТОН: Булгаковский, саркастичный, элегантный.
        ЗАДАЧА: Дай блестящий психологический анализ пары.
      `;
    } else {
      systemPrompt = `
        ${baseInstruction}
        ТВОЕ ИМЯ: Марго. ТОН: Свой в доску, прямой, немного грубоватый.
        ЗАДАЧА: Сними розовые очки. Резко, но справедливо.
      `;
    }
    userPrompt = `История: "${userProblem}". Карта 1 (ОН): ${cards[0]?.name}. Карта 2 (ОНА): ${cards[1]?.name}. Дай вердикт.`;

  // --- 2. ФИНАНСЫ ---
  } else if (mode === 'FINANCE') { 
    if (consultant === 'VIP') {
      systemPrompt = `
        ${baseInstruction}
        ТВОЕ ИМЯ: Мессир. ТОН: Властный, холодный.
        ЗАДАЧА: Препарируй ошибки в бизнесе с высоты своего величия.
      `;
    } else {
      systemPrompt = `
        ${baseInstruction}
        ТВОЕ ИМЯ: Марго. ТОН: Татьяна Мужицкая на максималках. Энергично, громко.
        ЗАДАЧА: Разбор полетов по бизнесу: Активы, Проблемы, План.
      `;
    }
    const c1 = cards[0] || { name: "?" };
    const c2 = cards[1] || { name: "?" };
    const c3 = cards[2] || { name: "?" };
    const c4 = cards[3] || { name: "?" };
    userPrompt = `Запрос: "${userProblem}". 1.АКТИВ: ${c1.name}. 2.ПОТОК: ${c2.name}. 3.ПЛАН: ${c3.name}. 4.РЕАЛЬНОСТЬ: ${c4.name}. Разнеси стратегию.`;

  // --- 3. СУДЬБА (SAR) ---
  } else { 
    if (consultant === 'VIP') {
      systemPrompt = `
        ${baseInstruction}
        ТВОЕ ИМЯ: Мессир. ТЫ: Наблюдатель вечности.
        ТОН: Философский, мистический.
        СТРУКТУРА ОТВЕТА (SAR):
        1. СИТУАЦИЯ: В какой ловушке судьбы оказался человек?
        2. ДЕЙСТВИЕ: Парадоксальный совет.
        3. РЕЗУЛЬТАТ: Итог (триумф или провал).
      `;
    } else {
      systemPrompt = `
        ${baseInstruction}
        ТВОЕ ИМЯ: Марго. ТЫ: Опытная гадалка.
        ТОН: Житейская мудрость, конкретика.
        СТРУКТУРА ОТВЕТА (SAR):
        1. СИТУАЦИЯ ("Чё происходит"): Правду-матку.
        2. ДЕЙСТВИЕ ("Чё делать"): Конкретный пинок.
        3. РЕЗУЛЬТАТ ("Чем сердце успокоится"): Прогноз.
      `;
    }
    const c1 = cards[0] || { name: "?" };
    const c2 = cards[1] || { name: "?" };
    const c3 = cards[2] || { name: "?" };
    userPrompt = `Вопрос: "${userProblem}". 1.СИТУАЦИЯ: ${c1.name}. 2.ДЕЙСТВИЕ: ${c2.name}. 3.РЕЗУЛЬТАТ: ${c3.name}. Свяжи в рассказ.`;
  }

  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_KEY; 
    if (!apiKey) return "Ошибка ключа API.";

    // Умная настройка температуры: Марго строже (0.65), Мессир свободнее (0.85)
    const temperature = consultant === 'VIP' ? 0.85 : 0.65;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://astra-hero.vercel.app", 
        "X-Title": "Astra Hero",
      },
      body: JSON.stringify({
        model: modelName, 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: temperature, 
        max_tokens: 1500,
      }),
    });

    if (!response.ok) return `Ошибка сети: ${response.status}`;
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Тишина...";
    
  } catch (error) {
    console.error("AI Error:", error);
    return "Связь прервана.";
  }
};
