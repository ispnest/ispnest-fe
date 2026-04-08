import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

/**
 * Root routing — only composes domain routes.
 * No business logic lives here.
 */
export const routes: Routes = [
  // Landing domain
  {
    path: '',
    loadChildren: () => import('./domains/landing/routes').then((m) => m.landingRoutes),
  },

  // Auth domain (login + register at top-level paths)
  {
    path: '',
    loadChildren: () => import('./domains/auth/routes').then((m) => m.authRoutes),
  },

  // Admin shell — protected, composes all admin domain routes
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/admin-shell/admin-shell.component').then((m) => m.AdminShellComponent),
    loadChildren: () => import('./layout/admin-shell/admin.routes').then((m) => m.adminRoutes),
  },

  // Portal domain (customer self-service)
  {
    path: 'portal',
    loadChildren: () => import('./domains/portal/routes').then((m) => m.portalRoutes),
  },

  // Hotspot domain (public captive-portal flow)
  {
    path: 'hotspot',
    loadChildren: () => import('./domains/hotspot/routes').then((m) => m.hotspotPublicRoutes),
  },

  { path: '**', redirectTo: '' },
];
