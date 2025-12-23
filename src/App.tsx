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
  vid_partners: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/partners.mp4?v=2",
  vid_table: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/table.mp4?v=2",
  img_cardback: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/rubashka.png",
  img_favicon: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/favicon.png"
};

// ОБНОВЛЕННАЯ ССЫЛКА
const LINKS = {
  MASTER: "https://t.me/marataitester",
  COMMUNITY: "https://t.me/otvety_mastera_astralhero_tarot",
  SHARE: "#"
};

const App: React.FC = () => {
  // --- СОСТОЯНИЯ ---
  const [screen, setScreen] = useState<Screen>('HALLWAY');
  const [introStep, setIntroStep] = useState<IntroStep>('HERO');
  
  const [consultant, setConsultant] = useState<ConsultantType>('STANDARD');
  const [appMode, setAppMode] = useState<AppMode>('RELATIONSHIPS');
  const [userProblem, setUserProblem] = useState('');
  
  // Карты
  const [selectedCards, setSelectedCards] = useState<(TarotCard | null)[]>([null]);
  const [cardsRevealed, setCardsRevealed] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<'TABLE' | 'RESULT'>('TABLE');
  const [zoomedCard, setZoomedCard] = useState<TarotCard | null>(null); 
  const layoutRef = useRef<HTMLDivElement>(null); 
  
  // Результат
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // --- НАСТРОЙКИ ПОЛНОЭКРАННОГО РЕЖИМА (PWA) ---
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) link.href = ASSETS.img_favicon;
    document.title = "Неправильная Психология";

    // Мета-тег для режима приложения на iOS
    // (Работает, когда пользователь нажимает "На экран Домой")
    let metaApple = document.querySelector("meta[name='apple-mobile-web-app-capable']");
    if (!metaApple) {
      metaApple = document.createElement('meta');
      metaApple.setAttribute('name', "apple-mobile-web-app-capable");
      document.head.appendChild(metaApple);
    }
    metaApple.setAttribute('content', "yes");

    let metaStatus = document.querySelector("meta[name='apple-mobile-web-app-status-bar-style']");
    if (!metaStatus) {
      metaStatus = document.createElement('meta');
      metaStatus.setAttribute('name', "apple-mobile-web-app-status-bar-style");
      document.head.appendChild(metaStatus);
    }
    metaStatus.setAttribute('content', "black-translucent");

    // Блокировка "резинового" скролла
    document.body.style.overscrollBehavior = "none";
    document.body.style.backgroundColor = "black";
  }, []);

  // --- ФУНКЦИИ ---
  
  const handleCopyText = () => {
    const cardNames = selectedCards.map(c => c?.name).join(', ');
    const fullText = `🔮 Расклад: ${appMode}\n🃏 Карты: ${cardNames}\n\n${resultText}\n\n👉 Неправильная Психология`;
    navigator.clipboard.writeText(fullText);
    alert("Текст скопирован!");
  };

  const handleDownloadImage = async () => {
    if (layoutRef.current) {
      try {
        const canvas = await html2canvas(layoutRef.current, {
          useCORS: true, 
          backgroundColor: null, 
          scale: 2 
        });
        const link = document.createElement('a');
        link.download = `tarot-${appMode.toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Ошибка:", err);
        alert("Не удалось сохранить фото.");
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Мой расклад Tarot',
          text: `Мне выпало: ${selectedCards.map(c => c?.name).join(', ')}.`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      handleCopyText();
    }
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

  const handleGetInterpretation = () => {
    runDiagnosis();
  };

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
    setConsultant('STANDARD');
    setAnalysisStep('TABLE');
    setCardsRevealed(false);
  };

  // --- КОМПОНЕНТЫ КАРТ ---
  const CardImage = ({ card }: { card: TarotCard | null }) => {
    if (!cardsRevealed) return <img src={ASSETS.img_cardback} className="w-full h-full object-cover rounded shadow-lg animate-pulse" alt="Cover" />;
    return (
      <div className="w-full h-full relative animate-flip-in cursor-zoom-in group" onClick={() => setZoomedCard(card)}>
        <img src={card?.imageUrl} className="w-full h-full object-cover rounded shadow-lg transition-transform group-hover:scale-105" alt={card?.name} crossOrigin="anonymous" />
        <div className="absolute bottom-0 w-full bg-black/80 text-[8px] text-[#D4AF37] text-center py-1 truncate px-1">{card?.name}</div>
      </div>
    );
  };

  const RenderLayout = () => {
    if (appMode === 'BLITZ') {
      return <div className="w-48 max-w-[50%] aspect-
