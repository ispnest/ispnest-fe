import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { TenancyService } from '../tenancy/tenancy.service';

/** Allows the route only on the apex host. On a tenant host, redirects to the tenant home. */
export const apexOnlyGuard: CanActivateFn = () => {
  const tenancy = inject(TenancyService);
  const router = inject(Router);
  if (tenancy.isApex()) return true;
  return router.parseUrl('/login');
};

/** Allows the route only on a tenant subdomain. On apex, redirects to the marketing site. */
export const tenantOnlyGuard: CanActivateFn = () => {
  const tenancy = inject(TenancyService);
  const router = inject(Router);
  if (tenancy.isTenant()) return true;
  return router.parseUrl('/');
};

/**
 * Host-aware route matching for domain route groups.
 *
 * Use canMatch (instead of canActivate) on top-level '' routes so the router can continue
 * evaluating sibling route groups when host conditions do not match.
 */
export const apexOnlyMatchGuard: CanMatchFn = () => {
  const tenancy = inject(TenancyService);
  return tenancy.isApex();
};

