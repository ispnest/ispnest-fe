import { HttpClient } from '@angular/common/http';
import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
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
  private readonly http = inject(HttpClient);
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

    // Check for OAuth2 success callback — the backend redirects here with a short-lived one-time
    // code (never live tokens, to avoid leaking them via the URL/browser history/server logs);
    // exchange it immediately for the actual token pair.
    const oauth2Success = this.route.snapshot.queryParams['oauth2_success'];
    const code = this.route.snapshot.queryParams['code'];
    if (oauth2Success === 'true' && code) {
      this.http
        .post<{
          access_token: string;
          refresh_token: string;
          expires_in: number;
        }>('/api/auth/oauth2/exchange', { code })
        .subscribe({
          next: (res) => {
            this.auth.handleOAuth2Callback(res.access_token, res.refresh_token, res.expires_in);
            this.router.navigate([this.auth.getPostLoginRedirect()]);
          },
          error: () => {
            this.errorMessage.set('Sign-in link expired. Please try again.');
          },
        });
      return;
    }

    // If already authenticated, redirect to the appropriate page based on role
    if (this.auth.isAuthenticated()) {
      this.router.navigate([this.auth.getPostLoginRedirect()]);
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
        // Route based on role: customers → portal, staff → admin
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        this.router.navigateByUrl(returnUrl ?? this.auth.getPostLoginRedirect());
      },
      error: (err) => {
        this.loading.set(false);
        const message =
          err.error?.message || err.error?.error_description || 'Login failed. Please try again.';
        this.errorMessage.set(message);
      },
    });
  }
}
