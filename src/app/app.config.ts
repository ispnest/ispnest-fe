import {
  ApplicationConfig, provideBrowserGlobalErrorListeners,
  provideAppInitializer, inject, provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';

import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { AuthService } from './core/auth/auth.service';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {provideClientHydration, withIncrementalHydration} from '@angular/platform-browser';
import {provideMedia} from '@/app/core/media';
import {provideIcons} from '@/app/core/icons';
import {provideLocalStorage} from '@/app/core/local-storage';
import {provideTheming} from '@/app/core/theming';
import {provideWindow} from '@/app/core/window';

function initAuth(auth: AuthService) {
  return () => auth.loadCurrentUser();
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Angular
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideClientHydration(withIncrementalHydration()),
    provideHttpClient(withFetch()),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return initAuth(authService)();
    }),

    // Angular Material
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
      },
    },

    // BuilderKit
    provideIcons(),
    provideLocalStorage(),
    provideMedia(),
    provideTheming({
      scheme: 'system',
      primary: '#3E63DD',
      error: '#E5484D',
      neutral: '#8B8D98',
    }),
    provideWindow(),
  ]
};
