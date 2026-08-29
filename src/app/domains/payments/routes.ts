import { Routes } from '@angular/router';
import { permissionGuard } from '@/app/core/guards/auth.guard';

export const paymentsRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Payments',
    canActivate: [permissionGuard('PAYMENTS_READ')],
    loadComponent: () =>
      import('./features/payments-list/payments-list.component').then(
        (m) => m.PaymentsListComponent,
      ),
  },
  {
    path: 'payment-corrections',
    title: 'ISPNest – Payment Corrections',
    canActivate: [permissionGuard('PAYMENTS_READ')],
    loadComponent: () =>
      import('./features/payment-corrections-list/payment-corrections-list.component').then(
        (m) => m.PaymentCorrectionsListComponent,
      ),
  },
  {
    path: 'payment-corrections/:id',
    title: 'ISPNest – Payment Correction Detail',
    canActivate: [permissionGuard('PAYMENTS_READ')],
    loadComponent: () =>
      import('./features/payment-correction-detail/payment-correction-detail.component').then(
        (m) => m.PaymentCorrectionDetailComponent,
      ),
  },
  {
    path: ':id',
    title: 'ISPNest – Payment Details',
    canActivate: [permissionGuard('PAYMENTS_READ')],
    loadComponent: () =>
      import('./features/payment-detail/payment-detail.component').then(
        (m) => m.PaymentDetailComponent,
      ),
  },
];
