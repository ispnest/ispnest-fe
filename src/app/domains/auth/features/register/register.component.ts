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
import { Media } from '@/app/core/media';
import { CustomerApiService } from '@/app/domains/customers/data';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCard,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatIcon,
    MatStepper,
    MatStep,
    MatStepperNext,
    MatStepperPrevious,
  ],
  host: {
    class: 'flex flex-auto flex-col bg-neutral-2',
  },
  template: `
    <div class="flex flex-auto flex-col items-center justify-center sm:p-6">
      <div class="w-full max-w-xl">
        <!-- Logo / heading -->
        <div
          class="mb-8 flex flex-col items-start gap-3 px-4 sm:items-center sm:text-center sm:px-0"
        >
          <div class="flex items-center gap-x-2.5">
            <img class="size-9 object-contain" src="/img/ispnest-icon.svg" alt="ISPNest" />
            <img class="h-6 object-contain" src="/img/ispnest-logo.svg" alt="ISPNest" />
          </div>
          <div class="text-4xl font-semibold tracking-tight">Create Account</div>
          <div class="text-neutral-a11">Register for ISP services</div>
        </div>

        <mat-card
          [appearance]="isMobile() ? 'filled' : 'raised'"
          class="px-4 py-8 max-sm:bg-transparent sm:px-8"
        >
          <mat-stepper orientation="horizontal" #stepper linear>
            <!-- Step 1: Personal Info -->
            <mat-step [stepControl]="personalForm" label="Personal Info">
              <form [formGroup]="personalForm" class="flex flex-col gap-y-4 pt-6">
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
                <div class="flex justify-end pt-2">
                  <button
                    matButton
                    class="primary"
                    matStepperNext
                    [disabled]="personalForm.invalid"
                  >
                    Next
                    <mat-icon svgIcon="arrow-right" />
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Service Info -->
            <mat-step [stepControl]="serviceForm" label="Service">
              <form [formGroup]="serviceForm" class="flex flex-col gap-y-4 pt-6">
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

                @if (errorMessage()) {
                  <div
                    class="flex items-center gap-x-2 rounded-lg border border-error-a6 bg-error-a3 p-3 text-sm text-error-a11"
                  >
                    <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
                    {{ errorMessage() }}
                  </div>
                }

                <div class="flex items-center justify-between gap-3 pt-2">
                  <button matButton class="tertiary" matStepperPrevious>
                    <mat-icon svgIcon="arrow-left" />
                    Back
                  </button>
                  <button
                    matButton
                    class="primary"
                    (click)="submit()"
                    [disabled]="serviceForm.invalid || saving()"
                  >
                    {{ saving() ? 'Creating…' : 'Create Account' }}
                  </button>
                </div>
              </form>
            </mat-step>
          </mat-stepper>
        </mat-card>

        <p class="mt-4 text-center text-sm text-neutral-a11">
          Already have an account?
          <a
            routerLink="/portal"
            class="font-medium text-primary underline-offset-2 hover:underline"
            >Sign in to portal</a
          >
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
  protected readonly isMobile = inject(Media).match('(width < 40rem)');

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
        this.snackBar.open('Account created! Please contact support to activate.', 'OK', {
          duration: 5000,
        });
        this.router.navigate(['/portal']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Registration failed. Please try again.');
      },
    });
  }
}
