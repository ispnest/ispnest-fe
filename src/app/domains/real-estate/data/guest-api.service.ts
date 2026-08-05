import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import { CreateGuestRequest, GuestDto, UpdateGuestRequest } from './guest.model';

@Injectable({ providedIn: 'root' })
export class GuestApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/guests';

  getPage(page = 0, size = 20, sort = 'fullName,asc', search = ''): Observable<Pageable<GuestDto>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    if (search) params = params.set('search', search);
    return this.http.get<Pageable<GuestDto>>(this.base, { params });
  }

  getById(id: string): Observable<GuestDto> {
    return this.http.get<GuestDto>(`${this.base}/${id}`);
  }

  create(request: CreateGuestRequest): Observable<GuestDto> {
    return this.http.post<GuestDto>(this.base, request);
  }

  update(id: string, request: UpdateGuestRequest): Observable<GuestDto> {
    return this.http.put<GuestDto>(`${this.base}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
