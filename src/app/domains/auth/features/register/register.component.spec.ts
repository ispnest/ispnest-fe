import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PlanDto } from '@/app/domains/plans/data/plan.model';
import { PublicRouterDto } from '@/app/domains/portal/data';
import { RegisterComponent } from './register.component';

function createComponent() {
  TestBed.configureTestingModule({
    imports: [RegisterComponent],
    providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])],
  });
  const fixture = TestBed.createComponent(RegisterComponent);
  fixture.detectChanges(); // triggers ngOnInit -> getRouters()

  const httpMock = TestBed.inject(HttpTestingController);
  httpMock.expectOne('/api/portal/routers').flush([]);

  return { fixture, httpMock, component: fixture.componentInstance };
}

const SAMPLE_ROUTER: PublicRouterDto = {
  id: 'router-1',
  name: 'Main Office',
  description: null,
  coordinates: '',
};

const SAMPLE_PLAN = { id: 'plan-1' } as PlanDto;

function fillValidForm(component: RegisterComponent) {
  component.personalForm.setValue({
    fullName: 'Test Customer',
    phoneNumber: '0712345678',
    email: '',
  });
  component.selectedRouter.set(SAMPLE_ROUTER);
  component.selectedPlan.set(SAMPLE_PLAN);
}

describe('RegisterComponent', () => {
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock.verify();
  });

  it('409 response sets duplicatePhone() and a specific message', () => {
    const created = createComponent();
    httpMock = created.httpMock;
    const { component } = created;
    fillValidForm(component);

    component.submit();

    httpMock
      .expectOne('/api/portal/register')
      .flush({ message: 'ignored' }, { status: 409, statusText: 'Conflict' });

    expect(component.duplicatePhone()).toBe(true);
    expect(component.errorMessage()).toBe('This phone number is already registered.');
    expect(component.saving()).toBe(false);
  });

  it('a non-409 error leaves duplicatePhone() false and shows a generic/server message', () => {
    const created = createComponent();
    httpMock = created.httpMock;
    const { component } = created;
    fillValidForm(component);

    component.submit();

    httpMock
      .expectOne('/api/portal/register')
      .flush({ message: 'Server exploded' }, { status: 500, statusText: 'Internal Server Error' });

    expect(component.duplicatePhone()).toBe(false);
    expect(component.errorMessage()).toBe('Server exploded');
  });

  it('success populates success() from the response', () => {
    const created = createComponent();
    httpMock = created.httpMock;
    const { component } = created;
    fillValidForm(component);

    component.submit();

    httpMock.expectOne('/api/portal/register').flush({
      id: 'c-1',
      accountCode: 'DGB-ABC123',
      fullName: 'Test Customer',
      phoneNumber: '254712345678',
      status: 'active',
      connected: false,
      createdAt: new Date().toISOString(),
      loginUsername: '254712345678',
      loginNote: 'Login with your phone number.',
    });

    expect(component.success()).toEqual({
      accountCode: 'DGB-ABC123',
      fullName: 'Test Customer',
      loginUsername: '254712345678',
      loginNote: 'Login with your phone number.',
    });
    expect(component.duplicatePhone()).toBe(false);
  });
});
