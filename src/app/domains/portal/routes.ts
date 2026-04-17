import { Routes } from '@angular/router';
import { portalAuthGuard } from '@/app/core/guards/auth.guard';

export const portalRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/portal-login/portal-login.component').then((m) => m.PortalLoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [portalAuthGuard],
    loadComponent: () =>
      import('./features/portal-dashboard/portal-dashboard.component').then(
        (m) => m.PortalDashboardComponent,
      ),
  },
  {
    path: 'payment',
    canActivate: [portalAuthGuard],
    loadComponent: () =>
      import('./features/portal-payment/portal-payment.component').then(
        (m) => m.PortalPaymentComponent,
      ),
  },
  {
    path: 'status/:paymentId',
    canActivate: [portalAuthGuard],
    loadComponent: () =>
      import('./features/portal-status/portal-status.component').then(
        (m) => m.PortalStatusComponent,
      ),
  },
  {
    path: 'upgrade',
    canActivate: [portalAuthGuard],
    loadComponent: () =>
      import('./features/portal-upgrade/portal-upgrade.component').then(
        (m) => m.PortalUpgradeComponent,
      ),
  },
];
