import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import {
  CreateOwnerRequest,
  GrantPortalAccessResponse,
  OwnerDto,
  OwnerPortalAccessDto,
  UpdateOwnerRequest,
} from './owner.model';

@Injectable({ providedIn: 'root' })
export class OwnerApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/owners';

  getPage(page = 0, size = 20, sort = 'fullName,asc', search = ''): Observable<Pageable<OwnerDto>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    if (search) params = params.set('search', search);
    return this.http.get<Pageable<OwnerDto>>(this.base, { params });
  }

  getById(id: string): Observable<OwnerDto> {
    return this.http.get<OwnerDto>(`${this.base}/${id}`);
  }

  create(request: CreateOwnerRequest): Observable<OwnerDto> {
    return this.http.post<OwnerDto>(this.base, request);
  }

  update(id: string, request: UpdateOwnerRequest): Observable<OwnerDto> {
    return this.http.put<OwnerDto>(`${this.base}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getPortalAccess(id: string): Observable<OwnerPortalAccessDto> {
    return this.http.get<OwnerPortalAccessDto>(`${this.base}/${id}/portal-access`);
  }

  grantPortalAccess(id: string): Observable<GrantPortalAccessResponse> {
    return this.http.post<GrantPortalAccessResponse>(`${this.base}/${id}/portal-access`, null);
  }
}
