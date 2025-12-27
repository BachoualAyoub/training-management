import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormationService } from '../../core/services/formation.service';
import { SessionService } from '../../core/services/session.service';
import { CandidateService } from '../../core/services/candidate.service';

import { Formation } from '../../core/models/formation.model';
import { Session } from '../../core/models/session.model';
import { Candidate } from '../../core/models/candidate.model';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formation-detail.html',
  styleUrl: './formation-detail.css',
})
export class FormationDetailComponent implements OnInit {

  formation?: Formation;
  sessions: Session[] = [];

  // formulaire inscription
  firstName = '';
  lastName = '';
  email = '';

  constructor(
    private route: ActivatedRoute,
    private formationService: FormationService,
    private sessionService: SessionService,
    private candidateService: CandidateService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    // Validate ID is a valid number
    if (isNaN(id) || id <= 0) {
      console.error('Invalid formation ID:', idParam);
      this.formation = undefined;
      this.sessions = [];
      return;
    }

    this.formationService.getById(id).subscribe({
      next: (data) => {
        this.formation = data;
        this.sessionService.getSessionsByFormation(id).subscribe({
          next: (sessions) => {
            this.sessions = sessions || [];
          },
          error: (err) => {
            console.error('Error loading sessions:', err);
            this.sessions = [];
          }
        });
      },
      error: (err) => {
        console.error('Error loading formation:', err);
        this.formation = undefined;
        this.sessions = [];
      }
    });
  }

  isSessionFull(session: Session): boolean {
    return (session.candidates?.length ?? 0) >= 15;
  }

  register(session: Session): void {
    if (!this.firstName || !this.lastName || !this.email) {
      console.warn('Please fill all fields');
      return;
    }

    const candidate: Candidate = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      cin: '',
      password: 'defaultPassword'
    };

    this.candidateService.add(candidate).subscribe({
      next: (createdCandidate) => {
        if (session.id && createdCandidate.id) {
          this.sessionService.register(session.id, createdCandidate.id).subscribe({
            next: () => {
              console.log('Registration successful');
              this.firstName = '';
              this.lastName = '';
              this.email = '';
            },
            error: (err) => {
              console.error('Error registering:', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error creating candidate:', err);
      }
    });
  }

  openPdf(): void {
    if (this.formation?.programPdf) {
      window.open(this.formation.programPdf, '_blank');
    }
  }
}
