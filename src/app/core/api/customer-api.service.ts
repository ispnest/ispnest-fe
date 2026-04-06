import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '../models/common.model';
import { CustomerDto, CreateCustomerRequest, UpdateCustomerRequest, RechargeDto, CreateRechargeRequest } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/customers';

  getPage(page = 0, size = 20, sort = 'fullName', direction = 'asc'): Observable<Page<CustomerDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);
    return this.http.get<Page<CustomerDto>>(this.base, { params });
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

  getRecharges(id: string): Observable<RechargeDto[]> {
    return this.http.get<RechargeDto[]>(`${this.base}/${id}/recharges`);
  }

  getActiveRecharges(id: string): Observable<RechargeDto[]> {
    return this.http.get<RechargeDto[]>(`${this.base}/${id}/recharges/active`);
  }

  createRecharge(id: string, request: CreateRechargeRequest): Observable<RechargeDto> {
    return this.http.post<RechargeDto>(`${this.base}/${id}/recharges`, request);
  }

  findByPhone(phoneNumber: string): Observable<CustomerDto | null> {
    return this.http.get<CustomerDto>(`${this.base}`, {
      params: new HttpParams().set('phoneNumber', phoneNumber)
    });
  }
}


