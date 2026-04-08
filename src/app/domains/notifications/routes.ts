import { Routes } from '@angular/router';

export const notificationsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/notifications-list/notifications-list.component').then(
        (m) => m.NotificationsListComponent,
      ),
  },
];
