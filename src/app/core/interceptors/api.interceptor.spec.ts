import { HttpClient, provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { apiInterceptor } from './api.interceptor';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr(), withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('passes a non-401 error straight through, without attempting a refresh', () => {
    let capturedStatus: number | undefined;
    http.get('/api/portal/my/accounts').subscribe({
      error: (err) => (capturedStatus = err.status),
    });

    httpMock
      .expectOne('/api/portal/my/accounts')
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(capturedStatus).toBe(500);
  });

  it('does not retry a 401 from /api/auth/login', () => {
    let capturedStatus: number | undefined;
    http.post('/api/auth/login', { email: 'x', password: 'y' }).subscribe({
      error: (err) => (capturedStatus = err.status),
    });

    httpMock
      .expectOne('/api/auth/login')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(capturedStatus).toBe(401);
  });

  it('does not retry a 401 from /api/auth/refresh itself (no infinite loop)', () => {
    let capturedStatus: number | undefined;
    http.post('/api/auth/refresh', { refreshToken: 'x' }).subscribe({
      error: (err) => (capturedStatus = err.status),
    });

    httpMock
      .expectOne('/api/auth/refresh')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(capturedStatus).toBe(401);
  });

  it('on a 401 elsewhere, refreshes silently and retries the original request', () => {
    localStorage.setItem('ispnest_refresh_token', 'old-refresh-token');
    let result: unknown;
    http.get('/api/portal/my/accounts').subscribe((res) => (result = res));

    httpMock
      .expectOne('/api/portal/my/accounts')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne('/api/auth/refresh');
    refreshReq.flush({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_expires_in: 604800,
    });

    const retryReq = httpMock.expectOne('/api/portal/my/accounts');
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-access-token');
    retryReq.flush({ ok: true });

    expect(result).toEqual({ ok: true });
  });

  it('on refresh failure, clears tokens and redirects to the portal login for a portal request', () => {
    localStorage.setItem('ispnest_refresh_token', 'old-refresh-token');
    localStorage.setItem('ispnest_access_token', 'stale-access-token');
    const navigateSpy = vi.spyOn(router, 'navigate');

    let capturedStatus: number | undefined;
    http.get('/api/portal/my/accounts').subscribe({
      error: (err) => (capturedStatus = err.status),
    });

    httpMock
      .expectOne('/api/portal/my/accounts')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    httpMock
      .expectOne('/api/auth/refresh')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(capturedStatus).toBe(401);
    expect(localStorage.getItem('ispnest_access_token')).toBeNull();
    expect(localStorage.getItem('ispnest_refresh_token')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(
      ['/portal'],
      expect.objectContaining({ queryParams: expect.anything() }),
    );
  });

  it('two concurrent 401s while a refresh is in flight trigger only one refresh call', () => {
    localStorage.setItem('ispnest_refresh_token', 'old-refresh-token');
    const results: unknown[] = [];
    http.get('/api/portal/a').subscribe((res) => results.push(res));
    http.get('/api/portal/b').subscribe((res) => results.push(res));

    httpMock
      .expectOne('/api/portal/a')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    httpMock
      .expectOne('/api/portal/b')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Only one refresh call should have been triggered for both concurrent 401s.
    const refreshRequests = httpMock.match('/api/auth/refresh');
    expect(refreshRequests).toHaveLength(1);
    refreshRequests[0].flush({
      access_token: 'shared-new-token',
      refresh_token: 'shared-new-refresh',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_expires_in: 604800,
    });

    const retryA = httpMock.expectOne('/api/portal/a');
    const retryB = httpMock.expectOne('/api/portal/b');
    expect(retryA.request.headers.get('Authorization')).toBe('Bearer shared-new-token');
    expect(retryB.request.headers.get('Authorization')).toBe('Bearer shared-new-token');
    retryA.flush({ from: 'a' });
    retryB.flush({ from: 'b' });

    expect(results).toEqual([{ from: 'a' }, { from: 'b' }]);
  });
});
