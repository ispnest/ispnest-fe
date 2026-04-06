import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RouterApiService } from '../../../core/api/router-api.service';

@Component({
  selector: 'app-router-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-4">
      <div class="flex items-center gap-3">
        <a mat-icon-button routerLink="/admin/routers"><mat-icon>arrow_back</mat-icon></a>
        <h1 class="text-2xl font-bold">{{ isEdit ? 'Edit Router' : 'New Router' }}</h1>
      </div>
      <mat-card class="p-6">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" required>
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>IP Address</mat-label>
              <input matInput formControlName="ipAddress" placeholder="192.168.1.1">
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username">
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password">
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>NAS Type</mat-label>
              <mat-select formControlName="nasType">
                <mat-option value="mikrotik">MikroTik</mat-option>
                <mat-option value="cisco">Cisco</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full col-span-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="2"></textarea>
            </mat-form-field>
          </div>
          <div class="flex gap-3 justify-end">
            <a mat-button routerLink="/admin/routers">Cancel</a>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : (isEdit ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `
})
export class RouterFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly routerApi = inject(RouterApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  isEdit = false;
  routerId = '';

  form = this.fb.group({
    name: ['', Validators.required],
    ipAddress: ['', Validators.required],
    username: [''],
    password: [''],
    nasType: ['mikrotik'],
    description: [''],
    coordinates: ['']
  });

  ngOnInit(): void {
    this.routerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEdit = !!this.routerId;
    if (this.isEdit) {
      this.routerApi.getById(this.routerId).subscribe(r => this.form.patchValue(r as any));
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value as any;
    const call = this.isEdit ? this.routerApi.update(this.routerId, v) : this.routerApi.create(v);
    call.subscribe({
      next: () => {
        this.snackBar.open(`Router ${this.isEdit ? 'updated' : 'created'}`, 'OK', { duration: 3000 });
        this.router.navigate(['/admin/routers']);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.snackBar.open(err?.error?.message ?? 'Error', 'Close', { duration: 3000 });
      }
    });
  }
}

