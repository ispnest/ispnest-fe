import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterDetailStore } from './router-detail.store';

function routerDto() {
  return {
    id: 'router-1',
    name: 'Main Office',
    ipAddress: '10.0.0.1',
    description: null,
    coordinates: null,
    nasType: 'mikrotik',
    status: 'online',
    lastSeen: null,
    managementState: null,
  };
}

function managementStateDto(state: string) {
  return {
    routerId: 'router-1',
    state,
    hardwareSerial: null,
    routerosVersion: null,
    boardName: null,
    lastHeartbeatAt: null,
    lastReconciledAt: null,
    consecutiveFailures: 0,
    recentEvents: [],
  };
}

describe('RouterDetailStore', () => {
  let httpMock: HttpTestingController;
  let store: RouterDetailStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RouterDetailStore, provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    store = TestBed.inject(RouterDetailStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('init fetches router identity, management state, and pools', () => {
    store.init('router-1');

    httpMock.expectOne('/api/routers/router-1').flush(routerDto());
    httpMock
      .expectOne('/api/routers/router-1/management-state')
      .flush(managementStateDto('SYNCED'));
    httpMock
      .expectOne((req) => req.url === '/api/pools')
      .flush({ content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } });

    expect(store.router()?.name).toBe('Main Office');
    expect(store.managementState()?.state).toBe('SYNCED');
    expect(store.routerId).toBe('router-1');
  });

  it('provisioningAccess reflects the fetched management state', () => {
    store.init('router-1');
    httpMock.expectOne('/api/routers/router-1').flush(routerDto());
    httpMock.expectOne('/api/routers/router-1/management-state').flush(managementStateDto('NEW'));
    httpMock
      .expectOne((req) => req.url === '/api/pools')
      .flush({ content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } });

    expect(store.provisioningAccess()).toEqual({ allowed: false });
  });

  it('refreshManagementState re-fetches and updates the signal', () => {
    store.init('router-1');
    httpMock.expectOne('/api/routers/router-1').flush(routerDto());
    httpMock
      .expectOne('/api/routers/router-1/management-state')
      .flush(managementStateDto('BOOTSTRAPPING'));
    httpMock
      .expectOne((req) => req.url === '/api/pools')
      .flush({ content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } });

    store.refreshManagementState();
    httpMock
      .expectOne('/api/routers/router-1/management-state')
      .flush(managementStateDto('SYNCED'));

    expect(store.managementState()?.state).toBe('SYNCED');
  });
});
