import { Formation } from './formation.model';
import { Trainer } from './trainer.model';
import { Candidate } from './candidate.model';

export interface Session {
  id: number;
  formation: Formation;
  trainers: Trainer[]; // 1 ou 2
  candidates: Candidate[];
  startDate: Date;
  endDate: Date;
  description: string;
}
