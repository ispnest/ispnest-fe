import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
  provideZonelessChangeDetection,
} from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@/app/core/auth';
import { provideIcons } from '@/app/core/icons';
import { provideLocalStorage } from '@/app/core/local-storage';
import { provideMedia } from '@/app/core/media';
import { provideTheming } from '@/app/core/theming';
import { provideWindow } from '@/app/core/window';
import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';

/**
 * Initialize authentication on app startup.
 * Loads user from token if available.
 */
async function initAuth(auth: AuthService): Promise<void> {
  // Only try to load user if we have a valid token
  if (auth.hasValidToken()) {
    await firstValueFrom(auth.loadCurrentUser());
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Angular
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([apiInterceptor]), withFetch()),
    provideClientHydration(withIncrementalHydration()),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return initAuth(authService);
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
  ],
};
