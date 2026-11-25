import { AppMode } from '../types';


export const speakText = async (
  text: string, 
  consultant: 'STANDARD' | 'VIP', 
  mode: AppMode,
  lang: "ru" | "en" = "ru"
): Promise<string | null> => {
  
  // 1. Используем переменную mode (чтобы не ругался сборщик)
  console.log(`Mode: ${mode}`);



  try {
    const voice = consultant === 'VIP' ? 'onyx' : 'shimmer'; 

    // ВАЖНО: Мы стучимся в /api/tts, потому что ваш файл называется tts.js
    const response = await fetch('/api/tts', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        voice: voice
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("API Error:", response.status, errText);
      alert(lang === "en" ? "Voice unavailable. Please try again." : "Озвучка недоступна. Попробуйте ещё раз.");
      return null;
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    
    return audioUrl;

  } catch (error: any) {
    console.error("Network Error:", error);
    alert(lang === "en" ? "Connection failed." : "Ошибка связи.");
    return null;
  }
};

export const stopSpeaking = () => {
  // Заглушка
};
