import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { oauth2Config } from '@/app/core/auth';
import { AuthService } from '@/app/core/auth/auth.service';

/**
 * The API returns errors as RFC 9457 ProblemDetail bodies — the human-readable message lives in
 * `detail` (and per-field messages in the `errors` extension), not `message`. Components across
 * the app read `err.error?.message`, so this backfills that field from the real response shape.
 * Mutates in place and is a no-op once `message` is already set (e.g. OAuth2 `error_description`
 * flows some components also check for directly).
 */
function normalizeErrorMessage(error: HttpErrorResponse): void {
  const body = error.error as {
    message?: string;
    detail?: string;
    errors?: { field: string; message: string }[];
  } | null;
  if (!body || typeof body !== 'object' || body.message) return;

  if (Array.isArray(body.errors) && body.errors.length > 0) {
    body.message = body.errors.map((e) => e.message).join(' ');
  } else if (body.detail) {
    body.message = body.detail;
  }
}

/**
 * HTTP interceptor that:
 * 1. Adds Bearer token to API requests
 * 2. Adds API version header
 * 3. Normalizes ProblemDetail error bodies so `err.error?.message` is always populated
 * 4. Handles 401 responses by redirecting to the appropriate login page
 *    (portal login for customers, admin login for staff).
 *
 *    Auth endpoints (/api/auth/login, /api/auth/refresh) are excluded from
 *    the automatic redirect so that login components can show inline errors
 *    without the user being bounced to the wrong login page.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  // Skip auth header for OAuth2 token endpoint (uses different auth)
  const isTokenEndpoint = req.url.includes('/oauth2/token');

  // Auth endpoints handle their own 401 errors via inline error messages —
  // never perform a page-level redirect for these.
  const isAuthEndpoint =
    req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh');

  // Get access token from storage
  const accessToken =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(oauth2Config.storageKeys.accessToken)
      : null;

  // Build headers
  const headers: Record<string, string> = {
    'X-API-Version': '1.0',
  };

  // Add Bearer token if available and not token endpoint
  if (accessToken && !isTokenEndpoint) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const modified = req.clone({ setHeaders: headers });

  return next(modified).pipe(
    catchError((error: HttpErrorResponse) => {
      normalizeErrorMessage(error);

      // Handle 401 Unauthorized — skip for token/auth endpoints
      if (error.status === 401 && !isTokenEndpoint && !isAuthEndpoint) {
        // Clear stored tokens
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(oauth2Config.storageKeys.accessToken);
          localStorage.removeItem(oauth2Config.storageKeys.refreshToken);
          localStorage.removeItem(oauth2Config.storageKeys.tokenExpiry);
        }

        const currentUrl = router.url;

        // Determine portal context via:
        //   1. The failing API request targets a portal endpoint
        //   2. The user was authenticated as a customer
        //   3. The current browser URL is under /portal
        const isPortalRequest =
          req.url.includes('/api/portal/') || req.url.includes('/api/portal/my/');
        const wasCustomer = auth.currentUser()?.contactId != null;
        const isPortalRoute = currentUrl.startsWith('/portal');

        auth.currentUser.set(null);

        if (isPortalRequest || wasCustomer || isPortalRoute) {
          router.navigate(['/portal'], { queryParams: { returnUrl: currentUrl } });
        } else {
          router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
        }
      }
      return throwError(() => error);
    }),
  );
};
