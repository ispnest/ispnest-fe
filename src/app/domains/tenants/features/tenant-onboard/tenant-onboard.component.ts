import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatHint } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { TenantService } from '../../data';

@Component({
  selector: 'app-tenant-onboard',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatCard,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatIcon,
    MatInput,
    MatProgressSpinner,
    RouterLink,
  ],
  host: { class: 'flex flex-auto flex-col bg-neutral-2' },
  template: `
    <div class="flex flex-auto items-center justify-center p-6">
      <div class="w-full max-w-lg">
        <!-- Logo -->
        <div class="mb-8 flex flex-col items-center gap-3 text-center">
          <div class="flex items-center gap-x-2.5">
            <img class="size-9 object-contain" src="/img/ispnest-icon.svg" alt="ISPNest" />
            <span class="text-2xl font-bold tracking-tight text-neutral-12">ISPNest</span>
          </div>
          <h1 class="text-3xl font-bold tracking-tight text-neutral-12">
            Start Your ISP in Minutes
          </h1>
          <p class="text-neutral-11">
            Create your tenant account and start managing your internet business.
          </p>
        </div>

        @if (success()) {
          <!-- Success state -->
          <mat-card appearance="outlined" class="p-8 text-center">
            <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-green-a3">
              <mat-icon svgIcon="check" class="size-8 text-green-11" />
            </div>
            <h2 class="mt-4 text-xl font-semibold text-neutral-12">You're All Set!</h2>
            <p class="mt-2 text-neutral-11">
              Your ISP tenant is being provisioned. You'll receive an email at
              <strong class="text-neutral-12">{{ submittedEmail() }}</strong> once your account is
              ready to use.
            </p>
            <div class="mt-6 flex flex-col items-center gap-3">
              <a matButton class="primary" routerLink="/login">Go to Login</a>
              <a matButton class="link" routerLink="/">Back to Home</a>
            </div>
          </mat-card>
        } @else {
          <!-- Onboarding form -->
          <mat-card appearance="outlined" class="p-6">
            <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-5">
              <!-- Step 1: ISP Identity -->
              <div class="flex flex-col gap-1">
                <h2 class="flex items-center gap-2 text-lg font-semibold text-neutral-12">
                  <span
                    class="flex size-6 items-center justify-center rounded-full bg-primary-a3 text-xs font-bold text-primary-11"
                    >1</span
                  >
                  Your ISP Identity
                </h2>
                <p class="ml-8 text-sm text-neutral-11">
                  Choose a name and URL for your ISP platform.
                </p>
              </div>

              <mat-form-field class="w-full">
                <mat-label>ISP Name</mat-label>
                <input matInput formControlName="displayName" placeholder="e.g. Skyline Internet" />
                @if (form.controls.displayName.hasError('required')) {
                  <mat-error>ISP name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Subdomain (slug)</mat-label>
                <input
                  matInput
                  formControlName="slug"
                  placeholder="e.g. skyline-internet"
                  (input)="onSlugInput($event)"
                />
                <mat-hint>Your platform will be at: {{ slugPreview() }}.ispnest.com</mat-hint>
                @if (form.controls.slug.hasError('required')) {
                  <mat-error>Subdomain is required</mat-error>
                }
                @if (form.controls.slug.hasError('pattern')) {
                  <mat-error>
                    Lowercase letters, numbers, hyphens only. Must start with a letter.
                  </mat-error>
                }
                @if (form.controls.slug.hasError('minlength')) {
                  <mat-error>At least 2 characters</mat-error>
                }
              </mat-form-field>

              <!-- Step 2: Admin Account -->
              <div class="flex flex-col gap-1 pt-2">
                <h2 class="flex items-center gap-2 text-lg font-semibold text-neutral-12">
                  <span
                    class="flex size-6 items-center justify-center rounded-full bg-primary-a3 text-xs font-bold text-primary-11"
                    >2</span
                  >
                  Your Admin Account
                </h2>
                <p class="ml-8 text-sm text-neutral-11">
                  We'll create an admin login for you to manage your ISP.
                </p>
              </div>

              <mat-form-field class="w-full">
                <mat-label>Your Name</mat-label>
                <input matInput formControlName="adminDisplayName" placeholder="John Doe" />
                @if (form.controls.adminDisplayName.hasError('required')) {
                  <mat-error>Your name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Email Address</mat-label>
                <input
                  matInput
                  formControlName="adminEmail"
                  placeholder="you@example.com"
                  type="email"
                />
                @if (form.controls.adminEmail.hasError('required')) {
                  <mat-error>Email is required</mat-error>
                }
                @if (form.controls.adminEmail.hasError('email')) {
                  <mat-error>Must be a valid email address</mat-error>
                }
              </mat-form-field>

              <!-- Error message -->
              @if (errorMessage()) {
                <div
                  class="flex items-center gap-2 rounded-lg border border-red-a5 bg-red-a2 px-4 py-3 text-sm text-red-11"
                >
                  <mat-icon svgIcon="alert-circle" class="size-4 shrink-0" />
                  {{ errorMessage() }}
                </div>
              }

              <!-- Submit -->
              <button
                matButton
                class="primary w-full"
                type="submit"
                [disabled]="form.invalid || submitting()"
              >
                @if (submitting()) {
                  <mat-progress-spinner mode="indeterminate" diameter="18" />
                } @else {
                  <mat-icon svgIcon="rocket" />
                }
                Launch My ISP
              </button>
            </form>
          </mat-card>

          <p class="mt-4 text-center text-sm text-neutral-10">
            Already have an account?
            <a class="font-medium text-primary-11 hover:underline" routerLink="/login">Sign in</a>
          </p>
        }
      </div>
    </div>
  `,
})
export class TenantOnboardComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tenantService = inject(TenantService);

  protected readonly submitting = signal(false);
  protected readonly success = signal(false);
  protected readonly submittedEmail = signal('');
  protected readonly errorMessage = signal('');

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

  protected slugPreview = () => this.form.controls.slug.value || 'your-isp';

  onSlugInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    this.form.controls.slug.setValue(input.value);
  }

  submit() {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.errorMessage.set('');

    const { slug, displayName, adminEmail, adminDisplayName } = this.form.getRawValue();
    this.tenantService.onboard({ slug, displayName, adminEmail, adminDisplayName }).subscribe({
      next: () => {
        this.submittedEmail.set(adminEmail);
        this.success.set(true);
        this.submitting.set(false);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg =
          err?.error?.message ||
          err?.error?.detail ||
          (err?.status === 409
            ? 'This subdomain is already taken. Try another one.'
            : 'Something went wrong. Please try again.');
        this.errorMessage.set(msg);
      },
    });
  }
}
