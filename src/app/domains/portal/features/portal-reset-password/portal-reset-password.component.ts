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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PortalApiService } from '@/app/domains/portal/data';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPass = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return newPass && confirm && newPass !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-portal-reset-password',
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
        <div class="flex flex-col items-center gap-3">
          <div class="flex size-14 items-center justify-center rounded-2xl bg-primary-a3">
            <mat-icon svgIcon="key-round" class="text-primary-a11" />
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold tracking-tight">Set a new password</div>
          </div>
        </div>

        @if (!token()) {
          <div class="mt-8 flex flex-col items-center gap-4 text-center">
            <mat-icon svgIcon="circle-alert" class="size-8 text-red-a11" />
            <p class="text-sm text-neutral-a11">
              This reset link is missing or invalid. Please request a new one.
            </p>
            <a routerLink="/portal/forgot-password" matButton class="primary w-full">
              Request new link
            </a>
          </div>
        } @else if (success()) {
          <div class="mt-8 flex flex-col items-center gap-4 text-center">
            <div class="flex size-14 items-center justify-center rounded-full bg-success-a3">
              <mat-icon svgIcon="check-circle" class="size-8 text-success-a11" />
            </div>
            <p class="text-sm text-neutral-a11">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <a routerLink="/portal" matButton class="primary w-full">Sign in</a>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8 flex flex-col gap-y-4">
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

            <button
              class="primary w-full"
              matButton
              type="submit"
              [disabled]="form.invalid || saving()"
            >
              {{ saving() ? 'Saving…' : 'Reset Password' }}
            </button>
          </form>
        }
      </mat-card>
    </div>
  `,
})
export class PortalResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly portalApi = inject(PortalApiService);
  private readonly route = inject(ActivatedRoute);

  readonly token = signal<string | null>(null);
  readonly saving = signal(false);
  readonly success = signal(false);
  readonly errorMessage = signal('');
  readonly showNew = signal(false);
  readonly showConfirm = signal(false);

  form = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  constructor() {
    this.token.set(this.route.snapshot.queryParamMap.get('token'));
  }

  submit(): void {
    if (this.form.invalid) return;
    const token = this.token();
    if (!token) return;

    this.saving.set(true);
    this.errorMessage.set('');

    this.portalApi.resetPassword(token, this.form.value.newPassword!).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(true);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'This reset link is invalid or has expired.');
      },
    });
  }
}
