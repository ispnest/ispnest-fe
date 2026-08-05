import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import {
  CreatePropertyRequest,
  HousekeepingStatus,
  PropertyDocumentDto,
  PropertyDocumentType,
  PropertyDto,
  PropertyPhotoDto,
  UpdatePropertyRequest,
} from './property.model';

@Injectable({ providedIn: 'root' })
export class PropertyApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/properties';

  getPage(
    page = 0,
    size = 20,
    sort = 'createdAt,desc',
    status = '',
    propertyType = '',
    rentalType = '',
    ownerId = '',
    search = '',
  ): Observable<Pageable<PropertyDto>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    if (status) params = params.set('status', status);
    if (propertyType) params = params.set('propertyType', propertyType);
    if (rentalType) params = params.set('rentalType', rentalType);
    if (ownerId) params = params.set('ownerId', ownerId);
    if (search) params = params.set('search', search);
    return this.http.get<Pageable<PropertyDto>>(this.base, { params });
  }

  getById(id: string): Observable<PropertyDto> {
    return this.http.get<PropertyDto>(`${this.base}/${id}`);
  }

  create(request: CreatePropertyRequest): Observable<PropertyDto> {
    return this.http.post<PropertyDto>(this.base, request);
  }

  update(id: string, request: UpdatePropertyRequest): Observable<PropertyDto> {
    return this.http.put<PropertyDto>(`${this.base}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  updateHousekeepingStatus(id: string, status: HousekeepingStatus): Observable<PropertyDto> {
    return this.http.patch<PropertyDto>(`${this.base}/${id}/housekeeping-status`, { status });
  }

  // ── Photos ────────────────────────────────────────────────────────────────

  getPhotos(id: string): Observable<PropertyPhotoDto[]> {
    return this.http.get<PropertyPhotoDto[]>(`${this.base}/${id}/photos`);
  }

  uploadPhoto(id: string, file: File): Observable<PropertyPhotoDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<PropertyPhotoDto>(`${this.base}/${id}/photos`, formData);
  }

  deletePhoto(id: string, photoId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/photos/${photoId}`);
  }

  reorderPhotos(id: string, photoIds: string[]): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/photos/order`, photoIds);
  }

  // ── Documents ─────────────────────────────────────────────────────────────

  getDocuments(id: string): Observable<PropertyDocumentDto[]> {
    return this.http.get<PropertyDocumentDto[]>(`${this.base}/${id}/documents`);
  }

  uploadDocument(
    id: string,
    file: File,
    documentType?: PropertyDocumentType,
  ): Observable<PropertyDocumentDto> {
    const formData = new FormData();
    formData.append('file', file);
    if (documentType) formData.append('documentType', documentType);
    return this.http.post<PropertyDocumentDto>(`${this.base}/${id}/documents`, formData);
  }

  deleteDocument(id: string, documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/documents/${documentId}`);
  }

  // ── Amenities ─────────────────────────────────────────────────────────────

  updateAmenities(id: string, amenityIds: string[]): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/amenities`, amenityIds);
  }
}
