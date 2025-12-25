import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { cards } from './data/tarotData';
import { TarotCard, AppMode } from './types';
import { analyzeRelationship } from './services/geminiService';
import { speakText } from './services/ttsService';

// --- ТИПЫ ---
type IntroStep = 'HERO' | 'LAYOUT' | 'INPUT' | 'TRANSITION';
type ConsultantType = 'STANDARD' | 'VIP';
type Screen = 'HALLWAY' | 'OFFICE';

// --- КОНСТАНТЫ И ССЫЛКИ ---
const ASSETS = {
  vid_partners: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/partners.mp4?v=3",
  vid_table: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/table.mp4?v=3",
  // Новое видео для фона ввода (с быстрой CDN ссылкой):
  vid_input_bg: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot@main/mystic-loop..mp4", 
  img_cardback: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/rubashka.png",
  img_favicon: "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/favicon.png"
};

const LINKS = {
  MASTER: "https://t.me/marataitester",
  COMMUNITY: "https://t.me/otvety_mastera_astralhero_tarot",
  SHARE: "#"
};

const App: React.FC = () => {
  // --- СОСТОЯНИЯ (STATE) ---
  const [screen, setScreen] = useState<Screen>('HALLWAY');
  const [introStep, setIntroStep] = useState<IntroStep>('HERO');
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  const [consultant, setConsultant] = useState<ConsultantType>('STANDARD');
  const [appMode, setAppMode] = useState<AppMode>('RELATIONSHIPS');
  const [userProblem, setUserProblem] = useState('');

  // Карты и Стол
  const [selectedCards, setSelectedCards] = useState<(TarotCard | null)[]>([null]);
  const [cardsRevealed, setCardsRevealed] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<'TABLE' | 'RESULT'>('TABLE');
  const [zoomedCard, setZoomedCard] = useState<TarotCard | null>(null);
  const layoutRef = useRef<HTMLDivElement>(null);

  // Результат и Аудио
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- ЭФФЕКТЫ (НАСТРОЙКИ ПРИ ЗАГРУЗКЕ) ---
  useEffect(() => {
    // Установка фавиконки
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) link.href = ASSETS.img_favicon;
    document.title = "Неправильная Психология";

    // Настройка для iOS (Full Screen)
    let metaApple = document.querySelector("meta[name='apple-mobile-web-app-capable']");
    if (!metaApple) {
      metaApple = document.createElement('meta');
      metaApple.setAttribute('name', "apple-mobile-web-app-capable");
      document.head.appendChild(metaApple);
    }
    metaApple.setAttribute('content', "yes");

    // Блокировка резиновой прокрутки
    document.body.style.overscrollBehavior = "none";
    document.body.style.backgroundColor = "black";
  }, []);

  // Автовоспроизведение аудио при появлении URL
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [audioUrl]);

  // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

  // 1. Копирование текста
  const handleCopyText = () => {
    const cardNames = selectedCards.map(c => c?.name).join(', ');
    const fullText = `🔮 Расклад: ${appMode}\n🃏 Карты: ${cardNames}\n\n${resultText}\n\n👉 Неправильная Психология`;
    navigator.clipboard.writeText(fullText);
    alert("Текст скопирован!");
  };

  // 2. Скачивание текстового файла
  const handleDownloadTextFile = () => {
    const cardNames = selectedCards.map(c => c?.name).join(', ');
    const fullText = `🔮 РАСКЛАД: ${appMode}\n🃏 КАРТЫ: ${cardNames}\n\n📝 ТОЛКОВАНИЕ:\n${resultText}\n\n👉 Неправильная Психология (https://astral-hero.vercel.app)`;
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `prediction_${new Date().toISOString().slice(0, 10)}.txt`;
    link.href = url;
    link.click();
  };

  // 3. Скриншот (html2canvas)
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

  // 4. Поделиться (Native Share)
  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Tarot', text: 'Мой расклад', url: window.location.href }); } catch (e) { console.log(e); }
    } else handleCopyText();
  };

  // --- ЛОГИКА ИГРЫ ---

  // Выбор расклада и перемешивание карт
  const handleLayoutSelect = (selectedMode: AppMode) => {
    setAppMode(selectedMode);
    const countMap: Record<AppMode, number> = { 'BLITZ': 1, 'RELATIONSHIPS': 2, 'FATE': 3, 'FINANCE': 4, 'CROSS': 5 };
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    setSelectedCards(shuffled.slice(0, countMap[selectedMode]));
    setCardsRevealed(false);
    setAnalysisStep('TABLE');
    setIntroStep('INPUT');
  };

  // Начало сеанса (переход в кабинет)
  const handleStartSession = () => {
    setIntroStep('TRANSITION');
    setTimeout(() => setScreen('OFFICE'), 1500);
  };

  const handleRevealCards = () => setCardsRevealed(true);
  const handleGetInterpretation = () => runDiagnosis();

  // "Второе мнение" (смена консультанта)
  const handleSecondOpinion = () => {
    const newConsultant = consultant === 'VIP' ? 'STANDARD' : 'VIP';
    setConsultant(newConsultant);
    setTimeout(() => runDiagnosis(newConsultant), 100);
  };

  // Запуск анализа (Gemini)
  const runDiagnosis = async (forcedConsultant?: ConsultantType) => {
    const activeConsultant = forcedConsultant || consultant;
    setAnalysisStep('RESULT');
    setIsLoading(true);
    setResultText(''); setAudioUrl(null);
    try {
      const text = await analyzeRelationship(selectedCards as TarotCard[], userProblem, appMode, activeConsultant);
      setResultText(text);
    } catch (e) { console.error(e); setResultText("Ошибка связи. Попробуйте еще раз."); } finally { setIsLoading(false); }
  };

  // Генерация голоса (TTS)
  const handleGenerateAudio = async () => {
    if (!resultText || isGeneratingVoice) return;
    setIsGeneratingVoice(true);
    const cleanText = resultText.replace(/[#*]/g, '');
    const url = await speakText(cleanText, consultant, appMode as any);
    if (url) {
      setAudioUrl(url);
    }
    setIsGeneratingVoice(false);
  };

  // Полный сброс
  const fullReset = () => {
    setIntroStep('HERO'); setScreen('HALLWAY'); setResultText(''); setUserProblem(''); setAudioUrl(null); setConsultant('STANDARD'); setAnalysisStep('TABLE'); setCardsRevealed(false);
  };

  // --- КОМПОНЕНТЫ ОТРИСОВКИ ---

  const CardImage = ({ card }: { card: TarotCard | null }) => {
    if (!cardsRevealed) return <img src={ASSETS.img_cardback} className="w-full h-full object-contain rounded shadow-lg animate-pulse" alt="Cover" />;
    return (
      <div className="w-full h-full relative animate-flip-in cursor-zoom-in group" onClick={() => setZoomedCard(card)}>
        <img src={card?.imageUrl} className="
