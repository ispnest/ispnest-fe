import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentApiService } from '@/app/domains/payments/data';
import { PaymentManualResolutionDto, PaymentResolutionOptionsDto } from '../../data';
import { PaymentDto } from '../../data/payment.model';

/**
 * Manually complete a payment stuck PENDING because the provider's callback for it never
 * arrived. Two trust tiers, both handled by this one component (it fetches
 * `resolution-options` itself and adapts):
 *
 * - Verified — the provider is queried directly before completing. Offered whenever the
 *   provider supports it; requires `PAYMENTS_FIX_CALLBACK`.
 * - Forced — staff attestation only, no provider check. Requires the stricter
 *   `PAYMENTS_FORCE_RESOLVE_CALLBACK`, so this is only rendered when the caller has already
 *   confirmed the viewer holds it (see payment-detail's action menu / payments-list row menu).
 *
 * Used inline (`[payment]` + `(resolved)`/`(cancelled)`) and as a dialog (`MatDialog.open` with
 * `{ data: { payment, forced } }`, auto-detected via `MatDialogRef`) — same as
 * `ReallocatePaymentFormComponent`.
 */
@Component({
  selector: 'app-resolve-missing-callback-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatButton, MatFormField, MatLabel, MatError, MatInput],
  template: `
    @let p = payment();
    @if (p) {
      <div
        class="rounded-xl border p-4 space-y-3"
        [class]="forced() ? 'border-red-a6 bg-red-a2' : 'border-amber-a6 bg-amber-a2'"
      >
        @if (forced()) {
          <h3 class="text-sm font-semibold text-red-a11">
            Force Resolve — Not Independently Verified
          </h3>
          <p class="text-xs text-neutral-a9">
            {{ p.provider }} has no transaction-status check. You are attesting the payment
            succeeded based on the receipt shown to you. This action is logged with your identity
            and reason.
          </p>
        } @else {
          <h3 class="text-sm font-semibold">Resolve Missing Callback</h3>
          <p class="text-xs text-neutral-a9">
            The payment will be verified directly with {{ p.provider }} before being completed.
          </p>
        }

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <mat-form-field subscriptSizing="dynamic">
            <mat-label>Provider Transaction Reference</mat-label>
            <input matInput [formControl]="providerTransactionIdControl" />
            <mat-error>Transaction reference is required</mat-error>
          </mat-form-field>
          <mat-form-field subscriptSizing="dynamic">
            <mat-label>Reason</mat-label>
            <input matInput [formControl]="reasonControl" />
            <mat-error>Reason is required</mat-error>
          </mat-form-field>
        </div>

        @if (submitError(); as e) {
          <p class="rounded-lg bg-red-a3 p-3 text-sm text-red-a11">{{ e }}</p>
        }

        <div class="flex justify-end gap-2">
          <button matButton type="button" (click)="cancel()">Cancel</button>
          <button
            matButton
            [class]="forced() ? 'primary destructive' : 'primary'"
            type="button"
            [disabled]="
              providerTransactionIdControl.invalid || reasonControl.invalid || submitting()
            "
            (click)="submit()"
          >
            {{
              submitting()
                ? forced()
                  ? 'Resolving…'
                  : 'Verifying…'
                : forced()
                  ? 'Force Resolve'
                  : 'Verify & Resolve'
            }}
          </button>
        </div>
      </div>
    }
  `,
})
export class ResolveMissingCallbackFormComponent implements OnInit {
  private readonly paymentApi = inject(PaymentApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject<
    MatDialogRef<ResolveMissingCallbackFormComponent, PaymentManualResolutionDto>
  >(MatDialogRef, { optional: true });
  private readonly dialogData = inject<{ payment: PaymentDto; forced?: boolean } | null>(
    MAT_DIALOG_DATA,
    { optional: true },
  );

  /** Used when rendered inline (payment-detail). Ignored when opened as a dialog. */
  readonly paymentInput = input<PaymentDto | undefined>(undefined, { alias: 'payment' });

  /**
   * Left `undefined` (not defaulted to `false`) so the `forced` computed below can fall through
   * to auto-detection via `resolution-options` when the caller doesn't have an opinion — as the
   * payments-list row action doesn't. `input(false, ...)` would default to `false` and the `??`
   * chain would stop there, never reaching the auto-detect fallback.
   */
  readonly forcedInput = input<boolean | undefined>(undefined, { alias: 'forced' });
  readonly resolved = output<PaymentManualResolutionDto>();
  readonly cancelled = output<void>();

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  private readonly options = signal<PaymentResolutionOptionsDto | null>(null);

  readonly providerTransactionIdControl = new FormControl('', {
    nonNullable: true,
    validators: Validators.required,
  });
  readonly reasonControl = new FormControl('', {
    nonNullable: true,
    validators: Validators.required,
  });

  payment(): PaymentDto | undefined {
    return this.dialogData?.payment ?? this.paymentInput();
  }

  /**
   * Forced when explicitly requested, or when the payment turns out not to be provider-
   * verifiable at all — lets a caller open this generically ("Resolve...") without first knowing
   * whether the provider can verify.
   */
  readonly forced = computed(
    () => this.dialogData?.forced ?? this.forcedInput() ?? this.options()?.verifiable === false,
  );

  ngOnInit(): void {
    const payment = this.payment();
    if (!payment) return;
    this.paymentApi.getResolutionOptions(payment.id).subscribe({
      next: (options) => this.options.set(options),
      error: () => this.options.set(null),
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
    if (!payment || this.providerTransactionIdControl.invalid || this.reasonControl.invalid) {
      return;
    }
    this.submitting.set(true);
    this.submitError.set(null);
    const request = {
      providerTransactionId: this.providerTransactionIdControl.value.trim(),
      reason: this.reasonControl.value,
    };
    const call = this.forced()
      ? this.paymentApi.forceResolveMissingCallback(payment.id, request)
      : this.paymentApi.resolveMissingCallback(payment.id, request);

    call.subscribe({
      next: (result) => {
        this.submitting.set(false);
        this.snackBar.open('Payment resolved.', 'OK', { duration: 4000 });
        if (this.dialogRef) {
          this.dialogRef.close(result);
        } else {
          this.resolved.emit(result);
        }
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.submitting.set(false);
        this.submitError.set(
          err?.error?.detail ?? err?.error?.message ?? 'Failed to resolve payment',
        );
      },
    });
  }
}
