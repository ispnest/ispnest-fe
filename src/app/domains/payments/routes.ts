import { Routes } from '@angular/router';

export const paymentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/payments-list/payments-list.component').then(
        (m) => m.PaymentsListComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./features/payment-detail/payment-detail.component').then(
        (m) => m.PaymentDetailComponent,
      ),
  },
];
