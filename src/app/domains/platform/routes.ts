import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from '@/app/core/guards/auth.guard';
import { apexOnlyGuard } from '@/app/core/guards/host.guards';

/**
 * Platform domain — apex-host-only surfaces:
 *  - /signup → tenant self-service registration
 *  - /admin/tenants → super-admin tenants console (lazy, guarded by PLATFORM_ADMIN)
 */
export const platformRoutes: Routes = [
  {
    path: 'admin/tenants',
    canActivate: [apexOnlyGuard, authGuard, permissionGuard('PLATFORM_ADMIN')],
    loadComponent: () =>
      import('./tenants-console/tenants-console.component').then((m) => m.TenantsConsoleComponent),
    data: { seo: { title: 'Platform Tenants' } },
  },
  {
    path: 'signup',
    canActivate: [apexOnlyGuard],
    loadComponent: () =>
      import('./tenant-signup/tenant-signup.component').then((m) => m.TenantSignupComponent),
    data: { seo: { title: 'Get an ISPNest workspace' } },
  },
];
