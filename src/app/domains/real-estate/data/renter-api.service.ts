import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import { CreateRenterRequest, RenterDto, UpdateRenterRequest } from './renter.model';

@Injectable({ providedIn: 'root' })
export class RenterApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/renters';

  getPage(page = 0, size = 20, sort = 'fullName,asc', search = ''): Observable<Pageable<RenterDto>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    if (search) params = params.set('search', search);
    return this.http.get<Pageable<RenterDto>>(this.base, { params });
  }

  getById(id: string): Observable<RenterDto> {
    return this.http.get<RenterDto>(`${this.base}/${id}`);
  }

  create(request: CreateRenterRequest): Observable<RenterDto> {
    return this.http.post<RenterDto>(this.base, request);
  }

  update(id: string, request: UpdateRenterRequest): Observable<RenterDto> {
    return this.http.put<RenterDto>(`${this.base}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
