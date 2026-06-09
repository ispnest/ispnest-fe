import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TenantDescriptor, TenantService, TenantStatus } from '../../data';

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [MatButton, MatCard, MatIcon, MatProgressSpinner, RouterLink],
  host: { class: 'flex flex-auto flex-col' },
  template: `
    <div class="flex flex-col gap-6 p-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a matButton routerLink="/admin/tenants">
          <mat-icon svgIcon="arrow-left" />
          Back
        </a>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <mat-progress-spinner mode="indeterminate" diameter="40" />
        </div>
      } @else if (tenant(); as t) {
        <div class="flex flex-col gap-6">
          <!-- Title row -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="flex size-14 items-center justify-center rounded-xl text-xl font-bold"
                [class]="getAvatarClasses(t.status)"
              >
                {{ t.displayName[0]?.toUpperCase() }}
              </div>
              <div>
                <h1 class="text-2xl font-bold text-neutral-12">{{ t.displayName }}</h1>
                <p class="text-sm text-neutral-10">{{ t.slug }}.ispnest.com</p>
              </div>
            </div>
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
              [class]="getStatusClasses(t.status)"
            >
              <span class="size-2 rounded-full" [class]="getStatusDotClass(t.status)"></span>
              {{ formatStatus(t.status) }}
            </span>
          </div>

          <!-- Info cards -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <mat-card appearance="outlined" class="p-5">
              <div class="text-xs font-medium text-neutral-10 uppercase tracking-wide">
                Database
              </div>
              <div class="mt-2 font-semibold text-neutral-12">{{ t.databaseName || '—' }}</div>
              <div class="text-sm text-neutral-11">{{ t.databaseHost }}:{{ t.databasePort }}</div>
            </mat-card>

            <mat-card appearance="outlined" class="p-5">
              <div class="text-xs font-medium text-neutral-10 uppercase tracking-wide">
                Provisioning
              </div>
              <div class="mt-2 font-semibold text-neutral-12">
                {{ formatProvisioningStatus(t.provisioningStatus) }}
              </div>
              <div class="text-sm text-neutral-11">Schema: {{ t.schemaVersion || 'latest' }}</div>
            </mat-card>

            <mat-card appearance="outlined" class="p-5">
              <div class="text-xs font-medium text-neutral-10 uppercase tracking-wide">
                Secret Reference
              </div>
              <div class="mt-2 truncate font-mono text-sm text-neutral-12">
                {{ t.databaseSecretReference || '—' }}
              </div>
            </mat-card>
          </div>

          <!-- Actions -->
          <mat-card appearance="outlined" class="p-5">
            <h2 class="text-lg font-semibold text-neutral-12">Actions</h2>
            <div class="mt-4 flex flex-wrap gap-3">
              @if (t.status === 'ACTIVE') {
                <button
                  matButton
                  class="tertiary"
                  (click)="suspend(t)"
                  [disabled]="actionLoading()"
                >
                  <mat-icon svgIcon="pause" />
                  Suspend Tenant
                </button>
              }
              @if (t.status === 'SUSPENDED') {
                <button
                  matButton
                  class="primary"
                  (click)="reactivate(t)"
                  [disabled]="actionLoading()"
                >
                  <mat-icon svgIcon="play" />
                  Reactivate
                </button>
              }
              @if (t.provisioningStatus === 'FAILED') {
                <button
                  matButton
                  class="primary"
                  (click)="retryProvisioning(t)"
                  [disabled]="actionLoading()"
                >
                  <mat-icon svgIcon="refresh-cw" />
                  Retry Provisioning
                </button>
              }
              @if (t.status !== 'DECOMMISSIONED') {
                <button
                  matButton
                  class="tertiary text-red-11"
                  (click)="decommission(t)"
                  [disabled]="actionLoading()"
                >
                  <mat-icon svgIcon="trash-2" />
                  Decommission
                </button>
              }
            </div>
          </mat-card>
        </div>
      } @else {
        <mat-card appearance="outlined" class="p-8 text-center">
          <p class="text-neutral-11">Tenant not found.</p>
        </mat-card>
      }
    </div>
  `,
})
export class TenantDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly tenantService = inject(TenantService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly loading = signal(true);
  protected readonly actionLoading = signal(false);
  protected readonly tenant = signal<TenantDescriptor | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('tenantId');
    if (id) {
      this.tenantService.getById(id).subscribe({
        next: (t) => {
          this.tenant.set(t);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      this.loading.set(false);
    }
  }

  suspend(t: TenantDescriptor) {
    const reason = prompt('Suspension reason:');
    if (!reason) return;
    this.actionLoading.set(true);
    this.tenantService.suspend(t.tenantId, reason).subscribe({
      next: () => {
        this.snackBar.open('Tenant suspended', 'OK', { duration: 3000 });
        this.reload(t.tenantId);
      },
      error: () => {
        this.actionLoading.set(false);
        this.snackBar.open('Failed to suspend', 'Dismiss', { duration: 3000 });
      },
    });
  }

  reactivate(t: TenantDescriptor) {
    this.actionLoading.set(true);
    this.tenantService.reactivate(t.tenantId).subscribe({
      next: () => {
        this.snackBar.open('Tenant reactivated', 'OK', { duration: 3000 });
        this.reload(t.tenantId);
      },
      error: () => {
        this.actionLoading.set(false);
        this.snackBar.open('Failed to reactivate', 'Dismiss', { duration: 3000 });
      },
    });
  }

  retryProvisioning(t: TenantDescriptor) {
    this.actionLoading.set(true);
    this.tenantService.retryProvisioning(t.tenantId).subscribe({
      next: () => {
        this.snackBar.open('Provisioning retry started', 'OK', { duration: 3000 });
        this.reload(t.tenantId);
      },
      error: () => {
        this.actionLoading.set(false);
        this.snackBar.open('Retry failed', 'Dismiss', { duration: 3000 });
      },
    });
  }

  decommission(t: TenantDescriptor) {
    if (
      !confirm(`Are you sure you want to decommission "${t.displayName}"? This cannot be undone.`)
    )
      return;
    this.actionLoading.set(true);
    this.tenantService.decommission(t.tenantId).subscribe({
      next: () => {
        this.snackBar.open('Tenant decommissioned', 'OK', { duration: 3000 });
        this.reload(t.tenantId);
      },
      error: () => {
        this.actionLoading.set(false);
        this.snackBar.open('Failed to decommission', 'Dismiss', { duration: 3000 });
      },
    });
  }

  private reload(tenantId: string) {
    this.tenantService.getById(tenantId).subscribe({
      next: (t) => {
        this.tenant.set(t);
        this.actionLoading.set(false);
      },
      error: () => this.actionLoading.set(false),
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
      default:
        return 'bg-neutral-9';
    }
  }

  formatStatus(status: TenantStatus): string {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'PENDING_PROVISIONING':
        return 'Pending Provisioning';
      case 'SUSPENDED':
        return 'Suspended';
      case 'PROVISIONING_FAILED':
        return 'Provisioning Failed';
      case 'DECOMMISSIONED':
        return 'Decommissioned';
      default:
        return status;
    }
  }

  formatProvisioningStatus(status: string): string {
    switch (status) {
      case 'NOT_STARTED':
        return 'Not Started';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'FAILED':
        return 'Failed';
      default:
        return status;
    }
  }
}
