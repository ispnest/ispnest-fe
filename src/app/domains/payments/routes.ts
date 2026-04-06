import { Routes } from '@angular/router';

export const paymentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/payments-list/payments-list.component').then(m => m.PaymentsListComponent),
  },
];

