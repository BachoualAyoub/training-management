import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormationService } from '../../core/services/formation.service';
import { Formation } from '../../core/models/formation.model';

@Component({
  selector: 'app-admin-formations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-formations.html',
  styleUrl: './admin-formations.css',
})
export class AdminFormationsComponent implements OnInit {
  formations: Formation[] = [];
  showForm = false;
  editingId: number | null = null;
  tagInput = '';

  formData: Partial<Formation> = {
    title: '',
    description: '',
    duration: 0,
    level: 'Débutant',
    tags: [],
    categories: [],
    programPdf: '',
  };

  constructor(private formationService: FormationService) {}

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.formationService.getAll().subscribe({
      next: (data) => {
        this.formations = data;
      },
      error: (err) => {
        console.error('Error loading formations:', err);
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
      title: '',
      description: '',
      duration: 0,
      level: 'Débutant',
      tags: [],
      categories: [],
      programPdf: '',
    };
    this.tagInput = '';
  }

  edit(formation: Formation): void {
    this.editingId = formation.id;
    this.formData = { ...formation };
    this.showForm = true;
  }

  addTag(): void {
    if (this.tagInput.trim() && this.formData.tags) {
      this.formData.tags.push(this.tagInput.trim());
      this.tagInput = '';
    }
  }

  removeTag(tag: string): void {
    if (this.formData.tags) {
      this.formData.tags = this.formData.tags.filter(t => t !== tag);
    }
  }

  save(): void {
    if (!this.formData.title || !this.formData.description) {
      console.warn('Please fill all required fields');
      return;
    }

    if (this.editingId) {
      this.formationService.update(this.editingId, this.formData as Formation).subscribe({
        next: () => {
          this.loadFormations();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error updating formation:', err);
        }
      });
    } else {
      this.formationService.add(this.formData as Formation).subscribe({
        next: () => {
          this.loadFormations();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error adding formation:', err);
        }
      });
    }
  }

  delete(id: number): void {
    if (confirm('Êtes-vous sûr?')) {
      this.formationService.delete(id).subscribe({
        next: () => {
          this.loadFormations();
        },
        error: (err) => {
          console.error('Error deleting formation:', err);
        }
      });
    }
  }
}
