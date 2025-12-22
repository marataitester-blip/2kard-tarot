import { AppMode } from '../types';

// Карта голосов
const VOICES = {
  MARGO: "shimmer", 
  MESSIRE: "onyx"   
};

// Добавили _ перед mode, чтобы TS не ругался на неиспользуемую переменную
export const speakText = async (
  text: string, 
  consultant: 'STANDARD' | 'VIP', 
  _mode: AppMode 
): Promise<string | null> => {
  try {
    const voice = consultant === 'VIP' ? VOICES.MESSIRE : VOICES.MARGO;
    
    const cleanText = text.replace(/[*#]/g, '');

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY; 
    
    if (!apiKey) {
        console.warn("Нет ключа API для озвучки");
        return null;
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: cleanText,
        voice: voice,
        speed: consultant === 'VIP' ? 0.9 : 1.0,
      }),
    });

    if (!response.ok) {
        console.error("TTS Error:", response.statusText);
        return null;
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("TTS Service Error:", error);
    return null;
  }
};
