import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
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
  /** Phone number to use as portal login username. */
  loginUsername: string | null;
  /** Human-readable login instructions shown on the success screen. */
  loginNote: string | null;
};

/** In-app notification returned from the portal notifications endpoint. */
export type NotificationDto = {
  id: string;
  customerId: string;
  /** Account code of the account that triggered this notification. */
  accountCode: string | null;
  subject: string;
  body: string | null;
  channel: string;
  category: string | null;
  status: string;
  createdAt: string;
  readAt: string | null;
};

/**
 * Public API service for the customer self-service portal.
 * Public endpoints don't require authentication; /my/** endpoints use Bearer JWT.
 */
@Injectable({ providedIn: 'root' })
export class PortalApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/portal';

  // ── Public endpoints ──────────────────────────────────────────────────────

  lookupByPhone(phoneNumber: string): Observable<CustomerDto[]> {
    const params = new HttpParams().set('phoneNumber', phoneNumber);
    return this.http.get<CustomerDto[]>(`${this.base}/auth/lookup`, { params });
  }

  /**
   * Resolve an account code to the portal login phone number.
   * Used when the customer enters their account code on the login page.
   */
  resolveAccountCode(code: string): Observable<{ phoneNumber: string }> {
    const params = new HttpParams().set('code', code);
    return this.http.get<{ phoneNumber: string }>(`${this.base}/auth/resolve`, { params });
  }

  getCustomer(id: string): Observable<CustomerDto> {
    return this.http.get<CustomerDto>(`${this.base}/customer/${id}`);
  }

  getActiveRecharges(customerId: string): Observable<RechargeDto[]> {
    return this.http.get<RechargeDto[]>(`${this.base}/customer/${customerId}/recharges/active`);
  }

  getAccountRecharges(customerId: string): Observable<RechargeDto[]> {
    return this.getActiveRecharges(customerId);
  }

  getPayments(customerId: string, page = 0, size = 10): Observable<Pageable<PaymentDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Pageable<PaymentDto>>(`${this.base}/customer/${customerId}/payments`, {
      params,
    });
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

  /**
   * List publicly-available PPPoE plans by plan-router deployment ID.
   * Use this when you have `customer.defaultPlanRouterId` (a PlanRouter row ID),
   * not the raw Router ID.
   */
  getPlansByPlanRouter(planRouterId: string): Observable<PublicPlanResponse[]> {
    return this.http.get<PublicPlanResponse[]>(`${this.base}/plan-router/${planRouterId}/plans`);
  }

  /**
   * Get the specific plan + bandwidth details for a plan-router deployment.
   * Returns the plan the customer will be charged for when paying via this deployment.
   */
  getPlanRouter(planRouterId: string): Observable<PublicPlanResponse> {
    return this.http.get<PublicPlanResponse>(`${this.base}/plan-router/${planRouterId}`);
  }

  /** Self-register a new PPPoE customer. */
  register(request: PortalRegistrationRequest): Observable<PortalRegistrationResponse> {
    return this.http.post<PortalRegistrationResponse>(`${this.base}/register`, request);
  }

  // ── Authenticated endpoints (CUSTOMER JWT required) ───────────────────────

  /** All PPPoE accounts for the logged-in person (identified via contact_id JWT claim). */
  getMyAccounts(): Observable<CustomerDto[]> {
    return this.http.get<CustomerDto[]>(`${this.base}/my/accounts`);
  }

  /** Paginated IN_APP notifications across all accounts. */
  getMyNotifications(page = 0, size = 20): Observable<Pageable<NotificationDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Pageable<NotificationDto>>(`${this.base}/my/notifications`, { params });
  }

  /** Mark a single notification as read. */
  markNotificationRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/my/notifications/${id}/read`, {});
  }

  /** Mark all notifications as read across all accounts. */
  markAllNotificationsRead(): Observable<void> {
    return this.http.patch<void>(`${this.base}/my/notifications/read-all`, {});
  }

  /** Change the current user's portal password. */
  changePassword(newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/my/password`, { newPassword });
  }

  /**
   * Open an SSE stream that fires once when the payment reaches a terminal state.
   * The observable emits a single `PaymentStatusEvent` then completes.
   * No auth header required — the unguessable UUID paymentId acts as the session key.
   */
  streamPaymentStatus(paymentId: string): Observable<{ status: string; failureReason?: string }> {
    return new Observable((observer) => {
      const url = `${this.base}/payments/${paymentId}/status-stream`;
      const es = new EventSource(url);

      const onTerminal = (e: MessageEvent) => {
        try {
          observer.next(JSON.parse(e.data) as { status: string; failureReason?: string });
        } catch {
          observer.next({ status: e.type });
        }
        observer.complete();
        es.close();
      };

      es.addEventListener('completed', onTerminal);
      es.addEventListener('failed', onTerminal);

      es.onerror = () => {
        // SSE connection dropped (server closed after send, or network error)
        // Only error if we haven't already completed
        es.close();
        if (!observer.closed) {
          observer.error(new Error('SSE connection lost'));
        }
      };

      return () => es.close();
    });
  }
}
