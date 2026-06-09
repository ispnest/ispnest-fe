import { Component, computed, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatPrefix } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { TenantDescriptor, TenantService, TenantStatus } from '../../data';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [
    MatButton,
    MatIconButton,
    MatCard,
    MatIcon,
    MatFormField,
    MatInput,
    MatPrefix,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatPaginator,
    MatProgressSpinner,
    RouterLink,
  ],
  host: { class: 'flex flex-auto flex-col' },
  template: `
    <div class="flex flex-col gap-6 p-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-12">Tenants</h1>
          <p class="mt-1 text-sm text-neutral-11">Manage all ISP tenants on the platform.</p>
        </div>
        <a matButton class="primary" routerLink="/admin/tenants/create">
          <mat-icon svgIcon="plus" />
          Add Tenant
        </a>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <mat-form-field class="w-64" subscriptSizing="dynamic">
          <mat-icon matPrefix svgIcon="search" class="size-4" />
          <input matInput placeholder="Search tenants..." (input)="onSearch($event)" />
        </mat-form-field>

        <div class="flex gap-2">
          @for (status of statusFilters; track status.value) {
            <button
              matButton
              [class]="activeFilter() === status.value ? 'primary' : 'tertiary'"
              (click)="filterByStatus(status.value)"
            >
              {{ status.label }}
            </button>
          }
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <mat-progress-spinner mode="indeterminate" diameter="40" />
        </div>
      } @else {
        <!-- Tenant cards grid -->
        @if (filteredTenants().length === 0) {
          <mat-card appearance="outlined" class="p-8 text-center">
            <mat-icon svgIcon="building-2" class="mx-auto size-12 text-neutral-a6" />
            <p class="mt-3 text-neutral-11">No tenants found.</p>
            <a matButton class="primary mt-4" routerLink="/admin/tenants/create">
              Create your first tenant
            </a>
          </mat-card>
        } @else {
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (tenant of filteredTenants(); track tenant.tenantId) {
              <mat-card appearance="outlined" class="flex flex-col gap-3 p-5">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex size-10 items-center justify-center rounded-lg text-sm font-bold"
                      [class]="getAvatarClasses(tenant.status)"
                    >
                      {{ tenant.displayName[0]?.toUpperCase() }}
                    </div>
                    <div>
                      <div class="font-semibold text-neutral-12">{{ tenant.displayName }}</div>
                      <div class="text-xs text-neutral-10">{{ tenant.slug }}</div>
                    </div>
                  </div>
                  <button matIconButton [matMenuTriggerFor]="tenantMenu">
                    <mat-icon svgIcon="ellipsis-vertical" class="size-4" />
                  </button>
                  <mat-menu #tenantMenu>
                    <a mat-menu-item [routerLink]="['/admin/tenants', tenant.tenantId]">
                      <mat-icon svgIcon="eye" />
                      View Details
                    </a>
                    @if (tenant.status === 'ACTIVE') {
                      <button mat-menu-item (click)="suspendTenant(tenant)">
                        <mat-icon svgIcon="pause" />
                        Suspend
                      </button>
                    }
                    @if (tenant.status === 'SUSPENDED') {
                      <button mat-menu-item (click)="reactivateTenant(tenant)">
                        <mat-icon svgIcon="play" />
                        Reactivate
                      </button>
                    }
                    @if (tenant.provisioningStatus === 'FAILED') {
                      <button mat-menu-item (click)="retryProvisioning(tenant)">
                        <mat-icon svgIcon="refresh-cw" />
                        Retry Provisioning
                      </button>
                    }
                  </mat-menu>
                </div>

                <!-- Status badge -->
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                    [class]="getStatusClasses(tenant.status)"
                  >
                    <span
                      class="size-1.5 rounded-full"
                      [class]="getStatusDotClass(tenant.status)"
                    ></span>
                    {{ formatStatus(tenant.status) }}
                  </span>
                  @if (
                    tenant.provisioningStatus !== 'COMPLETED' &&
                    tenant.provisioningStatus !== 'NOT_STARTED'
                  ) {
                    <span
                      class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-amber-a2 text-amber-11"
                    >
                      {{ formatProvisioningStatus(tenant.provisioningStatus) }}
                    </span>
                  }
                </div>

                <!-- Info -->
                <div class="mt-auto flex items-center gap-4 text-xs text-neutral-10">
                  <span class="flex items-center gap-1">
                    <mat-icon svgIcon="database" class="size-3" />
                    {{ tenant.databaseName || '—' }}
                  </span>
                  <span class="flex items-center gap-1">
                    <mat-icon svgIcon="server" class="size-3" />
                    {{ tenant.databaseHost || '—' }}
                  </span>
                </div>
              </mat-card>
            }
          </div>

          <!-- Pagination -->
          <mat-paginator
            [length]="totalElements()"
            [pageSize]="pageSize"
            [pageIndex]="pageIndex()"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPage($event)"
          />
        }
      }
    </div>
  `,
})
export class TenantListComponent {
  private readonly tenantService = inject(TenantService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly loading = signal(true);
  protected readonly tenants = signal<TenantDescriptor[]>([]);
  protected readonly totalElements = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = 20;
  protected readonly activeFilter = signal<TenantStatus | 'ALL'>('ALL');
  protected readonly searchQuery = signal('');

  protected readonly statusFilters: { label: string; value: TenantStatus | 'ALL' }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Pending', value: 'PENDING_PROVISIONING' },
    { label: 'Suspended', value: 'SUSPENDED' },
    { label: 'Failed', value: 'PROVISIONING_FAILED' },
  ];

