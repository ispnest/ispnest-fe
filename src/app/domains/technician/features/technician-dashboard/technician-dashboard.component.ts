import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatChip } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { CustomerApiService } from '@/app/domains/customers/data';
import { PppoeStatsDto } from '@/app/domains/customers/data/customer.model';
import {
  RouterApiService,
  isRouterOnline as checkRouterOnline,
  summarizeOfflineRouters,
} from '@/app/domains/network/data';
import { RouterDto } from '@/app/domains/network/data/network.model';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

/** Customers paid up but with no RADIUS activity for at least this long get their own deep link. */
const OFFLINE_HOURS_THRESHOLD = 24;

/** Query params applied to `/admin/customers` when a KPI tile is clicked. */
type CustomerFilterParams = Record<string, string | number | boolean>;

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    DatePipe,
    NgClass,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatButton,
    MatIcon,
    MatChip,
    MatTooltip,
    MatProgressSpinner,
    StatusBadgeComponent,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Technician Dashboard</h1>
          <p class="text-sm text-neutral-a11">PPPoE subscriber overview and router status</p>
        </div>
        <button matButton (click)="refresh()" matTooltip="Refresh all data">
          <mat-icon svgIcon="refresh-cw" /> Refresh
        </button>
      </div>

      <!-- KPI Cards — subscriber breakdown + network health; each sub-row deep-links -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- Subscribers -->
        <mat-card appearance="filled">
          <mat-card-header>
            <div class="flex items-center gap-x-2">
              <div
                class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-a3"
              >
                <mat-icon svgIcon="users" class="size-4 text-primary-a11" />
              </div>
              <div class="text-sm font-medium text-neutral-a11">Subscribers</div>
            </div>
          </mat-card-header>
          <mat-card-content>
            <button
              type="button"
              class="mt-2 block cursor-pointer rounded text-left transition-colors hover:bg-neutral-a3"
              (click)="goToCustomers({ serviceType: 'pppoe' })"
            >
              <div class="text-3xl font-semibold tabular-nums tracking-tight">
                {{ stats()?.total ?? '—' }}
              </div>
              <div class="mt-1 text-sm text-neutral-a11">PPPoE subscribers</div>
            </button>

            <div class="mt-4 flex flex-col gap-0.5 border-t border-neutral-a4 pt-3">
              <button
                type="button"
                class="flex w-full cursor-pointer items-center justify-between gap-3 rounded px-2 py-2.5 text-sm transition-colors hover:bg-neutral-a3 sm:py-1.5"
                (click)="goToCustomers({ hasActiveRecharge: true, serviceType: 'pppoe' })"
              >
                <span class="flex min-w-0 items-center gap-2">
                  <span class="size-1.5 shrink-0 rounded-full bg-green-a9"></span>
                  <span class="truncate text-neutral-a11">Active</span>
                </span>
                <span class="shrink-0 font-medium tabular-nums text-green-a11">
                  {{ stats()?.active ?? '—' }}
                </span>
              </button>

              <button
                type="button"
                class="flex w-full cursor-pointer items-center justify-between gap-3 rounded px-2 py-2.5 text-sm transition-colors hover:bg-neutral-a3 sm:py-1.5"
                (click)="goToCustomers({ connected: false, serviceType: 'pppoe' })"
              >
                <span class="flex min-w-0 items-center gap-2">
                  <span class="size-1.5 shrink-0 rounded-full bg-amber-a9"></span>
                  <span class="truncate text-neutral-a11">Pending install</span>
                </span>
                <span class="shrink-0 font-medium tabular-nums text-amber-a11">
                  {{ stats()?.notConnected ?? '—' }}
                </span>
              </button>

              <button
                type="button"
                class="flex w-full cursor-pointer items-center justify-between gap-3 rounded px-2 py-2.5 text-sm transition-colors hover:bg-neutral-a3 sm:py-1.5"
                (click)="goToCustomers({ hasActiveRecharge: false, serviceType: 'pppoe' })"
              >
                <span class="flex min-w-0 items-center gap-2">
                  <span class="size-1.5 shrink-0 rounded-full bg-orange-a9"></span>
                  <span class="truncate text-neutral-a11">Expired</span>
                </span>
                <span class="shrink-0 font-medium tabular-nums text-orange-a11">
                  {{ stats()?.noActiveRecharge ?? '—' }}
                </span>
              </button>

              <button
                type="button"
                class="flex w-full cursor-pointer items-center justify-between gap-3 rounded px-2 py-2.5 text-sm transition-colors hover:bg-neutral-a3 sm:py-1.5"
                (click)="goToCustomers({ status: 'suspended', serviceType: 'pppoe' })"
              >
                <span class="flex min-w-0 items-center gap-2">
                  <span class="size-1.5 shrink-0 rounded-full bg-yellow-a9"></span>
                  <span class="truncate text-neutral-a11">Suspended</span>
                </span>
                <span class="shrink-0 font-medium tabular-nums text-yellow-a11">
                  {{ stats()?.suspended ?? '—' }}
                </span>
              </button>

              <button
                type="button"
                class="flex w-full cursor-pointer items-center justify-between gap-3 rounded px-2 py-2.5 text-sm transition-colors hover:bg-neutral-a3 sm:py-1.5"
                (click)="
                  goToCustomers({
                    hasActiveRecharge: true,
                    offlineHours: offlineHoursThreshold,
                    serviceType: 'pppoe',
                  })
                "
              >
                <span class="flex min-w-0 items-center gap-2">
                  <span class="size-1.5 shrink-0 rounded-full bg-red-a9"></span>
                  <span class="truncate text-neutral-a11">
                    Paid, offline &gt; {{ offlineHoursThreshold }}h
                  </span>
                </span>
                <mat-icon svgIcon="arrow-right" class="size-3.5 shrink-0 text-neutral-a9" />
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Network -->
        <mat-card appearance="filled">
          <mat-card-header>
            <div class="flex items-center gap-x-2">
              <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-a3">
                <mat-icon svgIcon="network" class="size-4 text-teal-a11" />
              </div>
              <div class="text-sm font-medium text-neutral-a11">Network</div>
            </div>
          </mat-card-header>
          <mat-card-content>
            <button
              type="button"
              class="mt-2 block cursor-pointer rounded text-left transition-colors hover:bg-neutral-a3"
              (click)="goToRouters()"
            >
              <div class="text-3xl font-semibold tabular-nums tracking-tight">
                <span class="text-teal-a11">{{ routersOnline() }}</span>
                <span class="text-base text-neutral-a11"> / {{ routers().length }}</span>
              </div>
              <div class="mt-1 text-sm text-neutral-a11">routers online</div>
            </button>

            <div class="mt-4 flex flex-col gap-0.5 border-t border-neutral-a4 pt-3">
              <div class="flex w-full items-center justify-between gap-3 px-2 py-1.5 text-sm">
                <span class="flex min-w-0 items-center gap-2">
                  <span class="size-1.5 shrink-0 rounded-full bg-green-a9"></span>
                  <span class="truncate text-neutral-a11">Online</span>
                </span>
                <span class="shrink-0 font-medium tabular-nums text-green-a11">
                  {{ routersOnline() }}
                </span>
              </div>

              <div class="flex w-full items-center justify-between gap-3 px-2 py-1.5 text-sm">
                <span class="flex min-w-0 items-center gap-2">
                  <span class="size-1.5 shrink-0 rounded-full bg-red-a9"></span>
                  <span class="truncate text-neutral-a11">Offline</span>
                </span>
                <span class="shrink-0 font-medium tabular-nums text-red-a11">
                  {{ routers().length - routersOnline() }}
                </span>
              </div>

              @if (routers().length === 0) {
                <div class="px-2 py-1.5 text-xs text-neutral-a11">No routers configured</div>
              } @else if (offlineRouterSummary()) {
                <div
                  class="mt-1 flex items-center gap-2 rounded bg-amber-a3 px-2 py-1.5 text-xs text-amber-a11"
                >
                  <mat-icon svgIcon="circle-alert" class="size-3.5 shrink-0" />
                  <span class="min-w-0 truncate">{{ offlineRouterSummary() }}</span>
                </div>
              } @else {
                <div class="px-2 py-1.5 text-xs text-neutral-a11">All routers reachable</div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Router Status Panel -->
      @if (routers().length > 0) {
        <mat-card>
          <div class="flex items-center justify-between border-b border-neutral-a6 px-5 py-4">
            <p class="text-sm font-bold">Router / NAS Status</p>
          </div>
          <div class="divide-y divide-neutral-a4">
            @for (r of routers(); track r.id) {
              <div class="flex flex-wrap items-center gap-3 px-5 py-3 sm:flex-nowrap">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg"
                  [ngClass]="isRouterOnline(r) ? 'bg-green-a3' : 'bg-red-a3'"
                >
                  <mat-icon
                    svgIcon="network"
                    class="size-4"
                    [ngClass]="isRouterOnline(r) ? 'text-green-a11' : 'text-red-a11'"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="truncate font-medium text-sm">{{ r.name }}</p>
                  @if (r.description) {
                    <p class="text-xs text-neutral-a11 truncate">{{ r.description }}</p>
                  }
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <mat-chip class="text-xs! uppercase">{{ r.nasType }}</mat-chip>
                  <app-status-badge [status]="r.status" />
                  @if (r.lastSeen) {
                    <span class="hidden text-xs text-neutral-a9 sm:block">{{
                      r.lastSeen | date: 'd MMM, HH:mm'
                    }}</span>
                  }
                </div>
                <button
                  matButton
                  class="shrink-0"
                  [disabled]="isTestingRouter(r.id)"
                  (click)="testConnection(r)"
                  matTooltip="Test RADIUS connection"
                >
                  @if (isTestingRouter(r.id)) {
                    <mat-progress-spinner diameter="14" mode="indeterminate" />
                  } @else {
                    <mat-icon svgIcon="plug-zap" />
                  }
                  Test
                </button>
                @if (routerTestResults().get(r.id) === 'success') {
                  <span
                    class="flex items-center gap-1 rounded-full bg-green-a3 px-2 py-0.5 text-xs font-medium text-green-a11"
                    ><mat-icon svgIcon="check" class="size-3" /> OK</span
                  >
                }
                @if (routerTestResults().get(r.id) === 'error') {
                  <span
                    class="flex items-center gap-1 rounded-full bg-red-a3 px-2 py-0.5 text-xs font-medium text-red-a11"
                    ><mat-icon svgIcon="x" class="size-3" /> Failed</span
                  >
                }
              </div>
            }
          </div>
        </mat-card>
      }
    </div>
  `,
})
export class TechnicianDashboardComponent implements OnInit {
  private readonly customerApi = inject(CustomerApiService);
  private readonly routerApi = inject(RouterApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly routers = signal<RouterDto[]>([]);
  readonly stats = signal<PppoeStatsDto | null>(null);
  readonly routersOnline = signal(0);

  /** Bound in the template so the "Paid, offline > Nh" deep link and its label always agree. */
  readonly offlineHoursThreshold = OFFLINE_HOURS_THRESHOLD;

  /**
   * Names of up to two offline routers, with a "+N more" tail. Empty when all are reachable.
   * Shares its online/offline definition with the admin dashboard via `summarizeOfflineRouters`.
   */
  readonly offlineRouterSummary = computed(() => summarizeOfflineRouters(this.routers()));

  private readonly testingRouters = signal<Set<string>>(new Set());
  readonly routerTestResults = signal<Map<string, 'success' | 'error'>>(new Map());

  ngOnInit(): void {
    this.loadStats();
    this.loadRouters();
    this.routerApi
      .streamHeartbeats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((update) => {
        this.routers.update((list) =>
          list.map((r) => (update[r.id] ? { ...r, lastSeen: update[r.id] } : r)),
        );
      });
  }

  refresh(): void {
    this.loadStats();
    this.loadRouters();
  }

  goToCustomers(params: CustomerFilterParams): void {
    this.router.navigate(['/admin/customers'], { queryParams: params });
  }

  goToRouters(): void {
    this.router.navigate(['/admin/routers']);
  }

  loadStats(): void {
    this.customerApi.getPppoeStats().subscribe({
      next: (s) => this.stats.set(s),
    });
  }

  loadRouters(): void {
    this.routerApi.getAll().subscribe((routers) => {
      this.routers.set(routers);
      this.routersOnline.set(routers.filter((r) => this.isRouterOnline(r)).length);
    });
  }

  isRouterOnline(r: RouterDto): boolean {
    return checkRouterOnline(r);
  }

  isTestingRouter(id: string): boolean {
    return this.testingRouters().has(id);
  }

  testConnection(r: RouterDto): void {
    this.testingRouters.update((s) => {
      const n = new Set(s);
      n.add(r.id);
      return n;
    });
    this.routerTestResults.update((m) => {
      const n = new Map(m);
      n.delete(r.id);
      return n;
    });
    this.routerApi.testConnection(r.id).subscribe({
      next: () => {
        this.testingRouters.update((s) => {
          const n = new Set(s);
          n.delete(r.id);
          return n;
        });
        this.routerTestResults.update((m) => {
          const n = new Map(m);
          n.set(r.id, 'success');
          return n;
        });
        this.snackBar.open(`${r.name}: connection successful`, undefined, { duration: 3000 });
      },
      error: () => {
        this.testingRouters.update((s) => {
          const n = new Set(s);
          n.delete(r.id);
          return n;
        });
        this.routerTestResults.update((m) => {
          const n = new Map(m);
          n.set(r.id, 'error');
          return n;
        });
        this.snackBar.open(`${r.name}: connection failed`, 'Close', { duration: 4000 });
      },
    });
  }
}
