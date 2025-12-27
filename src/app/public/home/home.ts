import { Component ,OnInit} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormationService } from '../../core/services/formation.service';
import { Formation } from '../../core/models/formation.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit{
  categories: string[] = [];
  formations: Formation[] = [];

  constructor(private formationService: FormationService) {}

  ngOnInit(): void {
    this.formationService.getAll().subscribe({
      next: (data) => {
        this.formations = data || [];
        // Extract unique categories
        const allCategories = new Set<string>();
        if (this.formations && Array.isArray(this.formations)) {
          this.formations.forEach(f => {
            if (f.categories && Array.isArray(f.categories)) {
              f.categories.forEach(c => allCategories.add(c));
            }
          });
        }
        this.categories = Array.from(allCategories);
      },
      error: (err) => {
        console.error('Error loading formations:', err);
        this.formations = [];
        this.categories = [];
      }
    });
  }
}
