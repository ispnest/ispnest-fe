import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { RouterDetailLayoutComponent } from './router-detail-layout.component';
import { RouterDetailStore } from './router-detail.store';

class FakeRouterDetailStore {
  routerId = 'router-1';
  loading = signal(false);
  router = signal<{ name: string } | null>({ name: 'Main Office' });
  managementState = signal<{ state: string } | null>({ state: 'SYNCED' });
  pools = signal<unknown[]>([]);
  provisioningAccess = computed(() => ({ allowed: true, reachable: true }) as const);
  init = vi.fn();
  refreshManagementState = vi.fn();
  refreshPools = vi.fn();
}

function createComponent() {
  TestBed.configureTestingModule({
    imports: [RouterDetailLayoutComponent],
    providers: [
      provideHttpClient(withXhr()),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: RouterDetailStore, useClass: FakeRouterDetailStore },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ id: 'router-1' }) } },
      },
    ],
  });
  const fixture = TestBed.createComponent(RouterDetailLayoutComponent);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();
  return { fixture, httpMock, component: fixture.componentInstance };
}

describe('RouterDetailLayoutComponent', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('initializes the store with the routed id', () => {
    const { component } = createComponent();
    const store = TestBed.inject(RouterDetailStore) as unknown as FakeRouterDetailStore;

    expect(store.init).toHaveBeenCalledWith('router-1');
    expect(component.routerId).toBe('router-1');
  });

  it('renders the router name and management-state badge from the store', () => {
    const { fixture } = createComponent();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Main Office');
    expect(text).toContain('SYNCED');
  });

  it('issuing a token shows the bootstrap-command banner', () => {
    const { component, httpMock, fixture } = createComponent();

    component.issueToken();
    httpMock
      .expectOne('/api/routers/router-1/onboarding-tokens')
      .flush({ token: 'raw-token-abc', expiresAt: new Date().toISOString() });
    fixture.detectChanges();

    expect(component.issuedToken()?.token).toBe('raw-token-abc');
    expect(component.issuing()).toBe(false);
  });
});
