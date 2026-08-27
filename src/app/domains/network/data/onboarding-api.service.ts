import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { sseStream } from '@/app/core/sse';
import { PlanRouterDto } from '@/app/domains/plans/data';
import {
  DiscoveredItem,
  DiscoveryResource,
  IssueOnboardingTokenResponse,
  PoolOverlapResultDto,
  ProvisioningProfileDto,
  ReconciliationResultDto,
  RouterActivityEventDto,
  RouterManagementStateDto,
  UpsertProvisioningProfileRequest,
} from './onboarding.model';

@Injectable({ providedIn: 'root' })
export class RouterOnboardingApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/routers';

  issueOnboardingToken(routerId: string): Observable<IssueOnboardingTokenResponse> {
    return this.http.post<IssueOnboardingTokenResponse>(
      `${this.base}/${routerId}/onboarding-tokens`,
      null,
    );
  }

  getManagementState(routerId: string): Observable<RouterManagementStateDto> {
    return this.http.get<RouterManagementStateDto>(`${this.base}/${routerId}/management-state`);
  }

  reconcile(routerId: string): Observable<ReconciliationResultDto> {
    return this.http.post<ReconciliationResultDto>(`${this.base}/${routerId}/reconcile`, null);
  }

  getPlanDeploymentsForRouter(routerId: string): Observable<PlanRouterDto[]> {
    return this.http.get<PlanRouterDto[]>(`${this.base}/${routerId}/plan-deployments`);
  }

  getProvisioningProfile(routerId: string): Observable<ProvisioningProfileDto> {
    return this.http.get<ProvisioningProfileDto>(`${this.base}/${routerId}/provisioning-profile`);
  }

  upsertProvisioningProfile(
    routerId: string,
    request: UpsertProvisioningProfileRequest,
  ): Observable<ProvisioningProfileDto> {
    return this.http.put<ProvisioningProfileDto>(
      `${this.base}/${routerId}/provisioning-profile`,
      request,
    );
  }

  /**
   * The router's actual, live listing for `resource` — raw RouterOS fields, unmapped. Only
   * available once the router has completed onboarding far enough to have a REST API credential;
   * callers must degrade gracefully (e.g. fall back to manual entry) on a 409/502 rather than
   * blocking on this.
   */
  listDiscovered(routerId: string, resource: DiscoveryResource): Observable<DiscoveredItem[]> {
    return this.http.get<DiscoveredItem[]>(`${this.base}/${routerId}/discovery/${resource}`);
  }

  /** Whether `rangeIp` (a CIDR) overlaps any address the router is actually currently configured with. */
  checkPoolOverlap(routerId: string, rangeIp: string): Observable<PoolOverlapResultDto> {
    return this.http.get<PoolOverlapResultDto>(`${this.base}/${routerId}/discovery/pool-overlap`, {
      params: new HttpParams().set('rangeIp', rangeIp),
    });
  }

  /**
   * Live router-wide activity feed — one `activity.recorded` event per audit row written for this
   * router from the moment of subscription (onboarding steps, desired-config writes, reconciliation
   * runs, provisioning-profile edits, pool CRUD, status flips). Auto-reconnecting; on reconnect,
   * re-fetch {@link getManagementState} (which already returns `recentEvents`) to resync before
   * resuming.
   */
  streamActivityEvents(routerId: string): Observable<RouterActivityEventDto> {
    return sseStream<RouterActivityEventDto>(`${this.base}/${routerId}/activity/events`, {
      events: ['activity.recorded'],
    });
  }
}
