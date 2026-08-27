import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
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

// Module-scoped refresh state, shared across all requests in this browser session so that
// concurrent 401s (e.g. several requests in flight when the access token expires) trigger a
// single refresh call instead of a stampede.
let isRefreshing = false;
const refreshedTokenSubject = new BehaviorSubject<string | null>(null);

function withAuthHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function redirectToLogin(req: HttpRequest<unknown>, auth: AuthService, router: Router): void {
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
  const isPortalRequest = req.url.includes('/api/portal/') || req.url.includes('/api/portal/my/');
  const wasCustomer = auth.currentUser()?.contactId != null;
  const isPortalRoute = currentUrl.startsWith('/portal');

  auth.currentUser.set(null);

  if (isPortalRequest || wasCustomer || isPortalRoute) {
    router.navigate(['/portal'], { queryParams: { returnUrl: currentUrl } });
  } else {
    router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
  }
}

/** Attempts a silent token refresh, then retries `req`. Falls back to a login redirect on failure. */
function handleUnauthorized(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
  router: Router,
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshedTokenSubject.next(null);

    return auth.refreshToken().pipe(
      switchMap((response) => {
        isRefreshing = false;
        if (!response) {
          redirectToLogin(req, auth, router);
          return throwError(() => new HttpErrorResponse({ status: 401, url: req.url }));
        }
        refreshedTokenSubject.next(response.access_token);
        return next(withAuthHeader(req, response.access_token));
      }),
      catchError((err) => {
        isRefreshing = false;
        redirectToLogin(req, auth, router);
        return throwError(() => err);
      }),
    );
  }

  // A refresh is already in flight — wait for it, then retry with the new token.
  return refreshedTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(withAuthHeader(req, token))),
  );
}

/**
 * HTTP interceptor that:
 * 1. Adds Bearer token to API requests
 * 2. Adds API version header
 * 3. Normalizes ProblemDetail error bodies so `err.error?.message` is always populated
 * 4. On a 401 from a non-auth endpoint, attempts a single silent token refresh and retries the
 *    request; only redirects to the appropriate login page (portal vs admin) if the refresh
 *    itself fails.
 *
 *    Auth endpoints (/api/auth/login, /api/auth/refresh) are excluded from
 *    the refresh-and-retry / automatic redirect so that login components can show inline errors
 *    without the user being bounced to the wrong login page.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  // Skip auth header for OAuth2 token endpoint (uses different auth)
  const isTokenEndpoint = req.url.includes('/oauth2/token');

  // Auth endpoints handle their own 401 errors via inline error messages —
  // never perform a refresh-and-retry or page-level redirect for these.
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

  // Add Bearer token if available and not the OAuth2 token endpoint or an auth endpoint. A stale
  // token from a previous, expired session must never ride along on a fresh login/refresh attempt
  // — Spring's oauth2ResourceServer JWT filter authenticates any Bearer token it sees BEFORE
  // authorizeHttpRequests().permitAll() is even evaluated, so an expired token here gets the
  // request rejected with a bare 401 at the filter level, never reaching LoginController at all
  // (surfacing as a generic "Login failed" on the first attempt, until the failed attempt's
  // catchError clears the stale token and a second, header-less attempt succeeds).
  if (accessToken && !isTokenEndpoint && !isAuthEndpoint) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const modified = req.clone({ setHeaders: headers });

  return next(modified).pipe(
    catchError((error: HttpErrorResponse) => {
      normalizeErrorMessage(error);

      if (error.status === 401 && !isTokenEndpoint && !isAuthEndpoint) {
        return handleUnauthorized(modified, next, auth, router);
      }
      return throwError(() => error);
    }),
  );
};
