import { AppMode } from '../types';

// ⚠️ ВАЖНО: Вставьте сюда ваш ключ OpenAI, если не используете прокси
const OPENAI_API_KEY = "ВСТАВЬТЕ_СЮДА_ВАШ_КЛЮЧ_OPENAI"; 

export const speakText = async (
  text: string, 
  consultant: 'STANDARD' | 'VIP', 
  mode: AppMode
): Promise<string | null> => {
  try {
    // Выбираем голос
    const voice = consultant === 'VIP' ? 'onyx' : 'shimmer'; 

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      console.error("TTS API Error:", response.statusText);
      return null;
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    return audioUrl;

  } catch (error) {
    console.error("TTS Network Error:", error);
    return null;
  }
};

export const stopSpeaking = () => {
  // Для серверного аудио это просто сброс URL в компоненте
};
