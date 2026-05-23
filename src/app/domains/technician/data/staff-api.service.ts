import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import {
  StaffDto,
  CreateStaffRequest,
  UpdateStaffRequest,
  ActiveTechnicianDto,
} from './staff.model';

@Injectable({ providedIn: 'root' })
export class StaffApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/staff';

  getPage(page = 0, size = 20): Observable<Pageable<StaffDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Pageable<StaffDto>>(this.base, { params });
  }

  getById(id: string): Observable<StaffDto> {
    return this.http.get<StaffDto>(`${this.base}/${id}`);
  }

  create(request: CreateStaffRequest): Observable<StaffDto> {
    return this.http.post<StaffDto>(this.base, request);
  }

  update(id: string, request: UpdateStaffRequest): Observable<StaffDto> {
    return this.http.put<StaffDto>(`${this.base}/${id}`, request);
  }

  setActiveTechnician(id: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/set-active`, {});
  }

  deactivateTechnician(): Observable<void> {
    return this.http.patch<void>(`${this.base}/deactivate-technician`, {});
  }
}

@Injectable({ providedIn: 'root' })
export class TechnicianPortalApiService {
  private readonly http = inject(HttpClient);

  getActiveTechnician(): Observable<ActiveTechnicianDto | null> {
    return this.http.get<ActiveTechnicianDto>('/api/portal/technician/active');
  }
}
