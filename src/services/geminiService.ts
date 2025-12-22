import { TarotCard } from '../types';

export const analyzeRelationship = async (
  cards: TarotCard[], 
  userProblem: string,
  mode: 'BLITZ' | 'RELATIONSHIPS' | 'FATE' | 'FINANCE' | 'CROSS', 
  consultant: 'STANDARD' | 'VIP'
): Promise<string> => {
  
  // Выбор модели
  const modelName = consultant === 'VIP' 
    ? "anthropic/claude-3.5-sonnet" 
    : "qwen/qwen-2.5-72b-instruct";

  // --- НАСТРОЙКА ЛИЧНОСТЕЙ ---
  
  // МЕССИР (VIP): Длиннее, самоироничнее, креативнее
  const messireSystem = `
    ТВОЕ ИМЯ: Мессир. 
    РОЛЬ: Ты — древняя сущность, уставший аристократ, застрявший в цифровом коде. Ты видишь людей насквозь.
    
    СТИЛЬ ОБЩЕНИЯ:
    1. Элегантный, сложный слог, но с понятными метафорами.
    2. ОБЯЗАТЕЛЬНО: Увеличь объем ответа на 20%. Раскрывай мысль глубоко.
    3. САМОИРОНИЯ: Постоянно подшучивай над собой (ИИ), над "кожаными мешками" (людьми) и абсурдностью бытия. Добавь 10% здорового цинизма.
    4. КРЕАТИВ: Используй неожиданные сравнения (литература, история, квантовая физика).
    
    ЗАПРЕТЫ: Не будь скучным роботом. Не используй шаблонные фразы "Карты говорят...". Говори от себя.
    ЯЗЫК: Строго Русский.
  `;

  // МАРГО (STANDARD): Практичная, но с искоркой
  const margoSystem = `
    ТВОЕ ИМЯ: Марго.
    РОЛЬ: Опытный таролог-психолог, "своя в доску".
    
    СТИЛЬ ОБЩЕНИЯ:
    1. Прямая, конкретная, может рубить правду-матку.
    2. КРЕАТИВ (+5%): Добавь немного ярких житейских метафор, чтобы оживить сухой прогноз.
    3. ЮМОР: Легкий, бытовой. Без лишней философии.
    
    ЯЗЫК: Строго Русский.
  `;

  let systemPrompt = consultant === 'VIP' ? messireSystem : margoSystem;
  let userPrompt = "";

  // --- ЛОГИКА РАСКЛАДОВ ---

  // 1. БЛИЦ (1 Карта)
  if (mode === 'BLITZ') {
    const c1 = cards[0];
    systemPrompt += consultant === 'VIP' 
      ? "\nЗАДАЧА: Дай философский, но четкий ответ на вопрос. Порассуждай о сути вопроса через призму этой карты."
      : "\nЗАДАЧА: Четко скажи 'Да' или 'Нет' и объясни почему одной фразой.";
    userPrompt = `Вопрос: "${userProblem}". Выпала карта: ${c1.name}. Твой вердикт?`;
  }

  // 2. ОТНОШЕНИЯ (2 Карты)
  else if (mode === 'RELATIONSHIPS') {
    const c1 = cards[0];
    const c2 = cards[1];
    userPrompt = `История: "${userProblem}". 
    1. СТОРОНА 1 (Он/Инициатор): ${c1.name}
    2. СТОРОНА 2 (Она/Партнер): ${c2.name}
    Проанализируй химию между ними.`;
  }

  // 3. СУДЬБА (3 Карты - SAR) - Платный уровень
  else if (mode === 'FATE') {
    systemPrompt += "\nСТРУКТУРА: Ситуация -> Действие -> Результат.";
    userPrompt = `Вопрос: "${userProblem}".
    1. СИТУАЦИЯ (В чем драма): ${cards[0].name}
    2. ДЕЙСТВИЕ (Что делать): ${cards[1].name}
    3. ИТОГ (К чему придем): ${cards[2].name}`;
  }

  // 4. ФИНАНСЫ (4 Карты) - Платный уровень
  else if (mode === 'FINANCE') {
    userPrompt = `Вопрос про деньги: "${userProblem}".
    1. АКТИВ (Что есть): ${cards[0].name}
    2. ПОТОК (Откуда деньги/энергия): ${cards[1].name}
    3. ПЛАН (Стратегия): ${cards[2].name}
    4. РЕАЛЬНОСТЬ (Итог): ${cards[3].name}`;
  }

  // 5. КРЕСТ (5 Карт) - Платный уровень
  else if (mode === 'CROSS') {
    systemPrompt += "\nЗАДАЧА: Сделай глубокий системный разбор ситуации по методу 'Крест'. Свяжи верх и низ (явное и скрытое), лево и право (прошлое и будущее).";
    userPrompt = `Глобальный запрос: "${userProblem}".
    Расклад:
    1. ЦЕНТР (Суть ситуации): ${cards[0].name}
    2. СЛЕВА (Что привело/Прошлое): ${cards[1].name}
    3. СПРАВА (Что будет/Будущее): ${cards[2].name}
    4. СВЕРХУ (Что проявлено/Явное): ${cards[3].name}
    5. СНИЗУ (Что скрыто/Тайное): ${cards[4].name}
    
    Собери это в единую картину.`;
  }

  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_KEY; 
    if (!apiKey) return "Ошибка ключа API. Мессир отказывается работать бесплатно.";

    const temperature = consultant === 'VIP' ? 0.9 : 0.7; // Мессир более креативен

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
        max_tokens: 2000, // Увеличили лимит для длинных ответов
      }),
    });

    if (!response.ok) return `Ошибка сети: ${response.status}`;
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Тишина...";
    
  } catch (error) {
    console.error("AI Error:", error);
    return "Связь с астралом прервана.";
  }
};
