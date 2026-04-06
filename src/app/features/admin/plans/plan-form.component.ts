import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlanApiService, BandwidthApiService } from '../../../core/api/plan-api.service';
import { RouterApiService, PoolApiService } from '../../../core/api/router-api.service';
import { BandwidthDto } from '../../../core/models/plan.model';
import { RouterDto, PoolDto } from '../../../core/models/router.model';

@Component({
  selector: 'app-plan-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCheckboxModule, MatButtonModule, MatIconModule, MatDividerModule
  ],
  template: `
    <div class="max-w-3xl mx-auto space-y-4">
      <div class="flex items-center gap-3">
        <a mat-icon-button routerLink="/admin/plans"><mat-icon>arrow_back</mat-icon></a>
        <h1 class="text-2xl font-bold">{{ isEdit ? 'Edit Plan' : 'New Plan' }}</h1>
      </div>
      <mat-card class="p-6">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
          <!-- Basic Info -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Basic Info</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Plan Name</mat-label>
                <input matInput formControlName="name" required>
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Type</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="pppoe">PPPoE</mat-option>
                  <mat-option value="hotspot">Hotspot</mat-option>
                  <mat-option value="static">Static</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Price (KES)</mat-label>
                <input matInput type="number" formControlName="price" required>
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Bandwidth Profile</mat-label>
                <mat-select formControlName="bandwidthId">
                  <mat-option [value]="null">None</mat-option>
                  @for (b of bandwidths(); track b.id) {
                    <mat-option [value]="b.id">{{ b.name }} ({{ b.downloadRate }}{{ b.downloadUnit }}/{{ b.uploadRate }}{{ b.uploadUnit }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Router</mat-label>
                <mat-select formControlName="routerId">
                  <mat-option [value]="null">None</mat-option>
                  @for (r of routers(); track r.id) {
                    <mat-option [value]="r.id">{{ r.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>IP Pool</mat-label>
                <mat-select formControlName="poolId">
                  <mat-option [value]="null">None</mat-option>
                  @for (p of pools(); track p.id) {
                    <mat-option [value]="p.id">{{ p.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Validity -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Validity & Limits</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Validity</mat-label>
                <input matInput type="number" formControlName="validity">
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Validity Unit</mat-label>
                <mat-select formControlName="validityUnit">
                  <mat-option value="days">Days</mat-option>
                  <mat-option value="hours">Hours</mat-option>
                  <mat-option value="weeks">Weeks</mat-option>
                  <mat-option value="months">Months</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Limit Type</mat-label>
                <mat-select formControlName="limitType">
                  <mat-option value="unlimited">Unlimited</mat-option>
                  <mat-option value="data">Data</mat-option>
                  <mat-option value="time">Time</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Description & Features -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Features (comma separated)</mat-label>
              <textarea matInput formControlName="features" rows="3" placeholder="Unlimited data, Static IP"></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Badge (e.g. Popular)</mat-label>
              <input matInput formControlName="badge">
            </mat-form-field>
            <div class="flex items-center gap-4">
              <mat-checkbox formControlName="enabled">Plan Enabled</mat-checkbox>
              <mat-checkbox formControlName="prepaid">Prepaid</mat-checkbox>
            </div>
          </div>

          <div class="flex gap-3 justify-end">
            <a mat-button routerLink="/admin/plans">Cancel</a>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : (isEdit ? 'Update Plan' : 'Create Plan') }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `
})
export class PlanFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly planApi = inject(PlanApiService);
  private readonly bandwidthApi = inject(BandwidthApiService);
  private readonly routerApi = inject(RouterApiService);
  private readonly poolApi = inject(PoolApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly bandwidths = signal<BandwidthDto[]>([]);
  readonly routers = signal<RouterDto[]>([]);
  readonly pools = signal<PoolDto[]>([]);
  isEdit = false;
  planId = '';

  form = this.fb.group({
    name: ['', Validators.required],
    type: ['pppoe'],
    price: [null, [Validators.required, Validators.min(0)]],
    bandwidthId: [null],
    routerId: [null],
    poolId: [null],
    validity: [null],
    validityUnit: ['days'],
    limitType: ['unlimited'],
    description: [''],
    features: [''],
    badge: [''],
    enabled: [true],
    prepaid: [true]
  });

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEdit = !!this.planId;
    this.bandwidthApi.getPage(0, 200, 'name', 'asc').subscribe(page => this.bandwidths.set(page.content));
    this.routerApi.getPage(0, 200, 'name', 'asc').subscribe(page => this.routers.set(page.content));
    this.poolApi.getPage(0, 200, 'name', 'asc').subscribe(page => this.pools.set(page.content));
    if (this.isEdit) {
      this.planApi.getById(this.planId).subscribe(p => this.form.patchValue(p as any));
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value as any;
    const call = this.isEdit ? this.planApi.update(this.planId, v) : this.planApi.create(v);
    call.subscribe({
      next: () => {
        this.snackBar.open(`Plan ${this.isEdit ? 'updated' : 'created'}`, 'OK', { duration: 3000 });
        this.router.navigate(['/admin/plans']);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.snackBar.open(err?.error?.message ?? 'Error', 'Close', { duration: 3000 });
      }
    });
  }
}


