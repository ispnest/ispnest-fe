import { Routes } from '@angular/router';
import { permissionGuard } from '@/app/core/guards/auth.guard';

export const plansRoutes: Routes = [
  {
    path: '',
    canActivate: [permissionGuard('PLANS_READ')],
    loadComponent: () =>
      import('./features/plans-list/plans-list.component').then((m) => m.PlansListComponent),
  },
  {
    path: 'new',
    canActivate: [permissionGuard('PLANS_WRITE')],
    loadComponent: () =>
      import('./features/plans-form/plans-form.component').then((m) => m.PlansFormComponent),
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard('PLANS_WRITE')],
    loadComponent: () =>
      import('./features/plans-form/plans-form.component').then((m) => m.PlansFormComponent),
  },
];

export const bandwidthsRoutes: Routes = [
  {
    path: '',
    canActivate: [permissionGuard('BANDWIDTHS_READ')],
    loadComponent: () =>
      import('./features/bandwidths-list/bandwidths-list.component').then(
        (m) => m.BandwidthsListComponent,
      ),
  },
  {
    path: 'new',
    canActivate: [permissionGuard('BANDWIDTHS_WRITE')],
    loadComponent: () =>
      import('./features/bandwidths-form/bandwidths-form.component').then(
        (m) => m.BandwidthsFormComponent,
      ),
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard('BANDWIDTHS_WRITE')],
    loadComponent: () =>
      import('./features/bandwidths-form/bandwidths-form.component').then(
        (m) => m.BandwidthsFormComponent,
      ),
  },
];
