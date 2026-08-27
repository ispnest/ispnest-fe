import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
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
import { PoolApiService, RouterApiService } from '@/app/domains/network/data';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { PoolDto, PoolGroupDto, RouterDto } from '../../data/network.model';

@Component({
  selector: 'app-pools-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCard,
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
    LoadingComponent,
  ],
  host: { class: 'flex flex-auto flex-col' },
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">IP Pools</h1>
          <p class="text-sm text-neutral-a11">
            {{ totalElements() }} pool{{ totalElements() !== 1 ? 's' : '' }} configured — pushed to
            each router automatically
          </p>
        </div>
      </div>

      <mat-card>
        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="groups()"
              [multiTemplateDataRows]="true"
            >
              <!-- Pool name -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Pool Name</th>
                <td mat-cell *matCellDef="let g" class="font-medium">{{ g.name }}</td>
              </ng-container>

              <!-- Router count badge -->
              <ng-container matColumnDef="count">
                <th mat-header-cell *matHeaderCellDef>Routers</th>
                <td mat-cell *matCellDef="let g">
                  <span
                    class="inline-flex items-center rounded-full bg-neutral-a3 px-2 py-0.5 text-xs font-semibold text-neutral-a11"
                  >
                    {{ g.routers.length }}
                    {{ g.routers.length === 1 ? 'router' : 'routers' }}
                  </span>
                </td>
              </ng-container>

              <!-- Row actions -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let g">
                  <div class="flex items-center justify-end gap-1">
                    <button matIconButton (click)="toggle(g.name); $event.stopPropagation()">
                      <mat-icon
                        [svgIcon]="expandedGroup() === g.name ? 'chevron-up' : 'chevron-down'"
                      />
                    </button>
                  </div>
                </td>
              </ng-container>

              <!-- Expanded detail row spanning all columns -->
              <ng-container matColumnDef="expandDetail">
                <td
                  mat-cell
                  *matCellDef="let g"
                  [attr.colspan]="cols.length"
                  class="border-b-0! p-0!"
                >
                  <div [class]="expandedGroup() === g.name ? '' : 'h-0 overflow-hidden'">
                    @for (r of g.routers; track r.id) {
                      <div
                        class="grid cursor-default items-center gap-x-4 border-l-2 border-neutral-a6 bg-neutral-a2 px-4 py-2.5 text-sm transition-colors hover:bg-neutral-a3"
                        style="grid-template-columns: 1fr 1fr 1fr auto"
                      >
                        <!-- Router name -->
                        <span class="truncate font-medium">{{ routerName(r.routerId) }}</span>

                        <!-- Range IP -->
                        <span class="font-mono text-xs text-neutral-a11">{{ r.rangeIp }}</span>

                        <!-- Local / gateway IP -->
                        <span class="font-mono text-xs text-neutral-a11">{{
                          r.localIp ?? '—'
                        }}</span>

                        <!-- Per-row actions -->
                        @if (!auth.isViewOnly()) {
                          <div class="flex gap-1">
                            <a matIconButton [routerLink]="['/admin/pools', r.id, 'edit']">
                              <mat-icon svgIcon="pencil" />
                            </a>
                            <button matIconButton (click)="deleteEntry(r, g)">
                              <mat-icon svgIcon="trash" />
                            </button>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>

              <!-- Main group row -->
              <tr
                mat-row
                *matRowDef="let g; columns: cols"
                class="group relative cursor-pointer hover:bg-neutral-a2"
                (click)="toggle(g.name)"
              ></tr>

              <!-- Detail row (always rendered, visually collapsed via h-0) -->
              <tr
                mat-row
                *matRowDef="let g; columns: ['expandDetail']"
                [class.!h-0]="expandedGroup() !== g.name"
                class="border-b-0!"
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
  `,
})
export class PoolsListComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly poolApi = inject(PoolApiService);
  private readonly routerApi = inject(RouterApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly groups = signal<PoolGroupDto[]>([]);
  readonly totalElements = signal(0);
  readonly expandedGroup = signal<string | null>(null);

  /** routerId → router name map for display — loaded once */
  private readonly routerMap = signal<Map<string, string>>(new Map());

  readonly cols = ['name', 'count', 'actions'];

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void {
    // Load router names for display in sub-rows
    this.routerApi.getAll().subscribe((routers: RouterDto[]) => {
      this.routerMap.set(new Map(routers.map((r) => [r.id, r.name])));
    });
    this.load();
  }

  routerName(routerId: string): string {
    return this.routerMap().get(routerId) ?? routerId;
  }

  toggle(name: string): void {
    this.expandedGroup.update((curr) => (curr === name ? null : name));
  }

  load(): void {
    this.loading.set(true);
    this.poolApi.getGroupedPage(this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.groups.set(page.content);
        this.totalElements.set(page.page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.expandedGroup.set(null);
    this.load();
  }

  deleteEntry(pool: PoolDto, group: PoolGroupDto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Remove Router from Pool',
          message: `Remove "${this.routerName(pool.routerId)}" from pool "${group.name}"?`,
          confirmText: 'Remove',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.poolApi.delete(pool.id).subscribe({
          next: () => {
            // Remove the entry locally without a full reload
            this.groups.update((list) =>
              list
                .map((g) =>
                  g.name === group.name
                    ? { ...g, routers: g.routers.filter((r) => r.id !== pool.id) }
                    : g,
                )
                .filter((g) => g.routers.length > 0),
            );
            this.totalElements.update((n) => {
              // If the last router was removed from the group, decrement the pool count
              const stillExists = this.groups().some((g) => g.name === group.name);
              return stillExists ? n : n - 1;
            });
            this.snackBar.open('Router removed from pool', 'OK', { duration: 3000 });
          },
          error: () =>
            this.snackBar.open('Failed to remove router from pool', 'Close', { duration: 3000 }),
        });
      });
  }
}
