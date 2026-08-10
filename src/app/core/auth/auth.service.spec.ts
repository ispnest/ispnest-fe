import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserIdentity } from '@/app/core/models/common.model';
import { AuthService } from './auth.service';

export const adminIdentity: UserIdentity = {
  id: '1',
  email: 'admin@example.com',
  userType: 'ADMIN',
  displayName: 'Admin',
  phoneNumber: null,
  avatarUrl: null,
  emailVerified: true,
  contactId: null,
  forcePasswordChange: false,
  staffProfileId: null,
  roles: ['ROLE_ADMIN'],
  permissions: [],
  lastLoginAt: null,
};

/** Store a structurally valid, unexpired JWT so hasValidToken()/isTokenExpired() pass. */
export function seedValidToken(): void {
  const payload = btoa(
    JSON.stringify({ sub: 'admin@example.com', exp: Math.floor(Date.now() / 1000) + 3600 }),
  );
  const token = `${btoa(JSON.stringify({ alg: 'none' }))}.${payload}.sig`;
  localStorage.setItem('ispnest_access_token', token);
  localStorage.setItem('ispnest_refresh_token', 'test-refresh');
  localStorage.setItem('ispnest_token_expiry', String(Date.now() + 3_600_000));
}

/** Builds a structurally valid JWT string carrying arbitrary claims, for parseJwt() to decode. */
function buildJwt(claims: Record<string, unknown>): string {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, ...claims }));
  return `${btoa(JSON.stringify({ alg: 'none' }))}.${payload}.sig`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated', () => {
    expect(service.isAuthenticated()).toBeFalsy();
    expect(service.currentUser()).toBeNull();
  });

  it('loadCurrentUser() sets currentUser on success', () => {
    seedValidToken();
    service.loadCurrentUser().subscribe((user) => {
      expect(user).toBeTruthy();
      expect(service.currentUser()?.email).toBe('admin@example.com');
      expect(service.isAuthenticated()).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/auth/me');
    req.flush(adminIdentity);
  });

  it('loadCurrentUser() sets null on 401', () => {
    seedValidToken();
    service.loadCurrentUser().subscribe((user) => {
      expect(user).toBeNull();
      expect(service.isAuthenticated()).toBeFalsy();
    });

    const req = httpMock.expectOne('/api/auth/me');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  describe('refreshToken', () => {
    it('resolves null and does nothing when there is no stored refresh token', () => {
      let result: unknown = 'unset';
      service.refreshToken().subscribe((res) => (result = res));

      expect(result).toBeNull();
      httpMock.expectNone('/api/auth/refresh');
    });

    it('on success, stores the new tokens AND updates currentUser() from the new access token claims', () => {
      localStorage.setItem('ispnest_refresh_token', 'old-refresh-token');
      const newAccessToken = buildJwt({
        sub: '254712345678',
        user_id: 'u-1',
        user_type: 'CUSTOMER',
        contact_id: 'c-1',
        force_password_change: false,
      });

      service.refreshToken().subscribe();

      const req = httpMock.expectOne('/api/auth/refresh');
      expect(req.request.body).toEqual({ refreshToken: 'old-refresh-token' });
      req.flush({
        access_token: newAccessToken,
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_expires_in: 604800,
      });

      expect(localStorage.getItem('ispnest_access_token')).toBe(newAccessToken);
      expect(localStorage.getItem('ispnest_refresh_token')).toBe('new-refresh-token');
      // This is the real gap the live browser session caught: refreshToken() used to only store
      // tokens without re-deriving currentUser(), leaving stale claims (e.g. forcePasswordChange)
      // in memory until the next full page load.
      expect(service.currentUser()?.id).toBe('u-1');
      expect(service.currentUser()?.email).toBe('254712345678');
      expect(service.currentUser()?.contactId).toBe('c-1');
    });

    it('on failure, clears tokens and sets currentUser() to null', () => {
      localStorage.setItem('ispnest_refresh_token', 'old-refresh-token');
      localStorage.setItem('ispnest_access_token', 'stale-access-token');

      let result: unknown = 'unset';
      service.refreshToken().subscribe((res) => (result = res));

      const req = httpMock.expectOne('/api/auth/refresh');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(result).toBeNull();
      expect(localStorage.getItem('ispnest_access_token')).toBeNull();
      expect(localStorage.getItem('ispnest_refresh_token')).toBeNull();
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('applyTokenResponse', () => {
    it('stores tokens and sets currentUser() from the access token claims in one call', () => {
      const accessToken = buildJwt({
        sub: '254712345678',
        user_id: 'u-2',
        user_type: 'CUSTOMER',
        force_password_change: true,
      });

      service.applyTokenResponse({
        access_token: accessToken,
        refresh_token: 'refresh-value',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_expires_in: 604800,
      });

      expect(localStorage.getItem('ispnest_access_token')).toBe(accessToken);
      expect(localStorage.getItem('ispnest_refresh_token')).toBe('refresh-value');
      expect(service.currentUser()?.id).toBe('u-2');
      expect(service.currentUser()?.forcePasswordChange).toBe(true);
    });
  });
});
