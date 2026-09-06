import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardKpis, ExpiringSoon } from './dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);

  /** Composite KPI snapshot for the admin dashboard. */
  getKpis(): Observable<DashboardKpis> {
    return this.http.get<DashboardKpis>('/api/dashboard/kpis');
  }

  /** Count of active subscriptions expiring within the next `days` days. */
  getExpiringSoon(days: number): Observable<ExpiringSoon> {
    return this.http.get<ExpiringSoon>('/api/customers/expiring-soon', {
      params: { days },
    });
  }
}
