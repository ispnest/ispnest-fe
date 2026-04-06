import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatNoDataRow, MatRow, MatRowDef, MatTable,
} from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { CustomerApiService } from '@/app/domains/customers/data';
import { CustomerDto } from '../../data/customer.model';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    RouterLink, FormsModule, DatePipe,
    MatCard, MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
    MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderRowDef, MatRowDef,
    MatNoDataRow, MatSort, MatSortHeader, MatPaginator,
    MatFormField, MatLabel, MatInput, MatSelect, MatOption,
    MatButton, MatIconButton, MatIcon, MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger,
    StatusBadgeComponent, LoadingComponent,
  ],
  template: `
    <div class="space-y-4">
      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Customers</h1>
          <p class="text-sm text-neutral-a11">{{ totalElements() }} total customers</p>
        </div>
        <a class="primary" matButton routerLink="/admin/customers/new">
          <mat-icon svgIcon="user-round-plus" />
          New Customer
        </a>
      </div>

      <mat-card>
        <!-- Filters -->
        <div class="flex flex-wrap gap-3 border-b p-4">
          <mat-form-field class="min-w-48 flex-1">
            <mat-label>Search</mat-label>
            <mat-icon svgIcon="search" matPrefix />
            <input matInput [(ngModel)]="searchQuery" (keyup.enter)="resetAndLoad()"
                   placeholder="Name, email, phone…" />
          </mat-form-field>
          <mat-form-field class="w-40">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="inactive">Inactive</mat-option>
              <mat-option value="suspended">Suspended</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field class="w-40">
            <mat-label>Service Type</mat-label>
            <mat-select [(ngModel)]="typeFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="pppoe">PPPoE</mat-option>
              <mat-option value="hotspot">Hotspot</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <app-loading [loading]="loading()" />

        <mat-table [dataSource]="customers()" matSort (matSortChange)="onSort($event)">
          <ng-container matColumnDef="fullName">
            <mat-header-cell *matHeaderCellDef mat-sort-header>Name</mat-header-cell>
            <mat-cell *matCellDef="let c">
              <a [routerLink]="['/admin/customers', c.id]"
                 class="font-medium text-primary-a11 hover:underline">
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
            <mat-header-cell *matHeaderCellDef></mat-header-cell>
            <mat-cell *matCellDef="let c">
              <button matIconButton [matMenuTriggerFor]="actionMenu"
                      [matMenuTriggerData]="{ customer: c }"
                      (click)="$event.stopPropagation()">
                <mat-icon svgIcon="ellipsis-vertical" />
              </button>
            </mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="displayedColumns" />
          <mat-row *matRowDef="let row; columns: displayedColumns;"
                   class="cursor-pointer"
                   [routerLink]="['/admin/customers', row.id]" />
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell p-8 text-center text-neutral-a9" [attr.colspan]="displayedColumns.length">
              No customers found
            </td>
          </tr>
        </mat-table>

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)"
          showFirstLastButtons />
      </mat-card>
    </div>

    <mat-menu #actionMenu="matMenu">
      <ng-template matMenuContent let-customer="customer">
        <a mat-menu-item [routerLink]="['/admin/customers', customer.id]">
          <mat-icon svgIcon="eye" />
          View
        </a>
        <a mat-menu-item [routerLink]="['/admin/customers', customer.id, 'edit']">
          <mat-icon svgIcon="pencil" />
          Edit
        </a>
        <button mat-menu-item (click)="toggleStatus(customer)">
          <mat-icon [svgIcon]="customer.status === 'active' ? 'pause' : 'play'" />
          {{ customer.status === 'active' ? 'Suspend' : 'Activate' }}
        </button>
        <button mat-menu-item (click)="deleteCustomer(customer)">
          <mat-icon svgIcon="trash" />
          Delete
        </button>
      </ng-template>
    </mat-menu>
  `,
})
export class CustomersListComponent implements OnInit {
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

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.customerApi.getPage(this.pageIndex, this.pageSize, this.sortField, this.sortDir).subscribe({
      next: page => {
        this.customers.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 }),
    });
  }

  deleteCustomer(customer: CustomerDto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Customer',
          message: `Are you sure you want to delete "${customer.fullName}"?`,
          confirmText: 'Delete',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.customerApi.delete(customer.id).subscribe({
          next: () => {
            this.customers.update(list => list.filter(c => c.id !== customer.id));
            this.totalElements.update(n => n - 1);
            this.snackBar.open('Customer deleted', 'OK', { duration: 3000 });
          },
          error: () => this.snackBar.open('Failed to delete customer', 'Close', { duration: 3000 }),
        });
      });
  }
}