  protected readonly filteredTenants = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.tenants();
    return this.tenants().filter(
      (t) => t.displayName.toLowerCase().includes(query) || t.slug.toLowerCase().includes(query),
    );
  });

  constructor() {
    this.loadTenants();
  }

  loadTenants() {
    this.loading.set(true);
    const status = this.activeFilter() === 'ALL' ? undefined : this.activeFilter();
    this.tenantService
      .list(status as TenantStatus | undefined, this.pageIndex(), this.pageSize)
      .subscribe({
        next: (page) => {
          this.tenants.set(page.content);
          this.totalElements.set(page.page.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.snackBar.open('Failed to load tenants', 'Dismiss', { duration: 3000 });
        },
      });
  }

  filterByStatus(status: TenantStatus | 'ALL') {
    this.activeFilter.set(status);
    this.pageIndex.set(0);
    this.loadTenants();
  }

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onPage(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.loadTenants();
  }

  suspendTenant(tenant: TenantDescriptor) {
    const reason = prompt('Enter suspension reason:');
    if (!reason) return;
    this.tenantService.suspend(tenant.tenantId, reason).subscribe({
      next: () => {
        this.snackBar.open(`Tenant "${tenant.displayName}" suspended`, 'OK', { duration: 3000 });
        this.loadTenants();
      },
      error: () => this.snackBar.open('Failed to suspend tenant', 'Dismiss', { duration: 3000 }),
    });
  }

  reactivateTenant(tenant: TenantDescriptor) {
    this.tenantService.reactivate(tenant.tenantId).subscribe({
      next: () => {
        this.snackBar.open(`Tenant "${tenant.displayName}" reactivated`, 'OK', { duration: 3000 });
        this.loadTenants();
      },
      error: () => this.snackBar.open('Failed to reactivate tenant', 'Dismiss', { duration: 3000 }),
    });
  }

  retryProvisioning(tenant: TenantDescriptor) {
    this.tenantService.retryProvisioning(tenant.tenantId).subscribe({
      next: () => {
        this.snackBar.open('Provisioning retry initiated', 'OK', { duration: 3000 });
        this.loadTenants();
      },
      error: () =>
        this.snackBar.open('Failed to retry provisioning', 'Dismiss', { duration: 3000 }),
    });
  }

  getAvatarClasses(status: TenantStatus): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-a3 text-green-11';
      case 'PENDING_PROVISIONING':
        return 'bg-blue-a3 text-blue-11';
      case 'SUSPENDED':
        return 'bg-amber-a3 text-amber-11';
      case 'PROVISIONING_FAILED':
        return 'bg-red-a3 text-red-11';
      case 'DECOMMISSIONED':
        return 'bg-neutral-a3 text-neutral-11';
      default:
        return 'bg-neutral-a3 text-neutral-11';
    }
  }

  getStatusClasses(status: TenantStatus): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-a2 text-green-11';
      case 'PENDING_PROVISIONING':
        return 'bg-blue-a2 text-blue-11';
      case 'SUSPENDED':
        return 'bg-amber-a2 text-amber-11';
      case 'PROVISIONING_FAILED':
        return 'bg-red-a2 text-red-11';
      case 'DECOMMISSIONED':
        return 'bg-neutral-a2 text-neutral-11';
      default:
        return 'bg-neutral-a2 text-neutral-11';
    }
  }

  getStatusDotClass(status: TenantStatus): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-9';
      case 'PENDING_PROVISIONING':
        return 'bg-blue-9';
      case 'SUSPENDED':
        return 'bg-amber-9';
      case 'PROVISIONING_FAILED':
        return 'bg-red-9';
      case 'DECOMMISSIONED':
        return 'bg-neutral-9';
      default:
        return 'bg-neutral-9';
    }
  }

  formatStatus(status: TenantStatus): string {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'PENDING_PROVISIONING':
        return 'Pending';
      case 'SUSPENDED':
        return 'Suspended';
      case 'PROVISIONING_FAILED':
        return 'Failed';
      case 'DECOMMISSIONED':
        return 'Decommissioned';
      default:
        return status;
    }
  }

  formatProvisioningStatus(status: string): string {
    switch (status) {
      case 'IN_PROGRESS':
        return 'Provisioning…';
      case 'FAILED':
        return 'Provision Failed';
      default:
        return status;
    }
  }
}
