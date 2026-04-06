import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { CustomerApiService } from '@/app/domains/customers/data';
import { CustomerDto, RechargeDto } from '@/app/domains/customers/data';
import { PaymentApiService } from '@/app/domains/payments/data';
import { PaymentDto } from '@/app/domains/payments/data';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [
    RouterLink, DatePipe, DecimalPipe,
    MatCard, MatButton, MatIconButton, MatIcon, MatDivider,
    StatusBadgeComponent, LoadingComponent,
  ],
  template: `
    <div class="min-h-screen bg-linear-to-b from-neutral-a2 to-neutral-a1">
      <!-- Header -->
      <div class="bg-linear-to-r from-blue-600 to-blue-800 px-4 py-6 text-white">
        <div class="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 class="text-xl font-bold">My Account</h1>
            <p class="text-sm text-blue-200">{{ customer()?.fullName }}</p>
          </div>
          <div class="flex gap-2">
            <a routerLink="/portal/payment" matButton class="bg-white text-blue-700">Make Payment</a>
            <button matIconButton (click)="logout()" title="Logout" class="text-white">
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
            <mat-card class="p-4 text-center">
              <div class="text-xs uppercase text-neutral-a9">Status</div>
              <div class="mt-1"><app-status-badge [status]="customer()!.status" /></div>
            </mat-card>
            <mat-card class="p-4 text-center">
              <div class="text-xs uppercase text-neutral-a9">Service</div>
              <div class="mt-1 font-semibold capitalize">{{ customer()!.serviceType }}</div>
            </mat-card>
            <mat-card class="p-4 text-center">
              <div class="text-xs uppercase text-neutral-a9">Balance</div>
              <div class="mt-1 font-bold text-primary-a11">
                KES {{ customer()!.balance | number:'1.2-2' }}
              </div>
            </mat-card>
            <mat-card class="p-4 text-center">
              <div class="text-xs uppercase text-neutral-a9">Active Plans</div>
              <div class="mt-1 font-bold text-green-600">{{ activeRecharges().length }}</div>
            </mat-card>
          </div>

          <!-- Active services -->
          @if (activeRecharges().length > 0) {
            <mat-card class="p-4">
              <h2 class="mb-3 flex items-center gap-2 font-semibold">
                <mat-icon svgIcon="check-circle" class="text-green-500" />
                Active Services
              </h2>
              @for (r of activeRecharges(); track r.id) {
                <div class="mb-2 flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div class="text-sm font-medium">Plan #{{ r.planId?.slice(0, 8) }}</div>
                    <div class="text-xs text-neutral-a11">Expires: {{ r.expiration | date:'medium' }}</div>
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
              <p class="text-sm text-neutral-a11">No payments found</p>
            }
            @for (p of recentPayments(); track p.id) {
              <div class="flex items-center justify-between border-b py-2 last:border-0">
                <div>
                  <div class="text-sm font-medium">{{ p.currency }} {{ p.amount | number:'1.2-2' }}</div>
                  <div class="text-xs text-neutral-a9">
                    {{ p.createdAt | date:'mediumDate' }} · {{ p.provider }}
                  </div>
                </div>
                <app-status-badge [status]="p.status" />
              </div>
            }
          </mat-card>

          <!-- Actions -->
          <div class="grid grid-cols-2 gap-3">
            <a routerLink="/portal/payment" matButton
               class="primary flex h-auto flex-col items-center gap-1 py-4">
              <mat-icon svgIcon="credit-card" />
              <span class="text-xs">Pay Now</span>
            </a>
            <a routerLink="/portal/upgrade" matButton
               class="flex h-auto flex-col items-center gap-1 py-4">
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
  private readonly customerApi = inject(CustomerApiService);
  private readonly paymentApi = inject(PaymentApiService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly customer = signal<CustomerDto | null>(null);
  readonly activeRecharges = signal<RechargeDto[]>([]);
  readonly recentPayments = signal<PaymentDto[]>([]);

  ngOnInit(): void {
    const id = sessionStorage.getItem('portalCustomerId');
    if (!id) { this.router.navigate(['/portal']); return; }

    this.customerApi.getById(id).subscribe({
      next: c => {
        this.customer.set(c);
        this.loading.set(false);
        this.customerApi.getActiveRecharges(id).subscribe(r => this.activeRecharges.set(r));
        this.paymentApi.getByCustomer(id).subscribe(p => this.recentPayments.set(p.slice(0, 5)));
      },
      error: () => { this.loading.set(false); this.router.navigate(['/portal']); },
    });
  }

  logout(): void {
    sessionStorage.removeItem('portalCustomerId');
    this.router.navigate(['/portal']);
  }
}

