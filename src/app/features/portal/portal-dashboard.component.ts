import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CustomerApiService } from '../../core/api/customer-api.service';
import { PaymentApiService } from '../../core/api/payment-api.service';
import { CustomerDto, RechargeDto } from '../../core/models/customer.model';
import { PaymentDto } from '../../core/models/payment.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, StatusBadgeComponent, LoadingComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-6">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold">My Account</h1>
            <p class="text-blue-200 text-sm">{{ customer()?.fullName }}</p>
          </div>
          <div class="flex gap-2">
            <a routerLink="/portal/payment" mat-flat-button class="bg-white text-blue-700">Make Payment</a>
            <button mat-icon-button (click)="logout()" title="Logout" class="text-white">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <app-loading [loading]="loading()" />

        @if (!loading() && customer()) {
          <!-- Account Summary -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <mat-card class="p-4 text-center">
              <div class="text-xs text-gray-500 uppercase">Status</div>
              <div class="mt-1"><app-status-badge [status]="customer()!.status" /></div>
            </mat-card>
            <mat-card class="p-4 text-center">
              <div class="text-xs text-gray-500 uppercase">Service</div>
              <div class="font-semibold mt-1 capitalize">{{ customer()!.serviceType }}</div>
            </mat-card>
            <mat-card class="p-4 text-center">
              <div class="text-xs text-gray-500 uppercase">Balance</div>
              <div class="font-bold text-blue-600 mt-1">KES {{ customer()!.balance | number:'1.2-2' }}</div>
            </mat-card>
            <mat-card class="p-4 text-center">
              <div class="text-xs text-gray-500 uppercase">Active Plans</div>
              <div class="font-bold text-green-600 mt-1">{{ activeRecharges().length }}</div>
            </mat-card>
          </div>

          <!-- Active Recharges -->
          @if (activeRecharges().length > 0) {
            <mat-card class="p-4">
              <h2 class="font-semibold mb-3 flex items-center gap-2">
                <mat-icon class="text-green-500">check_circle</mat-icon> Active Services
              </h2>
              @for (r of activeRecharges(); track r.id) {
                <div class="border rounded-lg p-3 flex items-center justify-between mb-2">
                  <div>
                    <div class="font-medium text-sm">Plan #{{ r.planId?.slice(0, 8) }}</div>
                    <div class="text-xs text-gray-500">Expires: {{ r.expiration | date:'medium' }}</div>
                  </div>
                  <app-status-badge [status]="r.status" />
                </div>
              }
            </mat-card>
          }

          <!-- Recent Payments -->
          <mat-card class="p-4">
            <h2 class="font-semibold mb-3">Recent Payments</h2>
            @if (recentPayments().length === 0) {
              <p class="text-gray-400 text-sm">No payments found</p>
            }
            @for (p of recentPayments(); track p.id) {
              <div class="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <div class="text-sm font-medium">{{ p.currency }} {{ p.amount | number:'1.2-2' }}</div>
                  <div class="text-xs text-gray-400">{{ p.createdAt | date:'mediumDate' }} · {{ p.provider }}</div>
                </div>
                <app-status-badge [status]="p.status" />
              </div>
            }
          </mat-card>

          <!-- Actions -->
          <div class="grid grid-cols-2 gap-3">
            <a routerLink="/portal/payment" mat-flat-button color="primary" class="py-4 h-auto flex flex-col items-center gap-1">
              <mat-icon>payment</mat-icon>
              <span class="text-xs">Pay Now</span>
            </a>
            <a routerLink="/portal/upgrade" mat-stroked-button class="py-4 h-auto flex flex-col items-center gap-1">
              <mat-icon>upgrade</mat-icon>
              <span class="text-xs">Upgrade Plan</span>
            </a>
          </div>
        }
      </div>
    </div>
  `
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
      error: () => { this.loading.set(false); this.router.navigate(['/portal']); }
    });
  }

  logout(): void {
    sessionStorage.removeItem('portalCustomerId');
    this.router.navigate(['/portal']);
  }
}

