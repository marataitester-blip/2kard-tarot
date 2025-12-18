export const speakText = async (
  text: string, 
  consultant: 'STANDARD' | 'VIP',
  mode: 'RELATIONSHIPS' | 'FINANCE'
): Promise<string | null> => {
  
  // 1. ЖЕСТКИЙ ВЫБОР ГОЛОСА
  let voice = "alloy"; // Нейтральный (запасной)

  if (consultant === 'VIP') {
    voice = "onyx"; // МЕССИР -> Глубокий мужской бас
  } else {
    // МАРГО
    if (mode === 'FINANCE') {
      voice = "nova"; // Энергичная женщина (Деньги)
    } else {
      voice = "shimmer"; // Чистая женщина (Отношения) - попробуем shimmer вместо fable
    }
  }

  console.log(`🎙️ Запрос озвучки: Персонаж=${consultant}, Голос=${voice}`);

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        voice: voice, // Важно: отправляем этот параметр
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
