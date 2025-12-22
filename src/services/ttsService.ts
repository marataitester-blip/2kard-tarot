import { AppMode } from '../types';

// Карта голосов (ID моделей OpenAI)
const VOICES = {
  MARGO: "shimmer", // Женский, с хрипотцой
  MESSIRE: "onyx"   // Мужской, глубокий, богатый
};

export const speakText = async (
  text: string, 
  consultant: 'STANDARD' | 'VIP', 
  mode: AppMode
): Promise<string | null> => {
  try {
    const voice = consultant === 'VIP' ? VOICES.MESSIRE : VOICES.MARGO;
    
    // Очищаем текст от Markdown символов (*, #) для лучшего звучания
    const cleanText = text.replace(/[*#]/g, '');

    // Отправляем запрос на наш API (или напрямую, если ключ на клиенте, но лучше через api/tts)
    // Здесь мы используем прямой запрос к OpenAI (если у вас настроен прокси, поменяйте URL)
    
    // ВАЖНО: Мы используем ключ из .env
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
        speed: consultant === 'VIP' ? 0.9 : 1.0, // Мессир говорит чуть медленнее
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
