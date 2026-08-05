import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import { OwnerDto } from '@/app/domains/real-estate/data/owner.model';
import {
  PropertyDocumentDto,
  PropertyDto,
  PropertyPhotoDto,
} from '@/app/domains/real-estate/data/property.model';

@Injectable({ providedIn: 'root' })
export class OwnerPortalApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/owner-portal';

  getMe(): Observable<OwnerDto> {
    return this.http.get<OwnerDto>(`${this.base}/me`);
  }

  getMyProperties(page = 0, size = 20, sort = 'createdAt,desc'): Observable<Pageable<PropertyDto>> {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    return this.http.get<Pageable<PropertyDto>>(`${this.base}/properties`, { params });
  }

  getMyProperty(id: string): Observable<PropertyDto> {
    return this.http.get<PropertyDto>(`${this.base}/properties/${id}`);
  }

  getPhotos(propertyId: string): Observable<PropertyPhotoDto[]> {
    return this.http.get<PropertyPhotoDto[]>(`${this.base}/properties/${propertyId}/photos`);
  }

  getDocuments(propertyId: string): Observable<PropertyDocumentDto[]> {
    return this.http.get<PropertyDocumentDto[]>(`${this.base}/properties/${propertyId}/documents`);
  }

  changePassword(newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/password`, { newPassword });
  }
}
