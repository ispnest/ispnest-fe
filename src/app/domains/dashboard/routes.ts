import { Routes } from '@angular/router';
import { roleGuard } from '@/app/core/guards/auth.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Dashboard',
    canActivate: [roleGuard('ADMIN', 'SUPER_ADMIN', 'SUPPORT')],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
];
