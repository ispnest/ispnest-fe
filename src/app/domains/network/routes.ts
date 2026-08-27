import { Routes } from '@angular/router';
import { permissionGuard } from '@/app/core/guards/auth.guard';
import { RouterDetailStore } from './features/router-detail/router-detail.store';

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
    title: 'ISPNest – Add Router',
    canActivate: [permissionGuard('ROUTERS_WRITE')],
    loadComponent: () =>
      import('./features/router-onboarding-wizard/router-onboarding-wizard.component').then(
        (m) => m.RouterOnboardingWizardComponent,
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
    path: ':id/onboarding',
    title: 'ISPNest – Router Onboarding',
    canActivate: [permissionGuard('ROUTERS_READ')],
    providers: [RouterDetailStore],
    loadComponent: () =>
      import('./features/router-detail/router-detail-layout.component').then(
        (m) => m.RouterDetailLayoutComponent,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./features/router-detail/router-overview.component').then(
            (m) => m.RouterOverviewComponent,
          ),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/router-detail/router-services.component').then(
            (m) => m.RouterServicesComponent,
          ),
      },
    ],
  },
];

export const wireguardPoolRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – WireGuard Config Pool',
    canActivate: [permissionGuard('ROUTERS_READ')],
    loadComponent: () =>
      import('./features/wireguard-pool/wireguard-pool.component').then(
        (m) => m.WireguardPoolComponent,
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
    path: ':id/edit',
    title: 'ISPNest – Edit IP Pool',
    canActivate: [permissionGuard('POOLS_WRITE')],
    loadComponent: () =>
      import('./features/pools-form/pools-form.component').then((m) => m.PoolsFormComponent),
  },
];
