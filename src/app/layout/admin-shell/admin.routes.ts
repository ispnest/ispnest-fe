import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { roleGuard } from '@/app/core/guards/auth.guard';

/**
 * Admin routes — composed from domain route definitions.
 * Each domain owns its routes.ts; this file only wires them
 * as children of the AdminShellComponent.
 */
export const adminRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      const auth = inject(AuthService);
      return auth.hasRole('TECHNICIAN') ? 'technician' : 'dashboard';
    },
  },

  // Dashboard domain
  {
    path: 'dashboard',
    loadChildren: () => import('../../domains/dashboard/routes').then((m) => m.dashboardRoutes),
  },

  // Customers domain
  {
    path: 'customers',
    loadChildren: () => import('../../domains/customers/routes').then((m) => m.customersRoutes),
  },

  // Payments domain
  {
    path: 'payments',
    loadChildren: () => import('../../domains/payments/routes').then((m) => m.paymentsRoutes),
  },

  // Billing domain (invoices + credits + cycles)
  {
    path: 'billing/invoices',
    loadChildren: () => import('../../domains/billing/routes').then((m) => m.invoicesRoutes),
  },
  {
    path: 'billing/credits',
    loadChildren: () => import('../../domains/billing/routes').then((m) => m.creditsRoutes),
  },
  {
    path: 'billing/cycles',
    loadChildren: () => import('../../domains/billing/routes').then((m) => m.billingCyclesRoutes),
  },

  // Plans domain
  {
    path: 'plans',
    loadChildren: () => import('../../domains/plans/routes').then((m) => m.plansRoutes),
  },

  // Bandwidths (part of plans domain)
  {
    path: 'bandwidths',
    loadChildren: () => import('../../domains/plans/routes').then((m) => m.bandwidthsRoutes),
  },

  // Network domain (routers + pools)
  {
    path: 'routers',
    loadChildren: () => import('../../domains/network/routes').then((m) => m.routersRoutes),
  },
  {
    path: 'pools',
    loadChildren: () => import('../../domains/network/routes').then((m) => m.poolsRoutes),
  },

  // Hotspot domain (admin)
  {
    path: 'hotspot',
    loadChildren: () => import('../../domains/hotspot/routes').then((m) => m.hotspotAdminRoutes),
  },

  // Technician domain
  {
    path: 'technician',
    loadChildren: () => import('../../domains/technician/routes').then((m) => m.technicianRoutes),
  },

  // Staff management (admin-only)
  {
    path: 'staff',
    loadChildren: () => import('../../domains/technician/routes').then((m) => m.staffRoutes),
  },

  // Notifications domain
  {
    path: 'notifications',
    loadChildren: () =>
      import('../../domains/notifications/routes').then((m) => m.notificationsRoutes),
  },

  // Settings domain
  {
    path: 'settings',
    loadChildren: () => import('../../domains/settings/routes').then((m) => m.settingsRoutes),
  },

  // Tenants domain (super admin only)
  {
    path: 'tenants',
    canActivate: [roleGuard('SUPER_ADMIN', 'ADMIN')],
    loadChildren: () => import('../../domains/tenants/routes').then((m) => m.tenantAdminRoutes),
  },

  // Real estate domain (properties + owners + renters + leases)
  {
    path: 'real-estate/properties',
    loadChildren: () =>
      import('../../domains/real-estate/routes').then((m) => m.realEstateRoutes),
  },
  {
    path: 'real-estate/owners',
    loadChildren: () => import('../../domains/real-estate/routes').then((m) => m.ownersRoutes),
  },
  {
    path: 'real-estate/renters',
    loadChildren: () => import('../../domains/real-estate/routes').then((m) => m.rentersRoutes),
  },
  {
    path: 'real-estate/leases',
    loadChildren: () => import('../../domains/real-estate/routes').then((m) => m.leasesRoutes),
  },
  {
    path: 'real-estate/guests',
    loadChildren: () => import('../../domains/real-estate/routes').then((m) => m.guestsRoutes),
  },
  {
    path: 'real-estate/bookings',
    loadChildren: () => import('../../domains/real-estate/routes').then((m) => m.bookingsRoutes),
  },
];
