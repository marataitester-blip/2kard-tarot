import React, { useState } from 'react';
import { cards } from './data/tarotData';
import { TarotCard } from './types';
import { analyzeRelationship } from './services/geminiService';
import { speakText } from './services/ttsService';

type AppMode = 'RELATIONSHIPS' | 'FINANCE';
type ConsultantType = 'STANDARD' | 'VIP';

const App: React.FC = () => {
  // --- СОСТОЯНИЕ (STATE) ---
  const [step, setStep] = useState<'INTAKE' | 'SELECTION' | 'ANALYSIS'>('INTAKE');
  const [financeSubStep, setFinanceSubStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<'RANDOM' | 'MANUAL'>('RANDOM');
  const [appMode, setAppMode] = useState<AppMode>('RELATIONSHIPS');
  
  // Выбор персонажа: STANDARD (Марго) или VIP (Мессир)
  const [consultant, setConsultant] = useState<ConsultantType>('STANDARD');
  
  const [userProblem, setUserProblem] = useState('');
  
  // Карты
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

  // --- ОСНОВНАЯ ЛОГИКА ---
  const handleStart = () => {
    setCard1(null); setCard2(null); setCard3(null); setCard4(null);
    setFinanceSubStep(1);

    if (mode === 'RANDOM') {
      const shuffled = [...cards].sort(() => 0.5 - Math.random());
      setCard1(shuffled[0]);
      setCard2(shuffled[1]);
      
      if (appMode === 'FINANCE') {
        setCard3(shuffled[2]);
        setCard4(shuffled[3]);
      }
    }
    setStep('SELECTION');
  };

  const handleManualSelect = (position: number, cardId: string) => {
    const selected = cards.find(c => c.id === cardId) || null;
    if (position === 1) setCard1(selected);
    if (position === 2) setCard2(selected);
    if (position === 3) setCard3(selected);
    if (position === 4) setCard4(selected);
  };

  const runDiagnosis = async (forcedConsultant?: ConsultantType) => {
    setStep('ANALYSIS');
    setIsLoading(true);
    setResultText(''); 
    
    const activeConsultant = forcedConsultant || consultant;

    try {
      const cardsToSend = appMode === 'RELATIONSHIPS' 
        ? [card1!, card2!] 
        : [card1!, card2!, card3!, card4!];

      const text = await analyzeRelationship(cardsToSend, userProblem, appMode, activeConsultant);
      setResultText(text);
    } catch (e) {
      setResultText("Ошибка: Астральные каналы перегружены.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecondOpinion = () => {
    const newConsultant = consultant === 'STANDARD' ? 'VIP' : 'STANDARD';
    setConsultant(newConsultant);
    runDiagnosis(newConsultant);
  };

  const handleSpeak = async () => {
    if (!resultText || isSpeaking) return;
    setIsSpeaking(true);
    const cleanText = resultText.replace(/[#*]/g, ''); 
    const audioUrl = await speakText(cleanText, consultant, appMode);
    
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

  // --- КОМПОНЕНТ СЛОТА КАРТЫ ---
  const CardSlot = ({ card, position, label }: { card: TarotCard | null, position: number, label: string }) => (
    <div className="flex-1 flex flex-col gap-2 min-w-[100px]">
      <span className="text-[10px] text-center text-gray-400 uppercase tracking-wider h-4">{label}</span>
      {mode === 'RANDOM' ? (
        <div className={`aspect-[2/3] bg-black border rounded overflow-hidden relative shadow-lg transition-all duration-500
          ${consultant === 'VIP' 
            ? 'border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.3)]' 
            : 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
          }`}>
           {renderCardMedia(card)}
           <div className={`absolute bottom-0 w-full bg-black/80 text-center text-[9px] p-1 leading-tight transition-colors duration-500
             ${consultant === 'VIP' ? 'text-[#FFD700]' : 'text-[#D4AF37]'}`}>
             {card?.name}
           </div>
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
      <header className="mb-6 mt-4 text-center animate-fade-in">
        <h1 className={`text-4xl font-bold tracking-widest uppercase font-cinzel drop-shadow-md transition-all duration-500
          ${consultant === 'VIP' 
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFA500]' 
            : 'text-[#D4AF37]'
          }`}>
          {appMode === 'RELATIONSHIPS' ? 'Astra Hero' : 'Money Shark'}
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-2 transition-all duration-500">
          {consultant === 'VIP' 
            ? '✨ Аудиенция у Мессира ✨' 
            : (appMode === 'RELATIONSHIPS' ? 'Приемная Марго' : 'Бухгалтерия Марго')}
        </p>
      </header>

      {/* --- ШАГ 1: ВВОД --- */}
      {step === 'INTAKE' && (
        <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in">
          
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

          <textarea 
            value={userProblem}
            onChange={(e) => setUserProblem(e.target.value)}
            placeholder={appMode === 'RELATIONSHIPS' ? "В чем драма, мой друг?" : "Где деньги, Марго?"}
            className="w-full h-24 bg-[#111] border border-[#333] rounded-lg p-4 text-gray-300 focus:border-[#D4AF37] focus:outline-none resize-none placeholder-gray-600"
          />

          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => setConsultant('STANDARD')}
              className={`border rounded-lg p-3 cursor-pointer transition-all flex flex-col gap-1 relative 
                ${consultant === 'STANDARD' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#333] opacity-60 hover:opacity-100'}`}
            >
              <div className="text-[#D4AF37] font-bold text-sm">МАРГО</div>
              <div className="text-[10px] text-gray-400">Практик (Qwen)</div>
              <div className="text-[10px] text-gray-500 mt-1 italic">"Я женщина земная..."</div>
            </div>

            <div 
              onClick={() => setConsultant('VIP')}
              className={`border rounded-lg p-3 cursor-pointer transition-all flex flex-col gap-1 relative overflow-hidden 
                ${consultant === 'VIP' ? 'border-[#FFD700] bg-gradient-to-br from-[#FFD700]/10 to-black' : 'border-[#333] opacity-60 hover:opacity-100'}`}
            >
              <div className="absolute top-0 right-0 bg-[#FFD700] text-black text-[9px] font-bold px-2 py-0.5 rounded-bl">VIP</div>
              <div className="text-[#FFD700] font-bold text-sm">МЕССИР</div>
              <div className="text-[10px] text-gray-300">Эстет (Claude)</div>
              <div className="text-[10px] text-[#FFD700] mt-1 italic">"Рукописи не горят"</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setMode('RANDOM')} className={`p-3 border rounded-lg text-xs uppercase flex items-center justify-center gap-2 transition-colors ${mode === 'RANDOM' ? 'border-gray-500 bg-gray-800 text-white' : 'border-[#333] text-gray-500'}`}>
              🎲 Рандом
            </button>
            <button onClick={() => setMode('MANUAL')} className={`p-3 border rounded-lg text-xs uppercase flex items-center justify-center gap-2 transition-colors ${mode === 'MANUAL' ? 'border-gray-500 bg-gray-800 text-white' : 'border-[#333] text-gray-500'}`}>
              🤲 Вручную
            </button>
          </div>

          <button 
            onClick={handleStart} 
            disabled={!userProblem.trim()} 
            className={`w-full py-4 mt-2 font-bold uppercase tracking-widest rounded shadow-lg transition-all duration-500
              ${consultant === 'VIP' 
                ? 'bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFA500] text-black hover:shadow-[#FFD700]/30' 
                : 'bg-[#D4AF37] text-black hover:bg-[#b5952f] hover:shadow-[#D4AF37]/30'
              } disabled:opacity-50 disabled:shadow-none`}
          >
            {consultant === 'VIP' ? 'Начать Аудиенцию' : 'Начать Сеанс'}
          </button>
        </div>
      )}

      {/* --- ШАГ 2: ВЫБОР КАРТ --- */}
      {step === 'SELECTION' && (
        <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in">
          {appMode === 'RELATIONSHIPS' ? (
            <>
              <div className="flex justify-center gap-4">
                <CardSlot card={card1} position={1} label="ОН / Мысли" />
                <CardSlot card={card2} position={2} label="ОНА / Чувства" />
              </div>
              <button 
                onClick={() => runDiagnosis()} 
                disabled={!card1 || !card2} 
                className={`w-full py-4 mt-8 border font-bold uppercase tracking-widest rounded transition-all hover:bg-opacity-10
                  ${consultant === 'VIP' ? 'border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]' : 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]'}`}
              >
                Узнать Истину
              </button>
            </>
          ) : (
            <>
              {financeSubStep === 1 ? (
                <div className="flex flex-col gap-4">
                  <div className="text-center text-gray-500 text-xs uppercase tracking-widest border-b border-[#333] pb-2">Этап 1: Ресурсы</div>
                  <div className="flex justify-center gap-4">
                    <CardSlot card={card1} position={1} label="АКТИВ (Ты)" />
                    <CardSlot card={card2} position={2} label="ПОТОК (Кэш)" />
                  </div>
                  <button 
                    onClick={() => setFinanceSubStep(2)} 
                    disabled={!card1 || !card2} 
                    className="w-full py-3 mt-4 bg-[#222] text-white border border-[#444] rounded hover:border-[#D4AF37] transition-colors"
                  >
                    Далее: Стратегия ▼
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="text-center text-gray-500 text-xs uppercase tracking-widest border-b border-[#333] pb-2">Этап 2: Конфликт</div>
                  <div className="flex justify-center gap-4">
                    <CardSlot card={card3} position={3} label="АМБИЦИИ" />
                    <CardSlot card={card4} position={4} label="РЕАЛЬНОСТЬ" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setFinanceSubStep(1)} className="px-4 py-3 bg-[#111] border border-[#333] rounded text-gray-400 hover:text-white">◀</button>
                    <button 
                      onClick={() => runDiagnosis()} 
                      disabled={!card3 || !card4} 
                      className={`flex-1 py-3 border font-bold uppercase tracking-widest rounded hover:bg-opacity-10 transition-all
                        ${consultant === 'VIP' ? 'border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]' : 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]'}`}
                    >
                      {consultant === 'VIP' ? 'Вердикт Мессира' : 'Жесткий Разбор'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* --- ШАГ 3: РЕЗУЛЬТАТ --- */}
      {step === 'ANALYSIS' && (
        <div className="w-full max-w-lg flex flex-col items-center animate-fade-in pb-10">
          
          {isLoading ? (
            <div className="text-center mt-20">
              <div className={`w-16 h-16 border-t-2 border-r-2 rounded-full animate-spin mx-auto mb-4 
                ${consultant === 'VIP' ? 'border-[#FFD700]' : 'border-[#D4AF37]'}`}></div>
              <p className={`animate-pulse ${consultant === 'VIP' ? 'text-[#FFD700]' : 'text-[#D4AF37]'}`}>
                {consultant === 'VIP' ? 'Мессир размышляет...' : 'Марго считает убытки...'}
              </p>
            </div>
          ) : (
            <div className={`w-full bg-[#0a0a0a] border p-6 rounded-lg shadow-2xl relative transition-colors duration-500
              ${consultant === 'VIP' ? 'border-[#FFD700]/50 shadow-[0_0_20px_rgba(255,215,0,0.1)]' : 'border-[#333] shadow-lg'}`}>
              
              <div className="mb-6 border-b border-[#222] pb-6 flex justify-center gap-2">
                {appMode === 'RELATIONSHIPS' ? (
                   <>
                     <div className="w-20 aspect-[2/3]">{renderCardMedia(card1)}</div>
                     <div className="w-20 aspect-[2/3]">{renderCardMedia(card2)}</div>
                   </>
                ) : (
                   <>
                     <div className="w-16 aspect-[2/3]">{renderCardMedia(card1)}</div>
                     <div className="w-16 aspect-[2/3]">{renderCardMedia(card2)}</div>
                     <div className="w-16 aspect-[2/3]">{renderCardMedia(card3)}</div>
                     <div className="w-16 aspect-[2/3]">{renderCardMedia(card4)}</div>
                   </>
                )}
              </div>

              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300 font-sans mb-6">
                {resultText}
              </div>

              <button 
                onClick={handleSpeak} 
                disabled={isSpeaking} 
                className={`w-full py-3 mb-4 rounded font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                  ${isSpeaking 
                    ? 'bg-gray-800 text-gray-500 cursor-wait' 
                    : (consultant === 'VIP' ? 'bg-[#FFD700] text-black hover:bg-[#FDB931]' : 'bg-[#D4AF37] text-black hover:bg-[#b5952f]')
                  }`}
              >
                 {isSpeaking ? 'Вещаю...' : '🔊 Озвучить'}
              </button>
              
              <button 
                onClick={handleSecondOpinion} 
                className={`w-full py-3 mb-4 rounded border text-xs uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2
                  ${consultant === 'STANDARD' 
                    ? 'border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/10' 
                    : 'border-gray-500 text-gray-400 hover:bg-white/5' 
                  }`}
              >
                {consultant === 'STANDARD' ? '🎩 Узнать мнение Мессира (VIP)' : '💃 Послушать Марго (Standard)'}
              </button>

              <button onClick={reset} className="w-full py-3 text-xs uppercase tracking-widest text-gray-500 hover:text-white border-t border-transparent hover:border-gray-800 transition-colors">
                Новый Гость
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
