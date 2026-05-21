import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { kenyanPhoneValidator, normalizeKenyanPhone } from '@/app/core/utils/phone.utils';
import { CustomerApiService } from '@/app/domains/customers/data';

@Component({
  selector: 'app-customers-form',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCard,
    MatDivider,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-3xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <!-- Page header -->
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/customers">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ isEditMode ? 'Edit Customer' : 'New Customer' }}
          </h1>
          <p class="text-sm text-neutral-a11">
            {{ isEditMode ? 'Update subscriber details' : 'Register a new subscriber' }}
          </p>
        </div>
      </div>

      <mat-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-10 p-6">
          <!-- Section: Contact Info -->
          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">Contact Info</h2>
              <p class="mt-1 text-sm text-neutral-a11">
                Basic subscriber identity and contact details.
              </p>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 md:col-span-2">
              <mat-form-field class="sm:col-span-3">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="fullName" required />
                <mat-error>Full name is required</mat-error>
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>Username</mat-label>
                <input matInput formControlName="username" required />
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" />
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>Phone Number</mat-label>
                <input
                  matInput
                  formControlName="phoneNumber"
                  required
                  placeholder="07XX XXX XXX / +254…"
                />
                <mat-error>Enter a valid Kenyan number (07XX, 01XX, 254XX, or +254XX)</mat-error>
              </mat-form-field>
            </div>
          </div>

          <mat-divider />

          <!-- Section: Service Settings -->
          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">Service Settings</h2>
              <p class="mt-1 text-sm text-neutral-a11">
                Plan type, account category and current status.
              </p>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 md:col-span-2">
              <mat-form-field class="sm:col-span-2">
                <mat-label>Service Type</mat-label>
                <mat-select formControlName="serviceType">
                  <mat-option value="pppoe">PPPoE</mat-option>
                  <mat-option value="hotspot">Hotspot</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field class="sm:col-span-2">
                <mat-label>Account Type</mat-label>
                <mat-select formControlName="accountType">
                  <mat-option value="residential">Residential</mat-option>
                  <mat-option value="business">Business</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field class="sm:col-span-2">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="active">Active</mat-option>
                  <mat-option value="inactive">Inactive</mat-option>
                  <mat-option value="suspended">Suspended</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <mat-divider />

          <!-- Section: PPPoE Credentials -->
          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">PPPoE Credentials</h2>
              <p class="mt-1 text-sm text-neutral-a11">
                Credentials for PPPoE authentication on the RADIUS server.
              </p>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 md:col-span-2">
              <mat-form-field class="sm:col-span-3">
                <mat-label>PPPoE Username</mat-label>
                <input matInput formControlName="pppoeUsername" />
              </mat-form-field>

              <mat-form-field class="sm:col-span-3">
                <mat-label>PPPoE Password</mat-label>
                <input matInput formControlName="pppoePassword" />
              </mat-form-field>

              <mat-form-field class="sm:col-span-full">
                <mat-label>Coordinates</mat-label>
                <input matInput formControlName="coordinates" placeholder="-1.234, 36.789" />
              </mat-form-field>
            </div>
          </div>

          @if (errorMessage()) {
            <div
              class="flex items-center gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11"
            >
              <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
              {{ errorMessage() }}
            </div>
          }

          <mat-divider />

          <div class="flex justify-end gap-3">
            <a matButton class="tertiary" routerLink="/admin/customers">Cancel</a>
            <button class="primary" matButton type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : isEditMode ? 'Update Customer' : 'Create Customer' }}
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
    phoneNumber: ['', [Validators.required, kenyanPhoneValidator]],
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
      this.customerApi.getById(this.customerId).subscribe((c) => this.form.patchValue(c as never));
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    const raw = this.form.value as Record<string, unknown>;
    const value = {
      ...raw,
      phoneNumber: normalizeKenyanPhone(raw['phoneNumber'] as string),
    } as never;
    const call = this.isEditMode
      ? this.customerApi.update(this.customerId, value)
      : this.customerApi.create(value);

    call.subscribe({
      next: () => {
        this.snackBar.open(`Customer ${this.isEditMode ? 'updated' : 'created'}`, 'OK', {
          duration: 3000,
        });
        this.router.navigate(['/admin/customers']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      },
    });
  }
}
