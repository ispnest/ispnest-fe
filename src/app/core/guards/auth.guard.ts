import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '@/app/core/auth/auth.service';

/**
 * Guard for protected routes (admin panel).
 * Checks for valid JWT token and redirects to login if not authenticated.
 * If the authenticated user is a customer (not staff), redirects them to the portal instead.
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // If we have a valid token and user is loaded, check role
  if (auth.isAuthenticated()) {
    // Customers should not access the admin panel
    if (auth.isCustomer()) {
      router.navigate(['/portal/dashboard']);
      return false;
    }
    return true;
  }

  // If we have a valid token but user not loaded yet, try to load
  if (auth.hasValidToken()) {
    return auth.loadCurrentUser().pipe(
      map((user) => {
        if (user) {
          if (auth.isCustomer()) {
            router.navigate(['/portal/dashboard']);
            return false;
          }
          return true;
        }
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
 * Guard for routes that require the user to have one of the specified roles.
 * Usage: canActivate: [roleGuard('ADMIN', 'SUPER_ADMIN')]
 */
export function roleGuard(...requiredRoles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    const hasRole = requiredRoles.some((r) => auth.hasRole(r));
    if (!hasRole) {
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
 * Requires a valid JWT with ROLE_CUSTOMER. Redirects to portal login if not authenticated.
 */
export const portalAuthGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // sessionStorage / localStorage not available during SSR — defer to client
  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  // Already authenticated as a customer — allow access
  if (auth.isAuthenticated() && auth.isCustomer()) {
    return true;
  }

  // Have a valid token but user not loaded yet — try loading
  if (auth.hasValidToken()) {
    return auth.loadCurrentUser().pipe(
      map((user) => {
        if (user && auth.isCustomer()) return true;
        router.navigate(['/portal'], { queryParams: { returnUrl: state.url } });
        return false;
      }),
      catchError(() => {
        router.navigate(['/portal']);
        return of(false);
      }),
    );
  }

  router.navigate(['/portal'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Guard that enforces a forced password change.
 * Routes guarded by this will redirect to /portal/settings when
 * the current user's forcePasswordChange flag is true.
 */
export const forcePasswordChangeGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUser()?.forcePasswordChange === true) {
    router.navigate(['/portal/settings']);
    return false;
  }
  return true;
};

/**
 * Guard to prevent authenticated users from accessing login page.
 * Redirects to portal dashboard for customers, admin panel for staff.
 */
export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    router.navigate([auth.getPostLoginRedirect()]);
    return false;
  }

  return true;
};
