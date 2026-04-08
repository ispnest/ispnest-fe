import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pageable } from '@/app/core/models/common.model';
import { NotificationDto } from './notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/notifications';

  getPage(page = 0, size = 20, sort = 'createdAt', direction = 'desc'): Observable<Pageable<NotificationDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);
    return this.http.get<Pageable<NotificationDto>>(this.base, { params });
  }

  getByCustomer(customerId: string): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(this.base, {
      params: new HttpParams().set('customerId', customerId),
    });
  }
}

