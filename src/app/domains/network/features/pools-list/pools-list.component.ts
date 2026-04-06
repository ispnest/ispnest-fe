import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { PoolApiService } from '@/app/domains/network/data';
import { PoolDto } from '../../data/network.model';

@Component({
  selector: 'app-pools-list',
  standalone: true,
  imports: [
    DatePipe,
    MatCard, MatIconButton, MatIcon,
    MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef,
    MatPaginator,
    LoadingComponent,
  ],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold tracking-tight">IP Pools</h1>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <mat-table [dataSource]="pools()">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
            <mat-cell *matCellDef="let p" class="font-medium">{{ p.name }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="ranges">
            <mat-header-cell *matHeaderCellDef>IP Ranges</mat-header-cell>
            <mat-cell *matCellDef="let p" class="font-mono text-xs">{{ p.ranges }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="createdAt">
            <mat-header-cell *matHeaderCellDef>Created</mat-header-cell>
            <mat-cell *matCellDef="let p">{{ p.createdAt | date:'mediumDate' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef></mat-header-cell>
            <mat-cell *matCellDef="let p">
              <button matIconButton (click)="deletePool(p)">
                <mat-icon svgIcon="trash" />
              </button>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="cols" />
          <mat-row *matRowDef="let row; columns: cols;" />
        </mat-table>

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)"
          showFirstLastButtons />
      </mat-card>
    </div>
  `,
})
export class PoolsListComponent implements OnInit {
  private readonly poolApi = inject(PoolApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly pools = signal<PoolDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['name', 'ranges', 'createdAt', 'actions'];

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.poolApi.getPage(this.pageIndex, this.pageSize).subscribe({
      next: page => { this.pools.set(page.content); this.totalElements.set(page.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  deletePool(pool: PoolDto): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Pool', message: `Delete "${pool.name}"?`, confirmText: 'Delete', danger: true },
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.poolApi.delete(pool.id).subscribe({
        next: () => this.pools.update(list => list.filter(p => p.id !== pool.id)),
        error: () => this.snackBar.open('Failed to delete pool', 'Close', { duration: 3000 }),
      });
    });
  }
}

