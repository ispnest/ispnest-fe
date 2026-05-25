import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { CustomerDto, RechargeDto, CustomerSessionSummaryDto } from '@/app/domains/customers/data';
import { PaymentDto } from '@/app/domains/payments/data';
import { PlanDto } from '@/app/domains/plans/data';
import { PortalApiService } from '@/app/domains/portal/data';
import { ActiveTechnicianDto } from '@/app/domains/technician/data/staff.model';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

function daysUntil(isoDate: string | null): number | null {
  if (!isoDate) return null;
  return Math.ceil((new Date(isoDate).getTime() - Date.now()) / 86_400_000);
}

@Component({
  selector: 'app-portal-account-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressBar,
    MatTabGroup,
    MatTab,
    MatTooltip,
    StatusBadgeComponent,
    LoadingComponent,
  ],
  template: `
    <div class="min-h-screen bg-neutral-a2">
      <!-- Header -->
      <div class="bg-primary px-4 py-4 text-primary-contrast">
        <div class="mx-auto flex max-w-lg items-center gap-3">
          <a matIconButton routerLink="/portal/dashboard" class="text-inherit">
            <mat-icon svgIcon="arrow-left" />
          </a>
          <div class="flex-1">
            <div class="text-xs font-medium uppercase tracking-widest opacity-70">Account</div>
            <h1 class="font-bold">{{ account()?.accountCode ?? 'Loading…' }}</h1>
          </div>
          <!-- Live session status badge (SSE-driven) -->
          @if (liveStatus() === 'online') {
            <span class="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
              <span class="size-1.5 animate-pulse rounded-full bg-green-400"></span>
              Online
            </span>
          } @else if (liveStatus() === 'offline') {
            <span class="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium opacity-70">
              <span class="size-1.5 rounded-full bg-neutral-400"></span>
              Offline
            </span>
          } @else if (account()?.connected) {
            <span class="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
              <span class="size-1.5 rounded-full bg-green-400"></span>
              Online
            </span>
          }
        </div>
      </div>

      <div class="mx-auto max-w-lg space-y-4 px-4 py-6">
        <app-loading [loading]="loading()" />

        @if (!loading() && account() && !account()!.connected) {
          <div class="flex items-start gap-3 rounded-xl border border-neutral-a6 bg-neutral-a2 p-4">
            <mat-icon svgIcon="info" class="mt-0.5 size-5 shrink-0 text-neutral-a11" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium">Your connection is being set up</p>
              @if (activeTechnician()) {
                <p class="mt-1 text-sm text-neutral-a11">
                  Contact
                  <a [href]="'tel:' + activeTechnician()!.phoneNumber"
                     class="font-medium text-primary-a11 hover:underline">
                    {{ activeTechnician()!.name }}
                  </a>
                  to get connected.
                  @if (activeTechnician()!.phoneNumber) {
                    <span class="ml-1 text-neutral-a9">({{ activeTechnician()!.phoneNumber }})</span>
                  }
                </p>
              } @else {
                <p class="mt-1 text-sm text-neutral-a11">Contact support to get your line connected.</p>
              }
            </div>
          </div>
        }

        @if (!loading() && account()) {
          <!-- Account info card -->
          <mat-card class="p-5">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="text-lg font-semibold">{{ account()!.fullName }}</div>
                <div class="mt-0.5 flex items-center gap-2 text-sm text-neutral-a11">
                  <mat-icon svgIcon="hash" class="size-4 shrink-0" />
                  <span class="font-mono">{{ account()!.accountCode }}</span>
                </div>
              </div>
              <app-status-badge [status]="account()!.status" />
            </div>
            <div class="mt-3 flex items-center gap-2 text-xs text-neutral-a9">
              <mat-icon svgIcon="calendar" class="size-3.5" />
              Member since {{ account()!.createdAt | date: 'mediumDate' }}
            </div>

            <!-- Live session info (IP, last seen, disconnect reason) -->
            @if (sessionSummary()) {
              <div class="mt-3 space-y-1.5 border-t border-neutral-a4 pt-3">
                @if (sessionSummary()!.framedIpAddress) {
                  <div class="flex items-center gap-2 text-xs">
                    <mat-icon svgIcon="network" class="size-3.5 shrink-0 text-neutral-a9" />
                    <span class="text-neutral-a9">IP:</span>
                    <span class="font-mono text-neutral-a11">{{ sessionSummary()!.framedIpAddress }}</span>
                  </div>
                }
                @if (sessionSummary()!.lastSeen) {
                  <div class="flex items-center gap-2 text-xs text-neutral-a9">
                    <mat-icon svgIcon="clock" class="size-3.5 shrink-0" />
                    <span>Last seen {{ sessionSummary()!.lastSeen | date: 'HH:mm, d MMM' }}</span>
                  </div>
                }
                @if (liveStatus() === 'offline' && sessionSummary()!.lastDisconnectReason) {
                  <div class="flex items-center gap-2 text-xs text-amber-a11">
                    <mat-icon svgIcon="alert-triangle" class="size-3.5 shrink-0" />
                    <span>Disconnected: {{ sessionSummary()!.lastDisconnectReason }}</span>
                  </div>
                }
                @if ((sessionSummary()!.disconnectCount ?? 0) > 0) {
                  <div class="flex items-center gap-2 text-xs text-neutral-a9"
                       [matTooltip]="'Session reconnections since last recharge'">
                    <mat-icon svgIcon="refresh-cw" class="size-3.5 shrink-0" />
                    <span>{{ sessionSummary()!.disconnectCount }} reconnection{{ sessionSummary()!.disconnectCount === 1 ? '' : 's' }}</span>
                  </div>
                }
              </div>
            }
          </mat-card>

          <!-- Active plan card -->
          @if (activeRecharge()) {
            <mat-card class="p-5">
              <h2 class="mb-3 flex items-center gap-2 font-semibold">
                <mat-icon svgIcon="zap" class="text-primary-a11" />
                Current Plan
              </h2>

              @if (plan()) {
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium">{{ plan()!.name }}</div>
                    <div class="mt-0.5 text-sm text-neutral-a11">
                      {{ plan()!.validity }} {{ plan()!.validityUnit }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-primary-a11">
                      KES {{ plan()!.price | number: '1.0-0' }}
                    </div>
                  </div>
                </div>
              }

              <!-- Expiry -->
              <div class="mt-3 flex items-center justify-between text-sm">
                <span class="text-neutral-a11">Expires</span>
                @if (daysLeft() !== null) {
                  <span [class]="expiryColorClass()">
                    {{ activeRecharge()!.expiration | date: 'mediumDate' }}
                    @if (daysLeft()! < 0) {
                      (Expired)
                    } @else if (daysLeft()! === 0) {
                      (Today)
                    } @else {
                      ({{ daysLeft() }} days left)
                    }
                  </span>
                } @else {
                  <span class="text-neutral-a9">—</span>
                }
              </div>

              <!-- Data usage — live from SSE when available, else from recharge -->
              @if (showUsage()) {
                <div class="mt-4">
                  <div class="mb-1 flex items-center justify-between text-xs text-neutral-a9">
                    <span class="flex items-center gap-1">
                      Data Used
                      @if (sessionSummary()) {
                        <mat-icon svgIcon="radio" class="size-3 text-green-a9"
                                  matTooltip="Live data from active session" />
                      }
                    </span>
                    <span>
                      {{ displayUsedMb() | number: '1.0-1' }} MB used
                      @if (totalMb() > 0) {
                        / {{ totalMb() | number: '1.0-0' }} MB
                      }
                    </span>
                  </div>
                  <mat-progress-bar
                    mode="determinate"
                    [value]="usagePercent()"
                    [color]="usagePercent() > 80 ? 'warn' : 'primary'"
                  />
                  @if (sessionSummary() && liveStatus() === 'online') {
                    <div class="mt-1.5 flex items-center justify-between text-[10px] text-neutral-a9">
                      <span>↓ {{ sessionSummary()!.currentRechargeInputMb ?? 0 | number: '1.0-1' }} MB in</span>
                      <span>↑ {{ sessionSummary()!.currentRechargeOutputMb ?? 0 | number: '1.0-1' }} MB out</span>
                    </div>
                  }
                </div>
              }

              <app-status-badge class="mt-3" [status]="activeRecharge()!.status" />
            </mat-card>
          } @else {
            <mat-card class="p-5 text-center">
              <mat-icon svgIcon="zap-off" class="mb-2 size-8 text-neutral-a6" />
              <p class="text-sm text-neutral-a11">No active plan. Subscribe to stay connected.</p>
            </mat-card>
          }

          <!-- CTA buttons -->
          <div class="grid grid-cols-2 gap-3">
            <a
              [routerLink]="account()!.connected ? ['/portal/payment'] : null"
              [queryParams]="
                account()!.connected
                  ? account()!.defaultPlanRouterId
                    ? { customerId: account()!.id, planRouterId: account()!.defaultPlanRouterId }
                    : { customerId: account()!.id }
                  : null
              "
              [disabled]="!account()!.connected"
              matButton
              class="primary flex h-auto flex-col items-center gap-1 py-4"
            >
              <mat-icon svgIcon="credit-card" />
              <span class="text-xs">Pay Now</span>
            </a>
            @if (account()!.defaultPlanRouterId) {
              <a
                [routerLink]="account()!.connected ? ['/portal/upgrade'] : null"
                [queryParams]="
                  account()!.connected
                    ? {
                        planRouterId: account()!.defaultPlanRouterId,
                        customerId: account()!.id,
                        planId: activeRecharge()?.planId ?? null,
                      }
                    : null
                "
                [disabled]="!account()!.connected"
                matButton
                class="flex h-auto flex-col items-center gap-1 py-4"
              >
                <mat-icon svgIcon="arrow-up-circle" />
                <span class="text-xs">Upgrade Plan</span>
              </a>
            }
          </div>

          <!-- Tabs: Payment history -->
          <mat-tab-group>
            <mat-tab label="Payment History">
              <div class="py-3">
                @if (payments().length === 0) {
                  <p class="py-4 text-center text-sm text-neutral-a11">No payments found</p>
                }
                @for (p of payments(); track p.id) {
                  <div class="flex items-center justify-between border-b py-2.5 last:border-0">
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
                @if (hasMorePayments()) {
                  <button matButton class="mt-2 w-full text-sm" (click)="loadMorePayments()">
                    Load more
                  </button>
                }
              </div>
            </mat-tab>
          </mat-tab-group>
        }
      </div>
    </div>
  `,
})
export class PortalAccountDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly portalApi = inject(PortalApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly account = signal<CustomerDto | null>(null);
  readonly activeRecharge = signal<RechargeDto | null>(null);
  readonly plan = signal<PlanDto | null>(null);
  readonly payments = signal<PaymentDto[]>([]);
  readonly hasMorePayments = signal(false);
  readonly activeTechnician = signal<ActiveTechnicianDto | null>(null);
  readonly sessionSummary = signal<CustomerSessionSummaryDto | null>(null);

  private currentPage = 0;
  private customerId = '';

  readonly liveStatus = computed(() => {
    const s = this.sessionSummary();
    if (!s) return null;
    return s.sessionStatus; // "online" | "offline" | "unknown"
  });

  readonly daysLeft = computed(() => {
    const r = this.activeRecharge();
    if (!r) return null;
    return daysUntil(r.expiration);
  });

  readonly expiryColorClass = computed(() => {
    const d = this.daysLeft();
    if (d === null) return 'text-neutral-a9';
    if (d < 0) return 'font-medium text-red-a11';
    if (d <= 7) return 'font-medium text-amber-a11';
    return 'font-medium text-success-a11';
  });

  /** Total MB for progress bar — from recharge floor values */
  readonly totalMb = computed(() => {
    const r = this.activeRecharge();
    if (!r) return 0;
    return (r.usedMb ?? 0) + (r.remainingMb ?? 0);
  });

  /**
   * Used MB to display — prefers live SSE octets when a session summary is present,
   * falls back to the billed `usedMb` from the recharge record.
   */
  readonly displayUsedMb = computed(() => {
    const s = this.sessionSummary();
    if (s && (s.currentRechargeInputMb !== null || s.currentRechargeOutputMb !== null)) {
      return (s.currentRechargeInputMb ?? 0) + (s.currentRechargeOutputMb ?? 0);
    }
    return this.activeRecharge()?.usedMb ?? 0;
  });

  readonly showUsage = computed(() => {
    const r = this.activeRecharge();
    const s = this.sessionSummary();
    // Show if recharge has data limits OR if SSE gave us live MB values
    return (
      r !== null &&
      (r.remainingMb !== null ||
        r.usedMb !== null ||
        s?.currentRechargeInputMb !== null ||
        s?.currentRechargeOutputMb !== null)
    );
  });

  readonly usagePercent = computed(() => {
    const total = this.totalMb();
    if (!total) return 0;
    return Math.min(100, Math.round((this.displayUsedMb() / total) * 100));
  });

  protected readonly daysUntil = daysUntil;

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.customerId) {
      this.router.navigate(['/portal/dashboard']);
      return;
    }

    this.portalApi.getActiveTechnician().subscribe({
      next: (t) => this.activeTechnician.set(t),
      error: () => {},
    });

    this.portalApi
      .getMyAccounts()
      .pipe(
        switchMap((accounts) => {
          const account = accounts.find((a) => a.id === this.customerId);
          if (!account) {
            this.router.navigate(['/portal/dashboard']);
            return of(null);
          }
          this.account.set(account);
          return forkJoin({
            recharges: this.portalApi.getActiveRecharges(this.customerId),
            payments: this.portalApi.getPayments(this.customerId, 0, 5),
          });
        }),
      )
      .subscribe({
        next: (result) => {
          if (!result) return;
          this.loading.set(false);
          const recharge = result.recharges[0] ?? null;
          this.activeRecharge.set(recharge);
          this.payments.set(result.payments.content);
          this.hasMorePayments.set(result.payments.page.totalPages > 1);

          if (recharge?.planId) {
            this.portalApi.getPlan(recharge.planId).subscribe((p) => this.plan.set(p));
          }

          // Open SSE session stream — prefills MB usage and live status
          this.portalApi
            .openSessionStream(this.customerId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (summary) => this.sessionSummary.set(summary),
              error: () => {}, // gracefully ignore stream errors
            });
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/portal/dashboard']);
        },
      });
  }

  loadMorePayments(): void {
    this.currentPage++;
    this.portalApi.getPayments(this.customerId, this.currentPage, 5).subscribe((page) => {
      this.payments.update((prev) => [...prev, ...page.content]);
      this.hasMorePayments.set(this.currentPage + 1 < page.page.totalPages);
    });
  }
}
