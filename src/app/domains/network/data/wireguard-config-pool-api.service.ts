import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  WireGuardConfigPoolEntryDto,
  WireGuardConfigPoolInventoryDto,
} from './wireguard-config-pool.model';

@Injectable({ providedIn: 'root' })
export class WireGuardConfigPoolApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/wireguard-config-pool';

  upload(file: File): Observable<WireGuardConfigPoolEntryDto> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<WireGuardConfigPoolEntryDto>(`${this.base}/upload`, form);
  }

  getInventory(): Observable<WireGuardConfigPoolInventoryDto> {
    return this.http.get<WireGuardConfigPoolInventoryDto>(this.base);
  }
}
