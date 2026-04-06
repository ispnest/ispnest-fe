import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { PlanApiService } from '@/app/domains/plans/data/plan-api.service';
import { PlanDto } from '@/app/domains/plans/data/plan.model';
import { LoadingComponent } from '@/app/ui/loading/loading.component';

@Component({
  selector: 'app-portal-upgrade',
  standalone: true,
  imports: [DecimalPipe, MatCard, MatIcon, LoadingComponent],
  template: `
    <div class="min-h-screen bg-neutral-a2">
      <div class="bg-primary px-4 py-4 text-primary-contrast">
        <div class="mx-auto flex max-w-lg items-center gap-3">
          <h1 class="text-lg font-bold">Choose a Plan</h1>
        </div>
      </div>

      <div class="mx-auto max-w-lg space-y-3 px-4 py-6">
        <app-loading [loading]="loading()" />

        @for (plan of plans(); track plan.id) {
          <mat-card class="cursor-pointer p-4 transition hover:ring-2 hover:ring-primary-a9"
                    (click)="selectPlan(plan)">
            <div class="flex items-center justify-between gap-4">
              <div class="flex-1">
                <div class="font-semibold">{{ plan.name }}</div>
                <div class="text-sm text-neutral-a11">{{ plan.validity }} {{ plan.validityUnit }}</div>
                @if (plan.description) {
                  <div class="mt-1 text-xs text-neutral-a9">{{ plan.description }}</div>
                }
              </div>
              <div class="text-right shrink-0">
                <div class="text-xl font-bold">KES {{ plan.price | number:'1.0-0' }}</div>
                @if (plan.badge) {
                  <span class="rounded-full bg-primary-a3 px-2 py-0.5 text-xs font-semibold text-primary-a11">
                    {{ plan.badge }}
                  </span>
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
  private readonly planApi = inject(PlanApiService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly plans = signal<PlanDto[]>([]);

  ngOnInit(): void {
    this.planApi.getPage(0, 50, 'price', 'asc', true).subscribe({
      next: page => { this.plans.set(page.content); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  selectPlan(plan: PlanDto): void {
    this.router.navigate(['/portal/payment'], { queryParams: { planId: plan.id } });
  }
}

