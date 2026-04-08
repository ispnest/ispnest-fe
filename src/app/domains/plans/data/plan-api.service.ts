import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import { BandwidthDto, CreateBandwidthRequest, CreatePlanRequest, PlanDto } from './plan.model';

@Injectable({ providedIn: 'root' })
export class PlanApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/plans';

  getPage(
    page = 0,
    size = 20,
    sort = 'name',
    direction = 'asc',
    enabledOnly = false,
  ): Observable<Pageable<PlanDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`)
      .set('enabledOnly', String(enabledOnly));
    return this.http.get<Pageable<PlanDto>>(this.base, { params });
  }

  getById(id: string): Observable<PlanDto> {
    return this.http.get<PlanDto>(`${this.base}/${id}`);
  }

  create(request: CreatePlanRequest): Observable<PlanDto> {
    return this.http.post<PlanDto>(this.base, request);
  }

  update(id: string, request: CreatePlanRequest): Observable<PlanDto> {
    return this.http.put<PlanDto>(`${this.base}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class BandwidthApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/bandwidths';

  getPage(
    page = 0,
    size = 20,
    sort = 'name',
    direction = 'asc',
  ): Observable<Pageable<BandwidthDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);
    return this.http.get<Pageable<BandwidthDto>>(this.base, { params });
  }

  getById(id: string): Observable<BandwidthDto> {
    return this.http.get<BandwidthDto>(`${this.base}/${id}`);
  }

  create(request: CreateBandwidthRequest): Observable<BandwidthDto> {
    return this.http.post<BandwidthDto>(this.base, request);
  }

  update(id: string, request: CreateBandwidthRequest): Observable<BandwidthDto> {
    return this.http.put<BandwidthDto>(`${this.base}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
