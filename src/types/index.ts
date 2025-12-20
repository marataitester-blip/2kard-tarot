export interface TarotCard {
  id: string;
  name: string;
  imageUrl: string;
  
  // --- Новые поля (для новой базы с GitHub) ---
  nameEnglish?: string; 
  meaning?: string;     
  
  // --- Старые поля (для совместимости) ---
  type?: 'major' | 'minor'; 
  desc_general?: string;
}
