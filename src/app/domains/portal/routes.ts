import { Routes } from '@angular/router';
import { portalAuthGuard, forcePasswordChangeGuard } from '@/app/core/guards/auth.guard';

export const portalRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Customer Portal',
    loadComponent: () =>
      import('./features/portal-login/portal-login.component').then((m) => m.PortalLoginComponent),
  },
  {
    path: 'dashboard',
    title: 'ISPNest – My Dashboard',
    canActivate: [portalAuthGuard, forcePasswordChangeGuard],
    loadComponent: () =>
      import('./features/portal-dashboard/portal-dashboard.component').then(
        (m) => m.PortalDashboardComponent,
      ),
  },
  {
    path: 'accounts/:id',
    title: 'ISPNest – Account Details',
    canActivate: [portalAuthGuard, forcePasswordChangeGuard],
    loadComponent: () =>
      import('./features/portal-account-detail/portal-account-detail.component').then(
        (m) => m.PortalAccountDetailComponent,
      ),
  },
  {
    path: 'notifications',
    title: 'ISPNest – Notifications',
    canActivate: [portalAuthGuard, forcePasswordChangeGuard],
    loadComponent: () =>
      import('./features/portal-notifications/portal-notifications.component').then(
        (m) => m.PortalNotificationsComponent,
      ),
  },
  {
    path: 'settings',
    title: 'ISPNest – Settings',
    canActivate: [portalAuthGuard],
    loadComponent: () =>
      import('./features/portal-change-password/portal-change-password.component').then(
        (m) => m.PortalChangePasswordComponent,
      ),
  },
  {
    path: 'payment',
    title: 'ISPNest – Make Payment',
    canActivate: [portalAuthGuard, forcePasswordChangeGuard],
    loadComponent: () =>
      import('./features/portal-payment/portal-payment.component').then(
        (m) => m.PortalPaymentComponent,
      ),
  },
  {
    path: 'status/:paymentId',
    title: 'ISPNest – Payment Status',
    canActivate: [portalAuthGuard],
    loadComponent: () =>
      import('./features/portal-status/portal-status.component').then(
        (m) => m.PortalStatusComponent,
      ),
  },
  {
    path: 'upgrade',
    title: 'ISPNest – Upgrade Plan',
    canActivate: [portalAuthGuard, forcePasswordChangeGuard],
    loadComponent: () =>
      import('./features/portal-upgrade/portal-upgrade.component').then(
        (m) => m.PortalUpgradeComponent,
      ),
  },
];
