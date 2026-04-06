import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { RouterApiService } from '../../../core/api/router-api.service';
import { RouterDto } from '../../../core/models/router.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { LoadingComponent } from '../../../shared/components/loading.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';

@Component({
  selector: 'app-router-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatMenuModule, StatusBadgeComponent, LoadingComponent
  ],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Routers</h1>
          <p class="text-gray-500 text-sm">{{ totalElements() }} routers</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/admin/routers/new">
          <mat-icon>add</mat-icon> New Router
        </a>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />
        <mat-table [dataSource]="routers()" matSort (matSortChange)="onSort($event)" class="w-full">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef mat-sort-header="name">Name</mat-header-cell>
            <mat-cell *matCellDef="let r" class="font-medium">{{ r.name }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="ip">
            <mat-header-cell *matHeaderCellDef>IP Address</mat-header-cell>
            <mat-cell *matCellDef="let r" class="font-mono text-sm">{{ r.ipAddress }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="nasType">
            <mat-header-cell *matHeaderCellDef>NAS Type</mat-header-cell>
            <mat-cell *matCellDef="let r" class="capitalize">{{ r.nasType }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef mat-sort-header="status">Status</mat-header-cell>
            <mat-cell *matCellDef="let r"><app-status-badge [status]="r.status" /></mat-cell>
          </ng-container>
          <ng-container matColumnDef="lastSeen">
            <mat-header-cell *matHeaderCellDef mat-sort-header="lastSeen">Last Seen</mat-header-cell>
            <mat-cell *matCellDef="let r">{{ r.lastSeen | date:'medium' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
            <mat-cell *matCellDef="let r">
              <button mat-icon-button [matMenuTriggerFor]="menu" [matMenuTriggerData]="{router: r}">
                <mat-icon>more_vert</mat-icon>
              </button>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="cols"></mat-header-row>
          <mat-row *matRowDef="let row; columns: cols;"></mat-row>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell p-8 text-center text-gray-400" [attr.colspan]="cols.length">No routers found</td>
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
    </div>

    <mat-menu #menu="matMenu">
      <ng-template matMenuContent let-router="router">
        <a mat-menu-item [routerLink]="['/admin/routers', router.id, 'edit']">
          <mat-icon>edit</mat-icon> Edit
        </a>
        <button mat-menu-item (click)="testConnection(router)">
          <mat-icon>network_check</mat-icon> Test Connection
        </button>
        <button mat-menu-item (click)="deleteRouter(router)" class="text-red-600">
          <mat-icon>delete</mat-icon> Delete
        </button>
      </ng-template>
    </mat-menu>
  `
})
export class RouterListComponent implements OnInit {
  private readonly routerApi = inject(RouterApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly routers = signal<RouterDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['name', 'ip', 'nasType', 'status', 'lastSeen', 'actions'];

  pageIndex = 0;
  pageSize = 20;
  sortField = 'name';
  sortDir = 'asc';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.routerApi.getPage(this.pageIndex, this.pageSize, this.sortField, this.sortDir).subscribe({
      next: page => { this.routers.set(page.content); this.totalElements.set(page.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  onSort(sort: Sort): void {
    this.sortField = sort.active || 'name';
    this.sortDir = sort.direction || 'asc';
    this.pageIndex = 0;
    this.load();
  }

  testConnection(router: RouterDto): void {
    this.routerApi.testConnection(router.id).subscribe({
      next: () => this.snackBar.open('Connection successful!', 'OK', { duration: 3000 }),
      error: () => this.snackBar.open('Connection failed', 'Close', { duration: 3000 })
    });
  }

  deleteRouter(router: RouterDto): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Router', message: `Delete "${router.name}"?`, confirmText: 'Delete', danger: true }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.routerApi.delete(router.id).subscribe({
        next: () => { this.routers.update(list => list.filter(r => r.id !== router.id)); this.totalElements.update(n => n - 1); },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 })
      });
    });
  }
}
