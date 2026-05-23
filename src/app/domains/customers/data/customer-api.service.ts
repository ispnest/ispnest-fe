import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import {
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
  ): Observable<Pageable<CustomerDto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (serviceType) params = params.set('serviceType', serviceType);
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
}
