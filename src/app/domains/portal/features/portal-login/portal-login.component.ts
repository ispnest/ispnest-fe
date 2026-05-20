import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { switchMap, of } from 'rxjs';
import { AuthService } from '@/app/core/auth/auth.service';
import { PortalApiService } from '@/app/domains/portal/data';

/** Heuristic: account codes are short alphanumeric strings (not phone numbers). */
function isAccountCode(value: string): boolean {
  return /^[A-Za-z0-9]{4,12}$/.test(value) && !/^(07|01|254|\+254)/.test(value);
}

@Component({
  selector: 'app-portal-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCard,
    MatButton,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatHint,
    MatInput,
    MatIcon,
  ],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-neutral-a2 p-6">
      <mat-card class="w-full max-w-sm px-8 py-12 sm:px-10">
        <!-- Logo & title -->
        <div class="flex flex-col items-center gap-3">
          <div class="flex size-14 items-center justify-center rounded-2xl bg-primary-a3">
            <mat-icon svgIcon="user-round" class="text-primary-a11" />
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold tracking-tight">Customer Portal</div>
            <p class="mt-1 text-sm text-neutral-a11">
              Sign in with your phone number or account code
            </p>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8 flex flex-col gap-y-4">
          <mat-form-field class="w-full">
            <mat-label>Phone number or account code</mat-label>
            <mat-icon matPrefix svgIcon="user" />
            <input
              matInput
              formControlName="identifier"
              placeholder="e.g. 2547XXXXXXXX or ISP-ABC123"
              autocomplete="username"
            />
            <mat-hint>Enter your phone number or account code</mat-hint>
          </mat-form-field>

          <mat-form-field class="w-full">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix svgIcon="lock" />
            <input
              matInput
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              autocomplete="current-password"
            />
            <button
              matSuffix
              type="button"
              matIconButton
              (click)="showPassword.set(!showPassword())"
            >
              <mat-icon [svgIcon]="showPassword() ? 'eye-off' : 'eye'" />
            </button>
          </mat-form-field>

          @if (errorMessage()) {
            <div
              class="flex items-center gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11"
            >
              <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
              {{ errorMessage() }}
            </div>
          }

          <button
            class="primary w-full"
            matButton
            type="submit"
            [disabled]="form.invalid || loading()"
          >
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>

          <div class="flex flex-col items-center gap-1 text-center text-sm text-neutral-a11">
            <span>
              No account?
              <a routerLink="/register" class="link text-primary-a11 decoration-primary-a11">
                Register here
              </a>
            </span>
            <span class="text-xs text-neutral-a9">
              Forgot password? Contact support for assistance.
            </span>
          </div>
        </form>
      </mat-card>

      <p class="mt-4 text-center">
        <a routerLink="/" class="text-sm text-neutral-a11 hover:text-neutral-a12">
          ← Back to Homepage
        </a>
      </p>
    </div>
  `,
})
export class PortalLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly portalApi = inject(PortalApiService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);

  form = this.fb.group({
    identifier: ['', [Validators.required, Validators.minLength(4)]],
    password: ['', [Validators.required, Validators.minLength(1)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');

    const identifier = this.form.value.identifier!.trim();
    const password = this.form.value.password!;

    // If the value looks like an account code, resolve it to a phone number first.
    const phone$ = isAccountCode(identifier)
      ? this.portalApi.resolveAccountCode(identifier).pipe(switchMap((res) => of(res.phoneNumber)))
      : of(identifier);

    phone$.pipe(switchMap((phone) => this.auth.login(phone, password))).subscribe({
      next: (user) => {
        this.loading.set(false);
        if (user.forcePasswordChange) {
          this.router.navigate(['/portal/settings']);
        } else {
          this.router.navigate(['/portal/dashboard']);
        }
      },
      error: (err: { status?: number; error?: { message?: string } }) => {
        this.loading.set(false);
        if (err.status === 401 || err.status === 403) {
          this.errorMessage.set(
            'Invalid credentials. Please check your phone/account code and password.',
          );
        } else if (err.status === 404) {
          this.errorMessage.set('Account code not found. Please check and try again.');
        } else {
          this.errorMessage.set(err?.error?.message ?? 'Sign-in failed. Please try again.');
        }
      },
    });
  }
}
