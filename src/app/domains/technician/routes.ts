import { Routes } from '@angular/router';
import { permissionGuard, roleGuard, staffGuard } from '@/app/core/guards/auth.guard';

export const technicianRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Technician Dashboard',
    canActivate: [staffGuard],
    loadComponent: () =>
      import('./features/technician-dashboard/technician-dashboard.component').then(
        (m) => m.TechnicianDashboardComponent,
      ),
  },
];

export const staffRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Staff',
    canActivate: [roleGuard('ADMIN', 'SUPER_ADMIN')],
    loadComponent: () =>
      import('./features/staff-list/staff-list.component').then((m) => m.StaffListComponent),
  },
  {
    path: 'new',
    title: 'ISPNest – New Staff Member',
    canActivate: [roleGuard('ADMIN', 'SUPER_ADMIN'), permissionGuard('USERS_WRITE')],
    loadComponent: () =>
      import('./features/staff-form/staff-form.component').then((m) => m.StaffFormComponent),
  },
  {
    path: ':id',
    title: 'ISPNest – Staff Details',
    canActivate: [roleGuard('ADMIN', 'SUPER_ADMIN'), permissionGuard('USERS_WRITE')],
    loadComponent: () =>
      import('./features/staff-form/staff-form.component').then((m) => m.StaffFormComponent),
  },
];
