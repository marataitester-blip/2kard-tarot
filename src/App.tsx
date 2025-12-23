import React, { useState, useEffect, useRef } from 'react';
import { cards } from './data/tarotData';
import { TarotCard, AppMode } from './types';
import { analyzeRelationship } from './services/geminiService';
import { speakText } from './services/ttsService';

type ConsultantType = 'STANDARD' | 'VIP';
type Screen = 'DOOR' | 'HALLWAY' | 'OFFICE'; 

// --- АССЕТЫ ---
const ASSETS = {
  vid_partners: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/partners.mp4",
  vid_table: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/table.mp4",
  img_hallway: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/hallway.jpg",
  img_doorbell: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/doorbell.png",
  img_cardback: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/rubashka.png",
  img_favicon: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/favicon.png"
};

const LINKS = {
  MASTER: "#", COMMUNITY: "#", PAYMENT: "#", SHARE: "#"
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('DOOR');
  const [consultant, setConsultant] = useState<ConsultantType>('STANDARD');
  const [appMode, setAppMode] = useState<AppMode>('RELATIONSHIPS');
  
  // Логика
  const [step, setStep] = useState<'INTAKE' | 'SELECTION' | 'ANALYSIS'>('INTAKE');
  const [mode, setMode] = useState<'RANDOM' | 'MANUAL'>('RANDOM');
  const [userProblem, setUserProblem] = useState('');
  const [selectedCards, setSelectedCards] = useState<(TarotCard | null)[]>([null, null, null, null, null]);
  
  // Результат и Аудио
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // --- СЦЕНАРИЙ ПРИХОЖЕЙ ---
  const videoHallwayRef = useRef<HTMLVideoElement>(null);
  const [hallwayPhase, setHallwayPhase] = useState<'FREEZE' | 'ACTION' | 'INTERACTIVE'>('FREEZE');
  const [showMargoBtn, setShowMargoBtn] = useState(false);
  const [showMessireBtn, setShowMessireBtn] = useState(false);
  
  // Визуальные заглушки для отладки звука
  const [audioStubLabel, setAudioStubLabel] = useState('');

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) link.href = ASSETS.img_favicon;
    document.title = "Неправильная Психология";
  }, []);

  // --- ЛОГИКА СЦЕНЫ ПРИХОЖЕЙ (Video Logic) ---
  useEffect(() => {
    if (screen === 'HALLWAY') {
      // Сброс состояний при входе
      setHallwayPhase('FREEZE');
      setShowMargoBtn(false);
      setShowMessireBtn(false);
      setAudioStubLabel('');

      // 1. СТАРТ: СТОП-КАДР (0 сек)
      if (videoHallwayRef.current) {
        videoHallwayRef.current.pause();
        videoHallwayRef.current.currentTime = 0;
      }
      console.log("🔊 AUDIO STUB: Голос Копеляна - 'Информация к размышлению...'");
      setAudioStubLabel("🔊 Копелян: Вступление...");

      // 2. ОЖИВЛЕНИЕ (через 5 сек)
      const timerAction = setTimeout(() => {
        setHallwayPhase('ACTION');
        if (videoHallwayRef.current) videoHallwayRef.current.play();
        console.log("🔊 AUDIO STUB: Досье на героев");
        setAudioStubLabel("🔊 Копелян: Досье на Марго и Мессира...");
      }, 5000);

      // 3. ПОЯВЛЕНИЕ МАРГО (через 12 сек)
      const timerMargo = setTimeout(() => {
        setShowMargoBtn(true);
      }, 12000);

      // 4. ПОЯВЛЕНИЕ МЕССИРА (через 13 сек - последовательно)
      const timerMessire = setTimeout(() => {
        setShowMessireBtn(true);
        setHallwayPhase('INTERACTIVE');
        setAudioStubLabel("🔊 Копелян: Выбор за вами.");
      }, 13000);

      return () => {
        clearTimeout(timerAction);
        clearTimeout(timerMargo);
        clearTimeout(timerMessire);
      };
    }
  }, [screen]);

  // --- НАВИГАЦИЯ ---
  const enterDoor = () => {
    setScreen('HALLWAY');
  };

  const enterAs = (type: ConsultantType) => {
    setConsultant(type);
    handleEnterOffice('BLITZ'); 
  };

  const handleEnterOffice = (selectedMode: AppMode) => {
    setAppMode(selectedMode);
    const countMap: Record<AppMode, number> = {
        'BLITZ': 1, 'RELATIONSHIPS': 2, 'FATE': 3, 'FINANCE': 4, 'CROSS': 5
    };
    setSelectedCards(new Array(countMap[selectedMode]).fill(null));
    setScreen('OFFICE');
  };

  const fullReset = () => {
    setStep('INTAKE');
    setResultText('');
    setUserProblem('');
    setAudioUrl(null);
    setScreen('DOOR');
  };

  const handleStart = () => {
    const count = selectedCards.length;
    let newCards = new Array(count).fill(null);
    if (mode === 'RANDOM') {
      const shuffled = [...cards].sort(() => 0.5 - Math.random());
      newCards = shuffled.slice(0, count);
    }
    setSelectedCards(newCards);
    setStep('SELECTION');
  };

  const runDiagnosis = async () => {
    if (selectedCards.some(c => c === null)) return;
    setStep('ANALYSIS');
    setIsLoading(true);
    setResultText(''); setAudioUrl(null);

    try {
      const text = await analyzeRelationship(selectedCards as TarotCard[], userProblem, appMode, consultant);
      setResultText(text);
    } catch (e) {
      setResultText("Астрал недоступен.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!resultText || isGeneratingVoice) return;
    setIsGeneratingVoice(true);
    const cleanText = resultText.replace(/[#*]/g, ''); 
    const url = await speakText(cleanText, consultant, appMode as any); 
    if (url) setAudioUrl(url);
    setIsGeneratingVoice(false);
  };

  // --- РЕНДЕР ---
  const renderCardMedia = (card: TarotCard | null) => {
    if (!card) {
       if (mode === 'RANDOM') return <img src={ASSETS.img_cardback} className="w-full h-full object-cover rounded-lg" />;
       return <div className="w-full h-full bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[10px] text-gray-500 text-center p-1">Карта</div>;
    }
    return <img src={card.imageUrl} className="w-full h-full object-cover rounded-lg" />;
  };

  const CardSlot = ({ index, label, className }: { index: number, label: string, className?: string }) => (
    <div className={`flex flex-col gap-2 ${className || ''}`}>
      <span className="text-[9px] text-center text-[#D4AF37] uppercase tracking-wider h-4 flex items-center justify-center font-bold">{label}</span>
      {mode === 'RANDOM' ? (
        <div className="aspect-[2/3] rounded-lg relative w-full shadow-lg">
           {renderCardMedia(selectedCards[index])}
           <div className="absolute bottom-0 w-full bg-black/80 text-center text-[8px] p-1 rounded-b-lg text-[#D4AF37]">
             {selectedCards[index]?.name || "..."}
           </div>
        </div>
      ) : (
        <select 
          onChange={(e) => {
             const selected = cards.find(c => c.id === e.target.value) || null;
             const newCards = [...selectedCards];
             newCards[index] = selected;
             setSelectedCards(newCards);
          }} 
          className="w-full h-full min-h-[100px] bg-[#111] border border-[#333] text-xs text-gray-300 rounded"
          value={selectedCards[index]?.id || ""}
        >
          <option value="">...</option>
          {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
    </div>
  );

  const renderLayout = () => {
    if (appMode === 'BLITZ') return <div className="w-32 mx-auto"><CardSlot index={0} label="Ответ" /></div>;
    if (appMode === 'RELATIONSHIPS') return <div className="flex justify-center gap-4"><div className="w-28"><CardSlot index={0} label="ОН" /></div><div className="w-28"><CardSlot index={1} label="ОНА" /></div></div>;
    if (appMode === 'FATE') return <div className="flex justify-center gap-2"><div className="w-24"><CardSlot index={0} label="Сит." /></div><div className="w-24"><CardSlot index={1} label="Акт." /></div><div className="w-24"><CardSlot index={2} label="Итог" /></div></div>;
    if (appMode === 'FINANCE') return <div className="grid grid-cols-2 gap-4 px-8 max-w-sm mx-auto"><CardSlot index={0} label="Актив" /><CardSlot index={1} label="Поток" /><CardSlot index={2} label="План" /><CardSlot index={3} label="Реал." /></div>;
    if (appMode === 'CROSS') return (
        <div className="relative w-full max-w-[300px] h-[350px] mx-auto">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20"><CardSlot index={3} label="Явное" /></div>
            <div className="absolute top-[110px] w-full flex justify-between px-2">
                <div className="w-20"><CardSlot index={1} label="Причина" /></div>
                <div className="w-20 -mt-2 z-10 scale-110"><CardSlot index={0} label="Суть" /></div>
                <div className="w-20"><CardSlot index={2} label="Итог" /></div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20"><CardSlot index={4} label="Скрытое" /></div>
        </div>
    );
  };

  return (
    <div className="min-h-screen font-serif flex flex-col relative overflow-hidden text-[#E0E0E0] selection:bg-[#D4AF37] selection:text-black">
      
      {/* 1. ФОН ДВЕРИ */}
      {screen === 'DOOR' && (
        <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url('${ASSETS.img_hallway}')` }}>
           <div className="absolute inset-0 bg-black/70"></div>
        </div>
      )}

      {/* 2. ФОН ПРИХОЖЕЙ (Видео с логикой) */}
      {screen === 'HALLWAY' && (
        <div className="fixed inset-0 z-0">
          {/* Убрали autoPlay, управляем через ref */}
          <video 
            ref={videoHallwayRef}
            src={ASSETS.vid_partners} 
            loop muted playsInline 
            className="w-full h-full object-cover" 
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 transition-opacity duration-1000 ${hallwayPhase === 'FREEZE' ? 'opacity-80' : 'opacity-100'}`}></div>
          
          {/* Эффект старого кино / Стоп-кадр */}
          {hallwayPhase === 'FREEZE' && <div className="absolute inset-0 bg-sepia opacity-20 pointer-events-none"></div>}
        </div>
      )}

      {/* 3. ФОН КАБИНЕТА */}
      {screen === 'OFFICE' && (
        <div className="fixed inset-0 z-0">
           <video src={ASSETS.vid_table} autoPlay loop muted playsInline className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/50"></div>
        </div>
      )}

      {/* КОНТЕНТ */}
      <div className="relative z-10 flex-grow flex flex-col items-center min-h-screen">
        
        {/* === ЭКРАН 1: ДВЕРЬ === */}
        {screen === 'DOOR' && (
          <div className="w-full h-screen flex flex-col items-center justify-between py-8 px-6 animate-fade-in text-center">
             <div className="mt-6 flex flex-col gap-2">
                <h1 className="text-2xl md:text-4xl font-bold text-[#D4AF37] font-cinzel tracking-wider drop-shadow-lg">
                  НЕПРАВИЛЬНАЯ ПСИХОЛОГИЯ
                </h1>
                <p className="text-lg md:text-xl text-gray-300 font-cinzel uppercase tracking-[0.3em] border-t border-[#D4AF37]/30 pt-2 inline-block mx-auto">
                  PSY ТАРО
                </p>
             </div>

             <div className="flex flex-col items-center gap-8">
                <div onClick={enterDoor} className="group relative cursor-pointer w-40 h-40 md:w-56 md:h-56">
                   <div className="absolute inset-0 bg-[#FFD700] rounded-full blur-[40px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 animate-pulse"></div>
                   <img src={ASSETS.img_doorbell} alt="Звонок" className="w-full h-full object-cover rounded-full border-2 border-[#D4AF37]/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105 active:scale-95" />
                </div>
                <div onClick={enterDoor} className="text-sm md:text-base text-[#D4AF37] font-bold uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors border-b border-dashed border-[#D4AF37]/50 pb-1">
                  ЗВОНИТЬ НЕПРАВИЛЬНЫМ ПСИХОЛОГАМ
                </div>
                {/* Кнопка рекламного сценария */}
                <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#D4AF37]/30 bg-black/40 backdrop-blur-md text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                  <span>🔇</span> Озвучка (Вкл)
                </button>
             </div>

             <div className="w-full flex justify-center gap-6 md:gap-10 border-t border-[#333] pt-6 mt-4">
                <a href={LINKS.MASTER} className="text-[10px] text-gray-500 hover:text-[#D4AF37] uppercase tracking-widest">Мастер</a>
                <a href={LINKS.COMMUNITY} className="text-[10px] text-gray-500 hover:text-[#D4AF37] uppercase tracking-widest">Комьюнити</a>
                <a href={LINKS.PAYMENT} className="text-[10px] text-gray-500 hover:text-[#D4AF37] uppercase tracking-widest">Оплата</a>
                <a href={LINKS.SHARE} className="text-[10px] text-gray-500 hover:text-[#D4AF37] uppercase tracking-widest">Поделиться</a>
             </div>
          </div>
        )}

        {/* === ЭКРАН 2: ПРИХОЖАЯ (СЦЕНА) === */}
        {screen === 'HALLWAY' && (
          <div className="w-full h-screen flex flex-col justify-end pb-20 p-6">
             
             {/* Отладочная строка аудио */}
             {audioStubLabel && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded text-[#FFD700] text-xs animate-pulse whitespace-nowrap">
                   {audioStubLabel}
                </div>
             )}

             {/* Заголовок выбора (Появляется в конце) */}
             <div className={`absolute top-32 left-0 w-full text-center transition-opacity duration-1000 ${hallwayPhase === 'INTERACTIVE' ? 'opacity-100' : 'opacity-0'}`}>
               <h2 className="text-xl text-[#D4AF37] font-cinzel tracking-[0.2em] bg-black/30 backdrop-blur-sm inline-block px-6 py-2 rounded-full border border-white/5">
                 К КОМУ ЗАЙДЕМ?
               </h2>
             </div>

             {/* Кнопки (Последовательное появление) */}
             <div className="flex items-center justify-between w-full max-w-4xl mx-auto px-2">
                
                {/* Кнопка МЕССИР (Слева) */}
                <div className={`flex flex-col items-center gap-6 group cursor-pointer transition-all duration-1000 transform ${showMessireBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} onClick={() => enterAs('VIP')}>
                   <div className="p-4 border border-[#FFD700]/50 bg-black/60 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:bg-[#FFD700] transition-all">
                      <span className="text-[#FFD700] group-hover:text-black font-bold text-sm tracking-widest uppercase">Мессир</span>
                   </div>
                </div>

                {/* Кнопка МАРГО (Справа) */}
                <div className={`flex flex-col items-center gap-6 group cursor-pointer transition-all duration-1000 transform ${showMargoBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} onClick={() => enterAs('STANDARD')}>
                   <div className="p-4 border border-[#D4AF37]/50 bg-black/60 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:bg-[#D4AF37] transition-all">
                      <span className="text-[#D4AF37] group-hover:text-black font-bold text-sm tracking-widest uppercase">Марго</span>
                   </div>
                </div>

             </div>
             
             <button onClick={fullReset} className="absolute top-6 right-6 text-xs text-white/50 hover:text-white">✕</button>
          </div>
        )}

        {/* === ЭКРАН 3: КАБИНЕТ === */}
        {screen === 'OFFICE' && (
          <div className="w-full max-w-lg flex flex-col items-center p-4 animate-fade-in pb-20">
            <div className="w-full flex justify-between mb-4 bg-black/40 p-2 rounded backdrop-blur-md">
               <button onClick={() => setScreen('HALLWAY')} className="text-xs text-gray-300 hover:text-[#D4AF37]">← Назад</button>
               <span className="text-xs text-[#D4AF37] uppercase tracking-widest font-bold">{consultant} • {appMode}</span>
            </div>

            {step === 'INTAKE' && (
              <div className="w-full bg-[#050505]/80 backdrop-blur-md p-6 rounded-xl border border-[#D4AF37]/20 shadow-2xl">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                  {['BLITZ', 'RELATIONSHIPS', 'FATE', 'FINANCE', 'CROSS'].map(m => (
                    <button key={m} onClick={() => handleEnterOffice(m as AppMode)} className={`px-3 py-1 text-[9px] uppercase border rounded whitespace-nowrap ${appMode === m ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'border-[#333] text-gray-500'}`}>
                      {m === 'FATE' ? 'Судьба' : m === 'RELATIONSHIPS' ? 'Отношения' : m === 'CROSS' ? 'Крест' : m === 'FINANCE' ? 'Финансы' : 'Блиц'}
                    </button>
                  ))}
                </div>
                <textarea value={userProblem} onChange={(e) => setUserProblem(e.target.value)} placeholder="Ваш вопрос..." className="w-full h-24 bg-[#111] border border-[#333] rounded p-3 text-gray-300 text-sm focus:border-[#D4AF37] outline-none mb-4 font-sans"/>
                <div className="grid grid-cols-2 gap-2 mb-4">
                   <button onClick={() => setMode('RANDOM')} className={`p-2 border rounded text-[10px] uppercase ${mode === 'RANDOM' ? 'bg-[#333] border-gray-500 text-white' : 'border-[#222] text-gray-600'}`}>🎲 Рандом</button>
                   <button onClick={() => setMode('MANUAL')} className={`p-2 border rounded text-[10px] uppercase ${mode === 'MANUAL' ? 'bg-[#333] border-gray-500 text-white' : 'border-[#222] text-gray-600'}`}>🤲 Вручную</button>
                </div>
                <button onClick={handleStart} disabled={!userProblem.trim()} className="w-full py-3 bg-[#D4AF37] text-black font-bold uppercase tracking-widest rounded hover:bg-[#FFD700] shadow-lg">Начать Сеанс</button>
              </div>
            )}

            {step === 'SELECTION' && (
              <div className="w-full flex flex-col items-center gap-6">
                {renderLayout()}
                <button onClick={runDiagnosis} disabled={selectedCards.some(c => c === null)} className="w-full max-w-xs py-3 bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] uppercase tracking-widest font-bold rounded hover:bg-[#D4AF37] hover:text-black transition-all backdrop-blur-md">Вскрыть Карты</button>
              </div>
            )}

            {step === 'ANALYSIS' && (
              <div className="w-full bg-[#050505]/90 backdrop-blur-xl border border-[#D4AF37]/30 p-6 rounded-xl shadow-2xl">
                 {isLoading ? (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 border-2 border-t-[#D4AF37] border-r-[#D4AF37] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <span className="text-[#D4AF37] text-xs uppercase tracking-widest animate-pulse">Связь с астралом...</span>
                    </div>
                 ) : (
                    <>
                      <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-2">
                        {selectedCards.map((c, i) => <div key={i} className="w-10 flex-shrink-0 aspect-[2/3]"><img src={c?.imageUrl} className="rounded shadow-md" /></div>)}
                      </div>
                      <div className="mb-6">
                         {!audioUrl ? (
                           <button onClick={handleGenerateAudio} disabled={isGeneratingVoice} className="w-full py-3 border border-dashed border-[#555] text-[10px] tracking-widest text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] uppercase rounded transition-colors flex justify-center items-center gap-2">
                             {isGeneratingVoice ? 'Загрузка голоса...' : '🎙️ Озвучить ответ'}
                           </button>
                         ) : (
                           <div className="bg-[#D4AF37]/10 p-2 rounded border border-[#D4AF37]/20">
                             <audio controls src={audioUrl} className="w-full h-8 opacity-80" autoPlay />
                           </div>
                         )}
                      </div>
                      <div className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed pl-4 border-l-2 border-[#D4AF37]/50 mb-8 italic font-serif">
                        {resultText}
                      </div>
                      <button onClick={() => {setStep('INTAKE'); setResultText(''); setAudioUrl(null);}} className="w-full py-4 text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-white border-t border-[#333] hover:border-gray-600 transition-colors">
                        Задать новый вопрос
                      </button>
                    </>
                 )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
