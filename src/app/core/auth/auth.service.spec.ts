import { provideHttpClient } from '@angular/common/http';
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

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
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
});
