import { Routes } from '@angular/router';

export const routersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/routers-list/routers-list.component').then((m) => m.RoutersListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./features/routers-form/routers-form.component').then((m) => m.RoutersFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./features/routers-form/routers-form.component').then((m) => m.RoutersFormComponent),
  },
];

export const poolsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/pools-list/pools-list.component').then((m) => m.PoolsListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./features/pools-form/pools-form.component').then((m) => m.PoolsFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./features/pools-form/pools-form.component').then((m) => m.PoolsFormComponent),
  },
];
