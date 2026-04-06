import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { PoolApiService, RouterApiService } from '../../../core/api/router-api.service';
import { PoolDto, RouterDto } from '../../../core/models/router.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { LoadingComponent } from '../../../shared/components/loading.component';

@Component({
  selector: 'app-pool-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatTableModule,
    MatPaginatorModule, MatButtonModule, MatIconModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, LoadingComponent
  ],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">IP Pools</h1>
          <p class="text-gray-500 text-sm">{{ totalElements() }} pools</p>
        </div>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> New Pool
        </button>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />
        <mat-table [dataSource]="pools()" class="w-full">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
            <mat-cell *matCellDef="let p" class="font-medium">{{ p.name }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="ranges">
            <mat-header-cell *matHeaderCellDef>IP Ranges</mat-header-cell>
            <mat-cell *matCellDef="let p" class="font-mono text-sm">{{ p.ranges }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="description">
            <mat-header-cell *matHeaderCellDef>Description</mat-header-cell>
            <mat-cell *matCellDef="let p">{{ p.description || '—' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
            <mat-cell *matCellDef="let p">
              <button mat-icon-button (click)="openForm(p)" title="Edit"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button (click)="deletePool(p)" title="Delete" class="text-red-500"><mat-icon>delete</mat-icon></button>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="cols"></mat-header-row>
          <mat-row *matRowDef="let row; columns: cols;"></mat-row>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell p-8 text-center text-gray-400" [attr.colspan]="cols.length">No pools found</td>
          </tr>
        </mat-table>
        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>

      <!-- Inline form dialog -->
      @if (showForm()) {
        <mat-card class="p-6 max-w-lg">
          <h2 class="text-lg font-semibold mb-4">{{ editing() ? 'Edit Pool' : 'New Pool' }}</h2>
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name">
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Router</mat-label>
              <mat-select formControlName="routerId">
                @for (r of routers(); track r.id) {
                  <mat-option [value]="r.id">{{ r.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>IP Ranges (comma separated)</mat-label>
              <input matInput formControlName="ranges" placeholder="10.0.0.1-10.0.0.254">
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="2"></textarea>
            </mat-form-field>
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
export class PoolListComponent implements OnInit {
  private readonly poolApi = inject(PoolApiService);
  private readonly routerApi = inject(RouterApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly editing = signal<PoolDto | null>(null);
  readonly routers = signal<RouterDto[]>([]);
  readonly pools = signal<PoolDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['name', 'ranges', 'description', 'actions'];

  pageIndex = 0;
  pageSize = 20;

  form = this.fb.group({
    name: ['', Validators.required],
    routerId: ['', Validators.required],
    ranges: ['', Validators.required],
    description: ['']
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    // Load routers for the dropdown (unpaginated is fine — these are reference data)
    this.routerApi.getPage(0, 200, 'name', 'asc').subscribe(page => this.routers.set(page.content));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.poolApi.getPage(this.pageIndex, this.pageSize).subscribe({
      next: page => { this.pools.set(page.content); this.totalElements.set(page.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  openForm(pool?: PoolDto): void {
    this.editing.set(pool ?? null);
    this.form.reset({ name: pool?.name ?? '', routerId: pool?.routerId ?? '', ranges: pool?.ranges ?? '', description: pool?.description ?? '' });
    this.showForm.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value as any;
    const e = this.editing();
    const call = e ? this.poolApi.update(e.id, v) : this.poolApi.create(v);
    call.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.load(); },
      error: (err: any) => { this.saving.set(false); this.snackBar.open(err?.error?.message ?? 'Error', 'Close', { duration: 3000 }); }
    });
  }

  deletePool(pool: PoolDto): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Pool', message: `Delete "${pool.name}"?`, confirmText: 'Delete', danger: true }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.poolApi.delete(pool.id).subscribe({
        next: () => { this.pools.update(list => list.filter(p => p.id !== pool.id)); this.totalElements.update(n => n - 1); },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 })
      });
    });
  }
}

