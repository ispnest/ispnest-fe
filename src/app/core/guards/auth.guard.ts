import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '@/app/core/auth/auth.service';

/**
 * Guard for protected routes (admin panel).
 * Checks for valid JWT token and redirects to login if not authenticated.
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // If we have a valid token and user is loaded, allow access
  if (auth.isAuthenticated()) {
    return true;
  }

  // If we have a valid token but user not loaded yet, try to load
  if (auth.hasValidToken()) {
    return auth.loadCurrentUser().pipe(
      map((user) => {
        if (user) return true;
        // Token was invalid, redirect to login
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }),
      catchError(() => {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return of(false);
      }),
    );
  }

  // No valid token - redirect to login with return URL
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Guard for routes that require a specific permission.
 * Usage: canActivate: [permissionGuard('CUSTOMERS_READ')]
 */
export function permissionGuard(...requiredPermissions: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    const hasPermission = requiredPermissions.some((p) => auth.hasPermission(p));
    if (!hasPermission) {
      // Redirect to unauthorized page or admin dashboard
      router.navigate(['/admin']);
      return false;
    }

    return true;
  };
}

/**
 * Guard for routes that require the user to be staff (not a customer).
 */
export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (!auth.isStaff()) {
    router.navigate(['/portal']);
    return false;
  }

  return true;
};

/**
 * Guard for customer portal routes.
 * Redirects to portal login if not authenticated as a customer.
 */
export const portalAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Check for session-based portal auth (legacy hotspot flow)
  const hasSession = !!sessionStorage.getItem('portalCustomerId');
  if (hasSession) {
    return true;
  }

  // Check for OAuth2-authenticated customer
  if (auth.isAuthenticated() && auth.isCustomer()) {
    return true;
  }

  router.navigate(['/portal']);
  return false;
};

/**
 * Guard to prevent authenticated users from accessing login page.
 */
export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};
