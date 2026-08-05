import { Routes } from '@angular/router';
import { permissionGuard } from '@/app/core/guards/auth.guard';

export const realEstateRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Properties',
    canActivate: [permissionGuard('PROPERTIES_READ')],
    loadComponent: () =>
      import('./features/properties-list/properties-list.component').then(
        (m) => m.PropertiesListComponent,
      ),
  },
  {
    path: 'new',
    title: 'ISPNest – New Property',
    canActivate: [permissionGuard('PROPERTIES_WRITE')],
    loadComponent: () =>
      import('./features/properties-form/properties-form.component').then(
        (m) => m.PropertiesFormComponent,
      ),
  },
  {
    path: ':id',
    title: 'ISPNest – Property Details',
    canActivate: [permissionGuard('PROPERTIES_READ')],
    loadComponent: () =>
      import('./features/properties-detail/properties-detail.component').then(
        (m) => m.PropertiesDetailComponent,
      ),
  },
  {
    path: ':id/edit',
    title: 'ISPNest – Edit Property',
    canActivate: [permissionGuard('PROPERTIES_WRITE')],
    loadComponent: () =>
      import('./features/properties-form/properties-form.component').then(
        (m) => m.PropertiesFormComponent,
      ),
  },
];

export const ownersRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Owners',
    canActivate: [permissionGuard('OWNERS_READ')],
    loadComponent: () =>
      import('./features/owners-list/owners-list.component').then((m) => m.OwnersListComponent),
  },
  {
    path: 'new',
    title: 'ISPNest – New Owner',
    canActivate: [permissionGuard('OWNERS_WRITE')],
    loadComponent: () =>
      import('./features/owners-form/owners-form.component').then((m) => m.OwnersFormComponent),
  },
  {
    path: ':id',
    title: 'ISPNest – Owner Details',
    canActivate: [permissionGuard('OWNERS_READ')],
    loadComponent: () =>
      import('./features/owners-detail/owners-detail.component').then(
        (m) => m.OwnersDetailComponent,
      ),
  },
  {
    path: ':id/edit',
    title: 'ISPNest – Edit Owner',
    canActivate: [permissionGuard('OWNERS_WRITE')],
    loadComponent: () =>
      import('./features/owners-form/owners-form.component').then((m) => m.OwnersFormComponent),
  },
];

export const rentersRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Renters',
    canActivate: [permissionGuard('RENTERS_READ')],
    loadComponent: () =>
      import('./features/renters-list/renters-list.component').then((m) => m.RentersListComponent),
  },
  {
    path: 'new',
    title: 'ISPNest – New Renter',
    canActivate: [permissionGuard('RENTERS_WRITE')],
    loadComponent: () =>
      import('./features/renters-form/renters-form.component').then((m) => m.RentersFormComponent),
  },
  {
    path: ':id',
    title: 'ISPNest – Renter Details',
    canActivate: [permissionGuard('RENTERS_READ')],
    loadComponent: () =>
      import('./features/renters-detail/renters-detail.component').then(
        (m) => m.RentersDetailComponent,
      ),
  },
  {
    path: ':id/edit',
    title: 'ISPNest – Edit Renter',
    canActivate: [permissionGuard('RENTERS_WRITE')],
    loadComponent: () =>
      import('./features/renters-form/renters-form.component').then((m) => m.RentersFormComponent),
  },
];

export const leasesRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Leases',
    canActivate: [permissionGuard('LEASES_READ')],
    loadComponent: () =>
      import('./features/leases-list/leases-list.component').then((m) => m.LeasesListComponent),
  },
  {
    path: 'new',
    title: 'ISPNest – New Lease',
    canActivate: [permissionGuard('LEASES_WRITE')],
    loadComponent: () =>
      import('./features/leases-form/leases-form.component').then((m) => m.LeasesFormComponent),
  },
  {
    path: ':id',
    title: 'ISPNest – Lease Details',
    canActivate: [permissionGuard('LEASES_READ')],
    loadComponent: () =>
      import('./features/leases-detail/leases-detail.component').then(
        (m) => m.LeasesDetailComponent,
      ),
  },
  {
    path: ':id/edit',
    title: 'ISPNest – Edit Lease',
    canActivate: [permissionGuard('LEASES_WRITE')],
    loadComponent: () =>
      import('./features/leases-form/leases-form.component').then((m) => m.LeasesFormComponent),
  },
];

export const guestsRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Guests',
    canActivate: [permissionGuard('GUESTS_READ')],
    loadComponent: () =>
      import('./features/guests-list/guests-list.component').then((m) => m.GuestsListComponent),
  },
  {
    path: 'new',
    title: 'ISPNest – New Guest',
    canActivate: [permissionGuard('GUESTS_WRITE')],
    loadComponent: () =>
      import('./features/guests-form/guests-form.component').then((m) => m.GuestsFormComponent),
  },
  {
    path: ':id',
    title: 'ISPNest – Guest Details',
    canActivate: [permissionGuard('GUESTS_READ')],
    loadComponent: () =>
      import('./features/guests-detail/guests-detail.component').then(
        (m) => m.GuestsDetailComponent,
      ),
  },
  {
    path: ':id/edit',
    title: 'ISPNest – Edit Guest',
    canActivate: [permissionGuard('GUESTS_WRITE')],
    loadComponent: () =>
      import('./features/guests-form/guests-form.component').then((m) => m.GuestsFormComponent),
  },
];

export const bookingsRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Bookings',
    canActivate: [permissionGuard('BOOKINGS_READ')],
    loadComponent: () =>
      import('./features/bookings-list/bookings-list.component').then(
        (m) => m.BookingsListComponent,
      ),
  },
  {
    path: 'new',
    title: 'ISPNest – New Booking',
    canActivate: [permissionGuard('BOOKINGS_WRITE')],
    loadComponent: () =>
      import('./features/bookings-form/bookings-form.component').then(
        (m) => m.BookingsFormComponent,
      ),
  },
  {
    path: ':id',
    title: 'ISPNest – Booking Details',
    canActivate: [permissionGuard('BOOKINGS_READ')],
    loadComponent: () =>
      import('./features/bookings-detail/bookings-detail.component').then(
        (m) => m.BookingsDetailComponent,
      ),
  },
  {
    path: ':id/edit',
    title: 'ISPNest – Edit Booking',
    canActivate: [permissionGuard('BOOKINGS_WRITE')],
    loadComponent: () =>
      import('./features/bookings-form/bookings-form.component').then(
        (m) => m.BookingsFormComponent,
      ),
  },
];
