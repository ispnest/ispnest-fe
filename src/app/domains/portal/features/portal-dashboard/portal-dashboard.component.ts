import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { CustomerDto, RechargeDto } from '@/app/domains/customers/data';
import { PaymentDto } from '@/app/domains/payments/data';
import { PortalApiService } from '@/app/domains/portal/data';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
    StatusBadgeComponent,
    LoadingComponent,
  ],
  template: `
    <div class="min-h-screen bg-neutral-a2">
      <!-- Header bar -->
      <div class="bg-primary px-4 py-6 text-primary-contrast">
        <div class="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <div class="text-xs font-medium uppercase tracking-widest opacity-75">
              Customer Portal
            </div>
            <h1 class="mt-0.5 text-xl font-bold">{{ customer()?.fullName ?? 'My Account' }}</h1>
          </div>
          <div class="flex gap-2">
            <a
              routerLink="/portal/payment"
              matButton
              class="bg-white/20 text-white hover:bg-white/30"
            >
              <mat-icon svgIcon="credit-card" />
              Make Payment
            </a>
            <button
              matIconButton
              (click)="logout()"
              title="Logout"
              class="text-white/80 hover:text-white"
            >
              <mat-icon svgIcon="log-out" />
            </button>
          </div>
        </div>
      </div>

      <div class="mx-auto max-w-4xl space-y-4 px-4 py-6">
        <app-loading [loading]="loading()" />

        @if (!loading() && customer()) {
          <!-- Summary cards -->
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <mat-card appearance="filled" class="p-4 text-center">
              <div class="text-xs font-medium uppercase tracking-wider text-neutral-a9">Status</div>
              <div class="mt-2"><app-status-badge [status]="customer()!.status" /></div>
            </mat-card>
            <mat-card appearance="filled" class="p-4 text-center">
              <div class="text-xs font-medium uppercase tracking-wider text-neutral-a9">
                Service
              </div>
              <div class="mt-2 font-semibold capitalize">{{ customer()!.serviceType }}</div>
            </mat-card>
            <mat-card appearance="filled" class="p-4 text-center">
              <div class="text-xs font-medium uppercase tracking-wider text-neutral-a9">
                Balance
              </div>
              <div class="mt-2 font-bold text-primary-a11">
                KES {{ customer()!.balance | number: '1.2-2' }}
              </div>
            </mat-card>
            <mat-card appearance="filled" class="p-4 text-center">
              <div class="text-xs font-medium uppercase tracking-wider text-neutral-a9">
                Active Plans
              </div>
              <div class="mt-2 font-bold text-green-a11">{{ activeRecharges().length }}</div>
            </mat-card>
          </div>

          <!-- Active services -->
          @if (activeRecharges().length > 0) {
            <mat-card class="p-4">
              <h2 class="mb-3 flex items-center gap-2 font-semibold">
                <mat-icon svgIcon="circle-check" class="text-green-a11" />
                Active Services
              </h2>
              @for (r of activeRecharges(); track r.id) {
                <div class="mb-2 flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <div class="text-sm font-medium">Plan #{{ r.planId?.slice(0, 8) }}</div>
                    <div class="text-xs text-neutral-a11">
                      Expires: {{ r.expiration | date: 'medium' }}
                    </div>
                  </div>
                  <app-status-badge [status]="r.status" />
                </div>
              }
            </mat-card>
          }

          <!-- Recent payments -->
          <mat-card class="p-4">
            <h2 class="mb-3 font-semibold">Recent Payments</h2>
            @if (recentPayments().length === 0) {
              <p class="py-4 text-center text-sm text-neutral-a11">No payments found</p>
            }
            @for (p of recentPayments(); track p.id) {
              <div class="flex items-center justify-between border-b py-2 last:border-0">
                <div>
                  <div class="text-sm font-medium">
                    {{ p.currency }} {{ p.amount | number: '1.2-2' }}
                  </div>
                  <div class="text-xs text-neutral-a9">
                    {{ p.createdAt | date: 'mediumDate' }} · {{ p.provider }}
                  </div>
                </div>
                <app-status-badge [status]="p.status" />
              </div>
            }
          </mat-card>

          <!-- Actions -->
          <div class="grid grid-cols-2 gap-3">
            <a
              routerLink="/portal/payment"
              matButton
              class="primary flex h-auto flex-col items-center gap-1 py-4"
            >
              <mat-icon svgIcon="credit-card" />
              <span class="text-xs">Pay Now</span>
            </a>
            <a
              routerLink="/portal/upgrade"
              matButton
              class="flex h-auto flex-col items-center gap-1 py-4"
            >
              <mat-icon svgIcon="arrow-up-circle" />
              <span class="text-xs">Upgrade Plan</span>
            </a>
          </div>
        }
      </div>
    </div>
  `,
})
export class PortalDashboardComponent implements OnInit {
  private readonly portalApi = inject(PortalApiService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly customer = signal<CustomerDto | null>(null);
  readonly activeRecharges = signal<RechargeDto[]>([]);
  readonly recentPayments = signal<PaymentDto[]>([]);

  ngOnInit(): void {
    const id = sessionStorage.getItem('portalCustomerId');
    if (!id) {
      this.router.navigate(['/portal']);
      return;
    }

    this.portalApi.getCustomer(id).subscribe({
      next: (c) => {
        this.customer.set(c);
        this.loading.set(false);
        this.portalApi.getActiveRecharges(id).subscribe((r) => this.activeRecharges.set(r));
        this.portalApi.getPayments(id).subscribe((p) => this.recentPayments.set(p.slice(0, 5)));
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/portal']);
      },
    });
  }

  logout(): void {
    sessionStorage.removeItem('portalCustomerId');
    this.router.navigate(['/portal']);
  }
}
