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
import { TenantScopeService } from '@/app/core/host';

/**
 * Guard for protected routes (admin panel).
 * Checks for a valid JWT token and redirects to log in if not authenticated.
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
      router.navigate(['/portal/dashboard']).then();
      return false;
    }
    // Property owners should not access the admin panel
    if (auth.isPropertyOwner()) {
      router.navigate(['/owner-portal/dashboard']).then();
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
            router.navigate(['/portal/dashboard']).then();
            return false;
          }
          if (auth.isPropertyOwner()) {
            router.navigate(['/owner-portal/dashboard']).then();
            return false;
          }
          return true;
        }
        // Token was invalid, redirect to login
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } }).then();
        return false;
      }),
      catchError(() => {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } }).then();
        return of(false);
      }),
    );
  }

  // No valid token - redirect to login with return URL
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } }).then();
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
      router.navigate(['/login']).then();
      return false;
    }

    const hasPermission = requiredPermissions.some((p) => auth.hasPermission(p));
    if (!hasPermission) {
      // Redirect to unauthorized page or admin dashboard
      router.navigate(['/admin']).then();
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
      router.navigate(['/login']).then();
      return false;
    }

    const hasRole = requiredRoles.some((r) => auth.hasRole(r));
    if (!hasRole) {
      router.navigate(['/admin']).then();
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
    router.navigate(['/login']).then();
    return false;
  }

  if (!auth.isStaff()) {
    router.navigate(['/portal']).then();
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
        router.navigate(['/portal'], { queryParams: { returnUrl: state.url } }).then();
        return false;
      }),
      catchError(() => {
        router.navigate(['/portal'], { queryParams: { returnUrl: state.url } }).then();
        return of(false);
      }),
    );
  }

  router.navigate(['/portal'], { queryParams: { returnUrl: state.url } }).then();
  return false;
};

/**
 * Guard for owner-portal routes (real-estate self-service).
 * Requires a valid JWT with user type PROPERTY_OWNER. Redirects to the owner-portal
 * login if not authenticated.
 */
export const ownerPortalAuthGuard: CanActivateFn = (
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

  // Already authenticated as a property owner — allow access
  if (auth.isAuthenticated() && auth.isPropertyOwner()) {
    return true;
  }

  // Have a valid token but user not loaded yet — try loading
  if (auth.hasValidToken()) {
    return auth.loadCurrentUser().pipe(
      map((user) => {
        if (user && auth.isPropertyOwner()) return true;
        router.navigate(['/owner-portal'], { queryParams: { returnUrl: state.url } }).then();
        return false;
      }),
      catchError(() => {
        router.navigate(['/owner-portal'], { queryParams: { returnUrl: state.url } }).then();
        return of(false);
      }),
    );
  }

  router.navigate(['/owner-portal'], { queryParams: { returnUrl: state.url } }).then();
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
    router.navigate(['/portal/settings']).then();
    return false;
  }
  return true;
};

/**
 * Guard to prevent authenticated users from accessing the login page.
 * Redirects to the portal dashboard for customers, admin panel for staff.
 */
export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    router.navigate([auth.getPostLoginRedirect()]).then();
    return false;
  }

  return true;
};

/**
 * Host-scope guard: only allow when the current request is on the platform apex
 * (e.g. {@code ispnest.com}). Used for super-admin / tenant-onboarding routes, so they cannot be
 * reached from a tenant subdomain.
 *
 * &lt;p>Implements Business Requirements #1–#3, #10.
 */
export const apexOnlyGuard: CanActivateFn = () => {
  const scope = inject(TenantScopeService);
  const router = inject(Router);
  if (scope.isApex()) return true;
  router.navigate(['/']).then();
  return false;
};

/**
 * Host-scope guard: only allow when the current request is on a tenant subdomain
 * (e.g. {@code acme.ispnest.com}). Used for tenant login, portal and admin routes so they are
 * invisible on the platform apex.
 *
 * &lt;p>Implements Business Requirements #5–#9.
 */
export const tenantOnlyGuard: CanActivateFn = () => {
  const scope = inject(TenantScopeService);
  const router = inject(Router);
  if (scope.isTenant()) return true;
  router.navigate(['/']).then();
  return false;
};
