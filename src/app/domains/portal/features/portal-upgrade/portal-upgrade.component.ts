import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BandwidthDto, PlanDto } from '@/app/domains/plans/data/plan.model';
import { PortalApiService, PublicPlanResponse } from '@/app/domains/portal/data';
import { LoadingComponent } from '@/app/ui/loading/loading.component';

@Component({
  selector: 'app-portal-upgrade',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatCard, MatIconButton, MatIcon, LoadingComponent],
  template: `
    <div class="min-h-screen bg-neutral-a2 pb-16 lg:pb-0">
      <div class="bg-primary px-4 py-4 text-primary-contrast">
        <div class="mx-auto flex max-w-lg items-center gap-3">
          <a matIconButton routerLink="/portal/dashboard" class="text-inherit">
            <mat-icon svgIcon="arrow-left" />
          </a>
          <h1 class="flex-1 text-lg font-bold">Choose a Plan</h1>
        </div>
      </div>

      <div class="mx-auto max-w-lg space-y-3 px-4 py-6">
        <app-loading [loading]="loading()" />

        @for (item of plans(); track item.plan.id) {
          <button
            type="button"
            class="group w-full cursor-pointer rounded-2xl border px-5 py-4 text-left transition-all duration-200 active:scale-[0.99]"
            [class]="
              isActivePlan(item)
                ? 'border-green-a8 bg-green-a2 hover:bg-green-a3'
                : 'border-neutral-a6 bg-neutral-a2 hover:border-neutral-a8 hover:bg-neutral-a3'
            "
            (click)="selectPlan(item)"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- Left: name + badges + meta -->
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="font-bold text-sm">{{ item.plan.name }}</h3>
                  <span
                    class="inline-flex items-center rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wide"
                    [class]="planTypeClass(item.plan)"
                    >{{ planTypeLabel(item.plan) }}</span
                  >
                  @if (isActivePlan(item)) {
                    <span
                      class="inline-flex items-center gap-1 rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wide bg-green-a4 text-green-11"
                    >
                      <mat-icon svgIcon="check" class="size-2.5" />
                      Current Plan
                    </span>
                  }
                  @if (item.plan.badge) {
                    <span class="text-[10px] font-bold text-amber-11"
                      >⭐ {{ item.plan.badge }}</span
                    >
                  }
                </div>

                @if (item.bandwidth) {
                  <p class="mt-1 text-xs text-blue-11">{{ formatSpeed(item.bandwidth) }}</p>
                }
                <p class="mt-1 text-xs text-neutral-a10">
                  {{ formatData(item.plan) }}
                  @if (item.plan.validity && item.plan.validityUnit) {
                    · {{ formatValidity(item.plan) }}
                  }
                  @if (item.plan.concurrentDevices && item.plan.concurrentDevices > 1) {
                    · {{ item.plan.concurrentDevices }} devices
                  }
                </p>
                @if (item.plan.description) {
                  <p class="mt-1 text-xs leading-relaxed text-neutral-a10">
                    {{ item.plan.description }}
                  </p>
                }
                @if (getFeatures(item.plan).length > 0) {
                  <ul class="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    @for (feat of getFeatures(item.plan); track feat) {
                      <li class="flex items-center gap-1 text-xs text-neutral-a11">
                        <mat-icon svgIcon="check" class="size-3 shrink-0 text-success-a11" />
                        {{ feat }}
                      </li>
                    }
                  </ul>
                }
              </div>
              <!-- Right: price + arrow -->
              <div class="shrink-0 text-right">
                <div class="text-2xl font-black leading-none">
                  {{ item.plan.price | number: '1.0-0' }}
                </div>
                <div
                  class="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-a10"
                >
                  KES
                </div>
                <mat-icon
                  svgIcon="arrow-right"
                  class="mt-2 size-4 text-neutral-a8 transition group-hover:text-neutral-a11"
                />
              </div>
            </div>
          </button>
        }

        @if (!loading() && plans().length === 0) {
          <mat-card class="p-8 text-center">
            <mat-icon svgIcon="layers" class="mb-3 size-10 text-neutral-a6" />
            <p class="text-neutral-a11">No plans available at this time</p>
          </mat-card>
        }
      </div>
    </div>
  `,
})
export class PortalUpgradeComponent implements OnInit {
  private readonly portalApi = inject(PortalApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly plans = signal<PublicPlanResponse[]>([]);
  readonly activePlanId = signal<string | null>(null);

  private customerId = '';
  private planRouterId = '';

  ngOnInit(): void {
    const planRouterId = this.route.snapshot.queryParamMap.get('planRouterId') ?? '';
    const routerId = this.route.snapshot.queryParamMap.get('routerId') ?? '';
    this.customerId = this.route.snapshot.queryParamMap.get('customerId') ?? '';
    this.activePlanId.set(this.route.snapshot.queryParamMap.get('planId'));
    this.planRouterId = planRouterId;

    if (planRouterId) {
      this.portalApi.getPlansByPlanRouter(planRouterId).subscribe({
        next: (plans) => {
          this.plans.set(plans.sort((a, b) => Number(a.plan.price) - Number(b.plan.price)));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else if (routerId) {
      this.portalApi.getRouterPlans(routerId).subscribe({
        next: (plans) => {
          this.plans.set(plans.sort((a, b) => Number(a.plan.price) - Number(b.plan.price)));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      this.portalApi.getPlans().subscribe({
        next: (plans) => {
          this.plans.set(
            plans
              .sort((a, b) => Number(a.price) - Number(b.price))
              .map((p) => ({ planRouterId: null, plan: p, bandwidth: null })),
          );
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  selectPlan(item: PublicPlanResponse): void {
    // planRouterId is now included directly in PublicPlanResponse — no extra resolution call needed
    const targetPlanRouterId = item.planRouterId ?? this.planRouterId;

    if (targetPlanRouterId) {
      this.router.navigate(['/portal/payment'], {
        queryParams: {
          customerId: this.customerId || undefined,
          planRouterId: targetPlanRouterId,
        },
      });
    } else {
      this.router.navigate(['/portal/payment'], {
        queryParams: {
          planId: item.plan.id,
          ...(this.customerId ? { customerId: this.customerId } : {}),
        },
      });
    }
  }

  isActivePlan(item: PublicPlanResponse): boolean {
    const id = this.activePlanId();
    return !!id && id === item.plan.id;
  }

  // ── Plan card helpers ─────────────────────────────────────────────────────

  planTypeLabel(plan: PlanDto): string {
    if (plan.limitType === 'data') return 'Data';
    if (plan.limitType === 'time') return 'Time';
    return 'Unlimited';
  }

  planTypeClass(plan: PlanDto): string {
    if (plan.limitType === 'data') return 'bg-sky-a4 text-sky-11';
    if (plan.limitType === 'time') return 'bg-purple-a4 text-purple-11';
    return 'bg-success-a4 text-success-a11';
  }

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
