import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
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
    RouterLink, DatePipe,
    MatCard, MatCardHeader, MatCardContent, MatButton, MatIcon,
    MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef,
    StatusBadgeComponent, LoadingComponent,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p class="mt-1 text-sm text-neutral-a11">ISP management overview</p>
      </div>

      <app-loading [loading]="loading()" />

      @if (!loading()) {
        <!-- Stats cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-x-2">
                <mat-icon class="size-4 text-primary-a11" svgIcon="users" />
                <div class="font-medium tracking-tight">Total Customers</div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="text-4xl font-semibold tabular-nums">{{ totalCustomers() }}</div>
              <div class="mt-1 text-sm text-neutral-a11">All registered subscribers</div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-x-2">
                <mat-icon class="size-4 text-green-a11" svgIcon="circle-check" />
                <div class="font-medium tracking-tight">Active Customers</div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="text-4xl font-semibold tabular-nums">{{ activeCustomers() }}</div>
              <div class="mt-1 text-sm text-neutral-a11">Currently active accounts</div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-x-2">
                <mat-icon class="size-4 text-violet-a11" svgIcon="network" />
                <div class="font-medium tracking-tight">Total Routers</div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="text-4xl font-semibold tabular-nums">{{ totalRouters() }}</div>
              <div class="mt-1 text-sm text-neutral-a11">Registered NAS devices</div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-x-2">
                <mat-icon class="size-4 text-teal-a11" svgIcon="wifi" />
                <div class="font-medium tracking-tight">Online Routers</div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="text-4xl font-semibold tabular-nums">{{ onlineRouters() }}</div>
              <div class="mt-1 text-sm text-neutral-a11">Reachable right now</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Router status table -->
        <mat-card>
          <div class="flex items-center justify-between border-b px-4 py-3">
            <div class="font-semibold">Router Status</div>
            <a matButton class="tertiary" routerLink="/admin/routers">
              View All
              <mat-icon svgIcon="arrow-right" />
            </a>
          </div>
          <mat-table [dataSource]="routers()">
            <ng-container matColumnDef="name">
              <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
              <mat-cell *matCellDef="let r" class="font-medium">{{ r.name }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="ip">
              <mat-header-cell *matHeaderCellDef>IP Address</mat-header-cell>
              <mat-cell *matCellDef="let r" class="font-mono text-sm">{{ r.ipAddress }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="status">
              <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
              <mat-cell *matCellDef="let r"><app-status-badge [status]="r.status" /></mat-cell>
            </ng-container>
            <ng-container matColumnDef="lastSeen">
              <mat-header-cell *matHeaderCellDef>Last Seen</mat-header-cell>
              <mat-cell *matCellDef="let r" class="text-neutral-a11">{{ r.lastSeen | date:'short' }}</mat-cell>
            </ng-container>
            <mat-header-row *matHeaderRowDef="routerCols" />
            <mat-row *matRowDef="let _r; columns: routerCols;" />
          </mat-table>
        </mat-card>

        <!-- Quick actions -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <mat-card class="flex flex-col p-6">
            <div class="flex size-10 items-center justify-center rounded-xl bg-primary-a3">
              <mat-icon svgIcon="user-round-plus" class="text-primary-a11" />
            </div>
            <div class="mt-4 font-semibold">New Customer</div>
            <div class="mt-1 text-sm text-neutral-a11">Register a new subscriber</div>
            <div class="flex-auto"></div>
            <a class="primary mt-4" matButton routerLink="/admin/customers/new">
              <mat-icon svgIcon="user-round-plus" />
              Add Customer
            </a>
          </mat-card>
          <mat-card class="flex flex-col p-6">
            <div class="flex size-10 items-center justify-center rounded-xl bg-violet-a3">
              <mat-icon svgIcon="layers" class="text-violet-a11" />
            </div>
            <div class="mt-4 font-semibold">New Plan</div>
            <div class="mt-1 text-sm text-neutral-a11">Create a service plan</div>
            <div class="flex-auto"></div>
            <a class="primary mt-4" matButton routerLink="/admin/plans/new">
              <mat-icon svgIcon="plus" />
              Add Plan
            </a>
          </mat-card>
          <mat-card class="flex flex-col p-6">
            <div class="flex size-10 items-center justify-center rounded-xl bg-teal-a3">
              <mat-icon svgIcon="network" class="text-teal-a11" />
            </div>
            <div class="mt-4 font-semibold">New Router</div>
            <div class="mt-1 text-sm text-neutral-a11">Register a NAS device</div>
            <div class="flex-auto"></div>
            <a class="primary mt-4" matButton routerLink="/admin/routers/new">
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
    const checkDone = () => { if (++loaded === 2) this.loading.set(false); };

    this.customerApi.getPage(0, 1).subscribe({
      next: page => {
        this.totalCustomers.set(page.totalElements);
        this.activeCustomers.set(page.content.filter(c => c.status === 'active').length);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.routerApi.getPage(0, 100).subscribe({
      next: page => {
        this.totalRouters.set(page.totalElements);
        this.onlineRouters.set(page.content.filter(r => r.status === 'online').length);
        this.routers.set(page.content.slice(0, 10));
        checkDone();
      },
      error: () => checkDone(),
    });
  }
}



