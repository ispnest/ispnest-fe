import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import { InitiatePaymentRequest, PaymentDto } from './payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/payments';

  getPage(page = 0, size = 20, sort = 'createdAt', direction = 'desc'): Observable<Pageable<PaymentDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);
    return this.http.get<Pageable<PaymentDto>>(this.base, { params });
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

