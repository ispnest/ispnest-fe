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
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { CustomerApiService } from '@/app/domains/customers/data';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { CustomerDto } from '../../data/customer.model';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    DatePipe,
    MatCard,
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
    MatNoDataRow,
    MatSort,
    MatSortHeader,
    MatPaginator,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    LoadingComponent,
    StatusBadgeComponent,
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight">Customers</h1>
          <p class="mt-1 text-neutral-a11">{{ totalElements() }} total customers</p>
        </div>
        @if (!auth.isViewOnly()) {
          <a matButton class="primary" routerLink="/admin/customers/new">
            <mat-icon svgIcon="user-round-plus" />
            New Customer
          </a>
        }
      </div>

      <mat-card>
        <!-- Filters -->
        <div class="flex flex-wrap items-end gap-3 border-b border-neutral-a4 p-4">
          <mat-form-field class="min-w-48 flex-1" subscriptSizing="dynamic">
            <mat-label>Search</mat-label>
            <mat-icon svgIcon="search" matPrefix />
            <input
              matInput
              [(ngModel)]="searchQuery"
              (keyup.enter)="resetAndLoad()"
              placeholder="Name, email, phone…"
            />
          </mat-form-field>
          <mat-form-field class="w-40" subscriptSizing="dynamic">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="inactive">Inactive</mat-option>
              <mat-option value="suspended">Suspended</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field class="w-40" subscriptSizing="dynamic">
            <mat-label>Service Type</mat-label>
            <mat-select [(ngModel)]="typeFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="pppoe">PPPoE</mat-option>
              <mat-option value="hotspot">Hotspot</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="customers()"
              matSort
              (matSortChange)="onSort($event)"
            >
              <ng-container matColumnDef="fullName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let c">
                  <a
                    [routerLink]="['/admin/customers', c.id]"
                    class="font-medium text-primary-a11 hover:underline"
                  >
                    {{ c.fullName }}
                  </a>
                </td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                <td mat-cell *matCellDef="let c">{{ c.email }}</td>
              </ng-container>

              <ng-container matColumnDef="phoneNumber">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let c">{{ c.phoneNumber }}</td>
              </ng-container>

              <ng-container matColumnDef="serviceType">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                <td mat-cell *matCellDef="let c" class="capitalize">{{ c.serviceType }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let c">
                  <app-status-badge [status]="c.status" />
                </td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
                <td mat-cell *matCellDef="let c">{{ c.createdAt | date: 'mediumDate' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let c">
                  <button
                    matIconButton
                    [matMenuTriggerFor]="actionMenu"
                    [matMenuTriggerData]="{ customer: c }"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr
                class="group relative cursor-pointer hover:bg-neutral-a2"
                mat-row
                *matRowDef="let row; columns: displayedColumns"
                [routerLink]="['/admin/customers', row.id]"
              ></tr>
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell p-12 text-center" [attr.colspan]="displayedColumns.length">
                  <div class="flex flex-col items-center gap-2 text-neutral-a9">
                    <mat-icon svgIcon="users" class="size-10 text-neutral-a6" />
                    <div class="font-medium">No customers found</div>
                    <div class="text-sm">Try adjusting your filters</div>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <mat-paginator
            class="px-3"
            [length]="totalElements()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPage($event)"
            showFirstLastButtons
          />
        </div>
      </mat-card>
    </div>

    <mat-menu #actionMenu="matMenu">
      <ng-template matMenuContent let-customer="customer">
        <a mat-menu-item [routerLink]="['/admin/customers', customer.id]">
          <mat-icon svgIcon="eye" />
          View
        </a>
        @if (!auth.isViewOnly()) {
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
        }
      </ng-template>
    </mat-menu>
  `,
})
export class CustomersListComponent implements OnInit {
  readonly auth = inject(AuthService);
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

  readonly displayedColumns = [
    'fullName',
    'email',
    'phoneNumber',
    'serviceType',
    'status',
    'createdAt',
    'actions',
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.customerApi
      .getPage(
        this.pageIndex,
        this.pageSize,
        this.sortField,
        this.sortDir,
        this.searchQuery,
        this.statusFilter,
        this.typeFilter,
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
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.customerApi.delete(customer.id).subscribe({
          next: () => {
            this.customers.update((list) => list.filter((c) => c.id !== customer.id));
            this.totalElements.update((n) => n - 1);
            this.snackBar.open('Customer deleted', 'OK', { duration: 3000 });
          },
          error: () => this.snackBar.open('Failed to delete customer', 'Close', { duration: 3000 }),
        });
      });
  }
}
