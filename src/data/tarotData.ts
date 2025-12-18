import { TarotCard } from '../types';

// Единый источник (Твой репозиторий)
const BASE_URL = "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot";

export const cardBackUrl = `${BASE_URL}/rubashka.png`; // Ссылка на рубашку (для использования в компонентах)

export const cards: TarotCard[] = [
  // =====================================================================
  // СТАРШИЕ АРКАНЫ (24 карты: 0-21 Классика + 2 Спец)
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
  
  // СПЕЦИАЛЬНЫЕ КАРТЫ
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
  { id: 'cups02', name: 'Двойка Кубков', type: 'minor', imageUrl: `${BASE_
