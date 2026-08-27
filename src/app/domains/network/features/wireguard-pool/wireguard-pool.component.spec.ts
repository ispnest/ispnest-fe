import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WireguardPoolComponent } from './wireguard-pool.component';

function createComponent() {
  TestBed.configureTestingModule({
    imports: [WireguardPoolComponent],
    providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])],
  });
  const fixture = TestBed.createComponent(WireguardPoolComponent);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();
  return { fixture, httpMock, component: fixture.componentInstance };
}

describe('WireguardPoolComponent', () => {
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  it('loads inventory counts on init', () => {
    const created = createComponent();
    httpMock = created.httpMock;
    httpMock.expectOne('/api/wireguard-config-pool').flush({ available: 3, assigned: 7 });

    expect(created.component.inventory()).toEqual({ available: 3, assigned: 7 });
    expect(created.component.loading()).toBe(false);
  });

  it('uploads a config and refreshes inventory', () => {
    const created = createComponent();
    httpMock = created.httpMock;
    httpMock.expectOne('/api/wireguard-config-pool').flush({ available: 0, assigned: 0 });

    const file = new File(['content'], 'wg0.conf');
    created.component.upload(file);

    const uploadReq = httpMock.expectOne('/api/wireguard-config-pool/upload');
    expect(uploadReq.request.method).toBe('POST');
    uploadReq.flush({
      id: 'entry-1',
      status: 'AVAILABLE',
      assignedRouterId: null,
      uploadedAt: new Date().toISOString(),
    });

    httpMock.expectOne('/api/wireguard-config-pool').flush({ available: 1, assigned: 0 });

    expect(created.component.uploading()).toBe(false);
    expect(created.component.inventory()).toEqual({ available: 1, assigned: 0 });
  });
});
