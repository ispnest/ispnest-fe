import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PortalApiService, PublicPlanResponse } from '@/app/domains/portal/data';
import { LoadingComponent } from '@/app/ui/loading/loading.component';

@Component({
  selector: 'app-portal-upgrade',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatCard, MatIconButton, MatIcon, LoadingComponent],
  template: `
    <div class="min-h-screen bg-neutral-a2">
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
          <mat-card
            class="cursor-pointer p-4 transition hover:ring-2 hover:ring-primary-a9"
            (click)="selectPlan(item)"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="flex-1">
                <div class="font-semibold">{{ item.plan.name }}</div>
                <!-- Bandwidth chip -->
                @if (item.bandwidth) {
                  <span
                    class="mt-1 inline-block rounded-full bg-primary-a3 px-2 py-0.5 text-xs font-semibold text-primary-a11"
                  >
                    ↓ {{ formatSpeed(item.bandwidth.rateDown, item.bandwidth.rateDownUnit) }} / ↑
                    {{ formatSpeed(item.bandwidth.rateUp, item.bandwidth.rateUpUnit) }}
                  </span>
                }
                <div class="mt-1 text-sm text-neutral-a11">
                  {{ item.plan.validity }} {{ item.plan.validityUnit }}
                </div>
                @if (item.plan.description) {
                  <div class="mt-1 text-xs text-neutral-a9">{{ item.plan.description }}</div>
                }
              </div>
              <div class="shrink-0 text-right">
                <div class="text-xl font-bold">KES {{ item.plan.price | number: '1.0-0' }}</div>
                @if (item.plan.badge) {
                  <span
                    class="rounded-full bg-primary-a3 px-2 py-0.5 text-xs font-semibold text-primary-a11"
                    >{{ item.plan.badge }}</span
                  >
                }
              </div>
            </div>
          </mat-card>
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

  private customerId = '';

  ngOnInit(): void {
    // planRouterId is the PlanRouter row ID (stored as customer.defaultPlanRouterId).
    // routerId is the raw Router entity ID (used by the public /routers/{id}/plans endpoint).
    // Prefer planRouterId if provided; fall back to routerId for backward compat.
    const planRouterId = this.route.snapshot.queryParamMap.get('planRouterId') ?? '';
    const routerId = this.route.snapshot.queryParamMap.get('routerId') ?? '';
    this.customerId = this.route.snapshot.queryParamMap.get('customerId') ?? '';

    if (planRouterId) {
      // Resolve plans via planRouterId → backend resolves to correct router automatically
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
      // Fallback: load all plans if no router context specified
      this.portalApi.getPlans().subscribe({
        next: (plans) => {
          this.plans.set(
            plans
              .sort((a, b) => Number(a.price) - Number(b.price))
              .map((p) => ({ plan: p, bandwidth: null })),
          );
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  selectPlan(item: PublicPlanResponse): void {
    this.router.navigate(['/portal/payment'], {
      queryParams: {
        planId: item.plan.id,
        ...(this.customerId ? { customerId: this.customerId } : {}),
      },
    });
  }

  formatSpeed(rate: number, unit: string): string {
    const u = (unit ?? '').toLowerCase();
    let kbps = rate;
    if (u.startsWith('g')) kbps = rate * 1024 * 1024;
    else if (u.startsWith('m')) kbps = rate * 1024;
    return kbps >= 1024 ? `${parseFloat((kbps / 1024).toFixed(2))} Mbps` : `${kbps} Kbps`;
  }
}
