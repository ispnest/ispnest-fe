import { Routes } from '@angular/router';
import { roleGuard } from '@/app/core/guards/auth.guard';
import { SeoData } from '@/app/core/seo/seo.strategy';

/** Admin-facing hotspot routes (nested under /admin/hotspot) */
export const hotspotAdminRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Hotspot Sessions',
    canActivate: [roleGuard('ADMIN', 'SUPER_ADMIN')],
    loadComponent: () =>
      import('./features/hotspot-admin-list/hotspot-admin-list.component').then(
        (m) => m.HotspotAdminListComponent,
      ),
  },
  {
    path: 'guests/:id',
    title: 'ISPNest – Guest Details',
    canActivate: [roleGuard('ADMIN', 'SUPER_ADMIN')],
    loadComponent: () =>
      import('./features/hotspot-guest-detail/hotspot-guest-detail.component').then(
        (m) => m.HotspotGuestDetailComponent,
      ),
  },
  {
    path: 'archive',
    title: 'ISPNest – Session Archive',
    canActivate: [roleGuard('ADMIN', 'SUPER_ADMIN')],
    loadComponent: () =>
      import('./features/hotspot-archive/hotspot-archive.component').then(
        (m) => m.HotspotArchiveComponent,
      ),
  },
];

/** Public hotspot routes (top-level /hotspot) */
export const hotspotPublicRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – WiFi Plans',
    data: {
      seo: {
        description:
          'Browse affordable WiFi plans and get online in minutes. Fast, reliable hotspot internet access powered by ISPNest.',
        ogImage: '/img/ispnest-logo.svg',
        robots: 'index, follow',
      } satisfies SeoData,
    },
    loadComponent: () =>
      import('./features/hotspot-plans/hotspot-plans.component').then(
        (m) => m.HotspotPlansComponent,
      ),
  },
  {
    path: 'purchase',
    title: 'ISPNest – Purchase WiFi',
    data: { seo: { robots: 'noindex, nofollow' } satisfies SeoData },
    loadComponent: () =>
      import('./features/hotspot-purchase/hotspot-purchase.component').then(
        (m) => m.HotspotPurchaseComponent,
      ),
  },
  {
    path: 'status/:paymentId',
    title: 'ISPNest – Payment Status',
    data: { seo: { robots: 'noindex, nofollow' } satisfies SeoData },
    loadComponent: () =>
      import('./features/hotspot-status/hotspot-status.component').then(
        (m) => m.HotspotStatusComponent,
      ),
  },
];
