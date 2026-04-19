import { DecimalPipe } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { HotspotApiService } from '@/app/domains/hotspot/data/hotspot-api.service';
import { HotspotReconnectResponse } from '@/app/domains/hotspot/data/hotspot.model';
import { BandwidthDto, PlanDto } from '@/app/domains/plans/data/plan.model';

@Component({
  selector: 'app-hotspot-plans',
  standalone: true,
  imports: [DecimalPipe, MatIcon],
  template: `
    <div class="min-h-screen bg-slate-1" style="color-scheme: dark">
      <!-- ── Top bar ───────────────────────────────────────────── -->
      <div class="flex items-center gap-3 px-4 pb-5 pt-8">
        <img src="/img/ispnest-icon-white.svg" alt="ISPNest" class="h-8 w-auto shrink-0" />
        <div>
          <h1 class="text-xl font-bold text-slate-12">Choose a Plan</h1>
          <p class="text-xs text-slate-11">Step 1 of 3 — Select your WiFi plan</p>
        </div>
      </div>

      <div class="mx-auto max-w-lg px-4 pb-12">
        <!-- ── Reconnect banner ──────────────────────────────────── -->
        @if (reconnect()?.canReconnect) {
          <div class="mb-5 rounded-xl border border-green-a5 bg-green-a2 px-4 py-3">
            <div class="flex items-center gap-3">
              <mat-icon svgIcon="wifi" class="size-5 shrink-0 text-green-11" />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-green-11">
                  Welcome back! Your plan is still active.
                </p>
                @if (reconnect()?.accountCode) {
                  <p class="mt-0.5 truncate font-mono text-xs text-green-11">
                    {{ reconnect()!.accountCode }}
                  </p>
                }
              </div>
              <mat-icon svgIcon="check-circle" class="size-4 shrink-0 text-green-11" />
            </div>
          </div>
        }

        <!-- ── Loading skeletons ─────────────────────────────────── -->
        @if (loading()) {
          <div class="space-y-3">
            @for (_ of [1, 2, 3]; track $index) {
              <div class="animate-pulse rounded-2xl border border-slate-6 bg-slate-2 px-6 py-5">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 space-y-2">
                    <div class="h-4 w-36 rounded-full bg-slate-4"></div>
                    <div class="h-3 w-24 rounded-full bg-slate-4"></div>
                    <div class="h-3 w-32 rounded-full bg-slate-4"></div>
                  </div>
                  <div class="space-y-1 text-right">
                    <div class="ml-auto h-6 w-12 rounded-full bg-slate-4"></div>
                    <div class="ml-auto h-3 w-8 rounded-full bg-slate-4"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- ── Plan cards ────────────────────────────────────────── -->
        @if (!loading()) {
          <div class="space-y-3">
            @for (plan of plans(); track plan.id) {
              <button
                type="button"
                class="group w-full cursor-pointer rounded-2xl border px-6 py-5 text-left transition-all duration-200 active:scale-[0.99]"
                [class]="
                  isActivePlan(plan)
                    ? 'border-green-a5 bg-green-a2 hover:bg-green-a3'
                    : 'border-slate-6 bg-slate-2 hover:border-slate-7 hover:bg-slate-3'
                "
                (click)="selectPlan(plan)"
              >
                <div class="flex items-start justify-between gap-4">
                  <!-- Left: name + meta -->
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="font-bold text-slate-12">{{ plan.name }}</h3>
                      <span
                        class="inline-flex items-center rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wide"
                        [class]="planTypeClass(plan)"
                      >
                        {{ planTypeLabel(plan) }}
                      </span>
                      @if (isActivePlan(plan)) {
                        <span
                          class="inline-flex items-center gap-1 rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wide bg-green-a4 text-green-11"
                        >
                          <mat-icon svgIcon="check" class="size-2.5" />
                          Active
                        </span>
                      }
                      @if (plan.badge) {
                        <span class="text-[10px] font-bold text-amber-11">⭐ {{ plan.badge }}</span>
                      }
                    </div>

                    @if (bandwidth(plan); as bw) {
                      <p class="mt-1 text-xs text-blue-11">{{ formatSpeed(bw) }}</p>
                    }

                    <p class="mt-1 text-xs text-slate-10">
                      {{ formatData(plan) }}
                      @if (plan.validity && plan.validityUnit) {
                        · {{ formatValidity(plan) }}
                      }
                      @if (plan.concurrentDevices && plan.concurrentDevices > 1) {
                        · {{ plan.concurrentDevices }} devices
                      }
                    </p>

                    @if (plan.description) {
                      <p class="mt-1.5 text-xs leading-relaxed text-slate-10">
                        {{ plan.description }}
                      </p>
                    }

                    @if (getFeatures(plan).length > 0) {
                      <ul class="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                        @for (feat of getFeatures(plan); track feat) {
                          <li class="flex items-center gap-1 text-xs text-slate-11">
                            <mat-icon svgIcon="check" class="size-3 shrink-0 text-green-11" />
                            {{ feat }}
                          </li>
                        }
                      </ul>
                    }
                  </div>

                  <!-- Right: price + arrow -->
                  <div class="shrink-0 text-right">
                    <div class="text-2xl font-black leading-none text-slate-12">
                      {{ plan.price | number: '1.0-0' }}
                    </div>
                    <div
                      class="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-10"
                    >
                      KES
                    </div>
                    <mat-icon
                      svgIcon="arrow-right"
                      class="mt-2 size-4 text-slate-8 transition group-hover:text-slate-11"
                    />
                  </div>
                </div>
              </button>
            }
          </div>

          <!-- Empty state -->
          @if (plans().length === 0) {
            <div class="py-16 text-center">
              <mat-icon svgIcon="wifi-off" class="mx-auto mb-3 size-10 text-slate-8" />
              <p class="font-semibold text-slate-12">No plans available</p>
              <p class="mt-1 text-sm text-slate-11">Please check back later or contact support.</p>
            </div>
          }
        }
      </div>

      <!-- ── Footer ─────────────────────────────────────────────── -->
      <div class="pb-8 text-center">
        <p class="flex items-center justify-center gap-1.5 text-xs text-slate-10">
          <mat-icon svgIcon="lock" class="size-3" />
          Secure payment powered by M-Pesa
        </p>
      </div>
    </div>
  `,
})
export class HotspotPlansComponent implements OnInit {
  private readonly hotspotApi = inject(HotspotApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);

