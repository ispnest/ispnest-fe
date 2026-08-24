import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
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
import { MatTab, MatTabContent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { throwError } from 'rxjs';
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
  ServiceExtensionDto,
} from '@/app/domains/customers/data';
import { CustomerApiService } from '@/app/domains/customers/data/customer-api.service';
import { NotificationApiService } from '@/app/domains/notifications/data/notification-api.service';
import { NotificationGroupDto } from '@/app/domains/notifications/data/notification.model';
import { PaymentApiService } from '@/app/domains/payments/data/payment-api.service';
import { PaymentDto } from '@/app/domains/payments/data/payment.model';
import { BandwidthApiService, PlanApiService } from '@/app/domains/plans/data/plan-api.service';
import { BandwidthDto, PlanDto } from '@/app/domains/plans/data/plan.model';
import { ChannelStatusChipComponent } from '@/app/ui/channel-status-chip';
import { LoadingComponent } from '@/app/ui/loading/loading.component';
import { DataSizePipe } from '@/app/ui/pipes';
import { StatusBadgeComponent } from '@/app/ui/status-badge/status-badge.component';
import { CustomerUsageTabComponent } from './customer-usage-tab.component';

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
    MatCardHeader,
    MatCardContent,
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
    MatPaginator,
    MatTabGroup,
    MatTab,
    MatTabContent,
    CustomerUsageTabComponent,
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
    ChannelStatusChipComponent,
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
        <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent-a3">
          <mat-icon svgIcon="user-round" class="size-7 text-accent-a11" />
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-2xl font-semibold tracking-tight">{{ customer()?.fullName }}</h1>
          <p class="mt-0.5 flex flex-wrap items-center gap-x-1 text-sm text-neutral-a11">
            <span class="break-all">{{ customer()?.email }}</span>
            @if (customer()?.email && customer()?.phoneNumber) {
              <span>·</span>
            }
            <span>{{ customer()?.phoneNumber }}</span>
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
        @if (
          (!customer()!.connected && auth.hasPermission('CUSTOMERS_WRITE')) ||
          !customer()!.hasActiveRecharge
        ) {
          <div class="rounded-xl border border-amber-a6 bg-amber-a2 overflow-hidden">
            <div class="divide-y divide-amber-a5">
              <!-- Not Yet Connected -->
              @if (!customer()!.connected && auth.hasPermission('CUSTOMERS_WRITE')) {
                <div class="p-4">
                  <div class="flex items-start gap-3">
                    <div
                      class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-a4"
                    >
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
                      <button
                        matButton
                        class="primary shrink-0"
                        (click)="confirmingConnect.set(true)"
                      >
                        <mat-icon svgIcon="plug-zap" />
                        Mark Connected
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- No Active Subscription -->
              @if (!customer()!.hasActiveRecharge) {
                <div class="p-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-a4"
                    >
                      <mat-icon svgIcon="zap-off" class="size-5 text-amber-a11" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-amber-a11">No Active Subscription</p>
                      <p class="mt-0.5 text-sm text-neutral-a11">
                        This customer has no active recharge.
                      </p>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Info cards -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-a3"
                >
                  <mat-icon svgIcon="user-round" class="size-4 text-primary-a11" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  Account Info
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
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
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-a3"
                >
                  <mat-icon svgIcon="lock-keyhole" class="size-4 text-violet-a11" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  PPPoE Credentials
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
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
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-a3"
                >
                  <mat-icon svgIcon="shield" class="size-4 text-amber-a11" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  Risk Score
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div
                class="mt-2 text-4xl font-bold tabular-nums tracking-tight"
                [class]="riskClass()"
              >
                {{ customer()?.riskScore ?? 'N/A' }}
              </div>
              <div class="mt-1 text-sm text-neutral-a11">
                Last updated:
                {{ customer()?.riskLastUpdated | date: 'medium' }}
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Live Session Panel -->
        @if (sessionSummary()) {
          @let s = sessionSummary()!;
          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex w-full items-center justify-between">
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
            </mat-card-header>
            <mat-card-content>
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
            </mat-card-content>
          </mat-card>
        }

        <!-- Tabs -->
        <mat-card>
          <mat-tab-group dynamicHeight>
            <mat-tab label="Subscription">
              <div class="space-y-3 p-4">
                <!-- Subscription card -->
                @if (activeRecharges().length === 0 && !assignedPlan()) {
                  <div class="flex flex-col items-center py-8 text-center">
                    <mat-icon svgIcon="zap-off" class="mb-2 size-8 text-neutral-a6" />
                    <p class="text-sm text-neutral-a9">No active recharge session</p>
                  </div>
                }
                @for (r of activeRecharges(); track r.id) {
                  <div class="rounded-xl border border-neutral-a5 bg-neutral-a2 p-4">
                    <div class="flex items-center gap-2">
                      <div
                        class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-a3"
                      >
                        <mat-icon svgIcon="zap" class="size-4 text-primary-a11" />
                      </div>
                      <span class="text-xs font-semibold uppercase tracking-widest text-neutral-a9"
                        >Active Subscription</span
                      >
                      <app-status-badge class="ml-auto" [status]="r.status" />
                    </div>

                    <div class="mt-3 flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="truncate font-semibold">
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
                      <div class="shrink-0 text-right">
                        <p class="text-xs text-neutral-a9">Expires</p>
                        <p class="mt-0.5 text-sm font-medium">
                          {{ r.expiration | date: 'medium' }}
                        </p>
                      </div>
                    </div>

                    @if (activeBandwidth()) {
                      <div class="mt-3 flex flex-wrap items-center gap-2">
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

                    @if (assignedPlan() && assignedPlan()!.plan.planId !== r.planId) {
                      <div class="mt-3 flex items-center gap-2 rounded-lg bg-amber-a3 px-3 py-2">
                        <mat-icon svgIcon="bookmark" class="size-3.5 shrink-0 text-amber-a11" />
                        <span class="text-xs text-amber-a11">
                          Switches to
                          <span class="font-semibold">{{ assignedPlan()!.plan.planName }}</span>
                          on next renewal
                        </span>
                      </div>
                    }
                  </div>
                }
                @if (activeRecharges().length === 0 && assignedPlan(); as ap) {
                  <div class="rounded-xl border border-primary-a5 bg-primary-a2 p-4">
                    <div class="flex items-center gap-2">
                      <div
                        class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-a4"
                      >
                        <mat-icon svgIcon="bookmark" class="size-4 text-primary-a11" />
                      </div>
                      <span class="text-xs font-semibold uppercase tracking-widest text-primary-a11"
                        >Assigned Plan</span
                      >
                    </div>
                    <div class="mt-3">
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

                @if (auth.hasPermission('CUSTOMERS_EXTEND_SERVICE')) {
                  <div class="rounded-xl border border-neutral-a5 p-4 space-y-3">
                    <div class="flex items-center justify-between gap-2">
                      <div>
                        <h3 class="text-sm font-semibold">Extend Service</h3>
                        @if (!showExtendForm()) {
                          <p class="text-xs text-neutral-a9">
                            Grant free days with a reason (promotion, outage compensation,
                            goodwill).
                          </p>
                        }
                      </div>
                      @if (!showExtendForm()) {
                        <button
                          matButton
                          class="shrink-0"
                          type="button"
                          (click)="showExtendForm.set(true)"
                        >
                          <mat-icon svgIcon="calendar-plus" />
                          Extend Service
                        </button>
                      }
                    </div>
                    @if (showExtendForm()) {
                      <p class="text-xs text-neutral-a9">
                        Extends the active recharge, or activates the default plan when none is
                        active.
                      </p>
                      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <mat-form-field>
                          <mat-label>Days</mat-label>
                          <input
                            matInput
                            type="number"
                            min="1"
                            max="365"
                            [formControl]="extendForm.controls.days"
                          />
                          <mat-error>Between 1 and 365 days</mat-error>
                        </mat-form-field>
                        <mat-form-field>
                          <mat-label>Reason</mat-label>
                          <input matInput [formControl]="extendForm.controls.reason" />
                          <mat-error>Reason is required</mat-error>
                        </mat-form-field>
                      </div>
                      <div class="flex justify-end gap-2">
                        <button matButton type="button" (click)="showExtendForm.set(false)">
                          Cancel
                        </button>
                        <button
                          matButton
                          class="primary"
                          type="button"
                          [disabled]="extendForm.invalid || extending()"
                          (click)="extendService()"
                        >
                          {{ extending() ? 'Extending…' : 'Extend Service' }}
                        </button>
                      </div>
                    }
                    @if (serviceExtensions().length > 0) {
                      <div class="space-y-1 pt-1">
                        <p class="text-xs font-medium text-neutral-a11">Past extensions</p>
                        @for (e of serviceExtensions(); track e.id) {
                          <p class="text-xs text-neutral-a9">
                            +{{ e.days }}d — {{ e.reason }} ({{ e.grantedBy ?? 'system' }},
                            {{ e.createdAt | date: 'mediumDate' }})
                          </p>
                        }
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
                  @if (payments().length === 0) {
                    <p class="py-8 text-center text-sm text-neutral-a9">No payments</p>
                  }
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
                  @if (invoices().length === 0) {
                    <p class="py-8 text-center text-sm text-neutral-a9">No invoices</p>
                  }
                </div>
              </div>
            </mat-tab>

            <mat-tab label="Notifications">
              <div class="space-y-2 p-4">
                @for (n of notifications(); track n.groupId) {
                  <div class="rounded-lg border p-3">
                    <div class="mb-1 flex items-center gap-2">
                      <span
                        class="rounded bg-primary-a3 px-2 py-0.5 text-xs font-medium text-primary-a11 lowercase"
                        >{{ n.category }}</span
                      >
                      <span class="ml-auto text-xs text-neutral-a9">{{
                        n.createdAt | date: 'medium'
                      }}</span>
                    </div>
                    <p class="mb-2 text-sm">{{ n.body }}</p>
                    <div class="flex flex-wrap gap-1">
                      @for (entry of n.channels; track entry.notificationId) {
                        <app-channel-status-chip
                          [channel]="entry.channel"
                          [status]="entry.status"
                        />
                      }
                    </div>
                  </div>
                }
                @if (notifications().length === 0) {
                  <p class="text-sm text-neutral-a9">No notifications</p>
                }
              </div>
              <mat-paginator
                class="px-3"
                [length]="notifTotalElements()"
                [pageSize]="notifPageSize"
                [pageSizeOptions]="[10, 20, 50]"
                (page)="onNotifPage($event)"
                showFirstLastButtons
              />
            </mat-tab>

            <mat-tab [label]="pendingChargesLabel()">
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
                @if (adjustingChargeId()) {
                  <div class="rounded-xl border border-amber-a6 bg-amber-a2 p-4 space-y-3">
                    <h3 class="text-sm font-semibold">Adjust Charge</h3>
                    @if (adjustingChargeTarget(); as ac) {
                      <p class="text-xs text-neutral-a9">
                        {{
                          ac.description ??
                            (ac.type === 'CONNECTION_FEE' ? 'Connection Fee' : 'Additional charge')
                        }}
                        · {{ ac.createdAt | date: 'mediumDate' }} ·
                        <span class="font-medium text-neutral-a11"
                          >KES {{ ac.amount | number: '1.2-2' }}</span
                        >
                      </p>
                    }
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <mat-form-field>
                        <mat-label>New Amount (KES, 0 waives)</mat-label>
                        <input
                          matInput
                          type="number"
                          min="0"
                          [formControl]="adjustForm.controls.amount"
                        />
                        <mat-error>Required, 0 or more</mat-error>
                      </mat-form-field>
                      <mat-form-field>
                        <mat-label>Reason</mat-label>
                        <input matInput [formControl]="adjustForm.controls.reason" />
                        <mat-error>Reason is required</mat-error>
                      </mat-form-field>
                    </div>
                    <div class="flex justify-end gap-2">
                      <button matButton type="button" (click)="cancelAdjust()">Cancel</button>
                      <button
                        matButton
                        class="primary"
                        type="button"
                        [disabled]="adjustForm.invalid || adjustingCharge()"
                        (click)="submitAdjust()"
                      >
                        {{
                          adjustingCharge()
                            ? 'Saving…'
                            : adjustForm.value.amount === 0
                              ? 'Waive Charge'
                              : 'Adjust Charge'
                        }}
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
                        <td mat-cell *matCellDef="let c">
                          {{ c.description ?? '—' }}
                          @if (c.adjustmentReason) {
                            <p class="text-xs text-amber-a11">
                              {{ c.adjustmentReason }} — {{ c.adjustedBy }}
                            </p>
                          }
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="amount">
                        <th mat-header-cell *matHeaderCellDef>Amount</th>
                        <td mat-cell *matCellDef="let c" class="tabular-nums">
                          KES {{ c.amount | number: '1.2-2' }}
                          @if (c.originalAmount !== null && c.originalAmount !== c.amount) {
                            <span class="ml-1 text-xs text-neutral-a9 line-through"
                              >KES {{ c.originalAmount | number: '1.2-2' }}</span
                            >
                          }
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef></th>
                        <td mat-cell *matCellDef="let c">
                          @if (
                            c.status === 'PENDING' && auth.hasPermission('CUSTOMERS_ADJUST_CHARGE')
                          ) {
                            <button matButton type="button" (click)="startAdjust(c)">Adjust</button>
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

            <mat-tab label="Usage">
              <ng-template matTabContent>
                <app-customer-usage-tab [customerId]="customerId" />
              </ng-template>
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
  readonly notifications = signal<NotificationGroupDto[]>([]);
  readonly notifTotalElements = signal(0);
  readonly charges = signal<CustomerChargeDto[]>([]);
  readonly addingCharge = signal(false);

  customerId = '';
  username = '';
  notifPageIndex = 0;
  notifPageSize = 20;

  readonly paymentCols = ['amount', 'provider', 'status', 'date'];
  readonly invoiceCols = ['invoiceNumber', 'amount', 'status', 'due'];
  readonly chargeCols = ['type', 'description', 'amount', 'status', 'date', 'actions'];

  readonly chargeForm = this.fb.group({
    type: ['ADDITIONAL' as string, Validators.required],
    description: [''],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  readonly adjustingChargeId = signal<string | null>(null);
  readonly adjustingChargeTarget = signal<CustomerChargeDto | null>(null);
  readonly adjustingCharge = signal(false);
  readonly adjustForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0)]],
    reason: ['', Validators.required],
  });

  readonly extending = signal(false);
  readonly showExtendForm = signal(false);
  readonly serviceExtensions = signal<ServiceExtensionDto[]>([]);
  readonly extendForm = this.fb.group({
    days: [7, [Validators.required, Validators.min(1), Validators.max(365)]],
    reason: ['promotion', Validators.required],
  });

  protected readonly Math = Math;

  pendingChargesTotal(): number {
    return this.charges()
      .filter((c) => c.status === 'PENDING')
      .reduce((sum, c) => sum + c.amount, 0);
  }

  pendingChargesLabel(): string {
    const total = this.pendingChargesTotal();
    if (total <= 0) return 'Charges';
    const formatted = total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `Charges (KES ${formatted})`;
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.username = this.route.snapshot.paramMap.get('username') ?? '';
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const fetchCustomer = () => {
      if (this.customerId) {
        return this.customerApi.getById(this.customerId);
      } else if (this.username) {
        return this.customerApi.getByUsername(this.username);
      } else {
        return throwError(() => new Error('No customer ID or username provided'));
      }
    };

    fetchCustomer().subscribe({
      next: (c: CustomerDto) => {
        this.customerId = c.id;
        this.username = c.accountCode;
        this.customer.set(c);
        this.loading.set(false);
        this.loadTabs();
        this.loadSessionSummary();
        this.customerApi.getAssignedPlan(this.customerId).subscribe({
          next: (ap) => this.assignedPlan.set(ap),
          error: () => this.assignedPlan.set(null),
        });
      },
      error: () => this.loading.set(false),
    });
  }

  loadSessionSummary(): void {
    this.customerApi
      .openSessionStream(this.customerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sessionSummary) => {
        console.log(sessionSummary);
        this.sessionSummary.set(sessionSummary);
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
    this.loadNotifications();
    this.customerApi.getAllCharges(this.customerId).subscribe((ch) => this.charges.set(ch));
    this.customerApi
      .getServiceExtensions(this.customerId)
      .subscribe((es) => this.serviceExtensions.set(es));
  }

  loadNotifications(): void {
    this.notificationApi
      .getByCustomer(this.customerId, this.notifPageIndex, this.notifPageSize)
      .subscribe((page) => {
        this.notifications.set(page.content);
        this.notifTotalElements.set(page.page.totalElements);
      });
  }

  onNotifPage(e: PageEvent): void {
    this.notifPageIndex = e.pageIndex;
    this.notifPageSize = e.pageSize;
    this.loadNotifications();
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

  startAdjust(c: CustomerChargeDto): void {
    this.adjustingChargeId.set(c.id);
    this.adjustingChargeTarget.set(c);
    this.adjustForm.reset({ amount: c.amount, reason: '' });
  }

  cancelAdjust(): void {
    this.adjustingChargeId.set(null);
    this.adjustingChargeTarget.set(null);
  }

  submitAdjust(): void {
    const chargeId = this.adjustingChargeId();
    if (!chargeId || this.adjustForm.invalid) return;
    this.adjustingCharge.set(true);
    const v = this.adjustForm.value;
    this.customerApi
      .adjustCharge(this.customerId, chargeId, { amount: v.amount!, reason: v.reason! })
      .subscribe({
        next: (updated) => {
          this.charges.update((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
          this.adjustingCharge.set(false);
          this.adjustingChargeId.set(null);
          this.adjustingChargeTarget.set(null);
          this.snackBar.open(
            updated.status === 'CLEARED' ? 'Charge waived' : 'Charge adjusted',
            'OK',
            { duration: 3000 },
          );
        },
        error: (err: { error?: { detail?: string; message?: string } }) => {
          this.adjustingCharge.set(false);
          this.snackBar.open(
            err?.error?.detail ?? err?.error?.message ?? 'Failed to adjust charge',
            'OK',
            { duration: 4000 },
          );
        },
      });
  }

  extendService(): void {
    if (this.extendForm.invalid) return;
    this.extending.set(true);
    const v = this.extendForm.value;
    const active = this.activeRecharges()[0];
    const assigned = this.assignedPlan();
    const planId = active?.planId ?? assigned?.plan.planId ?? undefined;
    const type = active?.type ?? (assigned ? this.customer()?.serviceType : undefined) ?? undefined;
    this.customerApi
      .extendService(this.customerId, { days: v.days!, reason: v.reason!, planId, type })
      .subscribe({
        next: (ext) => {
          this.extending.set(false);
          this.showExtendForm.set(false);
          this.serviceExtensions.update((es) => [ext, ...es]);
          this.extendForm.reset({ days: 7, reason: 'promotion' });
          this.snackBar.open(`Service extended by ${ext.days} days`, 'OK', { duration: 3000 });
          this.load();
        },
        error: (err: { error?: { detail?: string; message?: string } }) => {
          this.extending.set(false);
          this.snackBar.open(
            err?.error?.detail ?? err?.error?.message ?? 'Failed to extend service',
            'OK',
            { duration: 4000 },
          );
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
