// src/services/ttsService.ts

export const speakText = async (text: string): Promise<string | null> => {
  try {
    // Мы стучимся к "себе" (/api/tts). 
    // Браузеру не нужен VPN, он просто запрашивает файл с твоего сайта.
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }), 
    });

    if (!response.ok) {
      console.error("Ошибка озвучки:", response.status);
      alert("Голос временно недоступен. Проверьте ключ.");
      return null;
    }

    // Получаем MP3 и делаем ссылку для плеера
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Network Error:", error);
    return null;
  }
};
