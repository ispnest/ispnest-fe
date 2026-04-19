import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

/**
 * SSR-only interceptor that rewrites relative API URLs to absolute URLs using
 * the API_URL environment variable. This is necessary because the Node.js SSR
 * process has no browser base URL — relative paths like /api/hotspot would fail.
 *
 * In the browser this interceptor is a no-op.
 *
 * The interceptor is registered only in app.config.server.ts so it is never
 * bundled into the browser build.
 *
 * Environment variable: API_URL (e.g. http://app:8080)
 */
export const ssrBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId) && req.url.startsWith('/')) {
    // process.env is available in the Node.js SSR runtime
    const apiUrl = (typeof process !== 'undefined' && process.env['API_URL']) || '';
    if (apiUrl) {
      const absoluteReq = req.clone({ url: `${apiUrl}${req.url}` });
      return next(absoluteReq);
    }
  }

  return next(req);
};

