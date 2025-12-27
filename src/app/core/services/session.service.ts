import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from '../models/session.model';
import { Candidate } from '../models/candidate.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private apiUrl = 'http://localhost:3000/api/sessions';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Session[]> {
    return this.http.get<Session[]>(this.apiUrl);
  }

  getById(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`);
  }

  getSessionsByFormation(formationId: number): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/formation/${formationId}`);
  }

  add(session: Partial<Session>): Observable<Session> {
    return this.http.post<Session>(this.apiUrl, session);
  }

  update(id: number, session: Partial<Session>): Observable<Session> {
    return this.http.put<Session>(`${this.apiUrl}/${id}`, session);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  register(sessionId: number, candidateId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${sessionId}/register`, { candidateId });
  }
}

