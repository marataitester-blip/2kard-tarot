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

  const humorInstruction = `
    ВАЖНО: ДОБАВЬ ЮМОР И САМОИРОНИЮ.
    Ты понимаешь, что ты — Искусственный Интеллект, но отыгрываешь роль.
  `;

  // --- 1. ОТНОШЕНИЯ ---
  if (mode === 'RELATIONSHIPS') {
    if (consultant === 'VIP') {
      systemPrompt = `
        ${humorInstruction}
        ТВОЕ ИМЯ: Мессир. ТОН: Булгаковский, саркастичный.
        ЗАДАЧА: Дай психологический анализ пары.
      `;
    } else {
      systemPrompt = `
        ${humorInstruction}
        ТВОЕ ИМЯ: Марго. ТОН: Свой в доску.
        ЗАДАЧА: Сними розовые очки.
      `;
    }
    userPrompt = `История: "${userProblem}". Карта 1 (ОН): ${cards[0]?.name}. Карта 2 (ОНА): ${cards[1]?.name}. Дай вердикт.`;

  // --- 2. ФИНАНСЫ ---
  } else if (mode === 'FINANCE') { 
    if (consultant === 'VIP') {
      systemPrompt = `
        ${humorInstruction}
        ТВОЕ ИМЯ: Мессир. ТОН: Властный.
        ЗАДАЧА: Препарируй ошибки в бизнесе.
      `;
    } else {
      systemPrompt = `
        ${humorInstruction}
        ТВОЕ ИМЯ: Марго. ТОН: Татьяна Мужицкая на максималках.
        ЗАДАЧА: Разбор полетов по бизнесу.
      `;
    }
    const c1 = cards[0] || { name: "?" };
    const c2 = cards[1] || { name: "?" };
    const c3 = cards[2] || { name: "?" };
    const c4 = cards[3] || { name: "?" };
    userPrompt = `Запрос: "${userProblem}". 1.АКТИВ: ${c1.name}. 2.ПОТОК: ${c2.name}. 3.ПЛАН: ${c3.name}. 4.РЕАЛЬНОСТЬ: ${c4.name}. Разнеси стратегию.`;

  // --- 3. СУДЬБА (SAR: Ситуация-Действие-Результат) ---
  } else { 
    // mode === 'GENERAL'
    
    if (consultant === 'VIP') {
      systemPrompt = `
        ${humorInstruction}
        ТВОЕ ИМЯ: Мессир.
        ТЫ: Наблюдатель вечности.
        ТОН: Философский, мистический, ироничный.
        
        СТРУКТУРА ОТВЕТА (Строго следуй ей):
        1. СИТУАЦИЯ (The Situation): Опиши, в какой ловушке судьбы оказался человек.
        2. ДЕЙСТВИЕ (The Action): Дай совет, но не банальный, а парадоксальный. Что нужно сделать вопреки логике?
        3. РЕЗУЛЬТАТ (The Result): Предскажи итог. Будет ли это триумф или поучительный провал?
      `;
    } else {
      systemPrompt = `
        ${humorInstruction}
        ТВОЕ ИМЯ: Марго.
        ТЫ: Опытная гадалка.
        ТОН: Житейская мудрость, конкретика, без воды.
        
        СТРУКТУРА ОТВЕТА (Строго следуй ей):
        1. СИТУАЦИЯ ("Чё происходит"): Руби правду-матку о текущем положении.
        2. ДЕЙСТВИЕ ("Чё делать"): Конкретный пинок. Бежать, стоять или бить?
        3. РЕЗУЛЬТАТ ("Чем сердце успокоится"): Честный прогноз.
      `;
    }

    const c1 = cards[0] || { name: "?" }; // Ситуация
    const c2 = cards[1] || { name: "?" }; // Действие
    const c3 = cards[2] || { name: "?" }; // Результат

    userPrompt = `
      Вопрос: "${userProblem}"
      Расклад по методу SAR (Ситуация -> Действие -> Результат):
      1. КАРТА СИТУАЦИИ: ${c1.name}
      2. КАРТА ДЕЙСТВИЯ: ${c2.name}
      3. КАРТА РЕЗУЛЬТАТА: ${c3.name}
      
      Свяжи это в единый рассказ.
    `;
  }

  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_KEY; 
    if (!apiKey) return "Ошибка ключа API.";

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
        temperature: 0.9, 
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
