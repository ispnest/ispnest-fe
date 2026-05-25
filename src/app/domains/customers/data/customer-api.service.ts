import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import {
  AssignedPlanDto,
  CustomerDto,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  RechargeDto,
  CreateRechargeRequest,
  MacBindingDto,
  HotspotGuestArchiveDto,
  HotspotStatsDto,
  CustomerChargeDto,
  CreateChargeRequest,
  PppoeStatsDto,
  CustomerSessionSummaryDto,
} from './customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/customers';

  getPage(
    page = 0,
    size = 20,
    sort = 'fullName',
    direction = 'asc',
    search = '',
    status = '',
    serviceType = '',
    connected?: boolean,
    hasActiveRecharge?: boolean,
    offlineHours = 0,
  ): Observable<Pageable<CustomerDto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (serviceType) params = params.set('serviceType', serviceType);
    if (connected !== undefined) params = params.set('connected', connected);
    if (hasActiveRecharge !== undefined)
      params = params.set('hasActiveRecharge', hasActiveRecharge);
    if (offlineHours > 0) params = params.set('offlineHours', offlineHours);
    return this.http.get<Pageable<CustomerDto>>(this.base, { params });
  }

  getById(id: string): Observable<CustomerDto> {
    return this.http.get<CustomerDto>(`${this.base}/${id}`);
  }

  getByUsername(username: string): Observable<CustomerDto> {
    const params = new HttpParams().set('username', username);
    return this.http.get<CustomerDto>(this.base, { params });
  }

  create(request: CreateCustomerRequest): Observable<CustomerDto> {
    return this.http.post<CustomerDto>(this.base, request);
  }

  update(id: string, request: UpdateCustomerRequest): Observable<CustomerDto> {
    return this.http.put<CustomerDto>(`${this.base}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  updateStatus(id: string, status: string): Observable<void> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<void>(`${this.base}/${id}/status`, null, { params });
  }

  markConnected(id: string, connected: boolean): Observable<void> {
    const params = new HttpParams().set('connected', connected);
    return this.http.patch<void>(`${this.base}/${id}/connected`, null, { params });
  }

  assignPlanRouter(id: string, planRouterId: string): Observable<void> {
    const params = new HttpParams().set('planRouterId', planRouterId);
    return this.http.patch<void>(`${this.base}/${id}/plan-router`, null, { params });
  }

  getRecharges(id: string): Observable<RechargeDto[]> {
    return this.http.get<RechargeDto[]>(`${this.base}/${id}/recharges`);
  }

  getActiveRecharges(id: string): Observable<RechargeDto[]> {
    return this.http.get<RechargeDto[]>(`${this.base}/${id}/recharges/active`);
  }

  createRecharge(id: string, request: CreateRechargeRequest): Observable<RechargeDto> {
    return this.http.post<RechargeDto>(`${this.base}/${id}/recharges`, request);
  }

  findByPhone(phoneNumber: string): Observable<CustomerDto[]> {
    return this.http.get<CustomerDto[]>(this.base, {
      params: new HttpParams().set('phoneNumber', phoneNumber),
    });
  }

  getMacBindings(id: string): Observable<MacBindingDto[]> {
    return this.http.get<MacBindingDto[]>(`${this.base}/${id}/mac-bindings`);
  }

  archiveGuest(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/archive`, null);
  }

  getHotspotStats(): Observable<HotspotStatsDto> {
    return this.http.get<HotspotStatsDto>(`${this.base}/hotspot/stats`);
  }

  getPppoeStats(): Observable<PppoeStatsDto> {
    return this.http.get<PppoeStatsDto>(`${this.base}/pppoe/stats`);
  }

  getAssignedPlan(id: string): Observable<AssignedPlanDto> {
    return this.http.get<AssignedPlanDto>(`${this.base}/${id}/assigned-plan`);
  }

  getHotspotArchive(page = 0, size = 20, q = ''): Observable<Pageable<HotspotGuestArchiveDto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'archivedAt,desc');
    if (q) params = params.set('q', q);
    return this.http.get<Pageable<HotspotGuestArchiveDto>>(`${this.base}/hotspot/archive`, {
      params,
    });
  }

  // ── Charges ───────────────────────────────────────────────────────────────

  getAllCharges(id: string): Observable<CustomerChargeDto[]> {
    return this.http.get<CustomerChargeDto[]>(`${this.base}/${id}/charges/all`);
  }

  addCharge(id: string, request: CreateChargeRequest): Observable<CustomerChargeDto> {
    return this.http.post<CustomerChargeDto>(`${this.base}/${id}/charges`, request);
  }

  // ── Session SSE stream ────────────────────────────────────────────────────

  /**
   * Opens an SSE connection to stream live session updates for a customer.
   * Returns an Observable that emits CustomerSessionSummaryDto on every event.
   * Complete the observable (unsubscribe) to close the EventSource.
   */
  openSessionStream(id: string): Observable<CustomerSessionSummaryDto> {
    return new Observable((observer) => {
      const token =
        typeof localStorage !== 'undefined' ? localStorage.getItem('ispnest_access_token') : null;

      const controller = new AbortController();

      fetch(`${this.base}/${id}/stream/session`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'text/event-stream',
          'X-API-Version': '1.0',
        },
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok || !response.body) {
            observer.error(new Error(`SSE connection failed: ${response.status}`));
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              observer.complete();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (line.startsWith('data:')) {
                const data = line.slice(5).trim();
                if (data) {
                  try {
                    observer.next(JSON.parse(data) as CustomerSessionSummaryDto);
                  } catch {
                    // ignore malformed frames
                  }
                }
              }
            }
          }
        })
        .catch((e: unknown) => {
          if ((e as { name?: string }).name !== 'AbortError') {
            observer.error(e);
          }
        });

      return () => controller.abort();
    });
  }
}
