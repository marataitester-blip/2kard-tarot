import { AppMode } from '../types';

// Получаем ключ
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const speakText = async (
  text: string, 
  consultant: 'STANDARD' | 'VIP', 
  mode: AppMode
): Promise<string | null> => {
  
  // 1. Используем переменную mode для логов (чтобы не было ошибки сборки)
  console.log(`[TTS] Start generation. Mode: ${mode}, Consultant: ${consultant}`);

  // 2. ПРОВЕРКА КЛЮЧА
  if (!API_KEY) {
    console.error("CRITICAL: VITE_OPENAI_API_KEY is missing!");
    alert("ОШИБКА: Ключ API не найден в Vercel. Проверьте переменную VITE_OPENAI_API_KEY.");
    return null;
  }

  try {
    const voice = consultant === 'VIP' ? 'onyx' : 'shimmer'; 

    // 3. ЗАПРОС
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

    // 4. ДИАГНОСТИКА ОШИБОК СЕРВЕРА
    if (!response.ok) {
      const errorText = await response.text(); // Читаем текст ошибки
      console.error("OpenAI API Error:", response.status, errorText);
      alert(`ОШИБКА API (${response.status}): ${errorText.slice(0, 100)}`); // Показываем ошибку на экране
      return null;
    }

    // 5. УСПЕШНОЕ ПОЛУЧЕНИЕ ФАЙЛА
    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    
    return audioUrl;

  } catch (error: any) {
    // 6. ОШИБКИ СЕТИ
    console.error("Network Error:", error);
    alert(`ОШИБКА СЕТИ: ${error.message || 'Неизвестная ошибка связи'}`);
    return null;
  }
};

export const stopSpeaking = () => {
  // Заглушка
};
