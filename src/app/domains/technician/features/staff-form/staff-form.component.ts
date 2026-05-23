import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel, MatHint, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { kenyanPhoneValidator, normalizeKenyanPhone } from '@/app/core/utils/phone.utils';
import { StaffApiService } from '@/app/domains/technician/data/staff-api.service';

@Component({
  selector: 'app-staff-form',
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
    MatHint,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
    MatSlideToggle,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-3xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/staff">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ isEditMode ? 'Edit Staff' : 'New Staff' }}
          </h1>
          <p class="text-sm text-neutral-a11">
            {{ isEditMode ? 'Update staff profile' : 'Create a new staff user' }}
          </p>
        </div>
      </div>

      <mat-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-8 p-6">
          <!-- Identity -->
          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">Identity</h2>
              <p class="mt-1 text-sm text-neutral-a11">Login credentials and display name.</p>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
              <mat-form-field class="sm:col-span-2">
                <mat-label>Display Name</mat-label>
                <input matInput formControlName="displayName" required />
              </mat-form-field>
              <mat-form-field class="sm:col-span-2">
                <mat-label>Email</mat-label>
                <input
                  matInput
                  type="email"
                  formControlName="email"
                  [readonly]="isEditMode"
                  required
                />
              </mat-form-field>
              @if (!isEditMode) {
                <mat-form-field class="sm:col-span-2">
                  <mat-label>Password</mat-label>
                  <input matInput type="password" formControlName="password" required />
                </mat-form-field>
              }
              <mat-form-field>
                <mat-label>Phone Number</mat-label>
                <input
                  matInput
                  formControlName="phoneNumber"
                  placeholder="07XX XXX XXX"
                  autocomplete="tel"
                />
                <mat-hint>07XX, 01XX, 254XX or +254XX</mat-hint>
                <mat-error>Enter a valid Kenyan number</mat-error>
              </mat-form-field>
              <mat-form-field>
                <mat-label>User Type</mat-label>
                <mat-select formControlName="userType" [disabled]="isEditMode">
                  <mat-option value="ADMIN">Admin</mat-option>
                  <mat-option value="TECHNICIAN">Technician</mat-option>
                  <mat-option value="SUPPORT">Support</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <mat-divider />

          <!-- Profile -->
          <div class="grid gap-8 md:grid-cols-3">
            <div>
              <h2 class="text-lg font-semibold">Profile</h2>
              <p class="mt-1 text-sm text-neutral-a11">Department and job title.</p>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
              <mat-form-field>
                <mat-label>Department</mat-label>
                <input matInput formControlName="department" />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" />
              </mat-form-field>
            </div>
          </div>

          @if (isEditMode && form.get('userType')?.value === 'TECHNICIAN') {
            <mat-divider />
            <div class="grid gap-8 md:grid-cols-3">
              <div>
                <h2 class="text-lg font-semibold">Active Technician</h2>
                <p class="mt-1 text-sm text-neutral-a11">
                  When active, this technician's contact info is shown to unconnected customers.
                  Only one technician can be active at a time.
                </p>
              </div>
              <div class="flex items-center gap-3 md:col-span-2 self-start pt-2">
                <mat-slide-toggle
                  [checked]="isActive()"
                  (change)="toggleActive($event.checked)"
                  [disabled]="togglingActive()"
                >
                  {{ isActive() ? 'Active (on-call)' : 'Not active' }}
                </mat-slide-toggle>
              </div>
            </div>
          }

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
            <a matButton class="tertiary" routerLink="/admin/staff">Cancel</a>
            <button class="primary" matButton type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : isEditMode ? 'Update' : 'Create Staff' }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
})
export class StaffFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly staffApi = inject(StaffApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly togglingActive = signal(false);
  readonly errorMessage = signal('');
  readonly isActive = signal(false);
  isEditMode = false;
  staffId = '';

  form = this.fb.group({
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    phoneNumber: ['', kenyanPhoneValidator],
    userType: ['TECHNICIAN', Validators.required],
    department: [''],
    title: [''],
  });

  ngOnInit(): void {
    this.staffId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.staffId;
    if (!this.isEditMode) {
      this.form.get('password')?.setValidators(Validators.required);
      this.form.get('password')?.updateValueAndValidity();
    }
    if (this.isEditMode) {
      this.staffApi.getById(this.staffId).subscribe((s) => {
        this.form.patchValue({
          displayName: s.displayName,
          email: s.email,
          phoneNumber: s.phoneNumber ?? '',
          userType: s.userType,
        });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    const v = this.form.value;
    const phone = v.phoneNumber ? normalizeKenyanPhone(v.phoneNumber) : undefined;

    const call = this.isEditMode
      ? this.staffApi.update(this.staffId, {
          displayName: v.displayName ?? undefined,
          phoneNumber: phone,
          department: v.department ?? undefined,
          title: v.title ?? undefined,
        })
      : this.staffApi.create({
          email: v.email!,
          password: v.password!,
          displayName: v.displayName!,
          phoneNumber: phone,
          userType: v.userType as 'ADMIN' | 'TECHNICIAN' | 'SUPPORT',
          department: v.department ?? undefined,
          title: v.title ?? undefined,
        });

    call.subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open(`Staff ${this.isEditMode ? 'updated' : 'created'}`, 'OK', {
          duration: 3000,
        });
        this.router.navigate(['/admin/staff']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      },
    });
  }

  toggleActive(active: boolean): void {
    this.togglingActive.set(true);
    const call = active
      ? this.staffApi.setActiveTechnician(this.staffId)
      : this.staffApi.deactivateTechnician();
    call.subscribe({
      next: () => {
        this.isActive.set(active);
        this.togglingActive.set(false);
        this.snackBar.open(active ? 'Set as active technician' : 'Technician deactivated', 'OK', {
          duration: 3000,
        });
      },
      error: () => {
        this.togglingActive.set(false);
        this.snackBar.open('Failed to update active status', 'OK', { duration: 3000 });
      },
    });
  }
}
