import { Clipboard } from '@angular/cdk/clipboard';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
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
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CustomerApiService } from '@/app/domains/customers/data';
import { CustomerDto } from '@/app/domains/customers/data/customer.model';
import { RouterApiService } from '@/app/domains/network/data';
import { RouterDto } from '@/app/domains/network/data/network.model';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    DatePipe, DecimalPipe, NgClass, FormsModule, RouterLink,
    MatCard, MatButton, MatIconButton, MatIcon, MatChip,
    MatFormField, MatLabel, MatInput, MatSelect, MatOption,
    MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef,
    MatPaginator, MatTooltip, MatProgressSpinner,
    MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger,
    LoadingComponent, StatusBadgeComponent,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8">

      <!-- ─── Header ──────────────────────────────────────────────── -->
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Technician Dashboard</h1>
          <p class="text-sm text-neutral-a11">PPPoE subscriber credentials and router status at a glance</p>
        </div>
        <button matButton (click)="refresh()" matTooltip="Refresh all data">
          <mat-icon svgIcon="refresh-cw" />
          Refresh
        </button>
      </div>

      <!-- ─── KPI Cards ─────────────────────────────────────────── -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">

        <mat-card class="p-5">
          <div class="flex items-start justify-between">
            <p class="text-xs font-bold uppercase tracking-widest text-neutral-a11">Total PPPoE</p>
            <div class="flex size-8 items-center justify-center rounded-lg bg-neutral-a3">
              <mat-icon svgIcon="users" class="size-4 text-neutral-a11" />
            </div>
          </div>
          <p class="mt-2 text-3xl font-extrabold tabular-nums">{{ totalElements() }}</p>
          <p class="mt-1 text-xs text-neutral-a11">All subscribers</p>
        </mat-card>

        <mat-card class="p-5">
          <div class="flex items-start justify-between">
            <p class="text-xs font-bold uppercase tracking-widest text-neutral-a11">Active</p>
            <div class="flex size-8 items-center justify-center rounded-lg bg-green-a3">
              <mat-icon svgIcon="circle-check" class="size-4 text-green-a11" />
            </div>
          </div>
          <p class="mt-2 text-3xl font-extrabold tabular-nums text-green-a11">{{ activeCount() }}</p>
          <p class="mt-1 text-xs text-neutral-a11">Currently active</p>
        </mat-card>

        <mat-card class="p-5">
          <div class="flex items-start justify-between">
            <p class="text-xs font-bold uppercase tracking-widest text-neutral-a11">Suspended</p>
            <div class="flex size-8 items-center justify-center rounded-lg bg-yellow-a3">
              <mat-icon svgIcon="circle-alert" class="size-4 text-yellow-a11" />
            </div>
          </div>
          <p class="mt-2 text-3xl font-extrabold tabular-nums text-yellow-a11">{{ suspendedCount() }}</p>
          <p class="mt-1 text-xs text-neutral-a11">Suspended accounts</p>
        </mat-card>

        <mat-card class="p-5">
          <div class="flex items-start justify-between">
            <p class="text-xs font-bold uppercase tracking-widest text-neutral-a11">Terminated</p>
            <div class="flex size-8 items-center justify-center rounded-lg bg-red-a3">
              <mat-icon svgIcon="circle-x" class="size-4 text-red-a11" />
            </div>
          </div>
          <p class="mt-2 text-3xl font-extrabold tabular-nums text-red-a11">{{ terminatedCount() }}</p>
          <p class="mt-1 text-xs text-neutral-a11">Terminated accounts</p>
        </mat-card>

        <mat-card class="p-5">
          <div class="flex items-start justify-between">
            <p class="text-xs font-bold uppercase tracking-widest text-neutral-a11">Routers Online</p>
            <div class="flex size-8 items-center justify-center rounded-lg bg-accent-a3">
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

      <!-- ─── Router Status Panel ───────────────────────────────── -->
      @if (routers().length > 0) {
        <mat-card>
          <div class="flex items-center justify-between border-b border-neutral-a6 px-5 py-4">
            <p class="text-sm font-bold">Router / NAS Status</p>
            <a matButton routerLink="/admin/routers" class="text-xs">
              <mat-icon svgIcon="arrow-right" />
              Manage
            </a>
          </div>
          <div class="divide-y divide-neutral-a4">
            @for (r of routers(); track r.id) {
              <div class="flex flex-wrap items-center gap-3 px-5 py-3 sm:flex-nowrap">

                <!-- Status indicator -->
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg"
                     [ngClass]="isRouterOnline(r) ? 'bg-green-a3' : 'bg-red-a3'">
                  <mat-icon svgIcon="network" class="size-4"
                            [ngClass]="isRouterOnline(r) ? 'text-green-a11' : 'text-red-a11'" />
                </div>

                <!-- Name + IP -->
                <div class="flex-1 min-w-0">
                  <p class="truncate font-medium text-sm">{{ r.name }}</p>
                  <div class="flex items-center gap-2">
                    <p class="font-mono text-xs text-neutral-a11">{{ r.ipAddress }}</p>
                    <button matIconButton class="size-5 text-neutral-a9!"
                            matTooltip="Copy IP address"
                            (click)="copy(r.ipAddress, 'IP address copied')">
                      <mat-icon svgIcon="copy" class="size-4" />
                    </button>
                  </div>
                </div>

                <!-- NAS type badge -->
                <mat-chip class="shrink-0 text-xs! uppercase">{{ r.nasType }}</mat-chip>

                <!-- Status badge + last seen -->
                <div class="flex items-center gap-3">
                  <app-status-badge [status]="r.status" />
                  @if (r.lastSeen) {
                    <span class="hidden text-xs text-neutral-a9 sm:block">
                      {{ r.lastSeen | date:'d MMM, HH:mm' }}
                    </span>
                  }
                </div>

                <!-- Test connection -->
                <button matButton
                        [disabled]="isTestingRouter(r.id)"
                        (click)="testConnection(r)"
                        matTooltip="Test RADIUS connection">
                  @if (isTestingRouter(r.id)) {
                    <mat-progress-spinner diameter="14" mode="indeterminate" />
                  } @else {
                    <mat-icon svgIcon="plug-zap" />
                  }
                  Test
                </button>

                <!-- Test result badge -->
                @if (routerTestResults().get(r.id) === 'success') {
                  <span class="flex items-center gap-1 rounded-full bg-green-a3 px-2 py-0.5 text-xs font-medium text-green-a11">
                    <mat-icon svgIcon="check" class="size-3" /> OK
                  </span>
                }
                @if (routerTestResults().get(r.id) === 'error') {
                  <span class="flex items-center gap-1 rounded-full bg-red-a3 px-2 py-0.5 text-xs font-medium text-red-a11">
                    <mat-icon svgIcon="x" class="size-3" /> Failed
                  </span>
                }

              </div>
            }
          </div>
        </mat-card>
      }

      <!-- ─── PPPoE Credentials Table ───────────────────────────── -->
      <mat-card>

        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-3 border-b border-neutral-a4 p-4">
          <mat-form-field class="min-w-48 flex-1" subscriptSizing="dynamic">
            <mat-label>Search</mat-label>
            <mat-icon svgIcon="search" matPrefix />
            <input matInput [(ngModel)]="searchQuery" placeholder="Name, phone, PPPoE username…"
                   (keyup.enter)="applyFilter()" />
          </mat-form-field>
          <mat-form-field class="w-44" subscriptSizing="dynamic">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="applyFilter()">
              <mat-option value="">All Status</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="suspended">Suspended</mat-option>
              <mat-option value="terminated">Terminated</mat-option>
            </mat-select>
          </mat-form-field>
          @if (searchQuery || statusFilter) {
            <button matButton (click)="clearFilter()">
              <mat-icon svgIcon="x" />
              Clear
            </button>
          }
        </div>

        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-auto overflow-y-hidden">
            <table
              class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="customers()"
            >

              <!-- ── Customer ────────────────────────────── -->
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let c">
                  <div>
                    <a class="font-medium text-primary-a11 hover:underline"
                       [routerLink]="['/admin/customers', c.id]">
                      {{ c.fullName || '—' }}
                    </a>
                    <p class="text-xs text-neutral-a11">{{ c.phoneNumber }}</p>
                  </div>
                </td>
              </ng-container>

              <!-- ── PPPoE Username ──────────────────────── -->
              <ng-container matColumnDef="pppoeUsername">
                <th mat-header-cell *matHeaderCellDef>PPPoE Username</th>
                <td mat-cell *matCellDef="let c">
                  @if (c.pppoeUsername) {
                    <div class="flex items-center gap-1">
                      <span class="font-mono text-sm">{{ c.pppoeUsername }}</span>
                      <button matIconButton
                              class="size-7 text-neutral-a11!"
                              matTooltip="Copy username"
                              (click)="$event.stopPropagation(); copy(c.pppoeUsername, 'Username copied')">
                        <mat-icon svgIcon="copy" class="size-4" />
                      </button>
                    </div>
                  } @else {
                    <span class="text-xs italic text-neutral-a9">Not set</span>
                  }
                </td>
              </ng-container>

              <!-- ── PPPoE Password ──────────────────────── -->
              <ng-container matColumnDef="pppoePassword">
                <th mat-header-cell *matHeaderCellDef>Password</th>
                <td mat-cell *matCellDef="let c">
                  @if (c.pppoePassword) {
                    <div class="flex items-center gap-1">
                      <span class="font-mono text-sm">
                        {{ isPasswordVisible(c.id) ? c.pppoePassword : '••••••••' }}
                      </span>
                      <button matIconButton
                              class="size-7 text-neutral-a11!"
                              [matTooltip]="isPasswordVisible(c.id) ? 'Hide' : 'Reveal'"
                              (click)="$event.stopPropagation(); togglePassword(c.id)">
                        <mat-icon [svgIcon]="isPasswordVisible(c.id) ? 'eye-off' : 'eye'" class="size-4" />
                      </button>
                      <button matIconButton
                              class="size-7 text-neutral-a11!"
                              matTooltip="Copy password"
                              (click)="$event.stopPropagation(); copy(c.pppoePassword, 'Password copied')">
                        <mat-icon svgIcon="copy" class="size-4" />
                      </button>
                    </div>
                  } @else {
                    <span class="text-xs italic text-neutral-a9">Not set</span>
                  }
                </td>
              </ng-container>

              <!-- ── Status ──────────────────────────────── -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let c"><app-status-badge [status]="c.status" /></td>
              </ng-container>

              <!-- ── Balance ─────────────────────────────── -->
              <ng-container matColumnDef="balance">
                <th mat-header-cell *matHeaderCellDef>Balance</th>
                <td mat-cell *matCellDef="let c">
                  <span class="text-sm tabular-nums"
                        [ngClass]="c.balance < 0 ? 'text-red-a11' : c.balance === 0 ? 'text-neutral-a11' : 'text-green-a11'">
                    KES {{ c.balance | number:'1.0-0' }}
                  </span>
                </td>
              </ng-container>

              <!-- ── Registered ──────────────────────────── -->
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Registered</th>
                <td mat-cell *matCellDef="let c" class="text-xs text-neutral-a11">
                  {{ c.createdAt | date:'mediumDate' }}
                </td>
              </ng-container>

              <!-- ── Actions ────────────────────────────── -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let c" (click)="$event.stopPropagation()">
                  <div class="flex items-center">
                    <!-- Copy combined credentials -->
                    @if (c.pppoeUsername && c.pppoePassword) {
                      <button matIconButton
                              class="text-neutral-a11!"
                              matTooltip="Copy username:password"
                              (click)="copyCredentials(c)">
                        <mat-icon svgIcon="clipboard-copy" />
                      </button>
                    }
                    <!-- WhatsApp share -->
                    @if (c.phoneNumber && c.pppoeUsername) {
                      <a matIconButton
                         class="text-neutral-a11!"
                         matTooltip="Share credentials on WhatsApp"
                         [href]="whatsappLink(c)"
                         target="_blank"
                         rel="noopener">
                        <mat-icon svgIcon="message-circle" />
                      </a>
                    }
                    <!-- More actions menu -->
                    <button matIconButton [matMenuTriggerFor]="rowMenu"
                            [matMenuTriggerData]="{ c: c }">
                      <mat-icon svgIcon="ellipsis-vertical" />
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr class="group relative cursor-pointer hover:bg-neutral-a2"
                  mat-row
                  *matRowDef="let row; columns: cols;"
                  [routerLink]="['/admin/customers', row.id]"></tr>
            </table>
          </div>

          @if (customers().length === 0 && !loading()) {
            <div class="flex flex-col items-center py-16 text-center">
              <div class="flex size-16 items-center justify-center rounded-full bg-neutral-a3">
                <mat-icon svgIcon="users" class="size-8 text-neutral-a9" />
              </div>
              <p class="mt-4 text-sm font-medium">No PPPoE subscribers found</p>
              <p class="mt-1 text-xs text-neutral-a11">Try adjusting the search or status filter</p>
              @if (searchQuery || statusFilter) {
                <button matButton class="mt-4" (click)="clearFilter()">Clear filters</button>
              }
            </div>
          }

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

    <!-- Row context menu -->
    <mat-menu #rowMenu="matMenu">
      <ng-template matMenuContent let-c="c">
        <a mat-menu-item [routerLink]="['/admin/customers', c.id]">
          <mat-icon svgIcon="eye" />
          View profile
        </a>
        <a mat-menu-item [routerLink]="['/admin/customers', c.id, 'edit']">
          <mat-icon svgIcon="pencil" />
          Edit
        </a>
        <button mat-menu-item (click)="toggleStatus(c)">
          <mat-icon [svgIcon]="c.status === 'active' ? 'pause' : 'play'" />
          {{ c.status === 'active' ? 'Suspend' : 'Activate' }}
        </button>
        @if (c.pppoeUsername && c.pppoePassword) {
          <button mat-menu-item (click)="copyCredentials(c)">
            <mat-icon svgIcon="clipboard-copy" />
            Copy username:password
          </button>
        }
        @if (c.phoneNumber && c.pppoeUsername) {
          <a mat-menu-item [href]="whatsappLink(c)" target="_blank" rel="noopener">
            <mat-icon svgIcon="message-circle" />
            Share via WhatsApp
          </a>
        }
      </ng-template>
    </mat-menu>
  `,
})
export class TechnicianDashboardComponent implements OnInit {
  private readonly customerApi = inject(CustomerApiService);
  private readonly routerApi = inject(RouterApiService);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly customers = signal<CustomerDto[]>([]);
  readonly routers = signal<RouterDto[]>([]);
  readonly totalElements = signal(0);
  readonly activeCount = signal(0);
  readonly suspendedCount = signal(0);
  readonly terminatedCount = signal(0);
  readonly routersOnline = signal(0);

  /** IDs of routers currently being tested */
  private readonly testingRouters = signal<Set<string>>(new Set());
  /** Test results: router id → 'success' | 'error' */
  readonly routerTestResults = signal<Map<string, 'success' | 'error'>>(new Map());

  /** Customer IDs whose password is currently revealed */
  private readonly visiblePasswords = signal<Set<string>>(new Set());

  readonly cols = ['customer', 'pppoeUsername', 'pppoePassword', 'status', 'balance', 'createdAt', 'actions'];

  searchQuery = '';
  statusFilter = '';
  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void {
    this.load();
    this.loadStats();
    this.loadRouters();
  }

  refresh(): void {
    this.load();
    this.loadStats();
    this.loadRouters();
  }

  load(): void {
    this.loading.set(true);
    this.customerApi
      .getPage(this.pageIndex, this.pageSize, 'fullName', 'asc', this.searchQuery, this.statusFilter, 'pppoe')
      .subscribe({
        next: page => {
          this.customers.set(page.content);
          this.totalElements.set(page.page.totalElements);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  loadStats(): void {
    forkJoin({
      active:     this.customerApi.getPage(0, 1, 'fullName', 'asc', '', 'active',     'pppoe'),
      suspended:  this.customerApi.getPage(0, 1, 'fullName', 'asc', '', 'suspended',  'pppoe'),
      terminated: this.customerApi.getPage(0, 1, 'fullName', 'asc', '', 'terminated', 'pppoe'),
    }).subscribe(({ active, suspended, terminated }) => {
      this.activeCount.set(active.page.totalElements);
      this.suspendedCount.set(suspended.page.totalElements);
      this.terminatedCount.set(terminated.page.totalElements);
    });
  }

  loadRouters(): void {
    this.routerApi.getAll().subscribe(routers => {
      this.routers.set(routers);
      this.routersOnline.set(routers.filter(r => this.isRouterOnline(r)).length);
    });
  }

  isRouterOnline(r: RouterDto): boolean {
    const s = r.status?.toLowerCase() ?? '';
    return s === 'online' || s === 'active';
  }

  isTestingRouter(id: string): boolean {
    return this.testingRouters().has(id);
  }

  testConnection(r: RouterDto): void {
    this.testingRouters.update(s => { const n = new Set(s); n.add(r.id); return n; });
    // Clear previous result
    this.routerTestResults.update(m => { const n = new Map(m); n.delete(r.id); return n; });

    this.routerApi.testConnection(r.id).subscribe({
      next: () => {
        this.testingRouters.update(s => { const n = new Set(s); n.delete(r.id); return n; });
        this.routerTestResults.update(m => { const n = new Map(m); n.set(r.id, 'success'); return n; });
        this.snackBar.open(`${r.name}: connection successful`, undefined, { duration: 3000 });
      },
      error: () => {
        this.testingRouters.update(s => { const n = new Set(s); n.delete(r.id); return n; });
        this.routerTestResults.update(m => { const n = new Map(m); n.set(r.id, 'error'); return n; });
        this.snackBar.open(`${r.name}: connection failed`, 'Close', { duration: 4000 });
      },
    });
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

  copy(text: string | null | undefined, label: string): void {
    if (!text) return;
    this.clipboard.copy(text);
    this.snackBar.open(label, undefined, { duration: 1800 });
  }

  copyCredentials(c: CustomerDto): void {
    if (!c.pppoeUsername || !c.pppoePassword) return;
    this.clipboard.copy(`${c.pppoeUsername}:${c.pppoePassword}`);
    this.snackBar.open('Credentials copied (username:password)', undefined, { duration: 2000 });
  }

  whatsappLink(c: CustomerDto): string {
    const phone = c.phoneNumber?.replace(/\D/g, '') ?? '';
    const msg = encodeURIComponent(
      `Hello ${c.fullName || ''},\n\nYour PPPoE credentials:\nUsername: ${c.pppoeUsername}\nPassword: ${c.pppoePassword}\n\nFor support, contact us.`,
    );
    return `https://wa.me/${phone}?text=${msg}`;
  }

  togglePassword(id: string): void {
    this.visiblePasswords.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isPasswordVisible(id: string): boolean {
    return this.visiblePasswords().has(id);
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
}
