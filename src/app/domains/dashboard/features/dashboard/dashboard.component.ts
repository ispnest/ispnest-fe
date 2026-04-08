import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
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
import { CustomerApiService } from '@/app/domains/customers/data';
import { RouterApiService } from '@/app/domains/network/data';
import { RouterDto } from '@/app/domains/network/data';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatButton,
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
      <!-- Page header -->
      <div>
        <h1 class="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p class="mt-1 text-neutral-a11">ISP management overview</p>
      </div>

      <app-loading [loading]="loading()" />

      @if (!loading()) {
        <!-- Stats cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-x-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-a3"
                >
                  <mat-icon class="size-4 text-primary-a11" svgIcon="users" />
                </div>
                <div class="text-sm font-medium text-neutral-a11">Total Customers</div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
                {{ totalCustomers() }}
              </div>
              <div class="mt-1 text-sm text-neutral-a11">All registered subscribers</div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-x-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-a3"
                >
                  <mat-icon class="size-4 text-green-a11" svgIcon="circle-check" />
                </div>
                <div class="text-sm font-medium text-neutral-a11">Active Customers</div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
                {{ activeCustomers() }}
              </div>
              <div class="mt-1 text-sm text-neutral-a11">Currently active accounts</div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-x-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-a3"
                >
                  <mat-icon class="size-4 text-violet-a11" svgIcon="network" />
                </div>
                <div class="text-sm font-medium text-neutral-a11">Total Routers</div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
                {{ totalRouters() }}
              </div>
              <div class="mt-1 text-sm text-neutral-a11">Registered NAS devices</div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-x-2">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-a3">
                  <mat-icon class="size-4 text-teal-a11" svgIcon="wifi" />
                </div>
                <div class="text-sm font-medium text-neutral-a11">Online Routers</div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
                {{ onlineRouters() }}
              </div>
              <div class="mt-1 text-sm text-neutral-a11">Reachable right now</div>
            </mat-card-content>
          </mat-card>
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
                [dataSource]="routers()"
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

  readonly loading = signal(true);
  readonly totalCustomers = signal(0);
  readonly activeCustomers = signal(0);
  readonly totalRouters = signal(0);
  readonly onlineRouters = signal(0);
  readonly routers = signal<RouterDto[]>([]);

  readonly routerCols = ['name', 'ip', 'status', 'lastSeen'];

  ngOnInit(): void {
    let loaded = 0;
    const checkDone = () => {
      if (++loaded === 3) this.loading.set(false);
    };

    // Total customers
    this.customerApi.getPage(0, 1).subscribe({
      next: (page) => {
        this.totalCustomers.set(page.page.totalElements);
        checkDone();
      },
      error: () => checkDone(),
    });

    // Active customers count (use status filter)
    this.customerApi.getPage(0, 1, 'fullName', 'asc', '', 'active').subscribe({
      next: (page) => {
        this.activeCustomers.set(page.page.totalElements);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.routerApi.getPage(0, 100).subscribe({
      next: (page) => {
        this.totalRouters.set(page.page.totalElements);
        this.onlineRouters.set(page.content.filter((r) => r.status === 'online').length);
        this.routers.set(page.content.slice(0, 10));
        checkDone();
      },
      error: () => checkDone(),
    });
  }
}
