import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterPlanAttachmentsComponent } from './router-plan-attachments.component';

function createComponent() {
  TestBed.configureTestingModule({
    imports: [RouterPlanAttachmentsComponent],
    providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])],
  });
  const fixture = TestBed.createComponent(RouterPlanAttachmentsComponent);
  fixture.componentRef.setInput('routerId', 'router-1');
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();

  httpMock
    .expectOne((req) => req.url === '/api/plans')
    .flush({
      content: [{ id: 'plan-1', name: 'Bronze', price: 1000 } as never],
      page: { size: 100, number: 0, totalElements: 1, totalPages: 1 },
    });
  httpMock.expectOne('/api/routers/router-1/plan-deployments').flush([]);

  return { fixture, httpMock, component: fixture.componentInstance };
}

describe('RouterPlanAttachmentsComponent', () => {
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  it('lists available plans and none are attached initially', () => {
    const created = createComponent();
    httpMock = created.httpMock;
    expect(created.component.availablePlans().length).toBe(1);
    expect(created.component.isAttached('plan-1')).toBe(false);
  });

  it('attaches a plan via createDeployment and marks it attached', () => {
    const created = createComponent();
    httpMock = created.httpMock;
    created.component.attach({ id: 'plan-1', name: 'Bronze' } as never);

    const req = httpMock.expectOne('/api/plans/plan-1/routers');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'pr-1', planId: 'plan-1', routerId: 'router-1', poolId: null, enabled: true });

    expect(created.component.isAttached('plan-1')).toBe(true);
    expect(created.component.attaching()).toBeNull();
  });
});
