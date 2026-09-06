import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import { sseStream } from '@/app/core/sse';
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
  AdjustChargeRequest,
  ExtendServiceRequest,
  ServiceExtensionDto,
  PppoeStatsDto,
  CustomerSessionSummaryDto,
} from './customer.model';
import {
  CustomerUsageTimeseries,
  NetworkDailyUsage,
  NetworkUsageEvent,
  TopConsumer,
  UsageDeltaEvent,
  UsageSamplePoint,
} from './usage.model';

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

  adjustCharge(
    id: string,
    chargeId: string,
    request: AdjustChargeRequest,
  ): Observable<CustomerChargeDto> {
    return this.http.patch<CustomerChargeDto>(`${this.base}/${id}/charges/${chargeId}`, request);
  }

  // ── Service extensions ────────────────────────────────────────────────────

  extendService(id: string, request: ExtendServiceRequest): Observable<ServiceExtensionDto> {
    return this.http.post<ServiceExtensionDto>(`${this.base}/${id}/service-extensions`, request);
  }

  getServiceExtensions(id: string): Observable<ServiceExtensionDto[]> {
    return this.http.get<ServiceExtensionDto[]>(`${this.base}/${id}/service-extensions`);
  }

  // ── Session SSE stream ────────────────────────────────────────────────────

  /**
   * Opens an auto-reconnecting SSE stream of live session updates for a customer.
   * Unsubscribe to close the connection and stop reconnection.
   */
  openSessionStream(id: string): Observable<CustomerSessionSummaryDto> {
    return sseStream<CustomerSessionSummaryDto>(`${this.base}/${id}/stream/session`, {
      events: ['session-update'],
    });
  }

  // ── Usage timeseries ──────────────────────────────────────────────────────

  /** Per-customer usage timeseries: daily rollup + today's raw tail. Defaults to last 30 days. */
  getUsage(id: string, from?: string, to?: string): Observable<CustomerUsageTimeseries> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<CustomerUsageTimeseries>(`${this.base}/${id}/usage`, { params });
  }

  /** Raw per-packet samples (7-day retention window). Defaults to the last 24 hours. */
  getRawUsage(id: string, from?: string, to?: string): Observable<UsageSamplePoint[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<UsageSamplePoint[]>(`${this.base}/${id}/usage/raw`, { params });
  }

  /** Auto-reconnecting SSE stream of live per-packet usage deltas for a customer. */
  streamUsage(id: string): Observable<UsageDeltaEvent> {
    return sseStream<UsageDeltaEvent>(`${this.base}/${id}/usage/stream`, {
      events: ['usage-delta'],
    });
  }

  // ── Network-wide usage (dashboard) ────────────────────────────────────────

  /** Network daily totals across all customers plus today's live totals (last 30 days). */
  getNetworkDailyUsage(): Observable<NetworkDailyUsage> {
    return this.http.get<NetworkDailyUsage>('/api/usage/network/daily');
  }

  /** Top customers by usage since the start of today. */
  getTopConsumers(limit = 8): Observable<TopConsumer[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<TopConsumer[]>('/api/usage/network/top-consumers', { params });
  }

  /** Paginated top customers by usage since the start of today, for the "view all" modal. */
  getTopConsumersPage(page = 0, size = 20): Observable<Pageable<TopConsumer>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Pageable<TopConsumer>>('/api/usage/network/top-consumers/page', {
      params,
    });
  }

  /** Auto-reconnecting SSE stream of ~5-second network-wide usage aggregates. */
  streamNetworkUsage(): Observable<NetworkUsageEvent> {
    return sseStream<NetworkUsageEvent>('/api/usage/network/stream', {
      events: ['network-usage'],
    });
  }
}
