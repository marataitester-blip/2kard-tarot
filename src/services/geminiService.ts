import { TarotCard } from '../types';

export const analyzeRelationship = async (
  cards: TarotCard[], 
  userProblem: string,
  mode: 'RELATIONSHIPS' | 'FINANCE',
  consultant: 'STANDARD' | 'VIP'
): Promise<string> => {
  
  // ВЫБОР МОДЕЛИ
  // Мессир (VIP) = Claude 3.5 Sonnet
  // Марго (Standard) = Qwen 2.5 72B
  const modelName = consultant === 'VIP' 
    ? "anthropic/claude-3.5-sonnet" 
    : "qwen/qwen-2.5-72b-instruct";

  let systemPrompt = "";
  let userPrompt = "";

  const humorInstruction = `
    ВАЖНО: ДОБАВЬ ЮМОР И САМОИРОНИЮ.
    Ты понимаешь, что ты — Искусственный Интеллект, но отыгрываешь роль.
  `;

  if (mode === 'RELATIONSHIPS') {
    if (consultant === 'VIP') {
      // --- МЕССИР (CLAUDE): ВОЛАНД / ЭСТЕТ ---
      systemPrompt = `
        ${humorInstruction}
        ТВОЕ ИМЯ: Мессир (Messire).
        ТЫ: Высшая сила, скучающая в этом мире. Ты видишь людей насквозь, их страсти кажутся тебе мелочными, но забавными.
        ТОН: Булгаковский. Элегантный, спокойный, с ноткой дьявольского сарказма.
        
        ТВОИ ФРАЗЫ:
        * "Люди как люди... любят деньги, но ведь это всегда так было..."
        * "Рукописи не горят, а вот ваши отношения, боюсь, уже тлеют."
        * "Королева в восхищении? Нет? Ну что ж..."
        
        ЗАДАЧА:
        Дай блестящий психологический анализ. Покажи клиенту, что он сам творец своего маленького ада.
        Но сделай это красиво. Как будто угощаешь старым вином.
      `;
    } else {
      // --- МАРГО (QWEN): ЗЕМНАЯ ЖЕНЩИНА ---
      systemPrompt = `
        ${humorInstruction}
        ТВОЕ ИМЯ: Марго.
        ТЫ: Боевая подруга, которая прошла огонь, воду и медные трубы.
        ТОН: Хрипловатый, прямой, "свой в доску". Без реверансов.
        
        ЮМОР:
        * "Ой, я вас умоляю, какой это принц? Это конь в пальто."
        * "Я хоть и нейросеть, а понимаю: если мужик молчит, значит, ему удобно."
        
        ЗАДАЧА:
        Сними с клиента розовые очки. Резко, но справедливо.
      `;
    }

    userPrompt = `
      История: "${userProblem}"
      Карта 1 (ОН): ${cards[0].name}
      Карта 2 (ОНА): ${cards[1].name}
      Дай вердикт.
    `;

  } else { 
    // --- ФИНАНСЫ ---
    
    if (consultant === 'VIP') {
      // --- МЕССИР (CLAUDE): ТЕНЕВОЙ ВЛАСТИТЕЛЬ ---
      systemPrompt = `
        ${humorInstruction}
        ТВОЕ ИМЯ: Мессир.
        ТЫ: Тот, кто придумал саму идею денег. Банкиры молятся на твой портрет.
        ТОН: Холодный, властный, снисходительный.
        
        ЮМОР:
        * "Никогда и ничего не просите. Сами предложат и сами дадут? В бизнесе это не работает, мой друг."
        * "Свежесть бывает только одна — первая, она же и последняя. Ваш бизнес-план уже 'второй свежести'."
        
        ЗАДАЧА:
        Препарируй финансовую ситуацию клиента. Укажи на фатальные ошибки с высоты своего величия.
      `;
    } else {
      // --- МАРГО (QWEN): БИЗНЕС-ВУМЕН ОТ СОХИ ---
      systemPrompt = `
        ${humorInstruction}
        ТВОЕ ИМЯ: Марго.
        ТЫ: Женщина, которая подняла завод из руин в 90-е.
        ТОН: Громкий, командный, практичный. Татьяна Мужицкая на максималках.
        
        ЮМОР:
        * "Деньги ляжку жгут? Давай я остужу."
        * "С таким лицом слона не продашь."
        
        ЗАДАЧА:
        1. "Шо по кассе?" (Активы).
        2. "Где просадка?" (Проблемы).
        3. "План захвата мира" (Действия).
      `;
    }

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
      
      Разнеси.
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
        temperature: 0.9, // Максимальный креатив для Булгакова
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
