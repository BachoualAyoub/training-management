import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../core/services/trainer.service';
import { Trainer } from '../../core/models/trainer.model';

@Component({
  selector: 'app-admin-trainers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-trainers.html',
  styleUrl: './admin-trainers.css',
})
export class AdminTrainersComponent implements OnInit {
  trainers: Trainer[] = [];
  showForm = false;
  editingId: number | null = null;

  formData: Trainer = {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cin: '',
    specialties: [],
  };

  specialtyInput = '';

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.loadTrainers();
  }

  loadTrainers(): void {
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
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      cin: '',
      specialties: [],
    };
    this.specialtyInput = '';
  }

  edit(trainer: Trainer): void {
    this.editingId = trainer.id;
    this.formData = { ...trainer };
    this.showForm = true;
  }

  addSpecialty(): void {
    if (this.specialtyInput.trim()) {
      this.formData.specialties.push(this.specialtyInput.trim());
      this.specialtyInput = '';
    }
  }

  removeSpecialty(specialty: string): void {
    this.formData.specialties = this.formData.specialties.filter(
      s => s !== specialty
    );
  }

  save(): void {
    if (!this.formData.firstName || !this.formData.lastName) {
      console.warn('Please fill all required fields');
      return;
    }

    if (this.editingId) {
      this.trainerService.update(this.editingId, this.formData).subscribe({
        next: () => {
          this.loadTrainers();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error updating trainer:', err);
        }
      });
    } else {
      this.trainerService.add(this.formData).subscribe({
        next: () => {
          this.loadTrainers();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error adding trainer:', err);
        }
      });
    }
  }

  delete(id: number): void {
    if (confirm('Êtes-vous sûr?')) {
      this.trainerService.delete(id).subscribe({
        next: () => {
          this.loadTrainers();
        },
        error: (err) => {
          console.error('Error deleting trainer:', err);
        }
      });
    }
  }
}
