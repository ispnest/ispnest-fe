import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { RouterApiService } from '@/app/domains/network/data';
import {
  badgeClassFor,
  combinedRouterStatus,
} from '@/app/domains/network/shared/router-status.util';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { RouterDto } from '../../data/network.model';

@Component({
  selector: 'app-routers-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
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
          <h1 class="text-2xl font-semibold tracking-tight">Routers</h1>
          <p class="text-sm text-neutral-a11">{{ totalElements() }} NAS devices registered</p>
        </div>
        @if (!auth.isViewOnly()) {
          <a class="primary" matButton routerLink="/admin/routers/new">
            <mat-icon svgIcon="plus" />
            Add Router
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
              [dataSource]="routers()"
            >
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let r" class="font-medium">{{ r.name }}</td>
              </ng-container>
              <ng-container matColumnDef="ip">
                <th mat-header-cell *matHeaderCellDef>IP Address</th>
                <td mat-cell *matCellDef="let r" class="font-mono">
                  {{ r.ipAddress ?? 'pending onboarding' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="nasType">
                <th mat-header-cell *matHeaderCellDef>NAS Type</th>
                <td mat-cell *matCellDef="let r" class="capitalize">{{ r.nasType }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let r">
                  @let badge = status(r);
                  <span
                    [class]="badgeClass(badge.hue)"
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize"
                  >
                    {{ badge.label }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="lastSeen">
                <th mat-header-cell *matHeaderCellDef>Last Seen</th>
                <td mat-cell *matCellDef="let r">{{ r.lastSeen | date: 'short' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let r">
                  <button
                    matIconButton
                    (click)="$event.stopPropagation()"
                    [matMenuTriggerFor]="menu"
                    [matMenuTriggerData]="{ router: r }"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr
                class="group relative cursor-pointer hover:bg-neutral-a2"
                mat-row
                *matRowDef="let r; columns: cols"
                [routerLink]="['/admin/routers', r.id, 'onboarding']"
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
      <ng-template matMenuContent let-router="router">
        @if (!auth.isViewOnly()) {
          <a mat-menu-item [routerLink]="['/admin/routers', router.id, 'edit']">
            <mat-icon svgIcon="pencil" />Edit
          </a>
        }
        <a mat-menu-item [routerLink]="['/admin/routers', router.id, 'onboarding']">
          <mat-icon svgIcon="router" />Manage Onboarding
        </a>
        @if (!auth.isViewOnly()) {
          <button mat-menu-item (click)="deleteRouter(router)">
            <mat-icon svgIcon="trash" />Delete
          </button>
        }
      </ng-template>
    </mat-menu>
  `,
})
export class RoutersListComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly routerApi = inject(RouterApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly routers = signal<RouterDto[]>([]);
  readonly totalElements = signal(0);

  status(router: RouterDto) {
    return combinedRouterStatus(router.managementState, router.status);
  }

  badgeClass(hue: string): string {
    return badgeClassFor(hue);
  }
  readonly cols = ['name', 'ip', 'nasType', 'status', 'lastSeen', 'actions'];

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void {
    this.load();
    this.routerApi
      .streamHeartbeats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((update) => {
        this.routers.update((list) =>
          list.map((r) => (update[r.id] ? { ...r, lastSeen: update[r.id] } : r)),
        );
      });
  }

  load(): void {
    this.loading.set(true);
    this.routerApi.getPage(this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.routers.set(page.content);
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

  deleteRouter(router: RouterDto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Router',
          message: `Delete "${router.name}"?`,
          confirmText: 'Delete',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.routerApi.delete(router.id).subscribe({
          next: () => {
            this.routers.update((list) => list.filter((r) => r.id !== router.id));
            this.totalElements.update((count) => count - 1);
          },
          error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 }),
        });
      });
  }
}
