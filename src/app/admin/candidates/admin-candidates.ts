import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../core/services/candidate.service';
import { Candidate } from '../../core/models/candidate.model';

@Component({
  selector: 'app-admin-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-candidates.html',
  styleUrl: './admin-candidates.css',
})
export class AdminCandidatesComponent implements OnInit {
  candidates: Candidate[] = [];
  showForm = false;
  editingId: number | null = null;

  formData: Candidate = {
    firstName: '',
    lastName: '',
    email: '',
    cin: '',
    password: '',
  };

  constructor(private candidateService: CandidateService) {}

  ngOnInit(): void {
    this.loadCandidates();
  }

  loadCandidates(): void {
    this.candidateService.getAll().subscribe({
      next: (data) => {
        this.candidates = data;
      },
      error: (err) => {
        console.error('Error loading candidates:', err);
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
      firstName: '',
      lastName: '',
      email: '',
      cin: '',
      password: '',
    };
  }

  edit(candidate: Candidate): void {
    this.editingId = candidate.id || null;
    this.formData = { ...candidate };
    this.showForm = true;
  }

  save(): void {
    if (!this.formData.firstName || !this.formData.lastName) {
      console.warn('Please fill all required fields');
      return;
    }

    if (this.editingId) {
      this.candidateService.update(this.editingId, this.formData).subscribe({
        next: () => {
          this.loadCandidates();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error updating candidate:', err);
        }
      });
    } else {
      this.candidateService.add(this.formData).subscribe({
        next: () => {
          this.loadCandidates();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error adding candidate:', err);
        }
      });
    }
  }

  delete(id: number | undefined): void {
    if (id && confirm('Êtes-vous sûr?')) {
      this.candidateService.delete(id).subscribe({
        next: () => {
          this.loadCandidates();
        },
        error: (err) => {
          console.error('Error deleting candidate:', err);
        }
      });
    }
  }
}
