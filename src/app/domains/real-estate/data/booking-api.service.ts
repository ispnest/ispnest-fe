import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import {
  BookingDto,
  CancelBookingRequest,
  CreateBookingRequest,
  UpdateBookingRequest,
} from './booking.model';
import { LinkCustomerRequest } from './customer-link.model';

@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/bookings';

  getPage(
    page = 0,
    size = 20,
    sort = 'checkInDate,asc',
    status = '',
    propertyId = '',
    guestId = '',
    rangeStart = '',
    rangeEnd = '',
  ): Observable<Pageable<BookingDto>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    if (status) params = params.set('status', status);
    if (propertyId) params = params.set('propertyId', propertyId);
    if (guestId) params = params.set('guestId', guestId);
    if (rangeStart) params = params.set('rangeStart', rangeStart);
    if (rangeEnd) params = params.set('rangeEnd', rangeEnd);
    return this.http.get<Pageable<BookingDto>>(this.base, { params });
  }

  getById(id: string): Observable<BookingDto> {
    return this.http.get<BookingDto>(`${this.base}/${id}`);
  }

  create(request: CreateBookingRequest): Observable<BookingDto> {
    return this.http.post<BookingDto>(this.base, request);
  }

  update(id: string, request: UpdateBookingRequest): Observable<BookingDto> {
    return this.http.put<BookingDto>(`${this.base}/${id}`, request);
  }

  confirm(id: string): Observable<BookingDto> {
    return this.http.post<BookingDto>(`${this.base}/${id}/confirm`, null);
  }

  checkIn(id: string): Observable<BookingDto> {
    return this.http.post<BookingDto>(`${this.base}/${id}/check-in`, null);
  }

  checkOut(id: string): Observable<BookingDto> {
    return this.http.post<BookingDto>(`${this.base}/${id}/check-out`, null);
  }

  cancel(id: string, request: CancelBookingRequest): Observable<BookingDto> {
    return this.http.post<BookingDto>(`${this.base}/${id}/cancel`, request);
  }

  linkCustomer(id: string, request: LinkCustomerRequest): Observable<BookingDto> {
    return this.http.post<BookingDto>(`${this.base}/${id}/link-customer`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
