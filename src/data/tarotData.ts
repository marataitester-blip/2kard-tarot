import { TarotCard } from '../types';

// ДОБАВИЛ "@main" — это важно для мгновенного обновления картинок с GitHub!
const BASE_URL = "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot@main";

export const cardBackUrl = `${BASE_URL}/rubashka.png`; 

export const cards: TarotCard[] = [
  // =====================================================================
  // СТАРШИЕ АРКАНЫ (24 карты: 0-21 + Герой + Белая)
  // Имена файлов строго по твоему списку: 00_fool.png, 01_magician.png...
  // =====================================================================
  { id: 'major0', name: 'Шут (Дурак)', type: 'major', imageUrl: `${BASE_URL}/00_fool.png`, desc_general: 'Начало пути, свобода, хаос, риск, слепая вера.' },
  { id: 'major1', name: 'Маг', type: 'major', imageUrl: `${BASE_URL}/01_magician.png`, desc_general: 'Воля, мастерство, манипуляция, действие, "Я могу".' },
  { id: 'major2', name: 'Верховная Жрица', type: 'major', imageUrl: `${BASE_URL}/02_high_priestess.png`, desc_general: 'Интуиция, тайное знание, пассивность, молчание.' },
  { id: 'major3', name: 'Императрица', type: 'major', imageUrl: `${BASE_URL}/03_empress.png`, desc_general: 'Плодородие, женственность, природа, забота, изобилие.' },
  { id: 'major4', name: 'Император', type: 'major', imageUrl: `${BASE_URL}/04_emperor.png`, desc_general: 'Власть, структура, контроль, отец, порядок.' },
  { id: 'major5', name: 'Иерофант (Жрец)', type: 'major', imageUrl: `${BASE_URL}/05_hierophant.png`, desc_general: 'Традиции, обучение, мораль, брак, наставничество.' },
  { id: 'major6', name: 'Влюбленные', type: 'major', imageUrl: `${BASE_URL}/06_lovers.png`, desc_general: 'Выбор, партнерство, любовь, искушение, союз.' },
  { id: 'major7', name: 'Колесница', type: 'major', imageUrl: `${BASE_URL}/07_chariot.png`, desc_general: 'Движение, победа, контроль над эмоциями, амбиции.' },
  { id: 'major8', name: 'Справедливость', type: 'major', imageUrl: `${BASE_URL}/08_justice.png`, desc_general: 'Баланс, карма, закон, ответственность, холодный рассудок.' },
  { id: 'major9', name: 'Отшельник', type: 'major', imageUrl: `${BASE_URL}/09_hermit.png`, desc_general: 'Уединение, поиск истины, мудрость, самоанализ.' },
  { id: 'major10', name: 'Колесо Фортуны', type: 'major', imageUrl: `${BASE_URL}/10_wheel_of_fortune.png`, desc_general: 'Судьба, перемены, циклы, удача/неудача, карма.' },
  { id: 'major11', name: 'Сила', type: 'major', imageUrl: `${BASE_URL}/11_strength.png`, desc_general: 'Внутренняя сила, терпение, сострадание, укрощение инстинктов.' },
  { id: 'major12', name: 'Повешенный', type: 'major', imageUrl: `${BASE_URL}/12_hanged_man.png`, desc_general: 'Жертва, пауза, иной взгляд на мир, зависание.' },
  { id: 'major13', name: 'Смерть', type: 'major', imageUrl: `${BASE_URL}/13_death.png`, desc_general: 'Трансформация, конец старого, необратимые перемены.' },
  { id: 'major14', name: 'Умеренность', type: 'major', imageUrl: `${BASE_URL}/14_temperance.png`, desc_general: 'Баланс, исцеление, терпение, компромисс, алхимия.' },
  { id: 'major15', name: 'Дьявол', type: 'major', imageUrl: `${BASE_URL}/15_devil.png`, desc_general: 'Зависимость, тень, материализм, сексуальность, страхи.' },
  { id: 'major16', name: 'Башня', type: 'major', imageUrl: `${BASE_URL}/16_tower.png`, desc_general: 'Катастрофа, разрушение иллюзий, внезапные перемены.' },
  { id: 'major17', name: 'Звезда', type: 'major', imageUrl: `${BASE_URL}/17_star.png`, desc_general: 'Надежда, вдохновение, исцеление, вера в будущее.' },
  { id: 'major18', name: 'Луна', type: 'major', imageUrl: `${BASE_URL}/18_moon.png`, desc_general: 'Иллюзии, страхи, подсознание, обман, неясность.' },
  { id: 'major19', name: 'Солнце', type: 'major', imageUrl: `${BASE_URL}/19_sun.png`, desc_general: 'Радость, успех, ясность, энергия, оптимизм.' },
  { id: 'major20', name: 'Суд', type: 'major', imageUrl: `${BASE_URL}/20_judgement.png`, desc_general: 'Возрождение, призыв, кармический итог, пробуждение.' },
  { id: 'major21', name: 'Мир', type: 'major', imageUrl: `${BASE_URL}/21_world.png`, desc_general: 'Завершение цикла, гармония, целостность, триумф.' },
  
  // СПЕЦИАЛЬНЫЕ КАРТЫ (Твои уникальные файлы)
  { id: 'major22', name: 'ГЕРОЙ (Astra Hero)', type: 'major', imageUrl: `${BASE_URL}/22_hero.png`, desc_general: 'Преодоление, выход за рамки, ты сам творишь судьбу, новый уровень.' },
  { id: 'major23', name: 'Белая Карта', type: 'major', imageUrl: `${BASE_URL}/23_white_card.png`, desc_general: 'Неизвестность, высшие силы молчат, карт-бланш, тайна.' },

  // =====================================================================
  // ЖЕЗЛЫ (14 карт)
  // =====================================================================
  { id: 'wands01', name: 'Туз Жезлов', type: 'minor', imageUrl: `${BASE_URL}/wands_01_ace.png`, desc_general: 'Импульс, начало, вдохновение, страсть.' },
  { id: 'wands02', name: 'Двойка Жезлов', type: 'minor', imageUrl: `${BASE_URL}/wands_02_two.png`, desc_general: 'Планирование, выбор пути, оценка перспектив.' },
  { id: 'wands03', name: 'Тройка Жезлов', type: 'minor', imageUrl: `${BASE_URL}/wands_03_three.png`, desc_general: 'Расширение горизонтов, первый успех, ожидание.' },
  { id: 'wands04', name: 'Четверка Жезлов', type: 'minor', imageUrl: `${BASE_URL}/wands_04_four.png`, desc_general: 'Праздник, дом, стабильность, гармония.' },
  { id: 'wands05', name: 'Пятерка Жезлов', type: 'minor', imageUrl: `${BASE_URL}/wands_05_five.png`, desc_general: 'Конфликт, конкуренция, борьба, споры.' },
  { id: 'wands06', name: 'Шестерка Жезлов', type: 'minor', imageUrl: `${BASE_URL}/wands_06_six.png`, desc_general: 'Победа, триумф, признание, гордость.' },
  { id: 'wands07', name: 'Семерка Жезлов', type: 'minor', imageUrl: `${BASE_URL}/wands_07_seven.png`, desc_general: 'Защита, отстаивание позиции, стойкость.' },
  { id: 'wands08', name: 'Восьмерка Жезлов', type: 'minor', imageUrl: `${BASE_URL}/wands_08_eight.png`, desc_general: 'Скорость, новости, быстрое развитие событий.' },
  { id: 'wands09', name: 'Девятка Жезлов', type: 'minor', imageUrl: `${BASE_URL}/wands_09_nine.png`, desc_general: 'Усталость, оборона, подозрительность, опыт.' },
  { id: 'wands10', name: 'Десятка Жезлов', type: 'minor', imageUrl: `${BASE_URL}/wands_10_ten.png`, desc_general: 'Бремя, перегрузка, ответственность, тяжелый труд.' },
  { id: 'wands11', name: 'Паж Жезлов', type: 'minor', imageUrl: `${BASE_URL}/wands_11_page.png`, desc_general: 'Энтузиаст, вестник, любопытство, новая идея.' },
  { id: 'wands12', name: 'Рыцарь Жезлов', type: 'minor', imageUrl: `${BASE_URL}/wands_12_knight.png`, desc_general: 'Действие, страсть, приключение, импульсивность.' },
  { id: 'wands13', name: 'Королева Жезлов', type: 'minor', imageUrl: `${BASE_URL}/wands_13_queen.png`, desc_general: 'Харизма, уверенность, страсть, независимость.' },
  { id: 'wands14', name: 'Король Жезлов', type: 'minor', imageUrl: `${BASE_URL}/wands_14_king.png`, desc_general: 'Лидер, визионер, харизма, предприниматель.' },

  // =====================================================================
  // КУБКИ (14 карт)
  // =====================================================================
  { id: 'cups01', name: 'Туз Кубков', type: 'minor', imageUrl: `${BASE_URL}/cups_01_ace.png`, desc_general: 'Начало любви, переполнение чувствами, шанс.' },
  { id: 'cups02', name: 'Двойка Кубков', type: 'minor', imageUrl: `${BASE_URL}/cups_02_two.png`, desc_general: 'Партнерство, влечение, родство душ, встреча.' },
  { id: 'cups03', name: 'Тройка Кубков', type: 'minor', imageUrl: `${BASE_URL}/cups_03_three.png`, desc_general: 'Праздник, дружба, радость, веселье.' },
  { id: 'cups04', name: 'Четверка Кубков', type: 'minor', imageUrl: `${BASE_URL}/cups_04_four.png`, desc_general: 'Апатия, скука, пресыщение, упущенные шансы.' },
  { id: 'cups05', name: 'Пятерка Кубков', type: 'minor', imageUrl: `${BASE_URL}/cups_05_five.png`, desc_general: 'Потеря, горе, разочарование, слезы.' },
  { id: 'cups06', name: 'Шестерка Кубков', type: 'minor', imageUrl: `${BASE_URL}/cups_06_six.png`, desc_general: 'Ностальгия, прошлое, детство, старые связи.' },
  { id: 'cups07', name: 'Семерка Кубков', type: 'minor', imageUrl: `${BASE_URL}/cups_07_seven.png`, desc_general: 'Иллюзии, мечты, выбор из множества вариантов.' },
  { id: 'cups08', name: 'Восьмерка Кубков', type: 'minor', imageUrl: `${BASE_URL}/cups_08_eight.png`, desc_general: 'Уход, отказ от прошлого, поиск смысла.' },
  { id: 'cups09', name: 'Девятка Кубков', type: 'minor', imageUrl: `${BASE_URL}/cups_09_nine.png`, desc_general: 'Удовлетворение, исполнение желаний, комфорт.' },
  { id: 'cups10', name: 'Десятка Кубков', type: 'minor', imageUrl: `${BASE_URL}/cups_10_ten.png`, desc_general: 'Счастье в семье, гармония, идеальный брак.' },
  { id: 'cups11', name: 'Паж Кубков', type: 'minor', imageUrl: `${BASE_URL}/cups_11_page.png`, desc_general: 'Вестник любви, нежность, творчество.' },
  { id: 'cups12', name: 'Рыцарь Кубков', type: 'minor', imageUrl: `${BASE_URL}/cups_12_knight.png`, desc_general: 'Романтик, любовник, предложение, идеализм.' },
  { id: 'cups13', name: 'Королева Кубков', type: 'minor', imageUrl: `${BASE_URL}/cups_13_queen.png`, desc_general: 'Эмпатия, интуиция, забота, чувствительность.' },
  { id: 'cups14', name: 'Король Кубков', type: 'minor', imageUrl: `${BASE_URL}/cups_14_king.png`, desc_general: 'Эмоциональный баланс, дипломатия, мудрость.' },

  // =====================================================================
  // МЕЧИ (14 карт)
  // =====================================================================
  { id: 'swords01', name: 'Туз Мечей', type: 'minor', imageUrl: `${BASE_URL}/swords_01_ace.png`, desc_general: 'Ясность, новая идея, истина, прорыв.' },
  { id: 'swords02', name: 'Двойка Мечей', type: 'minor', imageUrl: `${BASE_URL}/swords_02_two.png`, desc_general: 'Тупик, закрытость, нежелание видеть правду.' },
  { id: 'swords03', name: 'Тройка Мечей', type: 'minor', imageUrl: `${BASE_URL}/swords_03_three.png`, desc_general: 'Разбитое сердце, горе, предательство, боль.' },
  { id: 'swords04', name: 'Четверка Мечей', type: 'minor', imageUrl: `${BASE_URL}/swords_04_four.png`, desc_general: 'Отдых, пауза, восстановление.' },
  { id: 'swords05', name: 'Пятерка Мечей', type: 'minor', imageUrl: `${BASE_URL}/swords_05_five.png`, desc_general: 'Пиррова победа, поражение, подлость, конфликт.' },
  { id: 'swords06', name: 'Шестерка Мечей', type: 'minor', imageUrl: `${BASE_URL}/swords_06_six.png`, desc_general: 'Переход, путешествие, уход к лучшему берегу.' },
  { id: 'swords07', name: 'Семерка Мечей', type: 'minor', imageUrl: `${BASE_URL}/swords_07_seven.png`, desc_general: 'Хитрость, обман, стратегия, скрытность.' },
  { id: 'swords08', name: 'Восьмерка Мечей', type: 'minor', imageUrl: `${BASE_URL}/swords_08_eight.png`, desc_general: 'Ограничения, страхи, ментальная тюрьма.' },
  { id: 'swords09', name: 'Девятка Мечей', type: 'minor', imageUrl: `${BASE_URL}/swords_09_nine.png`, desc_general: 'Кошмары, тревога, бессонница, чувство вины.' },
  { id: 'swords10', name: 'Десятка Мечей', type: 'minor', imageUrl: `${BASE_URL}/swords_10_ten.png`, desc_general: 'Конец, дно, предательство, завершение цикла.' },
  { id: 'swords11', name: 'Паж Мечей', type: 'minor', imageUrl: `${BASE_URL}/swords_11_page.png`, desc_general: 'Любопытство, шпионаж, сплетни, острый ум.' },
  { id: 'swords12', name: 'Рыцарь Мечей', type: 'minor', imageUrl: `${BASE_URL}/swords_12_knight.png`, desc_general: 'Агрессия, скорость, прямолинейность, конфликт.' },
  { id: 'swords13', name: 'Королева Мечей', type: 'minor', imageUrl: `${BASE_URL}/swords_13_queen.png`, desc_general: 'Независимость, холодный ум, ясность, вдова.' },
  { id: 'swords14', name: 'Король Мечей', type: 'minor', imageUrl: `${BASE_URL}/swords_14_king.png`, desc_general: 'Интеллект, власть, логика, справедливость.' },

  // =====================================================================
  // ПЕНТАКЛИ (14 карт)
  // =====================================================================
  { id: 'pents01', name: 'Туз Пентаклей', type: 'minor', imageUrl: `${BASE_URL}/pentacles_01_ace.png`, desc_general: 'Материальный шанс, деньги, здоровье, начало.' },
  { id: 'pents02', name: 'Двойка Пентаклей', type: 'minor', imageUrl: `${BASE_URL}/pentacles_02_two.png`, desc_general: 'Балансирование, гибкость, перемены, суета.' },
  { id: 'pents03', name: 'Тройка Пентаклей', type: 'minor', imageUrl: `${BASE_URL}/pentacles_03_three.png`, desc_general: 'Мастерство, работа в команде, признание.' },
  { id: 'pents04', name: 'Четверка Пентаклей', type: 'minor', imageUrl: `${BASE_URL}/pentacles_04_four.png`, desc_general: 'Жадность, контроль, стабильность, накопление.' },
  { id: 'pents05', name: 'Пятерка Пентаклей', type: 'minor', imageUrl: `${BASE_URL}/pentacles_05_five.png`, desc_general: 'Нужда, кризис, потери.' },
  { id: 'pents06', name: 'Шестерка Пентаклей', type: 'minor', imageUrl: `${BASE_URL}/pentacles_06_six.png`, desc_general: 'Щедрость, благотворительность, помощь, долги.' },
  { id: 'pents07', name: 'Семерка Пентаклей', type: 'minor', imageUrl: `${BASE_URL}/pentacles_07_seven.png`, desc_general: 'Терпение, ожидание урожая, оценка результатов.' },
  { id: 'pents08', name: 'Восьмерка Пентаклей', type: 'minor', imageUrl: `${BASE_URL}/pentacles_08_eight.png`, desc_general: 'Мастерство, усердный труд, обучение, рутина.' },
  { id: 'pents09', name: 'Девятка Пентаклей', type: 'minor', imageUrl: `${BASE_URL}/pentacles_09_nine.png`, desc_general: 'Роскошь, самодостаточность, комфорт, успех.' },
  { id: 'pents10', name: 'Десятка Пентаклей', type: 'minor', imageUrl: `${BASE_URL}/pentacles_10_ten.png`, desc_general: 'Богатство, семья, наследие.' },
  { id: 'pents11', name: 'Паж Пентаклей', type: 'minor', imageUrl: `${BASE_URL}/pentacles_11_page.png`, desc_general: 'Ученик, шанс, новости.' },
  { id: 'pents12', name: 'Рыцарь Пентаклей', type: 'minor', imageUrl: `${BASE_URL}/pentacles_12_knight.png`, desc_general: 'Трудолюбие, надежность, медлительность, упорство.' },
  { id: 'pents13', name: 'Королева Пентаклей', type: 'minor', imageUrl: `${BASE_URL}/pentacles_13_queen.png`, desc_general: 'Забота, практичность, комфорт, хозяйка.' },
  { id: 'pents14', name: 'Король Пентаклей', type: 'minor', imageUrl: `${BASE_URL}/pentacles_14_king.png`, desc_general: 'Богатство, бизнес, надежность, успех.' },
];
