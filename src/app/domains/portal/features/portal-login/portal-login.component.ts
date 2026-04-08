import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { CustomerApiService } from '@/app/domains/customers/data';

@Component({
  selector: 'app-portal-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCard,
    MatButton,
    MatFormField,
    MatLabel,
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
              Enter your phone number to access your account
            </p>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8 flex flex-col gap-y-4">
          <mat-form-field class="w-full">
            <mat-label>Phone Number</mat-label>
            <mat-icon matPrefix svgIcon="phone" />
            <input
              matInput
              formControlName="phoneNumber"
              placeholder="2547XXXXXXXX"
              autocomplete="tel"
            />
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
            {{ loading() ? 'Looking up…' : 'Access My Account' }}
          </button>

          <div class="text-center text-sm text-neutral-a11">
            No account?
            <a routerLink="/register" class="link text-primary-a11 decoration-primary-a11" matButton
              >Register here</a
            >
          </div>
        </form>
      </mat-card>

      <p class="mt-4 text-center">
        <a routerLink="/" class="text-sm text-neutral-a11 hover:text-neutral-a12"
          >← Back to Homepage</a
        >
      </p>
    </div>
  `,
})
export class PortalLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly customerApi = inject(CustomerApiService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  form = this.fb.group({
    phoneNumber: [
      '',
      [Validators.required, Validators.pattern(/^2547\d{8}$|^01\d{8}$|^\+254\d{9}$/)],
    ],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.customerApi.findByPhone(this.form.value.phoneNumber!).subscribe({
      next: (customer) => {
        this.loading.set(false);
        if (!customer) {
          this.errorMessage.set('No account found for this phone number. Please register first.');
        } else {
          sessionStorage.setItem('portalCustomerId', customer.id);
          this.router.navigate(['/portal/dashboard']);
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Service unavailable. Please try again.');
      },
    });
  }
}
