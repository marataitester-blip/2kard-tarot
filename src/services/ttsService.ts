import { AppMode } from '../types';

// Vite автоматически подтягивает переменные, начинающиеся с VITE_
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const speakText = async (
  text: string, 
  consultant: 'STANDARD' | 'VIP', 
  mode: AppMode
): Promise<string | null> => {
  
  // ИСПОЛЬЗУЕМ переменную mode, чтобы не было ошибки сборки
  console.log(`Генерация голоса для режима: ${mode}`); 

  if (!API_KEY) {
    console.error("ОШИБКА: Ключ API не найден. Убедитесь, что в Vercel добавлена переменная VITE_OPENAI_API_KEY");
    alert("Ошибка конфигурации: Нет API ключа.");
    return null;
  }

  try {
    // Выбираем голос: 
    // onyx - глубокий мужской (Мессир)
    // shimmer - звонкий женский (Марго)
    const voice = consultant === 'VIP' ? 'onyx' : 'shimmer'; 

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
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
      const errorData = await response.json().catch(() => ({}));
      console.error("TTS API Error:", response.status, errorData);
      return null;
    }

    // Превращаем ответ в Blob (аудио-файл в памяти)
    const blob = await response.blob();
    // Создаем ссылку на этот файл, которую понимает <audio> плеер
    const audioUrl = URL.createObjectURL(blob);
    
    return audioUrl;

  } catch (error) {
    console.error("TTS Network Error:", error);
    return null;
  }
};

export const stopSpeaking = () => {
  // Для серверного аудио сброс делается в компоненте через setAudioUrl(null)
  // Эта функция оставлена для совместимости интерфейсов
};
