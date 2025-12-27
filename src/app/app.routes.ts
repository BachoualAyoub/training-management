import { Routes, } from '@angular/router';
import { Home } from './public/home/home';
import { FormationsListComponent } from './public/formations-list/formations-list';
import { FormationDetailComponent } from './public/formation-detail/formation-detail';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout';
import { AdminCandidatesComponent } from './admin/candidates/admin-candidates';
import { AdminTrainersComponent } from './admin/trainers/admin-trainers';
import { AdminFormationsComponent } from './admin/formations/admin-formations';
import { AdminSessionsComponent } from './admin/sessions/admin-sessions';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'formations', component: FormationsListComponent },
  { path: 'formations/:id', component: FormationDetailComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'candidates', component: AdminCandidatesComponent },
      { path: 'trainers', component: AdminTrainersComponent },
      { path: 'formations', component: AdminFormationsComponent },
      { path: 'sessions', component: AdminSessionsComponent },
    ]
  }
];