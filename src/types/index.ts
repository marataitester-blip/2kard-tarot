export interface TarotCard {
  id: string;
  name: string;
  imageUrl: string;
  nameEnglish?: string; 
  meaning?: string;     
  type?: 'major' | 'minor'; 
  desc_general?: string;
}

// Теперь у нас 5 режимов
export type AppMode = 'BLITZ' | 'RELATIONSHIPS' | 'FATE' | 'FINANCE' | 'CROSS';
