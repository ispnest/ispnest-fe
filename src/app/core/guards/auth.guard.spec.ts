import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth.service';
import { authGuard } from './auth.guard';
import { firstValueFrom, isObservable, Observable } from 'rxjs';

describe('authGuard', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const routeSnapshot = {} as ActivatedRouteSnapshot;
  const stateSnapshot = {} as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => httpMock.verify());

  it('should allow access if user is authenticated', async () => {
    authService.currentUser.set({ username: 'admin', roles: ['ROLE_ADMIN'] });
    const result = await TestBed.runInInjectionContext(() =>
      authGuard(routeSnapshot, stateSnapshot)
    );
    expect(result).toBeTruthy();
  });

  it('should redirect to /login if not authenticated and session fails', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    const guardObservable = TestBed.runInInjectionContext(() =>
      authGuard(routeSnapshot, stateSnapshot)
    ) as Observable<boolean>;

    // Subscribing triggers the HTTP call synchronously via Angular testing backend
    const resultPromise = firstValueFrom(guardObservable);

    // Request is now queued — flush it with 401
    const req = httpMock.expectOne('/api/auth/me');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const result = await resultPromise;
    expect(result).toBeFalsy();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});



