import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatOption } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
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
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CustomerApiService, NetworkUsageEvent } from '@/app/domains/customers/data';
import { DashboardApiService } from '@/app/domains/dashboard/data/dashboard-api.service';
import { DashboardKpis } from '@/app/domains/dashboard/data/dashboard.model';
import { RouterApiService, summarizeOfflineRouters } from '@/app/domains/network/data';
import { RouterDto } from '@/app/domains/network/data';
import { UsageChartComponent, UsageChartSeries } from '@/app/ui/charts';
import {
  BuiDialog,
  BuiDialogBackdrop,
  BuiDialogBody,
  BuiDialogClose,
  BuiDialogContent,
  BuiDialogFooter,
  BuiDialogHeader,
  BuiDialogPortal,
  BuiDialogTitle,
  BuiDialogTrigger,
} from '@/app/ui/dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { NetworkUsageChartComponent } from './widgets/network-usage-chart.component';
import { ThroughputTickerComponent } from './widgets/throughput-ticker.component';
import { TopConsumersComponent } from './widgets/top-consumers.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatButton,
    MatIcon,
    MatFormField,
    MatSelect,
    MatOption,
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
    BuiDialog,
    BuiDialogTrigger,
    BuiDialogPortal,
    BuiDialogBackdrop,
    BuiDialogContent,
    BuiDialogHeader,
    BuiDialogTitle,
    BuiDialogBody,
    BuiDialogFooter,
    BuiDialogClose,
    StatusBadgeComponent,
    LoadingComponent,
    NetworkUsageChartComponent,
    ThroughputTickerComponent,
    TopConsumersComponent,
    UsageChartComponent,
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <!-- Page header -->
      <div>
        <h1 class="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p class="mt-1 text-neutral-a11">ISP management overview</p>
      </div>

      <app-loading [loading]="loading()" />

      @if (!loading()) {
        <!-- Grouped KPI cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <!-- Customers -->
          <mat-card appearance="filled" class="flex flex-col">
            <mat-card-header>
              <div class="flex w-full items-center justify-between gap-x-2">
                <div class="flex min-w-0 items-center gap-x-2">
                  <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-a3"
                  >
                    <mat-icon class="size-4 text-primary-a11" svgIcon="users" />
                  </div>
                  <div class="truncate text-sm font-medium text-neutral-a11">Customers</div>
                </div>
                <mat-form-field
                  class="w-18 shrink-0 [&_.mat-mdc-text-field-wrapper]:h-8"
                  subscriptSizing="dynamic"
                >
                  <mat-select
                    [value]="expiringSoonDays()"
                    (selectionChange)="onExpiringSoonDaysChange($event.value)"
                    aria-label="Expiring-soon window"
                  >
                    <mat-option [value]="3">3d</mat-option>
                    <mat-option [value]="7">7d</mat-option>
                    <mat-option [value]="14">14d</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </mat-card-header>
            <mat-card-content class="flex flex-auto flex-col">
              <div class="mt-2 truncate text-3xl font-semibold tabular-nums tracking-tight">
                {{ kpis()?.totalCustomers ?? 0 | number }}
              </div>
              <div class="mt-1 text-sm text-neutral-a11">total subscribers</div>
              <div class="mt-3 flex flex-col border-t border-neutral-a4 pt-2">
                <a
                  class="-mx-2 flex items-center justify-between gap-x-2 rounded px-2 py-2.5 text-sm hover:bg-neutral-a3 sm:py-1"
                  routerLink="/admin/customers"
                  [queryParams]="{ status: 'active' }"
                >
                  <span class="min-w-0 truncate text-neutral-a11">Active</span>
                  <span class="shrink-0 font-medium tabular-nums">
                    {{ kpis()?.activeCustomers ?? 0 | number }}
                  </span>
                </a>
                <div class="flex items-center justify-between gap-x-2 px-2 py-2.5 text-sm sm:py-1">
                  <span class="min-w-0 truncate text-neutral-a11">
                    Expiring · {{ expiringSoonDays() }}d
                  </span>
                  <span class="shrink-0 font-medium tabular-nums text-amber-a11">
                    {{ expiringSoonCount() ?? 0 | number }}
                  </span>
                </div>
                <a
                  class="-mx-2 flex items-center justify-between gap-x-2 rounded px-2 py-2.5 text-sm hover:bg-neutral-a3 sm:py-1"
                  routerLink="/admin/customers"
                  [queryParams]="{ hasActiveRecharge: false }"
                >
                  <span class="min-w-0 truncate text-neutral-a11">Expired</span>
                  <span class="shrink-0 tabular-nums">
                    <span class="font-medium text-orange-a11">
                      {{ kpis()?.expiredCount ?? 0 | number }}
                    </span>
                    @if ((kpis()?.expiredCount ?? 0) > 0) {
                      <span class="text-neutral-a11">
                        · avg {{ kpis()?.expiredAvgDaysOverdue ?? 0 | number: '1.0-0' }}d
                      </span>
                    }
                  </span>
                </a>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Revenue -->
          <mat-card appearance="filled" class="flex flex-col">
            <mat-card-header>
              <div class="flex items-center gap-x-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-a3"
                >
                  <mat-icon class="size-4 text-green-a11" svgIcon="banknote" />
                </div>
                <div class="truncate text-sm font-medium text-neutral-a11">Revenue</div>
              </div>
            </mat-card-header>
            <mat-card-content class="flex flex-auto flex-col">
              <div class="mt-2 flex items-center justify-between gap-x-2">
                <div class="min-w-0 truncate text-3xl font-semibold tabular-nums tracking-tight">
                  KES {{ kpis()?.revenueToday ?? 0 | number: '1.0-0' }}
                </div>
                @if (revenueSparklineSeries(); as series) {
                  <div class="h-8 w-16 shrink-0">
                    <app-usage-chart
                      [series]="series"
                      type="area"
                      [height]="32"
                      [sparkline]="true"
                    />
                  </div>
                }
              </div>
              <div class="mt-1 text-sm text-neutral-a11">collected today</div>
              <div class="mt-3 flex flex-col border-t border-neutral-a4 pt-2">
                <a
                  class="-mx-2 flex items-center justify-between gap-x-2 rounded px-2 py-2.5 text-sm hover:bg-neutral-a3 sm:py-1"
                  routerLink="/admin/payments"
                >
                  <span class="min-w-0 truncate text-neutral-a11">Success rate</span>
                  <span class="shrink-0 font-medium tabular-nums">
                    {{ paymentSuccessRateLabel() }}
                  </span>
                </a>
                <a
                  class="-mx-2 flex items-center justify-between gap-x-2 rounded px-2 py-2.5 text-sm hover:bg-neutral-a3 sm:py-1"
                  routerLink="/admin/billing/invoices"
                >
                  <span class="min-w-0 truncate text-neutral-a11">Overdue</span>
                  <span class="shrink-0 tabular-nums">
                    <span class="font-medium text-amber-a11">
                      {{ kpis()?.overdueInvoiceCount ?? 0 | number }}
                    </span>
                    <span class="text-neutral-a11">
                      · KES {{ kpis()?.overdueAmount ?? 0 | number: '1.0-0' }}
                    </span>
                  </span>
                </a>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Network -->
          <mat-card appearance="filled" class="flex flex-col">
            <mat-card-header>
              <div class="flex items-center gap-x-2">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-a3">
                  <mat-icon class="size-4 text-teal-a11" svgIcon="network" />
                </div>
                <div class="truncate text-sm font-medium text-neutral-a11">Network</div>
              </div>
            </mat-card-header>
            <mat-card-content class="flex flex-auto flex-col">
              <div class="mt-2 truncate text-3xl font-semibold tabular-nums tracking-tight">
                {{ kpis()?.onlineRouters ?? 0 }}/{{ kpis()?.totalRouters ?? 0 }}
              </div>
              <div class="mt-1 text-sm text-neutral-a11">routers online</div>
              <div class="mt-3 flex flex-col border-t border-neutral-a4 pt-2">
                <a
                  class="-mx-2 flex items-center justify-between gap-x-2 rounded px-2 py-2.5 text-sm hover:bg-neutral-a3 sm:py-1"
                  routerLink="/admin/routers"
                >
                  <span class="min-w-0 truncate text-neutral-a11">Online</span>
                  <span class="shrink-0 font-medium tabular-nums text-teal-a11">
                    {{ kpis()?.onlineRouters ?? 0 | number }}
                  </span>
                </a>
                <a
                  class="-mx-2 flex items-center justify-between gap-x-2 rounded px-2 py-2.5 text-sm hover:bg-neutral-a3 sm:py-1"
                  routerLink="/admin/routers"
                >
                  <span class="min-w-0 truncate text-neutral-a11">Offline</span>
                  <span class="shrink-0 font-medium tabular-nums">
                    {{ offlineRouterCount() | number }}
                  </span>
                </a>
                @if (offlineRouterCount() > 0) {
                  <div class="flex items-center gap-x-1.5 py-1 text-sm text-amber-a11">
                    <mat-icon class="size-4 shrink-0" svgIcon="circle-alert" />
                    <span class="min-w-0 truncate">{{ offlineRouterLabel() }}</span>
                  </div>
                } @else {
                  <div class="py-1 text-sm text-neutral-a11">All routers reachable</div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Plans -->
          <div buiDialog #plansDialog="buiDialog">
            <mat-card appearance="filled" class="flex flex-col">
              <mat-card-header>
                <div class="flex w-full items-center gap-x-2">
                  <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-a3"
                  >
                    <mat-icon class="size-4 text-violet-a11" svgIcon="layers" />
                  </div>
                  <div class="truncate text-sm font-medium text-neutral-a11">Plans</div>
                  @if (planPopularity().length > topPlans().length) {
                    <button matButton class="tertiary ml-auto shrink-0 text-xs!" buiDialogTrigger>
                      View all
                    </button>
                  }
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-auto flex-col">
                <div class="mt-2 truncate text-3xl font-semibold tabular-nums tracking-tight">
                  {{ planPopularity().length }}
                </div>
                <div class="mt-1 text-sm text-neutral-a11">plans in use</div>
                <div class="mt-3 flex flex-col gap-y-1 border-t border-neutral-a4 pt-2">
                  @for (plan of topPlans(); track plan.planId) {
                    <a
                      class="-mx-2 flex flex-col gap-y-1 rounded px-2 py-2 hover:bg-neutral-a3 sm:py-1"
                      routerLink="/admin/plans"
                    >
                      <div class="flex items-baseline justify-between gap-x-2 text-sm">
                        <span class="min-w-0 truncate text-neutral-a11">{{ plan.planName }}</span>
                        <span class="shrink-0 font-medium tabular-nums">
                          {{ plan.activeCount | number }}
                        </span>
                      </div>
                      <div class="h-1 overflow-hidden rounded-full bg-neutral-a3">
                        <div
                          class="h-full rounded-full bg-violet-9"
                          [style.width.%]="planPopularityPercent(plan)"
                        ></div>
                      </div>
                    </a>
                  } @empty {
                    <div class="py-1 text-sm text-neutral-a11">No active subscriptions</div>
                  }
                </div>
              </mat-card-content>
            </mat-card>

            <ng-template buiDialogPortal>
              <div buiDialogBackdrop></div>
              <div buiDialogContent class="max-w-md">
                <div buiDialogHeader>
                  <h2 buiDialogTitle>All Plans by Active Subscriptions</h2>
                </div>
                <div buiDialogBody class="flex flex-col gap-y-2">
                  @for (plan of planPopularity(); track plan.planId) {
                    <a
                      class="-mx-2 flex flex-col gap-y-1 rounded px-2 py-2.5 hover:bg-neutral-a3 sm:py-1.5"
                      routerLink="/admin/plans"
                      (click)="plansDialog.close()"
                    >
                      <div class="flex items-baseline justify-between gap-x-2 text-sm">
                        <span class="min-w-0 truncate">{{ plan.planName }}</span>
                        <span class="shrink-0 font-medium tabular-nums">
                          {{ plan.activeCount | number }} active
                        </span>
                      </div>
                      <div class="h-1.5 overflow-hidden rounded-full bg-neutral-a3">
                        <div
                          class="h-full rounded-full bg-violet-9"
                          [style.width.%]="planPopularityPercent(plan)"
                        ></div>
                      </div>
                    </a>
                  }
                </div>
                <div buiDialogFooter>
                  <button matButton buiDialogClose>Close</button>
                </div>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Bandwidth usage -->
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div class="lg:col-span-2">
            <app-network-usage-chart [liveEvent]="latestNetworkEvent()" />
          </div>
          <div class="flex flex-col gap-4">
            <app-throughput-ticker [liveEvent]="latestNetworkEvent()" />
            <app-top-consumers class="flex-auto" [liveEvent]="latestNetworkEvent()" />
          </div>
        </div>

        <!-- Router status table -->
        <mat-card>
          <div class="flex items-center justify-between border-b border-neutral-a4 px-4 py-3">
            <div class="text-xl font-semibold tracking-tight">Router Status</div>
            <a matButton class="tertiary" routerLink="/admin/routers">
              View All
              <mat-icon svgIcon="arrow-right" />
            </a>
          </div>
          <div class="flex flex-col">
            <div class="relative isolate overflow-x-visible overflow-y-hidden">
              <table
                class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
                mat-table
                [dataSource]="routerRows()"
              >
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let r" class="font-medium">{{ r.name }}</td>
                </ng-container>
                <ng-container matColumnDef="ip">
                  <th mat-header-cell *matHeaderCellDef>IP Address</th>
                  <td mat-cell *matCellDef="let r" class="font-mono text-sm">{{ r.ipAddress }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let r"><app-status-badge [status]="r.status" /></td>
                </ng-container>
                <ng-container matColumnDef="lastSeen">
                  <th mat-header-cell *matHeaderCellDef>Last Seen</th>
                  <td mat-cell *matCellDef="let r" class="text-neutral-a11">
                    {{ r.lastSeen | date: 'short' }}
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="routerCols"></tr>
                <tr
                  class="group relative hover:bg-neutral-a2"
                  mat-row
                  *matRowDef="let _r; columns: routerCols"
                ></tr>
              </table>
            </div>
          </div>
        </mat-card>

        <!-- Quick actions -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <mat-card class="flex flex-col p-6">
            <div class="flex size-10 items-center justify-center rounded-xl bg-primary-a3">
              <mat-icon svgIcon="user-round-plus" class="text-primary-a11" />
            </div>
            <div class="mt-4 text-xl font-semibold tracking-tight">New Customer</div>
            <div class="mt-1 text-sm text-neutral-a11">Register a new subscriber</div>
            <div class="flex-auto"></div>
            <a matButton class="primary mt-6" routerLink="/admin/customers/new">
              <mat-icon svgIcon="user-round-plus" />
              Add Customer
            </a>
          </mat-card>
          <mat-card class="flex flex-col p-6">
            <div class="flex size-10 items-center justify-center rounded-xl bg-violet-a3">
              <mat-icon svgIcon="layers" class="text-violet-a11" />
            </div>
            <div class="mt-4 text-xl font-semibold tracking-tight">New Plan</div>
            <div class="mt-1 text-sm text-neutral-a11">Create a service plan</div>
            <div class="flex-auto"></div>
            <a matButton class="primary mt-6" routerLink="/admin/plans/new">
              <mat-icon svgIcon="plus" />
              Add Plan
            </a>
          </mat-card>
          <mat-card class="flex flex-col p-6">
            <div class="flex size-10 items-center justify-center rounded-xl bg-teal-a3">
              <mat-icon svgIcon="network" class="text-teal-a11" />
            </div>
            <div class="mt-4 text-xl font-semibold tracking-tight">New Router</div>
            <div class="mt-1 text-sm text-neutral-a11">Register a NAS device</div>
            <div class="flex-auto"></div>
            <a matButton class="primary mt-6" routerLink="/admin/routers/new">
              <mat-icon svgIcon="plus" />
              Add Router
            </a>
          </mat-card>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly customerApi = inject(CustomerApiService);
  private readonly routerApi = inject(RouterApiService);
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly kpis = signal<DashboardKpis | null>(null);
  readonly routers = signal<RouterDto[]>([]);

  readonly expiringSoonDays = signal(7);
  readonly expiringSoonCount = signal<number | null>(null);

  /** Latest network-usage SSE event — one shared stream feeds all three usage widgets. */
  readonly latestNetworkEvent = signal<NetworkUsageEvent | null>(null);

  readonly routerCols = ['name', 'ip', 'status', 'lastSeen'];

  readonly planPopularity = computed(() => this.kpis()?.planPopularity ?? []);

  /** Top three plans by active subscriptions — the rest stay on the plans page. */
  readonly topPlans = computed(() => this.planPopularity().slice(0, 3));

  private readonly maxPlanCount = computed(() =>
    Math.max(1, ...this.planPopularity().map((p) => p.activeCount)),
  );

  /** Rows shown in the Router Status table; the signal itself holds the full list. */
  readonly routerRows = computed(() => this.routers().slice(0, 10));

  /** Authoritative count from the composite endpoint, which sees every router (not just a page). */
  readonly offlineRouterCount = computed(() => {
    const kpis = this.kpis();
    if (!kpis) return 0;
    return Math.max(0, kpis.totalRouters - kpis.onlineRouters);
  });

  /**
   * Names up to two offline routers so the card points at the actual problem. The names come from
   * the fetched router page while the count comes from the KPI endpoint, so the two can disagree
   * on a very large fleet — hence the "+N more" tail and the count-only fallback. Shares its
   * online/offline definition with the technician dashboard via `summarizeOfflineRouters`.
   */
  readonly offlineRouterLabel = computed(() =>
    summarizeOfflineRouters(this.routers(), this.offlineRouterCount()),
  );

  readonly revenueSparklineSeries = computed<UsageChartSeries[] | null>(() => {
    const points = this.kpis()?.revenueSparkline ?? [];
    if (points.length === 0) return null;
    return [
      {
        name: 'Revenue',
        data: points.map((p) => ({ x: Date.parse(p.periodStart), y: p.totalAmount })),
      },
    ];
  });

  readonly paymentSuccessRateLabel = computed(() => {
    const rate = this.kpis()?.paymentSuccessRate;
    return rate === null || rate === undefined ? '—' : `${Math.round(rate * 100)}%`;
  });

  planPopularityPercent(plan: { activeCount: number }): number {
    return Math.round((plan.activeCount / this.maxPlanCount()) * 100);
  }

  /**
   * Re-fetches on every `expiringSoonDays` change via `switchMap`, so a fast 3d → 7d → 14d flip
   * can't have the 3d response land last and overwrite the 14d count that's actually selected.
   * Each inner request's errors are caught locally so one failure doesn't kill the subscription
   * for subsequent day-window changes.
   */
  private readonly expiringSoonCount$ = toObservable(this.expiringSoonDays).pipe(
    switchMap((days) =>
      this.dashboardApi.getExpiringSoon(days).pipe(
        map((result) => result.count),
        catchError(() => of(null)),
      ),
    ),
  );

  onExpiringSoonDaysChange(days: number): void {
    this.expiringSoonDays.set(days);
  }

  ngOnInit(): void {
    let loaded = 0;
    const checkDone = () => {
      if (++loaded === 2) this.loading.set(false);
    };

    this.dashboardApi.getKpis().subscribe({
      next: (kpis) => {
        this.kpis.set(kpis);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.expiringSoonCount$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((count) => this.expiringSoonCount.set(count));

    // Router rows — the composite KPI endpoint only returns counts. Kept unsliced so the Network
    // card can name offline routers; the table renders routerRows() (first 10).
    this.routerApi.getPage(0, 100).subscribe({
      next: (page) => {
        this.routers.set(page.content);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.routerApi
      .streamHeartbeats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((update) => {
        this.routers.update((list) =>
          list.map((r) => (update[r.id] ? { ...r, lastSeen: update[r.id] } : r)),
        );
      });

    // Single shared SSE connection for all three usage widgets (auto-reconnecting)
    this.customerApi
      .streamNetworkUsage()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.latestNetworkEvent.set(event));
  }
}
