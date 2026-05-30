import { Routes } from '@angular/router';
import { permissionGuard } from '@/app/core/guards/auth.guard';

export const routersRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Routers',
    canActivate: [permissionGuard('ROUTERS_READ')],
    loadComponent: () =>
      import('./features/routers-list/routers-list.component').then((m) => m.RoutersListComponent),
  },
  {
    path: 'new',
    title: 'ISPNest – Onboard Router',
    canActivate: [permissionGuard('ROUTERS_WRITE')],
    loadComponent: () =>
      import('./features/router-onboard-wizard/router-onboard-wizard.component').then(
        (m) => m.RouterOnboardWizardComponent,
      ),
  },
  {
    path: ':id/edit',
    title: 'ISPNest – Edit Router',
    canActivate: [permissionGuard('ROUTERS_WRITE')],
    loadComponent: () =>
      import('./features/routers-form/routers-form.component').then((m) => m.RoutersFormComponent),
  },
  {
    path: ':id',
    title: 'ISPNest – Router',
    canActivate: [permissionGuard('ROUTERS_READ')],
    loadComponent: () =>
      import('./features/router-detail/router-detail.component').then(
        (m) => m.RouterDetailComponent,
      ),
  },
];

export const poolsRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – IP Pools',
    canActivate: [permissionGuard('POOLS_READ')],
    loadComponent: () =>
      import('./features/pools-list/pools-list.component').then((m) => m.PoolsListComponent),
  },
  {
    path: 'new',
    title: 'ISPNest – New IP Pool',
    canActivate: [permissionGuard('POOLS_WRITE')],
    loadComponent: () =>
      import('./features/pools-form/pools-form.component').then((m) => m.PoolsFormComponent),
  },
  {
    path: ':id/edit',
    title: 'ISPNest – Edit IP Pool',
    canActivate: [permissionGuard('POOLS_WRITE')],
    loadComponent: () =>
      import('./features/pools-form/pools-form.component').then((m) => m.PoolsFormComponent),
  },
];
