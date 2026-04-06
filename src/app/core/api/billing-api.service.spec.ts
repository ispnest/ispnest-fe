import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InvoiceApiService, CreditApiService } from './billing-api.service';

describe('InvoiceApiService', () => {
  let service: InvoiceApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(InvoiceApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() should GET /api/invoices', () => {
    service.getAll().subscribe(i => expect(i).toEqual([]));
    const req = httpMock.expectOne('/api/invoices');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getByCustomer() should GET /api/invoices?customerId=...', () => {
    service.getByCustomer('cust-1').subscribe();
    const req = httpMock.expectOne(r => r.url === '/api/invoices' && r.params.get('customerId') === 'cust-1');
    req.flush([]);
  });

  it('voidInvoice() should POST /api/invoices/:id/void', () => {
    service.voidInvoice('inv-1').subscribe();
    const req = httpMock.expectOne('/api/invoices/inv-1/void');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'inv-1', status: 'void' });
  });
});

describe('CreditApiService', () => {
  let service: CreditApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CreditApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getBalance() should GET /api/credits/balance', () => {
    service.getBalance('cust-1').subscribe();
    const req = httpMock.expectOne(r => r.url === '/api/credits/balance');
    expect(req.request.method).toBe('GET');
    req.flush({ customerId: 'cust-1', balance: 100 });
  });

  it('getHistory() should GET /api/credits?customerId=...', () => {
    service.getHistory('cust-1').subscribe();
    const req = httpMock.expectOne(r => r.url === '/api/credits' && r.params.get('customerId') === 'cust-1');
    req.flush([]);
  });

  it('addManual() should POST /api/credits/manual', () => {
    const req_body = { customerId: 'cust-1', amount: 500, description: 'Test' };
    service.addManual(req_body).subscribe();
    const req = httpMock.expectOne('/api/credits/manual');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'c-1', ...req_body });
  });
});

