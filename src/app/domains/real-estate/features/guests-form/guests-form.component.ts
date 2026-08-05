import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GuestApiService } from '@/app/domains/real-estate/data/guest-api.service';

@Component({
  selector: 'app-guests-form',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCard,
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
    <div class="mx-auto flex w-full max-w-2xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/real-estate/guests">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ isEditMode ? 'Edit Guest' : 'New Guest' }}
          </h1>
          <p class="text-sm text-neutral-a11">
            {{ isEditMode ? 'Update guest details' : 'Register a new short-term booking guest' }}
          </p>
        </div>
      </div>

      <mat-card>
        <div [formGroup]="form" class="flex flex-col gap-y-4 p-4">
          <mat-form-field>
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="fullName" required />
            <mat-error>Full name is required</mat-error>
          </mat-form-field>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <mat-form-field>
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phoneNumber" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
              <mat-error>Enter a valid email</mat-error>
            </mat-form-field>
            <mat-form-field>
              <mat-label>ID Number</mat-label>
              <input matInput formControlName="idNumber" />
            </mat-form-field>
          </div>
          @if (isEditMode) {
            <mat-form-field>
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="ACTIVE">Active</mat-option>
                <mat-option value="INACTIVE">Inactive</mat-option>
              </mat-select>
            </mat-form-field>
          }
          <mat-form-field>
            <mat-label>Notes</mat-label>
            <textarea matInput rows="3" formControlName="notes"></textarea>
          </mat-form-field>

          @if (errorMessage()) {
            <div
              class="flex items-center gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11"
            >
              <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
              {{ errorMessage() }}
            </div>
          }

          <div class="flex justify-end gap-3 pt-2">
            <a matButton class="tertiary" routerLink="/admin/real-estate/guests">Cancel</a>
            <button
              matButton
              class="primary"
              type="button"
              (click)="submit()"
              [disabled]="form.controls.fullName.invalid || saving()"
            >
              {{ saving() ? 'Saving…' : isEditMode ? 'Update Guest' : 'Create Guest' }}
            </button>
          </div>
        </div>
      </mat-card>
    </div>
  `,
})
export class GuestsFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly guestApi = inject(GuestApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  isEditMode = false;
  guestId = '';

  readonly form = this.fb.group({
    fullName: ['', Validators.required],
    phoneNumber: [''],
    email: ['', Validators.email],
    idNumber: [''],
    status: ['ACTIVE'],
    notes: [''],
  });

  ngOnInit(): void {
    this.guestId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.guestId;

    if (this.isEditMode) {
      this.guestApi.getById(this.guestId).subscribe((g) => this.form.patchValue(g));
    }
  }

  submit(): void {
    if (this.form.controls.fullName.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');

    const v = this.form.value;
    const call = this.isEditMode
      ? this.guestApi.update(this.guestId, {
          fullName: v.fullName!,
          phoneNumber: v.phoneNumber || undefined,
          email: v.email || undefined,
          idNumber: v.idNumber || undefined,
          notes: v.notes || undefined,
          status: v.status as 'ACTIVE' | 'INACTIVE',
        })
      : this.guestApi.create({
          fullName: v.fullName!,
          phoneNumber: v.phoneNumber || undefined,
          email: v.email || undefined,
          idNumber: v.idNumber || undefined,
          notes: v.notes || undefined,
        });

    call.subscribe({
      next: (guest) => {
        this.saving.set(false);
        this.snackBar.open(`Guest ${this.isEditMode ? 'updated' : 'created'}`, 'OK', {
          duration: 3000,
        });
        this.router.navigate(['/admin/real-estate/guests', guest.id]);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      },
    });
  }
}
