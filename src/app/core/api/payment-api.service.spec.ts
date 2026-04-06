import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PaymentApiService } from './payment-api.service';

describe('PaymentApiService', () => {
  let service: PaymentApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PaymentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() should GET /api/payments', () => {
    service.getAll().subscribe(p => expect(p).toEqual([]));
    const req = httpMock.expectOne('/api/payments');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getById() should GET /api/payments/:id', () => {
    service.getById('pay-1').subscribe();
    const req = httpMock.expectOne('/api/payments/pay-1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'pay-1', status: 'completed' });
  });

  it('getByCustomer() should GET /api/payments?customerId=...', () => {
    service.getByCustomer('cust-1').subscribe();
    const req = httpMock.expectOne(r => r.url === '/api/payments' && r.params.get('customerId') === 'cust-1');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('initiate() should POST /api/payments', () => {
    const body = {
      customerId: 'cust-1', planId: 'plan-1', routerId: null,
      serviceType: 'pppoe', provider: 'mpesa', currency: 'KES', providerParams: {}
    };
    service.initiate(body).subscribe();
    const req = httpMock.expectOne('/api/payments');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'new-pay', ...body });
  });
});

