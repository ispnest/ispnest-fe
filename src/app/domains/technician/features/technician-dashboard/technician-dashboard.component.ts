import { DatePipe, NgClass } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatChip } from '@angular/material/chips';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTab, MatTabChangeEvent, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { CustomerApiService } from '@/app/domains/customers/data';
import { CustomerDto, PppoeStatsDto } from '@/app/domains/customers/data/customer.model';
import { RouterApiService } from '@/app/domains/network/data';
import { RouterDto } from '@/app/domains/network/data/network.model';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

type TabKey = 'pending' | 'subscribed' | 'expired' | 'offline';

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    RouterLink,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
    MatChip,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatPaginator,
    MatTooltip,
    MatProgressSpinner,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    MatTabGroup,
    MatTab,
    LoadingComponent,
    StatusBadgeComponent,
    MatTabLabel,
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

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <mat-card class="p-5">
          <div class="flex items-start justify-between gap-1">
            <p class="text-[10px] font-bold uppercase leading-tight tracking-wide text-neutral-a11">
              Total PPPoE
            </p>
            <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-a3">
              <mat-icon svgIcon="users" class="size-4 text-neutral-a11" />
            </div>
          </div>
          <p class="mt-2 text-3xl font-extrabold tabular-nums">{{ stats()?.total ?? '—' }}</p>
          <p class="mt-1 text-xs text-neutral-a11">All subscribers</p>
        </mat-card>

        <mat-card class="p-5 ring-1 ring-amber-a6">
          <div class="flex items-start justify-between gap-1">
            <p class="text-[10px] font-bold uppercase leading-tight tracking-wide text-amber-a11">
              Pending
            </p>
            <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-a3">
              <mat-icon svgIcon="unplug" class="size-4 text-amber-a11" />
            </div>
          </div>
          <p class="mt-2 text-3xl font-extrabold tabular-nums text-amber-a11">
            {{ stats()?.notConnected ?? '—' }}
          </p>
          <p class="mt-1 text-xs text-neutral-a11">Not yet connected</p>
        </mat-card>

        <mat-card class="p-5">
          <div class="flex items-start justify-between gap-1">
            <p class="text-[10px] font-bold uppercase leading-tight tracking-wide text-neutral-a11">
              Active
            </p>
            <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-a3">
              <mat-icon svgIcon="circle-check" class="size-4 text-green-a11" />
            </div>
          </div>
          <p class="mt-2 text-3xl font-extrabold tabular-nums text-green-a11">
            {{ stats()?.active ?? '—' }}
          </p>
          <p class="mt-1 text-xs text-neutral-a11">Currently active</p>
        </mat-card>

        <mat-card class="p-5">
          <div class="flex items-start justify-between gap-1">
            <p class="text-[10px] font-bold uppercase leading-tight tracking-wide text-neutral-a11">
              Expired
            </p>
            <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-a3">
              <mat-icon svgIcon="zap-off" class="size-4 text-orange-a11" />
            </div>
          </div>
          <p class="mt-2 text-3xl font-extrabold tabular-nums text-orange-a11">
            {{ stats()?.noActiveRecharge ?? '—' }}
          </p>
          <p class="mt-1 text-xs text-neutral-a11">No active recharge</p>
        </mat-card>

        <mat-card class="p-5">
          <div class="flex items-start justify-between gap-1">
            <p class="text-[10px] font-bold uppercase leading-tight tracking-wide text-neutral-a11">
              Suspended
            </p>
            <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-yellow-a3">
              <mat-icon svgIcon="circle-alert" class="size-4 text-yellow-a11" />
            </div>
          </div>
          <p class="mt-2 text-3xl font-extrabold tabular-nums text-yellow-a11">
            {{ stats()?.suspended ?? '—' }}
          </p>
          <p class="mt-1 text-xs text-neutral-a11">Suspended accounts</p>
        </mat-card>

        <mat-card class="p-5">
          <div class="flex items-start justify-between gap-1">
            <p class="text-[10px] font-bold uppercase leading-tight tracking-wide text-neutral-a11">
              Routers
            </p>
            <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-a3">
              <mat-icon svgIcon="network" class="size-4 text-accent-a11" />
            </div>
          </div>
          <p class="mt-2 text-3xl font-extrabold tabular-nums">
            <span class="text-accent-a11">{{ routersOnline() }}</span>
            <span class="text-base text-neutral-a11"> / {{ routers().length }}</span>
          </p>
          <p class="mt-1 text-xs text-neutral-a11">Connected NAS</p>
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

      <!-- Customer List with Tabs -->
      <mat-card>
        <!-- Search + filter bar -->
        <div class="flex flex-wrap items-center gap-3 border-b border-neutral-a4 p-4">
          <mat-form-field class="min-w-48 flex-1" subscriptSizing="dynamic">
            <mat-label>Search</mat-label>
            <mat-icon svgIcon="search" matPrefix />
            <input
              matInput
              [(ngModel)]="searchQuery"
              placeholder="Name, phone, account code…"
              (keyup.enter)="applyFilter()"
            />
          </mat-form-field>
          <!-- Status dropdown — shown on Pending, Active Recharge, and Expired tabs -->
          @if (activeTab !== 'offline') {
            <mat-form-field class="w-40" subscriptSizing="dynamic">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="statusFilter" (ngModelChange)="applyFilter()">
                <mat-option value="">All</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="inactive">Inactive</mat-option>
                <mat-option value="suspended">Suspended</mat-option>
              </mat-select>
            </mat-form-field>
          }
          <!-- Offline hours selector — only on Paid & Offline tab -->
          @if (activeTab === 'offline') {
            <mat-form-field class="w-44" subscriptSizing="dynamic">
              <mat-label>Offline since</mat-label>
              <mat-select [(ngModel)]="offlineHours" (ngModelChange)="applyFilter()">
                <mat-option [value]="6">6 hours</mat-option>
                <mat-option [value]="12">12 hours</mat-option>
                <mat-option [value]="24">24 hours</mat-option>
                <mat-option [value]="48">48 hours</mat-option>
              </mat-select>
            </mat-form-field>
          }
          @if (searchQuery || statusFilter) {
            <button matButton (click)="clearFilter()"><mat-icon svgIcon="x" /> Clear</button>
          }
        </div>

        <!-- Segmented tabs -->
        <mat-tab-group
          animationDuration="0ms"
          (selectedTabChange)="onTabChange($event)"
          class="border-b border-neutral-a4"
        >
          <!-- Pending Connection -->
          <mat-tab>
            <ng-template mat-tab-label>
              <span class="flex items-center gap-1.5">
                <mat-icon svgIcon="unplug" class="size-3.5" />
                Pending
                @if ((stats()?.notConnected ?? 0) > 0) {
                  <span
                    class="rounded-full bg-amber-a3 px-1.5 py-0.5 text-[10px] font-bold text-amber-a11"
                    >{{ stats()?.notConnected }}</span
                  >
                }
              </span>
            </ng-template>
          </mat-tab>
          <!-- Active Recharge -->
          <mat-tab>
            <ng-template mat-tab-label>
              <span class="flex items-center gap-1.5">
                <mat-icon svgIcon="circle-check" class="size-3.5" />
                Active Recharge
              </span>
            </ng-template>
          </mat-tab>
          <!-- Expired -->
          <mat-tab>
            <ng-template mat-tab-label>
              <span class="flex items-center gap-1.5">
                <mat-icon svgIcon="zap-off" class="size-3.5" />
                Expired
                @if ((stats()?.noActiveRecharge ?? 0) > 0) {
                  <span
                    class="rounded-full bg-amber-a3 px-1.5 py-0.5 text-[10px] font-bold text-amber-a11"
                    >{{ stats()?.noActiveRecharge }}</span
                  >
                }
              </span>
            </ng-template>
          </mat-tab>
          <!-- Paid & Offline -->
          <mat-tab>
            <ng-template mat-tab-label>
              <span class="flex items-center gap-1.5">
                <mat-icon svgIcon="wifi-off" class="size-3.5" />
                Paid &amp; Offline
              </span>
            </ng-template>
          </mat-tab>
        </mat-tab-group>

        <app-loading [loading]="loading()" />

        <!-- Customer rows — single clean layout -->
        <div class="divide-y divide-neutral-a4">
          @for (c of customers(); track c.id) {
            <a
              [routerLink]="['/admin/customers', c.id]"
              class="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-a2 sm:gap-4 sm:px-5"
              [class]="!c.connected ? 'border-l-2 border-amber-a8' : ''"
            >
              <!-- Avatar initial -->
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-a3 text-sm font-semibold text-primary-a11"
              >
                {{ (c.fullName || c.accountCode)?.charAt(0)?.toUpperCase() }}
              </div>

              <!-- Main info -->
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-sm">{{ c.fullName || '—' }}</p>
                <div
                  class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-a11"
                >
                  <span class="font-medium text-neutral-a12">{{ c.accountCode }}</span>
                  @if (c.email) {
                    <span class="break-all">{{ c.email }}</span>
                  }
                  @if (c.phoneNumber) {
                    <span>{{ c.phoneNumber }}</span>
                  }
                </div>

                <div class="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <app-status-badge [status]="c.status" />
                  @if (!c.connected) {
                    <span
                      class="inline-flex items-center gap-0.5 rounded-full bg-amber-a4 px-1.5 py-0.5 font-bold uppercase text-amber-a11"
                    >
                      <mat-icon svgIcon="unplug" class="size-2.5" />Pending
                    </span>
                  }
                  @if (!c.hasActiveRecharge) {
                    <span
                      class="inline-flex rounded-full bg-orange-a3 px-1.5 py-0.5 font-bold uppercase text-orange-a11"
                      >No Sub</span
                    >
                  }
                  <span
                    class="inline-flex rounded-full bg-neutral-a3 px-1.5 py-0.5 font-medium text-neutral-a11 capitalize"
                  >
                    {{ c.serviceType }}
                  </span>
                  <span
                    class="inline-flex rounded-full bg-neutral-a3 px-1.5 py-0.5 font-medium text-neutral-a11"
                  >
                    {{ c.accountType }}
                  </span>
                </div>
              </div>

              <!-- Status + actions -->
              <div class="ml-auto flex shrink-0 items-start">
                <button
                  matIconButton
                  class="text-neutral-a11!"
                  [matMenuTriggerFor]="rowMenu"
                  [matMenuTriggerData]="{ c: c }"
                  (click)="$event.preventDefault(); $event.stopPropagation()"
                >
                  <mat-icon svgIcon="ellipsis-vertical" />
                </button>
              </div>
            </a>
          }
          @if (customers().length === 0 && !loading()) {
            <div class="flex flex-col items-center py-16 text-center">
              <mat-icon svgIcon="users" class="size-10 text-neutral-a6" />
              <p class="mt-3 text-sm font-medium">No subscribers found</p>
              <p class="mt-1 text-xs text-neutral-a11">Try adjusting the search or switch tabs</p>
            </div>
          }
        </div>

        <mat-paginator
          class="px-3"
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[20, 50, 100]"
          (page)="onPage($event)"
          showFirstLastButtons
        />
      </mat-card>
    </div>

    <!-- Row context menu -->
    <mat-menu #rowMenu="matMenu">
      <ng-template matMenuContent let-c="c">
        <a mat-menu-item [routerLink]="['/admin/customers', c.id]"
          ><mat-icon svgIcon="eye" /> View profile</a
        >
        <a mat-menu-item [routerLink]="['/admin/customers', c.id, 'edit']"
          ><mat-icon svgIcon="pencil" /> Edit</a
        >
        <button mat-menu-item (click)="toggleStatus(c)">
          <mat-icon [svgIcon]="c.status === 'active' ? 'pause' : 'play'" />
          {{ c.status === 'active' ? 'Suspend' : 'Activate' }}
        </button>
        <button mat-menu-item (click)="toggleConnected(c)">
          <mat-icon [svgIcon]="c.connected ? 'unplug' : 'plug-zap'" />
          {{ c.connected ? 'Mark Disconnected' : 'Mark Connected' }}
        </button>
      </ng-template>
    </mat-menu>
  `,
})
export class TechnicianDashboardComponent implements OnInit {
  private readonly customerApi = inject(CustomerApiService);
  private readonly routerApi = inject(RouterApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly customers = signal<CustomerDto[]>([]);
  readonly routers = signal<RouterDto[]>([]);
  readonly totalElements = signal(0);
  readonly stats = signal<PppoeStatsDto | null>(null);
  readonly routersOnline = signal(0);

  private readonly testingRouters = signal<Set<string>>(new Set());
  readonly routerTestResults = signal<Map<string, 'success' | 'error'>>(new Map());

  activeTab: TabKey = 'pending';
  searchQuery = '';
  statusFilter = '';
  offlineHours = 24;
  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void {
    this.load();
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
    this.load();
    this.loadStats();
    this.loadRouters();
  }

  /** Map the active tab to API params. */
  private tabParams(): {
    status: string;
    connected?: boolean;
    hasActiveRecharge?: boolean;
    offlineHours: number;
  } {
    switch (this.activeTab) {
      case 'pending':
        // Not yet physically installed — regardless of subscription state
        return { status: this.statusFilter, connected: false, offlineHours: 0 };
      case 'subscribed':
        // Has a live recharge
        return { status: this.statusFilter, hasActiveRecharge: true, offlineHours: 0 };
      case 'expired':
        // No active recharge
        return { status: this.statusFilter, hasActiveRecharge: false, offlineHours: 0 };
      case 'offline':
        // Paid up but no RADIUS activity in the last N hours
        return { status: '', hasActiveRecharge: true, offlineHours: this.offlineHours };
    }
  }

  load(): void {
    this.loading.set(true);
    const { status, connected, hasActiveRecharge, offlineHours } = this.tabParams();
    this.customerApi
      .getPage(
        this.pageIndex,
        this.pageSize,
        'fullName',
        'asc',
        this.searchQuery,
        status ?? '',
        'pppoe',
        connected,
        hasActiveRecharge,
        offlineHours,
      )
      .subscribe({
        next: (page) => {
          this.customers.set(page.content);
          this.totalElements.set(page.page.totalElements);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
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

  onTabChange(e: MatTabChangeEvent): void {
    const tabs: TabKey[] = ['pending', 'subscribed', 'expired', 'offline'];
    this.activeTab = tabs[e.index] ?? 'pending';
    this.pageIndex = 0;
    this.statusFilter = '';
    this.load();
  }

  applyFilter(): void {
    this.pageIndex = 0;
    this.load();
  }

  clearFilter(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.applyFilter();
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  isRouterOnline(r: RouterDto): boolean {
    const s = r.status?.toLowerCase() ?? '';
    return s === 'online' || s === 'active';
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

  toggleStatus(c: CustomerDto): void {
    const newStatus = c.status === 'active' ? 'suspended' : 'active';
    this.customerApi.updateStatus(c.id, newStatus).subscribe({
      next: () => {
        c.status = newStatus;
        this.snackBar.open(`Customer ${newStatus}`, 'OK', { duration: 2500 });
        this.loadStats();
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 }),
    });
  }

  toggleConnected(c: CustomerDto): void {
    const newConnected = !c.connected;
    this.customerApi.markConnected(c.id, newConnected).subscribe({
      next: () => {
        c.connected = newConnected;
        this.snackBar.open(newConnected ? 'Marked as connected' : 'Marked as disconnected', 'OK', {
          duration: 2500,
        });
      },
      error: () =>
        this.snackBar.open('Failed to update connection status', 'Close', { duration: 3000 }),
    });
  }
}
