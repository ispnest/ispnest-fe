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
import { extractErrorMessage } from '@/app/core/http/api-errors';
import { PoolApiService, RouterApiService } from '@/app/domains/network/data';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { RouterDto } from '../../data/network.model';

type RouterRow = RouterDto & {
  /** Filled in asynchronously after the table renders. Undefined = still loading. */
  poolCount?: number;
};

/**
 * Routers list — primary entry point for the routers domain.
 *
 *  - Two-line cells: name (clickable → detail) + description.
 *  - Inline "Edit" button + overflow menu for less-common actions.
 *  - Live heartbeat updates (SSE) refresh `lastSeen` / `status` in place.
 *  - Per-router pool count fetched lazily so the initial table render isn't blocked.
 *  - Friendly empty-state with a primary CTA for first-time setup.
 */
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
    StatusBadgeComponent,
    LoadingComponent,
  ],
  host: { class: 'flex flex-auto flex-col' },
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Routers</h1>
          <p class="text-sm text-neutral-a11">
            {{ totalElements() }} NAS device{{ totalElements() === 1 ? '' : 's' }} registered
          </p>
        </div>
        @if (!auth.isViewOnly() && totalElements() > 0) {
          <a class="primary" matButton routerLink="/admin/routers/new">
            <mat-icon svgIcon="plus" />
            Onboard router
          </a>
        }
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        @if (!loading() && totalElements() === 0) {
          <!-- Empty state -->
          <div class="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <span
              class="inline-flex size-14 items-center justify-center rounded-full bg-accent-a3 text-accent-11"
            >
              <mat-icon svgIcon="network" />
            </span>
            <div class="space-y-1">
              <h2 class="text-lg font-semibold">No routers yet</h2>
              <p class="max-w-md text-sm text-neutral-a11">
                Onboard your first MikroTik to start handing out PPPoE / hotspot sessions. The
                wizard takes care of WireGuard, RADIUS secrets, and the provisioning script.
              </p>
            </div>
            @if (!auth.isViewOnly()) {
              <a matButton class="primary" routerLink="/admin/routers/new">
                <mat-icon svgIcon="plus" />
                Onboard your first router
              </a>
            }
          </div>
        } @else {
          <div class="flex flex-col">
            <div class="relative isolate overflow-x-visible overflow-y-hidden">
              <table
                class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
                mat-table
                [dataSource]="routers()"
              >
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Router</th>
                  <td mat-cell *matCellDef="let r" class="py-2">
                    <a class="block group/cell" [routerLink]="['/admin/routers', r.id]">
                      <p class="font-medium text-neutral-a12 group-hover/cell:text-accent-11">
                        {{ r.name }}
                      </p>
                      @if (r.description) {
                        <p class="text-xs text-neutral-a11 max-w-[28ch] truncate">
                          {{ r.description }}
                        </p>
                      }
                    </a>
                  </td>
                </ng-container>

                <ng-container matColumnDef="ip">
                  <th mat-header-cell *matHeaderCellDef>IP Address</th>
                  <td mat-cell *matCellDef="let r" class="font-mono text-sm">
                    {{ r.ipAddress }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="nasType">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let r" class="capitalize">{{ r.nasType }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let r">
                    <app-status-badge [status]="r.status" />
                  </td>
                </ng-container>

                <ng-container matColumnDef="pools">
                  <th mat-header-cell *matHeaderCellDef>Pools</th>
                  <td mat-cell *matCellDef="let r">
                    @if (r.poolCount === undefined || r.poolCount === null) {
                      <span class="text-neutral-a10">…</span>
                    } @else if (r.poolCount === 0) {
                      <span class="text-neutral-a10">none</span>
                    } @else {
                      <span
                        class="inline-flex items-center gap-1 rounded-full bg-neutral-a3 px-2 py-0.5 text-xs"
                      >
                        <mat-icon class="size-3.5!" svgIcon="database" />
                        {{ r.poolCount }}
                      </span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="lastSeen">
                  <th mat-header-cell *matHeaderCellDef>Last seen</th>
                  <td mat-cell *matCellDef="let r" class="text-sm">
                    @if (r.lastSeen) {
                      <span [title]="r.lastSeen">{{ r.lastSeen | date: 'short' }}</span>
                    } @else {
                      <span class="text-neutral-a10">never</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef class="text-right"></th>
                  <td mat-cell *matCellDef="let r" class="text-right">
                    <button
                      matIconButton
                      [matMenuTriggerFor]="menu"
                      [matMenuTriggerData]="{ router: r }"
                      aria-label="More actions"
                    >
                      <mat-icon svgIcon="ellipsis-vertical" />
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="cols"></tr>
                <tr
                  class="group relative hover:bg-neutral-a2"
                  mat-row
                  *matRowDef="let _r; columns: cols"
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
        }
      </mat-card>
    </div>

    <mat-menu #menu="matMenu">
      <ng-template matMenuContent let-router="router">
        <a mat-menu-item [routerLink]="['/admin/routers', router.id]">
          <mat-icon svgIcon="eye" />View details
        </a>
        <button mat-menu-item (click)="testConnection(router)">
          <mat-icon svgIcon="wifi" />Test connection
        </button>
        @if (!auth.isViewOnly()) {
          <a mat-menu-item [routerLink]="['/admin/routers', router.id, 'edit']">
            <mat-icon svgIcon="pencil" />Edit
          </a>
          <a
            mat-menu-item
            [routerLink]="['/admin/routers', router.id]"
            [queryParams]="{ reonboard: 1 }"
          >
            <mat-icon svgIcon="refresh-cw" />Re-onboard
          </a>
          <a
            mat-menu-item
            [routerLink]="['/admin/pools/new']"
            [queryParams]="{ routerId: router.id }"
          >
            <mat-icon svgIcon="plus" />Attach pool
          </a>
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
  private readonly poolApi = inject(PoolApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly routers = signal<RouterRow[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['name', 'ip', 'nasType', 'status', 'pools', 'lastSeen', 'actions'];

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void {
    this.load();
    this.routerApi
      .streamHeartbeats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((update) => {
        this.routers.update((list) =>
          list.map((r) => (update[r.id] ? { ...r, lastSeen: update[r.id], status: 'online' } : r)),
        );
      });
  }

  load(): void {
    this.loading.set(true);
    this.routerApi.getPage(this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        const rows: RouterRow[] = page.content.map((r) => ({ ...r, poolCount: undefined }));
        this.routers.set(rows);
        this.totalElements.set(page.page.totalElements);
        this.loading.set(false);
        rows.forEach((r) => this.fetchPoolCount(r.id));
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(extractErrorMessage(err, 'Failed to load routers'), 'Close', {
          duration: 4000,
        });
      },
    });
  }

  private fetchPoolCount(routerId: string): void {
    this.poolApi.getPools(routerId).subscribe({
      next: (page) =>
        this.routers.update((list) =>
          list.map((r) => (r.id === routerId ? { ...r, poolCount: page.page.totalElements } : r)),
        ),
      error: () =>
        this.routers.update((list) =>
          list.map((r) => (r.id === routerId ? { ...r, poolCount: 0 } : r)),
        ),
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  testConnection(router: RouterDto): void {
    this.routerApi.testConnection(router.id).subscribe({
      next: () => this.snackBar.open('Connection OK', 'OK', { duration: 3000 }),
      error: (err) =>
        this.snackBar.open(extractErrorMessage(err, 'Connection failed'), 'Close', {
          duration: 4000,
        }),
    });
  }

  deleteRouter(router: RouterDto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Router',
          message: `Permanently delete "${router.name}"? Attached pools will also be removed.`,
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
            this.totalElements.update((t) => Math.max(0, t - 1));
          },
          error: (err) =>
            this.snackBar.open(extractErrorMessage(err, 'Failed to delete'), 'Close', {
              duration: 4000,
            }),
        });
      });
  }
}
