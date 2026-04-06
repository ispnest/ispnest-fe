import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { CustomerApiService } from '../../../core/api/customer-api.service';
import { RouterApiService } from '../../../core/api/router-api.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { LoadingComponent } from '../../../shared/components/loading.component';
import { RouterDto } from '../../../core/models/router.model';
import { CustomerDto } from '../../../core/models/customer.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatIconModule,
    MatButtonModule, MatTableModule, StatusBadgeComponent, LoadingComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Page header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-500 mt-1">ISP management overview</p>
      </div>

      <app-loading [loading]="loading()" />

      @if (!loading()) {
        <!-- Stats cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <mat-card class="p-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <mat-icon class="text-blue-600">people</mat-icon>
              </div>
              <div>
                <div class="text-2xl font-bold">{{ totalCustomers() }}</div>
                <div class="text-sm text-gray-500">Total Customers</div>
              </div>
            </div>
          </mat-card>

          <mat-card class="p-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <mat-icon class="text-green-600">check_circle</mat-icon>
              </div>
              <div>
                <div class="text-2xl font-bold">{{ activeCustomers() }}</div>
                <div class="text-sm text-gray-500">Active Customers</div>
              </div>
            </div>
          </mat-card>

          <mat-card class="p-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <mat-icon class="text-purple-600">router</mat-icon>
              </div>
              <div>
                <div class="text-2xl font-bold">{{ totalRouters() }}</div>
                <div class="text-sm text-gray-500">Total Routers</div>
              </div>
            </div>
          </mat-card>

          <mat-card class="p-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <mat-icon class="text-emerald-600">wifi</mat-icon>
              </div>
              <div>
                <div class="text-2xl font-bold">{{ onlineRouters() }}</div>
                <div class="text-sm text-gray-500">Online Routers</div>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Routers table -->
        <mat-card>
          <div class="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-semibold">Router Status</h2>
            <a mat-button routerLink="/admin/routers" color="primary">View All</a>
          </div>
          <mat-table [dataSource]="routers()" class="w-full">
            <ng-container matColumnDef="name">
              <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
              <mat-cell *matCellDef="let r">{{ r.name }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="ip">
              <mat-header-cell *matHeaderCellDef>IP Address</mat-header-cell>
              <mat-cell *matCellDef="let r">{{ r.ipAddress }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="status">
              <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
              <mat-cell *matCellDef="let r">
                <app-status-badge [status]="r.status" />
              </mat-cell>
            </ng-container>
            <ng-container matColumnDef="lastSeen">
              <mat-header-cell *matHeaderCellDef>Last Seen</mat-header-cell>
              <mat-cell *matCellDef="let r">{{ r.lastSeen | date:'short' }}</mat-cell>
            </ng-container>
            <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
          </mat-table>
        </mat-card>

        <!-- Quick actions -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a mat-stroked-button routerLink="/admin/customers/new" class="py-4 flex flex-col items-center gap-2 h-auto">
            <mat-icon>person_add</mat-icon>
            <span>New Customer</span>
          </a>
          <a mat-stroked-button routerLink="/admin/plans/new" class="py-4 flex flex-col items-center gap-2 h-auto">
            <mat-icon>add_circle</mat-icon>
            <span>New Plan</span>
          </a>
          <a mat-stroked-button routerLink="/admin/routers/new" class="py-4 flex flex-col items-center gap-2 h-auto">
            <mat-icon>router</mat-icon>
            <span>New Router</span>
          </a>
        </div>
      }
    </div>
  `
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

  readonly displayedColumns = ['name', 'ip', 'status', 'lastSeen'];

  ngOnInit(): void {
    let loaded = 0;
    const checkDone = () => { if (++loaded === 2) this.loading.set(false); };

    this.customerApi.getPage(0, 1).subscribe({
      next: (page) => {
        this.totalCustomers.set(page.totalElements);
        this.activeCustomers.set(page.content.filter((c: CustomerDto) => c.status === 'active').length);
        checkDone();
      },
      error: () => checkDone()
    });

    this.routerApi.getPage(0, 100).subscribe({
      next: (page) => {
        this.totalRouters.set(page.totalElements);
        this.onlineRouters.set(page.content.filter((r: RouterDto) => r.status === 'online').length);
        this.routers.set(page.content.slice(0, 10));
        checkDone();
      },
      error: () => checkDone()
    });
  }
}


