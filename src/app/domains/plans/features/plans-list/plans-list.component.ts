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
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { PlanApiService } from '@/app/domains/plans/data';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { PlanDto } from '../../data/plan.model';

@Component({
  selector: 'app-plans-list',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    MatPaginator,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    StatusBadgeComponent,
    LoadingComponent,
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Plans</h1>
          <p class="text-sm text-neutral-a11">{{ totalElements() }} service plans configured</p>
        </div>
        @if (!auth.isViewOnly()) {
          <a class="primary" matButton routerLink="/admin/plans/new">
            <mat-icon svgIcon="plus" />
            New Plan
          </a>
        }
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="plans()"
            >
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let p">
                  <div>
                    <div class="font-medium">{{ p.name }}</div>
                    @if (p.badge) {
                      <span
                        class="rounded bg-primary-a3 px-2 py-0.5 text-xs font-medium text-primary-a11"
                      >
                        {{ p.badge }}
                      </span>
                    }
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let p" class="capitalize">{{ p.type }}</td>
              </ng-container>

              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>Price</th>
                <td mat-cell *matCellDef="let p" class="font-semibold">
                  <span class="tabular-nums">KES {{ p.price | number: '1.0-0' }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="validity">
                <th mat-header-cell *matHeaderCellDef>Validity</th>
                <td mat-cell *matCellDef="let p">{{ p.validity }} {{ p.validityUnit }}</td>
              </ng-container>

              <ng-container matColumnDef="enabled">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let p">
                  <app-status-badge [status]="p.enabled ? 'active' : 'inactive'" />
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let p">
                  <button
                    matIconButton
                    [matMenuTriggerFor]="menu"
                    [matMenuTriggerData]="{ plan: p }"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr
                class="group relative hover:bg-neutral-a2"
                mat-row
                *matRowDef="let _; columns: cols"
              ></tr>
            </table>
          </div>

          <mat-paginator
            class="px-3"
            [length]="totalElements()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPage($event)"
            showFirstLastButtons
          />
        </div>
      </mat-card>
    </div>

    <mat-menu #menu="matMenu">
      <ng-template matMenuContent let-plan="plan">
        @if (!auth.isViewOnly()) {
          <a mat-menu-item [routerLink]="['/admin/plans', plan.id, 'edit']">
            <mat-icon svgIcon="pencil" />
            Edit
          </a>
          <button mat-menu-item (click)="deletePlan(plan)">
            <mat-icon svgIcon="trash" />
            Delete
          </button>
        }
      </ng-template>
    </mat-menu>
  `,
})
export class PlansListComponent implements OnInit {
  readonly auth = inject(AuthService);
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
      next: (page) => {
        this.plans.set(page.content);
        this.totalElements.set(page.page.totalElements);
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
        data: {
          title: 'Delete Plan',
          message: `Delete "${plan.name}"?`,
          confirmText: 'Delete',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.planApi.delete(plan.id).subscribe({
          next: () => {
            this.plans.update((list) => list.filter((p) => p.id !== plan.id));
            this.totalElements.update((n) => n - 1);
            this.snackBar.open('Plan deleted', 'OK', { duration: 3000 });
          },
          error: () => this.snackBar.open('Failed to delete plan', 'Close', { duration: 3000 }),
        });
      });
  }
}
