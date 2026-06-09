import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { TenantService } from '../../data';

@Component({
  selector: 'app-tenant-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatCard,
    MatFormField,
    MatLabel,
    MatError,
    MatIcon,
    MatInput,
    MatProgressSpinner,
    RouterLink,
  ],
  host: { class: 'flex flex-auto flex-col' },
  template: `
    <div class="flex flex-col gap-6 p-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a matButton routerLink="/admin/tenants">
          <mat-icon svgIcon="arrow-left" />
          Back
        </a>
        <div>
          <h1 class="text-2xl font-bold text-neutral-12">Create Tenant</h1>
          <p class="mt-0.5 text-sm text-neutral-11">Provision a new ISP tenant on the platform.</p>
        </div>
      </div>

      <mat-card appearance="outlined" class="max-w-xl p-6">
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-5">
          <!-- Tenant details -->
          <div class="flex flex-col gap-1">
            <h2 class="text-lg font-semibold text-neutral-12">Tenant Details</h2>
            <p class="text-sm text-neutral-11">Basic identity for the new ISP.</p>
          </div>

          <mat-form-field class="w-full">
            <mat-label>Display Name</mat-label>
            <input matInput formControlName="displayName" placeholder="e.g. Acme Internet" />
            @if (form.controls.displayName.hasError('required')) {
              <mat-error>Display name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field class="w-full">
            <mat-label>Slug (subdomain)</mat-label>
            <input
              matInput
              formControlName="slug"
              placeholder="e.g. acme-internet"
              (input)="onSlugInput($event)"
            />
            @if (form.controls.slug.hasError('required')) {
              <mat-error>Slug is required</mat-error>
            }
            @if (form.controls.slug.hasError('pattern')) {
              <mat-error
                >Lowercase letters, numbers, and hyphens only (start with a letter)</mat-error
              >
            }
            @if (form.controls.slug.hasError('minlength')) {
              <mat-error>At least 2 characters</mat-error>
            }
          </mat-form-field>

          <!-- Admin user -->
          <div class="flex flex-col gap-1 pt-4">
            <h2 class="text-lg font-semibold text-neutral-12">Bootstrap Admin</h2>
            <p class="text-sm text-neutral-11">
              This admin user will be created once provisioning completes.
            </p>
          </div>

          <mat-form-field class="w-full">
            <mat-label>Admin Email</mat-label>
            <input matInput formControlName="adminEmail" placeholder="admin@example.com" />
            @if (form.controls.adminEmail.hasError('required')) {
              <mat-error>Email is required</mat-error>
            }
            @if (form.controls.adminEmail.hasError('email')) {
              <mat-error>Must be a valid email</mat-error>
            }
          </mat-form-field>

          <mat-form-field class="w-full">
            <mat-label>Admin Name</mat-label>
            <input matInput formControlName="adminDisplayName" placeholder="John Doe" />
            @if (form.controls.adminDisplayName.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <!-- Actions -->
          <div class="flex items-center gap-3 pt-4">
            <button
              matButton
              class="primary"
              type="submit"
              [disabled]="form.invalid || submitting()"
            >
              @if (submitting()) {
                <mat-progress-spinner mode="indeterminate" diameter="18" />
              } @else {
                <mat-icon svgIcon="plus" />
              }
              Create Tenant
            </button>
            <a matButton routerLink="/admin/tenants">Cancel</a>
          </div>
        </form>
      </mat-card>
    </div>
  `,
})
export class TenantCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.maxLength(255)]],
    slug: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(40),
        Validators.pattern(/^[a-z][a-z0-9-]{0,38}[a-z0-9]$/),
      ],
    ],
    adminEmail: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    adminDisplayName: ['', [Validators.required, Validators.maxLength(255)]],
  });

  onSlugInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Auto-lowercase and strip invalid chars
    input.value = input.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    this.form.controls.slug.setValue(input.value);
  }

  submit() {
    if (this.form.invalid) return;
    this.submitting.set(true);

    const { displayName, slug, adminEmail, adminDisplayName } = this.form.getRawValue();
    this.tenantService
      .create({
        slug,
        displayName,
        adminOnboarding: { email: adminEmail, displayName: adminDisplayName },
      })
      .subscribe({
        next: (created) => {
          this.snackBar.open(
            `Tenant "${created.displayName}" created. Provisioning started.`,
            'OK',
            { duration: 5000 },
          );
          this.router.navigate(['/admin/tenants']);
        },
        error: (err) => {
          this.submitting.set(false);
          const msg = err?.error?.message || err?.error?.detail || 'Failed to create tenant';
          this.snackBar.open(msg, 'Dismiss', { duration: 5000 });
        },
      });
  }
}
