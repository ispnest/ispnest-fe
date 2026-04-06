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
  imports: [RouterLink, ReactiveFormsModule, MatCard, MatButton, MatFormField, MatLabel, MatInput, MatIcon],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-600 to-indigo-700 p-4">
      <div class="w-full max-w-sm">
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/20">
            <mat-icon svgIcon="user-round" class="size-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-white">Customer Portal</h1>
          <p class="mt-1 text-sm text-blue-200">Enter your phone number to access your account</p>
        </div>

        <mat-card class="px-8 py-10">
          <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-4">
            <mat-form-field class="w-full">
              <mat-label>Phone Number</mat-label>
              <mat-icon matPrefix svgIcon="phone" />
              <input matInput formControlName="phoneNumber" placeholder="07XXXXXXXX" autocomplete="tel" />
            </mat-form-field>

            @if (errorMessage()) {
              <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {{ errorMessage() }}
              </div>
            }

            <button class="primary" matButton type="submit" [disabled]="form.invalid || loading()">
              {{ loading() ? 'Looking up…' : 'Access My Account' }}
            </button>

            <div class="text-center text-sm text-neutral-a11">
              No account?
              <a routerLink="/register" class="text-primary-a11 hover:underline">Register here</a>
            </div>
          </form>
        </mat-card>

        <p class="mt-4 text-center">
          <a routerLink="/" class="text-sm text-blue-200 hover:text-white">← Back to Homepage</a>
        </p>
      </div>
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
    phoneNumber: ['', [Validators.required, Validators.pattern(/^07\d{8}$|^01\d{8}$|^\+254\d{9}$/)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.customerApi.findByPhone(this.form.value.phoneNumber!).subscribe({
      next: customer => {
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

