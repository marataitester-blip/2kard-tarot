import React, { useState } from 'react';
import { cards } from './data/tarotData';
import { TarotCard } from './types';
import { analyzeRelationship } from './services/geminiService';
import { speakText } from './services/ttsService';

// Типы режимов
type AppMode = 'RELATIONSHIPS' | 'FINANCE';

const App: React.FC = () => {
  // --- СОСТОЯНИЕ ---
  const [step, setStep] = useState<'INTAKE' | 'SELECTION' | 'ANALYSIS'>('INTAKE');
  const [financeSubStep, setFinanceSubStep] = useState<1 | 2>(1); // Под-шаг для финансов (1 или 2 пара карт)
  
  const [mode, setMode] = useState<'RANDOM' | 'MANUAL'>('RANDOM');
  const [appMode, setAppMode] = useState<AppMode>('RELATIONSHIPS'); // Режим приложения
  
  const [userProblem, setUserProblem] = useState('');
  
  // Карты (1 и 2 - база, 3 и 4 - для финансов)
  const [card1, setCard1] = useState<TarotCard | null>(null);
  const [card2, setCard2] = useState<TarotCard | null>(null);
  const [card3, setCard3] = useState<TarotCard | null>(null);
  const [card4, setCard4] = useState<TarotCard | null>(null);
  
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- ЛОГИКА ОТОБРАЖЕНИЯ (ВИДЕО / ФОТО) ---
  const renderCardMedia = (card: TarotCard | null) => {
    if (!card) return null;
    const isVideo = card.imageUrl.endsWith('.mp4');

    if (isVideo) {
      return (
        <video 
          src={card.imageUrl} 
          className="w-full h-full object-cover opacity-90"
          autoPlay loop muted playsInline
        />
      );
    }
    return (
      <img 
        src={card.imageUrl} 
        className="w-full h-full object-cover opacity-90" 
        alt={card.name}
      />
    );
  };

  // --- ЛОГИКА ---
  const handleStart = () => {
    // Сброс карт перед началом
    setCard1(null); setCard2(null); setCard3(null); setCard4(null);
    setFinanceSubStep(1);

    if (mode === 'RANDOM') {
      const shuffled = [...cards].sort(() => 0.5 - Math.random());
      
      if (appMode === 'RELATIONSHIPS') {
        setCard1(shuffled[0]);
        setCard2(shuffled[1]);
        setStep('SELECTION');
      } else {
        // Для финансов сразу генерируем 4 карты, но показываем по очереди
        setCard1(shuffled[0]);
        setCard2(shuffled[1]);
        setCard3(shuffled[2]);
        setCard4(shuffled[3]);
        setStep('SELECTION');
      }
    } else {
      setStep('SELECTION');
    }
  };

  const handleManualSelect = (position: 1 | 2 | 3 | 4, cardId: string) => {
    const selected = cards.find(c => c.id === cardId) || null;
    if (position === 1) setCard1(selected);
    if (position === 2) setCard2(selected);
    if (position === 3) setCard3(selected);
    if (position === 4) setCard4(selected);
  };

  const runDiagnosis = async () => {
    // Проверка готовности карт
    if (appMode === 'RELATIONSHIPS' && (!card1 || !card2)) return;
    if (appMode === 'FINANCE' && (!card1 || !card2 || !card3 || !card4)) return;

    setStep('ANALYSIS');
    setIsLoading(true);
    
    try {
      // Собираем колоду для отправки
      const cardsToSend = appMode === 'RELATIONSHIPS' 
        ? [card1!, card2!] 
        : [card1!, card2!, card3!, card4!];

      const text = await analyzeRelationship(cardsToSend, userProblem, appMode);
      setResultText(text);
    } catch (e) {
      setResultText("Ошибка: Вселенная вне зоны доступа.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!resultText || isSpeaking) return;
    setIsSpeaking(true);
    const cleanText = resultText.replace(/[#*]/g, ''); 
    const audioUrl = await speakText(cleanText);
    
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => setIsSpeaking(false);
    } else {
      setIsSpeaking(false);
    }
  };

  const reset = () => {
    setStep('INTAKE');
    setResultText('');
    setUserProblem('');
    setIsSpeaking(false);
  };

  // --- КОМПОНЕНТ ВЫБОРА КАРТЫ (DRY) ---
  const CardSlot = ({ 
    card, position, label 
  }: { card: TarotCard | null, position: 1|2|3|4, label: string }) => (
    <div className="flex-1 flex flex-col gap-2 min-w-[120px]">
      <span className="text-[10px] text-center text-gray-400 uppercase tracking-wider h-4">{label}</span>
      {mode === 'RANDOM' ? (
        <div className="aspect-[2/3] bg-black border border-[#D4AF37] rounded overflow-hidden relative shadow-[0_0_10px_rgba(212,175,55,0.2)]">
           {renderCardMedia(card)}
           <div className="absolute bottom-0 w-full bg-black/80 text-center text-[9px] p-1 text-[#D4AF37] leading-tight">{card?.name}</div>
        </div>
      ) : (
        <select 
          onChange={(e) => handleManualSelect(position, e.target.value)} 
          className="w-full p-2 bg-[#111] border border-[#333] text-xs text-gray-300 rounded focus:border-[#D4AF37] focus:outline-none"
          value={card?.id || ""}
        >
          <option value="">Выбрать...</option>
          {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-serif flex flex-col items-center p-4">
      
      {/* HEADER */}
      <header className="mb-8 mt-6 text-center animate-fade-in">
        <h1 className="text-4xl font-bold text-[#D4AF37] tracking-widest uppercase font-cinzel drop-shadow-md">
          {appMode === 'RELATIONSHIPS' ? 'Astra Hero' : 'Money Shark'}
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
          {appMode === 'RELATIONSHIPS' ? 'Циничный Психолог' : 'Финансовый Инквизитор'}
        </p>
      </header>

      {/* ШАГ 1: ВВОД ДАННЫХ И РЕЖИМА */}
      {step === 'INTAKE' && (
        <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in">
          
          {/* ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМОВ */}
          <div className="flex bg-[#111] p-1 rounded-lg border border-[#333]">
            <button 
              onClick={() => setAppMode('RELATIONSHIPS')}
              className={`flex-1 py-2 text-xs uppercase font-bold rounded transition-all ${appMode === 'RELATIONSHIPS' ? 'bg-[#D4AF37] text-black' : 'text-gray-500 hover:text-white'}`}
            >
              ❤️ Отношения
            </button>
            <button 
              onClick={() => setAppMode('FINANCE')}
              className={`flex-1 py-2 text-xs uppercase font-bold rounded transition-all ${appMode === 'FINANCE' ? 'bg-[#D4AF37] text-black' : 'text-gray-500 hover:text-white'}`}
            >
              💸 Деньги
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#D4AF37] text-sm uppercase font-bold tracking-wider">
              {appMode === 'RELATIONSHIPS' ? 'Суть драмы' : 'Финансовая дыра'}
            </label>
            <textarea 
              value={userProblem}
              onChange={(e) => setUserProblem(e.target.value)}
              placeholder={appMode === 'RELATIONSHIPS' ? "Он молчит, я рыдаю..." : "Долги, нет продаж, хочу миллион..."}
              className="w-full h-32 bg-[#111] border border-[#333] rounded-lg p-4 text-gray-300 focus:border-[#D4AF37] focus:outline-none resize-none placeholder-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setMode('RANDOM')} className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${mode === 'RANDOM' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#333] hover:border-[#555]'}`}>
              <span className="text-2xl">🎲</span><span className="text-xs uppercase font-bold">Рандом</span>
            </button>
            <button onClick={() => setMode('MANUAL')} className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${mode === 'MANUAL' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#333] hover:border-[#555]'}`}>
              <span className="text-2xl">🤲</span><span className="text-xs uppercase font-bold">Вручную</span>
            </button>
          </div>

          <button onClick={handleStart} disabled={!userProblem.trim()} className="w-full py-4 mt-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest rounded disabled:opacity-50 hover:bg-[#b5952f] transition-colors shadow-lg shadow-[#D4AF37]/20">
            {appMode === 'RELATIONSHIPS' ? 'Начать Сеанс' : 'Начать Аудит'}
          </button>
        </div>
      )}

      {/* ШАГ 2: ВЫБОР КАРТ */}
      {step === 'SELECTION' && (
        <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in">
          
          {/* СЦЕНАРИЙ ОТНОШЕНИЙ (2 Карты) */}
          {appMode === 'RELATIONSHIPS' && (
            <>
              <div className="flex justify-center gap-4">
                <CardSlot card={card1} position={1} label="Его отношение" />
                <CardSlot card={card2} position={2} label="Её отношение" />
              </div>
              <button onClick={runDiagnosis} disabled={!card1 || !card2} className="w-full py-4 mt-8 border border-[#D4AF37] text-[#D4AF37] font-bold uppercase tracking-widest rounded hover:bg-[#D4AF37]/10 transition-all">
                Получить Диагноз
              </button>
            </>
          )}

          {/* СЦЕНАРИЙ ФИНАНСОВ (4 Карты, 2 Этапа) */}
          {appMode === 'FINANCE' && (
            <>
              {financeSubStep === 1 && (
                <div className="animate-fade-in flex flex-col gap-4">
                  <div className="text-center text-[#D4AF37] text-xs uppercase tracking-[0.2em] mb-2 border-b border-[#333] pb-2">Этап 1: База</div>
                  <div className="flex justify-center gap-4">
                    <CardSlot card={card1} position={1} label="ТЫ (Твой Актив)" />
                    <CardSlot card={card2} position={2} label="ДЕНЬГИ (Поток)" />
                  </div>
                  <button 
                    onClick={() => setFinanceSubStep(2)} 
                    disabled={!card1 || !card2}
                    className="w-full py-3 mt-4 bg-[#222] text-white border border-[#444] rounded hover:border-[#D4AF37] disabled:opacity-50"
                  >
                    Далее: Стратегия ▼
                  </button>
                </div>
              )}

              {financeSubStep === 2 && (
                <div className="animate-fade-in flex flex-col gap-4">
                  <div className="text-center text-[#D4AF37] text-xs uppercase tracking-[0.2em] mb-2 border-b border-[#333] pb-2">Этап 2: Конфликт</div>
                  <div className="flex justify-center gap-4">
                    <CardSlot card={card3} position={3} label="АМБИЦИИ (Хочу)" />
                    <CardSlot card={card4} position={4} label="РЕАЛЬНОСТЬ (Тормоз)" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setFinanceSubStep(1)} className="px-4 py-3 bg-[#111] border border-[#333] rounded text-gray-400">
                      ◀
                    </button>
                    <button onClick={runDiagnosis} disabled={!card3 || !card4} className="flex-1 py-3 border border-[#D4AF37] text-[#D4AF37] font-bold uppercase tracking-widest rounded hover:bg-[#D4AF37]/10">
                      Жесткий Разбор
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ШАГ 3: РЕЗУЛЬТАТ */}
      {step === 'ANALYSIS' && (
        <div className="w-full max-w-lg flex flex-col items-center animate-fade-in pb-10">
          {isLoading ? (
            <div className="text-center mt-20">
              <div className="w-16 h-16 border-t-2 border-[#D4AF37] border-r-2 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#D4AF37] animate-pulse">
                {appMode === 'RELATIONSHIPS' ? 'Вскрываем подсознание...' : 'Считаем убытки...'}
              </p>
            </div>
          ) : (
            <div className="w-full bg-[#0a0a0a] border border-[#333] p-6 rounded-lg shadow-2xl relative">
              
              {/* ОТОБРАЖЕНИЕ КАРТ В РЕЗУЛЬТАТЕ */}
              <div className="mb-6 border-b border-[#222] pb-6">
                {appMode === 'RELATIONSHIPS' ? (
                  <div className="flex justify-center gap-4">
                    <div className="w-20 aspect-[2/3]">{renderCardMedia(card1)}</div>
                    <div className="self-center text-[#333] text-xl">×</div>
                    <div className="w-20 aspect-[2/3]">{renderCardMedia(card2)}</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="aspect-[2/3]">{renderCardMedia(card1)}</div>
                    <div className="aspect-[2/3]">{renderCardMedia(card2)}</div>
                    <div className="aspect-[2/3]">{renderCardMedia(card3)}</div>
                    <div className="aspect-[2/3]">{renderCardMedia(card4)}</div>
                  </div>
                )}
              </div>

              {/* ТЕКСТ ДИАГНОЗА */}
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300 font-sans mb-6">
                {resultText}
              </div>

              {/* КНОПКА ОЗВУЧКИ */}
              <button 
                onClick={handleSpeak}
                disabled={isSpeaking}
                className={`w-full py-3 mb-4 rounded font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                  ${isSpeaking 
                    ? 'bg-gray-800 text-gray-500 cursor-wait' 
                    : 'bg-[#D4AF37] text-black hover:bg-[#b5952f]'
                  }`}
              >
                {isSpeaking ? (
                  <><span>🔈</span> Вещаю...</>
                ) : (
                  <><span>🔊</span> Озвучить диагноз</>
                )}
              </button>

              <button onClick={reset} className="w-full py-3 text-xs uppercase tracking-widest text-gray-500 hover:text-[#D4AF37] border border-transparent hover:border-[#D4AF37]/30 rounded">
                Новый клиент
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
