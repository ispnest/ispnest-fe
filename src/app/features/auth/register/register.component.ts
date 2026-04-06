import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { Router, RouterLink } from '@angular/router';
import { CustomerApiService } from '../../../core/api/customer-api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatStepperModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
      <div class="w-full max-w-xl">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-white">Create Account</h1>
          <p class="text-slate-400 mt-1">Register for ISP services</p>
        </div>

        <mat-card class="p-6">
          <mat-stepper orientation="horizontal" #stepper linear>
            <!-- Step 1: Personal Info -->
            <mat-step [stepControl]="personalForm" label="Personal Info">
              <form [formGroup]="personalForm" class="space-y-4 pt-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Full Name</mat-label>
                    <input matInput formControlName="fullName" required>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Username</mat-label>
                    <input matInput formControlName="username" required>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phoneNumber" required>
                  </mat-form-field>
                </div>
                <div class="flex justify-end">
                  <button mat-flat-button color="primary" matStepperNext [disabled]="personalForm.invalid">Next</button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Service Info -->
            <mat-step [stepControl]="serviceForm" label="Service">
              <form [formGroup]="serviceForm" class="space-y-4 pt-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Service Type</mat-label>
                  <mat-select formControlName="serviceType">
                    <mat-option value="pppoe">PPPoE (Fiber/ADSL)</mat-option>
                    <mat-option value="hotspot">Hotspot (WiFi)</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Account Type</mat-label>
                  <mat-select formControlName="accountType">
                    <mat-option value="residential">Residential</mat-option>
                    <mat-option value="business">Business</mat-option>
                  </mat-select>
                </mat-form-field>
                <div class="flex gap-3 justify-between">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-flat-button color="primary" (click)="submit()" [disabled]="serviceForm.invalid || saving()">
                    {{ saving() ? 'Creating…' : 'Create Account' }}
                  </button>
                </div>
              </form>
            </mat-step>
          </mat-stepper>

          @if (errorMessage()) {
            <div class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {{ errorMessage() }}
            </div>
          }
        </mat-card>

        <p class="text-center text-slate-400 text-sm mt-4">
          Already have an account? <a routerLink="/portal" class="text-blue-400 hover:text-blue-300">Sign in to portal</a>
        </p>
      </div>
    </div>
  `
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
    phoneNumber: ['', Validators.required]
  });

  serviceForm = this.fb.group({
    serviceType: ['pppoe', Validators.required],
    accountType: ['residential']
  });

  submit(): void {
    if (this.personalForm.invalid || this.serviceForm.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    const req = { ...this.personalForm.value, ...this.serviceForm.value, status: 'inactive' };
    this.customerApi.create(req as any).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open('Account created! Please contact support to activate.', 'OK', { duration: 5000 });
        this.router.navigate(['/portal']);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Registration failed. Please try again.');
      }
    });
  }
}

