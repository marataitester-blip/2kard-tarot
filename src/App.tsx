import React, { useState, useEffect } from 'react';
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

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('DOOR');
  const [consultant, setConsultant] = useState<ConsultantType>('STANDARD');
  const [appMode, setAppMode] = useState<AppMode>('RELATIONSHIPS');
  
  // Логика
  const [step, setStep] = useState<'INTAKE' | 'SELECTION' | 'ANALYSIS'>('INTAKE');
  const [mode, setMode] = useState<'RANDOM' | 'MANUAL'>('RANDOM');
  const [userProblem, setUserProblem] = useState('');
  
  // Карты (до 5)
  const [selectedCards, setSelectedCards] = useState<(TarotCard | null)[]>([null, null, null, null, null]);
  
  // Результат
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) link.href = ASSETS.img_favicon;
    document.title = "Неправильная Психология";
  }, []);

  // --- НАВИГАЦИЯ ---
  const enterAs = (type: ConsultantType) => {
    setConsultant(type);
    setScreen('HALLWAY');
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
      setResultText("Ошибка: Астральные каналы перегружены.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!resultText || isGeneratingVoice) return;
    setIsGeneratingVoice(true);
    const cleanText = resultText.replace(/[#*]/g, ''); 
    // ДОБАВИЛИ "as any", чтобы TypeScript не ругался на типы
    const url = await speakText(cleanText, consultant, appMode as any); 
    if (url) setAudioUrl(url);
    setIsGeneratingVoice(false);
  };

  const renderCardMedia = (card: TarotCard | null) => {
    if (!card) {
       if (mode === 'RANDOM') return <img src={ASSETS.img_cardback} className="w-full h-full object-cover rounded-lg" />;
       return <div className="w-full h-full bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[10px] text-gray-500 text-center p-1">Выбрать</div>;
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
      
      {screen === 'DOOR' && (
        <div className="fixed inset-0 z-0">
          <video src={ASSETS.vid_partners} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
        </div>
      )}
      {screen === 'HALLWAY' && (
        <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url('${ASSETS.img_hallway}')` }}>
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>
      )}
      {screen === 'OFFICE' && (
        <div className="fixed inset-0 z-0">
           <video src={ASSETS.vid_table} autoPlay loop muted playsInline className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/50"></div>
        </div>
      )}

      <div className="relative z-10 flex-grow flex flex-col items-center min-h-screen">
        
        {screen === 'DOOR' && (
          <div className="w-full h-screen flex flex-col justify-between p-6 animate-fade-in">
             <div className="mt-10 text-center">
                <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#D4AF37] font-cinzel drop-shadow-lg">
                  НЕПРАВИЛЬНАЯ<br/>ПСИХОЛОГИЯ
                </h1>
                <p className="text-xs tracking-[0.3em] mt-2 opacity-80 uppercase">Выберите своего проводника</p>
             </div>

             <div className="flex-grow flex items-center justify-between w-full max-w-4xl mx-auto px-4 mt-10">
                <div className="flex flex-col items-center gap-4 group">
                   <div className="w-[1px] h-20 bg-gradient-to-b from-transparent to-[#FFD700] opacity-50"></div>
                   <button onClick={() => enterAs('VIP')} className="px-6 py-3 border border-[#FFD700]/50 bg-black/60 backdrop-blur-md rounded-lg text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all uppercase text-xs tracking-widest font-bold shadow-[0_0_20px_rgba(255,215,0,0.2)]">МЕССИР (VIP)</button>
                   <p className="text-[10px] text-gray-400 max-w-[120px] text-center opacity-0 group-hover:opacity-100 transition-opacity">Глубокий анализ. Цинизм. Правда.</p>
                </div>
                <div className="flex flex-col items-center gap-4 group">
                   <div className="w-[1px] h-20 bg-gradient-to-b from-transparent to-[#D4AF37] opacity-50"></div>
                   <button onClick={() => enterAs('STANDARD')} className="px-6 py-3 border border-[#D4AF37]/50 bg-black/60 backdrop-blur-md rounded-lg text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all uppercase text-xs tracking-widest font-bold shadow-[0_0_20px_rgba(212,175,55,0.2)]">МАРГО</button>
                   <p className="text-[10px] text-gray-400 max-w-[120px] text-center opacity-0 group-hover:opacity-100 transition-opacity">Практический совет. Юмор. Поддержка.</p>
                </div>
             </div>

             <div className="flex justify-center gap-4 md:gap-8 pb-6 mt-10">
                {['МАСТЕР', 'КОМЬЮНИТИ', 'ОПЛАТА', 'ПОДЕЛИТЬСЯ'].map((item) => (
                  <button key={item} className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors border-b border-transparent hover:border-white/50 pb-1">{item}</button>
                ))}
             </div>
          </div>
        )}

        {screen === 'HALLWAY' && (
          <div className="flex-grow flex flex-col items-center justify-center animate-fade-in w-full max-w-md p-4">
             <div className="w-full bg-[#0a0a0a]/90 backdrop-blur-md border border-[#D4AF37]/30 p-6 rounded-xl shadow-2xl">
               <h2 className="text-center text-[#D4AF37] font-cinzel mb-6 tracking-widest border-b border-[#333] pb-4">{consultant === 'VIP' ? 'ПРИЕМНАЯ МЕССИРА' : 'ПРИЕМНАЯ МАРГО'}</h2>
               <div className="space-y-3">
                 <button onClick={() => handleEnterOffice('BLITZ')} className="w-full py-3 border border-[#333] hover:border-[#D4AF37] bg-white/5 text-gray-300 rounded uppercase text-xs tracking-widest font-bold text-left px-4">⚡ Блиц (1 карта)</button>
                 <button onClick={() => handleEnterOffice('RELATIONSHIPS')} className="w-full py-3 border border-[#333] hover:border-[#D4AF37] bg-white/5 text-gray-300 rounded uppercase text-xs tracking-widest font-bold text-left px-4">❤️ Отношения (2 карты)</button>
                 <button onClick={() => handleEnterOffice('FATE')} className="w-full py-3 border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] rounded uppercase text-xs tracking-widest font-bold text-left px-4 flex justify-between"><span>🔮 Судьба (SAR)</span><span className="bg-[#D4AF37] text-black px-1 text-[9px] rounded">PRO</span></button>
                 <button onClick={() => handleEnterOffice('FINANCE')} className="w-full py-3 border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] rounded uppercase text-xs tracking-widest font-bold text-left px-4 flex justify-between"><span>💸 Финансы</span><span className="bg-[#D4AF37] text-black px-1 text-[9px] rounded">PRO</span></button>
                 <button onClick={() => handleEnterOffice('CROSS')} className="w-full py-3 border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] rounded uppercase text-xs tracking-widest font-bold text-left px-4 flex justify-between"><span>✝️ Крест (5 карт)</span><span className="bg-[#D4AF37] text-black px-1 text-[9px] rounded">PRO</span></button>
               </div>
             </div>
             <button onClick={fullReset} className="mt-8 text-xs text-gray-400 hover:text-white underline">Назад</button>
          </div>
        )}

        {screen === 'OFFICE' && (
          <div className="w-full max-w-lg flex flex-col items-center p-4 animate-fade-in pb-20">
            <div className="w-full flex justify-between mb-4">
               <button onClick={() => setScreen('HALLWAY')} className="text-xs text-gray-400 hover:text-white">← Меню</button>
               <span className="text-xs text-[#D4AF37] uppercase tracking-widest font-bold">{appMode}</span>
            </div>

            {step === 'INTAKE' && (
              <div className="w-full bg-black/80 backdrop-blur-md p-6 rounded-xl border border-[#333]">
                <textarea value={userProblem} onChange={(e) => setUserProblem(e.target.value)} placeholder="Ваш вопрос..." className="w-full h-24 bg-[#111] border border-[#333] rounded p-3 text-gray-300 text-sm focus:border-[#D4AF37] outline-none mb-4"/>
                <div className="grid grid-cols-2 gap-2 mb-4">
                   <button onClick={() => setMode('RANDOM')} className={`p-2 border rounded text-[10px] uppercase ${mode === 'RANDOM' ? 'bg-[#333] border-gray-500' : 'border-[#222] text-gray-500'}`}>🎲 Рандом</button>
                   <button onClick={() => setMode('MANUAL')} className={`p-2 border rounded text-[10px] uppercase ${mode === 'MANUAL' ? 'bg-[#333] border-gray-500' : 'border-[#222] text-gray-500'}`}>🤲 Вручную</button>
                </div>
                <button onClick={handleStart} disabled={!userProblem.trim()} className="w-full py-3 bg-[#D4AF37] text-black font-bold uppercase tracking-widest rounded hover:bg-[#FFD700]">Начать</button>
              </div>
            )}

            {step === 'SELECTION' && (
              <div className="w-full flex flex-col items-center gap-6">
                {renderLayout()}
                <button onClick={runDiagnosis} disabled={selectedCards.some(c => c === null)} className="w-full max-w-xs py-3 bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] uppercase tracking-widest font-bold rounded hover:bg-[#D4AF37] hover:text-black transition-all">Вскрыть</button>
              </div>
            )}

            {step === 'ANALYSIS' && (
              <div className="w-full bg-black/90 backdrop-blur-xl border border-[#D4AF37]/30 p-6 rounded-xl">
                 {isLoading ? (
                    <div className="text-center py-10 text-[#D4AF37] animate-pulse">Анализ астрала...</div>
                 ) : (
                    <>
                      <div className="flex justify-center gap-2 mb-4 overflow-x-auto pb-2">
                        {selectedCards.map((c, i) => <div key={i} className="w-10 flex-shrink-0 aspect-[2/3]"><img src={c?.imageUrl} className="rounded" /></div>)}
                      </div>
                      <div className="mb-4">
                         {!audioUrl ? (
                           <button onClick={handleGenerateAudio} disabled={isGeneratingVoice} className="w-full py-2 border border-dashed border-[#555] text-xs text-gray-400 hover:text-white uppercase">🎙️ Озвучить</button>
                         ) : (
                           <audio controls src={audioUrl} className="w-full h-8" autoPlay />
                         )}
                      </div>
                      <div className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed pl-3 border-l border-[#D4AF37] mb-6">{resultText}</div>
                      <button onClick={() => {setStep('INTAKE'); setResultText(''); setAudioUrl(null);}} className="w-full py-3 text-xs uppercase text-gray-500 hover:text-white border-t border-[#333]">Новый вопрос</button>
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
