import { Component, OnInit, inject, input, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { RouterOnboardingApiService } from '@/app/domains/network/data';
import { PlanApiService, PlanDto, PlanRouterDto } from '@/app/domains/plans/data';

@Component({
  selector: 'app-router-plan-attachments',
  standalone: true,
  imports: [RouterLink, MatButton, MatIcon],
  template: `
    <div class="flex flex-col gap-y-4">
      @if (attachedPlans().length > 0) {
        <div class="rounded-lg border border-neutral-a6 bg-neutral-a2 p-3">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-a10">
            Plans attached to this router
          </p>
          <ul class="flex flex-col gap-1">
            @for (deployment of attachedPlans(); track deployment.id) {
              <li class="text-sm font-medium">{{ planName(deployment.planId) }}</li>
            }
          </ul>
        </div>
      }

      @if (loadingPlans()) {
        <p class="text-sm text-neutral-a10">Loading plans…</p>
      } @else if (availablePlans().length === 0) {
        <div class="rounded-xl border border-neutral-a6 bg-neutral-a2 py-8 text-center">
          <p class="text-sm text-neutral-a11">No plans exist yet. Create one on the Plans page.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          @for (plan of availablePlans(); track plan.id) {
            <button
              type="button"
              class="rounded-xl border p-4 text-left transition-colors"
              [class]="
                isAttached(plan.id)
                  ? 'border-success-a8 bg-success-a3'
                  : 'border-neutral-a6 bg-neutral-a2 hover:border-neutral-a8'
              "
              [disabled]="isAttached(plan.id) || attaching() === plan.id"
              (click)="attach(plan)"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="font-semibold text-sm">{{ plan.name }}</span>
                @if (isAttached(plan.id)) {
                  <mat-icon svgIcon="check-circle" class="size-4 text-success-a11" />
                }
              </div>
              <p class="mt-1 text-xs text-neutral-a10">KES {{ plan.price }}</p>
            </button>
          }
        </div>
      }

      <div class="flex items-center gap-2">
        <a matButton class="tertiary" routerLink="/admin/plans/new" target="_blank">
          <mat-icon svgIcon="plus" class="size-4" />
          Create a new plan (opens in a new tab)
        </a>
        <button matButton class="tertiary" type="button" (click)="loadPlans()">
          <mat-icon svgIcon="refresh-cw" class="size-4" />
          Refresh
        </button>
      </div>
    </div>
  `,
})
export class RouterPlanAttachmentsComponent implements OnInit {
  private readonly planApi = inject(PlanApiService);
  private readonly onboardingApi = inject(RouterOnboardingApiService);

  readonly routerId = input<string | null>(null);

  readonly loadingPlans = signal(true);
  readonly availablePlans = signal<PlanDto[]>([]);
  readonly attachedPlans = signal<PlanRouterDto[]>([]);
  readonly attaching = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPlans();

    const routerId = this.routerId();
    if (routerId) {
      this.onboardingApi
        .getPlanDeploymentsForRouter(routerId)
        .subscribe((deployments) => this.attachedPlans.set(deployments));
    }
  }

  loadPlans(): void {
    this.loadingPlans.set(true);
    this.planApi.getPage(0, 100).subscribe({
      next: (page) => {
        this.availablePlans.set(page.content);
        this.loadingPlans.set(false);
      },
      error: () => this.loadingPlans.set(false),
    });
  }

  isAttached(planId: string): boolean {
    return this.attachedPlans().some((d) => d.planId === planId);
  }

  planName(planId: string): string {
    return this.availablePlans().find((p) => p.id === planId)?.name ?? planId;
  }

  attach(plan: PlanDto): void {
    const routerId = this.routerId();
    if (!routerId || this.isAttached(plan.id)) return;
    this.attaching.set(plan.id);
    this.planApi.createDeployment(plan.id, { routerId }).subscribe({
      next: (deployment) => {
        this.attaching.set(null);
        this.attachedPlans.update((list) => [...list, deployment]);
      },
      error: () => this.attaching.set(null),
    });
  }
}
