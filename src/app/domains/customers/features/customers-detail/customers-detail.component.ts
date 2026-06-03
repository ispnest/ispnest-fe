import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
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
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import {
  InvoiceApiService,
  CreditApiService,
} from '@/app/domains/billing/data/billing-api.service';
import { InvoiceDto, CreditLedgerEntryDto } from '@/app/domains/billing/data/billing.model';
import {
  CustomerDto,
  RechargeDto,
  CustomerChargeDto,
  AssignedPlanDto,
  CustomerSessionSummaryDto,
} from '@/app/domains/customers/data';
import { CustomerApiService } from '@/app/domains/customers/data/customer-api.service';
import { NotificationApiService } from '@/app/domains/notifications/data/notification-api.service';
import { NotificationDto } from '@/app/domains/notifications/data/notification.model';
import { PaymentApiService } from '@/app/domains/payments/data/payment-api.service';
import { PaymentDto } from '@/app/domains/payments/data/payment.model';
import { BandwidthApiService, PlanApiService } from '@/app/domains/plans/data/plan-api.service';
import { BandwidthDto, PlanDto } from '@/app/domains/plans/data/plan.model';
import { LoadingComponent } from '@/app/ui/loading/loading.component';
import { DataSizePipe } from '@/app/ui/pipes';
import { StatusBadgeComponent } from '@/app/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-customers-detail',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
    MatProgressSpinner,
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
    DataSizePipe,
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
        @if (!auth.isViewOnly()) {
          <a class="primary" matButton [routerLink]="['/admin/customers', customerId, 'edit']">
            <mat-icon svgIcon="pencil" />
            Edit
          </a>
        }
      </div>

      <app-loading [loading]="loading()" />

      @if (customer() && !loading()) {
        <!-- Not Yet Connected banner -->
        @if (!customer()!.connected && auth.hasPermission('CUSTOMERS_WRITE')) {
          <div class="rounded-xl border border-amber-a6 bg-amber-a2 p-4">
            <div class="flex items-start gap-3">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-a4">
                <mat-icon svgIcon="unplug" class="size-5 text-amber-a11" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-amber-a11">Not Yet Connected</p>
                <p class="mt-0.5 text-sm text-neutral-a11">
                  This subscriber is awaiting line connection.
                  @if (pendingChargesTotal() > 0) {
                    <span class="font-semibold text-amber-a11"
                      >KES {{ pendingChargesTotal() | number: '1.2-2' }}</span
                    >
                    in pending charges (includes connection fee).
                  }
                </p>
                @if (confirmingConnect()) {
                  <p class="mt-2 text-sm font-medium text-neutral-a12">
                    Confirm the line is physically connected and ready?
                  </p>
                  <div class="mt-2 flex items-center gap-2">
                    <button
                      matButton
                      class="primary"
                      [disabled]="markingConnected()"
                      (click)="doMarkConnected()"
                    >
                      @if (markingConnected()) {
                        <mat-progress-spinner diameter="14" mode="indeterminate" /> Saving…
                      } @else {
                        <ng-container>
                          <mat-icon svgIcon="check" /> Yes, Mark Connected
                        </ng-container>
                      }
                    </button>
                    <button
                      matButton
                      [disabled]="markingConnected()"
                      (click)="confirmingConnect.set(false)"
                    >
                      Cancel
                    </button>
                  </div>
                }
              </div>
              @if (!confirmingConnect()) {
                <button matButton class="primary shrink-0" (click)="confirmingConnect.set(true)">
                  <mat-icon svgIcon="plug-zap" />
                  Mark Connected
                </button>
              }
            </div>
          </div>
        }

        <!-- No Active Subscription banner -->
        @if (!customer()!.hasActiveRecharge) {
          <div class="rounded-xl border border-amber-a6 bg-amber-a2 p-4">
            <div class="flex items-center gap-3">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-a4">
                <mat-icon svgIcon="zap-off" class="size-5 text-amber-a11" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-amber-a11">No Active Subscription</p>
                <p class="mt-0.5 text-sm text-neutral-a11">
                  This customer has no active recharge.
                  @if (assignedPlan()) {
                    Assigned plan:
                    <span class="font-semibold text-amber-a11">{{
                      assignedPlan()!.plan.planName
                    }}</span
                    >.
                  }
                </p>
              </div>
            </div>
          </div>
        }

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
                <dd class="font-medium">{{ customer()?.accountCode }}</dd>
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

        <!-- Live Session Panel -->
        @if (sessionSummary()) {
          @let s = sessionSummary()!;
          <mat-card appearance="filled" class="p-4">
            <div class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="size-2 rounded-full"
                  [class]="
                    s.sessionStatus === 'online'
                      ? 'bg-green-a9 animate-pulse'
                      : s.sessionStatus === 'offline'
                        ? 'bg-red-a9'
                        : 'bg-neutral-a6'
                  "
                ></div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  Live Session
                </div>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  [class]="
                    s.sessionStatus === 'online'
                      ? 'bg-green-a3 text-green-a11'
                      : s.sessionStatus === 'offline'
                        ? 'bg-red-a3 text-red-a11'
                        : 'bg-neutral-a3 text-neutral-a9'
                  "
                  >{{ s.sessionStatus }}</span
                >
              </div>
              <span class="text-xs text-neutral-a9">Updates automatically</span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div class="rounded-lg bg-neutral-a2 p-3">
                <p class="text-xs text-neutral-a9">Last Seen</p>
                <p class="mt-1 font-medium">
                  {{ s.lastSeen ? (s.lastSeen | date: 'dd MMM, HH:mm:ss') : '—' }}
                </p>
              </div>
              <div class="rounded-lg bg-neutral-a2 p-3">
                <p class="text-xs text-neutral-a9">Disconnects</p>
                <p class="mt-1 font-semibold tabular-nums">{{ s.disconnectCount }}</p>
                @if (s.lastDisconnectReason) {
                  <p class="mt-0.5 truncate text-[10px] text-neutral-a9">
                    {{ s.lastDisconnectReason }}
                  </p>
                }
              </div>
              <div class="rounded-lg bg-sky-a2 p-3">
                <p class="text-xs text-sky-a11">Data Received</p>
                <p class="mt-1 font-semibold tabular-nums text-sky-a11">
                  {{ s.currentRechargeInputMb | dataSize }}
                </p>
              </div>
              <div class="rounded-lg bg-violet-a2 p-3">
                <p class="text-xs text-violet-a11">Data Sent</p>
                <p class="mt-1 font-semibold tabular-nums text-violet-a11">
                  {{ s.currentRechargeOutputMb | dataSize }}
                </p>
              </div>
            </div>
            @if (s.framedIpAddress) {
              <p class="mt-3 font-mono text-xs text-neutral-a9">IP: {{ s.framedIpAddress }}</p>
            }
          </mat-card>
        }

        <!-- Tabs -->
        <mat-card>
          <mat-tab-group dynamicHeight>
            <mat-tab label="Subscription">
              <div class="space-y-3 p-4">
                <!-- Assigned plan card -->
                @if (assignedPlan()) {
                  @let ap = assignedPlan()!;
                  <div class="rounded-xl border border-primary-a5 bg-primary-a2 p-4">
                    <div class="mb-2 flex items-center gap-2">
                      <mat-icon svgIcon="bookmark" class="size-4 text-primary-a11" />
                      <span class="text-xs font-semibold uppercase tracking-widest text-primary-a11"
                        >Assigned Plan</span
                      >
                    </div>
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <p class="font-semibold">{{ ap.plan.planName }}</p>
                        <p class="mt-0.5 text-lg font-bold text-primary-a11">
                          KES {{ ap.plan.price | number: '1.0-0' }}
                          @if (ap.plan.validity && ap.plan.validityUnit) {
                            <span class="text-xs font-normal text-neutral-a9"
                              >/ {{ ap.plan.validity }} {{ ap.plan.validityUnit }}</span
                            >
                          }
                        </p>
                      </div>
                    </div>
                    @if (ap.plan.bandwidthId) {
                      <div class="mt-3 flex items-center gap-2">
                        <div class="flex items-center gap-1.5 rounded-lg bg-sky-a3 px-3 py-1.5">
                          <mat-icon svgIcon="arrow-down" class="size-3.5 text-sky-a11" />
                          <span class="text-xs font-semibold text-sky-a11">{{
                            formatSpeed(ap.plan.rateDown ?? 0, ap.plan.rateDownUnit ?? '')
                          }}</span>
                        </div>
                        <div class="flex items-center gap-1.5 rounded-lg bg-violet-a3 px-3 py-1.5">
                          <mat-icon svgIcon="arrow-up" class="size-3.5 text-violet-a11" />
                          <span class="text-xs font-semibold text-violet-a11">{{
                            formatSpeed(ap.plan.rateUp ?? 0, ap.plan.rateUpUnit ?? '')
                          }}</span>
                        </div>
                      </div>
                    }
                  </div>
                }

                @if (activeRecharges().length === 0) {
                  <div class="flex flex-col items-center py-8 text-center">
                    <mat-icon svgIcon="zap-off" class="mb-2 size-8 text-neutral-a6" />
                    <p class="text-sm text-neutral-a9">No active recharge session</p>
                  </div>
                }
                @for (r of activeRecharges(); track r.id) {
                  <div class="rounded-xl border border-neutral-a5 bg-neutral-a2 p-4">
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <p class="font-semibold">
                          {{ activePlan()?.name ?? 'Plan #' + r.planId?.slice(0, 8) }}
                        </p>
                        @if (activePlan()) {
                          <p class="mt-0.5 text-lg font-bold text-primary-a11">
                            KES {{ activePlan()!.price | number: '1.0-0' }}
                            @if (activePlan()!.validity && activePlan()!.validityUnit) {
                              <span class="text-xs font-normal text-neutral-a9"
                                >/ {{ activePlan()!.validity }}
                                {{ activePlan()!.validityUnit }}</span
                              >
                            }
                          </p>
                        }
                      </div>
                      <app-status-badge [status]="r.status" />
                    </div>
                    @if (activeBandwidth()) {
                      <div class="mt-3 flex items-center gap-2">
                        <div class="flex items-center gap-1.5 rounded-lg bg-sky-a3 px-3 py-1.5">
                          <mat-icon svgIcon="arrow-down" class="size-3.5 text-sky-a11" />
                          <span class="text-xs font-semibold text-sky-a11">{{
                            formatSpeed(
                              activeBandwidth()!.rateDown,
                              activeBandwidth()!.rateDownUnit
                            )
                          }}</span>
                        </div>
                        <div class="flex items-center gap-1.5 rounded-lg bg-violet-a3 px-3 py-1.5">
                          <mat-icon svgIcon="arrow-up" class="size-3.5 text-violet-a11" />
                          <span class="text-xs font-semibold text-violet-a11">{{
                            formatSpeed(activeBandwidth()!.rateUp, activeBandwidth()!.rateUpUnit)
                          }}</span>
                        </div>
                        @if (
                          activePlan()!.concurrentDevices && activePlan()!.concurrentDevices! > 1
                        ) {
                          <span class="text-xs text-neutral-a9"
                            >· {{ activePlan()!.concurrentDevices }} devices</span
                          >
                        }
                      </div>
                    }
                    <div class="mt-3 flex items-center justify-between text-sm">
                      <span class="text-neutral-a11">Expires</span>
                      <span class="font-medium">{{ r.expiration | date: 'mediumDate' }}</span>
                    </div>
                    @if (r.remainingMb !== null || r.usedMb !== null) {
                      @let total = (r.usedMb ?? 0) + (r.remainingMb ?? 0);
                      @let pct =
                        total > 0 ? Math.min(100, Math.round(((r.usedMb ?? 0) / total) * 100)) : 0;
                      <div class="mt-3">
                        <div class="mb-1 flex justify-between text-xs text-neutral-a9">
                          <span>{{ r.usedMb ?? 0 | number: '1.0-0' }} MB used</span>
                          <span>{{ total | number: '1.0-0' }} MB total</span>
                        </div>
                        <div class="h-1.5 w-full rounded-full bg-neutral-a4">
                          <div
                            class="h-1.5 rounded-full transition-all"
                            [class]="pct > 80 ? 'bg-red-a9' : 'bg-primary-a9'"
                            [style.width.%]="pct"
                          ></div>
                        </div>
                      </div>
                    }
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
                      <td mat-cell *matCellDef="let i">
                        <app-status-badge [status]="i.status" />
                      </td>
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
                        >{{ n.type }}</span
                      >
                      <span class="text-xs text-neutral-a9">{{ n.channel }}</span>
                      <app-status-badge [status]="n.status" />
                      <span class="ml-auto text-xs text-neutral-a9">{{
                        n.createdAt | date: 'medium'
                      }}</span>
                    </div>
                    <p class="text-sm">{{ n.body }}</p>
                  </div>
                }
                @if (notifications().length === 0) {
                  <p class="text-sm text-neutral-a9">No notifications</p>
                }
              </div>
            </mat-tab>

            <mat-tab
              [label]="
                'Charges' + (pendingChargesTotal() > 0 ? ' (' + pendingChargesTotal() + ')' : '')
              "
            >
              <div class="p-4 space-y-4">
                @if (!auth.isViewOnly()) {
                  <div class="rounded-xl border border-neutral-a5 p-4 space-y-3">
                    <h3 class="text-sm font-semibold">Add Charge</h3>
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <mat-form-field>
                        <mat-label>Type</mat-label>
                        <mat-select [formControl]="chargeForm.controls.type">
                          <mat-option value="CONNECTION_FEE">Connection Fee</mat-option>
                          <mat-option value="ADDITIONAL">Additional</mat-option>
                        </mat-select>
                      </mat-form-field>
                      <mat-form-field>
                        <mat-label>Description</mat-label>
                        <input matInput [formControl]="chargeForm.controls.description"
                      /></mat-form-field>
                      <mat-form-field>
                        <mat-label>Amount (KES)</mat-label>
                        <input
                          matInput
                          type="number"
                          min="1"
                          [formControl]="chargeForm.controls.amount"
                        />
                        <mat-error>Required, must be positive</mat-error>
                      </mat-form-field>
                    </div>
                    <div class="flex justify-end">
                      <button
                        matButton
                        class="primary"
                        type="button"
                        [disabled]="chargeForm.invalid || addingCharge()"
                        (click)="addCharge()"
                      >
                        {{ addingCharge() ? 'Adding…' : 'Add Charge' }}
                      </button>
                    </div>
                  </div>
                }
                @if (pendingChargesTotal() > 0) {
                  <div
                    class="flex items-center justify-between rounded-lg bg-amber-a3 border border-amber-a6 px-4 py-2 text-sm"
                  >
                    <span class="text-amber-a11 font-medium">Outstanding Charges</span>
                    <span class="font-bold text-amber-a11"
                      >KES {{ pendingChargesTotal() | number: '1.2-2' }}</span
                    >
                  </div>
                }
                <div class="flex flex-col">
                  <div class="relative isolate overflow-x-auto overflow-y-hidden">
                    <table
                      class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
                      mat-table
                      [dataSource]="charges()"
                    >
                      <ng-container matColumnDef="type">
                        <th mat-header-cell *matHeaderCellDef>Type</th>
                        <td mat-cell *matCellDef="let c">
                          <span
                            class="rounded px-2 py-0.5 text-xs font-medium"
                            [class]="
                              c.type === 'CONNECTION_FEE'
                                ? 'bg-sky-a3 text-sky-a11'
                                : 'bg-purple-a3 text-purple-a11'
                            "
                            >{{
                              c.type === 'CONNECTION_FEE' ? 'Connection Fee' : 'Additional'
                            }}</span
                          >
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="description">
                        <th mat-header-cell *matHeaderCellDef>Description</th>
                        <td mat-cell *matCellDef="let c">{{ c.description ?? '—' }}</td>
                      </ng-container>
                      <ng-container matColumnDef="amount">
                        <th mat-header-cell *matHeaderCellDef>Amount Due</th>
                        <td mat-cell *matCellDef="let c" class="tabular-nums">
                          <div>KES {{ c.remainingAmount | number: '1.2-2' }}</div>
                          @if (c.status === 'PARTIAL') {
                            <div class="text-xs text-neutral-a9">
                              Paid KES {{ c.amountPaid | number: '1.2-2' }} of KES
                              {{ c.amount | number: '1.2-2' }}
                            </div>
                          }
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef>Status</th>
                        <td mat-cell *matCellDef="let c">
                          <app-status-badge [status]="c.status" />
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef>Date</th>
                        <td mat-cell *matCellDef="let c">{{ c.createdAt | date: 'mediumDate' }}</td>
                      </ng-container>
                      <tr mat-header-row *matHeaderRowDef="chargeCols"></tr>
                      <tr
                        mat-row
                        *matRowDef="let _; columns: chargeCols"
                        class="hover:bg-neutral-a2"
                      ></tr>
                    </table>
                  </div>
                  @if (charges().length === 0) {
                    <p class="py-8 text-center text-sm text-neutral-a9">No charges</p>
                  }
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      }
    </div>
  `,
})
export class CustomersDetailComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly customerApi = inject(CustomerApiService);
  private readonly paymentApi = inject(PaymentApiService);
  private readonly invoiceApi = inject(InvoiceApiService);
  private readonly creditApi = inject(CreditApiService);
  private readonly notificationApi = inject(NotificationApiService);
  private readonly planApi = inject(PlanApiService);
  private readonly bandwidthApi = inject(BandwidthApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly markingConnected = signal(false);
  readonly confirmingConnect = signal(false);
  readonly customer = signal<CustomerDto | null>(null);
  readonly activeRecharges = signal<RechargeDto[]>([]);
  readonly activePlan = signal<PlanDto | null>(null);
  readonly activeBandwidth = signal<BandwidthDto | null>(null);
  readonly assignedPlan = signal<AssignedPlanDto | null>(null);
  readonly sessionSummary = signal<CustomerSessionSummaryDto | null>(null);
  readonly payments = signal<PaymentDto[]>([]);
  readonly invoices = signal<InvoiceDto[]>([]);
  readonly credits = signal<CreditLedgerEntryDto[]>([]);
  readonly notifications = signal<NotificationDto[]>([]);
  readonly charges = signal<CustomerChargeDto[]>([]);
  readonly addingCharge = signal(false);

  customerId = '';

  readonly paymentCols = ['amount', 'provider', 'status', 'date'];
  readonly invoiceCols = ['invoiceNumber', 'amount', 'status', 'due'];
  readonly chargeCols = ['type', 'description', 'amount', 'status', 'date'];

  readonly chargeForm = this.fb.group({
    type: ['ADDITIONAL' as string, Validators.required],
    description: [''],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  protected readonly Math = Math;

  pendingChargesTotal(): number {
    return this.charges()
      .filter((c) => c.status !== 'CLEARED')
      .reduce((sum, c) => sum + c.remainingAmount, 0);
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();

    this.customerApi
      .openSessionStream(this.customerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sessionSummary) => {
        console.log(sessionSummary);
        this.sessionSummary.set(sessionSummary);
      });
  }

  load(): void {
    this.loading.set(true);
    this.customerApi.getById(this.customerId).subscribe({
      next: (c: CustomerDto) => {
        this.customer.set(c);
        this.loading.set(false);
        this.loadTabs();
        this.customerApi.getAssignedPlan(this.customerId).subscribe({
          next: (ap) => this.assignedPlan.set(ap),
          error: () => this.assignedPlan.set(null),
        });
      },
      error: () => this.loading.set(false),
    });
  }

  loadTabs(): void {
    this.customerApi.getActiveRecharges(this.customerId).subscribe((r) => {
      this.activeRecharges.set(r);
      const planId = r[0]?.planId;
      if (planId) {
        this.planApi.getById(planId).subscribe((plan) => {
          this.activePlan.set(plan);
          if (plan.bandwidthId) {
            this.bandwidthApi
              .getById(plan.bandwidthId)
              .subscribe((bw) => this.activeBandwidth.set(bw));
          }
        });
      }
    });
    this.paymentApi.getByCustomer(this.customerId).subscribe((p) => this.payments.set(p));
    this.invoiceApi.getByCustomer(this.customerId).subscribe((i) => this.invoices.set(i));
    this.creditApi.getHistory(this.customerId).subscribe((c) => this.credits.set(c));
    this.notificationApi.getByCustomer(this.customerId).subscribe((n) => this.notifications.set(n));
    this.customerApi.getAllCharges(this.customerId).subscribe((ch) => this.charges.set(ch));
  }

  doMarkConnected(): void {
    const c = this.customer();
    if (!c) return;
    this.markingConnected.set(true);
    this.customerApi.markConnected(c.id, true).subscribe({
      next: () => {
        this.customer.update((prev) => (prev ? { ...prev, connected: true } : prev));
        this.markingConnected.set(false);
        this.confirmingConnect.set(false);
        this.snackBar.open('Customer marked as connected', 'OK', { duration: 3000 });
      },
      error: () => {
        this.markingConnected.set(false);
        this.snackBar.open('Failed to mark as connected', 'Close', { duration: 3000 });
      },
    });
  }

  addCharge(): void {
    if (this.chargeForm.invalid) return;
    this.addingCharge.set(true);
    const v = this.chargeForm.value;
    this.customerApi
      .addCharge(this.customerId, {
        type: v.type as 'CONNECTION_FEE' | 'ADDITIONAL',
        description: v.description || undefined,
        amount: v.amount!,
      })
      .subscribe({
        next: (newCharge) => {
          this.charges.update((cs) => [...cs, newCharge]);
          this.chargeForm.reset({ type: 'ADDITIONAL', description: '', amount: null });
          this.addingCharge.set(false);
          this.snackBar.open('Charge added', 'OK', { duration: 3000 });
        },
        error: (err: { error?: { message?: string } }) => {
          this.addingCharge.set(false);
          this.snackBar.open(err?.error?.message ?? 'Failed to add charge', 'OK', {
            duration: 4000,
          });
        },
      });
  }

  formatSpeed(rate: number, unit: string): string {
    const u = (unit ?? '').toLowerCase();
    const kbps = u.startsWith('g')
      ? Math.round(rate * 1024 * 1024)
      : u.startsWith('m')
        ? Math.round(rate * 1024)
        : Math.round(rate);
    return kbps >= 1024 ? `${parseFloat((kbps / 1024).toFixed(1))} Mbps` : `${kbps} Kbps`;
  }

  riskClass(): string {
    const score = this.customer()?.riskScore ?? 0;
    if (score >= 70) return 'text-red-a11';
    if (score >= 40) return 'text-amber-a11';
    return 'text-green-a11';
  }
}
