import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerDto, RechargeDto } from '@/app/domains/customers/data';
import { PaymentDto } from '@/app/domains/payments/data';
import { PlanDto } from '@/app/domains/plans/data';

/**
 * Public API service for the customer self-service portal.
 * These endpoints don't require authentication - they use session-based
 * customer identification.
 */
@Injectable({ providedIn: 'root' })
export class PortalApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/portal';

  /**
   * Look up all accounts associated with a phone number.
   * Returns a list — one account for most customers, multiple for persons
   * with PPPoE at several premises (home, gym, office, etc.).
   */
  lookupByPhone(phoneNumber: string): Observable<CustomerDto[]> {
    const params = new HttpParams().set('phoneNumber', phoneNumber);
    return this.http.get<CustomerDto[]>(`${this.base}/auth/lookup`, { params });
  }

  /**
   * Get customer details by ID.
   */
  getCustomer(id: string): Observable<CustomerDto> {
    return this.http.get<CustomerDto>(`${this.base}/customer/${id}`);
  }

  /**
   * Get active recharges for a customer.
   */
  getActiveRecharges(customerId: string): Observable<RechargeDto[]> {
    return this.http.get<RechargeDto[]>(`${this.base}/customer/${customerId}/recharges/active`);
  }

  /**
   * Get payment history for a customer.
   */
  getPayments(customerId: string): Observable<PaymentDto[]> {
    return this.http.get<PaymentDto[]>(`${this.base}/customer/${customerId}/payments`);
  }

  /**
   * Get available plans for upgrade/purchase.
   */
  getPlans(): Observable<PlanDto[]> {
    return this.http.get<PlanDto[]>(`${this.base}/plans`);
  }

  /**
   * Get a specific plan by ID.
   */
  getPlan(id: string): Observable<PlanDto> {
    return this.http.get<PlanDto>(`${this.base}/plans/${id}`);
  }
}
