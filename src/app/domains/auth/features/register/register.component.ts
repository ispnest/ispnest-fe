import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStep, MatStepper, MatStepperNext, MatStepperPrevious } from '@angular/material/stepper';
import { Router, RouterLink } from '@angular/router';
import { CustomerApiService } from '@/app/domains/customers/data';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatCard, MatButton, MatFormField, MatLabel, MatInput, MatSelect, MatOption, MatIcon,
    MatStepper, MatStep, MatStepperNext, MatStepperPrevious,
  ],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 to-blue-900 p-4">
      <div class="w-full max-w-xl">
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold text-white">Create Account</h1>
          <p class="mt-1 text-slate-400">Register for ISP services</p>
        </div>

        <mat-card class="p-6">
          <mat-stepper orientation="horizontal" #stepper linear>
            <!-- Step 1: Personal Info -->
            <mat-step [stepControl]="personalForm" label="Personal Info">
              <form [formGroup]="personalForm" class="space-y-4 pt-4">
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <mat-form-field class="w-full">
                    <mat-label>Full Name</mat-label>
                    <input matInput formControlName="fullName" required />
                  </mat-form-field>
                  <mat-form-field class="w-full">
                    <mat-label>Username</mat-label>
                    <input matInput formControlName="username" required />
                  </mat-form-field>
                  <mat-form-field class="w-full">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email" />
                  </mat-form-field>
                  <mat-form-field class="w-full">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phoneNumber" required />
                  </mat-form-field>
                </div>
                <div class="flex justify-end">
                  <button class="primary" matButton matStepperNext [disabled]="personalForm.invalid">
                    Next
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Service Info -->
            <mat-step [stepControl]="serviceForm" label="Service">
              <form [formGroup]="serviceForm" class="space-y-4 pt-4">
                <mat-form-field class="w-full">
                  <mat-label>Service Type</mat-label>
                  <mat-select formControlName="serviceType">
                    <mat-option value="pppoe">PPPoE (Fiber/ADSL)</mat-option>
                    <mat-option value="hotspot">Hotspot (WiFi)</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field class="w-full">
                  <mat-label>Account Type</mat-label>
                  <mat-select formControlName="accountType">
                    <mat-option value="residential">Residential</mat-option>
                    <mat-option value="business">Business</mat-option>
                  </mat-select>
                </mat-form-field>
                <div class="flex justify-between gap-3">
                  <button matButton matStepperPrevious>Back</button>
                  <button class="primary" matButton (click)="submit()"
                          [disabled]="serviceForm.invalid || saving()">
                    {{ saving() ? 'Creating…' : 'Create Account' }}
                  </button>
                </div>
              </form>
            </mat-step>
          </mat-stepper>

          @if (errorMessage()) {
            <div class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700
                        dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {{ errorMessage() }}
            </div>
          }
        </mat-card>

        <p class="mt-4 text-center text-sm text-slate-400">
          Already have an account?
          <a routerLink="/portal" class="text-blue-400 hover:text-blue-300">Sign in to portal</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly customerApi = inject(CustomerApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly errorMessage = signal('');

  personalForm = this.fb.group({
    fullName: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', Validators.email],
    phoneNumber: ['', Validators.required],
  });

  serviceForm = this.fb.group({
    serviceType: ['pppoe', Validators.required],
    accountType: ['residential'],
  });

  submit(): void {
    if (this.personalForm.invalid || this.serviceForm.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    const req = { ...this.personalForm.value, ...this.serviceForm.value, status: 'inactive' };
    this.customerApi.create(req as never).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open('Account created! Please contact support to activate.', 'OK', { duration: 5000 });
        this.router.navigate(['/portal']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Registration failed. Please try again.');
      },
    });
  }
}

