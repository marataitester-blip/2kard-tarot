import React, { useState } from 'react';
import { cards } from './data/tarotData'; // Твоя база карт
import { TarotCard } from './types';
import { analyzeRelationship } from './services/geminiService'; // Твой сервис

const App: React.FC = () => {
  // Состояния (память приложения)
  const [step, setStep] = useState<'INTAKE' | 'SELECTION' | 'ANALYSIS'>('INTAKE');
  const [mode, setMode] = useState<'RANDOM' | 'MANUAL'>('RANDOM');
  const [userProblem, setUserProblem] = useState('');
  
  const [card1, setCard1] = useState<TarotCard | null>(null);
  const [card2, setCard2] = useState<TarotCard | null>(null);
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Начало: переход к выбору карт
  const handleStart = () => {
    if (mode === 'RANDOM') {
      // Перемешиваем и берем 2 случайные
      const shuffled = [...cards].sort(() => 0.5 - Math.random());
      setCard1(shuffled[0]);
      setCard2(shuffled[1]);
      setStep('SELECTION');
    } else {
      setStep('SELECTION');
    }
  };

  // 2. Ручной выбор (если выбран режим Manual)
  const handleManualSelect = (position: 1 | 2, cardId: string) => {
    const selected = cards.find(c => c.id === cardId) || null;
    if (position === 1) setCard1(selected);
    else setCard2(selected);
  };

  // 3. Запуск анализа через AI
  const runDiagnosis = async () => {
    if (!card1 || !card2) return;
    setStep('ANALYSIS');
    setIsLoading(true);
    
    try {
      const text = await analyzeRelationship(card1, card2, userProblem);
      setResultText(text);
    } catch (e) {
      setResultText("Ошибка системы. Попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  // Сброс в начало
  const reset = () => {
    setStep('INTAKE');
    setCard1(null);
    setCard2(null);
    setResultText('');
    setUserProblem('');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-serif flex flex-col items-center p-4">
      
      {/* ЗАГОЛОВОК */}
      <header className="mb-8 mt-6 text-center">
        <h1 className="text-4xl font-bold text-[#D4AF37] tracking-widest uppercase font-cinzel">
          Astra Hero
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
          Циничный психолог
        </p>
      </header>

      {/* ЭКРАН 1: ВВОД ДАННЫХ */}
      {step === 'INTAKE' && (
        <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in">
          
          <div className="flex flex-col gap-2">
            <label className="text-[#D4AF37] text-sm uppercase font-bold tracking-wider">
              В чем проблема?
            </label>
            <textarea 
              value={userProblem}
              onChange={(e) => setUserProblem(e.target.value)}
              placeholder="Например: Он перестал писать, а я схожу с ума..."
              className="w-full h-32 bg-[#111] border border-[#333] rounded-lg p-4 text-gray-300 focus:border-[#D4AF37] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setMode('RANDOM')}
              className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${mode === 'RANDOM' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#333] opacity-60'}`}
            >
              <span className="text-2xl">🎲</span>
              <span className="text-xs uppercase font-bold">Случайно</span>
            </button>
            <button 
              onClick={() => setMode('MANUAL')}
              className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${mode === 'MANUAL' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#333] opacity-60'}`}
            >
              <span className="text-2xl">🤲</span>
              <span className="text-xs uppercase font-bold">Выберу сам</span>
            </button>
          </div>

          <button 
            onClick={handleStart}
            disabled={!userProblem.trim()} // Кнопка неактивна, пока не напишут проблему
            className="w-full py-4 mt-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest rounded hover:bg-[#b5952f] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Начать Сеанс
          </button>
        </div>
      )}

      {/* ЭКРАН 2: ВЫБОР КАРТ */}
      {step === 'SELECTION' && (
        <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in">
          <h2 className="text-center text-[#D4AF37] text-xl font-cinzel">
            {mode === 'RANDOM' ? 'Карты выпали' : 'Выберите карты'}
          </h2>

          <div className="flex justify-center gap-4">
            {/* ОН */}
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-xs text-center text-gray-500 uppercase">ОН</span>
              {mode === 'RANDOM' ? (
                <div className="aspect-[2/3] bg-black border border-[#D4AF37] rounded overflow-hidden relative">
                   <img src={card1?.imageUrl} className="w-full h-full object-cover opacity-80" />
                   <div className="absolute bottom-0 w-full bg-black/80 text-center text-[10px] p-1 text-[#D4AF37]">{card1?.name}</div>
                </div>
              ) : (
                <select 
                  onChange={(e) => handleManualSelect(1, e.target.value)}
                  className="w-full p-2 bg-[#111] border border-[#333] text-xs text-gray-300 rounded focus:border-[#D4AF37]"
                >
                  <option value="">Выбрать...</option>
                  {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>

            {/* ОНА */}
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-xs text-center text-gray-500 uppercase">ОНА</span>
              {mode === 'RANDOM' ? (
                <div className="aspect-[2/3] bg-black border border-[#D4AF37] rounded overflow-hidden relative">
                   <img src={card2?.imageUrl} className="w-full h-full object-cover opacity-80" />
                   <div className="absolute bottom-0 w-full bg-black/80 text-center text-[10px] p-1 text-[#D4AF37]">{card2?.name}</div>
                </div>
              ) : (
                <select 
                  onChange={(e) => handleManualSelect(2, e.target.value)}
                  className="w-full p-2 bg-[#111] border border-[#333] text-xs text-gray-300 rounded focus:border-[#D4AF37]"
                >
                  <option value="">Выбрать...</option>
                  {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>
          </div>

          <button 
            onClick={runDiagnosis}
            disabled={!card1 || !card2}
            className="w-full py-4 mt-8 border border-[#D4AF37] text-[#D4AF37] font-bold uppercase tracking-widest rounded hover:bg-[#D4AF37]/10 disabled:opacity-30 transition-all"
          >
            Получить Диагноз
          </button>
        </div>
      )}

      {/* ЭКРАН 3: РЕЗУЛЬТАТ */}
      {step === 'ANALYSIS' && (
        <div className="w-full max-w-lg flex flex-col items-center animate-fade-in pb-10">
          
          {isLoading ? (
            <div className="text-center mt-20">
              <div className="w-16 h-16 border-t-2 border-[#D4AF37] border-r-2 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#D4AF37] animate-pulse">Психолог пишет диагноз...</p>
            </div>
          ) : (
            <div className="w-full bg-[#0a0a0a] border border-[#333] p-6 rounded-lg shadow-2xl relative">
              
              <div className="flex justify-center gap-4 mb-6 border-b border-[#222] pb-4">
                <div className="text-center">
                  <span className="block text-[10px] text-gray-500 mb-1">ОН</span>
                  <span className="text-[#D4AF37] text-sm font-bold">{card1?.name}</span>
                </div>
                <div className="text-[#333] text-lg">×</div>
                <div className="text-center">
                  <span className="block text-[10px] text-gray-500 mb-1">ОНА</span>
                  <span className="text-[#D4AF37] text-sm font-bold">{card2?.name}</span>
                </div>
              </div>

              {/* Вывод текста с сохранением форматирования */}
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300 font-sans">
                {resultText}
              </div>

              <button 
                onClick={reset}
                className="w-full mt-8 py-3 text-xs uppercase tracking-widest text-gray-500 hover:text-[#D4AF37] border border-transparent hover:border-[#D4AF37]/30 rounded transition-all"
              >
                Следующий пациент
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default App;
