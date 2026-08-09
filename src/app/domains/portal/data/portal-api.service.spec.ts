import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PortalApiService } from './portal-api.service';

describe('PortalApiService', () => {
  let service: PortalApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PortalApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('changePassword() PATCHes /api/portal/my/password and resolves the token response', () => {
    let result: unknown;
    service.changePassword('NewPassword123').subscribe((res) => (result = res));

    const req = httpMock.expectOne('/api/portal/my/password');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ newPassword: 'NewPassword123' });

    const tokenResponse = {
      access_token: 'a',
      refresh_token: 'r',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_expires_in: 604800,
    };
    req.flush(tokenResponse);

    expect(result).toEqual(tokenResponse);
  });

  it('forgotPassword() POSTs /api/portal/auth/forgot-password with the phone number', () => {
    let completed = false;
    service.forgotPassword('254712345678').subscribe(() => (completed = true));

    const req = httpMock.expectOne('/api/portal/auth/forgot-password');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ phoneNumber: '254712345678' });
    req.flush(null);

    expect(completed).toBe(true);
  });

  it('resetPassword() POSTs /api/portal/auth/reset-password with the token and new password', () => {
    let completed = false;
    service.resetPassword('raw-token', 'NewPassword123').subscribe(() => (completed = true));

    const req = httpMock.expectOne('/api/portal/auth/reset-password');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'raw-token', newPassword: 'NewPassword123' });
    req.flush(null);

    expect(completed).toBe(true);
  });
});
