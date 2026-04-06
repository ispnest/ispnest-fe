import { Routes } from '@angular/router';

export const technicianRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/technician-dashboard/technician-dashboard.component').then(
        m => m.TechnicianDashboardComponent,
      ),
  },
];

