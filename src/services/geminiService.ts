import { TarotCard } from '../types';

export const analyzeRelationship = async (
  cards: TarotCard[], 
  userProblem: string,
  mode: 'RELATIONSHIPS' | 'FINANCE'
): Promise<string> => {
  
  // --- НАСТРОЙКА ЛИЧНОСТИ (ПРОМПТЫ) ---
  let systemPrompt = "";
  let userPrompt = "";

  if (mode === 'RELATIONSHIPS') {
    // РЕЖИМ 1: ПСИХОЛОГ (Dr. Heart)
    systemPrompt = `
      Ты — Astra Hero, циничный психолог с черным юмором.
      Твоя задача — жестко, но честно разобрать ситуацию в отношениях.
      Тон: саркастичный, нуарный, как у уставшего детектива.
      Используй сленг: "гештальт", "травма", "нарцисс", "созависимость", "красный флаг".
      Будь краток. Не лей воду.
    `;
    userPrompt = `
      Клиент ноет: "${userProblem}"
      Карта 1 (ОН): ${cards[0].name} (${cards[0].desc_general})
      Карта 2 (ОНА): ${cards[1].name} (${cards[1].desc_general})
      Дай прогноз: развод или любовь до гроба?
    `;
  } else {
    // РЕЖИМ 2: ДЕНЕЖНАЯ АКУЛА (Money Shark)
    systemPrompt = `
      Ты — "Money Shark", злой и успешный финансовый консультант.
      Ты презираешь бедность и "марафоны желаний". Ты веришь только в цифры, хардкор и действия.
      
      ТВОЙ СЛОВАРЬ: актив, пассив, маржа, кассовый разрыв, банкротство, профит, ROI, скам.
      
      ТРАКТОВКА КАРТ (БИЗНЕС-ПЕРЕВОД):
      * Жезлы = Бизнес-процессы, стартапы, суета.
      * Кубки = Эмоциональные траты, нытье персонала (это плохо).
      * Мечи = Конкуренция, суды, жесткие решения, увольнения.
      * Пентакли = Кэш, недвижимость, активы.
      
      Структура ответа:
      1. БАЛАНС (Почему ты беден?)
      2. КРАШ-ТЕСТ (Где ты облажался в планах?)
      3. ПИНКИ (3 конкретных шага, чтобы заработать).
    `;
    
    // Безопасное получение карт (на случай сбоев)
    const c1 = cards[0] || { name: "?" };
    const c2 = cards[1] || { name: "?" };
    const c3 = cards[2] || { name: "?" };
    const c4 = cards[3] || { name: "?" };

    userPrompt = `
      Финансовый запрос: "${userProblem}"
      
      1. ТВОЙ АКТИВ: ${c1.name}
      2. ПОТОК ДЕНЕГ: ${c2.name}
      3. ТВОИ АМБИЦИИ: ${c3.name}
      4. СУРОВАЯ РЕАЛЬНОСТЬ: ${c4.name}
      
      Разнеси эту ситуацию в пух и прах.
    `;
  }

  try {
    // 1. ИЩЕМ КЛЮЧ OPENROUTER
    // Убедись, что в Vercel в настройках стоит VITE_OPENROUTER_KEY
    const apiKey = import.meta.env.VITE_OPENROUTER_KEY; 
    
    if (!apiKey) {
        console.error("Ключ не найден!");
        return "Ошибка: В Vercel не добавлен VITE_OPENROUTER_KEY.";
    }

    // 2. Стучимся в OpenRouter к Qwen
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://astra-hero.vercel.app", 
        "X-Title": "Astra Hero",
      },
      body: JSON.stringify({
        // НАШЕ ВСЁ: Qwen 2.5 (72B) - самая умная из доступных
        model: "qwen/qwen-2.5-72b-instruct", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7, // Чуть строже для финансов
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("OpenRouter Error:", err);
        // Если 401 - значит ключ неверный
        if (response.status === 401) return "Ошибка ключа: Проверь VITE_OPENROUTER_KEY в Vercel.";
        // Если 402 - кончились бесплатные лимиты
        if (response.status === 402) return "Qwen хочет кушать (нужно пополнить баланс OpenRouter).";
        
        return `Ошибка сети: ${response.status}`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Qwen задумался и промолчал.";
    
  } catch (error) {
    console.error("Network Error:", error);
    return "Связь прервана. Акула уплыла на обед.";
  }
};
