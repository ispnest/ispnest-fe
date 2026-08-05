import { Routes } from '@angular/router';
import { ownerPortalAuthGuard } from '@/app/core/guards/auth.guard';

export const ownerPortalRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'ISPNest – Owner Portal',
    loadComponent: () =>
      import('./features/owner-portal-login/owner-portal-login.component').then(
        (m) => m.OwnerPortalLoginComponent,
      ),
  },
  {
    path: '',
    canActivate: [ownerPortalAuthGuard],
    loadComponent: () =>
      import('@/app/layout/owner-portal-shell/owner-portal-shell.component').then(
        (m) => m.OwnerPortalShellComponent,
      ),
    children: [
      {
        path: 'dashboard',
        title: 'ISPNest – My Properties',
        loadComponent: () =>
          import('./features/owner-portal-dashboard/owner-portal-dashboard.component').then(
            (m) => m.OwnerPortalDashboardComponent,
          ),
      },
      {
        path: 'properties/:id',
        title: 'ISPNest – Property Details',
        loadComponent: () =>
          import(
            './features/owner-portal-property-detail/owner-portal-property-detail.component'
          ).then((m) => m.OwnerPortalPropertyDetailComponent),
      },
    ],
  },
];
