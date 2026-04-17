import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { Media } from '@/app/core/media';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCard,
    MatButton,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatSuffix,
    MatInput,
    MatIcon,
  ],
  host: {
    class: 'flex flex-auto flex-col bg-neutral-2',
  },
  template: `
    <div class="flex flex-auto flex-col items-center justify-center sm:p-6">
      <mat-card
        [appearance]="isMobile() ? 'filled' : 'raised'"
        class="w-full max-w-sm px-4 py-12 max-sm:bg-transparent sm:px-10"
      >
        <!-- Logo -->
        <div class="flex items-center gap-x-2.5">
          <img class="size-9 object-contain" src="/img/ispnest-icon.svg" alt="ISPNest" />
          <img class="h-6 object-contain" src="/img/ispnest-logo-text.svg" alt="ISPNest" />
        </div>

        <div class="mt-8 text-4xl font-semibold tracking-tight">Sign in</div>
        <div class="mt-1 flex items-center gap-x-1">
          <span class="text-neutral-a11">Access the ISPNest admin panel</span>
        </div>

        @if (errorMessage()) {
          <div
            class="mt-6 flex items-center gap-x-2 rounded-lg border border-error-a6 bg-error-a3 p-3 text-sm text-error-a11"
          >
            <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
            {{ errorMessage() }}
          </div>
        }

        <!-- Email/Password Login Form -->
        <form [formGroup]="form" (ngSubmit)="submitForm()" class="mt-6 flex flex-col gap-y-4">
          <mat-form-field class="w-full">
            <mat-label>Email</mat-label>
            <mat-icon matPrefix svgIcon="mail" />
            <input matInput formControlName="email" type="email" autocomplete="username" />
          </mat-form-field>

          <mat-form-field class="w-full">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix svgIcon="lock-keyhole" />
            <input
              matInput
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              autocomplete="current-password"
            />
            <button type="button" matIconButton matSuffix (click)="showPassword.update((v) => !v)">
              <mat-icon [svgIcon]="showPassword() ? 'eye-off' : 'eye'" />
            </button>
          </mat-form-field>

          <button
            matButton
            class="primary large w-full"
            type="submit"
            [disabled]="form.invalid || loading()"
          >
            @if (loading()) {
              <ng-container>
                <mat-icon svgIcon="loader-circle" class="animate-spin" />
                <span>Signing in...</span>
              </ng-container>
            } @else {
              <ng-container>
                <mat-icon svgIcon="log-in" />
                <span>Sign In</span>
              </ng-container>
            }
          </button>
        </form>

        <div class="mt-6 flex items-center gap-x-4">
          <div class="h-px flex-1 bg-neutral-a6"></div>
          <span class="text-xs text-neutral-a11">or continue with</span>
          <div class="h-px flex-1 bg-neutral-a6"></div>
        </div>

        <!-- Social Login Buttons -->
        <div class="mt-6 flex flex-col gap-y-3">
          <button
            matButton
            class="secondary large w-full"
            type="button"
            [disabled]="loading()"
            (click)="signInWithGoogle()"
          >
            <svg class="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <button
            matButton
            class="secondary large w-full"
            type="button"
            [disabled]="loading()"
            (click)="signInWithX()"
          >
            <svg class="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
            Continue with X
          </button>
        </div>

        <p class="mt-6 text-center text-sm text-neutral-a11">
          Not a customer?
          <a routerLink="/" class="font-medium text-primary underline-offset-2 hover:underline"
            >Visit Homepage</a
          >
        </p>
      </mat-card>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  protected readonly isMobile = inject(Media).match('(width < 40rem)');

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    // Check for error from OAuth callback
    const error = this.route.snapshot.queryParams['error'];
    if (error) {
      this.errorMessage.set(this.route.snapshot.queryParams['error_description'] || error);
    }

    // Check for OAuth2 success callback with tokens
    const oauth2Success = this.route.snapshot.queryParams['oauth2_success'];
    if (oauth2Success === 'true') {
      const accessToken = this.route.snapshot.queryParams['access_token'];
      const refreshToken = this.route.snapshot.queryParams['refresh_token'];
      const expiresIn = parseInt(this.route.snapshot.queryParams['expires_in'] || '3600', 10);

      if (accessToken && refreshToken) {
        this.auth.handleOAuth2Callback(accessToken, refreshToken, expiresIn);
        this.router.navigate(['/admin']);
        return;
      }
    }

    // If already authenticated, redirect to admin
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/admin']);
    }
  }

  /**
   * Submit email/password login form.
   */
  submitForm(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.loading.set(false);
        const message =
          err.error?.message || err.error?.error_description || 'Login failed. Please try again.';
        this.errorMessage.set(message);
      },
    });
  }

  /**
   * Initiate Google OAuth2 login.
   */
  signInWithGoogle(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.auth.loginWithGoogle();
  }

  /**
   * Initiate X (Twitter) OAuth2 login.
   */
  signInWithX(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.auth.loginWithX();
  }
}

