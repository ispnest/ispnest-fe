import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { PortalResetPasswordComponent } from './portal-reset-password.component';

function createComponent(token: string | null) {
  TestBed.configureTestingModule({
    imports: [PortalResetPasswordComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { queryParamMap: convertToParamMap(token ? { token } : {}) },
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(PortalResetPasswordComponent);
  fixture.detectChanges();
  return {
    component: fixture.componentInstance,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('PortalResetPasswordComponent', () => {
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock.verify();
  });

  it('with no token query param, token() is null (invalid-link state)', () => {
    const { component, httpMock: mock } = createComponent(null);
    httpMock = mock;

    expect(component.token()).toBeNull();
  });

  it('with a token query param, token() reflects it', () => {
    const { component, httpMock: mock } = createComponent('raw-token-value');
    httpMock = mock;

    expect(component.token()).toBe('raw-token-value');
  });

  it('on success, sets success() true', () => {
    const { component, httpMock: mock } = createComponent('raw-token-value');
    httpMock = mock;

    component.form.setValue({ newPassword: 'NewPass123', confirmPassword: 'NewPass123' });
    component.submit();

    const req = httpMock.expectOne('/api/portal/auth/reset-password');
    expect(req.request.body).toEqual({ token: 'raw-token-value', newPassword: 'NewPass123' });
    req.flush(null);

    expect(component.success()).toBe(true);
    expect(component.saving()).toBe(false);
  });

  it('on server error, sets errorMessage() from the response', () => {
    const { component, httpMock: mock } = createComponent('raw-token-value');
    httpMock = mock;

    component.form.setValue({ newPassword: 'NewPass123', confirmPassword: 'NewPass123' });
    component.submit();

    httpMock.expectOne('/api/portal/auth/reset-password').flush(
      { message: 'This reset link is invalid or has expired. Please request a new one.' },
      {
        status: 400,
        statusText: 'Bad Request',
      },
    );

    expect(component.errorMessage()).toBe(
      'This reset link is invalid or has expired. Please request a new one.',
    );
    expect(component.success()).toBe(false);
  });

  it('blocks submission when passwords do not match', () => {
    const { component, httpMock: mock } = createComponent('raw-token-value');
    httpMock = mock;

    component.form.setValue({ newPassword: 'NewPass123', confirmPassword: 'Different456' });
    component.submit();

    expect(component.form.invalid).toBe(true);
    httpMock.expectNone('/api/portal/auth/reset-password');
  });

  it('does not submit when there is no token', () => {
    const { component, httpMock: mock } = createComponent(null);
    httpMock = mock;

    component.form.setValue({ newPassword: 'NewPass123', confirmPassword: 'NewPass123' });
    component.submit();

    httpMock.expectNone('/api/portal/auth/reset-password');
  });
});
