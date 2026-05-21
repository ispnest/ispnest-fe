import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { kenyanPhoneValidator, normalizeKenyanPhone } from '@/app/core/utils/phone.utils';
import { HotspotApiService } from '@/app/domains/hotspot/data';
import { BandwidthDto, PlanDto } from '@/app/domains/plans/data/plan.model';

@Component({
  selector: 'app-hotspot-purchase',
  standalone: true,
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    MatIcon,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
  ],
  template: `
    <div class="min-h-screen bg-slate-1" style="color-scheme: dark">
      <!-- ── Top bar ──────────────────────────────────────────────── -->
      <div class="flex items-center gap-3 px-4 pb-5 pt-8">
        <a
          [routerLink]="['/hotspot']"
          [queryParams]="queryParams"
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-3 text-slate-12 transition hover:bg-slate-4"
        >
          <mat-icon svgIcon="arrow-left" class="size-4" />
        </a>
        <div>
          <h1 class="text-xl font-bold text-slate-12">Complete Purchase</h1>
          <p class="text-xs text-slate-11">Step 2 of 3 — Pay with M-Pesa</p>
        </div>
      </div>

      <div class="mx-auto max-w-sm px-4 pb-12">
        <!-- ── Plan summary row (flat, no card border) ─────── -->
        @if (planLoading()) {
          <div class="mb-6 flex animate-pulse items-center justify-between">
            <div class="space-y-1.5">
              <div class="h-4 w-32 rounded-full bg-slate-4"></div>
              <div class="h-3 w-24 rounded-full bg-slate-4"></div>
            </div>
            <div class="h-10 w-16 rounded-lg bg-slate-4"></div>
          </div>
        }

        @if (plan()) {
          <div class="mb-6 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-bold text-slate-12">{{ plan()!.name }}</h3>
                <span
                  class="inline-flex items-center rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wide"
                  [class]="planTypeClass(plan()!)"
                >
                  {{ planTypeLabel(plan()!) }}
                </span>
              </div>
              @if (bandwidth(); as bw) {
                <p class="mt-0.5 text-xs text-blue-11">{{ formatSpeed(bw) }}</p>
              }
              <p class="mt-0.5 text-xs text-slate-10">
                {{ formatData(plan()!) }}
                @if (plan()!.validity && plan()!.validityUnit) {
                  · {{ formatValidity(plan()!) }}
                }
              </p>
            </div>
            <div class="shrink-0 text-right">
              <div class="text-2xl font-black leading-none text-slate-12">
                {{ plan()!.price | number: '1.0-0' }}
              </div>
              <div class="text-[10px] font-semibold uppercase tracking-widest text-slate-10">
                KES
              </div>
              <a
                [routerLink]="['/hotspot']"
                [queryParams]="queryParams"
                class="mt-1.5 flex items-center justify-end gap-0.5 text-xs text-slate-10 transition hover:text-slate-12"
              >
                <mat-icon svgIcon="arrow-left" class="size-3" />
                Change
              </a>
            </div>
          </div>
        }

        <!-- ── Single payment card ────────────────────────────────── -->
        <div class="rounded-2xl border border-slate-6 bg-slate-2">
          <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-5 px-6 pb-6 pt-8">
            <p class="flex items-center gap-2 text-sm text-slate-11">
              <mat-icon svgIcon="smartphone" class="size-4 shrink-0 text-green-11" />
              Enter your Safaricom number to receive the M-Pesa prompt
            </p>

            <!-- Phone number input -->
            <mat-form-field class="w-full">
              <mat-label>Safaricom Number</mat-label>
              <input
                matInput
                type="tel"
                formControlName="phoneNumber"
                placeholder="2547XX XXX XXX"
                autocomplete="tel"
                inputmode="numeric"
              />
              <mat-error>Enter a valid Kenyan number (07XX, 01XX, 254XX, or +254XX)</mat-error>
            </mat-form-field>

            <!-- Error message -->
            @if (errorMessage()) {
              <div class="flex items-start gap-2 rounded-xl border border-red-a5 bg-red-a3 p-3">
                <mat-icon svgIcon="circle-alert" class="mt-0.5 size-4 shrink-0 text-red-11" />
                <p class="text-sm text-red-11">{{ errorMessage() }}</p>
              </div>
            }

            <!-- Submit row: hint + button -->
            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="flex items-start gap-1 text-xs text-slate-10">
                <mat-icon svgIcon="info" class="mt-0.5 size-3 shrink-0" />
                Enter your PIN on your phone to confirm payment.
              </p>
              <button
                type="submit"
                [disabled]="loading()"
                class="flex shrink-0 items-center gap-2 rounded-lg bg-green-9 px-4 py-2 text-sm font-semibold text-white transition
                       hover:bg-green-10 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
              >
                @if (loading()) {
                  <span class="flex gap-1">
                    <span
                      class="size-1.5 animate-bounce rounded-full bg-white [animation-delay:0ms]"
                    ></span>
                    <span
                      class="size-1.5 animate-bounce rounded-full bg-white [animation-delay:150ms]"
                    ></span>
                    <span
                      class="size-1.5 animate-bounce rounded-full bg-white [animation-delay:300ms]"
                    ></span>
                  </span>
                } @else {
                  <mat-icon svgIcon="smartphone" class="size-4" />
                }
                Pay {{ plan()?.price | number: '1.0-0' }} KES
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class HotspotPurchaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly hotspotApi = inject(HotspotApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly planLoading = signal(false);
  readonly errorMessage = signal('');
  readonly plan = signal<PlanDto | null>(null);
  readonly bandwidth = signal<BandwidthDto | null>(null);

  form = this.fb.group({
    phoneNumber: ['', [Validators.required, kenyanPhoneValidator]],
  });

  planId = '';
  queryParams: Record<string, string> = {};

  ngOnInit(): void {
    this.planId = this.route.snapshot.queryParamMap.get('planId') ?? '';
    const snap = this.route.snapshot.queryParams;
    this.queryParams = { ...snap };

    if (this.planId) {
      this.planLoading.set(true);
      // Use hotspot API to get plans with bandwidth - filter for the selected plan
      this.hotspotApi.getPlansWithBandwidth().subscribe({
        next: (responses) => {
          const found = responses.find((r) => r.plan.id === this.planId);
          if (found) {
            this.plan.set(found.plan);
            this.bandwidth.set(found.bandwidth);
          }
          this.planLoading.set(false);
        },
        error: () => this.planLoading.set(false),
      });
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.hotspotApi
      .purchase({
        phoneNumber: normalizeKenyanPhone(this.form.value.phoneNumber!),
        planId: this.planId,
        method: 'absa-mpesa',
        macAddress: this.queryParams['mac'],
        serverIp: this.queryParams['serverIp'],
        clientIp: this.queryParams['ip'],
        linkOrig: this.queryParams['link-orig'],
        chapId: this.queryParams['chapId'],
        chapChallenge: this.queryParams['chapChallenge'],
      })
      .subscribe({
        next: (resp) => {
          this.loading.set(false);
          this.router.navigate(['/hotspot/status', resp.paymentId]);
        },
        error: (err: { error?: { message?: string } }) => {
          this.loading.set(false);
          this.errorMessage.set(err?.error?.message ?? 'Payment failed. Please try again.');
        },
      });
  }

  // ── Speed formatting (mirrors hotspot-plans) ──────────────────

  private toKbps(rate: number, unit: string): number {
    const u = (unit ?? '').toLowerCase();
    if (u.startsWith('g')) return Math.round(rate * 1024 * 1024);
    if (u.startsWith('m')) return Math.round(rate * 1024);
    return Math.round(rate);
  }

  private smartUnit(rate: number, unit: string): string {
    const kbps = this.toKbps(rate, unit);
    if (kbps >= 1024) return `${parseFloat((kbps / 1024).toFixed(2))} Mbps`;
    return `${kbps} Kbps`;
  }

  formatSpeed(bw: BandwidthDto): string {
    return `↓ ${this.smartUnit(bw.rateDown, bw.rateDownUnit)} / ↑ ${this.smartUnit(bw.rateUp, bw.rateUpUnit)}`;
  }

  // ── Plan type ─────────────────────────────────────────────────

  planTypeLabel(plan: PlanDto): string {
    if (plan.limitType === 'data') return 'Data';
    if (plan.limitType === 'time') return 'Time';
    return 'Unlimited';
  }

  planTypeClass(plan: PlanDto): string {
    if (plan.limitType === 'data') return 'bg-sky-a4 text-sky-11';
    if (plan.limitType === 'time') return 'bg-purple-a4 text-purple-11';
    return 'bg-green-a4 text-green-11';
  }

  // ── Helpers ───────────────────────────────────────────────────

  formatValidity(plan: PlanDto): string {
    if (!plan.validity || !plan.validityUnit) return '';
    const unit = plan.validity === 1 ? plan.validityUnit.replace(/s$/i, '') : plan.validityUnit;
    return `${plan.validity} ${unit}`;
  }

  formatData(plan: PlanDto): string {
    if (!plan.limitType || plan.limitType === 'unlimited') return 'Unlimited';
    if (plan.limitType === 'data' && plan.dataLimit && plan.dataUnit)
      return `${plan.dataLimit} ${plan.dataUnit}`;
    if (plan.limitType === 'time' && plan.timeLimit && plan.timeUnit)
      return `${plan.timeLimit} ${plan.timeUnit}`;
    return 'Unlimited';
  }
}
