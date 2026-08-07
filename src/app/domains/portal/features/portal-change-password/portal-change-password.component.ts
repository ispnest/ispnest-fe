import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { PortalApiService } from '@/app/domains/portal/data';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPass = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return newPass && confirm && newPass !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-portal-change-password',
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
    <div class="min-h-screen bg-neutral-a2 pb-16 lg:pb-0">
      <!-- Header -->
      <div class="bg-primary px-4 py-4 text-primary-contrast">
        <div class="mx-auto flex max-w-lg items-center gap-3">
          @if (auth.currentUser()?.forcePasswordChange) {
            <button
              matIconButton
              class="text-inherit"
              (click)="auth.portalLogout()"
              aria-label="Log out"
            >
              <mat-icon svgIcon="log-out" />
            </button>
          } @else {
            <a matIconButton routerLink="/portal/dashboard" class="text-inherit">
              <mat-icon svgIcon="arrow-left" />
            </a>
          }
          <h1 class="flex-1 font-bold">Account Settings</h1>
        </div>
      </div>

      <div class="mx-auto max-w-lg space-y-4 px-4 py-6">
        <!-- Forced-change banner -->
        @if (auth.currentUser()?.forcePasswordChange) {
          <div
            class="flex items-start gap-3 rounded-xl border border-amber-a6 bg-amber-a3 p-4 text-sm text-amber-a11"
          >
            <mat-icon svgIcon="triangle-alert" class="mt-0.5 size-4 shrink-0" />
            <span>
              Your password is still the default. Please change it now to secure your account.
            </span>
          </div>
        }

        <mat-card class="p-6">
          <h2 class="mb-4 font-semibold">Change Password</h2>

          <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-4">
            <!-- Current password (UX confirmation only — not sent to server) -->
            <mat-form-field class="w-full">
              <mat-label>Current password</mat-label>
              <mat-icon matPrefix svgIcon="lock" />
              <input
                matInput
                [type]="showCurrent() ? 'text' : 'password'"
                formControlName="currentPassword"
                autocomplete="current-password"
              />
              <button
                matSuffix
                matIconButton
                type="button"
                (click)="showCurrent.set(!showCurrent())"
              >
                <mat-icon [svgIcon]="showCurrent() ? 'eye-off' : 'eye'" />
              </button>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>New password</mat-label>
              <mat-icon matPrefix svgIcon="key" />
              <input
                matInput
                [type]="showNew() ? 'text' : 'password'"
                formControlName="newPassword"
                autocomplete="new-password"
              />
              <button matSuffix matIconButton type="button" (click)="showNew.set(!showNew())">
                <mat-icon [svgIcon]="showNew() ? 'eye-off' : 'eye'" />
              </button>
              <mat-hint>Minimum 8 characters</mat-hint>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Confirm new password</mat-label>
              <mat-icon matPrefix svgIcon="key" />
              <input
                matInput
                [type]="showConfirm() ? 'text' : 'password'"
                formControlName="confirmPassword"
                autocomplete="new-password"
              />
              <button
                matSuffix
                matIconButton
                type="button"
                (click)="showConfirm.set(!showConfirm())"
              >
                <mat-icon [svgIcon]="showConfirm() ? 'eye-off' : 'eye'" />
              </button>
            </mat-form-field>

            @if (
              form.get('newPassword')?.errors?.['minlength'] && form.get('newPassword')?.touched
            ) {
              <p class="text-xs text-red-a11">At least 8 characters required.</p>
            }
            @if (form.errors?.['passwordMismatch'] && form.get('confirmPassword')?.touched) {
              <p class="text-xs text-red-a11">Passwords do not match.</p>
            }

            @if (errorMessage()) {
              <div
                class="flex items-center gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11"
              >
                <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
                {{ errorMessage() }}
              </div>
            }

            @if (successMessage()) {
              <div
                class="flex items-center gap-2 rounded-lg border border-success-a6 bg-success-a3 p-3 text-sm text-success-a11"
              >
                <mat-icon svgIcon="check-circle" class="size-4 shrink-0" />
                {{ successMessage() }}
              </div>
            }

            <button
              class="primary w-full"
              matButton
              type="submit"
              [disabled]="form.invalid || saving()"
            >
              {{ saving() ? 'Saving…' : 'Change Password' }}
            </button>
          </form>
        </mat-card>
      </div>
    </div>
  `,
})
export class PortalChangePasswordComponent {
  protected readonly auth = inject(AuthService);
  private readonly portalApi = inject(PortalApiService);
  private readonly fb = inject(FormBuilder);

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly showCurrent = signal(false);
  readonly showNew = signal(false);
  readonly showConfirm = signal(false);

  form = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.portalApi.changePassword(this.form.value.newPassword!).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Password changed successfully.');

        // The stored JWT still carries the old force_password_change claim — issuing a fresh one
        // requires POST /api/auth/refresh, which the backend hasn't implemented yet (501). Rather
        // than continue the session on a stale token (any full page reload would re-derive
        // forcePasswordChange as true from it and loop back to this screen), sign the user out and
        // have them log back in with their new password to get a correct token.
        setTimeout(() => this.auth.portalLogout(), 1500);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(
          err?.error?.message ?? 'Failed to change password. Please try again.',
        );
      },
    });
  }
}
