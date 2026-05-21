import { Routes } from '@angular/router';
import { roleGuard } from '@/app/core/guards/auth.guard';

/** Admin-facing hotspot routes (nested under /admin/hotspot) */
export const hotspotAdminRoutes: Routes = [
  {
    path: '',
    canActivate: [roleGuard('ADMIN', 'SUPER_ADMIN')],
    loadComponent: () =>
      import('./features/hotspot-admin-list/hotspot-admin-list.component').then(
        (m) => m.HotspotAdminListComponent,
      ),
  },
  {
    path: 'guests/:id',
    canActivate: [roleGuard('ADMIN', 'SUPER_ADMIN')],
    loadComponent: () =>
      import('./features/hotspot-guest-detail/hotspot-guest-detail.component').then(
        (m) => m.HotspotGuestDetailComponent,
      ),
  },
  {
    path: 'archive',
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
    loadComponent: () =>
      import('./features/hotspot-plans/hotspot-plans.component').then(
        (m) => m.HotspotPlansComponent,
      ),
  },
  {
    path: 'purchase',
    loadComponent: () =>
      import('./features/hotspot-purchase/hotspot-purchase.component').then(
        (m) => m.HotspotPurchaseComponent,
      ),
  },
  {
    path: 'status/:paymentId',
    loadComponent: () =>
      import('./features/hotspot-status/hotspot-status.component').then(
        (m) => m.HotspotStatusComponent,
      ),
  },
];
