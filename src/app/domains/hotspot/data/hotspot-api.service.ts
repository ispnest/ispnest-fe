import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BandwidthDto, PlanDto } from '@/app/domains/plans/data/plan.model';
import {
  HotspotPurchaseRequest,
  HotspotPurchaseResponse,
  HotspotReconnectResponse,
  HotspotStatusResponse,
} from './hotspot.model';

/** Response from /api/hotspot/plans - plan with embedded bandwidth */
export type HotspotPlanResponse = {
  plan: PlanDto;
  bandwidth: BandwidthDto | null;
};

@Injectable({ providedIn: 'root' })
export class HotspotApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/hotspot';

  /**
   * Get available hotspot plans with embedded bandwidth info.
   * This is a public endpoint - no authentication required.
   */
  getPlansWithBandwidth(): Observable<HotspotPlanResponse[]> {
    return this.http.get<HotspotPlanResponse[]>(`${this.base}/plans`);
  }

  /**
   * Get available hotspot plans (extracts just the plan from the response).
   * @deprecated Use getPlansWithBandwidth() to avoid extra API calls for bandwidth info.
   */
  getPlans(): Observable<PlanDto[]> {
    return this.getPlansWithBandwidth().pipe(map((responses) => responses.map((r) => r.plan)));
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
