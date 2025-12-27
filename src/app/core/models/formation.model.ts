export interface Formation {
  id: number;
  title: string;
  description: string;
  duration: number; // heures
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  tags: string[];
  categories: string[];
  programPdf: string;
}