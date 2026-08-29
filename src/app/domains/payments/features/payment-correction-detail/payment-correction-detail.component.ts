import { DatePipe, JsonPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormRecord, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { PaymentApiService } from '@/app/domains/payments/data';
import { PaymentCallbackLogDto } from '@/app/domains/payments/data';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-payment-correction-detail',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    DatePipe,
    JsonPipe,
    ReactiveFormsModule,
    RouterLink,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
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
        <a matIconButton routerLink="/admin/payments/payment-corrections">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Payment Correction</h1>
          <p class="text-sm text-neutral-a11">Raw provider callback record</p>
        </div>
      </div>

      <app-loading [loading]="loading()" />

      @if (log(); as l) {
        <mat-card class="p-6">
          <dl class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                Provider
              </dt>
              <dd class="mt-1 capitalize text-sm">{{ l.provider }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">Status</dt>
              <dd class="mt-1 flex items-center gap-2">
                <app-status-badge [status]="l.status" />
                @if (l.status === 'ERROR' && !l.terminal) {
                  <span
                    class="rounded-full bg-amber-a3 px-2 py-0.5 text-xs font-semibold text-amber-a11"
                  >
                    Retrying automatically…
                  </span>
                }
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                Attempts
              </dt>
              <dd class="mt-1 text-sm">{{ l.attemptCount }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                Received
              </dt>
              <dd class="mt-1 text-sm">{{ l.receivedAt | date: 'medium' }}</dd>
            </div>
            @if (l.processedAt) {
              <div>
                <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                  Processed
                </dt>
                <dd class="mt-1 text-sm">{{ l.processedAt | date: 'medium' }}</dd>
              </div>
            }
            @if (l.payerNotifiedAt) {
              <div>
                <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                  Payer Notified
                </dt>
                <dd class="mt-1 text-sm">{{ l.payerNotifiedAt | date: 'medium' }}</dd>
              </div>
            }
            @if (l.errorMessage) {
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium uppercase tracking-widest text-red-a11">
                  Error Message
                </dt>
                <dd class="mt-1 rounded-lg bg-red-a3 p-3 text-sm text-red-a11">
                  {{ l.errorMessage }}
                </dd>
              </div>
            }
            <div class="sm:col-span-2">
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                Callback Data
              </dt>
              <dd
                class="mt-1 overflow-x-auto rounded-lg bg-neutral-a2 p-3 font-mono text-xs whitespace-pre"
              >
                {{ l.callbackMetadata | json }}
              </dd>
            </div>

            @if (l.correctionCount > 0) {
              <div class="sm:col-span-2 rounded-lg border border-neutral-a4 p-4">
                <h3 class="text-sm font-semibold">Correction history ({{ l.correctionCount }})</h3>
                <div class="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                      Reason
                    </dt>
                    <dd class="mt-1 text-sm">{{ l.correctionReason }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                      Corrected By / At
                    </dt>
                    <dd class="mt-1 text-sm">
                      {{ l.correctedBy }} · {{ l.correctedAt | date: 'medium' }}
                    </dd>
                  </div>
                  <div class="sm:col-span-2">
                    <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                      Original (Pre-Correction) Data
                    </dt>
                    <dd
                      class="mt-1 overflow-x-auto rounded-lg bg-neutral-a2 p-3 font-mono text-xs whitespace-pre"
                    >
                      {{ l.originalCallbackMetadata | json }}
                    </dd>
                  </div>
                </div>
              </div>
            }
          </dl>

          @if (auth.hasPermission('PAYMENTS_FIX_CALLBACK')) {
            <div class="mt-6 border-t border-neutral-a4 pt-6">
              @if (isCorrectable(l)) {
                @if (!correcting()) {
                  <button matButton class="primary" type="button" (click)="startCorrect(l)">
                    Correct &amp; Reprocess
                  </button>
                } @else {
                  <div class="rounded-xl border border-amber-a6 bg-amber-a2 p-4 space-y-3">
                    <h3 class="text-sm font-semibold">Correct &amp; Reprocess</h3>
                    <p class="text-xs text-neutral-a9">
                      Only the field(s) below can be corrected — everything else was reported by the
                      payment gateway itself and can't be changed.
                    </p>
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      @for (key of l.editableFields; track key) {
                        <mat-form-field subscriptSizing="dynamic">
                          <mat-label>{{ humanizeFieldKey(key) }}</mat-label>
                          <input matInput [formControl]="correctForm.controls[key]" />
                          <mat-error>Required</mat-error>
                        </mat-form-field>
                      }
                      <mat-form-field class="sm:col-span-2" subscriptSizing="dynamic">
                        <mat-label>Reason</mat-label>
                        <input matInput [formControl]="reasonControl" />
                        <mat-error>Reason is required</mat-error>
                      </mat-form-field>
                    </div>
                    <div class="flex justify-end gap-2">
                      <button matButton type="button" (click)="cancelCorrect()">Cancel</button>
                      <button
                        matButton
                        class="primary"
                        type="button"
                        [disabled]="correctForm.invalid || reasonControl.invalid || submitting()"
                        (click)="submitCorrect()"
                      >
                        {{ submitting() ? 'Saving…' : 'Correct & Reprocess' }}
                      </button>
                    </div>
                  </div>
                }
              } @else {
                <p class="text-sm text-neutral-a11">
                  {{ notCorrectableReason(l) }}
                </p>
              }
            </div>
          }
        </mat-card>
      }
    </div>
  `,
})
export class PaymentCorrectionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly paymentApi = inject(PaymentApiService);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  private logId = '';

  readonly loading = signal(true);
  readonly log = signal<PaymentCallbackLogDto | null>(null);
  readonly correcting = signal(false);
  readonly submitting = signal(false);

  /**
   * One control per `editableFields` key — built fresh in `startCorrect` for each log, since which
   * fields are editable is provider-defined, not fixed.
   */
  readonly correctForm = new FormRecord<FormControl<string>>({});
  readonly reasonControl = new FormControl('', {
    nonNullable: true,
    validators: Validators.required,
  });

  ngOnInit(): void {
    this.logId = this.route.snapshot.paramMap.get('id')!;
    this.paymentApi.getCallbackLog(this.logId).subscribe({
      next: (l) => {
        this.log.set(l);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  isCorrectable(l: PaymentCallbackLogDto): boolean {
    return l.correctable;
  }

  notCorrectableReason(l: PaymentCallbackLogDto): string {
    if (l.status !== 'ERROR') return 'This callback is not in an error state.';
    if (!l.terminal) return 'This callback is still retrying automatically — check back shortly.';
    return "This provider doesn't support correction yet.";
  }

  /** e.g. "account_number" -> "Account Number" */
  humanizeFieldKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  startCorrect(l: PaymentCallbackLogDto): void {
    const metadata = l.callbackMetadata ?? {};
    for (const key of Object.keys(this.correctForm.controls)) {
      this.correctForm.removeControl(key);
    }
    for (const key of l.editableFields) {
      this.correctForm.addControl(
        key,
        new FormControl(String(metadata[key] ?? ''), {
          nonNullable: true,
          validators: Validators.required,
        }),
      );
    }
    this.reasonControl.reset('');
    this.correcting.set(true);
  }

  cancelCorrect(): void {
    this.correcting.set(false);
  }

  submitCorrect(): void {
    if (this.correctForm.invalid || this.reasonControl.invalid) return;
    this.submitting.set(true);
    this.paymentApi
      .correctCallback(this.logId, {
        correctedFields: this.correctForm.value,
        reason: this.reasonControl.value,
      })
      .subscribe({
        next: (updated) => {
          this.log.set(updated);
          this.submitting.set(false);
          this.correcting.set(false);
          this.snackBar.open('Callback corrected and reprocessing', 'OK', { duration: 3000 });
        },
        error: (err: { error?: { detail?: string; message?: string } }) => {
          this.submitting.set(false);
          this.snackBar.open(
            err?.error?.detail ?? err?.error?.message ?? 'Failed to correct callback',
            'OK',
            { duration: 4000 },
          );
        },
      });
  }
}
