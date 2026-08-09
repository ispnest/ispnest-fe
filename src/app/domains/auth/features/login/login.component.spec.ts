import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { adminIdentity, seedValidToken } from '@/app/core/auth/auth.service.spec';
import { LoginComponent } from './login.component';

function createComponent(queryParams: Record<string, string>) {
  TestBed.configureTestingModule({
    imports: [LoginComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { queryParams } } },
    ],
  });
  return TestBed.createComponent(LoginComponent);
}

describe('LoginComponent', () => {
  let httpMock: HttpTestingController;
  let router: Router;
  let auth: AuthService;

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('exchanges the oauth2 code and navigates on success', () => {
    const fixture = createComponent({ oauth2_success: 'true', code: 'abc123' });
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    auth = TestBed.inject(AuthService);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const callbackSpy = vi.spyOn(auth, 'handleOAuth2Callback');

    fixture.detectChanges(); // triggers ngOnInit

    const req = httpMock.expectOne('/api/auth/oauth2/exchange');
    expect(req.request.body).toEqual({ code: 'abc123' });
    req.flush({ access_token: 'access-value', refresh_token: 'refresh-value', expires_in: 3600 });

    expect(callbackSpy).toHaveBeenCalledWith('access-value', 'refresh-value', 3600);
    expect(navigateSpy).toHaveBeenCalled();
    expect(fixture.componentInstance.errorMessage()).toBe('');
  });

  it('sets errorMessage and does not navigate when the exchange fails', () => {
    const fixture = createComponent({ oauth2_success: 'true', code: 'expired-code' });
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.detectChanges();

    httpMock
      .expectOne('/api/auth/oauth2/exchange')
      .flush('Bad Request', { status: 400, statusText: 'Bad Request' });

    expect(fixture.componentInstance.errorMessage()).toContain('expired');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('sets errorMessage from the error/error_description query params', () => {
    const fixture = createComponent({
      error: 'access_denied',
      error_description: 'User cancelled the login',
    });
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    expect(fixture.componentInstance.errorMessage()).toBe('User cancelled the login');
  });

  it('redirects immediately without touching the form when already authenticated', () => {
    const fixture = createComponent({});
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    auth = TestBed.inject(AuthService);
    seedValidToken();
    auth.currentUser.set(adminIdentity);
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalled();
  });
});
