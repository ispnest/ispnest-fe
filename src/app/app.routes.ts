import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import {
  apexOnlyGuard,
  apexOnlyMatchGuard,
  tenantOnlyGuard,
} from './core/guards/host.guards';

/**
 * Root routing — only composes domain routes.
 * Routes are host-aware: apex-only routes (signup, marketing) and tenant-only routes
 * (admin, portal, hotspot) are gated by the host guards. A single Angular build serves
 * both hosts; the guards redirect cross-host links to the correct origin.
 */
export const routes: Routes = [
  // Landing (apex marketing site only)
  {
    path: '',
    canMatch: [apexOnlyMatchGuard],
    loadChildren: () => import('./domains/landing/routes').then((m) => m.landingRoutes),
  },

  // Platform (apex-only: tenant signup, super-admin tenants console)
  {
    path: '',
    canMatch: [apexOnlyMatchGuard],
    loadChildren: () => import('./domains/platform/routes').then((m) => m.platformRoutes),
  },

  // Auth domain (login + register) — tenant subdomains only.
  {
    path: '',
    loadChildren: () => import('./domains/auth/routes').then((m) => m.authRoutes),
  },

  // Admin shell — tenant subdomains only, protected.
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

  // Hotspot captive portal — tenant subdomains only.
  {
    path: 'hotspot',
    canActivate: [tenantOnlyGuard],
    loadChildren: () => import('./domains/hotspot/routes').then((m) => m.hotspotPublicRoutes),
  },

  { path: '**', redirectTo: '' },
];
