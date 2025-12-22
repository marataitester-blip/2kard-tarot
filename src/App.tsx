import React, { useState, useEffect } from 'react';
import { cards } from './data/tarotData';
import { TarotCard } from './types';
import { analyzeRelationship } from './services/geminiService';
import { speakText } from './services/ttsService';

type AppMode = 'RELATIONSHIPS' | 'FINANCE' | 'GENERAL';
type ConsultantType = 'STANDARD' | 'VIP';
type Screen = 'DOOR' | 'HALLWAY' | 'OFFICE'; 

// --- ССЫЛКИ НА АССЕТЫ (GITHUB CDN) ---
const ASSETS = {
  // Видео
  vid_partners: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/partners.mp4",
  vid_table: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/table.mp4",
  // Картинки
  img_hallway: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/hallway.jpg",
  img_doorbell: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/doorbell.jpg",
  img_cardback: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/rubashka.png",
  img_favicon: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/favicon.png"
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('DOOR');
  
  // Состояния логики
  const [step, setStep] = useState<'INTAKE' | 'SELECTION' | 'ANALYSIS'>('INTAKE');
  const [financeSubStep, setFinanceSubStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<'RANDOM' | 'MANUAL'>('RANDOM');
  const [appMode, setAppMode] = useState<AppMode>('RELATIONSHIPS');
  const [consultant, setConsultant] = useState<ConsultantType>('STANDARD');
  const [userProblem, setUserProblem] = useState('');
  
  // Карты
  const [card1, setCard1] = useState<TarotCard | null>(null);
  const [card2, setCard2] = useState<TarotCard | null>(null);
  const [card3, setCard3] = useState<TarotCard | null>(null);
  const [card4, setCard4] = useState<TarotCard | null>(null);
  
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // --- ЭФФЕКТЫ ---
  
  // Установка Favicon на лету
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = ASSETS.img_favicon;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = ASSETS.img_favicon;
      document.head.appendChild(newLink);
    }
    document.title = "Неправильная Психология";
  }, []);

  // --- ХЕЛПЕРЫ ---
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

  const renderCardMedia = (card: TarotCard | null) => {
    if (!card) {
       if (mode === 'RANDOM') {
         return <img src={ASSETS.img_cardback} className="w-full h-full object-cover rounded-lg shadow-2xl" alt="Рубашка" />;
       }
       return <div className="w-full h-full bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-xs text-gray-500 font-cinzel">Пусто</div>;
    }
    return <img src={card.imageUrl} className="w-full h-full object-cover rounded-lg shadow-2xl" alt={card.name} />;
  };

  const CardSlot = ({ card, position, label }: { card: TarotCard | null, position: number, label: string }) => (
    <div className="flex-1 flex flex-col gap-2 min-w-[90px] animate-fade-in">
      <span className="text-[10px] text-center text-[#D4AF37] uppercase tracking-wider h-6 flex items-center justify-center font-bold drop-shadow-md">{label}</span>
      {mode === 'RANDOM' ? (
        <div className={`aspect-[2/3] rounded-lg relative transition-all duration-700 transform hover:scale-105
          ${consultant === 'VIP' 
            ? 'shadow-[0_0_20px_rgba(255,215,0,0.2)]' 
            : 'shadow-[0_0_15px_rgba(212,175,55,0.15)]'
          }`}>
           {renderCardMedia(card)}
           <div className={`absolute bottom-0 w-full bg-black/90 text-center text-[9px] p-2 rounded-b-lg leading-tight transition-colors duration-500 font-cinzel tracking-wider
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
          className="w-full p-2 bg-[#050505]/80 border border-[#D4AF37]/30 text-xs text-[#E0E0E0] rounded focus:border-[#D4AF37] focus:outline-none backdrop-blur-md font-sans"
          value={card?.id || ""}
        >
          <option value="">Выбрать...</option>
          {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
    </div>
  );

  return (
    <div className="min-h-screen font-serif flex flex-col relative overflow-hidden text-[#E0E0E0] selection:bg-[#D4AF37] selection:text-black">
      
      {/* --- ГЛОБАЛЬНЫЙ ФОН (ВИДЕО/КАРТИНКИ) --- */}
      
      {/* 1. ВИДЕО ДВЕРИ (ПАРТНЕРЫ) */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${screen === 'DOOR' ? 'opacity-100' : 'opacity-0'}`}>
         {screen === 'DOOR' && (
           <video src={ASSETS.vid_partners} autoPlay loop muted playsInline className="w-full h-full object-cover" />
         )}
         <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80"></div>
      </div>

      {/* 2. ФОН ПРИХОЖЕЙ (ОБОИ) */}
      <div 
        className={`fixed inset-0 z-0 bg-center bg-cover transition-opacity duration-1000 ${screen === 'HALLWAY' ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundImage: `url('${ASSETS.img_hallway}')` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* 3. ВИДЕО КАБИНЕТА (СТОЛ) */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${screen === 'OFFICE' ? 'opacity-100' : 'opacity-0'}`}>
         {screen === 'OFFICE' && (
           <video src={ASSETS.vid_table} autoPlay loop muted playsInline className="w-full h-full object-cover" />
         )}
         {/* Затемнение стола, чтобы текст читался */}
         <div className="absolute inset-0 bg-black/30"></div> 
      </div>


      {/* --- КОНТЕНТ (Z-INDEX 10) --- */}
      <div className="relative z-10 flex-grow flex flex-col items-center p-4 min-h-screen">
        
        {/* === ЭКРАН 1: ДВЕРЬ === */}
        {screen === 'DOOR' && (
          <div className="flex-grow flex flex-col items-center justify-center text-center animate-fade-in gap-12 mt-20">
            
            {/* Логотип */}
            <div className="relative">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] via-[#FDB931] to-[#D4AF37] font-cinzel drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] tracking-wider">
                НЕПРАВИЛЬНАЯ<br/>ПСИХОЛОГИЯ
              </h1>
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-4 opacity-50"></div>
            </div>

            {/* Кнопка-Звонок */}
            <div className="group relative cursor-pointer" onClick={() => setScreen('HALLWAY')}>
               {/* Свечение за кнопкой */}
               <div className="absolute inset-0 bg-[#FFD700] rounded-full blur-[30px] opacity-0 group-hover:opacity-40 transition-opacity duration-700"></div>
               
               {/* Сама картинка звонка */}
               <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-[#D4AF37]/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105 group-hover:border-[#FFD700] relative z-10">
                 <img src={ASSETS.img_doorbell} alt="Войти" className="w-full h-full object-cover" />
               </div>

               <div className="mt-6 text-[#D4AF37] text-xs uppercase tracking-[0.4em] font-bold opacity-80 group-hover:opacity-100 transition-all">
                 Нажмите звонок
               </div>
            </div>
            
            <p className="absolute bottom-10 text-[10px] text-gray-400 uppercase tracking-widest opacity-50">
              Карты знают то, о чем молчат дипломы
            </p>
          </div>
        )}

        {/* === ЭКРАН 2: ПРИХОЖАЯ === */}
        {screen === 'HALLWAY' && (
          <div className="flex-grow flex flex-col items-center justify-center animate-fade-in w-full max-w-md">
             
             {/* Табличка с правилами */}
             <div className="w-full border border-[#D4AF37]/40 p-8 rounded-xl bg-[#0a0a0a]/90 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative">
              
              {/* Гвоздик */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-b from-[#333] to-[#111] border border-[#444] shadow-lg"></div>

              <h2 className="text-center text-xl text-[#D4AF37] font-cinzel mb-8 tracking-[0.2em] border-b border-[#D4AF37]/20 pb-4">
                ПРАВИЛА ДОМА
              </h2>
              
              <ul className="space-y-6 text-sm text-gray-300 font-sans leading-relaxed mb-8">
                <li className="flex gap-4 items-start">
                  <span className="text-[#D4AF37] font-bold font-cinzel text-lg">I.</span>
                  <span className="opacity-90">Не лгите картам. Они видят не то, что вы говорите, а то, что вы прячете.</span>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-[#D4AF37] font-bold font-cinzel text-lg">II.</span>
                  <span className="opacity-90">Мессир — это скальпель. Марго — это горькая таблетка. Выбирайте лечение сами.</span>
                </li>
              </ul>

              <div className="space-y-3">
                <p className="text-center text-[10px] text-[#D4AF37]/70 uppercase tracking-widest mb-4">Выберите дверь</p>
                
                <button onClick={() => handleEnterOffice('RELATIONSHIPS')} className="w-full py-4 border border-[#333] bg-gradient-to-r from-transparent via-[#222] to-transparent hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-gray-300 hover:text-[#D4AF37] rounded transition-all uppercase text-xs tracking-widest font-bold">
                  ❤️ Отношения (Драма)
                </button>
                <button onClick={() => handleEnterOffice('GENERAL')} className="w-full py-4 border border-[#333] bg-gradient-to-r from-transparent via-[#222] to-transparent hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-gray-300 hover:text-[#D4AF37] rounded transition-all uppercase text-xs tracking-widest font-bold">
                  🔮 Судьба (3 Карты)
                </button>
                <button onClick={() => handleEnterOffice('FINANCE')} className="w-full py-4 border border-[#333] bg-gradient-to-r from-transparent via-[#222] to-transparent hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-gray-300 hover:text-[#D4AF37] rounded transition-all uppercase text-xs tracking-widest font-bold">
                  💸 Финансы (Стратегия)
                </button>
              </div>
            </div>
            
            <button onClick={fullReset} className="mt-8 text-xs text-gray-400 hover:text-[#D4AF37] underline transition-colors tracking-widest">
              Вернуться к двери
            </button>
          </div>
        )}

        {/* === ЭКРАН 3: КАБИНЕТ === */}
        {screen === 'OFFICE' && (
          <div className="w-full max-w-lg flex flex-col items-center pb-10 animate-fade-in">
            <button onClick={() => setScreen('HALLWAY')} className="self-start mb-6 text-gray-400 hover:text-[#D4AF37] transition-colors text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
              ← Покинуть стол
            </button>

            <header className="mb-6 text-center">
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-[0.2em] uppercase font-cinzel drop-shadow-md transition-all duration-500
                ${consultant === 'VIP' 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFA500]' 
                  : 'text-[#D4AF37]'
                }`}>
                {appMode === 'RELATIONSHIPS' ? 'Аутопсия Любви' : appMode === 'FINANCE' ? 'Финансовый Разбор' : 'Линии Судьбы'}
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mt-2 transition-all duration-500">
                {consultant === 'VIP' ? 'Аудиенция у Мессира' : 'На приеме у Марго'}
              </p>
            </header>

            {/* ВВОД */}
            {step === 'INTAKE' && (
              <div className="w-full flex flex-col gap-6 bg-[#050505]/80 backdrop-blur-md p-6 rounded-xl border border-[#D4AF37]/20 shadow-2xl">
                <textarea 
                  value={userProblem}
                  onChange={(e) => setUserProblem(e.target.value)}
                  placeholder="Опишите ситуацию. Честно..."
                  className="w-full h-32 bg-black/40 border border-[#333] rounded-lg p-4 text-gray-300 focus:border-[#D4AF37] focus:outline-none resize-none placeholder-gray-500 font-sans text-sm"
                />
                
                {/* Выбор консультанта */}
                <div className="grid grid-cols-2 gap-4">
                  <div onClick={() => setConsultant('STANDARD')} className={`border rounded-lg p-4 cursor-pointer transition-all flex flex-col gap-1 relative group ${consultant === 'STANDARD' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#333] opacity-60 hover:opacity-100 hover:border-gray-500'}`}>
                    <div className="text-[#D4AF37] font-bold text-xs font-cinzel tracking-widest">МАРГО</div>
                    <div className="text-[10px] text-gray-400">Практик</div>
                  </div>
                  <div onClick={() => setConsultant('VIP')} className={`border rounded-lg p-4 cursor-pointer transition-all flex flex-col gap-1 relative overflow-hidden group ${consultant === 'VIP' ? 'border-[#FFD700] bg-gradient-to-br from-[#FFD700]/10 to-black' : 'border-[#333] opacity-60 hover:opacity-100 hover:border-gray-500'}`}>
                    <div className="absolute top-0 right-0 bg-[#FFD700] text-black text-[8px] font-bold px-2 py-0.5 rounded-bl shadow-lg">VIP</div>
                    <div className="text-[#FFD700] font-bold text-xs font-cinzel tracking-widest">МЕССИР</div>
                    <div className="text-[10px] text-gray-300">Наблюдатель</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setMode('RANDOM')} className={`p-3 border rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-2 transition-colors ${mode === 'RANDOM' ? 'border-gray-500 bg-gray-800 text-white' : 'border-[#333] text-gray-500 hover:text-gray-300'}`}>
                    🎲 Рандом
                  </button>
                  <button onClick={() => setMode('MANUAL')} className={`p-3 border rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-2 transition-colors ${mode === 'MANUAL' ? 'border-gray-500 bg-gray-800 text-white' : 'border-[#333] text-gray-500 hover:text-gray-300'}`}>
                    🤲 Вручную
                  </button>
                </div>

                <button onClick={handleStart} disabled={!userProblem.trim()} className={`w-full py-4 mt-2 font-bold uppercase tracking-[0.2em] rounded shadow-lg transition-all duration-500 ${consultant === 'VIP' ? 'bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFA500] text-black hover:shadow-[#FFD700]/30' : 'bg-[#D4AF37] text-black hover:bg-[#b5952f] hover:shadow-[#D4AF37]/30'} disabled:opacity-50 disabled:shadow-none`}>
                  Начать Сеанс
                </button>
              </div>
            )}

            {/* ВЫБОР КАРТ */}
            {step === 'SELECTION' && (
              <div className="w-full flex flex-col gap-8">
                {appMode === 'RELATIONSHIPS' && (
                  <div className="flex justify-center gap-4 px-2">
                    <CardSlot card={card1} position={1} label="ОН / Мысли" />
                    <CardSlot card={card2} position={2} label="ОНА / Чувства" />
                  </div>
                )}
                {appMode === 'GENERAL' && (
                  <div className="flex justify-center gap-3 px-1">
                    <CardSlot card={card1} position={1} label="Ситуация" />
                    <CardSlot card={card2} position={2} label="Действие" />
                    <CardSlot card={card3} position={3} label="Результат" />
                  </div>
                )}
                {appMode === 'FINANCE' && (
                  <>
                    {financeSubStep === 1 ? (
                      <div className="flex justify-center gap-4 px-2">
                        <CardSlot card={card1} position={1} label="АКТИВ" />
                        <CardSlot card={card2} position={2} label="ПОТОК" />
                      </div>
                    ) : (
                      <div className="flex justify-center gap-4 px-2">
                        <CardSlot card={card3} position={3} label="ПЛАН" />
                        <CardSlot card={card4} position={4} label="РЕАЛЬНОСТЬ" />
                      </div>
                    )}
                  </>
                )}
                
                {appMode === 'FINANCE' && financeSubStep === 1 ? (
                   <button onClick={() => setFinanceSubStep(2)} disabled={!card1 || !card2} className="w-full py-3 mt-4 bg-black/60 text-white border border-[#444] rounded hover:border-[#D4AF37] transition-colors backdrop-blur-md uppercase text-xs tracking-widest">
                      Далее: Стратегия ▼
                   </button>
                ) : appMode === 'FINANCE' && financeSubStep === 2 ? (
                   <div className="flex gap-4 mt-4">
                      <button onClick={() => setFinanceSubStep(1)} className="px-4 py-3 bg-black/60 border border-[#333] rounded text-gray-400 hover:text-white backdrop-blur-md">◀</button>
                      <button onClick={() => runDiagnosis()} disabled={!card3 || !card4} className={`flex-1 py-3 border font-bold uppercase tracking-widest rounded hover:bg-opacity-10 transition-all backdrop-blur-md ${consultant === 'VIP' ? 'border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]' : 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]'}`}>
                        Анализ
                      </button>
                   </div>
                ) : (
                   <button onClick={() => runDiagnosis()} disabled={appMode === 'GENERAL' ? (!card1 || !card2 || !card3) : (!card1 || !card2)} className={`w-full py-4 mt-4 border font-bold uppercase tracking-widest rounded transition-all hover:bg-opacity-10 backdrop-blur-md ${consultant === 'VIP' ? 'border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]' : 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]'}`}>
                      {appMode === 'GENERAL' ? 'Раскрыть Судьбу' : 'Узнать Истину'}
                   </button>
                )}
              </div>
            )}

            {/* РЕЗУЛЬТАТ */}
            {step === 'ANALYSIS' && (
              <div className="w-full bg-[#050505]/90 backdrop-blur-xl border p-6 rounded-lg shadow-2xl relative transition-colors duration-500 border-[#D4AF37]/20">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className={`w-16 h-16 border-t-2 border-r-2 rounded-full animate-spin mx-auto mb-6 ${consultant === 'VIP' ? 'border-[#FFD700]' : 'border-[#D4AF37]'}`}></div>
                    <p className={`animate-pulse uppercase tracking-widest text-xs ${consultant === 'VIP' ? 'text-[#FFD700]' : 'text-[#D4AF37]'}`}>
                      {consultant === 'VIP' ? 'Мессир размышляет...' : 'Марго считает...'}
                    </p>
                  </div>
                ) : (
                  <>
                     <div className="mb-6 border-b border-[#222] pb-6 flex justify-center gap-2 overflow-x-auto">
                        {appMode === 'RELATIONSHIPS' && <><div className="w-16 aspect-[2/3]">{renderCardMedia(card1)}</div><div className="w-16 aspect-[2/3]">{renderCardMedia(card2)}</div></>}
                        {appMode === 'GENERAL' && <><div className="w-14 aspect-[2/3]">{renderCardMedia(card1)}</div><div className="w-14 aspect-[2/3]">{renderCardMedia(card2)}</div><div className="w-14 aspect-[2/3]">{renderCardMedia(card3)}</div></>}
                        {appMode === 'FINANCE' && <><div className="w-12 aspect-[2/3]">{renderCardMedia(card1)}</div><div className="w-12 aspect-[2/3]">{renderCardMedia(card2)}</div><div className="w-12 aspect-[2/3]">{renderCardMedia(card3)}</div><div className="w-12 aspect-[2/3]">{renderCardMedia(card4)}</div></>}
                     </div>

                     <div className="mb-6">
                        {!audioUrl ? (
                          <button onClick={handleGenerateAudio} disabled={isGeneratingVoice} className={`w-full py-3 rounded border border-dashed text-xs uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${isGeneratingVoice ? 'border-gray-700 text-gray-500 cursor-wait' : (consultant === 'VIP' ? 'border-[#FFD700]/50 text-[#FFD700] hover:bg-[#FFD700]/10' : 'border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10')}`}>
                             {isGeneratingVoice ? '✨ Магия голоса...' : '🎙️ Озвучить ответ'}
                          </button>
                        ) : (
                          <div className={`rounded-lg p-3 border animate-fade-in flex flex-col items-center gap-2 ${consultant === 'VIP' ? 'border-[#FFD700]/30 bg-[#FFD700]/5' : 'border-[#D4AF37]/30 bg-[#D4AF37]/5'}`}>
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-70">
                              <span>{consultant === 'VIP' ? '🦁 Голос Мессира' : '🦊 Голос Марго'}</span>
                            </div>
                            <audio controls src={audioUrl} className="w-full h-8 opacity-80 hover:opacity-100 transition-opacity" autoPlay />
                          </div>
                        )}
                     </div>

                     <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300 font-sans mb-8 pl-4 border-l-2 border-[#333] italic">
                        {resultText}
                     </div>
                     
                     <button onClick={reset} className="w-full py-4 text-xs uppercase tracking-[0.2em] text-gray-500 hover:text-white border-t border-[#333] hover:border-gray-600 transition-colors">
                        Новый Гость (Рестарт)
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