  readonly loading = signal(true);
  readonly plans = signal<PlanDto[]>([]);
  readonly reconnect = signal<HotspotReconnectResponse | null>(null);
  private readonly bandwidthMap = signal<Map<string, BandwidthDto>>(new Map());

  ngOnInit(): void {
    const mac = this.route.snapshot.queryParamMap.get('mac');
    if (mac) {
      this.hotspotApi.reconnectCheck(mac).subscribe({
        next: (r) => {
            this.reconnect.set(r);
            if (r.canReconnect && r.accountCode && isPlatformBrowser(this.platformId)) {
              sessionStorage.setItem('hs_credentials', JSON.stringify(r));
            }
          },
      });
    }

    // Use the enriched API that returns plans with embedded bandwidth data
    this.hotspotApi.getPlansWithBandwidth().subscribe({
      next: (responses) => {
        const plans = responses.map((r) => r.plan);
        const bwMap = new Map<string, BandwidthDto>();
        for (const r of responses) {
          if (r.bandwidth && r.plan.bandwidthId) {
            bwMap.set(r.plan.bandwidthId, r.bandwidth);
          }
        }
        this.plans.set(plans);
        this.bandwidthMap.set(bwMap);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectPlan(plan: PlanDto): void {
    const qp = this.route.snapshot.queryParams;
    this.router.navigate(['/hotspot/purchase'], { queryParams: { planId: plan.id, ...qp } });
  }

  bandwidth(plan: PlanDto): BandwidthDto | null {
    if (!plan.bandwidthId) return null;
    return this.bandwidthMap().get(plan.bandwidthId) ?? null;
  }

  isActivePlan(plan: PlanDto): boolean {
    const r = this.reconnect();
    return !!(r?.canReconnect && r.planName && r.planName === plan.name);
  }

  // ── Speed formatting ──────────────────────────────────────────

  /** Convert any speed to Kbps using MikroTik binary convention (1M = 1024K). */
  private toKbps(rate: number, unit: string): number {
    const u = (unit ?? '').toLowerCase();
    if (u.startsWith('g')) return Math.round(rate * 1024 * 1024);
    if (u.startsWith('m')) return Math.round(rate * 1024);
    return Math.round(rate);
  }

  /** Smart unit: ≥1024 Kbps → Mbps, else Kbps. e.g. "5 Mbps" or "512 Kbps". */
  private smartUnit(rate: number, unit: string): string {
    const kbps = this.toKbps(rate, unit);
    if (kbps >= 1024) {
      const mbps = parseFloat((kbps / 1024).toFixed(2));
      return `${mbps} Mbps`;
    }
    return `${kbps} Kbps`;
  }

  /** Single clean label: "↓ 5 Mbps / ↑ 2.5 Mbps" */
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

  // ── Helpers ────────���──────────────────────────────────────────

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

  getFeatures(plan: PlanDto): string[] {
    if (!plan.features) return [];
    return plan.features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
  }
}
