import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerApiService } from '../../../core/api/customer-api.service';
import { PaymentApiService } from '../../../core/api/payment-api.service';
import { InvoiceApiService, CreditApiService } from '../../../core/api/billing-api.service';
import { NotificationApiService } from '../../../core/api/notification-api.service';
import { CustomerDto, RechargeDto } from '../../../core/models/customer.model';
import { PaymentDto } from '../../../core/models/payment.model';
import { InvoiceDto, CreditLedgerEntryDto } from '../../../core/models/billing.model';
import { NotificationDto } from '../../../core/models/notification.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { LoadingComponent } from '../../../shared/components/loading.component';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTabsModule, MatCardModule,
    MatButtonModule, MatIconModule, MatTableModule, MatChipsModule,
    StatusBadgeComponent, LoadingComponent
  ],
  template: `
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <a mat-icon-button routerLink="/admin/customers"><mat-icon>arrow_back</mat-icon></a>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900">{{ customer()?.fullName }}</h1>
          <p class="text-gray-500 text-sm">{{ customer()?.email }} · {{ customer()?.phoneNumber }}</p>
        </div>
        <app-status-badge [status]="customer()?.status ?? ''" />
        <a mat-flat-button color="primary" [routerLink]="['/admin/customers', customerId, 'edit']">
          <mat-icon>edit</mat-icon> Edit
        </a>
      </div>

      <app-loading [loading]="loading()" />

      @if (customer() && !loading()) {
        <!-- Customer info cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <mat-card class="p-4">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-3">Account Info</div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">Username:</span><span class="font-medium">{{ customer()?.username }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Service:</span><span class="font-medium capitalize">{{ customer()?.serviceType }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Type:</span><span class="font-medium capitalize">{{ customer()?.accountType }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Balance:</span><span class="font-medium">KES {{ customer()?.balance | number:'1.2-2' }}</span></div>
            </div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-3">PPPoE Credentials</div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">Username:</span><span class="font-mono font-medium">{{ customer()?.pppoeUsername || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Password:</span><span class="font-mono font-medium">{{ customer()?.pppoePassword || '—' }}</span></div>
            </div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-3">Risk Score</div>
            <div class="text-3xl font-bold" [class]="riskClass()">{{ customer()?.riskScore ?? 'N/A' }}</div>
            <div class="text-xs text-gray-400 mt-1">Last updated: {{ customer()?.riskLastUpdated | date:'medium' }}</div>
          </mat-card>
        </div>

        <!-- Tabs -->
        <mat-card>
          <mat-tab-group dynamicHeight>
            <!-- Subscription -->
            <mat-tab label="Subscription">
              <div class="p-4">
                <h3 class="font-semibold mb-3">Active Recharges</h3>
                @if (activeRecharges().length === 0) {
                  <p class="text-gray-400 text-sm">No active recharges</p>
                }
                @for (r of activeRecharges(); track r.id) {
                  <div class="border rounded-lg p-3 mb-2 flex items-center justify-between">
                    <div>
                      <div class="font-medium text-sm">Recharge #{{ r.id.slice(0, 8) }}</div>
                      <div class="text-xs text-gray-500">Expires: {{ r.expiration | date:'medium' }}</div>
                    </div>
                    <app-status-badge [status]="r.status" />
                  </div>
                }
              </div>
            </mat-tab>

            <!-- Payments -->
            <mat-tab label="Payments">
              <div class="p-4">
                <mat-table [dataSource]="payments()" class="w-full">
                  <ng-container matColumnDef="amount">
                    <mat-header-cell *matHeaderCellDef>Amount</mat-header-cell>
                    <mat-cell *matCellDef="let p">KES {{ p.amount | number:'1.2-2' }}</mat-cell>
                  </ng-container>
                  <ng-container matColumnDef="provider">
                    <mat-header-cell *matHeaderCellDef>Provider</mat-header-cell>
                    <mat-cell *matCellDef="let p" class="capitalize">{{ p.provider }}</mat-cell>
                  </ng-container>
                  <ng-container matColumnDef="status">
                    <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
                    <mat-cell *matCellDef="let p"><app-status-badge [status]="p.status" /></mat-cell>
                  </ng-container>
                  <ng-container matColumnDef="date">
                    <mat-header-cell *matHeaderCellDef>Date</mat-header-cell>
                    <mat-cell *matCellDef="let p">{{ p.createdAt | date:'medium' }}</mat-cell>
                  </ng-container>
                  <mat-header-row *matHeaderRowDef="['amount','provider','status','date']"></mat-header-row>
                  <mat-row *matRowDef="let row; columns: ['amount','provider','status','date'];"></mat-row>
                </mat-table>
              </div>
            </mat-tab>

            <!-- Invoices -->
            <mat-tab label="Invoices">
              <div class="p-4">
                <mat-table [dataSource]="invoices()" class="w-full">
                  <ng-container matColumnDef="invoiceNumber">
                    <mat-header-cell *matHeaderCellDef>Invoice #</mat-header-cell>
                    <mat-cell *matCellDef="let i">{{ i.invoiceNumber }}</mat-cell>
                  </ng-container>
                  <ng-container matColumnDef="amount">
                    <mat-header-cell *matHeaderCellDef>Amount</mat-header-cell>
                    <mat-cell *matCellDef="let i">{{ i.currency }} {{ i.amount | number:'1.2-2' }}</mat-cell>
                  </ng-container>
                  <ng-container matColumnDef="status">
                    <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
                    <mat-cell *matCellDef="let i"><app-status-badge [status]="i.status" /></mat-cell>
                  </ng-container>
                  <ng-container matColumnDef="due">
                    <mat-header-cell *matHeaderCellDef>Due Date</mat-header-cell>
                    <mat-cell *matCellDef="let i">{{ i.dueDate | date:'mediumDate' }}</mat-cell>
                  </ng-container>
                  <mat-header-row *matHeaderRowDef="['invoiceNumber','amount','status','due']"></mat-header-row>
                  <mat-row *matRowDef="let row; columns: ['invoiceNumber','amount','status','due'];"></mat-row>
                </mat-table>
              </div>
            </mat-tab>

            <!-- Notifications -->
            <mat-tab label="Notifications">
              <div class="p-4 space-y-2">
                @for (n of notifications(); track n.id) {
                  <div class="border rounded-lg p-3">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{{ n.type }}</span>
                      <span class="text-xs text-gray-400">{{ n.channel }}</span>
                      <app-status-badge [status]="n.status" />
                      <span class="ml-auto text-xs text-gray-400">{{ n.createdAt | date:'medium' }}</span>
                    </div>
                    <p class="text-sm text-gray-700">{{ n.body }}</p>
                  </div>
                }
                @if (notifications().length === 0) {
                  <p class="text-gray-400 text-sm">No notifications</p>
                }
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      }
    </div>
  `
})
export class CustomerDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly customerApi = inject(CustomerApiService);
  private readonly paymentApi = inject(PaymentApiService);
  private readonly invoiceApi = inject(InvoiceApiService);
  private readonly creditApi = inject(CreditApiService);
  private readonly notificationApi = inject(NotificationApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly customer = signal<CustomerDto | null>(null);
  readonly activeRecharges = signal<RechargeDto[]>([]);
  readonly payments = signal<PaymentDto[]>([]);
  readonly invoices = signal<InvoiceDto[]>([]);
  readonly credits = signal<CreditLedgerEntryDto[]>([]);
  readonly notifications = signal<NotificationDto[]>([]);

  customerId = '';

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.customerApi.getById(this.customerId).subscribe({
      next: c => {
        this.customer.set(c);
        this.loading.set(false);
        this.loadTabs();
      },
      error: () => this.loading.set(false)
    });
  }

  loadTabs(): void {
    this.customerApi.getActiveRecharges(this.customerId).subscribe(r => this.activeRecharges.set(r));
    this.paymentApi.getByCustomer(this.customerId).subscribe(p => this.payments.set(p));
    this.invoiceApi.getByCustomer(this.customerId).subscribe(i => this.invoices.set(i));
    this.creditApi.getHistory(this.customerId).subscribe(c => this.credits.set(c));
    this.notificationApi.getByCustomer(this.customerId).subscribe(n => this.notifications.set(n));
  }

  riskClass(): string {
    const score = this.customer()?.riskScore ?? 0;
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  }
}

