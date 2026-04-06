import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerApiService } from '@/app/domains/customers/data';

@Component({
  selector: 'app-customers-form',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatCard, MatButton, MatIconButton, MatIcon,
    MatFormField, MatLabel, MatError, MatInput, MatSelect, MatOption,
  ],
  template: `
    <div class="mx-auto max-w-2xl space-y-4">
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/customers">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ isEditMode ? 'Edit Customer' : 'New Customer' }}
        </h1>
      </div>

      <mat-card class="p-6">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <mat-form-field class="w-full">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" required />
              @if (form.get('fullName')?.invalid && form.get('fullName')?.touched) {
                <mat-error>Full name is required</mat-error>
              }
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

            <mat-form-field class="w-full">
              <mat-label>Service Type</mat-label>
              <mat-select formControlName="serviceType">
                <mat-option value="pppoe">PPPoE</mat-option>
                <mat-option value="hotspot">Hotspot</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Account Type</mat-label>
              <mat-select formControlName="accountType">
                <mat-option value="residential">Residential</mat-option>
                <mat-option value="business">Business</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="active">Active</mat-option>
                <mat-option value="inactive">Inactive</mat-option>
                <mat-option value="suspended">Suspended</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>PPPoE Username</mat-label>
              <input matInput formControlName="pppoeUsername" />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>PPPoE Password</mat-label>
              <input matInput formControlName="pppoePassword" />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Coordinates</mat-label>
              <input matInput formControlName="coordinates" placeholder="-1.234, 36.789" />
            </mat-form-field>
          </div>

          @if (errorMessage()) {
            <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700
                        dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex justify-end gap-3">
            <a matButton routerLink="/admin/customers">Cancel</a>
            <button class="primary" matButton type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : (isEditMode ? 'Update Customer' : 'Create Customer') }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
})
export class CustomersFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customerApi = inject(CustomerApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  isEditMode = false;
  customerId = '';

  form = this.fb.group({
    fullName: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', Validators.email],
    phoneNumber: ['', Validators.required],
    serviceType: ['pppoe', Validators.required],
    accountType: ['residential'],
    status: ['active'],
    pppoeUsername: [''],
    pppoePassword: [''],
    coordinates: [''],
  });

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.customerId;
    if (this.isEditMode) {
      this.customerApi.getById(this.customerId).subscribe(c => this.form.patchValue(c as never));
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    const value = this.form.value as never;
    const call = this.isEditMode
      ? this.customerApi.update(this.customerId, value)
      : this.customerApi.create(value);

    call.subscribe({
      next: () => {
        this.snackBar.open(`Customer ${this.isEditMode ? 'updated' : 'created'}`, 'OK', { duration: 3000 });
        this.router.navigate(['/admin/customers']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      },
    });
  }
}

