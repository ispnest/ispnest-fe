import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import { CustomerDto, RechargeDto, CustomerChargeDto, CustomerSessionSummaryDto } from '@/app/domains/customers/data';
import { PaymentDto } from '@/app/domains/payments/data';
import { PlanDto } from '@/app/domains/plans/data';
import { BandwidthDto } from '@/app/domains/plans/data/plan.model';
import { ActiveTechnicianDto } from '@/app/domains/technician/data/staff.model';
/** A router visible in the public self-registration area-picker. */
export type PublicRouterDto = {
  id: string;
  name: string;
  description: string | null;
  coordinates: string;
};

/** Enriched plan+bandwidth response for the public plan-picker cards. */
export type PublicPlanResponse = {
  planRouterId: string | null;
  plan: PlanDto;
  bandwidth: BandwidthDto | null;
};

/** Payment summary for the portal payment page (includes charges + total). */
export type PaymentSummaryResponse = {
  plan: PlanDto;
  bandwidth: BandwidthDto | null;
  pendingCharges: CustomerChargeDto[];
  totalAmount: number;
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
   * Get the specific plan + payment summary for a plan-router deployment.
   * When customerId is provided, pending charges are included.
   */
  getPlanRouter(planRouterId: string, customerId?: string): Observable<PaymentSummaryResponse> {
    let params = new HttpParams();
    if (customerId) params = params.set('customerId', customerId);
    return this.http.get<PaymentSummaryResponse>(`${this.base}/plan-router/${planRouterId}`, {
      params,
    });
  }

  /**
   * Resolve the planRouterId for a different plan on the same router as contextPlanRouterId.
   * Used by the upgrade flow so the payment page always receives a planRouterId.
   */
  resolvePlanRouterForUpgrade(
    contextPlanRouterId: string,
    planId: string,
  ): Observable<{ planRouterId: string }> {
    return this.http.get<{ planRouterId: string }>(
      `${this.base}/plan-router/${contextPlanRouterId}/resolve/${planId}`,
    );
  }

  /** Self-register a new PPPoE customer. */
  register(request: PortalRegistrationRequest): Observable<PortalRegistrationResponse> {
    return this.http.post<PortalRegistrationResponse>(`${this.base}/register`, request);
  }

  /** Get the globally active technician (public, no auth). Returns null on 204. */
  getActiveTechnician(): Observable<ActiveTechnicianDto | null> {
    return this.http.get<ActiveTechnicianDto>(`${this.base}/technician/active`);
  }

  /** Get pending charges for the current customer (authenticated). */
  getMyCharges(customerId: string): Observable<CustomerChargeDto[]> {
    return this.http.get<CustomerChargeDto[]>(`${this.base}/my/charges`, {
      params: new HttpParams().set('customerId', customerId),
    });
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
      const url = `${this.base}/payments/${paymentId}/stream/status`;
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

  /**
   * Open an SSE stream for live RADIUS session events for one of the
   * authenticated customer's PPPoE accounts.
   * Emits `CustomerSessionSummaryDto` frames until the caller unsubscribes.
   */
  openSessionStream(customerId: string): Observable<CustomerSessionSummaryDto> {
    return new Observable((observer) => {
      const token =
        typeof localStorage !== 'undefined' ? localStorage.getItem('ispnest_access_token') : null;
      const controller = new AbortController();

      fetch(`${this.base}/my/${customerId}/stream/session`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'text/event-stream',
          'X-API-Version': '1.0',
        },
        signal: controller.signal,
      }).then(async (response) => {
        if (!response.ok || !response.body) {
          observer.error(new Error(`SSE connection failed: ${response.status}`));
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) { observer.complete(); break; }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const data = line.slice(5).trim();
              if (data) {
                try { observer.next(JSON.parse(data) as CustomerSessionSummaryDto); } catch { /* skip */ }
              }
            }
          }
        }
      }).catch((e: unknown) => {
        if ((e as { name?: string }).name !== 'AbortError') observer.error(e);
      });

      return () => controller.abort();
    });
  }
}
