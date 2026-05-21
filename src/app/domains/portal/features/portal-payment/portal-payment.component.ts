import { DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatHint, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, switchMap, of } from 'rxjs';
import { AuthService } from '@/app/core/auth/auth.service';
import { kenyanPhoneValidator, normalizeKenyanPhone } from '@/app/core/utils/phone.utils';
import { PaymentApiService } from '@/app/domains/payments/data';
import { PublicPlanResponse, PortalApiService } from '@/app/domains/portal/data';
import { LoadingComponent } from '@/app/ui/loading';

type Stage = 'loading' | 'confirm' | 'waiting' | 'success' | 'failed';

@Component({
  selector: 'app-portal-payment',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DecimalPipe,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatHint,
    MatError,
    MatInput,
    MatProgressSpinner,
    LoadingComponent,
  ],
  template: `
    <div class="min-h-screen bg-neutral-a2">
      <div class="bg-primary px-4 py-4 text-primary-contrast">
        <div class="mx-auto flex max-w-lg items-center gap-3">
          <a matIconButton routerLink="/portal/dashboard" class="text-inherit">
            <mat-icon svgIcon="arrow-left" />
          </a>
          <h1 class="text-lg font-bold">Make Payment</h1>
        </div>
      </div>

      <div class="mx-auto max-w-lg space-y-4 px-4 py-6">
        <app-loading [loading]="stage() === 'loading'" />

        <!-- ── Confirm stage ─────────────────────────────────────────────── -->
        @if (stage() === 'confirm' && planResponse()) {
          <!-- Plan summary card -->
          <mat-card class="p-4">
            <h2 class="mb-3 font-semibold">Plan Summary</h2>
            <dl class="space-y-1 text-sm">
              <div class="flex justify-between">
                <dt class="text-neutral-a11">Plan</dt>
                <dd class="font-medium">{{ planResponse()!.plan.name }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-neutral-a11">Validity</dt>
                <dd>{{ planResponse()!.plan.validity }} {{ planResponse()!.plan.validityUnit }}</dd>
              </div>
              @if (planResponse()!.bandwidth) {
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Speed</dt>
                  <dd>{{ formatSpeed(planResponse()!) }}</dd>
                </div>
              }
            </dl>
            <div
              class="mt-3 flex justify-between rounded-lg bg-neutral-a3 px-3 py-2 text-base font-bold"
            >
              <span>Total</span>
              <span class="text-primary-a11">
                KES {{ planResponse()!.plan.price | number: '1.2-2' }}
              </span>
            </div>
          </mat-card>

          <!-- M-Pesa form -->
          <mat-card class="p-4">
            <h2 class="mb-4 font-semibold">Pay via M-Pesa</h2>
            <form [formGroup]="form" (ngSubmit)="pay()" class="flex flex-col gap-y-4">
              <mat-form-field class="w-full">
                <mat-label>M-Pesa Phone Number</mat-label>
                <mat-icon matPrefix svgIcon="phone" />
                <input matInput formControlName="phoneNumber" placeholder="07XX XXX XXX / +254…" />
                <mat-hint>Enter a valid Kenyan number (07XX, 01XX, 254XX, or +254XX)</mat-hint>
                <mat-error>Enter a valid Kenyan number (07XX, 01XX, 254XX, or +254XX)</mat-error>
              </mat-form-field>

              @if (errorMessage()) {
                <div
                  class="flex items-center gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11"
                >
                  <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
                  {{ errorMessage() }}
                </div>
              }

              <button
                class="primary w-full"
                matButton
                type="submit"
                [disabled]="form.invalid || initiating()"
              >
                {{
                  initiating()
                    ? 'Initiating…'
                    : 'Pay KES ' + (planResponse()!.plan.price | number: '1.0-0')
                }}
              </button>
            </form>
          </mat-card>
        }

        <!-- ── Waiting for STK push stage ───────────────────────────────── -->
        @if (stage() === 'waiting') {
          <mat-card class="p-8 text-center">
            <mat-spinner diameter="56" class="mx-auto" />
            <h2 class="mt-4 text-lg font-semibold">Check Your Phone</h2>
            <p class="mt-2 text-neutral-a11">
              An M-Pesa prompt has been sent to
              <span class="font-medium">{{ form.value.phoneNumber }}</span
              >. Enter your M-Pesa PIN to complete the payment.
            </p>
            <p class="mt-4 text-xs text-neutral-a9">This page updates automatically…</p>
          </mat-card>
        }

        <!-- ── Success stage ─────────────────────────────────────────────── -->
        @if (stage() === 'success') {
          <mat-card class="p-8 text-center">
            <div
              class="mx-auto flex size-16 items-center justify-center rounded-full bg-success-a3"
            >
              <mat-icon svgIcon="circle-check" class="size-8 text-success-a11" />
            </div>
            <h2 class="mt-4 text-xl font-bold text-success-a11">Payment Successful!</h2>
            <p class="mt-2 text-neutral-a11">
              KES {{ planResponse()!.plan.price | number: '1.2-2' }} received. Your plan is now
              active.
            </p>
            <a class="primary mt-6" matButton routerLink="/portal/dashboard">
              <mat-icon svgIcon="layout-dashboard" />
              Back to Dashboard
            </a>
          </mat-card>
        }

        <!-- ── Failed stage ──────────────────────────────────────────────── -->
        @if (stage() === 'failed') {
          <mat-card class="p-8 text-center">
            <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-red-a3">
              <mat-icon svgIcon="circle-x" class="size-8 text-red-a11" />
            </div>
            <h2 class="mt-4 text-xl font-bold text-red-a11">Payment Failed</h2>
            @if (failureReason()) {
              <p class="mt-2 text-sm text-neutral-a11">{{ failureReason() }}</p>
            }
            <div class="mt-6 flex flex-col gap-3 sm:flex-row">
              <button matButton class="primary w-full" (click)="retry()">Try Again</button>
              <a matButton class="w-full" routerLink="/portal/dashboard">Back to Dashboard</a>
            </div>
          </mat-card>
        }
      </div>
    </div>
  `,
})
export class PortalPaymentComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly paymentApi = inject(PaymentApiService);
  private readonly portalApi = inject(PortalApiService);

  readonly stage = signal<Stage>('loading');
  readonly initiating = signal(false);
  readonly errorMessage = signal('');
  readonly planResponse = signal<PublicPlanResponse | null>(null);
  readonly failureReason = signal<string | null>(null);

  private customerId = '';
  private planRouterId = '';
  private accountCode = '';
  private sseSub?: Subscription;

  form = this.fb.group({
    phoneNumber: ['', [Validators.required, kenyanPhoneValidator]],
  });

  ngOnInit(): void {
    this.customerId = this.route.snapshot.queryParamMap.get('customerId') ?? '';
    this.planRouterId = this.route.snapshot.queryParamMap.get('planRouterId') ?? '';

    // Pre-populate M-Pesa number from JWT (normalize so stored 254XXXXXXXXX still passes)
    const jwtPhone = this.auth.currentUser()?.phoneNumber ?? '';
    if (jwtPhone) {
      this.form.patchValue({ phoneNumber: normalizeKenyanPhone(jwtPhone) });
    }

    // If no customerId, resolve from first account
    const resolveCustomer$ = this.customerId
      ? of(this.customerId)
      : this.portalApi.getMyAccounts().pipe(switchMap((accounts) => of(accounts[0]?.id ?? '')));

    resolveCustomer$.subscribe((id) => {
      if (!id) {
        this.router.navigate(['/portal/dashboard']);
        return;
      }
      this.customerId = id;

      // Get accountCode for payment reference
      this.portalApi.getMyAccounts().subscribe((accounts) => {
        this.accountCode = accounts.find((a) => a.id === id)?.accountCode ?? '';
      });

      // If planRouterId provided, load that specific plan
      if (this.planRouterId) {
        this.portalApi.getPlanRouter(this.planRouterId).subscribe({
          next: (plan) => {
            this.planResponse.set(plan);
            this.stage.set('confirm');
          },
          error: () =>
            this.router.navigate(['/portal/upgrade'], { queryParams: { customerId: id } }),
        });
      } else {
        // No plan context → go to upgrade/plan selection
        this.router.navigate(['/portal/upgrade'], { queryParams: { customerId: id } });
      }
    });
  }

  ngOnDestroy(): void {
    this.sseSub?.unsubscribe();
  }

  pay(): void {
    if (this.form.invalid) return;
    this.initiating.set(true);
    this.errorMessage.set('');

    const plan = this.planResponse()!;

    this.paymentApi
      .initiate({
        customerId: this.customerId,
        planId: plan.plan.id,
        planRouterId: this.planRouterId || null,
        type: 'pppoe',
        method: 'absampesa',
        currency: 'KES',
        accountCode: this.accountCode || null,
        metadata: { phoneNumber: normalizeKenyanPhone(this.form.value.phoneNumber!) },
      })
      .subscribe({
        next: (payment) => {
          this.initiating.set(false);
          this.stage.set('waiting');
          this.openSseStream(payment.id);
        },
        error: (err: { error?: { message?: string } }) => {
          this.initiating.set(false);
          this.errorMessage.set(
            err?.error?.message ?? 'Failed to initiate payment. Please try again.',
          );
        },
      });
  }

  retry(): void {
    this.failureReason.set(null);
    this.stage.set('confirm');
  }

  private openSseStream(paymentId: string): void {
    this.sseSub = this.portalApi.streamPaymentStatus(paymentId).subscribe({
      next: (event) => {
        if (event.status === 'completed') {
          this.stage.set('success');
        } else {
          this.failureReason.set(event.failureReason ?? 'Payment was not completed.');
          this.stage.set('failed');
        }
      },
      error: () => {
        // SSE dropped without a terminal event — show failed with retry option
        this.failureReason.set(
          'Connection lost. Please check your M-Pesa messages and try again if it was not completed.',
        );
        this.stage.set('failed');
      },
    });
  }

  formatSpeed(pr: PublicPlanResponse): string {
    const bw = pr.bandwidth;
    if (!bw) return '';
    const fmt = (r: number, u: string): string => {
      const kbps = u.toLowerCase().startsWith('g')
        ? r * 1024 * 1024
        : u.toLowerCase().startsWith('m')
          ? r * 1024
          : r;
      return kbps >= 1024 ? `${parseFloat((kbps / 1024).toFixed(1))} Mbps` : `${kbps} Kbps`;
    };
    return `↓ ${fmt(bw.rateDown, bw.rateDownUnit)} / ↑ ${fmt(bw.rateUp, bw.rateUpUnit)}`;
  }
}
