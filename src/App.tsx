import React, { useState } from 'react';
import { cards } from './data/tarotData';
import { TarotCard } from './types';
import { analyzeRelationship } from './services/geminiService';
import { speakText } from './services/ttsService';

type AppMode = 'RELATIONSHIPS' | 'FINANCE' | 'GENERAL';
type ConsultantType = 'STANDARD' | 'VIP';
type Screen = 'DOOR' | 'HALLWAY' | 'OFFICE'; 

// --- ССЫЛКИ НА АССЕТЫ С GITHUB (CDN) ---
const CARD_BACK_URL = "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/rubashka.png";
// Новая ссылка на партнеров (убедитесь, что загрузили файл partners.jpg в репозиторий!)
const PARTNERS_BG_URL = "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/partners.jpg";

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('DOOR');
  
  const [step, setStep] = useState<'INTAKE' | 'SELECTION' | 'ANALYSIS'>('INTAKE');
  const [financeSubStep, setFinanceSubStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<'RANDOM' | 'MANUAL'>('RANDOM');
  const [appMode, setAppMode] = useState<AppMode>('RELATIONSHIPS');
  const [consultant, setConsultant] = useState<ConsultantType>('STANDARD');
  
  const [userProblem, setUserProblem] = useState('');
  const [card1, setCard1] = useState<TarotCard | null>(null);
  const [card2, setCard2] = useState<TarotCard | null>(null);
  const [card3, setCard3] = useState<TarotCard | null>(null);
  const [card4, setCard4] = useState<TarotCard | null>(null);
  
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // --- ХЕЛПЕРЫ ---
  const renderCardMedia = (card: TarotCard | null) => {
    if (!card) {
       if (mode === 'RANDOM') {
         return <img src={CARD_BACK_URL} className="w-full h-full object-cover opacity-80" alt="Рубашка" />;
       }
       return null;
    }

    const isVideo = card.imageUrl.endsWith('.mp4');
    if (isVideo) {
      return <video src={card.imageUrl} className="w-full h-full object-cover opacity-90" autoPlay loop muted playsInline />;
    }
    return <img src={card.imageUrl} className="w-full h-full object-cover opacity-90" alt={card.name} />;
  };

  const reset = () => {
    setStep('INTAKE');
    setResultText('');
    setUserProblem('');
    setAudioUrl(null);
  };

  const fullReset = () => {
    reset();
    setScreen('DOOR');
  };

  const handleEnterOffice = (selectedMode: AppMode) => {
    setAppMode(selectedMode);
    setScreen('OFFICE');
  };

  const handleStart = () => {
    setCard1(null); setCard2(null); setCard3(null); setCard4(null);
    setFinanceSubStep(1);

    if (mode === 'RANDOM') {
      const shuffled = [...cards].sort(() => 0.5 - Math.random());
      setCard1(shuffled[0]);
      setCard2(shuffled[1]);
      if (appMode === 'GENERAL' || appMode === 'FINANCE') setCard3(shuffled[2]);
      if (appMode === 'FINANCE') setCard4(shuffled[3]);
    }
    setStep('SELECTION');
  };

  const runDiagnosis = async (forcedConsultant?: ConsultantType) => {
    setStep('ANALYSIS');
    setIsLoading(true);
    setResultText(''); 
    setAudioUrl(null);
    const activeConsultant = forcedConsultant || consultant;

    try {
      let cardsToSend: TarotCard[] = [];
      if (appMode === 'RELATIONSHIPS') cardsToSend = [card1!, card2!];
      else if (appMode === 'GENERAL') cardsToSend = [card1!, card2!, card3!];
      else cardsToSend = [card1!, card2!, card3!, card4!];

      const text = await analyzeRelationship(cardsToSend, userProblem, appMode, activeConsultant);
      setResultText(text);
    } catch (e) {
      setResultText("Ошибка: Астральные каналы перегружены.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!resultText || isGeneratingVoice) return;
    setIsGeneratingVoice(true);
    setAudioUrl(null); 
    const cleanText = resultText.replace(/[#*]/g, ''); 
    const url = await speakText(cleanText, consultant, appMode as any); 
    if (url) setAudioUrl(url);
    setIsGeneratingVoice(false);
  };

  // --- ЭКРАНЫ ---
  
  // 1. ДВЕРЬ (ГЛАВНАЯ ЗАСТАВКА)
  if (screen === 'DOOR') {
    return (
      <div className="min-h-screen bg-black text-[#E0E0E0] font-serif flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* ФОНОВАЯ КАРТИНКА С GITHUB */}
        <div 
            className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-40 transition-opacity duration-1000 animate-fade-in"
            style={{ backgroundImage: `url('${PARTNERS_BG_URL}')` }}
        ></div>
        
        {/* Градиент */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

        <div className="z-10 text-center max-w-lg animate-fade-in flex flex-col items-center gap-10 mt-32">
          
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FDB931] to-[#D4AF37] font-cinzel mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              НЕПРАВИЛЬНАЯ<br/>ПСИХОЛОГИЯ
            </h1>
            <p className="text-sm md:text-base text-gray-300 tracking-[0.3em] uppercase drop-shadow-md">
              Карты знают то, о чем молчат дипломы
            </p>
          </div>

          <button 
            onClick={() => setScreen('HALLWAY')}
            className="group relative px-10 py-5 bg-black/60 border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black rounded transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            <span className="relative uppercase tracking-widest font-bold text-sm group-hover:text-black transition-colors text-[#D4AF37]">
              Войти в Кабинет
            </span>
          </button>
        </div>
      </div>
    );
  }

  // 2. ПРИХОЖАЯ
  if (screen === 'HALLWAY') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#E0E0E0] font-serif flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="max-w-md w-full border border-[#222] p-8 rounded bg-[#111] relative shadow-2xl">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-[#333] border border-[#111]"></div>
          
          <h2 className="text-center text-xl text-[#D4AF37] font-cinzel mb-8 tracking-widest border-b border-[#333] pb-4">
            ПРАВИЛА ДОМА
          </h2>

          <ul className="space-y-6 text-sm text-gray-400 font-sans leading-relaxed mb-8">
            <li className="flex gap-3">
              <span className="text-[#D4AF37] font-bold">01.</span>
              <span>Не лгите картам. Они видят не то, что вы говорите, а то, что вы прячете.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#D4AF37] font-bold">02.</span>
              <span>Марго ударит правдой в лоб. Мессир вскроет душу скальпелем. Выбирайте.</span>
            </li>
          </ul>

          <div className="space-y-3">
            <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-2">Выберите тему</p>
            <button onClick={() => handleEnterOffice('RELATIONSHIPS')} className="w-full py-4 border border-[#333] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 text-gray-300 hover:text-[#D4AF37] rounded transition-all uppercase text-xs tracking-widest font-bold">
              ❤️ Отношения (Драма)
            </button>
            <button onClick={() => handleEnterOffice('GENERAL')} className="w-full py-4 border border-[#333] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 text-gray-300 hover:text-[#D4AF37] rounded transition-all uppercase text-xs tracking-widest font-bold">
              🔮 Судьба (3 Карты)
            </button>
            <button onClick={() => handleEnterOffice('FINANCE')} className="w-full py-4 border border-[#333] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 text-gray-300 hover:text-[#D4AF37] rounded transition-all uppercase text-xs tracking-widest font-bold">
              💸 Финансы (Стратегия)
            </button>
          </div>
        </div>
        
        <button onClick={fullReset} className="mt-8 text-xs text-gray-600 hover:text-gray-400 underline">
          Вернуться к двери
        </button>
      </div>
    );
  }

  // 3. КАБИНЕТ
  const CardSlot = ({ card, position, label }: { card: TarotCard | null, position: number, label: string }) => (
    <div className="flex-1 flex flex-col gap-2 min-w-[90px]">
      <span className="text-[10px] text-center text-gray-400 uppercase tracking-wider h-8 flex items-center justify-center leading-tight">{label}</span>
      {mode === 'RANDOM' ? (
        <div className={`aspect-[2/3] bg-black border rounded overflow-hidden relative shadow-lg transition-all duration-500
          ${consultant === 'VIP' 
            ? 'border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.3)]' 
            : 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
          }`}>
           {renderCardMedia(card)}
           <div className={`absolute bottom-0 w-full bg-black/80 text-center text-[9px] p-1 leading-tight transition-colors duration-500
             ${consultant === 'VIP' ? 'text-[#FFD700]' : 'text-[#D4AF37]'}`}>
             {card?.name || "..."}
           </div>
        </div>
      ) : (
        <select 
          onChange={(e) => {
             const selected = cards.find(c => c.id === e.target.value) || null;
             if (position === 1) setCard1(selected);
             if (position === 2) setCard2(selected);
             if (position === 3) setCard3(selected);
             if (position === 4) setCard4(selected);
          }} 
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
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-serif flex flex-col items-center p-4 animate-fade-in">
      <button onClick={() => setScreen('HALLWAY')} className="absolute top-4 left-4 text-gray-600 hover:text-[#D4AF37] transition-colors text-xs uppercase tracking-widest">
        ← Выход
      </button>

      <header className="mb-6 mt-8 text-center">
        <h1 className={`text-3xl font-bold tracking-widest uppercase font-cinzel drop-shadow-md transition-all duration-500
          ${consultant === 'VIP' 
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFA500]' 
            : 'text-[#D4AF37]'
          }`}>
          {appMode === 'RELATIONSHIPS' ? 'Аутопсия Любви' : appMode === 'FINANCE' ? 'Финансовый Разбор' : 'Линии Судьбы'}
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-2 transition-all duration-500">
          {consultant === 'VIP' ? 'Кабинет Мессира' : 'Стол Марго'}
        </p>
      </header>

      {/* ШАГ 1: ВВОД */}
      {step === 'INTAKE' && (
        <div className="w-full max-w-md flex flex-col gap-6">
          <textarea 
            value={userProblem}
            onChange={(e) => setUserProblem(e.target.value)}
            placeholder="Рассказывайте. Как есть."
            className="w-full h-32 bg-[#111] border border-[#333] rounded-lg p-4 text-gray-300 focus:border-[#D4AF37] focus:outline-none resize-none placeholder-gray-600"
          />

          <div className="grid grid-cols-2 gap-4">
            <div onClick={() => setConsultant('STANDARD')} className={`border rounded-lg p-3 cursor-pointer transition-all flex flex-col gap-1 relative ${consultant === 'STANDARD' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#333] opacity-60 hover:opacity-100'}`}>
              <div className="text-[#D4AF37] font-bold text-sm">МАРГО</div>
              <div className="text-[10px] text-gray-400">Циничный практик</div>
            </div>
            <div onClick={() => setConsultant('VIP')} className={`border rounded-lg p-3 cursor-pointer transition-all flex flex-col gap-1 relative overflow-hidden ${consultant === 'VIP' ? 'border-[#FFD700] bg-gradient-to-br from-[#FFD700]/10 to-black' : 'border-[#333] opacity-60 hover:opacity-100'}`}>
              <div className="absolute top-0 right-0 bg-[#FFD700] text-black text-[9px] font-bold px-2 py-0.5 rounded-bl">VIP</div>
              <div className="text-[#FFD700] font-bold text-sm">МЕССИР</div>
              <div className="text-[10px] text-gray-300">Наблюдатель</div>
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

          <button onClick={handleStart} disabled={!userProblem.trim()} className={`w-full py-4 mt-2 font-bold uppercase tracking-widest rounded shadow-lg transition-all duration-500 ${consultant === 'VIP' ? 'bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFA500] text-black hover:shadow-[#FFD700]/30' : 'bg-[#D4AF37] text-black hover:bg-[#b5952f] hover:shadow-[#D4AF37]/30'} disabled:opacity-50 disabled:shadow-none`}>
            Начать Сеанс
          </button>
        </div>
      )}

      {/* ШАГ 2: КАРТЫ */}
      {step === 'SELECTION' && (
        <div className="w-full max-w-md flex flex-col gap-6">
          {appMode === 'RELATIONSHIPS' && (
            <>
              <div className="flex justify-center gap-4">
                <CardSlot card={card1} position={1} label="ОН / Мысли" />
                <CardSlot card={card2} position={2} label="ОНА / Чувства" />
              </div>
              <button onClick={() => runDiagnosis()} disabled={!card1 || !card2} className={`w-full py-4 mt-8 border font-bold uppercase tracking-widest rounded transition-all hover:bg-opacity-10 ${consultant === 'VIP' ? 'border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]' : 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]'}`}>
                Узнать Истину
              </button>
            </>
          )}

          {appMode === 'GENERAL' && (
            <>
              <div className="flex justify-center gap-2">
                <CardSlot card={card1} position={1} label="Ситуация" />
                <CardSlot card={card2} position={2} label="Действие" />
                <CardSlot card={card3} position={3} label="Результат" />
              </div>
              <button onClick={() => runDiagnosis()} disabled={!card1 || !card2 || !card3} className={`w-full py-4 mt-8 border font-bold uppercase tracking-widest rounded transition-all hover:bg-opacity-10 ${consultant === 'VIP' ? 'border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]' : 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]'}`}>
                Раскрыть Судьбу
              </button>
            </>
          )}

          {appMode === 'FINANCE' && (
            <>
              {financeSubStep === 1 ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center gap-4">
                    <CardSlot card={card1} position={1} label="АКТИВ" />
                    <CardSlot card={card2} position={2} label="ПОТОК" />
                  </div>
                  <button onClick={() => setFinanceSubStep(2)} disabled={!card1 || !card2} className="w-full py-3 mt-4 bg-[#222] text-white border border-[#444] rounded hover:border-[#D4AF37] transition-colors">
                    Далее ▼
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center gap-4">
                    <CardSlot card={card3} position={3} label="ПЛАН" />
                    <CardSlot card={card4} position={4} label="РЕАЛЬНОСТЬ" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setFinanceSubStep(1)} className="px-4 py-3 bg-[#111] border border-[#333] rounded text-gray-400 hover:text-white">◀</button>
                    <button onClick={() => runDiagnosis()} disabled={!card3 || !card4} className={`flex-1 py-3 border font-bold uppercase tracking-widest rounded hover:bg-opacity-10 transition-all ${consultant === 'VIP' ? 'border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]' : 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]'}`}>
                      Анализ
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
        <div className="w-full max-w-lg flex flex-col items-center pb-10">
          {isLoading ? (
            <div className="text-center mt-20">
              <div className={`w-16 h-16 border-t-2 border-r-2 rounded-full animate-spin mx-auto mb-4 ${consultant === 'VIP' ? 'border-[#FFD700]' : 'border-[#D4AF37]'}`}></div>
              <p className={`animate-pulse ${consultant === 'VIP' ? 'text-[#FFD700]' : 'text-[#D4AF37]'}`}>
                {consultant === 'VIP' ? 'Мессир размышляет...' : 'Марго считает...'}
              </p>
            </div>
          ) : (
            <div className={`w-full bg-[#0a0a0a] border p-6 rounded-lg shadow-2xl relative transition-colors duration-500 ${consultant === 'VIP' ? 'border-[#FFD700]/50 shadow-[0_0_20px_rgba(255,215,0,0.1)]' : 'border-[#333] shadow-lg'}`}>
              <div className="mb-6 border-b border-[#222] pb-6 flex justify-center gap-2">
                {appMode === 'RELATIONSHIPS' && (
                   <>
                     <div className="w-20 aspect-[2/3]">{renderCardMedia(card1)}</div>
                     <div className="w-20 aspect-[2/3]">{renderCardMedia(card2)}</div>
                   </>
                )}
                {appMode === 'GENERAL' && (
                   <>
                     <div className="w-16 aspect-[2/3]">{renderCardMedia(card1)}</div>
                     <div className="w-16 aspect-[2/3]">{renderCardMedia(card2)}</div>
                     <div className="w-16 aspect-[2/3]">{renderCardMedia(card3)}</div>
                   </>
                )}
                {appMode === 'FINANCE' && (
                   <>
                     <div className="w-14 aspect-[2/3]">{renderCardMedia(card1)}</div>
                     <div className="w-14 aspect-[2/3]">{renderCardMedia(card2)}</div>
                     <div className="w-14 aspect-[2/3]">{renderCardMedia(card3)}</div>
                     <div className="w-14 aspect-[2/3]">{renderCardMedia(card4)}</div>
                   </>
                )}
              </div>

              <div className="mb-6">
                {!audioUrl ? (
                  <button onClick={handleGenerateAudio} disabled={isGeneratingVoice} className={`w-full py-2 rounded border border-dashed text-xs uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${isGeneratingVoice ? 'border-gray-700 text-gray-500 cursor-wait' : (consultant === 'VIP' ? 'border-[#FFD700]/50 text-[#FFD700] hover:bg-[#FFD700]/10' : 'border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10')}`}>
                     {isGeneratingVoice ? '✨ Магия голоса...' : '🎙️ Озвучить ответ'}
                  </button>
                ) : (
                  <div className={`rounded-lg p-2 border animate-fade-in flex flex-col items-center gap-2 ${consultant === 'VIP' ? 'border-[#FFD700]/30 bg-[#FFD700]/5' : 'border-[#D4AF37]/30 bg-[#D4AF37]/5'}`}>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-70">
                      <span>{consultant === 'VIP' ? '🦁 Голос Мессира' : '🦊 Голос Марго'}</span>
                    </div>
                    <audio controls src={audioUrl} className="w-full h-8 opacity-80 hover:opacity-100 transition-opacity" autoPlay />
                  </div>
                )}
              </div>

              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300 font-sans mb-8 pl-2 border-l-2 border-[#222]">
                {resultText}
              </div>
              
              <button onClick={reset} className="w-full py-3 text-xs uppercase tracking-widest text-gray-500 hover:text-white border-t border-transparent hover:border-gray-800 transition-colors">
                Новый Гость (Рестарт)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
