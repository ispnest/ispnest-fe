import { Routes } from '@angular/router';

export const portalRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./portal-login.component').then(m => m.PortalLoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./portal-dashboard.component').then(m => m.PortalDashboardComponent)
  },
  {
    path: 'payment',
    loadComponent: () => import('./portal-payment.component').then(m => m.PortalPaymentComponent)
  },
  {
    path: 'status/:paymentId',
    loadComponent: () => import('./portal-status.component').then(m => m.PortalStatusComponent)
  },
  {
    path: 'upgrade',
    loadComponent: () => import('./portal-upgrade.component').then(m => m.PortalUpgradeComponent)
  }
];

