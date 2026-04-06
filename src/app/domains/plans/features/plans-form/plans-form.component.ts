import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlanApiService } from '@/app/domains/plans/data';

@Component({
  selector: 'app-plans-form',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatCard, MatButton, MatIconButton, MatIcon,
    MatFormField, MatLabel, MatInput, MatSelect, MatOption, MatCheckbox,
  ],
  template: `
    <div class="mx-auto max-w-3xl space-y-4">
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/plans">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ isEditMode ? 'Edit Plan' : 'New Plan' }}
        </h1>
      </div>

      <mat-card class="p-6">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <mat-form-field class="w-full">
              <mat-label>Plan Name</mat-label>
              <input matInput formControlName="name" required />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type">
                <mat-option value="pppoe">PPPoE</mat-option>
                <mat-option value="hotspot">Hotspot</mat-option>
                <mat-option value="static">Static</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Price (KES)</mat-label>
              <input matInput type="number" formControlName="price" required />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Validity</mat-label>
              <input matInput type="number" formControlName="validity" />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Validity Unit</mat-label>
              <mat-select formControlName="validityUnit">
                <mat-option value="hours">Hours</mat-option>
                <mat-option value="days">Days</mat-option>
                <mat-option value="months">Months</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Data Limit</mat-label>
              <input matInput type="number" formControlName="dataLimit" />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Data Unit</mat-label>
              <mat-select formControlName="dataUnit">
                <mat-option value="MB">MB</mat-option>
                <mat-option value="GB">GB</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Badge (optional)</mat-label>
              <input matInput formControlName="badge" placeholder="e.g. POPULAR" />
            </mat-form-field>

            <mat-form-field class="sm:col-span-2 w-full">
              <mat-label>Description</mat-label>
              <input matInput formControlName="description" />
            </mat-form-field>
          </div>

          <mat-checkbox formControlName="enabled">Enabled</mat-checkbox>

          @if (errorMessage()) {
            <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700
                        dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex justify-end gap-3">
            <a matButton routerLink="/admin/plans">Cancel</a>
            <button class="primary" matButton type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : (isEditMode ? 'Update Plan' : 'Create Plan') }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
})
export class PlansFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly planApi = inject(PlanApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  isEditMode = false;
  planId = '';

  form = this.fb.group({
    name: ['', Validators.required],
    type: ['pppoe', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    validity: [null as number | null],
    validityUnit: ['days'],
    dataLimit: [null as number | null],
    dataUnit: ['GB'],
    badge: [''],
    description: [''],
    enabled: [true],
  });

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.planId;
    if (this.isEditMode) {
      this.planApi.getById(this.planId).subscribe(p => this.form.patchValue(p as never));
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    const value = this.form.value as never;
    const call = this.isEditMode
      ? this.planApi.update(this.planId, value)
      : this.planApi.create(value);

    call.subscribe({
      next: () => {
        this.snackBar.open(`Plan ${this.isEditMode ? 'updated' : 'created'}`, 'OK', { duration: 3000 });
        this.router.navigate(['/admin/plans']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      },
    });
  }
}

