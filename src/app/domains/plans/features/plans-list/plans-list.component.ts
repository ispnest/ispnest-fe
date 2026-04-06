import { DecimalPipe } from '@angular/common';
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
import { PlanApiService } from '@/app/domains/plans/data';
import { PlanDto } from '../../data/plan.model';

@Component({
  selector: 'app-plans-list',
  standalone: true,
  imports: [
    RouterLink, DecimalPipe,
    MatCard, MatButton, MatIconButton, MatIcon,
    MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef,
    MatPaginator, MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger,
    StatusBadgeComponent, LoadingComponent,
  ],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold tracking-tight">Plans</h1>
        <a class="primary" matButton routerLink="/admin/plans/new">
          <mat-icon svgIcon="plus" />
          New Plan
        </a>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <mat-table [dataSource]="plans()">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
            <mat-cell *matCellDef="let p">
              <div>
                <div class="font-medium">{{ p.name }}</div>
                @if (p.badge) {
                  <span class="rounded bg-primary-a3 px-2 py-0.5 text-xs font-medium text-primary-a11">
                    {{ p.badge }}
                  </span>
                }
              </div>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="type">
            <mat-header-cell *matHeaderCellDef>Type</mat-header-cell>
            <mat-cell *matCellDef="let p" class="capitalize">{{ p.type }}</mat-cell>
          </ng-container>

          <ng-container matColumnDef="price">
            <mat-header-cell *matHeaderCellDef>Price</mat-header-cell>
            <mat-cell *matCellDef="let p" class="font-semibold">
              KES {{ p.price | number:'1.0-0' }}
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="validity">
            <mat-header-cell *matHeaderCellDef>Validity</mat-header-cell>
            <mat-cell *matCellDef="let p">{{ p.validity }} {{ p.validityUnit }}</mat-cell>
          </ng-container>

          <ng-container matColumnDef="enabled">
            <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
            <mat-cell *matCellDef="let p">
              <app-status-badge [status]="p.enabled ? 'active' : 'inactive'" />
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef></mat-header-cell>
            <mat-cell *matCellDef="let p">
              <button matIconButton [matMenuTriggerFor]="menu" [matMenuTriggerData]="{ plan: p }">
                <mat-icon svgIcon="ellipsis-vertical" />
              </button>
            </mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="cols" />
          <mat-row *matRowDef="let _; columns: cols;" />
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
      <ng-template matMenuContent let-plan="plan">
        <a mat-menu-item [routerLink]="['/admin/plans', plan.id, 'edit']">
          <mat-icon svgIcon="pencil" />
          Edit
        </a>
        <button mat-menu-item (click)="deletePlan(plan)">
          <mat-icon svgIcon="trash" />
          Delete
        </button>
      </ng-template>
    </mat-menu>
  `,
})
export class PlansListComponent implements OnInit {
  private readonly planApi = inject(PlanApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly plans = signal<PlanDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['name', 'type', 'price', 'validity', 'enabled', 'actions'];

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.planApi.getPage(this.pageIndex, this.pageSize).subscribe({
      next: page => {
        this.plans.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  deletePlan(plan: PlanDto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: { title: 'Delete Plan', message: `Delete "${plan.name}"?`, confirmText: 'Delete', danger: true },
      })
      .afterClosed()
      .subscribe(ok => {
        if (!ok) return;
        this.planApi.delete(plan.id).subscribe({
          next: () => {
            this.plans.update(list => list.filter(p => p.id !== plan.id));
            this.totalElements.update(n => n - 1);
            this.snackBar.open('Plan deleted', 'OK', { duration: 3000 });
          },
          error: () => this.snackBar.open('Failed to delete plan', 'Close', { duration: 3000 }),
        });
      });
  }
}




