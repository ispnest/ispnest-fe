import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterOnboardingApiService } from './onboarding-api.service';

describe('RouterOnboardingApiService', () => {
  let service: RouterOnboardingApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    service = TestBed.inject(RouterOnboardingApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('issueOnboardingToken POSTs to /routers/{id}/onboarding-tokens', () => {
    service.issueOnboardingToken('router-1').subscribe();
    const req = httpMock.expectOne('/api/routers/router-1/onboarding-tokens');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush({ token: 'abc', expiresAt: '2026-01-01T00:00:00Z' });
  });

  it('getManagementState GETs /routers/{id}/management-state', () => {
    service.getManagementState('router-1').subscribe();
    const req = httpMock.expectOne('/api/routers/router-1/management-state');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('reconcile POSTs to /routers/{id}/reconcile', () => {
    service.reconcile('router-1').subscribe();
    const req = httpMock.expectOne('/api/routers/router-1/reconcile');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush({});
  });

  it('getPlanDeploymentsForRouter GETs /routers/{id}/plan-deployments', () => {
    service.getPlanDeploymentsForRouter('router-1').subscribe();
    const req = httpMock.expectOne('/api/routers/router-1/plan-deployments');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('listDiscovered GETs /routers/{id}/discovery/{resource}', () => {
    service.listDiscovered('router-1', 'INTERFACES').subscribe();
    const req = httpMock.expectOne('/api/routers/router-1/discovery/INTERFACES');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('checkPoolOverlap GETs /routers/{id}/discovery/pool-overlap?rangeIp=...', () => {
    service.checkPoolOverlap('router-1', '10.10.0.0/24').subscribe();
    const req = httpMock.expectOne(
      '/api/routers/router-1/discovery/pool-overlap?rangeIp=10.10.0.0/24',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ overlapping: false, conflictingAddresses: [] });
  });
});
