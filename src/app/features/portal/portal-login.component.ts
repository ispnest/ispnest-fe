import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CustomerApiService } from '../../core/api/customer-api.service';

@Component({
  selector: 'app-portal-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-white text-3xl" style="font-size: 2rem; width: 2rem; height: 2rem;">account_circle</mat-icon>
          </div>
          <h1 class="text-2xl font-bold text-white">Customer Portal</h1>
          <p class="text-blue-200 text-sm mt-1">Enter your phone number to access your account</p>
        </div>

        <mat-card class="p-6">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Phone Number</mat-label>
              <mat-icon matPrefix>phone</mat-icon>
              <input matInput formControlName="phoneNumber" placeholder="07XXXXXXXX" autocomplete="tel">
            </mat-form-field>

            @if (errorMessage()) {
              <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {{ errorMessage() }}
              </div>
            }

            <button mat-flat-button color="primary" type="submit" class="w-full"
                    [disabled]="form.invalid || loading()">
              {{ loading() ? 'Looking up…' : 'Access My Account' }}
            </button>

            <div class="text-center text-sm text-gray-500">
              No account? <a routerLink="/register" class="text-blue-600 hover:underline">Register here</a>
            </div>
          </form>
        </mat-card>

        <p class="text-center mt-4">
          <a routerLink="/" class="text-blue-200 hover:text-white text-sm">← Back to Homepage</a>
        </p>
      </div>
    </div>
  `
})
export class PortalLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly customerApi = inject(CustomerApiService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  form = this.fb.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^07\d{8}$|^01\d{8}$|^\+254\d{9}$/)]]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    const phone = this.form.value.phoneNumber!;

    this.customerApi.findByPhone(phone).subscribe({
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
      }
    });
  }
}


