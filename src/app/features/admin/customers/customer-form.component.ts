import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerApiService } from '../../../core/api/customer-api.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule
  ],
  template: `
    <div class="max-w-2xl mx-auto space-y-4">
      <div class="flex items-center gap-3">
        <a mat-icon-button routerLink="/admin/customers"><mat-icon>arrow_back</mat-icon></a>
        <h1 class="text-2xl font-bold text-gray-900">{{ isEditMode ? 'Edit Customer' : 'New Customer' }}</h1>
      </div>

      <mat-card class="p-6">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" required>
              @if (form.get('fullName')?.invalid && form.get('fullName')?.touched) {
                <mat-error>Full name is required</mat-error>
              }
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

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Service Type</mat-label>
              <mat-select formControlName="serviceType">
                <mat-option value="pppoe">PPPoE</mat-option>
                <mat-option value="hotspot">Hotspot</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Account Type</mat-label>
              <mat-select formControlName="accountType">
                <mat-option value="residential">Residential</mat-option>
                <mat-option value="business">Business</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="active">Active</mat-option>
                <mat-option value="inactive">Inactive</mat-option>
                <mat-option value="suspended">Suspended</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>PPPoE Username</mat-label>
              <input matInput formControlName="pppoeUsername">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>PPPoE Password</mat-label>
              <input matInput formControlName="pppoePassword">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Coordinates</mat-label>
              <input matInput formControlName="coordinates" placeholder="-1.234, 36.789">
            </mat-form-field>
          </div>

          @if (errorMessage()) {
            <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex gap-3 justify-end">
            <a mat-button routerLink="/admin/customers">Cancel</a>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : (isEditMode ? 'Update Customer' : 'Create Customer') }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `
})
export class CustomerFormComponent implements OnInit {
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
    coordinates: ['']
  });

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.customerId;
    if (this.isEditMode) {
      this.customerApi.getById(this.customerId).subscribe(c => this.form.patchValue(c as any));
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    const value = this.form.value as any;
    const call = this.isEditMode
      ? this.customerApi.update(this.customerId, value)
      : this.customerApi.create(value);

    call.subscribe({
      next: () => {
        this.snackBar.open(`Customer ${this.isEditMode ? 'updated' : 'created'}`, 'OK', { duration: 3000 });
        this.router.navigate(['/admin/customers']);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      }
    });
  }
}

