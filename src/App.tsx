import React, { useState } from 'react';
import { cards } from './data/tarotData';
import { TarotCard } from './types';
import { analyzeRelationship } from './services/geminiService';
import { speakText } from './services/ttsService'; // Подключаем озвучку

const App: React.FC = () => {
  const [step, setStep] = useState<'INTAKE' | 'SELECTION' | 'ANALYSIS'>('INTAKE');
  const [mode, setMode] = useState<'RANDOM' | 'MANUAL'>('RANDOM');
  const [userProblem, setUserProblem] = useState('');
  
  const [card1, setCard1] = useState<TarotCard | null>(null);
  const [card2, setCard2] = useState<TarotCard | null>(null);
  const [resultText, setResultText] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Состояние: говорит ли он сейчас?

  // --- ЛОГИКА ---

  const handleStart = () => {
    if (mode === 'RANDOM') {
      const shuffled = [...cards].sort(() => 0.5 - Math.random());
      setCard1(shuffled[0]);
      setCard2(shuffled[1]);
      setStep('SELECTION');
    } else {
      setStep('SELECTION');
    }
  };

  const handleManualSelect = (position: 1 | 2, cardId: string) => {
    const selected = cards.find(c => c.id === cardId) || null;
    if (position === 1) setCard1(selected);
    else setCard2(selected);
  };

  const runDiagnosis = async () => {
    if (!card1 || !card2) return;
    setStep('ANALYSIS');
    setIsLoading(true);
    
    try {
      const text = await analyzeRelationship(card1, card2, userProblem);
      setResultText(text);
    } catch (e) {
      setResultText("Ошибка связи с космосом.");
    } finally {
      setIsLoading(false);
    }
  };

  // ФУНКЦИЯ ОЗВУЧКИ
  const handleSpeak = async () => {
    if (!resultText || isSpeaking) return;
    setIsSpeaking(true);
    
    // Очищаем текст от Markdown символов (*, #) для лучшего чтения, если нужно
    const cleanText = resultText.replace(/[#*]/g, ''); 

    const audioUrl = await speakText(cleanText);
    
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => setIsSpeaking(false); // Когда закончит говорить, вернет кнопку
    } else {
      setIsSpeaking(false);
    }
  };

  const reset = () => {
    setStep('INTAKE');
    setCard1(null);
    setCard2(null);
    setResultText('');
    setUserProblem('');
    setIsSpeaking(false);
  };

  // --- ИНТЕРФЕЙС ---
  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-serif flex flex-col items-center p-4">
      
      <header className="mb-8 mt-6 text-center">
        <h1 className="text-4xl font-bold text-[#D4AF37] tracking-widest uppercase font-cinzel">
          Astra Hero
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
          Циничный психолог
        </p>
      </header>

      {/* ШАГ 1: ВВОД */}
      {step === 'INTAKE' && (
        <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in">
          <div className="flex flex-col gap-2">
            <label className="text-[#D4AF37] text-sm uppercase font-bold tracking-wider">Суть драмы</label>
            <textarea 
              value={userProblem}
              onChange={(e) => setUserProblem(e.target.value)}
              placeholder="Он молчит, я рыдаю..."
              className="w-full h-32 bg-[#111] border border-[#333] rounded-lg p-4 text-gray-300 focus:border-[#D4AF37] focus:outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setMode('RANDOM')} className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${mode === 'RANDOM' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#333]'}`}>
              <span className="text-2xl">🎲</span><span className="text-xs uppercase font-bold">Рандом</span>
            </button>
            <button onClick={() => setMode('MANUAL')} className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${mode === 'MANUAL' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#333]'}`}>
              <span className="text-2xl">🤲</span><span className="text-xs uppercase font-bold">Вручную</span>
            </button>
          </div>
          <button onClick={handleStart} disabled={!userProblem.trim()} className="w-full py-4 mt-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest rounded disabled:opacity-50">
            Начать Сеанс
          </button>
        </div>
      )}

      {/* ШАГ 2: ВЫБОР */}
      {step === 'SELECTION' && (
        <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in">
          <div className="flex justify-center gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-xs text-center text-gray-500 uppercase">ОН</span>
              {mode === 'RANDOM' ? (
                <div className="aspect-[2/3] bg-black border border-[#D4AF37] rounded overflow-hidden relative">
                   <img src={card1?.imageUrl} className="w-full h-full object-cover opacity-80" />
                   <div className="absolute bottom-0 w-full bg-black/80 text-center text-[10px] p-1 text-[#D4AF37]">{card1?.name}</div>
                </div>
              ) : (
                <select onChange={(e) => handleManualSelect(1, e.target.value)} className="w-full p-2 bg-[#111] border border-[#333] text-xs text-gray-300 rounded focus:border-[#D4AF37]">
                  <option value="">Выбрать...</option>
                  {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-xs text-center text-gray-500 uppercase">ОНА</span>
              {mode === 'RANDOM' ? (
                <div className="aspect-[2/3] bg-black border border-[#D4AF37] rounded overflow-hidden relative">
                   <img src={card2?.imageUrl} className="w-full h-full object-cover opacity-80" />
                   <div className="absolute bottom-0 w-full bg-black/80 text-center text-[10px] p-1 text-[#D4AF37]">{card2?.name}</div>
                </div>
              ) : (
                <select onChange={(e) => handleManualSelect(2, e.target.value)} className="w-full p-2 bg-[#111] border border-[#333] text-xs text-gray-300 rounded focus:border-[#D4AF37]">
                  <option value="">Выбрать...</option>
                  {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>
          </div>
          <button onClick={runDiagnosis} disabled={!card1 || !card2} className="w-full py-4 mt-8 border border-[#D4AF37] text-[#D4AF37] font-bold uppercase tracking-widest rounded hover:bg-[#D4AF37]/10">
            Получить Диагноз
          </button>
        </div>
      )}

      {/* ШАГ 3: РЕЗУЛЬТАТ */}
      {step === 'ANALYSIS' && (
        <div className="w-full max-w-lg flex flex-col items-center animate-fade-in pb-10">
          {isLoading ? (
            <div className="text-center mt-20">
              <div className="w-16 h-16 border-t-2 border-[#D4AF37] border-r-2 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#D4AF37] animate-pulse">Анализ психотипов...</p>
            </div>
          ) : (
            <div className="w-full bg-[#0a0a0a] border border-[#333] p-6 rounded-lg shadow-2xl relative">
              
              <div className="flex justify-center gap-4 mb-6 border-b border-[#222] pb-4">
                 <div className="text-center"><span className="text-[#D4AF37] font-bold">{card1?.name}</span></div>
                 <div className="text-[#333]">×</div>
                 <div className="text-center"><span className="text-[#D4AF37] font-bold">{card2?.name}</span></div>
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
                Новый пациент
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
