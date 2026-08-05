import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import { LinkCustomerRequest } from './customer-link.model';
import {
  CreateLeaseRequest,
  LeaseDto,
  TerminateLeaseRequest,
  UpdateLeaseRequest,
} from './lease.model';

@Injectable({ providedIn: 'root' })
export class LeaseApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/leases';

  getPage(
    page = 0,
    size = 20,
    sort = 'startDate,desc',
    status = '',
    propertyId = '',
    renterId = '',
  ): Observable<Pageable<LeaseDto>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    if (status) params = params.set('status', status);
    if (propertyId) params = params.set('propertyId', propertyId);
    if (renterId) params = params.set('renterId', renterId);
    return this.http.get<Pageable<LeaseDto>>(this.base, { params });
  }

  getById(id: string): Observable<LeaseDto> {
    return this.http.get<LeaseDto>(`${this.base}/${id}`);
  }

  create(request: CreateLeaseRequest): Observable<LeaseDto> {
    return this.http.post<LeaseDto>(this.base, request);
  }

  update(id: string, request: UpdateLeaseRequest): Observable<LeaseDto> {
    return this.http.put<LeaseDto>(`${this.base}/${id}`, request);
  }

  activate(id: string): Observable<LeaseDto> {
    return this.http.post<LeaseDto>(`${this.base}/${id}/activate`, null);
  }

  terminate(id: string, request: TerminateLeaseRequest): Observable<LeaseDto> {
    return this.http.post<LeaseDto>(`${this.base}/${id}/terminate`, request);
  }

  linkCustomer(id: string, request: LinkCustomerRequest): Observable<LeaseDto> {
    return this.http.post<LeaseDto>(`${this.base}/${id}/link-customer`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
