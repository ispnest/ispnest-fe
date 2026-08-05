import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';

@Component({
  selector: 'app-owner-portal-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCard,
    MatButton,
    MatError,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatIconButton,
  ],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-neutral-a2 p-6">
      <mat-card class="w-full max-w-sm px-8 py-12 sm:px-10">
        <!-- Logo & title -->
        <div class="flex flex-col items-center gap-3">
          <div class="flex size-14 items-center justify-center rounded-2xl bg-primary-a3">
            <mat-icon svgIcon="home" class="text-primary-a11" />
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold tracking-tight">Owner Portal</div>
            <p class="mt-1 text-sm text-neutral-a11">Sign in to manage your properties</p>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8 flex flex-col gap-y-4">
          <mat-form-field class="w-full">
            <mat-label>Email</mat-label>
            <mat-icon matPrefix svgIcon="mail" />
            <input matInput type="email" formControlName="email" autocomplete="username" />
            <mat-error>Enter a valid email</mat-error>
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

          <p class="text-center text-xs text-neutral-a9">
            Don't have access yet? Contact your property manager.
          </p>
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
export class OwnerPortalLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl && returnUrl.startsWith('/owner-portal')) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.router.navigate(['/owner-portal/dashboard']);
        }
      },
      error: (err: { status?: number; error?: { message?: string } }) => {
        this.loading.set(false);
        if (err.status === 401 || err.status === 403) {
          this.errorMessage.set('Invalid email or password.');
        } else {
          this.errorMessage.set(err?.error?.message ?? 'Sign-in failed. Please try again.');
        }
      },
    });
  }
}
