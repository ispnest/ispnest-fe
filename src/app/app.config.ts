import {
  ApplicationConfig, provideBrowserGlobalErrorListeners,
  provideAppInitializer, inject, provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { AuthService } from './core/auth/auth.service';

function initAuth(auth: AuthService) {
  return () => auth.loadCurrentUser();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return initAuth(authService)();
    }),
  ]
};
