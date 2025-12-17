// Сервис озвучки через OpenRouter (чтобы не нужен был VPN)

// Используем ТОТ ЖЕ ключ, что и для текстов
const API_KEY = import.meta.env.VITE_OPENROUTER_KEY;

// Стучимся в OpenRouter, а не напрямую в OpenAI
const TTS_URL = "https://openrouter.ai/api/v1/audio/speech"; 

export const speakText = async (text: string): Promise<string | null> => {
  if (!API_KEY) {
    alert("Ошибка: Нет ключа VITE_OPENROUTER_KEY");
    return null;
  }

  try {
    const response = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://astra-hero.vercel.app", // OpenRouter требует это
        "X-Title": "Astra Hero TTS"
      },
      body: JSON.stringify({
        model: "openai/tts-1", // Просим OpenRouter использовать модель OpenAI
        input: text,
        voice: "onyx",         // Голос: onyx (мужской), shimmer (женский)
        speed: 1.0
      }),
    });

    if (!response.ok) {
      // Если OpenRouter не поддерживает аудио напрямую, увидим ошибку в консоли
      console.error("OpenRouter TTS Error:", response.status, await response.text());
      alert("Озвучка временно недоступна через шлюз."); 
      return null;
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Network Error:", error);
    return null;
  }
};
