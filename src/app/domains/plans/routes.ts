import { Routes } from '@angular/router';

export const plansRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/plans-list/plans-list.component').then(m => m.PlansListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./features/plans-form/plans-form.component').then(m => m.PlansFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./features/plans-form/plans-form.component').then(m => m.PlansFormComponent),
  },
];

export const bandwidthsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/bandwidths-list/bandwidths-list.component').then(
        m => m.BandwidthsListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./features/bandwidths-form/bandwidths-form.component').then(
        m => m.BandwidthsFormComponent,
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./features/bandwidths-form/bandwidths-form.component').then(
        m => m.BandwidthsFormComponent,
      ),
  },
];

