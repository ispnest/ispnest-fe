import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerDto, RechargeDto } from '@/app/domains/customers/data';
import { PaymentDto } from '@/app/domains/payments/data';
import { PlanDto } from '@/app/domains/plans/data';
import { BandwidthDto } from '@/app/domains/plans/data/plan.model';

/** A router visible in the public self-registration area-picker. */
export type PublicRouterDto = {
  id: string;
  name: string;
  description: string | null;
  coordinates: string;
};

/** Enriched plan+bandwidth response for the public plan-picker cards. */
export type PublicPlanResponse = {
  plan: PlanDto;
  bandwidth: BandwidthDto | null;
};

/** Registration request sent to POST /portal/register. */
export type PortalRegistrationRequest = {
  fullName: string;
  phoneNumber: string;
  email?: string;
  coordinates?: string;
  routerId: string;
  planId: string;
};

/** Lean response after successful self-registration (no PPPoE credentials). */
export type PortalRegistrationResponse = {
  id: string;
  accountCode: string;
  fullName: string;
  phoneNumber: string | null;
  status: string;
  connected: boolean;
  createdAt: string;
};

/**
 * Public API service for the customer self-service portal.
 * These endpoints don't require authentication.
 */
@Injectable({ providedIn: 'root' })
export class PortalApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/portal';

  lookupByPhone(phoneNumber: string): Observable<CustomerDto[]> {
    const params = new HttpParams().set('phoneNumber', phoneNumber);
    return this.http.get<CustomerDto[]>(`${this.base}/auth/lookup`, { params });
  }

  getCustomer(id: string): Observable<CustomerDto> {
    return this.http.get<CustomerDto>(`${this.base}/customer/${id}`);
  }

  getActiveRecharges(customerId: string): Observable<RechargeDto[]> {
    return this.http.get<RechargeDto[]>(`${this.base}/customer/${customerId}/recharges/active`);
  }

  getPayments(customerId: string): Observable<PaymentDto[]> {
    return this.http.get<PaymentDto[]>(`${this.base}/customer/${customerId}/payments`);
  }

  getPlans(): Observable<PlanDto[]> {
    return this.http.get<PlanDto[]>(`${this.base}/plans`);
  }

  getPlan(id: string): Observable<PlanDto> {
    return this.http.get<PlanDto>(`${this.base}/plans/${id}`);
  }

  /** List routers that have coordinates — used in self-registration area picker. */
  getRouters(): Observable<PublicRouterDto[]> {
    return this.http.get<PublicRouterDto[]>(`${this.base}/routers`);
  }

  /** List publicly-available PPPoE plans for the selected router, enriched with bandwidth. */
  getRouterPlans(routerId: string): Observable<PublicPlanResponse[]> {
    return this.http.get<PublicPlanResponse[]>(`${this.base}/routers/${routerId}/plans`);
  }

  /** Self-register a new PPPoE customer. */
  register(request: PortalRegistrationRequest): Observable<PortalRegistrationResponse> {
    return this.http.post<PortalRegistrationResponse>(`${this.base}/register`, request);
  }
}
