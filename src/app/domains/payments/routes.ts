import { Routes } from '@angular/router';
import { permissionGuard } from '@/app/core/guards/auth.guard';

export const paymentsRoutes: Routes = [
  {
    path: '',
    canActivate: [permissionGuard('PAYMENTS_READ')],
    loadComponent: () =>
      import('./features/payments-list/payments-list.component').then(
        (m) => m.PaymentsListComponent,
      ),
  },
  {
    path: ':id',
    canActivate: [permissionGuard('PAYMENTS_READ')],
    loadComponent: () =>
      import('./features/payment-detail/payment-detail.component').then(
        (m) => m.PaymentDetailComponent,
      ),
  },
];
