import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormationService } from '../../core/services/formation.service';
import { Formation } from '../../core/models/formation.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-formations-list',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './formations-list.html',
  styleUrl: './formations-list.css',
})
export class FormationsListComponent implements OnInit {

  formations: Formation[] = [];
  tags: string = '';

  constructor(private formationService: FormationService) {}

  ngOnInit(): void {
    this.formationService.getAll().subscribe({
      next: (data) => {
        this.formations = data;
      },
      error: (err) => {
        console.error('Error loading formations:', err);
      }
    });
  }

  get filteredFormations(): Formation[] {
    if (!this.tags.trim()) {
      return this.formations;
    }
    // For search with keywords, filter client-side from loaded formations
    const keyword = this.tags.toLowerCase();
    return this.formations.filter(f => 
      f.title.toLowerCase().includes(keyword) ||
      f.tags.some(t => t.toLowerCase().includes(keyword))
    );
  }
}
