import { Routes } from '@angular/router';
import { permissionGuard } from '@/app/core/guards/auth.guard';

export const invoicesRoutes: Routes = [
  {
    path: '',
    canActivate: [permissionGuard('BILLING_READ')],
    loadComponent: () =>
      import('./features/invoices-list/invoices-list.component').then(
        (m) => m.InvoicesListComponent,
      ),
  },
  {
    path: ':id',
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
    canActivate: [permissionGuard('BILLING_READ')],
    loadComponent: () =>
      import('./features/credits-list/credits-list.component').then((m) => m.CreditsListComponent),
  },
];

export const billingCyclesRoutes: Routes = [
  {
    path: '',
    canActivate: [permissionGuard('BILLING_READ')],
    loadComponent: () =>
      import('./features/billing-cycles-list/billing-cycles-list.component').then(
        (m) => m.BillingCyclesListComponent,
      ),
  },
];
