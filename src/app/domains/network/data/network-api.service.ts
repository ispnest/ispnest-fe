import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '@/app/core/models/common.model';
import { CreatePoolRequest, CreateRouterRequest, PoolDto, RouterDto } from './network.model';

@Injectable({ providedIn: 'root' })
export class RouterApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/routers';

  getAll(): Observable<RouterDto[]> {
    return this.http.get<RouterDto[]>(`${this.base}/all`);
  }

  getPage(page = 0, size = 20, sort = 'name', direction = 'asc'): Observable<Page<RouterDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);
    return this.http.get<Page<RouterDto>>(this.base, { params });
  }

  getById(id: string): Observable<RouterDto> {
    return this.http.get<RouterDto>(`${this.base}/${id}`);
  }

  create(request: CreateRouterRequest): Observable<RouterDto> {
    return this.http.post<RouterDto>(this.base, request);
  }

  update(id: string, request: CreateRouterRequest): Observable<RouterDto> {
    return this.http.put<RouterDto>(`${this.base}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  updateStatus(id: string, status: string): Observable<void> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<void>(`${this.base}/${id}/status`, null, { params });
  }

  testConnection(id: string): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${this.base}/${id}/test-connection`, null);
  }
}

@Injectable({ providedIn: 'root' })
export class PoolApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/pools';

  getAll(): Observable<PoolDto[]> {
    return this.http.get<PoolDto[]>(`${this.base}/all`);
  }

  getPage(page = 0, size = 20, sort = 'name', direction = 'asc'): Observable<Page<PoolDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);
    return this.http.get<Page<PoolDto>>(this.base, { params });
  }

  getById(id: string): Observable<PoolDto> {
    return this.http.get<PoolDto>(`${this.base}/${id}`);
  }

  getPools(routerId: string): Observable<Page<PoolDto>> {
    const params = new HttpParams().set('routerId', routerId);
    return this.http.get<Page<PoolDto>>(this.base, { params });
  }

  create(request: CreatePoolRequest): Observable<PoolDto> {
    return this.http.post<PoolDto>(this.base, request);
  }

  update(id: string, request: CreatePoolRequest): Observable<PoolDto> {
    return this.http.put<PoolDto>(`${this.base}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

