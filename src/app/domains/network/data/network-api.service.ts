import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
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

  testConnection(id: string): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${this.base}/${id}/test-connection`, null);
  }

  /**
   * Open an SSE connection to receive router heartbeat updates every ~60 s.
   * Uses the Fetch API (with Authorization header) instead of native EventSource so that the
   * JWT Bearer token can be forwarded — native EventSource does not support custom headers.
   *
   * Each emission is a {@link RouterHeartbeatUpdate}: a plain object mapping routerId strings
   * to ISO-8601 lastSeen strings.
   */
  streamHeartbeats(): Observable<RouterHeartbeatUpdate> {
    return new Observable<RouterHeartbeatUpdate>((observer) => {
      const token =
        typeof localStorage !== 'undefined' ? localStorage.getItem('ispnest_access_token') : null;

      const controller = new AbortController();

      fetch(`${this.base}/heartbeat/stream`, {
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
                    observer.next(JSON.parse(data) as RouterHeartbeatUpdate);
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
