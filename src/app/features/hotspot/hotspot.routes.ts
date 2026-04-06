import { Routes } from '@angular/router';

export const hotspotRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./hotspot-plans.component').then(m => m.HotspotPlansComponent)
  },
  {
    path: 'purchase',
    loadComponent: () => import('./hotspot-purchase.component').then(m => m.HotspotPurchaseComponent)
  },
  {
    path: 'status/:paymentId',
    loadComponent: () => import('./hotspot-status.component').then(m => m.HotspotStatusComponent)
  }
];

