import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from '@/app/app.config';
import { serverRoutes } from '@/app/app.routes.server';
import { ssrBaseUrlInterceptor } from '@/app/core/interceptors/ssr-base-url.interceptor';
import { APEX_DOMAIN, DEV_TENANT_SLUG } from '@/app/core/tenancy/tenancy.tokens';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // Rewrites relative /api/* URLs to absolute http://app:8080/api/* during SSR.
    // Must be server-only so it is never bundled into the browser.
    provideHttpClient(withInterceptors([ssrBaseUrlInterceptor])),
    // Tenancy: SSR reads the apex domain from the deploy env so host parsing matches the
    // backend's TenantHostFilter. The browser bundle defaults to the InjectionToken factory
    // value (`ispnest.com`) and never sees these process.env reads.
    {
      provide: APEX_DOMAIN,
      useFactory: () =>
        (typeof process !== 'undefined' && process.env['NG_APP_TENANCY_APEX']) || 'ispnest.com',
    },
    {
      provide: DEV_TENANT_SLUG,
      useFactory: () =>
        (typeof process !== 'undefined' && process.env['NG_APP_DEV_TENANT_SLUG']) || 'default',
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
