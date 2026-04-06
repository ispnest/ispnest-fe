import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { RouterApiService } from '@/app/domains/network/data';
import { RouterDto } from '../../data/network.model';

@Component({
  selector: 'app-routers-list',
  standalone: true,
  imports: [
    RouterLink, DatePipe,
    MatCard, MatButton, MatIconButton, MatIcon,
    MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef,
    MatPaginator, MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger,
    StatusBadgeComponent, LoadingComponent,
  ],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold tracking-tight">Routers</h1>
        <a class="primary" matButton routerLink="/admin/routers/new">
          <mat-icon svgIcon="plus" />
          New Router
        </a>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <mat-table [dataSource]="routers()">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
            <mat-cell *matCellDef="let r" class="font-medium">{{ r.name }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="ip">
            <mat-header-cell *matHeaderCellDef>IP Address</mat-header-cell>
            <mat-cell *matCellDef="let r" class="font-mono">{{ r.ipAddress }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="nasType">
            <mat-header-cell *matHeaderCellDef>NAS Type</mat-header-cell>
            <mat-cell *matCellDef="let r" class="capitalize">{{ r.nasType }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
            <mat-cell *matCellDef="let r"><app-status-badge [status]="r.status" /></mat-cell>
          </ng-container>
          <ng-container matColumnDef="lastSeen">
            <mat-header-cell *matHeaderCellDef>Last Seen</mat-header-cell>
            <mat-cell *matCellDef="let r">{{ r.lastSeen | date:'short' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef></mat-header-cell>
            <mat-cell *matCellDef="let r">
              <button matIconButton [matMenuTriggerFor]="menu" [matMenuTriggerData]="{ router: r }">
                <mat-icon svgIcon="ellipsis-vertical" />
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

    <mat-menu #menu="matMenu">
      <ng-template matMenuContent let-router="router">
        <a mat-menu-item [routerLink]="['/admin/routers', router.id, 'edit']">
          <mat-icon svgIcon="pencil" />Edit
        </a>
        <button mat-menu-item (click)="testConnection(router)">
          <mat-icon svgIcon="wifi" />Test Connection
        </button>
        <button mat-menu-item (click)="deleteRouter(router)">
          <mat-icon svgIcon="trash" />Delete
        </button>
      </ng-template>
    </mat-menu>
  `,
})
export class RoutersListComponent implements OnInit {
  private readonly routerApi = inject(RouterApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly routers = signal<RouterDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['name', 'ip', 'nasType', 'status', 'lastSeen', 'actions'];

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.routerApi.getPage(this.pageIndex, this.pageSize).subscribe({
      next: page => { this.routers.set(page.content); this.totalElements.set(page.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  testConnection(router: RouterDto): void {
    this.routerApi.testConnection(router.id).subscribe({
      next: () => this.snackBar.open('Connection OK', 'OK', { duration: 3000 }),
      error: () => this.snackBar.open('Connection failed', 'Close', { duration: 3000 }),
    });
  }

  deleteRouter(router: RouterDto): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Router', message: `Delete "${router.name}"?`, confirmText: 'Delete', danger: true },
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.routerApi.delete(router.id).subscribe({
        next: () => { this.routers.update(list => list.filter(r => r.id !== router.id)); },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 }),
      });
    });
  }
}



