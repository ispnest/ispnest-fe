import { Routes } from '@angular/router';
import { apexOnlyGuard, authGuard, tenantOnlyGuard } from './core/guards/auth.guard';

/**
 * Root routing — only composes domain routes.
 * No business logic lives here.
 *
 * Host-scope policy (Business Requirements #1–#13):
 * - apex (ispnest.com)        → landing + tenant onboarding ONLY
 * - tenant subdomain (*.…)    → landing (tenant marketing) + auth + portal + admin + hotspot
 *                               (tenant login is NOT visible on apex)
 */
export const routes: Routes = [
  // Landing domain — rendered on every host (the component adapts via TenantScopeService).
  {
    path: '',
    loadChildren: () => import('./domains/landing/routes').then((m) => m.landingRoutes),
  },

  // Auth domain (login + register at top-level paths) — tenant subdomains only.
  {
    path: '',
    canActivate: [tenantOnlyGuard],
    loadChildren: () => import('./domains/auth/routes').then((m) => m.authRoutes),
  },

  // Admin shell — protected, composes all admin domain routes.
  // Restricted to tenant subdomains (admin lives inside a tenant). Super-admin global
  // mgmt under /admin/tenants is gated separately via roleGuard inside admin.routes.
  {
    path: 'admin',
    canActivate: [tenantOnlyGuard, authGuard],
    loadComponent: () =>
      import('./layout/admin-shell/admin-shell.component').then((m) => m.AdminShellComponent),
    loadChildren: () => import('./layout/admin-shell/admin.routes').then((m) => m.adminRoutes),
  },

  // Portal domain (customer self-service) — tenant subdomains only.
  {
    path: 'portal',
    canActivate: [tenantOnlyGuard],
    loadChildren: () => import('./domains/portal/routes').then((m) => m.portalRoutes),
  },

  // Owner portal domain (real-estate owner self-service) — tenant subdomains only.
  {
    path: 'owner-portal',
    canActivate: [tenantOnlyGuard],
    loadChildren: () => import('./domains/owner-portal/routes').then((m) => m.ownerPortalRoutes),
  },

  // Public tenant self-service onboarding — apex only.
  {
    path: 'onboard',
    canActivate: [apexOnlyGuard],
    loadChildren: () => import('./domains/tenants/routes').then((m) => m.tenantOnboardRoutes),
  },

  // Hotspot domain (public captive-portal flow) — tenant subdomains only.
  {
    path: 'hotspot',
    canActivate: [tenantOnlyGuard],
    loadChildren: () => import('./domains/hotspot/routes').then((m) => m.hotspotPublicRoutes),
  },

  { path: '**', redirectTo: '' },
];
