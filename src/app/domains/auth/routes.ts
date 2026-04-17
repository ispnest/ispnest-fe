import { Routes } from '@angular/router';
import { noAuthGuard } from '@/app/core/guards/auth.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'callback',
    // OAuth callback - no guard needed, handles token exchange
    loadComponent: () =>
      import('./features/callback/callback.component').then((m) => m.OAuthCallbackComponent),
  },
  {
    path: 'register',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./features/register/register.component').then((m) => m.RegisterComponent),
  },
];
