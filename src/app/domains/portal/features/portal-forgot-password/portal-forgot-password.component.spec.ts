import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PortalForgotPasswordComponent } from './portal-forgot-password.component';

function createComponent() {
  TestBed.configureTestingModule({
    imports: [PortalForgotPasswordComponent],
    providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])],
  });
  const fixture = TestBed.createComponent(PortalForgotPasswordComponent);
  fixture.detectChanges();
  return {
    component: fixture.componentInstance,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('PortalForgotPasswordComponent', () => {
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock.verify();
  });

  it('normalizes the phone number before calling the API', () => {
    const { component, httpMock: mock } = createComponent();
    httpMock = mock;

    component.form.setValue({ phoneNumber: '0712345678' });
    component.submit();

    const req = httpMock.expectOne('/api/portal/auth/forgot-password');
    expect(req.request.body).toEqual({ phoneNumber: '254712345678' });
    req.flush(null);
  });

  it('on success, sets submitted() true', () => {
    const { component, httpMock: mock } = createComponent();
    httpMock = mock;

    component.form.setValue({ phoneNumber: '0712345678' });
    component.submit();

    httpMock.expectOne('/api/portal/auth/forgot-password').flush(null);

    expect(component.submitted()).toBe(true);
    expect(component.loading()).toBe(false);
  });

  it('on API error, also sets submitted() true (anti-enumeration — same outcome as success)', () => {
    const { component, httpMock: mock } = createComponent();
    httpMock = mock;

    component.form.setValue({ phoneNumber: '0712345678' });
    component.submit();

    httpMock
      .expectOne('/api/portal/auth/forgot-password')
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(component.submitted()).toBe(true);
    expect(component.loading()).toBe(false);
  });
});
