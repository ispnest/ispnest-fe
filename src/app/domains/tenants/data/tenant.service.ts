import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import {
  CreateTenantRequest,
  TenantDescriptor,
  TenantOnboardRequest,
  TenantStatus,
} from './tenant.model';

/**
 * Service for tenant management operations.
 * - Admin endpoints require TENANTS_READ / TENANTS_WRITE permissions.
 * - Public onboarding is unauthenticated.
 */
@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly http = inject(HttpClient);

  // ─── Admin endpoints (require auth + TENANTS_* permissions) ──────────

  /**
   * List all tenants with optional status filter and pagination.
   */
  list(status?: TenantStatus, page = 0, size = 20): Observable<Pageable<TenantDescriptor>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Pageable<TenantDescriptor>>('/api/admin/tenants', { params });
  }

  /**
   * Get a single tenant by ID.
   */
  getById(tenantId: string): Observable<TenantDescriptor> {
    return this.http.get<TenantDescriptor>(`/api/admin/tenants/${tenantId}`);
  }

  /**
   * Create a new tenant (admin-initiated).
   */
  create(request: CreateTenantRequest): Observable<TenantDescriptor> {
    return this.http.post<TenantDescriptor>('/api/admin/tenants', request);
  }

  /**
   * Suspend a tenant.
   */
  suspend(tenantId: string, reason: string): Observable<void> {
    return this.http.post<void>(`/api/admin/tenants/${tenantId}/suspend`, { reason });
  }

  /**
   * Reactivate a suspended tenant.
   */
  reactivate(tenantId: string): Observable<void> {
    return this.http.post<void>(`/api/admin/tenants/${tenantId}/reactivate`, {});
  }

  /**
   * Decommission (soft-delete) a tenant.
   */
  decommission(tenantId: string): Observable<void> {
    return this.http.delete<void>(`/api/admin/tenants/${tenantId}`);
  }

  /**
   * Retry failed provisioning for a tenant.
   */
  retryProvisioning(tenantId: string): Observable<void> {
    return this.http.post<void>(`/api/admin/tenants/${tenantId}/retry-provisioning`, {});
  }

  // ─── Public onboarding (unauthenticated) ─────────────────────────────

  /**
   * Self-service tenant onboarding.
   * Creates a tenant + bootstrap admin atomically.
   */
  onboard(request: TenantOnboardRequest): Observable<TenantDescriptor> {
    return this.http.post<TenantDescriptor>('/api/public/tenants/onboard', request);
  }
}
