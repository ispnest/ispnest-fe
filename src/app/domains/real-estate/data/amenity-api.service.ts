import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateAmenityRequest } from './amenity.model';
import { AmenityDto } from './property.model';

@Injectable({ providedIn: 'root' })
export class AmenityApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/amenities';

  list(): Observable<AmenityDto[]> {
    return this.http.get<AmenityDto[]>(this.base);
  }

  create(request: CreateAmenityRequest): Observable<AmenityDto> {
    return this.http.post<AmenityDto>(this.base, request);
  }

  update(id: string, request: CreateAmenityRequest): Observable<AmenityDto> {
    return this.http.put<AmenityDto>(`${this.base}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
