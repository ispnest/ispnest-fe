import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  InvoiceApiService,
  CreditApiService,
} from '@/app/domains/billing/data/billing-api.service';
import { InvoiceDto, CreditLedgerEntryDto } from '@/app/domains/billing/data/billing.model';
import { CustomerApiService } from '@/app/domains/customers/data/customer-api.service';
import { CustomerDto, RechargeDto } from '@/app/domains/customers/data/customer.model';
import { NotificationApiService } from '@/app/domains/notifications/data/notification-api.service';
import { NotificationDto } from '@/app/domains/notifications/data/notification.model';
import { PaymentApiService } from '@/app/domains/payments/data/payment-api.service';
import { PaymentDto } from '@/app/domains/payments/data/payment.model';
import { LoadingComponent } from '@/app/ui/loading/loading.component';
import { StatusBadgeComponent } from '@/app/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-customers-detail',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTabGroup,
    MatTab,
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
    StatusBadgeComponent,
    LoadingComponent,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/customers">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div class="flex-1">
          <h1 class="text-2xl font-semibold tracking-tight">{{ customer()?.fullName }}</h1>
          <p class="text-sm text-neutral-a11">
            {{ customer()?.email }} · {{ customer()?.phoneNumber }}
          </p>
        </div>
        <app-status-badge [status]="customer()?.status ?? ''" />
        <a class="primary" matButton [routerLink]="['/admin/customers', customerId, 'edit']">
          <mat-icon svgIcon="pencil" />
          Edit
        </a>
      </div>

      <app-loading [loading]="loading()" />

      @if (customer() && !loading()) {
        <!-- Info cards -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <mat-card appearance="filled" class="p-4">
            <div class="mb-3 flex items-center gap-2">
              <mat-icon svgIcon="user-round" class="size-4 text-primary-a11" />
              <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                Account Info
              </div>
            </div>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-neutral-a11">Username</dt>
                <dd class="font-medium">{{ customer()?.username }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-neutral-a11">Service</dt>
                <dd class="font-medium capitalize">{{ customer()?.serviceType }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-neutral-a11">Account Type</dt>
                <dd class="font-medium capitalize">{{ customer()?.accountType }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-neutral-a11">Balance</dt>
                <dd class="font-semibold text-primary-a11">
                  KES {{ customer()?.balance | number: '1.2-2' }}
                </dd>
              </div>
            </dl>
          </mat-card>

          <mat-card appearance="filled" class="p-4">
            <div class="mb-3 flex items-center gap-2">
              <mat-icon svgIcon="lock-keyhole" class="size-4 text-violet-a11" />
              <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                PPPoE Credentials
              </div>
            </div>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-neutral-a11">Username</dt>
                <dd class="font-mono font-medium">{{ customer()?.pppoeUsername || '—' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-neutral-a11">Password</dt>
                <dd class="font-mono font-medium">{{ customer()?.pppoePassword || '—' }}</dd>
              </div>
            </dl>
          </mat-card>

          <mat-card appearance="filled" class="p-4">
            <div class="mb-3 flex items-center gap-2">
              <mat-icon svgIcon="shield" class="size-4 text-amber-a11" />
              <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                Risk Score
              </div>
            </div>
            <div class="text-4xl font-bold tabular-nums" [class]="riskClass()">
              {{ customer()?.riskScore ?? 'N/A' }}
            </div>
            <div class="mt-2 text-xs text-neutral-a9">
              Last updated: {{ customer()?.riskLastUpdated | date: 'medium' }}
            </div>
          </mat-card>
        </div>

        <!-- Tabs -->
        <mat-card>
          <mat-tab-group dynamicHeight>
            <mat-tab label="Subscription">
              <div class="p-4">
                <h3 class="mb-3 font-semibold">Active Recharges</h3>
                @if (activeRecharges().length === 0) {
                  <p class="text-sm text-neutral-a9">No active recharges</p>
                }
                @for (r of activeRecharges(); track r.id) {
                  <div class="mb-2 flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div class="text-sm font-medium">Recharge #{{ r.id.slice(0, 8) }}</div>
                      <div class="text-xs text-neutral-a11">
                        Expires: {{ r.expiration | date: 'medium' }}
                      </div>
                    </div>
                    <app-status-badge [status]="r.status" />
                  </div>
                }
              </div>
            </mat-tab>

            <mat-tab label="Payments">
              <div class="flex flex-col">
                <div class="relative isolate overflow-x-visible overflow-y-hidden">
                  <table
                    class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
                    mat-table
                    [dataSource]="payments()"
                  >
                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef>Amount</th>
                      <td mat-cell *matCellDef="let p">
                        <span class="tabular-nums">KES {{ p.amount | number: '1.2-2' }}</span>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="provider">
                      <th mat-header-cell *matHeaderCellDef>Provider</th>
                      <td mat-cell *matCellDef="let p" class="capitalize">{{ p.provider }}</td>
                    </ng-container>
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let p">
                        <app-status-badge [status]="p.status" />
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Date</th>
                      <td mat-cell *matCellDef="let p">{{ p.createdAt | date: 'medium' }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="paymentCols"></tr>
                    <tr
                      class="group relative hover:bg-neutral-a2"
                      mat-row
                      *matRowDef="let _; columns: paymentCols"
                    ></tr>
                  </table>
                </div>
              </div>
            </mat-tab>

            <mat-tab label="Invoices">
              <div class="flex flex-col">
                <div class="relative isolate overflow-x-visible overflow-y-hidden">
                  <table
                    class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
                    mat-table
                    [dataSource]="invoices()"
                  >
                    <ng-container matColumnDef="invoiceNumber">
                      <th mat-header-cell *matHeaderCellDef>Invoice #</th>
                      <td mat-cell *matCellDef="let i">{{ i.invoiceNumber }}</td>
                    </ng-container>
                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef>Amount</th>
                      <td mat-cell *matCellDef="let i">
                        <span class="tabular-nums"
                          >{{ i.currency }} {{ i.amount | number: '1.2-2' }}</span
                        >
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let i"><app-status-badge [status]="i.status" /></td>
                    </ng-container>
                    <ng-container matColumnDef="due">
                      <th mat-header-cell *matHeaderCellDef>Due Date</th>
                      <td mat-cell *matCellDef="let i">{{ i.dueDate | date: 'mediumDate' }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="invoiceCols"></tr>
                    <tr
                      class="group relative hover:bg-neutral-a2"
                      mat-row
                      *matRowDef="let _; columns: invoiceCols"
                    ></tr>
                  </table>
                </div>
              </div>
            </mat-tab>

            <mat-tab label="Notifications">
              <div class="space-y-2 p-4">
                @for (n of notifications(); track n.id) {
                  <div class="rounded-lg border p-3">
                    <div class="mb-1 flex items-center gap-2">
                      <span
                        class="rounded bg-primary-a3 px-2 py-0.5 text-xs font-medium text-primary-a11"
                      >
                        {{ n.type }}
                      </span>
                      <span class="text-xs text-neutral-a9">{{ n.channel }}</span>
                      <app-status-badge [status]="n.status" />
                      <span class="ml-auto text-xs text-neutral-a9">
                        {{ n.createdAt | date: 'medium' }}
                      </span>
                    </div>
                    <p class="text-sm">{{ n.body }}</p>
                  </div>
                }
                @if (notifications().length === 0) {
                  <p class="text-sm text-neutral-a9">No notifications</p>
                }
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      }
    </div>
  `,
})
export class CustomersDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly customerApi = inject(CustomerApiService);
  private readonly paymentApi = inject(PaymentApiService);
  private readonly invoiceApi = inject(InvoiceApiService);
  private readonly creditApi = inject(CreditApiService);
  private readonly notificationApi = inject(NotificationApiService);

  readonly loading = signal(true);
  readonly customer = signal<CustomerDto | null>(null);
  readonly activeRecharges = signal<RechargeDto[]>([]);
  readonly payments = signal<PaymentDto[]>([]);
  readonly invoices = signal<InvoiceDto[]>([]);
  readonly credits = signal<CreditLedgerEntryDto[]>([]);
  readonly notifications = signal<NotificationDto[]>([]);

  customerId = '';

  readonly paymentCols = ['amount', 'provider', 'status', 'date'];
  readonly invoiceCols = ['invoiceNumber', 'amount', 'status', 'due'];

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.customerApi.getById(this.customerId).subscribe({
      next: (c: CustomerDto) => {
        this.customer.set(c);
        this.loading.set(false);
        this.loadTabs();
      },
      error: () => this.loading.set(false),
    });
  }

  loadTabs(): void {
    this.customerApi
      .getActiveRecharges(this.customerId)
      .subscribe((r: RechargeDto[]) => this.activeRecharges.set(r));
    this.paymentApi
      .getByCustomer(this.customerId)
      .subscribe((p: PaymentDto[]) => this.payments.set(p));
    this.invoiceApi
      .getByCustomer(this.customerId)
      .subscribe((i: InvoiceDto[]) => this.invoices.set(i));
    this.creditApi
      .getHistory(this.customerId)
      .subscribe((c: CreditLedgerEntryDto[]) => this.credits.set(c));
    this.notificationApi
      .getByCustomer(this.customerId)
      .subscribe((n: NotificationDto[]) => this.notifications.set(n));
  }

  riskClass(): string {
    const score = this.customer()?.riskScore ?? 0;
    if (score >= 70) return 'text-red-a11';
    if (score >= 40) return 'text-amber-a11';
    return 'text-green-a11';
  }
}
