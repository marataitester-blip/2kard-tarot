export const speakText = async (
  text: string, 
  consultant: 'STANDARD' | 'VIP',
  mode: 'RELATIONSHIPS' | 'FINANCE'
): Promise<string | null> => {
  
  // НАСТРОЙКА ГОЛОСОВ
  let voice = "alloy"; // Если что-то пойдет не так

  if (consultant === 'VIP') {
    voice = "onyx"; // МЕССИР (Глубокий мужской)
  } else {
    // МАРГО
    if (mode === 'FINANCE') {
      voice = "nova"; // Марго (Деловая)
    } else {
      voice = "shimmer"; // Марго (Лиричная) - этот голос звучит натуральнее
    }
  }

  // Лог для проверки в консоли (F12)
  console.log(`🎙️ ОТПРАВЛЯЮ ЗАПРОС: Персонаж=${consultant} -> Голос=${voice}`);

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Вот здесь мы передаем голос на сервер
      body: JSON.stringify({
        text: text,
        voice: voice, 
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
