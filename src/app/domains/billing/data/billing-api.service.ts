import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import {
  BillingCycleDto,
  CreditBalanceResponse,
  CreditLedgerEntryDto,
  InvoiceDto,
  ManualCreditRequest,
} from './billing.model';

@Injectable({ providedIn: 'root' })
export class InvoiceApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/invoices';

  getPage(
    page = 0,
    size = 20,
    sort = 'createdAt',
    direction = 'desc',
  ): Observable<Pageable<InvoiceDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);
    return this.http.get<Pageable<InvoiceDto>>(this.base, { params });
  }

  getById(id: string): Observable<InvoiceDto> {
    return this.http.get<InvoiceDto>(`${this.base}/${id}`);
  }

  getByCustomer(customerId: string): Observable<InvoiceDto[]> {
    return this.http.get<InvoiceDto[]>(this.base, {
      params: new HttpParams().set('customerId', customerId),
    });
  }

  voidInvoice(id: string): Observable<InvoiceDto> {
    return this.http.post<InvoiceDto>(`${this.base}/${id}/void`, null);
  }
}

@Injectable({ providedIn: 'root' })
export class CreditApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/credits';

  getBalance(customerId: string): Observable<CreditBalanceResponse> {
    return this.http.get<CreditBalanceResponse>(`${this.base}/balance`, {
      params: new HttpParams().set('customerId', customerId),
    });
  }

  getHistory(customerId: string): Observable<CreditLedgerEntryDto[]> {
    return this.http.get<CreditLedgerEntryDto[]>(this.base, {
      params: new HttpParams().set('customerId', customerId),
    });
  }

  addManual(request: ManualCreditRequest): Observable<CreditLedgerEntryDto> {
    return this.http.post<CreditLedgerEntryDto>(`${this.base}/manual`, request);
  }
}

@Injectable({ providedIn: 'root' })
export class BillingCycleApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/billing-cycles';

  getPage(page = 0, size = 20): Observable<Pageable<BillingCycleDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'createdAt,desc');
    return this.http.get<Pageable<BillingCycleDto>>(this.base, { params });
  }

  getByCustomer(customerId: string): Observable<BillingCycleDto[]> {
    return this.http.get<BillingCycleDto[]>(`${this.base}/history`, {
      params: new HttpParams().set('customerId', customerId),
    });
  }

  getActive(customerId: string): Observable<BillingCycleDto | null> {
    return this.http.get<BillingCycleDto>(`${this.base}`, {
      params: new HttpParams().set('customerId', customerId),
    });
  }
}
