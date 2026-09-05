import { ComponentType } from '@angular/cdk/portal';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { PaymentApiService } from '@/app/domains/payments/data';
import { UsageChartComponent, UsageChartSeries } from '@/app/ui/charts';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { PaymentDto, PaymentSummary, PaymentSummaryPeriod } from '../../data/payment.model';
import { ReallocatePaymentFormComponent } from '../reallocate-payment-form/reallocate-payment-form.component';
import { ResolveMissingCallbackFormComponent } from '../resolve-missing-callback-form/resolve-missing-callback-form.component';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Dialog panels get a mobile-safe max height/scroll — MatDialog sets none of this by default. */
const DIALOG_PANEL_CLASS = ['max-h-[calc(100dvh-4rem)]', 'overflow-y-auto', 'sm:max-h-[85dvh]'];

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    RouterLink,
    MatButton,
    MatIconButton,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatSelect,
    MatOption,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatIcon,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
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
    MatPaginator,
    StatusBadgeComponent,
    LoadingComponent,
    UsageChartComponent,
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Payments</h1>
          <p class="text-sm text-neutral-a11">{{ totalElements() }} payment transactions</p>
        </div>
        <a matButton routerLink="payment-corrections">Payment Corrections</a>
      </div>

      <mat-card>
        <div class="flex flex-wrap items-end gap-3 border-b border-neutral-a4 p-4">
          <mat-form-field class="w-40" subscriptSizing="dynamic">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="COMPLETED">Completed</mat-option>
              <mat-option value="PENDING">Pending</mat-option>
              <mat-option value="FAILED">Failed</mat-option>
              <mat-option value="CANCELLED">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field class="w-64" subscriptSizing="dynamic">
            <mat-label>Date range</mat-label>
            <mat-date-range-input [rangePicker]="picker">
              <input
                matStartDate
                placeholder="Start date"
                [(ngModel)]="rangeStart"
                (dateChange)="resetAndLoad()"
              />
              <input
                matEndDate
                placeholder="End date"
                [(ngModel)]="rangeEnd"
                (dateChange)="resetAndLoad()"
              />
            </mat-date-range-input>
            <mat-datepicker-toggle matIconSuffix [for]="picker" />
            <mat-date-range-picker #picker />
          </mat-form-field>

          <mat-button-toggle-group
            class="ml-auto"
            [(ngModel)]="period"
            (ngModelChange)="resetAndLoad()"
          >
            <mat-button-toggle value="DAILY">Daily</mat-button-toggle>
            <mat-button-toggle value="WEEKLY">Weekly</mat-button-toggle>
            <mat-button-toggle value="MONTHLY">Monthly</mat-button-toggle>
          </mat-button-toggle-group>
        </div>
      </mat-card>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <mat-card appearance="filled">
          <mat-card-header>
            <div class="flex items-center gap-x-2">
              <div
                class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-a3"
              >
                <mat-icon class="size-4 text-primary-a11" svgIcon="credit-card" />
              </div>
              <div class="text-sm font-medium text-neutral-a11">Total Payments</div>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
              {{ summary()?.totalCount ?? 0 }}
            </div>
            <div class="mt-1 text-sm text-neutral-a11">In the selected range</div>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="filled">
          <mat-card-header>
            <div class="flex items-center gap-x-2">
              <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-a3">
                <mat-icon class="size-4 text-green-a11" svgIcon="banknote" />
              </div>
              <div class="text-sm font-medium text-neutral-a11">Total Amount</div>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
              {{ currencyFormatter(summary()?.totalAmount ?? 0) }}
            </div>
            <div class="mt-1 text-sm text-neutral-a11">In the selected range</div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="flex h-full flex-col">
        <div class="flex items-center gap-x-2 border-b border-neutral-a4 px-4 py-3">
          <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-a3">
            <mat-icon class="size-4 text-primary-a11" svgIcon="chart-column" />
          </div>
          <div class="text-xl font-semibold tracking-tight">Payments Over Time</div>
        </div>
        <div class="p-4">
          @if (summary()) {
            <app-usage-chart
              [series]="series()"
              type="bar"
              [height]="280"
              [yFormatter]="currencyFormatter"
            />
          } @else {
            <div class="flex h-70 items-center justify-center text-sm text-neutral-a11">
              Loading summary…
            </div>
          }
        </div>
      </mat-card>

      <mat-card>
        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <!-- Desktop / tablet: table. Hidden below sm. -->
          <div class="relative isolate hidden overflow-x-auto overflow-y-hidden sm:block">
            <table
              class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              [dataSource]="payments()"
            >
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let p" class="font-semibold">
                  <span class="tabular-nums"
                    >{{ p.currency }} {{ p.amount | number: '1.2-2' }}</span
                  >
                </td>
              </ng-container>
              <ng-container matColumnDef="accountCode">
                <th mat-header-cell *matHeaderCellDef>Account</th>
                <td mat-cell *matCellDef="let p" class="font-mono text-sm">
                  {{ p.accountCode ?? '—' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="provider">
                <th mat-header-cell *matHeaderCellDef>Provider</th>
                <td mat-cell *matCellDef="let p" class="capitalize">{{ p.provider }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let p"><app-status-badge [status]="p.status" /></td>
              </ng-container>
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let p">{{ p.createdAt | date: 'medium' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let p">
                  <button
                    matIconButton
                    [matMenuTriggerFor]="rowMenu"
                    [matMenuTriggerData]="{ payment: p }"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr
                class="group relative cursor-pointer hover:bg-neutral-a2"
                mat-row
                *matRowDef="let row; columns: cols"
                (click)="viewDetail(row)"
              ></tr>
            </table>
          </div>

          <!-- Mobile: cards. Shown only below sm. -->
          <div class="flex flex-col divide-y divide-neutral-a4 sm:hidden">
            @for (p of payments(); track p.id) {
              <div
                class="flex flex-col gap-2 p-4"
                role="button"
                tabindex="0"
                (click)="viewDetail(p)"
                (keydown.enter)="viewDetail(p)"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="font-semibold tabular-nums">
                      {{ p.currency }} {{ p.amount | number: '1.2-2' }}
                    </div>
                    @if (p.accountCode) {
                      <div class="mt-0.5 truncate font-mono text-xs text-neutral-a11">
                        {{ p.accountCode }}
                      </div>
                    }
                  </div>
                  <div class="flex shrink-0 items-center gap-1">
                    <app-status-badge [status]="p.status" />
                    <button
                      matIconButton
                      [matMenuTriggerFor]="rowMenu"
                      [matMenuTriggerData]="{ payment: p }"
                      (click)="$event.stopPropagation()"
                    >
                      <mat-icon svgIcon="ellipsis-vertical" />
                    </button>
                  </div>
                </div>
                <div class="flex items-center justify-between text-sm text-neutral-a11">
                  <span class="capitalize">{{ p.provider }}</span>
                  <span>{{ p.createdAt | date: 'medium' }}</span>
                </div>
              </div>
            }
            @if (payments().length === 0) {
              <p class="py-8 text-center text-sm text-neutral-a9">No payments</p>
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
        </div>
      </mat-card>
    </div>

    <!-- Shared row-actions menu — one instance for every row, table or card, per Angular
         Material's own recommended matMenuTriggerData pattern (see customers-list). -->
    <mat-menu #rowMenu="matMenu">
      <ng-template matMenuContent let-p="payment">
        <button mat-menu-item (click)="viewDetail(p)">View</button>
        @if (p.status === 'PENDING' && canFixCallbacks()) {
          <button mat-menu-item (click)="openResolveDialog(p)">Resolve Missing Callback…</button>
        }
        @if (p.status === 'COMPLETED' && canFixCallbacks()) {
          <button mat-menu-item (click)="openReallocateDialog(p)">Paid to Wrong Account…</button>
        }
      </ng-template>
    </mat-menu>
  `,
})
export class PaymentsListComponent implements OnInit {
  private readonly paymentApi = inject(PaymentApiService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly payments = signal<PaymentDto[]>([]);
  readonly totalElements = signal(0);
  readonly summary = signal<PaymentSummary | null>(null);
  readonly cols = ['amount', 'accountCode', 'provider', 'status', 'createdAt', 'actions'];

  readonly canFixCallbacks = computed(
    () =>
      this.auth.hasPermission('PAYMENTS_FIX_CALLBACK') ||
      this.auth.hasPermission('PAYMENTS_FORCE_RESOLVE_CALLBACK'),
  );

  readonly series = computed<UsageChartSeries[]>(() => {
    const points = this.summary()?.points ?? [];
    return [
      {
        name: 'Amount',
        data: points.map((p) => ({ x: Date.parse(p.periodStart), y: p.totalAmount })),
      },
    ];
  });

  readonly currencyFormatter = (value: number): string =>
    `KES ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  statusFilter = 'COMPLETED';
  period: PaymentSummaryPeriod = 'DAILY';
  rangeEnd: Date = new Date();
  rangeStart: Date = new Date(this.rangeEnd.getFullYear(), this.rangeEnd.getMonth(), 1);

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const status = this.statusFilter || undefined;
    this.paymentApi
      .getPage(
        this.pageIndex,
        this.pageSize,
        'createdAt',
        'desc',
        status,
        this.rangeStart,
        this.rangeEnd,
      )
      .subscribe({
        next: (page) => {
          this.payments.set(page.content);
          this.totalElements.set(page.page.totalElements);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    this.paymentApi.getSummary(this.period, this.rangeStart, this.rangeEnd, status).subscribe({
      next: (summary) => this.summary.set(summary),
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

  viewDetail(p: PaymentDto): void {
    this.router.navigate(['/admin/payments', p.id]);
  }

  openResolveDialog(payment: PaymentDto): void {
    this.openActionDialog(ResolveMissingCallbackFormComponent, payment, 'Payment resolved.');
  }

  openReallocateDialog(payment: PaymentDto): void {
    this.openActionDialog(ReallocatePaymentFormComponent, payment);
  }

  /** Both row-action dialogs close with the created record on success, `undefined` on cancel. */
  private openActionDialog<T>(
    component: ComponentType<T>,
    payment: PaymentDto,
    successMessage?: string,
  ): void {
    this.dialog
      .open(component, { data: { payment }, panelClass: DIALOG_PANEL_CLASS })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        if (successMessage) this.snackBar.open(successMessage, 'OK', { duration: 4000 });
        this.load();
      });
  }
}
