import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigUpdateRequest, ConfigValueRequest, IntegrationConfigDto } from './settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/admin/integration-config';

  getProviders(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/providers`);
  }

  getProviderConfig(provider: string): Observable<IntegrationConfigDto[]> {
    return this.http.get<IntegrationConfigDto[]>(`${this.base}/${provider}`);
  }

  setConfig(provider: string, key: string, request: ConfigValueRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/${provider}/${key}`, request);
  }

  updateEntry(id: string, request: ConfigUpdateRequest): Observable<IntegrationConfigDto> {
    return this.http.patch<IntegrationConfigDto>(`${this.base}/${id}`, request);
  }

  setEnabled(provider: string, key: string, enabled: boolean): Observable<void> {
    const params = new HttpParams().set('enabled', String(enabled));
    return this.http.patch<void>(`${this.base}/${provider}/${key}/enabled`, null, { params });
  }

  deleteConfig(provider: string, key: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${provider}/${key}`);
  }
}

