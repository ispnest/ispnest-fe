import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID, REQUEST } from '@angular/core';

/**
 * SSR-only interceptor that:
 *
 *   1. Rewrites relative `/api/*` URLs to absolute URLs using `API_URL` so the Node.js SSR
 *      process can reach the Spring Boot backend over the Docker network.
 *   2. Forwards the incoming request's `X-Forwarded-Host` / `Host` (and `X-Forwarded-Proto`)
 *      onto the outbound call. Without this, the backend would see `Host: app:8080` and the
 *      `TenantHostFilter` would not resolve a tenant — meaning SSR-rendered tenant pages
 *      would fetch data from the wrong tenant context.
 *
 * In the browser this interceptor is a no-op.
 *
 * Environment variable: `API_URL` (e.g. `http://app:8080`).
 */
export const ssrBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformServer(platformId)) return next(req);

  const ssrRequest = inject(REQUEST, { optional: true });
  const apiUrl = (typeof process !== 'undefined' && process.env['API_URL']) || '';

  // Build the outgoing absolute URL.
  let outboundUrl = req.url;
  if (apiUrl && req.url.startsWith('/')) outboundUrl = `${apiUrl}${req.url}`;

  // Carry tenant-resolving headers forward from the user's incoming request.
  const forwardedHeaders: Record<string, string> = {};
  if (ssrRequest) {
    const incomingForwardedHost =
      ssrRequest.headers.get('x-forwarded-host') || ssrRequest.headers.get('host');
    if (incomingForwardedHost) {
      forwardedHeaders['X-Forwarded-Host'] = incomingForwardedHost;
    }
    const incomingForwardedProto = ssrRequest.headers.get('x-forwarded-proto');
    if (incomingForwardedProto) {
      forwardedHeaders['X-Forwarded-Proto'] = incomingForwardedProto;
    }
    const incomingForwardedFor = ssrRequest.headers.get('x-forwarded-for');
    if (incomingForwardedFor) {
      forwardedHeaders['X-Forwarded-For'] = incomingForwardedFor;
    }
  }

  if (outboundUrl === req.url && Object.keys(forwardedHeaders).length === 0) {
    return next(req);
  }

  return next(
    req.clone({
      url: outboundUrl,
      setHeaders: forwardedHeaders,
    }),
  );
};
