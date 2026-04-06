import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterApiService, PoolApiService } from './router-api.service';

describe('RouterApiService', () => {
  let service: RouterApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(RouterApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() should GET /api/routers', () => {
    service.getAll().subscribe(r => expect(r).toEqual([]));
    const req = httpMock.expectOne('/api/routers');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('create() should POST /api/routers', () => {
    const body = { name: 'Router1', ipAddress: '192.168.1.1', username: 'admin', password: 'pass', nasType: 'mikrotik', description: '' };
    service.create(body).subscribe();
    const req = httpMock.expectOne('/api/routers');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'r-1', ...body });
  });

  it('delete() should DELETE /api/routers/:id', () => {
    service.delete('r-1').subscribe();
    const req = httpMock.expectOne('/api/routers/r-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('testConnection() should POST /api/routers/:id/test-connection', () => {
    service.testConnection('r-1').subscribe();
    const req = httpMock.expectOne('/api/routers/r-1/test-connection');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });
});

describe('PoolApiService', () => {
  let service: PoolApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PoolApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() should GET /api/pools', () => {
    service.getAll().subscribe(p => expect(p).toEqual([]));
    const req = httpMock.expectOne('/api/pools');
    req.flush([]);
  });

  it('create() should POST /api/pools', () => {
    const body = { name: 'Pool1', routerId: 'r-1', ranges: '10.0.0.1-10.0.0.254', description: '' };
    service.create(body).subscribe();
    const req = httpMock.expectOne('/api/pools');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'p-1', ...body });
  });
});

