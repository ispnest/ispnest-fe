import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TenancyService } from '../tenancy/tenancy.service';

/** Allows the route only on the apex host. On a tenant host, redirects to the tenant home. */
export const apexOnlyGuard: CanActivateFn = () => {
  const tenancy = inject(TenancyService);
  const router = inject(Router);
  if (tenancy.isApex()) return true;
  return router.parseUrl('/portal');
};

/** Allows the route only on a tenant subdomain. On apex, redirects to the marketing site. */
export const tenantOnlyGuard: CanActivateFn = () => {
  const tenancy = inject(TenancyService);
  const router = inject(Router);
  if (tenancy.isTenant()) return true;
  return router.parseUrl('/');
};
