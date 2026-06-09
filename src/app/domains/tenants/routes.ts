import { Routes } from '@angular/router';
import { SeoData } from '@/app/core/seo/seo.strategy';

/**
 * Admin tenant management routes — only for SUPER_ADMIN / ADMIN.
 * Mounted under /admin/tenants in admin.routes.ts.
 */
export const tenantAdminRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/tenant-list/tenant-list.component').then((m) => m.TenantListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./features/tenant-create/tenant-create.component').then(
        (m) => m.TenantCreateComponent,
      ),
  },
  {
    path: ':tenantId',
    loadComponent: () =>
      import('./features/tenant-detail/tenant-detail.component').then(
        (m) => m.TenantDetailComponent,
      ),
  },
];

/**
 * Public tenant onboarding route — unauthenticated self-service signup.
 * Mounted at /onboard in app.routes.ts.
 */
export const tenantOnboardRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Start Your ISP',
    data: {
      seo: {
        description:
          'Create your ISP tenant on ISPNest. Manage customers, billing, hotspot, and network — all from one platform.',
        ogImage: '/img/ispnest-logo.svg',
        robots: 'index, follow',
      } satisfies SeoData,
    },
    loadComponent: () =>
      import('./features/tenant-onboard/tenant-onboard.component').then(
        (m) => m.TenantOnboardComponent,
      ),
  },
];
