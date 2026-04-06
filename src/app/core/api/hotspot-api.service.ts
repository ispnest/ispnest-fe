import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HotspotPurchaseRequest, HotspotPurchaseResponse, HotspotStatusResponse, HotspotReconnectResponse } from '../models/hotspot.model';
import { PlanDto } from '../models/plan.model';

@Injectable({ providedIn: 'root' })
export class HotspotApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/hotspot';

  getPlans(): Observable<PlanDto[]> {
    return this.http.get<PlanDto[]>(`${this.base}/plans`);
  }

  purchase(request: HotspotPurchaseRequest): Observable<HotspotPurchaseResponse> {
    return this.http.post<HotspotPurchaseResponse>(`${this.base}/purchase`, request);
  }

  checkStatus(paymentId: string): Observable<HotspotStatusResponse> {
    return this.http.get<HotspotStatusResponse>(`${this.base}/status/${paymentId}`);
  }

  reconnectCheck(mac: string): Observable<HotspotReconnectResponse> {
    const params = new HttpParams().set('mac', mac);
    return this.http.get<HotspotReconnectResponse>(`${this.base}/reconnect-check`, { params });
  }
}

