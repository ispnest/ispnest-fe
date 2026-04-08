import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated', () => {
    expect(service.isAuthenticated()).toBeFalsy();
    expect(service.currentUser()).toBeNull();
  });

  it('loadCurrentUser() sets currentUser on success', () => {
    service.loadCurrentUser().subscribe((user) => {
      expect(user).toBeTruthy();
      expect(service.currentUser()?.username).toBe('admin');
      expect(service.isAuthenticated()).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/auth/me');
    req.flush({ username: 'admin', roles: ['ROLE_ADMIN'] });
  });

  it('loadCurrentUser() sets null on 401', () => {
    service.loadCurrentUser().subscribe((user) => {
      expect(user).toBeNull();
      expect(service.isAuthenticated()).toBeFalsy();
    });

    const req = httpMock.expectOne('/api/auth/me');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});
