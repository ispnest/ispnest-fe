import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

type TenantSummary = {
  id: string | { value: string };
  slug: string;
  displayName: string;
  status?: string;
  isDefault?: boolean;
  activatedAt?: string;
};

type SwitchResponse = {
  tenantId: string;
  slug: string;
  displayName: string;
};

@Component({
  selector: 'app-tenants-console',
  standalone: true,
  imports: [RouterLink, MatCard, MatButton, MatIcon, DatePipe],
  template: `
    <div class="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Platform Tenants</h1>
          <p class="text-sm text-neutral-a11">Apex control-plane view for platform admins.</p>
        </div>
        <a routerLink="/signup" matButton class="primary">
          <mat-icon svgIcon="building-2" />
          Register tenant
        </a>
      </div>

      @if (message()) {
        <div class="mb-4 rounded-lg border border-success-a6 bg-success-a3 p-3 text-sm text-success-a11">
          {{ message() }}
        </div>
      }

      @if (error()) {
        <div class="mb-4 rounded-lg border border-error-a6 bg-error-a3 p-3 text-sm text-error-a11">
          {{ error() }}
        </div>
      }

      <mat-card class="overflow-hidden p-0">
        <div class="border-b border-neutral-a6 px-4 py-3 text-sm font-medium">Active tenants</div>

        @if (loading()) {
          <div class="px-4 py-6 text-sm text-neutral-a11">Loading tenants...</div>
        } @else if (tenants().length === 0) {
          <div class="px-4 py-6 text-sm text-neutral-a11">No active tenants found.</div>
        } @else {
          <div class="divide-y divide-neutral-a6">
            @for (tenant of tenants(); track tenant.slug) {
              <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div class="min-w-0">
                  <div class="truncate font-medium">{{ tenant.displayName }}</div>
                  <div class="text-xs text-neutral-a11">
                    <span class="font-mono">{{ tenant.slug }}</span>
                    @if (tenant.activatedAt) {
                      <span> · Active since {{ tenant.activatedAt | date: 'mediumDate' }}</span>
                    }
                  </div>
                </div>

                <button matButton class="tertiary" [disabled]="switching()" (click)="switchTenant(tenant)">
                  <mat-icon svgIcon="arrow-right-left" />
                  Switch
                </button>
              </div>
            }
          </div>
        }
      </mat-card>
    </div>
  `,
})
export class TenantsConsoleComponent {
  private readonly http = inject(HttpClient);

  readonly tenants = signal<TenantSummary[]>([]);
  readonly loading = signal(true);
  readonly switching = signal(false);
  readonly message = signal('');
  readonly error = signal('');

  constructor() {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');

    this.http.get<TenantSummary[]>('/api/admin/tenants').subscribe({
      next: (rows) => {
        this.tenants.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Failed to load tenants.');
      },
    });
  }

  switchTenant(tenant: TenantSummary): void {
    const tenantId = this.extractTenantId(tenant.id);
    if (!tenantId) {
      this.error.set('Invalid tenant id in response.');
      return;
    }

    this.switching.set(true);
    this.message.set('');
    this.error.set('');

    this.http.post<SwitchResponse>(`/api/admin/tenants/${tenantId}/switch`, {}).subscribe({
      next: (res) => {
        this.switching.set(false);
        this.message.set(`Switched to tenant: ${res.displayName} (${res.slug}).`);
      },
      error: (err) => {
        this.switching.set(false);
        this.error.set(err?.error?.message || 'Tenant switch failed.');
      },
    });
  }

  private extractTenantId(id: TenantSummary['id']): string | null {
    if (typeof id === 'string') return id;
    if (id && typeof id.value === 'string') return id.value;
    return null;
  }
}

