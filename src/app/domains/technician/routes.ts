import { Routes } from '@angular/router';
import { staffGuard } from '@/app/core/guards/auth.guard';

export const technicianRoutes: Routes = [
  {
    path: '',
    canActivate: [staffGuard],
    loadComponent: () =>
      import('./features/technician-dashboard/technician-dashboard.component').then(
        (m) => m.TechnicianDashboardComponent,
      ),
  },
];
