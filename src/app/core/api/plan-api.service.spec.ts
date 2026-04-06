import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PlanApiService, BandwidthApiService } from './plan-api.service';
import { PlanDto } from '../models/plan.model';

describe('PlanApiService', () => {
  let service: PlanApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PlanApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() should GET /api/plans with enabledOnly=false by default', () => {
    service.getAll().subscribe();
    const req = httpMock.expectOne(r => r.url === '/api/plans');
    expect(req.request.params.get('enabledOnly')).toBe('false');
    req.flush([]);
  });

  it('getAll(true) should GET /api/plans with enabledOnly=true', () => {
    service.getAll(true).subscribe();
    const req = httpMock.expectOne(r => r.url === '/api/plans');
    expect(req.request.params.get('enabledOnly')).toBe('true');
    req.flush([]);
  });

  it('create() should POST to /api/plans', () => {
    const body = { name: 'Test Plan', price: 1000, type: 'pppoe' };
    service.create(body as any).subscribe();
    const req = httpMock.expectOne('/api/plans');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'new-id', ...body });
  });

  it('delete() should DELETE /api/plans/:id', () => {
    service.delete('plan-1').subscribe();
    const req = httpMock.expectOne('/api/plans/plan-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});

describe('BandwidthApiService', () => {
  let service: BandwidthApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(BandwidthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() should GET /api/bandwidths', () => {
    service.getAll().subscribe(b => expect(b).toEqual([]));
    const req = httpMock.expectOne('/api/bandwidths');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});

