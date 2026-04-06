import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RouterApiService } from '@/app/domains/network/data';

@Component({
  selector: 'app-routers-form',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatCard, MatButton, MatIconButton, MatIcon,
    MatFormField, MatLabel, MatInput, MatSelect, MatOption,
  ],
  template: `
    <div class="mx-auto max-w-2xl space-y-4">
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/routers">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ isEditMode ? 'Edit Router' : 'New Router' }}
        </h1>
      </div>

      <mat-card class="p-6">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <mat-form-field class="w-full">
              <mat-label>Router Name</mat-label>
              <input matInput formControlName="name" required />
            </mat-form-field>
            <mat-form-field class="w-full">
              <mat-label>IP Address</mat-label>
              <input matInput formControlName="ipAddress" required placeholder="192.168.1.1" />
            </mat-form-field>
            <mat-form-field class="w-full">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" required />
            </mat-form-field>
            <mat-form-field class="w-full">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>
            <mat-form-field class="w-full">
              <mat-label>NAS Type</mat-label>
              <mat-select formControlName="nasType">
                <mat-option value="mikrotik">MikroTik</mat-option>
                <mat-option value="cisco">Cisco</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field class="w-full">
              <mat-label>Description</mat-label>
              <input matInput formControlName="description" />
            </mat-form-field>
            <mat-form-field class="sm:col-span-2 w-full">
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
            <a matButton routerLink="/admin/routers">Cancel</a>
            <button class="primary" matButton type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : (isEditMode ? 'Update Router' : 'Create Router') }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
})
export class RoutersFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly routerApi = inject(RouterApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  isEditMode = false;
  routerId = '';

  form = this.fb.group({
    name: ['', Validators.required],
    ipAddress: ['', Validators.required],
    username: ['', Validators.required],
    password: [''],
    nasType: ['mikrotik', Validators.required],
    description: [''],
    coordinates: [''],
  });

  ngOnInit(): void {
    this.routerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.routerId;
    if (this.isEditMode) {
      this.routerApi.getById(this.routerId).subscribe(r => this.form.patchValue(r as never));
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const value = this.form.value as never;
    const call = this.isEditMode
      ? this.routerApi.update(this.routerId, value)
      : this.routerApi.create(value);

    call.subscribe({
      next: () => {
        this.snackBar.open(`Router ${this.isEditMode ? 'updated' : 'created'}`, 'OK', { duration: 3000 });
        this.router.navigate(['/admin/routers']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      },
    });
  }
}

