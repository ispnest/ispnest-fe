import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { CustomerApiService } from '../../../core/api/customer-api.service';
import { CustomerDto } from '../../../core/models/customer.model';
import { LoadingComponent } from '../../../shared/components/loading.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';

@Component({
  selector: 'app-hotspot-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule, MatCardModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, StatusBadgeComponent, LoadingComponent
  ],
  template: `
    <div class="space-y-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Hotspot Customers</h1>
        <p class="text-gray-500 text-sm mt-1">{{ dataSource.filteredData.length }} hotspot guests</p>
      </div>

      <mat-card>
        <div class="p-4 border-b border-gray-100">
          <mat-form-field appearance="outline" class="w-full max-w-sm">
            <mat-label>Search</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()" placeholder="Name, phone…">
          </mat-form-field>
        </div>
        <app-loading [loading]="loading()" />
        @if (!loading()) {
          <mat-table [dataSource]="dataSource" class="w-full">
            <ng-container matColumnDef="fullName">
              <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
              <mat-cell *matCellDef="let c">
                <a [routerLink]="['/admin/customers', c.id]" class="font-medium text-blue-600 hover:underline">
                  {{ c.fullName }}
                </a>
              </mat-cell>
            </ng-container>
            <ng-container matColumnDef="phone">
              <mat-header-cell *matHeaderCellDef>Phone</mat-header-cell>
              <mat-cell *matCellDef="let c">{{ c.phoneNumber }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="username">
              <mat-header-cell *matHeaderCellDef>Username</mat-header-cell>
              <mat-cell *matCellDef="let c" class="font-mono text-sm">{{ c.username }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="status">
              <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
              <mat-cell *matCellDef="let c"><app-status-badge [status]="c.status" /></mat-cell>
            </ng-container>
            <ng-container matColumnDef="createdAt">
              <mat-header-cell *matHeaderCellDef>Joined</mat-header-cell>
              <mat-cell *matCellDef="let c">{{ c.createdAt | date:'mediumDate' }}</mat-cell>
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
export class HotspotListComponent implements OnInit {
  private readonly customerApi = inject(CustomerApiService);
  readonly loading = signal(true);
  readonly dataSource = new MatTableDataSource<CustomerDto>([]);
  readonly cols = ['fullName', 'phone', 'username', 'status', 'createdAt'];
  searchQuery = '';

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) { this.dataSource.paginator = p; }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data, filter) =>
      data.fullName?.toLowerCase().includes(filter) ||
      data.phoneNumber?.includes(filter) ||
      data.username?.toLowerCase().includes(filter);
    this.customerApi.getPage(0, 200, 'fullName', 'asc').subscribe({
      next: page => {
        this.dataSource.data = page.content.filter((c: any) => c.serviceType === 'hotspot');
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchQuery.toLowerCase();
  }
}


