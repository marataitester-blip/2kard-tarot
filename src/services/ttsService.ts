const API_KEY = import.meta.env.VITE_OPENAI_KEY;

// Типы голосов OpenAI: alloy, echo, fable, onyx, nova, shimmer
// alloy - нейтральный
// echo - мягкий мужской
// fable - британский/ироничный (Марго в отношениях)
// onyx - глубокий мужской (Мессир/Штирлиц)
// nova - энергичная женская (Марго в деньгах)
// shimmer - чистая женская

export const speakText = async (
  text: string, 
  consultant: 'STANDARD' | 'VIP',
  mode: 'RELATIONSHIPS' | 'FINANCE'
): Promise<string | null> => {
  
  if (!API_KEY) {
    console.error("TTS: Нет ключа API (VITE_OPENAI_KEY)");
    return null;
  }

  // ВЫБОР ГОЛОСА ПО ХАРАКТЕРУ
  let voice = "alloy"; // Дефолт

  if (consultant === 'VIP') {
    // МЕССИР (Claude) -> Глубокий, серьезный мужской
    voice = "onyx"; 
  } else {
    // МАРГО (Qwen)
    if (mode === 'FINANCE') {
      // Татьяна Мужицкая / Практик -> Энергичная женщина
      voice = "nova"; 
    } else {
      // Циничный психолог -> Ироничный, нейтральный
      voice = "fable"; 
    }
  }

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice,
        speed: 1.0, 
      }),
    });

    if (!response.ok) {
      console.error("TTS Error:", response.status);
      return null;
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("TTS Network Error:", error);
    return null;
  }
};
