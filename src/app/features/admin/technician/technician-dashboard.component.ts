import { Component, signal, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CustomerApiService } from '../../../core/api/customer-api.service';
import { CustomerDto } from '../../../core/models/customer.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { LoadingComponent } from '../../../shared/components/loading.component';

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule, MatCardModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    StatusBadgeComponent, LoadingComponent
  ],
  template: `
    <div class="space-y-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Technician Dashboard</h1>
        <p class="text-gray-500 text-sm">PPPoE customer management</p>
      </div>

      <mat-card>
        <div class="p-4 border-b border-gray-100 flex gap-3 flex-wrap">
          <mat-form-field appearance="outline" class="flex-1 min-w-48">
            <mat-label>Search</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()" placeholder="Name, username…">
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-40">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="applyFilter()">
              <mat-option value="">All</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="inactive">Inactive</mat-option>
              <mat-option value="suspended">Suspended</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <app-loading [loading]="loading()" />
        @if (!loading()) {
          <mat-table [dataSource]="dataSource" class="w-full">
            <ng-container matColumnDef="fullName">
              <mat-header-cell *matHeaderCellDef>Customer</mat-header-cell>
              <mat-cell *matCellDef="let c">
                <a [routerLink]="['/admin/customers', c.id]" class="text-blue-600 hover:underline font-medium">{{ c.fullName }}</a>
              </mat-cell>
            </ng-container>
            <ng-container matColumnDef="pppoe">
              <mat-header-cell *matHeaderCellDef>PPPoE Username</mat-header-cell>
              <mat-cell *matCellDef="let c" class="font-mono text-sm">{{ c.pppoeUsername || '—' }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="phone">
              <mat-header-cell *matHeaderCellDef>Phone</mat-header-cell>
              <mat-cell *matCellDef="let c">{{ c.phoneNumber }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="status">
              <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
              <mat-cell *matCellDef="let c"><app-status-badge [status]="c.status" /></mat-cell>
            </ng-container>
            <ng-container matColumnDef="coordinates">
              <mat-header-cell *matHeaderCellDef>Location</mat-header-cell>
              <mat-cell *matCellDef="let c" class="text-xs text-gray-500">{{ c.coordinates || '—' }}</mat-cell>
            </ng-container>
            <mat-header-row *matHeaderRowDef="cols"></mat-header-row>
            <mat-row *matRowDef="let row; columns: cols;" class="hover:bg-gray-50 cursor-pointer"
                     [routerLink]="['/admin/customers', row.id]"></mat-row>
          </mat-table>
          <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
        }
      </mat-card>
    </div>
  `
})
export class TechnicianDashboardComponent implements OnInit {
  private readonly customerApi = inject(CustomerApiService);
  readonly loading = signal(true);
  readonly dataSource = new MatTableDataSource<CustomerDto>([]);
  readonly cols = ['fullName', 'pppoe', 'phone', 'status', 'coordinates'];
  searchQuery = '';
  statusFilter = '';

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) { this.dataSource.paginator = p; }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: CustomerDto, filter: string): boolean => {
      const f = JSON.parse(filter);
      const q = !f.q || !!(data.fullName?.toLowerCase().includes(f.q) || data.pppoeUsername?.toLowerCase().includes(f.q));
      const s = !f.status || data.status === f.status;
      return q && s;
    };
    this.customerApi.getPage(0, 200, 'fullName', 'asc').subscribe({
      next: page => {
        this.dataSource.data = page.content.filter((c: CustomerDto) => c.serviceType === 'pppoe');
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilter(): void {
    this.dataSource.filter = JSON.stringify({ q: this.searchQuery.toLowerCase(), status: this.statusFilter });
  }
}



