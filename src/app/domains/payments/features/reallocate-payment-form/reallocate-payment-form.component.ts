import { DecimalPipe, DatePipe } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentApiService } from '@/app/domains/payments/data';
import { PaymentReallocationDto, PaymentReallocationPreviewDto } from '../../data';
import { PaymentDto } from '../../data/payment.model';

/**
 * Move a completed payment off the wrong-but-valid account code it was paid to and onto the
 * account it was meant for. Used two ways, both from the same component so the logic and markup
 * exist exactly once:
 *
 * - Inline, via `[payment]` + `(reallocated)`/`(cancelled)` outputs — the payment-detail action
 *   panel.
 * - As a dialog, via `MatDialog.open(ReallocatePaymentFormComponent, { data: { payment } })` — the
 *   payments-list row action. `MatDialogRef` is detected automatically; when present the
 *   component closes itself with the result instead of emitting outputs.
 */
@Component({
  selector: 'app-reallocate-payment-form',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    ReactiveFormsModule,
    MatButton,
    MatCheckbox,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
  ],
  template: `
    @let p = payment();
    @if (p) {
      <div class="rounded-xl border border-amber-a6 bg-amber-a2 p-4 space-y-3">
        <h3 class="text-sm font-semibold">Move to the Correct Account</h3>
        <p class="text-xs text-neutral-a9">
          The amount is taken back off <span class="font-mono">{{ p.accountCode }}</span> and
          credited to the account below, which is then activated if it has no running subscription.
          Both account holders are notified.
        </p>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <mat-form-field subscriptSizing="dynamic">
            <mat-label>Correct Account Code</mat-label>
            <input matInput [formControl]="toAccountCodeControl" (blur)="loadPreview()" />
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
              Moving
              <span class="font-semibold">{{ p.currency }} {{ pv.amount | number: '1.2-2' }}</span>
              to
              <span class="font-semibold">{{ pv.toCustomerName }}</span>
              (<span class="font-mono">{{ pv.toAccountCode }}</span
              >).
            </p>
            @if (pv.shortfall > 0) {
              <p class="text-amber-a11">
                Only {{ p.currency }} {{ pv.reclaimable | number: '1.2-2' }} is still in
                {{ pv.fromAccountCode }}'s credit. The remaining {{ p.currency }}
                {{ pv.shortfall | number: '1.2-2' }} has already been spent there and will be raised
                as a charge they owe.
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
          <button matButton type="button" (click)="cancel()">Cancel</button>
          <button
            matButton
            class="primary"
            type="button"
            [disabled]="toAccountCodeControl.invalid || reasonControl.invalid || submitting()"
            (click)="submit()"
          >
            {{ submitting() ? 'Moving…' : 'Move Payment' }}
          </button>
        </div>
      </div>
    }
  `,
})
export class ReallocatePaymentFormComponent {
  private readonly paymentApi = inject(PaymentApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject<
    MatDialogRef<ReallocatePaymentFormComponent, PaymentReallocationDto>
  >(MatDialogRef, { optional: true });
  private readonly dialogData = inject<{ payment: PaymentDto } | null>(MAT_DIALOG_DATA, {
    optional: true,
  });

  /** Used when rendered inline (payment-detail). Ignored when opened as a dialog. */
  readonly paymentInput = input<PaymentDto | undefined>(undefined, { alias: 'payment' });
  readonly reallocated = output<PaymentReallocationDto>();
  readonly cancelled = output<void>();

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

  payment(): PaymentDto | undefined {
    return this.dialogData?.payment ?? this.paymentInput();
  }

  loadPreview(): void {
    const code = this.toAccountCodeControl.value.trim();
    const payment = this.payment();
    if (!code || !payment) {
      this.preview.set(null);
      this.previewError.set(null);
      return;
    }
    this.paymentApi.previewReallocation(payment.id, code).subscribe({
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

  cancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.cancelled.emit();
    }
  }

  submit(): void {
    const payment = this.payment();
    if (!payment || this.toAccountCodeControl.invalid || this.reasonControl.invalid) return;
    this.submitting.set(true);
    this.paymentApi
      .reallocatePayment(payment.id, {
        toAccountCode: this.toAccountCodeControl.value.trim(),
        reason: this.reasonControl.value,
        revokeRecharge: this.revokeRechargeControl.value,
      })
      .subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.snackBar.open(
            `Payment moved to ${result.toAccountCode}. Both account holders notified.`,
            'OK',
            { duration: 4000 },
          );
          if (this.dialogRef) {
            this.dialogRef.close(result);
          } else {
            this.reallocated.emit(result);
          }
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
