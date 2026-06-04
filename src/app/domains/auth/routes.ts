import { Routes } from '@angular/router';
import { noAuthGuard } from '@/app/core/guards/auth.guard';
import { tenantOnlyGuard } from '@/app/core/guards/host.guards';
import { SeoData } from '@/app/core/seo/seo.strategy';

export const authRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    title: 'ISPNest – Admin Login',
    data: { seo: { robots: 'noindex, nofollow' } satisfies SeoData },
    canActivate: [noAuthGuard],
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'callback',
    // OAuth callback — no guard, handles token exchange; no title needed (transient)
    loadComponent: () =>
      import('./features/callback/callback.component').then((m) => m.OAuthCallbackComponent),
  },
  {
    path: 'register',
    title: 'ISPNest – Create Account',
    data: { seo: { robots: 'noindex, nofollow' } satisfies SeoData },
    canActivate: [noAuthGuard, tenantOnlyGuard],
    loadComponent: () =>
      import('./features/register/register.component').then((m) => m.RegisterComponent),
  },
];
