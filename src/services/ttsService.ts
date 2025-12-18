export const speakText = async (
  text: string, 
  consultant: 'STANDARD' | 'VIP',
  mode: 'RELATIONSHIPS' | 'FINANCE'
): Promise<string | null> => {
  
  // 1. Логика выбора голоса (оставляем как было)
  let voice = "alloy"; 

  if (consultant === 'VIP') {
    voice = "onyx"; // Мессир
  } else {
    if (mode === 'FINANCE') {
      voice = "nova"; // Марго (Деньги)
    } else {
      voice = "fable"; // Марго (Отношения)
    }
  }

  try {
    // 2. ИЗМЕНЕНИЕ: Обращаемся к вашему серверу /api/tts
    // Больше не нужен API_KEY здесь, он спрятан на сервере
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        voice: voice, // Передаем серверу, какой голос использовать
      }),
    });

    if (!response.ok) {
      console.error("TTS Error:", response.status);
      return null;
    }

    // 3. Получаем аудио и возвращаем ссылку на него
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("TTS Network Error:", error);
    return null;
  }
};
