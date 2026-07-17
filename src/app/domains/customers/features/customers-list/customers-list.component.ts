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
    MatCard,
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
          <mat-form-field class="w-44 max-sm:w-full" subscriptSizing="dynamic">
            <mat-label>Sort</mat-label>
            <mat-select [ngModel]="sortSelection" (ngModelChange)="onSortChange($event)">
              <mat-option value="fullName:asc">Name (A-Z)</mat-option>
              <mat-option value="fullName:desc">Name (Z-A)</mat-option>
              <mat-option value="createdAt:desc">Newest</mat-option>
              <mat-option value="createdAt:asc">Oldest</mat-option>
              <mat-option value="status:asc">Status</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <app-loading [loading]="loading()" />

        <div class="divide-y divide-neutral-a4">
          @for (c of customers(); track c.id) {
            <a
              [routerLink]="['/admin/customers', c.id]"
              class="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-a2 sm:gap-4 sm:px-5"
              [class]="!c.connected ? 'border-l-2 border-amber-a8' : ''"
            >
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-a3 text-sm font-semibold text-primary-a11"
              >
                {{ (c.fullName || c.accountCode)?.charAt(0)?.toUpperCase() }}
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-medium">{{ c.fullName || '—' }}</p>
                </div>

                <div
                  class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-a11"
                >
                  <span class="font-medium text-neutral-a12">{{ c.accountCode }}</span>
                  @if (c.email) {
                    <span class="break-all">{{ c.email }}</span>
                  }
                  @if (c.phoneNumber) {
                    <span>{{ c.phoneNumber }}</span>
                  }
                </div>

                <div class="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <app-status-badge [status]="c.status" />
                  @if (!c.connected) {
                    <span
                      class="inline-flex items-center gap-0.5 rounded-full bg-amber-a4 px-1.5 py-0.5 font-bold uppercase text-amber-a11"
                    >
                      <mat-icon svgIcon="unplug" class="size-2.5" />Pending
                    </span>
                  }
                  @if (!c.hasActiveRecharge) {
                    <span
                      class="inline-flex rounded-full bg-orange-a3 px-1.5 py-0.5 font-bold uppercase text-orange-a11"
                      >No Sub</span
                    >
                  }
                  <span
                    class="inline-flex rounded-full bg-neutral-a3 px-1.5 py-0.5 font-medium text-neutral-a11 capitalize"
                  >
                    {{ c.serviceType }}
                  </span>
                  <span
                    class="inline-flex rounded-full bg-neutral-a3 px-1.5 py-0.5 font-medium text-neutral-a11"
                  >
                    {{ c.accountType }}
                  </span>
                </div>
              </div>

              <div class="ml-auto flex shrink-0 items-start">
                <button
                  matIconButton
                  [matMenuTriggerFor]="actionMenu"
                  [matMenuTriggerData]="{ customer: c }"
                  (click)="$event.preventDefault(); $event.stopPropagation()"
                >
                  <mat-icon svgIcon="ellipsis-vertical" />
                </button>
              </div>
            </a>
          }
          @if (customers().length === 0 && !loading()) {
            <div class="flex flex-col items-center gap-2 p-12 text-center text-neutral-a9">
              <mat-icon svgIcon="users" class="size-10 text-neutral-a6" />
              <div class="font-medium">No customers found</div>
              <div class="text-sm">Try adjusting your filters</div>
            </div>
          }
        </div>
        <mat-paginator
          class="px-3"
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)"
          showFirstLastButtons
        />
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

  get sortSelection(): string {
    return `${this.sortField}:${this.sortDir}`;
  }

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

  onSortChange(value: string): void {
    const [field, direction] = value.split(':');
    this.sortField = field || 'fullName';
    this.sortDir = direction === 'desc' ? 'desc' : 'asc';
    this.pageIndex = 0;
    this.load();
  }

  toggleStatus(customer: CustomerDto): void {
    const newStatus = customer.status === 'active' ? 'suspended' : 'active';
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
