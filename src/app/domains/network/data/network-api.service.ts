import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import { sseStream } from '@/app/core/sse';
import {
  CreatePoolRequest,
  CreateRouterRequest,
  PoolDto,
  PoolGroupDto,
  RouterDto,
  RouterHeartbeatUpdate,
} from './network.model';

@Injectable({ providedIn: 'root' })
export class RouterApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/routers';

  getAll(): Observable<RouterDto[]> {
    return this.http.get<RouterDto[]>(`${this.base}/all`);
  }

  getPage(page = 0, size = 20, sort = 'name', direction = 'asc'): Observable<Pageable<RouterDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);
    return this.http.get<Pageable<RouterDto>>(this.base, { params });
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

  /**
   * Auto-reconnecting SSE stream of router heartbeat updates (~every 60 s).
   * Each emission is a {@link RouterHeartbeatUpdate}: a plain object mapping routerId strings
   * to ISO-8601 lastSeen strings. Unsubscribe to close the connection.
   */
  streamHeartbeats(): Observable<RouterHeartbeatUpdate> {
    return sseStream<RouterHeartbeatUpdate>(`${this.base}/heartbeat/stream`, {
      events: ['heartbeat'],
    });
  }
}

@Injectable({ providedIn: 'root' })
export class PoolApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/pools';

  /** All pools grouped by name — no pagination. Used by the pools-list component. */
  getAll(): Observable<PoolGroupDto[]> {
    return this.http.get<PoolGroupDto[]>(`${this.base}/all`);
  }

  /**
   * Paginated groups (2-query, no N+1). Used by the pools-list paginator.
   * Each page entry is a PoolGroupDto with a `routers` array.
   */
  getGroupedPage(
    page = 0,
    size = 20,
    sort = 'name',
    direction = 'asc',
  ): Observable<Pageable<PoolGroupDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);
    return this.http.get<Pageable<PoolGroupDto>>(`${this.base}/grouped`, { params });
  }

  /**
   * Flat paginated pool rows — used by plan-form dropdowns.
   * When routerId is supplied, returns only that router's pools.
   */
  getPage(page = 0, size = 20, sort = 'name', direction = 'asc'): Observable<Pageable<PoolDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);
    return this.http.get<Pageable<PoolDto>>(this.base, { params });
  }

  getById(id: string): Observable<PoolDto> {
    return this.http.get<PoolDto>(`${this.base}/${id}`);
  }

  getPools(routerId: string): Observable<Pageable<PoolDto>> {
    const params = new HttpParams().set('routerId', routerId);
    return this.http.get<Pageable<PoolDto>>(this.base, { params });
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
