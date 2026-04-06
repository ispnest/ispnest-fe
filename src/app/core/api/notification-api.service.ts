import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationDto } from '../models/notification.model';
import { Page } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/notifications';

  getPage(page = 0, size = 20, sort = 'createdAt', direction = 'desc'): Observable<Page<NotificationDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);
    return this.http.get<Page<NotificationDto>>(this.base, { params });
  }

  getByCustomer(customerId: string): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(this.base, {
      params: new HttpParams().set('customerId', customerId)
    });
  }
}
