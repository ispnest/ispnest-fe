import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { PoolApiService } from '@/app/domains/network/data';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { PoolDto } from '../../data/network.model';

@Component({
  selector: 'app-pools-list',
  standalone: true,
  imports: [
    DatePipe, RouterLink,
    MatCard, MatButton, MatIconButton, MatIcon,
    MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef,
    MatPaginator,
    LoadingComponent,
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">IP Pools</h1>
          <p class="text-sm text-neutral-a11">{{ totalElements() }} address pools configured</p>
        </div>
        <a matButton class="primary" routerLink="/admin/pools/new">
          <mat-icon svgIcon="plus" /> New Pool
        </a>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="pools()"
            >
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let p" class="font-medium">{{ p.name }}</td>
              </ng-container>
              <ng-container matColumnDef="ranges">
                <th mat-header-cell *matHeaderCellDef>IP Ranges</th>
                <td mat-cell *matCellDef="let p" class="font-mono text-xs">{{ p.ranges }}</td>
              </ng-container>
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let p">{{ p.createdAt | date:'mediumDate' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let p">
                  <div class="flex gap-1">
                    <a matIconButton [routerLink]="['/admin/pools', p.id, 'edit']">
                      <mat-icon svgIcon="pencil" />
                    </a>
                    <button matIconButton (click)="deletePool(p)">
                      <mat-icon svgIcon="trash" />
                    </button>
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr class="group relative hover:bg-neutral-a2" mat-row *matRowDef="let _; columns: cols;"></tr>
            </table>
          </div>

          <mat-paginator
            class="px-3"
            [length]="totalElements()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPage($event)"
            showFirstLastButtons />
        </div>
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
