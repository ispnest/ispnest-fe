import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, throwError, map } from 'rxjs';
import { UserIdentity } from '../models/common.model';
import { isTokenExpired, parseJwt } from './oauth2.config';

/**
 * Login response from the backend.
 */
type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
};

/**
 * Storage keys for auth tokens.
 */
const STORAGE_KEYS = {
  accessToken: 'ispnest_access_token',
  refreshToken: 'ispnest_refresh_token',
  tokenExpiry: 'ispnest_token_expiry',
} as const;

/**
 * Authentication service using direct JWT login and OAuth2 social login.
 * Manages tokens, user identity, and provides login/logout functionality.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  /** Current authenticated user */
  readonly currentUser = signal<UserIdentity | null>(null);

  /** Whether a user is authenticated */
  readonly isAuthenticated = computed(() => this.currentUser() !== null && this.hasValidToken());

  /** Loading state for auth operations */
  readonly isLoading = signal(false);

  /** User's permissions (for template binding) */
  readonly permissions = computed(() => this.currentUser()?.permissions ?? []);

  /** User's roles (for template binding) */
  readonly roles = computed(() => this.currentUser()?.roles ?? []);

  // ==================== Token Management ====================

  /** Get current access token */
  getAccessToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }

  /** Check if we have a valid (non-expired) access token */
  hasValidToken(): boolean {
    const token = this.getAccessToken();
    return token !== null && !isTokenExpired(token);
  }

  /** Store tokens from login response */
  private storeTokens(response: LoginResponse): void {
    localStorage.setItem(STORAGE_KEYS.accessToken, response.access_token);
    if (response.refresh_token) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, response.refresh_token);
    }
    const expiry = Date.now() + response.expires_in * 1000;
    localStorage.setItem(STORAGE_KEYS.tokenExpiry, expiry.toString());
  }

  /** Clear all stored tokens */
  private clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.tokenExpiry);
  }

  // ==================== Direct Login ====================

  /**
   * Login with email and password.
   * Returns JWT access token and refresh token on success.
   */
  login(email: string, password: string): Observable<UserIdentity> {
    this.isLoading.set(true);

    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      tap((response) => this.storeTokens(response)),
      map(() => {
        // Load user from token claims or fetch from server
        const token = this.getAccessToken();
        if (token) {
          const claims = parseJwt(token);
          if (claims) {
            const user: UserIdentity = {
              id: (claims['user_id'] as string) ?? null,
              email: claims['sub'] as string,
              displayName: (claims['name'] as string) ?? null,
              userType: claims['user_type'] as string,
              phoneNumber: (claims['phone_number'] as string) ?? null,
              avatarUrl: (claims['avatar_url'] as string) ?? null,
              emailVerified: (claims['email_verified'] as boolean) ?? false,
              contactId: (claims['contact_id'] as string) ?? null,
              forcePasswordChange: (claims['force_password_change'] as boolean) ?? false,
              staffProfileId: (claims['staff_profile_id'] as string) ?? null,
              roles: (claims['roles'] as string[]) ?? [],
              permissions: (claims['permissions'] as string[]) ?? [],
              lastLoginAt: (claims['last_login_at'] as string) ?? null,
            };
            this.currentUser.set(user);
            this.isLoading.set(false);
            return user;
          }
        }
        throw new Error('Failed to parse token');
      }),
      catchError((err) => {
        this.isLoading.set(false);
        this.clearTokens();
        return throwError(() => err);
      }),
    );
  }

  // ==================== Social Login ====================

  /**
   * Initiate Google OAuth2 login.
   * Redirects to Google for authentication.
   */
  loginWithGoogle(): void {
    window.location.href = '/oauth2/authorization/google';
  }

  /**
   * Initiate X (Twitter) OAuth2 login.
   * Redirects to X for authentication.
   */
  loginWithX(): void {
    window.location.href = '/oauth2/authorization/x';
  }

  /**
   * Handle OAuth2 callback tokens from URL parameters.
   * Called when redirected back from social login.
   */
  handleOAuth2Callback(accessToken: string, refreshToken: string, expiresIn: number): void {
    const response: LoginResponse = {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      refresh_expires_in: expiresIn * 168, // 7 days
    };
    this.storeTokens(response);

    // Load user from token claims
    const claims = parseJwt(accessToken);
    if (claims) {
      const user: UserIdentity = {
        id: (claims['user_id'] as string) ?? null,
        email: claims['sub'] as string,
        displayName: (claims['name'] as string) ?? null,
        userType: claims['user_type'] as string,
        phoneNumber: (claims['phone_number'] as string) ?? null,
        avatarUrl: (claims['avatar_url'] as string) ?? null,
        emailVerified: (claims['email_verified'] as boolean) ?? false,
        contactId: (claims['contact_id'] as string) ?? null,
        forcePasswordChange: (claims['force_password_change'] as boolean) ?? false,
        staffProfileId: (claims['staff_profile_id'] as string) ?? null,
        roles: (claims['roles'] as string[]) ?? [],
        permissions: (claims['permissions'] as string[]) ?? [],
        lastLoginAt: (claims['last_login_at'] as string) ?? null,
      };
      this.currentUser.set(user);
    }
  }

  // ==================== User Identity ====================

  /**
   * Load current user identity from the server.
   * Called on app init to restore session.
   */
  loadCurrentUser(): Observable<UserIdentity | null> {
    const token = this.getAccessToken();
    if (!token || isTokenExpired(token)) {
      this.currentUser.set(null);
      return of(null);
    }

    return this.http
      .get<UserIdentity>('/api/auth/me', {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      })
      .pipe(
        tap((user) => this.currentUser.set(user)),
        catchError(() => {
          this.currentUser.set(null);
          this.clearTokens();
          return of(null);
        }),
      );
  }

  // ==================== Token Refresh ====================

  /**
   * Refresh the access token using the refresh token.
   */
  refreshToken(): Observable<LoginResponse | null> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    if (!refreshToken) {
      return of(null);
    }

    return this.http.post<LoginResponse>('/api/auth/refresh', { refreshToken }).pipe(
      tap((response) => this.storeTokens(response)),
      catchError(() => {
        this.clearTokens();
        this.currentUser.set(null);
        return of(null);
      }),
    );
  }

  // ==================== Logout ====================

  /**
   * Log out the current user - clear tokens and redirect to login.
   */
  logout(): void {
    this.clearTokens();
    this.currentUser.set(null);

    // Redirect to login page
    this.router.navigate(['/login']);
  }

  // ==================== Permission Helpers ====================

  /**
   * Check if current user has a specific permission.
   */
  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  /**
   * Check if current user has any of the specified permissions.
   */
  hasAnyPermission(...permissions: string[]): boolean {
    return permissions.some((p) => this.hasPermission(p));
  }

  /**
   * Check if current user has all of the specified permissions.
   */
  hasAllPermissions(...permissions: string[]): boolean {
    return permissions.every((p) => this.hasPermission(p));
  }

  /**
   * Check if current user has a specific role.
   */
  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  /**
   * Check if current user is staff (not a customer).
   */
  isStaff(): boolean {
    const user = this.currentUser();
    return user !== null && user.contactId === null;
  }

  /**
   * Returns true when the current user is a Technician.
   * Use this to hide write actions (create / edit / delete / status-change)
   * across the admin UI — technicians are view-only on most pages until
   * specific permissions are granted.
   */
  isViewOnly(): boolean {
    return this.hasRole('TECHNICIAN') && !this.hasRole('ADMIN') && !this.hasRole('SUPER_ADMIN');
  }

  /**
   * Check if current user is a customer.
   */
  isCustomer(): boolean {
    const user = this.currentUser();
    return user !== null && user.contactId !== null;
  }

  /**
   * Returns the correct post-login landing path based on the user's role.
   * Customers go to the portal dashboard; technicians go to their own dashboard;
   * all other staff go to the admin panel (which redirects to dashboard).
   */
  getPostLoginRedirect(): string {
    if (this.isCustomer()) return '/portal/dashboard';
    if (this.hasRole('TECHNICIAN')) return '/admin/technician';
    return '/admin';
  }

  /**
   * Portal logout: clear tokens and redirect to portal login (not admin login).
   */
  portalLogout(): void {
    this.clearTokens();
    this.currentUser.set(null);
    this.router.navigate(['/portal']);
  }

  // ==================== Legacy Support ====================

  /**
   * Portal auth: look up by phone number (for hotspot customers).
   * This uses a different flow than JWT login.
   */
  portalLogin(phoneNumber: string): Observable<{ customerId: string }> {
    return this.http.post<{ customerId: string }>(
      '/api/portal/login',
      { phoneNumber },
      { withCredentials: true },
    );
  }
}
