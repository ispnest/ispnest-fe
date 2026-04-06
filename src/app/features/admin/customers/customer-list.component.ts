import { Component, signal, inject, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CustomerApiService } from '../../../core/api/customer-api.service';
import { CustomerDto } from '../../../core/models/customer.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { LoadingComponent } from '../../../shared/components/loading.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule, MatTableModule, MatPaginatorModule,
    MatSortModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatMenuModule,
    StatusBadgeComponent, LoadingComponent
  ],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Customers</h1>
          <p class="text-gray-500 text-sm">{{ totalElements() }} customers</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/admin/customers/new">
          <mat-icon>person_add</mat-icon> New Customer
        </a>
      </div>

      <mat-card>
        <!-- Filters -->
        <div class="p-4 flex gap-3 flex-wrap border-b border-gray-100">
          <mat-form-field appearance="outline" class="flex-1 min-w-48">
            <mat-label>Search</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [(ngModel)]="searchQuery" (keyup.enter)="resetAndLoad()" placeholder="Name, email, phone…">
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-40">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="inactive">Inactive</mat-option>
              <mat-option value="suspended">Suspended</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-40">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="typeFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="pppoe">PPPoE</mat-option>
              <mat-option value="hotspot">Hotspot</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <app-loading [loading]="loading()" />

        <mat-table [dataSource]="customers()" matSort (matSortChange)="onSort($event)" class="w-full">
          <ng-container matColumnDef="fullName">
            <mat-header-cell *matHeaderCellDef mat-sort-header>Name</mat-header-cell>
            <mat-cell *matCellDef="let c">
              <a [routerLink]="['/admin/customers', c.id]" class="font-medium text-blue-600 hover:underline">
                {{ c.fullName }}
              </a>
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="email">
            <mat-header-cell *matHeaderCellDef mat-sort-header>Email</mat-header-cell>
            <mat-cell *matCellDef="let c">{{ c.email }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="phoneNumber">
            <mat-header-cell *matHeaderCellDef>Phone</mat-header-cell>
            <mat-cell *matCellDef="let c">{{ c.phoneNumber }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="serviceType">
            <mat-header-cell *matHeaderCellDef mat-sort-header>Type</mat-header-cell>
            <mat-cell *matCellDef="let c" class="capitalize">{{ c.serviceType }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef mat-sort-header>Status</mat-header-cell>
            <mat-cell *matCellDef="let c">
              <app-status-badge [status]="c.status" />
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="createdAt">
            <mat-header-cell *matHeaderCellDef mat-sort-header>Created</mat-header-cell>
            <mat-cell *matCellDef="let c">{{ c.createdAt | date:'mediumDate' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
            <mat-cell *matCellDef="let c">
              <button mat-icon-button [matMenuTriggerFor]="actionMenu" [matMenuTriggerData]="{customer: c}">
                <mat-icon>more_vert</mat-icon>
              </button>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: displayedColumns;"
                   class="hover:bg-gray-50 cursor-pointer"
                   [routerLink]="['/admin/customers', row.id]"></mat-row>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell p-8 text-center text-gray-400" [attr.colspan]="displayedColumns.length">
              No customers found
            </td>
          </tr>
        </mat-table>

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>

    <mat-menu #actionMenu="matMenu">
      <ng-template matMenuContent let-customer="customer">
        <a mat-menu-item [routerLink]="['/admin/customers', customer.id]">
          <mat-icon>visibility</mat-icon> View
        </a>
        <a mat-menu-item [routerLink]="['/admin/customers', customer.id, 'edit']">
          <mat-icon>edit</mat-icon> Edit
        </a>
        <button mat-menu-item (click)="toggleStatus(customer)">
          <mat-icon>{{ customer.status === 'active' ? 'pause' : 'play_arrow' }}</mat-icon>
          {{ customer.status === 'active' ? 'Suspend' : 'Activate' }}
        </button>
        <button mat-menu-item (click)="deleteCustomer(customer)" class="text-red-600">
          <mat-icon>delete</mat-icon> Delete
        </button>
      </ng-template>
    </mat-menu>
  `
})
export class CustomerListComponent implements OnInit {
  private readonly customerApi = inject(CustomerApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly customers = signal<CustomerDto[]>([]);
  readonly totalElements = signal(0);

  searchQuery = '';
  statusFilter = '';
  typeFilter = '';
  pageIndex = 0;
  pageSize = 20;
  sortField = 'fullName';
  sortDir = 'asc';

  readonly displayedColumns = ['fullName', 'email', 'phoneNumber', 'serviceType', 'status', 'createdAt', 'actions'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.customerApi.getPage(this.pageIndex, this.pageSize, this.sortField, this.sortDir).subscribe({
      next: page => {
        this.customers.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  resetAndLoad(): void {
    this.pageIndex = 0;
    this.load();
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  onSort(sort: Sort): void {
    this.sortField = sort.active || 'fullName';
    this.sortDir = sort.direction || 'asc';
    this.pageIndex = 0;
    this.load();
  }

  toggleStatus(customer: CustomerDto): void {
    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    this.customerApi.updateStatus(customer.id, newStatus).subscribe({
      next: () => {
        customer.status = newStatus;
        this.snackBar.open(`Customer ${newStatus}`, 'OK', { duration: 3000 });
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 })
    });
  }

  deleteCustomer(customer: CustomerDto): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Customer',
        message: `Are you sure you want to delete "${customer.fullName}"?`,
        confirmText: 'Delete',
        danger: true
      }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.customerApi.delete(customer.id).subscribe({
        next: () => {
          this.customers.update(list => list.filter(c => c.id !== customer.id));
          this.totalElements.update(n => n - 1);
          this.snackBar.open('Customer deleted', 'OK', { duration: 3000 });
        },
        error: () => this.snackBar.open('Failed to delete customer', 'Close', { duration: 3000 })
      });
    });
  }
}

