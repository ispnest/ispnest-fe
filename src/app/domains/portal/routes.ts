import { Routes } from '@angular/router';
import { portalAuthGuard, forcePasswordChangeGuard } from '@/app/core/guards/auth.guard';

export const portalRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'ISPNest – Customer Portal',
    loadComponent: () =>
      import('./features/portal-login/portal-login.component').then((m) => m.PortalLoginComponent),
  },
  {
    path: '',
    canActivate: [portalAuthGuard],
    loadComponent: () =>
      import('@/app/layout/portal-shell/portal-shell.component').then(
        (m) => m.PortalShellComponent,
      ),
    children: [
      {
        path: 'dashboard',
        title: 'ISPNest – My Dashboard',
        canActivate: [forcePasswordChangeGuard],
        loadComponent: () =>
          import('./features/portal-dashboard/portal-dashboard.component').then(
            (m) => m.PortalDashboardComponent,
          ),
      },
      {
        path: 'accounts/:id',
        title: 'ISPNest – Account Details',
        canActivate: [forcePasswordChangeGuard],
        loadComponent: () =>
          import('./features/portal-account-detail/portal-account-detail.component').then(
            (m) => m.PortalAccountDetailComponent,
          ),
      },
      {
        path: 'notifications',
        title: 'ISPNest – Notifications',
        canActivate: [forcePasswordChangeGuard],
        loadComponent: () =>
          import('./features/portal-notifications/portal-notifications.component').then(
            (m) => m.PortalNotificationsComponent,
          ),
      },
      {
        path: 'settings',
        title: 'ISPNest – Settings',
        loadComponent: () =>
          import('./features/portal-change-password/portal-change-password.component').then(
            (m) => m.PortalChangePasswordComponent,
          ),
      },
      {
        path: 'payment',
        title: 'ISPNest – Make Payment',
        canActivate: [forcePasswordChangeGuard],
        loadComponent: () =>
          import('./features/portal-payment/portal-payment.component').then(
            (m) => m.PortalPaymentComponent,
          ),
      },
      {
        path: 'status/:paymentId',
        title: 'ISPNest – Payment Status',
        loadComponent: () =>
          import('./features/portal-status/portal-status.component').then(
            (m) => m.PortalStatusComponent,
          ),
      },
      {
        path: 'upgrade',
        title: 'ISPNest – Upgrade Plan',
        canActivate: [forcePasswordChangeGuard],
        loadComponent: () =>
          import('./features/portal-upgrade/portal-upgrade.component').then(
            (m) => m.PortalUpgradeComponent,
          ),
      },
    ],
  },
];
