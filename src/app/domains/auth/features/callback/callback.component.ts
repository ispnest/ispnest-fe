import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';

/**
 * OAuth2 callback component - handles the social login callback.
 * This component is loaded when the backend redirects back after
 * successful social authentication (Google, X/Twitter).
 *
 * The backend passes tokens via URL query parameters or fragment.
 */
@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [MatCard, MatProgressSpinner, MatIcon, MatButton],
  host: {
    class: 'flex flex-auto items-center justify-center bg-neutral-2',
  },
  template: `
    <mat-card appearance="raised" class="w-full max-w-sm p-8 text-center">
      @if (loading()) {
        <mat-spinner diameter="48" class="mx-auto" />
        <p class="mt-4 text-neutral-a11">Completing sign in...</p>
      } @else if (error()) {
        <mat-icon svgIcon="circle-x" class="mx-auto size-12 text-error-a11" />
        <h2 class="mt-4 text-lg font-semibold">Authentication Failed</h2>
        <p class="mt-2 text-sm text-neutral-a11">{{ error() }}</p>
        <button matButton class="primary mt-6" (click)="retry()">Try Again</button>
      } @else {
        <mat-icon svgIcon="circle-check" class="mx-auto size-12 text-success-a11" />
        <h2 class="mt-4 text-lg font-semibold">Signed In Successfully</h2>
        <p class="mt-2 text-sm text-neutral-a11">Redirecting...</p>
      }
    </mat-card>
  `,
})
export class OAuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.handleCallback();
  }

  private handleCallback(): void {
    // Extract query parameters from URL
    const params = this.route.snapshot.queryParams;

    // Check for tokens from social login callback
    const accessToken = params['access_token'];
    const refreshToken = params['refresh_token'];
    const expiresIn = params['expires_in'];

    // Handle error from OAuth2 provider
    const errorParam = params['error'];
    const errorDescription = params['error_description'];

    if (errorParam) {
      this.loading.set(false);
      this.error.set(errorDescription || `Authentication error: ${errorParam}`);
      return;
    }

    // Validate required token parameters
    if (!accessToken) {
      this.loading.set(false);
      this.error.set('Missing access token in callback');
      return;
    }

    try {
      // Store tokens and load user from token claims
      this.auth.handleOAuth2Callback(
        accessToken,
        refreshToken || '',
        expiresIn ? parseInt(expiresIn, 10) : 3600
      );

      this.loading.set(false);

      // Get stored return URL or default to home
      const returnUrl = params['return_url'] || '/';

      // Navigate after a brief delay to show success message
      setTimeout(() => {
        this.router.navigateByUrl(returnUrl);
      }, 500);
    } catch (err) {
      this.loading.set(false);
      this.error.set('Failed to process authentication tokens');
    }
  }

  retry(): void {
    // Redirect back to login page
    this.router.navigate(['/login']);
  }
}
