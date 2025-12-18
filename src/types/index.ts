export interface TarotCard {
  id: string;
  name: string;
  type: 'major' | 'minor';  // <--- ВОТ ЭТОЙ СТРОЧКИ НЕ ХВАТАЛО
  imageUrl: string;
  desc_general: string;
}
