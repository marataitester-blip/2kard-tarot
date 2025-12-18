export interface TarotCard {
  id: string;
  name: string;
  type: 'major' | 'minor'; // <--- Эта строка исправит ошибку сборки!
  imageUrl: string;
  desc_general: string;
}
