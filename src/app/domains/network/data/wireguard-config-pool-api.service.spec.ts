import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { WireGuardConfigPoolApiService } from './wireguard-config-pool-api.service';

describe('WireGuardConfigPoolApiService', () => {
  let service: WireGuardConfigPoolApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    service = TestBed.inject(WireGuardConfigPoolApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('upload POSTs FormData with a file entry', () => {
    const file = new File(['content'], 'wg0.conf');
    service.upload(file).subscribe();
    const req = httpMock.expectOne('/api/wireguard-config-pool/upload');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    const body = req.request.body as FormData;
    expect(body.get('file')).toBe(file);
    req.flush({});
  });

  it('getInventory GETs /wireguard-config-pool', () => {
    service.getInventory().subscribe();
    const req = httpMock.expectOne('/api/wireguard-config-pool');
    expect(req.request.method).toBe('GET');
    req.flush({ available: 0, assigned: 0 });
  });
});
