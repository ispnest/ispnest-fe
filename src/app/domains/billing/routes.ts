import { Routes } from '@angular/router';

export const invoicesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/invoices-list/invoices-list.component').then(m => m.InvoicesListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./features/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent),
  },
];

export const creditsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/credits-list/credits-list.component').then(m => m.CreditsListComponent),
  },
];

export const billingCyclesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/billing-cycles-list/billing-cycles-list.component').then(
        m => m.BillingCyclesListComponent,
      ),
  },
];

