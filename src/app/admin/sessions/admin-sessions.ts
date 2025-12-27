import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../core/services/session.service';
import { FormationService } from '../../core/services/formation.service';
import { TrainerService } from '../../core/services/trainer.service';
import { Session } from '../../core/models/session.model';
import { Formation } from '../../core/models/formation.model';
import { Trainer } from '../../core/models/trainer.model';

@Component({
  selector: 'app-admin-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-sessions.html',
  styleUrl: './admin-sessions.css',
})
export class AdminSessionsComponent implements OnInit {
  sessions: Session[] = [];
  formations: Formation[] = [];
  trainers: Trainer[] = [];
  showForm = false;
  editingId: number | null = null;

  formData: Partial<Session> = {
    formation: undefined,
    trainers: [],
    startDate: new Date(),
    endDate: new Date(),
    description: '',
    candidates: [],
  };

  constructor(
    private sessionService: SessionService,
    private formationService: FormationService,
    private trainerService: TrainerService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.sessionService.getAll().subscribe({
      next: (data) => {
        this.sessions = data;
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
      }
    });
    
    this.formationService.getAll().subscribe({
      next: (data) => {
        this.formations = data;
      },
      error: (err) => {
        console.error('Error loading formations:', err);
      }
    });
    
    this.trainerService.getAll().subscribe({
      next: (data) => {
        this.trainers = data;
      },
      error: (err) => {
        console.error('Error loading trainers:', err);
      }
    });
  }

  openForm(): void {
    this.showForm = true;
    this.editingId = null;
    this.resetForm();
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      formation: undefined,
      trainers: [],
      startDate: new Date(),
      endDate: new Date(),
      description: '',
      candidates: [],
    };
  }

  edit(session: Session): void {
    this.editingId = session.id;
    this.formData = { ...session };
    this.showForm = true;
  }

  save(): void {
    if (!this.formData.formation || !this.formData.description) {
      console.warn('Please fill all required fields');
      return;
    }

    if (this.editingId) {
      this.sessionService.update(this.editingId, this.formData).subscribe({
        next: () => {
          this.loadData();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error updating session:', err);
        }
      });
    } else {
      this.sessionService.add(this.formData).subscribe({
        next: () => {
          this.loadData();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error adding session:', err);
        }
      });
    }
  }

  delete(id: number): void {
    if (confirm('Êtes-vous sûr?')) {
      this.sessionService.delete(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.error('Error deleting session:', err);
        }
      });
    }
  }
}
