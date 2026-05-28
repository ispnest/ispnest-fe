import { Routes } from '@angular/router';
import { permissionGuard } from '@/app/core/guards/auth.guard';

export const settingsRoutes: Routes = [
  {
    path: '',
    title: 'ISPNest – Settings',
    canActivate: [permissionGuard('SETTINGS_READ')],
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
  },
];
