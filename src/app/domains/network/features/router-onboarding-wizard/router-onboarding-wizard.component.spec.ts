import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EMPTY, NEVER } from 'rxjs';
import { RouterOnboardingApiService } from '@/app/domains/network/data';
import { RouterOnboardingWizardComponent } from './router-onboarding-wizard.component';

/**
 * Material step content isn't lazy by default, so step 3's `&lt;app-router-activity-terminal>`
 * instantiates (and starts its own resync GET + SSE subscribe) as soon as `routerId()` is set, even
 * before the stepper is navigated there — stub just those two methods so these tests never make a
 * real HTTP call or open a real `fetch`-based SSE stream.
 */
class FakeOnboardingApi extends RouterOnboardingApiService {
  override getManagementState = vi.fn().mockReturnValue(NEVER);
  override streamActivityEvents = vi.fn().mockReturnValue(EMPTY);
}

function createComponent() {
  TestBed.configureTestingModule({
    imports: [RouterOnboardingWizardComponent],
    providers: [
      provideHttpClient(withXhr()),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: RouterOnboardingApiService, useClass: FakeOnboardingApi },
    ],
  });
  const fixture = TestBed.createComponent(RouterOnboardingWizardComponent);
  fixture.detectChanges();
  const httpMock = TestBed.inject(HttpTestingController);
  return { fixture, httpMock, component: fixture.componentInstance };
}

describe('RouterOnboardingWizardComponent', () => {
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock.verify();
  });

  it('creating the router posts without an ipAddress and advances past step 1', () => {
    const created = createComponent();
    httpMock = created.httpMock;
    const { component, fixture } = created;

    component.routerForm.setValue({
      name: 'Nairobi Branch',
      secret: 's3cret',
      nasType: 'mikrotik',
    });
    component.createRouter();

    const req = httpMock.expectOne('/api/routers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'Nairobi Branch',
      secret: 's3cret',
      nasType: 'mikrotik',
    });
    expect(req.request.body.ipAddress).toBeUndefined();

    req.flush({
      id: 'router-1',
      name: 'Nairobi Branch',
      ipAddress: null,
      username: '',
      description: null,
      coordinates: null,
      nasType: 'mikrotik',
      status: 'offline',
      lastSeen: null,
    });
    fixture.detectChanges();

    expect(component.routerId()).toBe('router-1');
    expect(component.routerForm.disabled).toBe(true);
  });

  it('a failed router creation surfaces the server error and does not set routerId', () => {
    const created = createComponent();
    httpMock = created.httpMock;
    const { component } = created;

    component.routerForm.setValue({ name: 'Dup Name', secret: 's3cret', nasType: 'mikrotik' });
    component.createRouter();

    httpMock
      .expectOne('/api/routers')
      .flush({ message: 'Router name already exists' }, { status: 409, statusText: 'Conflict' });

    expect(component.routerId()).toBeNull();
    expect(component.routerError()).toBe('Router name already exists');
    expect(component.creatingRouter()).toBe(false);
  });

  it('generating the bootstrap command issues a token for the created router', () => {
    const created = createComponent();
    httpMock = created.httpMock;
    const { component } = created;

    component.routerId.set('router-1');
    component.issueTokenAndAdvance();

    httpMock
      .expectOne('/api/routers/router-1/onboarding-tokens')
      .flush({ token: 'one-time-token-abc', expiresAt: '2026-01-01T00:00:00Z' });

    expect(component.issuedToken()?.token).toBe('one-time-token-abc');
  });
});
