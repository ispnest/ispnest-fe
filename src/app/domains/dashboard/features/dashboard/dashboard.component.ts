import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { CustomerApiService } from '@/app/domains/customers/data';
import { RouterApiService } from '@/app/domains/network/data';
import { RouterDto } from '@/app/domains/network/data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink, DatePipe,
    MatCard, MatButton, MatIcon,
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
          <mat-card class="p-4">
            <div class="flex items-center gap-4">
              <div class="flex size-12 items-center justify-center rounded-xl bg-primary-a3">
                <mat-icon svgIcon="users" class="text-primary-a11" />
              </div>
              <div>
                <div class="text-2xl font-bold">{{ totalCustomers() }}</div>
                <div class="text-sm text-neutral-a11">Total Customers</div>
              </div>
            </div>
          </mat-card>

          <mat-card class="p-4">
            <div class="flex items-center gap-4">
              <div class="flex size-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                <mat-icon svgIcon="check-circle" class="text-green-700 dark:text-green-400" />
              </div>
              <div>
                <div class="text-2xl font-bold">{{ activeCustomers() }}</div>
                <div class="text-sm text-neutral-a11">Active Customers</div>
              </div>
            </div>
          </mat-card>

          <mat-card class="p-4">
            <div class="flex items-center gap-4">
              <div class="flex size-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <mat-icon svgIcon="network" class="text-purple-700 dark:text-purple-400" />
              </div>
              <div>
                <div class="text-2xl font-bold">{{ totalRouters() }}</div>
                <div class="text-sm text-neutral-a11">Total Routers</div>
              </div>
            </div>
          </mat-card>

          <mat-card class="p-4">
            <div class="flex items-center gap-4">
              <div class="flex size-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <mat-icon svgIcon="wifi" class="text-emerald-700 dark:text-emerald-400" />
              </div>
              <div>
                <div class="text-2xl font-bold">{{ onlineRouters() }}</div>
                <div class="text-sm text-neutral-a11">Online Routers</div>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Router status table -->
        <mat-card>
          <div class="flex items-center justify-between border-b p-4">
            <h2 class="text-lg font-semibold">Router Status</h2>
            <a matButton routerLink="/admin/routers">View All</a>
          </div>
          <mat-table [dataSource]="routers()">
            <ng-container matColumnDef="name">
              <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
              <mat-cell *matCellDef="let r">{{ r.name }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="ip">
              <mat-header-cell *matHeaderCellDef>IP Address</mat-header-cell>
              <mat-cell *matCellDef="let r" class="font-mono">{{ r.ipAddress }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="status">
              <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
              <mat-cell *matCellDef="let r"><app-status-badge [status]="r.status" /></mat-cell>
            </ng-container>
            <ng-container matColumnDef="lastSeen">
              <mat-header-cell *matHeaderCellDef>Last Seen</mat-header-cell>
              <mat-cell *matCellDef="let r">{{ r.lastSeen | date:'short' }}</mat-cell>
            </ng-container>
            <mat-header-row *matHeaderRowDef="routerCols" />
            <mat-row *matRowDef="let row; columns: routerCols;" />
          </mat-table>
        </mat-card>

        <!-- Quick actions -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <a matButton routerLink="/admin/customers/new"
             class="flex h-auto flex-col items-center gap-2 py-4">
            <mat-icon svgIcon="user-round-plus" />
            <span>New Customer</span>
          </a>
          <a matButton routerLink="/admin/plans/new"
             class="flex h-auto flex-col items-center gap-2 py-4">
            <mat-icon svgIcon="plus-circle" />
            <span>New Plan</span>
          </a>
          <a matButton routerLink="/admin/routers/new"
             class="flex h-auto flex-col items-center gap-2 py-4">
            <mat-icon svgIcon="network" />
            <span>New Router</span>
          </a>
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



