import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BandwidthApiService } from '../../../core/api/plan-api.service';
import { BandwidthDto } from '../../../core/models/plan.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { LoadingComponent } from '../../../shared/components/loading.component';

@Component({
  selector: 'app-bandwidth-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, LoadingComponent
  ],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Bandwidth Profiles</h1>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> New Bandwidth
        </button>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />
        @if (!loading()) {
          <mat-table [dataSource]="data()" class="w-full">
            <ng-container matColumnDef="name">
              <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
              <mat-cell *matCellDef="let b" class="font-medium">{{ b.name }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="download">
              <mat-header-cell *matHeaderCellDef>Download</mat-header-cell>
              <mat-cell *matCellDef="let b">{{ b.downloadRate }} {{ b.downloadUnit }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="upload">
              <mat-header-cell *matHeaderCellDef>Upload</mat-header-cell>
              <mat-cell *matCellDef="let b">{{ b.uploadRate }} {{ b.uploadUnit }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="actions">
              <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
              <mat-cell *matCellDef="let b">
                <button mat-icon-button (click)="openForm(b)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button (click)="delete(b)" class="text-red-500"><mat-icon>delete</mat-icon></button>
              </mat-cell>
            </ng-container>
            <mat-header-row *matHeaderRowDef="cols"></mat-header-row>
            <mat-row *matRowDef="let row; columns: cols;"></mat-row>
          </mat-table>
        }
      </mat-card>

      @if (showForm()) {
        <mat-card class="p-6 max-w-lg">
          <h2 class="text-lg font-semibold mb-4">{{ editing() ? 'Edit Bandwidth' : 'New Bandwidth' }}</h2>
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" required>
            </mat-form-field>
            <div class="grid grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Download Rate</mat-label>
                <input matInput type="number" formControlName="downloadRate">
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Download Unit</mat-label>
                <mat-select formControlName="downloadUnit">
                  <mat-option value="Kbps">Kbps</mat-option>
                  <mat-option value="Mbps">Mbps</mat-option>
                  <mat-option value="Gbps">Gbps</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Upload Rate</mat-label>
                <input matInput type="number" formControlName="uploadRate">
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Upload Unit</mat-label>
                <mat-select formControlName="uploadUnit">
                  <mat-option value="Kbps">Kbps</mat-option>
                  <mat-option value="Mbps">Mbps</mat-option>
                  <mat-option value="Gbps">Gbps</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div class="flex gap-3 justify-end">
              <button mat-button type="button" (click)="showForm.set(false)">Cancel</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </form>
        </mat-card>
      }
    </div>
  `
})
export class BandwidthListComponent implements OnInit {
  private readonly bandwidthApi = inject(BandwidthApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly editing = signal<BandwidthDto | null>(null);
  readonly data = signal<BandwidthDto[]>([]);
  readonly cols = ['name', 'download', 'upload', 'actions'];

  form = this.fb.group({
    name: ['', Validators.required],
    downloadRate: [null, Validators.required],
    downloadUnit: ['Mbps'],
    uploadRate: [null, Validators.required],
    uploadUnit: ['Mbps']
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.bandwidthApi.getPage(0, 100).subscribe({
      next: page => { this.data.set(page.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openForm(b?: BandwidthDto): void {
    this.editing.set(b ?? null);
    this.form.reset({ name: b?.name ?? '', downloadRate: b?.downloadRate as any, downloadUnit: b?.downloadUnit ?? 'Mbps', uploadRate: b?.uploadRate as any, uploadUnit: b?.uploadUnit ?? 'Mbps' });
    this.showForm.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value as any;
    const e = this.editing();
    const call = e ? this.bandwidthApi.update(e.id, v) : this.bandwidthApi.create(v);
    call.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.load(); },
      error: (err: any) => { this.saving.set(false); this.snackBar.open(err?.error?.message ?? 'Error', 'Close', { duration: 3000 }); }
    });
  }

  delete(b: BandwidthDto): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Bandwidth', message: `Delete "${b.name}"?`, confirmText: 'Delete', danger: true }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.bandwidthApi.delete(b.id).subscribe({
        next: () => this.data.update(list => list.filter(x => x.id !== b.id)),
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 })
      });
    });
  }
}


