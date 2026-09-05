import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { PaymentApiService } from '@/app/domains/payments/data';
import {
  PaymentManualResolutionDto,
  PaymentReallocationDto,
  PaymentResolutionOptionsDto,
} from '@/app/domains/payments/data';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { PaymentDto } from '../../data/payment.model';
import { ReallocatePaymentFormComponent } from '../reallocate-payment-form/reallocate-payment-form.component';
import { ResolveMissingCallbackFormComponent } from '../resolve-missing-callback-form/resolve-missing-callback-form.component';

type ActiveAction = 'reallocate' | 'resolveMissingCallback' | 'forceResolveMissingCallback' | null;

/**
 * A single "Payment Actions" menu plus one active-action panel slot below it — replaces a
 * one-button-per-action layout that would otherwise grow indefinitely as more staff corrections
 * get added here (the pattern to avoid is customers-detail's tab sprawl). Adding a future action
 * means adding one menu item and one `@case`, not a new always-visible button.
 */
@Component({
  selector: 'app-payment-detail',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    LoadingComponent,
    StatusBadgeComponent,
    ReallocatePaymentFormComponent,
    ResolveMissingCallbackFormComponent,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-3xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/payments">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Payment Detail</h1>
          <p class="text-sm text-neutral-a11">Transaction record</p>
        </div>
      </div>

      <app-loading [loading]="loading()" />

      @if (payment(); as p) {
        <mat-card class="p-6">
          <dl class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            @if (p.accountCode) {
              <div>
                <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                  Username
                </dt>
                <dd class="mt-1">
                  <a
                    class="inline-flex cursor-pointer items-center gap-1 font-mono text-sm text-primary-a11 underline decoration-dotted underline-offset-4 transition hover:text-primary-a12 hover:decoration-solid"
                    [routerLink]="['/admin/customers/username', p.accountCode]"
                  >
                    {{ p.accountCode }}
                  </a>
                </dd>
              </div>
            }
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">ID</dt>
              <dd class="mt-1 font-mono text-sm">{{ p.id }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">Status</dt>
              <dd class="mt-1"><app-status-badge [status]="p.status" /></dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">Amount</dt>
              <dd class="mt-1 text-lg font-semibold tabular-nums">
                {{ p.currency }} {{ p.amount | number: '1.2-2' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                Provider
              </dt>
              <dd class="mt-1 capitalize text-sm">{{ p.provider }}</dd>
            </div>
            @if (p.externalReference) {
              <div>
                <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                  Reference
                </dt>
                <dd class="mt-1 font-mono text-sm">{{ p.externalReference }}</dd>
              </div>
            }
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">Date</dt>
              <dd class="mt-1 text-sm">{{ p.createdAt | date: 'medium' }}</dd>
            </div>
            @if (p.failureReason) {
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium uppercase tracking-widest text-red-a11">
                  Failure Reason
                </dt>
                <dd class="mt-1 rounded-lg bg-red-a3 p-3 text-sm text-red-a11">
                  {{ p.failureReason }}
                </dd>
              </div>
            }
          </dl>

          @if (reallocation(); as r) {
            <div class="mt-6 border-t border-neutral-a4 pt-6">
              <h3 class="text-sm font-semibold">Reallocated</h3>
              <p class="mt-1 text-sm text-neutral-a11">
                Moved from <span class="font-mono">{{ r.fromAccountCode }}</span> to
                <span class="font-mono">{{ r.toAccountCode }}</span>
                on {{ r.createdAt | date: 'medium' }}
                @if (r.reallocatedBy) {
                  by {{ r.reallocatedBy }}
                }
                .
              </p>
              <p class="mt-1 text-sm text-neutral-a11">{{ r.reason }}</p>
              @if (r.shortfallCharged > 0) {
                <p class="mt-1 text-sm text-neutral-a11">
                  {{ p.currency }} {{ r.reclaimedFromCredit | number: '1.2-2' }} reclaimed from
                  credit; {{ p.currency }} {{ r.shortfallCharged | number: '1.2-2' }} had already
                  been spent and was charged back to
                  <span class="font-mono">{{ r.fromAccountCode }}</span
                  >.
                </p>
              }
            </div>
          } @else if (manualResolution(); as m) {
            <div class="mt-6 border-t border-neutral-a4 pt-6">
              <h3 class="text-sm font-semibold">Manually Resolved</h3>
              <p class="mt-1 text-sm text-neutral-a11">
                Completed on {{ m.createdAt | date: 'medium' }}
                @if (m.resolvedBy) {
                  by {{ m.resolvedBy }}
                }
                , using provider reference
                <span class="font-mono">{{ m.providerTransactionId }}</span> —
                {{
                  m.verified
                    ? 'verified with the provider'
                    : 'staff-attested, not independently verified'
                }}.
              </p>
              <p class="mt-1 text-sm text-neutral-a11">{{ m.reason }}</p>
            </div>
          } @else {
            <div class="mt-6 border-t border-neutral-a4 pt-6">
              @if (hasAnyAction()) {
                @if (!activeAction()) {
                  <button matButton class="primary" type="button" [matMenuTriggerFor]="actionsMenu">
                    Payment Actions
                    <mat-icon svgIcon="chevron-down" />
                  </button>
                  <mat-menu #actionsMenu="matMenu">
                    @if (canReallocate()) {
                      <button mat-menu-item (click)="activeAction.set('reallocate')">
                        Paid to Wrong Account…
                      </button>
                    }
                    @if (canResolveVerified()) {
                      <button mat-menu-item (click)="activeAction.set('resolveMissingCallback')">
                        Resolve Missing Callback…
                      </button>
                    }
                    @if (canForceResolve()) {
                      <button
                        mat-menu-item
                        (click)="activeAction.set('forceResolveMissingCallback')"
                      >
                        Force Resolve Missing Callback…
                      </button>
                    }
                  </mat-menu>
                } @else if (activeAction() === 'reallocate') {
                  <app-reallocate-payment-form
                    [payment]="p"
                    (reallocated)="onReallocated($event)"
                    (cancelled)="activeAction.set(null)"
                  />
                } @else {
                  <app-resolve-missing-callback-form
                    [payment]="p"
                    [forced]="activeAction() === 'forceResolveMissingCallback'"
                    (resolved)="onResolved($event)"
                    (cancelled)="activeAction.set(null)"
                  />
                }
              }
            </div>
          }
        </mat-card>
      }
    </div>
  `,
})
export class PaymentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly paymentApi = inject(PaymentApiService);
  readonly auth = inject(AuthService);

  private paymentId = '';

  readonly loading = signal(true);
  readonly payment = signal<PaymentDto | null>(null);
  readonly activeAction = signal<ActiveAction>(null);

  /** Set once this payment has been moved — the actions area is replaced by a summary. */
  readonly reallocation = signal<PaymentReallocationDto | null>(null);
  /** Set once this payment has been manually resolved — same treatment as `reallocation`. */
  readonly manualResolution = signal<PaymentManualResolutionDto | null>(null);
  readonly resolutionOptions = signal<PaymentResolutionOptionsDto | null>(null);

  readonly canReallocate = computed(
    () => this.payment()?.status === 'COMPLETED' && !this.reallocation(),
  );
  readonly canResolveVerified = computed(
    () =>
      !!this.resolutionOptions()?.resolvable &&
      !!this.resolutionOptions()?.verifiable &&
      this.auth.hasPermission('PAYMENTS_FIX_CALLBACK'),
  );
  readonly canForceResolve = computed(
    () =>
      !!this.resolutionOptions()?.resolvable &&
      this.auth.hasPermission('PAYMENTS_FORCE_RESOLVE_CALLBACK'),
  );
  readonly hasAnyAction = computed(
    () => this.canReallocate() || this.canResolveVerified() || this.canForceResolve(),
  );

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.paramMap.get('id')!;
    this.paymentApi.getById(this.paymentId).subscribe({
      next: (p) => {
        this.payment.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    // 404 here just means the payment was never moved, which is the common case.
    this.paymentApi.getReallocation(this.paymentId).subscribe({
      next: (r) => this.reallocation.set(r),
      error: () => this.reallocation.set(null),
    });
    // 404 here just means the payment was never manually resolved.
    this.paymentApi.getManualResolution(this.paymentId).subscribe({
      next: (m) => this.manualResolution.set(m),
      error: () => this.manualResolution.set(null),
    });
    this.paymentApi.getResolutionOptions(this.paymentId).subscribe({
      next: (o) => this.resolutionOptions.set(o),
      error: () => this.resolutionOptions.set(null),
    });
  }

  onReallocated(result: PaymentReallocationDto): void {
    this.reallocation.set(result);
    this.activeAction.set(null);
    // The payment now belongs to the other customer — reload so the header reflects that.
    this.paymentApi.getById(this.paymentId).subscribe({ next: (p) => this.payment.set(p) });
  }

  onResolved(result: PaymentManualResolutionDto): void {
    this.manualResolution.set(result);
    this.activeAction.set(null);
    this.paymentApi.getById(this.paymentId).subscribe({ next: (p) => this.payment.set(p) });
  }
}
