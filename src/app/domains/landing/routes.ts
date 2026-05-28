import { Routes } from '@angular/router';
import { SeoData } from '@/app/core/seo/seo.strategy';

export const landingRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'ISPNest – Internet Made Simple',
    data: {
      seo: {
        description:
          'ISPNest is a complete ISP management platform. Manage customers, billing, hotspot access, and network infrastructure — all from one place.',
        ogImage: '/img/ispnest-logo.svg',
        robots: 'index, follow',
      } satisfies SeoData,
    },
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
];
