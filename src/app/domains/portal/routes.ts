import { Routes } from '@angular/router';

export const portalRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/portal-login/portal-login.component').then(m => m.PortalLoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/portal-dashboard/portal-dashboard.component').then(
        m => m.PortalDashboardComponent,
      ),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./features/portal-payment/portal-payment.component').then(
        m => m.PortalPaymentComponent,
      ),
  },
  {
    path: 'status/:paymentId',
    loadComponent: () =>
      import('./features/portal-status/portal-status.component').then(
        m => m.PortalStatusComponent,
      ),
  },
  {
    path: 'upgrade',
    loadComponent: () =>
      import('./features/portal-upgrade/portal-upgrade.component').then(
        m => m.PortalUpgradeComponent,
      ),
  },
];


