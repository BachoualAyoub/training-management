export interface Candidate {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  cin: string;
  photo?: string; // url
  password: string;
}