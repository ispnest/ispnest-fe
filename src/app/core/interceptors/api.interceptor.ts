import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { oauth2Config } from '@/app/core/auth';
import { AuthService } from '@/app/core/auth/auth.service';

/**
 * HTTP interceptor that:
 * 1. Adds Bearer token to API requests
 * 2. Adds API version header
 * 3. Handles 401 responses by redirecting to the appropriate login page
 *    (portal login for customers, admin login for staff)
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  // Skip auth header for OAuth2 token endpoint (uses different auth)
  const isTokenEndpoint = req.url.includes('/oauth2/token');

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

  const modified = req.clone({
    setHeaders: headers,
  });

  return next(modified).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.status === 401 && !isTokenEndpoint) {
        // Clear tokens
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(oauth2Config.storageKeys.accessToken);
          localStorage.removeItem(oauth2Config.storageKeys.refreshToken);
          localStorage.removeItem(oauth2Config.storageKeys.tokenExpiry);
        }
        // Redirect customers to portal login, staff to admin login
        const isPortalRequest = req.url.includes('/api/portal/my/');
        const wasCustomer = auth.currentUser()?.contactId != null;
        auth.currentUser.set(null);
        if (isPortalRequest || wasCustomer) {
          router.navigate(['/portal']);
        } else {
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    }),
  );
};
