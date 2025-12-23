import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas'; 
import { cards } from './data/tarotData';
import { TarotCard, AppMode } from './types';
import { analyzeRelationship } from './services/geminiService';
import { speakText } from './services/ttsService';

type IntroStep = 'HERO' | 'LAYOUT' | 'INPUT' | 'TRANSITION';
type ConsultantType = 'STANDARD' | 'VIP';
type Screen = 'HALLWAY' | 'OFFICE'; 

const ASSETS = {
  vid_partners: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/partners.mp4?v=3",
  vid_table: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/table.mp4?v=3",
  img_cardback: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/rubashka.png",
  img_favicon: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/favicon.png"
};

const LINKS = {
  MASTER: "https://t.me/marataitester",
  COMMUNITY: "https://t.me/otvety_mastera_astralhero_tarot",
  SHARE: "#"
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('HALLWAY');
  const [introStep, setIntroStep] = useState<IntroStep>('HERO');
  const [consultant, setConsultant] = useState<ConsultantType>('STANDARD');
  const [appMode, setAppMode] = useState<AppMode>('RELATIONSHIPS');
  const [userProblem, setUserProblem] = useState('');
  
  const [selectedCards, setSelectedCards] = useState<(TarotCard | null)[]>([null]);
  const [cardsRevealed, setCardsRevealed] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<'TABLE' | 'RESULT'>('TABLE');
  const [zoomedCard, setZoomedCard] = useState<TarotCard | null>(null); 
  const layoutRef = useRef<HTMLDivElement>(null); 
  
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) link.href = ASSETS.img_favicon;
    document.title = "Неправильная Психология";

    let metaApple = document.querySelector("meta[name='apple-mobile-web-app-capable']");
    if (!metaApple) {
      metaApple = document.createElement('meta');
      metaApple.setAttribute('name', "apple-mobile-web-app-capable");
      document.head.appendChild(metaApple);
    }
    metaApple.setAttribute('content', "yes");

    document.body.style.overscrollBehavior = "none";
    document.body.style.backgroundColor = "black";
  }, []);

  const handleCopyText = () => {
    const cardNames = selectedCards.map(c => c?.name).join(', ');
    const fullText = `🔮 Расклад: ${appMode}\n🃏 Карты: ${cardNames}\n\n${resultText}\n\n👉 Неправильная Психология`;
    navigator.clipboard.writeText(fullText);
    alert("Текст скопирован!");
  };

  // Новая функция: Скачать текст файлом
  const handleDownloadTextFile = () => {
    const cardNames = selectedCards.map(c => c?.name).join(', ');
    const fullText = `🔮 РАСКЛАД: ${appMode}\n🃏 КАРТЫ: ${cardNames}\n\n📝 ТОЛКОВАНИЕ:\n${resultText}\n\n👉 Неправильная Психология (https://astral-hero.vercel.app)`;
    
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `prediction_${new Date().toISOString().slice(0,10)}.txt`;
    link.href = url;
    link.click();
  };

  const handleDownloadImage = async () => {
    if (layoutRef.current) {
      try {
        const canvas = await html2canvas(layoutRef.current, { useCORS: true, backgroundColor: null, scale: 2 });
        const link = document.createElement('a');
        link.download = `tarot.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) { console.error(err); }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Tarot', text: 'Мой расклад', url: window.location.href }); } catch (e) {}
    } else handleCopyText();
  };

  const handleLayoutSelect = (selectedMode: AppMode) => {
    setAppMode(selectedMode);
    const countMap: Record<AppMode, number> = { 'BLITZ': 1, 'RELATIONSHIPS': 2, 'FATE': 3, 'FINANCE': 4, 'CROSS': 5 };
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    setSelectedCards(shuffled.slice(0, countMap[selectedMode]));
    setCardsRevealed(false);
    setAnalysisStep('TABLE');
    setIntroStep('INPUT');
  };

  const handleStartSession = () => {
    setIntroStep('TRANSITION');
    setTimeout(() => setScreen('OFFICE'), 1500); 
  };

  const handleRevealCards = () => setCardsRevealed(true);
  const handleGetInterpretation = () => runDiagnosis();

  const handleSecondOpinion = () => {
    const newConsultant = consultant === 'VIP' ? 'STANDARD' : 'VIP';
    setConsultant(newConsultant);
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
    } catch (e) { setResultText("Ошибка связи."); } finally { setIsLoading(false); }
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
    setIntroStep('HERO'); setScreen('HALLWAY'); setResultText(''); setUserProblem(''); setAudioUrl(null); setConsultant('STANDARD'); setAnalysisStep('TABLE'); setCardsRevealed(false);
  };

  const CardImage = ({ card }: { card: TarotCard | null }) => {
    if (!cardsRevealed) return <img src={ASSETS.img_cardback} className="w-full h-full object-cover rounded shadow-lg animate-pulse" alt="Cover" />;
    return (
      <div className="w-full h-full relative animate-flip-in cursor-zoom-in group" onClick={() => setZoomedCard(card)}>
        <img src={card?.imageUrl} className="w-full h-full object-cover rounded shadow-lg" alt={card?.name} crossOrigin="anonymous" />
      </div>
    );
  };

  const RenderLayout = () => {
    if (appMode === 'BLITZ') return <div className="w-48 max-w-[50%] aspect-[2/3] mx-auto"><CardImage card={selectedCards[0]} /></div>;
    if (appMode === 'RELATIONSHIPS') return <div className="flex justify-center gap-4 h-full items-center"><div className="w-[45%] max-w-[150px] aspect-[2/3]"><CardImage card={selectedCards[0]} /></div><div className="w-[45%] max-w-[150px] aspect-[2/3]"><CardImage card={selectedCards[1]} /></div></div>;
    if (appMode === 'FATE') return <div className="flex justify-center gap-2 h-full items-center"><div className="w-[32%] max-w-[110px] aspect-[2/3]"><CardImage card={selectedCards[0]} /></div><div className="w-[32%] max-w-[110px] aspect-[2/3]"><CardImage card={selectedCards[1]} /></div><div className="w-[32%] max-w-[110px] aspect-[2/3]"><CardImage card={selectedCards[2]} /></div></div>;
    if (appMode === 'FINANCE') return <div className="grid grid-cols-2 gap-3 max-w-[200px] mx-auto aspect-square items-center"><CardImage card={selectedCards[0]} /><CardImage card={selectedCards[1]} /><CardImage card={selectedCards[2]} /><CardImage card={selectedCards[3]} /></div>;
    if (appMode === 'CROSS') return <div className="relative w-full max-w-[220px] aspect-[3/4] mx-auto my-auto"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] z-20 shadow-2xl scale-110"><CardImage card={selectedCards[0]} /></div><div className="absolute top-1/2 left-0 -translate-y-1/2 w-[28%] opacity-90"><CardImage card={selectedCards[1]} /></div><div className="absolute top-1/2 right-0 -translate-y-1/2 w-[28%] opacity-90"><CardImage card={selectedCards[2]} /></div><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[28%] opacity-90"><CardImage card={selectedCards[3]} /></div><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[28%] opacity-90"><CardImage card={selectedCards[4]} /></div></div>;
    return null;
  };

  return (
    <div className="h-[100dvh] w-full font-serif flex flex-col relative overflow-hidden text-[#E0E0E0] selection:bg-[#D4AF37] selection:text-black">
      {zoomedCard && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-6 cursor-zoom-out" onClick={() => setZoomedCard(null)}><div className="relative max-w-lg w-full max-h-[85vh] aspect-[2/3] flex flex-col items-center"><img src={zoomedCard.imageUrl} className="w-full h-full object-contain rounded-lg" /><div className="mt-4 text-[#D4AF37] text-xl font-cinzel font-bold text-center">{zoomedCard.name}</div></div></div>}

      <div className={`fixed inset-0 z-0 transition-all duration-[1500ms] ${screen === 'HALLWAY' ? 'opacity-100' : 'opacity-0'} ${introStep === 'TRANSITION' ? 'scale-[2.5] blur-sm' : 'scale-100'}`}><video src={ASSETS.vid_partners} autoPlay loop muted playsInline className="w-full h-full object-cover" /><div className={`absolute inset-0 bg-black/40 transition-colors duration-1000 ${introStep === 'INPUT' ? 'bg-black/70' : ''}`}></div></div>
      <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${screen === 'OFFICE' ? 'opacity-100' : 'opacity-0'}`}><video src={ASSETS.vid_table} autoPlay loop muted playsInline className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/60"></div></div>

      {screen === 'HALLWAY' && (
        <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto">
          {introStep === 'HERO' && (
            <div className="flex-grow flex flex-col items-center justify-center gap-8 p-6">
               <div className="flex gap-4 md:gap-12 mt-auto"><button onClick={() => { setConsultant('VIP'); setIntroStep('LAYOUT'); }} className="px-6 py-4 border border-[#FFD700]/50 bg-black/60 backdrop-blur-md rounded-xl hover:bg-[#FFD700] hover:text-black transition-all flex flex-col items-center gap-1 group"><span className="text-xl">🦁</span><span className="text-[#FFD700] group-hover:text-black font-bold text-xs tracking-widest uppercase">МЕССИР</span></button><button onClick={() => { setConsultant('STANDARD'); setIntroStep('LAYOUT'); }} className="px-6 py-4 border border-[#D4AF37]/50 bg-black/60 backdrop-blur-md rounded-xl hover:bg-[#D4AF37] hover:text-black transition-all flex flex-col items-center gap-1 group"><span className="text-xl">🦊</span><span className="text-[#D4AF37] group-hover:text-black font-bold text-xs tracking-widest uppercase">МАРГО</span></button></div>
               <div className="text-center"><h1 className="text-3xl md:text-5xl font-bold text-[#D4AF37] font-cinzel tracking-widest">PSY TAROT</h1><p className="text-[10px] md:text-xs uppercase tracking-[0.4em] opacity-80 mt-1">Неправильная психология</p></div>
               <div className="mb-auto mt-8 flex flex-wrap justify-center gap-3"><a href={LINKS.MASTER} target="_blank" rel="noreferrer" className="px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-full text-[10px] text-[#D4AF37] uppercase tracking-widest font-bold">Связь с Мастером</a><a href={LINKS.COMMUNITY} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/5 border border-white/20 rounded-full text-[10px] text-gray-300 uppercase tracking-widest hover:text-white">Комьюнити</a></div>
            </div>
          )}
          {introStep === 'LAYOUT' && <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm z-50"><div className="w-full max-w-sm bg-[#111] border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col gap-3"><h2 className="text-center text-[#D4AF37] font-cinzel text-lg tracking-widest mb-4">ВЫБЕРИТЕ ПУТЬ</h2><button onClick={() => handleLayoutSelect('BLITZ')} className="btn-layout w-full py-3 bg-white/5 border border-white/10 hover:border-[#D4AF37] rounded flex justify-between px-4 items-center"><span className="text-xs uppercase font-bold text-gray-300">⚡ Блиц</span><span className="text-[9px] text-gray-500">1 карта</span></button><button onClick={() => handleLayoutSelect('RELATIONSHIPS')} className="btn-layout w-full py-3 bg-white/5 border border-white/10 hover:border-[#D4AF37] rounded flex justify-between px-4 items-center"><span className="text-xs uppercase font-bold text-gray-300">❤️ Отношения</span><span className="text-[9px] text-gray-500">2 карты</span></button><button onClick={() => handleLayoutSelect('FATE')} className="btn-layout w-full py-3 bg-white/5 border border-white/10 hover:border-[#D4AF37] rounded flex justify-between px-4 items-center"><span className="text-xs uppercase font-bold text-gray-300">🔮 Судьба</span><span className="text-[9px] text-gray-500">3 карты</span></button><button onClick={() => handleLayoutSelect('FINANCE')} className="btn-layout w-full py-3 bg-white/5 border border-white/10 hover:border-[#D4AF37] rounded flex justify-between px-4 items-center"><span className="text-xs uppercase font-bold text-gray-300">💸 Финансы</span><span className="text-[9px] bg-[#D4AF37] text-black px-1 rounded">PRO</span></button><button onClick={() => handleLayoutSelect('CROSS')} className="btn-layout w-full py-3 bg-white/5 border border-white/10 hover:border-[#D4AF37] rounded flex justify-between px-4 items-center"><span className="text-xs uppercase font-bold text-gray-300">✝️ Крест</span><span className="text-[9px] bg-[#D4AF37] text-black px-1 rounded">PRO</span></button><button onClick={() => setIntroStep('HERO')} className="mt-4 text-xs text-gray-500 text-center">Назад</button></div></div>}
          {introStep === 'INPUT' && <div className="absolute inset-0 flex flex-col pt-20 px-4 bg-black/90 backdrop-blur-md z-50 items-center"><div className="w-full max-w-md bg-[#111] border border-[#D4AF37]/30 p-6 rounded-xl relative"><div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-[9px] font-bold px-3 py-1 rounded uppercase tracking-widest">{consultant === 'VIP' ? 'Вопрос Мессиру' : 'Вопрос Марго'}</div><textarea value={userProblem} onChange={(e) => setUserProblem(e.target.value)} placeholder="Ваш вопрос..." autoFocus className="w-full h-32 bg-transparent border-b border-[#333] text-lg text-gray-200 focus:border-[#D4AF37] outline-none resize-none font-serif mb-6"/><button onClick={handleStartSession} disabled={!userProblem.trim()} className="w-full py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] rounded">Начать</button><button onClick={() => setIntroStep('LAYOUT')} className="w-full mt-4 text-xs text-gray-500">Отмена</button></div></div>}
        </div>
      )}

      {screen === 'OFFICE' && (
        <div className="relative z-10 w-full h-full flex flex-col overflow-hidden">
          <div className="w-full flex justify-between items-center px-4 py-2 bg-black/20 shrink-0 h-10"><button onClick={fullReset} className="text-[10px] text-gray-400 hover:text-[#D4AF37] uppercase tracking-widest flex items-center gap-2"><span>✕</span> Выход</button><div className="text-[9px] text-[#D4AF37]/60 uppercase tracking-widest">{appMode}</div></div>
          <div className="flex-1 flex flex-col min-h-0">
             <div className={`flex flex-col items-center justify-center transition-all duration-500 ${analysisStep === 'TABLE' ? 'flex-1' : 'h-[62%] min-h-[220px] shrink-0 border-b border-[#D4AF37]/20 bg-black/10'}`}><div ref={layoutRef} className="w-full h-full p-2 flex items-center justify-center overflow-hidden">{RenderLayout()}</div></div>
             <div className="shrink-0 w-full flex justify-center items-center py-2 bg-gradient-to-t from-black via-black/50 to-transparent z-20">
                {!cardsRevealed && analysisStep === 'TABLE' && <button onClick={handleRevealCards} className="px-6 py-3 bg-[#D4AF37] text-black font-bold uppercase tracking-widest rounded-full shadow-lg animate-pulse">Вскрыть</button>}
                {cardsRevealed && analysisStep === 'TABLE' && <button onClick={handleGetInterpretation} className={`px-6 py-3 font-bold uppercase tracking-widest rounded-full shadow-lg border border-white/20 ${consultant === 'VIP' ? 'bg-gradient-to-r from-[#FFD700] to-black text-[#FFD700]' : 'bg-gradient-to-r from-[#D4AF37] to-black text-[#D4AF37]'}`}>{consultant === 'VIP' ? 'Слово Мессира' : 'Мнение Марго'}</button>}
             </div>
             {analysisStep === 'RESULT' && (
                <div className="flex-1 flex flex-col bg-[#050505]/95 min-h-0 border-t border-[#333]">
                   
                   {/* ВЕРХНЯЯ ПАНЕЛЬ С КНОПКАМИ И ПЛЕЕРОМ */}
                   <div className="min-h-16 shrink-0 border-b border-[#333] flex flex-col justify-center px-4 bg-[#111] py-2 gap-2">
                      <div className="flex justify-between items-center w-full">
                         {/* Индикатор роли */}
                         <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${consultant === 'VIP' ? 'bg-[#FFD700]' : 'bg-[#D4AF37]'}`}></div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${consultant === 'VIP' ? 'text-[#FFD700]' : 'text-[#D4AF37]'}`}>
                              {consultant === 'VIP' ? 'МЕССИР' : 'МАРГО'}
                            </span>
                         </div>
                         {/* Инструменты */}
                         <div className="flex items-center gap-3">
                            <button onClick={handleDownloadImage} className="text-gray-400 p-1" title="Скриншот">📸</button>
                            <button onClick={handleDownloadTextFile} className="text-gray-400 p-1" title="Скачать текст">📥</button>
                            <button onClick={handleCopyText} className="text-gray-400 p-1" title="Копировать">📋</button>
                            <button onClick={handleShare} className="text-gray-400 p-1" title="Поделиться">🔗</button>
                         </div>
                      </div>

                      {/* ПЛЕЕР - БОЛЬШОЙ И ЗАМЕТНЫЙ */}
                      <div className="w-full">
                         {!audioUrl ? (
                           <button onClick={handleGenerateAudio} disabled={isGeneratingVoice} className={`w-full py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${consultant === 'VIP' ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40' : 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'}`}>
                             {isGeneratingVoice ? '⏳ Загрузка...' : `🎧 Голос ${consultant === 'VIP' ? 'Мессира' : 'Марго'}`}
                           </button>
                         ) : (
                           // СТАНДАРТНЫЙ ПЛЕЕР НА БЕЛОЙ ПОДЛОЖКЕ (ДЛЯ IOS)
                           <div className="w-full bg-white/10 rounded p-1 flex justify-center">
                              <audio controls playsInline src={audioUrl} className="w-full h-8" />
                           </div>
                         )}
                      </div>
                   </div>

                   {/* ТЕКСТ - КРУПНЫЙ ШРИФТ */}
                   <div className="flex-1 overflow-y-auto p-6 text-lg text-gray-300 leading-relaxed font-serif pb-20">
                      {isLoading ? (
                         <div className="flex flex-col items-center justify-center h-full gap-2"><div className="w-6 h-6 border-2 border-dashed border-[#D4AF37] rounded-full animate-spin"></div><span className="text-xs text-[#D4AF37]">Связь...</span></div>
                      ) : (
                         <>
                           <div className="whitespace-pre-wrap mb-6 pt-2">{resultText}</div>
                           <div className="pt-4 border-t border-[#333] text-center pb-8">
                              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">Другой взгляд</p>
                              <button onClick={handleSecondOpinion} className={`w-full py-3 border border-dashed rounded text-xs uppercase font-bold tracking-widest ${consultant === 'VIP' ? 'border-[#D4AF37]/30 text-[#D4AF37]' : 'border-[#FFD700]/30 text-[#FFD700]'}`}>{consultant === 'VIP' ? 'Спросить Марго' : 'Спросить Мессира'}</button>
                           </div>
                         </>
                      )}
                   </div>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
