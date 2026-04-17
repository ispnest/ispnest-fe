import { Routes } from '@angular/router';
import { permissionGuard } from '@/app/core/guards/auth.guard';

export const routersRoutes: Routes = [
  {
    path: '',
    canActivate: [permissionGuard('ROUTERS_READ')],
    loadComponent: () =>
      import('./features/routers-list/routers-list.component').then((m) => m.RoutersListComponent),
  },
  {
    path: 'new',
    canActivate: [permissionGuard('ROUTERS_WRITE')],
    loadComponent: () =>
      import('./features/routers-form/routers-form.component').then((m) => m.RoutersFormComponent),
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard('ROUTERS_WRITE')],
    loadComponent: () =>
      import('./features/routers-form/routers-form.component').then((m) => m.RoutersFormComponent),
  },
];

export const poolsRoutes: Routes = [
  {
    path: '',
    canActivate: [permissionGuard('POOLS_READ')],
    loadComponent: () =>
      import('./features/pools-list/pools-list.component').then((m) => m.PoolsListComponent),
  },
  {
    path: 'new',
    canActivate: [permissionGuard('POOLS_WRITE')],
    loadComponent: () =>
      import('./features/pools-form/pools-form.component').then((m) => m.PoolsFormComponent),
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard('POOLS_WRITE')],
    loadComponent: () =>
      import('./features/pools-form/pools-form.component').then((m) => m.PoolsFormComponent),
  },
];
