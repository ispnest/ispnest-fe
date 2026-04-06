import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { AdminUser } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser = signal<AdminUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isLoading = signal(false);

  /** Called once on app init to restore session from backend */
  loadCurrentUser(): Observable<AdminUser | null> {
    return this.http.get<AdminUser>('/api/auth/me', { withCredentials: true }).pipe(
      tap(user => this.currentUser.set(user)),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      })
    );
  }

  login(username: string, password: string): Observable<void> {
    this.isLoading.set(true);
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);
    return this.http.post<void>('/login', body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: true
    }).pipe(
      tap(() => this.loadCurrentUser().subscribe()),
      tap(() => this.isLoading.set(false)),
      catchError(err => {
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  logout(): void {
    this.http.post('/logout', null, { withCredentials: true }).subscribe({
      complete: () => {
        this.currentUser.set(null);
        this.router.navigate(['/login']);
      }
    });
  }

  /** Portal auth: look up by phone number */
  portalLogin(phoneNumber: string): Observable<{ customerId: string }> {
    return this.http.post<{ customerId: string }>('/api/portal/login',
      { phoneNumber }, { withCredentials: true }
    );
  }
}

