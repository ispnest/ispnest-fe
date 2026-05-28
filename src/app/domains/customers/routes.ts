import { Routes } from '@angular/router';
import { permissionGuard } from '@/app/core/guards/auth.guard';

export const customersRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Customers',
    canActivate: [permissionGuard('CUSTOMERS_READ')],
    loadComponent: () =>
      import('./features/customers-list/customers-list.component').then(
        (m) => m.CustomersListComponent,
      ),
  },
  {
    path: 'new',
    title: 'ISPNest – New Customer',
    canActivate: [permissionGuard('CUSTOMERS_WRITE')],
    loadComponent: () =>
      import('./features/customers-form/customers-form.component').then(
        (m) => m.CustomersFormComponent,
      ),
  },
  {
    path: ':id',
    title: 'ISPNest – Customer Details',
    canActivate: [permissionGuard('CUSTOMERS_READ')],
    loadComponent: () =>
      import('./features/customers-detail/customers-detail.component').then(
        (m) => m.CustomersDetailComponent,
      ),
  },
  {
    path: ':id/edit',
    title: 'ISPNest – Edit Customer',
    canActivate: [permissionGuard('CUSTOMERS_WRITE')],
    loadComponent: () =>
      import('./features/customers-form/customers-form.component').then(
        (m) => m.CustomersFormComponent,
      ),
  },
];
