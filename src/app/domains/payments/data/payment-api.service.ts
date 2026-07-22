import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import {
  InitiatePaymentRequest,
  PaymentDto,
  PaymentSummary,
  PaymentSummaryPeriod,
} from './payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/payments';

  getPage(
    page = 0,
    size = 20,
    sort = 'createdAt',
    direction = 'desc',
    status?: string,
    from?: Date,
    to?: Date,
  ): Observable<Pageable<PaymentDto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);
    if (status) params = params.set('status', status);
    if (from) params = params.set('from', from.toISOString());
    if (to) params = params.set('to', to.toISOString());
    return this.http.get<Pageable<PaymentDto>>(this.base, { params });
  }

  getSummary(
    period: PaymentSummaryPeriod,
    from?: Date,
    to?: Date,
    status?: string,
  ): Observable<PaymentSummary> {
    let params = new HttpParams().set('period', period);
    if (status) params = params.set('status', status);
    if (from) params = params.set('from', from.toISOString());
    if (to) params = params.set('to', to.toISOString());
    return this.http.get<PaymentSummary>(`${this.base}/summary`, { params });
  }

  initiate(request: InitiatePaymentRequest): Observable<PaymentDto> {
    return this.http.post<PaymentDto>(this.base, request);
  }

  getById(id: string): Observable<PaymentDto> {
    return this.http.get<PaymentDto>(`${this.base}/${id}`);
  }

  getByCustomer(customerId: string): Observable<PaymentDto[]> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.get<PaymentDto[]>(this.base, { params });
  }
}
