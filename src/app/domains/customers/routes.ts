import { Routes } from '@angular/router';

export const customersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/customers-list/customers-list.component').then(
        m => m.CustomersListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./features/customers-form/customers-form.component').then(
        m => m.CustomersFormComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./features/customers-detail/customers-detail.component').then(
        m => m.CustomersDetailComponent,
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./features/customers-form/customers-form.component').then(
        m => m.CustomersFormComponent,
      ),
  },
];

