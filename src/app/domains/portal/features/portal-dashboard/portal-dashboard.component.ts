import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { CustomerDto } from '@/app/domains/customers/data';
import { PaymentDto } from '@/app/domains/payments/data';
import { PortalApiService } from '@/app/domains/portal/data';
import { ActiveTechnicianDto } from '@/app/domains/technician/data/staff.model';
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
    <div class="min-h-screen bg-neutral-a2 pb-16 lg:pb-0">
      <!-- Header bar -->
      <div class="bg-primary px-4 py-5 text-primary-contrast">
        <div class="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div>
            <div class="text-xs font-medium uppercase tracking-widest opacity-75">
              Customer Portal
            </div>
            <h1 class="mt-0.5 text-xl font-bold">
              {{ auth.currentUser()?.displayName ?? 'My Accounts' }}
            </h1>
          </div>
          <div class="flex items-center gap-1">
            <a
              routerLink="/portal/notifications"
              matIconButton
              title="Notifications"
              class="relative text-white/80 hover:text-white"
            >
              <mat-icon svgIcon="bell" />
              @if (unreadCount() > 0) {
                <span
                  class="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                >
                  {{ unreadCount() > 9 ? '9+' : unreadCount() }}
                </span>
              }
            </a>
            <a
              routerLink="/portal/settings"
              matIconButton
              title="Settings"
              class="text-white/80 hover:text-white"
            >
              <mat-icon svgIcon="settings" />
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

      <div class="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <app-loading [loading]="loading()" />

        @if (!loading()) {
          <!-- Not connected banner -->
          @if (!canPayNow()) {
            <div
              class="flex items-start gap-3 rounded-xl border border-neutral-a6 bg-neutral-a2 p-4"
            >
              <mat-icon svgIcon="info" class="mt-0.5 size-5 shrink-0 text-neutral-a11" />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium">Your connection is being set up</p>
                @if (activeTechnician()) {
                  <p class="mt-1 text-sm text-neutral-a11">
                    Contact
                    <a
                      [href]="'tel:' + activeTechnician()!.phoneNumber"
                      class="font-medium text-primary-a11 hover:underline"
                    >
                      {{ activeTechnician()!.name }}
                    </a>
                    to get connected.
                    @if (activeTechnician()!.phoneNumber) {
                      <span class="ml-1 text-neutral-a9"
                        >({{ activeTechnician()!.phoneNumber }})</span
                      >
                    }
                  </p>
                } @else {
                  <p class="mt-1 text-sm text-neutral-a11">
                    Contact support to get your line connected.
                  </p>
                }
              </div>
            </div>
          }

          <!-- My Accounts -->
          <section>
            <h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-a9">
              My Accounts
            </h2>
            @if (accounts().length === 0) {
              <mat-card class="p-8 text-center">
                <mat-icon svgIcon="wifi-off" class="mb-3 size-10 text-neutral-a6" />
                <p class="text-neutral-a11">No active accounts found.</p>
              </mat-card>
            }
            <div class="grid gap-4 sm:grid-cols-2">
              @for (account of accounts(); track account.id) {
                <mat-card
                  class="cursor-pointer p-5 transition hover:ring-2 hover:ring-primary-a9"
                  (click)="router.navigate(['/portal/accounts', account.id])"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <div
                        class="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-a9"
                      >
                        {{ account.accountCode }}
                      </div>
                      <div class="mt-0.5 text-base font-semibold">{{ account.fullName }}</div>
                    </div>
                    @if (account.connected) {
                      <span
                        class="flex shrink-0 items-center gap-1 rounded-full bg-success-a3 px-2 py-0.5 text-xs font-medium text-success-a11"
                      >
                        <span class="size-1.5 rounded-full bg-success-a11"></span>Online
                      </span>
                    } @else {
                      <span
                        class="flex shrink-0 items-center gap-1 rounded-full bg-neutral-a3 px-2 py-0.5 text-xs font-medium text-neutral-a9"
                      >
                        <span class="size-1.5 rounded-full bg-neutral-a9"></span>Offline
                      </span>
                    }
                  </div>
                  <div class="mt-3 flex items-center gap-2">
                    <app-status-badge [status]="account.status" />
                    <span class="text-xs capitalize text-neutral-a9">{{
                      account.serviceType
                    }}</span>
                  </div>
                  <div class="mt-3 flex items-center justify-end text-xs text-primary-a10">
                    View account <mat-icon svgIcon="chevron-right" class="size-3.5" />
                  </div>
                </mat-card>
              }
            </div>
          </section>

          <!-- Recent Payments -->
          <section>
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-neutral-a9">
                Recent Payments
              </h2>
              @if (accounts().length > 0) {
                <a
                  [routerLink]="['/portal/accounts', accounts()[0].id]"
                  class="text-xs text-primary-a10 hover:text-primary-a11"
                  >View all</a
                >
              }
            </div>
            <mat-card class="p-4">
              @if (recentPayments().length === 0) {
                <p class="py-4 text-center text-sm text-neutral-a11">No payments yet</p>
              }
              @for (p of recentPayments(); track p.id) {
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
            </mat-card>
          </section>

          <!-- Quick actions -->
          <section class="grid grid-cols-2 gap-3">
            <!-- Pay Now: single account → direct; multiple → inline picker -->
            <button
              matButton
              class="primary flex h-auto flex-col items-center gap-1 py-4"
              [disabled]="!canPayNow()"
              (click)="onPayNow()"
            >
              <mat-icon svgIcon="credit-card" />
              <span class="text-xs">Pay Now</span>
            </button>
            <a
              routerLink="/portal/notifications"
              matButton
              class="flex h-auto flex-col items-center gap-1 py-4"
            >
              <mat-icon svgIcon="bell" />
              <span class="text-xs">Notifications</span>
            </a>
          </section>

          <!-- Account picker -->
          @if (showAccountPicker()) {
            <div
              class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
              role="button"
              tabindex="0"
              (click)="showAccountPicker.set(false)"
              (keydown.escape)="showAccountPicker.set(false)"
              (keydown.enter)="showAccountPicker.set(false)"
            >
              <mat-card
                class="w-full max-w-sm rounded-b-none rounded-t-2xl p-5 sm:rounded-2xl"
                (click)="$event.stopPropagation()"
              >
                <div class="mb-4 flex items-center justify-between">
                  <h3 class="font-semibold">Select account to pay</h3>
                  <button matIconButton (click)="showAccountPicker.set(false)">
                    <mat-icon svgIcon="x" />
                  </button>
                </div>
                @for (account of accounts(); track account.id) {
                  @if (account.connected) {
                    <button
                      matButton
                      class="mb-2 flex w-full items-center justify-between rounded-xl border border-neutral-a6 px-4 py-3 text-left hover:bg-neutral-a2"
                      (click)="payForAccount(account)"
                    >
                      <div>
                        <div class="font-mono text-xs text-neutral-a9">
                          {{ account.accountCode }}
                        </div>
                        <div class="font-medium">{{ account.fullName }}</div>
                      </div>
                      <span class="text-xs text-success-a11">Online</span>
                    </button>
                  }
                }
              </mat-card>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class PortalDashboardComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly portalApi = inject(PortalApiService);
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly accounts = signal<CustomerDto[]>([]);
  readonly recentPayments = signal<PaymentDto[]>([]);
  readonly unreadCount = signal(0);
  readonly showAccountPicker = signal(false);
  readonly activeTechnician = signal<ActiveTechnicianDto | null>(null);

  canPayNow(): boolean {
    return this.accounts().some((a) => a.connected);
  }

  ngOnInit(): void {
    // Load active technician (best-effort, no error on 204)
    this.portalApi.getActiveTechnician().subscribe({
      next: (t) => this.activeTechnician.set(t),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      error: () => {},
    });

    this.portalApi.getMyAccounts().subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        this.loading.set(false);

        if (accounts.length > 0) {
          this.portalApi.getPayments(accounts[0].id, 0, 3).subscribe((page) => {
            this.recentPayments.set(page.content);
          });
        }

        this.portalApi.getMyNotifications(0, 1).subscribe((page) => {
          const unread = page.content.filter((n) => n.status !== 'read').length;
          this.unreadCount.set(page.page.totalElements > 0 ? page.page.totalElements : unread);
        });

        // Deep-link from the portal shell's "Pay" tab when there are multiple
        // connected accounts (see PortalShellComponent.onPayTab()).
        if (this.route.snapshot.queryParamMap.get('openPay') === '1') {
          this.onPayNow();
        }
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/portal']);
      },
    });
  }

  onPayNow(): void {
    const accounts = this.accounts().filter((a) => a.connected);
    if (accounts.length === 0) return;
    if (accounts.length === 1) {
      this.router.navigate(['/portal/payment'], {
        queryParams: {
          customerId: accounts[0].id,
          ...(accounts[0].defaultPlanRouterId
            ? { planRouterId: accounts[0].defaultPlanRouterId }
            : {}),
        },
      });
    } else {
      this.showAccountPicker.set(true);
    }
  }

  payForAccount(account: CustomerDto): void {
    this.showAccountPicker.set(false);
    this.router.navigate(['/portal/payment'], {
      queryParams: {
        customerId: account.id,
        ...(account.defaultPlanRouterId ? { planRouterId: account.defaultPlanRouterId } : {}),
      },
    });
  }

  logout(): void {
    this.auth.portalLogout();
  }
}
