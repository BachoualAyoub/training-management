export interface Trainer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cin: string;
  photo?: string; // url
  cvPdf?: string;    // pdf
  specialties: string[];
}