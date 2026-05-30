import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenancyService } from '../tenancy/tenancy.service';

/**
 * Adds the `X-Tenant-Slug` header on every backend request so the local dev proxy
 * (and Nginx in shared environments where the host is rewritten) can preserve the
 * tenant context. Production deployments rely primarily on `X-Forwarded-Host`,
 * but this header is a defensive fallback the backend will honour if present.
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenancy = inject(TenancyService);
  const slug = tenancy.tenantSlug();
  if (!slug) return next(req);
  return next(req.clone({ setHeaders: { 'X-Tenant-Slug': slug } }));
};
