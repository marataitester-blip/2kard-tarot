import React, { useState, useEffect } from 'react';
import { cards } from './data/tarotData';
import { TarotCard, AppMode } from './types';
import { analyzeRelationship } from './services/geminiService';
import { speakText } from './services/ttsService';

// Типы этапов входа (Step-by-Step)
type IntroStep = 'HERO' | 'LAYOUT' | 'INPUT' | 'TRANSITION';
type ConsultantType = 'STANDARD' | 'VIP';
type Screen = 'HALLWAY' | 'OFFICE'; 

const ASSETS = {
  vid_partners: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/partners.mp4",
  vid_table: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/table.mp4",
  img_cardback: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/rubashka.png",
  img_favicon: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/favicon.png"
};

const App: React.FC = () => {
  // Основные состояния
  const [screen, setScreen] = useState<Screen>('HALLWAY');
  const [introStep, setIntroStep] = useState<IntroStep>('HERO');
  
  // Данные сеанса
  const [consultant, setConsultant] = useState<ConsultantType>('STANDARD');
  const [appMode, setAppMode] = useState<AppMode>('RELATIONSHIPS');
  const [userProblem, setUserProblem] = useState('');
  
  // Логика расклада
  const [selectedCards, setSelectedCards] = useState<(TarotCard | null)[]>([null, null, null, null, null]);
  const [analysisStep, setAnalysisStep] = useState<'SELECTION' | 'ANALYSIS'>('SELECTION');
  const [mode, setMode] = useState<'RANDOM' | 'MANUAL'>('RANDOM');
  
  // Результаты
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) link.href = ASSETS.img_favicon;
    document.title = "Неправильная Психология";
  }, []);

  // --- ЛОГИКА ШАГОВ (STEP-BY-STEP) ---

  // Шаг 1: Выбор Героя -> Переход к Раскладам
  const handleHeroSelect = (type: ConsultantType) => {
    setConsultant(type);
    setIntroStep('LAYOUT');
  };

  // Шаг 2: Выбор Расклада -> Переход к Вводу
  const handleLayoutSelect = (selectedMode: AppMode) => {
    setAppMode(selectedMode);
    
    // Подготовка слотов для карт
    const countMap: Record<AppMode, number> = {
        'BLITZ': 1, 'RELATIONSHIPS': 2, 'FATE': 3, 'FINANCE': 4, 'CROSS': 5
    };
    setSelectedCards(new Array(countMap[selectedMode]).fill(null));
    
    setIntroStep('INPUT');
  };

  // Шаг 3: Ввод вопроса -> ZOOM -> Кабинет
  const handleStartSession = () => {
    // 1. Запускаем анимацию перехода (Zoom)
    setIntroStep('TRANSITION');
    
    // 2. Ждем окончания анимации и переключаем экран
    setTimeout(() => {
      setScreen('OFFICE');
      setAnalysisStep('SELECTION');
      // Если режим RANDOM, можно сразу раздать карты (опционально)
      // handleShuffle(); 
    }, 1500); // 1.5 секунды на зум
  };

  // Возврат назад (Сброс)
  const fullReset = () => {
    setIntroStep('HERO');
    setScreen('HALLWAY');
    setResultText('');
    setUserProblem('');
    setAudioUrl(null);
  };

  // --- ЛОГИКА КАБИНЕТА ---
  const handleShuffle = () => {
    const count = selectedCards.length;
    let newCards = new Array(count).fill(null);
    if (mode === 'RANDOM') {
      const shuffled = [...cards].sort(() => 0.5 - Math.random());
      newCards = shuffled.slice(0, count);
    }
    setSelectedCards(newCards);
  };

  const runDiagnosis = async () => {
    if (selectedCards.some(c => c === null)) return;
    setAnalysisStep('ANALYSIS');
    setIsLoading(true);
    setResultText(''); setAudioUrl(null);

    try {
      const text = await analyzeRelationship(selectedCards as TarotCard[], userProblem, appMode, consultant);
      setResultText(text);
    } catch (e) {
      setResultText("Астрал перегружен. Попробуйте позже.");
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

  // --- РЕНДЕР КАРТ ---
  const renderCardMedia = (card: TarotCard | null) => {
    if (!card) {
       if (mode === 'RANDOM') return <img src={ASSETS.img_cardback} className="w-full h-full object-cover rounded-lg" />;
       return <div className="w-full h-full bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[10px] text-gray-500 text-center p-1">?</div>;
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

  // --- UI КОМПОНЕНТЫ ---
  return (
    <div className="min-h-screen font-serif flex flex-col relative overflow-hidden text-[#E0E0E0] selection:bg-[#D4AF37] selection:text-black">
      
      {/* 1. ГЛОБАЛЬНЫЙ ФОН (HALLWAY) с эффектом ZOOM */}
      <div 
        className={`fixed inset-0 z-0 transition-all duration-[1500ms] ease-in-out
          ${screen === 'HALLWAY' ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          ${introStep === 'TRANSITION' ? 'scale-[2.5] blur-sm' : 'scale-100'} 
        `}
      >
         <video src={ASSETS.vid_partners} autoPlay loop muted playsInline className="w-full h-full object-cover" />
         <div className={`absolute inset-0 bg-black/40 transition-colors duration-1000 ${introStep === 'INPUT' ? 'bg-black/70' : ''}`}></div>
      </div>

      {/* 2. ФОН КАБИНЕТА (OFFICE) */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${screen === 'OFFICE' ? 'opacity-100' : 'opacity-0'}`}>
         {screen === 'OFFICE' && <video src={ASSETS.vid_table} autoPlay loop muted playsInline className="w-full h-full object-cover" />}
         <div className="absolute inset-0 bg-black/60"></div> 
      </div>

      {/* --- ИНТЕРФЕЙС (STEP-BY-STEP) --- */}
      <div className="relative z-10 flex-grow flex flex-col items-center min-h-screen w-full">
        
        {/* --- СЦЕНА 1: ПРИХОЖАЯ --- */}
        {screen === 'HALLWAY' && (
          <div className="w-full h-screen flex flex-col items-center justify-between py-10 px-6">
            
            {/* ШАГ 1: ВЫБОР ГЕРОЯ (НИЗ ЭКРАНА) */}
            {introStep === 'HERO' && (
              <div className="flex-grow flex flex-col justify-end w-full max-w-4xl pb-10 animate-fade-in">
                 <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-5xl font-bold text-[#D4AF37] font-cinzel drop-shadow-lg tracking-widest">
                      PSY TAROT
                    </h1>
                    <p className="text-xs uppercase tracking-[0.4em] opacity-70 mt-2">Неправильная психология</p>
                 </div>

                 <div className="flex items-center justify-between w-full">
                    {/* Кнопка Мессир */}
                    <div onClick={() => handleHeroSelect('VIP')} className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95">
                       <div className="px-6 py-4 border border-[#FFD700]/50 bg-black/60 backdrop-blur-md rounded-lg group-hover:bg-[#FFD700] transition-colors shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                          <span className="text-[#FFD700] group-hover:text-black font-bold text-xs tracking-widest uppercase">МЕССИР</span>
                       </div>
                    </div>
                    
                    {/* Кнопка Марго */}
                    <div onClick={() => handleHeroSelect('STANDARD')} className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95">
                       <div className="px-6 py-4 border border-[#D4AF37]/50 bg-black/60 backdrop-blur-md rounded-lg group-hover:bg-[#D4AF37] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                          <span className="text-[#D4AF37] group-hover:text-black font-bold text-xs tracking-widest uppercase">МАРГО</span>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* ШАГ 2: ВЫБОР РАСКЛАДА (СТЕКЛО ПО ЦЕНТРУ) */}
            {introStep === 'LAYOUT' && (
              <div className="absolute inset-0 flex items-center justify-center p-4 animate-fade-in">
                 <div className="w-full max-w-sm bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl flex flex-col gap-4">
                    <h2 className="text-center text-[#D4AF37] font-cinzel text-xl tracking-widest mb-4">
                      {consultant === 'VIP' ? 'ЧТО ВАС ТРЕВОЖИТ?' : 'О ЧЕМ ПОГОВОРИМ?'}
                    </h2>
                    
                    <button onClick={() => handleLayoutSelect('RELATIONSHIPS')} className="w-full py-4 bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37] rounded-lg transition-all text-sm uppercase tracking-widest font-bold text-gray-200">
                      ❤️ Отношения
                    </button>
                    <button onClick={() => handleLayoutSelect('FINANCE')} className="w-full py-4 bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37] rounded-lg transition-all text-sm uppercase tracking-widest font-bold text-gray-200">
                      💸 Финансы
                    </button>
                    <button onClick={() => handleLayoutSelect('FATE')} className="w-full py-4 bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37] rounded-lg transition-all text-sm uppercase tracking-widest font-bold text-gray-200">
                      🔮 Судьба (SAR)
                    </button>
                    
                    <button onClick={() => setIntroStep('HERO')} className="mt-4 text-xs text-gray-500 hover:text-white text-center">Назад</button>
                 </div>
              </div>
            )}

            {/* ШАГ 3: ВВОД ВОПРОСА (ВВЕРХУ ЭКРАНА) */}
            {introStep === 'INPUT' && (
              <div className="absolute inset-0 flex flex-col items-center pt-20 px-4 animate-fade-in bg-black/40 backdrop-blur-[2px]">
                 <div className="w-full max-w-md bg-[#050505]/80 border border-[#D4AF37]/30 p-6 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] uppercase text-[#D4AF37] tracking-widest font-bold">{appMode}</span>
                       <button onClick={() => setIntroStep('LAYOUT')} className="text-[10px] text-gray-500">Назад</button>
                    </div>
                    
                    <textarea 
                      value={userProblem} 
                      onChange={(e) => setUserProblem(e.target.value)} 
                      placeholder="Напишите ваш вопрос здесь..." 
                      autoFocus
                      className="w-full h-32 bg-transparent border-b border-[#333] text-lg text-gray-100 focus:border-[#D4AF37] outline-none resize-none font-serif placeholder-gray-600 mb-6"
                    />

                    <button 
                      onClick={handleStartSession} 
                      disabled={!userProblem.trim()} 
                      className="w-full py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] rounded hover:bg-[#FFD700] transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100"
                    >
                      Начать Сеанс
                    </button>
                 </div>
                 <p className="mt-4 text-center text-xs text-gray-400 opacity-60">
                   Нажмите, и мы перейдем в кабинет...
                 </p>
              </div>
            )}
          </div>
        )}

        {/* --- СЦЕНА 2: КАБИНЕТ (РЕЗУЛЬТАТ) --- */}
        {screen === 'OFFICE' && (
          <div className="w-full max-w-lg flex flex-col items-center p-4 animate-fade-in pb-20 pt-10">
            
            {/* Верхняя панель */}
            <div className="w-full flex justify-between items-center mb-6 px-2">
               <button onClick={fullReset} className="text-xs text-gray-400 hover:text-[#D4AF37] flex items-center gap-1">
                 <span>←</span> Выход
               </button>
               <div className="flex gap-2">
                 <button onClick={() => setMode('RANDOM')} className={`px-2 py-1 text-[9px] border rounded uppercase ${mode === 'RANDOM' ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'border-[#333] text-gray-500'}`}>Random</button>
                 <button onClick={() => setMode('MANUAL')} className={`px-2 py-1 text-[9px] border rounded uppercase ${mode === 'MANUAL' ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'border-[#333] text-gray-500'}`}>Manual</button>
               </div>
            </div>

            {/* ВЫБОР КАРТ */}
            {analysisStep === 'SELECTION' && (
              <div className="w-full flex flex-col items-center gap-8">
                {/* Расклад */}
                <div className="w-full scale-100 transition-all">
                  {renderLayout()}
                </div>
                
                {mode === 'RANDOM' && (
                   <button onClick={handleShuffle} className="text-[10px] uppercase text-gray-500 border-b border-dashed border-gray-600 hover:text-white">
                     Перетасовать карты
                   </button>
                )}

                <button 
                  onClick={runDiagnosis} 
                  disabled={selectedCards.some(c => c === null)} 
                  className="w-full max-w-xs py-4 border border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5 hover:bg-[#D4AF37] hover:text-black uppercase tracking-widest font-bold rounded transition-all backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                >
                   ВСКРЫТЬ КАРТЫ
                </button>
              </div>
            )}

            {/* АНАЛИЗ (РЕЗУЛЬТАТ) */}
            {analysisStep === 'ANALYSIS' && (
              <div className="w-full bg-[#050505]/80 backdrop-blur-xl border border-[#D4AF37]/30 p-6 rounded-xl shadow-2xl animate-fade-in">
                 {isLoading ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 border-2 border-t-[#D4AF37] border-r-[#D4AF37] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <span className="text-[#D4AF37] text-xs uppercase tracking-widest animate-pulse block">
                        {consultant === 'VIP' ? 'Мессир думает...' : 'Марго формулирует...'}
                      </span>
                    </div>
                 ) : (
                    <>
                      {/* Карты (миниатюры) */}
                      <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-2 border-b border-[#333]">
                        {selectedCards.map((c, i) => (
                           <div key={i} className="w-8 flex-shrink-0 aspect-[2/3] opacity-80 hover:opacity-100 transition-opacity">
                             <img src={c?.imageUrl} className="rounded" />
                           </div>
                        ))}
                      </div>

                      {/* Плеер */}
                      <div className="mb-6">
                         {!audioUrl ? (
                           <button onClick={handleGenerateAudio} disabled={isGeneratingVoice} className="w-full py-3 border border-dashed border-[#555] text-[10px] tracking-widest text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] uppercase rounded transition-colors flex justify-center items-center gap-2">
                             {isGeneratingVoice ? 'Загрузка...' : '🎙️ Озвучить ответ'}
                           </button>
                         ) : (
                           <div className="bg-[#D4AF37]/10 p-2 rounded border border-[#D4AF37]/20 flex flex-col gap-1">
                             <span className="text-[9px] text-[#D4AF37] uppercase px-2">Голос {consultant === 'VIP' ? 'Мессира' : 'Марго'}</span>
                             <audio controls src={audioUrl} className="w-full h-8 opacity-90" autoPlay />
                           </div>
                         )}
                      </div>

                      {/* Текст */}
                      <div className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed pl-4 border-l-2 border-[#D4AF37]/50 mb-8 italic font-serif">
                        {resultText}
                      </div>

                      <button onClick={() => {setAnalysisStep('SELECTION'); setResultText(''); setAudioUrl(null);}} className="w-full py-4 text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-white border-t border-[#333] hover:border-gray-600 transition-colors">
                        Разобрать еще одну ситуацию
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
