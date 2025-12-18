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
    // Сбрасываем карты только при новом сеансе
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

  // Запуск анализа (принимает forcedConsultant для быстрого переключения)
  const runDiagnosis = async (forcedConsultant?: ConsultantType) => {
    setStep('ANALYSIS');
    setIsLoading(true);
    setResultText(''); // Очищаем старый текст перед загрузкой
    
    // Используем либо переданного (для кнопки "Второе мнение"), либо текущего консультанта
    const activeConsultant = forcedConsultant || consultant;

    try {
      // Собираем колоду
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

  // Кнопка "Второе мнение" (переключает консультанта на лету)
  const handleSecondOpinion = () => {
    const newConsultant = consultant === 'STANDARD' ? 'VIP' : 'STANDARD';
    setConsultant(newConsultant);
    runDiagnosis(newConsultant);
  };

  const handleSpeak = async () => {
    if (!resultText || isSpeaking) return;
    setIsSpeaking(true);
    
    // Убираем спецсимволы Markdown для озвучки
    const cleanText = resultText.replace(/[#*]/g, ''); 
    
    // Передаем параметры для выбора голоса (Nova или Onyx)
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

  // --- КОМПОНЕНТ СЛОТА КАРТЫ (DRY) ---
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
      
      {/* HEADER: Меняется в зависимости от персонажа */}
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
