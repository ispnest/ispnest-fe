import { Routes } from '@angular/router';
import { permissionGuard } from '@/app/core/guards/auth.guard';

export const invoicesRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Invoices',
    canActivate: [permissionGuard('BILLING_READ')],
    loadComponent: () =>
      import('./features/invoices-list/invoices-list.component').then(
        (m) => m.InvoicesListComponent,
      ),
  },
  {
    path: ':id',
    title: 'ISPNest – Invoice Details',
    canActivate: [permissionGuard('BILLING_READ')],
    loadComponent: () =>
      import('./features/invoice-detail/invoice-detail.component').then(
        (m) => m.InvoiceDetailComponent,
      ),
  },
];

export const creditsRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Credits',
    canActivate: [permissionGuard('BILLING_READ')],
    loadComponent: () =>
      import('./features/credits-list/credits-list.component').then((m) => m.CreditsListComponent),
  },
];

export const billingCyclesRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Billing Cycles',
    canActivate: [permissionGuard('BILLING_READ')],
    loadComponent: () =>
      import('./features/billing-cycles-list/billing-cycles-list.component').then(
        (m) => m.BillingCyclesListComponent,
      ),
  },
];
