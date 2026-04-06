import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'customers',
    loadComponent: () => import('./customers/customer-list.component').then(m => m.CustomerListComponent)
  },
  {
    path: 'customers/new',
    loadComponent: () => import('./customers/customer-form.component').then(m => m.CustomerFormComponent)
  },
  {
    path: 'customers/:id',
    loadComponent: () => import('./customers/customer-detail.component').then(m => m.CustomerDetailComponent)
  },
  {
    path: 'customers/:id/edit',
    loadComponent: () => import('./customers/customer-form.component').then(m => m.CustomerFormComponent)
  },
  {
    path: 'payments',
    loadComponent: () => import('./payments/payment-list.component').then(m => m.PaymentListComponent)
  },
  {
    path: 'billing/invoices',
    loadComponent: () => import('./billing/invoice-list.component').then(m => m.InvoiceListComponent)
  },
  {
    path: 'billing/credits',
    loadComponent: () => import('./billing/credit-list.component').then(m => m.CreditListComponent)
  },
  {
    path: 'routers',
    loadComponent: () => import('./routers/router-list.component').then(m => m.RouterListComponent)
  },
  {
    path: 'routers/new',
    loadComponent: () => import('./routers/router-form.component').then(m => m.RouterFormComponent)
  },
  {
    path: 'routers/:id/edit',
    loadComponent: () => import('./routers/router-form.component').then(m => m.RouterFormComponent)
  },
  {
    path: 'pools',
    loadComponent: () => import('./pools/pool-list.component').then(m => m.PoolListComponent)
  },
  {
    path: 'plans',
    loadComponent: () => import('./plans/plan-list.component').then(m => m.PlanListComponent)
  },
  {
    path: 'plans/new',
    loadComponent: () => import('./plans/plan-form.component').then(m => m.PlanFormComponent)
  },
  {
    path: 'plans/:id/edit',
    loadComponent: () => import('./plans/plan-form.component').then(m => m.PlanFormComponent)
  },
  {
    path: 'bandwidths',
    loadComponent: () => import('./bandwidths/bandwidth-list.component').then(m => m.BandwidthListComponent)
  },
  {
    path: 'hotspot',
    loadComponent: () => import('./hotspot/hotspot-list.component').then(m => m.HotspotListComponent)
  },
  {
    path: 'technician',
    loadComponent: () => import('./technician/technician-dashboard.component').then(m => m.TechnicianDashboardComponent)
  },
  {
    path: 'notifications',
    loadComponent: () => import('./notifications/notification-list.component').then(m => m.NotificationListComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent)
  },
];

