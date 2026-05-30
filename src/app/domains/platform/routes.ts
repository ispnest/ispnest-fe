import { Routes } from '@angular/router';
import { apexOnlyGuard } from '@/app/core/guards/host.guards';

/**
 * Platform domain — apex-host-only surfaces:
 *  - /signup → tenant self-service registration
 *  - /admin/tenants → super-admin tenants console (lazy, guarded by PLATFORM_ADMIN)
 */
export const platformRoutes: Routes = [
  {
    path: 'signup',
    canActivate: [apexOnlyGuard],
    loadComponent: () =>
      import('./tenant-signup/tenant-signup.component').then((m) => m.TenantSignupComponent),
    data: { seo: { title: 'Get an ISPNest workspace' } },
  },
];
