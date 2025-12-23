import React, { useState, useEffect, useRef } from 'react';
import { cards } from './data/tarotData';
import { TarotCard, AppMode } from './types';
import { analyzeRelationship } from './services/geminiService';
import { speakText } from './services/ttsService';

// Типы
type IntroStep = 'HERO' | 'LAYOUT' | 'INPUT' | 'TRANSITION';
type ConsultantType = 'STANDARD' | 'VIP';
type Screen = 'HALLWAY' | 'OFFICE'; 

const ASSETS = {
  vid_partners: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/partners.mp4",
  vid_table: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/table.mp4",
  img_cardback: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/rubashka.png",
  img_favicon: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/favicon.png"
};

const LINKS = {
  MASTER: "https://t.me/maratbikchurin",
  COMMUNITY: "#",
  SHARE: "#"
};

const App: React.FC = () => {
  // --- СОСТОЯНИЯ ---
  const [screen, setScreen] = useState<Screen>('HALLWAY');
  const [introStep, setIntroStep] = useState<IntroStep>('HERO');
  
  const [consultant, setConsultant] = useState<ConsultantType>('STANDARD');
  const [appMode, setAppMode] = useState<AppMode>('RELATIONSHIPS');
  const [userProblem, setUserProblem] = useState('');
  
  // Карты и Процесс
  const [selectedCards, setSelectedCards] = useState<(TarotCard | null)[]>([null]);
  const [cardsRevealed, setCardsRevealed] = useState(false); // Вскрыты ли карты
  const [analysisStep, setAnalysisStep] = useState<'TABLE' | 'RESULT'>('TABLE');
  
  // Результат
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Модалка оплаты
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) link.href = ASSETS.img_favicon;
    document.title = "Неправильная Психология";
  }, []);

  // --- ЛОГИКА ОПЛАТЫ (ЗАГЛУШКА) ---
  const checkAccess = (targetConsultant: ConsultantType, targetMode: AppMode): boolean => {
    // 1. Мессир: Бесплатно только Блиц (1 карта)
    if (targetConsultant === 'VIP') {
      if (targetMode === 'BLITZ') return true;
      return false; // Остальное платно
    }
    // 2. Марго: Бесплатно Блиц, Отношения, Судьба (1, 2, 3 карты)
    if (targetConsultant === 'STANDARD') {
      if (['BLITZ', 'RELATIONSHIPS', 'FATE'].includes(targetMode)) return true;
      return false; // Финансы и Крест платно
    }
    return true;
  };

  const handlePay = () => {
    // Здесь будет подключение платежки
    alert("Здесь будет переход к оплате (ЮКасса/Crypto). После оплаты доступ открывается.");
    setShowPaywall(false);
    // Временно пускаем (для теста)
    // runDiagnosis(true); 
  };

  // --- ЛОГИКА ШАГОВ ---

  // Шаг 1: Выбор Расклада (Сразу тасуем карты)
  const handleLayoutSelect = (selectedMode: AppMode) => {
    setAppMode(selectedMode);
    
    // Определяем количество карт
    const countMap: Record<AppMode, number> = {
        'BLITZ': 1, 'RELATIONSHIPS': 2, 'FATE': 3, 'FINANCE': 4, 'CROSS': 5
    };
    const count = countMap[selectedMode];
    
    // Сразу тасуем (Рандом)
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    setSelectedCards(shuffled.slice(0, count));
    
    // Сбрасываем состояния
    setCardsRevealed(false);
    setAnalysisStep('TABLE');
    
    setIntroStep('INPUT');
  };

  // Шаг 2: Старт сеанса
  const handleStartSession = () => {
    setIntroStep('TRANSITION');
    setTimeout(() => {
      setScreen('OFFICE');
    }, 1500); 
  };

  // Кнопка: Вскрыть карты
  const handleRevealCards = () => {
    setCardsRevealed(true);
  };

  // Кнопка: Получить трактовку
  const handleGetInterpretation = () => {
    // Проверка оплаты перед генерацией
    if (!checkAccess(consultant, appMode)) {
      setShowPaywall(true);
      return;
    }
    runDiagnosis();
  };

  // Логика "Второго мнения"
  const handleSecondOpinion = () => {
    const newConsultant = consultant === 'VIP' ? 'STANDARD' : 'VIP';
    
    // Проверяем доступ для НОВОГО консультанта
    if (!checkAccess(newConsultant, appMode)) {
      setConsultant(newConsultant); // Визуально переключаем, чтобы показать пэйволл для него
      setShowPaywall(true);
      return;
    }

    setConsultant(newConsultant);
    // Сразу запускаем анализ для нового консультанта на ТЕХ ЖЕ картах
    // Небольшая задержка для обновления стейта
    setTimeout(() => runDiagnosis(newConsultant), 100);
  };

  const runDiagnosis = async (forcedConsultant?: ConsultantType) => {
    const activeConsultant = forcedConsultant || consultant;
    setAnalysisStep('RESULT');
    setIsLoading(true);
    setResultText(''); setAudioUrl(null);

    try {
      const text = await analyzeRelationship(selectedCards as TarotCard[], userProblem, appMode, activeConsultant);
      setResultText(text);
    } catch (e) {
      setResultText("Сбой связи с астралом...");
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

  const fullReset = () => {
    setIntroStep('HERO');
    setScreen('HALLWAY');
    setResultText('');
    setUserProblem('');
    setAudioUrl(null);
    setConsultant('STANDARD'); // Сброс на Марго по умолчанию
  };

  // --- ОТРИСОВКА КАРТ (АДАПТИВНАЯ СЕТКА) ---
  
  const CardImage = ({ card, index }: { card: TarotCard | null, index: number }) => {
    // Если карты не вскрыты - показываем рубашку
    if (!cardsRevealed) {
      return <img src={ASSETS.img_cardback} className="w-full h-full object-cover rounded shadow-lg animate-pulse" alt="Cover" />;
    }
    // Если вскрыты - показываем карту
    return (
      <div className="w-full h-full relative animate-flip-in">
        <img src={card?.imageUrl} className="w-full h-full object-cover rounded shadow-lg" alt={card?.name} />
        <div className="absolute bottom-0 w-full bg-black/80 text-[8px] text-[#D4AF37] text-center py-1 truncate px-1">
          {card?.name}
        </div>
      </div>
    );
  };

  const RenderLayout = () => {
    // 1. БЛИЦ
    if (appMode === 'BLITZ') {
        return (
            <div className="w-48 aspect-[2/3] mx-auto">
               <CardImage card={selectedCards[0]} index={0} />
            </div>
        );
    }
    // 2. ОТНОШЕНИЯ
    if (appMode === 'RELATIONSHIPS') {
        return (
            <div className="flex justify-center gap-4 h-full items-center">
                <div className="w-[45%] max-w-[180px] aspect-[2/3]"><CardImage card={selectedCards[0]} index={0} /></div>
                <div className="w-[45%] max-w-[180px] aspect-[2/3]"><CardImage card={selectedCards[1]} index={1} /></div>
            </div>
        );
    }
    // 3. СУДЬБА
    if (appMode === 'FATE') {
        return (
            <div className="flex justify-center gap-2 h-full items-center">
                <div className="w-[32%] aspect-[2/3]"><CardImage card={selectedCards[0]} index={0} /></div>
                <div className="w-[32%] aspect-[2/3]"><CardImage card={selectedCards[1]} index={1} /></div>
                <div className="w-[32%] aspect-[2/3]"><CardImage card={selectedCards[2]} index={2} /></div>
            </div>
        );
    }
    // 4. ФИНАНСЫ (КВАДРАТ 2x2)
    if (appMode === 'FINANCE') {
        return (
            <div className="grid grid-cols-2 gap-4 max-w-[300px] mx-auto aspect-square">
                <CardImage card={selectedCards[0]} index={0} />
                <CardImage card={selectedCards[1]} index={1} />
                <CardImage card={selectedCards[2]} index={2} />
                <CardImage card={selectedCards[3]} index={3} />
            </div>
        );
    }
    // 5. КРЕСТ (ПОЛНЫЙ ВИД)
    if (appMode === 'CROSS') {
        return (
            <div className="relative w-full max-w-[320px] aspect-[3/4] mx-auto">
                {/* Центр */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] z-20 shadow-2xl scale-110">
                    <CardImage card={selectedCards[0]} index={0} />
                </div>
                {/* Слева */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[28%] opacity-90">
                    <CardImage card={selectedCards[1]} index={1} />
                </div>
                {/* Справа */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[28%] opacity-90">
                    <CardImage card={selectedCards[2]} index={2} />
                </div>
                {/* Верх */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[28%] opacity-90">
                    <CardImage card={selectedCards[3]} index={3} />
                </div>
                {/* Низ */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[28%] opacity-90">
                    <CardImage card={selectedCards[4]} index={4} />
                </div>
            </div>
        );
    }
  };

  // --- UI ---
  return (
    <div className="min-h-screen font-serif flex flex-col relative overflow-hidden text-[#E0E0E0] selection:bg-[#D4AF37] selection:text-black">
      
      {/* МОДАЛКА ОПЛАТЫ */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-fade-in">
           <div className="bg-[#111] border border-[#D4AF37] p-8 rounded-xl max-w-sm w-full text-center relative shadow-[0_0_50px_rgba(212,175,55,0.3)]">
              <button onClick={() => setShowPaywall(false)} className="absolute top-2 right-4 text-2xl text-gray-500 hover:text-white">×</button>
              <h3 className="text-xl text-[#D4AF37] font-cinzel font-bold mb-2">ДОСТУП ЗАКРЫТ</h3>
              <p className="text-gray-300 text-sm mb-6">
                {consultant === 'VIP' ? 'Мессир не дает советов бесплатно.' : 'Этот расклад требует глубокого погружения.'}
                <br/>Оплатите доступ, чтобы узнать истину.
              </p>
              <button onClick={handlePay} className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold uppercase tracking-widest rounded hover:shadow-lg transition-transform active:scale-95">
                Оплатить (Заглушка)
              </button>
           </div>
        </div>
      )}

      {/* ФОНЫ */}
      <div 
        className={`fixed inset-0 z-0 transition-all duration-[1500ms] ease-in-out
          ${screen === 'HALLWAY' ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          ${introStep === 'TRANSITION' ? 'scale-[2.5] blur-sm' : 'scale-100'} 
        `}
      >
         <video src={ASSETS.vid_partners} autoPlay loop muted playsInline className="w-full h-full object-cover" />
         <div className={`absolute inset-0 bg-black/40 transition-colors duration-1000 ${introStep === 'INPUT' ? 'bg-black/70' : ''}`}></div>
      </div>

      <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${screen === 'OFFICE' ? 'opacity-100' : 'opacity-0'}`}>
         {screen === 'OFFICE' && <video src={ASSETS.vid_table} autoPlay loop muted playsInline className="w-full h-full object-cover" />}
         <div className="absolute inset-0 bg-black/60"></div> 
      </div>

      <div className="relative z-10 flex-grow flex flex-col items-center min-h-screen w-full">
        
        {/* --- СЦЕНА 1: ПРИХОЖАЯ --- */}
        {screen === 'HALLWAY' && (
          <div className="w-full h-screen flex flex-col justify-between py-6 px-4">
            
            {/* ШАГ 1: ВЫБОР ГЕРОЯ (Главный экран) */}
            {introStep === 'HERO' && (
              <>
                <div className="mt-10 text-center animate-fade-in">
                  <h1 className="text-4xl md:text-6xl font-bold text-[#D4AF37] font-cinzel drop-shadow-lg tracking-widest">PSY TAROT</h1>
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] opacity-80 mt-2">Неправильная психология</p>
                </div>
                
                <div className="flex-grow flex items-end justify-center pb-20 animate-fade-in">
                   <div className="flex gap-4 md:gap-12">
                      <button onClick={() => { setConsultant('VIP'); setIntroStep('LAYOUT'); }} className="px-6 py-4 border border-[#FFD700]/50 bg-black/60 backdrop-blur-md rounded-xl hover:bg-[#FFD700] hover:text-black transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] flex flex-col items-center gap-1 group">
                         <span className="text-lg font-bold">🦁</span>
                         <span className="text-[#FFD700] group-hover:text-black font-bold text-xs tracking-widest uppercase">МЕССИР</span>
                      </button>
                      <button onClick={() => { setConsultant('STANDARD'); setIntroStep('LAYOUT'); }} className="px-6 py-4 border border-[#D4AF37]/50 bg-black/60 backdrop-blur-md rounded-xl hover:bg-[#D4AF37] hover:text-black transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] flex flex-col items-center gap-1 group">
                         <span className="text-lg font-bold">🦊</span>
                         <span className="text-[#D4AF37] group-hover:text-black font-bold text-xs tracking-widest uppercase">МАРГО</span>
                      </button>
                   </div>
                </div>

                {/* ФУТЕР (Кнопки сервиса) */}
                <div className="absolute bottom-6 left-0 w-full flex justify-center gap-6 animate-fade-in">
                   <a href={LINKS.MASTER} target="_blank" rel="noreferrer" className="text-[10px] text-gray-400 hover:text-[#D4AF37] uppercase tracking-widest border-b border-transparent hover:border-[#D4AF37]">Мастер</a>
                   <a href={LINKS.COMMUNITY} className="text-[10px] text-gray-400 hover:text-[#D4AF37] uppercase tracking-widest border-b border-transparent hover:border-[#D4AF37]">Комьюнити</a>
                   <a href={LINKS.SHARE} className="text-[10px] text-gray-400 hover:text-[#D4AF37] uppercase tracking-widest border-b border-transparent hover:border-[#D4AF37]">Поделиться</a>
                   <button onClick={() => setShowPaywall(true)} className="text-[10px] text-gray-400 hover:text-[#D4AF37] uppercase tracking-widest border-b border-transparent hover:border-[#D4AF37]">Оплата</button>
                </div>
              </>
            )}

            {/* ШАГ 2: ВЫБОР РАСКЛАДА */}
            {introStep === 'LAYOUT' && (
              <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                 <div className="w-full max-w-sm bg-[#0a0a0a]/90 border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col gap-3">
                    <h2 className="text-center text-[#D4AF37] font-cinzel text-lg tracking-widest mb-4">ВЫБЕРИТЕ ПУТЬ</h2>
                    
                    <button onClick={() => handleLayoutSelect('BLITZ')} className="w-full py-3 bg-white/5 border border-white/10 hover:border-[#D4AF37] rounded flex justify-between px-4 items-center group">
                      <span className="text-gray-300 text-xs uppercase font-bold tracking-widest group-hover:text-[#D4AF37]">⚡ Блиц</span>
                      <span className="text-[9px] bg-[#333] px-2 py-0.5 rounded text-gray-400">1 карта</span>
                    </button>
                    <button onClick={() => handleLayoutSelect('RELATIONSHIPS')} className="w-full py-3 bg-white/5 border border-white/10 hover:border-[#D4AF37] rounded flex justify-between px-4 items-center group">
                      <span className="text-gray-300 text-xs uppercase font-bold tracking-widest group-hover:text-[#D4AF37]">❤️ Отношения</span>
                      <span className="text-[9px] bg-[#333] px-2 py-0.5 rounded text-gray-400">2 карты</span>
                    </button>
                    <button onClick={() => handleLayoutSelect('FATE')} className="w-full py-3 bg-white/5 border border-white/10 hover:border-[#D4AF37] rounded flex justify-between px-4 items-center group">
                      <span className="text-gray-300 text-xs uppercase font-bold tracking-widest group-hover:text-[#D4AF37]">🔮 Судьба</span>
                      <span className="text-[9px] bg-[#333] px-2 py-0.5 rounded text-gray-400">3 карты</span>
                    </button>
                    <button onClick={() => handleLayoutSelect('FINANCE')} className="w-full py-3 bg-white/5 border border-white/10 hover:border-[#D4AF37] rounded flex justify-between px-4 items-center group">
                      <span className="text-gray-300 text-xs uppercase font-bold tracking-widest group-hover:text-[#D4AF37]">💸 Финансы</span>
                      <span className="text-[9px] bg-[#D4AF37] text-black px-2 py-0.5 rounded font-bold">PRO</span>
                    </button>
                    <button onClick={() => handleLayoutSelect('CROSS')} className="w-full py-3 bg-white/5 border border-white/10 hover:border-[#D4AF37] rounded flex justify-between px-4 items-center group">
                      <span className="text-gray-300 text-xs uppercase font-bold tracking-widest group-hover:text-[#D4AF37]">✝️ Крест</span>
                      <span className="text-[9px] bg-[#D4AF37] text-black px-2 py-0.5 rounded font-bold">PRO</span>
                    </button>
                    
                    <button onClick={() => setIntroStep('HERO')} className="mt-4 text-xs text-gray-500 hover:text-white">← Назад</button>
                 </div>
              </div>
            )}

            {/* ШАГ 3: ВВОД ВОПРОСА */}
            {introStep === 'INPUT' && (
              <div className="absolute inset-0 flex flex-col pt-20 px-4 bg-black/70 backdrop-blur-md animate-fade-in items-center">
                 <div className="w-full max-w-md bg-[#050505] border border-[#D4AF37]/30 p-6 rounded-xl shadow-2xl relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-[9px] font-bold px-3 py-1 rounded uppercase tracking-widest">
                       {consultant === 'VIP' ? 'Вопрос Мессиру' : 'Вопрос Марго'}
                    </div>
                    
                    <textarea 
                      value={userProblem} 
                      onChange={(e) => setUserProblem(e.target.value)} 
                      placeholder={consultant === 'VIP' ? "Излагайте суть..." : "Что случилось?"}
                      autoFocus
                      className="w-full h-32 bg-transparent border-b border-[#333] text-lg text-gray-200 focus:border-[#D4AF37] outline-none resize-none font-serif placeholder-gray-600 mb-6"
                    />

                    <button 
                      onClick={handleStartSession} 
                      disabled={!userProblem.trim()} 
                      className="w-full py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] rounded hover:bg-[#FFD700] transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg"
                    >
                      Начать Сеанс
                    </button>
                    <button onClick={() => setIntroStep('LAYOUT')} className="w-full mt-4 text-xs text-gray-500 hover:text-white">Отмена</button>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* --- СЦЕНА 2: КАБИНЕТ --- */}
        {screen === 'OFFICE' && (
          <div className="w-full h-screen flex flex-col p-4 animate-fade-in">
            
            {/* Верхняя панель (Меню) */}
            <div className="w-full flex justify-between items-center mb-4 z-20">
               <button onClick={fullReset} className="text-[10px] text-gray-400 hover:text-[#D4AF37] flex items-center gap-1 uppercase tracking-widest bg-black/40 px-3 py-1 rounded backdrop-blur-sm">
                 <span>✕</span> Выход
               </button>
               {/* Здесь можно добавить кнопку Меню Сервиса, если нужно */}
            </div>

            {/* ОСНОВНАЯ ЗОНА КОНТЕНТА */}
            <div className="flex-grow flex flex-col relative overflow-hidden">
               
               {/* 1. ЗОНА КАРТ (Фиксированная или Скролл) */}
               <div className={`transition-all duration-700 w-full flex flex-col items-center justify-center 
                 ${analysisStep === 'TABLE' ? 'flex-grow h-full' : 'h-[40vh] min-h-[250px] shrink-0'}`}>
                 
                 {/* Компонент Расклада */}
                 <div className="w-full h-full p-2 flex items-center justify-center">
                    {RenderLayout()}
                 </div>

                 {/* Кнопки управления (только если карты не вскрыты) */}
                 {analysisStep === 'TABLE' && !cardsRevealed && (
                    <div className="absolute bottom-10 z-30">
                       <button onClick={handleRevealCards} className="px-8 py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] rounded-full shadow-[0_0_30px_rgba(212,175,55,0.4)] animate-pulse hover:scale-105 transition-transform">
                          Вскрыть Карты
                       </button>
                    </div>
                 )}

                 {/* Кнопка Трактовки (если карты вскрыты, но нет текста) */}
                 {analysisStep === 'TABLE' && cardsRevealed && (
                    <div className="absolute bottom-10 z-30 animate-fade-in">
                       <button onClick={handleGetInterpretation} className={`px-8 py-4 font-bold uppercase tracking-[0.2em] rounded-full shadow-lg hover:scale-105 transition-transform backdrop-blur-md border border-white/20
                         ${consultant === 'VIP' ? 'bg-gradient-to-r from-[#FFD700]/80 to-black text-[#FFD700]' : 'bg-gradient-to-r from-[#D4AF37]/80 to-black text-[#D4AF37]'}`}>
                          {consultant === 'VIP' ? '📜 Откровение Мессира' : '🦊 Марго говорит'}
                       </button>
                    </div>
                 )}
               </div>

               {/* 2. ЗОНА ТЕКСТА (Появляется снизу) */}
               {analysisStep === 'RESULT' && (
                  <div className="flex-grow bg-[#050505]/90 backdrop-blur-xl border-t border-[#D4AF37]/30 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-slide-up">
                     
                     {/* Заголовок и Плеер */}
                     <div className="p-4 border-b border-[#333] flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${consultant === 'VIP' ? 'bg-[#FFD700]' : 'bg-[#D4AF37]'}`}></div>
                           <span className={`text-xs font-bold uppercase tracking-widest ${consultant === 'VIP' ? 'text-[#FFD700]' : 'text-[#D4AF37]'}`}>
                             {consultant === 'VIP' ? 'МЕССИР' : 'МАРГО'}
                           </span>
                        </div>
                        
                        {!audioUrl ? (
                           <button onClick={handleGenerateAudio} disabled={isGeneratingVoice} className="text-[10px] text-gray-400 hover:text-white uppercase tracking-wider flex items-center gap-1">
                             {isGeneratingVoice ? '⏳' : '🔊 Озвучить'}
                           </button>
                        ) : (
                           <audio controls src={audioUrl} className="h-6 w-24 opacity-70" autoPlay />
                        )}
                     </div>

                     {/* Текстовое поле (Скролл) */}
                     <div className="p-6 overflow-y-auto text-sm text-gray-300 leading-relaxed font-serif relative">
                        {isLoading ? (
                           <div className="flex flex-col items-center justify-center h-20 gap-2">
                              <div className="w-8 h-8 border-2 border-dashed border-[#D4AF37] rounded-full animate-spin"></div>
                              <span className="text-xs text-[#D4AF37] animate-pulse">Чтение знаков...</span>
                           </div>
                        ) : (
                           resultText
                        )}
                        
                        {/* КНОПКА "ВТОРОЕ МНЕНИЕ" */}
                        {!isLoading && resultText && (
                           <div className="mt-8 pt-6 border-t border-[#333] text-center">
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Хотите другой взгляд?</p>
                              <button onClick={handleSecondOpinion} className={`w-full py-3 border border-dashed rounded transition-colors text-xs uppercase font-bold tracking-widest flex items-center justify-center gap-2
                                 ${consultant === 'VIP' 
                                   ? 'border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10' // Если сейчас Мессир, кнопка Марго
                                   : 'border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10' // Если сейчас Марго, кнопка Мессир
                                 }`}>
                                 {consultant === 'VIP' ? '🦊 Спросить Марго' : '🦁 Мнение Мессира'}
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
