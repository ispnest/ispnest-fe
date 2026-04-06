import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CustomerApiService } from './customer-api.service';
import { CustomerDto } from '../models/customer.model';

describe('CustomerApiService', () => {
  let service: CustomerApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CustomerApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() should GET /api/customers', () => {
    const mockCustomers: CustomerDto[] = [
      { id: '1', username: 'user1', email: 'u@u.com', fullName: 'User One',
        phoneNumber: '0700000000', status: 'active', balance: 0,
        riskScore: null, riskLastUpdated: null, serviceType: 'pppoe',
        accountType: 'residential', pppoeUsername: null, pppoePassword: null,
        coordinates: null, createdAt: '2026-01-01T00:00:00Z' }
    ];

    service.getAll().subscribe(c => expect(c).toEqual(mockCustomers));

    const req = httpMock.expectOne('/api/customers');
    expect(req.request.method).toBe('GET');
    req.flush(mockCustomers);
  });

  it('getById() should GET /api/customers/:id', () => {
    service.getById('test-id').subscribe(c => expect(c.id).toBe('test-id'));

    const req = httpMock.expectOne('/api/customers/test-id');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'test-id', username: 'test' });
  });

  it('updateStatus() should PATCH /api/customers/:id/status', () => {
    service.updateStatus('cust-1', 'inactive').subscribe();

    const req = httpMock.expectOne(r => r.url === '/api/customers/cust-1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.params.get('status')).toBe('inactive');
    req.flush(null);
  });

  it('delete() should DELETE /api/customers/:id', () => {
    service.delete('cust-1').subscribe();

    const req = httpMock.expectOne('/api/customers/cust-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});

