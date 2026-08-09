import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { kenyanPhoneValidator, normalizeKenyanPhone } from '@/app/core/utils/phone.utils';
import { PortalApiService } from '@/app/domains/portal/data';

@Component({
  selector: 'app-portal-forgot-password',
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
  ],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-neutral-a2 p-6">
      <mat-card class="w-full max-w-sm px-8 py-12 sm:px-10">
        <div class="flex flex-col items-center gap-3">
          <div class="flex size-14 items-center justify-center rounded-2xl bg-primary-a3">
            <mat-icon svgIcon="key-round" class="text-primary-a11" />
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold tracking-tight">Reset Password</div>
            <p class="mt-1 text-sm text-neutral-a11">
              Enter your phone number and we'll text you a reset link
            </p>
          </div>
        </div>

        @if (submitted()) {
          <div class="mt-8 flex flex-col items-center gap-4 text-center">
            <div class="flex size-14 items-center justify-center rounded-full bg-success-a3">
              <mat-icon svgIcon="check-circle" class="size-8 text-success-a11" />
            </div>
            <p class="text-sm text-neutral-a11">
              If that number is registered, we've sent a password reset link by SMS. It expires in
              15 minutes.
            </p>
            <a routerLink="/portal" matButton class="primary w-full">Back to sign in</a>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8 flex flex-col gap-y-4">
            <mat-form-field class="w-full">
              <mat-label>Phone number</mat-label>
              <mat-icon matPrefix svgIcon="phone" />
              <input
                matInput
                formControlName="phoneNumber"
                placeholder="07XX XXXXXXX"
                autocomplete="tel"
              />
              <mat-error>
                @if (form.get('phoneNumber')?.errors?.['required']) {
                  Phone number is required
                } @else {
                  Enter a valid Kenyan number (07XX, 01XX, 254XX, or +254XX)
                }
              </mat-error>
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
              {{ loading() ? 'Sending…' : 'Send reset link' }}
            </button>

            <div class="text-center text-sm text-neutral-a11">
              <a routerLink="/portal" class="link text-primary-a11 decoration-primary-a11">
                Back to sign in
              </a>
            </div>
          </form>
        }
      </mat-card>
    </div>
  `,
})
export class PortalForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly portalApi = inject(PortalApiService);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal('');

  form = this.fb.group({
    phoneNumber: ['', [Validators.required, kenyanPhoneValidator]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');

    const phone = normalizeKenyanPhone(this.form.value.phoneNumber!);

    this.portalApi.forgotPassword(phone).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: () => {
        // Even on an unexpected error, don't reveal whether the phone is registered — show the
        // same generic outcome the user would see on success.
        this.loading.set(false);
        this.submitted.set(true);
      },
    });
  }
}
