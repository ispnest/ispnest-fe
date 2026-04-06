import { Routes } from '@angular/router';

export const invoicesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/invoices-list/invoices-list.component').then(m => m.InvoicesListComponent),
  },
];

export const creditsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/credits-list/credits-list.component').then(m => m.CreditsListComponent),
  },
];

