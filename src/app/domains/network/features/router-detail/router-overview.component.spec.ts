import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { RouterOnboardingApiService } from '@/app/domains/network/data';
import { RouterDetailStore } from './router-detail.store';
import { RouterOverviewComponent } from './router-overview.component';

const MANAGEMENT_STATE = {
  routerId: 'router-1',
  state: 'SYNCED',
  hardwareSerial: 'SN123',
  routerosVersion: '7.24',
  boardName: 'hAP ac2',
  lastHeartbeatAt: null,
  lastReconciledAt: null,
  consecutiveFailures: 0,
  recentEvents: [
    {
      id: 'evt-1',
      category: 'ONBOARDING' as const,
      fromState: 'VERIFYING',
      toState: 'ONBOARDED',
      step: 'HANDOFF',
      source: 'PLATFORM',
      result: 'OK',
      detail: null,
      errorMessage: null,
      actor: null,
      createdAt: new Date().toISOString(),
    },
  ],
};

class FakeRouterDetailStore {
  routerId = 'router-1';
  loading = signal(false);
  router = signal({ name: 'Main Office' });
  managementState = signal<typeof MANAGEMENT_STATE | null>(MANAGEMENT_STATE);
  pools = signal([{ id: 'pool-1', name: 'hotspot-pool', rangeIp: '10.20.0.0/24' }]);
  provisioningAccess = computed(() => ({ allowed: true, reachable: true }) as const);
  refreshManagementState = vi.fn();
  refreshPools = vi.fn();
}

/**
 * The embedded `&lt;app-router-activity-terminal>` is fully self-sufficient (its own resync GET + SSE
 * subscribe via `RouterOnboardingApiService`) — stub just those two methods here so the terminal
 * renders the fixture data without making a real HTTP call or opening a real `fetch`-based SSE
 * stream. Subclassing (rather than replacing the whole service) keeps `reconcile()` etc. wired to
 * the real HttpClient-backed implementation, which the second test below still exercises via
 * `httpMock`.
 */
class FakeOnboardingApi extends RouterOnboardingApiService {
  override getManagementState = vi.fn().mockReturnValue(of(MANAGEMENT_STATE));
  override streamActivityEvents = vi.fn().mockReturnValue(EMPTY);
}

function createComponent() {
  TestBed.configureTestingModule({
    imports: [RouterOverviewComponent],
    providers: [
      provideHttpClient(withXhr()),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: RouterDetailStore, useClass: FakeRouterDetailStore },
      { provide: RouterOnboardingApiService, useClass: FakeOnboardingApi },
    ],
  });
  const fixture = TestBed.createComponent(RouterOverviewComponent);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();
  return { fixture, httpMock, component: fixture.componentInstance };
}

describe('RouterOverviewComponent', () => {
  let httpMock: HttpTestingController;

  afterEach(() => {
    // Flush whatever the embedded RouterPlanAttachmentsComponent's own ngOnInit requested.
    httpMock
      .match((req) => req.url === '/api/plans')
      .forEach((req) =>
        req.flush({ content: [], page: { size: 100, number: 0, totalElements: 0, totalPages: 0 } }),
      );
    httpMock
      .match((req) => req.url === '/api/routers/router-1/plan-deployments')
      .forEach((req) => req.flush([]));
    httpMock.verify();
  });

  it('renders management-state facts, recent events, and pools from the store', () => {
    const created = createComponent();
    httpMock = created.httpMock;

    const text = created.fixture.nativeElement.textContent as string;
    expect(text).toContain('SN123');
    expect(text).toContain('7.24');
    expect(text).toContain('hAP ac2');
    expect(text).toContain('VERIFYING');
    expect(text).toContain('ONBOARDED');
    expect(text).toContain('hotspot-pool');
  });

  it('reconcile triggers the API call and refreshes the store on success', () => {
    const created = createComponent();
    httpMock = created.httpMock;
    const store = TestBed.inject(RouterDetailStore) as unknown as FakeRouterDetailStore;

    created.component.reconcile();
    httpMock.expectOne('/api/routers/router-1/reconcile').flush({
      runId: 'run-1',
      routerId: 'router-1',
      runStatus: 'COMPLETED',
      domainsCompared: 1,
      diffsFound: 0,
      changesCreated: 0,
      routerState: 'SYNCED',
    });

    expect(created.component.reconciling()).toBe(false);
    expect(store.refreshManagementState).toHaveBeenCalled();
  });
});
