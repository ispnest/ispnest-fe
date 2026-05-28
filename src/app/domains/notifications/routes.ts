import { Routes } from '@angular/router';
import { permissionGuard } from '@/app/core/guards/auth.guard';

export const notificationsRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Notifications',
    canActivate: [permissionGuard('NOTIFICATIONS_READ')],
    loadComponent: () =>
      import('./features/notifications-list/notifications-list.component').then(
        (m) => m.NotificationsListComponent,
      ),
  },
];
