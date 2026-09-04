import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { PaymentApiService } from '@/app/domains/payments/data';
import {
  PaymentReallocationDto,
  PaymentReallocationPreviewDto,
} from '@/app/domains/payments/data';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { PaymentDto } from '../../data/payment.model';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
    MatCheckbox,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    LoadingComponent,
    StatusBadgeComponent,
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
                on {{ r.createdAt | date: 'medium' }}@if (r.reallocatedBy) {
                  by {{ r.reallocatedBy }}
                }.
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
          } @else if (auth.hasPermission('PAYMENTS_FIX_CALLBACK')) {
            <div class="mt-6 border-t border-neutral-a4 pt-6">
              @if (p.status !== 'COMPLETED') {
                <p class="text-sm text-neutral-a11">
                  Only a completed payment can be moved to another account.
                </p>
              } @else if (!reallocating()) {
                <button matButton class="primary" type="button" (click)="startReallocate()">
                  Paid to Wrong Account
                </button>
                <p class="mt-2 text-xs text-neutral-a9">
                  Use this when the payer typed a valid account code that wasn't theirs, so the
                  money landed on someone else's account.
                </p>
              } @else {
                <div class="rounded-xl border border-amber-a6 bg-amber-a2 p-4 space-y-3">
                  <h3 class="text-sm font-semibold">Move to the Correct Account</h3>
                  <p class="text-xs text-neutral-a9">
                    The amount is taken back off
                    <span class="font-mono">{{ p.accountCode }}</span> and credited to the account
                    below, which is then activated if it has no running subscription. Both account
                    holders are notified.
                  </p>

                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <mat-form-field subscriptSizing="dynamic">
                      <mat-label>Correct Account Code</mat-label>
                      <input
                        matInput
                        [formControl]="toAccountCodeControl"
                        (blur)="loadPreview()"
                      />
                      <mat-error>Account code is required</mat-error>
                    </mat-form-field>
                    <mat-form-field subscriptSizing="dynamic">
                      <mat-label>Reason</mat-label>
                      <input matInput [formControl]="reasonControl" />
                      <mat-error>Reason is required</mat-error>
                    </mat-form-field>
                  </div>

                  @if (previewError(); as e) {
                    <p class="rounded-lg bg-red-a3 p-3 text-sm text-red-a11">{{ e }}</p>
                  }

                  @if (preview(); as pv) {
                    <div class="rounded-lg bg-neutral-a2 p-3 text-sm space-y-1">
                      <p>
                        Moving <span class="font-semibold">{{ p.currency }}
                        {{ pv.amount | number: '1.2-2' }}</span> to
                        <span class="font-semibold">{{ pv.toCustomerName }}</span>
                        (<span class="font-mono">{{ pv.toAccountCode }}</span
                        >).
                      </p>
                      @if (pv.shortfall > 0) {
                        <p class="text-amber-a11">
                          Only {{ p.currency }} {{ pv.reclaimable | number: '1.2-2' }} is still in
                          {{ pv.fromAccountCode }}'s credit. The remaining {{ p.currency }}
                          {{ pv.shortfall | number: '1.2-2' }} has already been spent there and
                          will be raised as a charge they owe.
                        </p>
                      }
                      <p>
                        {{
                          pv.willActivateSubscription
                            ? 'This will activate their subscription.'
                            : 'Their subscription is already active — the credit will be held for later.'
                        }}
                      </p>
                      @if (pv.rechargeToRevokeId) {
                        <p class="text-amber-a11">
                          {{ pv.fromAccountCode }} has a subscription running on this payment until
                          {{ pv.rechargeToRevokeExpiration | date: 'medium' }}.
                        </p>
                      }
                    </div>
                  }

                  @if (preview()?.rechargeToRevokeId) {
                    <mat-checkbox [formControl]="revokeRechargeControl">
                      Also end that subscription now — this disconnects them immediately
                    </mat-checkbox>
                  }

                  <div class="flex justify-end gap-2">
                    <button matButton type="button" (click)="cancelReallocate()">Cancel</button>
                    <button
                      matButton
                      class="primary"
                      type="button"
                      [disabled]="
                        toAccountCodeControl.invalid || reasonControl.invalid || submitting()
                      "
                      (click)="submitReallocate()"
                    >
                      {{ submitting() ? 'Moving…' : 'Move Payment' }}
                    </button>
                  </div>
                </div>
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
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  private paymentId = '';

  readonly loading = signal(true);
  readonly payment = signal<PaymentDto | null>(null);

  /** Set once this payment has been moved — the form is replaced by a summary of what happened. */
  readonly reallocation = signal<PaymentReallocationDto | null>(null);
  readonly reallocating = signal(false);
  readonly submitting = signal(false);
  readonly preview = signal<PaymentReallocationPreviewDto | null>(null);
  readonly previewError = signal<string | null>(null);

  readonly toAccountCodeControl = new FormControl('', {
    nonNullable: true,
    validators: Validators.required,
  });
  readonly reasonControl = new FormControl('', {
    nonNullable: true,
    validators: Validators.required,
  });
  readonly revokeRechargeControl = new FormControl(false, { nonNullable: true });

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
  }

  startReallocate(): void {
    this.toAccountCodeControl.reset('');
    this.reasonControl.reset('');
    this.revokeRechargeControl.reset(false);
    this.preview.set(null);
    this.previewError.set(null);
    this.reallocating.set(true);
  }

  cancelReallocate(): void {
    this.reallocating.set(false);
  }

  /**
   * Resolve the typed account code server-side so the operator sees who they're about to credit,
   * how the amount splits, and whether confirming would disconnect anyone — before they commit.
   */
  loadPreview(): void {
    const code = this.toAccountCodeControl.value.trim();
    if (!code) {
      this.preview.set(null);
      this.previewError.set(null);
      return;
    }
    this.paymentApi.previewReallocation(this.paymentId, code).subscribe({
      next: (pv) => {
        this.preview.set(pv);
        this.previewError.set(null);
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.preview.set(null);
        this.revokeRechargeControl.setValue(false);
        this.previewError.set(
          err?.error?.detail ?? err?.error?.message ?? 'Could not resolve that account code',
        );
      },
    });
  }

  submitReallocate(): void {
    if (this.toAccountCodeControl.invalid || this.reasonControl.invalid) return;
    this.submitting.set(true);
    this.paymentApi
      .reallocatePayment(this.paymentId, {
        toAccountCode: this.toAccountCodeControl.value.trim(),
        reason: this.reasonControl.value,
        revokeRecharge: this.revokeRechargeControl.value,
      })
      .subscribe({
        next: (result) => {
          this.reallocation.set(result);
          this.submitting.set(false);
          this.reallocating.set(false);
          // The payment now belongs to the other customer — reload so the header reflects that.
          this.paymentApi.getById(this.paymentId).subscribe({
            next: (p) => this.payment.set(p),
          });
          this.snackBar.open(
            `Payment moved to ${result.toAccountCode}. Both account holders notified.`,
            'OK',
            { duration: 4000 },
          );
        },
        error: (err: { error?: { detail?: string; message?: string } }) => {
          this.submitting.set(false);
          this.snackBar.open(
            err?.error?.detail ?? err?.error?.message ?? 'Failed to move payment',
            'OK',
            { duration: 4000 },
          );
        },
      });
  }
}
