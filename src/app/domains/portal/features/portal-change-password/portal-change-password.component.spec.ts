import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { PortalChangePasswordComponent } from './portal-change-password.component';

function createComponent() {
  TestBed.configureTestingModule({
    imports: [PortalChangePasswordComponent],
    providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])],
  });
  const fixture = TestBed.createComponent(PortalChangePasswordComponent);
  fixture.detectChanges();
  return {
    fixture,
    component: fixture.componentInstance,
    httpMock: TestBed.inject(HttpTestingController),
    auth: TestBed.inject(AuthService),
  };
}

describe('PortalChangePasswordComponent', () => {
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('on success, applies the returned tokens via applyTokenResponse (not refreshToken/portalLogout)', () => {
    const { component, httpMock: mock, auth } = createComponent();
    httpMock = mock;
    const applyTokenResponseSpy = vi.spyOn(auth, 'applyTokenResponse');
    const refreshTokenSpy = vi.spyOn(auth, 'refreshToken');
    const portalLogoutSpy = vi.spyOn(auth, 'portalLogout');

    component.form.setValue({
      currentPassword: 'OldPass123',
      newPassword: 'NewPass456',
      confirmPassword: 'NewPass456',
    });
    component.submit();

    const tokenResponse = {
      access_token: 'new-access',
      refresh_token: 'new-refresh',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_expires_in: 604800,
    };
    httpMock.expectOne('/api/portal/my/password').flush(tokenResponse);

    expect(applyTokenResponseSpy).toHaveBeenCalledWith(tokenResponse);
    expect(refreshTokenSpy).not.toHaveBeenCalled();
    expect(portalLogoutSpy).not.toHaveBeenCalled();
    expect(component.successMessage()).toBe('Password changed successfully.');
    expect(component.saving()).toBe(false);
  });

  it('on failure, sets errorMessage and does not apply any token response', () => {
    const { component, httpMock: mock, auth } = createComponent();
    httpMock = mock;
    const applyTokenResponseSpy = vi.spyOn(auth, 'applyTokenResponse');

    component.form.setValue({
      currentPassword: 'OldPass123',
      newPassword: 'NewPass456',
      confirmPassword: 'NewPass456',
    });
    component.submit();

    httpMock
      .expectOne('/api/portal/my/password')
      .flush({ message: 'Current password incorrect' }, { status: 400, statusText: 'Bad Request' });

    expect(applyTokenResponseSpy).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Current password incorrect');
    expect(component.saving()).toBe(false);
  });

  it('blocks submission when the password confirmation does not match', () => {
    const { component, httpMock: mock } = createComponent();
    httpMock = mock;

    component.form.setValue({
      currentPassword: 'OldPass123',
      newPassword: 'NewPass456',
      confirmPassword: 'Different789',
    });
    component.submit();

    expect(component.form.invalid).toBe(true);
    httpMock.expectNone('/api/portal/my/password');
  });
});
