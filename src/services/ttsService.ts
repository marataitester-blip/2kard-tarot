import { AppMode } from '../types';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const speakText = async (
  text: string, 
  consultant: 'STANDARD' | 'VIP', 
  mode: AppMode
): Promise<string | null> => {
  
  // 1. Используем переменную mode (чтобы не ругался сборщик)
  console.log(`Mode: ${mode}`);

  // 2. Проверка ключа (для диагностики)
  if (!API_KEY) {
    alert("CRITICAL ERROR: API Key is missing. Please REDEPLOY in Vercel.");
    return null;
  }

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
      alert(`SERVER ERROR ${response.status}: ${errText.slice(0, 50)}`);
      return null;
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    
    return audioUrl;

  } catch (error: any) {
    console.error("Network Error:", error);
    alert(`NETWORK ERROR: ${error.message}`);
    return null;
  }
};

export const stopSpeaking = () => {
  // Заглушка
};
