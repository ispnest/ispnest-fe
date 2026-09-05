import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import { CorrectCallbackRequest, PaymentCallbackLogDto } from './payment-callback.model';
import {
  PaymentManualResolutionDto,
  PaymentResolutionOptionsDto,
  ResolveMissingCallbackRequest,
} from './payment-manual-resolution.model';
import {
  PaymentReallocationDto,
  PaymentReallocationPreviewDto,
  ReallocatePaymentRequest,
} from './payment-reallocation.model';
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

  getCallbackLogs(
    page = 0,
    size = 20,
    provider?: string,
    status?: string,
  ): Observable<Pageable<PaymentCallbackLogDto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'receivedAt,desc');
    if (provider) params = params.set('provider', provider);
    if (status) params = params.set('status', status);
    return this.http.get<Pageable<PaymentCallbackLogDto>>(`${this.base}/callbacks`, { params });
  }

  getCallbackLog(id: string): Observable<PaymentCallbackLogDto> {
    return this.http.get<PaymentCallbackLogDto>(`${this.base}/callbacks/${id}`);
  }

  correctCallback(id: string, request: CorrectCallbackRequest): Observable<PaymentCallbackLogDto> {
    return this.http.patch<PaymentCallbackLogDto>(`${this.base}/callbacks/${id}`, request);
  }

  /** Dry run — resolves the target account and reports the credit/charge split. */
  previewReallocation(
    id: string,
    toAccountCode: string,
  ): Observable<PaymentReallocationPreviewDto> {
    const params = new HttpParams().set('toAccountCode', toAccountCode);
    return this.http.get<PaymentReallocationPreviewDto>(`${this.base}/${id}/reallocation-preview`, {
      params,
    });
  }

  /** Move a completed payment to the account it was meant for. */
  reallocatePayment(
    id: string,
    request: ReallocatePaymentRequest,
  ): Observable<PaymentReallocationDto> {
    return this.http.post<PaymentReallocationDto>(`${this.base}/${id}/reallocate`, request);
  }

  /** The reallocation record for a payment, if it has been moved. 404s when it hasn't. */
  getReallocation(id: string): Observable<PaymentReallocationDto> {
    return this.http.get<PaymentReallocationDto>(`${this.base}/${id}/reallocation`);
  }

  getReallocations(page = 0, size = 20): Observable<Pageable<PaymentReallocationDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Pageable<PaymentReallocationDto>>(`${this.base}/reallocations`, {
      params,
    });
  }

  // ── Manual resolution (payment succeeded, but the provider's callback never arrived) ─────

  /** Whether a payment is eligible for manual resolution, and whether its provider can verify. */
  getResolutionOptions(id: string): Observable<PaymentResolutionOptionsDto> {
    return this.http.get<PaymentResolutionOptionsDto>(`${this.base}/${id}/resolution-options`);
  }

  /** Complete a payment after independently verifying it with its provider. */
  resolveMissingCallback(
    id: string,
    request: ResolveMissingCallbackRequest,
  ): Observable<PaymentManualResolutionDto> {
    return this.http.post<PaymentManualResolutionDto>(
      `${this.base}/${id}/resolve-missing-callback`,
      request,
    );
  }

  /** Complete a payment on staff attestation alone — no provider verification attempted. */
  forceResolveMissingCallback(
    id: string,
    request: ResolveMissingCallbackRequest,
  ): Observable<PaymentManualResolutionDto> {
    return this.http.post<PaymentManualResolutionDto>(
      `${this.base}/${id}/force-resolve-missing-callback`,
      request,
    );
  }

  /** The manual-resolution record for a payment, if it has been resolved this way. 404s when not. */
  getManualResolution(id: string): Observable<PaymentManualResolutionDto> {
    return this.http.get<PaymentManualResolutionDto>(`${this.base}/${id}/manual-resolution`);
  }

  getManualResolutions(page = 0, size = 20): Observable<Pageable<PaymentManualResolutionDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Pageable<PaymentManualResolutionDto>>(`${this.base}/manual-resolutions`, {
      params,
    });
  }
}
