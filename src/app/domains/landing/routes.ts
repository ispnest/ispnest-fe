import { Routes } from '@angular/router';

export const landingRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/landing.component').then(m => m.LandingComponent),
  },
];

