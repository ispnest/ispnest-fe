import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WritableSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProvisioningAccess } from '@/app/domains/network/shared/router-status.util';
import { RouterDetailStore } from './router-detail.store';
import { RouterServicesComponent } from './router-services.component';

const PROFILE = {
  routerId: 'router-1',
  deploymentMode: 'MANAGEMENT_ONLY',
  wanMode: 'DHCP',
  topologySplit: 'VLAN',
  lanInterface: null,
  hotspotVlanId: null,
  pppoeVlanId: null,
  hotspotBridgeName: null,
  pppoeBridgeName: null,
  hotspotPoolId: null,
  pppoePoolId: null,
  firewallProfile: 'hardened',
  radiusRealm: '',
  createdAt: null,
  updatedAt: null,
};

class FakeRouterDetailStore {
  routerId = 'router-1';
  accessSignal: WritableSignal<ProvisioningAccess> = signal({ allowed: false });
  provisioningAccess = this.accessSignal;
}

function createComponent(access: ProvisioningAccess) {
  TestBed.configureTestingModule({
    imports: [RouterServicesComponent],
    providers: [
      provideHttpClient(withXhr()),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: RouterDetailStore, useClass: FakeRouterDetailStore },
    ],
  });
  const store = TestBed.inject(RouterDetailStore) as unknown as FakeRouterDetailStore;
  store.accessSignal.set(access);
  const fixture = TestBed.createComponent(RouterServicesComponent);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();
  return { fixture, httpMock, component: fixture.componentInstance };
}

describe('RouterServicesComponent', () => {
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  it('blocks the form for a router that has not completed onboarding', () => {
    const created = createComponent({ allowed: false });
    httpMock = created.httpMock;
    httpMock.expectOne('/api/routers/router-1/provisioning-profile').flush(PROFILE);

    const text = created.fixture.nativeElement.textContent as string;
    expect(text).toContain('becomes available once this router finishes onboarding');
    expect(text).not.toContain('LAN interface');
  });

  it('shows the form with a cross-check warning when onboarded but unreachable', () => {
    const created = createComponent({ allowed: true, reachable: false });
    httpMock = created.httpMock;

    httpMock.expectOne('/api/routers/router-1/provisioning-profile').flush(PROFILE);
    created.fixture.detectChanges();
    httpMock
      .expectOne((req) => req.url === '/api/pools')
      .flush({
        content: [],
        page: { size: 20, number: 0, totalElements: 0, totalPages: 0 },
      });
    httpMock
      .expectOne('/api/routers/router-1/discovery/INTERFACES')
      .flush([], { status: 409, statusText: 'Conflict' });
    httpMock
      .expectOne('/api/routers/router-1/discovery/VLANS')
      .flush([], { status: 409, statusText: 'Conflict' });
    created.fixture.detectChanges();

    const text = created.fixture.nativeElement.textContent as string;
    expect(text).toContain('currently unreachable');
    expect(text).toContain('double-check interface names');
  });

  it('shows the form with no warning when onboarded and reachable', () => {
    const created = createComponent({ allowed: true, reachable: true });
    httpMock = created.httpMock;

    httpMock.expectOne('/api/routers/router-1/provisioning-profile').flush(PROFILE);
    created.fixture.detectChanges();
    httpMock
      .expectOne((req) => req.url === '/api/pools')
      .flush({
        content: [],
        page: { size: 20, number: 0, totalElements: 0, totalPages: 0 },
      });
    httpMock.expectOne('/api/routers/router-1/discovery/INTERFACES').flush([]);
    httpMock.expectOne('/api/routers/router-1/discovery/VLANS').flush([]);
    created.fixture.detectChanges();

    const text = created.fixture.nativeElement.textContent as string;
    expect(text).not.toContain('currently unreachable');
  });
});
