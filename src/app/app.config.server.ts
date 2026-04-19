import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from '@/app/app.config';
import { serverRoutes } from '@/app/app.routes.server';
import { ssrBaseUrlInterceptor } from '@/app/core/interceptors/ssr-base-url.interceptor';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // Rewrites relative /api/* URLs to absolute http://app:8080/api/* during SSR.
    // Must be server-only so it is never bundled into the browser.
    provideHttpClient(withInterceptors([ssrBaseUrlInterceptor])),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
